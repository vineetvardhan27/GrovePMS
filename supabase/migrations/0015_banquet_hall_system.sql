-- Migration: 0015_banquet_hall_system.sql
-- Description: Create banquet_halls and banquet_bookings tables with time-slot availability, future billing fields, and RLS policies

-- 1. Create banquet_halls table (Separate operational resource, NOT a bedroom)
CREATE TABLE IF NOT EXISTS public.banquet_halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Grand Greenery Banquet Hall',
    capacity INT, -- Configurable capacity
    current_status TEXT NOT NULL DEFAULT 'available' CHECK (current_status IN ('available', 'reserved', 'occupied', 'maintenance')),
    description TEXT,
    half_day_rate NUMERIC(10, 2) DEFAULT 15000.00 CHECK (half_day_rate >= 0),
    full_day_rate NUMERIC(10, 2) DEFAULT 28000.00 CHECK (full_day_rate >= 0),
    amenities JSONB DEFAULT '["Air Conditioned", "Stage & Podium", "Audio/Visual Projector", "Buffet Dining Area", "Dedicated Restrooms", "Power Backup"]'::jsonb,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_hotel_banquet_hall UNIQUE (hotel_id, name)
);

-- 2. Create banquet_bookings table (Dedicated event bookings)
CREATE TABLE IF NOT EXISTS public.banquet_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    banquet_hall_id UUID NOT NULL REFERENCES public.banquet_halls(id) ON DELETE CASCADE,
    booking_number TEXT NOT NULL,
    event_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count INT,
    event_type TEXT NOT NULL DEFAULT 'wedding' CHECK (event_type IN ('wedding', 'reception', 'conference', 'birthday', 'anniversary', 'corporate', 'social', 'other')),
    booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('inquiry', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    
    -- Future Billing Compatibility fields
    rental_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (rental_amount >= 0),
    catering_required BOOLEAN NOT NULL DEFAULT false,
    catering_notes TEXT,
    estimated_total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (estimated_total >= 0),
    advance_paid NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (advance_paid >= 0),
    tax_treatment TEXT NOT NULL DEFAULT 'gst' CHECK (tax_treatment IN ('gst', 'non_gst')),
    
    remarks TEXT,
    recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_hotel_banquet_booking_number UNIQUE (hotel_id, booking_number)
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_banquet_halls_hotel ON public.banquet_halls(hotel_id);
CREATE INDEX IF NOT EXISTS idx_banquet_bookings_hotel ON public.banquet_bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_banquet_bookings_date ON public.banquet_bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_banquet_bookings_status ON public.banquet_bookings(booking_status);

-- 4. Enable Row Level Security
ALTER TABLE public.banquet_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banquet_bookings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for banquet_halls
DROP POLICY IF EXISTS "Staff can view banquet hall" ON public.banquet_halls;
CREATE POLICY "Staff can view banquet hall"
    ON public.banquet_halls FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Owner and Manager can update banquet hall" ON public.banquet_halls;
CREATE POLICY "Owner and Manager can update banquet hall"
    ON public.banquet_halls FOR ALL
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

-- 6. RLS Policies for banquet_bookings
DROP POLICY IF EXISTS "Staff can view banquet bookings" ON public.banquet_bookings;
CREATE POLICY "Staff can view banquet bookings"
    ON public.banquet_bookings FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Owner, Manager, Reception can manage banquet bookings" ON public.banquet_bookings;
CREATE POLICY "Owner, Manager, Reception can manage banquet bookings"
    ON public.banquet_bookings FOR ALL
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

-- 7. Seed Property Banquet Hall for Hotel Greenery View
DO $$
DECLARE
    v_hotel_id UUID;
    v_hall_id UUID;
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF v_hotel_id IS NULL THEN
        SELECT id INTO v_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    IF v_hotel_id IS NOT NULL THEN
        INSERT INTO public.banquet_halls (
            hotel_id, name, capacity, current_status, description, half_day_rate, full_day_rate, amenities, notes
        )
        VALUES (
            v_hotel_id,
            'The Grand Greenery Banquet & Convention Hall',
            NULL, -- Configurable capacity left uninvented until property specifies
            'available',
            'Spacious, pillar-less luxury banquet and conference hall with dedicated pre-function dining area, stage, acoustic sound system, and modern ambient lighting.',
            18000.00,
            35000.00,
            '["Centralized Air Conditioning", "Elevated Stage with Podium", "HD Projector & High-Gain Screen", "Dedicated Buffet & Dining Area", "Private Restrooms & Green Room", "100% DG Power Backup", "Valet Parking Access"]'::jsonb,
            'Ideal for Wedding Receptions, Corporate Conferences, Birthday Galas, and Social Gatherings.'
        )
        ON CONFLICT (hotel_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            half_day_rate = EXCLUDED.half_day_rate,
            full_day_rate = EXCLUDED.full_day_rate,
            amenities = EXCLUDED.amenities,
            updated_at = NOW()
        RETURNING id INTO v_hall_id;

        -- Seed sample upcoming event booking
        IF v_hall_id IS NOT NULL THEN
            INSERT INTO public.banquet_bookings (
                hotel_id, banquet_hall_id, booking_number, event_name, customer_name, customer_phone, customer_email,
                event_date, start_time, end_time, guest_count, event_type, booking_status,
                rental_amount, catering_required, catering_notes, estimated_total, advance_paid, tax_treatment, remarks
            )
            VALUES (
                v_hotel_id,
                v_hall_id,
                'HGV-BNQ-2026-001',
                'Vikram & Ananya Wedding Reception',
                'Vikramaditya Roy',
                '+91 98765 11223',
                'vikram.roy@example.com',
                CURRENT_DATE + INTERVAL '3 days',
                '18:00:00',
                '23:30:00',
                180,
                'reception',
                'confirmed',
                35000.00,
                true,
                'North Indian & South Indian mixed buffet, Live Chaat Counter',
                85000.00,
                25000.00,
                'gst',
                'Stage flower decoration and DJ setup required by 16:30'
            )
            ON CONFLICT (hotel_id, booking_number) DO NOTHING;
        END IF;
    END IF;
END $$;
