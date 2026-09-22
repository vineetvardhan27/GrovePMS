'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Smartphone,
  CreditCard,
  Building2,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  Search,
  Download,
  AlertCircle,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Receipt,
  FileText,
  DollarSign,
  PieChart,
  BarChart3,
  Layers,
  ChevronRight,
  Eye,
  Filter,
  RefreshCw,
  Utensils,
  PartyPopper,
} from 'lucide-react';
import { PaymentMode } from '../../lib/types/database.types';
import {
  UnifiedPaymentTransaction,
  OutstandingReceivable,
  HotelWidePaymentStats,
  PaymentSource,
} from '../../lib/payments/types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDateTime, formatDate } from '../../lib/utils/dates';
import TransactionDetailModal from './TransactionDetailModal';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../shared/EmptyState';

interface PaymentsDashboardProps {
  initialStats: HotelWidePaymentStats;
  initialTransactions: UnifiedPaymentTransaction[];
}

const MODE_ICONS: Record<PaymentMode, { icon: any; label: string; color: string }> = {
  cash: { icon: Banknote, label: 'Cash', color: 'text-status-green' },
  upi: { icon: Smartphone, label: 'UPI', color: 'text-status-blue' },
  card: { icon: CreditCard, label: 'Card', color: 'text-status-amber' },
  bank_transfer: { icon: Building2, label: 'Bank Transfer', color: 'text-brand-forest' },
  other: { icon: MoreHorizontal, label: 'Other', color: 'text-ink-muted' },
};

type DatePreset = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'this_year';

