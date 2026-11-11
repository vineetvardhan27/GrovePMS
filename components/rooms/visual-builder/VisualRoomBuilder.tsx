'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BedDouble,
  Layers,
  Plus,
  Minus,
  Trash2,
  Copy,
  Edit2,
  GripVertical,
  Check,
  Tag,
  DollarSign,
  TrendingUp,
  Sparkles,
  Info,
  ChevronDown,
  Eye,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import {
  BuilderCategory,
  BuilderFloor,
  GeneratedRoom,
  PropertySummaryStats,
  DEFAULT_PRESET_CATEGORIES,
  DEFAULT_PRESET_FLOORS,
} from './types';
import CategoryEditModal from './CategoryEditModal';
import RoomManifestModal from './RoomManifestModal';

export interface VisualRoomBuilderProps {
  initialCategories?: BuilderCategory[];
  initialFloors?: BuilderFloor[];
  onChange?: (data: {
    categories: BuilderCategory[];
    floors: BuilderFloor[];
    generatedRooms: GeneratedRoom[];
    stats: PropertySummaryStats;
  }) => void;
  className?: string;
  readOnly?: boolean;
}

const CATEGORY_COLOR_STYLES: Record<
  BuilderCategory['color'],
  { badge: string; border: string; bg: string; dot: string; text: string }
> = {
  forest: {
    badge: 'bg-brand-forest/10 dark:bg-emerald-brand/15 text-brand-forest dark:text-emerald-highlight border-brand-forest/20 dark:border-emerald-highlight/25',
    border: 'border-brand-forest/30 dark:border-emerald-highlight/30',
    bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    dot: 'bg-brand-forest dark:bg-emerald-highlight',
    text: 'text-brand-forest dark:text-emerald-highlight',
  },
  emerald: {
    badge: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-500/30',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-50/30 dark:bg-emerald-950/20',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    badge: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/20 dark:border-amber-500/30',
    border: 'border-amber-500/30',
    bg: 'bg-amber-50/30 dark:bg-amber-950/20',
    dot: 'bg-amber-500',
    text: 'text-amber-800 dark:text-amber-400',
  },
  indigo: {
    badge: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border-indigo-500/20 dark:border-indigo-500/30',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-50/30 dark:bg-indigo-950/20',
    dot: 'bg-indigo-500',
    text: 'text-indigo-800 dark:text-indigo-400',
  },
  rose: {
    badge: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-900 dark:text-rose-300 border-rose-500/20 dark:border-rose-500/30',
    border: 'border-rose-500/30',
    bg: 'bg-rose-50/30 dark:bg-rose-950/20',
    dot: 'bg-rose-500',
    text: 'text-rose-800 dark:text-rose-400',
  },
  slate: {
    badge: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-800 dark:text-slate-300 border-slate-500/20 dark:border-slate-500/30',
    border: 'border-slate-500/30',
    bg: 'bg-slate-50/50 dark:bg-slate-900/30',
    dot: 'bg-slate-500',
    text: 'text-slate-800 dark:text-slate-300',
  },
};

