-- Migration: 0009_property_structure_phase1.sql
-- Description: Configure actual physical property inventory (18 rooms 801-818 + 1 Family Apartment + 1 Banquet Hall)

-- 1. Create property_resources table for non-accommodation resources (Banquet Hall, Conference, etc.)
CREATE TABLE IF NOT EXISTS public.property_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'banquet_hall', -- banquet_hall, conference_room, lawn
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

CREATE POLICY "Staff can view property resources" ON public.property_resources
    FOR SELECT TO authenticated
    USING (hotel_id = public.get_current_staff_hotel_id());

CREATE POLICY "Staff can manage property resources" ON public.property_resources
    FOR ALL TO authenticated
    USING (
        hotel_id = public.get_current_staff_hotel_id()
        AND public.get_current_staff_role() IN ('owner', 'manager', 'reception')
    );

-- 2. Seed Banquet Hall resource
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
            'Grand Banquet Hall with AV setup, stage, dining area, and dedicated guest washrooms',
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

-- 3. Update existing accommodation inventory in public.rooms to 801-818 and FAMILY-APT
DO $$
DECLARE
    v_hotel_id UUID;
BEGIN
    SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF v_hotel_id IS NULL THEN
        SELECT id INTO v_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    IF v_hotel_id IS NOT NULL THEN
        -- Map existing UUIDs to official room numbers:
        -- Ground floor sample rooms -> 801 to 804
        UPDATE public.rooms SET room_number = '801', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000101' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '802', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000102' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '803', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000103' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '804', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000104' AND hotel_id = v_hotel_id;

        -- First floor sample rooms -> 805 to 811
        UPDATE public.rooms SET room_number = '805', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000201' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '806', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000202' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '807', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000203' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '808', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000204' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '809', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000205' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '810', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000206' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '811', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000207' AND hotel_id = v_hotel_id;

        -- Second floor sample rooms -> 812 to 814
        UPDATE public.rooms SET room_number = '812', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000301' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '813', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000302' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '814', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000303' AND hotel_id = v_hotel_id;

        -- Upper floor sample rooms -> 815 to 818
        UPDATE public.rooms SET room_number = '815', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000401' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '816', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000402' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '817', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000403' AND hotel_id = v_hotel_id;
        UPDATE public.rooms SET room_number = '818', floor = 8, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000404' AND hotel_id = v_hotel_id;

        -- Basement Family Apartment
        UPDATE public.rooms SET room_number = 'FAMILY-APT', floor = 0, updated_at = NOW() WHERE id = 'd0000000-0000-0000-0000-000000000001' AND hotel_id = v_hotel_id;
    END IF;
END $$;

-- 4. Add constraint to prevent duplicate room numbers per hotel
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS unique_hotel_room_number;
ALTER TABLE public.rooms ADD CONSTRAINT unique_hotel_room_number UNIQUE (hotel_id, room_number);
