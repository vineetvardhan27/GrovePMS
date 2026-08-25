/**
 * diagnose_staff_access.js
 *
 * Diagnoses why "Account Not Assigned" appears even after staff rows were seeded.
 * Tests: data existence (service role), RLS policy (anon key), auth session flow.
 *
 * Usage: node scripts/diagnose_staff_access.js
 */

global.WebSocket = class DummyWS {};
const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Load .env.local ────────────────────────────────────────────────────────────
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const idx = t.indexOf('=');
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
});

const SUPABASE_URL     = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY         = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_EMAIL       = 'owner@hotelgreeneryview.com';
const TEST_PASSWORD    = 'HotelDemo@2026!';
const HOTEL_ID         = 'a0000000-0000-0000-0000-000000000001';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Staff Access Diagnostics — Hotel Greenery View PMS  ');
  console.log('═══════════════════════════════════════════════════════\n');

  // ── 1. Check staff row exists (service role bypasses RLS) ──────────────────
  console.log('── Test 1: Staff row exists (service role, bypasses RLS) ──');
  const { data: staffRows, error: staffErr } = await adminClient
    .from('staff')
    .select('id, email, full_name, role, is_active, hotel_id')
    .eq('hotel_id', HOTEL_ID);

  if (staffErr) {
    console.error('  ✗ Error querying staff (admin):', staffErr.message);
  } else if (!staffRows || staffRows.length === 0) {
    console.error('  ✗ NO staff rows found for hotel. Run seed_test_accounts.js first!');
  } else {
    console.log(`  ✓ Found ${staffRows.length} staff row(s):`);
    staffRows.forEach((s) =>
      console.log(`      ${s.full_name} <${s.email}> [${s.role}] active=${s.is_active} id=${s.id}`)
    );
  }

  // ── 2. Find the owner auth user ────────────────────────────────────────────
  console.log('\n── Test 2: Auth user lookup (admin) ──');
  const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const authUser = listData?.users?.find((u) => u.email === TEST_EMAIL);
  if (!authUser) {
    console.error(`  ✗ Auth user not found for: ${TEST_EMAIL}`);
    return;
  }
  console.log(`  ✓ Auth user found: id=${authUser.id}  confirmed=${!!authUser.email_confirmed_at}`);

  // Check if staff.id matches auth.user.id
  const matchingStaff = staffRows?.find((s) => s.id === authUser.id);
  if (!matchingStaff) {
    console.error(`  ✗ MISMATCH: Auth user id (${authUser.id}) does NOT match any staff.id`);
    console.log('    Staff IDs in DB:', staffRows?.map((s) => `${s.email}=${s.id}`).join(', '));
  } else {
    console.log(`  ✓ staff.id matches auth.uid: ${authUser.id}`);
  }

  // ── 3. Sign in as owner and test RLS-gated query ───────────────────────────
  console.log('\n── Test 3: Sign in and query staff table (as user, with RLS) ──');
  const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
    email:    TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signInErr || !signInData?.session) {
    console.error('  ✗ Sign-in failed:', signInErr?.message);
    return;
  }
  console.log('  ✓ Signed in successfully');
  console.log('  Access token (first 40 chars):', signInData.session.access_token.slice(0, 40) + '...');

  // Create a client with the user's JWT
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth:    { persistSession: false, autoRefreshToken: false },
    global:  { headers: { Authorization: `Bearer ${signInData.session.access_token}` } },
  });

  // Query own staff row (RLS: id = auth.uid())
  const { data: ownRow, error: ownErr } = await userClient
    .from('staff')
    .select('id, email, full_name, role, is_active, hotel_id')
    .eq('id', signInData.user.id)
    .maybeSingle();

  if (ownErr) {
    console.error('  ✗ RLS blocked staff self-query:', ownErr.message, ownErr.code);
  } else if (!ownRow) {
    console.error('  ✗ RLS returned NULL — staff row exists but policy blocks it');
    console.log('    → The RLS policy likely needs: "id = auth.uid()" to be present');
  } else {
    console.log('  ✓ RLS self-query succeeded:', ownRow.full_name, '[' + ownRow.role + ']');
  }

  // Also query with hotel join (mimics session.ts)
  const { data: joinRow, error: joinErr } = await userClient
    .from('staff')
    .select('id, email, full_name, role, is_active, hotel_id, hotel:hotel_id(id, name, slug)')
    .eq('id', signInData.user.id)
    .maybeSingle();

  if (joinErr) {
    console.error('  ✗ Hotel join query failed:', joinErr.message);
  } else if (!joinRow) {
    console.error('  ✗ Hotel join returned NULL (hotels table RLS may block it)');
  } else {
    console.log('  ✓ Hotel join succeeded — hotel:', joinRow.hotel?.name);
  }

  // ── 4. Check RLS policies live ─────────────────────────────────────────────
  console.log('\n── Test 4: Active RLS policies on staff table ──');
  const { data: policies, error: polErr } = await adminClient
    .rpc('pg_policies_for_table', { table_name: 'staff' })
    .select('*');

  if (polErr || !policies) {
    // Fallback: query pg_policies directly via SQL
    const { data: pols } = await adminClient
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'staff');
    if (pols) {
      pols.forEach((p) => console.log(`  [${p.cmd}] ${p.policyname}: ${p.qual}`));
    } else {
      console.log('  (Could not retrieve policies — check Supabase dashboard manually)');
    }
  } else {
    policies.forEach((p) => console.log(`  [${p.cmd}] ${p.policyname}`));
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Diagnosis complete. Review failures above.');
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
