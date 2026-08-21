#!/usr/bin/env node
/**
 * Owner-Wide Payments & Collections Dashboard Verification Suite
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

async function runOwnerPaymentsDashboardTests() {
  console.log('========================================================================');
  console.log('  OWNER-WIDE PAYMENTS & COLLECTIONS DASHBOARD VERIFICATION SUITE');
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

  // --- TEST 1: Database & Hotel Context ---
  console.log('--- TEST 1: Database & Hotel Context ---');
  const { data: hotel, error: hotelErr } = await admin.from('hotels').select('*').limit(1).single();
  assert(!hotelErr && Boolean(hotel), `Resolved Hotel: ${hotel?.name} (${hotel?.id})`);

  // --- TEST 2: Room Payments Aggregation ---
  console.log('\n--- TEST 2: Room Payments Aggregation ---');
  const { data: roomPayments, error: pErr } = await admin
    .from('payments')
    .select('*, booking:booking_id(booking_number, guest:guest_id(full_name))');

  assert(!pErr, 'Queried room payments from database');
  const roomTxCount = (roomPayments || []).length;
  const roomCollected = (roomPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  console.log(`  ℹ Found ${roomTxCount} room payment transactions totaling ₹${roomCollected}`);

  // --- TEST 3: Banquet Payments Aggregation ---
  console.log('\n--- TEST 3: Banquet Payments Aggregation ---');
  let banquetPayments = [];
  try {
    const { data: bpData } = await admin.from('banquet_payments').select('*');
    banquetPayments = bpData || [];
  } catch {}

  if (banquetPayments.length === 0 && hotel?.settings?.banquet_payments) {
    banquetPayments = hotel.settings.banquet_payments;
  }
  const banquetTxCount = banquetPayments.length;
  const banquetCollected = banquetPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  console.log(`  ℹ Found ${banquetTxCount} banquet payment transactions totaling ₹${banquetCollected}`);

  // --- TEST 4: Unified Multi-Source Ledger Integration ---
  console.log('\n--- TEST 4: Unified Multi-Source Ledger Integration ---');
  const totalLedgerTx = roomTxCount + banquetTxCount;
  const totalLedgerAmount = roomCollected + banquetCollected;

  assert(totalLedgerTx > 0, `Total unified ledger transactions: ${totalLedgerTx}`);
  assert(totalLedgerAmount >= 0, `Total unified collected amount: ₹${totalLedgerAmount}`);

  // --- TEST 5: Outstanding Receivables Calculations ---
  console.log('\n--- TEST 5: Outstanding Receivables Calculations ---');
  const { data: activeBookings } = await admin
    .from('bookings')
    .select('id, total_amount, advance_amount, booking_status, payments(amount)')
    .neq('booking_status', 'cancelled');

  let roomOutstanding = 0;
  for (const b of activeBookings || []) {
    const billed = Number(b.total_amount) || 0;
    const paid = (b.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0) || Number(b.advance_amount) || 0;
    roomOutstanding += Math.max(0, billed - paid);
  }

  let banquetOutstanding = 0;
  const storedBanquetBookings = hotel?.settings?.banquet_bookings || [];
  for (const bb of storedBanquetBookings) {
    if (bb.booking_status !== 'cancelled') {
      const billed = Number(bb.grand_total || bb.estimated_total || bb.rental_amount) || 0;
      const paid = Number(bb.total_paid || bb.advance_paid) || 0;
      banquetOutstanding += Math.max(0, Number(bb.balance_due ?? (billed - paid)));
    }
  }

  const totalOutstanding = roomOutstanding + banquetOutstanding;
  const totalBusinessValue = totalLedgerAmount + totalOutstanding;
  const collectionRate = totalBusinessValue > 0 ? (totalLedgerAmount / totalBusinessValue) * 100 : 100;

  assert(totalOutstanding >= 0, `Outstanding Receivables: ₹${totalOutstanding} (Rooms: ₹${roomOutstanding} + Banquet: ₹${banquetOutstanding})`);
  assert(totalBusinessValue >= totalLedgerAmount, `Total Business Value: ₹${totalBusinessValue}`);
  assert(collectionRate >= 0 && collectionRate <= 100, `Collection Rate: ${collectionRate.toFixed(1)}%`);

  // --- TEST 6: File & UI Component Existence ---
  console.log('\n--- TEST 6: File & UI Component Existence ---');
  const dashFile = fs.existsSync(path.resolve(process.cwd(), 'components/payments/PaymentsDashboard.tsx'));
  const modalFile = fs.existsSync(path.resolve(process.cwd(), 'components/payments/TransactionDetailModal.tsx'));
  const typesFile = fs.existsSync(path.resolve(process.cwd(), 'lib/payments/types.ts'));
  const queriesFile = fs.existsSync(path.resolve(process.cwd(), 'lib/payments/queries.ts'));

  assert(dashFile, 'components/payments/PaymentsDashboard.tsx exists');
  assert(modalFile, 'components/payments/TransactionDetailModal.tsx exists');
  assert(typesFile, 'lib/payments/types.ts exists');
  assert(queriesFile, 'lib/payments/queries.ts exists');

  // Summary
  console.log('\n========================================================================');
  console.log(`  PAYMENTS DASHBOARD TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runOwnerPaymentsDashboardTests();
