'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { PaymentTransactionRecord, BillingCustomerRecord } from './types';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransactionRecord | null;
  customer: BillingCustomerRecord | null;
  hotelName: string;
}

export default function InvoiceReceiptModal({
  isOpen,
  onClose,
  transaction,
  customer,
  hotelName,
}: InvoiceReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const amountTotal = transaction.amount / 100;
  // Compute GST breakdown: base = total / 1.18, gst = total - base
  const baseAmount = Math.round((amountTotal / 1.18) * 100) / 100;
  const gstAmount = Math.round((amountTotal - baseAmount) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn print:p-0 print:bg-white">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-[#1C2D29]/15 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 animate-scaleUp print:border-none print:shadow-none print:p-0">
        {/* Top Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1C2D29]/10 print:hidden">
          <span className="text-xs font-semibold text-brand-forest uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Official Payment Receipt
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-sand/60 hover:bg-brand-sand text-ink transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-brand-sand/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT BODY */}
        <div id="receipt-print-area" className="space-y-6">
          {/* Header Brand */}
          <div className="flex items-start justify-between">
            <div>
              <span className="font-serif font-bold text-2xl text-[#142320] tracking-tight block">
                Grove PMS
              </span>
              <span className="text-[11px] text-ink-muted">
                Hospitality Operating System &amp; Cloud PMS
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                Receipt Code
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-[#142320]">
                {transaction.invoice_reference || `INV-${transaction.id.slice(0, 8).toUpperCase()}`}
              </span>
            </div>
          </div>

          {/* Billed To / Property Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-brand-sand/30 border border-[#1C2D29]/8 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-ink-muted block tracking-wider">
                Billed To (Tenant)
              </span>
              <strong className="text-sm font-semibold text-[#142320] block mt-0.5">
                {customer?.customer_name || hotelName}
              </strong>
              <span className="text-ink-muted block mt-0.5">{customer?.email || '—'}</span>
              {customer?.billing_address && (
                <span className="text-ink-muted block mt-0.5">{customer.billing_address}</span>
              )}
              {customer?.gstin && (
                <span className="font-mono text-[11px] text-brand-forest font-semibold block mt-1">
                  GSTIN: {customer.gstin}
                </span>
              )}
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-muted block tracking-wider">
                  Payment Date
                </span>
                <span className="font-medium text-[#142320]">
                  {formatDate(transaction.created_at)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-muted block tracking-wider">
                  Gateway Transaction ID
                </span>
                <span className="font-mono text-[11px] text-[#142320]">
                  {transaction.razorpay_payment_id || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Charge Line */}
          <div className="space-y-3">
            <div className="border-b border-[#1C2D29]/10 pb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <span>Description</span>
              <span>Amount (INR)</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <div>
                <strong className="font-semibold text-[#142320] block">
                  Grove PMS — Monthly Cloud Subscription
                </strong>
                <span className="text-[11px] text-ink-muted">
                  Recurring hotel property license with 24/7 cloud sync
                </span>
              </div>
              <span className="font-mono font-medium text-[#142320]">₹{baseAmount.toFixed(2)}</span>
            </div>

            {/* Tax Subtotal */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-[#1C2D29]/6 text-ink-muted">
              <span>Integrated GST (IGST @ 18%)</span>
              <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between text-sm py-2 border-t border-[#1C2D29]/12 font-bold text-[#142320]">
              <span>Total Paid</span>
              <span className="font-serif text-base text-brand-forest">₹{amountTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Verification Stamp Footer */}
          <div className="pt-3 border-t border-[#1C2D29]/10 flex items-center justify-between text-[11px] text-ink-muted">
            <div className="flex items-center gap-1.5 text-status-green font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paid &amp; Captured via Razorpay</span>
            </div>

            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-forest" />
              <span>Official Tax Invoicing Reference</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

