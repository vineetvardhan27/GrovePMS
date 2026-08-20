-- Migration: 0006_fix_auth_and_rls.sql
-- Description: Complete fix for RLS helper functions, policies, staff identity resolution, and trigger sync

-- 1. Helper functions for resolving staff identity securely
CREATE OR REPLACE FUNCTION public.get_current_staff_hotel_id()
RETURNS UUID AS $$
    SELECT hotel_id FROM public.staff WHERE id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_staff_role()
RETURNS TEXT AS $$
    SELECT role FROM public.staff WHERE id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- 2. Update staff policies
-- Allow staff members to view their own record directly (needed to bootstrap hotel context)
-- and view active colleagues within their hotel
DROP POLICY IF EXISTS "Staff can view colleagues in same hotel" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own and colleagues in same hotel" ON public.staff;
CREATE POLICY "Staff can view own and colleagues in same hotel"
    ON public.staff FOR SELECT
    USING (
        id = auth.uid() 
        OR (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_hotel_id() IS NOT NULL)
    );

DROP POLICY IF EXISTS "Owner can manage staff" ON public.staff;
CREATE POLICY "Owner can manage staff"
    ON public.staff FOR ALL
    USING (
        hotel_id = public.get_current_staff_hotel_id() 
        AND public.get_current_staff_role() = 'owner'
    )
    WITH CHECK (
        hotel_id = public.get_current_staff_hotel_id() 
        AND public.get_current_staff_role() = 'owner'
    );

-- 3. Hotels Policies
DROP POLICY IF EXISTS "Staff can view their hotel" ON public.hotels;
CREATE POLICY "Staff can view their hotel"
    ON public.hotels FOR SELECT
    USING (id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Owner can update hotel settings" ON public.hotels;
CREATE POLICY "Owner can update hotel settings"
    ON public.hotels FOR UPDATE
    USING (id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() = 'owner')
    WITH CHECK (id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() = 'owner');

-- 4. Room Categories Policies
DROP POLICY IF EXISTS "Staff can view room categories" ON public.room_categories;
CREATE POLICY "Staff can view room categories"
    ON public.room_categories FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Owner and Manager can manage room categories" ON public.room_categories;
CREATE POLICY "Owner and Manager can manage room categories"
    ON public.room_categories FOR ALL
    USING (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager'))
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager'));

-- 5. Rooms Policies
DROP POLICY IF EXISTS "Staff can view rooms in their hotel" ON public.rooms;
CREATE POLICY "Staff can view rooms in their hotel"
    ON public.rooms FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id());

DROP POLICY IF EXISTS "Owner and Manager can insert/delete rooms" ON public.rooms;
CREATE POLICY "Owner and Manager can insert/delete rooms"
    ON public.rooms FOR INSERT
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "Owner and Manager can delete rooms" ON public.rooms;
CREATE POLICY "Owner and Manager can delete rooms"
    ON public.rooms FOR DELETE
    USING (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "All active staff can update room status" ON public.rooms;
CREATE POLICY "All active staff can update room status"
    ON public.rooms FOR UPDATE
    USING (hotel_id = public.get_current_staff_hotel_id())
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id());

-- 6. Guests Policies
DROP POLICY IF EXISTS "Owner, Manager, Reception can view guests" ON public.guests;
CREATE POLICY "Owner, Manager, Reception can view guests"
    ON public.guests FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can insert guests" ON public.guests;
CREATE POLICY "Owner, Manager, Reception can insert guests"
    ON public.guests FOR INSERT
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can update guests" ON public.guests;
CREATE POLICY "Owner, Manager, Reception can update guests"
    ON public.guests FOR UPDATE
    USING (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'))
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

-- 7. Bookings Policies
DROP POLICY IF EXISTS "Owner, Manager, Reception can view bookings" ON public.bookings;
CREATE POLICY "Owner, Manager, Reception can view bookings"
    ON public.bookings FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can create bookings" ON public.bookings;
CREATE POLICY "Owner, Manager, Reception can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can update bookings" ON public.bookings;
CREATE POLICY "Owner, Manager, Reception can update bookings"
    ON public.bookings FOR UPDATE
    USING (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'))
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

-- 8. Payments Policies
DROP POLICY IF EXISTS "Owner, Manager, Reception can view payments" ON public.payments;
CREATE POLICY "Owner, Manager, Reception can view payments"
    ON public.payments FOR SELECT
    USING (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

DROP POLICY IF EXISTS "Owner, Manager, Reception can record payments" ON public.payments;
CREATE POLICY "Owner, Manager, Reception can record payments"
    ON public.payments FOR INSERT
    WITH CHECK (hotel_id = public.get_current_staff_hotel_id() AND public.get_current_staff_role() IN ('owner', 'manager', 'reception'));

-- 9. Trigger to auto-provision staff row when new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_staff()
RETURNS TRIGGER AS $$
DECLARE
    default_hotel_id UUID;
    user_role TEXT;
    user_full_name TEXT;
BEGIN
    SELECT id INTO default_hotel_id FROM public.hotels WHERE slug = 'hotel-greenery-view' LIMIT 1;
    IF default_hotel_id IS NULL THEN
        SELECT id INTO default_hotel_id FROM public.hotels LIMIT 1;
    END IF;

    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'reception');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    IF default_hotel_id IS NOT NULL THEN
        INSERT INTO public.staff (id, hotel_id, email, full_name, role, is_active)
        VALUES (NEW.id, default_hotel_id, NEW.email, user_full_name, user_role, true)
        ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_staff();
