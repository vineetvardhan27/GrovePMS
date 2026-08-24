#!/usr/bin/env node
/**
 * Test script to verify guest revenue and stay calculations
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

function formatCurrency(amount, currencySymbol = '₹', locale = 'en-IN') {
  if (isNaN(amount)) return `${currencySymbol}0.00`;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currencySymbol}${formatted}`;
}

async function runTests() {
  console.log('========================================================================');
  console.log('  GUEST DATABASE TOTAL REVENUE VERIFICATION SUITE');
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

  // 1. Fetch raw data
  const { data: guests, error: guestsErr } = await admin.from('guests').select('*').order('full_name', { ascending: true });
  assert(!guestsErr && guests && guests.length > 0, `Fetched ${guests?.length || 0} guests from database`);

  const { data: bookings, error: bookingsErr } = await admin.from('bookings').select('*');
  assert(!bookingsErr && bookings, `Fetched ${bookings?.length || 0} bookings from database`);

  const { data: hotel } = await admin.from('hotels').select('*').maybeSingle();
  const foodCharges = (hotel?.settings?.food_charges || []);
  const fbBills = (hotel?.settings?.fb_bills || []);

  console.log(`\n  Context: Found ${foodCharges.length} food charges and ${fbBills.length} FB bills`);

  // Group valid bookings
  const bookingsByGuest = new Map();
  const bookingToGuestMap = new Map();

  for (const b of (bookings || [])) {
    if (b.booking_status !== 'cancelled') {
      const list = bookingsByGuest.get(b.guest_id) || [];
      list.push(b);
      bookingsByGuest.set(b.guest_id, list);
      bookingToGuestMap.set(b.id, b.guest_id);
    }
  }

  // Group food charges
  const foodChargesByGuest = new Map();
  for (const fc of foodCharges) {
    const targetGuestId = fc.guest_id || (fc.booking_id ? bookingToGuestMap.get(fc.booking_id) : undefined);
    if (targetGuestId) {
      const currentSum = foodChargesByGuest.get(targetGuestId) || 0;
      foodChargesByGuest.set(targetGuestId, currentSum + (Number(fc.total_amount) || 0));
    }
  }

  // Group direct F&B bills
  const directFbBillsByGuest = new Map();
  for (const bill of fbBills) {
    if (
      bill.billing_mode !== 'charge_to_room' &&
      bill.bill_status !== 'cancelled' &&
      bill.bill_status !== 'void'
    ) {
      const targetGuestId = bill.guest_id || (bill.booking_id ? bookingToGuestMap.get(bill.booking_id) : undefined);
      if (targetGuestId) {
        const currentSum = directFbBillsByGuest.get(targetGuestId) || 0;
        directFbBillsByGuest.set(targetGuestId, currentSum + (Number(bill.grand_total) || 0));
      }
    }
  }

  const computedGuests = guests.map((guest) => {
    const validBookings = bookingsByGuest.get(guest.id) || [];
    const roomRevenue = validBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const foodRevenue = foodChargesByGuest.get(guest.id) || 0;
    const directFbRevenue = directFbBillsByGuest.get(guest.id) || 0;
    const totalSpent = Math.round((roomRevenue + foodRevenue + directFbRevenue) * 100) / 100;

    return {
      id: guest.id,
      name: guest.full_name,
      total_stays: validBookings.length,
      room_revenue: roomRevenue,
      food_revenue: foodRevenue,
      direct_fb_revenue: directFbRevenue,
      total_spent: totalSpent,
      formatted: formatCurrency(totalSpent),
    };
  });

  console.log('\n--- Computed Guest Metrics ---');
  console.table(computedGuests.map(g => ({
    name: g.name,
    stays: g.total_stays,
    room: g.room_revenue,
    food: g.food_revenue,
    directFB: g.direct_fb_revenue,
    total: g.total_spent,
    formatted: g.formatted
  })));

  // Verify Harsh Vardhan
  const harsh = computedGuests.find(g => g.name === 'Harsh Vardhan');
  assert(harsh !== undefined, 'Harsh Vardhan found in guest directory');
  if (harsh) {
    assert(harsh.total_stays === 1, `Harsh Vardhan has 1 stay (got: ${harsh.total_stays})`);
    assert(harsh.room_revenue === 4500, `Harsh Vardhan room billing is ₹4,500 (got: ₹${harsh.room_revenue})`);
    assert(harsh.food_revenue === 100, `Harsh Vardhan food charges is ₹100 (got: ₹${harsh.food_revenue})`);
    assert(harsh.total_spent === 4600, `Harsh Vardhan total revenue is ₹4,600 (got: ₹${harsh.total_spent})`);
    assert(harsh.formatted === '₹4,600.00', `Harsh Vardhan formatted total is ₹4,600.00 (got: ${harsh.formatted})`);
  }

  // Verify Vineet Vardhan (multiple stays, multiple food charges, direct F&B bill)
  const vineet = computedGuests.find(g => g.name === 'Vineet Vardhan');
  assert(vineet !== undefined, 'Vineet Vardhan found in guest directory');
  if (vineet) {
    assert(vineet.total_stays === 5, `Vineet Vardhan has 5 completed stays (got: ${vineet.total_stays})`);
    assert(vineet.room_revenue === 45000, `Vineet Vardhan room revenue is ₹45,000 (got: ₹${vineet.room_revenue})`);
    assert(vineet.food_revenue === 1520, `Vineet Vardhan food folio revenue is ₹1,520 (got: ₹${vineet.food_revenue})`);
    assert(vineet.direct_fb_revenue === 492.8, `Vineet Vardhan direct F&B revenue is ₹492.80 (got: ₹${vineet.direct_fb_revenue})`);
    assert(vineet.total_spent === 47012.8, `Vineet Vardhan cumulative total is ₹47,012.80 (got: ₹${vineet.total_spent})`);
    assert(vineet.formatted === '₹47,012.80', `Vineet Vardhan formatted total is ₹47,012.80 (got: ${vineet.formatted})`);
  }

  // Verify guests with zero revenue / cancelled stays
  const zeroGuests = computedGuests.filter(g => g.total_stays === 0);
  assert(zeroGuests.length >= 3, `Found ${zeroGuests.length} guests with zero stays`);
  zeroGuests.forEach(g => {
    assert(g.total_spent === 0, `Guest ${g.name} with 0 valid stays has 0 revenue`);
    assert(g.formatted === '₹0.00', `Guest ${g.name} formats accurately as ₹0.00`);
  });

  // Verify Rahul Gandhi (1 stay, 0 food charges)
  const rahul = computedGuests.find(g => g.name === 'Rahul gandhi');
  assert(rahul !== undefined, 'Rahul gandhi found');
  if (rahul) {
    assert(rahul.total_stays === 1, 'Rahul gandhi has 1 stay');
    assert(rahul.total_spent === 9000, 'Rahul gandhi has ₹9,000 total revenue');
    assert(rahul.formatted === '₹9,000.00', 'Rahul gandhi formatted is ₹9,000.00');
  }

  console.log(`\n========================================================================`);
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
