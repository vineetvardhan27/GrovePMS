'use client';

import { useState, useEffect, useTransition, useCallback, useRef, useDeferredValue } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Calendar,
  CreditCard,
  X,
  History,
  Loader2,
} from 'lucide-react';
import type { Guest } from '../../lib/guests/queries';
import type { BookingWithDetails } from '../../lib/bookings/queries';
import type { PaginatedResult } from '../../lib/types/pagination';
import { getGuestBookingsAction } from '../../lib/guests/actions';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import { maskIdNumber } from '../../lib/utils/idExtractor';
import PaginationControls from '../shared/PaginationControls';

interface GuestDirectoryProps {
  initialGuests?: Guest[];
  bookings?: BookingWithDetails[];
  initialData?: PaginatedResult<Guest>;
  initialSearch?: string;
}

export default function GuestDirectory({
  initialGuests,
  bookings: initialBookings = [],
  initialData,
  initialSearch = '',
}: GuestDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Normalize initial paginated data
  const paginatedData: PaginatedResult<Guest> = initialData || {
    data: initialGuests || [],
    page: 1,
    pageSize: 50,
    totalCount: initialGuests ? initialGuests.length : null,
    totalPages: initialGuests ? Math.max(1, Math.ceil(initialGuests.length / 50)) : 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const [guests, setGuests] = useState<Guest[]>(paginatedData.data);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const deferredSearch = useDeferredValue(searchQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRequestSeqRef = useRef<number>(0);

  // Guest Stays Drawer state
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestBookings, setGuestBookings] = useState<BookingWithDetails[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);

  // Sync guests when server data changes
  useEffect(() => {
    setGuests(paginatedData.data);
  }, [paginatedData.data]);

  // Sync search state if URL searchParams changed externally
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
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
        if (value === null || value === '' || (key === 'page' && value === 1)) {
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

  // Page change
  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage }, { replace: false });
  };

  // Open Stays Drawer and fetch guest bookings on demand
  const handleOpenStays = async (guest: Guest) => {
    setSelectedGuest(guest);
    setIsLoadingBookings(true);
    setGuestBookings([]);

    try {
      // If bookings were pre-passed, filter from them; otherwise fetch on-demand
      if (initialBookings.length > 0) {
        setGuestBookings(initialBookings.filter((b) => b.guest_id === guest.id));
      } else {
        const fetchedBookings = await getGuestBookingsAction(guest.id);
        setGuestBookings(fetchedBookings);
      }
    } catch (err) {
      console.error('Error fetching stays for guest:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
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
            placeholder="Search by name, phone, email..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-border-subtle rounded-lg text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-touch"
            aria-label="Search guests"
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

        <p className="text-xs text-ink-muted">
          Showing <strong>{guests.length}</strong> of{' '}
          <strong>{paginatedData.totalCount ?? guests.length}</strong> guest records
        </p>
      </div>

      {/* Guest Table */}
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
                <th className="p-4">Guest Name</th>
                <th className="p-4">Phone / Contact</th>
                <th className="p-4">ID Document</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Stays</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ink-muted">
                    No guest profiles found matching your criteria.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => {
                  const isRepeat = (guest.total_stays || 0) >= 2;

                  return (
                    <tr key={guest.id} className="hover:bg-brand-sand/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink text-sm">{guest.full_name}</span>
                          {isRepeat && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-status-green/15 text-status-green border border-status-green/30">
                              <Sparkles className="w-3 h-3" />
                              <span>Repeat</span>
                            </span>
                          )}
                        </div>
                        {guest.email && <p className="text-[11px] text-ink-muted mt-0.5">{guest.email}</p>}
                      </td>

                      <td className="p-4">
                        <p className="font-medium text-ink flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-ink-muted" />
                          {guest.phone}
                        </p>
                      </td>

                      <td className="p-4 text-ink-muted">
                        {guest.id_type ? (
                          <span>
                            {guest.id_type}: <span className="font-mono text-ink">{maskIdNumber(guest.id_type, guest.id_number)}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="p-4 text-ink-muted">
                        {guest.address ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-ink-muted" />
                            {guest.address}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-brand-sand text-ink">
                          {guest.total_stays ?? 0}
                        </span>
                      </td>

                      <td className="p-4 tabular-nums font-bold text-ink text-sm">
                        {formatCurrency(guest.total_spent || 0)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/guests/${guest.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-subtle bg-white hover:bg-brand-sand text-brand-forest text-xs font-medium transition-colors"
                          >
                            <span>Profile</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenStays(guest)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-subtle bg-brand-sand hover:bg-brand-sand-dark text-ink text-xs font-medium transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Stays</span>
                          </button>
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
        itemLabel="guest profiles"
        isLoading={isPending}
      />

      {/* Guest Stay History Drawer */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedGuest(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 md:pl-10">
            <div className="w-screen max-w-full md:max-w-md bg-white shadow-xl flex flex-col justify-between border-l border-border-subtle">
              <div className="p-5 md:p-6 bg-brand-sand border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h3 className="text-h2 text-brand-forest font-bold">{selectedGuest.full_name}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">{selectedGuest.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGuest(null)}
                  className="flex items-center justify-center w-11 h-11 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
                  aria-label="Close Guest History"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Guest Stats Card */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-brand-sand/50 rounded-lg border border-border-subtle">
                  <div>
                    <span className="text-ink-muted block">Total Stays</span>
                    <span className="text-lg font-bold text-ink font-serif">{selectedGuest.total_stays ?? 0} Visits</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Total Spent</span>
                    <span className="text-lg font-bold text-brand-forest font-serif tabular-nums">
                      {formatCurrency(selectedGuest.total_spent || 0)}
                    </span>
                  </div>
                </div>

                {/* Stays History */}
                <div>
                  <h4 className="font-bold text-ink text-sm mb-3">Reservation History</h4>
                  {isLoadingBookings ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-2 text-ink-muted">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-forest" />
                      <span>Loading stay history...</span>
                    </div>
                  ) : guestBookings.length === 0 ? (
                    <div className="p-4 bg-brand-sand/30 rounded-lg text-center text-ink-muted">
                      No past bookings logged in the system.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {guestBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-lg border border-border-subtle bg-white shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-ink">{b.booking_number}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-blue/15 text-status-blue capitalize">
                              {b.booking_status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-ink-muted">
                            <span>Room {b.room?.room_number || '—'} ({b.room?.category?.name || 'Standard'})</span>
                            <span className="font-bold text-ink tabular-nums">{formatCurrency(b.total_amount)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1 border-t border-border-subtle">
                            <span>{formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}</span>
                            <span className="capitalize">{b.payment_status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-brand-sand border-t border-border-subtle flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedGuest(null)}
                  className="w-full bg-brand-forest hover:bg-brand-forest-light text-white rounded-lg text-sm font-medium py-3 transition-colors cursor-pointer min-h-touch"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
