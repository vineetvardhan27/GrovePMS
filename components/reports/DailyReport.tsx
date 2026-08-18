'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { DailyReport } from '../../lib/reports/queries';
import { fetchDailyReport } from '../../lib/reports/server-actions';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';

interface DailyReportViewProps {
  initialReport: DailyReport;
}

const MODE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  cash: { label: 'Cash', icon: Banknote, color: 'text-status-green' },
  upi: { label: 'UPI', icon: Smartphone, color: 'text-status-blue' },
  card: { label: 'Card', icon: CreditCard, color: 'text-status-amber' },
  bank_transfer: { label: 'Bank Transfer', icon: Building2, color: 'text-brand-forest' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'text-ink-muted' },
};

export default function DailyReportView({ initialReport }: DailyReportViewProps) {
  const [selectedDate, setSelectedDate] = useState(initialReport.date);
  const [report, setReport] = useState<DailyReport>(initialReport);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setIsLoading(true);
    try {
      const newReport = await fetchDailyReport(date);
      setReport(newReport);
    } catch {
      // noop
    } finally {
      setIsLoading(false);
    }
  };

  const modeEntries = Object.entries(report.collectionByMode).filter(([, amt]) => amt > 0);

  return (
    <div className={`space-y-6 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-4 h-4 text-ink-muted" />
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 bg-white border border-border-subtle rounded-lg text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-[38px]"
          />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border-subtle hover:bg-brand-sand text-ink text-xs font-medium transition-colors cursor-pointer min-h-[38px] print:hidden"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Report</span>
        </button>
      </div>

      {/* Date heading */}
      <div className="text-center py-2">
        <h2 className="text-lg font-serif font-bold text-brand-forest">
          Daily Report — {formatDate(selectedDate)}
        </h2>
      </div>

      {/* Collection Summary */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">Collection Summary</h3>

        {report.collection === 0 ? (
          <div className="flex items-center gap-2 text-ink-muted text-sm py-4 justify-center">
            <AlertCircle className="w-4 h-4" />
            <span>No payments recorded on this date.</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {modeEntries.map(([mode, amount]) => {
                const config = MODE_CONFIG[mode] || MODE_CONFIG.other;
                const ModeIcon = config.icon;
                return (
                  <div key={mode} className="p-4 bg-brand-sand/60 rounded-xl border border-border-subtle">
                    <ModeIcon className={`w-4 h-4 mb-1.5 ${config.color}`} />
                    <p className="text-xs text-ink-muted font-medium">{config.label}</p>
                    <p className="text-lg font-bold text-ink tabular-nums">{formatCurrency(amount)}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-forest font-bold text-brand-forest text-lg">
              <span>Total Collected</span>
              <span className="tabular-nums">{formatCurrency(report.collection)}</span>
            </div>
            <p className="text-xs text-ink-muted mt-1">{report.transactionCount} transaction{report.transactionCount !== 1 ? 's' : ''}</p>
          </>
        )}
      </div>

      {/* Arrivals & Departures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Arrivals */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-status-amber" />
            <h3 className="text-sm font-bold text-ink">Arrivals ({report.arrivals.length})</h3>
          </div>
          {report.arrivals.length === 0 ? (
            <p className="text-xs text-ink-muted text-center py-4">No arrivals on this date.</p>
          ) : (
            <div className="space-y-3">
              {report.arrivals.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-ink">{b.guest.full_name}</p>
                    <p className="text-ink-muted">Room {b.room.room_number} · {b.adults} Adults</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize
                    ${b.booking_status === 'checked_in' ? 'bg-status-green/15 text-status-green' : 'bg-status-amber/15 text-status-amber'}`}>
                    {b.booking_status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Departures */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-4 h-4 text-status-blue" />
            <h3 className="text-sm font-bold text-ink">Departures ({report.departures.length})</h3>
          </div>
          {report.departures.length === 0 ? (
            <p className="text-xs text-ink-muted text-center py-4">No departures on this date.</p>
          ) : (
            <div className="space-y-3">
              {report.departures.map((b) => {
                const balance = Math.max(0, b.total_amount - b.advance_amount);
                return (
                  <div key={b.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-ink">{b.guest.full_name}</p>
                      <p className="text-ink-muted">
                        Room {b.room.room_number}
                        {balance > 0 && <span className="text-status-amber"> · {formatCurrency(balance)} due</span>}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize
                      ${b.booking_status === 'checked_out' ? 'bg-ink-muted/15 text-ink-muted' : 'bg-status-green/15 text-status-green'}`}>
                      {b.booking_status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pending Balance */}
      {report.pendingBalance > 0 && (
        <div className="bg-status-amber/10 border border-status-amber/25 rounded-xl p-5 flex items-start gap-3">
          <Clock className="w-5 h-5 text-status-amber shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-ink">
              Pending Balance: <span className="text-status-amber tabular-nums">{formatCurrency(report.pendingBalance)}</span>
            </p>
            <p className="text-xs text-ink-muted mt-0.5">
              Across {report.pendingCount} booking{report.pendingCount !== 1 ? 's' : ''} with arrivals on this date.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
