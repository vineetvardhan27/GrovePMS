-- Migration: 0016_banquet_billing_system.sql
-- Description: Banquet Booking Folio, Itemized Charges, Payments, Invoicing, and Balance Tracking

-- 1. Enhance banquet_bookings table with billing & customer tax fields
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS customer_gstin TEXT;
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded'));
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE;
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0);
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0);
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (grand_total >= 0);
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS total_paid NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_paid >= 0);
ALTER TABLE public.banquet_bookings ADD COLUMN IF NOT EXISTS balance_due NUMERIC(10, 2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_banquet_bookings_payment_status ON public.banquet_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_banquet_bookings_invoice_number ON public.banquet_bookings(invoice_number);

-- 2. Create banquet_charges table (Itemized event folio charges)
CREATE TABLE IF NOT EXISTS public.banquet_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    banquet_booking_id UUID NOT NULL REFERENCES public.banquet_bookings(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'hall_rental' CHECK (category IN (
        'hall_rental',
        'food_beverage',
        'catering',
        'decoration',
        'audio_visual',
        'equipment',
        'generator',
        'accommodation',
        'service_charge',
        'cleaning',
        'miscellaneous'
    )),
    description TEXT NOT NULL,
    sac_code TEXT DEFAULT '996311',
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    tax_treatment TEXT NOT NULL DEFAULT 'gst' CHECK (tax_treatment IN ('gst', 'non_gst')),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00 CHECK (tax_rate >= 0),
    taxable_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (taxable_amount >= 0),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banquet_charges_booking ON public.banquet_charges(banquet_booking_id);
CREATE INDEX IF NOT EXISTS idx_banquet_charges_hotel ON public.banquet_charges(hotel_id);

-- 3. Create banquet_payments table (Event payment transactions & audit trail)
CREATE TABLE IF NOT EXISTS public.banquet_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    banquet_booking_id UUID NOT NULL REFERENCES public.banquet_bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
    payment_type TEXT NOT NULL DEFAULT 'partial' CHECK (payment_type IN ('advance', 'partial', 'running', 'settlement', 'refund')),
    reference_number TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banquet_payments_booking ON public.banquet_payments(banquet_booking_id);
CREATE INDEX IF NOT EXISTS idx_banquet_payments_hotel ON public.banquet_payments(hotel_id);

-- 4. Enable Row Level Security
ALTER TABLE public.banquet_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banquet_payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for banquet_charges
DROP POLICY IF EXISTS "Staff can view banquet charges" ON public.banquet_charges;
CREATE POLICY "Staff can view banquet charges"
    ON public.banquet_charges FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can manage banquet charges" ON public.banquet_charges;
CREATE POLICY "Staff can manage banquet charges"
    ON public.banquet_charges FOR ALL
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

-- 6. RLS Policies for banquet_payments
DROP POLICY IF EXISTS "Staff can view banquet payments" ON public.banquet_payments;
CREATE POLICY "Staff can view banquet payments"
    ON public.banquet_payments FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can manage banquet payments" ON public.banquet_payments;
CREATE POLICY "Staff can manage banquet payments"
    ON public.banquet_payments FOR ALL
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

-- 7. Deterministic Banquet Invoice Number Generator Function
CREATE OR REPLACE FUNCTION public.get_or_generate_banquet_invoice_number(p_banquet_booking_id UUID)
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
    FROM public.banquet_bookings
    WHERE id = p_banquet_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Banquet booking not found.' USING ERRCODE = 'P0002';
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
    FROM public.banquet_bookings
    WHERE hotel_id = v_hotel_id
      AND invoice_number LIKE 'HGV-BNQ-INV-' || v_date_str || '-%';

    v_new_inv := 'HGV-BNQ-INV-' || v_date_str || '-' || lpad(v_seq_num::TEXT, 4, '0');

    UPDATE public.banquet_bookings
    SET invoice_number = v_new_inv,
        invoice_date = v_created_date,
        updated_at = NOW()
    WHERE id = p_banquet_booking_id;

    RETURN jsonb_build_object(
        'invoice_number', v_new_inv,
        'invoice_date', v_created_date
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_generate_banquet_invoice_number TO authenticated;
