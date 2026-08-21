'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Info,
  FolderPlus,
  Layers,
  ArrowLeft,
  X,
  Loader2,
  Coffee,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { MenuCategory, MenuItem, SaveMenuItemInput, SaveMenuCategoryInput } from '../../../../lib/menu/types';
import SettingsBackNavigation from '../../../../components/settings/SettingsBackNavigation';
import {
  saveMenuItemAction,
  toggleMenuItemStatusAction,
  saveMenuCategoryAction,
} from '../../../../lib/menu/actions';
import { formatCurrency } from '../../../../lib/utils/currency';

interface FoodMenuManagerProps {
  initialCategories: MenuCategory[];
  initialItems: MenuItem[];
  userRole: string;
  canEdit: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Breakfast: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Lunch: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  Dinner: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  Snacks: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  Beverages: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  Other: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
};

export default function FoodMenuManager({
  initialCategories,
  initialItems,
  userRole,
  canEdit,
}: FoodMenuManagerProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories);
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  // Form states
  const [itemForm, setItemForm] = useState<SaveMenuItemInput>({
    category_id: categories[0]?.id || '',
    name: '',
    description: '',
    selling_price: 0,
    is_active: true,
  });

  const [catForm, setCatForm] = useState<SaveMenuCategoryInput>({
    name: '',
    display_order: 1,
    is_active: true,
  });

  // Action status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && !item.is_active) return false;
      if (statusFilter === 'inactive' && item.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const catMatch = (item.category?.name || '').toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch;
      }

      return true;
    });
  }, [items, selectedCategory, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.is_active).length;
    const inactive = total - active;
    const totalCats = categories.length;
    return { total, active, inactive, totalCats };
  }, [items, categories]);

  // Handle open item modal
  const openAddItemModal = () => {
    setEditingItem(null);
    setItemForm({
      category_id: categories[0]?.id || '',
      name: '',
      description: '',
      selling_price: 0,
      is_active: true,
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      selling_price: item.selling_price,
      is_active: item.is_active,
    });
    setItemModalOpen(true);
  };

  // Handle save menu item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      showNotification('error', 'Please enter a food item name');
      return;
    }
    if (!itemForm.category_id) {
      showNotification('error', 'Please select a menu category');
      return;
    }
    if (isNaN(Number(itemForm.selling_price)) || Number(itemForm.selling_price) < 0) {
      showNotification('error', 'Please enter a valid non-negative price');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveMenuItemAction({
        ...itemForm,
        selling_price: Number(itemForm.selling_price),
      });

      if (res.error) {
        showNotification('error', res.error);
      } else if (res.item) {
        const cat = categories.find((c) => c.id === res.item?.category_id);
        const resolvedItem: MenuItem = { ...res.item, category: cat };

        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === resolvedItem.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = resolvedItem;
            return next;
          }
          return [...prev, resolvedItem];
        });

        setItemModalOpen(false);
        showNotification('success', editingItem ? `Updated "${resolvedItem.name}" successfully` : `Added "${resolvedItem.name}" to menu`);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle active/inactive
  const handleToggleStatus = async (item: MenuItem) => {
    if (!canEdit) return;
    const newStatus = !item.is_active;
    setTogglingItemId(item.id);

    try {
      const res = await toggleMenuItemStatusAction(item.id, newStatus);
      if (res.error) {
        showNotification('error', res.error);
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i))
        );
        showNotification('success', `"${item.name}" is now ${newStatus ? 'Active' : 'Inactive'}`);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update item status');
    } finally {
      setTogglingItemId(null);
    }
  };

  // Handle category management
  const openCategoryModal = () => {
    setEditingCategory(null);
    setCatForm({
      name: '',
      display_order: categories.length + 1,
      is_active: true,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name?.trim()) {
      showNotification('error', 'Please enter a category name');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveMenuCategoryAction(catForm);
      if (res.error) {
        showNotification('error', res.error);
      } else if (res.category) {
        setCategories((prev) => {
          const idx = prev.findIndex((c) => c.id === res.category?.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = res.category!;
            return next;
          }
          return [...prev, res.category!];
        });
        setCategoryModalOpen(false);
        showNotification('success', `Category "${res.category.name}" saved successfully`);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2.5 pb-2.5 border-b border-border-subtle">
        <SettingsBackNavigation currentPage="Food Menu" />

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <h1 className="text-display font-serif text-brand-forest flex items-center gap-2.5 leading-tight">
              <UtensilsCrossed className="w-6 h-6 text-brand-forest shrink-0" />
              <span>Food Menu Management</span>
            </h1>
            <p className="text-body text-ink-muted mt-1 leading-relaxed">
              Configure restaurant &amp; room-service food items, categories, and selling tariffs
            </p>
          </div>

          {/* Action Buttons for Owner / Manager */}
          <div className="flex items-center gap-2 shrink-0">
            {canEdit ? (
              <>
                <button
                  onClick={openCategoryModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-semibold hover:bg-brand-sand hover:border-brand-forest/40 transition-colors shadow-2xs cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-brand-forest" />
                  <span>Manage Categories</span>
                </button>

                <button
                  onClick={openAddItemModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Food Item</span>
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-status-blue/10 border border-status-blue/20 text-status-blue text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Reception (View-Only Mode)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Total Menu Items</p>
          <p className="text-2xl font-bold text-ink mt-1 tabular-nums">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Items
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">{stats.active}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-400"></span> Inactive Items
          </p>
          <p className="text-2xl font-bold text-stone-600 mt-1 tabular-nums">{stats.inactive}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-[11px] font-semibold text-brand-forest uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-bold text-brand-forest mt-1 tabular-nums">{stats.totalCats}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by food item name, ingredients, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-subtle bg-brand-sand/30 focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-brand-sand p-1 rounded-xl shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'all' ? 'bg-white text-brand-forest shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'inactive' ? 'bg-white text-stone-700 shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Inactive ({stats.inactive})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
            }`}
          >
            All Categories ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-brand-forest text-white border-brand-forest shadow-xs'
                    : 'bg-white text-ink border-border-subtle hover:bg-brand-sand'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center mx-auto text-ink-muted">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-ink">No food menu items found</p>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'Get started by adding food items to your hotel menu.'}
            </p>
            {canEdit && (
              <button
                onClick={openAddItemModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Food Item</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  {canEdit && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredItems.map((item) => {
                  const catName = item.category?.name || 'Other';
                  const catColors = CATEGORY_COLORS[catName] || CATEGORY_COLORS.Other;
                  const isToggling = togglingItemId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-brand-sand/30 transition-colors ${
                        !item.is_active ? 'opacity-60 bg-stone-50/50' : ''
                      }`}
                    >
                      {/* Name & Description */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-ink text-sm flex items-center gap-2">
                            {item.name}
                            {!item.is_active && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                                Inactive
                              </span>
                            )}
                          </p>
                          {item.description && (
                            <p className="text-xs text-ink-muted line-clamp-1 max-w-md">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                        >
                          {catName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-bold text-brand-forest tabular-nums">
                          {formatCurrency(item.selling_price)}
                        </span>
                      </td>

                      {/* Status Toggle / Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {canEdit ? (
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isToggling}
                            title={item.is_active ? 'Click to deactivate' : 'Click to activate'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                              item.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : item.is_active ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <X className="w-3 h-3 text-stone-500" />
                            )}
                            <span>{item.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      {canEdit && (
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openEditItemModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-forest hover:bg-brand-sand border border-transparent hover:border-border-subtle transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT FOOD ITEM MODAL */}
      {/* ========================================================================= */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-border-subtle overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-brand-sand-dark/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-sand rounded-lg text-brand-forest">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">
                    {editingItem ? `Edit "${editingItem.name}"` : 'Add New Food Menu Item'}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {editingItem ? 'Update pricing, category, or description' : 'Enter item details and selling price'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setItemModalOpen(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa, Paneer Butter Masala..."
                  value={itemForm.name}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                />
              </div>

              {/* Category & Selling Price Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Menu Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-subtle bg-white focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="120"
                      value={itemForm.selling_price || ''}
                      onChange={(e) =>
                        setItemForm((prev) => ({ ...prev, selling_price: Number(e.target.value) }))
                      }
                      className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-border-subtle font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Item Description / Ingredients <span className="text-ink-muted font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Crispy crepe filled with spiced potato masala, served with coconut chutney..."
                  value={itemForm.description || ''}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div>
                  <p className="text-xs font-semibold text-ink">Active on Menu</p>
                  <p className="text-[11px] text-ink-muted">
                    Available for staff to select while charging food
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setItemForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    itemForm.is_active ? 'bg-brand-forest' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      itemForm.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notice regarding historical billing */}
              <div className="p-3 bg-brand-sand rounded-xl border border-border-subtle text-[11px] text-ink-muted flex items-start gap-2">
                <Info className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
                <span>
                  <strong>Historical Protection:</strong> Changing this item&apos;s price will apply to future food charges. Existing guest invoices and past bills retain their historical prices.
                </span>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-border-subtle text-xs font-semibold text-ink hover:bg-brand-sand transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors shadow-2xs"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANAGE / ADD CATEGORY MODAL */}
      {/* ========================================================================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-border-subtle overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-brand-sand-dark/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-sand rounded-lg text-brand-forest">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">Manage Menu Categories</h3>
                  <p className="text-xs text-ink-muted">Add or reorder food menu categories</p>
                </div>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Existing Categories List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Active Categories ({categories.length})
                </p>
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-brand-sand/50 border border-border-subtle text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-sand-dark text-ink-muted flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-ink">{cat.name}</span>
                    </div>
                    <span className="text-[11px] text-ink-muted">
                      {items.filter((i) => i.category_id === cat.id).length} items
                    </span>
                  </div>
                ))}
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleSaveCategory} className="pt-3 border-t border-border-subtle space-y-3">
                <p className="text-xs font-semibold text-ink">Add New Category</p>
                <div>
                  <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desserts, Chef's Specials..."
                    value={catForm.name}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl border border-border-subtle text-xs font-semibold text-ink hover:bg-brand-sand transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors shadow-2xs"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Add Category</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
