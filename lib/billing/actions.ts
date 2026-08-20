import { getHotelSettings } from '../hotels/queries';
import { getBookingById, PaymentRecord } from '../bookings/queries';
import { numberToIndianWords } from '../utils/currency';
import { formatDate } from '../utils/dates';

export interface BillLineItem {
  description: string;
  sac_code?: string;
  nights?: number;
  rate?: number;
  taxable_amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
}

export interface GeneratedBill {
  booking_id: string;
  booking_number: string;
  booking_status: string;
  invoice_number: string;
  invoice_date: string;
  pdf_filename: string;
  amount_in_words: string;

  // Guest details
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  guest_address: string | null;
  guest_id_type: string | null;
  guest_id_number: string | null;

  // Stay details
  room_number: string;
  category_name: string;
  check_in_date: string;
  check_out_date: string;
  check_in_time: string;
  check_out_time: string;
  nights: number;
  adults: number;
  children: number;

  // Financial breakdown
  line_items: BillLineItem[];
  taxable_subtotal: number;
  subtotal: number;
  gst_rate: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  gst_amount: number;
  grand_total: number;
  total_paid: number;
  balance_due: number;

  // Payments
  payments: PaymentRecord[];

  // Hotel info
  hotel_name: string;
  hotel_address: string;
  hotel_city: string;
  hotel_gst_number: string | null;
  hotel_pan_number: string | null;
  hotel_phone: string;
  hotel_email: string;

  // Meta
  include_gst: boolean;
  generated_at: string;
}

/**
 * Sanitize strings for safe, professional filesystem filenames
 */
export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates structured, deterministic PDF filename:
 * Format: HotelGreeneryView_Invoice_<InvoiceNumber>_<GuestName>.pdf
 */
export function generateInvoiceFilename(invoiceNumber: string, guestName: string): string {
  const cleanGuest = sanitizeFilename(guestName) || 'Guest';
  const cleanInv = sanitizeFilename(invoiceNumber) || 'Invoice';
  return `HotelGreeneryView_Invoice_${cleanInv}_${cleanGuest}.pdf`;
}

/**
 * Generate a persistent, deterministic invoice number for a booking:
 * Format: HGV-INV-YYYYMMDD-XXXX
 */
export function deriveInvoiceNumber(booking: {
  id: string;
  booking_number: string;
  created_at?: string;
}): { invoice_number: string; invoice_date: string } {
  const dateObj = booking.created_at ? new Date(booking.created_at) : new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Extract sequential suffix from booking number or hash
  let suffix = '0001';
  const parts = (booking.booking_number || '').split('-');
  if (parts.length >= 3) {
    const rawSuffix = parts[parts.length - 1];
    suffix = rawSuffix.slice(-4).padStart(4, '0');
  } else if (booking.id) {
    // Deterministic 4-digit code from UUID
    const hex = booking.id.replace(/-/g, '').slice(0, 4);
    const num = (parseInt(hex, 16) % 9000) + 1000;
    suffix = String(num);
  }

  const invoice_number = `HGV-INV-${dateStr}-${suffix}`;
  const invoice_date = formatDate(dateObj.toISOString());

  return { invoice_number, invoice_date };
}

/**
 * Server-side bill calculator — authoritative financial arithmetic.
 * GST rate is dynamically derived from hotels.settings.
 */
