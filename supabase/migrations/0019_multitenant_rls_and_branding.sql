-- Migration 0019: Multi-Tenant RLS, Staff Isolation, and Hotel Branding
-- Preserves existing hotel (Hotel Greenery View a0000000-0000-0000-0000-000000000001) and all related production data

-- 1. Add dedicated logo_url column to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Core Security Definer functions for multi-tenant context resolution
CREATE OR REPLACE FUNCTION public.get_my_hotel_id()
RETURNS UUID AS $$
    SELECT hotel_id FROM public.staff WHERE id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_staff_role()
RETURNS TEXT AS $$
    SELECT role FROM public.staff WHERE id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- 3. Enable RLS on core tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. HOTELS RLS Policies
DROP POLICY IF EXISTS "Staff can view their hotel" ON public.hotels;
CREATE POLICY "Staff can view their hotel"
    ON public.hotels FOR SELECT
    USING (id = public.get_my_hotel_id());

DROP POLICY IF EXISTS "Owner can update hotel settings" ON public.hotels;
DROP POLICY IF EXISTS "Owner and Manager can update hotel settings" ON public.hotels;
CREATE POLICY "Owner and Manager can update hotel settings"
    ON public.hotels FOR UPDATE
    USING (id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager'))
    WITH CHECK (id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager'));

-- 5. STAFF RLS Policies
DROP POLICY IF EXISTS "Staff can view colleagues in same hotel" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own and colleagues in same hotel" ON public.staff;
CREATE POLICY "Staff can view own and colleagues in same hotel"
    ON public.staff FOR SELECT
    USING (
        id = auth.uid() 
        OR (hotel_id = public.get_my_hotel_id() AND public.get_my_hotel_id() IS NOT NULL)
    );

DROP POLICY IF EXISTS "Owner can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Owner and Manager can manage staff" ON public.staff;
CREATE POLICY "Owner and Manager can manage staff"
    ON public.staff FOR ALL
    USING (
        hotel_id = public.get_my_hotel_id() 
        AND public.get_my_staff_role() IN ('owner', 'manager')
    )
    WITH CHECK (
        hotel_id = public.get_my_hotel_id() 
        AND public.get_my_staff_role() IN ('owner', 'manager')
    );

-- 6. ROOM CATEGORIES RLS Policies
DROP POLICY IF EXISTS "Staff can view room categories" ON public.room_categories;
CREATE POLICY "Staff can view room categories"
    ON public.room_categories FOR SELECT
    USING (hotel_id = public.get_my_hotel_id());

DROP POLICY IF EXISTS "Owner and Manager can manage room categories" ON public.room_categories;
CREATE POLICY "Owner and Manager can manage room categories"
    ON public.room_categories FOR ALL
    USING (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager'))
    WITH CHECK (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager'));

-- 7. ROOMS RLS Policies
DROP POLICY IF EXISTS "Staff can view rooms in their hotel" ON public.rooms;
CREATE POLICY "Staff can view rooms in their hotel"
    ON public.rooms FOR SELECT
    USING (hotel_id = public.get_my_hotel_id());

DROP POLICY IF EXISTS "Owner and Manager can insert/delete rooms" ON public.rooms;
CREATE POLICY "Owner and Manager can insert/delete rooms"
    ON public.rooms FOR INSERT
    WITH CHECK (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "Owner and Manager can delete rooms" ON public.rooms;
CREATE POLICY "Owner and Manager can delete rooms"
    ON public.rooms FOR DELETE
    USING (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "All active staff can update room status" ON public.rooms;
CREATE POLICY "All active staff can update room status"
    ON public.rooms FOR UPDATE
    USING (hotel_id = public.get_my_hotel_id())
    WITH CHECK (hotel_id = public.get_my_hotel_id());

-- 8. GUESTS RLS Policies
DROP POLICY IF EXISTS "Owner, Manager, Reception can view guests" ON public.guests;
CREATE POLICY "Owner, Manager, Reception can view guests"
    ON public.guests FOR SELECT
    USING (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can insert guests" ON public.guests;
CREATE POLICY "Owner, Manager, Reception can insert guests"
    ON public.guests FOR INSERT
    WITH CHECK (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can update guests" ON public.guests;
CREATE POLICY "Owner, Manager, Reception can update guests"
    ON public.guests FOR UPDATE
    USING (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'))
    WITH CHECK (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));

-- 9. BOOKINGS RLS Policies
DROP POLICY IF EXISTS "Owner, Manager, Reception can view bookings" ON public.bookings;
CREATE POLICY "Owner, Manager, Reception can view bookings"
    ON public.bookings FOR SELECT
    USING (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can create bookings" ON public.bookings;
CREATE POLICY "Owner, Manager, Reception can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can update bookings" ON public.bookings;
CREATE POLICY "Owner, Manager, Reception can update bookings"
    ON public.bookings FOR UPDATE
    USING (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'))
    WITH CHECK (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));

-- 10. PAYMENTS RLS Policies
DROP POLICY IF EXISTS "Owner, Manager, Reception can view payments" ON public.payments;
CREATE POLICY "Owner, Manager, Reception can view payments"
    ON public.payments FOR SELECT
    USING (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can record payments" ON public.payments;
CREATE POLICY "Owner, Manager, Reception can record payments"
    ON public.payments FOR INSERT
    WITH CHECK (hotel_id = public.get_my_hotel_id() AND public.get_my_staff_role() IN ('owner', 'manager', 'reception'));
