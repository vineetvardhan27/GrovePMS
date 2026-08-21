'use client';

import { useState, useEffect } from 'react';
import { BanquetChargeCategory, TaxTreatment } from '../../lib/types/database.types';
import { addBanquetChargeAction } from '../../lib/banquet/actions';
import { formatCurrency } from '../../lib/utils/currency';
import { X, Plus, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface AddBanquetChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess?: () => void;
}

const CHARGE_CATEGORIES: { id: BanquetChargeCategory; label: string; defaultSac: string }[] = [
  { id: 'catering', label: 'Catering & Food Service', defaultSac: '996331' },
  { id: 'food_beverage', label: 'Beverages & Soft Drinks', defaultSac: '996331' },
  { id: 'decoration', label: 'Stage & Flower Decoration', defaultSac: '996311' },
  { id: 'audio_visual', label: 'AV Projector, Sound & Mics', defaultSac: '996311' },
  { id: 'equipment', label: 'Special Stage & Furniture Setup', defaultSac: '996311' },
  { id: 'generator', label: 'Dedicated DG Power Backup', defaultSac: '996311' },
  { id: 'accommodation', label: 'Associated Guest Rooms', defaultSac: '996311' },
  { id: 'service_charge', label: 'Staff & Service Charge', defaultSac: '996311' },
  { id: 'cleaning', label: 'Post-Event Cleaning & Sanitization', defaultSac: '996311' },
  { id: 'miscellaneous', label: 'Miscellaneous / Other', defaultSac: '996311' },
];

export default function AddBanquetChargeModal({
  isOpen,
  onClose,
  bookingId,
  onSuccess,
}: AddBanquetChargeModalProps) {
  const [category, setCategory] = useState<BanquetChargeCategory>('catering');
  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [discount, setDiscount] = useState<string>('0');
  const [taxTreatment, setTaxTreatment] = useState<TaxTreatment>('gst');
  const [taxRate, setTaxRate] = useState<string>('18');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live calculation
  const qtyNum = parseFloat(quantity) || 0;
  const priceNum = parseFloat(unitPrice) || 0;
  const discNum = parseFloat(discount) || 0;
  const taxable = Math.max(0, qtyNum * priceNum - discNum);
  const rateNum = taxTreatment === 'gst' ? parseFloat(taxRate) || 0 : 0;
  const taxAmount = taxTreatment === 'gst' ? Math.round(((taxable * rateNum) / 100) * 100) / 100 : 0;
  const totalAmount = taxable + taxAmount;

  // Lock body scroll
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

  const handleCategoryChange = (newCat: BanquetChargeCategory) => {
    setCategory(newCat);
    if (!description || description.trim() === '') {
      const found = CHARGE_CATEGORIES.find((c) => c.id === newCat);
      if (found) setDescription(found.label);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!description.trim()) {
      setErrorMessage('Charge description is required.');
      return;
    }
    if (qtyNum <= 0) {
      setErrorMessage('Quantity must be greater than 0.');
      return;
    }
    if (priceNum <= 0) {
      setErrorMessage('Unit price must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addBanquetChargeAction({
        banquet_booking_id: bookingId,
        category,
        description: description.trim(),
        quantity: qtyNum,
        unit_price: priceNum,
        discount: discNum,
        tax_treatment: taxTreatment,
        tax_rate: rateNum,
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
      setErrorMessage(err?.message || 'Failed to add charge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-charge-modal-title"
    >
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-modal border border-border-subtle animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-brand-forest text-white shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Plus className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 id="add-charge-modal-title" className="font-serif font-bold text-base text-white">
                Add Folio Charge
              </h3>
              <p className="text-xs text-white/70">Add catering, AV, decoration, or service charges</p>
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
          <form id="add-charge-form" onSubmit={handleSubmit} noValidate>
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

              {/* Category */}
              <div>
                <label htmlFor="ac-category" className="pms-label">
                  Charge Category <span className="text-action-danger">*</span>
                </label>
                <select
                  id="ac-category"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as BanquetChargeCategory)}
                  className="pms-select w-full"
                  required
                  autoFocus
                >
                  {CHARGE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="ac-description" className="pms-label">
                  Item Description <span className="text-action-danger">*</span>
                </label>
                <input
                  id="ac-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Wedding Buffet (150 pax) or Projector Setup"
                  className="pms-input"
                  required
                />
              </div>

              {/* Qty, Unit Price, Discount */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="ac-quantity" className="pms-label">
                    Quantity <span className="text-action-danger">*</span>
                  </label>
                  <input
                    id="ac-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="pms-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ac-unit-price" className="pms-label">
                    Unit Price (₹) <span className="text-action-danger">*</span>
                  </label>
                  <input
                    id="ac-unit-price"
                    type="number"
                    min="0"
                    step="10"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="e.g. 450"
                    className="pms-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ac-discount" className="pms-label">
                    Discount (₹)
                  </label>
                  <input
                    id="ac-discount"
                    type="number"
                    min="0"
                    step="10"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="pms-input font-mono"
                  />
                </div>
              </div>

              {/* Tax Treatment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ac-tax-treatment" className="pms-label">
                    Tax Treatment
                  </label>
                  <select
                    id="ac-tax-treatment"
                    value={taxTreatment}
                    onChange={(e) => setTaxTreatment(e.target.value as TaxTreatment)}
                    className="pms-select w-full"
                  >
                    <option value="gst">GST (Applicable)</option>
                    <option value="non_gst">Non-GST (0%)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ac-tax-rate" className="pms-label">
                    GST Rate (%)
                  </label>
                  <select
                    id="ac-tax-rate"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    disabled={taxTreatment === 'non_gst'}
                    className="pms-select w-full disabled:opacity-50"
                  >
                    <option value="18">18% (Standard Services)</option>
                    <option value="12">12% (Accommodation/Hotel)</option>
                    <option value="5">5% (Restaurant/Food)</option>
                    <option value="0">0% (Exempt)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="ac-notes" className="pms-label">
                  Internal Notes (Optional)
                </label>
                <input
                  id="ac-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Approved by banquet manager"
                  className="pms-input"
                />
              </div>

              {/* Summary computation card */}
              <div className="p-4 bg-brand-sand/50 rounded-xl border border-border-subtle space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <span>Taxable Amount:</span>
                  <span className="font-mono font-semibold text-ink">{formatCurrency(taxable)}</span>
                </div>
                {taxTreatment === 'gst' && (
                  <div className="flex justify-between text-ink-muted">
                    <span>GST ({rateNum}%):</span>
                    <span className="font-mono text-ink">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-brand-forest pt-1.5 border-t border-border-subtle">
                  <span>Total Charge Amount:</span>
                  <span className="font-mono text-base tabular-nums">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0 bg-white rounded-b-2xl">
          <button type="button" onClick={handleClose} disabled={isSubmitting} className="pms-btn-secondary">
            Cancel
          </button>
          <button type="submit" form="add-charge-form" disabled={isSubmitting} className="pms-btn-primary">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Charge to Folio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
