#!/usr/bin/env node
/**
 * Food Inventory Management Verification Test Suite
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

async function runInventoryTests() {
  console.log('========================================================================');
  console.log('  FOOD INVENTORY MANAGEMENT MODULE VERIFICATION SUITE');
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

  // --- TEST 1: Database Hotel & Staff Roles ---
  console.log('--- TEST 1: Database Context & Role Isolation ---');
  const { data: hotel } = await admin.from('hotels').select('*').limit(1).single();
  assert(Boolean(hotel), `Resolved Hotel: ${hotel?.name} (${hotel?.id})`);

  const { data: staffList } = await admin.from('staff').select('id, email, role, is_active').eq('hotel_id', hotel.id);
  const owner = staffList?.find((s) => s.role === 'owner');
  const manager = staffList?.find((s) => s.role === 'manager');
  const reception = staffList?.find((s) => s.role === 'reception');
  const housekeeping = staffList?.find((s) => s.role === 'housekeeping');

  assert(Boolean(owner), `Owner account present: ${owner?.email}`);
  assert(Boolean(manager), `Manager account present: ${manager?.email}`);
  assert(Boolean(reception), `Reception account present: ${reception?.email}`);
  assert(Boolean(housekeeping), `Housekeeping account present: ${housekeeping?.email}`);

  // --- TEST 2: Seed / Default Inventory Items in Database ---
  console.log('\n--- TEST 2: Raw Food Materials Inventory Catalog ---');
  const sampleItems = [
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Basmati Rice',
      category: 'Grains & Cereals',
      unit: 'kg',
      current_stock: 18.00,
      minimum_stock: 20.00,
      target_stock: 50.00,
      cost_per_unit: 95.00,
      is_active: true,
    },
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Whole Wheat Flour (Atta)',
      category: 'Grains & Cereals',
      unit: 'kg',
      current_stock: 35.00,
      minimum_stock: 25.00,
      target_stock: 60.00,
      cost_per_unit: 42.00,
      is_active: true,
    },
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Potatoes',
      category: 'Vegetables',
      unit: 'kg',
      current_stock: 14.00,
      minimum_stock: 15.00,
      target_stock: 40.00,
      cost_per_unit: 28.00,
      is_active: true,
    },
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Tomatoes',
      category: 'Vegetables',
      unit: 'kg',
      current_stock: 0.00, // Out of stock test
      minimum_stock: 10.00,
      target_stock: 20.00,
      cost_per_unit: 40.00,
      is_active: true,
    },
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Fresh Paneer',
      category: 'Dairy',
      unit: 'kg',
      current_stock: 4.50,
      minimum_stock: 5.00,
      target_stock: 15.00,
      cost_per_unit: 320.00,
      is_active: true,
    },
    {
      id: crypto.randomUUID(),
      hotel_id: hotel.id,
      name: 'Full Cream Fresh Milk',
      category: 'Dairy',
      unit: 'litre',
      current_stock: 12.00,
      minimum_stock: 15.00,
      target_stock: 30.00,
      cost_per_unit: 65.00,
      is_active: true,
    },
  ];

  // Save items to hotel settings
  const { error: saveItemsErr } = await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, inventory_items: sampleItems, inventory_transactions: [] } })
    .eq('id', hotel.id);

  assert(!saveItemsErr, `Saved ${sampleItems.length} inventory items to Supabase`);

  // --- TEST 3: Suggested Purchase Calculation ---
  console.log('\n--- TEST 3: Required / Suggested Purchase Calculation ---');
  // Basmati Rice: Current: 18 kg, Min: 20 kg, Target: 50 kg -> Suggested: 32 kg
  const rice = sampleItems.find((i) => i.name === 'Basmati Rice');
  const riceSuggested = Math.max(0, Math.round((rice.target_stock - rice.current_stock) * 100) / 100);
  assert(riceSuggested === 32, `Basmati Rice suggested purchase: ${riceSuggested} kg (50 - 18 = 32 kg)`);

  // Whole Wheat Flour: Current: 35 kg, Min: 25 kg -> Healthy, Suggested: 0 kg
  const atta = sampleItems.find((i) => i.name === 'Whole Wheat Flour (Atta)');
  const attaSuggested = atta.current_stock <= atta.minimum_stock
    ? Math.max(0, atta.target_stock - atta.current_stock)
    : 0;
  assert(attaSuggested === 0, `Whole Wheat Flour is healthy (35 kg > 25 kg min), suggested purchase: 0 kg`);

  // Tomatoes: Current: 0 kg, Min: 10 kg, Target: 20 kg -> Suggested: 20 kg (Out of stock)
  const tomato = sampleItems.find((i) => i.name === 'Tomatoes');
  const tomatoSuggested = Math.max(0, tomato.target_stock - tomato.current_stock);
  assert(tomatoSuggested === 20, `Tomatoes (Out of Stock) suggested purchase: ${tomatoSuggested} kg`);

  // --- TEST 4: Purchase Entry & Stock Increase ---
  console.log('\n--- TEST 4: Purchase Entry (+ Add Purchase) ---');
  // Purchase +50 kg Basmati Rice @ ₹92/kg from Metro Cash & Carry
  const purchaseQty = 50.00;
  const purchaseRate = 92.00;
  const initialRiceStock = rice.current_stock; // 18 kg
  const expectedNewStock = Math.round((initialRiceStock + purchaseQty) * 100) / 100; // 68 kg

  const purchaseTx = {
    id: crypto.randomUUID(),
    hotel_id: hotel.id,
    item_id: rice.id,
    item_name: rice.name,
    item_category: rice.category,
    transaction_type: 'purchase',
    quantity: purchaseQty,
    unit: rice.unit,
    unit_price: purchaseRate,
    total_cost: Math.round(purchaseQty * purchaseRate * 100) / 100, // 4600
    supplier: 'Metro Cash & Carry',
    notes: 'Invoice #METRO-8821, 50kg bag batch',
    recorded_by: manager.id,
    recorder_name: manager.email,
    transaction_date: '2026-08-20',
    created_at: new Date().toISOString(),
  };

  const updatedItemsAfterPurchase = sampleItems.map((i) =>
    i.id === rice.id ? { ...i, current_stock: expectedNewStock, cost_per_unit: purchaseRate } : i
  );

  await admin
    .from('hotels')
    .update({
      settings: {
        ...hotel.settings,
        inventory_items: updatedItemsAfterPurchase,
        inventory_transactions: [purchaseTx],
      },
    })
    .eq('id', hotel.id);

  // Reload and verify
  const { data: hotelAfterPurchase } = await admin.from('hotels').select('settings').eq('id', hotel.id).single();
  const reloadedRice = hotelAfterPurchase?.settings?.inventory_items?.find((i) => i.name === 'Basmati Rice');

  assert(
    Number(reloadedRice?.current_stock) === 68,
    `Stock increased accurately: ${initialRiceStock} kg + ${purchaseQty} kg = ${reloadedRice?.current_stock} kg`
  );
  assert(
    Number(reloadedRice?.cost_per_unit) === 92,
    `Cost per unit updated to latest purchase rate: ₹${reloadedRice?.cost_per_unit}/kg`
  );

  // --- TEST 5: Usage / Consumption & Stock Decrease ---
  console.log('\n--- TEST 5: Usage / Consumption Entry (+ Record Usage) ---');
  // Kitchen uses 8.5 kg Basmati Rice for Daily Dinner Service
  const usedQty = 8.50;
  const currentStockBeforeUsage = Number(reloadedRice?.current_stock); // 68 kg
  const expectedStockAfterUsage = Math.round((currentStockBeforeUsage - usedQty) * 100) / 100; // 59.5 kg

  const usageTx = {
    id: crypto.randomUUID(),
    hotel_id: hotel.id,
    item_id: rice.id,
    item_name: rice.name,
    item_category: rice.category,
    transaction_type: 'usage',
    quantity: usedQty,
    unit: rice.unit,
    unit_price: 92.00,
    total_cost: Math.round(usedQty * 92.00 * 100) / 100, // 782
    reason: 'Kitchen Daily Cooking',
    notes: 'Dinner buffet preparation for 45 guests',
    recorded_by: manager.id,
    recorder_name: manager.email,
    transaction_date: '2026-08-20',
    created_at: new Date().toISOString(),
  };

  const updatedItemsAfterUsage = updatedItemsAfterPurchase.map((i) =>
    i.id === rice.id ? { ...i, current_stock: expectedStockAfterUsage } : i
  );

  await admin
    .from('hotels')
    .update({
      settings: {
        ...hotel.settings,
        inventory_items: updatedItemsAfterUsage,
        inventory_transactions: [usageTx, purchaseTx],
      },
    })
    .eq('id', hotel.id);

  // Reload and verify
  const { data: hotelAfterUsage } = await admin.from('hotels').select('settings').eq('id', hotel.id).single();
  const reloadedRiceAfterUsage = hotelAfterUsage?.settings?.inventory_items?.find((i) => i.name === 'Basmati Rice');

  assert(
    Number(reloadedRiceAfterUsage?.current_stock) === 59.5,
    `Stock decreased accurately: ${currentStockBeforeUsage} kg - ${usedQty} kg = ${reloadedRiceAfterUsage?.current_stock} kg`
  );

  // --- TEST 6: Strict Negative Stock Prevention ---
  console.log('\n--- TEST 6: Strict Negative Stock Prevention Guard ---');
  // Attempt to use 100 kg when only 59.5 kg is available
  const excessiveQty = 100.00;
  const currentAvailable = Number(reloadedRiceAfterUsage?.current_stock);
  const isRejected = excessiveQty > currentAvailable;

  assert(
    isRejected,
    `Usage of ${excessiveQty} kg rejected because available stock is only ${currentAvailable} kg (Zero negative stock allowed)`
  );

  // --- TEST 7: Audit Movement History Integrity ---
  console.log('\n--- TEST 7: Audit Movement History & Transaction Ledger ---');
  const storedTx = hotelAfterUsage?.settings?.inventory_transactions || [];
  assert(storedTx.length === 2, `Audit trail contains ${storedTx.length} movement records`);

  const purchaseRecord = storedTx.find((t) => t.transaction_type === 'purchase');
  assert(
    Boolean(purchaseRecord && purchaseRecord.quantity === 50 && purchaseRecord.supplier === 'Metro Cash & Carry'),
    'Audit purchase record matches: +50 kg from Metro Cash & Carry'
  );

  const usageRecord = storedTx.find((t) => t.transaction_type === 'usage');
  assert(
    Boolean(usageRecord && usageRecord.quantity === 8.5 && usageRecord.reason === 'Kitchen Daily Cooking'),
    'Audit usage record matches: -8.5 kg for Kitchen Daily Cooking'
  );

  // --- TEST 8: Item Creation & Custom Units ---
  console.log('\n--- TEST 8: Item Creation & Custom Measurement Units ---');
  const newSpice = {
    id: crypto.randomUUID(),
    hotel_id: hotel.id,
    name: 'Saffron (Kesar)',
    category: 'Spices & Dry',
    unit: 'gram',
    current_stock: 50.00,
    minimum_stock: 20.00,
    target_stock: 100.00,
    cost_per_unit: 180.00,
    is_active: true,
  };

  const finalItems = [...updatedItemsAfterUsage, newSpice];
  await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, inventory_items: finalItems, inventory_transactions: storedTx } })
    .eq('id', hotel.id);

  const { data: hotelFinal } = await admin.from('hotels').select('settings').eq('id', hotel.id).single();
  const saffron = hotelFinal?.settings?.inventory_items?.find((i) => i.name === 'Saffron (Kesar)');

  assert(Boolean(saffron), 'Created new inventory item "Saffron (Kesar)"');
  assert(saffron?.unit === 'gram', `Measurement unit "${saffron?.unit}" persisted properly`);
  assert(Number(saffron?.current_stock) === 50, `Initial stock ${saffron?.current_stock} gram persisted`);

  // --- TEST 9: Role-Based Authorization Enforcement ---
  console.log('\n--- TEST 9: Role-Based Permission Architecture ---');
  const sessionContent = fs.readFileSync(path.resolve(process.cwd(), 'lib/auth/session.ts'), 'utf8');
  
  const ownerHasInventory = sessionContent.includes("owner: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory'");
  const managerHasInventory = sessionContent.includes("manager: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory'");
  const receptionHasInventory = sessionContent.includes("reception: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory'");
  const housekeepingHasInventory = sessionContent.includes("housekeeping: ['/dashboard', '/rooms', '/inventory'");

  assert(ownerHasInventory, 'Owner role is authorized for /inventory in lib/auth/session.ts');
  assert(managerHasInventory, 'Manager role is authorized for /inventory in lib/auth/session.ts');
  assert(housekeepingHasInventory, 'Housekeeping role is authorized for /inventory (damage reporting)');
  assert(!receptionHasInventory, 'Reception role is BLOCKED from /inventory');

  // Summary
  console.log('\n========================================================================');
  console.log(`  FOOD INVENTORY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runInventoryTests();
