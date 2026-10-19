'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BanquetHall, BanquetBooking, BanquetSummary } from '../../lib/banquet/types';
import { BanquetBookingStatus, BanquetPaymentStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import { updateBanquetBookingStatusAction } from '../../lib/banquet/actions';
import BookEventModal from './BookEventModal';
import EditHallModal from './EditHallModal';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import {
  PartyPopper,
  Building2,
  Calendar,
  Clock,
  Users,
  Phone,
  CreditCard,
  PlusCircle,
  Settings,
  Search,
  Play,
  Utensils,
  Sparkles,
  Layers,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Receipt,
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import AnimatedKpiValue from '../shared/AnimatedKpiValue';

interface BanquetDashboardProps {
  hall: BanquetHall;
  bookings: BanquetBooking[];
  summary: BanquetSummary;
  userRole: string;
}

export default function BanquetDashboard({
  hall,
  bookings,
  summary,
  userRole,
}: BanquetDashboardProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [isEditHallModalOpen, setIsEditHallModalOpen] = useState<boolean>(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const isOwnerOrManager = userRole === 'owner' || userRole === 'manager';
  const canBook = userRole === 'owner' || userRole === 'manager' || userRole === 'reception';
  const isHousekeeping = userRole === 'housekeeping';

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.event_name.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_phone.includes(q) ||
        b.booking_number.toLowerCase().includes(q);

      let matchesTab = true;
      if (activeTab === 'upcoming') {
        matchesTab = b.event_date >= todayStr && b.booking_status !== 'cancelled';
      } else if (activeTab === 'today') {
        matchesTab = b.event_date === todayStr && b.booking_status !== 'cancelled';
      }

      let matchesStatus = true;
      if (statusFilter !== 'all') matchesStatus = b.booking_status === statusFilter;

      let matchesPayment = true;
      if (paymentFilter !== 'all') matchesPayment = b.payment_status === paymentFilter;

      return matchesSearch && matchesTab && matchesStatus && matchesPayment;
    });
  }, [bookings, searchQuery, activeTab, statusFilter, paymentFilter, todayStr]);

  const handleUpdateStatus = async (bookingId: string, newStatus: BanquetBookingStatus) => {
    setStatusUpdatingId(bookingId);
    try {
      await updateBanquetBookingStatusAction({ booking_id: bookingId, booking_status: newStatus });
      router.refresh();
    } catch (err) {
      console.error('Failed to update event status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const hallStatusVariant = {
    available: 'available',
    reserved: 'reserved',
    occupied: 'occupied',
    maintenance: 'maintenance',
  }[hall.current_status] as 'available' | 'reserved' | 'occupied' | 'maintenance';

  const TABS = [
    {
      id: 'upcoming',
      label: 'Upcoming Events',
      count: bookings.filter((b) => b.event_date >= todayStr && b.booking_status !== 'cancelled').length,
    },
    {
      id: 'today',
      label: "Today's Events",
      count: bookings.filter((b) => b.event_date === todayStr && b.booking_status !== 'cancelled').length,
    },
    {
      id: 'all',
      label: 'All Bookings',
      count: bookings.length,
    },
  ] as const;

  return (
    <div className="space-y-4 sm:space-y-4.5">
      {/* ── Page Header & Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest tracking-tight leading-tight flex items-center gap-2.5">
            <PartyPopper className="w-5 h-5 text-brand-forest" />
            Banquet Hall
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Manage events, bookings, billing, and collections.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
          {isOwnerOrManager && (
            <button
              type="button"
              onClick={() => setIsEditHallModalOpen(true)}
              className="pms-btn-secondary h-8 px-2.5 sm:px-3 text-xs gap-1.5 font-medium shadow-2xs"
              title="Configure hall pricing, capacity, and amenities"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Hall Settings</span>
            </button>
          )}

          {canBook && (
            <button
              type="button"
              onClick={() => setIsBookModalOpen(true)}
              className="pms-btn-primary h-8 px-3 text-xs gap-1.5 font-medium shadow-2xs"
              title="Book a new banquet or convention event"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Book Banquet Event</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 1. Hall Resource Overview Card (Product-Grade 2-Column Layout) ── */}
      <div className="pms-card p-4 space-y-2.5 transition-all duration-150 hover:shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          {/* Left Column: Hall Identity & Concise Description */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-brand-forest text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-serif font-bold text-brand-forest leading-tight truncate">
                  {hall.name}
                </h2>
                <StatusBadge variant={hallStatusVariant} label={hall.current_status} />
                {hall.capacity && (
                  <span className="text-xs text-ink-muted font-mono font-medium">
                    · {hall.capacity} guests
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted truncate max-w-2xl mt-0.5">
                {hall.description || 'Luxury banquet & conference hall for property events.'}
              </p>
            </div>
          </div>

          {/* Right Column: Pricing (Clean Typography, No Heavy Nested Border) */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-start sm:self-center pl-0 sm:pl-4">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block leading-none mb-1">
                Half Day Rate
              </span>
              <span className="text-sm sm:text-base font-bold font-serif text-brand-forest tabular-nums">
                {formatCurrency(hall.half_day_rate)}
              </span>
            </div>
            <div className="h-7 w-px bg-border-subtle" aria-hidden="true" />
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block leading-none mb-1">
                Full Day Rate
              </span>
              <span className="text-sm sm:text-base font-bold font-serif text-brand-forest tabular-nums">
                {formatCurrency(hall.full_day_rate)}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Row: Amenities (Curated Top 4 + Overflow Badge) */}
        {hall.amenities && hall.amenities.length > 0 && (
          <div className="pt-2 border-t border-border-subtle/60 flex items-center gap-2 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted shrink-0">
              Amenities:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
              {hall.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="bg-brand-sand/80 px-2 py-0.5 rounded text-[11px] text-ink font-medium border border-border-subtle/80"
                >
                  {amenity}
                </span>
              ))}
              {hall.amenities.length > 4 && (
                <span
                  className="bg-brand-sand/50 px-1.5 py-0.5 rounded text-[10.5px] text-ink-muted font-medium border border-border-subtle/50 cursor-default"
                  title={hall.amenities.slice(4).join(', ')}
                >
                  +{hall.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Operational & Financial Metrics Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Operational 1 */}
        <div
          className="pms-stat-card pms-card-entrance p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Upcoming</span>
            <Calendar className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif tabular-nums text-brand-forest">
            <AnimatedKpiValue value={summary.upcoming_events_count} />
          </p>
          <p className="text-[10px] sm:text-[11px] text-ink-muted mt-0.5 truncate">On calendar</p>
        </div>

        {/* Operational 2 */}
        <div
          className="pms-stat-card pms-card-entrance p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            <Play className={`w-3.5 h-3.5 ${summary.in_progress_count > 0 ? 'text-status-green' : 'text-ink-muted/50'}`} />
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold font-serif tabular-nums ${
              summary.in_progress_count > 0 ? 'text-status-green' : 'text-brand-forest'
            }`}
          >
            <AnimatedKpiValue value={summary.in_progress_count} />
          </p>
          <p className="text-[10px] sm:text-[11px] text-ink-muted mt-0.5 truncate">Active sessions</p>
        </div>

        {/* Operational 3 */}
        <div
          className="pms-stat-card pms-card-entrance p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today&apos;s Events</span>
            <Clock className={`w-3.5 h-3.5 ${summary.todays_events_count > 0 ? 'text-status-amber' : 'text-ink-muted/50'}`} />
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold font-serif tabular-nums ${
              summary.todays_events_count > 0 ? 'text-status-amber' : 'text-brand-forest'
            }`}
          >
            <AnimatedKpiValue value={summary.todays_events_count} />
          </p>
          <p className="text-[10px] sm:text-[11px] text-ink-muted mt-0.5 truncate">Scheduled today</p>
        </div>

        {/* Financial 1: Advance Collected */}
        <div
          className="pms-stat-card pms-card-entrance p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]"
          style={{ animationDelay: '150ms' }}
        >
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Advance Collected</span>
            <CreditCard className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-base sm:text-lg font-bold font-serif tabular-nums text-brand-forest truncate">
            <AnimatedKpiValue value={summary.total_advance_collected} prefix="₹" />
          </p>
          <p className="text-[10px] sm:text-[11px] text-ink-muted mt-0.5 truncate">Deposits secured</p>
        </div>

        {/* Financial 2: Outstanding Due */}
        <div
          className="pms-stat-card pms-card-entrance p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber">
              Outstanding Due
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-status-amber" />
          </div>
          <p
            className={`text-base sm:text-lg font-bold font-serif tabular-nums truncate ${
              summary.total_outstanding_balance > 0 ? 'text-status-amber' : 'text-status-green'
            }`}
          >
            <AnimatedKpiValue value={summary.total_outstanding_balance} prefix="₹" />
          </p>
          <p className="text-[10px] sm:text-[11px] text-ink-muted mt-0.5 truncate">Pending collection</p>
        </div>

        {/* Financial 3: Projected Revenue */}
        <div
          className="pms-stat-card pms-card-entrance p-3 sm:p-3.5 flex flex-col justify-between min-h-[92px]"
          style={{ animationDelay: '250ms' }}
        >
          <div className="flex items-center justify-between text-ink-muted mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Projected Revenue</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-forest/60" />
          </div>
          <p className="text-base sm:text-lg font-bold font-serif tabular-nums text-brand-forest truncate">
            <AnimatedKpiValue value={summary.total_estimated_revenue} prefix="₹" />
          </p>
          <p className="text-[10px] sm:text-[11px] text-ink-muted mt-0.5 truncate">Upcoming folios</p>
        </div>
      </div>

      {/* ── 3. Booking Workspace (Integrated Tabs + Unified Filter Toolbar) ── */}
      <div className="space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-1 border-b border-border-subtle">
          {/* Integrated Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-forest text-white shadow-2xs'
                      : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-brand-sand-dark text-ink-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Unified Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, host, phone..."
                className="w-full sm:w-56 h-9 pl-9 pr-3 text-xs bg-white border border-border-subtle rounded-lg text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                aria-label="Search banquet bookings"
              />
            </div>

            {/* Event Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all cursor-pointer"
              aria-label="Filter by event status"
            >
              <option value="all">All Event Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all cursor-pointer"
              aria-label="Filter by payment status"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid in Full</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* ── 4. Bookings & Folio Operations Table ── */}
        <div className="pms-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="pms-table" aria-busy={statusUpdatingId !== null}>
              <thead className="pms-table-header">
                <tr>
                  <th className="pms-table-th">Date &amp; Time</th>
                  <th className="pms-table-th">Event &amp; Ref</th>
                  <th className="pms-table-th">Client / Host</th>
                  <th className="pms-table-th">Guests</th>
                  <th className="pms-table-th text-right">Total Folio</th>
                  <th className="pms-table-th text-right">Paid</th>
                  <th className="pms-table-th text-right">Balance Due</th>
                  <th className="pms-table-th text-center">Status</th>
                  <th className="pms-table-th text-center">Payment</th>
                  <th className="pms-table-th-right">Folio Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState
                        icon={PartyPopper}
                        title={
                          searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                            ? 'No matching events found'
                            : activeTab === 'today'
                            ? 'No events scheduled for today'
                            : activeTab === 'upcoming'
                            ? 'No upcoming banquet events'
                            : 'No banquet event bookings recorded'
                        }
                        description={
                          searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                            ? 'Try adjusting your search or filter options.'
                            : 'Book your first banquet event to initiate the operational & billing workflow.'
                        }
                        action={
                          canBook && !searchQuery && statusFilter === 'all'
                            ? { label: 'Book Banquet Event', onClick: () => setIsBookModalOpen(true), icon: PlusCircle }
                            : undefined
                        }
                        compact
                      />
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isToday = b.event_date === todayStr;
                    const isUpdating = statusUpdatingId === b.id;

                    return (
                      <tr
                        key={b.id}
                        className={`pms-table-row transition-colors ${
                          isToday ? 'bg-status-green/4' : ''
                        } ${isUpdating ? 'opacity-60' : ''}`}
                      >
                        {/* Date & Time */}
                        <td className="pms-table-td whitespace-nowrap">
                          <p className="text-xs font-semibold text-ink">
                            {formatDate(b.event_date)}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-ink-muted" />
                            <span className="font-mono text-[11px] text-brand-forest font-semibold">
                              {b.start_time} – {b.end_time}
                            </span>
                          </div>
                          {isToday && (
                            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-status-green/15 text-status-green">
                              Today
                            </span>
                          )}
                        </td>

                        {/* Event & Ref */}
                        <td className="pms-table-td">
                          <Link
                            href={`/banquet/${b.id}`}
                            className="text-xs sm:text-sm font-bold text-brand-forest hover:underline leading-tight block"
                          >
                            {b.event_name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-sand text-brand-forest uppercase tracking-wider border border-border-subtle">
                              {b.event_type}
                            </span>
                            <span className="font-mono text-[11px] text-ink-muted">{b.booking_number}</span>
                          </div>
                          {b.catering_required && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-status-green font-medium mt-0.5">
                              <Utensils className="w-3 h-3" />
                              Catering
                            </span>
                          )}
                        </td>

                        {/* Host / Contact */}
                        <td className="pms-table-td">
                          <p className="text-xs font-semibold text-ink leading-tight">{b.customer_name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-ink-muted" />
                            <span className="font-mono text-[11px] text-ink-muted">{b.customer_phone}</span>
                          </div>
                        </td>

                        {/* Guests */}
                        <td className="pms-table-td">
                          {b.guest_count ? (
                            <span className="font-mono font-semibold text-xs text-ink">{b.guest_count} pax</span>
                          ) : (
                            <span className="text-ink-muted text-xs">—</span>
                          )}
                        </td>

                        {/* Total Folio */}
                        <td className="pms-table-td text-right">
                          <p className="font-mono font-bold text-xs text-ink">
                            {formatCurrency(b.grand_total || b.estimated_total || b.rental_amount)}
                          </p>
                          <p className="text-[10px] text-ink-muted font-mono mt-0.5">
                            Tax: {formatCurrency(b.tax_amount || 0)}
                          </p>
                        </td>

                        {/* Paid */}
                        <td className="pms-table-td text-right font-mono font-semibold text-xs text-status-green whitespace-nowrap">
                          {formatCurrency(b.total_paid || b.advance_paid || 0)}
                        </td>

                        {/* Balance Due */}
                        <td className="pms-table-td text-right font-mono whitespace-nowrap">
                          <span
                            className={`text-xs font-bold ${
                              (b.balance_due || 0) > 0 ? 'text-status-amber' : 'text-status-green'
                            }`}
                          >
                            {formatCurrency(b.balance_due || 0)}
                          </span>
                        </td>

                        {/* Event Status */}
                        <td className="pms-table-td text-center whitespace-nowrap">
                          <StatusBadge variant={b.booking_status as any} />
                        </td>

                        {/* Payment Status */}
                        <td className="pms-table-td text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              b.payment_status === 'paid'
                                ? 'bg-status-green/10 text-status-green border border-status-green/30'
                                : b.payment_status === 'partially_paid'
                                ? 'bg-status-amber/10 text-status-amber border border-status-amber/30'
                                : 'bg-status-red/10 text-status-red border border-status-red/30'
                            }`}
                          >
                            {b.payment_status === 'paid'
                              ? 'PAID'
                              : b.payment_status === 'partially_paid'
                              ? 'PARTIAL'
                              : 'UNPAID'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="pms-table-td whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/banquet/${b.id}`}
                              className="pms-btn-secondary h-7 px-2.5 text-xs gap-1 font-medium"
                              title="Open Banquet Folio Workspace"
                            >
                              <Receipt className="w-3.5 h-3.5 text-brand-forest" />
                              <span>Folio</span>
                            </Link>

                            {!isHousekeeping && (
                              <>
                                {b.booking_status === 'confirmed' && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus(b.id, 'in_progress')}
                                    className="pms-btn-primary h-7 px-2 text-xs gap-1"
                                    title="Start Event"
                                  >
                                    <Play className="w-3 h-3" />
                                    <span>Start</span>
                                  </button>
                                )}
                                {b.booking_status === 'in_progress' && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus(b.id, 'completed')}
                                    className="pms-btn-primary h-7 px-2 text-xs gap-1 bg-status-green hover:bg-status-green/90"
                                    title="Complete Event"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Done</span>
                                  </button>
                                )}
                              </>
                            )}
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
      </div>

      {/* ── Modals ── */}
      <BookEventModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        hall={hall}
        onSuccess={() => router.refresh()}
      />
      <EditHallModal
        isOpen={isEditHallModalOpen}
        onClose={() => setIsEditHallModalOpen(false)}
        hall={hall}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
