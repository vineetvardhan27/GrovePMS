export interface MenuCategory {
  id: string;
  hotel_id?: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  hotel_id?: string;
  category_id: string;
  name: string;
  description: string | null;
  selling_price: number;
  is_active: boolean;
  category?: MenuCategory;
  created_at?: string;
  updated_at?: string;
}

export interface SaveMenuItemInput {
  id?: string;
  category_id: string;
  name: string;
  description?: string | null;
  selling_price: number;
  is_active?: boolean;
}

export interface SaveMenuCategoryInput {
  id?: string;
  name: string;
  display_order?: number;
  is_active?: boolean;
}
