#!/usr/bin/env node
/**
 * Non-Food Supplies, Reusable Hotel Assets & Blanket Damage Tracking Verification Suite
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

async function runAssetInventoryTests() {
  console.log('========================================================================');
  console.log('  REUSABLE ASSETS & BLANKET DAMAGE TRACKING VERIFICATION SUITE');
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

  // --- TEST 1: Database Context & Staff Roles ---
  console.log('--- TEST 1: Database Context & Hotel Staff Roles ---');
  const { data: hotel } = await admin.from('hotels').select('*').limit(1).single();
  assert(Boolean(hotel), `Resolved Hotel: ${hotel?.name} (${hotel?.id})`);

  const { data: staffList } = await admin.from('staff').select('id, email, role, is_active').eq('hotel_id', hotel.id);
  const owner = staffList?.find((s) => s.role === 'owner');
  const manager = staffList?.find((s) => s.role === 'manager');
  const housekeeping = staffList?.find((s) => s.role === 'housekeeping');
  const reception = staffList?.find((s) => s.role === 'reception');

  assert(Boolean(owner), `Owner account: ${owner?.email}`);
  assert(Boolean(manager), `Manager account: ${manager?.email}`);
  assert(Boolean(housekeeping), `Housekeeping account: ${housekeeping?.email}`);
  assert(Boolean(reception), `Reception account: ${reception?.email}`);

  // --- TEST 2: Multi-Type Inventory Classification Coverage ---
  console.log('\n--- TEST 2: Multi-Classification Inventory Types ---');
  const sampleItems = [
    // 1. Linen & Reusable Asset: Heavy Woollen Blankets
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Heavy Woollen Winter Blankets (King)',
      category: 'Linen & Bedding',
      unit: 'piece',
      item_type: 'reusable_asset',
      inventory_type: 'linen',
      current_stock: 39.00, // Available in store
      in_use_stock: 3.00, // In rooms
      damaged_stock: 2.00, // Damaged
      repair_stock: 1.00, // In laundry / repair
      lost_stock: 0.00,
      retired_stock: 0.00,
      minimum_stock: 10.00,
      target_stock: 45.00, // Required par
      cost_per_unit: 1250.00,
      replacement_target_year: 2027,
      is_active: true,
    },
    // 2. Room Supplies
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Ayurvedic Herbal Soap Bars (35g)',
      category: 'Guest Toiletries',
      unit: 'piece',
      item_type: 'consumable',
      inventory_type: 'room_supplies',
      current_stock: 120.00,
      minimum_stock: 50.00,
      target_stock: 250.00,
      cost_per_unit: 18.00,
      is_active: true,
    },
    // 3. Housekeeping Supplies
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Floor Disinfectant Cleaning Liquid',
      category: 'Housekeeping Supplies',
      unit: 'litre',
      item_type: 'consumable',
      inventory_type: 'housekeeping_supplies',
      current_stock: 25.00,
      minimum_stock: 10.00,
      target_stock: 50.00,
      cost_per_unit: 120.00,
      is_active: true,
    },
    // 4. Hotel Asset
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Electric Cordless Kettles (1.5L)',
      category: 'Room Appliances',
      unit: 'piece',
      item_type: 'reusable_asset',
      inventory_type: 'hotel_assets',
      current_stock: 8.00,
      in_use_stock: 16.00,
      damaged_stock: 1.00,
      repair_stock: 1.00,
      lost_stock: 0.00,
      retired_stock: 0.00,
      minimum_stock: 4.00,
      target_stock: 26.00,
      cost_per_unit: 1100.00,
      replacement_target_year: 2027,
      is_active: true,
    },
    // 5. Food / Kitchen
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Basmati Rice',
      category: 'Grains & Cereals',
      unit: 'kg',
      item_type: 'consumable',
      inventory_type: 'food_kitchen',
      current_stock: 18.00,
      minimum_stock: 20.00,
      target_stock: 50.00,
      cost_per_unit: 95.00,
      is_active: true,
    },
  ];

  const { error: saveItemsErr } = await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, inventory_items: sampleItems, inventory_transactions: [] } })
    .eq('id', hotel.id);

  assert(!saveItemsErr, `Saved ${sampleItems.length} multi-classification inventory items in Supabase`);

  // --- TEST 3: Blanket Asset Initial State & Par Shortfall ---
  console.log('\n--- TEST 3: Blanket Asset Lifecycle States & Par Verification ---');
  const blanket = sampleItems.find((i) => i.name.includes('Blanket'));
  assert(Boolean(blanket), 'Found Blanket asset in inventory');

  const totalBlankets = blanket.current_stock + blanket.in_use_stock + blanket.damaged_stock + blanket.repair_stock + blanket.lost_stock;
  assert(totalBlankets === 45, `Total Blankets accounted for: ${totalBlankets} (39 avail + 3 in use + 2 damaged + 1 repair = 45)`);

  const usableBlankets = blanket.current_stock + blanket.in_use_stock + blanket.repair_stock; // 39 + 3 + 1 = 43
  const replacementNeeded = Math.max(0, blanket.target_stock - usableBlankets); // 45 - 43 = 2
  assert(usableBlankets === 43, `Usable Blankets: ${usableBlankets} (Available 39 + In Use 3 + Under Repair 1)`);
  assert(replacementNeeded === 2, `Replacement Needed: ${replacementNeeded} (Target 45 - Usable 43 = 2)`);

  // --- TEST 4: Damage Recording (+ Report Damage for Blankets in Room 805) ---
  console.log('\n--- TEST 4: Damage Reporting (+ Report Damage in Room 805) ---');
  const damageQty = 2.00;
  const initialDamaged = blanket.damaged_stock; // 2
  const initialAvailable = blanket.current_stock; // 39

  const damageTx = {
    id: crypto.randomUUID(),
    hotel_id: hotel.id,
    item_id: blanket.id,
    item_name: blanket.name,
    item_category: blanket.category,
    item_type: 'reusable_asset',
    inventory_type: 'linen',
    transaction_type: 'damaged',
    quantity: damageQty,
    unit: blanket.unit,
    unit_price: blanket.cost_per_unit,
    total_cost: damageQty * blanket.cost_per_unit, // 2 * 1250 = 2500
    reason: 'Stained / Cigarette Burn',
    condition_state: 'Heavy Damage (Requires Stitching/Patch)',
    room_number: 'Room 805',
    notes: 'Found in Room 805 during checkout inspection',
    recorded_by: housekeeping.id,
    recorder_name: housekeeping.email,
    transaction_date: '2026-08-20',
    created_at: new Date().toISOString(),
  };

  const updatedBlanket = {
    ...blanket,
    current_stock: initialAvailable - damageQty, // 37
    damaged_stock: initialDamaged + damageQty, // 4
  };

  const updatedItemsAfterDamage = sampleItems.map((i) => (i.id === blanket.id ? updatedBlanket : i));

  await admin
    .from('hotels')
    .update({
      settings: {
        ...hotel.settings,
        inventory_items: updatedItemsAfterDamage,
        inventory_transactions: [damageTx],
      },
    })
    .eq('id', hotel.id);

  // Reload and verify from DB
  const { data: hotelAfterDamage } = await admin.from('hotels').select('settings').eq('id', hotel.id).single();
  const reloadedBlanket = hotelAfterDamage?.settings?.inventory_items?.find((i) => i.id === blanket.id);

  assert(
    Number(reloadedBlanket?.damaged_stock) === 4,
    `Damaged stock increased: ${initialDamaged} + ${damageQty} = ${reloadedBlanket?.damaged_stock}`
  );
  assert(
    Number(reloadedBlanket?.current_stock) === 37,
    `Available stock adjusted: ${initialAvailable} - ${damageQty} = ${reloadedBlanket?.current_stock}`
  );

  // --- TEST 5: Annual Replacement Planning Calculations for Next Fiscal Year ---
  console.log('\n--- TEST 5: Annual Replacement Planning (Target Year 2027) ---');
  const currentUsable = Number(reloadedBlanket.current_stock) + Number(reloadedBlanket.in_use_stock) + Number(reloadedBlanket.repair_stock);
  const currentRequired = Number(reloadedBlanket.target_stock);
  const plannedReplacement = Math.max(0, currentRequired - currentUsable);
  const estProcurementCost = plannedReplacement * Number(reloadedBlanket.cost_per_unit);

  assert(currentUsable === 41, `Usable Stock: ${currentUsable} blankets`);
  assert(Number(reloadedBlanket.damaged_stock) === 4, `Damaged Stock: ${reloadedBlanket.damaged_stock} blankets`);
  assert(currentRequired === 45, `Required Par Stock: ${currentRequired} blankets`);
  assert(plannedReplacement === 4, `Annual Replacement Required: ${plannedReplacement} blankets`);
  assert(estProcurementCost === 5000, `Recommended Budget for FY 2027: ₹${estProcurementCost} (4 × ₹1,250)`);

  // --- TEST 6: Audit History & Room Reference Integrity ---
  console.log('\n--- TEST 6: Audit Movement History with Room Reference ---');
  const storedTx = hotelAfterDamage?.settings?.inventory_transactions || [];
  assert(storedTx.length === 1, `Audit ledger contains ${storedTx.length} record`);

  const dRecord = storedTx[0];
  assert(dRecord.transaction_type === 'damaged', 'Transaction type is "damaged"');
  assert(dRecord.room_number === 'Room 805', `Damage linked to "${dRecord.room_number}"`);
  assert(dRecord.reason === 'Stained / Cigarette Burn', `Damage reason: "${dRecord.reason}"`);
  assert(dRecord.condition_state.includes('Heavy Damage'), `Condition: "${dRecord.condition_state}"`);

  // --- TEST 7: Role Authorization Verification ---
  console.log('\n--- TEST 7: Role Authorization Architecture ---');
  const sessionContent = fs.readFileSync(path.resolve(process.cwd(), 'lib/auth/session.ts'), 'utf8');

  const ownerHasAccess = sessionContent.includes("owner: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory'");
  const managerHasAccess = sessionContent.includes("manager: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory'");
  const hkHasAccess = sessionContent.includes("housekeeping: ['/dashboard', '/rooms', '/inventory'");
  const receptionHasAccess = sessionContent.includes("reception: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory'");

  assert(ownerHasAccess, 'Owner has full access to /inventory');
  assert(managerHasAccess, 'Manager has full operational access to /inventory');
  assert(hkHasAccess, 'Housekeeping has damage reporting access to /inventory');
  assert(!receptionHasAccess, 'Reception is BLOCKED from modifying inventory');

  // Summary
  console.log('\n========================================================================');
  console.log(`  ASSET & BLANKET INVENTORY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runAssetInventoryTests();
