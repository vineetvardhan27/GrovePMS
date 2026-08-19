'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { checkInAction } from '../../../../lib/checkinout/actions';

interface CheckInClientActionProps {
  bookingId: string;
  roomNumber: string;
}

export default function CheckInClientAction({ bookingId, roomNumber }: CheckInClientActionProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await checkInAction(bookingId);
      if (result.success) {
        router.push('/rooms');
      } else {
        setError(result.error || 'Failed to complete check-in.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {error && (
        <p className="text-xs font-semibold text-action-danger">{error}</p>
      )}

      <button
        type="button"
        onClick={handleCheckIn}
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-lg bg-status-green hover:bg-status-green/90 text-white font-bold text-sm transition-colors cursor-pointer min-h-touch flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking In...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirm Check-In to Room {roomNumber}</span>
          </>
        )}
      </button>
    </div>
  );
}
