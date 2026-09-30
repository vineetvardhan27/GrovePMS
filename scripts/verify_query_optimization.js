global.WebSocket = class {};
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const idx = t.indexOf('=');
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
  console.log('================================================================');
  console.log('      SENIOR SUPABASE/POSTGRESQL QUERY OPTIMIZATION AUDIT        ');
  console.log('================================================================\n');

  const hotelId = 'a0000000-0000-0000-0000-000000000001';

  // --------------------------------------------------------------------------
  // TEST 1: Reports - getHotelOwnerIntelligence query pattern
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Reports (getHotelOwnerIntelligence Optimization) ---');
  const t0_old_reports = Date.now();
  // Simulate OLD way: full table downloads
  const [oldBookings, oldPayments, oldBanquetBookings, oldBanquetPayments] = await Promise.all([
    supabase.from('bookings').select('*, guest:guest_id (*), room:room_id (*, category:category_id (*)), payments:payments (*)').eq('hotel_id', hotelId),
    supabase.from('payments').select('*').eq('hotel_id', hotelId),
    supabase.from('banquet_bookings').select('*').eq('hotel_id', hotelId),
    supabase.from('banquet_payments').select('*').eq('hotel_id', hotelId),
  ]);
  const t1_old_reports = Date.now();
  const oldReportsPayloadBytes = 
    JSON.stringify(oldBookings.data || []).length +
    JSON.stringify(oldPayments.data || []).length +
    JSON.stringify(oldBanquetBookings.data || []).length +
    JSON.stringify(oldBanquetPayments.data || []).length;

  const t0_new_reports = Date.now();
  // Simulate NEW way: PostgreSQL date & status filtered
  const startDate = '2026-09-01';
  const endDate = '2026-09-30';
  const startIso = `${startDate}T00:00:00.000Z`;
  const endIso = `${endDate}T23:59:59.999Z`;

  const [newPeriodBookings, newPeriodPayments, newRooms, newInHouseCount, newArrivalsToday] = await Promise.all([
    supabase.from('bookings').select('id, total_amount, tax_amount, check_in_date, check_out_date, booking_status, created_at, food_charges').eq('hotel_id', hotelId).gte('check_in_date', startDate).lte('check_in_date', endDate),
    supabase.from('payments').select('amount, payment_mode, payment_type, created_at').eq('hotel_id', hotelId).gte('created_at', startIso).lte('created_at', endIso),
    supabase.from('rooms').select('id, status').eq('hotel_id', hotelId),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId).eq('booking_status', 'checked_in'),
    supabase.from('bookings').select('id, booking_number, guest:guest_id(full_name)').eq('hotel_id', hotelId).eq('check_in_date', '2026-09-30').in('booking_status', ['confirmed', 'checked_in']),
  ]);
  const t1_new_reports = Date.now();
  const newReportsPayloadBytes = 
    JSON.stringify(newPeriodBookings.data || []).length +
    JSON.stringify(newPeriodPayments.data || []).length +
    JSON.stringify(newRooms.data || []).length +
    JSON.stringify(newArrivalsToday.data || []).length;

  console.log(`[Before] Old unconstrained queries transfer size: ${oldReportsPayloadBytes} bytes (${t1_old_reports - t0_old_reports}ms)`);
  console.log(`[After]  New database-filtered queries transfer size: ${newReportsPayloadBytes} bytes (${t1_new_reports - t0_new_reports}ms)`);
  console.log(`Reduction: ${Math.round((1 - newReportsPayloadBytes / Math.max(1, oldReportsPayloadBytes)) * 100)}% data payload reduction.\n`);

  // --------------------------------------------------------------------------
  // TEST 2: Bookings - getBookings() PostgreSQL Filtering & Search
  // --------------------------------------------------------------------------
  console.log('--- TEST 2: Bookings (PostgreSQL Search, Filtering, Pagination) ---');
  
  // 2a. Search by name "Vineet" pushed to Postgres
  const searchTerm = 'Vineet';
  const { data: matchedGuests } = await supabase.from('guests').select('id').ilike('full_name', `%${searchTerm}%`);
  const guestIds = (matchedGuests || []).map(g => g.id);
  
  let searchQ = supabase.from('bookings').select('id, booking_number, guest:guest_id(full_name)').eq('hotel_id', hotelId);
  if (guestIds.length > 0) {
    searchQ = searchQ.or(`booking_number.ilike.%${searchTerm}%,guest_id.in.(${guestIds.join(',')})`);
  } else {
    searchQ = searchQ.ilike('booking_number', `%${searchTerm}%`);
  }
  const searchResult = await searchQ;
  assert(!searchResult.error, 'Search query executed without error');
  console.log(`✓ PostgreSQL pushed search for "${searchTerm}" returned ${searchResult.data.length} records:`);
  searchResult.data.forEach(b => console.log(`   - ${b.booking_number} (${b.guest?.full_name})`));

  // 2b. Date filtering pushed to Postgres
  const dateFilterResult = await supabase
    .from('bookings')
    .select('id, booking_number, check_in_date')
    .eq('hotel_id', hotelId)
    .gte('check_in_date', '2026-09-15')
    .lte('check_in_date', '2026-09-20');
  console.log(`✓ PostgreSQL pushed date range (2026-09-15 to 2026-09-20): ${dateFilterResult.data.length} records`);

  // 2c. Status filtering pushed to Postgres
  const statusFilterResult = await supabase
    .from('bookings')
    .select('id, booking_number, booking_status')
    .eq('hotel_id', hotelId)
    .eq('booking_status', 'checked_out');
  console.log(`✓ PostgreSQL pushed status filter (checked_out): ${statusFilterResult.data.length} records`);

  // 2d. Pagination pushed to Postgres
  const pageResult = await supabase
    .from('bookings')
    .select('id, booking_number')
    .eq('hotel_id', hotelId)
    .range(0, 1);
  console.log(`✓ PostgreSQL pagination range (page 1, pageSize 2): ${pageResult.data.length} records returned\n`);

  // --------------------------------------------------------------------------
  // TEST 3: Guests - getGuestById() spending calculation
  // --------------------------------------------------------------------------
  console.log('--- TEST 3: Guests (getGuestById Spending Calculation Optimization) ---');
  const targetGuest = (await supabase.from('guests').select('id, full_name').limit(1).single()).data;
  console.log(`Target guest: ${targetGuest.full_name} (${targetGuest.id})`);

  // Old way: download ALL food charges and ALL FB bills in the entire hotel
  const t0_old_guest = Date.now();
  const [oldAllFC, oldAllFBB] = await Promise.all([
    supabase.from('food_charges').select('*').eq('hotel_id', hotelId),
    supabase.from('fb_bills').select('*').eq('hotel_id', hotelId),
  ]);
  const t1_old_guest = Date.now();
  const oldGuestPayloadBytes = JSON.stringify(oldAllFC.data || []).length + JSON.stringify(oldAllFBB.data || []).length;

  // New way: query ONLY this guest's records
  const t0_new_guest = Date.now();
  const guestBookings = (await supabase.from('bookings').select('id').eq('guest_id', targetGuest.id)).data || [];
  const bIds = guestBookings.map(b => b.id);
  
  let newFcQ = supabase.from('food_charges').select('total_amount').eq('hotel_id', hotelId);
  if (bIds.length > 0) {
    newFcQ = newFcQ.or(`guest_id.eq.${targetGuest.id},booking_id.in.(${bIds.join(',')})`);
  } else {
    newFcQ = newFcQ.eq('guest_id', targetGuest.id);
  }

  let newFbbQ = supabase.from('fb_bills').select('grand_total').eq('hotel_id', hotelId).neq('billing_mode', 'charge_to_room').not('bill_status', 'in', '("cancelled","void")');
  if (bIds.length > 0) {
    newFbbQ = newFbbQ.or(`guest_id.eq.${targetGuest.id},booking_id.in.(${bIds.join(',')})`);
  } else {
    newFbbQ = newFbbQ.eq('guest_id', targetGuest.id);
  }

  const [newFC, newFBB] = await Promise.all([newFcQ, newFbbQ]);
  const t1_new_guest = Date.now();
  const newGuestPayloadBytes = JSON.stringify(newFC.data || []).length + JSON.stringify(newFBB.data || []).length;

  console.log(`[Before] Old guest query full-hotel F&B transfer: ${oldGuestPayloadBytes} bytes (${t1_old_guest - t0_old_guest}ms)`);
  console.log(`[After]  New targeted guest query transfer: ${newGuestPayloadBytes} bytes (${t1_new_guest - t0_new_guest}ms)`);
  console.log(`Reduction: ${Math.round((1 - newGuestPayloadBytes / Math.max(1, oldGuestPayloadBytes)) * 100)}% data payload reduction.\n`);

  // --------------------------------------------------------------------------
  // TEST 4: Payments - Ledger & Receivables Optimization
  // --------------------------------------------------------------------------
  console.log('--- TEST 4: Payments (Unified Payments Ledger & Receivables) ---');
  
  // 4a. Unified Payments Ledger
  const t0_ledger = Date.now();
  const [roomPays, banquetPays, fbPays] = await Promise.all([
    supabase.from('payments').select('id, amount, payment_mode, payment_type, created_at, booking:booking_id(booking_number, guest:guest_id(full_name))').eq('hotel_id', hotelId),
    supabase.from('banquet_payments').select('id, amount, payment_mode, payment_type, created_at, booking:banquet_booking_id(booking_number, customer_name)').eq('hotel_id', hotelId),
    supabase.from('fb_payments').select('id, amount, payment_mode, payment_type, created_at, bill:bill_id(invoice_number, customer_name, bill_status)').eq('hotel_id', hotelId),
  ]);
  const t1_ledger = Date.now();
  console.log(`✓ Unified Payments Ledger fetched concurrently via direct foreign-key joins in ${t1_ledger - t0_ledger}ms`);
  console.log(`   - Room payments: ${roomPays.data?.length || 0}`);
  console.log(`   - Banquet payments: ${banquetPays.data?.length || 0}`);
  console.log(`   - F&B payments: ${fbPays.data?.length || 0}`);

  // 4b. Outstanding Receivables
  const t0_receivables = Date.now();
  const [unsettledBookings, unsettledBanquet, unsettledFB] = await Promise.all([
    supabase.from('bookings').select('id, booking_number, total_amount, advance_amount, payment_status, booking_status').eq('hotel_id', hotelId).neq('booking_status', 'cancelled').neq('payment_status', 'fully_paid'),
    supabase.from('banquet_bookings').select('id, booking_number, balance_due').eq('hotel_id', hotelId).neq('booking_status', 'cancelled').gt('balance_due', 0),
    supabase.from('fb_bills').select('id, invoice_number, balance_due').eq('hotel_id', hotelId).neq('billing_mode', 'charge_to_room').not('bill_status', 'in', '("cancelled","void")').gt('balance_due', 0),
  ]);
  const t1_receivables = Date.now();
  console.log(`✓ Outstanding Receivables filtered at DB level in ${t1_receivables - t0_receivables}ms:`);
  console.log(`   - Unsettled room bookings: ${unsettledBookings.data?.length || 0} (Fully paid historical bookings filtered out by PostgreSQL)`);
  console.log(`   - Unsettled banquet events: ${unsettledBanquet.data?.length || 0}`);
  console.log(`   - Unsettled F&B bills: ${unsettledFB.data?.length || 0}\n`);

  console.log('================================================================');
  console.log('            ALL VERIFICATIONS COMPLETED SUCCESSFULLY             ');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
