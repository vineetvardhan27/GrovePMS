import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import {
  BanquetHall,
  BanquetBooking,
  BanquetSummary,
} from './types';

export const DEFAULT_BANQUET_HALL: BanquetHall = {
  id: 'bnq00000-0000-4000-8000-000000000001',
  name: 'The Grand Greenery Banquet & Convention Hall',
  capacity: null, // Configurable capacity (left uninvented until property specifies)
  current_status: 'available',
  description:
    'Spacious, pillar-less luxury banquet and conference hall with dedicated pre-function dining area, stage, acoustic sound system, and modern ambient lighting.',
  half_day_rate: 18000,
  full_day_rate: 35000,
  amenities: [
    'Centralized Air Conditioning',
    'Elevated Stage with Podium',
    'HD Projector & High-Gain Screen',
    'Dedicated Buffet & Dining Area',
    'Private Restrooms & Green Room',
    '100% DG Power Backup',
    'Valet Parking Access',
  ],
  notes: 'Ideal for Wedding Receptions, Corporate Conferences, Birthday Galas, and Social Gatherings.',
  is_active: true,
};

export const DEFAULT_BANQUET_BOOKINGS: BanquetBooking[] = [
  {
    id: 'bb000000-0000-4000-8000-000000000001',
    banquet_hall_id: DEFAULT_BANQUET_HALL.id,
    booking_number: 'HGV-BNQ-2026-001',
    event_name: 'Vikram & Ananya Wedding Reception',
    customer_name: 'Vikramaditya Roy',
    customer_phone: '+91 98765 11223',
    customer_email: 'vikram.roy@example.com',
    event_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '23:30',
    guest_count: 180,
    event_type: 'reception',
    booking_status: 'confirmed',
    rental_amount: 35000,
    catering_required: true,
    catering_notes: 'North Indian & South Indian mixed buffet, Live Chaat Counter',
    estimated_total: 85000,
    advance_paid: 25000,
    tax_treatment: 'gst',
    remarks: 'Stage flower decoration and DJ setup required by 16:30',
    created_at: new Date().toISOString(),
  },
  {
    id: 'bb000000-0000-4000-8000-000000000002',
    banquet_hall_id: DEFAULT_BANQUET_HALL.id,
    booking_number: 'HGV-BNQ-2026-002',
    event_name: 'Apex Pharma Annual Leadership Summit',
    customer_name: 'Dr. Ramesh Kulkarni',
    customer_phone: '+91 98220 54321',
    customer_email: 'ramesh.kulkarni@apexpharma.com',
    event_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    guest_count: 85,
    event_type: 'conference',
    booking_status: 'confirmed',
    rental_amount: 28000,
    catering_required: true,
    catering_notes: 'Morning tea with cookies, Executive Lunch Buffet, High Tea',
    estimated_total: 62000,
    advance_paid: 30000,
    tax_treatment: 'gst',
    remarks: 'Projector, 4 cordless collar microphones, and stage podium setup needed',
    created_at: new Date().toISOString(),
  },
];

/**
 * Fetch the property's Banquet Hall details
 */
export async function getBanquetHall(hotelId?: string): Promise<BanquetHall> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    // 1. Try public.banquet_halls table
    try {
      let q = (supabase.from('banquet_halls') as any).select('*');
      if (activeHotelId) {
        q = q.eq('hotel_id', activeHotelId);
      }
      const { data, error } = await q.maybeSingle();
      if (!error && data) {
        const d = data as any;
        return {
          id: d.id,
          hotel_id: d.hotel_id,
          name: d.name,
          capacity: d.capacity !== null && d.capacity !== undefined ? Number(d.capacity) : null,
          current_status: d.current_status,
          description: d.description,
          half_day_rate: Number(d.half_day_rate || 0),
          full_day_rate: Number(d.full_day_rate || 0),
          amenities: Array.isArray(d.amenities) ? d.amenities : DEFAULT_BANQUET_HALL.amenities,
          notes: d.notes,
          is_active: d.is_active,
          created_at: d.created_at,
          updated_at: d.updated_at,
        };
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings.banquet_hall
    const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', targetHotelId)
      .maybeSingle();

    if (hotel?.settings?.banquet_hall) {
      const h = hotel.settings.banquet_hall as BanquetHall;
      return {
        ...h,
        capacity: h.capacity !== null && h.capacity !== undefined ? Number(h.capacity) : null,
        half_day_rate: Number(h.half_day_rate || DEFAULT_BANQUET_HALL.half_day_rate),
        full_day_rate: Number(h.full_day_rate || DEFAULT_BANQUET_HALL.full_day_rate),
      };
    }

    return DEFAULT_BANQUET_HALL;
  } catch (err) {
    console.error('Error fetching banquet hall:', err);
    return DEFAULT_BANQUET_HALL;
  }
}

/**
 * Fetch all Banquet event bookings
 */
