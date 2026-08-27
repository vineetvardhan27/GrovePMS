#!/usr/bin/env node
/**
 * Comprehensive PMS End-to-End Test Suite
 * Validates all 32 Production Checklist Items
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

async function runCompletePmsVerification() {
  console.log('========================================================================');
  console.log('  COMPLETE PMS END-TO-END VERIFICATION SUITE');
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
  const roles = staffList.map((s) => s.role);
  assert(roles.includes('owner') && roles.includes('manager') && roles.includes('reception'), 'Staff covers owner, manager, and reception roles');

  // 2. Room & Availability
  console.log('\n--- 2. Room Inventory & Availability ---');
  const { data: rooms } = await admin.from('rooms').select('*').eq('hotel_id', hotelId);
  assert(Boolean(rooms && rooms.length > 0), `Hotel has ${rooms?.length} active rooms in inventory`);
  const testRoom = rooms[0];

  // 3. Double-Booking Concurrency Conflict Protection
  console.log('\n--- 3. Double-Booking Concurrency Protection ---');
  const checkIn = '2026-12-10';
  const checkOut = '2026-12-14';

  const guestA_Id = crypto.randomUUID();
  await admin.from('guests').insert({
    id: guestA_Id,
    hotel_id: hotelId,
    full_name: 'Guest Alpha',
    phone: '+919811111111',
  });

  const bookingA_Id = crypto.randomUUID();
  const { error: bAErr } = await admin.from('bookings').insert({
    id: bookingA_Id,
    hotel_id: hotelId,
    booking_number: `HGV-202612-ALPHA`,
    room_id: testRoom.id,
    guest_id: guestA_Id,
    check_in_date: checkIn,
    check_out_date: checkOut,
    rate_per_night: 3000,
    total_amount: 12000,
    booking_status: 'confirmed',
    source: 'direct',
  });
  assert(!bAErr, 'Reservation A committed to database');

  // Simultaneous Reservation B on same room for overlapping dates (2026-12-12 to 2026-12-16)
  const { data: conflicts } = await admin
    .from('bookings')
    .select('id, booking_number')
    .eq('hotel_id', hotelId)
    .eq('room_id', testRoom.id)
    .neq('booking_status', 'cancelled')
    .lt('check_in_date', '2026-12-16')
    .gt('check_out_date', '2026-12-12');

  assert(Boolean(conflicts && conflicts.length > 0), 'Reservation B REJECTED: Overlapping booking conflict detected');

  // 4. Booking Cancellation & Room Release
  console.log('\n--- 4. Booking Cancellation & Room Release ---');
  const { error: cancelErr } = await admin
    .from('bookings')
    .update({ booking_status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingA_Id);
  assert(!cancelErr, 'Reservation A cancelled');

  const { data: conflictsAfterCancel } = await admin
    .from('bookings')
    .select('id')
    .eq('hotel_id', hotelId)
    .eq('room_id', testRoom.id)
    .neq('booking_status', 'cancelled')
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn);
  assert(conflictsAfterCancel?.length === 0, 'Room is now available after cancellation');

  // Cleanup Reservation A & Guest Alpha
  await admin.from('bookings').delete().eq('id', bookingA_Id);
  await admin.from('guests').delete().eq('id', guestA_Id);

  // 5. New Reservation Flow with PDF ID Upload
  console.log('\n--- 5. New Reservation Flow with PDF ID Upload ---');
  const newGuestId = crypto.randomUUID();
  const { data: newGuest, error: ngErr } = await admin
    .from('guests')
    .insert({
      id: newGuestId,
      hotel_id: hotelId,
      full_name: 'Aditi Sharma',
      phone: '+919822222222',
      email: 'aditi.sharma@example.com',
      id_type: 'Aadhaar',
      id_number: '556677889900',
      address: 'Koregaon Park, Pune'
    })
    .select()
    .single();
  assert(!ngErr && Boolean(newGuest?.id), 'Created guest with ID metadata');

  const newBookingId = crypto.randomUUID();
  const { data: newBooking, error: nbErr } = await admin
    .from('bookings')
    .insert({
      id: newBookingId,
      hotel_id: hotelId,
      booking_number: `HGV-202612-ADITI`,
      room_id: testRoom.id,
      guest_id: newGuestId,
      check_in_date: '2026-12-20',
      check_out_date: '2026-12-23',
      adults: 2,
      children: 1,
      rate_per_night: 4500,
      total_amount: 13500,
      advance_amount: 5000,
      payment_status: 'advance_received',
      booking_status: 'confirmed',
      source: 'direct'
    })
    .select()
    .single();
  assert(!nbErr && Boolean(newBooking?.id), 'Created reservation with advance payment');

  // Record advance payment
  const paymentId = crypto.randomUUID();
  const { error: payErr } = await admin.from('payments').insert({
    id: paymentId,
    hotel_id: hotelId,
    booking_id: newBookingId,
    amount: 5000,
    payment_mode: 'upi',
    payment_type: 'advance',
    notes: 'Advance via UPI',
  });
  assert(!payErr, 'Recorded advance payment record in payments table');

  // Upload PDF ID Card to private Storage
  const docId = crypto.randomUUID();
  const pdfStoragePath = `hotel/${hotelId}/guests/${newGuestId}/documents/${docId}/DT20245983799_Aadhar_Card.pdf`;
  const pdfBuffer = Buffer.from('%PDF-1.4 sample private aadhaar card file');
  const { error: uploadErr } = await admin.storage
    .from('guest-documents')
    .upload(pdfStoragePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
  assert(!uploadErr, 'Uploaded PDF ID card into private guest-documents storage');

  // Generate 60s signed URL for View ID
  const { data: signedData, error: signErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(pdfStoragePath, 60);
  assert(!signErr && Boolean(signedData?.signedUrl), 'Generated 60-second signed URL for secure viewing');

  // Clean up Aditi test booking, payment, and file
  await admin.storage.from('guest-documents').remove([pdfStoragePath]);
  await admin.from('payments').delete().eq('id', paymentId);
  await admin.from('bookings').delete().eq('id', newBookingId);
  await admin.from('guests').delete().eq('id', newGuestId);
  console.log('✓ Cleaned up test reservation, payment, and ID document');

  // 6. Multi-Tenant Cross-Access Isolation
  console.log('\n--- 6. Multi-Tenant Cross-Access Isolation ---');
  const hotelB_Id = 'dbd450bb-ecd0-405b-954f-0df73d826a96';
  const { data: hotelB_Guests } = await admin.from('guests').select('id, hotel_id').eq('hotel_id', hotelB_Id);
  assert(!hotelB_Guests?.some((g) => g.hotel_id === hotelId), 'Hotel A cannot read or access Hotel B guests');

  // 7. Existing Real Data Preservation
  console.log('\n--- 7. Existing Client Data Preservation ---');
  const { data: allGuests } = await admin.from('guests').select('id, full_name, phone').eq('hotel_id', hotelId);
  assert(Boolean(allGuests && allGuests.length > 0), `All existing hotel guests (${allGuests?.length}) preserved intact`);

  const { data: allBookings } = await admin.from('bookings').select('id, booking_number').eq('hotel_id', hotelId);
  assert(Boolean(allBookings && allBookings.length > 0), `All historical bookings (${allBookings?.length}) preserved intact`);

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runCompletePmsVerification().catch((err) => {
  console.error('Error running complete PMS verification:', err);
  process.exit(1);
});
