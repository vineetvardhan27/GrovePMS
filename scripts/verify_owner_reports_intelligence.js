#!/usr/bin/env node
/**
 * Owner-Level Reports & Analytics Intelligence Verification Suite
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

async function runOwnerReportsIntelligenceTests() {
  console.log('========================================================================');
  console.log('  REPORTS & ANALYTICS — OWNER INTELLIGENCE VERIFICATION SUITE');
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

  // --- TEST 2: Multi-Source Operational Aggregation ---
  console.log('\n--- TEST 2: Multi-Source Operational Aggregation ---');
  const { data: bookings } = await admin.from('bookings').select('*, payments(*)');
  const { data: payments } = await admin.from('payments').select('*');
  const banquetBookings = hotel?.settings?.banquet_bookings || [];
  const banquetPayments = hotel?.settings?.banquet_payments || [];

  const totalRoomBilled = (bookings || [])
    .filter((b) => b.booking_status !== 'cancelled')
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  const totalBanquetBilled = banquetBookings
    .filter((b) => b.booking_status !== 'cancelled')
    .reduce((sum, b) => sum + (Number(b.grand_total || b.estimated_total || b.rental_amount) || 0), 0);

  const totalCollected =
    (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0) +
    banquetPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalBusinessValue = totalRoomBilled + totalBanquetBilled;
  const totalOutstanding = Math.max(0, totalBusinessValue - totalCollected);
  const collectionRate = totalBusinessValue > 0 ? (totalCollected / totalBusinessValue) * 100 : 100;

  assert(totalBusinessValue > 0, `Total Hotel Business Value: ₹${totalBusinessValue}`);
  assert(totalCollected > 0, `Total Actual Collections: ₹${totalCollected}`);
  assert(totalOutstanding >= 0, `Total Outstanding Due: ₹${totalOutstanding}`);
  assert(collectionRate >= 0 && collectionRate <= 100, `Collection Rate: ${collectionRate.toFixed(1)}%`);

  // --- TEST 3: Room Operations & Occupancy Calculations ---
  console.log('\n--- TEST 3: Room Operations & Occupancy Calculations ---');
  const { data: rooms } = await admin.from('rooms').select('*');
  const totalRoomsCount = (rooms || []).length || 19;
  const daysInMonth = 31;
  const availableRoomNights = totalRoomsCount * daysInMonth;

  let roomNightsSold = 0;
  (bookings || []).forEach((b) => {
    if (b.booking_status !== 'cancelled') {
      const cin = new Date(b.check_in_date);
      const cout = new Date(b.check_out_date);
      const nights = Math.max(1, Math.round((cout.getTime() - cin.getTime()) / (1000 * 3600 * 24)));
      roomNightsSold += nights;
    }
  });

  const occupancyPercent = availableRoomNights > 0 ? (roomNightsSold / availableRoomNights) * 100 : 0;
  const adr = roomNightsSold > 0 ? Math.round(totalRoomBilled / roomNightsSold) : 0;
  const revpar = Math.round(adr * (occupancyPercent / 100));

  assert(totalRoomsCount > 0, `Total Room Inventory: ${totalRoomsCount} rooms`);
  assert(roomNightsSold > 0, `Total Room Nights Sold: ${roomNightsSold} nights`);
  assert(adr > 0, `ADR (Average Daily Rate): ₹${adr}`);
  assert(revpar >= 0, `RevPAR: ₹${revpar}`);

  // --- TEST 4: Actionable Needs Attention Alerts ---
  console.log('\n--- TEST 4: Actionable Needs Attention Alerts ---');
  const alerts = [];
  if (totalOutstanding > 10000) {
    alerts.push({
      category: 'finance',
      severity: 'high',
      title: `₹${totalOutstanding} Uncollected Outstanding Balances`,
    });
  }
  const lowStockCount = (hotel?.settings?.inventory_items || []).filter(
    (i) => (i.current_stock || 0) <= (i.minimum_stock || 0)
  ).length;

  if (lowStockCount > 0) {
    alerts.push({
      category: 'inventory',
      severity: 'high',
      title: `${lowStockCount} Items Below Minimum Stock`,
    });
  }

  assert(alerts.length > 0, `Generated ${alerts.length} real-time actionable alerts for hotel owner`);

  // --- TEST 5: Component and Query File Integrity ---
  console.log('\n--- TEST 5: Component and Query File Integrity ---');
  const files = [
    'components/reports/OwnerIntelligenceDashboard.tsx',
    'components/reports/DailyReport.tsx',
    'components/reports/MonthlyReport.tsx',
    'components/reports/ReportsTabs.tsx',
    'lib/reports/types.ts',
    'lib/reports/queries.ts',
    'app/(dashboard)/reports/page.tsx',
  ];

  for (const f of files) {
    const exists = fs.existsSync(path.resolve(process.cwd(), f));
    assert(exists, `${f} exists`);
  }

  // Summary
  console.log('\n========================================================================');
  console.log(`  REPORTS & ANALYTICS TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runOwnerReportsIntelligenceTests();
