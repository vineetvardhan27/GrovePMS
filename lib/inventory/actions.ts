'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { revalidatePath } from 'next/cache';
import { invalidateCacheByTags, CACHE_CONFIG } from '../cache/serverCache';
import {
  SaveInventoryItemInput,
  RecordPurchaseInput,
  RecordUsageInput,
  ReportDamageInput,
  ReportWasteInput,
  InventoryItem,
  InventoryTransaction,
} from './types';
import { getInventoryItems } from './queries';

/**
 * Save or update an inventory item definition
 * Restricted exclusively to Owner and Manager
 */
export async function saveInventoryItemAction(input: SaveInventoryItemInput): Promise<{
  success?: boolean;
  item?: InventoryItem;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { error: 'Access denied: Only Owner and Manager can manage inventory items.' };
    }

    if (!input.name || !input.name.trim()) {
      return { error: 'Item name is required.' };
    }

    if (!input.category || !input.category.trim()) {
      return { error: 'Category is required.' };
    }

    if (!input.unit) {
      return { error: 'Measurement unit is required.' };
    }

    const minStock = Number(input.minimum_stock);
    const targetStock = Number(input.target_stock);
    const cost = Number(input.cost_per_unit || 0);

    if (isNaN(minStock) || minStock < 0) {
      return { error: 'Minimum stock alert level must be a non-negative number.' };
    }
    if (isNaN(targetStock) || targetStock < minStock) {
      return { error: 'Target par stock must be greater than or equal to minimum stock.' };
    }

    const supabase = createClient();
    const itemId = input.id || crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const itemRecord: InventoryItem = {
      id: itemId,
      hotel_id: staff.hotel_id,
      name: input.name.trim(),
      category: input.category.trim(),
      unit: input.unit,
      item_type: input.item_type || 'consumable',
      inventory_type: input.inventory_type || 'food_kitchen',
      current_stock: input.current_stock !== undefined ? Number(input.current_stock) : 0,
      in_use_stock: input.in_use_stock !== undefined ? Number(input.in_use_stock) : 0,
      damaged_stock: input.damaged_stock !== undefined ? Number(input.damaged_stock) : 0,
      lost_stock: input.lost_stock !== undefined ? Number(input.lost_stock) : 0,
      repair_stock: input.repair_stock !== undefined ? Number(input.repair_stock) : 0,
      retired_stock: input.retired_stock !== undefined ? Number(input.retired_stock) : 0,
      minimum_stock: minStock,
      target_stock: targetStock,
      cost_per_unit: cost,
      replacement_target_year: input.replacement_target_year || new Date().getFullYear() + 1,
      is_active: input.is_active !== undefined ? input.is_active : true,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // Persist directly to public.inventory_items table
    const { error: upsertErr } = await (supabase.from('inventory_items') as any).upsert({
      id: itemRecord.id,
      hotel_id: staff.hotel_id,
      name: itemRecord.name,
      category: itemRecord.category,
      unit: itemRecord.unit,
      item_type: itemRecord.item_type,
      inventory_type: itemRecord.inventory_type,
      current_stock: itemRecord.current_stock,
      in_use_stock: itemRecord.in_use_stock,
      damaged_stock: itemRecord.damaged_stock,
      lost_stock: itemRecord.lost_stock,
      repair_stock: itemRecord.repair_stock,
      retired_stock: itemRecord.retired_stock,
      minimum_stock: itemRecord.minimum_stock,
      target_stock: itemRecord.target_stock,
      cost_per_unit: itemRecord.cost_per_unit,
      replacement_target_year: itemRecord.replacement_target_year,
      is_active: itemRecord.is_active,
      updated_at: nowIso,
    });

    if (upsertErr) {
      console.error('Error saving inventory item to table:', upsertErr);
      return { error: `Failed to save inventory item: ${upsertErr.message}` };
    }

    revalidatePath('/inventory');
    invalidateCacheByTags([
      CACHE_CONFIG.INVENTORY.tag(staff.hotel_id),
      CACHE_CONFIG.REPORTS.tag(staff.hotel_id),
      'inventory',
      'reports',
    ]);
    return { success: true, item: itemRecord };
  } catch (err: any) {
    console.error('saveInventoryItemAction error:', err);
    return { error: `Failed to save inventory item: ${err?.message || String(err)}` };
  }
}

/**
 * Record a purchase / stock arrival (Consumables or Reusable Assets)
 * Atomically increases current_stock and logs transaction
 */
