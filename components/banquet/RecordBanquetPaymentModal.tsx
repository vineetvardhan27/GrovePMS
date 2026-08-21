'use client';

import { useState, useEffect } from 'react';
import { PaymentMode, PaymentType } from '../../lib/types/database.types';
import { recordBanquetPaymentAction } from '../../lib/banquet/actions';
import { formatCurrency } from '../../lib/utils/currency';
import { X, CreditCard, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface RecordBanquetPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  suggestedAmount?: number;
  onSuccess?: () => void;
}

const PAYMENT_MODES: { id: PaymentMode; label: string }[] = [
  { id: 'upi', label: 'UPI / QR Code / GPay' },
  { id: 'cash', label: 'Cash Payment' },
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer / NEFT / RTGS' },
  { id: 'other', label: 'Other Method' },
];

const PAYMENT_TYPES: { id: PaymentType; label: string }[] = [
  { id: 'partial', label: 'Partial Payment / Installment' },
  { id: 'settlement', label: 'Final Settlement' },
  { id: 'advance', label: 'Additional Advance Deposit' },
  { id: 'refund', label: 'Refund to Host' },
];

export default function RecordBanquetPaymentModal({
  isOpen,
  onClose,
  bookingId,
  suggestedAmount = 0,
  onSuccess,
}: RecordBanquetPaymentModalProps) {
  const [amount, setAmount] = useState<string>(suggestedAmount > 0 ? String(suggestedAmount) : '');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [paymentType, setPaymentType] = useState<PaymentType>('partial');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (suggestedAmount > 0) {
      setAmount(String(suggestedAmount));
      if (suggestedAmount > 0) setPaymentType('settlement');
    }
  }, [suggestedAmount]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amt = parseFloat(amount) || 0;
    if (amt <= 0) {
      setErrorMessage('Please enter a valid positive payment amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordBanquetPaymentAction({
        banquet_booking_id: bookingId,
        amount: amt,
        payment_mode: paymentMode,
        payment_type: paymentType,
        reference_number: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-modal-title"
    >
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-modal border border-border-subtle animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-brand-forest text-white shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <CreditCard className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 id="record-payment-modal-title" className="font-serif font-bold text-base text-white">
                Record Payment
              </h3>
              <p className="text-xs text-white/70">Collect advance, installment, or final settlement</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form id="record-payment-form" onSubmit={handleSubmit} noValidate>
            <div className="p-5 space-y-4">
              {errorMessage && (
                <div
                  className="p-3 bg-action-danger/10 border border-action-danger/25 text-action-danger rounded-lg text-sm flex items-center gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="rp-amount" className="pms-label mb-0">
                    Payment Amount (₹) <span className="text-action-danger">*</span>
                  </label>
                  {suggestedAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(suggestedAmount))}
                      className="text-xs text-brand-forest font-semibold hover:underline cursor-pointer"
                    >
                      Fill Balance: {formatCurrency(suggestedAmount)}
                    </button>
                  )}
                </div>
                <input
                  id="rp-amount"
                  type="number"
                  min="1"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="pms-input text-lg font-mono font-bold text-brand-forest"
                  required
                  autoFocus
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label htmlFor="rp-mode" className="pms-label">
                  Payment Method <span className="text-action-danger">*</span>
                </label>
                <select
                  id="rp-mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="pms-select w-full"
                  required
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Type */}
              <div>
                <label htmlFor="rp-type" className="pms-label">
                  Transaction Classification
                </label>
                <select
                  id="rp-type"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className="pms-select w-full"
                >
                  {PAYMENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference / Transaction ID */}
              <div>
                <label htmlFor="rp-ref" className="pms-label">
                  Transaction Reference / UTR / Cheque #
                </label>
                <input
                  id="rp-ref"
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UPI-349823948 or HDFC-CHQ-1002"
                  className="pms-input font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="rp-notes" className="pms-label">
                  Notes & Audit Remarks
                </label>
                <input
                  id="rp-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Handed over cash by Mr. Roy at reception"
                  className="pms-input"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0 bg-white rounded-b-2xl">
          <button type="button" onClick={handleClose} disabled={isSubmitting} className="pms-btn-secondary">
            Cancel
          </button>
          <button type="submit" form="record-payment-form" disabled={isSubmitting} className="pms-btn-primary">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Confirm Payment Receipt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
