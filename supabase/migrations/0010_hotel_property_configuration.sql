-- Migration: 0010_hotel_property_configuration.sql
-- Description: Configure exact physical property inventory (18 rooms 801-818 + 1 Family Apartment + 1 Banquet Hall)
--              with correct floor levels (Basement=0, Ground=1, First=2, Second=3, Upper=4)
--              and room-level rate override columns.

-- 1. Create property_resources table for non-accommodation resources (Banquet Hall, etc.)
CREATE TABLE IF NOT EXISTS public.property_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'banquet_hall', -- banquet_hall, restaurant, conference_room
    capacity INTEGER DEFAULT 200,
    status TEXT NOT NULL DEFAULT 'available', -- available, reserved, occupied, cleaning, maintenance
    description TEXT DEFAULT 'Spacious Grand Banquet & Conference Hall for events and celebrations',
    daily_rate NUMERIC(10, 2) DEFAULT 35000.00,
    hourly_rate NUMERIC(10, 2) DEFAULT 5000.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_hotel_resource_name UNIQUE (hotel_id, name)
);

-- Enable RLS on property_resources
ALTER TABLE public.property_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view property resources" ON public.property_resources;
CREATE POLICY "Staff can view property resources" ON public.property_resources
    FOR SELECT TO authenticated
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Staff can manage property resources" ON public.property_resources;
CREATE POLICY "Staff can manage property resources" ON public.property_resources
    FOR ALL TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager')
    );

-- 2. Add room-level pricing override columns to public.rooms (Requirement 8)
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS base_rate_override NUMERIC(10, 2) DEFAULT NULL;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS weekend_rate_override NUMERIC(10, 2) DEFAULT NULL;

-- 3. Seed Banquet Hall resource
DO $$
DECLARE
    v_hotel_id UUID;
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF v_hotel_id IS NULL THEN
        SELECT id INTO v_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    IF v_hotel_id IS NOT NULL THEN
        INSERT INTO public.property_resources (hotel_id, name, resource_type, capacity, status, description, daily_rate, hourly_rate, is_active)
        VALUES (
            v_hotel_id,
            'Banquet Hall',
            'banquet_hall',
            200,
            'available',
            'Grand Banquet & Conference Hall with AV setup, stage, dining area, and dedicated guest washrooms',
            35000.00,
            5000.00,
            true
        )
        ON CONFLICT (hotel_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            capacity = EXCLUDED.capacity,
            daily_rate = EXCLUDED.daily_rate,
            hourly_rate = EXCLUDED.hourly_rate,
            updated_at = NOW();
    END IF;
END $$;

-- 4. Update accommodation inventory floor levels and categories in public.rooms
-- Floor mapping:
-- Basement: floor = 0
-- Ground Floor — Road Level: floor = 1
-- First Floor: floor = 2
-- Second Floor: floor = 3
-- Upper Floor: floor = 4
DO $$
DECLARE
    v_hotel_id UUID;
    v_cat_premium UUID := 'c0000000-0000-0000-0000-000000000001';
    v_cat_deluxe UUID := 'c0000000-0000-0000-0000-000000000002';
    v_cat_luxury UUID := 'c0000000-0000-0000-0000-000000000003';
    v_cat_mountain UUID := 'c0000000-0000-0000-0000-000000000004';
    v_cat_family UUID := 'c0000000-0000-0000-0000-000000000005';
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF v_hotel_id IS NULL THEN
        SELECT id INTO v_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    IF v_hotel_id IS NOT NULL THEN
        -- Basement: Family Apartment
        UPDATE public.rooms SET room_number = 'FAMILY-APT', floor = 0, category_id = v_cat_family, updated_at = NOW()
        WHERE room_number = 'FAMILY-APT' OR id = 'd0000000-0000-0000-0000-000000000001';

        -- Ground Floor (Road Level): 801 to 804 (4 Premium)
        UPDATE public.rooms SET room_number = '801', floor = 1, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '801' OR id = 'd0000000-0000-0000-0000-000000000101';
        UPDATE public.rooms SET room_number = '802', floor = 1, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '802' OR id = 'd0000000-0000-0000-0000-000000000102';
        UPDATE public.rooms SET room_number = '803', floor = 1, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '803' OR id = 'd0000000-0000-0000-0000-000000000103';
        UPDATE public.rooms SET room_number = '804', floor = 1, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '804' OR id = 'd0000000-0000-0000-0000-000000000104';

        -- First Floor: 805 to 811 (2 Deluxe + 5 Premium = 7 rooms)
        UPDATE public.rooms SET room_number = '805', floor = 2, category_id = v_cat_deluxe, updated_at = NOW()
        WHERE room_number = '805' OR id = 'd0000000-0000-0000-0000-000000000201';
        UPDATE public.rooms SET room_number = '806', floor = 2, category_id = v_cat_deluxe, updated_at = NOW()
        WHERE room_number = '806' OR id = 'd0000000-0000-0000-0000-000000000202';
        UPDATE public.rooms SET room_number = '807', floor = 2, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '807' OR id = 'd0000000-0000-0000-0000-000000000203';
        UPDATE public.rooms SET room_number = '808', floor = 2, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '808' OR id = 'd0000000-0000-0000-0000-000000000204';
        UPDATE public.rooms SET room_number = '809', floor = 2, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '809' OR id = 'd0000000-0000-0000-0000-000000000205';
        UPDATE public.rooms SET room_number = '810', floor = 2, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '810' OR id = 'd0000000-0000-0000-0000-000000000206';
        UPDATE public.rooms SET room_number = '811', floor = 2, category_id = v_cat_premium, updated_at = NOW()
        WHERE room_number = '811' OR id = 'd0000000-0000-0000-0000-000000000207';

        -- Second Floor: 812 to 814 (2 Luxury + 1 Deluxe = 3 rooms)
        UPDATE public.rooms SET room_number = '812', floor = 3, category_id = v_cat_luxury, updated_at = NOW()
        WHERE room_number = '812' OR id = 'd0000000-0000-0000-0000-000000000301';
        UPDATE public.rooms SET room_number = '813', floor = 3, category_id = v_cat_luxury, updated_at = NOW()
        WHERE room_number = '813' OR id = 'd0000000-0000-0000-0000-000000000302';
        UPDATE public.rooms SET room_number = '814', floor = 3, category_id = v_cat_deluxe, updated_at = NOW()
        WHERE room_number = '814' OR id = 'd0000000-0000-0000-0000-000000000303';

        -- Upper Floor: 815 to 818 (4 Mountain View = 4 rooms)
        UPDATE public.rooms SET room_number = '815', floor = 4, category_id = v_cat_mountain, updated_at = NOW()
        WHERE room_number = '815' OR id = 'd0000000-0000-0000-0000-000000000401';
        UPDATE public.rooms SET room_number = '816', floor = 4, category_id = v_cat_mountain, updated_at = NOW()
        WHERE room_number = '816' OR id = 'd0000000-0000-0000-0000-000000000402';
        UPDATE public.rooms SET room_number = '817', floor = 4, category_id = v_cat_mountain, updated_at = NOW()
        WHERE room_number = '817' OR id = 'd0000000-0000-0000-0000-000000000403';
        UPDATE public.rooms SET room_number = '818', floor = 4, category_id = v_cat_mountain, updated_at = NOW()
        WHERE room_number = '818' OR id = 'd0000000-0000-0000-0000-000000000404';
    END IF;
END $$;

-- 5. Ensure uniqueness constraint on room_number per hotel
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS unique_hotel_room_number;
ALTER TABLE public.rooms ADD CONSTRAINT unique_hotel_room_number UNIQUE (hotel_id, room_number);
