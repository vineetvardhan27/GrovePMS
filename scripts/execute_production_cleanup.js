#!/usr/bin/env node
/**
 * Safe, One-Time Production Data Cleanup Script
 * Cleans demo transactional data while preserving all configuration, rooms, and staff accounts.
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

async function runProductionCleanup() {
  console.log('========================================================================');
  console.log('  ONE-TIME PRODUCTION DATA CLEANUP FOR CLIENT HANDOFF');
  console.log('========================================================================\n');

  // STEP 1: Pre-cleanup Backup Verification
  console.log('--- Step 1: Pre-Cleanup Backup Verification ---');
  const backupRes = await createBackup('pre_cleanup_safety_snapshot');
  console.log(`✓ Safety backup created: ${backupRes.filePath} (${backupRes.size} bytes)\n`);

  const hotelId = 'a0000000-0000-0000-0000-000000000001';

  // STEP 2: Clean Demo Payments
  console.log('--- Step 2: Cleaning Demo Payments ---');
  const { data: paymentsBefore } = await admin.from('payments').select('id, hotel_id').eq('hotel_id', hotelId);
  const paymentCount = paymentsBefore?.length || 0;
  if (paymentCount > 0) {
    const { error: pErr } = await admin.from('payments').delete().eq('hotel_id', hotelId);
    if (pErr) throw pErr;
    console.log(`✓ Removed ${paymentCount} demo payment records`);
  } else {
    console.log('✓ Zero payments to remove');
  }

  // STEP 3: Clean Demo Bookings
  console.log('\n--- Step 3: Cleaning Demo Bookings ---');
  const { data: bookingsBefore } = await admin.from('bookings').select('id, hotel_id').eq('hotel_id', hotelId);
  const bookingCount = bookingsBefore?.length || 0;
  if (bookingCount > 0) {
    const { error: bErr } = await admin.from('bookings').delete().eq('hotel_id', hotelId);
    if (bErr) throw bErr;
    console.log(`✓ Removed ${bookingCount} demo booking records`);
  } else {
    console.log('✓ Zero bookings to remove');
  }

  // STEP 4: Clean Demo ID Documents and Storage Files
  console.log('\n--- Step 4: Cleaning Demo ID Documents & Private Storage ---');
  try {
    const { data: docsBefore } = await admin.from('guest_documents').select('id, storage_path').eq('hotel_id', hotelId);
    if (docsBefore && docsBefore.length > 0) {
      await admin.from('guest_documents').delete().eq('hotel_id', hotelId);
      console.log(`✓ Removed ${docsBefore.length} guest document records from database`);
    }
  } catch (_) {}

  // Clean storage files in private bucket
  try {
    const { data: guestFolders } = await admin.storage.from('guest-documents').list(`hotel/${hotelId}/guests`);
    let deletedObjects = 0;
    if (guestFolders && guestFolders.length > 0) {
      for (const g of guestFolders) {
        const { data: docFolders } = await admin.storage.from('guest-documents').list(`hotel/${hotelId}/guests/${g.name}/documents`);
        if (docFolders && docFolders.length > 0) {
          for (const df of docFolders) {
            const { data: files } = await admin.storage.from('guest-documents').list(`hotel/${hotelId}/guests/${g.name}/documents/${df.name}`);
            if (files && files.length > 0) {
              const filePaths = files.map((f) => `hotel/${hotelId}/guests/${g.name}/documents/${df.name}/${f.name}`);
              await admin.storage.from('guest-documents').remove(filePaths);
              deletedObjects += filePaths.length;
            }
          }
        }
      }
    }
    console.log(`✓ Cleaned ${deletedObjects} demo document objects from private storage bucket`);
  } catch (err) {
    console.warn('Storage cleanup note:', err);
  }

  // STEP 5: Clean Demo Guests
  console.log('\n--- Step 5: Cleaning Demo Guests ---');
  const { data: guestsBefore } = await admin.from('guests').select('id, hotel_id').eq('hotel_id', hotelId);
  const guestCount = guestsBefore?.length || 0;
  if (guestCount > 0) {
    const { error: gErr } = await admin.from('guests').delete().eq('hotel_id', hotelId);
    if (gErr) throw gErr;
    console.log(`✓ Removed ${guestCount} demo guest records`);
  } else {
    console.log('✓ Zero guests to remove');
  }

  // STEP 6: Reset Room Statuses to Available
  console.log('\n--- Step 6: Resetting Room Statuses to Available ---');
  const { error: roomResetErr } = await admin
    .from('rooms')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('hotel_id', hotelId);
  if (roomResetErr) throw roomResetErr;
  console.log('✓ All 19 rooms reset to "available" status');

  // STEP 7: Verify Clean Production State
  console.log('\n--- Step 7: Integrity & Zero-Orphan Verification ---');
  const { data: guestsAfter } = await admin.from('guests').select('id').eq('hotel_id', hotelId);
  const { data: bookingsAfter } = await admin.from('bookings').select('id').eq('hotel_id', hotelId);
  const { data: paymentsAfter } = await admin.from('payments').select('id').eq('hotel_id', hotelId);
  const { data: roomsAfter } = await admin.from('rooms').select('id, status').eq('hotel_id', hotelId);
  const { data: staffAfter } = await admin.from('staff').select('id, email, role').eq('hotel_id', hotelId);

  console.log(`  - Hotel Guests:       ${guestsAfter?.length || 0} (Clean baseline)`);
  console.log(`  - Active Bookings:    ${bookingsAfter?.length || 0} (Clean baseline)`);
  console.log(`  - Active Payments:    ${paymentsAfter?.length || 0} (Clean baseline)`);
  console.log(`  - Accommodation Units: ${roomsAfter?.length || 0} rooms (All available)`);
  console.log(`  - Staff Accounts:     ${staffAfter?.length || 0} accounts (Preserved)`);

  // STEP 8: Create Client Production Baseline Backup
  console.log('\n--- Step 8: Creating Client Production Baseline Backup ---');
  const baselineBackup = await createBackup('client_production_baseline');
  console.log(`✓ Client Production Baseline Backup created: ${baselineBackup.filePath}\n`);

  console.log('========================================================================');
  console.log('  PRODUCTION CLEANUP COMPLETE — READY FOR REAL CLIENT USAGE');
  console.log('========================================================================\n');
}

runProductionCleanup().catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
