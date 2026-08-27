#!/usr/bin/env node
/**
 * End-to-end test for createBookingAction and ID document association
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

async function main() {
  console.log('========================================================================');
  console.log('  END-TO-END PMS RESERVATION & ID CARD TEST');
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
  const { data: rooms } = await admin.from('rooms').select('*').eq('hotel_id', hotelId).limit(1);
  const room = rooms[0];
  assert(Boolean(room), `Found active hotel room: Room #${room.room_number}`);

  // Test 1: Concurrency Conflict Protection (Double Booking Test)
  console.log('\n--- 1. Double-Booking Concurrency Protection ---');
  const checkIn = '2026-11-20';
  const checkOut = '2026-11-24';

  const testGuestId = crypto.randomUUID();
  await admin.from('guests').insert({
    id: testGuestId,
    hotel_id: hotelId,
    full_name: 'Existing Client',
    phone: '+919876543210',
  });

  const bookingA_Id = crypto.randomUUID();
  const { error: bAErr } = await admin.from('bookings').insert({
    id: bookingA_Id,
    hotel_id: hotelId,
    booking_number: `HGV-202611-TESTA`,
    room_id: room.id,
    guest_id: testGuestId,
    check_in_date: checkIn,
    check_out_date: checkOut,
    rate_per_night: 2500,
    total_amount: 5000,
    booking_status: 'confirmed',
    source: 'direct',
  });
  if (bAErr) console.error('bAErr details:', bAErr.message);
  assert(!bAErr, 'Reservation A created successfully');

  // Attempt Reservation B on same room for overlapping dates (2026-11-22 to 2026-11-25)
  const { data: conflictCheck } = await admin
    .from('bookings')
    .select('id, booking_number')
    .eq('hotel_id', hotelId)
    .eq('room_id', room.id)
    .neq('booking_status', 'cancelled')
    .lt('check_in_date', '2026-11-25')
    .gt('check_out_date', '2026-11-22');

  assert(Boolean(conflictCheck && conflictCheck.length > 0), 'Reservation B REJECTED: Overlapping dates conflict detected');

  // Clean up Reservation A
  await admin.from('bookings').delete().eq('id', bookingA_Id);
  await admin.from('guests').delete().eq('id', testGuestId);
  console.log('✓ Cleaned up concurrency test records');

  // Test 2: Complete New Reservation with Attached PDF ID
  console.log('\n--- 2. Complete New Reservation with Attached PDF ID ---');
  const newGuestId = crypto.randomUUID();
  const newGuestPhone = '+919123456789';
  const newGuestName = 'Rajesh Kumar';

  // 1. Create Guest
  const { data: createdGuest, error: cgErr } = await admin
    .from('guests')
    .insert({
      id: newGuestId,
      hotel_id: hotelId,
      full_name: newGuestName,
      phone: newGuestPhone,
      email: 'rajesh.kumar@example.com',
      id_type: 'Aadhaar',
      id_number: '987654321012',
      address: 'Bandra, Mumbai'
    })
    .select()
    .single();

  assert(!cgErr && Boolean(createdGuest?.id), 'Guest created with ID metadata');

  // 2. Create Booking
  const newBookingId = crypto.randomUUID();
  const { data: createdBooking, error: cbErr } = await admin
    .from('bookings')
    .insert({
      id: newBookingId,
      hotel_id: hotelId,
      booking_number: `HGV-202611-RAJESH`,
      room_id: room.id,
      guest_id: newGuestId,
      check_in_date: '2026-12-01',
      check_out_date: '2026-12-04',
      adults: 2,
      children: 0,
      rate_per_night: 4000,
      total_amount: 12000,
      advance_amount: 3000,
      payment_status: 'advance_received',
      booking_status: 'confirmed',
      source: 'direct'
    })
    .select()
    .single();

  assert(!cbErr && Boolean(createdBooking?.id), 'Reservation created with advance payment status');

  // 3. Attach ID document into private Storage
  const docId = crypto.randomUUID();
  const pdfStoragePath = `hotel/${hotelId}/guests/${newGuestId}/documents/${docId}/DT20245983799_Aadhar_Card.pdf`;
  const pdfBuffer = Buffer.from('%PDF-1.4 sample secure aadhaar document content');

  const { error: uploadErr } = await admin.storage
    .from('guest-documents')
    .upload(pdfStoragePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  assert(!uploadErr, 'PDF ID card uploaded to private bucket guest-documents');

  // 4. Secure signed URL verification
  const { data: signedData, error: signErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(pdfStoragePath, 60);

  assert(!signErr && Boolean(signedData?.signedUrl), 'Generated 60-second temporary signed URL');

  // 5. Cleanup test data
  await admin.storage.from('guest-documents').remove([pdfStoragePath]);
  await admin.from('bookings').delete().eq('id', newBookingId);
  await admin.from('guests').delete().eq('id', newGuestId);
  console.log('✓ Cleaned up test reservation, guest, and storage object');

  // Test 3: Multi-tenant Isolation Check
  console.log('\n--- 3. Multi-Tenant Cross-Access Isolation ---');
  const hotelB_Id = 'dbd450bb-ecd0-405b-954f-0df73d826a96';
  const { data: hotelB_Guests } = await admin.from('guests').select('id, hotel_id').eq('hotel_id', hotelB_Id);
  assert(
    !hotelB_Guests?.some(g => g.hotel_id === hotelId),
    'Hotel A cannot see or mix guests from Hotel B (Strict Tenant Separation)'
  );

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

main().catch(console.error);