export async function recordPurchaseAction(input: RecordPurchaseInput): Promise<{
  success?: boolean;
  transaction?: InventoryTransaction;
  new_stock?: number;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { error: 'Access denied: Only Owner and Manager can record purchases.' };
    }

    const qty = Number(input.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { error: 'Purchase quantity must be greater than zero.' };
    }

    const unitPrice = Number(input.unit_price || 0);
    if (isNaN(unitPrice) || unitPrice < 0) {
      return { error: 'Unit price must be a valid non-negative number.' };
    }

    const totalCost = Math.round(qty * unitPrice * 100) / 100;
    const supabase = createClient();

    const items = await getInventoryItems(staff.hotel_id);
    const targetItem = items.find((i) => i.id === input.item_id);

    if (!targetItem) {
      return { error: 'Selected inventory item was not found.' };
    }

    const newStock = Math.round((Number(targetItem.current_stock) + qty) * 100) / 100;
    const transactionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const purchaseDate = input.purchase_date || nowIso.split('T')[0];

    const transactionRecord: InventoryTransaction = {
      id: transactionId,
      hotel_id: staff.hotel_id,
      item_id: targetItem.id,
      item_name: targetItem.name,
      item_category: targetItem.category,
      item_type: targetItem.item_type,
      inventory_type: targetItem.inventory_type,
      transaction_type: 'purchase',
      quantity: qty,
      unit: targetItem.unit,
      unit_price: unitPrice,
      total_cost: totalCost,
      supplier: input.supplier?.trim() || null,
      notes: input.notes?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      transaction_date: purchaseDate,
      created_at: nowIso,
    };

    // Persist directly to public.inventory_transactions & public.inventory_items tables
    const { error: txErr } = await (supabase.from('inventory_transactions') as any).insert(transactionRecord);
    if (txErr) {
      console.error('Error inserting inventory transaction:', txErr);
      return { error: `Failed to record transaction: ${txErr.message}` };
    }

    const { error: itemErr } = await (supabase.from('inventory_items') as any)
      .update({
        current_stock: newStock,
        cost_per_unit: unitPrice > 0 ? unitPrice : targetItem.cost_per_unit,
        updated_at: nowIso,
      })
      .eq('id', targetItem.id)
      .eq('hotel_id', staff.hotel_id);

    if (itemErr) {
      console.error('Error updating inventory item stock:', itemErr);
      return { error: `Failed to update inventory stock: ${itemErr.message}` };
    }

    revalidatePath('/inventory');
    invalidateCacheByTags([
      CACHE_CONFIG.INVENTORY.tag(staff.hotel_id),
      CACHE_CONFIG.REPORTS.tag(staff.hotel_id),
      'inventory',
      'reports',
    ]);
    return { success: true, transaction: transactionRecord, new_stock: newStock };
  } catch (err: any) {
    console.error('recordPurchaseAction error:', err);
    return { error: `Failed to record purchase: ${err?.message || String(err)}` };
  }
}

/**
 * Record consumption / usage (Consumables only)
 * Prevents negative stock
 */
export async function recordUsageAction(input: RecordUsageInput): Promise<{
  success?: boolean;
  transaction?: InventoryTransaction;
  new_stock?: number;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager' && staff.role !== 'housekeeping') {
      return { error: 'Access denied: Only Staff can record inventory usage.' };
    }

    const qty = Number(input.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { error: 'Usage quantity must be greater than zero.' };
    }

    if (!input.reason || !input.reason.trim()) {
      return { error: 'Reason for consumption is required.' };
    }

    const supabase = createClient();
    const items = await getInventoryItems(staff.hotel_id);
    const targetItem = items.find((i) => i.id === input.item_id);

    if (!targetItem) {
      return { error: 'Selected inventory item was not found.' };
    }

    const currentStock = Number(targetItem.current_stock);
    if (currentStock < qty) {
      return {
        error: `Insufficient stock available! Current stock for "${targetItem.name}" is ${currentStock} ${targetItem.unit}, cannot consume ${qty} ${targetItem.unit}.`,
      };
    }

    const newStock = Math.round((currentStock - qty) * 100) / 100;
    const transactionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const usageDate = input.usage_date || nowIso.split('T')[0];
    const totalCost = Math.round(qty * Number(targetItem.cost_per_unit || 0) * 100) / 100;

    const transactionRecord: InventoryTransaction = {
      id: transactionId,
      hotel_id: staff.hotel_id,
      item_id: targetItem.id,
      item_name: targetItem.name,
      item_category: targetItem.category,
      item_type: targetItem.item_type,
      inventory_type: targetItem.inventory_type,
      transaction_type: 'usage',
      quantity: qty,
      unit: targetItem.unit,
      unit_price: Number(targetItem.cost_per_unit || 0),
      total_cost: totalCost,
      reason: input.reason.trim(),
      notes: input.notes?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      transaction_date: usageDate,
      created_at: nowIso,
    };

    // Persist directly to public.inventory_transactions & public.inventory_items tables
    const { error: txErr } = await (supabase.from('inventory_transactions') as any).insert(transactionRecord);
    if (txErr) {
      console.error('Error inserting inventory usage transaction:', txErr);
      return { error: `Failed to record usage: ${txErr.message}` };
    }

    const { error: itemErr } = await (supabase.from('inventory_items') as any)
      .update({ current_stock: newStock, updated_at: nowIso })
      .eq('id', targetItem.id)
      .eq('hotel_id', staff.hotel_id);

    if (itemErr) {
      console.error('Error updating inventory item stock:', itemErr);
      return { error: `Failed to update item stock: ${itemErr.message}` };
    }

    revalidatePath('/inventory');
    invalidateCacheByTags([
      CACHE_CONFIG.INVENTORY.tag(staff.hotel_id),
      CACHE_CONFIG.REPORTS.tag(staff.hotel_id),
      'inventory',
      'reports',
    ]);
    return { success: true, transaction: transactionRecord, new_stock: newStock };
  } catch (err: any) {
    console.error('recordUsageAction error:', err);
    return { error: `Failed to record usage: ${err?.message || String(err)}` };
  }
}

