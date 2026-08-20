-- Migration: 0007_create_booking_atomic.sql
-- Description: Atomic booking transaction RPC function, secure trigger update, and strict consistency

-- 1. Atomic Booking Creation Function (Postgres Transaction & Row Locking)
CREATE OR REPLACE FUNCTION public.create_booking_transaction(
    p_room_id UUID,
    p_guest_name TEXT,
    p_guest_phone TEXT,
    p_guest_email TEXT DEFAULT NULL,
    p_guest_id_type TEXT DEFAULT NULL,
    p_guest_id_number TEXT DEFAULT NULL,
    p_guest_address TEXT DEFAULT NULL,
    p_check_in_date DATE DEFAULT CURRENT_DATE,
    p_check_out_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 day')::DATE,
    p_adults INTEGER DEFAULT 1,
    p_children INTEGER DEFAULT 0,
    p_rate_per_night NUMERIC DEFAULT 0,
    p_extra_charges NUMERIC DEFAULT 0,
    p_advance_amount NUMERIC DEFAULT 0,
    p_payment_mode TEXT DEFAULT 'cash',
    p_source TEXT DEFAULT 'direct',
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_staff_id UUID;
    v_hotel_id UUID;
    v_staff_role TEXT;
    v_target_room RECORD;
    v_conflict_count INTEGER;
    v_guest_id UUID;
    v_guest_record RECORD;
    v_nights INTEGER;
    v_total_amount NUMERIC;
    v_advance_amount NUMERIC;
    v_payment_status TEXT;
    v_booking_id UUID;
    v_booking_number TEXT;
    v_booking_record RECORD;
    v_payment_record RECORD;
    v_new_room_status TEXT;
    v_year_month TEXT;
    v_rand_suffix INTEGER;
BEGIN
    -- Step 1: Validate Authenticated Staff Context
    v_staff_id := auth.uid();
    IF v_staff_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required. Please sign in.' USING ERRCODE = 'P0001';
    END IF;

    SELECT hotel_id, role INTO v_hotel_id, v_staff_role
    FROM public.staff
    WHERE id = v_staff_id AND is_active = true
    LIMIT 1;

    IF v_hotel_id IS NULL THEN
        RAISE EXCEPTION 'No active hotel staff profile found for authenticated user.' USING ERRCODE = 'P0002';
    END IF;

    IF v_staff_role = 'housekeeping' THEN
        RAISE EXCEPTION 'Housekeeping role is not permitted to create reservations.' USING ERRCODE = 'P0003';
    END IF;

    -- Step 2: Validate Dates
    IF p_check_in_date IS NULL OR p_check_out_date IS NULL THEN
        RAISE EXCEPTION 'Check-in and check-out dates are required.' USING ERRCODE = 'P0004';
    END IF;

    IF p_check_out_date <= p_check_in_date THEN
        RAISE EXCEPTION 'Check-out date must be strictly after check-in date.' USING ERRCODE = 'P0005';
    END IF;

    IF TRIM(p_guest_name) = '' OR TRIM(p_guest_phone) = '' THEN
        RAISE EXCEPTION 'Guest name and phone number are required.' USING ERRCODE = 'P0006';
    END IF;

    -- Step 3: Lock & Verify Target Room (Row Lock prevents concurrent modifications)
    SELECT r.*, rc.name AS category_name, rc.base_rate AS category_base_rate
    INTO v_target_room
    FROM public.rooms r
    LEFT JOIN public.room_categories rc ON rc.id = r.category_id
    WHERE r.id = p_room_id AND r.hotel_id = v_hotel_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Room does not exist in your hotel property.' USING ERRCODE = 'P0007';
    END IF;

    -- Step 4: Check Double-Booking Conflict within Transaction
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.bookings
    WHERE hotel_id = v_hotel_id
      AND room_id = p_room_id
      AND booking_status != 'cancelled'
      AND check_in_date < p_check_out_date
      AND check_out_date > p_check_in_date;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'This room is already reserved for overlapping dates. Please select different dates or room.' USING ERRCODE = 'P0008';
    END IF;

    -- Step 5: Find or Create Guest
    SELECT id, full_name, phone, email, id_type, id_number, address
    INTO v_guest_record
    FROM public.guests
    WHERE hotel_id = v_hotel_id AND phone = TRIM(p_guest_phone)
    LIMIT 1;

    IF FOUND THEN
        v_guest_id := v_guest_record.id;
        -- Update optional guest fields if newly provided
        UPDATE public.guests
        SET email = COALESCE(NULLIF(TRIM(p_guest_email), ''), email),
            id_type = COALESCE(NULLIF(TRIM(p_guest_id_type), ''), id_type),
            id_number = COALESCE(NULLIF(TRIM(p_guest_id_number), ''), id_number),
            address = COALESCE(NULLIF(TRIM(p_guest_address), ''), address),
            updated_at = NOW()
        WHERE id = v_guest_id;
    ELSE
        v_guest_id := gen_random_uuid();
        INSERT INTO public.guests (
            id, hotel_id, full_name, phone, email, id_type, id_number, address, created_at, updated_at
        )
        VALUES (
            v_guest_id, v_hotel_id, TRIM(p_guest_name), TRIM(p_guest_phone),
            NULLIF(TRIM(p_guest_email), ''),
            NULLIF(TRIM(p_guest_id_type), ''),
            NULLIF(TRIM(p_guest_id_number), ''),
            NULLIF(TRIM(p_guest_address), ''),
            NOW(), NOW()
        );
    END IF;

    -- Step 6: Compute Stay Financials
    v_nights := GREATEST(1, (p_check_out_date - p_check_in_date));
    v_total_amount := (v_nights * GREATEST(0, p_rate_per_night)) + GREATEST(0, COALESCE(p_extra_charges, 0));
    v_advance_amount := GREATEST(0, COALESCE(p_advance_amount, 0));

    IF v_advance_amount >= v_total_amount AND v_total_amount > 0 THEN
        v_payment_status := 'fully_paid';
    ELSIF v_advance_amount > 0 THEN
        v_payment_status := 'advance_received';
    ELSE
        v_payment_status := 'no_payment';
    END IF;

    -- Step 7: Generate Booking Number & Insert Booking Record
    v_year_month := to_char(NOW(), 'YYYYMM');
    v_rand_suffix := floor(1000 + random() * 9000)::INTEGER;
    v_booking_number := 'HGV-' || v_year_month || '-' || v_rand_suffix::TEXT;
    v_booking_id := gen_random_uuid();

    INSERT INTO public.bookings (
        id, hotel_id, booking_number, room_id, guest_id,
        check_in_date, check_out_date, adults, children,
        rate_per_night, total_amount, advance_amount, payment_status,
        booking_status, source, remarks, created_at, updated_at
    )
    VALUES (
        v_booking_id, v_hotel_id, v_booking_number, p_room_id, v_guest_id,
        p_check_in_date, p_check_out_date, GREATEST(1, p_adults), GREATEST(0, p_children),
        GREATEST(0, p_rate_per_night), v_total_amount, v_advance_amount, v_payment_status,
        'confirmed', COALESCE(NULLIF(p_source, ''), 'direct'), NULLIF(TRIM(p_remarks), ''),
        NOW(), NOW()
    )
    RETURNING * INTO v_booking_record;

    -- Step 8: Insert Advance Payment if Present
    IF v_advance_amount > 0 THEN
        INSERT INTO public.payments (
            id, hotel_id, booking_id, amount, payment_mode, payment_type, notes, recorded_by, created_at
        )
        VALUES (
            gen_random_uuid(), v_hotel_id, v_booking_id, v_advance_amount,
            COALESCE(NULLIF(p_payment_mode, ''), 'cash'),
            'advance',
            'Advance payment for booking #' || v_booking_number,
            v_staff_id,
            NOW()
        )
        RETURNING * INTO v_payment_record;
    END IF;

    -- Step 9: Update Room Status
    v_new_room_status := v_target_room.status;
    IF p_check_in_date = CURRENT_DATE THEN
        v_new_room_status := 'arriving_today';
    ELSIF p_check_in_date > CURRENT_DATE AND (v_target_room.status = 'available' OR v_target_room.status = 'cleaning') THEN
        v_new_room_status := 'reserved';
    END IF;

    IF v_new_room_status != v_target_room.status THEN
        UPDATE public.rooms
        SET status = v_new_room_status, updated_at = NOW()
        WHERE id = p_room_id AND hotel_id = v_hotel_id;
    END IF;

    -- Return JSON composite object
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_number', v_booking_number,
        'hotel_id', v_hotel_id,
        'room_id', p_room_id,
        'guest_id', v_guest_id,
        'check_in_date', p_check_in_date,
        'check_out_date', p_check_out_date,
        'total_amount', v_total_amount,
        'advance_amount', v_advance_amount,
        'payment_status', v_payment_status,
        'booking_status', 'confirmed',
        'room_status', v_new_room_status
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_transaction TO authenticated;

-- 2. Hardened User Provisioning Trigger (Prevents unauthorized role escalation / foreign hotel attachment)
CREATE OR REPLACE FUNCTION public.handle_new_user_staff()
RETURNS TRIGGER AS $$
DECLARE
    invited_hotel_id UUID;
    invited_role TEXT;
    user_full_name TEXT;
BEGIN
    -- Check if explicitly invited to a hotel via metadata
    IF NEW.raw_user_meta_data->>'hotel_id' IS NOT NULL THEN
        invited_hotel_id := (NEW.raw_user_meta_data->>'hotel_id')::UUID;
        invited_role := COALESCE(NEW.raw_user_meta_data->>'role', 'reception');
    ELSE
        -- For security: Uninvited users are not automatically granted access to existing hotels
        invited_hotel_id := NULL;
        invited_role := 'reception';
    END IF;

    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    -- Only insert into public.staff if an authorized hotel was explicitly assigned
    IF invited_hotel_id IS NOT NULL THEN
        INSERT INTO public.staff (id, hotel_id, email, full_name, role, is_active, created_at, updated_at)
        VALUES (NEW.id, invited_hotel_id, NEW.email, user_full_name, invited_role, true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
