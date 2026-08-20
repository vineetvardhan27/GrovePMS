-- Migration: 0013_food_inventory_system.sql
-- Description: Create inventory_items and inventory_transactions tables with RLS policies and seed default food ingredients

-- 1. Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'gram', 'litre', 'ml', 'piece', 'packet', 'box', 'dozen', 'can', 'bottle')),
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    target_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (target_stock >= 0),
    cost_per_unit NUMERIC(10, 2) DEFAULT 0 CHECK (cost_per_unit >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_hotel_inventory_item UNIQUE (hotel_id, name)
);

-- 2. Create inventory_transactions table (Audit Movement History)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'waste')),
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    unit_price NUMERIC(10, 2) DEFAULT 0 CHECK (unit_price >= 0),
    total_cost NUMERIC(10, 2) DEFAULT 0 CHECK (total_cost >= 0),
    supplier TEXT,
    reason TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for performance and isolation
CREATE INDEX IF NOT EXISTS idx_inventory_items_hotel_id ON public.inventory_items(hotel_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_hotel_id ON public.inventory_transactions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON public.inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);

-- 4. Updated_at Trigger for inventory_items
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER update_inventory_items_updated_at 
    BEFORE UPDATE ON public.inventory_items 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Enable Row-Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for inventory_items (Owner and Manager ONLY)
DROP POLICY IF EXISTS "Owner and Manager can view inventory items" ON public.inventory_items;
CREATE POLICY "Owner and Manager can view inventory items"
    ON public.inventory_items FOR SELECT
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

DROP POLICY IF EXISTS "Owner and Manager can insert inventory items" ON public.inventory_items;
CREATE POLICY "Owner and Manager can insert inventory items"
    ON public.inventory_items FOR INSERT
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

DROP POLICY IF EXISTS "Owner and Manager can update inventory items" ON public.inventory_items;
CREATE POLICY "Owner and Manager can update inventory items"
    ON public.inventory_items FOR UPDATE
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

DROP POLICY IF EXISTS "Owner and Manager can delete inventory items" ON public.inventory_items;
CREATE POLICY "Owner and Manager can delete inventory items"
    ON public.inventory_items FOR DELETE
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

-- 7. RLS Policies for inventory_transactions (Owner and Manager ONLY)
DROP POLICY IF EXISTS "Owner and Manager can view inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Owner and Manager can view inventory transactions"
    ON public.inventory_transactions FOR SELECT
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

DROP POLICY IF EXISTS "Owner and Manager can insert inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Owner and Manager can insert inventory transactions"
    ON public.inventory_transactions FOR INSERT
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

-- 8. Seed Default Sample Food Ingredients for Hotel Greenery View
DO $$
DECLARE
    v_hotel_id UUID;
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF v_hotel_id IS NULL THEN
        SELECT id INTO v_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    IF v_hotel_id IS NOT NULL THEN
        INSERT INTO public.inventory_items (hotel_id, name, category, unit, current_stock, minimum_stock, target_stock, cost_per_unit, is_active)
        VALUES
            (v_hotel_id, 'Basmati Rice', 'Grains & Cereals', 'kg', 18.00, 20.00, 50.00, 95.00, true),
            (v_hotel_id, 'Whole Wheat Flour (Atta)', 'Grains & Cereals', 'kg', 35.00, 25.00, 60.00, 42.00, true),
            (v_hotel_id, 'Toor Dal / Yellow Lentils', 'Grains & Cereals', 'kg', 8.50, 10.00, 25.00, 140.00, true),
            (v_hotel_id, 'Potatoes', 'Vegetables', 'kg', 14.00, 15.00, 40.00, 28.00, true),
            (v_hotel_id, 'Onions', 'Vegetables', 'kg', 22.00, 15.00, 35.00, 35.00, true),
            (v_hotel_id, 'Tomatoes', 'Vegetables', 'kg', 6.00, 10.00, 20.00, 40.00, true),
            (v_hotel_id, 'Fresh Paneer (Cottage Cheese)', 'Dairy', 'kg', 4.50, 5.00, 15.00, 320.00, true),
            (v_hotel_id, 'Full Cream Fresh Milk', 'Dairy', 'litre', 12.00, 15.00, 30.00, 65.00, true),
            (v_hotel_id, 'Table Butter', 'Dairy', 'kg', 3.00, 4.00, 10.00, 480.00, true),
            (v_hotel_id, 'Eggs', 'Poultry', 'dozen', 6.00, 8.00, 20.00, 85.00, true),
            (v_hotel_id, 'Refined Sunflower Cooking Oil', 'Oils & Fats', 'litre', 28.00, 20.00, 50.00, 135.00, true),
            (v_hotel_id, 'Pure Desi Ghee', 'Oils & Fats', 'litre', 4.00, 5.00, 10.00, 650.00, true),
            (v_hotel_id, 'Refined Sugar', 'Spices & Dry', 'kg', 18.00, 15.00, 35.00, 44.00, true),
            (v_hotel_id, 'Premium Assam Tea Leaves', 'Beverages & Dry', 'kg', 5.50, 4.00, 12.00, 380.00, true),
            (v_hotel_id, 'Filter Coffee Powder', 'Beverages & Dry', 'kg', 2.50, 3.00, 8.00, 520.00, true),
            (v_hotel_id, 'Garam Masala Blend', 'Spices & Dry', 'kg', 1.20, 2.00, 5.00, 450.00, true),
            (v_hotel_id, 'Cumin Seeds (Jeera)', 'Spices & Dry', 'kg', 3.00, 2.00, 6.00, 380.00, true),
            (v_hotel_id, 'Packaged Mineral Water (1L)', 'Beverages & Dry', 'bottle', 48.00, 24.00, 100.00, 12.00, true)
        ON CONFLICT (hotel_id, name) DO UPDATE SET
            category = EXCLUDED.category,
            unit = EXCLUDED.unit,
            minimum_stock = EXCLUDED.minimum_stock,
            target_stock = EXCLUDED.target_stock,
            cost_per_unit = EXCLUDED.cost_per_unit,
            updated_at = NOW();
    END IF;
END $$;
