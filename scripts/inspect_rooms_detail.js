#!/usr/bin/env node
/**
 * Detailed Room and Tenant Audit
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

async function main() {
  console.log('--- Room & Category Analysis ---');
  const hotelId = 'a0000000-0000-0000-0000-000000000001';

  const { data: categories } = await admin.from('room_categories').select('*').eq('hotel_id', hotelId);
  console.log('\nRoom Categories:');
  categories?.forEach((c) => console.log(`  - [${c.id}] ${c.name} (Base Rate: ₹${c.base_rate}, Capacity: ${c.max_occupancy})`));

  const { data: rooms } = await admin.from('rooms').select('*').eq('hotel_id', hotelId).order('room_number');
  console.log(`\nRooms (${rooms?.length || 0}):`);
  rooms?.forEach((r) => console.log(`  - Room ${r.room_number.padEnd(12)} | Floor: ${r.floor} | Status: ${r.status} | Cat: ${r.category_id} | ID: ${r.id}`));
}

main().catch(console.error);
