import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { MenuCategory, MenuItem } from './types';

export const DEFAULT_MENU_CATEGORIES: MenuCategory[] = [
  { id: 'e0000000-0000-0000-0000-000000000001', name: 'Breakfast', display_order: 1, is_active: true },
  { id: 'e0000000-0000-0000-0000-000000000002', name: 'Lunch', display_order: 2, is_active: true },
  { id: 'e0000000-0000-0000-0000-000000000003', name: 'Dinner', display_order: 3, is_active: true },
  { id: 'e0000000-0000-0000-0000-000000000004', name: 'Snacks', display_order: 4, is_active: true },
  { id: 'e0000000-0000-0000-0000-000000000005', name: 'Beverages', display_order: 5, is_active: true },
  { id: 'e0000000-0000-0000-0000-000000000006', name: 'Other', display_order: 6, is_active: true },
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    category_id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Masala Dosa',
    selling_price: 120,
    is_active: true,
    description: 'Crispy rice crepe filled with spiced potato masala, served with sambar and fresh chutneys',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    category_id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Idli Sambar (3 Pcs)',
    selling_price: 80,
    is_active: true,
    description: 'Steamed rice cakes served with aromatic lentil sambar and coconut chutney',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    category_id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Poori Bhaji (4 Pcs)',
    selling_price: 110,
    is_active: true,
    description: 'Fluffy deep-fried pooris served with spiced potato curry',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    category_id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Aloo Paratha with Curd',
    selling_price: 100,
    is_active: true,
    description: 'Stuffed whole wheat flatbread served with fresh curd and mixed pickle',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    category_id: 'e0000000-0000-0000-0000-000000000002',
    name: 'Paneer Butter Masala',
    selling_price: 240,
    is_active: true,
    description: 'Cottage cheese cubes simmered in a rich, buttery tomato cream gravy',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000006',
    category_id: 'e0000000-0000-0000-0000-000000000002',
    name: 'Dal Tadka',
    selling_price: 160,
    is_active: true,
    description: 'Yellow lentils tempered with ghee, cumin seeds, garlic, and fresh coriander',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000007',
    category_id: 'e0000000-0000-0000-0000-000000000002',
    name: 'Veg Biryani with Raita',
    selling_price: 210,
    is_active: true,
    description: 'Fragrant basmati rice layered with garden vegetables and aromatic whole spices',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000008',
    category_id: 'e0000000-0000-0000-0000-000000000002',
    name: 'Butter Roti (2 Pcs)',
    selling_price: 40,
    is_active: true,
    description: 'Tandoor-baked whole wheat flatbread brushed with fresh butter',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    category_id: 'e0000000-0000-0000-0000-000000000003',
    name: 'Kadhai Paneer',
    selling_price: 250,
    is_active: true,
    description: 'Paneer and bell peppers cooked with freshly ground whole spices in a wok',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    category_id: 'e0000000-0000-0000-0000-000000000003',
    name: 'Mixed Vegetable Curry',
    selling_price: 180,
    is_active: true,
    description: 'Seasonal fresh vegetables cooked in homestyle spiced onion-tomato gravy',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    category_id: 'e0000000-0000-0000-0000-000000000003',
    name: 'Jeera Rice',
    selling_price: 130,
    is_active: true,
    description: 'Aromatic basmati rice tossed with cumin seeds and pure desi ghee',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    category_id: 'e0000000-0000-0000-0000-000000000004',
    name: 'Crispy Veg Pakoda Platter',
    selling_price: 90,
    is_active: true,
    description: 'Assorted vegetable fritters served hot with mint and tamarind dips',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    category_id: 'e0000000-0000-0000-0000-000000000004',
    name: 'French Fries',
    selling_price: 100,
    is_active: true,
    description: 'Crispy golden potato fries seasoned with peri-peri salt',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    category_id: 'e0000000-0000-0000-0000-000000000004',
    name: 'Veg Grilled Cheese Sandwich',
    selling_price: 130,
    is_active: true,
    description: 'Toasted triple-decker sandwich loaded with vegetables and mozzarella cheese',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    category_id: 'e0000000-0000-0000-0000-000000000005',
    name: 'Masala Chai',
    selling_price: 30,
    is_active: true,
    description: 'Authentic Indian tea brewed with crushed ginger, cardamom, and whole milk',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    category_id: 'e0000000-0000-0000-0000-000000000005',
    name: 'Filter Coffee',
    selling_price: 40,
    is_active: true,
    description: 'Traditional South Indian frothy filter coffee',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    category_id: 'e0000000-0000-0000-0000-000000000005',
    name: 'Fresh Lime Soda (Sweet/Salt)',
    selling_price: 60,
    is_active: true,
    description: 'Freshly squeezed lemon juice with chilled sparkling soda',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    category_id: 'e0000000-0000-0000-0000-000000000005',
    name: 'Packaged Mineral Water (1L)',
    selling_price: 20,
    is_active: true,
    description: 'Sealed packaged drinking water bottle',
  },
];

