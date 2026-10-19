'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  BedDouble,
  Users,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Wrench,
  ArrowRight,
  Plus,
  User,
  CreditCard,
  Phone,
  Loader2,
} from 'lucide-react';
import { RoomWithCategory } from '../../lib/rooms/types';
import { RoomStatus, HousekeepingStatus } from '../../lib/types/database.types';
import { STATUS_CONFIG } from './RoomCard';
import { formatCurrency } from '../../lib/utils/currency';
import { getActiveRoomBooking, ActiveRoomBooking } from '../../lib/rooms/booking-query';

interface RoomDetailDrawerProps {
  room: RoomWithCategory | null;
  onClose: () => void;
  onUpdateStatus: (
    roomId: string,
    newStatus: RoomStatus,
    newHousekeepingStatus?: HousekeepingStatus
  ) => Promise<void>;
}

// Human-readable floor names — kept in sync with RoomCard.tsx / RoomGrid.tsx
const FLOOR_NAMES: Record<number, string> = {
  0: 'Basement',
  1: 'Ground Floor',
  2: 'First Floor',
  3: 'Second Floor',
  4: 'Upper Floor',
};

function getFloorLabel(floor: number): string {
  return FLOOR_NAMES[floor] ?? `Floor ${floor}`;
}

const PAYMENT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  fully_paid: { label: 'Fully Paid', className: 'bg-status-green/15 text-status-green border-status-green/30' },
  advance_received: { label: 'Advance Received', className: 'bg-status-amber/15 text-status-amber border-status-amber/30' },
  no_payment: { label: 'No Payment', className: 'bg-status-red/15 text-status-red border-status-red/30' },
  credit: { label: 'Credit', className: 'bg-status-blue/15 text-status-blue border-status-blue/30' },
};

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct', walk_in: 'Walk-in', phone: 'Phone', whatsapp: 'WhatsApp',
  travel_agent: 'Travel Agent', other: 'Other',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const BOOKING_STATUSES = ['occupied', 'arriving_today', 'reserved'] as const;

