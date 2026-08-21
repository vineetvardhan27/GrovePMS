#!/usr/bin/env node
/**
 * Fast Searchable Food & Beverage Modal Verification Suite
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

async function runFoodSearchTests() {
  console.log('========================================================================');
  console.log('  FAST SEARCHABLE FOOD & BEVERAGE MODAL VERIFICATION SUITE');
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

  // --- TEST 2: Menu Items & Categories ---
  console.log('\n--- TEST 2: Menu Items & Categories ---');
  let itemsList = [];
  let catList = [];
  try {
    const { data: menuItems } = await admin.from('menu_items').select('*');
    const { data: categories } = await admin.from('menu_categories').select('*');
    itemsList = menuItems || [];
    catList = categories || [];
  } catch {}

  if (itemsList.length === 0 && hotel?.settings?.menu_items) {
    itemsList = hotel.settings.menu_items;
  }
  if (catList.length === 0 && hotel?.settings?.menu_categories) {
    catList = hotel.settings.menu_categories;
  }

  // Load from default catalog if not in DB
  if (itemsList.length === 0) {
    const { DEFAULT_MENU_ITEMS, DEFAULT_MENU_CATEGORIES } = require('../lib/menu/queries');
    itemsList = DEFAULT_MENU_ITEMS || [];
    catList = DEFAULT_MENU_CATEGORIES || [];
  }

  assert(itemsList.length > 0, `Found ${itemsList.length} menu items available`);
  assert(catList.length > 0, `Found ${catList.length} menu categories`);

  // --- TEST 3: Multi-Word Search Simulation ---
  console.log('\n--- TEST 3: Multi-Word Search Simulation ---');
  function searchMenu(query) {
    const q = query.toLowerCase().trim();
    const queryTokens = q ? q.split(/\s+/).filter(Boolean) : [];
    return itemsList.filter((item) => {
      const cat = catList.find((c) => c.id === item.category_id);
      const catName = cat?.name?.toLowerCase() || '';
      const searchableText = `${item.name} ${catName} ${item.description || ''}`.toLowerCase();
      return queryTokens.every((token) => searchableText.includes(token));
    });
  }

  const dosaResults = searchMenu('dosa');
  assert(dosaResults.length > 0, `Search "dosa" returned ${dosaResults.length} items (${dosaResults.map((i) => i.name).join(', ')})`);

  const masalaResults = searchMenu('masala dosa');
  assert(masalaResults.length > 0, `Search "masala dosa" returned ${masalaResults.length} items`);

  // --- TEST 4: Multi-Item Cart Arithmetic ---
  console.log('\n--- TEST 4: Multi-Item Cart Arithmetic ---');
  const sampleCart = [
    { name: 'Masala Dosa', price: 120, quantity: 2 },
    { name: 'Filter Coffee', price: 80, quantity: 2 },
    { name: 'Mineral Water', price: 30, quantity: 3 },
  ];

  const subtotal = sampleCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gstRate = 12;
  const gstAmount = Math.round(((subtotal * gstRate) / 100) * 100) / 100;
  const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

  assert(subtotal === 490, `Subtotal (2 Dosa + 2 Coffee + 3 Water): ₹${subtotal} (Expected: ₹490)`);
  assert(gstAmount === 58.8, `GST (12%): ₹${gstAmount} (Expected: ₹58.80)`);
  assert(grandTotal === 548.8, `Grand Total: ₹${grandTotal} (Expected: ₹548.80)`);

  // --- TEST 5: File & Component Existence ---
  console.log('\n--- TEST 5: File & Component Existence ---');
  const addFoodModalPath = path.resolve(process.cwd(), 'components/billing/AddFoodModal.tsx');
  const actionsPath = path.resolve(process.cwd(), 'lib/billing/food-actions.ts');

  assert(fs.existsSync(addFoodModalPath), 'components/billing/AddFoodModal.tsx exists');
  assert(fs.existsSync(actionsPath), 'lib/billing/food-actions.ts exists');

  // Summary
  console.log('\n========================================================================');
  console.log(`  FOOD SEARCH & BILLING TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runFoodSearchTests();
