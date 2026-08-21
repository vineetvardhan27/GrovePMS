#!/usr/bin/env node
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

const DEFAULT_INVENTORY_ITEMS = [
  // --- REUSABLE HOTEL ASSETS & LINEN ---
  {
    id: 'inv00000-0000-4000-8000-000000000101',
    name: 'Heavy Woollen Winter Blankets (King)',
    category: 'Linen & Bedding',
    unit: 'piece',
    item_type: 'reusable_asset',
    inventory_type: 'linen',
    current_stock: 39,
    in_use_stock: 3,
    damaged_stock: 2,
    repair_stock: 1,
    lost_stock: 0,
    retired_stock: 0,
    minimum_stock: 10,
    target_stock: 45,
    cost_per_unit: 1250,
    replacement_target_year: new Date().getFullYear() + 1,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000102',
    name: 'Cotton King Bed Sheets (300 TC)',
    category: 'Linen & Bedding',
    unit: 'piece',
    item_type: 'reusable_asset',
    inventory_type: 'linen',
    current_stock: 55,
    in_use_stock: 20,
    damaged_stock: 3,
    repair_stock: 2,
    lost_stock: 0,
    retired_stock: 0,
    minimum_stock: 15,
    target_stock: 80,
    cost_per_unit: 650,
    replacement_target_year: new Date().getFullYear() + 1,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000103',
    name: 'Plush Bath Towels (600 GSM)',
    category: 'Linen & Bedding',
    unit: 'piece',
    item_type: 'reusable_asset',
    inventory_type: 'linen',
    current_stock: 42,
    in_use_stock: 18,
    damaged_stock: 4,
    repair_stock: 0,
    lost_stock: 1,
    retired_stock: 0,
    minimum_stock: 12,
    target_stock: 65,
    cost_per_unit: 380,
    replacement_target_year: new Date().getFullYear() + 1,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000104',
    name: 'Electric Cordless Kettles (1.5L)',
    category: 'Room Appliances',
    unit: 'piece',
    item_type: 'reusable_asset',
    inventory_type: 'hotel_assets',
    current_stock: 8,
    in_use_stock: 16,
    damaged_stock: 1,
    repair_stock: 1,
    lost_stock: 0,
    retired_stock: 0,
    minimum_stock: 4,
    target_stock: 26,
    cost_per_unit: 1100,
    replacement_target_year: new Date().getFullYear() + 1,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000105',
    name: 'Foldable Steam Iron',
    category: 'Room Appliances',
    unit: 'piece',
    item_type: 'reusable_asset',
    inventory_type: 'hotel_assets',
    current_stock: 4,
    in_use_stock: 8,
    damaged_stock: 0,
    repair_stock: 0,
    lost_stock: 0,
    retired_stock: 0,
    minimum_stock: 2,
    target_stock: 12,
    cost_per_unit: 1450,
    replacement_target_year: new Date().getFullYear() + 1,
    is_active: true,
  },

  // --- HOUSEKEEPING & ROOM CONSUMABLES ---
  {
    id: 'inv00000-0000-4000-8000-000000000106',
    name: 'Luxury Herbal Body Wash (30ml)',
    category: 'Guest Toiletries',
    unit: 'bottle',
    item_type: 'consumable',
    inventory_type: 'room_supplies',
    current_stock: 120,
    minimum_stock: 50,
    target_stock: 200,
    cost_per_unit: 18,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000107',
    name: 'Disinfectant Surface Cleaner (5L Can)',
    category: 'Housekeeping Supplies',
    unit: 'can',
    item_type: 'consumable',
    inventory_type: 'housekeeping_supplies',
    current_stock: 6,
    minimum_stock: 4,
    target_stock: 15,
    cost_per_unit: 450,
    is_active: true,
  },

  // --- FOOD & KITCHEN RAW INGREDIENTS ---
  {
    id: 'inv00000-0000-4000-8000-000000000108',
    name: 'Basmati Rice (Royal Biryani Grade)',
    category: 'Grains & Cereals',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 59.5,
    minimum_stock: 20,
    target_stock: 50,
    cost_per_unit: 92,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000109',
    name: 'Whole Wheat Flour (Atta)',
    category: 'Grains & Cereals',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 35,
    minimum_stock: 15,
    target_stock: 60,
    cost_per_unit: 42,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000110',
    name: 'Potatoes (Farm Fresh)',
    category: 'Vegetables',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 14,
    minimum_stock: 15,
    target_stock: 40,
    cost_per_unit: 28,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000111',
    name: 'Full Cream Milk (Fresh Dairy)',
    category: 'Dairy',
    unit: 'litre',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 12,
    minimum_stock: 10,
    target_stock: 30,
    cost_per_unit: 64,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000112',
    name: 'Refined Sunflower Cooking Oil',
    category: 'Oils & Fats',
    unit: 'litre',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 22,
    minimum_stock: 10,
    target_stock: 40,
    cost_per_unit: 140,
    is_active: true,
  },
];

async function syncInventory() {
  const { data: hotel } = await admin.from('hotels').select('*').limit(1).single();
  if (!hotel) return;

  const existing = hotel.settings?.inventory_items || [];
  const map = new Map();
  for (const d of DEFAULT_INVENTORY_ITEMS) map.set(d.id, d);
  for (const e of existing) map.set(e.id, { ...d_find(e.id), ...e });

  function d_find(id) {
    return DEFAULT_INVENTORY_ITEMS.find((d) => d.id === id) || {};
  }

  const merged = Array.from(map.values());
  await admin.from('hotels').update({
    settings: {
      ...(hotel.settings || {}),
      inventory_items: merged,
    }
  }).eq('id', hotel.id);

  console.log(`Synced ${merged.length} inventory items.`);
}

syncInventory();
