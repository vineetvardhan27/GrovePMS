'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Sparkles,
  Calendar,
  CreditCard,
  X,
  History,
} from 'lucide-react';
import { Guest } from '../../lib/guests/queries';
import { BookingWithDetails } from '../../lib/bookings/queries';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';

interface GuestDirectoryProps {
  initialGuests: Guest[];
  bookings: BookingWithDetails[];
}

export default function GuestDirectory({ initialGuests, bookings }: GuestDirectoryProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;
    const s = searchQuery.trim().toLowerCase();
    return guests.filter(
      (g) =>
        g.full_name.toLowerCase().includes(s) ||
        g.phone.toLowerCase().includes(s) ||
        (g.email && g.email.toLowerCase().includes(s)) ||
        (g.address && g.address.toLowerCase().includes(s))
    );
  }, [guests, searchQuery]);

  // Guest's bookings
  const guestBookings = useMemo(() => {
    if (!selectedGuest) return [];
    return bookings.filter((b) => b.guest_id === selectedGuest.id);
  }, [bookings, selectedGuest]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border-subtle">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, city..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-border-subtle rounded-lg text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-forest min-h-touch"
          />
        </div>

        <p className="text-xs text-ink-muted">
          Showing <strong>{filteredGuests.length}</strong> guest records
        </p>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-lg border border-border-subtle shadow-2xs overflow-hidden">
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
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ink-muted">
                    No guest profiles found.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
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
                            {guest.id_type}: <span className="font-mono text-ink">{guest.id_number || 'On file'}</span>
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
                          {guest.total_stays || 1}
                        </span>
                      </td>

                      <td className="p-4 tabular-nums font-bold text-ink text-sm">
                        {formatCurrency(guest.total_spent || 0)}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedGuest(guest)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-subtle bg-white hover:bg-brand-sand text-brand-forest text-xs font-medium transition-colors cursor-pointer min-h-[36px]"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    <span className="text-lg font-bold text-ink font-serif">{selectedGuest.total_stays || 1} Visits</span>
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
                  {guestBookings.length === 0 ? (
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
                            <span>Room {b.room.room_number} ({b.room.category.name})</span>
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
