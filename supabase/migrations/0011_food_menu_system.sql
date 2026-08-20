-- Migration: 0011_food_menu_system.sql
-- Description: Create menu_categories and menu_items tables with RLS policies and seed default food items

-- 1. Create menu_categories table
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_hotel_menu_category_name UNIQUE (hotel_id, name)
);

-- Enable RLS on menu_categories
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view menu categories" ON public.menu_categories;
CREATE POLICY "Staff can view menu categories" ON public.menu_categories
    FOR SELECT TO authenticated
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Owner and Manager can manage menu categories" ON public.menu_categories;
CREATE POLICY "Owner and Manager can manage menu categories" ON public.menu_categories
    FOR ALL TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

-- 2. Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_hotel_menu_item_name UNIQUE (hotel_id, name)
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view menu items" ON public.menu_items;
CREATE POLICY "Staff can view menu items" ON public.menu_items
    FOR SELECT TO authenticated
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Owner and Manager can manage menu items" ON public.menu_items;
CREATE POLICY "Owner and Manager can manage menu items" ON public.menu_items
    FOR ALL TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

-- 3. Seed Default Menu Categories and Items for Hotel Greenery View
DO $$
DECLARE
    v_hotel_id UUID;
    v_cat_breakfast UUID := 'e0000000-0000-0000-0000-000000000001';
    v_cat_lunch UUID := 'e0000000-0000-0000-0000-000000000002';
    v_cat_dinner UUID := 'e0000000-0000-0000-0000-000000000003';
    v_cat_snacks UUID := 'e0000000-0000-0000-0000-000000000004';
    v_cat_beverages UUID := 'e0000000-0000-0000-0000-000000000005';
    v_cat_other UUID := 'e0000000-0000-0000-0000-000000000006';
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF v_hotel_id IS NULL THEN
        SELECT id INTO v_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    IF v_hotel_id IS NOT NULL THEN
        -- Insert Categories
        INSERT INTO public.menu_categories (id, hotel_id, name, display_order, is_active)
        VALUES
            (v_cat_breakfast, v_hotel_id, 'Breakfast', 1, true),
            (v_cat_lunch, v_hotel_id, 'Lunch', 2, true),
            (v_cat_dinner, v_hotel_id, 'Dinner', 3, true),
            (v_cat_snacks, v_hotel_id, 'Snacks', 4, true),
            (v_cat_beverages, v_hotel_id, 'Beverages', 5, true),
            (v_cat_other, v_hotel_id, 'Other', 6, true)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            display_order = EXCLUDED.display_order,
            updated_at = NOW();

        -- Insert Sample Food Items
        INSERT INTO public.menu_items (hotel_id, category_id, name, description, selling_price, is_active)
        VALUES
            (v_hotel_id, v_cat_breakfast, 'Masala Dosa', 'Crispy rice crepe filled with spiced potato masala, served with sambar and fresh chutneys', 120.00, true),
            (v_hotel_id, v_cat_breakfast, 'Idli Sambar (3 Pcs)', 'Steamed rice cakes served with aromatic lentil sambar and coconut chutney', 80.00, true),
            (v_hotel_id, v_cat_breakfast, 'Poori Bhaji (4 Pcs)', 'Fluffy deep-fried pooris served with spiced potato curry', 110.00, true),
            (v_hotel_id, v_cat_breakfast, 'Aloo Paratha with Curd', 'Stuffed whole wheat flatbread served with fresh curd and mixed pickle', 100.00, true),

            (v_hotel_id, v_cat_lunch, 'Paneer Butter Masala', 'Cottage cheese cubes simmered in a rich, buttery tomato cream gravy', 240.00, true),
            (v_hotel_id, v_cat_lunch, 'Dal Tadka', 'Yellow lentils tempered with ghee, cumin seeds, garlic, and fresh coriander', 160.00, true),
            (v_hotel_id, v_cat_lunch, 'Veg Biryani with Raita', 'Fragrant basmati rice layered with garden vegetables and aromatic whole spices', 210.00, true),
            (v_hotel_id, v_cat_lunch, 'Butter Roti (2 Pcs)', 'Tandoor-baked whole wheat flatbread brushed with fresh butter', 40.00, true),

            (v_hotel_id, v_cat_dinner, 'Kadhai Paneer', 'Paneer and bell peppers cooked with freshly ground whole spices in a wok', 250.00, true),
            (v_hotel_id, v_cat_dinner, 'Mixed Vegetable Curry', 'Seasonal fresh vegetables cooked in homestyle spiced onion-tomato gravy', 180.00, true),
            (v_hotel_id, v_cat_dinner, 'Jeera Rice', 'Aromatic basmati rice tossed with cumin seeds and pure desi ghee', 130.00, true),

            (v_hotel_id, v_cat_snacks, 'Crispy Veg Pakoda Platter', 'Assorted vegetable fritters served hot with mint and tamarind dips', 90.00, true),
            (v_hotel_id, v_cat_snacks, 'French Fries', 'Crispy golden potato fries seasoned with peri-peri salt', 100.00, true),
            (v_hotel_id, v_cat_snacks, 'Veg Grilled Cheese Sandwich', 'Toasted triple-decker sandwich loaded with vegetables and mozzarella cheese', 130.00, true),

            (v_hotel_id, v_cat_beverages, 'Masala Chai', 'Authentic Indian tea brewed with crushed ginger, cardamom, and whole milk', 30.00, true),
            (v_hotel_id, v_cat_beverages, 'Filter Coffee', 'Traditional South Indian frothy filter coffee', 40.00, true),
            (v_hotel_id, v_cat_beverages, 'Fresh Lime Soda (Sweet/Salt)', 'Freshly squeezed lemon juice with chilled sparkling soda', 60.00, true),
            (v_hotel_id, v_cat_beverages, 'Packaged Mineral Water (1L)', 'Sealed packaged drinking water bottle', 20.00, true)
        ON CONFLICT (hotel_id, name) DO UPDATE SET
            selling_price = EXCLUDED.selling_price,
            description = EXCLUDED.description,
            category_id = EXCLUDED.category_id,
            updated_at = NOW();
    END IF;
END $$;
