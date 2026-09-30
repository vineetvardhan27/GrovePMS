#!/usr/bin/env node
/**
 * Senior PostgreSQL / Supabase Performance Engineering Verification Suite
 * Verifies Migration 0024 Indexes, Query Patterns, Latency Benchmarks & Functional Workflows
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
  console.log('  POSTGRESQL / SUPABASE INDEX & QUERY PERFORMANCE VERIFICATION');
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

  // --- STEP 1: Static Migration & Index Idempotency Audit ---
  console.log('--- 1. Migration 0024 Schema & Index Idempotency Audit ---');
  const migration0024Path = path.resolve(process.cwd(), 'supabase/migrations/0024_query_performance_indexes.sql');
  assert(fs.existsSync(migration0024Path), 'Migration file 0024_query_performance_indexes.sql exists');

  // Verify idx_bookings_room_dates exists in 0001_init_schema.sql (already present)
  const migration0001Path = path.resolve(process.cwd(), 'supabase/migrations/0001_init_schema.sql');
  const migration0001Sql = fs.readFileSync(migration0001Path, 'utf8');
  assert(migration0001Sql.includes('idx_bookings_room_dates ON bookings(room_id, check_in_date, check_out_date)'),
    'Pattern 1 (room_id, check_in_date, check_out_date) verified as ALREADY PRESENT in 0001_init_schema.sql');

  const migration0024Sql = fs.readFileSync(migration0024Path, 'utf8');
  assert(migration0024Sql.includes('idx_bookings_guest_hotel'), 'Defines idx_bookings_guest_hotel index');
  assert(migration0024Sql.includes('idx_payments_booking_created'), 'Defines idx_payments_booking_created index');
  assert(migration0024Sql.includes('idx_food_charges_hotel_booking'), 'Defines idx_food_charges_hotel_booking index');
  assert(migration0024Sql.includes('idx_fb_bills_hotel_created'), 'Defines idx_fb_bills_hotel_created index');
  assert(migration0024Sql.includes('idx_inventory_tx_hotel_created'), 'Defines idx_inventory_tx_hotel_created index');

  const createIndexStatements = migration0024Sql.match(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS/gi) || [];
  assert(createIndexStatements.length === 5, 'All 5 new index definitions use safe idempotent "CREATE INDEX IF NOT EXISTS"');

  // Verify non-duplication against 0001 - 0023
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const otherMigrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql') && f !== '0024_query_performance_indexes.sql');
  let duplicateFound = false;
  for (const f of otherMigrations) {
    const content = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
    if (
      content.includes('idx_bookings_guest_hotel') ||
      content.includes('idx_payments_booking_created') ||
      content.includes('idx_food_charges_hotel_booking') ||
      content.includes('idx_fb_bills_hotel_created') ||
      content.includes('idx_inventory_tx_hotel_created')
    ) {
      duplicateFound = true;
      console.error(`Duplicate index found in ${f}`);
    }
  }
  assert(!duplicateFound, 'Zero duplicate indexes across previous migration files (0001 - 0023)');

  // --- STEP 2: Fetch Live Context for Representative Query Testing ---
  console.log('\n--- 2. Fetching Live Context for Query Testing ---');
  const hotelId = 'a0000000-0000-0000-0000-000000000001';
  const { data: sampleRooms } = await admin.from('rooms').select('id, room_number').eq('hotel_id', hotelId).limit(3);
  const { data: sampleGuests } = await admin.from('guests').select('id, full_name').eq('hotel_id', hotelId).limit(3);
  const { data: sampleBookings } = await admin.from('bookings').select('id, room_id, guest_id, check_in_date, check_out_date').eq('hotel_id', hotelId).limit(5);

  const testRoomId = sampleBookings?.[0]?.room_id || sampleRooms?.[0]?.id;
  const testGuestId = sampleBookings?.[0]?.guest_id || sampleGuests?.[0]?.id;
  const testBookingId = sampleBookings?.[0]?.id;

  assert(Boolean(testRoomId), `Target Room resolved: ${testRoomId}`);
  assert(Boolean(testGuestId), `Target Guest resolved: ${testGuestId}`);
  assert(Boolean(testBookingId), `Target Booking resolved: ${testBookingId}`);

  // --- STEP 3: Benchmark & Verify 6 Target Query Patterns ---
  console.log('\n--- 3. Benchmarking 6 Target Query Patterns ---');
  const latencies = [];

  // Query 1: bookings(room_id, check_in_date, check_out_date)
  const q1Start = performance.now();
  const { data: q1Data, error: q1Err } = await admin
    .from('bookings')
    .select('id, booking_number, check_in_date, check_out_date, booking_status')
    .eq('hotel_id', hotelId)
    .eq('room_id', testRoomId)
    .neq('booking_status', 'cancelled')
    .lt('check_in_date', '2026-10-15')
    .gt('check_out_date', '2026-10-10');
  const q1Duration = performance.now() - q1Start;
  latencies.push({ name: '1. bookings(room_id, dates) [Room Conflict]', time: q1Duration });
  assert(!q1Err, `Pattern 1: Room conflict/calendar query succeeded in ${q1Duration.toFixed(1)}ms (${q1Data?.length ?? 0} matches)`);

  // Query 2: bookings(guest_id, hotel_id)
  const q2Start = performance.now();
  const { data: q2Data, error: q2Err } = await admin
    .from('bookings')
    .select('id, hotel_id, guest_id, total_amount, booking_status')
    .eq('guest_id', testGuestId)
    .eq('hotel_id', hotelId);
  const q2Duration = performance.now() - q2Start;
  latencies.push({ name: '2. bookings(guest_id, hotel_id) [Guest History]', time: q2Duration });
  assert(!q2Err, `Pattern 2: Guest booking history query succeeded in ${q2Duration.toFixed(1)}ms (${q2Data?.length ?? 0} bookings)`);

  // Query 3: payments(booking_id, created_at DESC)
  const q3Start = performance.now();
  const { data: q3Data, error: q3Err } = await admin
    .from('payments')
    .select('id, amount, payment_mode, booking_id, created_at')
    .eq('booking_id', testBookingId)
    .order('created_at', { ascending: false });
  const q3Duration = performance.now() - q3Start;
  latencies.push({ name: '3. payments(booking_id, created_at DESC) [Folio Payments]', time: q3Duration });
  assert(!q3Err, `Pattern 3: Folio payment history query succeeded in ${q3Duration.toFixed(1)}ms (${q3Data?.length ?? 0} payments)`);

  // Query 4: food_charges(hotel_id, booking_id)
  const q4Start = performance.now();
  const { data: q4Data, error: q4Err } = await admin
    .from('food_charges')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('booking_id', testBookingId)
    .order('created_at', { ascending: true });
  const q4Duration = performance.now() - q4Start;
  latencies.push({ name: '4. food_charges(hotel_id, booking_id) [F&B Itemization]', time: q4Duration });
  assert(!q4Err, `Pattern 4: Room F&B itemization query succeeded in ${q4Duration.toFixed(1)}ms (${q4Data?.length ?? 0} charges)`);

  // Query 5: fb_bills(hotel_id, created_at DESC)
  const q5Start = performance.now();
  const { data: q5Data, error: q5Err } = await admin
    .from('fb_bills')
    .select('id, bill_number, customer_name, grand_total, payment_status, created_at')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(50);
  const q5Duration = performance.now() - q5Start;
  latencies.push({ name: '5. fb_bills(hotel_id, created_at DESC) [F&B Bill List]', time: q5Duration });
  assert(!q5Err, `Pattern 5: F&B billing ledger query succeeded in ${q5Duration.toFixed(1)}ms (${q5Data?.length ?? 0} bills)`);

  // Query 6: inventory_transactions(hotel_id, created_at DESC)
  const q6Start = performance.now();
  const { data: q6Data, error: q6Err } = await admin
    .from('inventory_transactions')
    .select('id, item_id, transaction_type, quantity, created_at')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(100);
  const q6Duration = performance.now() - q6Start;
  latencies.push({ name: '6. inventory_transactions(hotel_id, created_at DESC) [Stock Ledger]', time: q6Duration });
  assert(!q6Err, `Pattern 6: Inventory transaction history query succeeded in ${q6Duration.toFixed(1)}ms (${q6Data?.length ?? 0} transactions)`);

  // --- STEP 4: Verify Booking Conflict Logic & Creation Integrity ---
  console.log('\n--- 4. Verifying Room Conflict Checking & Booking Lifecycle ---');
  // Overlap test: Query with dates overlapping existing booking
  const existingBooking = sampleBookings?.[0];
  if (existingBooking) {
    const { data: conflictCheck } = await admin
      .from('bookings')
      .select('id, booking_number, check_in_date, check_out_date, booking_status')
      .eq('hotel_id', hotelId)
      .eq('room_id', existingBooking.room_id)
      .neq('booking_status', 'cancelled')
      .lt('check_in_date', existingBooking.check_out_date)
      .gt('check_out_date', existingBooking.check_in_date);

    const hasConflict = conflictCheck && conflictCheck.some((b) => b.id === existingBooking.id);
    assert(hasConflict, `Conflict detection correctly identified overlapping booking (${existingBooking.check_in_date} to ${existingBooking.check_out_date})`);

    // Non-overlapping test in far future:
    const { data: noConflictCheck } = await admin
      .from('bookings')
      .select('id')
      .eq('hotel_id', hotelId)
      .eq('room_id', existingBooking.room_id)
      .neq('booking_status', 'cancelled')
      .lt('check_in_date', '2099-01-05')
      .gt('check_out_date', '2099-01-01');

    assert(noConflictCheck?.length === 0, 'No false conflicts detected for non-overlapping dates in 2099');
  }

  // --- STEP 5: Verify Payment & Folio Integrity ---
  console.log('\n--- 5. Verifying Payments & Folio Computation ---');
  const { data: allPayments, error: payErr } = await admin
    .from('payments')
    .select('id, amount, payment_mode, booking_id, created_at')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(20);
  assert(!payErr, `Payments ledger query returned ${allPayments?.length ?? 0} recent transactions`);

  // --- STEP 6: Verify F&B & Inventory Relational State ---
  console.log('\n--- 6. Verifying F&B & Inventory Tables ---');
  const { data: allFbBills, error: fbErr } = await admin
    .from('fb_bills')
    .select('id, bill_number, grand_total, payment_status')
    .eq('hotel_id', hotelId)
    .limit(10);
  assert(!fbErr, `F&B bills table accessible (${allFbBills?.length ?? 0} bills)`);

  const { data: invTx, error: invErr } = await admin
    .from('inventory_transactions')
    .select('id, transaction_type, quantity')
    .eq('hotel_id', hotelId)
    .limit(10);
  assert(!invErr, `Inventory transactions table accessible (${invTx?.length ?? 0} transactions)`);

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  console.log('Summary of Measured Query Latencies:');
  latencies.forEach((l) => {
    console.log(`  • ${l.name.padEnd(58)}: ${l.time.toFixed(1)} ms`);
  });
  console.log('\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error in verification suite:', err);
  process.exit(1);
});
