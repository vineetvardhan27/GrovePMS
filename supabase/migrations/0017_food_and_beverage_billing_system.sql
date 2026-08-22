-- Migration: 0017_food_and_beverage_billing_system.sql
-- Description: Standalone Food & Beverage Billing System: Bills, Orders, Items, Payments, Audit Logs, and Menu Enhancements

-- 1. Enhance menu_items with additional POS metadata
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) DEFAULT 0 CHECK (base_price >= 0);
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5, 2) DEFAULT 5.00 CHECK (gst_rate >= 0);
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS food_type TEXT NOT NULL DEFAULT 'veg' CHECK (food_type IN ('veg', 'non_veg', 'egg'));
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS available_meals TEXT[] DEFAULT ARRAY['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS kitchen_area TEXT DEFAULT 'Main Kitchen';
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL;

-- 2. Create fb_bills table (Master F&B Bill & Folio)
CREATE TABLE IF NOT EXISTS public.fb_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    bill_number TEXT NOT NULL,
    invoice_number TEXT UNIQUE,
    invoice_date DATE,
    customer_type TEXT NOT NULL DEFAULT 'room_guest' CHECK (customer_type IN ('room_guest', 'walk_in')),
    
    -- Hotel Guest Reference (optional if walk_in)
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    
    -- Guest/Customer Snapshot Details
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    table_number TEXT,
    room_number_snapshot TEXT,
    booking_number_snapshot TEXT,
    
    -- Billing Configuration
    billing_mode TEXT NOT NULL DEFAULT 'pay_now' CHECK (billing_mode IN ('pay_now', 'charge_to_room')),
    bill_status TEXT NOT NULL DEFAULT 'completed' CHECK (bill_status IN ('draft', 'confirmed', 'completed', 'cancelled', 'void')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded', 'charged_to_room')),
    
    -- Financials & Discounts
    discount_type TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('none', 'percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    discount_reason TEXT,
    discount_authorized_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    taxable_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (taxable_amount >= 0),
    cgst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cgst_amount >= 0),
    sgst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (sgst_amount >= 0),
    gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
    grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (grand_total >= 0),
    total_paid NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_paid >= 0),
    balance_due NUMERIC(10, 2) NOT NULL DEFAULT 0,
    
    special_instructions TEXT,
    remarks TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_hotel_fb_bill_number UNIQUE (hotel_id, bill_number)
);

CREATE INDEX IF NOT EXISTS idx_fb_bills_hotel_id ON public.fb_bills(hotel_id);
CREATE INDEX IF NOT EXISTS idx_fb_bills_booking_id ON public.fb_bills(booking_id);
CREATE INDEX IF NOT EXISTS idx_fb_bills_payment_status ON public.fb_bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_fb_bills_bill_status ON public.fb_bills(bill_status);
CREATE INDEX IF NOT EXISTS idx_fb_bills_created_at ON public.fb_bills(created_at);

