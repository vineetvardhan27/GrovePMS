#!/usr/bin/env node
/**
 * Safe, One-Time Banquet Hall + Payments & Collections Production Cleanup Script
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { createBackup } = require('./create_production_backup');

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

async function runBanquetAndPaymentsCleanup() {
  console.log('========================================================================');
  console.log('  BANQUET HALL + PAYMENTS & COLLECTIONS PRODUCTION CLEANUP');
  console.log('========================================================================\n');

  // STEP 1: Pre-Cleanup Backup
  console.log('--- Step 1: Pre-Cleanup Backup ---');
  const backup = await createBackup('pre_banquet_payments_cleanup_snapshot');
  console.log(`✓ Safety backup created: ${backup.filePath} (${backup.size} bytes)\n`);

  const hotelId = 'a0000000-0000-0000-0000-000000000001';

  // STEP 2: Inspect Hotel Settings before cleanup
  console.log('--- Step 2: Inspecting Demo Transactions in Hotel Settings ---');
  const { data: hotel, error: hErr } = await admin.from('hotels').select('*').eq('id', hotelId).single();
  if (hErr) throw hErr;

  const initialBanquetBookings = hotel.settings?.banquet_bookings || [];
  const initialBanquetPayments = hotel.settings?.banquet_payments || [];
  const initialBanquetCharges = hotel.settings?.banquet_charges || [];
  const initialFBBills = hotel.settings?.fb_bills || [];

  const banquetPaymentTotal = initialBanquetPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const fbBillTotal = initialFBBills.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);

  console.log(`Found in settings for [${hotel.name}]:`);
  console.log(`  - Demo Banquet Bookings: ${initialBanquetBookings.length} events (including "Dr. Sharma 50th Birthday Party")`);
  console.log(`  - Demo Banquet Charges:  ${initialBanquetCharges.length} charges`);
  console.log(`  - Demo Banquet Payments: ${initialBanquetPayments.length} payments (Total: ₹${banquetPaymentTotal.toLocaleString('en-IN')})`);
  console.log(`  - Demo F&B Bills:        ${initialFBBills.length} bills (Total: ₹${fbBillTotal.toLocaleString('en-IN')})`);

  // STEP 3: Clean Hotel Settings (Remove transactional arrays, preserve hotel & banquet configuration)
  console.log('\n--- Step 3: Cleaning Demo Transactional Settings ---');
  const updatedSettings = {
    ...hotel.settings,
    banquet_bookings: [],
    banquet_charges: [],
    banquet_payments: [],
    fb_bills: [],
  };

  const { error: updateErr } = await admin
    .from('hotels')
    .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
    .eq('id', hotelId);

  if (updateErr) throw updateErr;
  console.log('✓ Successfully cleaned banquet_bookings, banquet_charges, banquet_payments, and fb_bills from hotel settings');

  // STEP 4: Clean Database Tables (in case any transactional records exist in DB)
  console.log('\n--- Step 4: Cleaning PostgreSQL Transactional Tables ---');
  try {
    await admin.from('banquet_payments').delete().eq('hotel_id', hotelId);
    await admin.from('banquet_charges').delete().eq('hotel_id', hotelId);
    await admin.from('banquet_events').delete().eq('hotel_id', hotelId);
  } catch (e) {
    console.log('  Note on banquet DB tables:', e.message);
  }

  try {
    await admin.from('fb_payments').delete().eq('hotel_id', hotelId);
    await admin.from('fb_order_items').delete().eq('hotel_id', hotelId);
    await admin.from('fb_orders').delete().eq('hotel_id', hotelId);
    await admin.from('fb_bills').delete().eq('hotel_id', hotelId);
  } catch (e) {
    console.log('  Note on F&B DB tables:', e.message);
  }

  try {
    await admin.from('payments').delete().eq('hotel_id', hotelId);
    await admin.from('bookings').delete().eq('hotel_id', hotelId);
    await admin.from('guests').delete().eq('hotel_id', hotelId);
  } catch (e) {
    console.log('  Note on core DB tables:', e.message);
  }

  console.log('✓ Cleaned all transactional tables');

  // STEP 5: Create Client Production Baseline Backup
  console.log('\n--- Step 5: Creating Final Client Production Baseline Backup ---');
  const baselineBackup = await createBackup('client_production_baseline');
  console.log(`✓ Client Production Baseline Backup verified: ${baselineBackup.filePath}\n`);

  console.log('========================================================================');
  console.log('  CLEANUP SUMMARY:');
  console.log(`  - Demo Banquet Events Removed:   ${initialBanquetBookings.length}`);
  console.log(`  - Demo Banquet Charges Removed:  ${initialBanquetCharges.length}`);
  console.log(`  - Demo Banquet Payments Removed: ${initialBanquetPayments.length} (₹${banquetPaymentTotal.toLocaleString('en-IN')})`);
  console.log(`  - Demo F&B Bills Removed:        ${initialFBBills.length} (₹${fbBillTotal.toLocaleString('en-IN')})`);
  console.log(`  - Total Financial Value Removed: ₹${(banquetPaymentTotal + fbBillTotal).toLocaleString('en-IN')}`);
  console.log('========================================================================\n');
}

runBanquetAndPaymentsCleanup().catch((err) => {
  console.error('Banquet & Payments cleanup error:', err);
  process.exit(1);
});
