'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  ArrowLeft,
  User,
  Phone,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { RoomWithCategory } from '../../lib/rooms/types';
import type { BookingWithDetails } from '../../lib/bookings/queries';
import { format, addDays, subDays, isSameDay, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';

interface BookingCalendarProps {
  rooms: RoomWithCategory[];
  bookings: BookingWithDetails[];
}

export default function BookingCalendar({ rooms, bookings }: BookingCalendarProps) {
  const [baseDate, setBaseDate] = useState<Date>(startOfDay(new Date()));
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  // Generate 10-day date range starting from 2 days before baseDate
  const days = useMemo(() => {
    const startDate = subDays(baseDate, 2);
    return Array.from({ length: 10 }).map((_, i) => addDays(startDate, i));
  }, [baseDate]);

  const today = startOfDay(new Date());

  const handlePrev = () => setBaseDate((prev) => subDays(prev, 7));
  const handleNext = () => setBaseDate((prev) => addDays(prev, 7));
  const handleToday = () => setBaseDate(today);

  return (
    <div className="space-y-6">
      {/* Calendar Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Link
            href="/bookings"
            className="flex items-center justify-center w-11 h-11 rounded-lg bg-white border border-border-subtle text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors shrink-0"
            aria-label="Back to Bookings"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-h1 text-brand-forest truncate">Booking Calendar</h2>
            <p className="text-xs text-ink-muted truncate">Timeline view of room occupancies</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Date Navigation */}
          <div className="flex-1 sm:flex-initial flex items-center justify-between bg-white rounded-lg border border-border-subtle p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded hover:bg-brand-sand text-ink-muted hover:text-ink transition-colors cursor-pointer min-h-[38px] flex items-center justify-center"
              aria-label="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold text-brand-forest hover:bg-brand-sand rounded transition-colors cursor-pointer min-h-[38px]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded hover:bg-brand-sand text-ink-muted hover:text-ink transition-colors cursor-pointer min-h-[38px] flex items-center justify-center"
              aria-label="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/bookings/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-semibold transition-colors shadow-2xs min-h-touch shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-lg border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header: Days */}
            <thead>
              <tr className="border-b border-border-subtle bg-brand-sand-dark/60">
                <th className="p-3.5 text-left font-serif font-bold text-sm text-brand-forest w-36 sm:w-44 sticky left-0 bg-brand-sand-dark z-10 border-r border-border-subtle">
                  Room
                </th>
                {days.map((day) => {
                  const isCurrentDay = isSameDay(day, today);
                  return (
                    <th
                      key={day.toISOString()}
                      className={`p-2.5 text-center min-w-[90px] border-r border-border-subtle ${
                        isCurrentDay ? 'bg-status-amber/15 text-brand-forest font-bold' : 'text-ink-muted font-medium'
                      }`}
                    >
                      <span className="block text-[11px] uppercase tracking-wider">
                        {format(day, 'EEE')}
                      </span>
                      <span className={`text-sm font-serif ${isCurrentDay ? 'text-brand-forest font-bold' : 'text-ink'}`}>
                        {format(day, 'dd MMM')}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: Rooms & Booking Blocks */}
            <tbody className="divide-y divide-border-subtle">
              {rooms.map((room) => {
                // Find all active bookings for this room
                const roomBookings = bookings.filter(
                  (b) => b.room_id === room.id && b.booking_status !== 'cancelled'
                );

                return (
                  <tr key={room.id} className="hover:bg-brand-sand/20 transition-colors">
                    {/* Room Info Cell */}
                    <td className="p-3 sticky left-0 bg-white z-10 border-r border-border-subtle">
                      <span className="font-bold text-sm font-serif text-ink">
                        Room {room.room_number}
                      </span>
                      <span className="block text-[11px] text-ink-muted truncate">
                        {room.category.name}
                      </span>
                    </td>

                    {/* Day Cells */}
                    {days.map((day) => {
                      const isCurrentDay = isSameDay(day, today);
                      const dayIso = format(day, 'yyyy-MM-dd');

                      // Check if any booking spans this day
                      const activeBooking = roomBookings.find((b) => {
                        return dayIso >= b.check_in_date && dayIso < b.check_out_date;
                      });

                      const isCheckInDay = activeBooking && activeBooking.check_in_date === dayIso;

                      let cellBg = isCurrentDay ? 'bg-status-amber/5' : '';

                      return (
                        <td
                          key={day.toISOString()}
                          className={`p-1.5 text-center border-r border-border-subtle h-14 relative ${cellBg}`}
                        >
                          {activeBooking && (
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(activeBooking)}
                              className={`w-full h-full rounded-md p-1 flex flex-col justify-center text-left text-[11px] transition-transform hover:scale-[1.03] cursor-pointer shadow-2xs ${
                                activeBooking.booking_status === 'checked_in'
                                  ? 'bg-status-green/20 text-status-green border border-status-green/30'
                                  : isSameDay(parseISO(activeBooking.check_in_date), today)
                                  ? 'bg-status-amber/20 text-status-amber border border-status-amber/30'
                                  : 'bg-status-blue/20 text-status-blue border border-status-blue/30'
                              }`}
                            >
                              <span className="font-bold truncate">
                                {isCheckInDay ? `▶ ${activeBooking.guest.full_name}` : activeBooking.guest.full_name}
                              </span>
                              <span className="text-[10px] opacity-80 truncate">
                                #{activeBooking.booking_number.slice(-4)}
                              </span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
            <div className="p-5 md:p-6 bg-brand-sand border-b border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-ink-muted uppercase">
                  Booking #{selectedBooking.booking_number}
                </span>
                <h3 className="text-h2 text-brand-forest mt-0.5">{selectedBooking.guest.full_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="flex items-center justify-center w-11 h-11 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
                aria-label="Close Booking Details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-brand-sand/50 rounded-lg border border-border-subtle">
                <div>
                  <span className="text-ink-muted block">Assigned Room</span>
                  <span className="font-bold text-ink text-sm font-serif">
                    Room {selectedBooking.room.room_number} ({selectedBooking.room.category.name})
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted block">Stay Duration</span>
                  <span className="font-semibold text-ink text-sm">
                    {formatDate(selectedBooking.check_in_date)} → {formatDate(selectedBooking.check_out_date)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Guest Contact:</span>
                  <span className="font-medium text-ink">{selectedBooking.guest.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Total Amount:</span>
                  <span className="font-bold text-ink text-sm tabular-nums">
                    {formatCurrency(selectedBooking.total_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Advance Received:</span>
                  <span className="font-bold text-status-green text-sm tabular-nums">
                    {formatCurrency(selectedBooking.advance_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Balance Due:</span>
                  <span className="font-bold text-status-amber text-sm tabular-nums">
                    {formatCurrency(Math.max(0, selectedBooking.total_amount - selectedBooking.advance_amount))}
                  </span>
                </div>
              </div>

              {selectedBooking.remarks && (
                <div className="p-3 bg-brand-sand/30 rounded-lg text-ink-muted">
                  <span className="font-semibold text-ink block mb-0.5">Remarks:</span>
                  {selectedBooking.remarks}
                </div>
              )}
            </div>

            <div className="p-4 bg-brand-sand border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-full bg-brand-forest hover:bg-brand-forest-light text-white rounded-lg text-sm font-medium py-3 transition-colors cursor-pointer min-h-touch"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