export default function PaymentsDashboard({
  initialStats,
  initialTransactions,
}: PaymentsDashboardProps) {
  // State
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedTransaction, setSelectedTransaction] = useState<UnifiedPaymentTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'ledger' | 'outstanding'>('ledger');

  // Filter transactions based on date preset, source, mode, type, search
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Start of this week (Monday)
    const dayOfWeek = (now.getDay() + 6) % 7;
    const monday = new Date(now.getTime() - dayOfWeek * 86400000);
    const weekStartStr = monday.toISOString().split('T')[0];

    // Start of this month
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Last month prefix
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const lastMonthNum = now.getMonth() === 0 ? 12 : now.getMonth();
    const lastMonthPrefix = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}`;

    // This year prefix
    const thisYearPrefix = `${now.getFullYear()}`;

    return initialTransactions.filter((t) => {
      const txDate = t.created_at.split('T')[0];

      // Date preset
      if (datePreset === 'today' && txDate !== todayStr) return false;
      if (datePreset === 'yesterday' && txDate !== yesterdayStr) return false;
      if (datePreset === 'this_week' && txDate < weekStartStr) return false;
      if (datePreset === 'this_month' && !txDate.startsWith(thisMonthPrefix)) return false;
      if (datePreset === 'last_month' && !txDate.startsWith(lastMonthPrefix)) return false;
      if (datePreset === 'this_year' && !txDate.startsWith(thisYearPrefix)) return false;

      // Source filter
      if (sourceFilter !== 'all' && t.source !== sourceFilter) return false;

      // Mode filter
      if (modeFilter !== 'all' && t.payment_mode !== modeFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && !t.payment_type.toLowerCase().includes(typeFilter.toLowerCase())) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          t.reference_number.toLowerCase().includes(q) ||
          t.customer_name.toLowerCase().includes(q) ||
          t.customer_phone.includes(q) ||
          t.resource_name.toLowerCase().includes(q) ||
          t.event_or_details.toLowerCase().includes(q) ||
          (t.transaction_reference && t.transaction_reference.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [initialTransactions, datePreset, sourceFilter, modeFilter, typeFilter, searchQuery]);

  // Recalculate dynamic period stats based on filtered transactions
  const periodCollectedTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const sourceBreakdown = useMemo(() => {
    const sources: PaymentSource[] = ['rooms', 'banquet', 'food_beverage'];
    return sources.map((s) => {
      const matching = filteredTransactions.filter((t) => t.source === s);
      const amt = matching.reduce((sum, t) => sum + t.amount, 0);
      const count = matching.length;
      const share = periodCollectedTotal > 0 ? (amt / periodCollectedTotal) * 100 : 0;
      const label = s === 'rooms' ? 'Rooms Accommodation' : s === 'banquet' ? 'Banquet & Events' : 'Food & Beverage';
      return { source: s, label, amount: amt, count, share };
    });
  }, [filteredTransactions, periodCollectedTotal]);

  const modeBreakdown = useMemo(() => {
    const modes: PaymentMode[] = ['cash', 'upi', 'card', 'bank_transfer', 'other'];
    return modes.map((m) => {
      const matching = filteredTransactions.filter((t) => t.payment_mode === m);
      const amt = matching.reduce((sum, t) => sum + t.amount, 0);
      const count = matching.length;
      const share = periodCollectedTotal > 0 ? (amt / periodCollectedTotal) * 100 : 0;
      return { mode: m, label: MODE_ICONS[m].label, amount: amt, count, share };
    });
  }, [filteredTransactions, periodCollectedTotal]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'Source', 'Reference', 'Customer Name', 'Phone', 'Resource', 'Type', 'Payment Mode', 'Amount', 'Status', 'UTR Reference'];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.created_at),
      new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      t.source_label,
      t.reference_number,
      `"${t.customer_name}"`,
      t.customer_phone,
      `"${t.resource_name}"`,
      t.payment_type,
      t.payment_mode.toUpperCase(),
      t.amount,
      t.status,
      t.transaction_reference || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HGV_Collections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDetail = (transaction: UnifiedPaymentTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-1 border-b border-border-subtle">
        <div>
          <h1 className="text-display font-serif text-brand-forest">Payments &amp; Collections</h1>
          <p className="text-body text-ink-muted mt-0.5">
            Single financial collection dashboard &amp; ledger across Rooms, Banquet Hall, and Food &amp; Beverage
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="pms-btn-secondary h-9 px-3.5 text-xs gap-1.5 font-medium shrink-0 self-start sm:self-center"
          title="Export filtered collection records to CSV"
        >
          <Download className="w-3.5 h-3.5 text-brand-forest" />
          <span>Export Collections</span>
        </button>
      </div>

      {/* ── 1. Top-Level Financial KPIs (5 High-Impact Cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Today's Collection */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's Collection</span>
            <div className="p-1 rounded bg-status-green/10 text-status-green">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(initialStats.today_total)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {initialStats.today_tx_count} transaction{initialStats.today_tx_count === 1 ? '' : 's'} today
          </p>
        </div>

        {/* KPI 2: Period Total Collected */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Collected</span>
            <div className="p-1 rounded bg-brand-forest/10 text-brand-forest">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-green truncate">
            {formatCurrency(periodCollectedTotal)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {filteredTransactions.length} payments in view
          </p>
        </div>

        {/* KPI 3: Outstanding Receivables */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber">
              Outstanding Due
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-status-amber" />
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold font-sans tabular-nums truncate ${
              initialStats.total_outstanding_receivables > 0 ? 'text-status-amber' : 'text-status-green'
            }`}
          >
            {formatCurrency(initialStats.total_outstanding_receivables)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            Across {initialStats.outstanding_items.length} open folios
          </p>
        </div>

        {/* KPI 4: Total Business Value */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Business Value</span>
            <div className="p-1 rounded bg-brand-sand text-brand-forest">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(initialStats.total_business_value)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Collected + Outstanding</p>
        </div>

        {/* KPI 5: Collection Rate */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Collection Rate</span>
            <span className="text-[10px] font-mono font-bold text-brand-forest">
              {initialStats.collection_rate_percent}%
            </span>
          </div>
          <div className="space-y-1.5 my-auto">
            <div className="w-full bg-brand-sand-dark h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-forest h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, initialStats.collection_rate_percent))}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Cash-flow efficiency</p>
        </div>
      </div>

      {/* ── 2. Date Range & Period Selector Toolbar ── */}
      <div className="pms-card px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mr-1 shrink-0 select-none">
            Reporting Period:
          </span>
          {(
            [
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'this_year', label: 'This Year' },
            ] as const
          ).map((preset) => {
            const isActive = datePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center shrink-0 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-brand-forest text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-ink-muted shrink-0 whitespace-nowrap pl-2">
          <Clock className="w-3.5 h-3.5 text-brand-forest shrink-0" />
          <span>Real-Time Persisted Data</span>
        </div>
      </div>

      {/* ── 3. Two-Column Analytics: Business Source & Payment Mode ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Collection by Business Area */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Collection by Business Area</h3>
              <p className="text-[11px] text-ink-muted">Revenue stream breakdown for current filter</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3">
            {sourceBreakdown.map((s) => (
              <div key={s.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        s.source === 'rooms'
                          ? 'bg-brand-forest'
                          : s.source === 'banquet'
                          ? 'bg-status-amber'
                          : 'bg-status-blue'
                      }`}
                    />
                    <span className="font-semibold text-ink">{s.label}</span>
                    <span className="text-[11px] text-ink-muted font-mono">({s.count} txns)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-forest tabular-nums">
                      {formatCurrency(s.amount)}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted w-10 text-right">
                      {s.share.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-brand-sand h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      s.source === 'rooms'
                        ? 'bg-brand-forest'
                        : s.source === 'banquet'
                        ? 'bg-status-amber'
                        : 'bg-status-blue'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, s.share))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Collection by Payment Mode */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Collection by Payment Mode</h3>
              <p className="text-[11px] text-ink-muted">Cash, UPI, Card, and Bank Transfer distribution</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3">
            {modeBreakdown.map((m) => {
              const Icon = MODE_ICONS[m.mode].icon;
              return (
                <div key={m.mode} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${MODE_ICONS[m.mode].color}`} />
                      <span className="font-semibold text-ink">{m.label}</span>
                      <span className="text-[11px] text-ink-muted font-mono">({m.count} txns)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-forest tabular-nums">
                        {formatCurrency(m.amount)}
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted w-10 text-right">
                        {m.share.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-sand h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-forest h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, m.share))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Main Ledger vs Outstanding Receivables Tabs ── */}
      <div className="space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-1 border-b border-border-subtle">
          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveViewTab('ledger')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'ledger'
                  ? 'bg-brand-forest text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Full Payment Ledger</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeViewTab === 'ledger' ? 'bg-white/20 text-white' : 'bg-brand-sand-dark text-ink-muted'
                }`}
              >
                {filteredTransactions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('outstanding')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'outstanding'
                  ? 'bg-brand-forest text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-status-amber" />
              <span>Outstanding Receivables</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeViewTab === 'outstanding' ? 'bg-white/20 text-white' : 'bg-brand-sand-dark text-ink-muted'
                }`}
              >
                {initialStats.outstanding_items.length}
              </span>
            </button>
          </div>

          {/* Search & Filters Toolbar (When on Ledger Tab) */}
          {activeViewTab === 'ledger' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guest, booking, room, event..."
                  className="w-full sm:w-56 h-9 pl-9 pr-3 text-xs bg-white border border-border-subtle rounded-lg text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  aria-label="Search payments"
                />
              </div>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all cursor-pointer"
                aria-label="Filter by source"
              >
                <option value="all">All Sources</option>
                <option value="rooms">Rooms</option>
                <option value="banquet">Banquet Hall</option>
                <option value="food_beverage">Food &amp; Beverage</option>
              </select>

              {/* Payment Mode Filter */}
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all cursor-pointer"
                aria-label="Filter by payment mode"
              >
                <option value="all">All Payment Modes</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>

              {/* Payment Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all cursor-pointer"
                aria-label="Filter by transaction type"
              >
                <option value="all">All Types</option>
                <option value="advance">Advance Deposit</option>
                <option value="running">Running Payment</option>
                <option value="settlement">Final Settlement</option>
              </select>
            </div>
          )}
        </div>

        {/* ── VIEW A: FULL UNIFIED PAYMENT LEDGER ── */}
        {activeViewTab === 'ledger' && (
          <div className="pms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="pms-table">
                <thead className="pms-table-header">
                  <tr>
                    <th className="pms-table-th">Date &amp; Time</th>
                    <th className="pms-table-th">Source</th>
                    <th className="pms-table-th">Reference</th>
                    <th className="pms-table-th">Customer / Host</th>
                    <th className="pms-table-th">Resource / Stay</th>
                    <th className="pms-table-th">Type</th>
                    <th className="pms-table-th">Mode</th>
                    <th className="pms-table-th text-right">Amount</th>
                    <th className="pms-table-th-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <EmptyState
                          icon={CreditCard}
                          title="No payment collections found"
                          description={
                            searchQuery || sourceFilter !== 'all' || modeFilter !== 'all' || typeFilter !== 'all'
                              ? 'Try adjusting your search criteria or filter options.'
                              : 'No payments have been recorded for the selected time range.'
                          }
                          compact
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => {
                      const ModeIcon = MODE_ICONS[t.payment_mode]?.icon || CreditCard;

                      return (
                        <tr key={t.id} className="pms-table-row transition-colors">
                          {/* Date & Time */}
                          <td className="pms-table-td whitespace-nowrap">
                            <p className="text-xs font-semibold text-ink">{formatDate(t.created_at)}</p>
                            <span className="font-mono text-[11px] text-ink-muted">
                              {new Date(t.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>

                          {/* Source */}
                          <td className="pms-table-td whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                t.source === 'banquet'
                                  ? 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                                  : t.source === 'food_beverage'
                                  ? 'bg-status-blue/15 text-status-blue border border-status-blue/30'
                                  : 'bg-brand-forest/10 text-brand-forest border border-brand-forest/20'
                              }`}
                            >
                              {t.source === 'banquet' ? 'BANQUET' : t.source === 'food_beverage' ? 'FOOD & BEVERAGE' : 'ROOM'}
                            </span>
                          </td>

                          {/* Reference */}
                          <td className="pms-table-td whitespace-nowrap">
                            {t.link_url ? (
                              <Link
                                href={t.link_url}
                                className="font-mono font-bold text-xs text-brand-forest hover:underline block"
                              >
                                {t.reference_number}
                              </Link>
                            ) : (
                              <span className="font-mono font-bold text-xs text-ink">{t.reference_number}</span>
                            )}
                          </td>

                          {/* Customer */}
                          <td className="pms-table-td">
                            <p className="text-xs font-semibold text-ink leading-tight">{t.customer_name}</p>
                            {t.customer_phone && (
                              <span className="font-mono text-[11px] text-ink-muted">{t.customer_phone}</span>
                            )}
                          </td>

                          {/* Resource */}
                          <td className="pms-table-td">
                            <p className="text-xs font-medium text-ink">{t.resource_name}</p>
                            <p className="text-[11px] text-ink-muted truncate max-w-[180px]">{t.event_or_details}</p>
                          </td>

                          {/* Type */}
                          <td className="pms-table-td capitalize text-xs text-ink">{t.payment_type}</td>

                          {/* Mode */}
                          <td className="pms-table-td whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                              <ModeIcon className={`w-3.5 h-3.5 ${MODE_ICONS[t.payment_mode]?.color}`} />
                              <span>{MODE_ICONS[t.payment_mode]?.label || t.payment_mode}</span>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="pms-table-td text-right font-mono font-bold text-xs sm:text-sm text-status-green whitespace-nowrap">
                            +{formatCurrency(t.amount)}
                          </td>

                          {/* Action */}
                          <td className="pms-table-td whitespace-nowrap">
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(t)}
                                className="pms-btn-secondary h-7 px-2.5 text-xs gap-1 font-medium"
                                title="View full transaction audit details"
                              >
                                <Eye className="w-3 h-3 text-brand-forest" />
                                <span>Details</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VIEW B: OUTSTANDING RECEIVABLES TABLE ── */}
        {activeViewTab === 'outstanding' && (
          <div className="pms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="pms-table">
                <thead className="pms-table-header">
                  <tr>
                    <th className="pms-table-th">Source</th>
                    <th className="pms-table-th">Reference</th>
                    <th className="pms-table-th">Customer / Host</th>
                    <th className="pms-table-th">Resource / Details</th>
                    <th className="pms-table-th text-right">Total Billed</th>
                    <th className="pms-table-th text-right">Paid / Advance</th>
                    <th className="pms-table-th text-right">Outstanding Balance</th>
                    <th className="pms-table-th-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {initialStats.outstanding_items.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <EmptyState
                          icon={CheckCircle2}
                          title="All folios settled in full"
                          description="No outstanding dues or unpaid balances across active rooms or banquet events."
                          compact
                        />
                      </td>
                    </tr>
                  ) : (
                    initialStats.outstanding_items.map((o) => (
                      <tr key={o.id} className="pms-table-row transition-colors">
                        {/* Source */}
                        <td className="pms-table-td whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              o.source === 'banquet'
                                ? 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                                : o.source === 'food_beverage'
                                ? 'bg-status-blue/15 text-status-blue border border-status-blue/30'
                                : 'bg-brand-forest/10 text-brand-forest border border-brand-forest/20'
                            }`}
                          >
                            {o.source === 'banquet' ? 'BANQUET' : o.source === 'food_beverage' ? 'FOOD & BEVERAGE' : 'ROOM'}
                          </span>
                        </td>

                        {/* Reference */}
                        <td className="pms-table-td whitespace-nowrap">
                          <Link
                            href={o.link_url}
                            className="font-mono font-bold text-xs text-brand-forest hover:underline block"
                          >
                            {o.reference_number}
                          </Link>
                        </td>

                        {/* Customer */}
                        <td className="pms-table-td">
                          <p className="text-xs font-semibold text-ink leading-tight">{o.customer_name}</p>
                          {o.customer_phone && (
                            <span className="font-mono text-[11px] text-ink-muted">{o.customer_phone}</span>
                          )}
                        </td>

                        {/* Resource */}
                        <td className="pms-table-td">
                          <p className="text-xs font-medium text-ink">{o.resource_name}</p>
                          <p className="text-[11px] text-ink-muted truncate max-w-[200px]">{o.event_or_details}</p>
                        </td>

                        {/* Total Billed */}
                        <td className="pms-table-td text-right font-mono text-xs text-ink">
                          {formatCurrency(o.total_billed)}
                        </td>

                        {/* Paid */}
                        <td className="pms-table-td text-right font-mono text-xs text-status-green font-semibold">
                          {formatCurrency(o.total_paid)}
                        </td>

                        {/* Balance Due */}
                        <td className="pms-table-td text-right font-mono font-bold text-xs sm:text-sm text-status-amber">
                          {formatCurrency(o.balance_due)}
                        </td>

                        {/* Action */}
                        <td className="pms-table-td whitespace-nowrap">
                          <div className="flex items-center justify-end">
                            <Link
                              href={o.link_url}
                              className="pms-btn-primary h-7 px-2.5 text-xs gap-1 font-medium"
                            >
                              <span>Open Folio</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Transaction Detail Modal ── */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
}
