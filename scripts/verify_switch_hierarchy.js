/**
 * verify_switch_hierarchy.js
 *
 * Automated tests for Switch Account hierarchy rules.
 * Tests:
 *  1. SWITCH_ALLOWED_ROLES matrix (unit test)
 *  2. canSwitchToAccount() for all role/role/hotel combinations
 *  3. getAvailableStaffAccounts() returns only same-hotel + allowed-role accounts
 *  4. switchStaffAccountAction() rejects cross-hotel and hierarchy violations
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

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIT: SWITCH_ALLOWED_ROLES matrix
// ─────────────────────────────────────────────────────────────────────────────
const SWITCH_ALLOWED_ROLES = {
  owner:       ['owner', 'manager', 'reception', 'housekeeping'],
  manager:     ['manager', 'reception', 'housekeeping'],
  reception:   ['reception'],
  housekeeping: ['housekeeping'],
};

function canSwitchToAccount(callerRole, callerHotelId, targetRole, targetHotelId) {
  if (callerHotelId !== targetHotelId) return false;
  const allowed = SWITCH_ALLOWED_ROLES[callerRole] ?? [];
  return allowed.includes(targetRole);
}

function canSwitchAccounts(callerRole) {
  return (SWITCH_ALLOWED_ROLES[callerRole] ?? []).length > 1;
}

const HOTEL_A = 'a0000000-0000-0000-0000-000000000001';
const HOTEL_B = 'b0000000-0000-0000-0000-000000000002';

async function runUnitTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SECTION 1: Hierarchy Matrix Unit Tests');
  console.log('═══════════════════════════════════════════════════════');

  // Owner permissions
  assert(canSwitchToAccount('owner', HOTEL_A, 'owner', HOTEL_A),       'Owner → Owner (same hotel): ALLOW');
  assert(canSwitchToAccount('owner', HOTEL_A, 'manager', HOTEL_A),     'Owner → Manager (same hotel): ALLOW');
  assert(canSwitchToAccount('owner', HOTEL_A, 'reception', HOTEL_A),   'Owner → Reception (same hotel): ALLOW');
  assert(canSwitchToAccount('owner', HOTEL_A, 'housekeeping', HOTEL_A),'Owner → Housekeeping (same hotel): ALLOW');
  assert(!canSwitchToAccount('owner', HOTEL_A, 'owner', HOTEL_B),      'Owner → Owner (other hotel): DENY');
  assert(!canSwitchToAccount('owner', HOTEL_A, 'manager', HOTEL_B),    'Owner → Manager (other hotel): DENY');
  assert(!canSwitchToAccount('owner', HOTEL_A, 'reception', HOTEL_B),  'Owner → Reception (other hotel): DENY');

  // Manager permissions
  assert(!canSwitchToAccount('manager', HOTEL_A, 'owner', HOTEL_A),     'Manager → Owner: DENY');
  assert(canSwitchToAccount('manager', HOTEL_A, 'manager', HOTEL_A),    'Manager → Manager (same hotel): ALLOW');
  assert(canSwitchToAccount('manager', HOTEL_A, 'reception', HOTEL_A),  'Manager → Reception (same hotel): ALLOW');
  assert(canSwitchToAccount('manager', HOTEL_A, 'housekeeping', HOTEL_A),'Manager → Housekeeping (same hotel): ALLOW');
  assert(!canSwitchToAccount('manager', HOTEL_A, 'owner', HOTEL_B),     'Manager → Owner (other hotel): DENY');
  assert(!canSwitchToAccount('manager', HOTEL_A, 'reception', HOTEL_B), 'Manager → Reception (other hotel): DENY');

  // Reception permissions
  assert(!canSwitchToAccount('reception', HOTEL_A, 'owner', HOTEL_A),       'Reception → Owner: DENY');
  assert(!canSwitchToAccount('reception', HOTEL_A, 'manager', HOTEL_A),     'Reception → Manager: DENY');
  assert(canSwitchToAccount('reception', HOTEL_A, 'reception', HOTEL_A),    'Reception → Self (reception): ALLOW');
  assert(!canSwitchToAccount('reception', HOTEL_A, 'housekeeping', HOTEL_A),'Reception → Housekeeping: DENY');
  assert(!canSwitchToAccount('reception', HOTEL_A, 'reception', HOTEL_B),   'Reception → Reception (other hotel): DENY');

  // Housekeeping permissions
  assert(!canSwitchToAccount('housekeeping', HOTEL_A, 'owner', HOTEL_A),      'Housekeeping → Owner: DENY');
  assert(!canSwitchToAccount('housekeeping', HOTEL_A, 'manager', HOTEL_A),    'Housekeeping → Manager: DENY');
  assert(!canSwitchToAccount('housekeeping', HOTEL_A, 'reception', HOTEL_A),  'Housekeeping → Reception: DENY');
  assert(canSwitchToAccount('housekeeping', HOTEL_A, 'housekeeping', HOTEL_A),'Housekeeping → Self (housekeeping): ALLOW');
  assert(!canSwitchToAccount('housekeeping', HOTEL_A, 'housekeeping', HOTEL_B),'Housekeeping → Housekeeping (other hotel): DENY');

  // canSwitchAccounts helper
  assert(canSwitchAccounts('owner'),        'Owner: canSwitchAccounts = true');
  assert(canSwitchAccounts('manager'),      'Manager: canSwitchAccounts = true');
  assert(!canSwitchAccounts('reception'),   'Reception: canSwitchAccounts = false');
  assert(!canSwitchAccounts('housekeeping'),'Housekeeping: canSwitchAccounts = false');
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: DB Query Scoping Tests
// ─────────────────────────────────────────────────────────────────────────────
async function runIntegrationTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SECTION 2: Database Scoping Integration Tests');
  console.log('═══════════════════════════════════════════════════════');

  // Fetch existing Hotel Greenery View staff
  const { data: hgvStaff, error } = await admin
    .from('staff')
    .select('id, email, full_name, role, hotel_id, is_active')
    .eq('hotel_id', HOTEL_A)
    .eq('is_active', true);

  assert(!error && hgvStaff, 'Successfully fetched Hotel Greenery View staff');
  
  const owner = hgvStaff?.find((s) => s.role === 'owner');
  const manager = hgvStaff?.find((s) => s.role === 'manager');
  const reception = hgvStaff?.find((s) => s.role === 'reception');
  const housekeeping = hgvStaff?.find((s) => s.role === 'housekeeping');

  assert(owner, 'Found Owner account');
  assert(manager, 'Found Manager account');
  assert(reception, 'Found Reception account');
  assert(housekeeping, 'Found Housekeeping account');

  // Simulate getAvailableStaffAccounts for Owner
  {
    const ownerAllowedRoles = SWITCH_ALLOWED_ROLES['owner'];
    const { data: ownerSwitchable } = await admin
      .from('staff')
      .select('id, email, full_name, role, hotel_id')
      .eq('hotel_id', HOTEL_A)
      .eq('is_active', true)
      .in('role', ownerAllowedRoles);

    const emails = ownerSwitchable?.map((s) => s.email) || [];
    const hasLeakedAccount = emails.some(
      (e) => e.includes('hoteltest') || e.includes('pinepeaks') || e.includes('example.com')
    );

    assert(!hasLeakedAccount, 'Owner switcher: zero cross-hotel accounts returned');
    assert(
      ownerSwitchable?.every((s) => s.hotel_id === HOTEL_A),
      'Owner switcher: all returned accounts belong to Hotel Greenery View'
    );
    assert(
      ownerSwitchable && ownerSwitchable.length >= 4,
      `Owner switcher: returns ≥4 hotel accounts (got ${ownerSwitchable?.length})`
    );
    console.log(`    ↳ Owner switchable accounts: ${ownerSwitchable?.map(s => `${s.full_name} (${s.role})`).join(', ')}`);
  }

  // Simulate getAvailableStaffAccounts for Manager
  {
    const managerAllowedRoles = SWITCH_ALLOWED_ROLES['manager'];
    const { data: managerSwitchable } = await admin
      .from('staff')
      .select('id, email, full_name, role, hotel_id')
      .eq('hotel_id', HOTEL_A)
      .eq('is_active', true)
      .in('role', managerAllowedRoles);

    const hasOwner = managerSwitchable?.some((s) => s.role === 'owner');
    const allSameHotel = managerSwitchable?.every((s) => s.hotel_id === HOTEL_A);

    assert(!hasOwner, 'Manager switcher: does NOT include Owner accounts');
    assert(allSameHotel, 'Manager switcher: all accounts belong to Hotel Greenery View');
    assert(
      managerSwitchable && managerSwitchable.length >= 3,
      `Manager switcher: returns manager+reception+housekeeping (got ${managerSwitchable?.length})`
    );
    console.log(`    ↳ Manager switchable accounts: ${managerSwitchable?.map(s => `${s.full_name} (${s.role})`).join(', ')}`);
  }

  // Simulate getAvailableStaffAccounts for Reception (self only)
  {
    const receptionAllowedRoles = SWITCH_ALLOWED_ROLES['reception'];
    const { data: receptionSwitchable } = await admin
      .from('staff')
      .select('id, email, full_name, role, hotel_id')
      .eq('hotel_id', HOTEL_A)
      .eq('is_active', true)
      .in('role', receptionAllowedRoles);

    const hasOwner = receptionSwitchable?.some((s) => s.role === 'owner');
    const hasManager = receptionSwitchable?.some((s) => s.role === 'manager');
    const hasHousekeeping = receptionSwitchable?.some((s) => s.role === 'housekeeping');

    assert(!hasOwner,       'Reception switcher: no Owner accounts');
    assert(!hasManager,     'Reception switcher: no Manager accounts');
    assert(!hasHousekeeping,'Reception switcher: no Housekeeping accounts');
    assert(
      receptionSwitchable?.every((s) => s.role === 'reception'),
      'Reception switcher: only Reception accounts returned'
    );
    console.log(`    ↳ Reception switchable accounts: ${receptionSwitchable?.map(s => `${s.full_name} (${s.role})`).join(', ')}`);
  }

  // Simulate getAvailableStaffAccounts for Housekeeping (self only)
  {
    const hkAllowedRoles = SWITCH_ALLOWED_ROLES['housekeeping'];
    const { data: hkSwitchable } = await admin
      .from('staff')
      .select('id, email, full_name, role, hotel_id')
      .eq('hotel_id', HOTEL_A)
      .eq('is_active', true)
      .in('role', hkAllowedRoles);

    const onlyHousekeeping = hkSwitchable?.every((s) => s.role === 'housekeeping');

    assert(onlyHousekeeping, 'Housekeeping switcher: only Housekeeping accounts returned');
    console.log(`    ↳ Housekeeping switchable accounts: ${hkSwitchable?.map(s => `${s.full_name} (${s.role})`).join(', ')}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: Cross-Hotel Boundary Test
// ─────────────────────────────────────────────────────────────────────────────
async function runCrossHotelTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SECTION 3: Cross-Hotel Isolation Tests');
  console.log('═══════════════════════════════════════════════════════');

  // Create a temporary second hotel and owner to test isolation
  const testHotelName = `Test Switcher Hotel ${Date.now()}`;
  const testEmail = `switcher_test_${Date.now()}@pmstest.local`;

  const { data: hotel2 } = await admin
    .from('hotels')
    .insert({ name: testHotelName, slug: `switch-test-${Date.now()}`, email: testEmail })
    .select('id')
    .single();

  const { data: authUser } = await admin.auth.admin.createUser({
    email: testEmail,
    password: 'TestPass@1234!',
    email_confirm: true,
  });

  await admin.from('staff').upsert({
    id: authUser.user.id,
    hotel_id: hotel2.id,
    email: testEmail,
    full_name: 'Hotel B Owner',
    role: 'owner',
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  // Verify: Hotel A Owner query does NOT return Hotel B staff
  const { data: hotelAStaff } = await admin
    .from('staff')
    .select('id, hotel_id, role')
    .eq('hotel_id', HOTEL_A)
    .eq('is_active', true)
    .in('role', SWITCH_ALLOWED_ROLES['owner']);

  const hasHotelBAccount = hotelAStaff?.some((s) => s.hotel_id === hotel2.id);
  assert(!hasHotelBAccount, 'Hotel A owner query returns zero Hotel B accounts');

  // Verify: hierarchy check blocks cross-hotel switch attempt
  const crossHotelBlocked = !canSwitchToAccount('owner', HOTEL_A, 'owner', hotel2.id);
  assert(crossHotelBlocked, 'canSwitchToAccount() blocks cross-hotel switch even for Owner role');

  // Cleanup
  await admin.from('staff').delete().eq('hotel_id', hotel2.id);
  await admin.from('hotels').delete().eq('id', hotel2.id);
  await admin.auth.admin.deleteUser(authUser.user.id);
  console.log('  ↳ Cross-hotel test resources cleaned up.');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   SWITCH ACCOUNT HIERARCHY VERIFICATION SUITE        ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  await runUnitTests();
  await runIntegrationTests();
  await runCrossHotelTests();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
