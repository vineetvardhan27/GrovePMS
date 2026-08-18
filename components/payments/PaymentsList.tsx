'use client';

import { useState, useMemo } from 'react';
import {
  Banknote,
  Smartphone,
  CreditCard,
  Building2,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  Search,
} from 'lucide-react';
import { PaymentMode } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDateTime } from '../../lib/utils/dates';

type EnrichedPayment = {
  id: string;
  hotel_id: string;
  booking_id: string;
  booking_number: string;
  guest_name: string;
  guest_phone: string;
  room_number: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_type: string;
  notes: string | null;
  created_at: string;
};

interface PaymentsListProps {
  payments: EnrichedPayment[];
  todayTotal: number;
  allTimeTotal: number;
}

const MODE_ICONS: Record<PaymentMode, { icon: any; label: string; color: string }> = {
  cash: { icon: Banknote, label: 'Cash', color: 'text-status-green' },
  upi: { icon: Smartphone, label: 'UPI', color: 'text-status-blue' },
  card: { icon: CreditCard, label: 'Card', color: 'text-status-amber' },
  bank_transfer: { icon: Building2, label: 'Bank Transfer', color: 'text-brand-forest' },
  other: { icon: MoreHorizontal, label: 'Other', color: 'text-ink-muted' },
};

export default function PaymentsList({
  payments,
  todayTotal,
  allTimeTotal,
}: PaymentsListProps) {
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (modeFilter !== 'all' && p.payment_mode !== modeFilter) return false;
      if (searchQuery.trim()) {
        const s = searchQuery.trim().toLowerCase();
        return (
          p.booking_number.toLowerCase().includes(s) ||
          p.guest_name.toLowerCase().includes(s) ||
          p.guest_phone.toLowerCase().includes(s) ||
          p.room_number.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [payments, modeFilter, searchQuery]);

  // Mode breakdown totals
  const modeBreakdown = useMemo(() => {
    return (['cash', 'upi', 'card', 'bank_transfer', 'other'] as PaymentMode[]).map((mode) => ({
      mode,
      total: payments.filter((p) => p.payment_mode === mode).reduce((sum, p) => sum + p.amount, 0),
      count: payments.filter((p) => p.payment_mode === mode).length,
    }));
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Collection */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-status-green/15 rounded-lg">
              <Calendar className="w-4 h-4 text-status-green" />
            </div>
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Today's Collection</span>
          </div>
          <p className="text-2xl font-serif font-bold text-brand-forest tabular-nums">{formatCurrency(todayTotal)}</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-brand-sand rounded-lg">
              <TrendingUp className="w-4 h-4 text-brand-forest" />
            </div>
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Total Collected</span>
          </div>
          <p className="text-2xl font-serif font-bold text-brand-forest tabular-nums">{formatCurrency(allTimeTotal)}</p>
        </div>

        {/* Transactions Count */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-status-blue/15 rounded-lg">
              <CreditCard className="w-4 h-4 text-status-blue" />
            </div>
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Total Transactions</span>
          </div>
          <p className="text-2xl font-serif font-bold text-brand-forest">{payments.length}</p>
        </div>
      </div>

      {/* Mode Breakdown */}
      <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">Collection by Mode</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {modeBreakdown.map(({ mode, total, count }) => {
            const config = MODE_ICONS[mode];
            const ModeIcon = config.icon;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setModeFilter(modeFilter === mode ? 'all' : mode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  modeFilter === mode
                    ? 'border-brand-forest bg-brand-forest text-white'
                    : 'border-border-subtle bg-brand-sand/30 hover:bg-brand-sand text-ink'
                }`}
              >
                <ModeIcon className={`w-4 h-4 mb-1.5 ${modeFilter === mode ? 'text-white' : config.color}`} />
                <p className={`text-[11px] font-medium ${modeFilter === mode ? 'text-white/80' : 'text-ink-muted'}`}>{config.label}</p>
                <p className={`text-sm font-bold tabular-nums ${modeFilter === mode ? 'text-white' : 'text-ink'}`}>{formatCurrency(total)}</p>
                <p className={`text-[10px] ${modeFilter === mode ? 'text-white/70' : 'text-ink-muted'}`}>{count} txn{count !== 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking #, guest, room..."
            className="pl-9 pr-3 py-2 bg-white border border-border-subtle rounded-lg text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-[38px] w-64"
          />
        </div>
        {modeFilter !== 'all' && (
          <button
            type="button"
            onClick={() => setModeFilter('all')}
            className="px-3 py-1.5 rounded-lg bg-brand-sand text-xs text-ink border border-border-subtle hover:bg-brand-sand-dark transition-colors cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Booking</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Type</th>
                <th className="p-4">Mode</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ink-muted">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const modeConfig = MODE_ICONS[p.payment_mode] || MODE_ICONS.other;
                  const ModeIcon = modeConfig.icon;
                  return (
                    <tr key={p.id} className="hover:bg-brand-sand/40 transition-colors">
                      <td className="p-4 text-ink-muted tabular-nums">{formatDateTime(p.created_at)}</td>

                      <td className="p-4 font-mono font-bold text-ink">{p.booking_number}</td>

                      <td className="p-4">
                        <p className="font-semibold text-ink">{p.guest_name}</p>
                        <p className="text-[11px] text-ink-muted">{p.guest_phone}</p>
                      </td>

                      <td className="p-4 font-bold text-brand-forest font-serif">
                        Room {p.room_number}
                      </td>

                      <td className="p-4 capitalize text-ink-muted">{p.payment_type}</td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5">
                          <ModeIcon className={`w-3.5 h-3.5 ${modeConfig.color}`} />
                          <span className="text-ink">{modeConfig.label}</span>
                        </span>
                        {p.notes && (
                          <p className="text-[11px] text-ink-muted mt-0.5">{p.notes}</p>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <span className="font-bold text-status-green tabular-nums text-sm">
                          +{formatCurrency(p.amount)}
                        </span>
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
