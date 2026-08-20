import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import {
  InventoryItem,
  InventoryTransaction,
  InventorySummary,
  AnnualReplacementPlanItem,
} from './types';
import { InventoryClassification } from '../types/database.types';

export const INVENTORY_CLASSIFICATIONS: { id: InventoryClassification; label: string; iconName: string }[] = [
  { id: 'food_kitchen', label: 'Food / Kitchen', iconName: 'Utensils' },
  { id: 'linen', label: 'Linen & Bedding', iconName: 'BedDouble' },
  { id: 'room_supplies', label: 'Room Supplies', iconName: 'Sparkles' },
  { id: 'housekeeping_supplies', label: 'Housekeeping Supplies', iconName: 'Brush' },
  { id: 'hotel_assets', label: 'Hotel Assets', iconName: 'Tv' },
  { id: 'other', label: 'Other Supplies', iconName: 'Package' },
];

export const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  // --- REUSABLE HOTEL ASSETS & LINEN (Including Blanket) ---
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
    name: 'Floor Disinfectant Cleaning Liquid',
    category: 'Housekeeping Supplies',
    unit: 'litre',
    item_type: 'consumable',
    inventory_type: 'housekeeping_supplies',
    current_stock: 25,
    minimum_stock: 10,
    target_stock: 50,
    cost_per_unit: 120,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000107',
    name: 'Heavy Duty Bio Garbage Bags (Large)',
    category: 'Housekeeping Supplies',
    unit: 'packet',
    item_type: 'consumable',
    inventory_type: 'housekeeping_supplies',
    current_stock: 30,
    minimum_stock: 15,
    target_stock: 60,
    cost_per_unit: 85,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000108',
    name: 'Ayurvedic Herbal Soap Bars (35g)',
    category: 'Guest Toiletries',
    unit: 'piece',
    item_type: 'consumable',
    inventory_type: 'room_supplies',
    current_stock: 120,
    minimum_stock: 50,
    target_stock: 250,
    cost_per_unit: 18,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000109',
    name: 'Eco Dental Hygiene Kit',
    category: 'Guest Toiletries',
    unit: 'piece',
    item_type: 'consumable',
    inventory_type: 'room_supplies',
    current_stock: 85,
    minimum_stock: 40,
    target_stock: 200,
    cost_per_unit: 24,
    is_active: true,
  },

  // --- RAW FOOD INGREDIENTS ---
  {
    id: 'inv00000-0000-4000-8000-000000000001',
    name: 'Basmati Rice',
    category: 'Grains & Cereals',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 18,
    minimum_stock: 20,
    target_stock: 50,
    cost_per_unit: 95,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000002',
    name: 'Whole Wheat Flour (Atta)',
    category: 'Grains & Cereals',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 35,
    minimum_stock: 25,
    target_stock: 60,
    cost_per_unit: 42,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000003',
    name: 'Toor Dal / Yellow Lentils',
    category: 'Grains & Cereals',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 8.5,
    minimum_stock: 10,
    target_stock: 25,
    cost_per_unit: 140,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000004',
    name: 'Potatoes',
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
    id: 'inv00000-0000-4000-8000-000000000005',
    name: 'Onions',
    category: 'Vegetables',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 22,
    minimum_stock: 15,
    target_stock: 35,
    cost_per_unit: 35,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000006',
    name: 'Tomatoes',
    category: 'Vegetables',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 6,
    minimum_stock: 10,
    target_stock: 20,
    cost_per_unit: 40,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000007',
    name: 'Fresh Paneer (Cottage Cheese)',
    category: 'Dairy',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 4.5,
    minimum_stock: 5,
    target_stock: 15,
    cost_per_unit: 320,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000008',
    name: 'Full Cream Fresh Milk',
    category: 'Dairy',
    unit: 'litre',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 12,
    minimum_stock: 15,
    target_stock: 30,
    cost_per_unit: 65,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000009',
    name: 'Table Butter',
    category: 'Dairy',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 3,
    minimum_stock: 4,
    target_stock: 10,
    cost_per_unit: 480,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000010',
    name: 'Eggs',
    category: 'Poultry',
    unit: 'dozen',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 6,
    minimum_stock: 8,
    target_stock: 20,
    cost_per_unit: 85,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000011',
    name: 'Refined Sunflower Cooking Oil',
    category: 'Oils & Fats',
    unit: 'litre',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 28,
    minimum_stock: 20,
    target_stock: 50,
    cost_per_unit: 135,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000012',
    name: 'Pure Desi Ghee',
    category: 'Oils & Fats',
    unit: 'litre',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 4,
    minimum_stock: 5,
    target_stock: 10,
    cost_per_unit: 650,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000013',
    name: 'Refined Sugar',
    category: 'Spices & Dry',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 18,
    minimum_stock: 15,
    target_stock: 35,
    cost_per_unit: 44,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000014',
    name: 'Premium Assam Tea Leaves',
    category: 'Beverages & Dry',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 5.5,
    minimum_stock: 4,
    target_stock: 12,
    cost_per_unit: 380,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000015',
    name: 'Filter Coffee Powder',
    category: 'Beverages & Dry',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 2.5,
    minimum_stock: 3,
    target_stock: 8,
    cost_per_unit: 520,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000016',
    name: 'Garam Masala Blend',
    category: 'Spices & Dry',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 1.2,
    minimum_stock: 2,
    target_stock: 5,
    cost_per_unit: 450,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000017',
    name: 'Cumin Seeds (Jeera)',
    category: 'Spices & Dry',
    unit: 'kg',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 3,
    minimum_stock: 2,
    target_stock: 6,
    cost_per_unit: 380,
    is_active: true,
  },
  {
    id: 'inv00000-0000-4000-8000-000000000018',
    name: 'Packaged Mineral Water (1L)',
    category: 'Beverages & Dry',
    unit: 'bottle',
    item_type: 'consumable',
    inventory_type: 'food_kitchen',
    current_stock: 48,
    minimum_stock: 24,
    target_stock: 100,
    cost_per_unit: 12,
    is_active: true,
  },
];