export default function VisualRoomBuilder({
  initialCategories = DEFAULT_PRESET_CATEGORIES,
  initialFloors = DEFAULT_PRESET_FLOORS,
  onChange,
  className = '',
  readOnly = false,
}: VisualRoomBuilderProps) {
  const [categories, setCategories] = useState<BuilderCategory[]>(initialCategories);
  const [floors, setFloors] = useState<BuilderFloor[]>(initialFloors);
  const [customRoomNumbers, setCustomRoomNumbers] = useState<Record<string, string>>({});

  // Modals state
  const [editingCategory, setEditingCategory] = useState<BuilderCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);

  // Drag and drop state
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [activeDropFloorId, setActiveDropFloorId] = useState<string | null>(null);

  // ── AUTOMATIC ROOM NUMBER GENERATION ──
  const generatedRooms = useMemo<GeneratedRoom[]>(() => {
    const result: GeneratedRoom[] = [];
    const usedRoomNumbers = new Set<string>();

    floors.forEach((floor) => {
      let roomSeq = floor.startingRoomNumber || floor.floorNumber * 100 + 1;

      floor.allocations.forEach((alloc) => {
        const cat = categories.find((c) => c.id === alloc.categoryId);
        if (!cat) return;

        for (let i = 0; i < alloc.quantity; i++) {
          const roomId = `${floor.id}-${alloc.id}-${i}`;
          let roomNumber = customRoomNumbers[roomId] || String(roomSeq);

          // If collision occurs due to automatic numbering, increment until unique
          while (usedRoomNumbers.has(roomNumber)) {
            roomSeq++;
            roomNumber = String(roomSeq);
          }

          usedRoomNumbers.add(roomNumber);
          roomSeq++;

          result.push({
            id: roomId,
            roomNumber,
            floor: floor.floorNumber,
            floorName: floor.name,
            categoryId: cat.id,
            categoryName: cat.name,
            baseRate: cat.base_rate,
            weekendRate: cat.weekend_rate,
            isCustomOverride: Boolean(customRoomNumbers[roomId]),
          });
        }
      });
    });

    return result;
  }, [floors, categories, customRoomNumbers]);

  // ── SUMMARY METRICS CALCULATION ──
  const summaryStats = useMemo<PropertySummaryStats>(() => {
    const totalRooms = generatedRooms.length;
    const totalFloors = floors.length;
    const totalCategories = categories.length;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    generatedRooms.forEach((r) => {
      categoryCounts[r.categoryId] = (categoryCounts[r.categoryId] || 0) + 1;
    });

    const categoryDistribution = categories.map((c) => {
      const count = categoryCounts[c.id] || 0;
      const percentage = totalRooms > 0 ? Math.round((count / totalRooms) * 100) : 0;
      return {
        id: c.id,
        name: c.name,
        count,
        percentage,
        rate: c.base_rate,
        color: c.color,
      };
    });

    // Floor distribution
    const floorDistribution = floors.map((f) => {
      const floorRooms = generatedRooms.filter((r) => r.floor === f.floorNumber);
      return {
        floorId: f.id,
        floorNumber: f.floorNumber,
        floorName: f.name,
        count: floorRooms.length,
      };
    });

    const rates = categories.map((c) => c.base_rate).filter((r) => r > 0);
    const minRate = rates.length > 0 ? Math.min(...rates) : 0;
    const maxRate = rates.length > 0 ? Math.max(...rates) : 0;

    const estimatedNightlyRevenue = generatedRooms.reduce((acc, r) => acc + r.baseRate, 0);

    return {
      totalFloors,
      totalRooms,
      totalCategories,
      categoryDistribution,
      floorDistribution,
      minRate,
      maxRate,
      estimatedNightlyRevenue,
    };
  }, [generatedRooms, floors, categories]);

  // Emit changes to parent
  useEffect(() => {
    if (onChange) {
      onChange({
        categories,
        floors,
        generatedRooms,
        stats: summaryStats,
      });
    }
  }, [categories, floors, generatedRooms, summaryStats, onChange]);

  // ── CATEGORY MANAGEMENT ACTIONS ──
  const handleOpenNewCategoryModal = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: 'New Room Category',
      description: 'Well-appointed room with hospitality amenities and comfortable bedding.',
      base_rate: 3000,
      weekend_rate: 3600,
      weekend_adjustment_type: 'fixed',
      weekend_adjustment_val: 600,
      extra_bed_rate: 800,
      child_charge: 400,
      max_occupancy: 3,
      adult_capacity: 2,
      child_capacity: 1,
      bed_count: 1,
      bed_type: 'King',
      amenities: ['High-Speed Wi-Fi', 'Smart LED TV', 'Ensuite Luxury Bathroom'],
      color: 'forest',
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (updated: BuilderCategory) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      if (exists) {
        return prev.map((c) => (c.id === updated.id ? updated : c));
      }
      return [...prev, updated];
    });
  };

  const handleDuplicateCategory = (categoryToClone: BuilderCategory) => {
    const newId = `cat-${Date.now()}`;
    const cloned: BuilderCategory = {
      ...categoryToClone,
      id: newId,
      name: `${categoryToClone.name} (Copy)`,
    };
    setCategories((prev) => [...prev, cloned]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categories.length <= 1) return; // Keep at least one category
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Remove allocations that reference this category
    setFloors((prev) =>
      prev.map((f) => ({
        ...f,
        allocations: f.allocations.filter((a) => a.categoryId !== categoryId),
      }))
    );
  };

  // ── FLOOR MANAGEMENT ACTIONS ──
  const handleAddFloor = () => {
    const nextFloorNum = floors.length > 0 ? Math.max(...floors.map((f) => f.floorNumber)) + 1 : 1;
    const newFloor: BuilderFloor = {
      id: `floor-${Date.now()}`,
      floorNumber: nextFloorNum,
      name: `Floor ${nextFloorNum}`,
      startingRoomNumber: nextFloorNum * 100 + 1,
      allocations: [
        {
          id: `alloc-${Date.now()}-1`,
          categoryId: categories[0]?.id || 'cat-deluxe',
          quantity: 4,
        },
      ],
    };
    setFloors((prev) => [...prev, newFloor]);
  };

  const handleRenameFloor = (floorId: string, newName: string) => {
    setFloors((prev) =>
      prev.map((f) => (f.id === floorId ? { ...f, name: newName } : f))
    );
  };

  const handleChangeFloorStartNumber = (floorId: string, newStart: number) => {
    setFloors((prev) =>
      prev.map((f) =>
        f.id === floorId ? { ...f, startingRoomNumber: Math.max(1, newStart) } : f
      )
    );
  };

  const handleDeleteFloor = (floorId: string) => {
    if (floors.length <= 1) return; // Keep at least one floor
    setFloors((prev) => prev.filter((f) => f.id !== floorId));
  };

  // ── ALLOCATION INTERACTIONS ──
  const handleAssignCategoryToFloor = (floorId: string, categoryId: string, qty = 2) => {
    setFloors((prev) =>
      prev.map((floor) => {
        if (floor.id !== floorId) return floor;
        const existingAlloc = floor.allocations.find((a) => a.categoryId === categoryId);
        if (existingAlloc) {
          return {
            ...floor,
            allocations: floor.allocations.map((a) =>
              a.categoryId === categoryId ? { ...a, quantity: a.quantity + qty } : a
            ),
          };
        }
        return {
          ...floor,
          allocations: [
            ...floor.allocations,
            { id: `alloc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, categoryId, quantity: qty },
          ],
        };
      })
    );
  };

  const handleUpdateAllocationQty = (
    floorId: string,
    allocationId: string,
    delta: number
  ) => {
    setFloors((prev) =>
      prev.map((floor) => {
        if (floor.id !== floorId) return floor;
        return {
          ...floor,
          allocations: floor.allocations
            .map((alloc) => {
              if (alloc.id !== allocationId) return alloc;
              const nextQty = alloc.quantity + delta;
              return { ...alloc, quantity: nextQty };
            })
            .filter((a) => a.quantity > 0), // remove if 0
        };
      })
    );
  };

  const handleRemoveAllocation = (floorId: string, allocationId: string) => {
    setFloors((prev) =>
      prev.map((floor) => {
        if (floor.id !== floorId) return floor;
        return {
          ...floor,
          allocations: floor.allocations.filter((a) => a.id !== allocationId),
        };
      })
    );
  };

  // ── DRAG AND DROP HANDLERS ──
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    e.dataTransfer.setData('text/plain', categoryId);
    e.dataTransfer.effectAllowed = 'copyMove';
    setDraggedCategoryId(categoryId);
  };

  const handleFloorDragOver = (e: React.DragEvent, floorId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (activeDropFloorId !== floorId) {
      setActiveDropFloorId(floorId);
    }
  };

  const handleFloorDragLeave = (e: React.DragEvent, floorId: string) => {
    if (activeDropFloorId === floorId) {
      setActiveDropFloorId(null);
    }
  };

  const handleFloorDrop = (e: React.DragEvent, floorId: string) => {
    e.preventDefault();
    const catId = e.dataTransfer.getData('text/plain') || draggedCategoryId;
    if (catId) {
      handleAssignCategoryToFloor(floorId, catId, 2);
    }
    setActiveDropFloorId(null);
    setDraggedCategoryId(null);
  };

  const handleUpdateRoomNumberOverride = (roomId: string, newNumber: string) => {
    setCustomRoomNumbers((prev) => ({
      ...prev,
      [roomId]: newNumber,
    }));
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* ══════════════════════════════════════════════
       * SECTION 1: ROOM CATEGORIES (CENTRAL CONFIGURATION)
       * ══════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-forest" />
              <h3 className="font-serif font-bold text-lg sm:text-xl text-black tracking-tight">
                1. Central Room Categories &amp; Tariffs
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-border-subtle text-[11px] font-bold text-ink-muted">
                {categories.length} Categories
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Categories are the source of truth for base rates, weekend adjustments, and guest capacity. Drag cards into floors below.
            </p>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleOpenNewCategoryModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room Category</span>
            </button>
          )}
        </div>

        {/* Categories Cards Grid (Draggable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {categories.map((cat) => {
            const colorStyle = CATEGORY_COLOR_STYLES[cat.color] || CATEGORY_COLOR_STYLES.forest;
            const allocatedTotal = generatedRooms.filter((r) => r.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                draggable={!readOnly}
                onDragStart={(e) => handleCategoryDragStart(e, cat.id)}
                className={`bg-white rounded-2xl border ${colorStyle.border} p-4 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group relative select-none ${
                  !readOnly ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5' : ''
                }`}
              >
                {/* Drag Indicator Top Bar */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${colorStyle.dot}`} />
                    <span className="font-serif font-bold text-sm text-black truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!readOnly && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          title="Edit Category & Rates"
                          className="p-1 rounded-lg hover:bg-brand-sand text-ink-muted hover:text-black transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateCategory(cat)}
                          title="Duplicate Category"
                          className="p-1 rounded-lg hover:bg-brand-sand text-ink-muted hover:text-black transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            title="Delete Category"
                            className="p-1 rounded-lg hover:bg-red-50 text-ink-muted hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <GripVertical className="w-3.5 h-3.5 text-ink-muted/50 ml-0.5" />
                      </>
                    )}
                  </div>
                </div>

                {/* Rates & Specifications */}
                <div className="space-y-2 flex-1 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-muted text-[11px]">Base Rate:</span>
                    <span className="font-serif font-bold text-black text-sm">
                      ₹{cat.base_rate.toLocaleString('en-IN')}
                      <span className="text-[10px] text-ink-muted font-normal font-sans">/nt</span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-ink-muted">Weekend Tariff:</span>
                    <span className="font-semibold text-emerald-800">
                      ₹{(cat.weekend_rate || cat.base_rate).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-ink-muted">Max Occupancy:</span>
                    <span className="font-medium text-black">
                      {cat.adult_capacity} Adults, {cat.child_capacity} Child • {cat.bed_type}
                    </span>
                  </div>

                  <div className="pt-1.5 flex flex-wrap gap-1">
                    {cat.amenities.slice(0, 3).map((am) => (
                      <span
                        key={am}
                        className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#FAF8F5] border border-border-subtle/80 text-ink-muted truncate max-w-[130px]"
                      >
                        {am}
                      </span>
                    ))}
                    {cat.amenities.length > 3 && (
                      <span className="text-[9.5px] px-1 py-0.5 text-ink-muted">
                        +{cat.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Allocation Pill & Quick Add Menu */}
                <div className="mt-3 pt-2.5 border-t border-border-subtle/60 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-ink-muted">
                    Allocated: <strong className="text-black font-semibold">{allocatedTotal} rooms</strong>
                  </span>

                  {!readOnly && floors.length > 0 && (
                    <div className="relative group/add">
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded-lg bg-[#FAF8F5] hover:bg-brand-sand border border-border-subtle text-brand-forest font-semibold text-[10.5px] flex items-center gap-1"
                      >
                        <span>+ Assign</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      <div className="absolute right-0 bottom-full mb-1 hidden group-hover/add:block bg-white rounded-xl shadow-lg border border-border-subtle py-1 z-30 min-w-[140px]">
                        <span className="block px-2.5 py-1 text-[9.5px] font-bold uppercase text-ink-muted border-b border-border-subtle/60">
                          Assign 2 Rooms to:
                        </span>
                        {floors.map((fl) => (
                          <button
                            key={fl.id}
                            type="button"
                            onClick={() => handleAssignCategoryToFloor(fl.id, cat.id, 2)}
                            className="w-full text-left px-2.5 py-1 text-xs hover:bg-brand-sand text-black truncate"
                          >
                            {fl.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       * SECTION 2: FLOOR-WISE ROOM ALLOCATION (DROP ZONES)
       * ══════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-forest" />
              <h3 className="font-serif font-bold text-lg sm:text-xl text-black tracking-tight">
                2. Floor-wise Room Allocation &amp; Building Blocks
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-border-subtle text-[11px] font-bold text-ink-muted">
                {floors.length} Floors
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Drop category blocks into each floor to assign capacity. Room numbers generate sequentially automatically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManifestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-border-subtle hover:bg-brand-sand/60 text-brand-forest text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review All Rooms ({generatedRooms.length})</span>
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={handleAddFloor}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Floor Level</span>
              </button>
            )}
          </div>
        </div>

        {/* Stacked Floor Zones */}
        <div className="space-y-4">
          {floors.map((floor) => {
            const isDropActive = activeDropFloorId === floor.id;
            const floorRooms = generatedRooms.filter((r) => r.floor === floor.floorNumber);

            return (
              <div
                key={floor.id}
                onDragOver={(e) => handleFloorDragOver(e, floor.id)}
                onDragLeave={(e) => handleFloorDragLeave(e, floor.id)}
                onDrop={(e) => handleFloorDrop(e, floor.id)}
                className={`rounded-[24px] border p-4 sm:p-5 transition-all duration-200 ${
                  isDropActive
                    ? 'border-2 border-brand-forest bg-emerald-50/40 ring-4 ring-emerald-500/10'
                    : 'bg-white border-border-subtle/90 shadow-2xs'
                }`}
              >
                {/* Floor Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-forest text-white flex items-center justify-center font-bold text-xs shrink-0">
                      L{floor.floorNumber}
                    </div>

                    {!readOnly ? (
                      <input
                        type="text"
                        value={floor.name}
                        onChange={(e) => handleRenameFloor(floor.id, e.target.value)}
                        className="font-serif font-bold text-base sm:text-lg text-black bg-transparent border-b border-transparent hover:border-border-subtle focus:border-brand-forest focus:outline-none"
                      />
                    ) : (
                      <span className="font-serif font-bold text-base sm:text-lg text-black">
                        {floor.name}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-border-subtle text-[10.5px] font-semibold text-brand-forest">
                      {floorRooms.length} Rooms
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {/* Starting Room Number Input */}
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <span className="text-[11px]">Starts at #:</span>
                      {!readOnly ? (
                        <input
                          type="number"
                          value={floor.startingRoomNumber}
                          onChange={(e) =>
                            handleChangeFloorStartNumber(floor.id, Number(e.target.value))
                          }
                          className="w-16 px-2 py-1 bg-[#FAF8F5] border border-border-subtle rounded-lg text-xs font-mono font-bold text-black text-center focus:outline-none focus:border-brand-forest"
                        />
                      ) : (
                        <span className="font-mono font-bold text-black">
                          {floor.startingRoomNumber}
                        </span>
                      )}
                    </div>

                    {/* Delete Floor Button */}
                    {!readOnly && floors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFloor(floor.id)}
                        title="Delete this floor"
                        className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Allocated Category Building Blocks */}
                <div className="py-3.5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mr-1">
                      Allocated Blocks:
                    </span>

                    {floor.allocations.map((alloc) => {
                      const cat = categories.find((c) => c.id === alloc.categoryId);
                      if (!cat) return null;
                      const colorStyle =
                        CATEGORY_COLOR_STYLES[cat.color] || CATEGORY_COLOR_STYLES.forest;

                      return (
                        <div
                          key={alloc.id}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${colorStyle.border} ${colorStyle.bg} shadow-2xs transition-all`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full ${colorStyle.dot}`} />
                            <span className="font-semibold text-xs text-black truncate">
                              {cat.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border-subtle/80">
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => handleUpdateAllocationQty(floor.id, alloc.id, -1)}
                                className="w-5 h-5 rounded-md bg-white hover:bg-brand-sand border border-border-subtle flex items-center justify-center text-ink text-xs font-bold"
                              >
                                -
                              </button>
                            )}

                            <span className="font-mono font-bold text-xs text-black px-1.5">
                              {alloc.quantity}
                            </span>

                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => handleUpdateAllocationQty(floor.id, alloc.id, 1)}
                                className="w-5 h-5 rounded-md bg-white hover:bg-brand-sand border border-border-subtle flex items-center justify-center text-ink text-xs font-bold"
                              >
                                +
                              </button>
                            )}

                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAllocation(floor.id, alloc.id)}
                                className="ml-1 text-ink-muted hover:text-red-600 transition-colors"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {floor.allocations.length === 0 && (
                      <div className="text-xs text-ink-muted italic py-1">
                        No categories allocated yet. Drag a card here or choose from the dropdown.
                      </div>
                    )}
                  </div>

                  {/* Floor Room Tiles Visualizer */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-border-subtle/70 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-ink-muted">
                      <span className="font-medium">
                        Live Room Tiles ({floorRooms.length} generated):
                      </span>
                      <span>Click tile to rename room #</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {floorRooms.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            const newNum = prompt(`Enter custom room number for this ${r.categoryName}:`, r.roomNumber);
                            if (newNum && newNum.trim()) {
                              handleUpdateRoomNumberOverride(r.id, newNum.trim());
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-white border border-border-subtle/90 hover:border-brand-forest shadow-2xs font-mono text-[11px] font-bold text-black flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{r.roomNumber}</span>
                          <span className="font-sans text-[9px] text-ink-muted font-normal truncate max-w-[65px]">
                            {r.categoryName.replace(' Room', '')}
                          </span>
                        </button>
                      ))}

                      {floorRooms.length === 0 && (
                        <span className="text-xs text-ink-muted italic">
                          Floor empty. Allocate rooms above to generate keys.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       * SECTION 3: LIVE PROPERTY SUMMARY
       * ══════════════════════════════════════════════ */}
      <section className="p-6 rounded-[28px] bg-white border border-border-subtle/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-forest animate-pulse" />
              <h3 className="font-serif font-bold text-lg text-black tracking-tight">
                3. Live Property Summary &amp; Inventory Manifest
              </h3>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Dynamically calculated from your configured categories and floor allocations.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-brand-forest tracking-wider block">
              Estimated Nightly Inventory Value
            </span>
            <span className="font-serif font-bold text-xl sm:text-2xl text-black">
              ₹{summaryStats.estimatedNightlyRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-border-subtle/70">
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-ink-muted block">
              Total Floors
            </span>
            <span className="font-serif font-bold text-2xl text-black mt-0.5 block">
              {summaryStats.totalFloors}
            </span>
            <span className="text-[11px] text-brand-forest font-medium">Physical Levels</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-border-subtle/70">
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-ink-muted block">
              Total Rooms
            </span>
            <span className="font-serif font-bold text-2xl text-black mt-0.5 block">
              {summaryStats.totalRooms}
            </span>
            <span className="text-[11px] text-brand-forest font-medium">Inventory Units</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-border-subtle/70">
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-ink-muted block">
              Room Categories
            </span>
            <span className="font-serif font-bold text-2xl text-black mt-0.5 block">
              {summaryStats.totalCategories}
            </span>
            <span className="text-[11px] text-brand-forest font-medium">Configured Tiers</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-border-subtle/70">
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-ink-muted block">
              Rate Spectrum
            </span>
            <span className="font-serif font-bold text-lg sm:text-xl text-black mt-1 block truncate">
              ₹{summaryStats.minRate} - ₹{summaryStats.maxRate}
            </span>
            <span className="text-[11px] text-brand-forest font-medium">Base Tariffs</span>
          </div>
        </div>

        {/* Category & Floor Distribution Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Category Distribution */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-black block">
              Inventory by Category
            </span>
            <div className="space-y-2">
              {summaryStats.categoryDistribution.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-black">{item.name}</span>
                    <span className="text-ink-muted font-mono">
                      {item.count} rooms ({item.percentage}%) • ₹{item.rate}/nt
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EAE5DB] rounded-full overflow-hidden">
                    <div
                      className="bg-brand-forest h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floor Distribution */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-black block">
              Inventory by Floor
            </span>
            <div className="space-y-2">
              {summaryStats.floorDistribution.map((item) => (
                <div key={item.floorId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-black">{item.floorName}</span>
                    <span className="text-ink-muted font-mono">{item.count} rooms</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EAE5DB] rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          summaryStats.totalRooms > 0
                            ? Math.round((item.count / summaryStats.totalRooms) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODALS ── */}
      <CategoryEditModal
        isOpen={isCategoryModalOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
      />

      <RoomManifestModal
        isOpen={isManifestModalOpen}
        rooms={generatedRooms}
        onUpdateRoomNumber={handleUpdateRoomNumberOverride}
        onClose={() => setIsManifestModalOpen(false)}
      />
    </div>
  );
}

