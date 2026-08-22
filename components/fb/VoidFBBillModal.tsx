'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';
import { FBBillRecord } from '../../lib/fb/types';
import { voidFBBillAction } from '../../lib/fb/actions';
import { formatCurrency } from '../../lib/utils/currency';

interface VoidFBBillModalProps {
  bill: FBBillRecord;
  onClose: () => void;
}

export default function VoidFBBillModal({ bill, onClose }: VoidFBBillModalProps) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVoid = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reason.trim() || reason.trim().length < 3) {
      setErrorMessage('Please state the operational reason for voiding this bill.');
      return;
    }

    startTransition(async () => {
      const res = await voidFBBillAction(bill.id, reason.trim());
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
          <h3 className="text-sm font-bold text-action-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Void F&B Bill #{bill.bill_number}
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

        <div className="bg-action-danger/10 p-3 rounded-lg border border-action-danger/20 text-action-danger space-y-1">
          <div className="font-bold">Caution: Financial Cancellation</div>
          <div className="text-[11px] leading-relaxed">
            Voiding will cancel this bill ({formatCurrency(bill.grand_total)}). If this bill was posted to a guest room folio, it will be removed. An immutable audit log will be created.
          </div>
        </div>

        <form onSubmit={handleVoid} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-ink-muted block mb-1">
              Reason for Void / Cancellation *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Order entered incorrectly / Guest changed meal preference..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-action-danger"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted hover:text-ink cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-action-danger hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Voiding Bill...' : 'Confirm Void Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
