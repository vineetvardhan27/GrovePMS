-- Migration: 0002_rls_policies.sql
-- Description: Row-Level Security policies per role (Owner, Manager, Reception, Housekeeping)

-- Enable RLS on all tables
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper functions for resolving staff identity securely
CREATE OR REPLACE FUNCTION get_current_staff_hotel_id()
RETURNS UUID AS $$
    SELECT hotel_id FROM staff WHERE id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_staff_role()
RETURNS TEXT AS $$
    SELECT role FROM staff WHERE id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 1. Hotels Policies
CREATE POLICY "Staff can view their hotel"
    ON hotels FOR SELECT
    USING (id = get_current_staff_hotel_id());

CREATE POLICY "Owner can update hotel settings"
    ON hotels FOR UPDATE
    USING (id = get_current_staff_hotel_id() AND get_current_staff_role() = 'owner')
    WITH CHECK (id = get_current_staff_hotel_id() AND get_current_staff_role() = 'owner');

-- 2. Staff Policies
CREATE POLICY "Staff can view colleagues in same hotel"
    ON staff FOR SELECT
    USING (hotel_id = get_current_staff_hotel_id());

CREATE POLICY "Owner can manage staff"
    ON staff FOR ALL
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() = 'owner')
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() = 'owner');

-- 3. Room Categories Policies
CREATE POLICY "Staff can view room categories"
    ON room_categories FOR SELECT
    USING (hotel_id = get_current_staff_hotel_id());

CREATE POLICY "Owner and Manager can manage room categories"
    ON room_categories FOR ALL
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager'))
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager'));

-- 4. Rooms Policies
CREATE POLICY "Staff can view rooms in their hotel"
    ON rooms FOR SELECT
    USING (hotel_id = get_current_staff_hotel_id());

CREATE POLICY "Owner and Manager can insert/delete rooms"
    ON rooms FOR INSERT
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager'));

CREATE POLICY "Owner and Manager can delete rooms"
    ON rooms FOR DELETE
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager'));

CREATE POLICY "All active staff can update room status"
    ON rooms FOR UPDATE
    USING (hotel_id = get_current_staff_hotel_id())
    WITH CHECK (hotel_id = get_current_staff_hotel_id());

-- 5. Guests Policies
CREATE POLICY "Owner, Manager, Reception can view guests"
    ON guests FOR SELECT
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));

CREATE POLICY "Owner, Manager, Reception can insert guests"
    ON guests FOR INSERT
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));

CREATE POLICY "Owner, Manager, Reception can update guests"
    ON guests FOR UPDATE
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'))
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));

-- 6. Bookings Policies
CREATE POLICY "Owner, Manager, Reception can view bookings"
    ON bookings FOR SELECT
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));

CREATE POLICY "Owner, Manager, Reception can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));

CREATE POLICY "Owner, Manager, Reception can update bookings"
    ON bookings FOR UPDATE
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'))
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));

-- 7. Payments Policies
CREATE POLICY "Owner, Manager, Reception can view payments"
    ON payments FOR SELECT
    USING (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));

CREATE POLICY "Owner, Manager, Reception can record payments"
    ON payments FOR INSERT
    WITH CHECK (hotel_id = get_current_staff_hotel_id() AND get_current_staff_role() IN ('owner', 'manager', 'reception'));
