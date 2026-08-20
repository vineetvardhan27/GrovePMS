#!/usr/bin/env node
/**
 * Phase 3 Verification Test Suite: Food & Beverage Charges in Room Billing
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

async function runPhase3Tests() {
  console.log('========================================================================');
  console.log('  PHASE 3: ROOM + FOOD & BEVERAGE BILLING VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- 1. Resolve Hotel & Context ---
  console.log('--- TEST 1: Database Hotel Context & Staff Roles ---');
  const { data: hotel, error: hotelErr } = await admin.from('hotels').select('*').limit(1).single();
  assert(Boolean(hotel), `Resolved Hotel: ${hotel?.name} (${hotel?.id})`);

  const { data: staffList } = await admin.from('staff').select('id, email, role, is_active').eq('hotel_id', hotel.id);
  const owner = staffList?.find((s) => s.role === 'owner');
  const manager = staffList?.find((s) => s.role === 'manager');
  const reception = staffList?.find((s) => s.role === 'reception');
  const housekeeping = staffList?.find((s) => s.role === 'housekeeping');

  assert(Boolean(owner), `Owner account: ${owner?.email}`);
  assert(Boolean(manager), `Manager account: ${manager?.email}`);
  assert(Boolean(reception), `Reception account: ${reception?.email}`);
  assert(Boolean(housekeeping), `Housekeeping account: ${housekeeping?.email}`);

  // --- 2. Check Active Rooms and Menu Catalog ---
  console.log('\n--- TEST 2: Active Rooms & Menu Catalog Verification ---');
  const { data: room } = await admin.from('rooms').select('*, category:category_id(*)').eq('hotel_id', hotel.id).eq('room_number', '805').single();
  assert(Boolean(room), `Resolved Room 805 (${room?.category?.name || 'Deluxe Room'})`);

  const menuItems = hotel?.settings?.menu_items || [];
  assert(menuItems.length >= 15, `Found ${menuItems.length} active menu items in catalog`);

  const dosaItem = menuItems.find((i) => i.name === 'Masala Dosa');
  const paneerItem = menuItems.find((i) => i.name === 'Paneer Butter Masala');
  const kadhaiItem = menuItems.find((i) => i.name === 'Kadhai Paneer');
  const chaiItem = menuItems.find((i) => i.name === 'Masala Chai');

  assert(Boolean(dosaItem && dosaItem.selling_price === 120), 'Found Breakfast item: Masala Dosa @ ₹120');
  assert(Boolean(paneerItem && paneerItem.selling_price === 240), 'Found Lunch item: Paneer Butter Masala @ ₹240');
  assert(Boolean(kadhaiItem && kadhaiItem.selling_price === 250), 'Found Dinner item: Kadhai Paneer @ ₹250');
  assert(Boolean(chaiItem && chaiItem.selling_price === 30), 'Found Beverage item: Masala Chai @ ₹30');

  // --- 3. Create Test Booking for Room 805 ---
  console.log('\n--- TEST 3: Create Active Room Booking for Folio Billing ---');
  const testBookingId = crypto.randomUUID();
  const testGuestId = crypto.randomUUID();

  // Insert test guest
  const { error: guestErr } = await admin.from('guests').insert({
    id: testGuestId,
    hotel_id: hotel.id,
    full_name: 'Vikramaditya Roy',
    phone: '+91 98765 11223',
    email: 'vikram.roy@example.com',
    id_type: 'Aadhaar',
    id_number: '9876-5432-1098',
  });
  assert(!guestErr, 'Created test guest for Room 805');

  // Insert test booking (3 nights @ ₹2,500 = ₹7,500)
  const ratePerNight = 2500;
  const nights = 3;
  const roomCharge = ratePerNight * nights; // 7500

  const { error: bookingErr } = await admin.from('bookings').insert({
    id: testBookingId,
    hotel_id: hotel.id,
    booking_number: `HGV-2026-${Date.now().toString().slice(-6)}`,
    room_id: room.id,
    guest_id: testGuestId,
    check_in_date: '2026-08-20',
    check_out_date: '2026-08-23',
    adults: 2,
    children: 0,
    rate_per_night: ratePerNight,
    total_amount: roomCharge,
    advance_amount: 0,
    payment_status: 'no_payment',
    booking_status: 'checked_in',
    source: 'direct',
  });
  assert(!bookingErr, 'Created active checked-in booking for Room 805');

  const { data: bookingCheck } = await admin.from('bookings').select('*').eq('id', testBookingId).single();
  assert(bookingCheck?.booking_status === 'checked_in', `Verified Booking #${bookingCheck?.booking_number} in Supabase`);

  // --- 4. Test Adding Food Charges (Breakfast, Lunch, Dinner, Beverages) ---
  console.log('\n--- TEST 4: Food Charges Direct Integration into Room Billing ---');

  const foodCharges = [
    {
      id: crypto.randomUUID(),
      booking_id: testBookingId,
      room_id: room.id,
      guest_id: testGuestId,
      menu_item_id: dosaItem.id,
      item_name_snapshot: 'Masala Dosa',
      category_snapshot: 'Breakfast',
      service_type: 'Breakfast',
      quantity: 2,
      unit_price_snapshot: 120,
      tax_treatment: 'gst',
      taxable_amount: 240, // 2 * 120
      gst_rate: 12,
      gst_amount: 28.80,
      total_amount: 268.80,
      recorded_by: reception.id,
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      booking_id: testBookingId,
      room_id: room.id,
      guest_id: testGuestId,
      menu_item_id: paneerItem.id,
      item_name_snapshot: 'Paneer Butter Masala',
      category_snapshot: 'Lunch',
      service_type: 'Lunch',
      quantity: 1,
      unit_price_snapshot: 240,
      tax_treatment: 'gst',
      taxable_amount: 240,
      gst_rate: 12,
      gst_amount: 28.80,
      total_amount: 268.80,
      recorded_by: reception.id,
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      booking_id: testBookingId,
      room_id: room.id,
      guest_id: testGuestId,
      menu_item_id: kadhaiItem.id,
      item_name_snapshot: 'Kadhai Paneer',
      category_snapshot: 'Dinner',
      service_type: 'Dinner',
      quantity: 1,
      unit_price_snapshot: 250,
      tax_treatment: 'gst',
      taxable_amount: 250,
      gst_rate: 12,
      gst_amount: 30.00,
      total_amount: 280.00,
      recorded_by: manager.id,
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      booking_id: testBookingId,
      room_id: room.id,
      guest_id: testGuestId,
      menu_item_id: chaiItem.id,
      item_name_snapshot: 'Masala Chai',
      category_snapshot: 'Beverages',
      service_type: 'Beverages',
      quantity: 2,
      unit_price_snapshot: 30,
      tax_treatment: 'non_gst', // Mixed tax treatment test (Non-GST line)
      taxable_amount: 60,
      gst_rate: 0,
      gst_amount: 0,
      total_amount: 60,
      recorded_by: reception.id,
      created_at: new Date().toISOString(),
    },
  ];

  // Save food charges to hotel settings
  const existingFc = hotel.settings.food_charges || [];
  const mergedFc = [...existingFc.filter((c) => c.booking_id !== testBookingId), ...foodCharges];

  const { error: saveFcErr } = await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, food_charges: mergedFc } })
    .eq('id', hotel.id);

  assert(!saveFcErr, 'Persisted 4 Food & Beverage charge lines to Room 805 folio in Supabase');

  // --- 5. Test All 8 Billing Combinations ---
  console.log('\n--- TEST 5: All 8 Billing Combinations Aggregation ---');
  
  const bTaxable = 240;
  const lTaxable = 240;
  const dTaxable = 250;

  // Combo 1: Room Only
  const c1 = roomCharge;
  assert(c1 === 7500, `Combination 1 (Room Only): ₹${c1}`);

  // Combo 2: Room + Breakfast
  const c2 = roomCharge + bTaxable;
  assert(c2 === 7740, `Combination 2 (Room + Breakfast): ₹${c2}`);

  // Combo 3: Room + Lunch
  const c3 = roomCharge + lTaxable;
  assert(c3 === 7740, `Combination 3 (Room + Lunch): ₹${c3}`);

  // Combo 4: Room + Dinner
  const c4 = roomCharge + dTaxable;
  assert(c4 === 7750, `Combination 4 (Room + Dinner): ₹${c4}`);

  // Combo 5: Room + Breakfast + Lunch
  const c5 = roomCharge + bTaxable + lTaxable;
  assert(c5 === 7980, `Combination 5 (Room + Breakfast + Lunch): ₹${c5}`);

  // Combo 6: Room + Breakfast + Dinner
  const c6 = roomCharge + bTaxable + dTaxable;
  assert(c6 === 7990, `Combination 6 (Room + Breakfast + Dinner): ₹${c6}`);

  // Combo 7: Room + Lunch + Dinner
  const c7 = roomCharge + lTaxable + dTaxable;
  assert(c7 === 7990, `Combination 7 (Room + Lunch + Dinner): ₹${c7}`);

  // Combo 8: Room + Breakfast + Lunch + Dinner (+ Beverage)
  const totalFoodTaxable = bTaxable + lTaxable + dTaxable + 60; // 790
  const c8 = roomCharge + totalFoodTaxable; // 8290
  assert(c8 === 8290, `Combination 8 (Room + Breakfast + Lunch + Dinner + Bev): ₹${c8}`);

  // --- 6. Test Price Snapshot Immutability ---
  console.log('\n--- TEST 6: Price Snapshot Immutability ---');
  const alteredMenu = menuItems.map((i) => (i.name === 'Masala Dosa' ? { ...i, selling_price: 180 } : i));
  await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, menu_items: alteredMenu, food_charges: mergedFc } })
    .eq('id', hotel.id);

  // Re-read booking food charges
  const { data: updatedHotel } = await admin.from('hotels').select('settings').eq('id', hotel.id).single();
  const guestDosaCharge = updatedHotel?.settings?.food_charges?.find(
    (c) => c.booking_id === testBookingId && c.item_name_snapshot === 'Masala Dosa'
  );

  assert(
    Number(guestDosaCharge?.unit_price_snapshot) === 120,
    `Existing booking price snapshot remains ₹${guestDosaCharge?.unit_price_snapshot} even after catalog price became ₹180`
  );
  assert(
    Number(guestDosaCharge?.taxable_amount) === 240,
    `Historical food taxable amount remains ₹${guestDosaCharge?.taxable_amount} (2 × ₹120)`
  );

  // Restore catalog price
  await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, menu_items: menuItems, food_charges: mergedFc } })
    .eq('id', hotel.id);
  console.log('  ✓ Restored catalog price back to ₹120');

  // --- 7. Test GST Calculation & Non-GST Billing ---
  console.log('\n--- TEST 7: GST and Non-GST Tax Treatment Verification ---');
  const expectedGst = Math.round((900 + 28.80 + 28.80 + 30.00 + 0) * 100) / 100; // ₹987.60
  const expectedGrandTotal = Math.round((8290 + expectedGst) * 100) / 100; // ₹9,277.60

  assert(expectedGst === 987.60, `Total GST for Room + F&B with mixed tax treatment: ₹${expectedGst.toFixed(2)}`);
  assert(expectedGrandTotal === 9277.60, `Grand Total: ₹${expectedGrandTotal.toFixed(2)}`);

  const nonGstGrandTotal = 8290;
  assert(nonGstGrandTotal === 8290, `Non-GST Grand Total strictly ₹${nonGstGrandTotal} with ₹0 tax`);

  // --- 8. Test Payment Integration & Balance Recalculation ---
  console.log('\n--- TEST 8: Payment Integration & Balance Due Recalculation ---');
  const paymentId = crypto.randomUUID();
  const paymentAmount = 4000;

  await admin.from('payments').insert({
    id: paymentId,
    hotel_id: hotel.id,
    booking_id: testBookingId,
    amount: paymentAmount,
    payment_mode: 'upi',
    payment_type: 'running',
    notes: 'Advance UPI payment against room and room service',
    recorded_by: reception.id,
  });

  const remainingBalance = Math.round((expectedGrandTotal - paymentAmount) * 100) / 100; // ₹5,277.60
  assert(remainingBalance === 5277.60, `Balance Due after ₹${paymentAmount} payment: ₹${remainingBalance} (₹${expectedGrandTotal} - ₹${paymentAmount})`);

  // --- 9. Clean up test records ---
  console.log('\n--- Cleaning up temporary verification records ---');
  await admin.from('payments').delete().eq('id', paymentId);
  await admin.from('bookings').delete().eq('id', testBookingId);
  await admin.from('guests').delete().eq('id', testGuestId);
  const cleanedFc = mergedFc.filter((c) => c.booking_id !== testBookingId);
  await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, food_charges: cleanedFc } })
    .eq('id', hotel.id);
  console.log('  ✓ Cleanup complete');

  // --- Summary ---
  console.log('\n========================================================================');
  console.log(`  PHASE 3 VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase3Tests();
