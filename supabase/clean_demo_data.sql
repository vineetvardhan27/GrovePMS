-- ==============================================================================
-- HOTEL GREENERY VIEW PMS — CLEAN DEMO TRANSACTIONAL DATA & RESET OPERATIONAL STATE
-- ==============================================================================
-- This script removes all demo transactional records (payments, bookings, guests)
-- and resets all 19 actual accommodation units to 'available' and 'clean'.
--
-- PRESERVED:
--   ✓ Hotel record ('Hotel Greenery View')
--   ✓ Staff / Authentication accounts
--   ✓ 5 Room Categories (Family Apartment, Premium, Deluxe, Luxury, Mountain View)
--   ✓ 19 Physical Accommodation Units across all 5 floors
--   ✓ Database schema & RLS policies
-- ==============================================================================

BEGIN;

-- 1. Remove all demo payments (child records of bookings)
DELETE FROM payments
WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001';

-- 2. Remove all demo bookings (child records of rooms & guests)
DELETE FROM bookings
WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001';

-- 3. Remove all demo guests
DELETE FROM guests
WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001';

-- 4. Reset all 19 rooms to 'available' and 'clean'
UPDATE rooms
SET status = 'available',
    housekeeping_status = 'clean',
    updated_at = NOW()
WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001';

COMMIT;

-- ==============================================================================
-- POST-CLEANUP VERIFICATION QUERY
-- ==============================================================================
SELECT 
    (SELECT COUNT(*) FROM hotels WHERE id = 'a0000000-0000-0000-0000-000000000001') AS hotel_count,
    (SELECT COUNT(*) FROM room_categories WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001') AS category_count,
    (SELECT COUNT(*) FROM rooms WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001') AS total_rooms,
    (SELECT COUNT(*) FROM rooms WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001' AND status = 'available' AND housekeeping_status = 'clean') AS clean_available_rooms,
    (SELECT COUNT(*) FROM bookings WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001') AS remaining_bookings,
    (SELECT COUNT(*) FROM guests WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001') AS remaining_guests,
    (SELECT COUNT(*) FROM payments WHERE hotel_id = 'a0000000-0000-0000-0000-000000000001') AS remaining_payments;
