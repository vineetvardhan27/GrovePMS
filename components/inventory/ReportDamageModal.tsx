'use client';

import { useState } from 'react';
import { InventoryItem } from '../../lib/inventory/types';
import { reportDamageAction } from '../../lib/inventory/actions';
import { X, AlertTriangle, ShieldAlert, AlertCircle, Calendar, BedDouble, FileText } from 'lucide-react';

interface ReportDamageModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  preselectedItemId?: string;
  onSuccess?: () => void;
}

const DAMAGE_REASONS = [
  'Torn / Ripped Fabric',
  'Stained / Cigarette Burn',
  'Broken / Mechanical Defect',
  'Water / Moisture Damaged',
  'Missing / Guest Taken',
  'Normal Wear & Tear (End of Life)',
  'Laundry Wash Damage',
];

const CONDITION_STATES = [
  'Light Damage (Can be Repaired / Washed)',
  'Heavy Damage (Requires Heavy Stitching / Repair)',
  'Total Loss (Cannot be Reused / Write-off)',
];

const COMMON_ROOMS = [
  'Room 801',
  'Room 802',
  'Room 803',
  'Room 804',
  'Room 805',
  'Room 806',
  'Room 807',
  'Room 808',
  'Housekeeping Store',
  'Laundry Area',
  'Reception / Lobby',
];

export default function ReportDamageModal({
  isOpen,
  onClose,
  items,
  preselectedItemId,
  onSuccess,
}: ReportDamageModalProps) {
  // Filter for items (prioritize reusable assets & linens like Blankets)
  const assetItems = items.filter((i) => i.item_type === 'reusable_asset' || i.inventory_type === 'linen' || i.inventory_type === 'hotel_assets');
  const availableOptions = assetItems.length > 0 ? assetItems : items;

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || (availableOptions.length > 0 ? availableOptions[0].id : '')
  );
  const [quantity, setQuantity] = useState<string>('2');
  const [reason, setReason] = useState<string>(DAMAGE_REASONS[0]);
  const [conditionState, setConditionState] = useState<string>(CONDITION_STATES[1]);
  const [roomNumber, setRoomNumber] = useState<string>('Room 805');
  const [damageDate, setDamageDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId) || availableOptions[0];
  const parsedQty = parseFloat(quantity) || 0;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Select Damaged Item / Blanket / Asset *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
              required
            >
              {availableOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category}) — Currently: {item.current_stock} avail, {item.in_use_stock || 0} in use, {item.damaged_stock || 0} damaged
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Damaged Quantity *
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
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted uppercase">
                  {currentItem?.unit || 'piece'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Room / Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 805"
                  list="rooms-list"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  required
                />
                <datalist id="rooms-list">
                  {COMMON_ROOMS.map((rm) => (
                    <option key={rm} value={rm} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Reason & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Damage Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                {DAMAGE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Severity / Condition *
              </label>
              <select
                value={conditionState}
                onChange={(e) => setConditionState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                {CONDITION_STATES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Incident Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={damageDate}
                  onChange={(e) => setDamageDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  required
                />
                <Calendar className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Housekeeping Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Discovered during guest checkout cleaning"
                className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
              />
            </div>
          </div>

          {/* Replacement Impact Preview */}
          <div className="p-3.5 bg-brand-sand/60 rounded-xl border border-border-subtle space-y-1 text-xs">
            <div className="flex items-center justify-between font-semibold text-ink">
              <span>Annual Replacement Impact:</span>
              <span className="text-status-red font-mono font-bold">
                +{parsedQty} {currentItem?.unit} to replace in {new Date().getFullYear() + 1}
              </span>
            </div>
            <p className="text-tiny text-ink-muted">
              This will update the annual replacement planning budget and suggest purchase for the next fiscal year.
            </p>
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
              <AlertTriangle className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Log Damaged Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