export const DEFAULT_INVENTORY_CATEGORIES = [
  'Linen & Bedding',
  'Room Appliances',
  'Housekeeping Supplies',
  'Guest Toiletries',
  'Grains & Cereals',
  'Vegetables',
  'Dairy',
  'Poultry',
  'Oils & Fats',
  'Spices & Dry',
  'Beverages & Dry',
  'Bakery & Others',
];

/**
 * Compute enriched stock health status, asset lifecycle numbers, and suggested purchase requirements
 */
export function enrichInventoryItem(item: InventoryItem): InventoryItem {
  const current = Number(item.current_stock) || 0;
  const inUse = Number(item.in_use_stock) || 0;
  const damaged = Number(item.damaged_stock) || 0;
  const lost = Number(item.lost_stock) || 0;
  const repair = Number(item.repair_stock) || 0;
  const retired = Number(item.retired_stock) || 0;
  const min = Number(item.minimum_stock) || 0;
  const target = Number(item.target_stock) || min * 2;
  const cost = Number(item.cost_per_unit) || 0;
  const isAsset = item.item_type === 'reusable_asset';

  // Usable stock is everything available for use + in use + under repair
  const usable_stock = isAsset ? Math.round((current + inUse + repair) * 100) / 100 : current;
  const total_asset_count = isAsset
    ? Math.round((current + inUse + damaged + lost + repair + retired) * 100) / 100
    : current;

  // Replacement needed: shortfall from required target par stock
  const replacement_needed = Math.max(0, Math.round((target - usable_stock) * 100) / 100);

  let stock_status: 'healthy' | 'low_stock' | 'out_of_stock' = 'healthy';
  if (isAsset) {
    if (usable_stock <= 0) {
      stock_status = 'out_of_stock';
    } else if (usable_stock <= min) {
      stock_status = 'low_stock';
    }
  } else {
    if (current <= 0) {
      stock_status = 'out_of_stock';
    } else if (current <= min) {
      stock_status = 'low_stock';
    }
  }

  let suggested_purchase = 0;
  if (isAsset) {
    suggested_purchase = replacement_needed;
  } else {
    if (current <= min) {
      suggested_purchase = Math.max(0, Math.round((target - current) * 100) / 100);
    }
  }

  const total_value = Math.round(
    (isAsset ? (current + inUse) : current) * cost * 100
  ) / 100;

  return {
    ...item,
    current_stock: current,
    in_use_stock: inUse,
    damaged_stock: damaged,
    lost_stock: lost,
    repair_stock: repair,
    retired_stock: retired,
    minimum_stock: min,
    target_stock: target,
    cost_per_unit: cost,
    item_type: item.item_type || 'consumable',
    inventory_type: item.inventory_type || 'food_kitchen',
    stock_status,
    usable_stock,
    total_asset_count,
    replacement_needed,
    suggested_purchase,
    total_value,
    replacement_target_year: item.replacement_target_year || new Date().getFullYear() + 1,
  };
}

