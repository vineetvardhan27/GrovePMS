#!/usr/bin/env node
/**
 * Verification Suite for Hotel Logo Standardization Across All Bills & Invoices
 */
const fs = require('fs');
const path = require('path');

function runLogoVerification() {
  console.log('========================================================================');
  console.log('  HOTEL LOGO STANDARDIZATION ON ALL BILLS & INVOICES VERIFICATION');
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

  // 1. Check official logo asset
  console.log('--- 1. Official Hotel Logo Asset ---');
  const logoPath = path.resolve(process.cwd(), 'public/logo.png');
  assert(fs.existsSync(logoPath), 'public/logo.png exists in static assets root');
  const logoStats = fs.statSync(logoPath);
  assert(logoStats.size > 1000, `public/logo.png is valid (${logoStats.size} bytes)`);

  // 2. Check Shared HotelInvoiceHeader component
  console.log('\n--- 2. Shared HotelInvoiceHeader Component ---');
  const sharedHeaderPath = path.resolve(process.cwd(), 'components/shared/HotelInvoiceHeader.tsx');
  assert(fs.existsSync(sharedHeaderPath), 'components/shared/HotelInvoiceHeader.tsx exists');
  const headerCode = fs.readFileSync(sharedHeaderPath, 'utf8');
  assert(headerCode.includes('src="/logo.png"'), 'HotelInvoiceHeader renders src="/logo.png"');
  assert(headerCode.includes('alt={hotelName}'), 'HotelInvoiceHeader has dynamic hotel alt tag');
  assert(headerCode.includes('HOTEL GREENERY VIEW'), 'HotelInvoiceHeader defaults to HOTEL GREENERY VIEW');

  // 3. Check Room Billing / Tax Invoice & Guest Folio (BillView.tsx)
  console.log('\n--- 3. Room Billing Invoice & Guest Folio (BillView.tsx) ---');
  const billViewPath = path.resolve(process.cwd(), 'components/billing/BillView.tsx');
  const billViewCode = fs.readFileSync(billViewPath, 'utf8');
  assert(billViewCode.includes('HotelInvoiceHeader'), 'BillView.tsx imports and uses HotelInvoiceHeader');
  assert(!billViewCode.includes('<Building2 className="w-6 h-6" />'), 'BillView.tsx no longer uses placeholder Building2 icon');

  // 4. Check Banquet Tax Invoice (BanquetInvoiceView.tsx)
  console.log('\n--- 4. Banquet Tax Invoice (BanquetInvoiceView.tsx) ---');
  const banquetViewPath = path.resolve(process.cwd(), 'components/banquet/BanquetInvoiceView.tsx');
  const banquetCode = fs.readFileSync(banquetViewPath, 'utf8');
  assert(banquetCode.includes('HotelInvoiceHeader'), 'BanquetInvoiceView.tsx imports and uses HotelInvoiceHeader');
  assert(!banquetCode.includes('>H</div>'), 'BanquetInvoiceView.tsx no longer uses letter H placeholder');

  // 5. Check Food & Beverage Invoice (FBInvoiceView.tsx)
  console.log('\n--- 5. Food & Beverage Invoice (FBInvoiceView.tsx) ---');
  const fbInvoicePath = path.resolve(process.cwd(), 'components/fb/FBInvoiceView.tsx');
  const fbCode = fs.readFileSync(fbInvoicePath, 'utf8');
  assert(fbCode.includes('HotelInvoiceHeader'), 'FBInvoiceView.tsx uses HotelInvoiceHeader');

  // Summary
  console.log('\n========================================================================');
  console.log(`  LOGO VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runLogoVerification();
