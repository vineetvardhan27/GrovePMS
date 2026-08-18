-- Seed Data: supabase/seed.sql
-- Hotel Greenery View - Initial setup

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

-- 2. Insert Room Categories
INSERT INTO room_categories (id, hotel_id, name, description, base_rate, weekend_rate, max_occupancy, extra_bed_rate)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Deluxe Room', 'Comfortable queen bed with valley view', 2500.00, 3000.00, 2, 500.00),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Super Deluxe', 'Spacious king bed with private balcony', 3500.00, 4200.00, 3, 700.00),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Family Suite', 'Two interconnecting bedrooms with panoramic view', 5500.00, 6500.00, 4, 1000.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Rooms
INSERT INTO rooms (id, hotel_id, category_id, room_number, floor, status, housekeeping_status)
VALUES
    ('r0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '101', 1, 'available', 'clean'),
    ('r0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '102', 1, 'available', 'clean'),
    ('r0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '103', 1, 'occupied', 'clean'),
    ('r0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '104', 1, 'cleaning', 'dirty'),
    ('r0000000-0000-0000-0000-000000000201', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '201', 2, 'available', 'clean'),
    ('r0000000-0000-0000-0000-000000000202', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '202', 2, 'arriving_today', 'clean'),
    ('r0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '203', 2, 'reserved', 'clean'),
    ('r0000000-0000-0000-0000-000000000204', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '204', 2, 'maintenance', 'dirty'),
    ('r0000000-0000-0000-0000-000000000301', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '301', 3, 'available', 'clean'),
    ('r0000000-0000-0000-0000-000000000302', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '302', 3, 'occupied', 'clean')
ON CONFLICT (id) DO NOTHING;
