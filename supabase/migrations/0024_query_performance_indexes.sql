-- Migration 0024: Query Performance Indexes
-- Description: Targeted composite indexes based on application query patterns:
-- Note: Pattern 1 [bookings(room_id, check_in_date, check_out_date)] is already indexed via idx_bookings_room_dates in 0001_init_schema.sql.
-- The following 5 composite indexes are added for high-throughput tenant lookups and orderings:
-- 1. bookings(guest_id, hotel_id)                      -> Guest booking history and tenant-isolated guest lookups
-- 2. payments(booking_id, created_at DESC)             -> Payment history and invoice/folio lookups
-- 3. food_charges(hotel_id, booking_id)                -> Guest/booking F&B room itemization
-- 4. fb_bills(hotel_id, created_at DESC)               -> F&B billing lists and recent billing queries
-- 5. inventory_transactions(hotel_id, created_at DESC) -> Inventory transaction history and stock audit trail

-- 1. Guest booking history and guest-specific tenant queries
-- Accelerates guest profile lookups: WHERE guest_id = $1 AND hotel_id = $2
CREATE INDEX IF NOT EXISTS idx_bookings_guest_hotel 
ON public.bookings (guest_id, hotel_id);

-- 2. Payment history and folio/invoice payment lookups
-- Accelerates folio balance calculation: WHERE booking_id = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_payments_booking_created 
ON public.payments (booking_id, created_at DESC);

-- 3. Guest/booking F&B itemization
-- Accelerates room food charge itemization: WHERE hotel_id = $1 AND booking_id = $2
CREATE INDEX IF NOT EXISTS idx_food_charges_hotel_booking 
ON public.food_charges (hotel_id, booking_id);

-- 4. F&B billing lists and recent billing queries
-- Accelerates F&B billing ledger: WHERE hotel_id = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_fb_bills_hotel_created 
ON public.fb_bills (hotel_id, created_at DESC);

-- 5. Inventory transaction history and stock audit trail
-- Accelerates stock ledger: WHERE hotel_id = $1 ORDER BY created_at DESC LIMIT $2
CREATE INDEX IF NOT EXISTS idx_inventory_tx_hotel_created 
ON public.inventory_transactions (hotel_id, created_at DESC);
