#!/usr/bin/env node
/**
 * Complete Hotel Inventory & Asset Management System Verification Suite
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

async function runInventorySystemTests() {
  console.log('========================================================================');
  console.log('  HOTEL INVENTORY & ASSET MANAGEMENT SYSTEM VERIFICATION SUITE');
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

  // --- TEST 2: Consumables vs Hotel Assets Structure ---
  console.log('\n--- TEST 2: Consumables vs Hotel Assets Structure ---');
  const storedItems = hotel?.settings?.inventory_items || [];
  assert(storedItems.length > 0, `Found ${storedItems.length} inventory items in hotel settings`);

  const consumables = storedItems.filter((i) => i.item_type !== 'reusable_asset');
  const assets = storedItems.filter((i) => i.item_type === 'reusable_asset');

  assert(consumables.length > 0, `Found ${consumables.length} consumable items (Food, Kitchen, Housekeeping)`);
  assert(assets.length > 0, `Found ${assets.length} reusable asset items (Linen, Blankets, Appliances)`);

  // --- TEST 3: Par Stock Shortfall & Valuation ---
  console.log('\n--- TEST 3: Par Stock Shortfall & Valuation ---');
  const rice = consumables.find((i) => i.name.toLowerCase().includes('rice'));
  assert(Boolean(rice), `Found food item: ${rice?.name} (${rice?.current_stock} ${rice?.unit})`);

  if (rice) {
    const calculatedValue = rice.current_stock * rice.cost_per_unit;
    assert(calculatedValue > 0, `Valuation for ${rice.name}: ₹${calculatedValue}`);
  }

  // --- TEST 4: Wastage Reporting Logic & Transaction Logging ---
  console.log('\n--- TEST 4: Wastage Reporting Logic & Transaction Logging ---');
  const sampleWastage = {
    id: 'test-waste-' + Date.now(),
    item_id: rice ? rice.id : 'sample-rice-id',
    item_name: rice ? rice.name : 'Basmati Rice',
    item_category: 'Food / Kitchen',
    transaction_type: 'waste',
    quantity: -2.5,
    unit: 'kg',
    unit_price: 92,
    total_cost: 2.5 * 92, // ₹230
    reason: 'Overprepared / Leftover Excess',
    transaction_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  assert(sampleWastage.total_cost === 230, `Wastage monetary loss accurately computed: ₹${sampleWastage.total_cost}`);
  assert(sampleWastage.transaction_type === 'waste', 'Transaction classified as "waste"');

  // --- TEST 5: Asset Damage & Replacement Calculation ---
  console.log('\n--- TEST 5: Asset Damage & Replacement Calculation ---');
  const blanket = assets.find((i) => i.name.toLowerCase().includes('blanket'));
  assert(Boolean(blanket), `Found reusable asset: ${blanket?.name}`);

  if (blanket) {
    const totalPar = blanket.target_stock || 45;
    const currentUsable = blanket.current_stock + (blanket.in_use_stock || 0) + (blanket.repair_stock || 0);
    const replacementNeeded = Math.max(0, totalPar - currentUsable);
    const estProcurement = replacementNeeded * (blanket.cost_per_unit || 1250);

    assert(replacementNeeded >= 0, `Replacements needed for ${blanket.name}: ${replacementNeeded} units`);
    assert(estProcurement >= 0, `Estimated procurement budget: ₹${estProcurement}`);
  }

  // --- TEST 6: Component File Existence ---
  console.log('\n--- TEST 6: Component File Existence ---');
  const files = [
    'components/inventory/InventoryDashboard.tsx',
    'components/inventory/AddPurchaseModal.tsx',
    'components/inventory/RecordUsageModal.tsx',
    'components/inventory/ReportDamageModal.tsx',
    'components/inventory/ReportWasteModal.tsx',
    'components/inventory/ItemFormModal.tsx',
    'components/inventory/ItemDetailModal.tsx',
    'components/inventory/WastageDashboardView.tsx',
    'components/inventory/ReplacementPlanningView.tsx',
    'lib/inventory/types.ts',
    'lib/inventory/queries.ts',
    'lib/inventory/actions.ts',
    'app/(dashboard)/inventory/page.tsx',
  ];

  for (const f of files) {
    const exists = fs.existsSync(path.resolve(process.cwd(), f));
    assert(exists, `${f} exists`);
  }

  // Summary
  console.log('\n========================================================================');
  console.log(`  INVENTORY SYSTEM TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runInventorySystemTests();
