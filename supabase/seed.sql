-- Seed Data: supabase/seed.sql
-- Hotel Greenery View - Initial setup
--
-- Actual hotel physical structure:
--   Basement     (floor=0): 1  Family Apartment  (FA-01)
--   Ground Floor (floor=1): 4  Premium Rooms      (001-004)
--   First Floor  (floor=2): 7  Rooms              (101-107: 2 Deluxe + 5 Premium)
--   Second Floor (floor=3): 3  Rooms              (201-203: 2 Luxury + 1 Deluxe)
--                              [Restaurant area — physical reference, no room records]
--   Upper Floor  (floor=4): 4  Mountain View Rooms (301-304)
--   Total: 18 regular rooms + 1 Family Apartment = 19 accommodation units

-- 1. Insert Hotel
INSERT INTO hotels (id, name, slug, address, phone, email, settings)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Hotel Greenery View',
    'hotel-greenery-view',
    'Nature Valley Road, Green Hills',
    '+91 98765 43210',
    'contact@hotelgreeneryview.com',
    '{
        "gst_enabled": true,
        "gst_percentage": 12,
        "checkin_time": "12:00",
        "checkout_time": "11:00",
        "currency_symbol": "₹",
        "currency_code": "INR"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Actual Room Categories (5 categories)
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

-- 3. Insert Actual Rooms (19 total)
INSERT INTO rooms (id, hotel_id, category_id, room_number, floor, status, housekeeping_status)
VALUES
    -- Basement (floor=0): 1 Family Apartment
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'FAMILY-APT', 0, 'available', 'clean'),

    -- Ground Floor (floor=1): 4 Premium Rooms (801-804)
    ('d0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '801',   1, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '802',   1, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '803',   1, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '804',   1, 'available', 'clean'),

    -- First Floor (floor=2): 2 Deluxe + 5 Premium = 7 rooms (805-811)
    ('d0000000-0000-0000-0000-000000000201', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '805',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000202', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '806',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '807',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000204', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '808',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000205', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '809',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000206', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '810',   2, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000207', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '811',   2, 'available', 'clean'),

    -- Second Floor (floor=3): 2 Luxury + 1 Deluxe = 3 rooms (812-814)
    -- Restaurant area also on this floor — physical reference only, no room record
    ('d0000000-0000-0000-0000-000000000301', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '812',   3, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000302', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '813',   3, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000303', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '814',   3, 'available', 'clean'),

    -- Upper Floor (floor=4): 4 Mountain View Rooms (815-818)
    ('d0000000-0000-0000-0000-000000000401', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '815',   4, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000402', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '816',   4, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000403', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '817',   4, 'available', 'clean'),
    ('d0000000-0000-0000-0000-000000000404', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '818',   4, 'available', 'clean')

ON CONFLICT (id) DO NOTHING;

-- 4. Insert Menu Categories (6 categories)
INSERT INTO menu_categories (id, hotel_id, name, display_order, is_active)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Breakfast', 1, true),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Lunch', 2, true),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Dinner', 3, true),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Snacks', 4, true),
    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Beverages', 5, true),
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Other', 6, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Menu Items (18 items)
INSERT INTO menu_items (id, hotel_id, category_id, name, description, selling_price, is_active)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Masala Dosa', 'Crispy rice crepe filled with spiced potato masala, served with sambar and fresh chutneys', 120.00, true),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Idli Sambar (3 Pcs)', 'Steamed rice cakes served with aromatic lentil sambar and coconut chutney', 80.00, true),
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Poori Bhaji (4 Pcs)', 'Fluffy deep-fried pooris served with spiced potato curry', 110.00, true),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Aloo Paratha with Curd', 'Stuffed whole wheat flatbread served with fresh curd and mixed pickle', 100.00, true),

    ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Paneer Butter Masala', 'Cottage cheese cubes simmered in a rich, buttery tomato cream gravy', 240.00, true),
    ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Dal Tadka', 'Yellow lentils tempered with ghee, cumin seeds, garlic, and fresh coriander', 160.00, true),
    ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Veg Biryani with Raita', 'Fragrant basmati rice layered with garden vegetables and aromatic whole spices', 210.00, true),
    ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Butter Roti (2 Pcs)', 'Tandoor-baked whole wheat flatbread brushed with fresh butter', 40.00, true),

    ('f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'Kadhai Paneer', 'Paneer and bell peppers cooked with freshly ground whole spices in a wok', 250.00, true),
    ('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'Mixed Vegetable Curry', 'Seasonal fresh vegetables cooked in homestyle spiced onion-tomato gravy', 180.00, true),
    ('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'Jeera Rice', 'Aromatic basmati rice tossed with cumin seeds and pure desi ghee', 130.00, true),

    ('f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'Crispy Veg Pakoda Platter', 'Assorted vegetable fritters served hot with mint and tamarind dips', 90.00, true),
    ('f0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'French Fries', 'Crispy golden potato fries seasoned with peri-peri salt', 100.00, true),
    ('f0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'Veg Grilled Cheese Sandwich', 'Toasted triple-decker sandwich loaded with vegetables and mozzarella cheese', 130.00, true),

    ('f0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'Masala Chai', 'Authentic Indian tea brewed with crushed ginger, cardamom, and whole milk', 30.00, true),
    ('f0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'Filter Coffee', 'Traditional South Indian frothy filter coffee', 40.00, true),
    ('f0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'Fresh Lime Soda (Sweet/Salt)', 'Freshly squeezed lemon juice with chilled sparkling soda', 60.00, true),
    ('f0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'Packaged Mineral Water (1L)', 'Sealed packaged drinking water bottle', 20.00, true)
ON CONFLICT (id) DO NOTHING;

