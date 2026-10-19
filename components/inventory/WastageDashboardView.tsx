'use client';

import React from 'react';
import {
  Trash2,
  AlertTriangle,
  TrendingDown,
  PieChart,
  Calendar,
  Plus,
  ArrowDownRight,
  Info,
  DollarSign,
  Utensils,
} from 'lucide-react';
import { InventoryTransaction, WastageSummary } from '../../lib/inventory/types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import EmptyState from '../shared/EmptyState';

interface WastageDashboardViewProps {
  wastageStats: WastageSummary;
  transactions: InventoryTransaction[];
  onOpenReportWaste: () => void;
  canReport: boolean;
}

export default function WastageDashboardView({
  wastageStats,
  transactions,
  onOpenReportWaste,
  canReport,
}: WastageDashboardViewProps) {
  const wasteTransactions = transactions.filter((t) => t.transaction_type === 'waste');

  return (
    <div className="space-y-6">
      {/* ── Wastage Financial KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Today's Wastage */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber">
              Today&apos;s Wastage
            </span>
            <div className="p-1 rounded bg-status-amber/10 text-status-amber">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-amber truncate">
            {formatCurrency(wastageStats.today_waste_value)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Reported today</p>
        </div>

        {/* This Month's Wastage */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-red">
              This Month&apos;s Wastage
            </span>
            <div className="p-1 rounded bg-status-red/10 text-status-red">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-red truncate">
            {formatCurrency(wastageStats.month_waste_value)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Monthly food/loss impact</p>
        </div>

        {/* Total Wastage Incidents */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Total Wastage Incidents
            </span>
            <div className="p-1 rounded bg-brand-sand text-brand-forest">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {wastageStats.total_waste_count}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Logged in audit trail</p>
        </div>
      </div>

      {/* ── Two-Column Breakdown: Highest Wasted Items & Reasons ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Highest Wasted Items */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Highest Wasted Items</h3>
              <p className="text-[11px] text-ink-muted">Top food items by cumulative monetary loss</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <Utensils className="w-4 h-4" />
            </div>
          </div>

          {wastageStats.highest_wasted_items.length === 0 ? (
            <p className="text-xs text-ink-muted py-4 text-center italic">
              No food wastage recorded. Great inventory efficiency!
            </p>
          ) : (
            <div className="space-y-3">
              {wastageStats.highest_wasted_items.map((item, idx) => (
                <div key={item.item_id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink-muted">{idx + 1}.</span>
                      <span className="font-semibold text-ink">{item.item_name}</span>
                      <span className="text-[11px] text-ink-muted font-mono">
                        ({item.quantity} {item.unit})
                      </span>
                    </div>
                    <span className="font-mono font-bold text-status-amber tabular-nums">
                      {formatCurrency(item.total_cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wastage by Reason */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Wastage Causes &amp; Reasons</h3>
              <p className="text-[11px] text-ink-muted">Spoilage, expiry, and kitchen error distribution</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          {wastageStats.reasons_breakdown.length === 0 ? (
            <p className="text-xs text-ink-muted py-4 text-center italic">
              No wastage causes reported.
            </p>
          ) : (
            <div className="space-y-3">
              {wastageStats.reasons_breakdown.map((r) => (
                <div key={r.reason} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{r.reason}</span>
                      <span className="text-[11px] text-ink-muted font-mono">({r.count} incidents)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-status-amber tabular-nums">
                        {formatCurrency(r.total_cost)}
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted w-10 text-right">
                        {r.share_pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-sand h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-status-amber h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, r.share_pct))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Wastage Movement Log Table ── */}
      <div className="pms-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-sand/30">
          <div>
            <h3 className="text-sm font-serif font-bold text-brand-forest">Wastage Audit History</h3>
            <p className="text-xs text-ink-muted">Complete logged incidents of consumable and food loss</p>
          </div>

          {canReport && (
            <button
              type="button"
              onClick={onOpenReportWaste}
              className="pms-btn-primary h-8 px-3 text-xs gap-1.5 bg-status-amber hover:bg-status-amber/90 self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Report Wastage</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="pms-table">
            <thead className="pms-table-header">
              <tr>
                <th className="pms-table-th">Date</th>
                <th className="pms-table-th">Item Name</th>
                <th className="pms-table-th">Category</th>
                <th className="pms-table-th text-right">Quantity Wasted</th>
                <th className="pms-table-th text-right">Estimated Loss</th>
                <th className="pms-table-th">Reason</th>
                <th className="pms-table-th">Reported By</th>
                <th className="pms-table-th">Notes</th>
              </tr>
            </thead>
            <tbody>
              {wasteTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Trash2}
                      title="No wastage incidents recorded"
                      description="When food spoilage or consumable waste occurs, use 'Report Wastage' to log the incident and track financial loss."
                      compact
                    />
                  </td>
                </tr>
              ) : (
                wasteTransactions.map((w) => (
                  <tr key={w.id} className="pms-table-row transition-colors">
                    <td className="pms-table-td whitespace-nowrap font-medium text-ink">
                      {formatDate(w.transaction_date)}
                    </td>
                    <td className="pms-table-td font-semibold text-ink">{w.item_name}</td>
                    <td className="pms-table-td text-ink-muted">{w.item_category}</td>
                    <td className="pms-table-td text-right font-mono font-semibold text-status-red whitespace-nowrap">
                      {Math.abs(w.quantity)} {w.unit}
                    </td>
                    <td className="pms-table-td text-right font-mono font-bold text-status-amber whitespace-nowrap">
                      {formatCurrency(w.total_cost)}
                    </td>
                    <td className="pms-table-td">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-amber/15 text-status-amber border border-status-amber/30">
                        {w.reason || 'Wastage'}
                      </span>
                    </td>
                    <td className="pms-table-td text-xs text-ink">{w.recorder_name || 'Staff'}</td>
                    <td className="pms-table-td text-xs text-ink-muted max-w-[200px] truncate">
                      {w.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