export default function RoomDetailDrawer({
  room,
  onClose,
  onUpdateStatus,
}: RoomDetailDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<ActiveRoomBooking | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);

  // Fetch active booking whenever a room that should have one is opened
  useEffect(() => {
    if (!room) {
      setBookingInfo(null);
      return;
    }
    const hasBooking = (BOOKING_STATUSES as readonly string[]).includes(room.status);
    if (!hasBooking) {
      setBookingInfo(null);
      return;
    }
    setIsLoadingBooking(true);
    getActiveRoomBooking(room.id)
      .then(setBookingInfo)
      .finally(() => setIsLoadingBooking(false));
  }, [room?.id, room?.status]);

  if (!room) return null;

  const currentConfig = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  const CurrentIcon = currentConfig.icon;
  const hasBooking = (BOOKING_STATUSES as readonly string[]).includes(room.status);
  const balance = bookingInfo
    ? bookingInfo.total_amount - bookingInfo.advance_amount
    : 0;
  const paymentCfg = bookingInfo
    ? (PAYMENT_STATUS_LABELS[bookingInfo.payment_status] ?? PAYMENT_STATUS_LABELS.no_payment)
    : null;

  const handleStatusChange = async (newStatus: RoomStatus) => {
    setIsUpdating(true);
    try { await onUpdateStatus(room.id, newStatus); }
    finally { setIsUpdating(false); }
  };

  const handleHkChange = async (newHk: HousekeepingStatus) => {
    setIsUpdating(true);
    try { await onUpdateStatus(room.id, room.status, newHk); }
    finally { setIsUpdating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 md:pl-10">
        <div className="w-screen max-w-full md:max-w-md bg-white shadow-xl flex flex-col border-l border-border-subtle">
          {/* Header */}
          <div className="p-5 md:p-6 bg-brand-sand border-b border-border-subtle flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl font-bold font-serif text-brand-forest">
                  Room {room.room_number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-border-subtle text-ink-muted">
                  {getFloorLabel(room.floor)}
                </span>
              </div>
              <p className="text-sm text-ink-muted mt-0.5">{room.category.name}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
              aria-label="Close Room Details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body — scrollable */}
          <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
            {/* Current Status Pill */}
            <div className={`p-4 rounded-lg border flex items-center justify-between ${currentConfig.bgClass} ${currentConfig.borderClass}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentConfig.badgeBg}`}>
                  <CurrentIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-ink-muted font-medium uppercase tracking-wider">Current Status</p>
                  <p className={`text-base font-bold ${currentConfig.textClass}`}>{currentConfig.label}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${
                room.housekeeping_status === 'clean'
                  ? 'bg-status-green/15 text-status-green border-status-green/30'
                  : 'bg-status-orange/15 text-status-orange border-status-orange/30'
              }`}>
                HK: {room.housekeeping_status}
              </span>
            </div>

            {/* Active Booking Info */}
            {hasBooking && (
              <div className="bg-brand-sand/50 rounded-lg border border-border-subtle overflow-hidden">
                <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-forest" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                    {room.status === 'reserved' ? 'Upcoming Reservation' :
                     room.status === 'arriving_today' ? 'Arriving Today' : 'Active Booking'}
                  </h4>
                </div>

                {isLoadingBooking ? (
                  <div className="flex items-center gap-2 px-4 py-5 text-ink-muted text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading booking details…</span>
                  </div>
                ) : bookingInfo ? (
                  <div className="p-4 space-y-3">
                    {/* Guest */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-ink-muted">Guest</p>
                        <p className="text-sm font-semibold text-ink">{bookingInfo.guest.full_name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ink-muted">
                        <Phone className="w-3 h-3" />
                        <span>{bookingInfo.guest.phone}</span>
                      </div>
                    </div>

                    {/* Booking Number & Source */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-muted">Booking #</span>
                      <span className="font-mono font-semibold text-ink">{bookingInfo.booking_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-muted">Source</span>
                      <span className="font-medium text-ink">{SOURCE_LABELS[bookingInfo.source] ?? bookingInfo.source}</span>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5">
                      <div>
                        <p className="text-xs text-ink-muted">Check-in</p>
                        <p className="text-xs font-semibold text-ink">{formatDate(bookingInfo.check_in_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Check-out</p>
                        <p className="text-xs font-semibold text-ink">{formatDate(bookingInfo.check_out_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Guests</p>
                        <p className="text-xs font-semibold text-ink">
                          {bookingInfo.adults} adult{bookingInfo.adults !== 1 ? 's' : ''}
                          {bookingInfo.children > 0 ? `, ${bookingInfo.children} child` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Rate / night</p>
                        <p className="text-xs font-semibold text-ink tabular-nums">{formatCurrency(bookingInfo.rate_per_night)}</p>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="pt-2 border-t border-black/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-muted">Total</span>
                        <span className="font-semibold tabular-nums">{formatCurrency(bookingInfo.total_amount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-muted">Advance Paid</span>
                        <span className="font-semibold text-status-green tabular-nums">− {formatCurrency(bookingInfo.advance_amount)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold border-t border-black/5 pt-1">
                        <span className="text-ink">Balance Due</span>
                        <span className={`tabular-nums ${balance > 0 ? 'text-status-red' : 'text-status-green'}`}>
                          {formatCurrency(balance)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Status */}
                    {paymentCfg && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-ink-muted" />
                          <span className="text-xs text-ink-muted">Payment</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${paymentCfg.className}`}>
                          {paymentCfg.label}
                        </span>
                      </div>
                    )}

                    {/* Remarks */}
                    {bookingInfo.remarks && (
                      <p className="text-[11px] text-ink-muted italic border-t border-black/5 pt-2">
                        &quot;{bookingInfo.remarks}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-xs text-ink-muted">
                    No booking details found.
                  </div>
                )}
              </div>
            )}

            {/* Room Specifications */}
            <div className="bg-brand-sand/50 rounded-lg p-4 border border-border-subtle space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Room Details &amp; Rates</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-ink-muted block">Base Rate (Weekdays)</span>
                  <span className="font-semibold text-ink tabular-nums">{formatCurrency(room.category.base_rate)} / night</span>
                </div>
                <div>
                  <span className="text-xs text-ink-muted block">Weekend Rate</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {room.category.weekend_rate ? `${formatCurrency(room.category.weekend_rate)} / night` : 'Same as base'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-muted block">Max Occupancy</span>
                  <span className="font-semibold text-ink">{room.category.max_occupancy} Adults</span>
                </div>
                <div>
                  <span className="text-xs text-ink-muted block">Extra Bed Rate</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {room.category.extra_bed_rate ? formatCurrency(room.category.extra_bed_rate) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Change */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2.5">
                Quick Status Change (Live Realtime Sync)
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" disabled={isUpdating || room.status === 'available'}
                  onClick={() => handleStatusChange('available')}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-status-green/30 bg-status-green/10 hover:bg-status-green/20 text-status-green font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-touch">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /><span>Mark Available</span>
                </button>
                <button type="button" disabled={isUpdating || room.status === 'occupied'}
                  onClick={() => handleStatusChange('occupied')}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-status-red/30 bg-status-red/10 hover:bg-status-red/20 text-status-red font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-touch">
                  <Users className="w-4 h-4 shrink-0" /><span>Mark Occupied</span>
                </button>
                <button type="button" disabled={isUpdating || room.status === 'cleaning'}
                  onClick={() => handleStatusChange('cleaning')}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-status-orange/30 bg-status-orange/10 hover:bg-status-orange/20 text-status-orange font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-touch">
                  <Sparkles className="w-4 h-4 shrink-0" /><span>Needs Cleaning</span>
                </button>
                <button type="button" disabled={isUpdating || room.status === 'maintenance'}
                  onClick={() => handleStatusChange('maintenance')}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-status-slate/30 bg-status-slate/10 hover:bg-status-slate/20 text-status-slate font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer min-h-touch">
                  <Wrench className="w-4 h-4 shrink-0" /><span>Maintenance</span>
                </button>
              </div>
            </div>

            {/* Housekeeping Toggle */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">Housekeeping Inspection</h4>
              <div className="flex gap-2">
                {(['clean', 'dirty', 'inspected'] as HousekeepingStatus[]).map((hk) => (
                  <button key={hk} type="button"
                    disabled={isUpdating || room.housekeeping_status === hk}
                    onClick={() => handleHkChange(hk)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer min-h-touch capitalize ${
                      room.housekeeping_status === hk
                        ? hk === 'clean' ? 'bg-status-green text-white border-status-green'
                          : hk === 'dirty' ? 'bg-status-orange text-white border-status-orange'
                          : 'bg-status-blue text-white border-status-blue'
                        : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
                    }`}>
                    {hk}
                  </button>
                ))}
              </div>
            </div>

            {/* New Reservation CTA */}
            {!hasBooking && (
              <div className="p-4 bg-brand-sand rounded-lg border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-ink">New Reservation</p>
                  <p className="text-[11px] text-ink-muted">Book this room for a walk-in or advance guest</p>
                </div>
                <Link
                  href={`/bookings/new?roomId=${room.id}`}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-medium transition-colors min-h-touch"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Room</span>
                </Link>
              </div>
            )}

            {hasBooking && bookingInfo && (
              <Link
                href={`/bookings/${bookingInfo.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-brand-forest text-brand-forest hover:bg-brand-sand text-xs font-medium transition-colors min-h-touch"
              >
                <span>View Full Booking Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-brand-sand border-t border-border-subtle shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-medium py-3 rounded-lg transition-colors cursor-pointer min-h-touch"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
