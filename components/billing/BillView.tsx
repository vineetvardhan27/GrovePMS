'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { GeneratedBill } from '../../lib/billing/actions';
import { PaymentStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import RecordPaymentForm from './RecordPaymentForm';
import { checkOutAction } from '../../lib/checkinout/actions';

interface BillViewProps {
  initialBill: GeneratedBill;
  bookingStatus: string;
}

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { label: string; class: string }> = {
  fully_paid: { label: 'Fully Paid', class: 'bg-status-green/15 text-status-green border-status-green/30' },
  advance_received: { label: 'Advance Received', class: 'bg-status-amber/15 text-status-amber border-status-amber/30' },
  no_payment: { label: 'No Payment', class: 'bg-status-red/15 text-status-red border-status-red/30' },
  credit: { label: 'Credit', class: 'bg-status-blue/15 text-status-blue border-status-blue/30' },
};

export default function BillView({ initialBill, bookingStatus }: BillViewProps) {
  const router = useRouter();
  const [includeGst, setIncludeGst] = useState(initialBill.include_gst);
  const [totalPaid, setTotalPaid] = useState(initialBill.total_paid);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initialBill.balance_due <= 0 ? 'fully_paid' : initialBill.total_paid > 0 ? 'advance_received' : 'no_payment'
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Client-side GST recalculation — no server call needed, all data is in props
  const gstAmount = includeGst
    ? Math.round(initialBill.subtotal * initialBill.gst_rate) / 100
    : 0;
  const grandTotal = initialBill.subtotal + gstAmount;
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  const handleCheckOut = async () => {
    if (!confirm('Are you sure? This will check out the guest and mark the room as Cleaning Required.')) return;
    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      const result = await checkOutAction(initialBill.booking_id);
      if (result.error) {
        setCheckoutError(result.error);
        return;
      }
      router.push('/bookings');
      router.refresh();
    } catch (err: any) {
      setCheckoutError(err?.message || 'An unexpected error occurred during check-out.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePaymentRecorded = (newStatus: PaymentStatus, paidAmount: number) => {
    setTotalPaid((prev) => prev + paidAmount);
    setPaymentStatus(newStatus);
  };

  const badge = PAYMENT_STATUS_BADGE[paymentStatus];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Bill Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          {/* GST Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none bg-white border border-border-subtle rounded-lg px-3 py-2 hover:bg-brand-sand transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={includeGst}
                onChange={(e) => setIncludeGst(e.target.checked)}
                id="gst_toggle"
              />
              <div className={`w-9 h-5 rounded-full transition-colors ${includeGst ? 'bg-brand-forest' : 'bg-border-subtle'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${includeGst ? 'translate-x-4' : ''}`} />
              </div>
            </div>
            <span className="text-xs font-medium text-ink">
              Apply {initialBill.gst_rate}% GST
            </span>
          </label>

          {/* Payment Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.class}`}>
            {badge.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {bookingStatus === 'checked_in' && (
            <button
              type="button"
              disabled={isCheckingOut}
              onClick={handleCheckOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-red hover:bg-status-red/80 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-60 min-h-[38px]"
            >
              {isCheckingOut ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Checking Out...</span></>
              ) : (
                <><LogOut className="w-3.5 h-3.5" /><span>Check Out Guest</span></>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border-subtle hover:bg-brand-sand text-ink text-xs font-medium transition-colors cursor-pointer min-h-[38px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Bill</span>
          </button>
        </div>
      </div>

      {checkoutError && (
        <div className="p-4 bg-action-danger/10 border border-action-danger/30 rounded-xl flex items-start gap-3 text-action-danger text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* Bill Document */}
      <div
        id="bill-print-area"
        className="bg-white rounded-2xl border border-border-subtle shadow-2xs overflow-hidden"
      >
        {/* Hotel Header */}
        <div className="p-8 bg-brand-sand border-b border-border-subtle text-center">
          <h1 className="text-3xl font-serif font-bold text-brand-forest">{initialBill.hotel_name}</h1>
          <p className="text-xs text-ink-muted mt-1">{initialBill.hotel_address}</p>
          {initialBill.hotel_gst_number && (
            <p className="text-xs text-ink-muted">GSTIN: {initialBill.hotel_gst_number}</p>
          )}
          <p className="text-xs text-ink-muted">Ph: {initialBill.hotel_phone}</p>
          <div className="mt-4 inline-block px-4 py-1.5 bg-brand-forest text-white rounded-full text-xs font-semibold">
            {includeGst ? 'TAX INVOICE' : 'RECEIPT / BILL'}
          </div>
        </div>

        {/* Booking & Guest Info Grid */}
        <div className="p-6 grid grid-cols-2 gap-6 border-b border-border-subtle bg-brand-sand/30 text-xs">
          <div className="space-y-1.5">
            <p className="font-bold text-ink text-sm">{initialBill.guest_name}</p>
            <p className="text-ink-muted">{initialBill.guest_phone}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="text-ink-muted">Booking #: </span><span className="font-mono font-bold text-ink">{initialBill.booking_number}</span></p>
            <p><span className="text-ink-muted">Room: </span><span className="font-bold text-ink">Room {initialBill.room_number} ({initialBill.category_name})</span></p>
            <p><span className="text-ink-muted">Check-In: </span><span className="font-semibold text-ink">{formatDate(initialBill.check_in_date)}</span></p>
            <p><span className="text-ink-muted">Check-Out: </span><span className="font-semibold text-ink">{formatDate(initialBill.check_out_date)}</span></p>
            <p><span className="text-ink-muted">Guests: </span><span className="text-ink">{initialBill.adults} Adults{initialBill.children > 0 ? `, ${initialBill.children} Children` : ''}</span></p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-brand-forest text-ink font-semibold uppercase tracking-wider">
                <th className="pb-2 text-left">Description</th>
                <th className="pb-2 text-center">Nights</th>
                <th className="pb-2 text-right">Rate/Night</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {initialBill.line_items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 text-ink">{item.description}</td>
                  <td className="py-2.5 text-center text-ink-muted">{item.nights || '—'}</td>
                  <td className="py-2.5 text-right tabular-nums text-ink-muted">
                    {item.rate ? formatCurrency(item.rate) : '—'}
                  </td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-ink">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-border-subtle space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-ink-muted">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium">{formatCurrency(initialBill.subtotal)}</span>
            </div>

            {includeGst && (
              <div className="flex items-center justify-between text-ink-muted">
                <span>GST @ {initialBill.gst_rate}%</span>
                <span className="tabular-nums font-medium">{formatCurrency(gstAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between font-bold text-brand-forest text-base pt-2 border-t border-brand-forest">
              <span>Grand Total</span>
              <span className="tabular-nums">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Payment History */}
          {initialBill.payments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs font-bold text-ink mb-2 uppercase tracking-wider">Payments Received</p>
              <div className="space-y-1">
                {initialBill.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs text-ink-muted">
                    <span className="capitalize">{p.payment_type} — {p.payment_mode.replace('_', ' ')}{p.notes ? ` (${p.notes})` : ''}</span>
                    <span className="tabular-nums text-status-green font-medium">-{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle font-bold text-sm">
                <span className={balanceDue > 0 ? 'text-status-amber' : 'text-status-green'}>
                  {balanceDue > 0 ? 'Balance Due' : 'Fully Settled'}
                </span>
                <span className={`tabular-nums ${balanceDue > 0 ? 'text-status-amber' : 'text-status-green'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-brand-sand border-t border-border-subtle text-center text-[11px] text-ink-muted">
          Thank you for staying at {initialBill.hotel_name}. We look forward to welcoming you again!
        </div>
      </div>

      {/* Record Payment — hidden from print */}
      {balanceDue > 0 && bookingStatus !== 'checked_out' && bookingStatus !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-2xs print:hidden">
          <RecordPaymentForm
            bookingId={initialBill.booking_id}
            balanceDue={balanceDue}
            grandTotal={grandTotal}
            onPaymentRecorded={handlePaymentRecorded}
          />
        </div>
      )}
    </div>
  );
}