-- 3. Create fb_orders table (Groupings by meal/order session)
CREATE TABLE IF NOT EXISTS public.fb_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES public.fb_bills(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    meal_type TEXT NOT NULL DEFAULT 'Breakfast' CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Room Service', 'Banquet', 'Other')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    special_instructions TEXT,
    order_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fb_orders_bill_id ON public.fb_orders(bill_id);
CREATE INDEX IF NOT EXISTS idx_fb_orders_hotel_id ON public.fb_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_fb_orders_status ON public.fb_orders(status);
CREATE INDEX IF NOT EXISTS idx_fb_orders_meal_type ON public.fb_orders(meal_type);

-- 4. Create fb_order_items table (Itemized food lines)
CREATE TABLE IF NOT EXISTS public.fb_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.fb_orders(id) ON DELETE CASCADE,
    bill_id UUID NOT NULL REFERENCES public.fb_bills(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name_snapshot TEXT NOT NULL,
    category_snapshot TEXT NOT NULL,
    meal_type TEXT NOT NULL DEFAULT 'Breakfast',
    food_type TEXT NOT NULL DEFAULT 'veg' CHECK (food_type IN ('veg', 'non_veg', 'egg')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    base_price_snapshot NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (base_price_snapshot >= 0),
    tax_treatment TEXT NOT NULL DEFAULT 'gst' CHECK (tax_treatment IN ('gst', 'non_gst')),
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (gst_rate >= 0),
    taxable_amount NUMERIC(10, 2) NOT NULL CHECK (taxable_amount >= 0),
    gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fb_order_items_order_id ON public.fb_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_fb_order_items_bill_id ON public.fb_order_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_fb_order_items_hotel_id ON public.fb_order_items(hotel_id);

-- 5. Create fb_payments table (F&B Payment Receipts)
CREATE TABLE IF NOT EXISTS public.fb_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES public.fb_bills(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
    payment_type TEXT NOT NULL DEFAULT 'settlement' CHECK (payment_type IN ('advance', 'partial', 'settlement', 'refund')),
    reference_number TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fb_payments_bill_id ON public.fb_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_fb_payments_hotel_id ON public.fb_payments(hotel_id);

-- 6. Create fb_audit_logs table (Immutable F&B Audit Trail)
CREATE TABLE IF NOT EXISTS public.fb_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES public.fb_bills(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    user_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fb_audit_logs_bill_id ON public.fb_audit_logs(bill_id);
CREATE INDEX IF NOT EXISTS idx_fb_audit_logs_hotel_id ON public.fb_audit_logs(hotel_id);

-- 7. Triggers for updated_at
DROP TRIGGER IF EXISTS update_fb_bills_updated_at ON public.fb_bills;
CREATE TRIGGER update_fb_bills_updated_at BEFORE UPDATE ON public.fb_bills FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_fb_orders_updated_at ON public.fb_orders;
CREATE TRIGGER update_fb_orders_updated_at BEFORE UPDATE ON public.fb_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_fb_order_items_updated_at ON public.fb_order_items;
CREATE TRIGGER update_fb_order_items_updated_at BEFORE UPDATE ON public.fb_order_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Enable Row-Level Security
ALTER TABLE public.fb_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fb_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fb_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fb_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fb_audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
DROP POLICY IF EXISTS "Staff can view fb_bills" ON public.fb_bills;
CREATE POLICY "Staff can view fb_bills" ON public.fb_bills FOR SELECT USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can manage fb_bills" ON public.fb_bills;
CREATE POLICY "Staff can manage fb_bills" ON public.fb_bills FOR ALL USING (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
) WITH CHECK (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
);

DROP POLICY IF EXISTS "Staff can view fb_orders" ON public.fb_orders;
CREATE POLICY "Staff can view fb_orders" ON public.fb_orders FOR SELECT USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can manage fb_orders" ON public.fb_orders;
CREATE POLICY "Staff can manage fb_orders" ON public.fb_orders FOR ALL USING (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception', 'housekeeping')
) WITH CHECK (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception', 'housekeeping')
);

DROP POLICY IF EXISTS "Staff can view fb_order_items" ON public.fb_order_items;
CREATE POLICY "Staff can view fb_order_items" ON public.fb_order_items FOR SELECT USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can manage fb_order_items" ON public.fb_order_items;
CREATE POLICY "Staff can manage fb_order_items" ON public.fb_order_items FOR ALL USING (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
) WITH CHECK (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
);

DROP POLICY IF EXISTS "Staff can view fb_payments" ON public.fb_payments;
CREATE POLICY "Staff can view fb_payments" ON public.fb_payments FOR SELECT USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can manage fb_payments" ON public.fb_payments;
CREATE POLICY "Staff can manage fb_payments" ON public.fb_payments FOR ALL USING (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
) WITH CHECK (
    hotel_id = public.get_current_staff_hotel_id()
    AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
);

DROP POLICY IF EXISTS "Staff can view fb_audit_logs" ON public.fb_audit_logs;
CREATE POLICY "Staff can view fb_audit_logs" ON public.fb_audit_logs FOR SELECT USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can insert fb_audit_logs" ON public.fb_audit_logs;
CREATE POLICY "Staff can insert fb_audit_logs" ON public.fb_audit_logs FOR INSERT WITH CHECK (hotel_id = public.get_current_staff_hotel_id());

-- 10. Deterministic F&B Invoice Number Generator Function
CREATE OR REPLACE FUNCTION public.get_or_generate_fb_invoice_number(p_bill_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_hotel_id UUID;
    v_existing_inv TEXT;
    v_existing_date DATE;
    v_date_str TEXT;
    v_seq_num INTEGER;
    v_new_inv TEXT;
    v_created_date DATE;
BEGIN
    SELECT hotel_id, invoice_number, COALESCE(invoice_date, (created_at AT TIME ZONE 'Asia/Kolkata')::DATE)
    INTO v_hotel_id, v_existing_inv, v_existing_date
    FROM public.fb_bills
    WHERE id = p_bill_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'F&B bill not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_existing_inv IS NOT NULL AND v_existing_inv != '' THEN
        RETURN jsonb_build_object(
            'invoice_number', v_existing_inv,
            'invoice_date', v_existing_date
        );
    END IF;

    v_created_date := CURRENT_DATE;
    v_date_str := to_char(v_created_date, 'YYYYMMDD');

    SELECT COUNT(*) + 1
    INTO v_seq_num
    FROM public.fb_bills
    WHERE hotel_id = v_hotel_id
      AND invoice_number LIKE 'HGV-FB-INV-' || v_date_str || '-%';

    v_new_inv := 'HGV-FB-INV-' || v_date_str || '-' || lpad(v_seq_num::TEXT, 4, '0');

    UPDATE public.fb_bills
    SET invoice_number = v_new_inv,
        invoice_date = v_created_date,
        updated_at = NOW()
    WHERE id = p_bill_id;

    RETURN jsonb_build_object(
        'invoice_number', v_new_inv,
        'invoice_date', v_created_date
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_generate_fb_invoice_number TO authenticated;