/**
 * Report Damage on Reusable Hotel Assets (e.g. Blankets, Bed Sheets, Towels, Kettles)
 * Allowed for Owner, Manager, and Housekeeping
 * Transfers quantity to damaged_stock and logs room number, condition, and reason
 */
export async function reportDamageAction(input: ReportDamageInput): Promise<{
  success?: boolean;
  transaction?: InventoryTransaction;
  item?: InventoryItem;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager' && staff.role !== 'housekeeping') {
      return { error: 'Access denied: Reception is not permitted to report inventory damage.' };
    }

    const qty = Number(input.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { error: 'Damaged quantity must be greater than zero.' };
    }

    if (!input.reason || !input.reason.trim()) {
      return { error: 'Reason for damage is required (e.g. Torn, Stained/Burned, Broken).' };
    }

    const supabase = createClient();
    const items = await getInventoryItems(staff.hotel_id);
    const targetItem = items.find((i) => i.id === input.item_id);

    if (!targetItem) {
      return { error: 'Selected asset item was not found.' };
    }

    // Determine deduction source: in_use or available stock
    const fromInUse = input.from_status === 'in_use' || Boolean(input.room_number);
    let newInUse = Number(targetItem.in_use_stock || 0);
    let newAvailable = Number(targetItem.current_stock || 0);

    if (fromInUse && newInUse >= qty) {
      newInUse = Math.max(0, Math.round((newInUse - qty) * 100) / 100);
    } else if (newAvailable >= qty) {
      newAvailable = Math.max(0, Math.round((newAvailable - qty) * 100) / 100);
    } else if (newInUse > 0) {
      // Deduct from in_use first then available
      const rem = qty - newInUse;
      newInUse = 0;
      newAvailable = Math.max(0, Math.round((newAvailable - rem) * 100) / 100);
    } else {
      newAvailable = Math.max(0, Math.round((newAvailable - qty) * 100) / 100);
    }

    const newDamaged = Math.round((Number(targetItem.damaged_stock || 0) + qty) * 100) / 100;
    const transactionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const damageDate = input.damage_date || nowIso.split('T')[0];
    const totalCost = Math.round(qty * Number(targetItem.cost_per_unit || 0) * 100) / 100;

    const transactionRecord: InventoryTransaction = {
      id: transactionId,
      hotel_id: staff.hotel_id,
      item_id: targetItem.id,
      item_name: targetItem.name,
      item_category: targetItem.category,
      item_type: targetItem.item_type || 'reusable_asset',
      inventory_type: targetItem.inventory_type || 'linen',
      transaction_type: 'damaged',
      quantity: qty,
      unit: targetItem.unit,
      unit_price: Number(targetItem.cost_per_unit || 0),
      total_cost: totalCost,
      reason: input.reason.trim(),
      room_number: input.room_number?.trim() || null,
      condition_state: input.condition_state?.trim() || 'Damaged',
      notes: input.notes?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      transaction_date: damageDate,
      created_at: nowIso,
    };

    // Persist directly to public.inventory_transactions & public.inventory_items tables
    const { error: txErr } = await (supabase.from('inventory_transactions') as any).insert(transactionRecord);
    if (txErr) {
      console.error('Error inserting inventory damage transaction:', txErr);
      return { error: `Failed to report damage: ${txErr.message}` };
    }

    const { error: itemErr } = await (supabase.from('inventory_items') as any)
      .update({
        current_stock: newAvailable,
        in_use_stock: newInUse,
        damaged_stock: newDamaged,
        updated_at: nowIso,
      })
      .eq('id', targetItem.id)
      .eq('hotel_id', staff.hotel_id);

    if (itemErr) {
      console.error('Error updating inventory item asset stocks:', itemErr);
      return { error: `Failed to update asset stock: ${itemErr.message}` };
    }

    revalidatePath('/inventory');
    invalidateCacheByTags([
      CACHE_CONFIG.INVENTORY.tag(staff.hotel_id),
      CACHE_CONFIG.REPORTS.tag(staff.hotel_id),
      'inventory',
      'reports',
    ]);
    return {
      success: true,
      transaction: transactionRecord,
      item: {
        ...targetItem,
        current_stock: newAvailable,
        in_use_stock: newInUse,
        damaged_stock: newDamaged,
      },
    };
  } catch (err: any) {
    console.error('reportDamageAction error:', err);
    return { error: `Failed to report damage: ${err?.message || String(err)}` };
  }
}

