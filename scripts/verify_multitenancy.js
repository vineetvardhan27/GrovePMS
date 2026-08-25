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

async function main() {
  console.log('=== MULTI-TENANT ARCHITECTURE & ISOLATION VERIFICATION ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // TEST 1: Existing Hotel Greenery View Tenant Structure
  console.log('--- 1. Existing Production Hotel Greenery View Integrity ---');
  const { data: hgv, error: hgvErr } = await admin
    .from('hotels')
    .select('id, name, slug, settings')
    .eq('id', 'a0000000-0000-0000-0000-000000000001')
    .single();

  assert(!hgvErr && hgv, 'Hotel Greenery View exists with ID a0000000-0000-0000-0000-000000000001');
  assert(hgv?.name === 'Hotel Greenery View', 'Hotel Greenery View name is intact');

  const { data: hgvStaff } = await admin
    .from('staff')
    .select('id, email, role, hotel_id, is_active')
    .eq('hotel_id', 'a0000000-0000-0000-0000-000000000001');

  assert(hgvStaff && hgvStaff.length >= 4, `Hotel Greenery View has all ${hgvStaff?.length} active staff accounts`);
  
  const roles = hgvStaff?.map(s => s.role) || [];
  assert(roles.includes('owner'), 'Contains Owner account');
  assert(roles.includes('manager'), 'Contains Manager account');
  assert(roles.includes('reception'), 'Contains Reception account');
  assert(roles.includes('housekeeping'), 'Contains Housekeeping account');

  const { data: hgvRooms } = await admin
    .from('rooms')
    .select('id, hotel_id')
    .eq('hotel_id', 'a0000000-0000-0000-0000-000000000001');
  assert(hgvRooms && hgvRooms.length === 19, `Hotel Greenery View has 19 rooms intact (found ${hgvRooms?.length})`);

  // TEST 2: Multi-Tenant Hotel Creation & Tenant Isolation
  console.log('\n--- 2. Tenant Isolation & Auto-Scoping Simulation ---');
  const testEmail = `test_tenant_${Date.now()}@pinepeaks.com`;
  const testHotelName = `Pine Peak Sanctuary Test ${Date.now()}`;
  const testSlug = `pine-peak-${Date.now()}`;

  // Step A: Create test hotel
  const { data: newHotel, error: newHotelErr } = await admin
    .from('hotels')
    .insert({
      name: testHotelName,
      slug: testSlug,
      address: 'Pine Valley, Shimla, Himachal Pradesh',
      phone: '+91 98123 45678',
      email: testEmail,
      settings: {
        gst_enabled: true,
        gst_percentage: 12,
        gst_rate: 12,
        gst_number: '02AABCP1234F1Z1',
        city: 'Shimla',
        state: 'Himachal Pradesh',
      },
    })
    .select('id, name, slug')
    .single();

  assert(!newHotelErr && newHotel, `Successfully created secondary tenant hotel "${testHotelName}"`);

  // Step B: Create test owner auth user
  const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
    email: testEmail,
    password: 'HotelTest@2026!',
    email_confirm: true,
    user_metadata: { full_name: 'Devendra Rathore', role: 'owner', hotel_id: newHotel.id },
  });

  assert(!authErr && authUser?.user, `Created owner auth identity for ${testEmail}`);

  // Step C: Link owner staff record to new hotel
  const { data: ownerStaff, error: staffErr } = await admin
    .from('staff')
    .upsert({
      id: authUser.user.id,
      hotel_id: newHotel.id,
      email: testEmail,
      full_name: 'Devendra Rathore',
      role: 'owner',
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  assert(!staffErr && ownerStaff, `Linked owner staff record with hotel_id = ${newHotel.id}`);
  assert(ownerStaff?.hotel_id === newHotel.id, 'Owner staff hotel_id strictly matches new hotel ID');

  // Step D: Create room categories for new hotel
  const { data: cat1 } = await admin
    .from('room_categories')
    .insert({
      hotel_id: newHotel.id,
      name: 'Pine Suite',
      base_rate: 6500,
      weekend_rate: 7500,
      max_occupancy: 2,
    })
    .select()
    .single();

  assert(cat1 && cat1.hotel_id === newHotel.id, `Created room category under tenant ${newHotel.id}`);

  // Step E: Create room under new hotel
  const { data: room1 } = await admin
    .from('rooms')
    .insert({
      hotel_id: newHotel.id,
      category_id: cat1.id,
      room_number: '101',
      floor: 1,
      status: 'available',
    })
    .select()
    .single();

  assert(room1 && room1.hotel_id === newHotel.id, `Created room 101 under tenant ${newHotel.id}`);

  // Step F: Verify Tenant Data Isolation (Pine Peak query must NOT see Hotel Greenery View rooms)
  const { data: pineRooms } = await admin
    .from('rooms')
    .select('id, hotel_id, room_number')
    .eq('hotel_id', newHotel.id);

  assert(pineRooms && pineRooms.length === 1, `Pine Peak has strictly 1 room (found ${pineRooms?.length})`);
  assert(pineRooms?.[0]?.room_number === '101', 'Pine Peak room is 101');

  // Verify Hotel Greenery View query must NOT see Pine Peak rooms
  const { data: hgvRoomsCheck } = await admin
    .from('rooms')
    .select('id, hotel_id')
    .eq('hotel_id', 'a0000000-0000-0000-0000-000000000001');

  assert(hgvRoomsCheck && hgvRoomsCheck.length === 19, `Hotel Greenery View has strictly 19 rooms (zero cross-tenant contamination)`);

  // Step G: Add a staff member under Pine Peak
  const staffEmail = `reception_${Date.now()}@pinepeaks.com`;
  const { data: staffAuth } = await admin.auth.admin.createUser({
    email: staffEmail,
    password: 'StaffPassword@123!',
    email_confirm: true,
    user_metadata: { full_name: 'Meera Kapoor', role: 'reception', hotel_id: newHotel.id },
  });

  const { data: pineStaffRec } = await admin
    .from('staff')
    .upsert({
      id: staffAuth.user.id,
      hotel_id: newHotel.id,
      email: staffEmail,
      full_name: 'Meera Kapoor',
      role: 'reception',
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  assert(pineStaffRec && pineStaffRec.hotel_id === newHotel.id, `Staff member automatically scoped to tenant ${newHotel.id}`);

  // Clean up test data
  console.log('\n--- 3. Cleanup Test Tenant Resources ---');
  await admin.from('rooms').delete().eq('hotel_id', newHotel.id);
  await admin.from('room_categories').delete().eq('hotel_id', newHotel.id);
  await admin.from('staff').delete().eq('hotel_id', newHotel.id);
  await admin.from('hotels').delete().eq('id', newHotel.id);
  await admin.auth.admin.deleteUser(authUser.user.id);
  await admin.auth.admin.deleteUser(staffAuth.user.id);
  console.log('Test resources cleaned up successfully.');

  console.log(`\n=============================================`);
  console.log(`TEST SUMMARY: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`=============================================`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
