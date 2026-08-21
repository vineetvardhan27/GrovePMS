#!/usr/bin/env node
/**
 * Settings Back Navigation Verification Suite
 */
const fs = require('fs');
const path = require('path');

function runSettingsNavigationTests() {
  console.log('========================================================================');
  console.log('  SETTINGS BACK NAVIGATION VERIFICATION SUITE');
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

  // TEST 1: Reusable Components Exist
  console.log('--- TEST 1: Reusable Components Exist ---');
  const backNavExists = fs.existsSync(path.resolve(process.cwd(), 'components/settings/SettingsBackNavigation.tsx'));
  const headerExists = fs.existsSync(path.resolve(process.cwd(), 'components/settings/SettingsHeader.tsx'));
  assert(backNavExists, 'components/settings/SettingsBackNavigation.tsx created');
  assert(headerExists, 'components/settings/SettingsHeader.tsx created');

  // TEST 2: Room Categories Page
  console.log('\n--- TEST 2: Room Categories Sub-Page ---');
  const roomCatPath = path.resolve(process.cwd(), 'app/(dashboard)/settings/room-categories/page.tsx');
  const roomCatContent = fs.readFileSync(roomCatPath, 'utf8');
  assert(
    roomCatContent.includes('SettingsHeader') && roomCatContent.includes('currentPage="Room Categories"'),
    'Room Categories page includes SettingsHeader with back navigation'
  );

  // TEST 3: GST & Tax Settings Page
  console.log('\n--- TEST 3: GST & Tax Settings Sub-Page ---');
  const gstPath = path.resolve(process.cwd(), 'app/(dashboard)/settings/gst/page.tsx');
  const gstContent = fs.readFileSync(gstPath, 'utf8');
  assert(
    gstContent.includes('SettingsHeader') && gstContent.includes('currentPage="GST & Taxes"'),
    'GST & Tax Settings page includes SettingsHeader with back navigation'
  );

  // TEST 4: Food Menu Page
  console.log('\n--- TEST 4: Food Menu Sub-Page ---');
  const foodMenuMgrPath = path.resolve(process.cwd(), 'app/(dashboard)/settings/food-menu/FoodMenuManager.tsx');
  const foodMenuMgrContent = fs.readFileSync(foodMenuMgrPath, 'utf8');
  assert(
    foodMenuMgrContent.includes('SettingsBackNavigation') && foodMenuMgrContent.includes('currentPage="Food Menu"'),
    'Food Menu Management page includes SettingsBackNavigation'
  );

  // TEST 5: Target Route Integrity
  console.log('\n--- TEST 5: Target Route Integrity ---');
  const backNavContent = fs.readFileSync(path.resolve(process.cwd(), 'components/settings/SettingsBackNavigation.tsx'), 'utf8');
  assert(
    backNavContent.includes('href="/settings"') && backNavContent.includes('ArrowLeft'),
    'Back navigation links cleanly to "/settings" with ArrowLeft icon'
  );

  // Summary
  console.log('\n========================================================================');
  console.log(`  SETTINGS NAVIGATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runSettingsNavigationTests();
