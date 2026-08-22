'use client';

import { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Coffee,
  Sun,
  Moon,
  Cookie,
  CreditCard,
  TrendingUp,
  Receipt,
  Download,
  Building,
  UserCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { FBReportsData } from '../../lib/fb/types';
import { formatCurrency } from '../../lib/utils/currency';

interface FBReportsViewProps {
  initialReports: FBReportsData;
  hotelId: string;
}

export default function FBReportsView({ initialReports, hotelId }: FBReportsViewProps) {
  const [reports, setReports] = useState<FBReportsData>(initialReports);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('this_month');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-forest" />
            Food & Beverage Reports & Analytics
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Sales trends, meal type revenue breakdown, top selling dishes, and GST tax reports.
          </p>
        </div>

        {/* Quick Period Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1 rounded-xl border border-border-subtle shadow-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === p.id
                  ? 'bg-brand-forest text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-brand-sand/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Executive Snapshot Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-card">
          <div className="text-xs text-ink-muted font-medium">Total F&B Revenue</div>
          <div className="text-xl font-bold text-ink mt-1 tabular-nums">
            {formatCurrency(reports.total_revenue)}
          </div>
          <div className="text-[11px] text-brand-forest mt-1 font-medium">
            {reports.total_orders} Total Invoices
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-card">
          <div className="text-xs text-ink-muted font-medium">Collections Recorded</div>
          <div className="text-xl font-bold text-status-green mt-1 tabular-nums">
            {formatCurrency(reports.total_collected)}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Direct Restaurant</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-card">
          <div className="text-xs text-ink-muted font-medium">Charged to Room Folios</div>
          <div className="text-xl font-bold text-status-blue mt-1 tabular-nums">
            {formatCurrency(reports.room_charges_total)}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Settled at Checkout</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-card">
          <div className="text-xs text-ink-muted font-medium">Total GST Collected</div>
          <div className="text-xl font-bold text-brand-forest mt-1 tabular-nums">
            {formatCurrency(reports.total_gst)}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">CGST + SGST (50/50)</div>
        </div>
      </div>

      {/* 2. Meal Performance & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Performance Breakdown */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-brand-forest" />
              Meal Performance Breakdown
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Breakfast', amount: reports.meals_breakdown.breakfast, icon: Coffee, color: 'bg-amber-500' },
              { label: 'Lunch', amount: reports.meals_breakdown.lunch, icon: Sun, color: 'bg-amber-600' },
              { label: 'Dinner', amount: reports.meals_breakdown.dinner, icon: Moon, color: 'bg-indigo-600' },
              { label: 'Snacks', amount: reports.meals_breakdown.snacks, icon: Cookie, color: 'bg-teal-600' },
              { label: 'Beverages', amount: reports.meals_breakdown.beverages, icon: Coffee, color: 'bg-cyan-600' },
              { label: 'Other / Banquet', amount: reports.meals_breakdown.other, icon: UtensilsCrossed, color: 'bg-stone-500' },
            ].map((m) => {
              const pct = reports.total_revenue > 0 ? Math.round((m.amount / reports.total_revenue) * 100) : 0;
              const Icon = m.icon;
              return (
                <div key={m.label} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <Icon className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{m.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums text-ink">{formatCurrency(m.amount)}</span>
                      <span className="text-[10px] text-ink-muted w-10 text-right">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-sand rounded-full h-1.5 overflow-hidden">
                    <div className={`${m.color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Analysis */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-forest" />
              Settlement & Payment Channels
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Charged to Room Folios', amount: reports.payments_breakdown.room_charge, color: 'bg-status-blue' },
              { label: 'UPI (GPay / PhonePe / QR)', amount: reports.payments_breakdown.upi, color: 'bg-status-green' },
              { label: 'Cash Payments', amount: reports.payments_breakdown.cash, color: 'bg-amber-600' },
              { label: 'Card Payments (POS Terminal)', amount: reports.payments_breakdown.card, color: 'bg-purple-600' },
              { label: 'Bank Transfer / Other', amount: reports.payments_breakdown.bank_transfer + reports.payments_breakdown.other, color: 'bg-stone-500' },
            ].map((p) => {
              const pct = reports.total_revenue > 0 ? Math.round((p.amount / reports.total_revenue) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums text-ink">{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] text-ink-muted w-10 text-right">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-sand rounded-full h-1.5 overflow-hidden">
                    <div className={`${p.color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Top Selling Items & Tax Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Items Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-forest" />
              Item Performance (Best Selling Dishes)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-sand/40 border-b border-border-subtle text-[11px] font-bold text-ink-muted uppercase">
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-ink">
                {reports.top_items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-muted">
                      No item sales records for this period.
                    </td>
                  </tr>
                ) : (
                  reports.top_items.slice(0, 8).map((item, idx) => (
                    <tr key={item.item_name} className="hover:bg-brand-sand/15">
                      <td className="py-2.5 px-3 font-semibold text-ink flex items-center gap-1.5">
                        <span className="w-4 text-center text-[11px] text-ink-muted">{idx + 1}.</span>
                        <span>{item.item_name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-ink-muted">{item.category_name}</td>
                      <td className="py-2.5 px-3 text-right font-bold tabular-nums">{item.quantity_sold}</td>
                      <td className="py-2.5 px-3 text-right text-ink-muted tabular-nums">{item.order_count}</td>
                      <td className="py-2.5 px-3 text-right font-bold tabular-nums text-brand-forest">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* GST Tax Report Summary */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-forest" />
              GST Tax Report
            </h2>
          </div>

          <div className="space-y-2.5 bg-brand-sand/20 p-3.5 rounded-lg border border-border-subtle text-xs">
            <div className="flex items-center justify-between text-ink-muted">
              <span>Taxable Sales</span>
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(reports.total_taxable)}</span>
            </div>

            <div className="flex items-center justify-between text-ink-muted">
              <span>CGST (Central Tax)</span>
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(reports.total_cgst)}</span>
            </div>

            <div className="flex items-center justify-between text-ink-muted">
              <span>SGST (State Tax)</span>
              <span className="font-semibold text-ink tabular-nums">{formatCurrency(reports.total_sgst)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-ink pt-2 border-t border-border-subtle">
              <span>Total GST Liability</span>
              <span className="font-bold text-brand-forest tabular-nums">{formatCurrency(reports.total_gst)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
