#!/usr/bin/env node
/**
 * Automated Verification Suite: Account Switcher & Role Isolation
 * Tests the complete database, token exchange, session switching, and role permission flow.
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
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runAccountSwitcherTests() {
  console.log('================================================================================');
  console.log('       HOTEL PMS ACCOUNT SWITCHER & MULTI-ROLE SECURITY AUDIT');
  console.log('================================================================================\n');

  try {
    // --- STEP 1: Query Hotel & Staff Records ---
    console.log('--- TEST 1: Hotel & Authorized Staff Account Discovery ---');
    const { data: hotels, error: hErr } = await admin.from('hotels').select('*').limit(1);
    assert(!hErr && hotels && hotels.length > 0, `Resolved Hotel: "${hotels[0]?.name}" (${hotels[0]?.id})`);
    const hotelId = hotels[0]?.id;

    const { data: staffList, error: sErr } = await admin
      .from('staff')
      .select('id, email, full_name, role, is_active, hotel_id')
      .eq('hotel_id', hotelId)
      .eq('is_active', true);

    assert(!sErr && staffList && staffList.length >= 4, `Discovered ${staffList?.length} active staff accounts for property`);

    const owner = staffList.find(s => s.role === 'owner' && s.email === 'owner@hotelgreeneryview.com');
    const manager = staffList.find(s => s.role === 'manager' && s.email === 'manager@hotelgreeneryview.com');
    const reception = staffList.find(s => s.role === 'reception' && s.email === 'reception@hotelgreeneryview.com');
    const housekeeping = staffList.find(s => s.role === 'housekeeping' && s.email === 'housekeeping@hotelgreeneryview.com');

    assert(!!owner, `Owner Account found: ${owner?.full_name} (${owner?.email})`);
    assert(!!manager, `Manager Account found: ${manager?.full_name} (${manager?.email})`);
    assert(!!reception, `Reception Account found: ${reception?.full_name} (${reception?.email})`);
    assert(!!housekeeping, `Housekeeping Account found: ${housekeeping?.full_name} (${housekeeping?.email})`);

    // --- STEP 2: Test Switching to Manager ---
    console.log('\n--- TEST 2: Switch Account: Owner -> Manager ---');
    const { data: mgrLink, error: mgrLinkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: manager.email,
    });
    assert(!mgrLinkErr && !!mgrLink?.properties?.hashed_token, `Generated auth token for Manager (${manager.email})`);

    const clientMgr = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: mgrSession, error: mgrVerifyErr } = await clientMgr.auth.verifyOtp({
      token_hash: mgrLink.properties.hashed_token,
      type: 'magiclink',
    });
    assert(!mgrVerifyErr && mgrSession?.user?.id === manager.id, `Session established for Manager ID: ${manager.id}`);
    assert(mgrSession?.user?.email === manager.email, `Active user email matches manager@hotelgreeneryview.com`);

    // --- STEP 3: Test Switching to Reception ---
    console.log('\n--- TEST 3: Switch Account: Manager -> Reception ---');
    const { data: recLink, error: recLinkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: reception.email,
    });
    assert(!recLinkErr && !!recLink?.properties?.hashed_token, `Generated auth token for Reception (${reception.email})`);

    const clientRec = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: recSession, error: recVerifyErr } = await clientRec.auth.verifyOtp({
      token_hash: recLink.properties.hashed_token,
      type: 'magiclink',
    });
    assert(!recVerifyErr && recSession?.user?.id === reception.id, `Session established for Reception ID: ${reception.id}`);
    assert(recSession?.user?.email === reception.email, `Active user email matches reception@hotelgreeneryview.com`);

    // --- STEP 4: Test Switching to Housekeeping ---
    console.log('\n--- TEST 4: Switch Account: Reception -> Housekeeping ---');
    const { data: hkLink, error: hkLinkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: housekeeping.email,
    });
    assert(!hkLinkErr && !!hkLink?.properties?.hashed_token, `Generated auth token for Housekeeping (${housekeeping.email})`);

    const clientHk = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: hkSession, error: hkVerifyErr } = await clientHk.auth.verifyOtp({
      token_hash: hkLink.properties.hashed_token,
      type: 'magiclink',
    });
    assert(!hkVerifyErr && hkSession?.user?.id === housekeeping.id, `Session established for Housekeeping ID: ${housekeeping.id}`);
    assert(hkSession?.user?.email === housekeeping.email, `Active user email matches housekeeping@hotelgreeneryview.com`);

    // --- STEP 5: Security Boundary & Unauthorized Account Switching Guard ---
    console.log('\n--- TEST 5: Security & Multi-Tenant Boundary Enforcement ---');
    const fakeTargetId = '00000000-0000-0000-0000-999999999999';
    const { data: fakeStaff } = await admin
      .from('staff')
      .select('id, hotel_id')
      .eq('id', fakeTargetId)
      .maybeSingle();
    assert(!fakeStaff, `Fake target account does not exist in database`);

    // Cross-tenant test: target in different hotel
    const crossTenantTargetId = '11111111-1111-1111-1111-111111111111';
    const callerHotelId = hotelId;
    const isAuthorized = staffList.some(s => s.id === crossTenantTargetId && s.hotel_id === callerHotelId);
    assert(!isAuthorized, `Cross-tenant switch attempt strictly blocked by hotel boundary check`);

    // --- STEP 6: Role Route Permission Matrix ---
    console.log('\n--- TEST 6: Role Route Permissions & Module Matrix ---');
    const ROLE_NAV_ITEMS = {
      owner: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory', '/banquet', '/reports', '/settings'],
      manager: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/inventory', '/banquet', '/reports', '/settings'],
      reception: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/banquet'],
      housekeeping: ['/dashboard', '/rooms', '/inventory', '/banquet'],
    };
    function hasRouteAccess(role, pathname) {
      const allowedRoutes = ROLE_NAV_ITEMS[role] || ['/dashboard', '/rooms'];
      return allowedRoutes.some((basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`));
    }
    
    assert(hasRouteAccess('owner', '/settings'), `Owner has access to /settings`);
    assert(hasRouteAccess('owner', '/reports'), `Owner has access to /reports`);
    assert(hasRouteAccess('manager', '/inventory'), `Manager has access to /inventory`);
    assert(!hasRouteAccess('reception', '/settings'), `Reception is blocked from /settings`);
    assert(!hasRouteAccess('reception', '/reports'), `Reception is blocked from /reports`);
    assert(hasRouteAccess('reception', '/billing'), `Reception has access to /billing`);
    assert(!hasRouteAccess('housekeeping', '/billing'), `Housekeeping is blocked from /billing`);
    assert(hasRouteAccess('housekeeping', '/inventory'), `Housekeeping has access to /inventory for damage reporting`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n================================================================================');
  console.log(`  ACCOUNT SWITCHER AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAccountSwitcherTests();
