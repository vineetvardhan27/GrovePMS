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

async function runTests() {
  console.log('--- Starting Payments & Collections F&B Integration Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Fetch data from Supabase
  const { data: hotel } = await supabase.from('hotels').select('id, settings').maybeSingle();
  const hotelId = hotel.id;
  const fbBills = hotel?.settings?.fb_bills || [];
  const banquetBookings = hotel?.settings?.banquet_bookings || [];
  const banquetPayments = hotel?.settings?.banquet_payments || [];

  const { data: roomPayments } = await supabase
    .from('payments')
    .select('id, amount, payment_mode, payment_type, created_at, booking_id');

  // Verify F&B bills exist
  assert(fbBills.length > 0, `F&B bills present in system (found ${fbBills.length})`);

  // Calculate direct F&B collected payments
  const fnbCollectedPayments = [];
  for (const b of fbBills) {
    if (b.bill_status === 'void' || b.bill_status === 'cancelled') continue;
    for (const p of b.payments || []) {
      if (Number(p.amount) > 0) {
        fnbCollectedPayments.push({
          bill_id: b.id,
          bill_number: b.bill_number,
          amount: Number(p.amount),
          mode: p.payment_mode,
          created_at: p.created_at,
          customer_name: b.customer_name,
        });
      }
    }
  }

  assert(fnbCollectedPayments.length > 0, `F&B direct payments found: ${fnbCollectedPayments.length}`);
  const totalFnbCollected = fnbCollectedPayments.reduce((s, p) => s + p.amount, 0);
  console.log(`F&B Direct Collections: ₹${totalFnbCollected.toFixed(2)} across ${fnbCollectedPayments.length} txns`);

  // Calculate room collections
  const totalRoomCollected = (roomPayments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  console.log(`Room Collections: ₹${totalRoomCollected.toFixed(2)} across ${roomPayments.length} txns`);

  // Calculate banquet collections
  const totalBanquetCollected = (banquetPayments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  console.log(`Banquet Collections: ₹${totalBanquetCollected.toFixed(2)} across ${banquetPayments.length} txns`);

  // Unified Total Collected
  const grandTotalCollected = totalRoomCollected + totalBanquetCollected + totalFnbCollected;
  console.log(`Grand Total Collected: ₹${grandTotalCollected.toFixed(2)} (${roomPayments.length + banquetPayments.length + fnbCollectedPayments.length} total txns)`);

  assert(grandTotalCollected > (totalRoomCollected + totalBanquetCollected), 'Grand total includes F&B collections');
  assert(Math.abs(grandTotalCollected - 133724.8) < 0.01, `Grand total matches expected ₹1,33,724.80 (got ${grandTotalCollected})`);

  // Verify Business Area Breakdown
  const fnbShare = (totalFnbCollected / grandTotalCollected) * 100;
  assert(fnbShare > 0, `F&B share is greater than 0% (got ${fnbShare.toFixed(2)}%)`);

  // Verify Payment Mode Breakdown includes F&B Cash
  const cashPayments = [...(roomPayments || []).filter(p => p.payment_mode === 'cash'), ...banquetPayments.filter(p => p.payment_mode === 'cash'), ...fnbCollectedPayments.filter(p => p.mode === 'cash')];
  const cashTotal = cashPayments.reduce((s, p) => s + p.amount, 0);
  assert(cashTotal === 81712.8, `Cash total correctly includes F&B cash ₹492.80 (expected ₹81,712.80, got ₹${cashTotal})`);

  // Verify Room-charged bills are not treated as direct duplicate cash-flow collections
  const roomChargedBills = fbBills.filter(b => b.billing_mode === 'charge_to_room');
  assert(roomChargedBills.length > 0, `Room-charged F&B bills identified: ${roomChargedBills.length}`);
  const roomChargedDirectPayments = roomChargedBills.flatMap(b => b.payments || []);
  assert(roomChargedDirectPayments.length === 0, 'Room-charged F&B bills have 0 direct payments (paid via room folio)');

  console.log(`\n--- Test Summary: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) process.exit(1);
}

runTests();