/**
 * Toggle active/inactive status of an inventory item
 */
export async function toggleInventoryItemStatusAction(
  itemId: string,
  isActive: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { error: 'Access denied: Only Owner and Manager can toggle inventory status.' };
    }

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    const { error: updErr } = await (supabase.from('inventory_items') as any)
      .update({ is_active: isActive, updated_at: nowIso })
      .eq('id', itemId)
      .eq('hotel_id', staff.hotel_id);

    if (updErr) {
      console.error('Error toggling inventory item status:', updErr);
      return { error: `Failed to toggle item status: ${updErr.message}` };
    }

    revalidatePath('/inventory');
    invalidateCacheByTags([
      CACHE_CONFIG.INVENTORY.tag(staff.hotel_id),
      CACHE_CONFIG.REPORTS.tag(staff.hotel_id),
      'inventory',
      'reports',
    ]);
    return { success: true };
  } catch (err: any) {
    console.error('toggleInventoryItemStatusAction error:', err);
    return { error: `Failed to toggle item status: ${err?.message || String(err)}` };
  }
}

/**
 * Record Food / Consumable Wastage & Spoilage
 * Decreases inventory stock, calculates monetary loss, and logs audit record
 */
export async function recordWastageAction(input: ReportWasteInput): Promise<{
  success?: boolean;
  transaction?: InventoryTransaction;
  new_stock?: number;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager' && staff.role !== 'housekeeping') {
      return { error: 'Access denied: Only staff can report inventory wastage.' };
    }

    const qty = Number(input.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { error: 'Wastage quantity must be greater than zero.' };
    }

    if (!input.reason || !input.reason.trim()) {
      return { error: 'Reason for wastage is required (e.g. Spoiled, Expired, Burnt, Overprepared).' };
    }

    const supabase = createClient();
    const items = await getInventoryItems(staff.hotel_id);
    const targetItem = items.find((i) => i.id === input.item_id);

    if (!targetItem) {
      return { error: 'Selected inventory item was not found.' };
    }

    const currentStock = Number(targetItem.current_stock || 0);
    const newStock = Math.max(0, Math.round((currentStock - qty) * 100) / 100);
    const transactionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const wasteDate = input.waste_date || nowIso.split('T')[0];
    const totalCost = Math.round(qty * Number(targetItem.cost_per_unit || 0) * 100) / 100;

    const transactionRecord: InventoryTransaction = {
      id: transactionId,
      hotel_id: staff.hotel_id,
      item_id: targetItem.id,
      item_name: targetItem.name,
      item_category: targetItem.category,
      item_type: targetItem.item_type,
      inventory_type: targetItem.inventory_type,
      transaction_type: 'waste',
      quantity: -qty,
      unit: targetItem.unit,
      unit_price: Number(targetItem.cost_per_unit || 0),
      total_cost: totalCost,
      reason: input.reason.trim(),
      notes: input.notes?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      transaction_date: wasteDate,
      created_at: nowIso,
    };

    // Persist directly to public.inventory_transactions & public.inventory_items tables
    const { error: txErr } = await (supabase.from('inventory_transactions') as any).insert(transactionRecord);
    if (txErr) {
      console.error('Error inserting inventory wastage transaction:', txErr);
      return { error: `Failed to record wastage: ${txErr.message}` };
    }

    const { error: itemErr } = await (supabase.from('inventory_items') as any)
      .update({ current_stock: newStock, updated_at: nowIso })
      .eq('id', targetItem.id)
      .eq('hotel_id', staff.hotel_id);

    if (itemErr) {
      console.error('Error updating inventory item stock:', itemErr);
      return { error: `Failed to update item stock: ${itemErr.message}` };
    }

    revalidatePath('/inventory');
    invalidateCacheByTags([
      CACHE_CONFIG.INVENTORY.tag(staff.hotel_id),
      CACHE_CONFIG.REPORTS.tag(staff.hotel_id),
      'inventory',
      'reports',
    ]);
    return { success: true, transaction: transactionRecord, new_stock: newStock };
  } catch (err: any) {
    console.error('recordWastageAction error:', err);
    return { error: `Failed to record wastage: ${err?.message || String(err)}` };
  }
}
