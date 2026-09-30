'use client';

import { useState, useEffect, useTransition, useCallback, useRef, useDeferredValue } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
  X,
  Loader2,
} from 'lucide-react';
import type { BookingWithDetails } from '../../lib/bookings/queries';
import type { PaginatedResult } from '../../lib/types/pagination';
import { cancelBookingAction } from '../../lib/bookings/actions';
import { BookingStatus, PaymentStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import CheckInConfirmModal from '../checkinout/CheckInConfirmModal';
import PaginationControls from '../shared/PaginationControls';

interface BookingListProps {
  initialBookings?: BookingWithDetails[];
  initialData?: PaginatedResult<BookingWithDetails>;
  initialStatus?: string;
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
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

export default function BookingList({
  initialBookings,
  initialData,
  initialStatus = 'all',
  initialSearch = '',
  initialSortBy = 'check_in_date',
  initialSortOrder = 'desc',
}: BookingListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Normalize initial paginated data
  const paginatedData: PaginatedResult<BookingWithDetails> = initialData || {
    data: initialBookings || [],
    page: 1,
    pageSize: 50,
    totalCount: initialBookings ? initialBookings.length : null,
    totalPages: initialBookings ? Math.max(1, Math.ceil(initialBookings.length / 50)) : 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const [bookings, setBookings] = useState<BookingWithDetails[]>(paginatedData.data);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const deferredSearch = useDeferredValue(searchQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRequestSeqRef = useRef<number>(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Check-in modal state
  const [checkInBooking, setCheckInBooking] = useState<BookingWithDetails | null>(null);

  // Update local bookings whenever server props change
  useEffect(() => {
    setBookings(paginatedData.data);
  }, [paginatedData.data]);

  // Sync state if URL searchParams changed externally
  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'all';
    const urlSearch = searchParams.get('search') || '';
    setStatusFilter(urlStatus);
    setSearchQuery(urlSearch);
  }, [searchParams]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Navigate with new query params (uses router.replace for search/filters to avoid polluting history)
  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | null>, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const shouldReplace = options?.replace ?? true;

      startTransition(() => {
        if (shouldReplace) {
          router.replace(targetUrl, { scroll: false });
        } else {
          router.push(targetUrl, { scroll: false });
        }
      });
    },
    [pathname, router, searchParams]
  );

  // Immediate search execution (cancels obsolete pending timers)
  const executeSearchImmediate = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      latestRequestSeqRef.current += 1;
      updateQueryParams({ search: query.trim(), page: 1 }, { replace: true });
    },
    [updateQueryParams]
  );

  // Debounced search handler: typing is immediate in UI, API call debounced ~250ms
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    // Cancel any obsolete pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // If completely cleared, apply immediately without 250ms wait
    if (!val.trim()) {
      executeSearchImmediate('');
      return;
    }

    // Schedule debounced search (~250ms)
    debounceTimerRef.current = setTimeout(() => {
      executeSearchImmediate(val);
    }, 250);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    executeSearchImmediate('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearchImmediate(searchQuery);
    } else if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  // Status tab change: applies immediately and resets to page 1
  const handleStatusChange = (st: string) => {
    setStatusFilter(st);
    updateQueryParams({ status: st, page: 1 }, { replace: true });
  };

  // Page change
  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage }, { replace: false });
  };

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
      router.refresh();
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
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border-subtle">
        <div className="relative w-full sm:w-72">
          {isPending ? (
            <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-forest animate-spin" />
          ) : (
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search booking #, guest, room..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-border-subtle rounded-lg text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-touch"
            aria-label="Search bookings"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/bookings/calendar"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border border-border-subtle hover:bg-brand-sand text-ink text-xs font-medium transition-colors min-h-touch"
          >
            <CalendarDays className="w-4 h-4 text-brand-forest" />
            <span>Calendar View</span>
          </Link>

          <Link
            href="/bookings/new"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-semibold transition-colors shadow-2xs min-h-touch"
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
            onClick={() => handleStatusChange(st)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border capitalize transition-colors cursor-pointer min-h-touch flex items-center ${
              statusFilter === st
                ? 'bg-brand-forest text-white border-brand-forest shadow-2xs'
                : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-border-subtle shadow-2xs overflow-hidden relative">
        {/* Subtle loading indicator on top of table */}
        {isPending && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-forest/20 overflow-hidden z-20">
            <div className="w-full h-full bg-brand-forest animate-pulse" />
          </div>
        )}

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
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink-muted">
                    No reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const statusBadge = STATUS_BADGES[b.booking_status] || STATUS_BADGES.confirmed;
                  const paymentBadge = PAYMENT_BADGES[b.payment_status] || PAYMENT_BADGES.no_payment;
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr key={b.id} className="hover:bg-brand-sand/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-ink">
                        {b.booking_number}
                        <span className="block text-[10px] text-ink-muted font-normal capitalize">
                          via {b.source ? b.source.replace('_', ' ') : 'direct'}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-ink text-sm">{b.guest?.full_name || 'Guest'}</p>
                        <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-ink-muted" />
                          {b.guest?.phone || '—'}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-brand-forest text-sm font-serif">
                          Room {b.room?.room_number || '—'}
                        </span>
                        <span className="block text-[11px] text-ink-muted">
                          {b.room?.category?.name || 'Standard'}
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

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={paginatedData.page}
        totalPages={paginatedData.totalPages}
        totalCount={paginatedData.totalCount}
        pageSize={paginatedData.pageSize}
        hasNextPage={paginatedData.hasNextPage}
        hasPrevPage={paginatedData.hasPrevPage}
        onPageChange={handlePageChange}
        itemLabel="bookings"
        isLoading={isPending}
      />

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
