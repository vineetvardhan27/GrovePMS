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

let testCount = 0;
let passedCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runComprehensiveVerification() {
  console.log('\n======================================================');
  console.log('PMS AUTHENTICATION & OWNER-STAFF ARCHITECTURE TEST SUITE');
  console.log('======================================================\n');

  // --- Suite 1: Production Hotel Integrity ---
  console.log('--- Suite 1: Production Data & Owner Verification ---');
  const { data: hotels, error: hErr } = await admin.from('hotels').select('*');
  assert(!hErr && hotels && hotels.length > 0, 'Hotels table accessible and populated');

  const mainHotel = hotels?.find((h) => h.id === 'a0000000-0000-0000-0000-000000000001');
  assert(Boolean(mainHotel), 'Hotel Greenery View (a0000000-0000-0000-0000-000000000001) exists intact');

  const { data: staffList, error: sErr } = await admin
    .from('staff')
    .select('*')
    .eq('hotel_id', 'a0000000-0000-0000-0000-000000000001');

  assert(!sErr && staffList && staffList.length >= 4, 'Staff roster contains all operational roles');

  const owners = staffList.filter((s) => s.role === 'owner');
  assert(owners.length === 1, `Rule Check: Exactly 1 Owner exists for Hotel Greenery View (Found: ${owners.length})`);
  assert(owners[0].email === 'owner@hotelgreeneryview.com', `Legitimate Owner is Ohm Adhikari (${owners[0].email})`);

  // Verify rooms and production inventory
  const { data: rooms } = await admin
    .from('rooms')
    .select('id, room_number')
    .eq('hotel_id', 'a0000000-0000-0000-0000-000000000001');
  assert(rooms && rooms.length === 19, `All 19 production rooms preserved (Found: ${rooms?.length})`);

  // --- Suite 2: Multi-Tenant & Multiple Hotels Owner Rule ---
  console.log('\n--- Suite 2: One Hotel = Exactly One Owner Multi-Tenant Rule ---');
  const { data: allStaff } = await admin.from('staff').select('id, email, role, hotel_id');
  const ownersByHotel = {};
  allStaff?.forEach((s) => {
    if (s.role === 'owner') {
      ownersByHotel[s.hotel_id] = ownersByHotel[s.hotel_id] || [];
      ownersByHotel[s.hotel_id].push(s);
    }
  });

  let duplicateOwnerFound = false;
  for (const [hotelId, ownerGroup] of Object.entries(ownersByHotel)) {
    if (ownerGroup.length > 1) {
      duplicateOwnerFound = true;
      console.error(`Duplicate owner in hotel ${hotelId}:`, ownerGroup);
    }
  }
  assert(!duplicateOwnerFound, 'System-wide Check: Zero hotels have multiple owners');

  // --- Suite 3: Auth Resolution Test ---
  console.log('\n--- Suite 3: Auth Resolution Chain ---');
  // Check auth user exists for owner
  const { data: authUser, error: aErr } = await admin.auth.admin.getUserById(owners[0].id);
  assert(!aErr && authUser?.user, 'Supabase Auth User exists for Owner ID');
  assert(authUser.user.email === owners[0].email, 'Auth email matches Staff email record');

  // --- Summary ---
  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passedCount} / ${testCount} Passed`);
  console.log('======================================================\n');
}

runComprehensiveVerification();
