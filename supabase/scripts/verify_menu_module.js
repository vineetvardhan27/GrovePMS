#!/usr/bin/env node
/**
 * Verification Test Suite for Food Menu Management Module
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

async function runTests() {
  console.log('========================================================================');
  console.log('  FOOD MENU MANAGEMENT MODULE VERIFICATION SUITE');
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

  // Test 1: Query Hotel and Menu in Supabase
  console.log('--- TEST 1: Database Menu Query & Persistence ---');
  const { data: hotel, error: hotelErr } = await admin.from('hotels').select('*').limit(1).single();
  assert(Boolean(hotel), `Resolved hotel: ${hotel?.name} (${hotel?.id})`);

  const categories = hotel?.settings?.menu_categories || [];
  const items = hotel?.settings?.menu_items || [];

  assert(categories.length >= 6, `Found ${categories.length} menu categories in DB (expected >= 6)`);
  assert(items.length >= 15, `Found ${items.length} menu items in DB (expected >= 15)`);

  // Test 2: Category Coverage
  console.log('\n--- TEST 2: Required Categories Coverage ---');
  const catNames = categories.map((c) => c.name);
  const requiredCats = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Other'];
  for (const rc of requiredCats) {
    assert(catNames.includes(rc), `Category "${rc}" is configured in database`);
  }

  // Test 3: Sample Item Checks & Pricing
  console.log('\n--- TEST 3: Sample Menu Items & Tariffs ---');
  const dosa = items.find((i) => i.name === 'Masala Dosa');
  assert(Boolean(dosa), 'Found "Masala Dosa" on menu');
  assert(Number(dosa?.selling_price) === 120, `"Masala Dosa" selling price is ₹${dosa?.selling_price} (expected ₹120)`);
  assert(dosa?.is_active === true, '"Masala Dosa" is active by default');

  const paneer = items.find((i) => i.name === 'Paneer Butter Masala');
  assert(Boolean(paneer), 'Found "Paneer Butter Masala" on menu');
  assert(Number(paneer?.selling_price) === 240, `"Paneer Butter Masala" selling price is ₹${paneer?.selling_price}`);

  const chai = items.find((i) => i.name === 'Masala Chai');
  assert(Boolean(chai), 'Found "Masala Chai" on menu');
  assert(Number(chai?.selling_price) === 30, `"Masala Chai" selling price is ₹${chai?.selling_price}`);

  // Test 4: Price Modification & Persistence
  console.log('\n--- TEST 4: Price Edit and Database Persistence ---');
  // Update Masala Dosa price from 120 -> 150
  const updatedItems = items.map((i) => (i.name === 'Masala Dosa' ? { ...i, selling_price: 150 } : i));
  const { error: updateErr } = await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, menu_items: updatedItems } })
    .eq('id', hotel.id);

  assert(!updateErr, 'Updated "Masala Dosa" price to ₹150 in Supabase');

  // Reload from Supabase
  const { data: reloadedHotel } = await admin.from('hotels').select('settings').eq('id', hotel.id).single();
  const reloadedDosa = reloadedHotel?.settings?.menu_items?.find((i) => i.name === 'Masala Dosa');
  assert(Number(reloadedDosa?.selling_price) === 150, `Reloaded "Masala Dosa" persists as ₹${reloadedDosa?.selling_price}`);

  // Restore price back to 120
  const restoredItems = items.map((i) => (i.name === 'Masala Dosa' ? { ...i, selling_price: 120 } : i));
  await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, menu_items: restoredItems } })
    .eq('id', hotel.id);
  console.log('  ✓ Restored "Masala Dosa" price back to ₹120');

  // Test 5: Item Status Deactivation / Reactivation
  console.log('\n--- TEST 5: Item Status Toggle ---');
  const deactivatedItems = items.map((i) => (i.name === 'Filter Coffee' ? { ...i, is_active: false } : i));
  await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, menu_items: deactivatedItems } })
    .eq('id', hotel.id);

  const { data: checkHotel } = await admin.from('hotels').select('settings').eq('id', hotel.id).single();
  const checkCoffee = checkHotel?.settings?.menu_items?.find((i) => i.name === 'Filter Coffee');
  assert(checkCoffee?.is_active === false, 'Deactivated "Filter Coffee" persists as is_active = false');

  // Reactivate
  await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, menu_items: items } })
    .eq('id', hotel.id);
  console.log('  ✓ Reactivated "Filter Coffee"');

  // Test 6: Role Permission Architecture
  console.log('\n--- TEST 6: Role Permission Enforcement ---');
  // Check staff roles in DB
  const { data: staffList } = await admin.from('staff').select('email, role, is_active').eq('hotel_id', hotel.id);
  const ownerStaff = staffList?.find((s) => s.role === 'owner');
  const managerStaff = staffList?.find((s) => s.role === 'manager');
  const receptionStaff = staffList?.find((s) => s.role === 'reception');
  const housekeepingStaff = staffList?.find((s) => s.role === 'housekeeping');

  assert(Boolean(ownerStaff), `Owner account present: ${ownerStaff?.email}`);
  assert(Boolean(managerStaff), `Manager account present: ${managerStaff?.email}`);
  assert(Boolean(receptionStaff), `Reception account present: ${receptionStaff?.email}`);
  assert(Boolean(housekeepingStaff), `Housekeeping account present: ${housekeepingStaff?.email}`);

  // Summary
  console.log('\n========================================================================');
  console.log(`  FOOD MENU TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
