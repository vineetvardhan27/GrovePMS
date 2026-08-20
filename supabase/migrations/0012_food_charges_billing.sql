-- Migration: 0012_food_charges_billing.sql
-- Description: Create food_charges table with RLS policies and indexes for Phase 3 Food & Beverage Room Billing

-- 1. Create food_charges table
CREATE TABLE IF NOT EXISTS public.food_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name_snapshot TEXT NOT NULL,
    category_snapshot TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Other')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    tax_treatment TEXT NOT NULL DEFAULT 'gst' CHECK (tax_treatment IN ('gst', 'non_gst')),
    taxable_amount NUMERIC(10, 2) NOT NULL CHECK (taxable_amount >= 0),
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (gst_rate >= 0),
    gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    remarks TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for performance and isolation
CREATE INDEX IF NOT EXISTS idx_food_charges_hotel_id ON public.food_charges(hotel_id);
CREATE INDEX IF NOT EXISTS idx_food_charges_booking_id ON public.food_charges(booking_id);
CREATE INDEX IF NOT EXISTS idx_food_charges_created_at ON public.food_charges(created_at);

-- 3. Trigger for updated_at
DROP TRIGGER IF EXISTS update_food_charges_updated_at ON public.food_charges;
CREATE TRIGGER update_food_charges_updated_at 
    BEFORE UPDATE ON public.food_charges 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Enable Row-Level Security
ALTER TABLE public.food_charges ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Owner, Manager, Reception can view food charges" ON public.food_charges;
CREATE POLICY "Owner, Manager, Reception can view food charges"
    ON public.food_charges FOR SELECT
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

DROP POLICY IF EXISTS "Owner, Manager, Reception can insert food charges" ON public.food_charges;
CREATE POLICY "Owner, Manager, Reception can insert food charges"
    ON public.food_charges FOR INSERT
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

DROP POLICY IF EXISTS "Owner, Manager, Reception can update food charges" ON public.food_charges;
CREATE POLICY "Owner, Manager, Reception can update food charges"
    ON public.food_charges FOR UPDATE
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

DROP POLICY IF EXISTS "Owner, Manager, Reception can delete food charges" ON public.food_charges;
CREATE POLICY "Owner, Manager, Reception can delete food charges"
    ON public.food_charges FOR DELETE
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );
