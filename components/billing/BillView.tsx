'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Building2,
  Download,
  Copy,
  Check,
  CreditCard,
} from 'lucide-react';
import { GeneratedBill } from '../../lib/billing/actions';
import { PaymentStatus } from '../../lib/types/database.types';
import { formatCurrency, numberToIndianWords } from '../../lib/utils/currency';
import RecordPaymentForm from './RecordPaymentForm';
import { checkOutAction } from '../../lib/checkinout/actions';

interface BillViewProps {
  initialBill: GeneratedBill;
  bookingStatus: string;
}

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { label: string; class: string; stampClass: string }> = {
  fully_paid: {
    label: 'PAID IN FULL',
    class: 'bg-status-green/10 text-status-green border-status-green/30',
    stampClass: 'border-status-green text-status-green bg-status-green/5',
  },
  advance_received: {
    label: 'PARTIALLY PAID',
    class: 'bg-status-amber/10 text-status-amber border-status-amber/30',
    stampClass: 'border-status-amber text-status-amber bg-status-amber/5',
  },
  no_payment: {
    label: 'PAYMENT DUE',
    class: 'bg-status-red/10 text-status-red border-status-red/30',
    stampClass: 'border-status-red text-status-red bg-status-red/5',
  },
  credit: {
    label: 'CREDIT / BILL TO COMPANY',
    class: 'bg-status-blue/10 text-status-blue border-status-blue/30',
    stampClass: 'border-status-blue text-status-blue bg-status-blue/5',
  },
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
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Recalculate totals if GST toggle changes
  const effectiveGstRate = includeGst ? initialBill.gst_rate : 0;
  const taxableSubtotal = initialBill.taxable_subtotal;
  const gstAmount = includeGst ? Math.round(((taxableSubtotal * effectiveGstRate) / 100) * 100) / 100 : 0;
  const cgstRate = includeGst ? effectiveGstRate / 2 : 0;
  const sgstRate = includeGst ? effectiveGstRate / 2 : 0;
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = gstAmount - cgstAmount;
  const grandTotal = taxableSubtotal + gstAmount;
  const balanceDue = Math.max(0, grandTotal - totalPaid);
  const amountInWords = numberToIndianWords(grandTotal);

  // Handle setting document title for default browser PDF save filename
  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanFilename = initialBill.pdf_filename.replace(/\.pdf$/i, '');
    document.title = cleanFilename;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(initialBill.invoice_number);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ----------------------------------------------------
       * Screen-Only Actions & Controls Bar
       * ---------------------------------------------------- */}
      <div className="print:hidden bg-white border border-border-subtle rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Left: GST Toggle & Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-brand-sand/60 border border-border-subtle rounded-lg px-3 py-2 hover:bg-brand-sand transition-colors min-h-touch">
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
              <span className="text-xs font-semibold text-ink">
                Include {initialBill.gst_rate}% GST (Tax Invoice)
              </span>
            </label>

            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${badge.class}`}>
              {badge.label}
            </span>
          </div>

          {/* Right: Actions (Check Out & Print) */}
          <div className="flex items-center gap-2.5">
            {bookingStatus === 'checked_in' && (
              <button
                type="button"
                disabled={isCheckingOut}
                onClick={handleCheckOut}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-status-red hover:bg-status-red/90 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-60 min-h-touch"
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
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm min-h-touch"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>

        {/* Filename & Invoice Metadata info strip */}
        <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-muted">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-ink font-semibold">PDF Filename:</span>
            <span className="bg-brand-sand px-2 py-0.5 rounded border border-border-subtle text-ink font-medium">
              {initialBill.pdf_filename}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyInvoiceNumber}
            className="inline-flex items-center gap-1.5 hover:text-brand-forest font-medium text-xs transition-colors cursor-pointer text-left sm:text-right"
          >
            {copiedInvoice ? (
              <><Check className="w-3.5 h-3.5 text-status-green" /><span>Copied #{initialBill.invoice_number}</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" /><span>Copy Invoice #{initialBill.invoice_number}</span></>
            )}
          </button>
        </div>
      </div>

      {checkoutError && (
        <div className="print:hidden p-4 bg-action-danger/10 border border-action-danger/30 rounded-xl flex items-start gap-3 text-action-danger text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* ----------------------------------------------------
       * Professional Tax Invoice Document (A4 Print Layout)
       * ---------------------------------------------------- */}
      <div
        id="invoice-print-area"
        className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden text-ink font-sans"
      >
        {/* Invoice Header */}
        <div className="p-6 sm:p-8 bg-brand-sand/40 border-b border-border-subtle">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            {/* Hotel Brand & Official Details */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-forest text-white rounded-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest tracking-tight">
                    {initialBill.hotel_name}
                  </h1>
                  <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wider">
                    Boutique Hospitality & Luxury Stay
                  </p>
                </div>
              </div>

              <p className="text-xs text-ink-muted pt-1 leading-relaxed">
                {initialBill.hotel_address}, {initialBill.hotel_city}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted font-medium">
                <span><strong>Phone:</strong> {initialBill.hotel_phone}</span>
                <span><strong>Email:</strong> {initialBill.hotel_email}</span>
              </div>
              {initialBill.hotel_gst_number && (
                <div className="pt-1 flex items-center gap-3 text-xs font-mono">
                  <span className="bg-brand-forest/10 text-brand-forest px-2 py-0.5 rounded font-semibold">
                    GSTIN: {initialBill.hotel_gst_number}
                  </span>
                  {initialBill.hotel_pan_number && (
                    <span className="text-ink-muted">
                      PAN: {initialBill.hotel_pan_number}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Invoice Title & Meta */}
            <div className="sm:text-right space-y-2 w-full sm:w-auto">
              <div className="inline-block px-3.5 py-1.5 bg-brand-forest text-white text-xs font-bold uppercase tracking-wider rounded-md">
                {includeGst ? 'TAX INVOICE' : 'GUEST FOLIO / BILL'}
              </div>

              <div className="space-y-1 text-xs">
                <p>
                  <span className="text-ink-muted">Invoice No: </span>
                  <span className="font-mono font-bold text-ink text-sm">{initialBill.invoice_number}</span>
                </p>
                <p>
                  <span className="text-ink-muted">Booking No: </span>
                  <span className="font-mono font-semibold text-ink">{initialBill.booking_number}</span>
                </p>
                <p>
                  <span className="text-ink-muted">Invoice Date: </span>
                  <span className="font-medium text-ink">{initialBill.invoice_date}</span>
                </p>
              </div>

              {/* Status Stamp */}
              <div className="pt-1">
                <span className={`inline-block border-2 font-mono text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-widest rounded ${badge.stampClass}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured 2-Column Info Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-border-subtle bg-white text-xs">
          {/* Guest / Billed To */}
          <div className="space-y-2 p-3.5 rounded-lg bg-brand-sand/30 border border-border-subtle/80">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-brand-forest flex items-center gap-1.5">
              <span>Billed To (Guest Details)</span>
            </h2>
            <div className="space-y-1">
              <p className="text-sm font-bold text-ink">{initialBill.guest_name}</p>
              <p className="text-ink-muted"><strong>Contact:</strong> {initialBill.guest_phone}</p>
              {initialBill.guest_email && (
                <p className="text-ink-muted"><strong>Email:</strong> {initialBill.guest_email}</p>
              )}
              {initialBill.guest_address && (
                <p className="text-ink-muted"><strong>Address:</strong> {initialBill.guest_address}</p>
              )}
              {initialBill.guest_id_type && initialBill.guest_id_number && (
                <p className="text-ink-muted font-mono text-[11px]">
                  <strong>ID Proof:</strong> {initialBill.guest_id_type} ({initialBill.guest_id_number})
                </p>
              )}
            </div>
          </div>

          {/* Stay Details */}
          <div className="space-y-2 p-3.5 rounded-lg bg-brand-sand/30 border border-border-subtle/80">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-brand-forest flex items-center gap-1.5">
              <span>Stay & Room Details</span>
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div>
                <p className="text-[11px] text-ink-muted">Room Assigned</p>
                <p className="font-bold text-ink text-sm">Room {initialBill.room_number}</p>
                <p className="text-[11px] text-ink-muted font-medium">{initialBill.category_name}</p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Duration & Guests</p>
                <p className="font-bold text-ink text-sm">{initialBill.nights} Night{initialBill.nights > 1 ? 's' : ''}</p>
                <p className="text-[11px] text-ink-muted">
                  {initialBill.adults} Adult{initialBill.adults > 1 ? 's' : ''}
                  {initialBill.children > 0 ? `, ${initialBill.children} Child` : ''}
                </p>
              </div>
              <div className="pt-1.5 border-t border-border-subtle/60">
                <p className="text-[11px] text-ink-muted">Check-In</p>
                <p className="font-semibold text-ink">{initialBill.check_in_date}</p>
                <p className="text-[10px] text-ink-muted font-mono">from {initialBill.check_in_time}</p>
              </div>
              <div className="pt-1.5 border-t border-border-subtle/60">
                <p className="text-[11px] text-ink-muted">Check-Out</p>
                <p className="font-semibold text-ink">{initialBill.check_out_date}</p>
                <p className="text-[10px] text-ink-muted font-mono">by {initialBill.check_out_time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Charges Table */}
        <div className="p-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-brand-forest text-ink font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-2.5 text-left w-8">#</th>
                <th className="pb-2.5 text-left">Description & Service Period</th>
                <th className="pb-2.5 text-center w-20">SAC</th>
                <th className="pb-2.5 text-center w-16">Nights</th>
                <th className="pb-2.5 text-right w-24">Rate/Night</th>
                <th className="pb-2.5 text-right w-28">Taxable Amt</th>
                {includeGst && <th className="pb-2.5 text-right w-24">GST ({initialBill.gst_rate}%)</th>}
                <th className="pb-2.5 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {initialBill.line_items.map((item, idx) => (
                <tr key={idx} className="hover:bg-brand-sand/20 transition-colors">
                  <td className="py-3 text-ink-muted font-mono">{idx + 1}</td>
                  <td className="py-3 text-ink font-medium">
                    <p className="text-ink font-semibold">{item.description}</p>
                    <p className="text-[11px] text-ink-muted font-mono">
                      Service Period: {initialBill.check_in_date} to {initialBill.check_out_date}
                    </p>
                  </td>
                  <td className="py-3 text-center text-ink-muted font-mono text-[11px]">{item.sac_code || '996311'}</td>
                  <td className="py-3 text-center text-ink font-medium">{item.nights || '—'}</td>
                  <td className="py-3 text-right tabular-nums text-ink-muted">
                    {item.rate ? formatCurrency(item.rate) : '—'}
                  </td>
                  <td className="py-3 text-right tabular-nums font-semibold text-ink">
                    {formatCurrency(item.taxable_amount)}
                  </td>
                  {includeGst && (
                    <td className="py-3 text-right tabular-nums text-ink-muted">
                      {formatCurrency(item.gst_amount)}
                    </td>
                  )}
                  <td className="py-3 text-right tabular-nums font-bold text-brand-forest">
                    {formatCurrency(includeGst ? item.total_amount : item.taxable_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Split Tax Calculation & Financial Summary */}
          <div className="mt-6 pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-12 gap-6 print-keep-together">
            {/* Left: GST Breakdown & Amount in Words */}
            <div className="md:col-span-7 space-y-4">
              {includeGst ? (
                <div className="p-3.5 rounded-lg bg-brand-sand/40 border border-border-subtle text-xs space-y-2">
                  <p className="font-bold text-brand-forest uppercase tracking-wider text-[11px]">
                    GST Tax Breakdown (Intra-State Supply)
                  </p>
                  <div className="space-y-1.5 text-ink-muted">
                    <div className="flex justify-between">
                      <span>Taxable Room & Service Value</span>
                      <span className="tabular-nums font-medium text-ink">{formatCurrency(taxableSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (Central Tax) @ {cgstRate}%</span>
                      <span className="tabular-nums font-medium text-ink">{formatCurrency(cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (State Tax) @ {sgstRate}%</span>
                      <span className="tabular-nums font-medium text-ink">{formatCurrency(sgstAmount)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border-subtle/80 font-bold text-ink">
                      <span>Total GST Calculated ({effectiveGstRate}%)</span>
                      <span className="tabular-nums">{formatCurrency(gstAmount)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-brand-sand/30 border border-border-subtle text-xs text-ink-muted">
                  <p className="font-semibold text-ink">Non-GST Guest Folio</p>
                  <p className="text-[11px] mt-0.5">Commercial invoice issued without input tax credit deduction.</p>
                </div>
              )}

              {/* Amount in Words */}
              <div className="p-3 rounded-lg bg-brand-sand/20 border border-border-subtle/70 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-0.5">
                  Amount in Words
                </span>
                <p className="font-serif font-semibold text-brand-forest italic">
                  {amountInWords}
                </p>
              </div>
            </div>

            {/* Right: Grand Totals & Net Due */}
            <div className="md:col-span-5 space-y-2 text-xs">
              <div className="p-4 rounded-lg bg-brand-sand/30 border border-border-subtle space-y-2">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal (Room + Extras)</span>
                  <span className="tabular-nums font-medium text-ink">{formatCurrency(taxableSubtotal)}</span>
                </div>

                {includeGst && (
                  <div className="flex justify-between text-ink-muted">
                    <span>GST ({effectiveGstRate}%)</span>
                    <span className="tabular-nums font-medium text-ink">{formatCurrency(gstAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2.5 border-t border-brand-forest text-brand-forest font-bold text-base">
                  <span>GRAND TOTAL</span>
                  <span className="tabular-nums text-lg">{formatCurrency(grandTotal)}</span>
                </div>

                <div className="flex justify-between text-ink-muted pt-2 border-t border-border-subtle">
                  <span>Total Payments Received</span>
                  <span className="tabular-nums font-semibold text-status-green">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>

                <div className={`flex justify-between items-center pt-2 border-t font-bold text-sm ${
                  balanceDue > 0 ? 'text-status-amber border-status-amber/40' : 'text-status-green border-status-green/40'
                }`}>
                  <span>{balanceDue > 0 ? 'BALANCE DUE' : 'NET BALANCE DUE'}</span>
                  <span className="tabular-nums text-base">
                    {balanceDue > 0 ? formatCurrency(balanceDue) : '₹0.00 (PAID)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History / Receipts Summary */}
          {initialBill.payments.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border-subtle print-keep-together">
              <h3 className="text-xs font-bold text-brand-forest uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Summary & Receipts</span>
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-ink-muted font-semibold uppercase text-[10px]">
                    <th className="pb-1.5 text-left">Date</th>
                    <th className="pb-1.5 text-left">Transaction Details / Notes</th>
                    <th className="pb-1.5 text-center">Type</th>
                    <th className="pb-1.5 text-center">Mode</th>
                    <th className="pb-1.5 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {initialBill.payments.map((p, pIdx) => (
                    <tr key={p.id || pIdx} className="text-ink">
                      <td className="py-2 text-ink-muted font-mono text-[11px]">
                        {p.created_at ? p.created_at.split('T')[0] : initialBill.invoice_date}
                      </td>
                      <td className="py-2 font-medium">
                        {p.notes || `Payment for booking #${initialBill.booking_number}`}
                      </td>
                      <td className="py-2 text-center capitalize text-ink-muted">
                        {p.payment_type}
                      </td>
                      <td className="py-2 text-center font-mono uppercase text-[11px] text-ink-muted">
                        {p.payment_mode.replace('_', ' ')}
                      </td>
                      <td className="py-2 text-right tabular-nums font-bold text-status-green">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invoice Footer */}
        <div className="p-6 bg-brand-sand/40 border-t border-border-subtle text-xs print-keep-together">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-serif font-bold text-brand-forest text-sm">
                Thank you for staying at {initialBill.hotel_name}!
              </p>
              <p className="text-ink-muted text-[11px]">
                We look forward to welcoming you again. Standard check-out time is {initialBill.check_out_time}.
              </p>
              <p className="text-ink-muted/80 text-[10px] italic">
                This is a computer-generated tax invoice and does not require a physical signature.
              </p>
            </div>

            <div className="text-center sm:text-right pt-2 sm:pt-0">
              <div className="inline-block border-t border-ink-muted/50 pt-1 px-4">
                <p className="text-[11px] font-bold text-ink">Authorized Signatory</p>
                <p className="text-[10px] text-ink-muted">{initialBill.hotel_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
       * Record Payment Form (Hidden in Print)
       * ---------------------------------------------------- */}
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