export async function generateBill(bookingId: string, includeGst: boolean = true): Promise<GeneratedBill> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  const settings = await getHotelSettings(booking.hotel_id);

  // Derive immutable invoice details
  const { invoice_number, invoice_date } = deriveInvoiceNumber(booking);

  // Payments summary
  const rawPayments = booking.payments || [];
  const payments: PaymentRecord[] = rawPayments.map((p) => ({
    ...p,
    amount: Math.abs(Number(p.amount) || 0), // positive representation for receipt table
  }));

  const totalPaid = rawPayments.reduce((sum, p) => {
    const amt = Number(p.amount) || 0;
    return p.payment_type === 'refund' ? sum - amt : sum + amt;
  }, 0);

  // Stay calculation
  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));

  const effectiveGstRate = Number(settings.gst_percentage ?? settings.gst_rate ?? 12);
  const applicableGstRate = includeGst ? effectiveGstRate : 0;

  // Build itemized charges table
  const roomCharge = nights * Number(booking.rate_per_night);
  const roomTax = includeGst ? Math.round(((roomCharge * applicableGstRate) / 100) * 100) / 100 : 0;
  const roomTotal = roomCharge + roomTax;

  const lineItems: BillLineItem[] = [
    {
      description: `Room ${booking.room?.room_number || '—'} (${booking.room?.category?.name || 'Room Charge'}) — ${nights} Night${nights > 1 ? 's' : ''}`,
      sac_code: '996311', // SAC for Hotel Accommodation Services
      nights,
      rate: Number(booking.rate_per_night),
      taxable_amount: roomCharge,
      gst_rate: applicableGstRate,
      gst_amount: roomTax,
      total_amount: roomTotal,
    },
  ];

  const extras = Math.max(0, Number(booking.total_amount) - roomCharge);
  if (extras > 0) {
    const extraTax = includeGst ? Math.round(((extras * applicableGstRate) / 100) * 100) / 100 : 0;
    lineItems.push({
      description: 'Extra Guest / Bed Charges & Room Services',
      sac_code: '996311',
      taxable_amount: extras,
      gst_rate: applicableGstRate,
      gst_amount: extraTax,
      total_amount: extras + extraTax,
    });
  }

  const taxableSubtotal = lineItems.reduce((sum, item) => sum + item.taxable_amount, 0);
  const totalGstAmount = lineItems.reduce((sum, item) => sum + item.gst_amount, 0);
  const grandTotal = taxableSubtotal + totalGstAmount;
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  // CGST & SGST Split (50% each for Intra-State supply)
  const cgstRate = includeGst ? applicableGstRate / 2 : 0;
  const sgstRate = includeGst ? applicableGstRate / 2 : 0;
  const cgstAmount = Math.round((totalGstAmount / 2) * 100) / 100;
  const sgstAmount = totalGstAmount - cgstAmount; // avoid rounding discrepancy

  const guestName = booking.guest?.full_name || 'Guest';
  const pdf_filename = generateInvoiceFilename(invoice_number, guestName);
  const amount_in_words = numberToIndianWords(grandTotal);

  return {
    booking_id: booking.id,
    booking_number: booking.booking_number,
    booking_status: booking.booking_status,
    invoice_number,
    invoice_date,
    pdf_filename,
    amount_in_words,

    guest_name: guestName,
    guest_phone: booking.guest?.phone || '—',
    guest_email: booking.guest?.email || null,
    guest_address: booking.guest?.address || null,
    guest_id_type: booking.guest?.id_type || null,
    guest_id_number: booking.guest?.id_number || null,

    room_number: booking.room?.room_number || '—',
    category_name: booking.room?.category?.name || 'Standard',
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    check_in_time: settings.check_in_time || '12:00 PM',
    check_out_time: settings.check_out_time || '11:00 AM',
    nights,
    adults: booking.adults,
    children: booking.children,

    line_items: lineItems,
    taxable_subtotal: taxableSubtotal,
    subtotal: taxableSubtotal,
    gst_rate: applicableGstRate,
    cgst_rate: cgstRate,
    cgst_amount: cgstAmount,
    sgst_rate: sgstRate,
    sgst_amount: sgstAmount,
    gst_amount: totalGstAmount,
    grand_total: grandTotal,
    total_paid: totalPaid,
    balance_due: balanceDue,

    payments,

    hotel_name: 'HOTEL GREENERY VIEW',
    hotel_address: settings.address || 'Nature Valley Road, Near Tea Gardens',
    hotel_city: settings.city || 'Darjeeling, West Bengal 734101',
    hotel_gst_number: settings.gst_number || (settings.gst_enabled ? '19AABCH9876K1Z8' : null),
    hotel_pan_number: settings.pan_number || 'AABCH9876K',
    hotel_phone: settings.phone || '+91 98765 43210',
    hotel_email: settings.email || 'reservations@hotelgreeneryview.com',

    include_gst: includeGst,
    generated_at: new Date().toISOString(),
  };
}
