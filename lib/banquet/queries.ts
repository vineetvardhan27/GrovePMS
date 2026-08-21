import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { getHotelSettings } from '../hotels/queries';
import { numberToIndianWords, formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';
import {
  BanquetHall,
  BanquetBooking,
  BanquetCharge,
  BanquetPayment,
  BanquetFolio,
  BanquetInvoice,
  BanquetSummary,
} from './types';

export const DEFAULT_BANQUET_HALL: BanquetHall = {
  id: 'bnq00000-0000-4000-8000-000000000001',
  name: 'The Grand Greenery Banquet & Convention Hall',
  capacity: null,
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
    customer_address: 'Alipore, Kolkata, West Bengal 700027',
    customer_gstin: null,
    payment_status: 'partially_paid',
    invoice_number: 'HGV-BNQ-INV-20260822-0001',
    invoice_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
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
    subtotal: 85000,
    tax_amount: 15300,
    grand_total: 100300,
    total_paid: 25000,
    balance_due: 75300,
    tax_treatment: 'gst',
    remarks: 'Stage flower decoration and DJ setup required by 16:30',
    charges: [
      {
        id: 'bc000000-0000-4000-8000-000000000001',
        banquet_booking_id: 'bb000000-0000-4000-8000-000000000001',
        category: 'hall_rental',
        description: 'Grand Banquet Hall Full Day Rental (18:00 - 23:30)',
        sac_code: '996311',
        quantity: 1,
        unit_price: 35000,
        discount: 0,
        tax_treatment: 'gst',
        tax_rate: 18,
        taxable_amount: 35000,
        tax_amount: 6300,
        total_amount: 41300,
        created_at: new Date().toISOString(),
      },
      {
        id: 'bc000000-0000-4000-8000-000000000002',
        banquet_booking_id: 'bb000000-0000-4000-8000-000000000001',
        category: 'catering',
        description: 'Wedding Buffet & Live Counters (180 pax × ₹250)',
        sac_code: '996331',
        quantity: 180,
        unit_price: 250,
        discount: 0,
        tax_treatment: 'gst',
        tax_rate: 18,
        taxable_amount: 45000,
        tax_amount: 8100,
        total_amount: 53100,
        created_at: new Date().toISOString(),
      },
      {
        id: 'bc000000-0000-4000-8000-000000000003',
        banquet_booking_id: 'bb000000-0000-4000-8000-000000000001',
        category: 'audio_visual',
        description: 'AV Projector, High-Gain Screen & Collar Mics',
        sac_code: '996311',
        quantity: 1,
        unit_price: 5000,
        discount: 0,
        tax_treatment: 'gst',
        tax_rate: 18,
        taxable_amount: 5000,
        tax_amount: 900,
        total_amount: 5900,
        created_at: new Date().toISOString(),
      },
    ],
    payments: [
      {
        id: 'bp000000-0000-4000-8000-000000000001',
        banquet_booking_id: 'bb000000-0000-4000-8000-000000000001',
        amount: 25000,
        payment_mode: 'upi',
        payment_type: 'advance',
        reference_number: 'UPI-HGV-8923412',
        notes: 'Initial booking deposit via Google Pay',
        created_at: new Date().toISOString(),
      },
    ],
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
    customer_address: 'Salt Lake Sector V, Kolkata, West Bengal 700091',
    customer_gstin: '19AAACP1234F1Z5',
    payment_status: 'partially_paid',
    invoice_number: 'HGV-BNQ-INV-20260822-0002',
    invoice_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
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
    subtotal: 62000,
    tax_amount: 11160,
    grand_total: 73160,
    total_paid: 30000,
    balance_due: 43160,
    tax_treatment: 'gst',
    remarks: 'Projector, 4 cordless collar microphones, and stage podium setup needed',
    charges: [
      {
        id: 'bc000000-0000-4000-8000-000000000004',
        banquet_booking_id: 'bb000000-0000-4000-8000-000000000002',
        category: 'hall_rental',
        description: 'Full Day Conference Hall Package with Stage & Podium',
        sac_code: '996311',
        quantity: 1,
        unit_price: 28000,
        discount: 0,
        tax_treatment: 'gst',
        tax_rate: 18,
        taxable_amount: 28000,
        tax_amount: 5040,
        total_amount: 33040,
        created_at: new Date().toISOString(),
      },
      {
        id: 'bc000000-0000-4000-8000-000000000005',
        banquet_booking_id: 'bb000000-0000-4000-8000-000000000002',
        category: 'catering',
        description: 'Corporate Executive Lunch & High Tea (85 pax × ₹400)',
        sac_code: '996331',
        quantity: 85,
        unit_price: 400,
        discount: 0,
        tax_treatment: 'gst',
        tax_rate: 18,
        taxable_amount: 34000,
        tax_amount: 6120,
        total_amount: 40120,
        created_at: new Date().toISOString(),
      },
    ],
    payments: [
      {
        id: 'bp000000-0000-4000-8000-000000000002',
        banquet_booking_id: 'bb000000-0000-4000-8000-000000000002',
        amount: 30000,
        payment_mode: 'bank_transfer',
        payment_type: 'advance',
        reference_number: 'NEFT-AXIS-992384',
        notes: 'Corporate advance from Apex Pharma Ltd.',
        created_at: new Date().toISOString(),
      },
    ],
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
      // Fallback to settings
    }

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
 * Fetch itemized charges for a banquet booking
 */
export async function getBanquetCharges(bookingId: string): Promise<BanquetCharge[]> {
  try {
    const supabase = createClient();
    try {
      const { data, error } = await (supabase.from('banquet_charges') as any)
        .select('*')
        .eq('banquet_booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return (data as any[]).map((c) => ({
          id: c.id,
          hotel_id: c.hotel_id,
          banquet_booking_id: c.banquet_booking_id,
          category: c.category,
          description: c.description,
          sac_code: c.sac_code || '996311',
          quantity: Number(c.quantity || 1),
          unit_price: Number(c.unit_price || 0),
          discount: Number(c.discount || 0),
          tax_treatment: c.tax_treatment || 'gst',
          tax_rate: Number(c.tax_rate ?? 18),
          taxable_amount: Number(c.taxable_amount || 0),
          tax_amount: Number(c.tax_amount || 0),
          total_amount: Number(c.total_amount || 0),
          notes: c.notes,
          recorded_by: c.recorded_by,
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));
      }
    } catch {
      // Fallback
    }

    // Fallback to hotel.settings.banquet_charges or matching default
    const staff = await getCurrentStaff();
    const hotelId = staff?.hotel_id || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', hotelId)
      .maybeSingle();

    const storedCharges: BanquetCharge[] = (hotel?.settings?.banquet_charges as BanquetCharge[]) || [];
    const matching = storedCharges.filter((c) => c.banquet_booking_id === bookingId);
    if (matching.length > 0) return matching;

    const defaultMatch = DEFAULT_BANQUET_BOOKINGS.find((b) => b.id === bookingId);
    return defaultMatch?.charges || [];
  } catch (err) {
    console.error('getBanquetCharges error:', err);
    return [];
  }
}

