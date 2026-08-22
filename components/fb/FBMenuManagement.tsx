'use client';

import { useState, useTransition } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Search,
  Check,
  X,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FBMenuItem } from '../../lib/fb/types';
import { MenuCategory } from '../../lib/menu/types';
import { saveFBMenuItemAction, saveFBMenuCategoryAction } from '../../lib/fb/actions';
import { formatCurrency } from '../../lib/utils/currency';

interface FBMenuManagementProps {
  initialItems: FBMenuItem[];
  initialCategories: MenuCategory[];
  userRole: string;
}

export default function FBMenuManagement({
  initialItems,
  initialCategories,
  userRole,
}: FBMenuManagementProps) {
  const [items, setItems] = useState<FBMenuItem[]>(initialItems);
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State for Item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<FBMenuItem> | null>(null);

  // Modal State for Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<MenuCategory> | null>(null);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isManager = ['owner', 'manager'].includes(userRole);

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku?.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    if (categoryFilter !== 'All') {
      if (item.category?.name !== categoryFilter && item.category_id !== categoryFilter) return false;
    }
    return true;
  });

  const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await saveFBMenuItemAction(editingItem);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      if (res.success && res.item) {
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === res.item?.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = res.item!;
            return copy;
          }
          return [res.item!, ...prev];
        });
        setSuccessMessage('Menu item saved successfully!');
        setIsItemModalOpen(false);
        setEditingItem(null);
      }
    });
  };

  const handleSaveCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentCat = editingCategory;
    if (!currentCat || !currentCat.name?.trim()) return;
    const categoryName = currentCat.name.trim();
    const categoryId = currentCat.id || crypto.randomUUID();
    const displayOrder = Number(currentCat.display_order || 1);
    const isActive = currentCat.is_active !== false;

    setErrorMessage(null);

    startTransition(async () => {
      const res = await saveFBMenuCategoryAction({
        id: currentCat.id,
        name: categoryName,
        display_order: displayOrder,
        is_active: isActive,
      });

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      if (res.success) {
        setCategories((prev) => {
          const updated = {
            id: categoryId,
            name: categoryName,
            display_order: displayOrder,
            is_active: isActive,
          };
          const idx = prev.findIndex((c) => c.id === categoryId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = updated;
            return copy;
          }
          return [...prev, updated];
        });
        setSuccessMessage('Menu category saved successfully!');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-brand-forest" />
            Food Menu & Catalog Management
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Configure restaurant menu dishes, prices, GST rates, dietary tags, and meal availability.
          </p>
        </div>

        {isManager && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingCategory({ name: '', display_order: categories.length + 1, is_active: true });
                setIsCategoryModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-brand-sand text-ink text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Category</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingItem({
                  name: '',
                  category_id: categories[0]?.id || '',
                  selling_price: 100,
                  base_price: 95.24,
                  gst_rate: 5,
                  food_type: 'veg',
                  available_meals: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
                  kitchen_area: 'Main Kitchen',
                  is_active: true,
                });
                setIsItemModalOpen(true);
              }}
              className="pms-btn-primary flex items-center gap-1.5 text-xs shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Menu Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'items'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Menu Items ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'categories'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Items Tab Content */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search food item or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
              {['All', ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-brand-forest text-white font-semibold'
                      : 'bg-brand-sand/40 hover:bg-brand-sand text-ink-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-border-subtle shadow-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-sand/40 border-b border-border-subtle text-[11px] font-bold text-ink-muted uppercase">
                  <th className="py-3 px-4">Item Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Dietary Type</th>
                  <th className="py-3 px-4 text-right">Base Price</th>
                  <th className="py-3 px-4 text-right">GST Rate</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {isManager && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-ink">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ink-muted">
                      No menu items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-sand/15 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.food_type === 'non_veg'
                                ? 'bg-action-danger'
                                : item.food_type === 'egg'
                                ? 'bg-amber-500'
                                : 'bg-status-green'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.sku && <div className="text-[10px] text-ink-muted mt-0.5">{item.sku}</div>}
                      </td>

                      <td className="py-3 px-4 text-ink-muted">
                        <span className="px-2 py-0.5 rounded bg-brand-sand font-medium text-[11px]">
                          {item.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${
                            item.food_type === 'non_veg'
                              ? 'bg-action-danger/10 text-action-danger'
                              : item.food_type === 'egg'
                              ? 'bg-amber-500/10 text-amber-700'
                              : 'bg-status-green/10 text-status-green'
                          }`}
                        >
                          {item.food_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-ink-muted">
                        {formatCurrency(item.base_price || 0)}
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-ink-muted">
                        {item.gst_rate}%
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-ink tabular-nums">
                        {formatCurrency(item.selling_price)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.is_active ? 'bg-status-green/15 text-status-green' : 'bg-brand-sand text-ink-muted'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {isManager && (
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-brand-sand text-brand-forest transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab Content */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-border-subtle shadow-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-sand/40 border-b border-border-subtle text-[11px] font-bold text-ink-muted uppercase">
                <th className="py-3 px-4">Display Order</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4 text-center">Status</th>
                {isManager && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-brand-sand/15">
                  <td className="py-3 px-4 font-mono font-bold text-ink-muted">{cat.display_order}</td>
                  <td className="py-3 px-4 font-bold text-ink">{cat.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cat.is_active ? 'bg-status-green/15 text-status-green' : 'bg-brand-sand text-ink-muted'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  {isManager && (
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-brand-sand text-brand-forest transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add Menu Item Modal */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-border-subtle shadow-modal max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-ink">
                {editingItem.id ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsItemModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-ink-muted hover:text-ink p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-ink-muted block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-ink-muted block mb-1">Category *</label>
                  <select
                    value={editingItem.category_id || categories[0]?.id}
                    onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-ink-muted block mb-1">Dietary Type</label>
                  <select
                    value={editingItem.food_type || 'veg'}
                    onChange={(e) => setEditingItem({ ...editingItem, food_type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none"
                  >
                    <option value="veg">🌱 Veg</option>
                    <option value="non_veg">🍗 Non-Veg</option>
                    <option value="egg">🥚 Egg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-ink-muted block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={editingItem.selling_price ?? 100}
                    onChange={(e) => setEditingItem({ ...editingItem, selling_price: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-ink-muted block mb-1">GST Rate (%)</label>
                  <select
                    value={editingItem.gst_rate ?? 5}
                    onChange={(e) => setEditingItem({ ...editingItem, gst_rate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% (Restaurant)</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-ink-muted block mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FB-DOSA"
                    value={editingItem.sku || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink-muted block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients and serving details..."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="item_is_active"
                  checked={editingItem.is_active !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                  className="rounded text-brand-forest"
                />
                <label htmlFor="item_is_active" className="text-xs font-semibold text-ink cursor-pointer">
                  Item is active and available for billing
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    setIsItemModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted hover:text-ink text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="pms-btn-primary text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Add Category Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-border-subtle shadow-modal max-w-sm w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-ink">
                {editingCategory.id ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-ink-muted hover:text-ink p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-ink-muted block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Desserts"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ink-muted block mb-1">Display Order</label>
                <input
                  type="number"
                  min="1"
                  value={editingCategory.display_order ?? 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, display_order: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted hover:text-ink text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="pms-btn-primary text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
