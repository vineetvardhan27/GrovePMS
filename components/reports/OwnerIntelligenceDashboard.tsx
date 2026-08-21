'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  HotelOwnerIntelligence,
  ReportPeriod,
  NeedsAttentionAlert,
  OutstandingAccount,
} from '../../lib/reports/types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  BedDouble,
  Users,
  AlertTriangle,
  ArrowRight,
  Printer,
  ChevronRight,
  PieChart,
  ShoppingBag,
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  Phone,
  Utensils,
  Trash2,
  Clock,
  ArrowUpRight,
  Package,
  ShieldAlert,
} from 'lucide-react';

interface OwnerIntelligenceDashboardProps {
  data: HotelOwnerIntelligence;
}

const PERIOD_OPTIONS: { id: ReportPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'this_year', label: 'This Year' },
];

export default function OwnerIntelligenceDashboard({ data }: OwnerIntelligenceDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('period', newPeriod);
    router.push(`/reports?${params.toString()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* ── Executive Header & Period Selector Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1 border-b border-border-subtle print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-sand text-brand-forest border border-border-subtle">
              Executive View
            </span>
            <span className="text-xs text-ink-muted">
              {formatDate(data.startDate)} {data.startDate !== data.endDate && `– ${formatDate(data.endDate)}`}
            </span>
          </div>
          <h2 className="text-display font-serif text-brand-forest mt-0.5">
            Hotel Performance Intelligence
          </h2>
        </div>

        {/* Period Selector & Print Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-brand-sand/60 p-1 rounded-xl border border-border-subtle overflow-x-auto">
            {PERIOD_OPTIONS.map((opt) => {
              const isActive = data.period === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePeriodChange(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-forest text-white shadow-2xs'
                      : 'text-ink-muted hover:text-ink hover:bg-white/60'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="pms-btn-secondary h-9 px-3 text-xs gap-1.5 font-medium shrink-0"
            title="Print executive hotel performance summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b border-border-subtle pb-3">
        <h1 className="text-xl font-serif font-bold text-brand-forest">{data.hotelName}</h1>
        <p className="text-xs text-ink-muted">
          Executive Operations &amp; Financial Report — Period: {data.periodLabel} ({data.startDate} to {data.endDate})
        </p>
      </div>

      {/* ── 1. Top Executive KPIs (5 Zero-Clip Metric Cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Business Generated */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Business Value
            </span>
            <Building2 className="w-4 h-4 text-brand-forest/60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(data.totalBusinessValue)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-ink-muted">
            <span className="text-status-green font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{data.growth.revenueGrowthPct}%
            </span>
            <span>vs prior</span>
          </div>
        </div>

        {/* Total Actual Collected */}
        <div className="pms-card p-4 flex flex-col justify-between border-l-4 border-l-status-green bg-status-green/5">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-green">
              Actual Collected
            </span>
            <DollarSign className="w-4 h-4 text-status-green" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-green truncate">
            {formatCurrency(data.totalCollected)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {data.collectionRate}% collection rate
          </p>
        </div>

        {/* Outstanding Balance */}
        <div
          className={`pms-card p-4 flex flex-col justify-between transition-colors ${
            data.outstandingDue > 0 ? 'border-l-4 border-l-status-amber bg-status-amber/5' : ''
          }`}
        >
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber">
              Outstanding Due
            </span>
            <AlertTriangle className="w-4 h-4 text-status-amber" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-amber truncate">
            {formatCurrency(data.outstandingDue)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {data.topOutstandingAccounts.length} open receivables
          </p>
        </div>

        {/* Room Occupancy */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Period Occupancy
            </span>
            <BedDouble className="w-4 h-4 text-brand-forest/60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest">
            {data.roomPerformance.periodOccupancyPercent}%
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            Today: {data.roomPerformance.occupancyPercentToday}% ({data.roomPerformance.occupiedRoomsToday}/{data.roomPerformance.totalRooms} rooms)
          </p>
        </div>

        {/* ADR / RevPAR */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              ADR / RevPAR
            </span>
            <PieChart className="w-4 h-4 text-brand-forest/60" />
          </div>
          <p className="text-lg sm:text-xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(data.roomPerformance.adr)}{' '}
            <span className="text-xs font-normal text-ink-muted">/ {formatCurrency(data.roomPerformance.revpar)}</span>
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {data.roomPerformance.roomNightsSold} room nights sold
          </p>
        </div>
      </div>

      {/* ── 2. Needs Attention Action Center (Owner Alerts) ── */}
      {data.needsAttention.length > 0 && (
        <div className="pms-card p-4 bg-status-amber/10 border-status-amber/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-status-amber text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-serif font-bold text-brand-forest">
                Items Requiring Owner Attention ({data.needsAttention.length})
              </h3>
            </div>
            <span className="text-[11px] text-ink-muted font-medium">Real-time operational alerts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {data.needsAttention.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-white rounded-xl border border-status-amber/30 flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      alert.severity === 'high'
                        ? 'bg-status-red/15 text-status-red border border-status-red/30'
                        : 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                    }`}
                  >
                    {alert.category}
                  </span>
                  <p className="font-bold text-xs text-ink leading-tight">{alert.title}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-normal">{alert.description}</p>
                </div>

                {alert.actionUrl && (
                  <Link
                    href={alert.actionUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline self-start mt-1"
                  >
                    <span>{alert.actionLabel || 'Inspect'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Revenue by Business Area & Collections vs Revenue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue by Business Area (2 Cols) */}
        <div className="pms-card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Business Generation by Area</h3>
              <p className="text-[11px] text-ink-muted">Where hotel revenue originates for the active period</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rooms */}
            <div className="p-3.5 bg-brand-sand/50 rounded-xl border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-brand-forest" />
                  Rooms
                </span>
                <span className="font-mono text-xs font-bold text-brand-forest">
                  {data.sources.rooms.share_pct}%
                </span>
              </div>
              <p className="text-lg font-bold font-sans tabular-nums text-brand-forest">
                {formatCurrency(data.sources.rooms.billed)}
              </p>
              <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-forest h-full rounded-full"
                  style={{ width: `${Math.min(100, data.sources.rooms.share_pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-ink-muted flex items-center justify-between">
                <span>Collected: {formatCurrency(data.sources.rooms.collected)}</span>
              </div>
            </div>

            {/* Banquet */}
            <div className="p-3.5 bg-brand-sand/50 rounded-xl border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-status-amber" />
                  Banquet Hall
                </span>
                <span className="font-mono text-xs font-bold text-status-amber">
                  {data.sources.banquet.share_pct}%
                </span>
              </div>
              <p className="text-lg font-bold font-sans tabular-nums text-brand-forest">
                {formatCurrency(data.sources.banquet.billed)}
              </p>
              <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-status-amber h-full rounded-full"
                  style={{ width: `${Math.min(100, data.sources.banquet.share_pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-ink-muted flex items-center justify-between">
                <span>Collected: {formatCurrency(data.sources.banquet.collected)}</span>
              </div>
            </div>

            {/* Food & Beverage */}
            <div className="p-3.5 bg-brand-sand/50 rounded-xl border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-status-green" />
                  F&amp;B / Catering
                </span>
                <span className="font-mono text-xs font-bold text-status-green">
                  {data.sources.food_beverage.share_pct}%
                </span>
              </div>
              <p className="text-lg font-bold font-sans tabular-nums text-brand-forest">
                {formatCurrency(data.sources.food_beverage.billed)}
              </p>
              <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-status-green h-full rounded-full"
                  style={{ width: `${Math.min(100, data.sources.food_beverage.share_pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-ink-muted flex items-center justify-between">
                <span>Room Charges: {formatCurrency(data.fbPerformance.roomServiceRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collections vs Revenue Comparison (1 Col) */}
        <div className="pms-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Collections vs Revenue</h3>
              <p className="text-[11px] text-ink-muted">Cash realization vs billed value</p>
            </div>
            <div className="p-1.5 bg-status-green/15 text-status-green rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Billed Business Value:</span>
              <span className="font-mono font-bold text-ink">{formatCurrency(data.totalBusinessValue)}</span>
            </div>
            <div className="flex items-center justify-between text-status-green font-semibold">
              <span>Actual Cash Collected:</span>
              <span className="font-mono font-bold">{formatCurrency(data.totalCollected)}</span>
            </div>
            <div className="flex items-center justify-between text-status-amber font-semibold">
              <span>Unpaid Outstanding:</span>
              <span className="font-mono font-bold">{formatCurrency(data.outstandingDue)}</span>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between text-[11px] mb-1 text-ink-muted">
                <span>Realization Progress</span>
                <span className="font-mono font-bold text-brand-forest">{data.collectionRate}%</span>
              </div>
              <div className="w-full bg-brand-sand h-2 rounded-full overflow-hidden">
                <div
                  className="bg-status-green h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, data.collectionRate))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-brand-sand/50 rounded-lg text-[11px] text-ink-muted flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-forest shrink-0" />
            <span>Taxes included: {formatCurrency(data.taxesCollected)} · Refunds: {formatCurrency(data.refundsIssued)}</span>
          </div>
        </div>
      </div>

      {/* ── 4. Room Performance & Operational Flow ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Room Performance & Booking Funnel */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Room Booking Performance</h3>
              <p className="text-[11px] text-ink-muted">Booking status distribution &amp; stay metrics</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Total Bookings</span>
              <span className="text-lg font-bold font-sans tabular-nums text-brand-forest">
                {data.roomPerformance.totalBookings}
              </span>
            </div>
            <div className="p-2.5 bg-status-green/10 rounded-xl border border-status-green/20 text-status-green">
              <span className="text-[10px] block uppercase font-bold">Confirmed</span>
              <span className="text-lg font-bold font-sans tabular-nums">
                {data.roomPerformance.confirmedBookings}
              </span>
            </div>
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle text-ink">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Checked In</span>
              <span className="text-lg font-bold font-sans tabular-nums">
                {data.roomPerformance.checkedInBookings}
              </span>
            </div>
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle text-ink">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Checked Out</span>
              <span className="text-lg font-bold font-sans tabular-nums">
                {data.roomPerformance.checkedOutBookings}
              </span>
            </div>
          </div>

          <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle flex items-center justify-between text-xs">
            <div>
              <span className="text-ink-muted block text-[11px]">Average Length of Stay</span>
              <span className="font-bold text-ink">{data.roomPerformance.avgStayNights} nights / guest</span>
            </div>
            <div className="text-right">
              <span className="text-ink-muted block text-[11px]">Room Revenue Generated</span>
              <span className="font-mono font-bold text-brand-forest">
                {formatCurrency(data.roomPerformance.totalRoomRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Operational Snapshot (Arrivals / Departures / In-House) */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Today's Operations</h3>
              <p className="text-[11px] text-ink-muted">In-house guests, arrivals, departures &amp; events</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">In-House Guests</span>
              <span className="text-lg font-bold font-sans tabular-nums text-brand-forest">
                {data.inHouseGuestsCount}
              </span>
            </div>
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Arrivals Today</span>
              <span className="text-lg font-bold font-sans tabular-nums text-ink">
                {data.arrivalsToday.length}
              </span>
            </div>
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Departures Today</span>
              <span className="text-lg font-bold font-sans tabular-nums text-ink">
                {data.departuresToday.length}
              </span>
            </div>
          </div>

          {/* Quick list of today's arrivals */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
              Expected Today ({data.arrivalsToday.length} check-ins)
            </span>
            {data.arrivalsToday.length === 0 ? (
              <p className="text-ink-muted italic text-[11px] py-1">No pending arrivals today.</p>
            ) : (
              data.arrivalsToday.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2 bg-brand-sand/30 rounded-lg text-[11px]"
                >
                  <span className="font-semibold text-ink truncate">
                    {b.guest?.full_name} ({b.room?.room_number ? `Room ${b.room.room_number}` : 'Room'})
                  </span>
                  <span className="font-mono text-ink-muted">{formatCurrency(b.total_amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 5. Payment Modes & Inventory / Wastage Impact ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Collections by Payment Mode</h3>
              <p className="text-[11px] text-ink-muted">Cash vs UPI vs Card distribution across PMS</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(data.paymentModes).map(([mode, amt]) => {
              const total = data.totalCollected || 1;
              const pct = Math.round((amt / total) * 100 * 10) / 10;
              return (
                <div key={mode} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="capitalize font-semibold text-ink">{mode.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-ink">{formatCurrency(amt)}</span>
                      <span className="font-mono text-[11px] text-ink-muted w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-sand h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-forest h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory & Operational Spoilage Impact */}
        <div className="pms-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest">Inventory &amp; Operational Loss</h3>
              <p className="text-[11px] text-ink-muted">Asset health, stock valuation &amp; food wastage</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Total Stock Valuation</span>
              <span className="text-base font-bold font-sans tabular-nums text-brand-forest">
                {formatCurrency(data.inventoryImpact.totalStockValue)}
              </span>
            </div>

            <div className="p-3 bg-status-amber/10 rounded-xl border border-status-amber/20 text-status-amber">
              <span className="text-[10px] block uppercase font-bold">Monthly Food Wastage</span>
              <span className="text-base font-bold font-sans tabular-nums">
                {formatCurrency(data.inventoryImpact.monthWastage)}
              </span>
            </div>

            <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Damaged Assets</span>
              <span className="text-base font-bold font-sans tabular-nums text-status-red">
                {data.inventoryImpact.totalDamagedAssets} units
              </span>
            </div>

            <div className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle">
              <span className="text-[10px] text-ink-muted block uppercase font-bold">Low-Stock Items</span>
              <span className="text-base font-bold font-sans tabular-nums text-status-amber">
                {data.inventoryImpact.lowStockItemsCount} items
              </span>
            </div>
          </div>

          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-forest hover:underline"
          >
            <span>Open Complete Inventory &amp; Asset Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 6. Actionable Outstanding Receivables Hub ── */}
      <div id="outstanding-receivables" className="pms-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-sand/40">
          <div>
            <h3 className="text-sm font-serif font-bold text-brand-forest">
              Top Outstanding Accounts &amp; Receivables
            </h3>
            <p className="text-xs text-ink-muted">
              Uncollected balances across Room folios and Banquet events
            </p>
          </div>
          <Link
            href="/payments"
            className="text-xs font-bold text-brand-forest hover:underline inline-flex items-center gap-1"
          >
            <span>Open Global Payments Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="pms-table text-xs">
            <thead className="pms-table-header">
              <tr>
                <th className="pms-table-th">Customer / Host</th>
                <th className="pms-table-th">Source</th>
                <th className="pms-table-th">Reference / Resource</th>
                <th className="pms-table-th text-right">Total Billed</th>
                <th className="pms-table-th text-right">Paid</th>
                <th className="pms-table-th text-right">Outstanding Due</th>
                <th className="pms-table-th-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.topOutstandingAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-ink-muted italic">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-status-green mb-1" />
                    All guest and event accounts are fully settled. Zero outstanding due!
                  </td>
                </tr>
              ) : (
                data.topOutstandingAccounts.map((acc) => (
                  <tr key={acc.id} className="pms-table-row transition-colors">
                    <td className="pms-table-td">
                      <p className="font-semibold text-ink">{acc.customerName}</p>
                      {acc.phone && (
                        <p className="text-[11px] text-ink-muted font-mono">{acc.phone}</p>
                      )}
                    </td>
                    <td className="pms-table-td">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          acc.source === 'banquet'
                            ? 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                            : 'bg-brand-sand text-brand-forest border border-border-subtle'
                        }`}
                      >
                        {acc.source}
                      </span>
                    </td>
                    <td className="pms-table-td">
                      <p className="font-medium text-ink">{acc.reference}</p>
                      <p className="text-[11px] text-ink-muted">{acc.resourceName}</p>
                    </td>
                    <td className="pms-table-td text-right font-mono text-ink">
                      {formatCurrency(acc.billedAmount)}
                    </td>
                    <td className="pms-table-td text-right font-mono text-status-green font-semibold">
                      {formatCurrency(acc.paidAmount)}
                    </td>
                    <td className="pms-table-td text-right font-mono font-bold text-status-amber">
                      {formatCurrency(acc.balanceDue)}
                    </td>
                    <td className="pms-table-td whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <Link
                          href={acc.url}
                          className="pms-btn-primary h-7 px-2.5 text-xs gap-1 font-medium"
                        >
                          <span>Open Folio</span>
                          <ArrowRight className="w-3 h-3" />
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
    </div>
  );
}
