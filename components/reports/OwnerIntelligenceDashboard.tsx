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
    <div className="space-y-4 sm:space-y-4.5 print:space-y-4">
      {/* ── Executive Header & Period Selector Toolbar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 pb-3 border-b border-border-subtle print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-sand text-brand-forest border border-border-subtle">
              Executive View
            </span>
            <span className="text-xs text-ink-muted">
              {formatDate(data.startDate)} {data.startDate !== data.endDate && `– ${formatDate(data.endDate)}`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest tracking-tight leading-tight">
            Hotel Performance Intelligence
          </h1>
        </div>

        {/* Period Selector & Print Trigger (Unified Single-Row System) */}
        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap shrink-0">
          <div className="flex items-center bg-brand-sand/60 p-0.5 rounded-lg border border-border-subtle overflow-x-auto">
            {PERIOD_OPTIONS.map((opt) => {
              const isActive = data.period === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePeriodChange(opt.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
            className="pms-btn-secondary h-8 px-2.5 sm:px-3 text-xs gap-1.5 font-medium shadow-2xs shrink-0"
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

      {/* ── 1. Top Executive KPIs (5 Uniformly Aligned Cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total Business Generated */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Business Value
            </span>
            <Building2 className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(data.totalBusinessValue)}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-ink-muted truncate">
            <span className="text-status-green font-semibold inline-flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{data.growth.revenueGrowthPct}%
            </span>
            <span>vs prior</span>
          </div>
        </div>

        {/* Total Actual Collected */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-green">
              Actual Collected
            </span>
            <DollarSign className="w-3.5 h-3.5 text-status-green" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-green truncate">
            {formatCurrency(data.totalCollected)}
          </p>
          <p className="text-[10.5px] text-ink-muted mt-0.5 truncate">
            {data.collectionRate}% collection rate
          </p>
        </div>

        {/* Outstanding Balance */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber">
              Outstanding Due
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-status-amber" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-status-amber truncate">
            {formatCurrency(data.outstandingDue)}
          </p>
          <p className="text-[10.5px] text-ink-muted mt-0.5 truncate">
            {data.topOutstandingAccounts.length} open receivables
          </p>
        </div>

        {/* Room Occupancy */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Period Occupancy
            </span>
            <BedDouble className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-brand-forest">
            {data.roomPerformance.periodOccupancyPercent}%
          </p>
          <p className="text-[10.5px] text-ink-muted mt-0.5 truncate">
            Today: {data.roomPerformance.occupancyPercentToday}% ({data.roomPerformance.occupiedRoomsToday}/{data.roomPerformance.totalRooms} rooms)
          </p>
        </div>

        {/* ADR / RevPAR */}
        <div className="pms-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[96px]">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              ADR / RevPAR
            </span>
            <PieChart className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-lg sm:text-xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(data.roomPerformance.adr)}{' '}
            <span className="text-xs font-normal text-ink-muted">/ {formatCurrency(data.roomPerformance.revpar)}</span>
          </p>
          <p className="text-[10.5px] text-ink-muted mt-0.5 truncate">
            {data.roomPerformance.roomNightsSold} room nights sold
          </p>
        </div>
      </div>

      {/* ── 2. Needs Attention Action Center (Compact Production-Grade Alert Component) ── */}
      <div className="pms-card p-0 bg-white border border-border-subtle shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b border-border-subtle bg-brand-sand/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-amber" />
            <h2 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
              <span>Needs Attention</span>
              <span className="text-ink-muted font-normal">·</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-sand text-brand-forest border border-border-subtle">
                {data.needsAttention.length}
              </span>
            </h2>
          </div>
          <span className="text-[11px] text-ink-muted font-medium">Real-time operational alerts</span>
        </div>

        {/* Dynamic Alerts List or All-Clear State */}
        {data.needsAttention.length === 0 ? (
          <div className="p-4 sm:p-5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-ink">All operational systems clear</p>
                <p className="text-[11px] text-ink-muted">
                  There are no critical stock shortages, damaged assets, or overdue balances requiring immediate attention.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-sand text-brand-forest border border-border-subtle shrink-0">
              All Clear
            </span>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {data.needsAttention.map((alert) => {
              const isHigh = alert.severity === 'high';
              const isMedium = alert.severity === 'medium';
              const SeverityIcon = isHigh ? ShieldAlert : isMedium ? AlertTriangle : Info;
              const severityColor = isHigh
                ? 'text-status-red'
                : isMedium
                ? 'text-status-amber'
                : 'text-status-blue';
              const severityBg = isHigh
                ? 'bg-status-red/10'
                : isMedium
                ? 'bg-status-amber/10'
                : 'bg-status-blue/10';
              const severityLabel = isHigh ? 'Critical' : isMedium ? 'Warning' : 'Notice';

              const rowContent = (
                <div className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3.5 sm:px-5 sm:py-3 hover:bg-brand-sand/30 transition-colors cursor-pointer min-h-[72px]">
                  {/* Left: Icon, Category & Problem details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`p-1.5 rounded-md ${severityBg} shrink-0 mt-0.5`}>
                      <SeverityIcon className={`w-4 h-4 ${severityColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                          {alert.category}
                        </span>
                        <span className="text-ink-muted/40 text-[10px]">·</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${severityColor}`}>
                          {severityLabel}
                        </span>
                      </div>

                      <p className="text-xs sm:text-[13px] font-bold text-ink leading-tight">
                        {alert.title}
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action link with hover arrow transition */}
                  {alert.actionUrl && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-brand-forest group-hover:text-brand-forest/80 shrink-0 self-end sm:self-center pl-10 sm:pl-4 transition-colors">
                      <span>{alert.actionLabel || 'Review'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
                    </div>
                  )}
                </div>
              );

              return alert.actionUrl ? (
                <Link key={alert.id} href={alert.actionUrl} className="block">
                  {rowContent}
                </Link>
              ) : (
                <div key={alert.id}>{rowContent}</div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. Row 1: Business Generation & Collections vs Revenue (66% / 33%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Business Generation by Area (Primary: 2 Cols) */}
        <div className="pms-card p-4 lg:col-span-2 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest leading-tight">Business Generation by Area</h3>
              <p className="text-[11px] text-ink-muted mt-0.5">Where hotel revenue originates for the active period</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest shrink-0">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-auto">
            {/* Rooms */}
            <div className="p-3 bg-brand-sand/50 rounded-xl border border-border-subtle flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-brand-forest" />
                  Rooms
                </span>
                <span className="font-mono text-xs font-bold text-brand-forest">
                  {data.sources.rooms.share_pct}%
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold font-sans tabular-nums text-brand-forest">
                {formatCurrency(data.sources.rooms.billed)}
              </p>
              <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-forest h-full rounded-full"
                  style={{ width: `${Math.min(100, data.sources.rooms.share_pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-ink-muted truncate">
                Collected: <span className="font-mono font-medium text-ink">{formatCurrency(data.sources.rooms.collected)}</span>
              </div>
            </div>

            {/* Banquet */}
            <div className="p-3 bg-brand-sand/50 rounded-xl border border-border-subtle flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-status-amber" />
                  Banquet Hall
                </span>
                <span className="font-mono text-xs font-bold text-status-amber">
                  {data.sources.banquet.share_pct}%
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold font-sans tabular-nums text-brand-forest">
                {formatCurrency(data.sources.banquet.billed)}
              </p>
              <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-status-amber h-full rounded-full"
                  style={{ width: `${Math.min(100, data.sources.banquet.share_pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-ink-muted truncate">
                Collected: <span className="font-mono font-medium text-ink">{formatCurrency(data.sources.banquet.collected)}</span>
              </div>
            </div>

            {/* Food & Beverage */}
            <div className="p-3 bg-brand-sand/50 rounded-xl border border-border-subtle flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-status-green" />
                  F&amp;B / Catering
                </span>
                <span className="font-mono text-xs font-bold text-status-green">
                  {data.sources.food_beverage.share_pct}%
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold font-sans tabular-nums text-brand-forest">
                {formatCurrency(data.sources.food_beverage.billed)}
              </p>
              <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-status-green h-full rounded-full"
                  style={{ width: `${Math.min(100, data.sources.food_beverage.share_pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-ink-muted truncate">
                Room Charges: <span className="font-mono font-medium text-ink">{formatCurrency(data.fbPerformance.roomServiceRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collections vs Revenue (Secondary: 1 Col) */}
        <div className="pms-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest leading-tight">Collections vs Revenue</h3>
              <p className="text-[11px] text-ink-muted mt-0.5">Cash realization vs billed value</p>
            </div>
            <div className="p-1.5 bg-status-green/15 text-status-green rounded-lg shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2 text-xs my-auto">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Billed Business Value</span>
              <span className="font-mono font-bold text-ink tabular-nums">{formatCurrency(data.totalBusinessValue)}</span>
            </div>
            <div className="flex items-center justify-between text-status-green font-semibold">
              <span>Actual Cash Collected</span>
              <span className="font-mono font-bold tabular-nums">{formatCurrency(data.totalCollected)}</span>
            </div>
            <div className="flex items-center justify-between text-status-amber font-semibold">
              <span>Unpaid Outstanding</span>
              <span className="font-mono font-bold tabular-nums">{formatCurrency(data.outstandingDue)}</span>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between text-[11px] mb-1 text-ink-muted">
                <span>Realization Progress</span>
                <span className="font-mono font-bold text-brand-forest">{data.collectionRate}%</span>
              </div>
              <div className="w-full bg-brand-sand h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-status-green h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, data.collectionRate))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2 bg-brand-sand/50 rounded-lg text-[10.5px] text-ink-muted flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-forest shrink-0" />
            <span className="truncate">Taxes: {formatCurrency(data.taxesCollected)} · Refunds: {formatCurrency(data.refundsIssued)}</span>
          </div>
        </div>
      </div>

      {/* ── 4. Row 2: Room Booking Performance & Today's Operations (66% / 33%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Room Booking Performance (Primary: 2 Cols) */}
        <div className="pms-card p-4 lg:col-span-2 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest leading-tight">Room Booking Performance</h3>
              <p className="text-[11px] text-ink-muted mt-0.5">Booking status distribution &amp; stay metrics</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest shrink-0">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs my-auto">
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Total Bookings</span>
              <span className="text-lg font-bold font-sans tabular-nums text-brand-forest mt-1">
                {data.roomPerformance.totalBookings}
              </span>
            </div>
            <div className="p-2.5 bg-status-green/10 rounded-xl border border-status-green/20 text-status-green flex flex-col justify-between">
              <span className="text-[10px] block uppercase font-bold truncate">Confirmed</span>
              <span className="text-lg font-bold font-sans tabular-nums mt-1">
                {data.roomPerformance.confirmedBookings}
              </span>
            </div>
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle text-ink flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Checked In</span>
              <span className="text-lg font-bold font-sans tabular-nums mt-1">
                {data.roomPerformance.checkedInBookings}
              </span>
            </div>
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle text-ink flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Checked Out</span>
              <span className="text-lg font-bold font-sans tabular-nums mt-1">
                {data.roomPerformance.checkedOutBookings}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle flex items-center justify-between text-xs">
            <div>
              <span className="text-ink-muted block text-[10px] uppercase font-bold">Average Length of Stay</span>
              <span className="font-bold text-ink text-xs">{data.roomPerformance.avgStayNights} nights / guest</span>
            </div>
            <div className="text-right">
              <span className="text-ink-muted block text-[10px] uppercase font-bold">Room Revenue Generated</span>
              <span className="font-mono font-bold text-brand-forest text-xs tabular-nums">
                {formatCurrency(data.roomPerformance.totalRoomRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Operations (Secondary: 1 Col) */}
        <div className="pms-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest leading-tight">Today's Operations</h3>
              <p className="text-[11px] text-ink-muted mt-0.5">In-house guests, arrivals, departures &amp; events</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-brand-sand/40 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">In-House Guests</span>
              <span className="text-lg font-bold font-sans tabular-nums text-brand-forest mt-0.5">
                {data.inHouseGuestsCount}
              </span>
            </div>
            <div className="p-2 bg-brand-sand/40 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Arrivals Today</span>
              <span className="text-lg font-bold font-sans tabular-nums text-ink mt-0.5">
                {data.arrivalsToday.length}
              </span>
            </div>
            <div className="p-2 bg-brand-sand/40 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Departures Today</span>
              <span className="text-lg font-bold font-sans tabular-nums text-ink mt-0.5">
                {data.departuresToday.length}
              </span>
            </div>
          </div>

          {/* Expected arrivals */}
          <div className="space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
              Expected Today ({data.arrivalsToday.length} check-ins)
            </span>
            {data.arrivalsToday.length === 0 ? (
              <div className="p-2 bg-brand-sand/20 rounded-lg text-center text-ink-muted italic text-[11px]">
                No pending arrivals today.
              </div>
            ) : (
              data.arrivalsToday.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-1.5 px-2 bg-brand-sand/30 rounded-lg text-[11px]"
                >
                  <span className="font-semibold text-ink truncate">
                    {b.guest?.full_name} ({b.room?.room_number ? `Room ${b.room.room_number}` : 'Room'})
                  </span>
                  <span className="font-mono text-ink-muted tabular-nums">{formatCurrency(b.total_amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 5. Row 3: Payment Modes & Inventory Loss (66% / 33%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Collections by Payment Mode (Primary: 2 Cols) */}
        <div className="pms-card p-4 lg:col-span-2 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest leading-tight">Collections by Payment Mode</h3>
              <p className="text-[11px] text-ink-muted mt-0.5">Cash vs UPI vs Card distribution across PMS</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2.5 text-xs my-auto">
            {Object.entries(data.paymentModes).map(([mode, amt]) => {
              const total = data.totalCollected || 1;
              const pct = Math.round((amt / total) * 100 * 10) / 10;
              return (
                <div key={mode} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="capitalize font-semibold text-ink text-xs">{mode.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-ink text-xs tabular-nums">{formatCurrency(amt)}</span>
                      <span className="font-mono text-[10.5px] text-ink-muted w-10 text-right tabular-nums">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-sand h-1 rounded-full overflow-hidden">
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

        {/* Inventory & Operational Loss (Secondary: 1 Col) */}
        <div className="pms-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-serif font-bold text-brand-forest leading-tight">Inventory &amp; Operational Loss</h3>
              <p className="text-[11px] text-ink-muted mt-0.5">Asset health, stock valuation &amp; food wastage</p>
            </div>
            <div className="p-1.5 bg-brand-sand rounded-lg text-brand-forest shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs my-auto">
            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Total Stock Valuation</span>
              <span className="text-sm sm:text-base font-bold font-sans tabular-nums text-brand-forest mt-1 truncate">
                {formatCurrency(data.inventoryImpact.totalStockValue)}
              </span>
            </div>

            <div className="p-2.5 bg-status-amber/10 rounded-xl border border-status-amber/20 text-status-amber flex flex-col justify-between">
              <span className="text-[10px] block uppercase font-bold truncate">Monthly Food Wastage</span>
              <span className="text-sm sm:text-base font-bold font-sans tabular-nums mt-1 truncate">
                {formatCurrency(data.inventoryImpact.monthWastage)}
              </span>
            </div>

            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Damaged Assets</span>
              <span className="text-sm sm:text-base font-bold font-sans tabular-nums text-status-red mt-1">
                {data.inventoryImpact.totalDamagedAssets} units
              </span>
            </div>

            <div className="p-2.5 bg-brand-sand/40 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-ink-muted block uppercase font-bold truncate">Low-Stock Items</span>
              <span className="text-sm sm:text-base font-bold font-sans tabular-nums text-status-amber mt-1">
                {data.inventoryImpact.lowStockItemsCount} items
              </span>
            </div>
          </div>

          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-forest hover:underline pt-1"
          >
            <span>Open Complete Inventory &amp; Asset Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 6. Actionable Outstanding Receivables Hub (Clean Bottom Section) ── */}
      <div id="outstanding-receivables" className="pms-card overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-sand/40">
          <div>
            <h3 className="text-sm font-serif font-bold text-brand-forest leading-tight">
              Top Outstanding Accounts &amp; Receivables
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Uncollected balances across Room folios and Banquet events
            </p>
          </div>
          <Link
            href="/payments"
            className="text-xs font-bold text-brand-forest hover:underline inline-flex items-center gap-1 shrink-0"
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
                  <td colSpan={7} className="py-5 px-4 text-center text-ink-muted text-xs">
                    <div className="flex items-center justify-center gap-1.5 text-status-green font-medium">
                      <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                      <span>All guest and event accounts are fully settled. Zero outstanding due!</span>
                    </div>
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
                          className="pms-btn-primary h-7 px-2.5 text-xs gap-1 font-medium shadow-2xs"
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
