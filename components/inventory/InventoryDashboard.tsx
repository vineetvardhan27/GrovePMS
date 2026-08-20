'use client';

import { useState, useMemo } from 'react';
import {
  InventoryItem,
  InventoryTransaction,
  InventorySummary,
  DEFAULT_INVENTORY_CATEGORIES,
  INVENTORY_CLASSIFICATIONS,
} from '../../lib/inventory/types';
import { InventoryClassification } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import AddPurchaseModal from './AddPurchaseModal';
import RecordUsageModal from './RecordUsageModal';
import ReportDamageModal from './ReportDamageModal';
import ItemFormModal from './ItemFormModal';
import ReplacementPlanningView from './ReplacementPlanningView';
import KpiCard from '../shared/KpiCard';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import {
  Package,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Search,
  ShoppingCart,
  History,
  ShieldAlert,
  Calendar,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryDashboardProps {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  summary: InventorySummary;
  userRole: string;
}

export default function InventoryDashboard({
  items,
  transactions,
  summary,
  userRole,
}: InventoryDashboardProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'inventory' | 'reorder' | 'planning' | 'audit'>('inventory');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isPurchaseOpen, setIsPurchaseOpen] = useState<boolean>(false);
  const [isUsageOpen, setIsUsageOpen] = useState<boolean>(false);
  const [isDamageOpen, setIsDamageOpen] = useState<boolean>(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState<boolean>(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<string | undefined>(undefined);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  const isOwnerOrManager = userRole === 'owner' || userRole === 'manager';
  const canReportDamage = userRole === 'owner' || userRole === 'manager' || userRole === 'housekeeping';

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClassification =
        selectedClassification === 'all' || item.inventory_type === selectedClassification;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      let matchesStatus = true;
      if (statusFilter === 'healthy')       matchesStatus = item.stock_status === 'healthy';
      if (statusFilter === 'low_stock')     matchesStatus = item.stock_status === 'low_stock';
      if (statusFilter === 'out_of_stock')  matchesStatus = item.stock_status === 'out_of_stock';
      if (statusFilter === 'damaged')       matchesStatus = (item.damaged_stock || 0) > 0;
      if (statusFilter === 'reorder_needed') matchesStatus = (item.suggested_purchase || 0) > 0;
      return matchesSearch && matchesClassification && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, selectedClassification, categoryFilter, statusFilter]);

  const reorderItems = useMemo(() => items.filter((item) => (item.suggested_purchase || 0) > 0), [items]);

  const totalReorderEstimatedCost = useMemo(
    () => reorderItems.reduce((sum, item) => sum + (item.suggested_purchase || 0) * (item.cost_per_unit || 0), 0),
    [reorderItems],
  );

  const refreshData = () => router.refresh();

  const handleOpenPurchaseFor = (itemId: string) => {
    setSelectedItemForAction(itemId);
    setIsPurchaseOpen(true);
  };

  const TABS = [
    { id: 'inventory', label: 'Stock & Asset Levels',          icon: Package,      badge: null },
    { id: 'planning',  label: 'Annual Replacement',            icon: Calendar,     badge: (summary.replacement_needed_count || 0) > 0 ? { count: summary.replacement_needed_count, color: 'text-status-red bg-status-red/10 border-status-red/25' } : null },
    { id: 'reorder',   label: 'Suggested Reorders',            icon: ShoppingCart, badge: reorderItems.length > 0 ? { count: reorderItems.length, color: 'text-status-amber bg-status-amber/10 border-status-amber/25' } : null },
    { id: 'audit',     label: `Audit Log (${transactions.length})`, icon: History,  badge: null },
  ] as const;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[1.375rem] leading-tight font-serif font-bold text-brand-forest tracking-tight">
            Hotel Inventory & Asset Management
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Track blankets, linens, food supplies, and assets — with annual replacement planning
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canReportDamage && (
            <button
              type="button"
              onClick={() => { setSelectedItemForAction(undefined); setIsDamageOpen(true); }}
              className="pms-btn-danger-outline"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Damage</span>
            </button>
          )}
          {isOwnerOrManager && (
            <>
              <button
                type="button"
                onClick={() => { setSelectedItemForAction(undefined); setIsUsageOpen(true); }}
                className="pms-btn-secondary"
              >
                <MinusCircle className="w-4 h-4" />
                <span>Record Usage</span>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedItemForAction(undefined); setIsPurchaseOpen(true); }}
                className="pms-btn-primary"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Purchase</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Tracked Items"
          value={summary.total_items}
          subtitle={`${summary.healthy_count} healthy stock`}
          icon={Boxes}
          accent="default"
          dotColor="bg-status-green"
        />
        <KpiCard
          label="Damaged Assets"
          value={summary.total_damaged_assets || 0}
          subtitle="Blankets, linen & appliances"
          icon={ShieldAlert}
          accent={(summary.total_damaged_assets || 0) > 0 ? 'red' : 'default'}
        />
        <KpiCard
          label="Replacements Needed"
          value={summary.replacement_needed_count || 0}
          subtitle="Target year procurement"
          icon={Calendar}
          accent={(summary.replacement_needed_count || 0) > 0 ? 'amber' : 'default'}
        />
        <KpiCard
          label="Asset & Stock Value"
          value={formatCurrency(summary.total_valuation)}
          subtitle="Hotel pantry & asset inventory"
          icon={Truck}
        />
      </div>

      {/* Classification Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-xl border border-border-subtle shadow-2xs">
        <button
          type="button"
          onClick={() => setSelectedClassification('all')}
          className={`pms-pill-tab ${selectedClassification === 'all' ? 'pms-pill-tab-active' : ''}`}
        >
          All Inventory
          <span className={selectedClassification === 'all' ? 'pms-pill-tab-count' : 'pms-pill-tab-count-inactive'}>
            {items.length}
          </span>
        </button>

        {INVENTORY_CLASSIFICATIONS.map((c) => {
          const count = items.filter((i) => i.inventory_type === c.id).length;
          const isActive = selectedClassification === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedClassification(c.id)}
              className={`pms-pill-tab ${isActive ? 'pms-pill-tab-active' : ''}`}
            >
              <span>{c.label}</span>
              <span className={isActive ? 'pms-pill-tab-count' : 'pms-pill-tab-count-inactive'}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="pms-tab-nav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pms-tab-item flex items-center gap-2 ${isActive ? 'pms-tab-item-active' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${tab.badge.color}`}>
                  {tab.badge.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================================================================
          TAB 1: Stock & Asset Levels
          ================================================================ */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, categories..."
                className="pms-input pl-9"
                aria-label="Search inventory items"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pms-select"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {DEFAULT_INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pms-select"
                aria-label="Filter by stock status"
              >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="damaged">Has Damaged Items</option>
                <option value="reorder_needed">Reorder Needed</option>
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="pms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="pms-table">
                <thead className="pms-table-header">
                  <tr>
                    <th className="pms-table-th">Item & Classification</th>
                    <th className="pms-table-th">Asset Breakdown</th>
                    <th className="pms-table-th">Usable vs Par Stock</th>
                    <th className="pms-table-th">Unit Rate</th>
                    <th className="pms-table-th">Total Value</th>
                    <th className="pms-table-th">Status</th>
                    <th className="pms-table-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={Package}
                          title="No items found"
                          description={
                            searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                              ? 'Try adjusting your filters or search term.'
                              : 'Add your first inventory item to start tracking stock.'
                          }
                          action={
                            isOwnerOrManager && !searchQuery && categoryFilter === 'all' && statusFilter === 'all'
                              ? {
                                  label: '+ Add Inventory Item',
                                  onClick: () => { setItemToEdit(null); setIsItemFormOpen(true); },
                                  icon: PlusCircle,
                                }
                              : undefined
                          }
                          compact
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isAsset = item.item_type === 'reusable_asset';
                      return (
                        <tr key={item.id} className="pms-table-row">
                          {/* Name & Classification */}
                          <td className="pms-table-td">
                            <p className="text-sm font-semibold text-ink leading-tight">{item.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-sand text-brand-forest uppercase tracking-wider border border-border-subtle">
                                {item.inventory_type?.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[11px] text-ink-muted">{item.category}</span>
                            </div>
                          </td>

                          {/* Asset Breakdown */}
                          <td className="pms-table-td">
                            {isAsset ? (
                              <div className="space-y-0.5 text-[12px] font-mono">
                                <div className="flex items-center gap-2 text-ink">
                                  <span className="font-semibold">{item.current_stock} avail</span>
                                  <span className="text-brand-forest font-semibold">· {item.in_use_stock || 0} in use</span>
                                </div>
                                <div className="flex items-center gap-2 text-ink-muted">
                                  {(item.damaged_stock || 0) > 0 && (
                                    <span className="text-status-red font-medium">{item.damaged_stock} damaged</span>
                                  )}
                                  {(item.repair_stock || 0) > 0 && (
                                    <span className="text-status-amber">{item.repair_stock} repair</span>
                                  )}
                                  {(item.lost_stock || 0) > 0 && (
                                    <span>{item.lost_stock} lost</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm font-mono font-semibold text-ink">
                                {item.current_stock} {item.unit}
                              </span>
                            )}
                          </td>

                          {/* Usable vs Required */}
                          <td className="pms-table-td">
                            <div className="space-y-0.5 text-[12px]">
                              <p className="text-ink-muted">
                                Usable: <span className="font-mono font-semibold text-brand-forest">{item.usable_stock} {item.unit}</span>
                              </p>
                              <p className="text-ink-muted">
                                Par: <span className="font-mono font-semibold text-ink">{item.target_stock} {item.unit}</span>
                              </p>
                              {(item.replacement_needed || 0) > 0 && (
                                <p className="text-status-red font-semibold font-mono text-[11px]">
                                  Shortfall: −{item.replacement_needed} {item.unit}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Unit Rate */}
                          <td className="pms-table-td font-mono text-sm text-ink-muted whitespace-nowrap">
                            {formatCurrency(item.cost_per_unit || 0)}/{item.unit}
                          </td>

                          {/* Total Value */}
                          <td className="pms-table-td font-mono font-semibold text-sm text-ink whitespace-nowrap">
                            {formatCurrency(item.total_value || 0)}
                          </td>

                          {/* Status */}
                          <td className="pms-table-td">
                            <div className="flex flex-col gap-1">
                              {(item.damaged_stock || 0) > 0 && (
                                <StatusBadge variant="damaged" label={`${item.damaged_stock} Damaged`} icon={ShieldAlert} />
                              )}
                              {item.stock_status === 'out_of_stock' && <StatusBadge variant="critical" />}
                              {item.stock_status === 'low_stock'    && <StatusBadge variant="low" />}
                              {item.stock_status === 'healthy' && (item.damaged_stock || 0) === 0 && <StatusBadge variant="healthy" />}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="pms-table-td">
                            <div className="flex items-center justify-end gap-1">
                              {canReportDamage && (
                                <button
                                  type="button"
                                  title="Report Damage"
                                  aria-label="Report damaged item"
                                  onClick={() => { setSelectedItemForAction(item.id); setIsDamageOpen(true); }}
                                  className="pms-btn-icon-danger"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isOwnerOrManager && (
                                <>
                                  <button
                                    type="button"
                                    title="Add Purchase"
                                    aria-label="Record a purchase"
                                    onClick={() => { setSelectedItemForAction(item.id); setIsPurchaseOpen(true); }}
                                    className="pms-btn-icon-success"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                  {!isAsset && (
                                    <button
                                      type="button"
                                      title="Record Usage"
                                      aria-label="Record consumption"
                                      disabled={item.current_stock <= 0}
                                      onClick={() => { setSelectedItemForAction(item.id); setIsUsageOpen(true); }}
                                      className="pms-btn-icon-amber"
                                    >
                                      <MinusCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    title="Edit Item"
                                    aria-label="Edit inventory item"
                                    onClick={() => { setItemToEdit(item); setIsItemFormOpen(true); }}
                                    className="pms-btn-icon"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          TAB 2: Annual Replacement Planning
          ================================================================ */}
      {activeTab === 'planning' && (
        <ReplacementPlanningView
          items={items}
          onOpenPurchaseModal={handleOpenPurchaseFor}
          isOwnerOrManager={isOwnerOrManager}
        />
      )}

      {/* ================================================================
          TAB 3: Suggested Reorders
          ================================================================ */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          {/* Reorder Summary Card */}
          <div className="pms-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-forest text-white rounded-lg flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-forest">Procurement & Suggested Orders</h3>
                <p className="text-xs text-ink-muted mt-0.5">Calculated as Target Par Stock minus current Usable Stock</p>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted block">Items to Reorder</span>
                <span className="text-xl font-bold font-serif text-status-amber">{reorderItems.length}</span>
              </div>
              <div className="border-l border-border-subtle pl-6">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted block">Estimated Order</span>
                <span className="text-xl font-bold font-mono text-brand-forest">{formatCurrency(totalReorderEstimatedCost)}</span>
              </div>
            </div>
          </div>

          {/* Reorder Table */}
          <div className="pms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="pms-table">
                <thead className="pms-table-header">
                  <tr>
                    <th className="pms-table-th">Item Name</th>
                    <th className="pms-table-th">Type</th>
                    <th className="pms-table-th">Usable Stock</th>
                    <th className="pms-table-th">Target Par</th>
                    <th className="pms-table-th">Suggested Order</th>
                    <th className="pms-table-th">Est. Cost</th>
                    {isOwnerOrManager && <th className="pms-table-th-right">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {reorderItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={CheckCircle2}
                          title="All supplies at full par"
                          description="No reorder suggestions at this time. All stock levels are healthy."
                          compact
                        />
                      </td>
                    </tr>
                  ) : (
                    reorderItems.map((item) => {
                      const estCost = (item.suggested_purchase || 0) * (item.cost_per_unit || 0);
                      return (
                        <tr key={item.id} className="pms-table-row">
                          <td className="pms-table-td text-sm font-semibold text-ink">{item.name}</td>
                          <td className="pms-table-td">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-sand text-brand-forest uppercase tracking-wider border border-border-subtle">
                              {item.inventory_type?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="pms-table-td font-mono font-semibold text-status-amber">
                            {item.usable_stock} {item.unit}
                          </td>
                          <td className="pms-table-td font-mono font-semibold text-brand-forest">
                            {item.target_stock} {item.unit}
                          </td>
                          <td className="pms-table-td">
                            <span className="pms-badge pms-badge-low font-mono font-bold">
                              +{item.suggested_purchase} {item.unit}
                            </span>
                          </td>
                          <td className="pms-table-td font-mono font-semibold text-ink">
                            {formatCurrency(estCost)}
                          </td>
                          {isOwnerOrManager && (
                            <td className="pms-table-td text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenPurchaseFor(item.id)}
                                className="pms-btn-primary h-8 px-3 text-xs"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Purchase
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
      )}

      {/* ================================================================
          TAB 4: Stock Movement & Audit Trail
          ================================================================ */}
      {activeTab === 'audit' && (
        <div className="pms-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-forest">Stock Movement & Audit Log</h3>
            <span className="text-xs text-ink-muted">{transactions.length} movements</span>
          </div>
          <div className="overflow-x-auto">
            <table className="pms-table">
              <thead className="pms-table-header">
                <tr>
                  <th className="pms-table-th">Date</th>
                  <th className="pms-table-th">Item</th>
                  <th className="pms-table-th">Event</th>
                  <th className="pms-table-th">Quantity</th>
                  <th className="pms-table-th">Source / Reason</th>
                  <th className="pms-table-th">Value</th>
                  <th className="pms-table-th">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={History}
                        title="No movements recorded yet"
                        description="Purchase, usage, and damage events will appear here as transactions are recorded."
                        compact
                      />
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const isPurchase = t.transaction_type === 'purchase';
                    const isDamage   = t.transaction_type === 'damaged';
                    return (
                      <tr key={t.id} className="pms-table-row">
                        <td className="pms-table-td font-mono text-[12px] text-ink-muted whitespace-nowrap">
                          {formatDate(t.transaction_date)}
                        </td>
                        <td className="pms-table-td">
                          <p className="text-sm font-semibold text-ink leading-tight">{t.item_name || 'Item'}</p>
                          <p className="text-[10px] text-ink-muted uppercase tracking-wide mt-0.5">{t.item_category}</p>
                        </td>
                        <td className="pms-table-td">
                          {isPurchase && <StatusBadge variant="healthy"  label="Purchase"   icon={ArrowDownRight} />}
                          {isDamage   && <StatusBadge variant="damaged"  label="Damaged"    icon={ShieldAlert} />}
                          {!isPurchase && !isDamage && <StatusBadge variant="low" label="Usage" icon={ArrowUpRight} />}
                        </td>
                        <td className="pms-table-td font-mono font-bold text-sm">
                          <span className={isPurchase ? 'text-status-green' : isDamage ? 'text-status-red' : 'text-status-amber'}>
                            {isPurchase ? '+' : '−'}{t.quantity} {t.unit}
                          </span>
                        </td>
                        <td className="pms-table-td">
                          <p className="text-sm text-ink leading-tight">
                            {t.room_number ? `${t.room_number} · ${t.reason}` : (t.supplier || t.reason || 'General')}
                          </p>
                          {t.condition_state && (
                            <p className="text-[11px] text-status-red font-medium mt-0.5">Condition: {t.condition_state}</p>
                          )}
                          {t.notes && <p className="text-[11px] text-ink-muted truncate max-w-xs mt-0.5">{t.notes}</p>}
                        </td>
                        <td className="pms-table-td font-mono text-sm text-ink-muted">
                          {formatCurrency(t.total_cost || 0)}
                        </td>
                        <td className="pms-table-td text-sm text-ink-muted">
                          {t.recorder_name || 'Staff'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        items={items}
        preselectedItemId={selectedItemForAction}
        onSuccess={refreshData}
      />
      <RecordUsageModal
        isOpen={isUsageOpen}
        onClose={() => setIsUsageOpen(false)}
        items={items}
        preselectedItemId={selectedItemForAction}
        onSuccess={refreshData}
      />
      <ReportDamageModal
        isOpen={isDamageOpen}
        onClose={() => setIsDamageOpen(false)}
        items={items}
        preselectedItemId={selectedItemForAction}
        onSuccess={refreshData}
      />
      <ItemFormModal
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        itemToEdit={itemToEdit}
        onSuccess={refreshData}
      />
    </div>
  );
}
