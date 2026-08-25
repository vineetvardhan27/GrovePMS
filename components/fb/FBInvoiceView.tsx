'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Printer,
  ArrowLeft,
  Building,
  UserCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Download,
  UtensilsCrossed,
  Plus,
} from 'lucide-react';
import { FBBillRecord } from '../../lib/fb/types';
import { FB_ROUTES } from '../../lib/fb/routes';
import { formatCurrency, numberToIndianWords } from '../../lib/utils/currency';
import HotelInvoiceHeader from '../shared/HotelInvoiceHeader';
import RecordFBPaymentModal from './RecordFBPaymentModal';
import VoidFBBillModal from './VoidFBBillModal';

interface FBInvoiceViewProps {
  bill: FBBillRecord;
  hotelSettings: any;
  userRole: string;
}

export default function FBInvoiceView({ bill, hotelSettings, userRole }: FBInvoiceViewProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);

  const isVoid = bill.bill_status === 'void';
  const isRoom = bill.customer_type === 'room_guest';
  const amountInWords = numberToIndianWords(bill.grand_total);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border-subtle shadow-card">
        <div className="flex items-center gap-3">
          <Link
            href={FB_ROUTES.BILLS}
            className="p-2 rounded-lg border border-border-subtle hover:bg-brand-sand text-ink transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Back to Food & Beverage Bills"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to F&B</span>
          </Link>
          <div>
            <h1 className="text-base font-bold text-ink flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-forest" />
              Invoice #{bill.invoice_number || bill.bill_number}
            </h1>
            <p className="text-xs text-ink-muted">
              {new Date(bill.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bill.balance_due > 0 && !isVoid && bill.billing_mode !== 'charge_to_room' && (
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="px-3 py-1.5 rounded-lg bg-status-green hover:bg-green-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}

          {!isVoid && ['owner', 'manager'].includes(userRole) && (
            <button
              type="button"
              onClick={() => setShowVoidModal(true)}
              className="px-3 py-1.5 rounded-lg border border-action-danger/30 text-action-danger hover:bg-action-danger/10 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Void Bill</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="pms-btn-primary flex items-center gap-1.5 text-xs shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-xl border border-border-subtle p-6 sm:p-8 shadow-card print:border-none print:shadow-none print:p-0 space-y-6 text-xs text-ink">
        {/* Void Stamp Banner if void */}
        {isVoid && (
          <div className="p-3 bg-action-danger/15 border border-action-danger/30 text-action-danger font-bold text-center rounded-lg uppercase tracking-wider text-xs">
            *** THIS BILL HAS BEEN VOIDED / CANCELLED ***
          </div>
        )}

        {/* 1. Shared Official Hotel Invoice Header */}
        <HotelInvoiceHeader
          hotelName={(hotelSettings as any).name || 'HOTEL GREENERY VIEW'}
          logoUrl={hotelSettings.logo_url || null}
          subtitle="Boutique Hospitality & Luxury Stay"
          address={hotelSettings.address}
          city={hotelSettings.city}
          phone={hotelSettings.phone}
          email={hotelSettings.email}
          gstNumber={hotelSettings.gst_number}
          panNumber={hotelSettings.pan_number}
          rightContent={
            <div className="space-y-0.5">
              <span className="inline-block px-2.5 py-0.5 rounded bg-brand-forest/10 text-brand-forest font-bold text-[11px] uppercase tracking-wider">
                TAX INVOICE / RESTAURANT BILL
              </span>
              <div className="font-mono text-sm font-bold text-ink mt-1">
                {bill.invoice_number || bill.bill_number}
              </div>
              <div className="text-ink-muted text-[11px]">
                Date: {bill.invoice_date || bill.created_at.split('T')[0]}
              </div>
            </div>
          }
        />

        {/* 2. Customer & Billed To Details */}
        <div className="grid grid-cols-2 gap-4 bg-brand-sand/30 p-4 rounded-lg border border-border-subtle">
          <div>
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
              Billed To Customer
            </span>
            <div className="font-bold text-sm text-ink">{bill.customer_name}</div>
            {bill.customer_phone && (
              <div className="text-ink-muted text-[11px] mt-0.5">Phone: {bill.customer_phone}</div>
            )}
            {bill.customer_type === 'walk_in' && bill.table_number && (
              <div className="text-ink font-medium text-[11px] mt-0.5">Table Reference: {bill.table_number}</div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
              Stay & Folio Reference
            </span>
            {isRoom ? (
              <div>
                <div className="font-bold text-brand-forest text-sm">
                  Room {bill.room_number_snapshot || '—'}
                </div>
                <div className="text-ink-muted text-[11px] mt-0.5">
                  Booking #{bill.booking_number_snapshot || '—'}
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-status-blue/15 text-status-blue mt-1">
                  {bill.billing_mode === 'charge_to_room' ? 'Posted to Room Folio' : 'Paid at Restaurant'}
                </span>
              </div>
            ) : (
              <div>
                <div className="font-semibold text-status-green text-sm">Direct Restaurant Walk-in</div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-sand text-ink mt-1">
                  POS Direct
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Itemized Food Lines Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-sand/50 border-y border-border-subtle text-[11px] font-bold text-ink-muted uppercase">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Meal / Service</th>
                <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">GST</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {(bill.items || []).map((item, idx) => (
                <tr key={item.id} className="hover:bg-brand-sand/10">
                  <td className="py-2.5 px-3 text-ink-muted">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-ink">
                    {item.item_name_snapshot}
                    {item.notes && <span className="text-[10px] text-ink-muted block font-normal">Note: {item.notes}</span>}
                  </td>
                  <td className="py-2.5 px-3 text-ink-muted">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-sand font-medium">
                      {item.meal_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-ink-muted font-mono text-[11px]">996331</td>
                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(item.unit_price_snapshot)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(item.taxable_amount)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-ink-muted">{formatCurrency(item.gst_amount)}</td>
                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">{formatCurrency(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Financial Calculations & Tax Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
          {/* Left: In words & Payment history */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-ink-muted tracking-wider block">
                Amount in Words
              </span>
              <p className="font-semibold text-ink italic mt-0.5 leading-snug">
                {amountInWords}
              </p>
            </div>

            {/* Payment Receipts Table */}
            {(bill.payments || []).length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase text-ink-muted tracking-wider block mb-1">
                  Payment Receipts
                </span>
                <div className="space-y-1 bg-brand-sand/20 p-2.5 rounded-lg border border-border-subtle">
                  {bill.payments?.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-[11px]">
                      <span className="capitalize font-medium text-ink">
                        {p.payment_mode} ({p.payment_type})
                        {p.reference_number && ` • Ref: ${p.reference_number}`}
                      </span>
                      <span className="font-bold tabular-nums text-status-green">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Authoritative Financial Totals */}
          <div className="space-y-2 bg-brand-sand/30 p-4 rounded-lg border border-border-subtle">
            <div className="flex items-center justify-between text-ink-muted">
              <span>Subtotal (Gross)</span>
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(bill.subtotal)}</span>
            </div>

            {bill.discount_amount > 0 && (
              <div className="flex items-center justify-between text-action-danger font-medium">
                <span>Discount ({bill.discount_type === 'percentage' ? `${bill.discount_value}%` : 'Fixed'})</span>
                <span className="tabular-nums">- {formatCurrency(bill.discount_amount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-ink-muted">
              <span>Taxable Subtotal</span>
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(bill.taxable_amount)}</span>
            </div>

            <div className="flex items-center justify-between text-ink-muted">
              <span>CGST (2.5% / 6%)</span>
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(bill.cgst_amount)}</span>
            </div>

            <div className="flex items-center justify-between text-ink-muted">
              <span>SGST (2.5% / 6%)</span>
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(bill.sgst_amount)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-ink pt-2 border-t border-border-subtle">
              <span>Grand Total</span>
              <span className="text-base font-bold text-brand-forest tabular-nums">
                {formatCurrency(bill.grand_total)}
              </span>
            </div>

            <div className="flex items-center justify-between text-ink-muted pt-1 border-t border-border-subtle/50">
              <span>Total Paid</span>
              <span className="font-bold text-status-green tabular-nums">{formatCurrency(bill.total_paid)}</span>
            </div>

            {bill.balance_due > 0 && bill.billing_mode !== 'charge_to_room' && (
              <div className="flex items-center justify-between font-bold text-status-amber">
                <span>Balance Due</span>
                <span className="tabular-nums">{formatCurrency(bill.balance_due)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Footer & Terms */}
        <div className="pt-6 border-t border-border-subtle text-[10px] text-ink-muted flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-medium text-ink">Thank you for dining with Hotel Greenery View!</p>
            <p className="mt-0.5">Computer-generated tax invoice. No signature required.</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-ink">Authorized Signatory</p>
            <div className="h-8" />
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <RecordFBPaymentModal
          bill={bill}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Void Modal */}
      {showVoidModal && (
        <VoidFBBillModal
          bill={bill}
          onClose={() => setShowVoidModal(false)}
        />
      )}
    </div>
  );
}
