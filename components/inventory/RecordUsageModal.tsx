'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../lib/inventory/types';
import { recordUsageAction } from '../../lib/inventory/actions';
import { formatCurrency } from '../../lib/utils/currency';
import { X, MinusCircle, AlertCircle, Calendar, Utensils, AlertTriangle, Package } from 'lucide-react';
import SearchableInventorySelector from './SearchableInventorySelector';

interface RecordUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  preselectedItemId?: string;
  onSuccess?: () => void;
}

const COMMON_REASONS = [
  'Kitchen Daily Cooking',
  'Breakfast Buffet Preparation',
  'Lunch & Dinner Service',
  'Staff Meals',
  'Spoilage / Waste / Expired',
  'Damage / Spill',
  'Guest Special Order',
  'Inventory Count Adjustment',
];

export default function RecordUsageModal({
  isOpen,
  onClose,
  items,
  preselectedItemId,
  onSuccess,
}: RecordUsageModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || (items.length > 0 ? items[0].id : '')
  );
  const [quantity, setQuantity] = useState<string>('2');
  const [reason, setReason] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [usageDate, setUsageDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync preselectedItemId
  useEffect(() => {
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
  }, [preselectedItemId, items]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId) || items[0];
  const availableStock = Number(currentItem?.current_stock || 0);
  const parsedQty = parseFloat(quantity) || 0;
  const isOverStock = parsedQty > availableStock;
  const remainingStock = Math.max(0, Math.round((availableStock - parsedQty) * 100) / 100);

  const effectiveReason = reason === 'Other' ? customReason.trim() : reason;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedItemId) {
      setErrorMessage('Please select an inventory item.');
      return;
    }

    if (parsedQty <= 0) {
      setErrorMessage('Please enter a valid quantity greater than 0.');
      return;
    }

    if (isOverStock) {
      setErrorMessage(
        `Insufficient stock! Only ${availableStock} ${currentItem?.unit} available in inventory.`
      );
      return;
    }

    if (!effectiveReason) {
      setErrorMessage('Please provide a reason for consumption.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordUsageAction({
        item_id: selectedItemId,
        quantity: parsedQty,
        reason: effectiveReason,
        usage_date: usageDate,
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
      setErrorMessage(err?.message || 'Failed to record inventory usage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-subtle animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-brand-sand/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-status-amber/15 text-status-amber rounded-xl">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-forest">Record Stock Usage</h3>
              <p className="text-xs text-ink-muted">Deduct raw materials consumed in kitchen or operations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-action-danger/10 border border-action-danger/25 text-action-danger rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Searchable Item Selector */}
          <SearchableInventorySelector
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={(item) => setSelectedItemId(item.id)}
            label="Select Inventory Item"
            required
            placeholder="Search items by name, category (e.g. rice, flour, milk, cleaner)..."
          />

          {/* Available Stock Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              availableStock === 0
                ? 'bg-status-red/10 border-status-red/30 text-status-red'
                : availableStock <= (currentItem?.minimum_stock || 0)
                ? 'bg-status-amber/10 border-status-amber/30 text-status-amber'
                : 'bg-brand-sand/60 border-border-subtle text-ink'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>
                Available Stock:{' '}
                <strong>
                  {availableStock} {currentItem?.unit}
                </strong>
              </span>
            </div>
            <div>
              {availableStock <= (currentItem?.minimum_stock || 0) && (
                <span className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Low Stock
                </span>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Quantity Used / Consumed *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={availableStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all font-mono ${
                  isOverStock ? 'border-status-red text-status-red' : 'border-border-subtle'
                }`}
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted uppercase pointer-events-none">
                {currentItem?.unit || 'unit'}
              </span>
            </div>
            {isOverStock ? (
              <p className="mt-1 text-xs text-status-red font-medium">
                Cannot consume more than available stock ({availableStock} {currentItem?.unit})
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-ink-muted font-mono">
                Remaining stock after usage: <strong className="text-brand-forest">{remainingStock} {currentItem?.unit}</strong>
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Consumption Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
            >
              {COMMON_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Other">Other Reason...</option>
            </select>
          </div>

          {/* Custom reason if "Other" */}
          {reason === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Specify Reason *
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Special banquet catering preparation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              />
            </div>
          )}

          {/* Date & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Usage Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all font-mono"
                  required
                />
                <Calendar className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Head Chef Approved"
                className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-subtle text-ink font-medium text-xs hover:bg-brand-sand transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverStock}
              className="px-5 py-2.5 rounded-xl bg-status-amber hover:bg-status-amber/90 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Deducting...' : 'Confirm Usage'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
