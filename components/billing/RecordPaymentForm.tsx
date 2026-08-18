'use client';

import { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { recordPaymentAction } from '../../lib/checkinout/actions';
import { PaymentMode, PaymentStatus } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';

interface RecordPaymentFormProps {
  bookingId: string;
  balanceDue: number;
  grandTotal: number;
  onPaymentRecorded: (newStatus: PaymentStatus, paidAmount: number) => void;
}

const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: 'upi', label: 'UPI (GPay / PhonePe)' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer (IMPS/NEFT)' },
  { value: 'other', label: 'Other' },
];

export default function RecordPaymentForm({
  bookingId,
  balanceDue,
  grandTotal,
  onPaymentRecorded,
}: RecordPaymentFormProps) {
  const [amount, setAmount] = useState<number>(balanceDue);
  const [mode, setMode] = useState<PaymentMode>('upi');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await recordPaymentAction(bookingId, amount, mode, notes, grandTotal);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.success && result.updatedPaymentStatus) {
        setSuccessMessage(`Payment of ${formatCurrency(amount)} recorded successfully.`);
        const recordedAmount = amount;
        setAmount(0);
        setNotes('');
        onPaymentRecorded(result.updatedPaymentStatus, recordedAmount);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
        <div className="p-2 bg-brand-sand rounded-lg text-brand-forest">
          <CreditCard className="w-4 h-4" />
        </div>
        <h4 className="font-bold text-ink text-sm">Record Payment</h4>
      </div>

      {error && (
        <div className="p-3 bg-action-danger/10 border border-action-danger/30 rounded-lg flex items-start gap-2 text-action-danger text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-status-green/10 border border-status-green/20 rounded-lg flex items-start gap-2 text-status-green text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="payment_amount">
            Amount (₹) *
          </label>
          <input
            id="payment_amount"
            type="number"
            min="1"
            required
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-[40px]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="payment_mode_rec">
            Payment Mode *
          </label>
          <select
            id="payment_mode_rec"
            value={mode}
            onChange={(e) => setMode(e.target.value as PaymentMode)}
            className="w-full px-2.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-[40px]"
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="payment_notes">
            Notes
          </label>
          <input
            id="payment_notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. UPI ref: 12345"
            className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-[40px]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 shadow-2xs disabled:opacity-60 min-h-[40px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Recording...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
