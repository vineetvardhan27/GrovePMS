'use client';

import { useState, useMemo } from 'react';
import { BanquetHall, BanquetBooking, BanquetSummary } from '../../lib/banquet/types';
import { BanquetBookingStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import { updateBanquetBookingStatusAction } from '../../lib/banquet/actions';
import BookEventModal from './BookEventModal';
import EditHallModal from './EditHallModal';
import KpiCard from '../shared/KpiCard';
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
  ChevronRight,
  CheckCircle2,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [isEditHallModalOpen, setIsEditHallModalOpen] = useState<boolean>(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const isOwnerOrManager = userRole === 'owner' || userRole === 'manager';
  const canBook = userRole === 'owner' || userRole === 'manager' || userRole === 'reception';
  const isHousekeeping = userRole === 'housekeeping';

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer_phone.includes(searchQuery) ||
        b.booking_number.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (activeTab === 'upcoming') {
        matchesTab = b.event_date >= todayStr && b.booking_status !== 'cancelled';
      }

      let matchesStatus = true;
      if (statusFilter !== 'all') matchesStatus = b.booking_status === statusFilter;

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [bookings, searchQuery, activeTab, statusFilter, todayStr]);

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

  // Hall status badge variant mapping
  const hallStatusVariant = {
    available:   'available',
    reserved:    'reserved',
    occupied:    'occupied',
    maintenance: 'maintenance',
  }[hall.current_status] as 'available' | 'reserved' | 'occupied' | 'maintenance';

  const TABS = [
    { id: 'upcoming', label: `Upcoming Events`, count: bookings.filter((b) => b.event_date >= todayStr && b.booking_status !== 'cancelled').length },
    { id: 'all',      label: `All Bookings`,    count: bookings.length },
  ] as const;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[1.375rem] leading-tight font-serif font-bold text-brand-forest tracking-tight">
            Banquet Hall Management
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Dedicated operational resource for conferences, receptions, and special events
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isOwnerOrManager && (
            <button
              type="button"
              onClick={() => setIsEditHallModalOpen(true)}
              className="pms-btn-secondary"
            >
              <Settings className="w-4 h-4" />
              <span>Hall Settings</span>
            </button>
          )}
          {canBook && (
            <button
              type="button"
              onClick={() => setIsBookModalOpen(true)}
              className="pms-btn-primary"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Banquet Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Hall Resource Card */}
      <div className="pms-card overflow-hidden">
        {/* Left accent border */}
        <div className="flex">
          <div className="w-1 bg-brand-forest shrink-0" aria-hidden="true" />
          <div className="flex-1 p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Hall info */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-forest text-white rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h2 className="text-base font-serif font-bold text-brand-forest">{hall.name}</h2>
                    <StatusBadge variant={hallStatusVariant} label={hall.current_status} />
                    {hall.capacity && (
                      <span className="pms-badge pms-badge-neutral font-mono">
                        <Users className="w-3 h-3" />
                        {hall.capacity} guests
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed max-w-2xl">
                    {hall.description || 'Luxury banquet & conference hall for property events.'}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-5 shrink-0 bg-brand-sand/60 rounded-lg p-4 border border-border-subtle">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted block mb-1">Half Day</span>
                  <span className="text-lg font-bold font-mono text-brand-forest">{formatCurrency(hall.half_day_rate)}</span>
                </div>
                <div className="border-l border-border-subtle pl-5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted block mb-1">Full Day</span>
                  <span className="text-lg font-bold font-mono text-brand-forest">{formatCurrency(hall.full_day_rate)}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {hall.amenities && hall.amenities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-subtle/60 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mr-1">Features</span>
                {hall.amenities.map((amenity, idx) => (
                  <span key={idx} className="pms-badge pms-badge-neutral">
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Housekeeping Notice */}
      {isHousekeeping && (
        <div className="flex items-start gap-3 p-4 bg-status-blue/8 border border-status-blue/20 text-status-blue rounded-xl text-sm">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Housekeeping View:</strong> Review upcoming event timings, guest counts, and special setup remarks to coordinate table linens, podiums, and post-event turnaround.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Upcoming Events"
          value={summary.upcoming_events_count}
          subtitle="Confirmed on calendar"
          icon={Calendar}
          accent="default"
        />
        <KpiCard
          label="Events In Progress"
          value={summary.in_progress_count}
          subtitle="Active hall sessions"
          icon={Play}
          accent={summary.in_progress_count > 0 ? 'green' : 'default'}
        />
        <KpiCard
          label="Advance Collected"
          value={formatCurrency(summary.total_advance_collected)}
          subtitle="Deposits secured"
          icon={CreditCard}
          accent="default"
        />
        <KpiCard
          label="Projected Revenue"
          value={formatCurrency(summary.total_estimated_revenue)}
          subtitle="Hall & event packages"
          icon={Sparkles}
          accent="default"
        />
      </div>

      {/* Tabs + Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Tab nav */}
          <div className="pms-tab-nav">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`pms-tab-item flex items-center gap-2 ${isActive ? 'pms-tab-item-active' : ''}`}
                >
                  {tab.id === 'upcoming' ? <Calendar className="w-4 h-4 shrink-0" /> : <Layers className="w-4 h-4 shrink-0" />}
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                    isActive
                      ? 'bg-brand-forest/10 text-brand-forest border-brand-forest/20'
                      : 'bg-brand-sand text-ink-muted border-border-subtle'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + status filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Event, host, phone..."
                className="pms-input pl-9"
                aria-label="Search banquet bookings"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pms-select"
              aria-label="Filter by booking status"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div className="pms-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="pms-table">
              <thead className="pms-table-header">
                <tr>
                  <th className="pms-table-th">Date & Time</th>
                  <th className="pms-table-th">Event & Ref</th>
                  <th className="pms-table-th">Host / Contact</th>
                  <th className="pms-table-th">Guests</th>
                  <th className="pms-table-th">Revenue</th>
                  <th className="pms-table-th">Advance</th>
                  <th className="pms-table-th">Status</th>
                  {!isHousekeeping && <th className="pms-table-th-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={isHousekeeping ? 7 : 8}>
                      <EmptyState
                        icon={PartyPopper}
                        title={
                          searchQuery || statusFilter !== 'all'
                            ? 'No matching events'
                            : activeTab === 'upcoming'
                            ? 'No upcoming events'
                            : 'No banquet events yet'
                        }
                        description={
                          searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your search or status filter.'
                            : activeTab === 'upcoming'
                            ? 'Upcoming events will appear here once booked.'
                            : 'Book your first banquet event to get started.'
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
                      <tr key={b.id} className={`pms-table-row ${isToday ? 'bg-status-green/4' : ''}`}>
                        {/* Date & Time */}
                        <td className="pms-table-td">
                          <p className="text-sm font-semibold text-ink whitespace-nowrap">
                            {formatDate(b.event_date)}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-ink-muted" />
                            <span className="font-mono text-[11px] text-brand-forest font-semibold">
                              {b.start_time} – {b.end_time}
                            </span>
                          </div>
                          {isToday && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-status-green/15 text-status-green">
                              Today
                            </span>
                          )}
                        </td>

                        {/* Event & Booking# */}
                        <td className="pms-table-td">
                          <p className="text-sm font-semibold text-ink leading-tight">{b.event_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-sand text-brand-forest uppercase tracking-wider border border-border-subtle">
                              {b.event_type}
                            </span>
                            <span className="font-mono text-[11px] text-ink-muted">{b.booking_number}</span>
                          </div>
                          {b.catering_required && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-status-green font-medium mt-1">
                              <Utensils className="w-3 h-3" />
                              Catering
                            </span>
                          )}
                        </td>

                        {/* Host Contact */}
                        <td className="pms-table-td">
                          <p className="text-sm font-semibold text-ink leading-tight">{b.customer_name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-ink-muted" />
                            <span className="font-mono text-[11px] text-ink-muted">{b.customer_phone}</span>
                          </div>
                        </td>

                        {/* Guests */}
                        <td className="pms-table-td">
                          {b.guest_count ? (
                            <span className="font-mono font-semibold text-sm text-ink">{b.guest_count} pax</span>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>

                        {/* Revenue */}
                        <td className="pms-table-td">
                          <p className="font-mono font-semibold text-sm text-ink">
                            {formatCurrency(b.estimated_total || b.rental_amount)}
                          </p>
                          <p className="text-[11px] text-ink-muted mt-0.5">
                            Rental: {formatCurrency(b.rental_amount)}
                          </p>
                        </td>

                        {/* Advance */}
                        <td className="pms-table-td font-mono font-semibold text-sm text-status-green whitespace-nowrap">
                          {formatCurrency(b.advance_paid)}
                        </td>

                        {/* Status */}
                        <td className="pms-table-td">
                          {b.booking_status === 'confirmed'   && <StatusBadge variant="confirmed" />}
                          {b.booking_status === 'in_progress' && <StatusBadge variant="in_progress" />}
                          {b.booking_status === 'completed'   && <StatusBadge variant="completed" />}
                          {b.booking_status === 'cancelled'   && <StatusBadge variant="cancelled" />}
                        </td>

                        {/* Actions */}
                        {!isHousekeeping && (
                          <td className="pms-table-td">
                            <div className="flex items-center justify-end gap-1">
                              {b.booking_status === 'confirmed' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(b.id, 'in_progress')}
                                  className="pms-btn-primary h-7 px-2.5 text-xs gap-1"
                                  title="Start Event"
                                >
                                  <Play className="w-3 h-3" />
                                  Start
                                </button>
                              )}
                              {b.booking_status === 'in_progress' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(b.id, 'completed')}
                                  className="pms-btn-primary h-7 px-2.5 text-xs gap-1"
                                  title="Complete Event"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Complete
                                </button>
                              )}
                              {b.booking_status !== 'completed' && b.booking_status !== 'cancelled' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                  className="pms-btn-icon-danger"
                                  title="Cancel Event"
                                  aria-label="Cancel this event"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
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
