'use client';

import React from 'react';
import {
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
} from 'lucide-react';
import { PaymentTransactionRecord } from './types';

interface PaymentHistoryTableProps {
  transactions: PaymentTransactionRecord[];
  isLoading?: boolean;
  onSelectReceipt: (tx: PaymentTransactionRecord) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
}

export default function PaymentHistoryTable({
  transactions,
  isLoading,
  onSelectReceipt,
  page = 1,
  totalPages = 1,
  onPageChange,
}: PaymentHistoryTableProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatCurrency = (paise?: number | null) => {
    if (typeof paise !== 'number') return '₹0.00';
    return `₹${(paise / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'captured':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-green/10 border border-status-green/20 text-status-green">
            <CheckCircle2 className="w-3 h-3" />
            <span>Captured</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-red/10 border border-status-red/20 text-status-red">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-forest/10 border border-brand-forest/20 text-brand-forest">
            <RotateCcw className="w-3 h-3" />
            <span>Refunded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-amber/10 border border-status-amber/20 text-status-amber">
            <Clock className="w-3 h-3" />
            <span className="capitalize">{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-[#1C2D29]/12 shadow-[0_4px_20px_rgba(20,28,26,0.03)] overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-[#1C2D29]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#142320]">
            Payment &amp; Invoicing History
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Audit history of recurring subscription charges, tax invoices, and payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Total Records:</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-sand/60 border border-[#1C2D29]/10 font-bold text-[#142320]">
            {transactions.length}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        {transactions.length === 0 ? (
          <div className="p-10 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-sand/50 text-brand-forest flex items-center justify-center mx-auto border border-[#1C2D29]/10">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#142320]">
              No Payment Transactions Yet
            </h4>
            <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
              When your monthly subscription cycle is billed or renewed, automated tax receipts and transaction IDs will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-sand/25 border-b border-[#1C2D29]/8 text-ink-muted uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-5 sm:px-6">Payment Date</th>
                <th className="py-3 px-4">Transaction / Invoice ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 sm:px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2D29]/6">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-brand-sand/15 transition-colors duration-150 group"
                >
                  {/* 1. Date */}
                  <td className="py-3.5 px-5 sm:px-6 font-medium text-[#142320]">
                    {formatDate(tx.created_at)}
                  </td>

                  {/* 2. Transaction / Invoice ID */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#142320]">
                    <div>
                      <span>{tx.razorpay_payment_id || '—'}</span>
                      {tx.invoice_reference && (
                        <span className="block text-[10px] text-ink-muted font-sans mt-0.5">
                          Ref: {tx.invoice_reference}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. Method */}
                  <td className="py-3.5 px-4 text-ink-muted capitalize">
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-brand-forest/70" />
                      <span>{tx.payment_method?.replace('_', ' ') || 'Mandate'}</span>
                    </span>
                  </td>

                  {/* 4. Amount */}
                  <td className="py-3.5 px-4 font-bold font-serif text-[#142320] text-sm">
                    {formatCurrency(tx.amount)}
                  </td>

                  {/* 5. Status Badge */}
                  <td className="py-3.5 px-4">{getStatusBadge(tx.status)}</td>

                  {/* 6. Invoice / Receipt Action */}
                  <td className="py-3.5 px-5 sm:px-6 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectReceipt(tx)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-forest hover:bg-brand-forest hover:text-white border border-brand-forest/25 transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="p-4 border-t border-[#1C2D29]/8 flex items-center justify-between text-xs text-ink-muted bg-white/40">
          <span>
            Page <strong className="text-[#142320]">{page}</strong> of{' '}
            <strong className="text-[#142320]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-[#1C2D29]/15 hover:bg-white text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-[#1C2D29]/15 hover:bg-white text-ink disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

