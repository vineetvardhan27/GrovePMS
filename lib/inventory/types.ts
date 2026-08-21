import {
  InventoryUnit,
  InventoryTransactionType,
  InventoryItemType,
  InventoryClassification,
} from '../types/database.types';

export const INVENTORY_CLASSIFICATIONS: { id: InventoryClassification; label: string; iconName: string }[] = [
  { id: 'food_kitchen', label: 'Food / Kitchen', iconName: 'Utensils' },
  { id: 'linen', label: 'Linen & Bedding', iconName: 'BedDouble' },
  { id: 'room_supplies', label: 'Room Supplies', iconName: 'Sparkles' },
  { id: 'housekeeping_supplies', label: 'Housekeeping Supplies', iconName: 'Brush' },
  { id: 'hotel_assets', label: 'Hotel Assets', iconName: 'Tv' },
  { id: 'other', label: 'Other Supplies', iconName: 'Package' },
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

export interface InventoryItem {
  id: string;
  hotel_id?: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  item_type?: InventoryItemType;
  inventory_type?: InventoryClassification;
  current_stock: number; // Available in pantry / store room
  in_use_stock?: number; // Deployed in guest rooms / active usage
  damaged_stock?: number; // Defective / damaged items
  lost_stock?: number; // Missing / unaccounted
  repair_stock?: number; // Under laundry or maintenance repair
  retired_stock?: number; // Written off / discarded
  minimum_stock: number;
  target_stock: number;
  cost_per_unit: number;
  replacement_target_year?: number | null;
  preferred_supplier?: string | null;
  last_purchase_date?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;

  // Enriched computed properties
  stock_status?: 'healthy' | 'low_stock' | 'out_of_stock';
  suggested_purchase?: number;
  total_value?: number;
  usable_stock?: number; // Available + In Use + Under Repair
  total_asset_count?: number; // Available + In Use + Damaged + Lost + Repair + Retired
  replacement_needed?: number; // Target Stock - Usable Stock
}

export interface InventoryTransaction {
  id: string;
  hotel_id?: string;
  item_id: string;
  item_name?: string;
  item_category?: string;
  item_type?: InventoryItemType;
  inventory_type?: InventoryClassification;
  transaction_type: InventoryTransactionType;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost: number;
  supplier?: string | null;
  reason?: string | null;
  room_number?: string | null;
  condition_state?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  recorder_name?: string | null;
  transaction_date: string;
  created_at: string;
}

export interface SaveInventoryItemInput {
  id?: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  item_type?: InventoryItemType;
  inventory_type?: InventoryClassification;
  current_stock?: number;
  in_use_stock?: number;
  damaged_stock?: number;
  lost_stock?: number;
  repair_stock?: number;
  retired_stock?: number;
  minimum_stock: number;
  target_stock: number;
  cost_per_unit?: number;
  replacement_target_year?: number | null;
  preferred_supplier?: string | null;
  is_active?: boolean;
}

export interface RecordPurchaseInput {
  item_id: string;
  quantity: number;
  unit_price: number;
  supplier?: string | null;
  purchase_date?: string;
  notes?: string | null;
}

export interface RecordUsageInput {
  item_id: string;
  quantity: number;
  reason: string;
  usage_date?: string;
  notes?: string | null;
}

export interface ReportDamageInput {
  item_id: string;
  quantity: number;
  reason: string; // e.g. Torn, Stained, Burned, Broken, Water Damaged, Normal Wear
  condition_state?: string; // Light Damage, Heavy Damage, Total Loss
  room_number?: string | null; // e.g. Room 805
  damage_date?: string;
  from_status?: 'in_use' | 'available';
  notes?: string | null;
}

export interface ReportWasteInput {
  item_id: string;
  quantity: number;
  reason: string; // 'Spoiled' | 'Expired' | 'Burnt' | 'Overprepared' | 'Damaged' | 'Spilled' | 'Rejected' | 'Other'
  waste_date?: string;
  notes?: string | null;
}

export interface AnnualReplacementPlanItem {
  item_id: string;
  name: string;
  category: string;
  inventory_type: InventoryClassification;
  unit: InventoryUnit;
  total_count: number;
  usable_stock: number;
  available_stock: number;
  in_use_stock: number;
  damaged_stock: number;
  lost_stock: number;
  repair_stock: number;
  required_stock: number;
  replacement_needed: number;
  recommended_purchase_qty: number;
  unit_cost: number;
  estimated_cost: number;
  target_year: number;
}

export interface WastageSummary {
  today_waste_value: number;
  month_waste_value: number;
  total_waste_count: number;
  highest_wasted_items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    total_cost: number;
  }>;
  reasons_breakdown: Array<{
    reason: string;
    count: number;
    total_cost: number;
    share_pct: number;
  }>;
}

export interface InventorySummary {
  total_items: number;
  healthy_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_valuation: number;
  total_purchases_month: number;
  total_usage_month: number;
  total_damaged_assets?: number;
  replacement_needed_count?: number;
  estimated_replacement_cost?: number;
  today_waste_value?: number;
  month_waste_value?: number;
}
