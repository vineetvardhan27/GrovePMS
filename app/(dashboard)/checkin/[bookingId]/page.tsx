import { getBookingById } from '../../../../lib/bookings/queries';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, User, Phone, BedDouble, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatCurrency } from '../../../../lib/utils/currency';
import { formatDate } from '../../../../lib/utils/dates';
import CheckInClientAction from './CheckInClientAction';

export const dynamic = 'force-dynamic';

interface CheckInPageProps {
  params: { bookingId: string };
}


export default async function CheckInPage({ params }: CheckInPageProps) {
  const booking = await getBookingById(params.bookingId);

  if (!booking) {
    notFound();
  }

  const isCheckedIn = booking.booking_status === 'checked_in';
  const isCancelled = booking.booking_status === 'cancelled';
  const isCheckedOut = booking.booking_status === 'checked_out';

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 pb-2 border-b border-border-subtle">
        <Link
          href="/bookings"
          className="p-2 rounded-lg bg-white border border-border-subtle text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-display text-brand-forest">Guest Check-In</h1>
          <p className="text-body text-ink-muted">
            Booking #{booking.booking_number} — Room {booking.room.room_number}
          </p>
        </div>
      </div>

      {isCheckedIn && (
        <div className="p-4 bg-status-green/10 border border-status-green/30 rounded-xl text-status-green text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>This guest is already checked in to Room {booking.room.room_number}.</span>
        </div>
      )}

      {isCancelled && (
        <div className="p-4 bg-action-danger/10 border border-action-danger/30 rounded-xl text-action-danger text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>This reservation has been cancelled.</span>
        </div>
      )}

      {isCheckedOut && (
        <div className="p-4 bg-ink-muted/10 border border-ink-muted/30 rounded-xl text-ink-muted text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>This booking has already been completed and checked out.</span>
        </div>
      )}

      {/* Booking Summary Box */}
      <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold">Guest</p>
            <h2 className="text-lg font-bold text-ink">{booking.guest.full_name}</h2>
            <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{booking.guest.phone}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-serif text-brand-forest block">
              Room {booking.room.room_number}
            </span>
            <span className="text-xs text-ink-muted">{booking.room.category.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-ink-muted block">Check-In Date</span>
            <span className="font-bold text-ink text-sm">{formatDate(booking.check_in_date)}</span>
          </div>
          <div>
            <span className="text-ink-muted block">Check-Out Date</span>
            <span className="font-bold text-ink text-sm">{formatDate(booking.check_out_date)}</span>
          </div>
          <div>
            <span className="text-ink-muted block">Guests</span>
            <span className="font-medium text-ink">{booking.adults} Adults {booking.children > 0 ? `, ${booking.children} Children` : ''}</span>
          </div>
          <div>
            <span className="text-ink-muted block">Rate per Night</span>
            <span className="font-semibold text-ink tabular-nums">{formatCurrency(booking.rate_per_night)}</span>
          </div>
        </div>

        <div className="p-4 bg-brand-sand/50 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-ink-muted">Total Room Tariff:</span>
            <span className="font-bold text-ink tabular-nums">{formatCurrency(booking.total_amount)}</span>
          </div>
          <div className="flex justify-between text-status-green">
            <span>Advance Received:</span>
            <span className="font-bold tabular-nums">− {formatCurrency(booking.advance_amount)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-border-subtle">
            <span className="text-ink">Balance at Checkout:</span>
            <span className="text-brand-forest tabular-nums">
              {formatCurrency(Math.max(0, booking.total_amount - booking.advance_amount))}
            </span>
          </div>
        </div>

        {/* Check-In Action Button */}
        {!isCheckedIn && !isCancelled && !isCheckedOut && (
          <CheckInClientAction bookingId={booking.id} roomNumber={booking.room.room_number} />
        )}
      </div>
    </div>
  );
}