/**
 * Fetch all menu categories for the current hotel
 */
export async function getMenuCategories(hotelId?: string): Promise<MenuCategory[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    // 1. Try public.menu_categories table
    const { data: tableData, error: tableErr } = await (supabase.from('menu_categories') as any)
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (!tableErr && tableData && tableData.length > 0) {
      return tableData as MenuCategory[];
    }

    // 2. Fallback to hotel.settings.menu_categories in Supabase
    let query = (supabase.from('hotels') as any).select('id, settings');
    if (activeHotelId) query = query.eq('id', activeHotelId);
    const { data: hotelData } = await query.limit(1).maybeSingle();

    if (hotelData?.settings?.menu_categories && Array.isArray(hotelData.settings.menu_categories)) {
      return hotelData.settings.menu_categories.sort(
        (a: MenuCategory, b: MenuCategory) => (a.display_order || 0) - (b.display_order || 0)
      );
    }
  } catch (err) {
    console.error('getMenuCategories error:', err);
  }

  return DEFAULT_MENU_CATEGORIES;
}

/**
 * Fetch all menu items with joined category for the current hotel
 */
export async function getMenuItems(hotelId?: string, includeInactive: boolean = true): Promise<MenuItem[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    const categories = await getMenuCategories(activeHotelId);
    const catMap = new Map<string, MenuCategory>(categories.map((c) => [c.id, c]));

    // 1. Try public.menu_items table
    let itemQuery = (supabase.from('menu_items') as any)
      .select('*, category:category_id(*)')
      .order('name', { ascending: true });

    if (!includeInactive) {
      itemQuery = itemQuery.eq('is_active', true);
    }

    const { data: tableItems, error: tableErr } = await itemQuery;

    if (!tableErr && tableItems && tableItems.length > 0) {
      return tableItems.map((item: any) => ({
        ...item,
        category: item.category || catMap.get(item.category_id),
      })) as MenuItem[];
    }

    // 2. Fallback to hotel.settings.menu_items in Supabase
    let query = (supabase.from('hotels') as any).select('id, settings');
    if (activeHotelId) query = query.eq('id', activeHotelId);
    const { data: hotelData } = await query.limit(1).maybeSingle();

    if (hotelData?.settings?.menu_items && Array.isArray(hotelData.settings.menu_items)) {
      let items: MenuItem[] = hotelData.settings.menu_items;
      if (!includeInactive) {
        items = items.filter((i) => i.is_active);
      }
      return items.map((item) => ({
        ...item,
        category: catMap.get(item.category_id) || {
          id: item.category_id,
          name: 'Other',
          display_order: 99,
          is_active: true,
        },
      })).sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (err) {
    console.error('getMenuItems error:', err);
  }

  const categories = DEFAULT_MENU_CATEGORIES;
  const catMap = new Map<string, MenuCategory>(categories.map((c) => [c.id, c]));

  let items = DEFAULT_MENU_ITEMS;
  if (!includeInactive) items = items.filter((i) => i.is_active);
  return items.map((item) => ({
    ...item,
    category: catMap.get(item.category_id) || categories[0],
  })).sort((a, b) => a.name.localeCompare(b.name));
}
