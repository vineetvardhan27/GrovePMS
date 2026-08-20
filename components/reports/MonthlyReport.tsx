'use client';

import { useState } from 'react';
import { TrendingUp, CalendarDays, Percent, IndianRupee, BedDouble, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { MonthlyReport } from '../../lib/reports/queries';
import { fetchMonthlyReport } from '../../lib/reports/server-actions';
import { formatCurrency } from '../../lib/utils/currency';

interface MonthlyReportViewProps {
  initialReport: MonthlyReport;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlyReportView({ initialReport }: MonthlyReportViewProps) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(initialReport.year);
  const [selectedMonth, setSelectedMonth] = useState(initialReport.month);
  const [report, setReport] = useState<MonthlyReport>(initialReport);
  const [isLoading, setIsLoading] = useState(false);

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

  const kpiCards = [
    {
      label: 'Occupancy',
      value: `${report.occupancyPercent}%`,
      sub: `${report.roomNightsSold} of ${report.totalRooms * report.daysInMonth} room-nights`,
      icon: Percent,
      color: 'text-status-green',
      accent: 'border-l-status-green',
    },
    {
      label: 'ADR',
      value: formatCurrency(report.adr),
      sub: 'Average Daily Rate',
      icon: IndianRupee,
      color: 'text-brand-forest',
      accent: 'border-l-brand-forest',
    },
    {
      label: 'RevPAR',
      value: formatCurrency(report.revpar),
      sub: 'Revenue Per Available Room',
      icon: TrendingUp,
      color: 'text-status-blue',
      accent: 'border-l-status-blue',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(report.totalRevenue),
      sub: `${report.totalBookings} bookings`,
      icon: BedDouble,
      color: 'text-status-amber',
      accent: 'border-l-status-amber',
    },
  ];

  return (
    <div className={`space-y-6 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <CalendarDays className="w-4 h-4 text-ink-muted" />
        <select
          value={selectedMonth}
          onChange={(e) => handleChange(selectedYear, Number(e.target.value))}
          className="px-3 py-2.5 bg-white border border-border-subtle rounded-lg text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-touch"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => handleChange(Number(e.target.value), selectedMonth)}
          className="px-3 py-2.5 bg-white border border-border-subtle rounded-lg text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-touch"
        >
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Month heading */}
      <div className="text-center py-2">
        <h2 className="text-lg font-serif font-bold text-brand-forest">
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear} — Monthly Report
        </h2>
        <p className="text-xs text-ink-muted">{report.totalRooms} Rooms · {report.daysInMonth} Days</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-lg p-4 sm:p-5 border border-border-subtle border-l-4 ${card.accent} shadow-2xs`}
            >
              <div className="flex items-center justify-between text-ink-muted mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className={`text-xl sm:text-2xl font-serif font-bold tabular-nums ${card.color}`}>{card.value}</p>
              <p className="text-[11px] text-ink-muted mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue vs Collected vs Pending */}
      <div className="bg-white rounded-lg border border-border-subtle shadow-2xs p-5 md:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">Revenue Summary</h3>

        <div className="space-y-3">
          {/* Revenue bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-ink font-semibold">Total Revenue</span>
              <span className="tabular-nums font-bold text-ink">{formatCurrency(report.totalRevenue)}</span>
            </div>
            <div className="h-2 bg-brand-sand rounded-full overflow-hidden">
              <div className="h-full bg-brand-forest rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Collected bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-status-green font-semibold">Collected</span>
              <span className="tabular-nums font-bold text-status-green">{formatCurrency(report.totalCollected)}</span>
            </div>
            <div className="h-2 bg-brand-sand rounded-full overflow-hidden">
              <div
                className="h-full bg-status-green rounded-full transition-all"
                style={{
                  width: report.totalRevenue > 0
                    ? `${Math.min(100, (report.totalCollected / report.totalRevenue) * 100)}%`
                    : '0%'
                }}
              />
            </div>
          </div>

          {/* Pending bar */}
          {report.totalPending > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-status-amber font-semibold">Pending</span>
                <span className="tabular-nums font-bold text-status-amber">{formatCurrency(report.totalPending)}</span>
              </div>
              <div className="h-2 bg-brand-sand rounded-full overflow-hidden">
                <div
                  className="h-full bg-status-amber rounded-full transition-all"
                  style={{
                    width: report.totalRevenue > 0
                      ? `${Math.min(100, (report.totalPending / report.totalRevenue) * 100)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">Booking Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-brand-sand/60 rounded-xl text-center">
            <BedDouble className="w-4 h-4 text-ink-muted mx-auto mb-1" />
            <p className="text-2xl font-serif font-bold text-ink">{report.totalBookings}</p>
            <p className="text-xs text-ink-muted">Total</p>
          </div>
          <div className="p-4 bg-status-blue/10 rounded-xl text-center">
            <Clock className="w-4 h-4 text-status-blue mx-auto mb-1" />
            <p className="text-2xl font-serif font-bold text-status-blue">{report.confirmedBookings}</p>
            <p className="text-xs text-ink-muted">Active</p>
          </div>
          <div className="p-4 bg-status-green/10 rounded-xl text-center">
            <CheckCircle2 className="w-4 h-4 text-status-green mx-auto mb-1" />
            <p className="text-2xl font-serif font-bold text-status-green">{report.checkedOutBookings}</p>
            <p className="text-xs text-ink-muted">Checked Out</p>
          </div>
          <div className="p-4 bg-status-red/10 rounded-xl text-center">
            <XCircle className="w-4 h-4 text-status-red mx-auto mb-1" />
            <p className="text-2xl font-serif font-bold text-status-red">{report.cancelledBookings}</p>
            <p className="text-xs text-ink-muted">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Formula Notes */}
      <div className="bg-brand-sand rounded-xl border border-border-subtle p-4 text-xs text-ink-muted space-y-1">
        <p><strong className="text-ink">ADR</strong> = Total Revenue ÷ Room Nights Sold</p>
        <p><strong className="text-ink">RevPAR</strong> = ADR × Occupancy %</p>
        <p><strong className="text-ink">Occupancy %</strong> = Room Nights Sold ÷ (Total Rooms × Days in Month) × 100</p>
      </div>
    </div>
  );
}
