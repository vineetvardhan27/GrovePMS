'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Users,
  Calendar,
  CreditCard,
  Building,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { BookingWithDetails } from '../../lib/bookings/queries';
import { checkInAction } from '../../lib/checkinout/actions';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';

interface CheckInConfirmModalProps {
  booking: BookingWithDetails;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export default function CheckInConfirmModal({
  booking,
  onClose,
  onSuccess,
}: CheckInConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balanceDue = Math.max(0, booking.total_amount - booking.advance_amount);

  const handleConfirmCheckIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await checkInAction(booking.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess(booking.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 bg-status-green/10 border-b border-status-green/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-status-green/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-status-green" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-ink text-base md:text-lg">Confirm Check-In</h3>
              <p className="text-xs text-ink-muted">Verify guest & room details before checking in</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3.5 bg-action-danger/10 border border-action-danger/30 rounded-lg flex items-start gap-3 text-action-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Guest Info */}
          <div className="p-4 bg-brand-sand/60 rounded-lg border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted font-medium uppercase tracking-wider">Booking</span>
              <span className="font-mono font-bold text-ink text-xs">{booking.booking_number}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-ink-muted" />
              <div>
                <p className="font-bold text-ink">{booking.guest.full_name}</p>
                <p className="text-xs text-ink-muted">{booking.guest.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-ink-muted" />
              <div>
                <p className="font-bold text-ink">Room {booking.room.room_number}</p>
                <p className="text-xs text-ink-muted">{booking.room.category.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-ink-muted" />
              <div>
                <p className="text-ink text-xs sm:text-sm">
                  <strong>{formatDate(booking.check_in_date)}</strong> → <strong>{formatDate(booking.check_out_date)}</strong>
                </p>
                <p className="text-xs text-ink-muted">
                  {booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-brand-sand rounded-lg border border-border-subtle">
              <span className="block text-[11px] text-ink-muted">Total</span>
              <span className="block font-bold text-ink tabular-nums text-xs sm:text-sm">{formatCurrency(booking.total_amount)}</span>
            </div>
            <div className="p-2.5 bg-status-green/10 rounded-lg border border-status-green/20">
              <span className="block text-[11px] text-status-green">Advance</span>
              <span className="block font-bold text-status-green tabular-nums text-xs sm:text-sm">{formatCurrency(booking.advance_amount)}</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${balanceDue > 0 ? 'bg-status-amber/10 border-status-amber/20' : 'bg-brand-sand border-border-subtle'}`}>
              <span className="block text-[11px] text-ink-muted">Balance</span>
              <span className={`block font-bold tabular-nums text-xs sm:text-sm ${balanceDue > 0 ? 'text-status-amber' : 'text-status-green'}`}>
                {formatCurrency(balanceDue)}
              </span>
            </div>
          </div>

          <p className="text-xs text-ink-muted text-center">
            Room will immediately flip to <strong className="text-status-red">Occupied</strong> on all devices.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-brand-sand border-t border-border-subtle flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border-subtle bg-white hover:bg-brand-sand text-ink text-sm font-medium transition-colors cursor-pointer min-h-touch"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmCheckIn}
            className="flex-1 py-2.5 rounded-lg bg-status-green hover:bg-status-green/80 text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 min-h-touch"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking In...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Check-In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
