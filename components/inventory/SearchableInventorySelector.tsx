'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Check,
  ChevronDown,
  X,
  Package,
  Utensils,
  BedDouble,
  Sparkles,
  Brush,
  Tv,
  AlertTriangle,
} from 'lucide-react';
import { InventoryItem, INVENTORY_CLASSIFICATIONS } from '../../lib/inventory/types';
import { InventoryClassification } from '../../lib/types/database.types';

interface SearchableInventorySelectorProps {
  items: InventoryItem[];
  selectedItemId?: string;
  onSelectItem: (item: InventoryItem) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  filterClassification?: InventoryClassification;
  excludeItemIds?: string[];
  disabled?: boolean;
}

export default function SearchableInventorySelector({
  items,
  selectedItemId,
  onSelectItem,
  label = 'Select Inventory Item',
  required = true,
  placeholder = 'Search inventory items (e.g. rice, blanket, oil, cleaner)...',
  filterClassification,
  excludeItemIds,
  disabled = false,
}: SearchableInventorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Currently selected item
  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId),
    [items, selectedItemId]
  );

  // Available categories in the item set
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  // Filter items based on classification, category, and search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      if (excludeItemIds && excludeItemIds.includes(item.id)) return false;
      if (filterClassification && item.inventory_type !== filterClassification) return false;
      if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) return false;

      if (!q) return true;

      const nameMatch = item.name.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const typeMatch = item.inventory_type?.toLowerCase().includes(q);
      const supplierMatch = item.preferred_supplier?.toLowerCase().includes(q);
      const unitMatch = item.unit.toLowerCase().includes(q);

      return nameMatch || catMatch || typeMatch || supplierMatch || unitMatch;
    });
  }, [items, searchQuery, selectedCategoryFilter, filterClassification, excludeItemIds]);

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      setHighlightedIndex(0);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[highlightedIndex]) {
        onSelectItem(filteredItems[highlightedIndex]);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const activeEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const getClassificationIcon = (type?: string) => {
    switch (type) {
      case 'food_kitchen':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'linen':
        return <BedDouble className="w-3.5 h-3.5" />;
      case 'room_supplies':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'housekeeping_supplies':
        return <Brush className="w-3.5 h-3.5" />;
      case 'hotel_assets':
        return <Tv className="w-3.5 h-3.5" />;
      default:
        return <Package className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="relative space-y-1.5" ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="block text-xs font-semibold text-ink">
          {label} {required && <span className="text-status-red">*</span>}
        </label>
      )}

      {/* Trigger Box */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl border bg-white text-ink text-xs sm:text-sm flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-brand-forest ring-2 ring-brand-forest/20'
            : 'border-border-subtle hover:border-brand-forest/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-brand-sand/30' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedItem ? (
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <div className="p-1.5 rounded-lg bg-brand-sand text-brand-forest shrink-0">
              {getClassificationIcon(selectedItem.inventory_type)}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-forest truncate text-xs sm:text-sm">
                  {selectedItem.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-brand-sand text-brand-forest border border-border-subtle shrink-0">
                  {selectedItem.category}
                </span>
              </div>
              <div className="text-[11px] text-ink-muted flex items-center gap-2 mt-0.5 font-mono">
                <span>
                  Current: <strong className="text-ink">{selectedItem.current_stock} {selectedItem.unit}</strong>
                </span>
                {selectedItem.target_stock && (
                  <span>· Par: {selectedItem.target_stock} {selectedItem.unit}</span>
                )}
                {selectedItem.cost_per_unit > 0 && (
                  <span>· Rate: ₹{selectedItem.cost_per_unit}/{selectedItem.unit}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-ink-muted text-xs sm:text-sm">
            Select an inventory item...
          </span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-forest' : ''
          }`}
        />
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-border-subtle shadow-2xl z-50 overflow-hidden flex flex-col max-h-[380px] animate-in fade-in zoom-in-98 duration-150">
          {/* Top Search Bar */}
          <div className="p-3 border-b border-border-subtle bg-brand-sand/40 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={placeholder}
                className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-border-subtle text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-brand-forest text-white shadow-2xs'
                    : 'bg-white text-ink-muted hover:text-ink border border-border-subtle hover:bg-brand-sand'
                }`}
              >
                All Categories ({items.length})
              </button>

              {categories.slice(0, 8).map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                const isCatActive = selectedCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      isCatActive
                        ? 'bg-brand-forest text-white shadow-2xs'
                        : 'bg-white text-ink-muted hover:text-ink border border-border-subtle hover:bg-brand-sand'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="overflow-y-auto p-1.5 space-y-0.5 max-h-[260px] text-xs"
            role="listbox"
          >
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-ink-muted space-y-2">
                <Package className="w-7 h-7 mx-auto text-ink-muted/50" />
                <p className="font-medium text-xs">No inventory items found matching &quot;{searchQuery}&quot;</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryFilter('all');
                    }}
                    className="px-3 py-1 bg-brand-sand text-brand-forest font-semibold rounded-lg hover:bg-brand-sand/80 transition-colors text-xs cursor-pointer inline-block"
                  >
                    Clear Search &amp; Filters
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = item.id === selectedItemId;
                const isHighlighted = idx === highlightedIndex;
                const isLowStock = item.stock_status === 'low_stock' || item.stock_status === 'out_of_stock';
                const isAsset = item.item_type === 'reusable_asset';

                return (
                  <div
                    key={item.id}
                    data-index={idx}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectItem(item);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                      isHighlighted
                        ? 'bg-brand-sand/80 text-brand-forest'
                        : isSelected
                        ? 'bg-brand-sand/40 text-brand-forest'
                        : 'hover:bg-brand-sand/50 text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isAsset
                            ? 'bg-status-amber/15 text-status-amber'
                            : 'bg-brand-sand text-brand-forest'
                        }`}
                      >
                        {getClassificationIcon(item.inventory_type)}
                      </div>

                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm truncate">
                            {item.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-brand-sand text-brand-forest border border-border-subtle shrink-0">
                            {item.category}
                          </span>
                          {isLowStock && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-status-amber/15 text-status-amber border border-status-amber/30 shrink-0">
                              Low Stock
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-ink-muted flex items-center gap-2 mt-0.5 font-mono">
                          <span>
                            Current: <strong className="text-ink">{item.current_stock} {item.unit}</strong>
                          </span>
                          {item.target_stock && (
                            <span>· Par: {item.target_stock} {item.unit}</span>
                          )}
                          {item.cost_per_unit > 0 && (
                            <span>· Rate: ₹{item.cost_per_unit}/{item.unit}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-forest text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2 border-t border-border-subtle bg-brand-sand/30 flex items-center justify-between text-[11px] text-ink-muted px-3">
            <span>
              Showing {filteredItems.length} of {items.length} items
            </span>
            <span className="hidden sm:inline">Use ↑ ↓ keys to navigate, Enter to select</span>
          </div>
        </div>
      )}
    </div>
  );
}
