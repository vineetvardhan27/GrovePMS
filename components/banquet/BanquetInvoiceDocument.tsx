'use client';

import React from 'react';
import { BanquetInvoice } from '../../lib/banquet/types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import HotelInvoiceHeader from '../shared/HotelInvoiceHeader';

interface BanquetInvoiceDocumentProps {
  invoice: BanquetInvoice;
  className?: string;
}

/**
 * Dedicated, Standalone Banquet Hall Tax Invoice Document
 * Renders the authoritative, professional A4 print layout for banquet bills.
 * Free of dashboard UI, navigation, sidebars, buttons, or management cards.
 */
export default function BanquetInvoiceDocument({
  invoice,
  className = '',
}: BanquetInvoiceDocumentProps) {
  return (
    <div
      id="banquet-tax-invoice"
      className={`bg-white text-ink w-full max-w-4xl mx-auto ${className}`}
    >
      {/* ── 1. Header Branding with Official Hotel Logo & Invoice Metadata ── */}
      <HotelInvoiceHeader
        hotelName={invoice.hotel_name || 'HOTEL GREENERY VIEW'}
        logoUrl={invoice.hotel_logo_url || (invoice as any).logo_url || null}
        subtitle="Luxury Hospitality & Banquets"
        address={invoice.hotel_address}
        city={invoice.hotel_city}
        phone={invoice.hotel_phone}
        email={invoice.hotel_email}
        gstNumber={invoice.hotel_gst_number}
        panNumber={invoice.hotel_pan_number}
        className="border-b-2 border-brand-forest pb-5 print:pb-4"
        rightContent={
          <div className="space-y-1 sm:text-right">
            <span className="inline-block px-3 py-1 bg-brand-forest text-white text-xs font-bold uppercase tracking-wider rounded-md print:bg-brand-forest print:text-white">
              TAX INVOICE — BANQUET
            </span>
            <p className="text-sm font-mono font-bold text-brand-forest mt-2">
              {invoice.invoice_number}
            </p>
            <p className="text-xs text-ink-muted">
              Date: <strong className="text-ink font-semibold">{invoice.invoice_date}</strong>
            </p>
            <p className="text-xs text-ink-muted">
              Booking Ref: <strong className="font-mono text-ink font-semibold">{invoice.booking_number}</strong>
            </p>
            <div className="pt-1.5">
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                  invoice.payment_status === 'paid'
                    ? 'bg-status-green/10 text-status-green border border-status-green/30'
                    : 'bg-status-amber/10 text-status-amber border border-status-amber/30'
                }`}
              >
                {invoice.payment_status === 'paid' ? 'PAID IN FULL' : 'PARTIALLY PAID'}
              </span>
            </div>
          </div>
        }
      />

      {/* ── 2. Billed To & Event Particulars ── */}
      <div className="grid grid-cols-2 gap-6 py-5 border-b border-border-subtle print:py-4 print-avoid-break">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">
            Billed To (Client / Host)
          </span>
          <p className="text-sm font-bold text-ink">{invoice.customer_name}</p>
          {invoice.customer_address && (
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{invoice.customer_address}</p>
          )}
          <p className="text-xs text-ink-muted mt-0.5">
            <strong>Phone:</strong> {invoice.customer_phone}
          </p>
          {invoice.customer_email && (
            <p className="text-xs text-ink-muted">
              <strong>Email:</strong> {invoice.customer_email}
            </p>
          )}
          {invoice.customer_gstin && (
            <p className="text-xs font-mono font-semibold text-brand-forest mt-1">
              Client GSTIN: {invoice.customer_gstin}
            </p>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">
            Event Particulars
          </span>
          <p className="text-sm font-bold text-brand-forest">{invoice.event_name}</p>
          <p className="text-xs text-ink-muted mt-0.5">
            Event Date: <span className="font-semibold text-ink">{formatDate(invoice.event_date)}</span> ({invoice.start_time} – {invoice.end_time})
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            Venue: <span className="font-semibold text-ink">{invoice.hall_name}</span>
          </p>
          {invoice.guest_count && (
            <p className="text-xs text-ink-muted mt-0.5">
              Expected Guests: <span className="font-mono font-semibold text-ink">{invoice.guest_count} pax</span>
            </p>
          )}
          <p className="text-xs text-ink-muted mt-0.5 capitalize">
            Event Category: <span className="font-medium text-ink">{invoice.event_type}</span>
          </p>
        </div>
      </div>

      {/* ── 3. Itemized Charges Table ── */}
      <div className="py-5 print:py-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-forest/40 bg-brand-sand/50 text-[10px] uppercase font-semibold text-ink tracking-wider print:bg-gray-100">
              <th className="py-2.5 px-3 w-10">#</th>
              <th className="py-2.5 px-3">Description of Service</th>
              <th className="py-2.5 px-2 w-20">SAC Code</th>
              <th className="py-2.5 px-2 text-right w-14">Qty</th>
              <th className="py-2.5 px-2 text-right w-20">Rate (₹)</th>
              <th className="py-2.5 px-2 text-right w-24">Taxable (₹)</th>
              <th className="py-2.5 px-2 text-right w-16">GST %</th>
              <th className="py-2.5 px-3 text-right w-28">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/70">
            {invoice.charges.map((c, idx) => (
              <tr key={c.id || idx} className="print-avoid-break">
                <td className="py-3 px-3 font-mono text-ink-muted align-top">{idx + 1}</td>
                <td className="py-3 px-3 align-top">
                  <p className="font-semibold text-ink">{c.description}</p>
                  {c.notes && <p className="text-[11px] text-ink-muted mt-0.5">{c.notes}</p>}
                </td>
                <td className="py-3 px-2 font-mono text-ink-muted align-top">{c.sac_code || '996311'}</td>
                <td className="py-3 px-2 text-right font-mono align-top">{c.quantity}</td>
                <td className="py-3 px-2 text-right font-mono align-top">{formatCurrency(c.unit_price)}</td>
                <td className="py-3 px-2 text-right font-mono align-top">{formatCurrency(c.taxable_amount)}</td>
                <td className="py-3 px-2 text-right font-mono align-top">{c.tax_rate}%</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-ink align-top">
                  {formatCurrency(c.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 4. Financial Summary & Tax Breakdown ── */}
      <div className="pt-4 border-t-2 border-border-subtle flex flex-col sm:flex-row justify-between gap-6 print:flex-row print-avoid-break">
        {/* Left: Amount in words & payments applied */}
        <div className="space-y-4 sm:w-1/2 print:w-1/2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">
              Amount in Words
            </span>
            <p className="text-xs font-semibold text-brand-forest italic leading-relaxed">
              {invoice.amount_in_words}
            </p>
          </div>

          {/* Payment history summary */}
          {invoice.payments.length > 0 && (
            <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle space-y-1.5 print:bg-gray-50">
              <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">
                Payments Applied
              </span>
              {invoice.payments.map((p, i) => (
                <div key={p.id || i} className="flex justify-between text-xs text-ink-muted">
                  <span>
                    {formatDate(p.created_at)} ({p.payment_mode.toUpperCase()})
                    {p.reference_number ? ` - ${p.reference_number}` : ''}:
                  </span>
                  <span className="font-mono font-semibold text-status-green">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Arithmetic Breakdown */}
        <div className="sm:w-1/2 print:w-1/2 space-y-2 text-xs">
          <div className="flex justify-between text-ink-muted">
            <span>Subtotal (Taxable Value):</span>
            <span className="font-mono font-semibold text-ink">{formatCurrency(invoice.taxable_subtotal)}</span>
          </div>

          {invoice.total_tax > 0 && (
            <>
              <div className="flex justify-between text-ink-muted">
                <span>CGST ({invoice.cgst_rate}%):</span>
                <span className="font-mono text-ink">{formatCurrency(invoice.cgst_amount)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>SGST ({invoice.sgst_rate}%):</span>
                <span className="font-mono text-ink">{formatCurrency(invoice.sgst_amount)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between text-sm font-bold text-brand-forest pt-2 border-t border-border-subtle">
            <span>Grand Total:</span>
            <span className="font-mono text-base tabular-nums">{formatCurrency(invoice.grand_total)}</span>
          </div>

          <div className="flex justify-between text-xs text-status-green font-semibold">
            <span>Total Paid:</span>
            <span className="font-mono">{formatCurrency(invoice.total_paid)}</span>
          </div>

          <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-border-subtle">
            <span className={invoice.balance_due > 0 ? 'text-status-amber' : 'text-status-green'}>
              Balance Due:
            </span>
            <span className={`font-mono text-sm ${invoice.balance_due > 0 ? 'text-status-amber' : 'text-status-green'}`}>
              {invoice.balance_due > 0 ? formatCurrency(invoice.balance_due) : 'NIL (FULLY SETTLED)'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. Terms & Signature Footer ── */}
      <div className="pt-8 mt-6 border-t border-border-subtle/80 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-ink-muted print:flex-row print:pt-6 print:mt-4 print-avoid-break">
        <div className="space-y-0.5">
          <p className="font-semibold text-ink">Terms &amp; Conditions:</p>
          <p>1. All banquet bookings are subject to property guest conduct policies.</p>
          <p>2. Sound curfew and outdoor music regulations apply at 23:00 hrs.</p>
          <p>3. This is a computer-generated tax invoice and requires no physical signature for digital audits.</p>
        </div>

        <div className="text-center sm:text-right pt-4 sm:pt-0 print:text-right">
          <div className="w-48 border-b border-ink/40 pb-1 mb-1 mx-auto sm:ml-auto print:ml-auto">
            <span className="text-[10px] text-ink-muted">Authorized Signatory</span>
          </div>
          <p className="font-semibold text-brand-forest">{invoice.hotel_name || 'Hotel Greenery View'}</p>
        </div>
      </div>
    </div>
  );
}
