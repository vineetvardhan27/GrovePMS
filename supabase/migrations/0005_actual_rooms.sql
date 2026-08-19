-- Migration: 0005_actual_rooms.sql
-- Description: Replace demo room categories and rooms with actual Hotel Greenery View
--              physical floor and room structure.
--
-- Hotel layout:
--   Basement     (floor=0) : 1 Family Apartment  (FA-01)
--   Ground Floor (floor=1) : 4 Premium Rooms      (001-004)
--   First Floor  (floor=2) : 7 Rooms              (101-107: 2 Deluxe + 5 Premium)
--   Second Floor (floor=3) : 3 Rooms              (201-203: 2 Luxury + 1 Deluxe)
--                            [Restaurant area - physical reference, no room records]
--   Upper Floor  (floor=4) : 4 Mountain View Rooms (301-304)
--
-- Total: 18 regular rooms + 1 Family Apartment = 19 accommodation units
--
-- Safety: Uses ON CONFLICT DO NOTHING for categories/rooms to be idempotent.
--         Deletes only the known demo UUIDs that were created in seed.sql so that
--         any real bookings tied to other room_ids are not affected.

-- ============================================================
-- 1. Remove demo room records (known seed UUIDs only)
--    Must delete rooms first due to FK constraint on room_categories
-- ============================================================

DELETE FROM rooms
WHERE id IN (
    'd0000000-0000-0000-0000-000000000101',
    'd0000000-0000-0000-0000-000000000102',
    'd0000000-0000-0000-0000-000000000103',
    'd0000000-0000-0000-0000-000000000104',
    'd0000000-0000-0000-0000-000000000201',
    'd0000000-0000-0000-0000-000000000202',
    'd0000000-0000-0000-0000-000000000203',
    'd0000000-0000-0000-0000-000000000204',
    'd0000000-0000-0000-0000-000000000301',
    'd0000000-0000-0000-0000-000000000302'
);

-- ============================================================
-- 2. Remove demo room categories (known seed UUIDs only)
-- ============================================================

DELETE FROM room_categories
WHERE id IN (
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003'
);

-- ============================================================
-- 3. Insert actual room categories
--    IDs: c0000000-0000-0000-0000-00000000000x (001-005)
-- ============================================================

INSERT INTO room_categories (id, hotel_id, name, description, base_rate, weekend_rate, max_occupancy, extra_bed_rate)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'Premium Room',
        'Comfortable room with attached bath and garden-facing view',
        2500.00, 3000.00, 2, 500.00
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'Deluxe Room',
        'Spacious room with valley view and premium furnishings',
        3500.00, 4200.00, 2, 700.00
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'Luxury Room',
        'Luxurious room with panoramic views and premium amenities',
        5000.00, 6000.00, 2, 1000.00
    ),
    (
        'c0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'Mountain View Room',
        'Stunning mountain-facing room on the upper floor with private balcony',
        4500.00, 5500.00, 2, 800.00
    ),
    (
        'c0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'Family Apartment',
        'Spacious multi-room apartment in the basement, ideal for families',
        7500.00, 9000.00, 6, 1200.00
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Insert actual rooms
--    Floor mapping: Basement=0, Ground=1, First=2, Second=3, Upper=4
--    All rooms start as 'available' / 'clean' (status is live from DB)
-- ============================================================

INSERT INTO rooms (id, hotel_id, category_id, room_number, floor, status, housekeeping_status)
VALUES
    -- Basement (floor=0): 1 Family Apartment
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'FA-01', 0, 'available', 'clean'),

    -- Ground Floor (floor=1): 4 Premium Rooms
    ('d0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '001',   1, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '002',   1, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '003',   1, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '004',   1, 'available', 'clean'),

    -- First Floor (floor=2): 2 Deluxe + 5 Premium = 7 rooms
    ('d0000000-0000-0000-0000-000000000201', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '101',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000202', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '102',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '103',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000204', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '104',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000205', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '105',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000206', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '106',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000207', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '107',   2, 'available', 'clean'),

    -- Second Floor (floor=3): 2 Luxury + 1 Deluxe = 3 rooms
    -- (Restaurant also on this floor — represented as area label in UI only, no room record)
    ('d0000000-0000-0000-0000-000000000301', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '201',   3, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000302', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '202',   3, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000303', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '203',   3, 'available', 'clean'),

    -- Upper Floor (floor=4): 4 Mountain View Rooms
    ('d0000000-0000-0000-0000-000000000401', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '301',   4, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000402', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '302',   4, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000403', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '303',   4, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000404', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '304',   4, 'available', 'clean')

ON CONFLICT (id) DO NOTHING;
