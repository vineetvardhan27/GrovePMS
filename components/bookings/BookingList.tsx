'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  XCircle,
  Phone,
  FileText,
} from 'lucide-react';
import { BookingWithDetails } from '../../lib/bookings/queries';
import { cancelBookingAction } from '../../lib/bookings/actions';
import { BookingStatus, PaymentStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import CheckInConfirmModal from '../checkinout/CheckInConfirmModal';

interface BookingListProps {
  initialBookings: BookingWithDetails[];
}

const STATUS_BADGES: Record<BookingStatus, { label: string; class: string; icon: any }> = {
  confirmed: { label: 'Confirmed', class: 'bg-status-blue/15 text-status-blue border-status-blue/30', icon: Clock },
  checked_in: { label: 'Checked In', class: 'bg-status-green/15 text-status-green border-status-green/30', icon: CheckCircle2 },
  checked_out: { label: 'Checked Out', class: 'bg-ink-muted/15 text-ink-muted border-ink-muted/30', icon: LogOut },
  cancelled: { label: 'Cancelled', class: 'bg-status-red/15 text-status-red border-status-red/30', icon: XCircle },
};

const PAYMENT_BADGES: Record<PaymentStatus, { label: string; class: string }> = {
  fully_paid: { label: 'Fully Paid', class: 'bg-status-green/15 text-status-green border-status-green/30' },
  advance_received: { label: 'Advance Received', class: 'bg-status-amber/15 text-status-amber border-status-amber/30' },
  no_payment: { label: 'No Payment', class: 'bg-status-red/15 text-status-red border-status-red/30' },
  credit: { label: 'Credit', class: 'bg-status-blue/15 text-status-blue border-status-blue/30' },
};

export default function BookingList({ initialBookings }: BookingListProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>(initialBookings);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Check-in modal state
  const [checkInBooking, setCheckInBooking] = useState<BookingWithDetails | null>(null);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will release the room.')) {
      return;
    }
    setCancellingId(bookingId);
    try {
      await cancelBookingAction(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, booking_status: 'cancelled' } : b))
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleCheckInSuccess = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, booking_status: 'checked_in' } : b
      )
    );
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const s = searchQuery.trim().toLowerCase();
        return (
          b.booking_number.toLowerCase().includes(s) ||
          b.guest.full_name.toLowerCase().includes(s) ||
          b.guest.phone.toLowerCase().includes(s) ||
          b.room.room_number.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search booking #, guest, room..."
              className="pl-9 pr-3 py-1.5 bg-white border border-border-subtle rounded-lg text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-[38px] w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings/calendar"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-border-subtle hover:bg-brand-sand text-ink text-xs font-medium transition-colors min-h-[38px]"
          >
            <CalendarDays className="w-4 h-4 text-brand-forest" />
            <span>Calendar View</span>
          </Link>

          <Link
            href="/bookings/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-medium transition-colors shadow-2xs min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-brand-forest text-white border-brand-forest'
                : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Booking #</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Stay Dates</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink-muted">
                    No reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const statusBadge = STATUS_BADGES[b.booking_status] || STATUS_BADGES.confirmed;
                  const paymentBadge = PAYMENT_BADGES[b.payment_status] || PAYMENT_BADGES.no_payment;
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr key={b.id} className="hover:bg-brand-sand/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-ink">
                        {b.booking_number}
                        <span className="block text-[10px] text-ink-muted font-normal capitalize">
                          via {b.source.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-ink text-sm">{b.guest.full_name}</p>
                        <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-ink-muted" />
                          {b.guest.phone}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-brand-forest text-sm font-serif">
                          Room {b.room.room_number}
                        </span>
                        <span className="block text-[11px] text-ink-muted">
                          {b.room.category.name}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-medium text-ink">
                          {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {b.adults} Adults{b.children > 0 ? `, ${b.children} Child` : ''}
                        </p>
                      </td>

                      <td className="p-4 tabular-nums">
                        <p className="font-bold text-ink text-sm">{formatCurrency(b.total_amount)}</p>
                        {b.advance_amount > 0 && (
                          <p className="text-[11px] text-status-green">
                            Adv: {formatCurrency(b.advance_amount)}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${paymentBadge.class}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${statusBadge.class}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusBadge.label}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Confirmed → Check In */}
                          {b.booking_status === 'confirmed' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setCheckInBooking(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-status-green/15 border border-status-green/30 text-status-green text-[11px] font-semibold hover:bg-status-green/25 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Check In
                              </button>
                              <button
                                type="button"
                                disabled={cancellingId === b.id}
                                onClick={() => handleCancelBooking(b.id)}
                                className="text-[11px] text-action-danger hover:text-action-danger/80 font-medium cursor-pointer"
                              >
                                {cancellingId === b.id ? '...' : 'Cancel'}
                              </button>
                            </>
                          )}

                          {/* Checked In → Bill & Checkout */}
                          {b.booking_status === 'checked_in' && (
                            <Link
                              href={`/billing/${b.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-forest/10 border border-brand-forest/30 text-brand-forest text-[11px] font-semibold hover:bg-brand-forest/20 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Bill & Checkout
                            </Link>
                          )}

                          {/* Checked Out → View Bill */}
                          {b.booking_status === 'checked_out' && (
                            <Link
                              href={`/billing/${b.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-border-subtle text-ink-muted text-[11px] font-medium hover:bg-brand-sand transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              View Bill
                            </Link>
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

      {/* Check-In Modal */}
      {checkInBooking && (
        <CheckInConfirmModal
          booking={checkInBooking}
          onClose={() => setCheckInBooking(null)}
          onSuccess={handleCheckInSuccess}
        />
      )}
    </div>
  );
}
