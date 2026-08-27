#!/usr/bin/env node
/**
 * Inspect Current Production Data Inventory
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

async function inspectData() {
  console.log('========================================================================');
  console.log('  CURRENT DATABASE & STORAGE INVENTORY AUDIT');
  console.log('========================================================================\n');

  // 1. Hotels
  const { data: hotels } = await admin.from('hotels').select('*');
  console.log(`🏨 HOTELS (${hotels?.length || 0}):`);
  hotels?.forEach((h) => console.log(`  - [${h.id}] "${h.name}" (${h.email}, ${h.phone})`));

  // 2. Staff
  const { data: staff } = await admin.from('staff').select('*');
  console.log(`\n👥 STAFF ACCOUNTS (${staff?.length || 0}):`);
  staff?.forEach((s) => console.log(`  - [${s.id}] ${s.email} | Role: ${s.role} | Hotel: ${s.hotel_id}`));

  // 3. Rooms
  const { data: rooms } = await admin.from('rooms').select('id, hotel_id, room_number, floor, status');
  console.log(`\n🚪 ROOMS (${rooms?.length || 0}):`);
  rooms?.forEach((r) => console.log(`  - Room ${r.room_number} (Floor: ${r.floor}, Status: ${r.status}) [${r.id}]`));

  // 4. Guests
  const { data: guests } = await admin.from('guests').select('*');
  console.log(`\n👤 GUESTS (${guests?.length || 0}):`);
  guests?.forEach((g) => console.log(`  - [${g.id}] "${g.full_name}" (${g.phone}, ${g.email}) | Hotel: ${g.hotel_id}`));

  // 5. Bookings
  const { data: bookings } = await admin.from('bookings').select('*');
  console.log(`\n📅 BOOKINGS (${bookings?.length || 0}):`);
  bookings?.forEach((b) => console.log(`  - [${b.id}] Booking #${b.booking_number} | Room: ${b.room_id} | Guest: ${b.guest_id} | Dates: ${b.check_in_date} to ${b.check_out_date} | Status: ${b.booking_status} | Total: ₹${b.total_amount}`));

  // 6. Payments
  const { data: payments } = await admin.from('payments').select('*');
  console.log(`\n💳 PAYMENTS (${payments?.length || 0}):`);
  payments?.forEach((p) => console.log(`  - [${p.id}] Booking: ${p.booking_id} | ₹${p.amount} (${p.payment_mode}, ${p.payment_type})`));

  // 7. Invoices / Folios
  const { data: invoices } = await admin.from('invoices').select('*').catch(() => ({ data: [] }));
  console.log(`\n🧾 INVOICES (${invoices?.length || 0}):`);

  // 8. F&B Orders
  const { data: fnbOrders } = await admin.from('fnb_orders').select('*').catch(() => ({ data: [] }));
  console.log(`\n🍽️ F&B ORDERS (${fnbOrders?.length || 0}):`);

  // 9. Banquet Events
  const { data: banquetEvents } = await admin.from('banquet_events').select('*').catch(() => ({ data: [] }));
  console.log(`\n🎉 BANQUET EVENTS (${banquetEvents?.length || 0}):`);

  // 10. Storage Files
  console.log(`\n📦 STORAGE OBJECTS IN 'guest-documents':`);
  for (const h of hotels || []) {
    const { data: hotelGuests } = await admin.storage.from('guest-documents').list(`hotel/${h.id}/guests`);
    if (hotelGuests && hotelGuests.length > 0) {
      console.log(`  Hotel [${h.name}]:`);
      for (const gFolder of hotelGuests) {
        console.log(`    Guest Folder: ${gFolder.name}`);
        const { data: docFolders } = await admin.storage.from('guest-documents').list(`hotel/${h.id}/guests/${gFolder.name}/documents`);
        docFolders?.forEach((df) => console.log(`      Doc Folder: ${df.name}`));
      }
    }
  }

  console.log('\n========================================================================\n');
}

inspectData().catch(console.error);