/**
 * Fetch all inventory items for a hotel with computed stock health and asset lifecycle counts
 */
export async function getInventoryItems(
  hotelId?: string,
  classification?: InventoryClassification
): Promise<InventoryItem[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    // 1. Try public.inventory_items table
    try {
      let q = supabase.from('inventory_items').select('*').order('name', { ascending: true });
      if (activeHotelId) {
        q = q.eq('hotel_id', activeHotelId);
      }
      if (classification) {
        q = q.eq('inventory_type', classification);
      }
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return (data as any[]).map((r) => enrichInventoryItem(r));
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings.inventory_items
    const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', targetHotelId)
      .maybeSingle();

    const storedItems: InventoryItem[] =
      (hotel?.settings?.inventory_items as InventoryItem[]) || DEFAULT_INVENTORY_ITEMS;

    let items = storedItems.map((item) => enrichInventoryItem(item));
    if (classification) {
      items = items.filter((i) => i.inventory_type === classification);
    }
    return items;
  } catch (err) {
    console.error('Error fetching inventory items:', err);
    let items = DEFAULT_INVENTORY_ITEMS.map((item) => enrichInventoryItem(item));
    if (classification) {
      items = items.filter((i) => i.inventory_type === classification);
    }
    return items;
  }
}

/**
 * Fetch audit movements (purchases, usages, damage, repairs, adjustments)
 */
