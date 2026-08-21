'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../lib/inventory/types';
import { reportDamageAction } from '../../lib/inventory/actions';
import { formatCurrency } from '../../lib/utils/currency';
import {
  X,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Building,
  AlertTriangle,
  Info,
} from 'lucide-react';
import SearchableInventorySelector from './SearchableInventorySelector';

interface ReportDamageModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  preselectedItemId?: string;
  onSuccess?: () => void;
}

const DAMAGE_REASONS = [
  'Torn / Ripped Fabric',
  'Stained / Ink / Food Spills',
  'Burned / Cigarette Damage',
  'Broken / Mechanical Fault',
  'Water Damage / Mold',
  'Normal Heavy Wear & Tear',
  'Missing / Theft Unaccounted',
  'Other Defect',
];

const CONDITION_STATES = [
  'Minor Damage (Repairable via Laundry / Maintenance)',
  'Heavy Damage (Defective, Needs Retirement)',
  'Total Loss (Scrapped / Written Off)',
];

export default function ReportDamageModal({
  isOpen,
  onClose,
  items,
  preselectedItemId,
  onSuccess,
}: ReportDamageModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || (items.length > 0 ? items[0].id : '')
  );
  const [quantity, setQuantity] = useState<string>('1');
  const [reason, setReason] = useState<string>(DAMAGE_REASONS[0]);
  const [conditionState, setConditionState] = useState<string>(CONDITION_STATES[0]);
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [damageDate, setDamageDate] = useState<string>(
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
  const parsedQty = parseFloat(quantity) || 0;
  const estimatedLoss = Math.round(parsedQty * (currentItem?.cost_per_unit || 0) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedItemId) {
      setErrorMessage('Please select an asset or linen item.');
      return;
    }

    if (parsedQty <= 0) {
      setErrorMessage('Please enter a valid quantity of damaged items.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reportDamageAction({
        item_id: selectedItemId,
        quantity: parsedQty,
        reason,
        condition_state: conditionState,
        room_number: roomNumber.trim() || undefined,
        damage_date: damageDate,
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
      setErrorMessage(err?.message || 'Failed to report damage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-subtle animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-status-red/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-status-red/20 text-status-red rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-forest">Report Damaged Item</h3>
              <p className="text-xs text-ink-muted">Log damaged blankets, linens, and room assets for replacement planning</p>
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
            label="Select Asset / Linen Item"
            required
            placeholder="Search assets by name, category (e.g. blanket, towel, kettle)..."
          />

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Damaged Units *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all font-mono"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted uppercase pointer-events-none">
                  {currentItem?.unit || 'piece'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Room / Location (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 805"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                />
                <Building className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Damage Reason */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Damage Reason / Fault *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
            >
              {DAMAGE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Severity & Lifecycle State */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Severity / Lifecycle Action *
            </label>
            <select
              value={conditionState}
              onChange={(e) => setConditionState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
            >
              {CONDITION_STATES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Valuation & Replacement Impact Card */}
          <div className="p-3 bg-brand-sand/60 rounded-xl border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <AlertTriangle className="w-4 h-4 text-status-amber" />
              <span>
                New Damaged Count: <strong className="text-ink">{(Number(currentItem?.damaged_stock || 0) + parsedQty)} {currentItem?.unit}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-ink-muted block uppercase tracking-wider font-semibold">
                Est. Replacement Cost
              </span>
              <span className="text-sm font-bold font-mono text-status-red">
                {formatCurrency(estimatedLoss)}
              </span>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Report Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={damageDate}
                  onChange={(e) => setDamageDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all font-mono"
                  required
                />
                <Calendar className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Staff Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Found during checkout room inspection"
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-status-red hover:bg-status-red/90 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Report Damage'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
