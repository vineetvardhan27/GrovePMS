#!/usr/bin/env node
/**
 * Test complete reservation creation flow end-to-end
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

async function testBookingCreation() {
  console.log('--- Testing Complete Reservation Flow ---');

  const hotelId = 'a0000000-0000-0000-0000-000000000001';
  const { data: rooms } = await admin.from('rooms').select('*').eq('hotel_id', hotelId).limit(1);
  const room = rooms[0];

  const testPhone = '+919999988888';
  const checkIn = '2026-11-15';
  const checkOut = '2026-11-18';

  // 1. Conflict check
  const { data: conflicts } = await admin
    .from('bookings')
    .select('id, booking_number')
    .eq('hotel_id', hotelId)
    .eq('room_id', room.id)
    .neq('booking_status', 'cancelled')
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn);

  if (conflicts && conflicts.length > 0) {
    console.log('Found conflict:', conflicts[0]);
    return;
  }
  console.log('✓ Zero conflict for requested dates');

  // 2. Find or create guest
  let guestId = '';
  const { data: existingGuest } = await admin
    .from('guests')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('phone', testPhone)
    .maybeSingle();

  if (existingGuest) {
    guestId = existingGuest.id;
    console.log('✓ Found existing guest:', guestId);
  } else {
    guestId = crypto.randomUUID();
    const { data: newGuest, error: gErr } = await admin
      .from('guests')
      .insert({
        id: guestId,
        hotel_id: hotelId,
        full_name: 'Vineet Test Vardhan',
        phone: testPhone,
        email: 'testguest@example.com',
        id_type: 'Aadhaar',
        id_number: '123456789123',
        address: 'Pune, Maharashtra'
      })
      .select()
      .single();
    if (gErr) throw gErr;
    console.log('✓ Created guest:', newGuest.id);
  }

  // 3. Create booking
  const bookingId = crypto.randomUUID();
  const bookingNumber = `HGV-202611-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: booking, error: bErr } = await admin
    .from('bookings')
    .insert({
      id: bookingId,
      hotel_id: hotelId,
      booking_number: bookingNumber,
      room_id: room.id,
      guest_id: guestId,
      check_in_date: checkIn,
      check_out_date: checkOut,
      adults: 2,
      children: 0,
      rate_per_night: 3500,
      total_amount: 10500,
      advance_amount: 2000,
      payment_status: 'advance_received',
      booking_status: 'confirmed',
      source: 'direct'
    })
    .select()
    .single();

  if (bErr) throw bErr;
  console.log('✓ Created booking:', booking.booking_number);

  // 4. Attach ID Card to private storage
  const docId = crypto.randomUUID();
  const storagePath = `hotel/${hotelId}/guests/${guestId}/documents/${docId}/DT20245983799_Aadhar_Card.pdf`;
  const mockBuffer = Buffer.from('%PDF-1.4 dummy pdf header and content');

  const { error: sErr } = await admin.storage
    .from('guest-documents')
    .upload(storagePath, mockBuffer, { contentType: 'application/pdf', upsert: true });

  if (sErr) throw sErr;
  console.log('✓ Uploaded ID card to private storage:', storagePath);

  // 5. Generate signed URL
  const { data: signedData, error: signErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(storagePath, 60);

  if (signErr) throw signErr;
  console.log('✓ Generated temporary signed URL successfully (token present)');

  // Clean up test booking and file
  await admin.storage.from('guest-documents').remove([storagePath]);
  await admin.from('bookings').delete().eq('id', bookingId);
  await admin.from('guests').delete().eq('id', guestId);
  console.log('✓ Cleaned up test booking, guest, and storage object.');

  console.log('\n--- ALL RESERVATION & ID FLOW CHECKS PASSED ---');
}

testBookingCreation().catch(console.error);
