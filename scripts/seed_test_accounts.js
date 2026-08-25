/**
 * seed_test_accounts.js
 *
 * Creates (or upserts) the 4 demo staff accounts in Supabase Auth
 * and ensures matching rows exist in the public.staff table.
 *
 * Usage:  node scripts/seed_test_accounts.js
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

const SUPABASE_URL      = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const HOTEL_ID          = 'a0000000-0000-0000-0000-000000000001';
const DEMO_PASSWORD     = 'HotelDemo@2026!';

// ── Test account definitions ───────────────────────────────────────────────────
const TEST_ACCOUNTS = [
  {
    email:     'owner@hotelgreeneryview.com',
    full_name: 'Ohm Adhikari',
    role:      'owner',
  },
  {
    email:     'manager@hotelgreeneryview.com',
    full_name: 'Priya Sharma',
    role:      'manager',
  },
  {
    email:     'reception@hotelgreeneryview.com',
    full_name: 'Rahul Verma',
    role:      'reception',
  },
  {
    email:     'housekeeping@hotelgreeneryview.com',
    full_name: 'Sunita Devi',
    role:      'housekeeping',
  },
];

// ── Admin Supabase client ──────────────────────────────────────────────────────
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function upsertAuthUser(account) {
  // 1. Try to find existing user by email
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);

  const existing = listData.users.find((u) => u.email === account.email);

  if (existing) {
    console.log(`  ✓ Auth user already exists: ${account.email} (id=${existing.id})`);
    // Update password in case it changed
    await admin.auth.admin.updateUserById(existing.id, { password: DEMO_PASSWORD });
    return existing.id;
  }

  // 2. Create new auth user
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email:          account.email,
    password:       DEMO_PASSWORD,
    email_confirm:  true,   // skip email confirmation for demo
  });

  if (createErr) throw new Error(`createUser(${account.email}) failed: ${createErr.message}`);
  console.log(`  + Created Auth user: ${account.email} (id=${created.user.id})`);
  return created.user.id;
}

async function upsertStaffRow(userId, account) {
  const { error } = await admin
    .from('staff')
    .upsert(
      {
        id:        userId,
        hotel_id:  HOTEL_ID,
        email:     account.email,
        full_name: account.full_name,
        role:      account.role,
        is_active: true,
      },
      { onConflict: 'id' }
    );

  if (error) throw new Error(`upsert staff(${account.email}) failed: ${error.message}`);
  console.log(`  ✓ Staff row upserted: ${account.full_name} [${account.role}]`);
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Hotel Greenery View — Demo Account Seeder   ');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Supabase URL : ${SUPABASE_URL}`);
  console.log(`  Hotel ID     : ${HOTEL_ID}`);
  console.log(`  Password     : ${DEMO_PASSWORD}`);
  console.log('───────────────────────────────────────────────\n');

  // Verify hotel exists
  const { data: hotel, error: hotelErr } = await admin
    .from('hotels')
    .select('id, name')
    .eq('id', HOTEL_ID)
    .maybeSingle();

  if (hotelErr || !hotel) {
    console.error('✗ Hotel not found in DB. Run the seed.sql first.\n', hotelErr?.message);
    process.exit(1);
  }
  console.log(`  Hotel found  : ${hotel.name}\n`);

  for (const account of TEST_ACCOUNTS) {
    console.log(`Processing: ${account.full_name} <${account.email}> [${account.role}]`);
    try {
      const userId = await upsertAuthUser(account);
      await upsertStaffRow(userId, account);
    } catch (err) {
      console.error(`  ✗ ERROR: ${err.message}`);
    }
    console.log();
  }

  console.log('───────────────────────────────────────────────');
  console.log('  Done! All 4 demo accounts are ready.');
  console.log('  Login at your app with password: HotelDemo@2026!');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
