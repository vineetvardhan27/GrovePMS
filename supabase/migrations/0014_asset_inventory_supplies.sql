-- Migration: 0014_asset_inventory_supplies.sql
-- Description: Extend inventory_items and inventory_transactions for non-food supplies, reusable hotel assets (blankets/linen), damage reporting, and replacement planning

-- 1. Extend inventory_items table
ALTER TABLE public.inventory_items 
    ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'consumable' CHECK (item_type IN ('consumable', 'reusable_asset')),
    ADD COLUMN IF NOT EXISTS inventory_type TEXT NOT NULL DEFAULT 'food_kitchen' CHECK (inventory_type IN ('food_kitchen', 'housekeeping_supplies', 'room_supplies', 'linen', 'hotel_assets', 'other')),
    ADD COLUMN IF NOT EXISTS in_use_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (in_use_stock >= 0),
    ADD COLUMN IF NOT EXISTS damaged_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (damaged_stock >= 0),
    ADD COLUMN IF NOT EXISTS lost_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (lost_stock >= 0),
    ADD COLUMN IF NOT EXISTS repair_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (repair_stock >= 0),
    ADD COLUMN IF NOT EXISTS retired_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (retired_stock >= 0),
    ADD COLUMN IF NOT EXISTS replacement_target_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE) + 1;

-- 2. Extend inventory_transactions table
ALTER TABLE public.inventory_transactions 
    DROP CONSTRAINT IF EXISTS inventory_transactions_transaction_type_check;

ALTER TABLE public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_transaction_type_check 
    CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'waste', 'issued', 'returned', 'damaged', 'repaired', 'retired', 'lost', 'replaced'));

ALTER TABLE public.inventory_transactions
    ADD COLUMN IF NOT EXISTS room_number TEXT,
    ADD COLUMN IF NOT EXISTS condition_state TEXT;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_inv_type ON public.inventory_items(inventory_type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_item_type ON public.inventory_items(item_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_room ON public.inventory_transactions(room_number);

-- 4. RLS Update: Allow Housekeeping to SELECT items and report damage
DROP POLICY IF EXISTS "Staff can view inventory items" ON public.inventory_items;
CREATE POLICY "Staff can view inventory items"
    ON public.inventory_items FOR SELECT
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'housekeeping')
    );

DROP POLICY IF EXISTS "Housekeeping can report damage" ON public.inventory_transactions;
CREATE POLICY "Housekeeping can report damage"
    ON public.inventory_transactions FOR INSERT
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'housekeeping')
        AND transaction_type IN ('damaged', 'usage')
    );

-- 5. Seed Non-Food Supplies & Reusable Hotel Assets (including Blankets)
DO $$
DECLARE
    v_hotel_id UUID;
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF v_hotel_id IS NULL THEN
        SELECT id INTO v_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    IF v_hotel_id IS NOT NULL THEN
        INSERT INTO public.inventory_items (
            hotel_id, name, category, unit, item_type, inventory_type,
            current_stock, in_use_stock, damaged_stock, repair_stock, lost_stock, retired_stock,
            minimum_stock, target_stock, cost_per_unit, is_active, replacement_target_year
        )
        VALUES
            -- Reusable Linen & Bedding Asset: Premium Blankets
            (v_hotel_id, 'Heavy Woollen Winter Blankets (King)', 'Linen & Bedding', 'piece', 'reusable_asset', 'linen', 39.00, 3.00, 2.00, 1.00, 0.00, 0.00, 10.00, 45.00, 1250.00, true, EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1),
            -- Other Reusable Linens
            (v_hotel_id, 'Cotton King Bed Sheets (300 TC)', 'Linen & Bedding', 'piece', 'reusable_asset', 'linen', 55.00, 20.00, 3.00, 2.00, 0.00, 0.00, 15.00, 80.00, 650.00, true, EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1),
            (v_hotel_id, 'Plush Bath Towels (600 GSM)', 'Linen & Bedding', 'piece', 'reusable_asset', 'linen', 42.00, 18.00, 4.00, 0.00, 1.00, 0.00, 12.00, 65.00, 380.00, true, EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1),
            -- Hotel Assets
            (v_hotel_id, 'Electric Cordless Kettles (1.5L)', 'Room Appliances', 'piece', 'reusable_asset', 'hotel_assets', 8.00, 16.00, 1.00, 1.00, 0.00, 0.00, 4.00, 26.00, 1100.00, true, EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1),
            (v_hotel_id, 'Foldable Steam Iron', 'Room Appliances', 'piece', 'reusable_asset', 'hotel_assets', 4.00, 8.00, 0.00, 0.00, 0.00, 0.00, 2.00, 12.00, 1450.00, true, EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1),
            -- Housekeeping Consumables
            (v_hotel_id, 'Floor Disinfectant Cleaning Liquid', 'Housekeeping Supplies', 'litre', 'consumable', 'housekeeping_supplies', 25.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 50.00, 120.00, true, NULL),
            (v_hotel_id, 'Heavy Duty Bio Garbage Bags (Large)', 'Housekeeping Supplies', 'packet', 'consumable', 'housekeeping_supplies', 30.00, 0.00, 0.00, 0.00, 0.00, 0.00, 15.00, 60.00, 85.00, true, NULL),
            -- Room Consumables
            (v_hotel_id, 'Ayurvedic Herbal Soap Bars (35g)', 'Guest Toiletries', 'piece', 'consumable', 'room_supplies', 120.00, 0.00, 0.00, 0.00, 0.00, 0.00, 50.00, 250.00, 18.00, true, NULL),
            (v_hotel_id, 'Eco Dental Hygiene Kit', 'Guest Toiletries', 'piece', 'consumable', 'room_supplies', 85.00, 0.00, 0.00, 0.00, 0.00, 0.00, 40.00, 200.00, 24.00, true, NULL)
        ON CONFLICT (hotel_id, name) DO UPDATE SET
            item_type = EXCLUDED.item_type,
            inventory_type = EXCLUDED.inventory_type,
            unit = EXCLUDED.unit,
            target_stock = EXCLUDED.target_stock,
            cost_per_unit = EXCLUDED.cost_per_unit,
            replacement_target_year = EXCLUDED.replacement_target_year,
            updated_at = NOW();
    END IF;
END $$;
