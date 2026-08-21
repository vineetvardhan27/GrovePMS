'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  Utensils,
  Info,
  DollarSign,
} from 'lucide-react';
import { InventoryItem } from '../../lib/inventory/types';
import { recordWastageAction } from '../../lib/inventory/actions';
import { formatCurrency } from '../../lib/utils/currency';
import SearchableInventorySelector from './SearchableInventorySelector';

interface ReportWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  preselectedItemId?: string;
  onSuccess: () => void;
}

const WASTE_REASONS = [
  'Spoiled / Rotten',
  'Expired Shelf Life',
  'Burnt / Cooking Error',
  'Overprepared / Leftover Excess',
  'Damaged / Broken Packaging',
  'Spilled / Contaminated',
  'Customer Rejected',
  'Other Wastage',
];

export default function ReportWasteModal({
  isOpen,
  onClose,
  items,
  preselectedItemId,
  onSuccess,
}: ReportWasteModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(preselectedItemId || items[0]?.id || '');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>(WASTE_REASONS[0]);
  const [wasteDate, setWasteDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync preselected
  useEffect(() => {
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
  }, [preselectedItemId, items]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);
  const qtyNum = Number(quantity) || 0;
  const estimatedLoss = qtyNum * (currentItem?.cost_per_unit || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      setErrorMsg('Please select an inventory item.');
      return;
    }
    if (qtyNum <= 0) {
      setErrorMsg('Please enter a valid wastage quantity greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await recordWastageAction({
        item_id: selectedItemId,
        quantity: qtyNum,
        reason,
        waste_date: wasteDate,
        notes: notes.trim() || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onSuccess();
        onClose();
        setQuantity('');
        setNotes('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to record wastage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waste-modal-title"
    >
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-status-amber/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-amber text-white flex items-center justify-center shadow-2xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber block">
                Food &amp; Consumable Loss
              </span>
              <h2 id="waste-modal-title" className="text-base font-serif font-bold text-brand-forest">
                Report Wastage / Spoilage
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-action-danger/10 border border-action-danger/30 rounded-xl flex items-center gap-2 text-action-danger font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Searchable Item Selector */}
          <SearchableInventorySelector
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={(item) => setSelectedItemId(item.id)}
            label="Select Item Wasted"
            required
            placeholder="Search food & consumables (e.g. rice, milk, tomato)..."
          />

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="waste-qty" className="font-bold text-ink block">
                Quantity Wasted <span className="text-status-red">*</span>
              </label>
              <div className="relative">
                <input
                  id="waste-qty"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="w-full h-10 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted font-mono text-xs pointer-events-none">
                  {currentItem?.unit || 'units'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="waste-date" className="font-bold text-ink block">
                Date of Wastage <span className="text-status-red">*</span>
              </label>
              <input
                id="waste-date"
                type="date"
                value={wasteDate}
                onChange={(e) => setWasteDate(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label htmlFor="waste-reason" className="font-bold text-ink block">
              Reason / Cause <span className="text-status-red">*</span>
            </label>
            <select
              id="waste-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
              required
            >
              {WASTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="waste-notes" className="font-bold text-ink block">
              Notes &amp; Details <span className="text-ink-muted font-normal">(Optional)</span>
            </label>
            <textarea
              id="waste-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Discovered sour milk in walk-in chiller upon morning inspection"
              className="w-full p-2.5 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
            />
          </div>

          {/* Live Loss Calculation Preview */}
          {qtyNum > 0 && (
            <div className="p-3 bg-brand-sand/60 rounded-xl border border-border-subtle flex items-center justify-between text-xs">
              <span className="text-ink-muted font-medium">Estimated Financial Loss:</span>
              <span className="font-mono font-bold text-status-amber text-sm tabular-nums">
                {formatCurrency(estimatedLoss)}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="pms-btn-secondary h-9 px-4 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="pms-btn-primary h-9 px-4 text-xs gap-1.5 bg-status-amber hover:bg-status-amber/90"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Recording...' : 'Record Wastage'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
