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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('--- Multi-Tenant Database Inspection ---');
  
  // 1. Hotels
  const { data: hotels } = await supabase.from('hotels').select('*');
  console.log('Hotels found:', hotels?.length);
  console.log(hotels?.map(h => ({ id: h.id, name: h.name, slug: h.slug, logo_url: h.logo_url })));

  // 2. Staff
  const { data: staff } = await supabase.from('staff').select('id, email, full_name, role, hotel_id, is_active');
  console.log('Staff accounts found:', staff?.length);
  console.log(staff);

  // 3. Check hotel_id across key tables
  const tables = [
    'rooms', 'room_categories', 'guests', 'bookings', 'payments',
    'fb_bills', 'fb_orders', 'fb_payments', 'menu_items', 'menu_categories',
    'inventory_items', 'inventory_transactions', 'banquet_halls', 'banquet_bookings', 'banquet_charges', 'banquet_payments'
  ];

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id, hotel_id').limit(2);
    if (error) {
      console.log(`Table ${t}: Error (${error.message})`);
    } else {
      console.log(`Table ${t}: OK (${data?.length} rows checked, sample hotel_id: ${data?.[0]?.hotel_id})`);
    }
  }
}

main();
