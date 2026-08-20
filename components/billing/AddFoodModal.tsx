'use client';

import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { FoodServiceType, TaxTreatment } from '../../lib/types/database.types';
import { MenuItem, MenuCategory } from '../../lib/menu/types';
import { addFoodChargeAction, FoodChargeRecord } from '../../lib/billing/food-actions';
import { formatCurrency } from '../../lib/utils/currency';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  roomNumber: string;
  guestName: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  gstPercentage: number;
  onChargeAdded?: (charge: FoodChargeRecord) => void;
}

const SERVICE_OPTIONS: { type: FoodServiceType; label: string; icon: string }[] = [
  { type: 'Breakfast', label: 'Breakfast', icon: '🌅' },
  { type: 'Lunch', label: 'Lunch', icon: '☀️' },
  { type: 'Dinner', label: 'Dinner', icon: '🌙' },
  { type: 'Snacks', label: 'Snacks', icon: '🥪' },
  { type: 'Beverages', label: 'Beverages', icon: '☕' },
  { type: 'Other', label: 'Other / Room Service', icon: '🍽️' },
];

export default function AddFoodModal({
  isOpen,
  onClose,
  bookingId,
  roomNumber,
  guestName,
  categories,
  menuItems,
  gstPercentage,
  onChargeAdded,
}: AddFoodModalProps) {
  const [selectedService, setSelectedService] = useState<FoodServiceType>('Breakfast');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [taxTreatment, setTaxTreatment] = useState<TaxTreatment>('gst');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync category when service changes
  React.useEffect(() => {
    const matchingCat = categories.find(
      (c) => c.name.toLowerCase() === selectedService.toLowerCase()
    );
    if (matchingCat) {
      setSelectedCategoryId(matchingCat.id);
    } else if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
    setSelectedItemId('');
    setQuantity(1);
    setError(null);
  }, [selectedService, categories]);

  // Active items available in selected category
  const filteredItems = useMemo(() => {
    const active = menuItems.filter((i) => i.is_active !== false);
    if (selectedCategoryId) {
      return active.filter((i) => i.category_id === selectedCategoryId);
    }
    return active;
  }, [menuItems, selectedCategoryId]);

  // Automatically select first item in category if not selected
  React.useEffect(() => {
    if (filteredItems.length > 0 && !selectedItemId) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [filteredItems, selectedItemId]);

  // Selected item object & pricing calculations
  const selectedItem = useMemo(() => {
    return menuItems.find((i) => i.id === selectedItemId);
  }, [menuItems, selectedItemId]);

  const unitPrice = selectedItem ? Number(selectedItem.selling_price) : 0;
  const taxableAmount = Math.round(quantity * unitPrice * 100) / 100;
  const effectiveGstRate = taxTreatment === 'gst' ? gstPercentage : 0;
  const gstAmount = taxTreatment === 'gst' ? Math.round(((taxableAmount * effectiveGstRate) / 100) * 100) / 100 : 0;
  const totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      setError('Please select a food item from the menu.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await addFoodChargeAction({
        booking_id: bookingId,
        menu_item_id: selectedItemId,
        service_type: selectedService,
        quantity,
        tax_treatment: taxTreatment,
        remarks: remarks.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.charge && onChargeAdded) {
        onChargeAdded(res.charge);
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add food charge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-border-subtle shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-brand-forest text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Utensils className="w-5 h-5 text-brand-sand" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight">Add Food &amp; Beverage</h2>
              <p className="text-xs text-brand-sand/80">
                Room {roomNumber} • {guestName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3.5 bg-action-danger/10 border border-action-danger/30 rounded-xl flex items-start gap-2.5 text-action-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* 1. Meal / Service Type Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px] block">
              1. Service Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_OPTIONS.map((srv) => {
                const isSelected = selectedService === srv.type;
                return (
                  <button
                    key={srv.type}
                    type="button"
                    onClick={() => setSelectedService(srv.type)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-semibold text-xs border transition-all cursor-pointer min-h-touch ${
                      isSelected
                        ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                        : 'bg-brand-sand/30 border-border-subtle text-ink hover:bg-brand-sand/60'
                    }`}
                  >
                    <span>{srv.icon}</span>
                    <span>{srv.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Menu Item Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">
                2. Select Food Item
              </label>
              {filteredItems.length === 0 && (
                <span className="text-status-amber text-[11px] font-medium">No items in this category</span>
              )}
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-forest bg-brand-forest/5 shadow-xs ring-1 ring-brand-forest'
                          : 'border-border-subtle hover:bg-brand-sand/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className={`font-bold text-xs ${isSelected ? 'text-brand-forest' : 'text-ink'}`}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-ink-muted line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-ink tabular-nums shrink-0 text-xs bg-brand-sand px-2 py-0.5 rounded border border-border-subtle">
                        {formatCurrency(item.selling_price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-brand-sand/40 border border-border-subtle text-center text-ink-muted">
                No active food items found in this section. Please manage items under Settings &gt; Food Menu.
              </div>
            )}
          </div>

          {/* 3. Quantity & Pricing Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-brand-sand/30 border border-border-subtle">
            {/* Quantity Stepper */}
            <div className="space-y-1.5">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px] block">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-white border border-border-subtle flex items-center justify-center text-ink hover:bg-brand-sand transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 text-center font-mono font-bold text-base bg-white border border-border-subtle rounded-lg text-ink"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-lg bg-white border border-border-subtle flex items-center justify-center text-ink hover:bg-brand-sand transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Read-Only Price Snapshot */}
            <div className="space-y-1 sm:text-right">
              <span className="font-bold text-ink uppercase tracking-wider text-[11px] block">
                Menu Tariff (Immutable)
              </span>
              <p className="font-mono text-sm font-semibold text-ink">
                {quantity} × {formatCurrency(unitPrice)}
              </p>
              <p className="font-bold text-brand-forest text-base tabular-nums">
                = {formatCurrency(taxableAmount)}
              </p>
            </div>
          </div>

          {/* 4. Tax Treatment: GST vs Non-GST */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px] block">
              Tax Treatment
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  taxTreatment === 'gst'
                    ? 'border-brand-forest bg-brand-forest/5 font-semibold text-brand-forest ring-1 ring-brand-forest'
                    : 'border-border-subtle bg-white text-ink hover:bg-brand-sand/30'
                }`}
              >
                <input
                  type="radio"
                  name="tax_treatment"
                  value="gst"
                  checked={taxTreatment === 'gst'}
                  onChange={() => setTaxTreatment('gst')}
                  className="accent-brand-forest w-4 h-4"
                />
                <div>
                  <p className="font-bold text-xs">Standard GST ({gstPercentage}%)</p>
                  <p className="text-[10px] text-ink-muted">Tax invoice with SAC 996331</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  taxTreatment === 'non_gst'
                    ? 'border-brand-forest bg-brand-forest/5 font-semibold text-brand-forest ring-1 ring-brand-forest'
                    : 'border-border-subtle bg-white text-ink hover:bg-brand-sand/30'
                }`}
              >
                <input
                  type="radio"
                  name="tax_treatment"
                  value="non_gst"
                  checked={taxTreatment === 'non_gst'}
                  onChange={() => setTaxTreatment('non_gst')}
                  className="accent-brand-forest w-4 h-4"
                />
                <div>
                  <p className="font-bold text-xs">Non-GST (0%)</p>
                  <p className="text-[10px] text-ink-muted">Zero-tax guest folio line</p>
                </div>
              </label>
            </div>
          </div>

          {/* 5. Remarks / Special Instructions */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px] block">
              Order Remarks / Notes (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Room service, extra spicy, served hot"
              className="w-full px-3.5 py-2.5 bg-white border border-border-subtle rounded-xl text-ink text-xs focus:ring-1 focus:ring-brand-forest focus:outline-hidden"
            />
          </div>

          {/* Financial Preview Strip */}
          <div className="p-3.5 rounded-xl bg-brand-sand/50 border border-border-subtle space-y-1">
            <div className="flex justify-between text-ink-muted">
              <span>Food Subtotal ({quantity} {quantity === 1 ? 'item' : 'items'}):</span>
              <span className="font-mono font-medium text-ink">{formatCurrency(taxableAmount)}</span>
            </div>
            {taxTreatment === 'gst' ? (
              <div className="flex justify-between text-ink-muted">
                <span>GST ({gstPercentage}%):</span>
                <span className="font-mono font-medium text-ink">{formatCurrency(gstAmount)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-status-blue">
                <span>Tax Rate:</span>
                <span className="font-mono font-semibold">Non-GST (₹0.00)</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-border-subtle font-bold text-brand-forest text-sm">
              <span>Total Charge to Room:</span>
              <span className="font-mono text-base tabular-nums">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-subtle text-ink font-semibold hover:bg-brand-sand transition-colors cursor-pointer min-h-touch"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || filteredItems.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-forest-light text-white font-bold transition-all shadow-sm disabled:opacity-60 cursor-pointer min-h-touch"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding to Bill...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Charge {formatCurrency(totalAmount)} to Room</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
