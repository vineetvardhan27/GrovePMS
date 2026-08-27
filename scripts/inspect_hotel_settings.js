#!/usr/bin/env node
/**
 * Inspect Hotel Settings Keys & Banquet / FB / Payment Data
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
  console.log('--- Inspecting Hotel Settings & Tables ---');
  const hotelId = 'a0000000-0000-0000-0000-000000000001';

  const { data: hotel, error } = await admin
    .from('hotels')
    .select('*')
    .eq('id', hotelId)
    .single();

  if (error) throw error;

  console.log('Hotel Name:', hotel.name);
  console.log('Hotel Settings Keys:', Object.keys(hotel.settings || {}));
  
  if (hotel.settings?.banquet_bookings) {
    console.log('Settings banquet_bookings count:', hotel.settings.banquet_bookings.length);
    console.log('Settings banquet_bookings:', hotel.settings.banquet_bookings);
  }
  if (hotel.settings?.banquet_charges) {
    console.log('Settings banquet_charges count:', hotel.settings.banquet_charges.length);
  }
  if (hotel.settings?.banquet_payments) {
    console.log('Settings banquet_payments count:', hotel.settings.banquet_payments.length);
    console.log('Settings banquet_payments:', hotel.settings.banquet_payments);
  }
  if (hotel.settings?.fb_bills) {
    console.log('Settings fb_bills count:', hotel.settings.fb_bills.length);
    console.log('Settings fb_bills:', hotel.settings.fb_bills);
  }

  // Also check database tables:
  const { data: bHalls } = await admin.from('banquet_halls').select('*').eq('hotel_id', hotelId);
  console.log('\nDB banquet_halls count:', bHalls?.length || 0);

  const { data: bCharges } = await admin.from('banquet_charges').select('*').eq('hotel_id', hotelId);
  console.log('DB banquet_charges count:', bCharges?.length || 0);

  const { data: bPayments } = await admin.from('banquet_payments').select('*').eq('hotel_id', hotelId);
  console.log('DB banquet_payments count:', bPayments?.length || 0);
}

main().catch(console.error);