/**
 * Fetch payments for a banquet booking (or all banquet payments if bookingId is omitted)
 */
export async function getBanquetPayments(
  bookingId?: string,
  hotelIdParam?: string
): Promise<BanquetPayment[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelIdParam || staff?.hotel_id;
    const supabase = createClient();
    try {
      let q = (supabase.from('banquet_payments') as any)
        .select(`
          *,
          staff:recorded_by (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (bookingId) {
        q = q.eq('banquet_booking_id', bookingId);
      }
      if (activeHotelId) {
        q = q.eq('hotel_id', activeHotelId);
      }

      const { data, error } = await q;

      if (!error && data && data.length > 0) {
        return (data as any[]).map((p) => ({
          id: p.id,
          hotel_id: p.hotel_id,
          banquet_booking_id: p.banquet_booking_id,
          amount: Number(p.amount || 0),
          payment_mode: p.payment_mode,
          payment_type: p.payment_type || 'partial',
          reference_number: p.reference_number,
          notes: p.notes,
          recorded_by: p.recorded_by,
          recorder_name: p.staff?.full_name || 'Staff',
          created_at: p.created_at,
        }));
      }
    } catch {
      // Fallback
    }

    const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', targetHotelId)
      .maybeSingle();

    const storedPayments: BanquetPayment[] = (hotel?.settings?.banquet_payments as BanquetPayment[]) || [];
    if (bookingId) {
      const matching = storedPayments.filter((p) => p.banquet_booking_id === bookingId);
      if (matching.length > 0) return matching;

      const defaultMatch = DEFAULT_BANQUET_BOOKINGS.find((b) => b.id === bookingId);
      return defaultMatch?.payments || [];
    }

    if (storedPayments.length > 0) return storedPayments;
    return DEFAULT_BANQUET_BOOKINGS.flatMap((b) => b.payments || []);
  } catch (err) {
    console.error('getBanquetPayments error:', err);
    return [];
  }
}

/**
 * Recalculate dynamic folio totals from itemized charges & payments
 */
export function calculateBanquetFolioTotals(
  charges: BanquetCharge[],
  payments: BanquetPayment[],
  fallbackRental: number = 0,
  taxTreatment: 'gst' | 'non_gst' = 'gst'
) {
  let subtotal = 0;
  let totalTax = 0;

  if (charges.length === 0 && fallbackRental > 0) {
    subtotal = fallbackRental;
    totalTax = taxTreatment === 'gst' ? Math.round(fallbackRental * 0.18 * 100) / 100 : 0;
  } else {
    for (const c of charges) {
      const isGst = c.tax_treatment === 'gst';
      const effectiveRate = isGst ? (c.tax_rate ?? 18) : 0;
      const base = Number(c.quantity || 1) * Number(c.unit_price || 0) - Number(c.discount || 0);
      const taxable = Math.max(0, base);
      const tax = isGst ? Math.round(((taxable * effectiveRate) / 100) * 100) / 100 : 0;
      subtotal += taxable;
      totalTax += tax;
    }
  }

  const grandTotal = Math.round((subtotal + totalTax) * 100) / 100;
  const totalPaid = payments.reduce((sum, p) => {
    const amt = Number(p.amount) || 0;
    return p.payment_type === 'refund' ? sum - amt : sum + amt;
  }, 0);

  const balanceDue = Math.max(0, Math.round((grandTotal - totalPaid) * 100) / 100);
  const paymentStatus =
    balanceDue <= 0 && grandTotal > 0
      ? 'paid'
      : totalPaid > 0
      ? 'partially_paid'
      : 'unpaid';

  const cgstAmount = Math.round((totalTax / 2) * 100) / 100;
  const sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxable_amount: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(totalTax * 100) / 100,
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    grand_total: grandTotal,
    total_paid: Math.round(totalPaid * 100) / 100,
    balance_due: balanceDue,
    payment_status: paymentStatus as 'unpaid' | 'partially_paid' | 'paid' | 'refunded',
  };
}

/**
 * Fetch all Banquet event bookings with full live financial calculations
 */
export async function getBanquetBookings(
  hotelId?: string,
  filterDate?: string
): Promise<BanquetBooking[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    let rawBookings: any[] = [];

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
        rawBookings = data;
      }
    } catch {
      // Fallback
    }

    if (rawBookings.length === 0) {
      const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
      const { data: hotel } = await (supabase.from('hotels') as any)
        .select('settings')
        .eq('id', targetHotelId)
        .maybeSingle();

      const storedBookings: BanquetBooking[] =
        (hotel?.settings?.banquet_bookings as BanquetBooking[]) || DEFAULT_BANQUET_BOOKINGS;

      rawBookings = storedBookings;
      if (filterDate) {
        rawBookings = rawBookings.filter((b) => b.event_date === filterDate);
      }
    }

    // Attach charges, payments, and dynamically calculated balances
    const enrichedBookings: BanquetBooking[] = await Promise.all(
      rawBookings.map(async (b) => {
        const charges = await getBanquetCharges(b.id);
        const payments = await getBanquetPayments(b.id);
        const rental = Number(b.rental_amount || 0);
        const totals = calculateBanquetFolioTotals(charges, payments, rental, b.tax_treatment || 'gst');

        const initialAdv = Number(b.advance_paid || 0);
        const effectivePaid = payments.length > 0 ? totals.total_paid : initialAdv;
        const effectiveBalance = Math.max(0, totals.grand_total - effectivePaid);
        const effectivePaymentStatus =
          effectiveBalance <= 0 && totals.grand_total > 0
            ? 'paid'
            : effectivePaid > 0
            ? 'partially_paid'
            : 'unpaid';

        return {
          id: b.id,
          hotel_id: b.hotel_id,
          banquet_hall_id: b.banquet_hall_id,
          booking_number: b.booking_number,
          event_name: b.event_name,
          customer_name: b.customer_name,
          customer_phone: b.customer_phone,
          customer_email: b.customer_email || null,
          customer_address: b.customer_address || null,
          customer_gstin: b.customer_gstin || null,
          payment_status: (b.payment_status || effectivePaymentStatus) as any,
          invoice_number: b.invoice_number || null,
          invoice_date: b.invoice_date || null,
          event_date: b.event_date,
          start_time: typeof b.start_time === 'string' ? b.start_time.slice(0, 5) : b.start_time,
          end_time: typeof b.end_time === 'string' ? b.end_time.slice(0, 5) : b.end_time,
          guest_count: b.guest_count !== null ? Number(b.guest_count) : null,
          event_type: b.event_type,
          booking_status: b.booking_status,
          rental_amount: rental,
          catering_required: Boolean(b.catering_required),
          catering_notes: b.catering_notes,
          estimated_total: Number(b.estimated_total || totals.grand_total),
          advance_paid: initialAdv,
          subtotal: totals.subtotal,
          tax_amount: totals.tax_amount,
          grand_total: totals.grand_total,
          total_paid: effectivePaid,
          balance_due: effectiveBalance,
          tax_treatment: b.tax_treatment || 'gst',
          remarks: b.remarks,
          recorded_by: b.recorded_by,
          recorder_name: b.staff?.full_name || 'Staff',
          charges,
          payments,
          created_at: b.created_at,
          updated_at: b.updated_at,
        };
      })
    );

    return enrichedBookings.sort((a, b) => a.event_date.localeCompare(b.event_date));
  } catch (err) {
    console.error('Error fetching banquet bookings:', err);
    return DEFAULT_BANQUET_BOOKINGS;
  }
}

/**
 * Fetch a single Banquet Booking with its complete Folio and Payments
 */
export async function getBanquetBookingById(bookingId: string): Promise<BanquetBooking | null> {
  try {
    const bookings = await getBanquetBookings();
    const found = bookings.find((b) => b.id === bookingId || b.booking_number === bookingId);
    return found || null;
  } catch (err) {
    console.error('getBanquetBookingById error:', err);
    return null;
  }
}

/**
 * Fetch a complete Banquet Folio model for workspace & billing
 */
export async function getBanquetFolio(bookingId: string): Promise<BanquetFolio | null> {
  const booking = await getBanquetBookingById(bookingId);
  if (!booking) return null;

  const hall = await getBanquetHall(booking.hotel_id);
  const charges = await getBanquetCharges(booking.id);
  const payments = await getBanquetPayments(booking.id);
  const totals = calculateBanquetFolioTotals(charges, payments, booking.rental_amount, booking.tax_treatment);

  return {
    booking,
    hall,
    charges,
    payments,
    subtotal: totals.subtotal,
    taxable_amount: totals.taxable_amount,
    tax_amount: totals.tax_amount,
    cgst_amount: totals.cgst_amount,
    sgst_amount: totals.sgst_amount,
    grand_total: totals.grand_total,
    total_paid: totals.total_paid,
    balance_due: totals.balance_due,
    payment_status: totals.payment_status,
  };
}

/**
 * Generate a complete printable Banquet Invoice model
 */
export async function getBanquetInvoice(bookingId: string): Promise<BanquetInvoice | null> {
  const folio = await getBanquetFolio(bookingId);
  if (!folio) return null;

  const { booking, hall, charges, payments } = folio;
  const settings = await getHotelSettings(booking.hotel_id);

  const cleanInv = booking.invoice_number || `HGV-BNQ-INV-${booking.event_date.replace(/-/g, '')}-${booking.booking_number.slice(-4)}`;
  const cleanName = booking.customer_name.replace(/[^a-zA-Z0-9]/g, '_');
  const pdf_filename = `HotelGreeneryView_BanquetInvoice_${cleanInv}_${cleanName}.pdf`;

  const isGst = booking.tax_treatment === 'gst';
  const effectiveGstRate = isGst ? Number(settings.gst_percentage ?? 18) : 0;
  const cgstRate = effectiveGstRate / 2;
  const sgstRate = effectiveGstRate / 2;

  return {
    booking_id: booking.id,
    booking_number: booking.booking_number,
    event_name: booking.event_name,
    event_type: booking.event_type,
    event_date: booking.event_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    guest_count: booking.guest_count,
    hall_name: hall.name,
    invoice_number: cleanInv,
    invoice_date: booking.invoice_date ? formatDate(booking.invoice_date) : formatDate(booking.event_date),
    pdf_filename,
    amount_in_words: numberToIndianWords(folio.grand_total),

    customer_name: booking.customer_name,
    customer_phone: booking.customer_phone,
    customer_email: booking.customer_email || null,
    customer_address: booking.customer_address || null,
    customer_gstin: booking.customer_gstin || null,

    charges,
    subtotal: folio.subtotal,
    taxable_subtotal: folio.taxable_amount,
    gst_rate: effectiveGstRate,
    cgst_rate: cgstRate,
    cgst_amount: folio.cgst_amount,
    sgst_rate: sgstRate,
    sgst_amount: folio.sgst_amount,
    total_tax: folio.tax_amount,
    grand_total: folio.grand_total,
    total_paid: folio.total_paid,
    balance_due: folio.balance_due,
    payment_status: folio.payment_status,

    payments,

    hotel_name: 'HOTEL GREENERY VIEW',
    hotel_address: settings.address || 'Nature Valley Road, Near Tea Gardens',
    hotel_city: settings.city || 'Darjeeling, West Bengal 734101',
    hotel_gst_number: settings.gst_number || (settings.gst_enabled ? '19AABCH9876K1Z8' : null),
    hotel_pan_number: settings.pan_number || 'AABCH9876K',
    hotel_phone: settings.phone || '+91 98765 43210',
    hotel_email: settings.email || 'reservations@hotelgreeneryview.com',
    generated_at: new Date().toISOString(),
  };
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

  const activeBookings = bookings.filter(
    (b) =>
      b.booking_status !== 'cancelled' &&
      b.id !== excludeBookingId &&
      b.event_date === eventDate
  );

  const toMinutes = (t: string) => {
    const [h, m] = t.slice(0, 5).split(':').map(Number);
    return h * 60 + m;
  };

  const reqStart = toMinutes(startTime);
  const reqEnd = toMinutes(endTime);

  for (const b of activeBookings) {
    const existStart = toMinutes(b.start_time);
    const existEnd = toMinutes(b.end_time);

    if (reqStart < existEnd && reqEnd > existStart) {
      return { available: false, conflictingBooking: b };
    }
  }

  return { available: true };
}

/**
 * High level Banquet Operational & Financial Summary Metrics
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
    (b) => b.booking_status === 'in_progress'
  );
  const todaysEvents = bookings.filter(
    (b) => b.event_date === todayStr && b.booking_status !== 'cancelled'
  );

  const activeBookings = bookings.filter((b) => b.booking_status !== 'cancelled');

  const projectedRevenue = upcomingEvents.reduce((sum, b) => sum + (b.grand_total || b.estimated_total || 0), 0);
  const totalAdvance = activeBookings.reduce((sum, b) => sum + (b.total_paid || b.advance_paid || 0), 0);
  const totalOutstanding = activeBookings.reduce((sum, b) => sum + (b.balance_due || 0), 0);
  const settledRevenue = bookings
    .filter((b) => b.booking_status === 'completed' || b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_paid || 0), 0);

  return {
    hall_name: hall.name,
    hall_capacity: hall.capacity,
    current_status: hall.current_status,
    total_events_month: bookings.length,
    upcoming_events_count: upcomingEvents.length,
    in_progress_count: inProgressEvents.length,
    todays_events_count: todaysEvents.length,
    total_estimated_revenue: Math.round(projectedRevenue * 100) / 100,
    total_advance_collected: Math.round(totalAdvance * 100) / 100,
    total_outstanding_balance: Math.round(totalOutstanding * 100) / 100,
    total_settled_revenue: Math.round(settledRevenue * 100) / 100,
  };
}
