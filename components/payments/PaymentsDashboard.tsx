'use client';

import { useState, useMemo, useEffect, useTransition, useCallback, useRef, useDeferredValue } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
  Utensils,
  PartyPopper,
  X,
  Loader2,
} from 'lucide-react';
import { PaymentMode } from '../../lib/types/database.types';
import {
  UnifiedPaymentTransaction,
  OutstandingReceivable,
  HotelWidePaymentStats,
  PaymentSource,
} from '../../lib/payments/types';
import type { PaginatedResult } from '../../lib/types/pagination';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDateTime, formatDate } from '../../lib/utils/dates';
import TransactionDetailModal from './TransactionDetailModal';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../shared/EmptyState';
import PaginationControls from '../shared/PaginationControls';
import AnimatedKpiValue from '../shared/AnimatedKpiValue';

interface PaymentsDashboardProps {
  initialStats: HotelWidePaymentStats;
  initialTransactions?: UnifiedPaymentTransaction[];
  initialPaginatedTransactions?: PaginatedResult<UnifiedPaymentTransaction>;
  initialOutstanding?: OutstandingReceivable[];
  initialFilters?: {
    page?: number;
    source?: string;
    mode?: string;
    type?: string;
    search?: string;
    datePreset?: string;
    tab?: string;
  };
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
  initialPaginatedTransactions,
  initialOutstanding,
  initialFilters,
}: PaymentsDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Normalize initial paginated ledger data
  const paginatedLedger: PaginatedResult<UnifiedPaymentTransaction> = initialPaginatedTransactions || {
    data: initialTransactions || [],
    page: 1,
    pageSize: 50,
    totalCount: initialTransactions ? initialTransactions.length : null,
    totalPages: initialTransactions ? Math.max(1, Math.ceil(initialTransactions.length / 50)) : 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // State
  const [datePreset, setDatePreset] = useState<DatePreset>((initialFilters?.datePreset as DatePreset) || 'all');
  const [sourceFilter, setSourceFilter] = useState<string>(initialFilters?.source || 'all');
  const [modeFilter, setModeFilter] = useState<string>(initialFilters?.mode || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(initialFilters?.type || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters?.search || '');
  const deferredSearch = useDeferredValue(searchQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRequestSeqRef = useRef<number>(0);

  const [selectedTransaction, setSelectedTransaction] = useState<UnifiedPaymentTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'ledger' | 'outstanding'>(
    (initialFilters?.tab as 'ledger' | 'outstanding') || 'ledger'
  );

  // Outstanding receivables client-side pagination (50 per page)
  const outstandingList = initialOutstanding || initialStats.outstanding_items || [];
  const [outstandingPage, setOutstandingPage] = useState<number>(1);
  const OUTSTANDING_PAGE_SIZE = 50;
  const totalOutstandingPages = Math.max(1, Math.ceil(outstandingList.length / OUTSTANDING_PAGE_SIZE));
  const pagedOutstanding = useMemo(() => {
    const from = (outstandingPage - 1) * OUTSTANDING_PAGE_SIZE;
    return outstandingList.slice(from, from + OUTSTANDING_PAGE_SIZE);
  }, [outstandingList, outstandingPage]);

  // Sync state if URL searchParams changed
  useEffect(() => {
    const urlPreset = (searchParams.get('datePreset') as DatePreset) || 'all';
    const urlSource = searchParams.get('source') || 'all';
    const urlMode = searchParams.get('mode') || 'all';
    const urlType = searchParams.get('type') || 'all';
    const urlSearch = searchParams.get('search') || '';
    const urlTab = (searchParams.get('tab') as 'ledger' | 'outstanding') || 'ledger';

    setDatePreset(urlPreset);
    setSourceFilter(urlSource);
    setModeFilter(urlMode);
    setTypeFilter(urlType);
    setSearchQuery(urlSearch);
    setActiveViewTab(urlTab);
  }, [searchParams]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Update query params helper (uses router.replace for search/filters to avoid polluting history)
  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | null>, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const shouldReplace = options?.replace ?? true;

      startTransition(() => {
        if (shouldReplace) {
          router.replace(targetUrl, { scroll: false });
        } else {
          router.push(targetUrl, { scroll: false });
        }
      });
    },
    [pathname, router, searchParams]
  );

  // Immediate search execution (cancels obsolete pending timers)
  const executeSearchImmediate = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      latestRequestSeqRef.current += 1;
      updateQueryParams({ search: query.trim(), page: 1 }, { replace: true });
    },
    [updateQueryParams]
  );

  // Debounced search handler: typing is immediate in UI, API call debounced ~250ms
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    // Cancel any obsolete pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // If completely cleared, apply immediately without 250ms wait
    if (!val.trim()) {
      executeSearchImmediate('');
      return;
    }

    // Schedule debounced search (~250ms)
    debounceTimerRef.current = setTimeout(() => {
      executeSearchImmediate(val);
    }, 250);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    executeSearchImmediate('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearchImmediate(searchQuery);
    } else if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  // Immediate filter actions (NOT debounced)
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    updateQueryParams({ datePreset: preset, page: 1 }, { replace: true });
  };

  const handleSourceChange = (src: string) => {
    setSourceFilter(src);
    updateQueryParams({ source: src, page: 1 }, { replace: true });
  };

  const handleModeChange = (mode: string) => {
    setModeFilter(mode);
    updateQueryParams({ mode, page: 1 }, { replace: true });
  };

  const handleTypeChange = (typ: string) => {
    setTypeFilter(typ);
    updateQueryParams({ type: typ, page: 1 }, { replace: true });
  };

  const handleLedgerPageChange = (newPage: number) => {
    updateQueryParams({ page: newPage }, { replace: false });
  };

  const handleTabChange = (tab: 'ledger' | 'outstanding') => {
    setActiveViewTab(tab);
    updateQueryParams({ tab, page: 1 }, { replace: true });
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'Source', 'Reference', 'Customer Name', 'Phone', 'Resource', 'Type', 'Payment Mode', 'Amount', 'Status', 'UTR Reference'];
    const rows = paginatedLedger.data.map((t) => [
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
      {/* ── Page Header matching Food & Beverage Overview ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-brand-forest shrink-0" aria-hidden="true" />
            <span>Unified Payments &amp; Collections</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Live cross-department ledger across Rooms, Banquet Hall, and Food &amp; Beverage
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="pms-btn-secondary h-9 px-3 text-xs gap-1.5 font-medium cursor-pointer shadow-xs"
            title="Export current page to CSV"
          >
            <Download className="w-3.5 h-3.5 text-brand-forest" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 1. Top KPI Summary Cards with Staggered Entrance and Hover Lift ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Collection */}
        <div
          className="pms-card p-5 space-y-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-xs pms-card-entrance group"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Today&apos;s Collections</span>
            <div className="p-2 bg-status-green/10 rounded-lg text-status-green transition-transform duration-200 group-hover:scale-105">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-bold font-serif text-brand-forest tabular-nums">
              <AnimatedKpiValue value={initialStats.today_total} type="currency" />
            </p>
            <p className="text-[11px] text-ink-muted font-mono">
              {initialStats.today_tx_count} transactions recorded today
            </p>
          </div>
        </div>

        {/* Card 2: Period Total Collected */}
        <div
          className="pms-card p-5 space-y-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-xs pms-card-entrance group"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Period Total Collected</span>
            <div className="p-2 bg-brand-forest/10 rounded-lg text-brand-forest transition-transform duration-200 group-hover:scale-105">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-bold font-serif text-brand-forest tabular-nums">
              <AnimatedKpiValue value={initialStats.period_total_collected} type="currency" />
            </p>
            <p className="text-[11px] text-ink-muted font-mono">
              {paginatedLedger.totalCount ?? initialStats.period_tx_count} total payments
            </p>
          </div>
        </div>

        {/* Card 3: Total Outstanding Receivables */}
        <div
          className="pms-card p-5 space-y-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-xs pms-card-entrance group"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Total Outstanding Due</span>
            <div className="p-2 bg-status-amber/15 rounded-lg text-status-amber transition-transform duration-200 group-hover:scale-105">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-bold font-serif text-status-amber tabular-nums">
              <AnimatedKpiValue value={initialStats.total_outstanding_receivables} type="currency" />
            </p>
            <p className="text-[11px] text-ink-muted truncate">
              Rooms: {formatCurrency(initialStats.rooms_outstanding)} | BNQ: {formatCurrency(initialStats.banquet_outstanding)}
            </p>
          </div>
        </div>

        {/* Card 4: Collection Realization Rate */}
        <div
          className="pms-card p-5 space-y-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-xs pms-card-entrance group"
          style={{ animationDelay: '180ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Collection Rate</span>
            <div className="p-2 bg-status-blue/15 rounded-lg text-status-blue transition-transform duration-200 group-hover:scale-105">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-bold font-serif text-ink tabular-nums">
              <AnimatedKpiValue value={initialStats.collection_rate_percent} type="percent" decimals={1} />
            </p>
            <p className="text-[11px] text-ink-muted truncate">
              Of {formatCurrency(initialStats.total_business_value)} total billed business
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Time-Period Preset Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-lg border border-border-subtle shadow-2xs">
        <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-brand-forest">
          <Calendar className="w-3.5 h-3.5" />
          <span>Period:</span>
        </div>
        {[
          { key: 'all', label: 'All History' },
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' },
          { key: 'this_week', label: 'This Week' },
          { key: 'this_month', label: 'This Month' },
          { key: 'last_month', label: 'Last Month' },
          { key: 'this_year', label: 'This Year' },
        ].map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handleDatePresetChange(p.key as DatePreset)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
              datePreset === p.key
                ? 'bg-brand-forest text-white shadow-2xs'
                : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── 3. Breakdown Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Collection by Revenue Stream */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Collection by Revenue Stream</h3>
              <p className="text-[11px] text-ink-muted">Distribution across hotel operating departments</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3">
            {initialStats.sources.map((s) => (
              <div key={s.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
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
                      {s.share_pct.toFixed(1)}%
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
                    style={{ width: `${Math.min(100, Math.max(0, s.share_pct))}%` }}
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
            {initialStats.modes.map((m) => {
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
                        {m.share_pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-sand h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-forest h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, m.share_pct))}%` }}
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
              onClick={() => handleTabChange('ledger')}
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
                {paginatedLedger.totalCount ?? paginatedLedger.data.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('outstanding')}
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
                {outstandingList.length}
              </span>
            </button>
          </div>

          {/* Search & Filters Toolbar (When on Ledger Tab) */}
          {activeViewTab === 'ledger' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                {isPending ? (
                  <Loader2 className="w-4 h-4 text-brand-forest animate-spin absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                ) : (
                  <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search ref, notes, mode..."
                  className="w-full sm:w-56 h-9 pl-9 pr-7 text-xs bg-white border border-border-subtle rounded-lg text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  aria-label="Search payments"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => handleSourceChange(e.target.value)}
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
                onChange={(e) => handleModeChange(e.target.value)}
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
                onChange={(e) => handleTypeChange(e.target.value)}
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
          <div className="space-y-4">
            <div className="pms-card overflow-hidden relative">
              {/* Subtle non-blocking progress bar */}
              {isPending && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-forest/20 overflow-hidden z-20">
                  <div className="w-full h-full bg-brand-forest animate-pulse" />
                </div>
              )}

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
                    {paginatedLedger.data.length === 0 ? (
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
                      paginatedLedger.data.map((t) => {
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
                                  className="pms-btn-secondary h-7 px-2.5 text-xs gap-1 font-medium cursor-pointer"
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

            {/* Pagination Controls for Ledger */}
            <PaginationControls
              currentPage={paginatedLedger.page}
              totalPages={paginatedLedger.totalPages}
              totalCount={paginatedLedger.totalCount}
              pageSize={paginatedLedger.pageSize}
              hasNextPage={paginatedLedger.hasNextPage}
              hasPrevPage={paginatedLedger.hasPrevPage}
              onPageChange={handleLedgerPageChange}
              itemLabel="transactions"
              isLoading={isPending}
            />
          </div>
        )}

        {/* ── VIEW B: OUTSTANDING RECEIVABLES TABLE ── */}
        {activeViewTab === 'outstanding' && (
          <div className="space-y-4">
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
                    {pagedOutstanding.length === 0 ? (
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
                      pagedOutstanding.map((o) => (
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

            {/* Pagination for Outstanding Receivables */}
            {outstandingList.length > OUTSTANDING_PAGE_SIZE && (
              <PaginationControls
                currentPage={outstandingPage}
                totalPages={totalOutstandingPages}
                totalCount={outstandingList.length}
                pageSize={OUTSTANDING_PAGE_SIZE}
                hasNextPage={outstandingPage < totalOutstandingPages}
                hasPrevPage={outstandingPage > 1}
                onPageChange={(p) => setOutstandingPage(p)}
                itemLabel="outstanding folios"
              />
            )}
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
