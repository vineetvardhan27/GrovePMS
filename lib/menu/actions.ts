'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { revalidatePath } from 'next/cache';
import { SaveMenuItemInput, SaveMenuCategoryInput, MenuItem, MenuCategory } from './types';
import { getMenuCategories, getMenuItems } from './queries';

/**
 * Save or update a food menu item
 * Accessible ONLY by Owner and Manager
 */
export async function saveMenuItemAction(input: SaveMenuItemInput): Promise<{
  success?: boolean;
  item?: MenuItem;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { error: 'Access denied: Only Owner and Manager can modify food menu items' };
    }

    if (!input.name || !input.name.trim()) {
      return { error: 'Item name is required' };
    }

    if (!input.category_id) {
      return { error: 'Category is required' };
    }

    const price = Number(input.selling_price);
    if (isNaN(price) || price < 0) {
      return { error: 'Selling price must be a valid positive number' };
    }

    const supabase = createClient();
    const itemId = input.id || crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Try public.menu_items table
    try {
      const { data: tableData, error: tableErr } = await (supabase.from('menu_items') as any)
        .upsert({
          id: itemId,
          hotel_id: staff.hotel_id,
          category_id: input.category_id,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          selling_price: price,
          is_active: input.is_active !== undefined ? input.is_active : true,
          updated_at: now,
        })
        .select('*, category:category_id(*)')
        .single();

      if (!tableErr && tableData) {
        revalidatePath('/settings/food-menu');
        revalidatePath('/billing');
        return { success: true, item: tableData };
      }
    } catch {
      // Fallback to hotel.settings
    }

    // 2. Fallback to hotel.settings.menu_items
    const { data: hotel } = await (supabase.from('hotels') as any).select('id, settings').eq('id', staff.hotel_id).single();
    const existingItems: MenuItem[] = (hotel?.settings?.menu_items as MenuItem[]) || [];

    const existingIndex = existingItems.findIndex((i) => i.id === itemId || i.name.toLowerCase() === input.name.trim().toLowerCase());

    const newItem: MenuItem = {
      id: itemId,
      hotel_id: staff.hotel_id,
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      selling_price: price,
      is_active: input.is_active !== undefined ? input.is_active : true,
      updated_at: now,
    };

    let updatedItems: MenuItem[];
    if (existingIndex >= 0) {
      updatedItems = [...existingItems];
      updatedItems[existingIndex] = newItem;
    } else {
      updatedItems = [...existingItems, newItem];
    }

    const newSettings = {
      ...(hotel?.settings || {}),
      menu_items: updatedItems,
    };

    const { error: updateErr } = await (supabase.from('hotels') as any)
      .update({ settings: newSettings })
      .eq('id', staff.hotel_id);

    if (updateErr) {
      return { error: `Failed to persist menu item: ${updateErr.message}` };
    }

    revalidatePath('/settings/food-menu');
    revalidatePath('/billing');
    return { success: true, item: newItem };
  } catch (err: any) {
    console.error('saveMenuItemAction error:', err);
    return { error: `Failed to save menu item: ${err?.message || String(err)}` };
  }
}

/**
 * Toggle active/inactive status of a food menu item
 * Accessible ONLY by Owner and Manager
 */
export async function toggleMenuItemStatusAction(itemId: string, isActive: boolean): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { error: 'Access denied: Only Owner and Manager can change item status' };
    }

    const supabase = createClient();

    // 1. Try public.menu_items
    try {
      const { error: tableErr } = await (supabase.from('menu_items') as any)
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (!tableErr) {
        revalidatePath('/settings/food-menu');
        return { success: true };
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings
    const { data: hotel } = await (supabase.from('hotels') as any).select('id, settings').eq('id', staff.hotel_id).single();
    const existingItems: MenuItem[] = (hotel?.settings?.menu_items as MenuItem[]) || [];

    const updatedItems = existingItems.map((item) =>
      item.id === itemId ? { ...item, is_active: isActive, updated_at: new Date().toISOString() } : item
    );

    const { error: updateErr } = await (supabase.from('hotels') as any)
      .update({ settings: { ...(hotel?.settings || {}), menu_items: updatedItems } })
      .eq('id', staff.hotel_id);

    if (updateErr) {
      return { error: `Failed to update status: ${updateErr.message}` };
    }

    revalidatePath('/settings/food-menu');
    return { success: true };
  } catch (err: any) {
    console.error('toggleMenuItemStatusAction error:', err);
    return { error: `Failed to toggle status: ${err?.message || String(err)}` };
  }
}

/**
 * Save or update a food menu category
 * Accessible ONLY by Owner and Manager
 */
export async function saveMenuCategoryAction(input: SaveMenuCategoryInput): Promise<{
  success?: boolean;
  category?: MenuCategory;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { error: 'Access denied: Only Owner and Manager can manage menu categories' };
    }

    if (!input.name || !input.name.trim()) {
      return { error: 'Category name is required' };
    }

    const supabase = createClient();
    const catId = input.id || crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Try public.menu_categories table
    try {
      const { data: tableData, error: tableErr } = await (supabase.from('menu_categories') as any)
        .upsert({
          id: catId,
          hotel_id: staff.hotel_id,
          name: input.name.trim(),
          display_order: Number(input.display_order) || 0,
          is_active: input.is_active !== undefined ? input.is_active : true,
          updated_at: now,
        })
        .select()
        .single();

      if (!tableErr && tableData) {
        revalidatePath('/settings/food-menu');
        return { success: true, category: tableData };
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings.menu_categories
    const { data: hotel } = await (supabase.from('hotels') as any).select('id, settings').eq('id', staff.hotel_id).single();
    const existingCats: MenuCategory[] = (hotel?.settings?.menu_categories as MenuCategory[]) || [];

    const existingIndex = existingCats.findIndex((c) => c.id === catId || c.name.toLowerCase() === input.name.trim().toLowerCase());

    const newCategory: MenuCategory = {
      id: catId,
      hotel_id: staff.hotel_id,
      name: input.name.trim(),
      display_order: Number(input.display_order) || (existingCats.length + 1),
      is_active: input.is_active !== undefined ? input.is_active : true,
      updated_at: now,
    };

    let updatedCats: MenuCategory[];
    if (existingIndex >= 0) {
      updatedCats = [...existingCats];
      updatedCats[existingIndex] = newCategory;
    } else {
      updatedCats = [...existingCats, newCategory];
    }

    const { error: updateErr } = await (supabase.from('hotels') as any)
      .update({ settings: { ...(hotel?.settings || {}), menu_categories: updatedCats } })
      .eq('id', staff.hotel_id);

    if (updateErr) {
      return { error: `Failed to save category: ${updateErr.message}` };
    }

    revalidatePath('/settings/food-menu');
    return { success: true, category: newCategory };
  } catch (err: any) {
    console.error('saveMenuCategoryAction error:', err);
    return { error: `Failed to save category: ${err?.message || String(err)}` };
  }
}
