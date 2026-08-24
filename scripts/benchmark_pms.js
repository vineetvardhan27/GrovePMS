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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runBenchmark() {
  console.log('====================================================');
  console.log('⚡ Hotel PMS Performance & Latency Benchmark Suite ⚡');
  console.log('====================================================');

  // Warmup connection
  await supabase.from('hotels').select('id').limit(1);

  const benchmarks = [];

  async function measure(name, fn) {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    benchmarks.push({ name, duration: Math.round(duration * 10) / 10 });
    console.log(`⏱️  ${name.padEnd(42)}: ${duration.toFixed(1)}ms`);
    return result;
  }

  // 1. Dashboard active bookings and status queries
  await measure('1. Dashboard Active Bookings & KPIs', async () => {
    const today = new Date().toISOString().split('T')[0];
    const [rooms, bookings, payments] = await Promise.all([
      supabase.from('rooms').select('status, housekeeping_status'),
      supabase.from('bookings').select('id, total_amount, advance_amount, booking_status, check_in_date, check_out_date').in('booking_status', ['confirmed', 'checked_in']),
      supabase.from('payments').select('amount, payment_mode').gte('created_at', `${today}T00:00:00.000Z`),
    ]);
    return { rooms: rooms.data?.length, bookings: bookings.data?.length, payments: payments.data?.length };
  });

  // 2. Room chart & category queries
  await measure('2. Rooms & Categories (Room Chart)', async () => {
    const [rooms, cats] = await Promise.all([
      supabase.from('rooms').select('*, category:category_id(*)').order('floor'),
      supabase.from('room_categories').select('*').order('base_rate'),
    ]);
    return { rooms: rooms.data?.length, cats: cats.data?.length };
  });

  // 3. Guest Directory & Revenue lookups
  await measure('3. Guest Directory List & Revenue Aggregation', async () => {
    const [guests, bookings, hotel] = await Promise.all([
      supabase.from('guests').select('*').order('full_name'),
      supabase.from('bookings').select('id, guest_id, total_amount, booking_status'),
      supabase.from('hotels').select('settings').maybeSingle(),
    ]);
    return { guests: guests.data?.length, bookings: bookings.data?.length };
  });

  // 4. Payments Unified Ledger & Receivables
  await measure('4. Payments Unified Ledger (Rooms + BNQ + FB)', async () => {
    const [payments, hotel] = await Promise.all([
      supabase.from('payments').select('id, amount, payment_mode, booking_id, created_at').order('created_at', { ascending: false }),
      supabase.from('hotels').select('settings').maybeSingle(),
    ]);
    return { payments: payments.data?.length };
  });

  // 5. Banquet Bookings, Batched Charges & Payments
  await measure('5. Banquet Bookings & Batched Folios', async () => {
    const [hall, bookings, charges, payments] = await Promise.all([
      supabase.from('banquet_halls').select('*').maybeSingle(),
      supabase.from('banquet_bookings').select('*').order('event_date'),
      supabase.from('banquet_charges').select('*'),
      supabase.from('banquet_payments').select('*'),
    ]);
    return { bookings: bookings.data?.length, charges: charges.data?.length, payments: payments.data?.length };
  });

  // 6. Food & Beverage Live Overview & Kitchen Display
  await measure('6. Food & Beverage Live Overview & Active KOT', async () => {
    const [hotel, activeBookings] = await Promise.all([
      supabase.from('hotels').select('settings').maybeSingle(),
      supabase.from('bookings').select('id, booking_number, guest:guest_id(full_name), room:room_id(room_number)').in('booking_status', ['confirmed', 'checked_in']),
    ]);
    return { activeBookings: activeBookings.data?.length };
  });

  // 7. Inventory Items, Transactions & Valuation
  await measure('7. Inventory Items & Transactions Ledger', async () => {
    const [items, transactions] = await Promise.all([
      supabase.from('inventory_items').select('*'),
      supabase.from('inventory_transactions').select('*').order('transaction_date', { ascending: false }).limit(200),
    ]);
    return { items: items.data?.length, transactions: transactions.data?.length };
  });

  console.log('====================================================');
  const avg = benchmarks.reduce((s, b) => s + b.duration, 0) / benchmarks.length;
  console.log(`🚀 Average Execution Time: ${avg.toFixed(1)}ms across all core modules`);
  console.log(`🎯 Target (< 300ms) Status: ${avg < 300 ? '✅ ACHIEVED' : '⚠️ WARNING'}`);
  console.log('====================================================');
}

runBenchmark();
