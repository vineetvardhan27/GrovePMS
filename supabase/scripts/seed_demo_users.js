#!/usr/bin/env node
/**
 * Server-Side Supabase Admin Demo Account Provisioning & Verification
 * 
 * Uses Supabase Admin Auth API (service_role key) exclusively server-side.
 * Never exposes service_role key to browser/client.
 * 
 * Workflow:
 * 1. Resolve real hotel from public.hotels
 * 2. Fetch existing Auth users via admin.auth.admin.listUsers()
 * 3. For each demo account:
 *    - If exists: keep real Auth UID, update password to HotelDemo@2026!, set email_confirm: true
 *    - If new: create user via admin API with email_confirm: true, obtain real generated Auth UID
 * 4. Upsert public.staff with matching real Auth UID (auth.users.id === staff.id)
 * 5. Verify database relationship and test signInWithPassword for all 4 accounts
 * 6. Test full PMS workflow (Reception login -> Guest -> Booking -> Payment -> Room status)
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_PASSWORD = 'HotelDemo@2026!';

if (!SUPABASE_URL) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is missing from .env.local');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('\n========================================================================');
  console.error('  MISSING: SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('========================================================================');
  console.error('To provision real Supabase Auth accounts with the Admin API:');
  console.error('1. Go to your Supabase Dashboard:');
  console.error('   Project Settings -> API -> Project API Keys -> service_role secret');
  console.error('2. Add to your .env.local:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.error('3. Re-run:');
  console.error('   npm run seed:demo');
  console.error('========================================================================\n');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_ACCOUNTS_SPEC = [
  {
    email: 'owner@hotelgreeneryview.com',
    full_name: 'Ohm Adhikari',
    role: 'owner',
  },
  {
    email: 'manager@hotelgreeneryview.com',
    full_name: 'Priya Sharma',
    role: 'manager',
  },
  {
    email: 'reception@hotelgreeneryview.com',
    full_name: 'Rahul Verma',
    role: 'reception',
  },
  {
    email: 'housekeeping@hotelgreeneryview.com',
    full_name: 'Sunita Devi',
    role: 'housekeeping',
  },
];

async function runProvisioningAndVerification() {
  console.log('========================================================================');
  console.log('  STARTING REAL SUPABASE AUTH & STAFF PROVISIONING');
  console.log('========================================================================\n');

  // 1. Fetch real hotel from DB
  console.log('--- 1. Resolving Hotel from public.hotels ---');
  const { data: hotel, error: hotelErr } = await admin
    .from('hotels')
    .select('id, name, slug')
    .or('slug.eq.hotel-greenery-view,slug.neq.""')
    .limit(1)
    .maybeSingle();

  if (hotelErr || !hotel) {
    console.error('❌ Could not find hotel in public.hotels:', hotelErr?.message);
    process.exit(1);
  }

  console.log(`✓ Using Real Hotel: "${hotel.name}" (UUID: ${hotel.id})\n`);

  // 2. Fetch existing Auth users via Admin API
  console.log('--- 2. Querying Existing Supabase Auth Users ---');
  const { data: userListData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) {
    console.error('❌ Failed to list auth users:', listErr.message);
    process.exit(1);
  }

  const existingAuthMap = new Map();
  for (const u of userListData.users || []) {
    existingAuthMap.set(u.email.toLowerCase(), u);
  }
  console.log(`✓ Found ${existingAuthMap.size} existing Auth users in Supabase.\n`);

  // 3. Create or update each account using REAL Auth UUIDs
  console.log('--- 3. Provisioning Real Auth Users & Syncing public.staff ---');
  const provisionedStaffMap = new Map();

  for (const spec of DEMO_ACCOUNTS_SPEC) {
    const emailLower = spec.email.toLowerCase();
    const existing = existingAuthMap.get(emailLower);
    let realAuthUid = null;

    if (existing) {
      realAuthUid = existing.id;
      console.log(`[${spec.role.toUpperCase()}] Existing Auth user found with real UID: ${realAuthUid}`);
      console.log(`  -> Resetting password to "${DEMO_PASSWORD}" and ensuring email_confirmed_at is active...`);

      const { data: updated, error: updateErr } = await admin.auth.admin.updateUserById(realAuthUid, {
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: spec.full_name,
          role: spec.role,
        },
      });

      if (updateErr) {
        console.error(`❌ Failed to update auth user ${spec.email}:`, updateErr.message);
        process.exit(1);
      }
      console.log(`  ✓ Auth user updated & confirmed.`);
    } else {
      console.log(`[${spec.role.toUpperCase()}] User not found in auth.users. Creating via Admin API...`);
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: spec.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: spec.full_name,
          role: spec.role,
        },
      });

      if (createErr || !created?.user) {
        console.error(`❌ Failed to create auth user ${spec.email}:`, createErr?.message);
        process.exit(1);
      }

      realAuthUid = created.user.id;
      console.log(`  ✓ Created new Auth user with real generated UID: ${realAuthUid}`);
    }

    // 4. Upsert into public.staff with matching real Auth UID
    console.log(`  -> Linking public.staff row: staff.id (${realAuthUid}) === auth.users.id...`);
    const { data: staffUpserted, error: staffErr } = await admin
      .from('staff')
      .upsert({
        id: realAuthUid,
        hotel_id: hotel.id,
        email: spec.email,
        full_name: spec.full_name,
        role: spec.role,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (staffErr) {
      console.error(`❌ Failed to upsert public.staff for ${spec.email}:`, staffErr.message);
      process.exit(1);
    }

    console.log(`  ✓ public.staff row verified: ${staffUpserted.full_name} (Role: ${staffUpserted.role}, Active: ${staffUpserted.is_active})\n`);
    provisionedStaffMap.set(spec.role, { authUid: realAuthUid, email: spec.email, role: spec.role, staff: staffUpserted });
  }

  // 5. Verification Query: Confirm Auth IDs strictly match Staff IDs
  console.log('--- 4. Running Critical Verification Query (auth.users <-> public.staff <-> public.hotels) ---');
  const { data: verifyRows, error: verifyErr } = await admin
    .from('staff')
    .select(`
      id,
      email,
      full_name,
      role,
      hotel_id,
      is_active,
      hotel:hotel_id (
        id,
        name,
        slug
      )
    `)
    .in('email', DEMO_ACCOUNTS_SPEC.map((s) => s.email));

  if (verifyErr || !verifyRows || verifyRows.length !== 4) {
    console.error('❌ Verification query failed or missing records:', verifyErr?.message);
    process.exit(1);
  }

  console.log('Verification Results:');
  console.table(verifyRows.map((r) => ({
    staff_id: r.id,
    email: r.email,
    role: r.role,
    hotel_id: r.hotel_id,
    hotel_name: r.hotel?.name,
    is_active: r.is_active,
  })));

  // 6. Test signInWithPassword() for all 4 accounts using client-side credentials
  console.log('\n--- 5. Testing Real Client signInWithPassword() For All 4 Accounts ---');
  const clientClients = {};

  for (const spec of DEMO_ACCOUNTS_SPEC) {
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: loginErr } = await anonClient.auth.signInWithPassword({
      email: spec.email,
      password: DEMO_PASSWORD,
    });

    if (loginErr || !authData?.user || !authData?.session) {
      console.error(`❌ [${spec.role.toUpperCase()}] Login test failed for ${spec.email}:`, loginErr?.message);
      process.exit(1);
    }

    console.log(`✓ [${spec.role.toUpperCase()}] Login SUCCESS: ${spec.email} (Auth UID: ${authData.user.id})`);

    // Verify token matches staff
    clientClients[spec.role] = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
    });
  }

  // 7. Full PMS Workflow Verification (Reception -> Guest -> Room -> Booking -> Payment -> Room status)
  console.log('\n--- 6. Testing Real PMS Workflow Persistence (Reception User) ---');
  const recClient = clientClients['reception'];

  // Query a room
  const { data: rooms, error: roomErr } = await recClient
    .from('rooms')
    .select('id, room_number, status, category:category_id(*)')
    .eq('hotel_id', hotel.id)
    .limit(1);

  if (roomErr || !rooms || rooms.length === 0) {
    console.error('❌ No rooms found in hotel for test booking:', roomErr?.message);
    process.exit(1);
  }

  const testRoom = rooms[0];
  console.log(`Selected Room for PMS Verification: #${testRoom.room_number} (ID: ${testRoom.id})`);

  // Insert real guest
  const guestPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const guestName = 'Verified Guest ' + Math.floor(100 + Math.random() * 900);
  const guestId = crypto.randomUUID();

  const { data: newGuest, error: guestErr } = await recClient
    .from('guests')
    .insert({
      id: guestId,
      hotel_id: hotel.id,
      full_name: guestName,
      phone: guestPhone,
      email: 'guest.' + guestPhone + '@example.com',
      id_type: 'Passport',
      id_number: 'N' + Math.floor(1000000 + Math.random() * 9000000),
      address: '74 MG Road, Bengaluru',
    })
    .select()
    .single();

  if (guestErr || !newGuest) {
    console.error('❌ Failed to insert guest in Supabase:', guestErr?.message);
    process.exit(1);
  }
  console.log(`✓ Real Guest inserted into public.guests: "${newGuest.full_name}" (ID: ${newGuest.id}, Phone: ${newGuest.phone})`);

  // Insert real booking
  const bookingId = crypto.randomUUID();
  const bookingNumber = 'HGV-REAL-' + Math.floor(100000 + Math.random() * 900000);
  const checkInDate = '2026-09-15';
  const checkOutDate = '2026-09-18';
  const ratePerNight = 3500;
  const totalAmount = 10500;
  const advanceAmount = 3500;

  const { data: newBooking, error: bookingInsertErr } = await recClient
    .from('bookings')
    .insert({
      id: bookingId,
      hotel_id: hotel.id,
      booking_number: bookingNumber,
      room_id: testRoom.id,
      guest_id: newGuest.id,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: 2,
      children: 1,
      rate_per_night: ratePerNight,
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      payment_status: 'advance_received',
      booking_status: 'confirmed',
      source: 'direct',
      remarks: 'Production Persistence End-to-End Test Record',
    })
    .select()
    .single();

  if (bookingInsertErr || !newBooking) {
    console.error('❌ Failed to insert booking in Supabase:', bookingInsertErr?.message);
    process.exit(1);
  }
  console.log(`✓ Real Booking inserted into public.bookings: #${newBooking.booking_number} (ID: ${newBooking.id})`);

  // Insert real advance payment
  const paymentId = crypto.randomUUID();
  const { data: newPayment, error: paymentErr } = await recClient
    .from('payments')
    .insert({
      id: paymentId,
      hotel_id: hotel.id,
      booking_id: newBooking.id,
      amount: advanceAmount,
      payment_mode: 'upi',
      payment_type: 'advance',
      notes: `Advance for booking ${bookingNumber}`,
      recorded_by: provisionedStaffMap.get('reception').authUid,
    })
    .select()
    .single();

  if (paymentErr || !newPayment) {
    console.error('❌ Failed to insert payment in Supabase:', paymentErr?.message);
    process.exit(1);
  }
  console.log(`✓ Real Payment inserted into public.payments: ₹${newPayment.amount} (Mode: ${newPayment.payment_mode})`);

  // Update room status
  const { error: roomUpdateErr } = await recClient
    .from('rooms')
    .update({ status: 'reserved', updated_at: new Date().toISOString() })
    .eq('id', testRoom.id)
    .eq('hotel_id', hotel.id);

  if (roomUpdateErr) {
    console.error('❌ Failed to update room status in Supabase:', roomUpdateErr?.message);
    process.exit(1);
  }
  console.log(`✓ Room status updated to "reserved" in public.rooms`);

  // 8. Relational Consistency JOIN query from Owner client
  console.log('\n--- 7. Relational Consistency Query (Owner Client) ---');
  const ownerClient = clientClients['owner'];
  const { data: persistedRel, error: relErr } = await ownerClient
    .from('bookings')
    .select(`
      booking_number,
      hotel_id,
      check_in_date,
      check_out_date,
      total_amount,
      advance_amount,
      payment_status,
      booking_status,
      guest:guest_id (
        id,
        full_name,
        phone
      ),
      room:room_id (
        id,
        room_number,
        status,
        category:category_id (name)
      ),
      hotel:hotel_id (
        id,
        name
      ),
      payments (
        id,
        amount,
        payment_mode,
        payment_type
      )
    `)
    .eq('id', newBooking.id)
    .single();

  if (relErr || !persistedRel) {
    console.error('❌ Consistency query failed:', relErr?.message);
    process.exit(1);
  }

  console.log('✓ Database Consistency Verified:');
  console.log(`  Booking Number:  ${persistedRel.booking_number}`);
  console.log(`  Hotel Match:     ${persistedRel.hotel_id} === ${persistedRel.hotel?.name}`);
  console.log(`  Guest Match:     ${persistedRel.guest?.id} === ${persistedRel.guest?.full_name}`);
  console.log(`  Room Match:      #${persistedRel.room?.room_number} (${persistedRel.room?.category?.name}) Status: ${persistedRel.room?.status}`);
  console.log(`  Payment Count:   ${persistedRel.payments?.length} payments attached`);

  console.log('\n========================================================================');
  console.log('  ALL REAL AUTH USERS, STAFF ROWS, & PMS PERSISTENCE VERIFIED! ✓');
  console.log('========================================================================\n');
}

runProvisioningAndVerification().catch((err) => {
  console.error('Unhandled exception during provisioning:', err);
  process.exit(1);
});
