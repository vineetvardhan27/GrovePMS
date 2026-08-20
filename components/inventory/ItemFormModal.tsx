'use client';

import { useState } from 'react';
import {
  InventoryItem,
  DEFAULT_INVENTORY_CATEGORIES,
  INVENTORY_CLASSIFICATIONS,
} from '../../lib/inventory/types';
import { InventoryUnit, InventoryItemType, InventoryClassification } from '../../lib/types/database.types';
import { saveInventoryItemAction } from '../../lib/inventory/actions';
import { X, Package, AlertCircle, Save, Layers, Sparkles } from 'lucide-react';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
  onSuccess?: () => void;
}

const UNITS: InventoryUnit[] = [
  'piece',
  'packet',
  'box',
  'dozen',
  'pair',
  'set',
  'kg',
  'gram',
  'litre',
  'ml',
  'can',
  'bottle',
];

export default function ItemFormModal({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}: ItemFormModalProps) {
  const [name, setName] = useState<string>(itemToEdit?.name || '');
  const [category, setCategory] = useState<string>(
    itemToEdit?.category || DEFAULT_INVENTORY_CATEGORIES[0]
  );
  const [unit, setUnit] = useState<InventoryUnit>(itemToEdit?.unit || 'piece');
  const [itemType, setItemType] = useState<InventoryItemType>(
    itemToEdit?.item_type || 'reusable_asset'
  );
  const [inventoryType, setInventoryType] = useState<InventoryClassification>(
    itemToEdit?.inventory_type || 'linen'
  );

  const [currentStock, setCurrentStock] = useState<string>(
    itemToEdit ? String(itemToEdit.current_stock) : '0'
  );
  const [inUseStock, setInUseStock] = useState<string>(
    itemToEdit ? String(itemToEdit.in_use_stock || 0) : '0'
  );
  const [damagedStock, setDamagedStock] = useState<string>(
    itemToEdit ? String(itemToEdit.damaged_stock || 0) : '0'
  );
  const [repairStock, setRepairStock] = useState<string>(
    itemToEdit ? String(itemToEdit.repair_stock || 0) : '0'
  );
  const [lostStock, setLostStock] = useState<string>(
    itemToEdit ? String(itemToEdit.lost_stock || 0) : '0'
  );

  const [minStock, setMinStock] = useState<string>(
    itemToEdit ? String(itemToEdit.minimum_stock) : '10'
  );
  const [targetStock, setTargetStock] = useState<string>(
    itemToEdit ? String(itemToEdit.target_stock) : '45'
  );
  const [costPerUnit, setCostPerUnit] = useState<string>(
    itemToEdit ? String(itemToEdit.cost_per_unit) : '500'
  );
  const [targetYear, setTargetYear] = useState<string>(
    itemToEdit?.replacement_target_year ? String(itemToEdit.replacement_target_year) : String(new Date().getFullYear() + 1)
  );
  const [isActive, setIsActive] = useState<boolean>(
    itemToEdit ? itemToEdit.is_active : true
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEditing = Boolean(itemToEdit);
  const isAsset = itemType === 'reusable_asset';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Item name is required.');
      return;
    }

    const min = parseFloat(minStock);
    const target = parseFloat(targetStock);
    const cost = parseFloat(costPerUnit) || 0;
    const stock = parseFloat(currentStock) || 0;
    const inUse = parseFloat(inUseStock) || 0;
    const damaged = parseFloat(damagedStock) || 0;
    const repair = parseFloat(repairStock) || 0;
    const lost = parseFloat(lostStock) || 0;
    const year = parseInt(targetYear, 10) || (new Date().getFullYear() + 1);

    if (isNaN(min) || min < 0) {
      setErrorMessage('Minimum stock level must be a non-negative number.');
      return;
    }

    if (isNaN(target) || target < min) {
      setErrorMessage('Target par stock must be greater than or equal to minimum alert stock.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveInventoryItemAction({
        id: itemToEdit?.id,
        name: name.trim(),
        category: category.trim(),
        unit,
        item_type: itemType,
        inventory_type: inventoryType,
        current_stock: stock,
        in_use_stock: inUse,
        damaged_stock: damaged,
        repair_stock: repair,
        lost_stock: lost,
        minimum_stock: min,
        target_stock: target,
        cost_per_unit: cost,
        replacement_target_year: year,
        is_active: isActive,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save inventory item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-subtle animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-brand-sand/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-forest/10 text-brand-forest rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-forest">
                {isEditing ? 'Edit Inventory Item' : 'New Supply / Asset Item'}
              </h3>
              <p className="text-xs text-ink-muted">Configure blankets, linen, raw food, or room supplies</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-action-danger/10 border border-action-danger/25 text-action-danger rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Item Type & Classification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Item Nature *
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as InventoryItemType)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                <option value="reusable_asset">Reusable Asset (Blanket, Linen, Appliance)</option>
                <option value="consumable">Consumable Supply (Food, Soap, Chemical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Classification *
              </label>
              <select
                value={inventoryType}
                onChange={(e) => setInventoryType(e.target.value as InventoryClassification)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                {INVENTORY_CLASSIFICATIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heavy Woollen Winter Blankets (King), Bath Towels"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
              required
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                {DEFAULT_INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Measurement Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as InventoryUnit)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset Breakdown (for reusable assets like Blankets) */}
          {isAsset ? (
            <div className="p-3.5 bg-brand-sand/50 rounded-xl border border-border-subtle space-y-3">
              <span className="text-xs font-bold text-brand-forest block">
                Asset Status Distribution ({unit})
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-ink mb-1">
                    Available in Store
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-forest mb-1">
                    In Use / In Rooms
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={inUseStock}
                    onChange={(e) => setInUseStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-status-red mb-1">
                    Damaged
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={damagedStock}
                    onChange={(e) => setDamagedStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-status-amber mb-1">
                    Under Laundry / Repair
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={repairStock}
                    onChange={(e) => setRepairStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Lost / Missing
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={lostStock}
                    onChange={(e) => setLostStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Current Stock In Store *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm font-mono"
                required
              />
            </div>
          )}

          {/* Min & Target Par Stock Levels */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-status-amber mb-1">
                Min Alert Level
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-brand-forest mb-1">
                Target Par Stock
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={targetStock}
                onChange={(e) => setTargetStock(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Unit Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
              />
            </div>
          </div>

          {/* Replacement Target Year (for Assets) */}
          {isAsset && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Target Replacement Year (Annual Procurement)
              </label>
              <input
                type="number"
                min="2026"
                max="2035"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
              />
            </div>
          )}

          {/* Active status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveItem"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-brand-forest focus:ring-brand-forest border-border-subtle cursor-pointer"
            />
            <label htmlFor="isActiveItem" className="text-xs text-ink font-medium cursor-pointer">
              Active item (Available for inventory operations)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0">
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
              className="px-5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-forest-light text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
