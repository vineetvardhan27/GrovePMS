'use client';

import React from 'react';
import {
  X,
  Package,
  Boxes,
  TrendingDown,
  AlertTriangle,
  History,
  ShoppingCart,
  Trash2,
  Edit,
  Building2,
  Calendar,
  CheckCircle2,
  MinusCircle,
  PlusCircle,
  Utensils,
  BedDouble,
  Sparkles,
} from 'lucide-react';
import { InventoryItem, InventoryTransaction } from '../../lib/inventory/types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import StatusBadge from '../shared/StatusBadge';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  transactions: InventoryTransaction[];
  onOpenUsage: (itemId: string) => void;
  onOpenPurchase: (itemId: string) => void;
  onOpenDamage: (itemId: string) => void;
  onOpenWaste: (itemId: string) => void;
  onEdit: (item: InventoryItem) => void;
  canManage: boolean;
}

export default function ItemDetailModal({
  isOpen,
  onClose,
  item,
  transactions,
  onOpenUsage,
  onOpenPurchase,
  onOpenDamage,
  onOpenWaste,
  onEdit,
  canManage,
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const isAsset = item.item_type === 'reusable_asset';
  const itemTransactions = transactions.filter((t) => t.item_id === item.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-detail-title"
    >
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-brand-sand/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-forest text-white flex items-center justify-center shadow-2xs">
              {isAsset ? <BedDouble className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest bg-brand-sand px-2 py-0.5 rounded border border-border-subtle">
                  {item.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isAsset
                      ? 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                      : 'bg-status-blue/15 text-status-blue border border-status-blue/30'
                  }`}
                >
                  {isAsset ? 'Hotel Asset' : 'Consumable'}
                </span>
                {item.stock_status && (
                  <StatusBadge
                    variant={
                      item.stock_status === 'healthy'
                        ? 'healthy'
                        : item.stock_status === 'low_stock'
                        ? 'low'
                        : 'critical'
                    }
                    label={
                      item.stock_status === 'healthy'
                        ? 'Healthy'
                        : item.stock_status === 'low_stock'
                        ? 'Low Stock'
                        : 'Out of Stock'
                    }
                  />
                )}
              </div>
              <h2 id="item-detail-title" className="text-base sm:text-lg font-serif font-bold text-brand-forest">
                {item.name}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-brand-sand/50 rounded-xl border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block mb-0.5">
                {isAsset ? 'Available in Store' : 'Current Stock'}
              </span>
              <p className="text-lg font-bold font-sans tabular-nums text-brand-forest">
                {item.current_stock} <span className="text-xs font-normal text-ink-muted">{item.unit}</span>
              </p>
            </div>

            <div className="p-3 bg-brand-sand/50 rounded-xl border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block mb-0.5">
                Par Target Stock
              </span>
              <p className="text-lg font-bold font-sans tabular-nums text-ink">
                {item.target_stock} <span className="text-xs font-normal text-ink-muted">{item.unit}</span>
              </p>
            </div>

            <div className="p-3 bg-brand-sand/50 rounded-xl border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block mb-0.5">
                Unit Purchase Cost
              </span>
              <p className="text-lg font-bold font-sans tabular-nums text-ink">
                {formatCurrency(item.cost_per_unit)}
              </p>
            </div>

            <div className="p-3 bg-status-green/10 rounded-xl border border-status-green/25">
              <span className="text-[10px] uppercase font-bold text-status-green tracking-wider block mb-0.5">
                Total Stock Value
              </span>
              <p className="text-lg font-bold font-sans tabular-nums text-status-green">
                {formatCurrency(item.total_value || 0)}
              </p>
            </div>
          </div>

          {/* Asset Condition / Consumable Breakdown */}
          {isAsset ? (
            <div className="p-4 bg-white rounded-xl border border-border-subtle space-y-3">
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                Asset Condition &amp; Lifecycle Distribution
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 bg-brand-sand/40 rounded-lg border border-border-subtle">
                  <span className="text-[10px] text-ink-muted block">In Store</span>
                  <span className="font-mono font-bold text-ink">{item.current_stock}</span>
                </div>
                <div className="p-2 bg-brand-sand/40 rounded-lg border border-border-subtle">
                  <span className="text-[10px] text-ink-muted block">In Rooms</span>
                  <span className="font-mono font-bold text-ink">{item.in_use_stock || 0}</span>
                </div>
                <div className="p-2 bg-status-red/10 rounded-lg border border-status-red/20 text-status-red">
                  <span className="text-[10px] block">Damaged</span>
                  <span className="font-mono font-bold">{item.damaged_stock || 0}</span>
                </div>
                <div className="p-2 bg-status-amber/10 rounded-lg border border-status-amber/20 text-status-amber">
                  <span className="text-[10px] block">In Repair</span>
                  <span className="font-mono font-bold">{item.repair_stock || 0}</span>
                </div>
                <div className="p-2 bg-brand-sand/40 rounded-lg border border-border-subtle">
                  <span className="text-[10px] text-ink-muted block">Lost</span>
                  <span className="font-mono font-bold text-ink">{item.lost_stock || 0}</span>
                </div>
                <div className="p-2 bg-status-amber/15 rounded-lg border border-status-amber/30 text-status-amber font-bold">
                  <span className="text-[10px] block">Need Replace</span>
                  <span className="font-mono">{item.replacement_needed || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-xl border border-border-subtle space-y-2">
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                Stock Reorder &amp; Replenishment Parameters
              </span>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-ink-muted block">Minimum Alert Threshold:</span>
                  <span className="font-mono font-semibold text-ink">{item.minimum_stock} {item.unit}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Current Shortfall:</span>
                  <span className="font-mono font-bold text-status-amber">
                    {item.suggested_purchase ? `${item.suggested_purchase} ${item.unit}` : 'None (Healthy)'}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted block">Preferred Supplier:</span>
                  <span className="font-medium text-ink">{item.preferred_supplier || 'Local Vendor'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Item Movement History */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-brand-forest" />
              <span>Recent Transaction &amp; Movement History</span>
            </span>

            {itemTransactions.length === 0 ? (
              <p className="text-xs text-ink-muted p-4 bg-brand-sand/30 rounded-xl text-center italic">
                No recent movements recorded for this item.
              </p>
            ) : (
              <div className="border border-border-subtle rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="pms-table text-xs">
                  <thead className="pms-table-header">
                    <tr>
                      <th className="pms-table-th">Date</th>
                      <th className="pms-table-th">Action</th>
                      <th className="pms-table-th text-right">Quantity</th>
                      <th className="pms-table-th text-right">Cost</th>
                      <th className="pms-table-th">Staff</th>
                      <th className="pms-table-th">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemTransactions.map((t) => (
                      <tr key={t.id} className="pms-table-row">
                        <td className="pms-table-td whitespace-nowrap font-medium text-ink">
                          {formatDate(t.transaction_date)}
                        </td>
                        <td className="pms-table-td capitalize font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.transaction_type === 'purchase'
                                ? 'bg-status-green/15 text-status-green border border-status-green/30'
                                : t.transaction_type === 'usage'
                                ? 'bg-brand-sand text-brand-forest border border-border-subtle'
                                : t.transaction_type === 'damaged'
                                ? 'bg-status-red/15 text-status-red border border-status-red/30'
                                : 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                            }`}
                          >
                            {t.transaction_type}
                          </span>
                        </td>
                        <td className="pms-table-td text-right font-mono font-semibold">
                          {t.quantity > 0 ? `+${t.quantity}` : t.quantity} {t.unit}
                        </td>
                        <td className="pms-table-td text-right font-mono text-ink-muted">
                          {formatCurrency(t.total_cost)}
                        </td>
                        <td className="pms-table-td text-ink-muted">{t.recorder_name || 'Staff'}</td>
                        <td className="pms-table-td text-ink-muted truncate max-w-[150px]">
                          {t.reason || t.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-brand-sand/50 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {!isAsset && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUsage(item.id);
                  }}
                  className="pms-btn-secondary h-8 px-3 text-xs gap-1 font-medium"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-brand-forest" />
                  <span>Record Usage</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWaste(item.id);
                  }}
                  className="pms-btn-secondary h-8 px-3 text-xs gap-1 font-medium text-status-amber hover:bg-status-amber/10"
                >
                  <Trash2 className="w-3.5 h-3.5 text-status-amber" />
                  <span>Report Wastage</span>
                </button>
              </>
            )}

            {isAsset && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDamage(item.id);
                }}
                className="pms-btn-secondary h-8 px-3 text-xs gap-1 font-medium text-status-red hover:bg-status-red/10"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-status-red" />
                <span>Report Damage</span>
              </button>
            )}

            {canManage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPurchase(item.id);
                }}
                className="pms-btn-primary h-8 px-3 text-xs gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add Purchase</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="pms-btn-secondary h-8 px-3 text-xs gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Item</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="pms-btn-secondary h-8 px-3 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
