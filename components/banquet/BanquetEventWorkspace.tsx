'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BanquetBooking,
  BanquetHall,
  BanquetCharge,
  BanquetPayment,
  BanquetFolio,
  BanquetInvoice,
} from '../../lib/banquet/types';
import { BanquetBookingStatus, StaffRole } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import {
  updateBanquetBookingStatusAction,
  deleteBanquetChargeAction,
} from '../../lib/banquet/actions';
import AddBanquetChargeModal from './AddBanquetChargeModal';
import RecordBanquetPaymentModal from './RecordBanquetPaymentModal';
import BanquetInvoiceView from './BanquetInvoiceView';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Plus,
  Trash2,
  Printer,
  ArrowLeft,
  Building2,
  Utensils,
  Sparkles,
  CheckCircle,
  Play,
  XCircle,
  AlertCircle,
  Loader2,
  Receipt,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface BanquetEventWorkspaceProps {
  folio: BanquetFolio;
  invoice: BanquetInvoice;
  userRole?: StaffRole;
}

export default function BanquetEventWorkspace({
  folio,
  invoice,
  userRole,
}: BanquetEventWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'folio' | 'payments' | 'invoice'>('folio');
  const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [deletingChargeId, setDeletingChargeId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { booking, hall, charges, payments } = folio;
  const isHousekeeping = userRole === 'housekeeping';

  const handleStatusChange = async (newStatus: BanquetBookingStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateBanquetBookingStatusAction({
        booking_id: booking.id,
        booking_status: newStatus,
      });
      router.refresh();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteCharge = async (chargeId: string) => {
    if (!confirm('Are you sure you want to remove this charge from the folio?')) return;
    setDeletingChargeId(chargeId);
    try {
      await deleteBanquetChargeAction(chargeId, booking.id);
      router.refresh();
    } catch (err) {
      console.error('Failed to delete charge:', err);
    } finally {
      setDeletingChargeId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumbs & Status Transitions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-xs">
          <Link href="/banquet" className="pms-btn-secondary h-8 px-3 text-xs gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Banquet Dashboard</span>
          </Link>
          <span className="text-ink-muted">/</span>
          <span className="font-mono font-bold text-brand-forest">
            {booking.booking_number}
          </span>
        </div>

        {/* Status Transition Action Buttons */}
        {!isHousekeeping && (
          <div className="flex items-center gap-2 flex-wrap">
            {booking.booking_status === 'confirmed' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('in_progress')}
                className="pms-btn-primary text-xs gap-1.5 h-8"
              >
                {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Start Event</span>
              </button>
            )}
            {booking.booking_status === 'in_progress' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('completed')}
                className="pms-btn-primary text-xs gap-1.5 h-8 bg-status-green hover:bg-status-green/90"
              >
                {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>Complete Event</span>
              </button>
            )}
            {booking.booking_status !== 'completed' && booking.booking_status !== 'cancelled' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => {
                  if (confirm('Cancel this banquet booking?')) handleStatusChange('cancelled');
                }}
                className="pms-btn-danger-outline text-xs gap-1 h-8"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Main Event Workspace Card ── */}
      <div className="pms-card p-5 sm:p-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Event Details */}
          <div className="space-y-3 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-forest/10 text-brand-forest border border-brand-forest/20">
                {booking.event_type}
              </span>
              <StatusBadge variant={booking.booking_status as any} />
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  folio.payment_status === 'paid'
                    ? 'bg-status-green/10 text-status-green border border-status-green/30'
                    : folio.payment_status === 'partially_paid'
                    ? 'bg-status-amber/10 text-status-amber border border-status-amber/30'
                    : 'bg-status-red/10 text-status-red border border-status-red/30'
                }`}
              >
                {folio.payment_status === 'paid'
                  ? 'Paid in Full'
                  : folio.payment_status === 'partially_paid'
                  ? 'Partially Paid'
                  : 'Unpaid'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest leading-tight">
              {booking.event_name}
            </h1>

            {/* Event Specs */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-ink-muted">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-brand-forest shrink-0" />
                <span className="text-ink font-semibold">{formatDate(booking.event_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-brand-forest shrink-0" />
                <span className="font-mono text-ink font-semibold">{booking.start_time} – {booking.end_time}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-brand-forest shrink-0" />
                <span className="text-ink font-medium">{hall.name}</span>
              </div>
              {booking.guest_count && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-brand-forest shrink-0" />
                  <span className="font-mono text-ink font-semibold">{booking.guest_count} Guests</span>
                </div>
              )}
            </div>

            {/* Host info */}
            <div className="pt-3.5 border-t border-border-subtle/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">Host / Client</span>
                <p className="font-semibold text-ink mt-0.5">{booking.customer_name}</p>
                {booking.customer_address && (
                  <p className="text-[11px] text-ink-muted truncate mt-0.5">{booking.customer_address}</p>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">Contact</span>
                <p className="font-mono font-medium text-ink mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-ink-muted" />
                  {booking.customer_phone}
                </p>
                {booking.customer_email && (
                  <p className="text-[11px] text-ink-muted truncate mt-0.5">{booking.customer_email}</p>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">GSTIN / Invoice Ref</span>
                <p className="font-mono font-medium text-ink mt-0.5">
                  {booking.customer_gstin ? `GST: ${booking.customer_gstin}` : 'Non-GST / Retail'}
                </p>
                <p className="text-[11px] text-ink-muted font-mono mt-0.5">{booking.invoice_number || 'Inv: Pending'}</p>
              </div>
            </div>
          </div>

          {/* Right: Quick Folio Action CTAs */}
          {!isHousekeeping && (
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-stretch lg:self-start lg:w-44">
              <button
                type="button"
                onClick={() => setIsAddChargeOpen(true)}
                className="pms-btn-primary w-full justify-center text-xs gap-1.5 h-9"
              >
                <Plus className="w-4 h-4" />
                <span>Add Charge</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRecordPaymentOpen(true)}
                className="pms-btn-secondary w-full justify-center text-xs gap-1.5 h-9"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('invoice')}
                className="pms-btn-secondary w-full justify-center text-xs gap-1.5 h-9"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Special Setup Remarks (if configured) */}
      {(booking.catering_notes || booking.remarks) && (
        <div className="p-4 bg-brand-sand/60 rounded-xl border border-border-subtle text-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Requirements &amp; Special Setup Instructions</span>
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-ink">
            {booking.catering_required && (
              <div className="bg-white p-3 rounded-lg border border-border-subtle">
                <span className="font-semibold text-brand-forest block mb-0.5 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-brand-forest" />
                  Catering &amp; Food Preferences:
                </span>
                <p className="text-ink-muted leading-relaxed">{booking.catering_notes || 'Buffet catering service required'}</p>
              </div>
            )}
            {booking.remarks && (
              <div className="bg-white p-3 rounded-lg border border-border-subtle">
                <span className="font-semibold text-brand-forest block mb-0.5">Stage &amp; AV Instructions:</span>
                <p className="text-ink-muted leading-relaxed">{booking.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Financial Summary KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="pms-card p-4 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            Total Event Folio
          </p>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(folio.grand_total)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            Taxable: {formatCurrency(folio.taxable_amount)} + Tax: {formatCurrency(folio.tax_amount)}
          </p>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            Total Paid / Advance
          </p>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-green truncate">
            {formatCurrency(folio.total_paid)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">{payments.length} payments recorded</p>
        </div>

        <div
          className={`pms-card p-4 flex flex-col justify-between transition-colors ${
            folio.balance_due > 0
              ? 'border-l-4 border-l-status-amber bg-status-amber/5'
              : 'border-l-4 border-l-status-green bg-status-green/5'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            Outstanding Balance
          </p>
          <p
            className={`text-xl sm:text-2xl font-bold font-sans tabular-nums truncate ${
              folio.balance_due > 0 ? 'text-status-amber' : 'text-status-green'
            }`}
          >
            {folio.balance_due > 0 ? formatCurrency(folio.balance_due) : '₹0.00 (PAID)'}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {folio.balance_due > 0 ? 'Due upon event conclusion' : 'Folio settled in full'}
          </p>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            Settlement Status
          </p>
          <div className="mt-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                folio.payment_status === 'paid'
                  ? 'bg-status-green/15 text-status-green border border-status-green/30'
                  : folio.payment_status === 'partially_paid'
                  ? 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                  : 'bg-status-red/15 text-status-red border border-status-red/30'
              }`}
            >
              {folio.payment_status === 'paid'
                ? 'PAID IN FULL'
                : folio.payment_status === 'partially_paid'
                ? 'PARTIALLY PAID'
                : 'UNPAID'}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1.5">
            Tax Treatment: <strong className="uppercase">{booking.tax_treatment}</strong>
          </p>
        </div>
      </div>

      {/* ── Workspace Tabs Bar ── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-1 sm:gap-2 pb-1 border-b border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab('folio')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'folio'
                ? 'bg-brand-forest text-white shadow-2xs'
                : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Folio &amp; Itemized Charges</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'folio' ? 'bg-white/20 text-white' : 'bg-brand-sand-dark text-ink-muted'
              }`}
            >
              {charges.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-brand-forest text-white shadow-2xs'
                : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment History</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-brand-sand-dark text-ink-muted'
              }`}
            >
              {payments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'invoice'
                ? 'bg-brand-forest text-white shadow-2xs'
                : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Printable Tax Invoice</span>
          </button>
        </div>

        {/* TAB 1: Folio & Itemized Charges */}
        {activeTab === 'folio' && (
          <div className="space-y-3.5">
            <div className="pms-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="pms-table">
                  <thead className="pms-table-header">
                    <tr>
                      <th className="pms-table-th">Service / Category</th>
                      <th className="pms-table-th">Description</th>
                      <th className="pms-table-th">SAC</th>
                      <th className="pms-table-th text-right">Qty</th>
                      <th className="pms-table-th text-right">Rate</th>
                      <th className="pms-table-th text-right">Taxable</th>
                      <th className="pms-table-th text-right">Tax (GST)</th>
                      <th className="pms-table-th text-right">Total Amount</th>
                      {!isHousekeeping && <th className="pms-table-th-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {charges.length === 0 ? (
                      <tr>
                        <td colSpan={isHousekeeping ? 8 : 9}>
                          <EmptyState
                            icon={Receipt}
                            title="No charges added yet"
                            description="Add hall rental, catering, decoration, or audio-visual charges to this folio."
                            action={
                              !isHousekeeping
                                ? { label: 'Add First Charge', onClick: () => setIsAddChargeOpen(true), icon: Plus }
                                : undefined
                            }
                            compact
                          />
                        </td>
                      </tr>
                    ) : (
                      charges.map((c) => (
                        <tr key={c.id} className="pms-table-row">
                          <td className="pms-table-td">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-sand text-brand-forest border border-border-subtle">
                              {c.category.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="pms-table-td font-medium text-ink">
                            <p className="text-xs">{c.description}</p>
                            {c.notes && <p className="text-[11px] text-ink-muted mt-0.5">{c.notes}</p>}
                          </td>
                          <td className="pms-table-td font-mono text-ink-muted text-xs">{c.sac_code || '996311'}</td>
                          <td className="pms-table-td font-mono font-medium text-right text-xs">{c.quantity}</td>
                          <td className="pms-table-td font-mono text-right text-xs">{formatCurrency(c.unit_price)}</td>
                          <td className="pms-table-td font-mono font-semibold text-right text-xs">
                            {formatCurrency(c.taxable_amount)}
                          </td>
                          <td className="pms-table-td font-mono text-ink-muted text-right text-xs">
                            {formatCurrency(c.tax_amount)} ({c.tax_rate}%)
                          </td>
                          <td className="pms-table-td font-mono font-bold text-brand-forest text-right text-xs">
                            {formatCurrency(c.total_amount)}
                          </td>
                          {!isHousekeeping && (
                            <td className="pms-table-td">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  disabled={deletingChargeId === c.id}
                                  onClick={() => handleDeleteCharge(c.id)}
                                  className="pms-btn-icon-danger h-7 w-7"
                                  title="Delete Charge"
                                >
                                  {deletingChargeId === c.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Folio Bottom Calculation Footer */}
              <div className="bg-brand-sand/50 p-4 sm:p-5 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div>
                  {!isHousekeeping && (
                    <button
                      type="button"
                      onClick={() => setIsAddChargeOpen(true)}
                      className="pms-btn-secondary text-xs gap-1.5 h-8 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Additional Charge</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-right w-full sm:w-auto">
                  <div className="flex justify-between sm:justify-end gap-6 text-ink-muted">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono font-semibold text-ink">{formatCurrency(folio.taxable_amount)}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-6 text-ink-muted">
                    <span>Total Tax (CGST + SGST):</span>
                    <span className="font-mono text-ink">{formatCurrency(folio.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-6 text-sm font-bold text-brand-forest pt-1.5 border-t border-border-subtle">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base tabular-nums">{formatCurrency(folio.grand_total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Payment History */}
        {activeTab === 'payments' && (
          <div className="space-y-3.5">
            <div className="pms-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="pms-table">
                  <thead className="pms-table-header">
                    <tr>
                      <th className="pms-table-th">Date &amp; Time</th>
                      <th className="pms-table-th">Type / Classification</th>
                      <th className="pms-table-th">Payment Method</th>
                      <th className="pms-table-th">Reference / UTR #</th>
                      <th className="pms-table-th">Received By</th>
                      <th className="pms-table-th">Notes</th>
                      <th className="pms-table-th-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            icon={CreditCard}
                            title="No payments recorded"
                            description="Record advance deposit or installment payment against this folio."
                            action={
                              !isHousekeeping
                                ? {
                                    label: 'Record Payment',
                                    onClick: () => setIsRecordPaymentOpen(true),
                                    icon: CreditCard,
                                  }
                                : undefined
                            }
                            compact
                          />
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="pms-table-row">
                          <td className="pms-table-td">
                            <p className="text-xs font-semibold text-ink whitespace-nowrap">{formatDate(p.created_at)}</p>
                          </td>
                          <td className="pms-table-td">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-sand text-brand-forest border border-border-subtle">
                              {p.payment_type}
                            </span>
                          </td>
                          <td className="pms-table-td uppercase font-semibold text-xs text-ink">{p.payment_mode}</td>
                          <td className="pms-table-td font-mono text-xs text-ink-muted">
                            {p.reference_number || '—'}
                          </td>
                          <td className="pms-table-td text-xs text-ink">{p.recorder_name || 'Staff'}</td>
                          <td className="pms-table-td text-xs text-ink-muted">{p.notes || '—'}</td>
                          <td className="pms-table-td text-right font-mono font-bold text-status-green text-xs sm:text-sm">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payments Footer */}
              <div className="bg-brand-sand/50 p-4 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  {!isHousekeeping && folio.balance_due > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsRecordPaymentOpen(true)}
                      className="pms-btn-primary text-xs gap-1.5 h-8 font-medium"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect Remaining Balance ({formatCurrency(folio.balance_due)})</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-ink-muted font-medium">Total Paid:</span>
                  <span className="font-mono text-base font-bold text-status-green tabular-nums">
                    {formatCurrency(folio.total_paid)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Printable Tax Invoice */}
        {activeTab === 'invoice' && <BanquetInvoiceView invoice={invoice} />}
      </div>

      {/* ── Modals ── */}
      <AddBanquetChargeModal
        isOpen={isAddChargeOpen}
        onClose={() => setIsAddChargeOpen(false)}
        bookingId={booking.id}
        onSuccess={() => router.refresh()}
      />
      <RecordBanquetPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        bookingId={booking.id}
        suggestedAmount={folio.balance_due}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
