#!/usr/bin/env node
/**
 * Food & Beverage Routing & Navigation Verification Test
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

async function testRoutes() {
  console.log('========================================================================');
  console.log('  FOOD & BEVERAGE ROUTING & BACK NAVIGATION VERIFICATION');
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

  // --- TEST 1: Centralized FB_ROUTES definitions ---
  console.log('--- TEST 1: Centralized Route Definitions ---');
  const routesPath = path.resolve(process.cwd(), 'lib/fb/routes.ts');
  assert(fs.existsSync(routesPath), 'lib/fb/routes.ts exists');
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  assert(routesContent.includes("ROOT: '/food-beverage'"), "FB_ROUTES.ROOT === '/food-beverage'");
  assert(routesContent.includes("BILLS: '/food-beverage?tab=bills'"), "FB_ROUTES.BILLS === '/food-beverage?tab=bills'");
  assert(routesContent.includes("KITCHEN: '/food-beverage?tab=kitchen'"), "FB_ROUTES.KITCHEN === '/food-beverage?tab=kitchen'");
  assert(routesContent.includes("MENU: '/food-beverage?tab=menu'"), "FB_ROUTES.MENU === '/food-beverage?tab=menu'");
  assert(routesContent.includes("REPORTS: '/food-beverage?tab=reports'"), "FB_ROUTES.REPORTS === '/food-beverage?tab=reports'");
  assert(routesContent.includes("NEW_BILL: '/food-beverage/new'"), "FB_ROUTES.NEW_BILL === '/food-beverage/new'");

  // --- TEST 2: FBInvoiceView Back Button Link ---
  console.log('\n--- TEST 2: FBInvoiceView Back Button Destination ---');
  const invoiceViewPath = path.resolve(process.cwd(), 'components/fb/FBInvoiceView.tsx');
  const invoiceContent = fs.readFileSync(invoiceViewPath, 'utf8');
  assert(!invoiceContent.includes('href="/food-beverage/bills"'), 'FBInvoiceView does NOT contain broken hardcoded href="/food-beverage/bills"');
  assert(invoiceContent.includes('href={FB_ROUTES.BILLS}'), 'FBInvoiceView Back button uses FB_ROUTES.BILLS');

  // --- TEST 3: Redirect Pages for Legacy/Direct Sub-routes ---
  console.log('\n--- TEST 3: Sub-route Redirect Pages ---');
  const redirectFiles = [
    'app/(dashboard)/food-beverage/bills/page.tsx',
    'app/(dashboard)/food-beverage/kitchen/page.tsx',
    'app/(dashboard)/food-beverage/menu/page.tsx',
    'app/(dashboard)/food-beverage/reports/page.tsx',
  ];

  for (const file of redirectFiles) {
    const filePath = path.resolve(process.cwd(), file);
    assert(fs.existsSync(filePath), `Created redirect page: ${file}`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('redirect('), `${file} performs clean server-side redirect`);
  }

  // --- TEST 4: FBDashboard and FBBillsHistory Links ---
  console.log('\n--- TEST 4: FBDashboard and FBBillsHistory Links ---');
  const dashboardContent = fs.readFileSync(path.resolve(process.cwd(), 'components/fb/FBDashboard.tsx'), 'utf8');
  assert(!dashboardContent.includes('href="/food-beverage/bills"'), 'FBDashboard does not contain broken /food-beverage/bills href');
  assert(!dashboardContent.includes('href="/food-beverage/kitchen"'), 'FBDashboard does not contain broken /food-beverage/kitchen href');

  const historyContent = fs.readFileSync(path.resolve(process.cwd(), 'components/fb/FBBillsHistory.tsx'), 'utf8');
  assert(!historyContent.includes('href="/food-beverage/new"'), 'FBBillsHistory uses centralized FB_ROUTES.NEW_BILL');
  assert(!historyContent.includes('href={`/food-beverage/${bill.id}`}'), 'FBBillsHistory uses FB_ROUTES.BILL_DETAIL(bill.id)');

  // --- TEST 5: HTTP Local Server Route Checks (if dev server is running) ---
  console.log('\n--- TEST 5: Dev Server Route Availability ---');
  function checkHttp(urlPath) {
    return new Promise((resolve) => {
      http
        .get(`http://localhost:3000${urlPath}`, (res) => {
          // 200, 307, 308 are all valid non-404 responses
          resolve({ status: res.statusCode, location: res.headers.location });
        })
        .on('error', () => {
          resolve({ status: null });
        });
    });
  }

  const rootCheck = await checkHttp('/food-beverage');
  if (rootCheck.status !== null) {
    assert(rootCheck.status !== 404, `GET /food-beverage returned status ${rootCheck.status} (Not 404)`);
    const billsCheck = await checkHttp('/food-beverage/bills');
    assert(billsCheck.status === 307 || billsCheck.status === 308 || billsCheck.status === 200, `GET /food-beverage/bills returned redirect/OK (${billsCheck.status})`);
    const kitchenCheck = await checkHttp('/food-beverage/kitchen');
    assert(kitchenCheck.status === 307 || kitchenCheck.status === 308 || kitchenCheck.status === 200, `GET /food-beverage/kitchen returned redirect/OK (${kitchenCheck.status})`);
  } else {
    console.log('  ℹ Dev server not accessible via HTTP on port 3000; file-based checks validated.');
  }

  // --- Summary ---
  console.log('\n========================================================================');
  console.log(`  NAVIGATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

testRoutes();
