'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  Smartphone,
  CreditCard,
  Building2,
  MoreHorizontal,
  CalendarDays,
  Printer,
  AlertCircle,
  TrendingUp,
  Users,
  LogOut,
  Clock,
  BedDouble,
  DollarSign,
  CheckCircle2,
  LineChart as LineChartIcon,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import type { DailyReport } from '../../lib/reports/queries';
import { fetchDailyReport } from '../../lib/reports/server-actions';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';

interface DailyReportViewProps {
  initialReport: DailyReport;
  inHouseGuestsCount?: number;
}

interface TrendDay {
  date: string;
  dateLabel: string;
  collections: number;
  revenue: number;
  arrivals: number;
  departures: number;
}

const MODE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  cash: { label: 'Cash', icon: Banknote, color: 'text-status-green' },
  upi: { label: 'UPI', icon: Smartphone, color: 'text-status-blue' },
  card: { label: 'Card', icon: CreditCard, color: 'text-status-amber' },
  bank_transfer: { label: 'Bank Transfer', icon: Building2, color: 'text-brand-forest' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'text-ink-muted' },
};

const ALL_MODES = ['cash', 'upi', 'card', 'bank_transfer', 'other'] as const;

export default function DailyReportView({
  initialReport,
  inHouseGuestsCount,
}: DailyReportViewProps) {
  const [selectedDate, setSelectedDate] = useState(initialReport.date);
  const [report, setReport] = useState<DailyReport>(initialReport);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 7-day trend state (Real historical PMS data)
  const [trendData, setTrendData] = useState<TrendDay[]>([]);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  // Fetch report for selected date
  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setFetchError(null);
    setIsLoading(true);
    try {
      const newReport = await fetchDailyReport(date);
      setReport(newReport);
    } catch {
      setFetchError('Could not load report for this date. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real 7-day trend ending on selectedDate
  useEffect(() => {
    let isActive = true;
    const loadTrend = async () => {
      setIsLoadingTrend(true);
      try {
        const dates: string[] = [];
        const base = new Date(selectedDate);
        for (let i = 6; i >= 0; i--) {
          const d = new Date(base);
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0]);
        }

        const dailyReports = await Promise.all(
          dates.map(async (d) => {
            if (d === selectedDate && report.date === selectedDate) {
              return report;
            }
            try {
              return await fetchDailyReport(d);
            } catch {
              return null;
            }
          })
        );

        if (!isActive) return;

        const trend: TrendDay[] = dates.map((d, idx) => {
          const rep = dailyReports[idx];
          const dateObj = new Date(d);
          const dateLabel = dateObj.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          });
          const collections = rep ? rep.collection : 0;
          const revenue = rep
            ? rep.arrivals.reduce(
                (sum, b) => sum + Number(b.rate_per_night || b.total_amount || 0),
                0
              )
            : 0;
          const arrivals = rep ? rep.arrivals.length : 0;
          const departures = rep ? rep.departures.length : 0;

          return {
            date: d,
            dateLabel,
            collections,
            revenue,
            arrivals,
            departures,
          };
        });

        setTrendData(trend);
      } catch (err) {
        console.error('Failed to load 7-day operations trend:', err);
      } finally {
        if (isActive) setIsLoadingTrend(false);
      }
    };

    loadTrend();
    return () => {
      isActive = false;
    };
  }, [selectedDate, report]);

  // Operational metrics calculations
  const totalArrivalGuests = useMemo(() => {
    return report.arrivals.reduce(
      (sum, b) => sum + Number(b.adults || 1) + Number(b.children || 0),
      0
    );
  }, [report.arrivals]);

  const totalDepartureGuests = useMemo(() => {
    return report.departures.reduce(
      (sum, b) => sum + Number(b.adults || 1) + Number(b.children || 0),
      0
    );
  }, [report.departures]);

  const dayRoomRevenue = useMemo(() => {
    return report.arrivals.reduce(
      (sum, b) => sum + Number(b.rate_per_night || b.total_amount || 0),
      0
    );
  }, [report.arrivals]);

  const activeInHouseCount = useMemo(() => {
    // If today is selected and inHouseGuestsCount from intelligence is available, use it
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate === todayStr && inHouseGuestsCount !== undefined) {
      return inHouseGuestsCount;
    }
    // Otherwise calculate from arrivals currently checked in
    return report.arrivals.filter((b) => b.booking_status === 'checked_in').length;
  }, [selectedDate, inHouseGuestsCount, report.arrivals]);

  // Check if historical trend has any real activity
  const hasTrendActivity = useMemo(() => {
    return trendData.some(
      (d) => d.collections > 0 || d.revenue > 0 || d.arrivals > 0 || d.departures > 0
    );
  }, [trendData]);

