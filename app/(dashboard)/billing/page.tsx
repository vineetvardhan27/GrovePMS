import { getBookings } from '../../../lib/bookings/queries';
import { getAllFoodCharges } from '../../../lib/billing/food-actions';
import { getHotelSettings } from '../../../lib/hotels/queries';
import Link from 'next/link';
import { FileText, CheckCircle2, Clock, CreditCard, Building, Utensils } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils/currency';
import { formatDate } from '../../../lib/utils/dates';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const [bookings, allFoodCharges] = await Promise.all([
    getBookings(),
    getAllFoodCharges(),
  ]);

  // Index food charges by booking_id
  const foodByBooking = new Map<string, number>();
  for (const fc of allFoodCharges) {
    const prev = foodByBooking.get(fc.booking_id) || 0;
    foodByBooking.set(fc.booking_id, prev + (fc.taxable_amount || 0));
  }

  // Show checked_in, checked_out, and confirmed bookings
  const relevantBookings = bookings.filter((b) =>
    b.booking_status === 'checked_in' ||
    b.booking_status === 'checked_out' ||
    b.booking_status === 'confirmed'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Billing</h1>
        <p className="text-body text-ink-muted">
          Generate guest invoices, manage food charges, record payments, and process checkouts
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Booking</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Stay</th>
                <th className="p-4">Charges</th>
                <th className="p-4">Total</th>
                <th className="p-4">Balance Due</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {relevantBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink-muted">
                    No active bookings to bill.
                  </td>
                </tr>
              ) : (
                relevantBookings.map((b) => {
                  const foodTotal = foodByBooking.get(b.id) || 0;
                  const totalPaid = (b.payments || []).reduce((sum, p) => {
                    const amt = Number(p.amount) || 0;
                    return p.payment_type === 'refund' ? sum - amt : sum + amt;
                  }, 0);

                  const checkIn = new Date(b.check_in_date);
                  const checkOut = new Date(b.check_out_date);
                  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
                  const roomCharge = nights * Number(b.rate_per_night);
                  const extras = Math.max(0, Number(b.total_amount) - roomCharge);

                  const combinedTaxable = roomCharge + extras + foodTotal;
                  // Default standard bill preview
                  const estimatedGst = Math.round(((combinedTaxable * 12) / 100) * 100) / 100;
                  const estimatedGrandTotal = combinedTaxable + estimatedGst;
                  const balanceDue = Math.max(0, Math.round((estimatedGrandTotal - totalPaid) * 100) / 100);
                  const isCheckedIn = b.booking_status === 'checked_in';

                  return (
                    <tr key={b.id} className="hover:bg-brand-sand/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-ink text-xs">{b.booking_number}</span>
                        <span
                          className={`block text-[11px] font-semibold capitalize mt-0.5 ${
                            isCheckedIn ? 'text-status-green' : 'text-status-blue'
                          }`}
                        >
                          {b.booking_status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-ink">{b.guest.full_name}</p>
                        <p className="text-ink-muted">{b.guest.phone}</p>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-brand-forest font-serif text-sm">
                          Room {b.room.room_number}
                        </span>
                        <span className="block text-ink-muted">{b.room.category.name}</span>
                      </td>

                      <td className="p-4 text-ink-muted">
                        {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                      </td>

                      <td className="p-4 space-y-0.5 text-[11px]">
                        <p className="text-ink font-medium">Room: {formatCurrency(roomCharge)}</p>
                        {foodTotal > 0 && (
                          <p className="text-brand-forest font-bold flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            <span>F&amp;B: {formatCurrency(foodTotal)}</span>
                          </p>
                        )}
                      </td>

                      <td className="p-4 font-bold text-ink tabular-nums">
                        {formatCurrency(estimatedGrandTotal)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-bold tabular-nums text-sm ${
                            balanceDue === 0
                              ? 'text-status-green'
                              : 'text-status-amber'
                          }`}
                        >
                          {balanceDue === 0 ? '✓ Settled' : formatCurrency(balanceDue)}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/billing/${b.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isCheckedIn ? 'Bill & Checkout' : 'View Bill'}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
