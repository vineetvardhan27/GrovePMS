'use client';

import { useState, useMemo } from 'react';
import {
  InventoryItem,
  InventoryTransaction,
  InventorySummary,
  WastageSummary,
  DEFAULT_INVENTORY_CATEGORIES,
  INVENTORY_CLASSIFICATIONS,
} from '../../lib/inventory/types';
import { InventoryClassification } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { formatDate } from '../../lib/utils/dates';
import AddPurchaseModal from './AddPurchaseModal';
import RecordUsageModal from './RecordUsageModal';
import ReportDamageModal from './ReportDamageModal';
import ReportWasteModal from './ReportWasteModal';
import ItemFormModal from './ItemFormModal';
import ItemDetailModal from './ItemDetailModal';
import ReplacementPlanningView from './ReplacementPlanningView';
import WastageDashboardView from './WastageDashboardView';
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
  Trash2,
  TrendingDown,
  Info,
  DollarSign,
  Utensils,
  BedDouble,
  Sparkles,
  Eye,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryDashboardProps {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  summary: InventorySummary;
  wastageStats: WastageSummary;
  userRole: string;
}

export default function InventoryDashboard({
  items,
  transactions,
  summary,
  wastageStats,
  userRole,
}: InventoryDashboardProps) {
  const router = useRouter();

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'inventory' | 'reorder' | 'planning' | 'wastage' | 'audit'>('inventory');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isPurchaseOpen, setIsPurchaseOpen] = useState<boolean>(false);
  const [isUsageOpen, setIsUsageOpen] = useState<boolean>(false);
  const [isDamageOpen, setIsDamageOpen] = useState<boolean>(false);
  const [isWasteOpen, setIsWasteOpen] = useState<boolean>(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const [selectedItemForAction, setSelectedItemForAction] = useState<string | undefined>(undefined);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  const isOwnerOrManager = userRole === 'owner' || userRole === 'manager';
  const canReport = userRole === 'owner' || userRole === 'manager' || userRole === 'housekeeping';

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClassification =
        selectedClassification === 'all' || item.inventory_type === selectedClassification;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      let matchesStatus = true;
      if (statusFilter === 'healthy') matchesStatus = item.stock_status === 'healthy';
      if (statusFilter === 'low_stock') matchesStatus = item.stock_status === 'low_stock';
      if (statusFilter === 'out_of_stock') matchesStatus = item.stock_status === 'out_of_stock';
      if (statusFilter === 'damaged') matchesStatus = (item.damaged_stock || 0) > 0;
      if (statusFilter === 'reorder_needed') matchesStatus = (item.suggested_purchase || 0) > 0;
      return matchesSearch && matchesClassification && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, selectedClassification, categoryFilter, statusFilter]);

  // Suggested reorder items (Shortfall > 0)
  const reorderItems = useMemo(() => items.filter((item) => (item.suggested_purchase || 0) > 0), [items]);

  const totalReorderEstimatedCost = useMemo(
    () => reorderItems.reduce((sum, item) => sum + (item.suggested_purchase || 0) * (item.cost_per_unit || 0), 0),
    [reorderItems]
  );

  const refreshData = () => router.refresh();

  // Action handlers
  const handleOpenPurchaseFor = (itemId?: string) => {
    setSelectedItemForAction(itemId);
    setIsPurchaseOpen(true);
  };

  const handleOpenUsageFor = (itemId?: string) => {
    setSelectedItemForAction(itemId);
    setIsUsageOpen(true);
  };

  const handleOpenDamageFor = (itemId?: string) => {
    setSelectedItemForAction(itemId);
    setIsDamageOpen(true);
  };

  const handleOpenWasteFor = (itemId?: string) => {
    setSelectedItemForAction(itemId);
    setIsWasteOpen(true);
  };

  const handleOpenDetailFor = (item: InventoryItem) => {
    setSelectedItemForDetail(item);
    setIsDetailModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsItemFormOpen(true);
  };

  const handleCreateNewItem = () => {
    setItemToEdit(null);
    setIsItemFormOpen(true);
  };

  const TABS = [
    { id: 'inventory', label: 'Stock & Asset Levels', icon: Package, badge: null },
    {
      id: 'reorder',
      label: 'Suggested Reorders',
      icon: ShoppingCart,
      badge:
        reorderItems.length > 0
          ? { count: reorderItems.length, color: 'text-status-amber bg-status-amber/10 border-status-amber/25' }
          : null,
    },
    {
      id: 'planning',
      label: 'Annual Replacement',
      icon: Calendar,
      badge:
        (summary.replacement_needed_count || 0) > 0
          ? {
              count: summary.replacement_needed_count,
              color: 'text-status-red bg-status-red/10 border-status-red/25',
            }
          : null,
    },
    {
      id: 'wastage',
      label: 'Food Wastage & Loss',
      icon: Trash2,
      badge:
        (summary.today_waste_value || 0) > 0
          ? { count: 'Today', color: 'text-status-amber bg-status-amber/10 border-status-amber/25' }
          : null,
    },
    { id: 'audit', label: `Audit Log (${transactions.length})`, icon: History, badge: null },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Page Header & Quick Action Buttons ── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-1 border-b border-border-subtle">
        <div>
          <h1 className="text-display font-serif text-brand-forest">
            Hotel Inventory &amp; Asset Management
          </h1>
          <p className="text-body text-ink-muted mt-0.5">
            Track kitchen consumables, room linens, guest supplies, and hotel assets — with automated reorders, wastage tracking, and annual replacement planning
          </p>
        </div>

        {/* Global Operational Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {canReport && (
            <>
              <button
                type="button"
                onClick={() => handleOpenDamageFor()}
                className="pms-btn-danger-outline h-9 px-3 text-xs gap-1.5 font-medium"
                title="Report damaged or stained hotel assets"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Damage</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenWasteFor()}
                className="pms-btn-secondary h-9 px-3 text-xs gap-1.5 font-medium text-status-amber border-status-amber/30 hover:bg-status-amber/10"
                title="Report spoiled or expired food wastage"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Report Waste</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenUsageFor()}
                className="pms-btn-secondary h-9 px-3 text-xs gap-1.5 font-medium"
                title="Record daily consumable / food usage"
              >
                <MinusCircle className="w-3.5 h-3.5 text-brand-forest" />
                <span>Record Usage</span>
              </button>
            </>
          )}

          {isOwnerOrManager && (
            <>
              <button
                type="button"
                onClick={() => handleOpenPurchaseFor()}
                className="pms-btn-primary h-9 px-3.5 text-xs gap-1.5"
                title="Record new purchase receipt"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add Purchase</span>
              </button>

              <button
                type="button"
                onClick={handleCreateNewItem}
                className="pms-btn-secondary h-9 px-3 text-xs gap-1.5 font-medium"
                title="Define a new inventory or asset item"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Item</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 1. Top-Level Operational & Financial KPIs (6 Zero-Clip Cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Tracked Items */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tracked Items</span>
            <Boxes className="w-4 h-4 text-brand-forest/60" />
          </div>
          <p className="text-2xl font-bold font-sans tabular-nums text-brand-forest">
            {summary.total_items}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {summary.healthy_count} healthy stock
          </p>
        </div>

        {/* KPI 2: Low Stock */}
        <div
          className={`pms-card p-4 flex flex-col justify-between transition-colors ${
            summary.low_stock_count > 0 || summary.out_of_stock_count > 0
              ? 'border-l-4 border-l-status-amber bg-status-amber/5'
              : ''
          }`}
        >
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber">
              Low / Critical
            </span>
            <AlertTriangle className="w-4 h-4 text-status-amber" />
          </div>
          <p
            className={`text-2xl font-bold font-sans tabular-nums ${
              summary.low_stock_count > 0 || summary.out_of_stock_count > 0
                ? 'text-status-amber'
                : 'text-brand-forest'
            }`}
          >
            {summary.low_stock_count + summary.out_of_stock_count}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Below min threshold</p>
        </div>

        {/* KPI 3: Damaged Assets */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Damaged Assets</span>
            <ShieldAlert className="w-4 h-4 text-status-red/60" />
          </div>
          <p
            className={`text-2xl font-bold font-sans tabular-nums ${
              (summary.total_damaged_assets || 0) > 0 ? 'text-status-red' : 'text-brand-forest'
            }`}
          >
            {summary.total_damaged_assets || 0}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Linen &amp; appliances</p>
        </div>

        {/* KPI 4: Replacements Needed */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Replacements</span>
            <Calendar className="w-4 h-4 text-brand-forest/60" />
          </div>
          <p className="text-2xl font-bold font-sans tabular-nums text-brand-forest">
            {summary.replacement_needed_count || 0}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Target procurement</p>
        </div>

        {/* KPI 5: Stock Valuation */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Stock Valuation</span>
            <Truck className="w-4 h-4 text-brand-forest/60" />
          </div>
          <p className="text-lg sm:text-xl font-bold font-sans tabular-nums text-brand-forest truncate">
            {formatCurrency(summary.total_valuation)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Pantry &amp; asset inventory</p>
        </div>

        {/* KPI 6: Monthly Wastage */}
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-status-amber">
              Monthly Waste
            </span>
            <Trash2 className="w-4 h-4 text-status-amber" />
          </div>
          <p className="text-lg sm:text-xl font-bold font-sans tabular-nums text-status-amber truncate">
            {formatCurrency(summary.month_waste_value || 0)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1 truncate">Food spoilage loss</p>
        </div>
      </div>

      {/* ── 2. Classification Pill Bar (Food vs Linen vs Room Supplies vs Assets) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedClassification('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedClassification === 'all'
              ? 'bg-brand-forest text-white shadow-2xs'
              : 'bg-white text-ink-muted hover:text-ink hover:bg-brand-sand border border-border-subtle'
          }`}
        >
          All Inventory ({items.length})
        </button>

        {INVENTORY_CLASSIFICATIONS.map((c) => {
          const count = items.filter((i) => i.inventory_type === c.id).length;
          const isActive = selectedClassification === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedClassification(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-forest text-white shadow-2xs'
                  : 'bg-white text-ink-muted hover:text-ink hover:bg-brand-sand border border-border-subtle'
              }`}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── 3. Operational Workspace Views (Tabs Header) ── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-1 sm:gap-2 pb-1 border-b border-border-subtle overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-forest text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink hover:bg-brand-sand'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
                      isActive ? 'bg-white/20 text-white border-white/30' : tab.badge.color
                    }`}
                  >
                    {tab.badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: MAIN STOCK & ASSET LEVELS TABLE ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-3.5">
            {/* Search and Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items, categories..."
                  className="w-full sm:w-64 h-9 pl-9 pr-3 text-xs bg-white border border-border-subtle rounded-lg text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  aria-label="Search inventory items"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all cursor-pointer"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {DEFAULT_INVENTORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white border border-border-subtle rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="damaged">Has Damaged Units</option>
                <option value="reorder_needed">Reorder Recommended</option>
              </select>
            </div>

            {/* Main Inventory Table */}
            <div className="pms-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="pms-table">
                  <thead className="pms-table-header">
                    <tr>
                      <th className="pms-table-th">Item &amp; Classification</th>
                      <th className="pms-table-th">Asset Breakdown</th>
                      <th className="pms-table-th">Usable vs Par Stock</th>
                      <th className="pms-table-th text-right">Unit Rate</th>
                      <th className="pms-table-th text-right">Total Value</th>
                      <th className="pms-table-th text-center">Status</th>
                      <th className="pms-table-th-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            icon={Package}
                            title="No inventory items found"
                            description={
                              searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                                ? 'Try adjusting your search query or filter options.'
                                : 'Add items to track kitchen supplies, linens, and hotel assets.'
                            }
                            action={
                              isOwnerOrManager
                                ? {
                                    label: 'Add First Item',
                                    onClick: handleCreateNewItem,
                                    icon: Plus,
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
                          <tr key={item.id} className="pms-table-row transition-colors">
                            {/* Item & Classification */}
                            <td className="pms-table-td">
                              <button
                                type="button"
                                onClick={() => handleOpenDetailFor(item)}
                                className="text-left font-bold text-xs sm:text-sm text-brand-forest hover:underline leading-tight block"
                              >
                                {item.name}
                              </button>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-brand-sand text-brand-forest border border-border-subtle">
                                  {item.inventory_type?.replace('_', ' ') || 'Consumable'}
                                </span>
                                <span className="text-[11px] text-ink-muted">{item.category}</span>
                              </div>
                            </td>

                            {/* Asset Breakdown / Stock Count */}
                            <td className="pms-table-td">
                              {isAsset ? (
                                <div className="space-y-0.5 text-xs">
                                  <div className="font-mono font-bold text-ink">
                                    {item.total_asset_count || item.current_stock} {item.unit} total
                                  </div>
                                  <div className="text-[11px] text-ink-muted">
                                    <span>Store: {item.current_stock}</span> ·{' '}
                                    <span>Rooms: {item.in_use_stock || 0}</span>
                                    {(item.damaged_stock || 0) > 0 && (
                                      <span className="text-status-red font-semibold">
                                        {' '}· {item.damaged_stock} damaged
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="font-mono font-bold text-xs sm:text-sm text-ink">
                                  {item.current_stock} {item.unit}
                                </span>
                              )}
                            </td>

                            {/* Usable vs Par Stock */}
                            <td className="pms-table-td text-xs">
                              <p className="font-semibold text-ink">
                                Usable: <span className="font-mono">{item.usable_stock} {item.unit}</span>
                              </p>
                              <p className="text-[11px] text-ink-muted">
                                Par: <span className="font-mono">{item.target_stock} {item.unit}</span>
                              </p>
                              {(item.suggested_purchase || 0) > 0 && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-status-amber/15 text-status-amber border border-status-amber/30">
                                  Shortfall: -{item.suggested_purchase} {item.unit}
                                </span>
                              )}
                            </td>

                            {/* Unit Rate */}
                            <td className="pms-table-td text-right font-mono text-xs text-ink whitespace-nowrap">
                              {formatCurrency(item.cost_per_unit)}/{item.unit}
                            </td>

                            {/* Total Value */}
                            <td className="pms-table-td text-right font-mono font-bold text-xs sm:text-sm text-brand-forest whitespace-nowrap">
                              {formatCurrency(item.total_value || 0)}
                            </td>

                            {/* Status */}
                            <td className="pms-table-td text-center whitespace-nowrap">
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
                            </td>

                            {/* Actions */}
                            <td className="pms-table-td whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {!isAsset && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenUsageFor(item.id)}
                                      className="p-1 rounded text-ink-muted hover:text-brand-forest hover:bg-brand-sand transition-colors"
                                      title="Record Usage"
                                    >
                                      <MinusCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenWasteFor(item.id)}
                                      className="p-1 rounded text-ink-muted hover:text-status-amber hover:bg-status-amber/10 transition-colors"
                                      title="Report Wastage"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                {isAsset && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDamageFor(item.id)}
                                    className="p-1 rounded text-ink-muted hover:text-status-red hover:bg-status-red/10 transition-colors"
                                    title="Report Damage"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {isOwnerOrManager && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPurchaseFor(item.id)}
                                    className="p-1 rounded text-ink-muted hover:text-status-green hover:bg-status-green/10 transition-colors"
                                    title="Add Purchase / Stock"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenDetailFor(item)}
                                  className="p-1 rounded text-ink-muted hover:text-brand-forest hover:bg-brand-sand transition-colors"
                                  title="View Item Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
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

        {/* ── TAB 2: SUGGESTED REORDERS ── */}
        {activeTab === 'reorder' && (
          <div className="space-y-4">
            <div className="p-4 bg-brand-sand/60 rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="text-sm font-serif font-bold text-brand-forest">
                  Suggested Procurement &amp; Reorders
                </h3>
                <p className="text-ink-muted">
                  Automatically computed for items with available stock below configured Par Target levels
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">
                    Total Estimated Budget:
                  </span>
                  <span className="font-mono font-bold text-brand-forest text-base tabular-nums">
                    {formatCurrency(totalReorderEstimatedCost)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pms-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="pms-table">
                  <thead className="pms-table-header">
                    <tr>
                      <th className="pms-table-th">Item</th>
                      <th className="pms-table-th">Category</th>
                      <th className="pms-table-th text-right">Current Available</th>
                      <th className="pms-table-th text-right">Par Target</th>
                      <th className="pms-table-th text-right">Shortfall Qty</th>
                      <th className="pms-table-th text-right">Unit Rate</th>
                      <th className="pms-table-th text-right">Estimated Cost</th>
                      <th className="pms-table-th-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderItems.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <EmptyState
                            icon={CheckCircle2}
                            title="All stock levels healthy"
                            description="No inventory items currently have stock below minimum threshold or par target."
                            compact
                          />
                        </td>
                      </tr>
                    ) : (
                      reorderItems.map((item) => (
                        <tr key={item.id} className="pms-table-row transition-colors">
                          <td className="pms-table-td font-semibold text-ink">{item.name}</td>
                          <td className="pms-table-td text-ink-muted">{item.category}</td>
                          <td className="pms-table-td text-right font-mono font-semibold text-ink">
                            {item.current_stock} {item.unit}
                          </td>
                          <td className="pms-table-td text-right font-mono text-ink">
                            {item.target_stock} {item.unit}
                          </td>
                          <td className="pms-table-td text-right font-mono font-bold text-status-amber">
                            {item.suggested_purchase} {item.unit}
                          </td>
                          <td className="pms-table-td text-right font-mono text-ink-muted">
                            {formatCurrency(item.cost_per_unit)}
                          </td>
                          <td className="pms-table-td text-right font-mono font-bold text-brand-forest">
                            {formatCurrency((item.suggested_purchase || 0) * item.cost_per_unit)}
                          </td>
                          <td className="pms-table-td whitespace-nowrap">
                            <div className="flex items-center justify-end">
                              {isOwnerOrManager && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPurchaseFor(item.id)}
                                  className="pms-btn-primary h-7 px-2.5 text-xs gap-1 font-medium"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  <span>Order</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ANNUAL REPLACEMENT PLANNING ── */}
        {activeTab === 'planning' && (
          <ReplacementPlanningView
            items={items}
            onOpenPurchaseModal={handleOpenPurchaseFor}
            isOwnerOrManager={isOwnerOrManager}
          />
        )}

        {/* ── TAB 4: FOOD WASTAGE & LOSS DASHBOARD ── */}
        {activeTab === 'wastage' && (
          <WastageDashboardView
            wastageStats={wastageStats}
            transactions={transactions}
            onOpenReportWaste={() => handleOpenWasteFor()}
            canReport={canReport}
          />
        )}

        {/* ── TAB 5: AUDIT LOG & TRANSACTION HISTORY ── */}
        {activeTab === 'audit' && (
          <div className="pms-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="pms-table">
                <thead className="pms-table-header">
                  <tr>
                    <th className="pms-table-th">Date</th>
                    <th className="pms-table-th">Action Type</th>
                    <th className="pms-table-th">Item Name</th>
                    <th className="pms-table-th text-right">Quantity</th>
                    <th className="pms-table-th text-right">Value</th>
                    <th className="pms-table-th">Reason / Detail</th>
                    <th className="pms-table-th">Recorded By</th>
                    <th className="pms-table-th">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <EmptyState
                          icon={History}
                          title="No inventory movements logged"
                          description="Purchases, consumption, wastage, and damage transactions will appear here."
                          compact
                        />
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="pms-table-row transition-colors">
                        <td className="pms-table-td whitespace-nowrap font-medium text-ink">
                          {formatDate(t.transaction_date)}
                        </td>
                        <td className="pms-table-td whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              t.transaction_type === 'purchase'
                                ? 'bg-status-green/15 text-status-green border border-status-green/30'
                                : t.transaction_type === 'usage'
                                ? 'bg-brand-sand text-brand-forest border border-border-subtle'
                                : t.transaction_type === 'waste'
                                ? 'bg-status-amber/15 text-status-amber border border-status-amber/30'
                                : t.transaction_type === 'damaged'
                                ? 'bg-status-red/15 text-status-red border border-status-red/30'
                                : 'bg-status-blue/15 text-status-blue border border-status-blue/30'
                            }`}
                          >
                            {t.transaction_type}
                          </span>
                        </td>
                        <td className="pms-table-td font-semibold text-ink">{t.item_name}</td>
                        <td className="pms-table-td text-right font-mono font-semibold text-ink whitespace-nowrap">
                          {t.quantity > 0 ? `+${t.quantity}` : t.quantity} {t.unit}
                        </td>
                        <td className="pms-table-td text-right font-mono text-xs text-ink whitespace-nowrap">
                          {formatCurrency(t.total_cost)}
                        </td>
                        <td className="pms-table-td text-xs text-ink">
                          {t.reason || t.condition_state || (t.supplier ? `Supplier: ${t.supplier}` : '—')}
                        </td>
                        <td className="pms-table-td text-xs text-ink-muted">{t.recorder_name || 'Staff'}</td>
                        <td className="pms-table-td text-xs text-ink-muted max-w-[180px] truncate">
                          {t.notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddPurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => {
          setIsPurchaseOpen(false);
          setSelectedItemForAction(undefined);
        }}
        items={items}
        preselectedItemId={selectedItemForAction}
        onSuccess={refreshData}
      />

      <RecordUsageModal
        isOpen={isUsageOpen}
        onClose={() => {
          setIsUsageOpen(false);
          setSelectedItemForAction(undefined);
        }}
        items={items}
        preselectedItemId={selectedItemForAction}
        onSuccess={refreshData}
      />

      <ReportDamageModal
        isOpen={isDamageOpen}
        onClose={() => {
          setIsDamageOpen(false);
          setSelectedItemForAction(undefined);
        }}
        items={items}
        preselectedItemId={selectedItemForAction}
        onSuccess={refreshData}
      />

      <ReportWasteModal
        isOpen={isWasteOpen}
        onClose={() => {
          setIsWasteOpen(false);
          setSelectedItemForAction(undefined);
        }}
        items={items.filter((i) => i.item_type !== 'reusable_asset')}
        preselectedItemId={selectedItemForAction}
        onSuccess={refreshData}
      />

      <ItemFormModal
        isOpen={isItemFormOpen}
        onClose={() => {
          setIsItemFormOpen(false);
          setItemToEdit(null);
        }}
        itemToEdit={itemToEdit}
        onSuccess={refreshData}
      />

      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItemForDetail(null);
        }}
        item={selectedItemForDetail}
        transactions={transactions}
        onOpenUsage={handleOpenUsageFor}
        onOpenPurchase={handleOpenPurchaseFor}
        onOpenDamage={handleOpenDamageFor}
        onOpenWaste={handleOpenWasteFor}
        onEdit={handleEditItem}
        canManage={isOwnerOrManager}
      />
    </div>
  );
}
