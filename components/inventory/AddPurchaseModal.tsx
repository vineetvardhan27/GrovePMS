'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../lib/inventory/types';
import { recordPurchaseAction } from '../../lib/inventory/actions';
import { formatCurrency } from '../../lib/utils/currency';
import { X, PlusCircle, AlertCircle, Calendar, Truck, CreditCard, Package } from 'lucide-react';
import SearchableInventorySelector from './SearchableInventorySelector';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  preselectedItemId?: string;
  onSuccess?: () => void;
}

export default function AddPurchaseModal({
  isOpen,
  onClose,
  items,
  preselectedItemId,
  onSuccess,
}: AddPurchaseModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || (items.length > 0 ? items[0].id : '')
  );
  const [quantity, setQuantity] = useState<string>('10');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync preselectedItemId
  useEffect(() => {
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
      const item = items.find((i) => i.id === preselectedItemId);
      if (item) setUnitPrice(String(item.cost_per_unit || 0));
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
      setUnitPrice(String(items[0].cost_per_unit || 0));
    }
  }, [preselectedItemId, items]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId) || items[0];

  // Auto populate unit price from item's default cost if empty
  const effectiveUnitPrice = unitPrice !== '' ? Number(unitPrice) : (currentItem?.cost_per_unit || 0);
  const parsedQty = parseFloat(quantity) || 0;
  const totalCost = Math.round(parsedQty * effectiveUnitPrice * 100) / 100;

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItemId(item.id);
    setUnitPrice(String(item.cost_per_unit || 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedItemId) {
      setErrorMessage('Please select an inventory item.');
      return;
    }

    if (parsedQty <= 0) {
      setErrorMessage('Please enter a valid purchase quantity greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordPurchaseAction({
        item_id: selectedItemId,
        quantity: parsedQty,
        unit_price: effectiveUnitPrice,
        supplier: supplier.trim() || undefined,
        purchase_date: purchaseDate,
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
      setErrorMessage(err?.message || 'Failed to record purchase.');
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
            <div className="p-2 bg-status-green/15 text-status-green rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-forest">Add Inventory Purchase</h3>
              <p className="text-xs text-ink-muted">Increase stock and log supplier invoice across food, linen &amp; supplies</p>
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
            onSelectItem={handleSelectItem}
            label="Select Inventory Item / Raw Material"
            required
            placeholder="Search items by name, category, supplier (e.g. rice, blanket, oil)..."
          />

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Purchased Quantity *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all font-mono"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted uppercase pointer-events-none">
                  {currentItem?.unit || 'unit'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Purchase Price per {currentItem?.unit || 'unit'} (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice !== '' ? unitPrice : (currentItem?.cost_per_unit || 0)}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="Rate per unit"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all font-mono"
                required
              />
            </div>
          </div>

          {/* Total Cost Preview Card */}
          <div className="p-3 bg-brand-sand/60 rounded-xl border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Package className="w-4 h-4 text-brand-forest" />
              <span>
                New Stock: <strong className="text-ink">{(Number(currentItem?.current_stock || 0) + parsedQty).toFixed(2)} {currentItem?.unit}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-ink-muted block uppercase tracking-wider font-semibold">Total Cost</span>
              <span className="text-sm font-bold font-mono text-brand-forest">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          {/* Supplier & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Supplier / Vendor
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Metro Cash & Carry"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                />
                <Truck className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Purchase Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  required
                />
                <Calendar className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Invoice Notes / Batch Info (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Invoice #INV-8891, 50kg bag batch"
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
            />
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-status-green hover:bg-status-green/90 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Confirm Purchase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