export async function getBanquetBookings(
  hotelId?: string,
  filterDate?: string
): Promise<BanquetBooking[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    // 1. Try public.banquet_bookings table
    try {
      let q = supabase
        .from('banquet_bookings')
        .select(`
          *,
          staff:recorded_by (
            full_name
          )
        `)
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (activeHotelId) {
        q = q.eq('hotel_id', activeHotelId);
      }
      if (filterDate) {
        q = q.eq('event_date', filterDate);
      }

      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return (data as any[]).map((b) => ({
          id: b.id,
          hotel_id: b.hotel_id,
          banquet_hall_id: b.banquet_hall_id,
          booking_number: b.booking_number,
          event_name: b.event_name,
          customer_name: b.customer_name,
          customer_phone: b.customer_phone,
          customer_email: b.customer_email,
          event_date: b.event_date,
          start_time: typeof b.start_time === 'string' ? b.start_time.slice(0, 5) : b.start_time,
          end_time: typeof b.end_time === 'string' ? b.end_time.slice(0, 5) : b.end_time,
          guest_count: b.guest_count !== null ? Number(b.guest_count) : null,
          event_type: b.event_type,
          booking_status: b.booking_status,
          rental_amount: Number(b.rental_amount || 0),
          catering_required: Boolean(b.catering_required),
          catering_notes: b.catering_notes,
          estimated_total: Number(b.estimated_total || 0),
          advance_paid: Number(b.advance_paid || 0),
          tax_treatment: b.tax_treatment || 'gst',
          remarks: b.remarks,
          recorded_by: b.recorded_by,
          recorder_name: b.staff?.full_name || 'Staff',
          created_at: b.created_at,
          updated_at: b.updated_at,
        }));
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings.banquet_bookings
    const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', targetHotelId)
      .maybeSingle();

    const storedBookings: BanquetBooking[] =
      (hotel?.settings?.banquet_bookings as BanquetBooking[]) || DEFAULT_BANQUET_BOOKINGS;

    let filtered = storedBookings;
    if (filterDate) {
      filtered = filtered.filter((b) => b.event_date === filterDate);
    }
    return filtered.sort((a, b) => a.event_date.localeCompare(b.event_date));
  } catch (err) {
    console.error('Error fetching banquet bookings:', err);
    return DEFAULT_BANQUET_BOOKINGS;
  }
}

/**
 * Check whether the banquet hall is available for a given date and time range
 */
export async function checkBanquetAvailability(
  hotelId: string | undefined,
  eventDate: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<{ available: boolean; conflictingBooking?: BanquetBooking }> {
  const bookings = await getBanquetBookings(hotelId, eventDate);

  // Active bookings on the same date (excluding cancelled or inquiry)
  const activeBookings = bookings.filter(
    (b) =>
      b.booking_status !== 'cancelled' &&
      b.id !== excludeBookingId &&
      b.event_date === eventDate
  );

  // Normalize time string "HH:MM" -> minutes from midnight
  const toMinutes = (t: string) => {
    const [h, m] = t.slice(0, 5).split(':').map(Number);
    return h * 60 + m;
  };

  const reqStart = toMinutes(startTime);
  const reqEnd = toMinutes(endTime);

  for (const b of activeBookings) {
    const existStart = toMinutes(b.start_time);
    const existEnd = toMinutes(b.end_time);

    // Overlap occurs if requested start is before existing end AND requested end is after existing start
    if (reqStart < existEnd && reqEnd > existStart) {
      return { available: false, conflictingBooking: b };
    }
  }

  return { available: true };
}

/**
 * High level Banquet Operational Summary Metrics
 */
export async function getBanquetSummary(hotelId?: string): Promise<BanquetSummary> {
  const [hall, bookings] = await Promise.all([
    getBanquetHall(hotelId),
    getBanquetBookings(hotelId),
  ]);

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = bookings.filter(
    (b) => b.event_date >= todayStr && b.booking_status !== 'cancelled'
  );
  const inProgressEvents = bookings.filter(
    (b) => b.booking_status === 'in_progress' || (b.event_date === todayStr && b.booking_status === 'confirmed')
  );

  const totalRevenue = bookings
    .filter((b) => b.booking_status !== 'cancelled')
    .reduce((sum, b) => sum + (b.estimated_total || b.rental_amount || 0), 0);

  const totalAdvance = bookings
    .filter((b) => b.booking_status !== 'cancelled')
    .reduce((sum, b) => sum + (b.advance_paid || 0), 0);

  return {
    hall_name: hall.name,
    hall_capacity: hall.capacity,
    current_status: hall.current_status,
    total_events_month: bookings.length,
    upcoming_events_count: upcomingEvents.length,
    in_progress_count: inProgressEvents.length,
    total_estimated_revenue: Math.round(totalRevenue * 100) / 100,
    total_advance_collected: Math.round(totalAdvance * 100) / 100,
  };
}