export async function getInventoryTransactions(
  hotelId?: string,
  itemId?: string,
  limit: number = 100
): Promise<InventoryTransaction[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    // 1. Try public.inventory_transactions table
    try {
      let q = supabase
        .from('inventory_transactions')
        .select(`
          *,
          item:item_id (
            name,
            category,
            item_type,
            inventory_type
          ),
          staff:recorded_by (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (activeHotelId) {
        q = q.eq('hotel_id', activeHotelId);
      }
      if (itemId) {
        q = q.eq('item_id', itemId);
      }

      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return (data as any[]).map((t) => ({
          id: t.id,
          hotel_id: t.hotel_id,
          item_id: t.item_id,
          item_name: t.item?.name || 'Item',
          item_category: t.item?.category || 'General',
          item_type: t.item?.item_type || 'consumable',
          inventory_type: t.item?.inventory_type || 'food_kitchen',
          transaction_type: t.transaction_type,
          quantity: Number(t.quantity),
          unit: t.unit,
          unit_price: Number(t.unit_price || 0),
          total_cost: Number(t.total_cost || 0),
          supplier: t.supplier || null,
          reason: t.reason || null,
          room_number: t.room_number || null,
          condition_state: t.condition_state || null,
          notes: t.notes || null,
          recorded_by: t.recorded_by || null,
          recorder_name: t.staff?.full_name || 'Staff',
          transaction_date: t.transaction_date,
          created_at: t.created_at,
        }));
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings.inventory_transactions
    const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', targetHotelId)
      .maybeSingle();

    const storedTransactions: InventoryTransaction[] =
      (hotel?.settings?.inventory_transactions as InventoryTransaction[]) || [];

    let filtered = storedTransactions;
    if (itemId) {
      filtered = filtered.filter((t) => t.item_id === itemId);
    }
    return filtered.slice(0, limit);
  } catch (err) {
    console.error('Error fetching inventory transactions:', err);
    return [];
  }
}

/**
 * Annual Replacement Planning Calculation
 * Analyzes damaged, lost, and retired assets to compute future replacement budgets
 */
export async function getAnnualReplacementPlan(
  hotelId?: string,
  targetYear?: number
): Promise<AnnualReplacementPlanItem[]> {
  const items = await getInventoryItems(hotelId);
  const currentYear = new Date().getFullYear();
  const nextYear = targetYear || currentYear + 1;

  // Filter for reusable assets that have damage or need replacements
  const reusableAssets = items.filter(
    (item) => item.item_type === 'reusable_asset'
  );

  return reusableAssets.map((item) => {
    const totalCount = item.total_asset_count || item.target_stock;
    const usable = item.usable_stock || item.current_stock;
    const available = item.current_stock;
    const inUse = item.in_use_stock || 0;
    const damaged = item.damaged_stock || 0;
    const lost = item.lost_stock || 0;
    const repair = item.repair_stock || 0;
    const required = item.target_stock;

    // Replacement needed = required par stock - usable stock
    const replacementNeeded = Math.max(0, required - usable);
    const recommendedPurchase = replacementNeeded;
    const estCost = Math.round(recommendedPurchase * item.cost_per_unit * 100) / 100;

    return {
      item_id: item.id,
      name: item.name,
      category: item.category,
      inventory_type: item.inventory_type || 'linen',
      unit: item.unit,
      total_count: totalCount,
      usable_stock: usable,
      available_stock: available,
      in_use_stock: inUse,
      damaged_stock: damaged,
      lost_stock: lost,
      repair_stock: repair,
      required_stock: required,
      replacement_needed: replacementNeeded,
      recommended_purchase_qty: recommendedPurchase,
      unit_cost: item.cost_per_unit,
      estimated_cost: estCost,
      target_year: item.replacement_target_year || nextYear,
    };
  });
}

/**
 * Fetch high-level inventory metrics summary
 */
export async function getInventorySummary(hotelId?: string): Promise<InventorySummary> {
  const items = await getInventoryItems(hotelId);
  const transactions = await getInventoryTransactions(hotelId, undefined, 200);

  let healthy = 0;
  let low = 0;
  let out = 0;
  let valuation = 0;
  let totalDamaged = 0;
  let replacementCount = 0;
  let estimatedReplacementCost = 0;

  for (const item of items) {
    if (item.stock_status === 'out_of_stock') out++;
    else if (item.stock_status === 'low_stock') low++;
    else healthy++;

    valuation += item.total_value || 0;

    if (item.item_type === 'reusable_asset') {
      totalDamaged += item.damaged_stock || 0;
      const needed = item.replacement_needed || 0;
      if (needed > 0) {
        replacementCount += needed;
        estimatedReplacementCost += needed * (item.cost_per_unit || 0);
      }
    }
  }

  const purchasesMonth = transactions
    .filter((t) => t.transaction_type === 'purchase')
    .reduce((sum, t) => sum + (t.total_cost || 0), 0);

  const usageCount = transactions.filter(
    (t) => t.transaction_type === 'usage' || t.transaction_type === 'damaged'
  ).length;

  return {
    total_items: items.length,
    healthy_count: healthy,
    low_stock_count: low,
    out_of_stock_count: out,
    total_valuation: Math.round(valuation * 100) / 100,
    total_purchases_month: Math.round(purchasesMonth * 100) / 100,
    total_usage_month: usageCount,
    total_damaged_assets: totalDamaged,
    replacement_needed_count: replacementCount,
    estimated_replacement_cost: Math.round(estimatedReplacementCost * 100) / 100,
  };
}
