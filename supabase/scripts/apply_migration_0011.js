#!/usr/bin/env node
/**
 * Apply Migration 0011: Food Menu Management Module
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

const DEFAULT_CATEGORIES = [
  { id: 'e0000000-0000-0000-0000-000000000001', name: 'Breakfast', display_order: 1 },
  { id: 'e0000000-0000-0000-0000-000000000002', name: 'Lunch', display_order: 2 },
  { id: 'e0000000-0000-0000-0000-000000000003', name: 'Dinner', display_order: 3 },
  { id: 'e0000000-0000-0000-0000-000000000004', name: 'Snacks', display_order: 4 },
  { id: 'e0000000-0000-0000-0000-000000000005', name: 'Beverages', display_order: 5 },
  { id: 'e0000000-0000-0000-0000-000000000006', name: 'Other', display_order: 6 },
];

const DEFAULT_ITEMS = [
  { catName: 'Breakfast', name: 'Masala Dosa', price: 120, desc: 'Crispy rice crepe filled with spiced potato masala, served with sambar and fresh chutneys' },
  { catName: 'Breakfast', name: 'Idli Sambar (3 Pcs)', price: 80, desc: 'Steamed rice cakes served with aromatic lentil sambar and coconut chutney' },
  { catName: 'Breakfast', name: 'Poori Bhaji (4 Pcs)', price: 110, desc: 'Fluffy deep-fried pooris served with spiced potato curry' },
  { catName: 'Breakfast', name: 'Aloo Paratha with Curd', price: 100, desc: 'Stuffed whole wheat flatbread served with fresh curd and mixed pickle' },

  { catName: 'Lunch', name: 'Paneer Butter Masala', price: 240, desc: 'Cottage cheese cubes simmered in a rich, buttery tomato cream gravy' },
  { catName: 'Lunch', name: 'Dal Tadka', price: 160, desc: 'Yellow lentils tempered with ghee, cumin seeds, garlic, and fresh coriander' },
  { catName: 'Lunch', name: 'Veg Biryani with Raita', price: 210, desc: 'Fragrant basmati rice layered with garden vegetables and aromatic whole spices' },
  { catName: 'Lunch', name: 'Butter Roti (2 Pcs)', price: 40, desc: 'Tandoor-baked whole wheat flatbread brushed with fresh butter' },

  { catName: 'Dinner', name: 'Kadhai Paneer', price: 250, desc: 'Paneer and bell peppers cooked with freshly ground whole spices in a wok' },
  { catName: 'Dinner', name: 'Mixed Vegetable Curry', price: 180, desc: 'Seasonal fresh vegetables cooked in homestyle spiced onion-tomato gravy' },
  { catName: 'Dinner', name: 'Jeera Rice', price: 130, desc: 'Aromatic basmati rice tossed with cumin seeds and pure desi ghee' },

  { catName: 'Snacks', name: 'Crispy Veg Pakoda Platter', price: 90, desc: 'Assorted vegetable fritters served hot with mint and tamarind dips' },
  { catName: 'Snacks', name: 'French Fries', price: 100, desc: 'Crispy golden potato fries seasoned with peri-peri salt' },
  { catName: 'Snacks', name: 'Veg Grilled Cheese Sandwich', price: 130, desc: 'Toasted triple-decker sandwich loaded with vegetables and mozzarella cheese' },

  { catName: 'Beverages', name: 'Masala Chai', price: 30, desc: 'Authentic Indian tea brewed with crushed ginger, cardamom, and whole milk' },
  { catName: 'Beverages', name: 'Filter Coffee', price: 40, desc: 'Traditional South Indian frothy filter coffee' },
  { catName: 'Beverages', name: 'Fresh Lime Soda (Sweet/Salt)', price: 60, desc: 'Freshly squeezed lemon juice with chilled sparkling soda' },
  { catName: 'Beverages', name: 'Packaged Mineral Water (1L)', price: 20, desc: 'Sealed packaged drinking water bottle' },
];

async function apply() {
  console.log('--- Applying Migration 0011: Food Menu Management Module ---');

  // 1. Resolve Hotel
  const { data: hotel, error: hotelErr } = await admin.from('hotels').select('id, name').limit(1).single();
  if (hotelErr || !hotel) {
    console.error('❌ Could not find hotel:', hotelErr);
    process.exit(1);
  }
  console.log(`✓ Hotel: ${hotel.name} (${hotel.id})`);

  // 2. Upsert Menu Categories
  console.log('\n--- 2. Seeding Menu Categories ---');
  const catMap = new Map();

  for (const cat of DEFAULT_CATEGORIES) {
    const { data: existing } = await admin
      .from('menu_categories')
      .select('id, name')
      .eq('hotel_id', hotel.id)
      .eq('name', cat.name)
      .maybeSingle();

    if (existing) {
      catMap.set(cat.name, existing.id);
      console.log(`✓ Category "${cat.name}" exists (ID: ${existing.id})`);
    } else {
      const { data: inserted, error: insertErr } = await admin
        .from('menu_categories')
        .insert({
          id: cat.id,
          hotel_id: hotel.id,
          name: cat.name,
          display_order: cat.display_order,
          is_active: true,
        })
        .select()
        .single();

      if (insertErr) {
        console.error(`❌ Failed to insert category ${cat.name}:`, insertErr.message);
      } else {
        catMap.set(cat.name, inserted.id);
        console.log(`✓ Created Category "${cat.name}" (ID: ${inserted.id})`);
      }
    }
  }

  // 3. Upsert Menu Items
  console.log('\n--- 3. Seeding Menu Items ---');
  for (const item of DEFAULT_ITEMS) {
    const categoryId = catMap.get(item.catName);
    if (!categoryId) {
      console.error(`❌ Missing category ID for ${item.catName}`);
      continue;
    }

    const { data: existing } = await admin
      .from('menu_items')
      .select('id, name')
      .eq('hotel_id', hotel.id)
      .eq('name', item.name)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await admin
        .from('menu_items')
        .update({
          category_id: categoryId,
          selling_price: item.price,
          description: item.desc,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateErr) {
        console.error(`❌ Failed to update item ${item.name}:`, updateErr.message);
      } else {
        console.log(`✓ Updated "${item.name}" -> ₹${item.price} (${item.catName})`);
      }
    } else {
      const { error: insertErr } = await admin
        .from('menu_items')
        .insert({
          hotel_id: hotel.id,
          category_id: categoryId,
          name: item.name,
          description: item.desc,
          selling_price: item.price,
          is_active: true,
        });

      if (insertErr) {
        console.error(`❌ Failed to insert item ${item.name}:`, insertErr.message);
      } else {
        console.log(`✓ Created Item "${item.name}" -> ₹${item.price} (${item.catName})`);
      }
    }
  }

  // 4. Verify Total Categories and Items
  const { data: allCats } = await admin.from('menu_categories').select('*').eq('hotel_id', hotel.id);
  const { data: allItems } = await admin.from('menu_items').select('*, category:category_id(*)').eq('hotel_id', hotel.id);

  console.log(`\n=== Verification ===`);
  console.log(`Categories in DB: ${allCats ? allCats.length : 0}`);
  console.log(`Menu items in DB: ${allItems ? allItems.length : 0}`);
}

apply();
