'use client';

import { useMemo } from 'react';
import { InventoryItem, AnnualReplacementPlanItem } from '../../lib/inventory/types';
import { formatCurrency } from '../../lib/utils/currency';
import {
  Calendar,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  BedDouble,
  Info,
} from 'lucide-react';

interface ReplacementPlanningViewProps {
  items: InventoryItem[];
  onOpenPurchaseModal?: (itemId: string) => void;
  isOwnerOrManager: boolean;
}

export default function ReplacementPlanningView({
  items,
  onOpenPurchaseModal,
  isOwnerOrManager,
}: ReplacementPlanningViewProps) {
  const currentYear = new Date().getFullYear();
  const targetPlanningYear = currentYear + 1;

  // Filter for reusable assets (Linen, Blankets, Appliances, Assets)
  const assetItems = useMemo(() => {
    return items.filter((item) => item.item_type === 'reusable_asset');
  }, [items]);

  // Compute plan items
  const planItems: AnnualReplacementPlanItem[] = useMemo(() => {
    return assetItems.map((item) => {
      const totalCount = item.total_asset_count || item.target_stock;
      const usable = item.usable_stock || item.current_stock;
      const available = item.current_stock;
      const inUse = item.in_use_stock || 0;
      const damaged = item.damaged_stock || 0;
      const lost = item.lost_stock || 0;
      const repair = item.repair_stock || 0;
      const required = item.target_stock;

      const replacementNeeded = Math.max(0, required - usable);
      const estCost = Math.round(replacementNeeded * item.cost_per_unit * 100) / 100;

      return {
        item_id: item.id,
        name: item.name,
        category: item.category,
        inventory_type: item.inventory_type || 'linen',
        unit: item.unit,
        total_count: totalCount,
        usable_stock: usable,
        available_stock: available,
        in_use_stock: inUse,
        damaged_stock: damaged,
        lost_stock: lost,
        repair_stock: repair,
        required_stock: required,
        replacement_needed: replacementNeeded,
        recommended_purchase_qty: replacementNeeded,
        unit_cost: item.cost_per_unit,
        estimated_cost: estCost,
        target_year: item.replacement_target_year || targetPlanningYear,
      };
    });
  }, [assetItems, targetPlanningYear]);

  // Overall totals
  const totalDamagedUnits = useMemo(() => {
    return planItems.reduce((sum, i) => sum + i.damaged_stock, 0);
  }, [planItems]);

  const totalReplacementsNeeded = useMemo(() => {
    return planItems.reduce((sum, i) => sum + i.replacement_needed, 0);
  }, [planItems]);

  const totalEstimatedBudget = useMemo(() => {
    return planItems.reduce((sum, i) => sum + i.estimated_cost, 0);
  }, [planItems]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 bg-brand-sand/70 rounded-2xl border border-border-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-brand-forest text-white rounded-xl shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-brand-forest">
                Annual Asset &amp; Blanket Replacement Plan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-forest/15 text-brand-forest border border-brand-forest/30 font-mono">
                FY {targetPlanningYear}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Tracks damaged, retired, or lost linens and calculates recommended procurement quotas for the upcoming year
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-3.5 rounded-xl border border-border-subtle shadow-2xs">
          <div>
            <span className="text-[11px] text-ink-muted block uppercase font-semibold">Total Damaged</span>
            <span className="text-lg font-bold font-mono text-status-red">
              {totalDamagedUnits} units
            </span>
          </div>

          <div className="border-l border-border-subtle pl-4">
            <span className="text-[11px] text-ink-muted block uppercase font-semibold">Replacements Needed</span>
            <span className="text-lg font-bold font-mono text-status-amber">
              {totalReplacementsNeeded} units
            </span>
          </div>

          <div className="border-l border-border-subtle pl-4">
            <span className="text-[11px] text-ink-muted block uppercase font-semibold">Est. {targetPlanningYear} Budget</span>
            <span className="text-lg font-bold font-mono text-brand-forest">
              {formatCurrency(totalEstimatedBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-3.5 bg-status-blue/10 border border-status-blue/25 text-status-blue rounded-xl text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 shrink-0" />
        <span>
          <strong>Planning Mode:</strong> This view projects required procurement for damaged blankets and room assets for <strong>FY {targetPlanningYear}</strong>. No purchases are automatically executed without managerial approval.
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h4 className="font-serif font-bold text-sm text-brand-forest">
            Hotel Reusable Assets &amp; Linen Replacement Matrix
          </h4>
          <span className="text-tiny text-ink-muted font-medium">
            {planItems.length} tracked reusable assets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Asset / Item Name</th>
                <th className="p-4">Usable Stock</th>
                <th className="p-4">Damaged / Lost</th>
                <th className="p-4">Required Par</th>
                <th className="p-4">Replacement Needed</th>
                <th className="p-4">Unit Rate</th>
                <th className="p-4">Est. {targetPlanningYear} Cost</th>
                <th className="p-4">Target Year</th>
                {isOwnerOrManager && <th className="p-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {planItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-ink-muted">
                    No reusable assets or linen configured yet. Add your first blanket or linen asset in the Stock Levels tab.
                  </td>
                </tr>
              ) : (
                planItems.map((item) => {
                  const needsReplacement = item.replacement_needed > 0;

                  return (
                    <tr key={item.item_id} className="hover:bg-brand-sand/30 transition-colors">
                      {/* Name */}
                      <td className="p-4">
                        <p className="font-semibold text-ink text-sm">{item.name}</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-brand-sand text-ink-muted mt-0.5">
                          {item.category}
                        </span>
                      </td>

                      {/* Usable Stock */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-brand-forest text-sm">
                            {item.usable_stock} {item.unit}
                          </span>
                          <span className="block text-tiny text-ink-muted">
                            ({item.available_stock} avail, {item.in_use_stock} in rooms, {item.repair_stock} repair)
                          </span>
                        </div>
                      </td>

                      {/* Damaged / Lost */}
                      <td className="p-4">
                        <div className="space-y-0.5 font-mono">
                          {item.damaged_stock > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-status-red/15 text-status-red">
                              <ShieldAlert className="w-3 h-3" />
                              <span>{item.damaged_stock} damaged</span>
                            </span>
                          ) : (
                            <span className="text-ink-muted text-tiny">0 damaged</span>
                          )}
                          {item.lost_stock > 0 && (
                            <span className="block text-tiny text-status-amber font-semibold">
                              {item.lost_stock} lost
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Required Par */}
                      <td className="p-4 font-mono font-bold text-ink text-sm">
                        {item.required_stock} {item.unit}
                      </td>

                      {/* Replacement Needed */}
                      <td className="p-4">
                        {needsReplacement ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-status-amber/15 text-status-amber font-mono font-bold text-xs border border-status-amber/30">
                            +{item.replacement_needed} {item.unit}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-status-green font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Full Par</span>
                          </span>
                        )}
                      </td>

                      {/* Unit Rate */}
                      <td className="p-4 font-mono font-medium text-ink">
                        {formatCurrency(item.unit_cost)}
                      </td>

                      {/* Est Cost */}
                      <td className="p-4 font-bold font-mono text-ink text-sm">
                        {formatCurrency(item.estimated_cost)}
                      </td>

                      {/* Target Year */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-sand text-brand-forest font-mono font-bold text-xs">
                          {item.target_year}
                        </span>
                      </td>

                      {/* Action */}
                      {isOwnerOrManager && (
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenPurchaseModal && onOpenPurchaseModal(item.item_id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Purchase</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
