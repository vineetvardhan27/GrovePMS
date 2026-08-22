'use client';

import React, { useState } from 'react';
import { BanquetInvoice } from '../../lib/banquet/types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import { Printer, ArrowLeft, Building2, Copy, Check, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import HotelInvoiceHeader from '../shared/HotelInvoiceHeader';

interface BanquetInvoiceViewProps {
  invoice: BanquetInvoice;
}

export default function BanquetInvoiceView({ invoice }: BanquetInvoiceViewProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = invoice.pdf_filename.replace(/\.pdf$/i, '');
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleCopyInvoiceNo = () => {
    navigator.clipboard.writeText(invoice.invoice_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top action toolbar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/banquet/${invoice.booking_id}`} className="pms-btn-secondary gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Invoice No:</span>
            <span className="font-mono text-xs font-bold text-brand-forest">{invoice.invoice_number}</span>
            <button
              type="button"
              onClick={handleCopyInvoiceNo}
              className="pms-btn-icon h-7 w-7 text-xs"
              title="Copy Invoice Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={handlePrint} className="pms-btn-primary gap-2">
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="invoice-print-area"
        className="bg-white rounded-2xl border border-border-subtle shadow-xs p-6 sm:p-10 max-w-4xl mx-auto text-ink print:shadow-none print:border-0 print:p-0"
      >
        {/* Header Branding with Official Hotel Logo */}
        <HotelInvoiceHeader
          hotelName={invoice.hotel_name || 'HOTEL GREENERY VIEW'}
          subtitle="Luxury Hospitality & Banquets"
          address={invoice.hotel_address}
          city={invoice.hotel_city}
          phone={invoice.hotel_phone}
          email={invoice.hotel_email}
          gstNumber={invoice.hotel_gst_number}
          className="border-b-2 border-brand-forest"
          rightContent={
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-brand-forest text-white text-xs font-bold uppercase tracking-wider rounded-md">
                TAX INVOICE — BANQUET
              </span>
              <p className="text-sm font-mono font-bold text-brand-forest mt-2">{invoice.invoice_number}</p>
              <p className="text-xs text-ink-muted">Date: {invoice.invoice_date}</p>
              <p className="text-xs text-ink-muted">Booking Ref: {invoice.booking_number}</p>
              <div className="pt-2">
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

        {/* Billed To & Event Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border-subtle">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted block mb-1">
              Billed To (Client / Host)
            </span>
            <p className="text-sm font-bold text-ink">{invoice.customer_name}</p>
            {invoice.customer_address && <p className="text-xs text-ink-muted mt-0.5">{invoice.customer_address}</p>}
            <p className="text-xs text-ink-muted mt-0.5">Phone: {invoice.customer_phone}</p>
            {invoice.customer_email && <p className="text-xs text-ink-muted">Email: {invoice.customer_email}</p>}
            {invoice.customer_gstin && (
              <p className="text-xs font-mono font-semibold text-brand-forest mt-1">
                Client GSTIN: {invoice.customer_gstin}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted block mb-1">
              Event Particulars
            </span>
            <p className="text-sm font-bold text-brand-forest">{invoice.event_name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Event Date: <span className="font-semibold text-ink">{formatDate(invoice.event_date)}</span> ({invoice.start_time} - {invoice.end_time})
            </p>
            <p className="text-xs text-ink-muted mt-0.5">
              Venue: <span className="font-semibold text-ink">{invoice.hall_name}</span>
            </p>
            {invoice.guest_count && (
              <p className="text-xs text-ink-muted mt-0.5">
                Expected Guests: <span className="font-mono font-semibold text-ink">{invoice.guest_count} pax</span>
              </p>
            )}
          </div>
        </div>

        {/* Itemized Charges Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-brand-sand/50 text-[10px] uppercase font-semibold text-ink-muted tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Description of Service</th>
                <th className="py-2.5 px-2">SAC Code</th>
                <th className="py-2.5 px-2 text-right">Qty</th>
                <th className="py-2.5 px-2 text-right">Rate</th>
                <th className="py-2.5 px-2 text-right">Taxable</th>
                <th className="py-2.5 px-2 text-right">GST %</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {invoice.charges.map((c, idx) => (
                <tr key={c.id || idx}>
                  <td className="py-3 px-3 font-mono text-ink-muted">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-ink">{c.description}</p>
                    {c.notes && <p className="text-[11px] text-ink-muted mt-0.5">{c.notes}</p>}
                  </td>
                  <td className="py-3 px-2 font-mono text-ink-muted">{c.sac_code || '996311'}</td>
                  <td className="py-3 px-2 text-right font-mono">{c.quantity}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatCurrency(c.unit_price)}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatCurrency(c.taxable_amount)}</td>
                  <td className="py-3 px-2 text-right font-mono">{c.tax_rate}%</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-ink">
                    {formatCurrency(c.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Tax Breakdown */}
        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row justify-between gap-6">
          {/* Left: Amount in words & payments */}
          <div className="space-y-4 sm:w-1/2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted block mb-1">
                Amount in Words
              </span>
              <p className="text-xs font-semibold text-brand-forest italic leading-relaxed">
                {invoice.amount_in_words}
              </p>
            </div>

            {/* Payment history summary */}
            {invoice.payments.length > 0 && (
              <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle space-y-1.5">
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
          <div className="sm:w-1/2 space-y-2 text-xs">
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

            <div className="flex justify-between text-xs font-bold pt-1 border-t border-border-subtle">
              <span className={invoice.balance_due > 0 ? 'text-status-amber' : 'text-status-green'}>
                Balance Due:
              </span>
              <span className={`font-mono text-sm ${invoice.balance_due > 0 ? 'text-status-amber' : 'text-status-green'}`}>
                {invoice.balance_due > 0 ? formatCurrency(invoice.balance_due) : 'NIL (FULLY SETTLED)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="pt-10 mt-8 border-t border-border-subtle/80 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-ink-muted">
          <div>
            <p className="font-semibold text-ink">Terms &amp; Conditions:</p>
            <p className="mt-0.5">1. All banquet bookings are subject to property guest conduct policies.</p>
            <p>2. Sound curfew and outdoor music regulations apply at 23:00 hrs.</p>
            <p>3. This is a computer-generated invoice and requires no physical signature for digital audits.</p>
          </div>

          <div className="text-center sm:text-right pt-6 sm:pt-0">
            <div className="w-48 border-b border-ink/40 pb-1 mb-1 mx-auto sm:ml-auto">
              <span className="text-[10px] text-ink-muted">Authorized Signatory</span>
            </div>
            <p className="font-semibold text-brand-forest">{invoice.hotel_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
