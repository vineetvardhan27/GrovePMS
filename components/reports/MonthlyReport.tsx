'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  CalendarDays,
  Percent,
  IndianRupee,
  BedDouble,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Info,
  LineChart as LineChartIcon,
  AlertCircle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import type { MonthlyReport, MonthlyDailyMetric } from '../../lib/reports/queries';
import { fetchMonthlyReport } from '../../lib/reports/server-actions';
import { formatCurrency } from '../../lib/utils/currency';

interface MonthlyReportViewProps {
  initialReport: MonthlyReport;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type MetricType = 'revenue' | 'occupancy' | 'adr';

// Helper for human-friendly rounded max ceiling on Y-axis
function getNiceMax(val: number, isPercent = false): number {
  if (isPercent) return 100;
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

// Monotone Cubic Spline (Fritsch-Carlson) for smooth curved line rendering without dipping below 0
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

export default function MonthlyReportView({ initialReport }: MonthlyReportViewProps) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(initialReport.year);
  const [selectedMonth, setSelectedMonth] = useState(initialReport.month);
  const [report, setReport] = useState<MonthlyReport>(initialReport);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricType>('revenue');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const handleChange = async (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsLoading(true);
    try {
      const newReport = await fetchMonthlyReport(year, month);
      setReport(newReport);
    } catch {
      // noop
    } finally {
      setIsLoading(false);
    }
  };

  // 4 Primary Core KPIs (Consistent with Executive Intelligence)
  const kpiCards = [
    {
      label: 'Occupancy',
      value: `${report.occupancyPercent}%`,
      sub: `${report.roomNightsSold} of ${report.totalRooms * report.daysInMonth} room-nights`,
      icon: Percent,
      color: 'text-status-green',
    },
    {
      label: 'ADR',
      value: formatCurrency(report.adr),
      sub: 'Average Daily Rate',
      icon: IndianRupee,
      color: 'text-brand-forest',
    },
    {
      label: 'RevPAR',
      value: formatCurrency(report.revpar),
      sub: 'Revenue Per Available Room',
      icon: TrendingUp,
      color: 'text-status-blue',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(report.totalRevenue),
      sub: `${report.totalBookings} booking${report.totalBookings !== 1 ? 's' : ''}`,
      icon: BedDouble,
      color: 'text-status-amber',
    },
  ];

  // Accounting variance analysis between Collected and Billed Revenue
  const financialVariance = useMemo(() => {
    const revenue = Number(report.totalRevenue) || 0;
    const collected = Number(report.totalCollected) || 0;
    const diff = collected - revenue;
    const isSurplus = diff > 0;
    const isDeficit = diff < 0;
    const isBalanced = diff === 0;

    const benchmarkMax = Math.max(revenue, collected, 1000);
    const revBarPct = Math.min(100, Math.round((revenue / benchmarkMax) * 100));
    const colBarPct = Math.min(100, Math.round((collected / benchmarkMax) * 100));

    return {
      revenue,
      collected,
      diff,
      isSurplus,
      isDeficit,
      isBalanced,
      revBarPct,
      colBarPct,
    };
  }, [report.totalRevenue, report.totalCollected]);

  // Check if historical monthly trend data has any activity
  const trendDays: MonthlyDailyMetric[] = useMemo(() => {
    return report.dailyTrend || [];
  }, [report.dailyTrend]);

  const hasTrendActivity = useMemo(() => {
    return trendDays.some(
      (d) => d.revenue > 0 || d.occupancyPercent > 0 || d.collections > 0 || d.adr > 0
    );
  }, [trendDays]);

  // SVG Chart Geometry & Dimensions
  const chartMath = useMemo(() => {
    if (!trendDays.length) return null;
    const svgWidth = 540;
    const svgHeight = 210;
    const padding = { top: 24, right: 18, bottom: 28, left: 54 };
    const plotWidth = svgWidth - padding.left - padding.right;
    const plotHeight = svgHeight - padding.top - padding.bottom;
    const baselineY = padding.top + plotHeight;

    let rawMax = 100;
    let isPercent = false;
    let strokeColor = '#1B4332';
    let gradId = 'pmsMonthRevGrad';

    if (activeMetric === 'revenue') {
      rawMax = Math.max(...trendDays.map((d) => d.revenue));
      strokeColor = '#1B4332';
      gradId = 'pmsMonthRevGrad';
    } else if (activeMetric === 'occupancy') {
      rawMax = Math.max(...trendDays.map((d) => d.occupancyPercent), 10);
      isPercent = true;
      strokeColor = '#10B981';
      gradId = 'pmsMonthOccGrad';
    } else {
      rawMax = Math.max(...trendDays.map((d) => d.adr));
      strokeColor = '#2563EB';
      gradId = 'pmsMonthAdrGrad';
    }

    const maxVal = getNiceMax(rawMax, isPercent);

    const points = trendDays.map((d, i) => {
      const x = padding.left + (i / Math.max(1, trendDays.length - 1)) * plotWidth;
      const metricVal =
        activeMetric === 'revenue'
          ? d.revenue
          : activeMetric === 'occupancy'
          ? d.occupancyPercent
          : d.adr;
      const y = padding.top + (1 - metricVal / maxVal) * plotHeight;
      return { x, y, val: metricVal, day: d };
    });

    const pathString = getMonotoneCubicSpline(points);
    const lastPt = points[points.length - 1];
    const firstPt = points[0];
    const areaString = `${pathString} L ${lastPt.x.toFixed(1)},${baselineY.toFixed(1)} L ${firstPt.x.toFixed(1)},${baselineY.toFixed(1)} Z`;

    return {
      svgWidth,
      svgHeight,
      padding,
      plotWidth,
      plotHeight,
      baselineY,
      maxVal,
      isPercent,
      strokeColor,
      gradId,
      points,
      pathString,
      areaString,
    };
  }, [trendDays, activeMetric]);

  return (
    <div
      className={`space-y-4 sm:space-y-4.5 print:space-y-4 transition-opacity ${
        isLoading ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {/* ── 1. Compact Page Header & Date Controls (Unified Single Row) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-sand text-brand-forest border border-border-subtle">
              Monthly View
            </span>
            <span className="text-xs text-ink-muted">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear} · {report.totalRooms} rooms · {report.daysInMonth} days
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest tracking-tight leading-tight">
            Monthly Review &amp; ADR
          </h1>
        </div>

        {/* Month & Year Selectors and Print Trigger */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-border-subtle shadow-2xs">
            <CalendarDays className="w-3.5 h-3.5 text-ink-muted shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => handleChange(selectedYear, Number(e.target.value))}
              className="text-xs text-ink bg-transparent focus:outline-none cursor-pointer font-medium pr-1"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => handleChange(Number(e.target.value), selectedMonth)}
              className="text-xs text-ink bg-transparent focus:outline-none cursor-pointer font-medium pl-1 border-l border-border-subtle"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="pms-btn-secondary h-8 px-2.5 sm:px-3 text-xs gap-1.5 font-medium shadow-2xs shrink-0 cursor-pointer"
            title="Print monthly performance audit report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b border-border-subtle pb-3">
        <h1 className="text-xl font-serif font-bold text-brand-forest">Hotel Greenery View</h1>
        <p className="text-xs text-ink-muted">
          Monthly Performance Review &amp; ADR Report — {MONTH_NAMES[selectedMonth - 1]} {selectedYear} ({report.totalRooms} Rooms · {report.daysInMonth} Days)
        </p>
      </div>

      {/* ── 2. Core KPI Section (4 Uniform, Clean Cards Without Accent Borders) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]"
            >
              <div className="flex items-center justify-between text-ink-muted mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {card.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <p
                className={`text-xl sm:text-2xl font-bold font-sans tabular-nums truncate ${card.color}`}
              >
                {card.value}
              </p>
              <p className="text-[11px] text-ink-muted truncate mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── 3. Revenue Performance & Monthly Trend Visualization (Balanced 2-Col Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Revenue Performance Card (5 cols) */}
        <div className="lg:col-span-5 pms-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border-subtle">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                  Accounting &amp; Cash Realization
                </span>
                <h3 className="text-sm font-bold text-ink">Revenue Performance</h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-sand text-brand-forest border border-border-subtle">
                Monthly Audit
              </span>
            </div>

            {/* Financial Comparison Metrics */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="p-3 bg-brand-sand/40 rounded-lg border border-border-subtle">
                <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block">
                  Total Revenue (Billed)
                </span>
                <p className="text-base sm:text-lg font-bold text-ink font-sans tabular-nums mt-0.5">
                  {formatCurrency(report.totalRevenue)}
                </p>
                <p className="text-[10px] text-ink-muted mt-0.5">
                  {report.roomNightsSold} room nights billed
                </p>
              </div>

              <div className="p-3 bg-brand-sand/40 rounded-lg border border-border-subtle">
                <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block">
                  Collected (Realized)
                </span>
                <p className="text-base sm:text-lg font-bold text-status-green font-sans tabular-nums mt-0.5">
                  {formatCurrency(report.totalCollected)}
                </p>
                <p className="text-[10px] text-ink-muted mt-0.5">
                  Cash, UPI &amp; Bank receipts
                </p>
              </div>
            </div>

            {/* Proportional Comparative Progress Bars (Avoids misleading >100% nested bars) */}
            <div className="space-y-2.5 my-3 p-3 bg-brand-sand/20 rounded-lg border border-border-subtle">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-ink font-medium">Billed Revenue</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatCurrency(report.totalRevenue)}
                  </span>
                </div>
                <div className="h-2 bg-brand-sand rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-forest rounded-full transition-all duration-300"
                    style={{ width: `${financialVariance.revBarPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-status-green font-medium">Cash Collected</span>
                  <span className="font-semibold text-status-green tabular-nums">
                    {formatCurrency(report.totalCollected)}
                  </span>
                </div>
                <div className="h-2 bg-brand-sand rounded-full overflow-hidden">
                  <div
                    className="h-full bg-status-green rounded-full transition-all duration-300"
                    style={{ width: `${financialVariance.colBarPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Accounting Variance Badge & Explanation */}
            <div className="mt-2 p-2.5 rounded-lg border text-xs flex items-start gap-2 bg-brand-sand/40 border-border-subtle">
              {financialVariance.isSurplus ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-status-green shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink">
                      Net Surplus Collected:{' '}
                      <span className="text-status-green tabular-nums">
                        +{formatCurrency(financialVariance.diff)}
                      </span>
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                      Receipts exceed room charges due to advance deposits or folio settlements recorded this month.
                    </p>
                  </div>
                </>
              ) : financialVariance.isDeficit ? (
                <>
                  <ArrowDownRight className="w-4 h-4 text-status-amber shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink">
                      Pending Receivables:{' '}
                      <span className="text-status-amber tabular-nums">
                        {formatCurrency(Math.abs(financialVariance.diff))}
                      </span>
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                      Outstanding balances remaining across folios for this month&apos;s bookings.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-status-green shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink">Balanced Realization</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      All billed room revenue for this month has been reconciled in full.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 mt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted">
            <span>PMS Reconciliation Standard</span>
            <span>
              {report.totalPending > 0
                ? `${formatCurrency(report.totalPending)} pending folios`
                : 'All accounts balanced'}
            </span>
          </div>
        </div>

        {/* Monthly Performance Visualization (7 cols) */}
        <div className="lg:col-span-7 pms-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            {/* Chart Header & Metric Toggle Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 mb-2 border-b border-border-subtle">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                  Time-Series Performance
                </span>
                <h3 className="text-sm font-bold text-ink">Monthly Revenue &amp; Occupancy</h3>
              </div>

              {/* Metric Toggle Tabs: Revenue | Occupancy | ADR */}
              <div className="flex items-center bg-brand-sand/60 p-0.5 rounded-lg border border-border-subtle shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveMetric('revenue')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeMetric === 'revenue'
                      ? 'bg-brand-forest text-white shadow-2xs'
                      : 'text-ink-muted hover:text-ink hover:bg-white/60'
                  }`}
                >
                  Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('occupancy')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeMetric === 'occupancy'
                      ? 'bg-brand-forest text-white shadow-2xs'
                      : 'text-ink-muted hover:text-ink hover:bg-white/60'
                  }`}
                >
                  Occupancy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('adr')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeMetric === 'adr'
                      ? 'bg-brand-forest text-white shadow-2xs'
                      : 'text-ink-muted hover:text-ink hover:bg-white/60'
                  }`}
                >
                  ADR
                </button>
              </div>
            </div>

            {/* Chart Area Container (Relative for Responsive Floating Tooltip) */}
            <div className="relative flex-1 flex flex-col justify-center min-h-[210px] my-1">
              {/* Floating Tooltip positioned near hovered day */}
              {hoveredDayIndex !== null && trendDays[hoveredDayIndex] && chartMath && (
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-75 ease-out shadow-md rounded-lg border border-border-subtle bg-white/95 backdrop-blur-md px-3 py-2 text-xs"
                  style={{
                    left: `${Math.min(
                      Math.max(8, (chartMath.points[hoveredDayIndex].x / chartMath.svgWidth) * 100),
                      68
                    )}%`,
                    top: '6px',
                  }}
                >
                  <p className="font-semibold text-ink border-b border-border-subtle pb-1 mb-1.5 text-[11px]">
                    {trendDays[hoveredDayIndex].dateLabel}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="text-ink-muted">Room Revenue</span>
                      <span className="font-bold text-brand-forest tabular-nums">
                        {formatCurrency(trendDays[hoveredDayIndex].revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="text-ink-muted">Occupancy</span>
                      <span className="font-bold text-status-green tabular-nums">
                        {trendDays[hoveredDayIndex].occupancyPercent}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="text-ink-muted">ADR</span>
                      <span className="font-bold text-status-blue tabular-nums">
                        {formatCurrency(trendDays[hoveredDayIndex].adr)}
                      </span>
                    </div>
                    {trendDays[hoveredDayIndex].collections > 0 && (
                      <div className="flex items-center justify-between gap-4 text-[11px] pt-1 border-t border-border-subtle/60">
                        <span className="text-ink-muted">Collections</span>
                        <span className="font-semibold text-status-green tabular-nums">
                          {formatCurrency(trendDays[hoveredDayIndex].collections)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chart Body or Intelligent Empty State */}
              {!hasTrendActivity ? (
                <div className="flex flex-col items-center justify-center h-48 sm:h-52 text-center p-4">
                  <div className="w-9 h-9 rounded-full bg-brand-sand/70 flex items-center justify-center text-ink-muted mb-2 border border-border-subtle">
                    <LineChartIcon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-ink">Not enough data yet</p>
                  <p className="text-[11px] text-ink-muted mt-0.5 max-w-xs leading-relaxed">
                    Performance trends will appear as more bookings are recorded.
                  </p>
                </div>
              ) : chartMath ? (
                <div className="relative w-full h-full flex items-center overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartMath.svgWidth} ${chartMath.svgHeight}`}
                    className="w-full h-[210px] sm:h-[230px] select-none"
                  >
                    <defs>
                      <linearGradient id="pmsMonthRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1B4332" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#1B4332" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="pmsMonthOccGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="pmsMonthAdrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Fast, lightweight animations (350-450ms) */}
                      <style>{`
                        @keyframes pmsDrawMonthLine {
                          from { stroke-dashoffset: 1400; }
                          to { stroke-dashoffset: 0; }
                        }
                        @keyframes pmsFadeMonthArea {
                          from { opacity: 0; }
                          to { opacity: 1; }
                        }
                        @keyframes pmsPopMonthDot {
                          0% { transform: scale(0); opacity: 0; }
                          70% { transform: scale(1.3); opacity: 1; }
                          100% { transform: scale(1); opacity: 1; }
                        }
                        .pms-month-line {
                          stroke-dasharray: 1400;
                          animation: pmsDrawMonthLine 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        .pms-month-area {
                          animation: pmsFadeMonthArea 480ms ease-out forwards;
                        }
                        .pms-month-dot {
                          transform-origin: center;
                          transform-box: fill-box;
                          animation: pmsPopMonthDot 300ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
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
                            {chartMath.isPercent
                              ? `${Math.round(val)}%`
                              : val >= 1000
                              ? `₹${Number((val / 1000).toFixed(val % 1000 === 0 ? 0 : 1))}k`
                              : `₹${Math.round(val)}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Animated Data Layer (re-triggers on metric or month change) */}
                    <g key={`${selectedYear}-${selectedMonth}-${activeMetric}`}>
                      {/* Subtle Area Fill */}
                      <path
                        d={chartMath.areaString}
                        fill={`url(#${chartMath.gradId})`}
                        className="pms-month-area"
                      />

                      {/* Smooth Monotone Curved Line */}
                      <path
                        d={chartMath.pathString}
                        fill="none"
                        stroke={chartMath.strokeColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pms-month-line"
                      />

                      {/* Data Points & X-axis Labels */}
                      {chartMath.points.map((pt, i) => {
                        const isHovered = hoveredDayIndex === i;
                        // Display X label for every 5th day and the last day
                        const showLabel =
                          pt.day.day === 1 ||
                          pt.day.day === 5 ||
                          pt.day.day === 10 ||
                          pt.day.day === 15 ||
                          pt.day.day === 20 ||
                          pt.day.day === 25 ||
                          pt.day.day === report.daysInMonth;

                        return (
                          <g key={pt.day.date}>
                            {/* Vertical hover guide */}
                            {isHovered && (
                              <line
                                x1={pt.x}
                                y1={chartMath.padding.top}
                                x2={pt.x}
                                y2={chartMath.baselineY}
                                stroke="#CBD5E1"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                              />
                            )}

                            {/* Active Point Highlight Pulse Ring */}
                            {isHovered && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="8.5"
                                fill={chartMath.strokeColor}
                                opacity="0.2"
                              />
                            )}

                            {/* Dot (rendered on all points or when value > 0 or hovered) */}
                            {(pt.val > 0 || isHovered) && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 4.5 : 3}
                                fill={chartMath.strokeColor}
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                className="pms-month-dot"
                                style={{ animationDelay: `${i * 15}ms` }}
                              />
                            )}

                            {/* Date Label on X-axis */}
                            {showLabel && (
                              <text
                                x={pt.x}
                                y={chartMath.svgHeight - 8}
                                textAnchor="middle"
                                fontSize="9"
                                fill={isHovered ? '#1B4332' : '#8C827A'}
                                fontWeight={isHovered ? '700' : '500'}
                                className="select-none transition-colors"
                              >
                                {pt.day.day}
                              </text>
                            )}

                            {/* Touch/Hover Target */}
                            <rect
                              x={pt.x - (chartMath.plotWidth / trendDays.length) / 2}
                              y={chartMath.padding.top}
                              width={chartMath.plotWidth / trendDays.length}
                              height={chartMath.plotHeight + 26}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredDayIndex(i)}
                              onMouseLeave={() => setHoveredDayIndex(null)}
                              onClick={() => setHoveredDayIndex(i)}
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
            <span>
              {activeMetric === 'revenue'
                ? 'Daily booked room revenue'
                : activeMetric === 'occupancy'
                ? 'Daily room occupancy rate'
                : 'Average daily rate per occupied room'}
            </span>
            <span>Hover dates for exact breakdown</span>
          </div>
        </div>
      </div>

      {/* ── 4. Booking Status (Cohesive Single-Component Row) ── */}
      <div className="pms-card p-4 sm:p-5">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-forest/70" />
            <h3 className="text-sm font-bold text-ink">Booking Status Breakdown</h3>
          </div>
          <span className="text-xs text-ink-muted">
            {report.totalBookings} reservation{report.totalBookings !== 1 ? 's' : ''} in {MONTH_NAMES[selectedMonth - 1]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Total Bookings */}
          <div className="p-3.5 bg-brand-sand/40 rounded-xl border border-border-subtle flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-border-subtle shrink-0">
              <BedDouble className="w-4 h-4 text-ink-muted" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-ink">
                {report.totalBookings}
              </p>
              <p className="text-xs text-ink-muted font-medium">Total Bookings</p>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="p-3.5 bg-status-blue/10 rounded-xl border border-status-blue/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-status-blue/25 shrink-0">
              <Clock className="w-4 h-4 text-status-blue" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-blue">
                {report.confirmedBookings}
              </p>
              <p className="text-xs text-ink-muted font-medium">Active / Confirmed</p>
            </div>
          </div>

          {/* Checked Out Bookings */}
          <div className="p-3.5 bg-status-green/10 rounded-xl border border-status-green/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-status-green/25 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-status-green" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-green">
                {report.checkedOutBookings}
              </p>
              <p className="text-xs text-ink-muted font-medium">Checked Out</p>
            </div>
          </div>

          {/* Cancelled Bookings */}
          <div className="p-3.5 bg-status-red/10 rounded-xl border border-status-red/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-status-red/25 shrink-0">
              <XCircle className="w-4 h-4 text-status-red" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-red">
                {report.cancelledBookings}
              </p>
              <p className="text-xs text-ink-muted font-medium">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Calculation Definitions (Compact Micro Footer) ── */}
      <div className="pms-card p-3 sm:p-3.5 bg-brand-sand/30 border-border-subtle text-ink-muted">
        <div className="flex items-center gap-2 mb-1.5">
          <Info className="w-3.5 h-3.5 text-brand-forest/70 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink">
            Metric Definitions &amp; Formulas
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-ink-muted">
          <div>
            <strong className="text-ink font-semibold">ADR:</strong> Total Room Revenue ÷ Room Nights Sold
          </div>
          <div>
            <strong className="text-ink font-semibold">RevPAR:</strong> ADR × Occupancy %
          </div>
          <div>
            <strong className="text-ink font-semibold">Occupancy %:</strong> Room Nights Sold ÷ (Total Rooms × Days) × 100
          </div>
        </div>
      </div>
    </div>
  );
}
