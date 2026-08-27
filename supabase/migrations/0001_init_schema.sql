-- Migration: 0001_init_schema.sql
-- Description: Core schema for Simple Hotel Management System (Hotel Greenery View PMS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Hotels Table (Multi-tenant foundation)
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    settings JSONB NOT NULL DEFAULT '{
        "gst_enabled": true,
        "gst_percentage": 12,
        "checkin_time": "12:00",
        "checkout_time": "11:00",
        "currency_symbol": "₹",
        "currency_code": "INR"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Staff Table (Role mapping tied to auth.users)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY, -- references auth.users(id) in live Supabase auth
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'reception', 'housekeeping')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Room Categories Table
CREATE TABLE IF NOT EXISTS room_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_rate NUMERIC(10, 2) NOT NULL CHECK (base_rate >= 0),
    weekend_rate NUMERIC(10, 2) CHECK (weekend_rate >= 0),
    max_occupancy INTEGER NOT NULL DEFAULT 2 CHECK (max_occupancy > 0),
    extra_bed_rate NUMERIC(10, 2) DEFAULT 0 CHECK (extra_bed_rate >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES room_categories(id) ON DELETE RESTRICT,
    room_number TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'available' CHECK (
        status IN ('available', 'occupied', 'reserved', 'arriving_today', 'cleaning', 'maintenance')
    ),
    housekeeping_status TEXT NOT NULL DEFAULT 'clean' CHECK (
        housekeeping_status IN ('clean', 'dirty', 'inspected')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(hotel_id, room_number)
);

-- 5. Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    id_type TEXT,
    id_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    booking_number TEXT NOT NULL UNIQUE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults INTEGER NOT NULL DEFAULT 1 CHECK (adults > 0),
    children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
    rate_per_night NUMERIC(10, 2) NOT NULL CHECK (rate_per_night >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    advance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (advance_amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'no_payment' CHECK (
        payment_status IN ('fully_paid', 'advance_received', 'no_payment', 'credit')
    ),
    booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (
        booking_status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')
    ),
    source TEXT NOT NULL DEFAULT 'direct' CHECK (
        source IN ('direct', 'walk_in', 'phone', 'whatsapp', 'travel_agent', 'other')
    ),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (check_out_date > check_in_date)
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_mode TEXT NOT NULL CHECK (
        payment_mode IN ('cash', 'upi', 'bank_transfer', 'card', 'other')
    ),
    payment_type TEXT NOT NULL DEFAULT 'running' CHECK (
        payment_type IN ('advance', 'running', 'settlement', 'refund')
    ),
    notes TEXT,
    recorded_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_hotel_id ON staff(hotel_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_category_id ON rooms(category_id);
CREATE INDEX IF NOT EXISTS idx_guests_hotel_phone ON guests(hotel_id, phone);
CREATE INDEX IF NOT EXISTS idx_guests_hotel_name ON guests(hotel_id, full_name);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_dates ON bookings(hotel_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates ON bookings(room_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_hotel_created ON payments(hotel_id, created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_hotels_updated_at ON hotels;
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_room_categories_updated_at ON room_categories;
CREATE TRIGGER update_room_categories_updated_at BEFORE UPDATE ON room_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

