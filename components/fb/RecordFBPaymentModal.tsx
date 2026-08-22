'use client';

import { useState, useTransition } from 'react';
import { CreditCard, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { FBBillRecord } from '../../lib/fb/types';
import { recordFBPaymentAction } from '../../lib/fb/actions';
import { PaymentMode } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';

interface RecordFBPaymentModalProps {
  bill: FBBillRecord;
  onClose: () => void;
}

export default function RecordFBPaymentModal({ bill, onClose }: RecordFBPaymentModalProps) {
  const [amount, setAmount] = useState<string>(String(bill.balance_due || bill.grand_total));
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmt = Number(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMessage('Please enter a valid positive payment amount.');
      return;
    }

    startTransition(async () => {
      const res = await recordFBPaymentAction({
        billId: bill.id,
        amount: numAmt,
        paymentMode,
        referenceNumber: referenceNumber.trim() || null,
        notes: notes.trim() || null,
      });

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      if (res.success) {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-border-subtle shadow-modal max-w-md w-full p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-forest" />
            Record Payment for Bill #{bill.bill_number}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-action-danger/10 border border-action-danger/30 rounded-lg text-action-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-brand-sand/30 p-3 rounded-lg border border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-ink-muted text-[11px]">Customer</div>
            <div className="font-semibold text-ink">{bill.customer_name}</div>
          </div>
          <div className="text-right">
            <div className="text-ink-muted text-[11px]">Balance Due</div>
            <div className="font-bold text-sm text-status-amber tabular-nums">
              {formatCurrency(bill.balance_due)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-ink-muted block mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold text-ink rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest tabular-nums"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-ink-muted block mb-1">
              Payment Mode *
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 font-semibold text-ink focus:outline-none"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI (GPay / PhonePe / QR)</option>
              <option value="card">Credit / Debit Card (POS)</option>
              <option value="bank_transfer">Bank Transfer / NEFT</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-ink-muted block mb-1">
              Reference / Transaction ID
            </label>
            <input
              type="text"
              placeholder="e.g. UPI-9238492 or Card Auth Code"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-ink-muted block mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. Settled at restaurant counter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted hover:text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="pms-btn-primary text-xs shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Recording...' : 'Confirm & Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
