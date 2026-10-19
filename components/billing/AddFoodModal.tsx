'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  X,
  Loader2,
  AlertCircle,
  Check,
  Search,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { FoodServiceType, TaxTreatment } from '../../lib/types/database.types';
import { MenuItem, MenuCategory } from '../../lib/menu/types';
import {
  addFoodChargeAction,
  addMultipleFoodChargesAction,
  FoodChargeRecord,
} from '../../lib/billing/food-actions';
import { formatCurrency } from '../../lib/utils/currency';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  roomNumber: string;
  guestName: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  gstPercentage: number;
  onChargeAdded?: (charge: FoodChargeRecord) => void;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  serviceType: FoodServiceType;
}

export default function AddFoodModal({
  isOpen,
  onClose,
  bookingId,
  roomNumber,
  guestName,
  categories,
  menuItems,
  gstPercentage,
  onChargeAdded,
}: AddFoodModalProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxTreatment, setTaxTreatment] = useState<TaxTreatment>('gst');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setCart([]);
      setError(null);
      setActiveCategoryTab('all');
    }
  }, [isOpen]);

  // Active menu items
  const activeMenuItems = useMemo(() => {
    return menuItems.filter((i) => i.is_active !== false);
  }, [menuItems]);

  // Unified category list for navigation pills
  const navCategories = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name.toLowerCase() === 'other' ? 'Room Service' : cat.name,
      rawName: cat.name,
      count: activeMenuItems.filter((i) => i.category_id === cat.id).length,
    }));
  }, [categories, activeMenuItems]);

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const queryTokens = q ? q.split(/\s+/).filter(Boolean) : [];

    return activeMenuItems.filter((item) => {
      // 1. Category Tab Filter
      if (activeCategoryTab !== 'all' && item.category_id !== activeCategoryTab) {
        return false;
      }

      if (queryTokens.length === 0) return true;

      // 2. Search query matching name, category name, and description
      const cat = categories.find((c) => c.id === item.category_id);
      const catName = cat?.name?.toLowerCase() || '';
      const searchableText = `${item.name} ${catName} ${item.description || ''}`.toLowerCase();

      return queryTokens.every((token) => searchableText.includes(token));
    });
  }, [activeMenuItems, searchQuery, activeCategoryTab, categories]);

  // Map category to valid FoodServiceType
  const resolveServiceType = (categoryId?: string): FoodServiceType => {
    if (!categoryId) return 'Breakfast';
    const cat = categories.find((c) => c.id === categoryId);
    const name = cat?.name?.toLowerCase() || '';
    if (name.includes('lunch')) return 'Lunch';
    if (name.includes('dinner')) return 'Dinner';
    if (name.includes('snack')) return 'Snacks';
    if (name.includes('beverage')) return 'Beverages';
    if (name.includes('other') || name.includes('room service')) return 'Other';
    return 'Breakfast';
  };

  // Add item to cart with momentary visual feedback
  const handleAddToCart = (item: MenuItem) => {
    const serviceType = resolveServiceType(item.category_id);
    setRecentlyAddedId(item.id);
    setTimeout(() => setRecentlyAddedId(null), 600);

    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1, serviceType }];
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove single item from cart
  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  // Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, c) => sum + Number(c.menuItem.selling_price) * c.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, c) => sum + c.quantity, 0);
  }, [cart]);

  const effectiveGstRate = taxTreatment === 'gst' ? gstPercentage : 0;
  const gstAmount =
    taxTreatment === 'gst' ? Math.round(((cartSubtotal * effectiveGstRate) / 100) * 100) / 100 : 0;
  const grandTotal = Math.round((cartSubtotal + gstAmount) * 100) / 100;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Please select at least one menu item.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (cart.length === 1) {
        const item = cart[0];
        const res = await addFoodChargeAction({
          booking_id: bookingId,
          menu_item_id: item.menuItem.id,
          service_type: item.serviceType,
          quantity: item.quantity,
          tax_treatment: taxTreatment,
          remarks: remarks.trim() || undefined,
        });

        if (res.error) {
          setError(res.error);
          return;
        }

        if (res.charge && onChargeAdded) {
          onChargeAdded(res.charge);
        }
      } else {
        const primaryService = cart[0]?.serviceType || 'Breakfast';
        const res = await addMultipleFoodChargesAction({
          booking_id: bookingId,
          service_type: primaryService,
          items: cart.map((c) => ({
            menu_item_id: c.menuItem.id,
            quantity: c.quantity,
          })),
          tax_treatment: taxTreatment,
          remarks: remarks.trim() || undefined,
        });

        if (res.error) {
          setError(res.error);
          return;
        }

        if (res.charges && res.charges.length > 0 && onChargeAdded) {
          res.charges.forEach((c) => onChargeAdded(c));
        }
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add food charges.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-border-subtle shadow-2xl max-w-2xl w-full flex flex-col max-h-[86vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* ── 1. Compact Header ── */}
        <div className="px-5 py-3 bg-brand-forest text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Utensils className="w-4 h-4 text-brand-sand" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base leading-tight">Add Food &amp; Beverage</h2>
              <p className="text-[11px] text-brand-sand/80">
                Room {roomNumber} · {guestName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── 2. Scrollable Body Content ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
            {error && (
              <div className="p-2.5 bg-action-danger/10 border border-action-danger/30 rounded-xl flex items-center gap-2 text-action-danger font-medium text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* ── Menu Toolbar: Search & Category Navigation ── */}
            <div className="space-y-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full pl-9 pr-8 py-2 bg-brand-sand/20 border border-border-subtle rounded-xl text-xs text-ink placeholder:text-ink-muted/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-forest focus:border-brand-forest transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategoryTab === 'all'
                      ? 'bg-brand-forest text-white shadow-2xs'
                      : 'bg-brand-sand/40 text-ink-muted hover:text-ink hover:bg-brand-sand border border-border-subtle/60'
                  }`}
                >
                  All ({activeMenuItems.length})
                </button>
                {navCategories.map((cat) => {
                  const isActive = activeCategoryTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryTab(cat.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-forest text-white shadow-2xs'
                          : 'bg-brand-sand/40 text-ink-muted hover:text-ink hover:bg-brand-sand border border-border-subtle/60'
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Compact Menu Items List (Primary Scroll Area) ── */}
            <div className="border border-border-subtle/80 rounded-xl max-h-44 overflow-y-auto divide-y divide-border-subtle/50 bg-white">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-ink-muted space-y-1">
                  <p className="text-xs">No food items match &quot;{searchQuery}&quot;</p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategoryTab('all');
                      }}
                      className="text-[11px] font-bold text-brand-forest hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.category_id);
                  const isJustAdded = recentlyAddedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleAddToCart(item)}
                      className="px-3 py-2 flex items-center justify-between gap-3 hover:bg-brand-sand/30 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-ink group-hover:text-brand-forest transition-colors truncate">
                            {item.name}
                          </span>
                          {cat && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-sand text-brand-forest border border-border-subtle/50 shrink-0">
                              {cat.name}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-ink-muted line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-mono font-bold text-xs text-ink tabular-nums">
                          {formatCurrency(item.selling_price)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold transition-all cursor-pointer ${
                            isJustAdded
                              ? 'bg-status-green text-white scale-105'
                              : 'bg-brand-sand text-brand-forest hover:bg-brand-forest hover:text-white'
                          }`}
                          title="Add to order"
                        >
                          {isJustAdded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Selected Items Section (Expands Cleanly) ── */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-forest" />
                  Order Summary ({totalItemsCount})
                </span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-action-danger hover:underline font-semibold cursor-pointer text-[10px]"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="px-3 py-2.5 rounded-xl bg-brand-sand/20 border border-dashed border-border-subtle text-center text-ink-muted text-[11px]">
                  No items selected yet. Click <span className="font-bold text-brand-forest">+</span> on any menu item above.
                </div>
              ) : (
                <div className="border border-border-subtle rounded-xl overflow-hidden bg-white">
                  <div className="max-h-28 overflow-y-auto divide-y divide-border-subtle/50">
                    {cart.map((c) => {
                      const lineTotal = Number(c.menuItem.selling_price) * c.quantity;
                      return (
                        <div
                          key={c.menuItem.id}
                          className="px-3 py-1.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs text-ink truncate">
                              {c.menuItem.name}
                            </p>
                            <p className="text-[10px] text-ink-muted font-mono">
                              {formatCurrency(c.menuItem.selling_price)} each
                            </p>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(c.menuItem.id, -1)}
                              className="w-5 h-5 rounded bg-brand-sand border border-border-subtle/60 flex items-center justify-center text-ink hover:bg-brand-sand/80 transition-colors cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs text-ink">
                              {c.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(c.menuItem.id, 1)}
                              className="w-5 h-5 rounded bg-brand-sand border border-border-subtle/60 flex items-center justify-center text-ink hover:bg-brand-sand/80 transition-colors cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Line total & remove */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono font-bold text-brand-forest tabular-nums text-xs w-14 text-right">
                              {formatCurrency(lineTotal)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(c.menuItem.id)}
                              className="p-1 rounded text-ink-muted hover:text-action-danger transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Clean Financial Breakdown */}
                  <div className="px-3 py-2 bg-brand-sand/30 border-t border-border-subtle flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-ink-muted text-[11px]">
                      <span>Subtotal: <strong className="font-mono text-ink">{formatCurrency(cartSubtotal)}</strong></span>
                      {taxTreatment === 'gst' ? (
                        <span>GST ({gstPercentage}%): <strong className="font-mono text-ink">{formatCurrency(gstAmount)}</strong></span>
                      ) : (
                        <span className="text-status-blue font-semibold">Non-GST (₹0.00)</span>
                      )}
                    </div>
                    <div className="font-bold text-brand-forest text-xs flex items-center gap-1.5">
                      <span>Total:</span>
                      <span className="font-mono text-sm">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Tax Treatment & Notes (Compact) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              {/* Tax options */}
              <div className="space-y-1">
                <span className="font-bold text-ink uppercase tracking-wider text-[10px] block">
                  Tax Treatment
                </span>
                <div className="flex items-center gap-2">
                  <label
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      taxTreatment === 'gst'
                        ? 'border-brand-forest bg-brand-forest/5 font-semibold text-brand-forest'
                        : 'border-border-subtle bg-white text-ink hover:bg-brand-sand/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tax_treatment"
                      value="gst"
                      checked={taxTreatment === 'gst'}
                      onChange={() => setTaxTreatment('gst')}
                      className="accent-brand-forest w-3 h-3"
                    />
                    <span>GST ({gstPercentage}%)</span>
                  </label>

                  <label
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      taxTreatment === 'non_gst'
                        ? 'border-brand-forest bg-brand-forest/5 font-semibold text-brand-forest'
                        : 'border-border-subtle bg-white text-ink hover:bg-brand-sand/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tax_treatment"
                      value="non_gst"
                      checked={taxTreatment === 'non_gst'}
                      onChange={() => setTaxTreatment('non_gst')}
                      className="accent-brand-forest w-3 h-3"
                    />
                    <span>Non-GST (0%)</span>
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <span className="font-bold text-ink uppercase tracking-wider text-[10px] block">
                  Order Notes <span className="font-normal text-ink-muted lowercase">(optional)</span>
                </span>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Room service, extra spicy"
                  className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs text-ink focus:ring-1 focus:ring-brand-forest focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* ── 3. Sticky Footer ── */}
          <div className="px-5 py-3 bg-brand-sand/40 border-t border-border-subtle flex items-center justify-between gap-3 shrink-0">
            {/* Running Total Indicator on Left */}
            <div className="text-xs">
              <span className="text-ink-muted">Total: </span>
              <span className="font-mono font-bold text-sm text-brand-forest">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} · {formatCurrency(grandTotal)}
              </span>
            </div>

            {/* Action Buttons on Right */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink font-semibold hover:bg-brand-sand transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-forest hover:bg-brand-forest-light text-white font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding to Folio...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Folio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
