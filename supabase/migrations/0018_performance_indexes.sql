-- Migration 0018: High-Performance Database Indexes
-- Created for instant query lookups, joins, ordering, and aggregations across the PMS

-- 1. Bookings lookup, joins & date filters
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_status ON public.bookings(hotel_id, booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_checkin ON public.bookings(hotel_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_checkout ON public.bookings(hotel_id, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- 2. Guests lookup & ordering
CREATE INDEX IF NOT EXISTS idx_guests_hotel_created ON public.guests(hotel_id, created_at DESC);

-- 3. Payments lookup & aggregations
CREATE INDEX IF NOT EXISTS idx_payments_hotel_mode ON public.payments(hotel_id, payment_mode);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- 4. Banquet lookups, charges & payments batch joins
CREATE INDEX IF NOT EXISTS idx_banquet_bookings_hotel_date ON public.banquet_bookings(hotel_id, event_date);
CREATE INDEX IF NOT EXISTS idx_banquet_charges_booking_hotel ON public.banquet_charges(banquet_booking_id, hotel_id);
CREATE INDEX IF NOT EXISTS idx_banquet_payments_booking_hotel ON public.banquet_payments(banquet_booking_id, hotel_id);

-- 5. Food & Beverage lookups & joins
CREATE INDEX IF NOT EXISTS idx_fb_bills_hotel_mode ON public.fb_bills(hotel_id, billing_mode);
CREATE INDEX IF NOT EXISTS idx_fb_bills_room_num ON public.fb_bills(room_number_snapshot);
CREATE INDEX IF NOT EXISTS idx_fb_bills_customer_phone ON public.fb_bills(customer_phone);
