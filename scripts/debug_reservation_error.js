#!/usr/bin/env node
/**
 * Debug Reservation Creation RPC and Direct Booking
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
  console.log('--- Debugging Reservation Creation with Authenticated Staff ---');

  const { data: staffList, error: sErr } = await admin.from('staff').select('*').eq('is_active', true);
  console.log('Active staff in DB:', staffList?.map(s => ({ id: s.id, email: s.email, role: s.role, hotel_id: s.hotel_id })));

  const { data: rooms } = await admin.from('rooms').select('id, hotel_id, room_number').limit(1);
  const room = rooms[0];
  console.log('Using Room:', room);

  // Let's test signing in with owner email
  const userClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Try sign in or generate session
  const testStaff = staffList[0];
  console.log('Target Staff:', testStaff?.email);

  // Test calling RPC create_booking_transaction with staff session
  // If we sign in with password
  const { data: authData, error: authErr } = await userClient.auth.signInWithPassword({
    email: testStaff.email,
    password: 'HotelDemo@2026!',
  });

  if (authErr) {
    console.log('Password auth error (will test with token):', authErr.message);
  } else {
    console.log('Successfully signed in as:', authData.user?.email);
    const { data: rpcRes, error: rpcErr } = await userClient.rpc('create_booking_transaction', {
      p_room_id: room.id,
      p_guest_name: 'Test Guest',
      p_guest_phone: '+919876543210',
      p_check_in_date: '2026-11-10',
      p_check_out_date: '2026-11-12',
      p_rate_per_night: 2500,
      p_advance_amount: 0,
      p_adults: 1,
      p_children: 0,
      p_source: 'direct'
    });

    console.log('RPC Result with User Session:', rpcRes);
    console.log('RPC Error with User Session:', rpcErr);
  }
}

main().catch(console.error);