// Helper for human-friendly rounded max ceiling on Y-axis
function getNiceMax(val: number): number {
  if (val <= 0) return 1000;
  const target = val * 1.18; // 18% headroom
  const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
  const factor = target / magnitude;
  let roundedFactor = 10;
  if (factor <= 1.2) roundedFactor = 1.2;
  else if (factor <= 1.5) roundedFactor = 1.5;
  else if (factor <= 2) roundedFactor = 2;
  else if (factor <= 2.5) roundedFactor = 2.5;
  else if (factor <= 3) roundedFactor = 3;
  else if (factor <= 4) roundedFactor = 4;
  else if (factor <= 5) roundedFactor = 5;
  else if (factor <= 6) roundedFactor = 6;
  else if (factor <= 8) roundedFactor = 8;
  return Math.max(500, Math.round(roundedFactor * magnitude));
}

// Monotone Cubic Spline (Fritsch-Carlson) - ensures smooth curves through real points without overshoots or negative dips
function getMonotoneCubicSpline(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  if (n === 2) {
    return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
  }

  // 1. Slopes of secant lines
  const d: number[] = [];
  const dx: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    d[i] = (points[i + 1].y - points[i].y) / (dx[i] || 1);
  }

  // 2. Initial tangents
  const m: number[] = [];
  m[0] = d[0];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) {
      m[i] = 0;
    } else {
      m[i] = (d[i - 1] + d[i]) / 2;
    }
  }
  m[n - 1] = d[n - 2];

  // 3. Fritsch-Carlson monotonicity condition
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / d[i];
      const beta = m[i + 1] / d[i];
      if (alpha < 0) m[i] = 0;
      if (beta < 0) m[i + 1] = 0;
      if (alpha * alpha + beta * beta > 9) {
        const tau = 3 / Math.sqrt(alpha * alpha + beta * beta);
        m[i] = tau * alpha * d[i];
        m[i + 1] = tau * beta * d[i];
      }
    }
  }

  // 4. Build SVG Cubic Bezier string
  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i];
    const cp1x = points[i].x + h / 3;
    const cp1y = points[i].y + (m[i] * h) / 3;
    const cp2x = points[i + 1].x - h / 3;
    const cp2y = points[i + 1].y - (m[i + 1] * h) / 3;
    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${points[i + 1].x.toFixed(1)},${points[i + 1].y.toFixed(1)}`;
  }
  return path;
}

  // SVG Chart Dimensions & Math (Optimized vertical proportions & smooth curves)
  const chartMath = useMemo(() => {
    if (!trendData.length) return null;
    const svgWidth = 520;
    const svgHeight = 210;
    const padding = { top: 22, right: 18, bottom: 28, left: 54 };
    const plotWidth = svgWidth - padding.left - padding.right;
    const plotHeight = svgHeight - padding.top - padding.bottom;
    const baselineY = padding.top + plotHeight;

    const rawMax = Math.max(
      ...trendData.map((d) => Math.max(d.revenue, d.collections))
    );
    const maxVal = getNiceMax(rawMax);

    const pointsRevenue = trendData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, trendData.length - 1)) * plotWidth;
      const y = padding.top + (1 - d.revenue / maxVal) * plotHeight;
      return { x, y, val: d.revenue };
    });

    const pointsCollections = trendData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, trendData.length - 1)) * plotWidth;
      const y = padding.top + (1 - d.collections / maxVal) * plotHeight;
      return { x, y, val: d.collections };
    });

    const pathRevenue = getMonotoneCubicSpline(pointsRevenue);
    const pathCollections = getMonotoneCubicSpline(pointsCollections);

    // Subtle area fills underneath lines
    const lastRevPt = pointsRevenue[pointsRevenue.length - 1];
    const firstRevPt = pointsRevenue[0];
    const areaRevenue = `${pathRevenue} L ${lastRevPt.x.toFixed(1)},${baselineY.toFixed(1)} L ${firstRevPt.x.toFixed(1)},${baselineY.toFixed(1)} Z`;

    const lastColPt = pointsCollections[pointsCollections.length - 1];
    const firstColPt = pointsCollections[0];
    const areaCollections = `${pathCollections} L ${lastColPt.x.toFixed(1)},${baselineY.toFixed(1)} L ${firstColPt.x.toFixed(1)},${baselineY.toFixed(1)} Z`;

    return {
      svgWidth,
      svgHeight,
      padding,
      plotWidth,
      plotHeight,
      baselineY,
      maxVal,
      pointsRevenue,
      pointsCollections,
      pathRevenue,
      pathCollections,
      areaRevenue,
      areaCollections,
    };
  }, [trendData]);

  return (
    <div
      className={`space-y-4 sm:space-y-4.5 print:space-y-4 transition-opacity ${
        isLoading ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {/* ── 1. Compact Page Header & Controls Bar (Unified Single Row) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-sand text-brand-forest border border-border-subtle">
              Audit View
            </span>
            <span className="text-xs text-ink-muted">{formatDate(selectedDate)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest tracking-tight leading-tight">
            Daily Operations Audit
          </h1>
        </div>

        {/* Date Selector & Print Report Trigger */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-border-subtle shadow-2xs">
            <CalendarDays className="w-3.5 h-3.5 text-ink-muted shrink-0" />
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-xs text-ink bg-transparent focus:outline-none cursor-pointer font-medium"
            />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="pms-btn-secondary h-8 px-2.5 sm:px-3 text-xs gap-1.5 font-medium shadow-2xs shrink-0 cursor-pointer"
            title="Print daily operational audit report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Print-Only Structured Header */}
      <div className="hidden print:block border-b border-border-subtle pb-3">
        <h1 className="text-xl font-serif font-bold text-brand-forest">Hotel Greenery View</h1>
        <p className="text-xs text-ink-muted">
          Daily Operations Audit &amp; Reconciliation Report — Date: {formatDate(selectedDate)}
        </p>
      </div>

      {/* Error alert if fetch failed */}
      {fetchError && (
        <div className="p-3 rounded-lg bg-status-amber/10 border border-status-amber/30 text-xs text-ink flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-status-amber shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* ── 2. Daily Operations KPI Row (6 Compact, Uniform Cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total Collected */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Total Collected
            </span>
            <DollarSign className="w-3.5 h-3.5 text-status-green" />
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold font-sans tabular-nums truncate ${
              report.collection > 0 ? 'text-status-green' : 'text-brand-forest'
            }`}
          >
            {formatCurrency(report.collection)}
          </p>
          <p className="text-[11px] text-ink-muted truncate mt-0.5">
            {report.transactionCount > 0
              ? `${report.transactionCount} payment${report.transactionCount !== 1 ? 's' : ''}`
              : 'No payments today'}
          </p>
        </div>

        {/* Arrivals */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Arrivals
            </span>
            <Users className="w-3.5 h-3.5 text-status-amber" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {report.arrivals.length}
          </p>
          <p className="text-[11px] text-ink-muted truncate mt-0.5">
            {report.arrivals.length > 0
              ? `${totalArrivalGuests} guest${totalArrivalGuests !== 1 ? 's' : ''}`
              : '0 scheduled'}
          </p>
        </div>

        {/* Departures */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Departures
            </span>
            <LogOut className="w-3.5 h-3.5 text-status-blue" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {report.departures.length}
          </p>
          <p className="text-[11px] text-ink-muted truncate mt-0.5">
            {report.checkedOut.length > 0
              ? `${report.checkedOut.length} checked out`
              : report.departures.length > 0
              ? `${totalDepartureGuests} guest${totalDepartureGuests !== 1 ? 's' : ''}`
              : '0 scheduled'}
          </p>
        </div>

        {/* In-House Guests */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              In-House Guests
            </span>
            <BedDouble className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {activeInHouseCount}
          </p>
          <p className="text-[11px] text-ink-muted truncate mt-0.5">
            {activeInHouseCount > 0 ? 'Currently occupying' : 'No active stay'}
          </p>
        </div>

        {/* Room Revenue */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Room Revenue
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(dayRoomRevenue)}
          </p>
          <p className="text-[11px] text-ink-muted truncate mt-0.5">
            {report.arrivals.length > 0
              ? `${report.arrivals.length} room${report.arrivals.length !== 1 ? 's' : ''} booked`
              : 'Billed on arrival'}
          </p>
        </div>

        {/* Outstanding Due */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Outstanding Due
            </span>
            <Clock className="w-3.5 h-3.5 text-status-amber" />
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold font-sans tabular-nums truncate ${
              report.pendingBalance > 0 ? 'text-status-amber' : 'text-brand-forest'
            }`}
          >
            {formatCurrency(report.pendingBalance)}
          </p>
          <p className="text-[11px] text-ink-muted truncate mt-0.5">
            {report.pendingBalance > 0
              ? `${report.pendingCount} folio${report.pendingCount !== 1 ? 's' : ''} pending`
              : 'All folios settled'}
          </p>
        </div>
      </div>

      {/* ── 3. Financial Breakdown & Daily Operations Trend Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Collection Summary (5 cols) */}
        <div className="lg:col-span-5 pms-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                  Payment Reconciliations
                </span>
                <h3 className="text-sm font-bold text-ink">Today&apos;s Collection</h3>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-brand-forest">
                  {formatCurrency(report.collection)}
                </span>
                <span className="block text-[10px] text-ink-muted">
                  {report.transactionCount} transaction{report.transactionCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Payment Modes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 my-2">
              {ALL_MODES.map((modeKey) => {
                const config = MODE_CONFIG[modeKey] || MODE_CONFIG.other;
                const ModeIcon = config.icon;
                const amt = report.collectionByMode[modeKey as keyof typeof report.collectionByMode] || 0;
                const sharePct =
                  report.collection > 0 ? Math.round((amt / report.collection) * 100) : 0;

                return (
                  <div
                    key={modeKey}
                    className="flex items-center justify-between p-2.5 bg-brand-sand/40 rounded-lg border border-border-subtle"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center border border-border-subtle shrink-0">
                        <ModeIcon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      <span className="text-xs font-medium text-ink">{config.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-ink tabular-nums block">
                        {formatCurrency(amt)}
                      </span>
                      {report.collection > 0 && amt > 0 && (
                        <span className="text-[10px] text-ink-muted">{sharePct}% share</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact Empty / Reconciled Status Note */}
          <div className="pt-2 mt-2 border-t border-border-subtle">
            {report.collection === 0 ? (
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                <span>No payments recorded today · Receipts will appear here automatically.</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-brand-forest">
                <span className="font-semibold">Settled Daily Total</span>
                <span className="font-bold tabular-nums">{formatCurrency(report.collection)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Daily Operations Trend Chart (7 cols) */}
        <div className="lg:col-span-7 pms-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            {/* Chart Header & Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 mb-2 border-b border-border-subtle">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                  7-Day PMS History
                </span>
                <h3 className="text-sm font-bold text-ink">Daily Operations Trend</h3>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-forest inline-block" />
                  <span className="text-[11px] font-medium text-ink-muted">Room Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[11px] font-medium text-ink-muted">Collections</span>
                </div>
              </div>
            </div>

            {/* Chart Area Container (Relative for Responsive Floating Tooltip) */}
            <div className="relative flex-1 flex flex-col justify-center min-h-[210px] my-1">
              {/* Floating Tooltip positioned near active data point */}
              {hoveredTrendIndex !== null && trendData[hoveredTrendIndex] && chartMath && (
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-75 ease-out shadow-md rounded-lg border border-border-subtle bg-white/95 backdrop-blur-md px-3 py-2 text-xs"
                  style={{
                    left: `${Math.min(
                      Math.max(8, (chartMath.pointsRevenue[hoveredTrendIndex].x / chartMath.svgWidth) * 100),
                      68
                    )}%`,
                    top: '6px',
                  }}
                >
                  <p className="font-semibold text-ink border-b border-border-subtle pb-1 mb-1.5 text-[11px]">
                    {trendData[hoveredTrendIndex].dateLabel}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                        Collections
                      </span>
                      <span className="font-bold text-status-green tabular-nums">
                        {formatCurrency(trendData[hoveredTrendIndex].collections)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <span className="w-2 h-2 rounded-full bg-brand-forest inline-block shrink-0" />
                        Room Revenue
                      </span>
                      <span className="font-bold text-brand-forest tabular-nums">
                        {formatCurrency(trendData[hoveredTrendIndex].revenue)}
                      </span>
                    </div>
                    {(trendData[hoveredTrendIndex].arrivals > 0 ||
                      trendData[hoveredTrendIndex].departures > 0) && (
                      <p className="text-[10px] text-ink-muted pt-1 border-t border-border-subtle/60 mt-1">
                        {trendData[hoveredTrendIndex].arrivals} arrival{trendData[hoveredTrendIndex].arrivals !== 1 ? 's' : ''} ·{' '}
                        {trendData[hoveredTrendIndex].departures} departure{trendData[hoveredTrendIndex].departures !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Chart Body or Intelligent Empty State */}
              {isLoadingTrend ? (
                <div className="flex items-center justify-center h-48 text-xs text-ink-muted">
                  Loading daily operations trend...
                </div>
              ) : !hasTrendActivity ? (
                <div className="flex flex-col items-center justify-center h-48 sm:h-52 text-center p-4">
                  <div className="w-9 h-9 rounded-full bg-brand-sand/70 flex items-center justify-center text-ink-muted mb-2 border border-border-subtle">
                    <LineChartIcon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-ink">Not enough data yet</p>
                  <p className="text-[11px] text-ink-muted mt-0.5 max-w-xs leading-relaxed">
                    Daily trends will appear as more hotel activity is recorded.
                  </p>
                </div>
              ) : chartMath ? (
                <div className="relative w-full h-full flex items-center overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartMath.svgWidth} ${chartMath.svgHeight}`}
                    className="w-full h-[210px] sm:h-[230px] select-none"
                  >
                    <defs>
                      {/* Subtle Area Gradients */}
                      <linearGradient id="pmsRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1B4332" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#1B4332" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="pmsColGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Fast, lightweight animations (350-450ms) */}
                      <style>{`
                        @keyframes pmsDrawLine {
                          from { stroke-dashoffset: 1200; }
                          to { stroke-dashoffset: 0; }
                        }
                        @keyframes pmsFadeArea {
                          from { opacity: 0; }
                          to { opacity: 1; }
                        }
                        @keyframes pmsPopDot {
                          0% { transform: scale(0); opacity: 0; }
                          70% { transform: scale(1.3); opacity: 1; }
                          100% { transform: scale(1); opacity: 1; }
                        }
                        .pms-trend-line {
                          stroke-dasharray: 1200;
                          animation: pmsDrawLine 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        .pms-trend-area {
                          animation: pmsFadeArea 480ms ease-out forwards;
                        }
                        .pms-trend-dot {
                          transform-origin: center;
                          transform-box: fill-box;
                          animation: pmsPopDot 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
                        }
                      `}</style>
                    </defs>

                    {/* Grid Lines & Y-axis labels */}
                    {[0, 0.5, 1].map((ratio, idx) => {
                      const y =
                        chartMath.padding.top + (1 - ratio) * chartMath.plotHeight;
                      const val = ratio * chartMath.maxVal;
                      return (
                        <g key={idx}>
                          <line
                            x1={chartMath.padding.left}
                            y1={y}
                            x2={chartMath.svgWidth - chartMath.padding.right}
                            y2={y}
                            stroke="#EAE4D9"
                            strokeDasharray={ratio === 0 ? undefined : '3,3'}
                            strokeWidth="1"
                          />
                          <text
                            x={chartMath.padding.left - 8}
                            y={y + 3.5}
                            textAnchor="end"
                            fontSize="9"
                            fill="#8C827A"
                            className="tabular-nums font-medium select-none"
                          >
                            {val >= 1000
                              ? `₹${Number((val / 1000).toFixed(val % 1000 === 0 ? 0 : 1))}k`
                              : `₹${Math.round(val)}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Animated Data Layer (re-runs smooth 400ms transition on date change) */}
                    <g key={selectedDate}>
                      {/* Subtle Area Fills */}
                      <path
                        d={chartMath.areaRevenue}
                        fill="url(#pmsRevGrad)"
                        className="pms-trend-area"
                      />
                      <path
                        d={chartMath.areaCollections}
                        fill="url(#pmsColGrad)"
                        className="pms-trend-area"
                      />

                      {/* Smooth Monotone Curved Lines */}
                      <path
                        d={chartMath.pathRevenue}
                        fill="none"
                        stroke="#1B4332"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pms-trend-line"
                      />
                      <path
                        d={chartMath.pathCollections}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pms-trend-line"
                      />

                      {/* Data Points, Guides & X-axis Labels */}
                      {trendData.map((d, i) => {
                        const ptRev = chartMath.pointsRevenue[i];
                        const ptCol = chartMath.pointsCollections[i];
                        const isHovered = hoveredTrendIndex === i;

                        return (
                          <g key={d.date}>
                            {/* Vertical hover guide */}
                            {isHovered && (
                              <line
                                x1={ptRev.x}
                                y1={chartMath.padding.top}
                                x2={ptRev.x}
                                y2={chartMath.baselineY}
                                stroke="#CBD5E1"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                              />
                            )}

                            {/* Active Point Highlight Pulse Rings */}
                            {isHovered && (
                              <>
                                <circle
                                  cx={ptRev.x}
                                  cy={ptRev.y}
                                  r="8"
                                  fill="#1B4332"
                                  opacity="0.18"
                                />
                                <circle
                                  cx={ptCol.x}
                                  cy={ptCol.y}
                                  r="9"
                                  fill="#10B981"
                                  opacity="0.22"
                                />
                              </>
                            )}

                            {/* Revenue Dot */}
                            <circle
                              cx={ptRev.x}
                              cy={ptRev.y}
                              r={isHovered ? 4.5 : 3}
                              fill="#1B4332"
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              className="pms-trend-dot"
                              style={{ animationDelay: `${i * 35}ms` }}
                            />

                            {/* Collections Dot */}
                            <circle
                              cx={ptCol.x}
                              cy={ptCol.y}
                              r={isHovered ? 4.5 : 3}
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              className="pms-trend-dot"
                              style={{ animationDelay: `${i * 35}ms` }}
                            />

                            {/* Date Label on X-axis */}
                            <text
                              x={ptRev.x}
                              y={chartMath.svgHeight - 8}
                              textAnchor="middle"
                              fontSize="9.5"
                              fill={isHovered ? '#1B4332' : '#8C827A'}
                              fontWeight={isHovered ? '700' : '500'}
                              className="select-none transition-colors"
                            >
                              {d.dateLabel}
                            </text>

                            {/* Touch/Hover Target */}
                            <rect
                              x={ptRev.x - (chartMath.plotWidth / 7) / 2}
                              y={chartMath.padding.top}
                              width={chartMath.plotWidth / 7}
                              height={chartMath.plotHeight + 26}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredTrendIndex(i)}
                              onMouseLeave={() => setHoveredTrendIndex(null)}
                              onClick={() => setHoveredTrendIndex(i)}
                            />
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pt-2 mt-auto border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted">
            <span>7-day rolling window based on real transactions</span>
            <span>Hover or tap dates for exact breakdown</span>
          </div>
        </div>
      </div>

      {/* ── 4. Arrivals & Departures Operational Grid (Compact 2-Column) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Arrivals */}
        <div className="pms-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-status-amber" />
                <h3 className="text-sm font-bold text-ink">
                  Arrivals ({report.arrivals.length})
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                {totalArrivalGuests} guest{totalArrivalGuests !== 1 ? 's' : ''} expected
              </span>
            </div>

            {report.arrivals.length === 0 ? (
              <div className="flex items-center gap-3 p-3.5 bg-brand-sand/30 rounded-lg border border-dashed border-border-subtle text-ink-muted my-2">
                <div className="w-7 h-7 rounded-full bg-brand-sand flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-ink-muted" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">No arrivals scheduled</p>
                  <p className="text-[11px] text-ink-muted">
                    You&apos;re all clear for today&apos;s arrivals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {report.arrivals.map((b) => {
                  const paid =
                    b.payments?.reduce((s, p) => s + (Number(p.amount) || 0), 0) ||
                    Number(b.advance_amount || 0);
                  const bal = Math.max(0, Number(b.total_amount) - paid);

                  return (
                    <div
                      key={b.id}
                      className="p-3 bg-brand-sand/40 rounded-lg border border-border-subtle flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{b.guest.full_name}</p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                              b.booking_status === 'checked_in'
                                ? 'bg-status-green/15 text-status-green'
                                : 'bg-status-amber/15 text-status-amber'
                            }`}
                          >
                            {b.booking_status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-ink-muted text-[11px] mt-0.5">
                          Room {b.room?.room_number || 'TBD'}
                          {b.room?.category?.name && ` (${b.room.category.name})`} ·{' '}
                          {b.adults} Adult{b.adults !== 1 ? 's' : ''}
                          {Number(b.children) > 0 ? `, ${b.children} Child` : ''}
                        </p>
                        <p className="text-[10px] text-ink-muted mt-0.5">
                          #{b.booking_number} · Standard check-in 12:00 PM
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-ink tabular-nums block">
                          {formatCurrency(b.total_amount)}
                        </span>
                        {bal > 0 ? (
                          <span className="text-[10px] text-status-amber font-semibold">
                            {formatCurrency(bal)} due
                          </span>
                        ) : (
                          <span className="text-[10px] text-status-green font-medium">
                            Paid in full
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted">
            <span>Check-in time: 12:00 PM onwards</span>
            <span>{report.arrivals.filter((b) => b.booking_status === 'checked_in').length} Checked In</span>
          </div>
        </div>

        {/* Departures */}
        <div className="pms-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-status-blue" />
                <h3 className="text-sm font-bold text-ink">
                  Departures ({report.departures.length})
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                {report.checkedOut.length} of {report.departures.length} completed
              </span>
            </div>

            {report.departures.length === 0 ? (
              <div className="flex items-center gap-3 p-3.5 bg-brand-sand/30 rounded-lg border border-dashed border-border-subtle text-ink-muted my-2">
                <div className="w-7 h-7 rounded-full bg-brand-sand flex items-center justify-center shrink-0">
                  <LogOut className="w-3.5 h-3.5 text-ink-muted" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">No departures scheduled</p>
                  <p className="text-[11px] text-ink-muted">
                    No check-outs pending for this date.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {report.departures.map((b) => {
                  const paid =
                    b.payments?.reduce((s, p) => s + (Number(p.amount) || 0), 0) ||
                    Number(b.advance_amount || 0);
                  const bal = Math.max(0, Number(b.total_amount) - paid);

                  return (
                    <div
                      key={b.id}
                      className="p-3 bg-brand-sand/40 rounded-lg border border-border-subtle flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{b.guest.full_name}</p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                              b.booking_status === 'checked_out'
                                ? 'bg-ink-muted/15 text-ink-muted'
                                : 'bg-status-blue/15 text-status-blue'
                            }`}
                          >
                            {b.booking_status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-ink-muted text-[11px] mt-0.5">
                          Room {b.room?.room_number || 'TBD'}
                          {b.room?.category?.name && ` (${b.room.category.name})`} ·{' '}
                          {b.adults} Adult{b.adults !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[10px] text-ink-muted mt-0.5">
                          #{b.booking_number} · Standard check-out 11:00 AM
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-ink tabular-nums block">
                          {formatCurrency(b.total_amount)}
                        </span>
                        {bal > 0 ? (
                          <span className="text-[10px] text-status-amber font-semibold">
                            {formatCurrency(bal)} due
                          </span>
                        ) : (
                          <span className="text-[10px] text-status-green font-medium">
                            Folio Settled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted">
            <span>Check-out time: 11:00 AM</span>
            <span>{report.checkedOut.length} Settled</span>
          </div>
        </div>
      </div>

      {/* ── 5. Detailed Operational Information & Folio Settlement Audit ── */}
      {report.pendingBalance > 0 ? (
        <div className="pms-card p-3.5 sm:p-4 bg-status-amber/10 border-status-amber/30 flex items-start gap-3">
          <Clock className="w-5 h-5 text-status-amber shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <p className="font-semibold text-sm text-ink">
                Pending Folio Balances:{' '}
                <span className="text-status-amber font-bold tabular-nums">
                  {formatCurrency(report.pendingBalance)}
                </span>
              </p>
              <span className="text-xs text-status-amber font-medium">
                {report.pendingCount} booking{report.pendingCount !== 1 ? 's' : ''} requiring settlement
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Outstanding balances across bookings with arrival dates on {formatDate(selectedDate)}.
              Front desk staff should verify advance receipts and settle pending invoices prior to check-out.
            </p>
          </div>
        </div>
      ) : (
        <div className="pms-card p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-ink">Daily Folios Reconciled</p>
              <p className="text-[11px] text-ink-muted">
                All check-in and check-out accounts for {formatDate(selectedDate)} have zero pending balance.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-sand text-brand-forest border border-border-subtle shrink-0">
            Audit Balanced
          </span>
        </div>
      )}
    </div>
  );
}
