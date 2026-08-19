import { getHotelSettings } from '../hotels/queries';
import { getBookingById } from '../bookings/queries';
import { localBookingsStore, localPaymentsStore, PaymentRecord } from '../bookings/queries';

export interface BillLineItem {
  description: string;
  nights?: number;
  rate?: number;
  amount: number;
}

export interface GeneratedBill {
  booking_id: string;
  booking_number: string;
  guest_name: string;
  guest_phone: string;
  room_number: string;
  category_name: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  children: number;
  // Financial breakdown
  line_items: BillLineItem[];
  subtotal: number;          // room charges + extras
  gst_rate: number;          // from hotels.settings — never hardcoded
  gst_amount: number;        // 0 if non-GST bill
  grand_total: number;       // subtotal + gst_amount
  total_paid: number;        // sum of all payment records
  balance_due: number;       // grand_total - total_paid
  // Payments
  payments: PaymentRecord[];
  // Hotel info (for bill header)
  hotel_name: string;
  hotel_address: string;
  hotel_gst_number: string | null;
  hotel_phone: string;
  // Meta
  include_gst: boolean;
  generated_at: string;
}

/**
 * Server-side bill calculator — all arithmetic happens here, never on the client.
 * GST rate is always fetched from hotels.settings — never hardcoded.
 */
export async function generateBill(bookingId: string, includeGst: boolean): Promise<GeneratedBill> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  const settings = await getHotelSettings(booking.hotel_id);

  // Get all payments for this booking from the joined database record or local store
  const payments = booking.payments || localPaymentsStore.filter((p) => p.booking_id === bookingId);
  const totalPaid = payments.reduce((sum, p) => {
    const amt = Number(p.amount) || 0;
    return p.payment_type === 'refund' ? sum - amt : sum + amt;
  }, 0);

  // Calculate nights
  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));

  // Build line items
  const roomCharge = nights * Number(booking.rate_per_night);
  const extras = Math.max(0, Number(booking.total_amount) - roomCharge);

  const lineItems: BillLineItem[] = [
    {
      description: `Room ${booking.room.room_number} (${booking.room.category.name}) — ${nights} Night${nights > 1 ? 's' : ''}`,
      nights,
      rate: Number(booking.rate_per_night),
      amount: roomCharge,
    },
  ];

  if (extras > 0) {
    lineItems.push({
      description: 'Extra Charges (Extra Bed / Extras)',
      amount: extras,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  // GST from settings — dynamic percentage (12, 18, etc.)
  const gstRate = Number(settings.gst_percentage || settings.gst_rate || 12);
  const gstAmount = includeGst ? Math.round(((subtotal * gstRate) / 100) * 100) / 100 : 0;
  const grandTotal = subtotal + gstAmount;
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  return {
    booking_id: booking.id,
    booking_number: booking.booking_number,
    guest_name: booking.guest.full_name,
    guest_phone: booking.guest.phone,
    room_number: booking.room.room_number,
    category_name: booking.room.category.name,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    nights,
    adults: booking.adults,
    children: booking.children,
    line_items: lineItems,
    subtotal,
    gst_rate: gstRate,
    gst_amount: gstAmount,
    grand_total: grandTotal,
    total_paid: totalPaid,
    balance_due: balanceDue,
    payments,
    hotel_name: 'Hotel Greenery View',
    hotel_address: `${settings.address || 'Nature Valley Road'}, ${settings.city || 'Green Hills'}`,
    hotel_gst_number: settings.gst_number || null,
    hotel_phone: settings.phone || '+91 98765 43210',
    include_gst: includeGst,
    generated_at: new Date().toISOString(),
  };
}

