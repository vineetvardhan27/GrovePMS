#!/usr/bin/env node
/**
 * Apply Migration 0010: Ensure floors, categories, and property resources in Supabase
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

const CAT_IDS = {
  PREMIUM: 'c0000000-0000-0000-0000-000000000001',
  DELUXE: 'c0000000-0000-0000-0000-000000000002',
  LUXURY: 'c0000000-0000-0000-0000-000000000003',
  MOUNTAIN: 'c0000000-0000-0000-0000-000000000004',
  FAMILY: 'c0000000-0000-0000-0000-000000000005',
};

// Target room configurations
const ROOM_CONFIGS = [
  // Basement (floor 0)
  { num: 'FAMILY-APT', floor: 0, catId: CAT_IDS.FAMILY, id: 'd0000000-0000-0000-0000-000000000001' },

  // Ground Floor (floor 1)
  { num: '801', floor: 1, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000101' },
  { num: '802', floor: 1, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000102' },
  { num: '803', floor: 1, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000103' },
  { num: '804', floor: 1, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000104' },

  // First Floor (floor 2)
  { num: '805', floor: 2, catId: CAT_IDS.DELUXE, id: 'd0000000-0000-0000-0000-000000000201' },
  { num: '806', floor: 2, catId: CAT_IDS.DELUXE, id: 'd0000000-0000-0000-0000-000000000202' },
  { num: '807', floor: 2, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000203' },
  { num: '808', floor: 2, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000204' },
  { num: '809', floor: 2, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000205' },
  { num: '810', floor: 2, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000206' },
  { num: '811', floor: 2, catId: CAT_IDS.PREMIUM, id: 'd0000000-0000-0000-0000-000000000207' },

  // Second Floor (floor 3)
  { num: '812', floor: 3, catId: CAT_IDS.LUXURY, id: 'd0000000-0000-0000-0000-000000000301' },
  { num: '813', floor: 3, catId: CAT_IDS.LUXURY, id: 'd0000000-0000-0000-0000-000000000302' },
  { num: '814', floor: 3, catId: CAT_IDS.DELUXE, id: 'd0000000-0000-0000-0000-000000000303' },

  // Upper Floor (floor 4)
  { num: '815', floor: 4, catId: CAT_IDS.MOUNTAIN, id: 'd0000000-0000-0000-0000-000000000401' },
  { num: '816', floor: 4, catId: CAT_IDS.MOUNTAIN, id: 'd0000000-0000-0000-0000-000000000402' },
  { num: '817', floor: 4, catId: CAT_IDS.MOUNTAIN, id: 'd0000000-0000-0000-0000-000000000403' },
  { num: '818', floor: 4, catId: CAT_IDS.MOUNTAIN, id: 'd0000000-0000-0000-0000-000000000404' },
];

async function apply() {
  console.log('--- Applying Migration 0010: Physical Property & Room Updates ---');

  // 1. Resolve hotel
  const { data: hotel, error: hotelErr } = await admin.from('hotels').select('id, name').limit(1).single();
  if (hotelErr || !hotel) {
    console.error('❌ Could not find hotel:', hotelErr);
    process.exit(1);
  }
  console.log(`✓ Hotel: ${hotel.name} (${hotel.id})`);

  // 2. Upsert each room with exact floor and category
  for (const cfg of ROOM_CONFIGS) {
    const { data: existing } = await admin
      .from('rooms')
      .select('id, room_number')
      .or(`id.eq.${cfg.id},room_number.eq.${cfg.num}`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await admin
        .from('rooms')
        .update({
          room_number: cfg.num,
          floor: cfg.floor,
          category_id: cfg.catId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateErr) {
        console.error(`❌ Failed to update room ${cfg.num}:`, updateErr.message);
      } else {
        console.log(`✓ Updated Room ${cfg.num} -> Floor ${cfg.floor}, Category: ${cfg.catId}`);
      }
    } else {
      const { error: insertErr } = await admin
        .from('rooms')
        .insert({
          id: cfg.id,
          hotel_id: hotel.id,
          room_number: cfg.num,
          floor: cfg.floor,
          category_id: cfg.catId,
          status: 'available',
          housekeeping_status: 'clean',
        });

      if (insertErr) {
        console.error(`❌ Failed to insert room ${cfg.num}:`, insertErr.message);
      } else {
        console.log(`✓ Inserted Room ${cfg.num} -> Floor ${cfg.floor}`);
      }
    }
  }

  // 3. Verify total rooms and floor distribution
  const { data: allRooms } = await admin
    .from('rooms')
    .select('*, category:category_id(*)')
    .eq('hotel_id', hotel.id)
    .order('floor', { ascending: true })
    .order('room_number', { ascending: true });

  console.log(`\n=== Verification: Total Rooms in DB: ${allRooms ? allRooms.length : 0} ===`);
  const floorCounts = {};
  const catCounts = {};
  for (const r of allRooms || []) {
    floorCounts[r.floor] = (floorCounts[r.floor] || 0) + 1;
    const catName = r.category?.name || 'Unknown';
    catCounts[catName] = (catCounts[catName] || 0) + 1;
  }

  console.log('Floor breakdown:', floorCounts);
  console.log('Category breakdown:', catCounts);
}

apply();
