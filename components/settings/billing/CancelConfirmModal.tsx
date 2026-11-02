'use client';

import React, { useState } from 'react';
import { AlertCircle, Clock, X, ShieldAlert } from 'lucide-react';

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  periodEndDate?: string | null;
  hotelName: string;
}

export default function CancelConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  periodEndDate,
  hotelName,
}: CancelConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'the end of your current cycle';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'the end of your current cycle';
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#1C2D29]/15 shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-5 animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-brand-sand/50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-status-red/10 border border-status-red/20 text-status-red flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#142320]">
            Cancel Grove PMS Subscription?
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Are you sure you want to cancel the recurring ₹999/month subscription for{' '}
            <strong className="text-[#142320]">{hotelName}</strong>?
          </p>
        </div>

        {/* Terms & Paid-Through Period Callout */}
        <div className="p-4 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/10 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
            <div className="text-ink leading-relaxed">
              <strong className="font-semibold block text-[#142320]">
                Paid-Through Period Respected:
              </strong>
              <span>
                Your property will retain full operational access through{' '}
                <strong className="text-[#142320]">{formatDate(periodEndDate)}</strong>.
                No further recurring charges will be deducted from your bank mandate.
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-status-red/10 border border-status-red/25 text-status-red text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-brand-sand/40 text-ink border border-[#1C2D29]/15 transition-all cursor-pointer"
          >
            Keep Subscription
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-status-red hover:bg-[#B3352A] text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

