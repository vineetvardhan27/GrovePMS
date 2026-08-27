#!/usr/bin/env node
/**
 * Final Real-World Production Flow Validation Test
 * Simulates complete lifecycle: Reservation -> ID Upload -> Check-in -> Payment -> Bill -> Check-out -> Clean Baseline
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const idx = t.indexOf('=');
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
});

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runFinalProductionTest() {
  console.log('========================================================================');
  console.log('  FINAL REAL-WORLD PRODUCTION WORKFLOW VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const hotelId = 'a0000000-0000-0000-0000-000000000001';

  // 1. Staff Authentication & Hotel Context
  console.log('--- 1. Staff Accounts & Hotel Tenant Resolution ---');
  const { data: staffList } = await admin.from('staff').select('*').eq('hotel_id', hotelId);
  assert(Boolean(staffList && staffList.length >= 3), 'Hotel Greenery View has active staff accounts');
  const ownerStaff = staffList?.find((s) => s.role === 'owner');
  assert(Boolean(ownerStaff), `Owner account active: ${ownerStaff?.email}`);

  // 2. Room Inventory
  console.log('\n--- 2. Room Inventory Verification ---');
  const { data: rooms } = await admin.from('rooms').select('*').eq('hotel_id', hotelId);
  assert(rooms?.length === 19, `Hotel Greenery View has exactly 19 accommodation units`);
  const testRoom = rooms[0];

  // 3. New Guest Creation with ID Metadata
  console.log('\n--- 3. New Guest Creation ---');
  const testGuestId = crypto.randomUUID();
  const { data: createdGuest, error: cgErr } = await admin
    .from('guests')
    .insert({
      id: testGuestId,
      hotel_id: hotelId,
      full_name: 'Ananya Sharma',
      phone: '+919833445566',
      email: 'ananya.sharma@example.com',
      id_type: 'Aadhaar',
      id_number: '123456789012',
      address: 'Kalyani Nagar, Pune'
    })
    .select()
    .single();

  assert(!cgErr && Boolean(createdGuest?.id), 'Guest "Ananya Sharma" created in database');

  // 4. ID Document Upload to Private Storage
  console.log('\n--- 4. ID Document Storage & 60s Signed URL ---');
  const docId = crypto.randomUUID();
  const pdfFilename = 'Ananya_Aadhaar_Card.pdf';
  const pdfStoragePath = `hotel/${hotelId}/guests/${testGuestId}/documents/${docId}/${pdfFilename}`;
  const pdfBuffer = Buffer.from('%PDF-1.4 sample secure client id document');

  const { error: uploadErr } = await admin.storage
    .from('guest-documents')
    .upload(pdfStoragePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  assert(!uploadErr, 'Uploaded PDF ID card into private guest-documents storage');

  const { data: signedData, error: signErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(pdfStoragePath, 60);

  assert(!signErr && Boolean(signedData?.signedUrl), 'Generated 60-second temporary signed URL for viewing');

  // 5. Reservation Creation with Advance Payment
  console.log('\n--- 5. Reservation Creation & Advance Payment ---');
  const testBookingId = crypto.randomUUID();
  const bookingNumber = `HGV-202608-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: createdBooking, error: cbErr } = await admin
    .from('bookings')
    .insert({
      id: testBookingId,
      hotel_id: hotelId,
      booking_number: bookingNumber,
      room_id: testRoom.id,
      guest_id: testGuestId,
      check_in_date: '2026-08-28',
      check_out_date: '2026-08-30',
      adults: 2,
      children: 0,
      rate_per_night: testRoom.base_rate || 2500,
      total_amount: 5000,
      advance_amount: 2000,
      payment_status: 'advance_received',
      booking_status: 'confirmed',
      source: 'direct'
    })
    .select()
    .single();

  assert(!cbErr && Boolean(createdBooking?.id), `Reservation #${bookingNumber} created successfully`);

  const paymentId = crypto.randomUUID();
  const { error: payErr } = await admin.from('payments').insert({
    id: paymentId,
    hotel_id: hotelId,
    booking_id: testBookingId,
    amount: 2000,
    payment_mode: 'upi',
    payment_type: 'advance',
    notes: 'Advance via Google Pay',
    recorded_by: ownerStaff.id,
  });
  assert(!payErr, 'Advance payment of ₹2,000 logged');

  // 6. Check-in & Room Status Update
  console.log('\n--- 6. Check-In Lifecycle ---');
  const { error: checkInErr } = await admin
    .from('bookings')
    .update({ booking_status: 'checked_in', updated_at: new Date().toISOString() })
    .eq('id', testBookingId);
  assert(!checkInErr, 'Booking status updated to "checked_in"');

  const { error: roomOccErr } = await admin
    .from('rooms')
    .update({ status: 'occupied', updated_at: new Date().toISOString() })
    .eq('id', testRoom.id);
  assert(!roomOccErr, `Room ${testRoom.room_number} status updated to "occupied"`);

  // 7. Settlement & Check-Out Lifecycle
  console.log('\n--- 7. Settlement & Check-Out Lifecycle ---');
  const settlePaymentId = crypto.randomUUID();
  const { error: settleErr } = await admin.from('payments').insert({
    id: settlePaymentId,
    hotel_id: hotelId,
    booking_id: testBookingId,
    amount: 3000,
    payment_mode: 'cash',
    payment_type: 'settlement',
    notes: 'Final settlement on checkout',
    recorded_by: ownerStaff.id,
  });
  assert(!settleErr, 'Settlement payment of ₹3,000 logged (Balance: ₹0)');

  const { error: checkOutErr } = await admin
    .from('bookings')
    .update({
      booking_status: 'checked_out',
      payment_status: 'fully_paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', testBookingId);
  assert(!checkOutErr, 'Booking status updated to "checked_out" (Fully Paid)');

  const { error: roomAvailErr } = await admin
    .from('rooms')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', testRoom.id);
  assert(!roomAvailErr, `Room ${testRoom.room_number} released back to "available"`);

  // 8. Clean up test record to maintain zero baseline
  console.log('\n--- 8. Re-establishing Clean Baseline ---');
  await admin.storage.from('guest-documents').remove([pdfStoragePath]);
  await admin.from('payments').delete().eq('id', settlePaymentId);
  await admin.from('payments').delete().eq('id', paymentId);
  await admin.from('bookings').delete().eq('id', testBookingId);
  await admin.from('guests').delete().eq('id', testGuestId);
  console.log('✓ Cleaned up temporary test reservation, guest, payments, and storage object.');

  // 9. Final Zero-Orphan Check
  const { data: finalGuests } = await admin.from('guests').select('id').eq('hotel_id', hotelId);
  const { data: finalBookings } = await admin.from('bookings').select('id').eq('hotel_id', hotelId);
  const { data: finalPayments } = await admin.from('payments').select('id').eq('hotel_id', hotelId);

  assert(finalGuests?.length === 0, 'Clean baseline: 0 guests');
  assert(finalBookings?.length === 0, 'Clean baseline: 0 bookings');
  assert(finalPayments?.length === 0, 'Clean baseline: 0 payments');

  console.log('\n========================================================================');
  console.log(`  FINAL VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runFinalProductionTest().catch((err) => {
  console.error('Final test error:', err);
  process.exit(1);
});
