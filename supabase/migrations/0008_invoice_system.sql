-- Migration: 0008_invoice_system.sql
-- Description: Add persistent invoice_number and invoice_date to bookings, and sequence generation function

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_bookings_invoice_number ON public.bookings(invoice_number);

-- Function to get or generate persistent invoice number
CREATE OR REPLACE FUNCTION public.get_or_generate_invoice_number(p_booking_id UUID)
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
    -- Check existing invoice number
    SELECT hotel_id, invoice_number, COALESCE(invoice_date, (created_at AT TIME ZONE 'Asia/Kolkata')::DATE)
    INTO v_hotel_id, v_existing_inv, v_existing_date
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found.' USING ERRCODE = 'P0002';
    END IF;

    IF v_existing_inv IS NOT NULL AND v_existing_inv != '' THEN
        RETURN jsonb_build_object(
            'invoice_number', v_existing_inv,
            'invoice_date', v_existing_date
        );
    END IF;

    -- Generate new sequence for today
    v_created_date := CURRENT_DATE;
    v_date_str := to_char(v_created_date, 'YYYYMMDD');

    -- Count existing invoices on this date for the hotel
    SELECT COUNT(*) + 1
    INTO v_seq_num
    FROM public.bookings
    WHERE hotel_id = v_hotel_id
      AND invoice_number LIKE 'HGV-INV-' || v_date_str || '-%';

    v_new_inv := 'HGV-INV-' || v_date_str || '-' || lpad(v_seq_num::TEXT, 4, '0');

    -- Update booking
    UPDATE public.bookings
    SET invoice_number = v_new_inv,
        invoice_date = v_created_date,
        updated_at = NOW()
    WHERE id = p_booking_id;

    RETURN jsonb_build_object(
        'invoice_number', v_new_inv,
        'invoice_date', v_created_date
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_generate_invoice_number TO authenticated;

-- Backfill existing bookings with sequential invoice numbers if null
DO $$
DECLARE
    b RECORD;
    v_date_str TEXT;
    v_seq INTEGER := 1;
BEGIN
    FOR b IN 
        SELECT id, created_at, hotel_id 
        FROM public.bookings 
        WHERE invoice_number IS NULL 
        ORDER BY created_at ASC 
    LOOP
        v_date_str := to_char(COALESCE(b.created_at, NOW()), 'YYYYMMDD');
        UPDATE public.bookings
        SET invoice_number = 'HGV-INV-' || v_date_str || '-' || lpad(v_seq::TEXT, 4, '0'),
            invoice_date = (b.created_at AT TIME ZONE 'Asia/Kolkata')::DATE
        WHERE id = b.id;
        v_seq := v_seq + 1;
    END LOOP;
END $$;
