'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  CreditCard,
  Building2,
  Phone,
  User,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  FileText,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { UnifiedPaymentTransaction } from '../../lib/payments/types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDateTime } from '../../lib/utils/dates';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: UnifiedPaymentTransaction | null;
}

const MODE_ICONS: Record<string, any> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
  bank_transfer: Building2,
  other: MoreHorizontal,
};

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const ModeIcon = MODE_ICONS[transaction.payment_mode] || CreditCard;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="txn-modal-title"
    >
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-brand-sand/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center shadow-2xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                Transaction Details
              </span>
              <h2 id="txn-modal-title" className="text-base font-serif font-bold text-brand-forest">
                {transaction.reference_number}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Main Amount Card */}
          <div className="p-4 rounded-xl bg-status-green/10 border border-status-green/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-status-green block">
                Amount Collected
              </span>
              <p className="text-2xl font-bold font-sans tabular-nums text-status-green mt-0.5">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-status-green/20 text-status-green border border-status-green/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{transaction.status}</span>
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block mb-1">
                Source
              </span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  transaction.source === 'banquet'
                    ? 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                    : transaction.source === 'food_beverage'
                    ? 'bg-status-blue/15 text-status-blue border border-status-blue/30'
                    : 'bg-brand-forest/10 text-brand-forest border border-brand-forest/20'
                }`}
              >
                {transaction.source_label}
              </span>
              <p className="font-semibold text-ink mt-1.5">{transaction.resource_name}</p>
            </div>

            <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block mb-1">
                Payment Method &amp; Type
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-ink capitalize">
                <ModeIcon className="w-3.5 h-3.5 text-brand-forest" />
                <span>{transaction.payment_mode.replace('_', ' ')}</span>
              </div>
              <p className="text-[11px] text-ink-muted capitalize mt-1.5">
                Type: <strong className="text-ink">{transaction.payment_type}</strong>
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-4 bg-white rounded-xl border border-border-subtle space-y-2">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
              Customer / Host Details
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">{transaction.customer_name}</p>
                {transaction.customer_phone && (
                  <p className="font-mono text-ink-muted flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {transaction.customer_phone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-ink-muted">{transaction.event_or_details}</p>
              </div>
            </div>
          </div>

          {/* Audit & Transaction Identifiers */}
          <div className="p-4 bg-white rounded-xl border border-border-subtle space-y-2">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
              Audit &amp; System Record
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-ink-muted block">Transaction Timestamp:</span>
                <span className="font-mono font-medium text-ink">
                  {formatDateTime(transaction.created_at)}
                </span>
              </div>
              <div>
                <span className="text-ink-muted block">Recorded By:</span>
                <span className="font-semibold text-ink">{transaction.recorded_by || 'Staff'}</span>
              </div>
              {transaction.transaction_reference && (
                <div className="col-span-2 pt-1 border-t border-border-subtle">
                  <span className="text-ink-muted block">UTR / Bank Reference:</span>
                  <span className="font-mono font-bold text-brand-forest">
                    {transaction.transaction_reference}
                  </span>
                </div>
              )}
              {transaction.notes && (
                <div className="col-span-2 pt-1 border-t border-border-subtle">
                  <span className="text-ink-muted block">Audit Notes:</span>
                  <p className="text-ink leading-relaxed mt-0.5">{transaction.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-brand-sand/50 border-t border-border-subtle flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="pms-btn-secondary h-9 px-4 text-xs font-medium"
          >
            Close
          </button>

          {transaction.link_url && (
            <Link
              href={transaction.link_url}
              className="pms-btn-primary h-9 px-4 text-xs gap-1.5"
            >
              <span>Open Folio Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
