'use client';

import { useState } from 'react';
import {
  BedDouble,
  Plus,
  Edit2,
  Users,
  Percent,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Building,
  Layers,
  Utensils,
  PartyPopper,
  DollarSign,
  Tag,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  RoomCategory,
  RoomWithCategory,
  PropertyResource,
  getEffectiveRoomRates,
} from '../../../../lib/rooms/types';
import {
  saveRoomCategoryAction,
  saveRoomRateOverrideAction,
} from '../../../../lib/rooms/actions';
import { formatCurrency } from '../../../../lib/utils/currency';
import { StaffRole } from '../../../../lib/types/database.types';

interface RoomCategoriesManagerProps {
  initialCategories: RoomCategory[];
  initialRooms?: RoomWithCategory[];
  initialResources?: PropertyResource[];
  userRole: StaffRole;
}

// Floor display metadata
const FLOOR_INFO: Record<number, { title: string; subtitle: string; badge: string }> = {
  0: {
    title: 'Basement',
    subtitle: '1 Dedicated Family Accommodation Unit',
    badge: 'Basement Suite',
  },
  1: {
    title: 'Ground Floor — Road Level',
    subtitle: '4 Premium Rooms with direct garden access',
    badge: 'Road Level',
  },
  2: {
    title: 'First Floor',
    subtitle: '7 Rooms (2 Deluxe + 5 Premium)',
    badge: 'First Floor',
  },
  3: {
    title: 'Second Floor',
    subtitle: '3 Rooms (2 Luxury + 1 Deluxe) + Hotel Restaurant',
    badge: 'Second Floor',
  },
  4: {
    title: 'Upper Floor',
    subtitle: '4 Mountain View Rooms with private balconies',
    badge: 'Upper Level',
  },
};

export default function RoomCategoriesManager({
  initialCategories,
  initialRooms = [],
  initialResources = [],
  userRole,
}: RoomCategoriesManagerProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'property'>('categories');
  const [categories, setCategories] = useState<RoomCategory[]>(initialCategories);
  const [rooms, setRooms] = useState<RoomWithCategory[]>(initialRooms);
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
  const [editingRoomOverride, setEditingRoomOverride] = useState<RoomWithCategory | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canEdit = userRole === 'owner' || userRole === 'manager';

  const handleOpenEdit = (category: RoomCategory) => {
    if (!canEdit) return;
    setEditingCategory(category);
    setIsCreatingNew(false);
    setErrorMessage(null);
  };

  const handleOpenCreate = () => {
    if (!canEdit) return;
    setEditingCategory({
      id: '',
      hotel_id: 'a0000000-0000-0000-0000-000000000001',
      name: '',
      description: '',
      base_rate: 2500,
      weekend_rate: 3000,
      max_occupancy: 2,
      extra_bed_rate: 500,
    });
    setIsCreatingNew(true);
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setEditingRoomOverride(null);
    setIsCreatingNew(false);
    setErrorMessage(null);
  };

  // Save Category changes
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory || !canEdit) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const base_rate = Number(formData.get('base_rate'));
      const weekend_rate = formData.get('weekend_rate') ? Number(formData.get('weekend_rate')) : null;
      const max_occupancy = Number(formData.get('max_occupancy')) || 2;
      const extra_bed_rate = formData.get('extra_bed_rate') ? Number(formData.get('extra_bed_rate')) : 0;

      const updatedData: Partial<RoomCategory> = {
        id: editingCategory.id || undefined,
        name,
        description,
        base_rate,
        weekend_rate,
        max_occupancy,
        extra_bed_rate,
      };

      const result = await saveRoomCategoryAction(updatedData);

      if (result.success && result.category) {
        if (isCreatingNew) {
          setCategories((prev) => [...prev, result.category]);
          setSuccessNotice(`Category "${result.category.name}" created successfully.`);
        } else {
          setCategories((prev) =>
            prev.map((c) => (c.id === result.category.id ? result.category : c))
          );
          // Also update category references in room list
          setRooms((prev) =>
            prev.map((r) =>
              r.category_id === result.category.id ? { ...r, category: result.category } : r
            )
          );
          setSuccessNotice(`Pricing for "${result.category.name}" saved successfully.`);
        }
        handleCloseModal();
        setTimeout(() => setSuccessNotice(null), 5000);
      } else {
        setErrorMessage(result.error || 'Failed to save room category.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Room Override changes
  const handleSaveRoomOverride = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRoomOverride || !canEdit) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const formData = new FormData(e.currentTarget);
      const baseOverrideRaw = formData.get('base_rate_override') as string;
      const weekendOverrideRaw = formData.get('weekend_rate_override') as string;

      const baseRateOverride = baseOverrideRaw && Number(baseOverrideRaw) > 0 ? Number(baseOverrideRaw) : null;
      const weekendRateOverride = weekendOverrideRaw && Number(weekendOverrideRaw) > 0 ? Number(weekendOverrideRaw) : null;

      const result = await saveRoomRateOverrideAction(editingRoomOverride.id, baseRateOverride, weekendRateOverride);

      if (result.success && result.room) {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === result.room.id ? { ...r, ...result.room } : r
          )
        );
        setSuccessNotice(
          baseRateOverride
            ? `Room ${editingRoomOverride.room_number} custom tariff of ${formatCurrency(baseRateOverride)} saved successfully.`
            : `Room ${editingRoomOverride.room_number} reset to standard category tariff.`
        );
        handleCloseModal();
        setTimeout(() => setSuccessNotice(null), 5000);
      } else {
        setErrorMessage(result.error || 'Failed to save room override.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while saving room override.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group rooms by floor (0=Basement, 1=Ground, 2=First, 3=Second, 4=Upper)
  const floorGroups = [0, 1, 2, 3, 4].map((floorNum) => ({
    floor: floorNum,
    info: FLOOR_INFO[floorNum],
    rooms: rooms.filter((r) => r.floor === floorNum),
  }));

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 bg-status-green/10 border border-status-green/30 rounded-xl flex items-center justify-between text-status-green text-sm font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button type="button" onClick={() => setSuccessNotice(null)}>
            <X className="w-4 h-4 cursor-pointer hover:opacity-75" />
          </button>
        </div>
      )}

      {/* Role / Access Notice */}
      {!canEdit && (
        <div className="p-4 bg-brand-sand/60 border border-border-subtle rounded-xl flex items-center gap-3 text-xs text-ink-muted">
          <Info className="w-4 h-4 text-brand-forest shrink-0" />
          <span>
            You are viewing the property configuration in <strong>Read-Only Mode</strong> ({userRole.toUpperCase()}). Only Hotel Owners and Managers can modify room pricing and category tariffs.
          </span>
        </div>
      )}

      {/* Top Navigation Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer min-h-touch ${
              activeTab === 'categories'
                ? 'bg-brand-forest text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-ink hover:bg-brand-sand border border-border-subtle'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Room Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('property')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer min-h-touch ${
              activeTab === 'property'
                ? 'bg-brand-forest text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-ink hover:bg-brand-sand border border-border-subtle'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Physical Property (19 Units)</span>
          </button>
        </div>

        {activeTab === 'categories' && canEdit && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-brand-forest hover:bg-brand-forest-light text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-touch w-full sm:w-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* ----------------------------------------------------
       * TAB 1: ROOM CATEGORIES (CONFIGURABLE PRICING)
       * ---------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-ink-muted">
              Configure room categories, weekday &amp; weekend rates, guest capacity, and extra bed pricing. Changes apply to all new reservations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((category) => {
              const assignedRoomsCount = rooms.filter((r) => r.category_id === category.id).length;

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-xl border border-border-subtle p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-brand-forest/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-brand-sand rounded-lg text-brand-forest">
                        <BedDouble className="w-6 h-6" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-brand-sand text-brand-forest px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {assignedRoomsCount} {assignedRoomsCount === 1 ? 'Unit' : 'Rooms'}
                        </span>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(category)}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-forest/10 hover:bg-brand-forest hover:text-white text-brand-forest text-xs font-semibold transition-colors cursor-pointer"
                            title="Edit Category Pricing"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-h2 text-ink font-bold">{category.name}</h3>
                      <p className="text-caption text-ink-muted mt-1 line-clamp-2">
                        {category.description || 'Standard hotel room unit.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted font-medium">Weekday Rate:</span>
                      <span className="font-bold text-ink text-sm tabular-nums">
                        {formatCurrency(category.base_rate)} <span className="text-[11px] font-normal text-ink-muted">/ night</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted font-medium">Weekend Rate:</span>
                      <span className="font-bold text-brand-forest tabular-nums">
                        {category.weekend_rate ? `${formatCurrency(category.weekend_rate)} / night` : 'Same as weekday'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted font-medium">Max Occupancy:</span>
                      <span className="font-medium text-ink flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-ink-muted" />
                        {category.max_occupancy} Guests
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted font-medium">Extra Bed Rate:</span>
                      <span className="font-semibold text-ink tabular-nums">
                        {category.extra_bed_rate ? formatCurrency(category.extra_bed_rate) : '₹0'}
                      </span>
                    </div>

                    {canEdit && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          className="w-full py-2 bg-brand-sand hover:bg-brand-forest hover:text-white text-brand-forest rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Category Pricing</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * TAB 2: PHYSICAL PROPERTY VIEW (EXACT 19 ACCOMMODATION UNITS)
       * ---------------------------------------------------- */}
      {activeTab === 'property' && (
        <div className="space-y-8">
          {/* Overview Banner */}
          <div className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-serif font-bold text-lg text-brand-forest">
                  Hotel Greenery View Physical Layout
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Complete architectural inventory: 19 accommodation units across 5 levels + separate facility resources
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-brand-sand px-3 py-1.5 rounded-lg border border-border-subtle text-brand-forest font-bold">
                  Total Accommodation: 19 Units
                </span>
                <span className="bg-brand-sand px-3 py-1.5 rounded-lg border border-border-subtle text-ink font-medium">
                  Restaurant: 1 Facility
                </span>
                <span className="bg-brand-sand px-3 py-1.5 rounded-lg border border-border-subtle text-ink font-medium">
                  Banquet: 1 Grand Hall
                </span>
              </div>
            </div>

            {/* Category summary tags */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-brand-forest/10 text-brand-forest rounded-md font-medium">
                Premium: 9 Rooms (801-804, 807-811)
              </span>
              <span className="px-2.5 py-1 bg-brand-forest/10 text-brand-forest rounded-md font-medium">
                Deluxe: 3 Rooms (805, 806, 814)
              </span>
              <span className="px-2.5 py-1 bg-brand-forest/10 text-brand-forest rounded-md font-medium">
                Luxury: 2 Rooms (812, 813)
              </span>
              <span className="px-2.5 py-1 bg-brand-forest/10 text-brand-forest rounded-md font-medium">
                Mountain View: 4 Rooms (815-818)
              </span>
              <span className="px-2.5 py-1 bg-brand-forest/10 text-brand-forest rounded-md font-medium">
                Family Apartment: 1 Unit (Basement)
              </span>
            </div>
          </div>

          {/* Floors breakdown */}
          <div className="space-y-6">
            {floorGroups.map(({ floor, info, rooms: floorRooms }) => (
              <div
                key={floor}
                className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-2xs space-y-4"
              >
                {/* Floor Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-brand-sand rounded-lg font-serif font-bold text-xs text-brand-forest uppercase tracking-wider">
                      {info.badge}
                    </span>
                    <div>
                      <h4 className="font-serif font-bold text-base text-ink">
                        {info.title}
                      </h4>
                      <p className="text-xs text-ink-muted">{info.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-ink-muted">
                    {floorRooms.length} Accommodation {floorRooms.length === 1 ? 'Unit' : 'Rooms'}
                  </span>
                </div>

                {/* Units Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {floorRooms.map((room) => {
                    const rates = getEffectiveRoomRates(room);
                    const isFamilyApartment = room.room_number === 'FAMILY-APT';

                    return (
                      <div
                        key={room.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          rates.hasOverride
                            ? 'bg-brand-sand/40 border-brand-forest/50'
                            : 'bg-brand-sand/15 border-border-subtle hover:border-brand-forest/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            {isFamilyApartment ? (
                              <span className="font-serif font-bold text-base text-brand-forest">
                                Family Apartment
                              </span>
                            ) : (
                              <span className="font-serif font-bold text-xl text-ink">
                                Room {room.room_number}
                              </span>
                            )}
                            <span className="block text-xs font-medium text-ink-muted mt-0.5">
                              {room.category.name}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white border border-border-subtle text-ink-muted">
                              {room.status}
                            </span>
                            {rates.hasOverride && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-status-amber/20 text-status-amber border border-status-amber/30">
                                Custom Rate
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-ink tabular-nums">
                              {formatCurrency(rates.base_rate)}
                              <span className="text-[10px] font-normal text-ink-muted"> /nt</span>
                            </p>
                            {rates.weekend_rate && (
                              <p className="text-[10px] text-brand-forest font-medium tabular-nums">
                                Wknd: {formatCurrency(rates.weekend_rate)}
                              </p>
                            )}
                          </div>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => setEditingRoomOverride(room)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-brand-forest hover:bg-brand-forest hover:text-white rounded border border-brand-forest/30 transition-colors cursor-pointer"
                              title="Set room-specific price override"
                            >
                              Tariff
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Special Second Floor Facility: Restaurant */}
                  {floor === 3 && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-status-amber/40 bg-status-amber/5 flex flex-col justify-between space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-status-amber/20 text-status-amber rounded-lg">
                            <Utensils className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-serif font-bold text-sm text-ink">
                              Hotel Restaurant
                            </h5>
                            <span className="text-[10px] font-semibold text-status-amber uppercase tracking-wider">
                              Property Dining Facility
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-muted leading-tight">
                        Located on 2nd Floor. Non-accommodation unit (not counted in 19 bedrooms).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Separate Banquet Hall Facility */}
          <div className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-forest text-white rounded-xl">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-forest uppercase tracking-wider bg-brand-forest/10 px-2 py-0.5 rounded">
                      NON-ACCOMMODATION FACILITY
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-ink mt-0.5">
                    Grand Banquet &amp; Event Hall
                  </h4>
                </div>
              </div>

              <span className="px-3 py-1 bg-status-green/10 text-status-green rounded-full text-xs font-semibold">
                Available for Bookings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-ink-muted">
              <div className="space-y-1">
                <p className="font-semibold text-ink">Resource Configuration</p>
                <p>Capacity: Up to 200 Guests</p>
                <p>Features: Integrated AV, Stage, Buffet Kitchen, Private Restrooms</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-ink">Standard Tariff</p>
                <p className="font-bold text-brand-forest text-sm">
                  {formatCurrency(35000)} <span className="text-xs font-normal text-ink-muted">/ Full Day</span>
                </p>
                <p>Half-day rate: {formatCurrency(5000)} / hr</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-ink">Operational Note</p>
                <p>Managed independently from bedroom reservations. Does not alter the 19 room count.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL 1: EDIT / CREATE CATEGORY
       * ---------------------------------------------------- */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 md:p-6 bg-brand-sand border-b border-border-subtle flex items-center justify-between shrink-0">
              <h2 className="text-h2 text-brand-forest font-serif font-bold">
                {isCreatingNew ? 'Add New Room Category' : `Edit Category: ${editingCategory.name}`}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-action-danger/10 border border-action-danger/30 rounded-lg text-xs text-action-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="cat_name">
                  Category Name *
                </label>
                <input
                  id="cat_name"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCategory.name}
                  placeholder="e.g. Premium Room"
                  className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="cat_desc">
                  Description
                </label>
                <textarea
                  id="cat_desc"
                  name="description"
                  rows={2}
                  defaultValue={editingCategory.description || ''}
                  placeholder="Features, bed size, view, etc."
                  className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="cat_base_rate">
                    Weekday Rate (₹/night) *
                  </label>
                  <input
                    id="cat_base_rate"
                    name="base_rate"
                    type="number"
                    min="0"
                    required
                    defaultValue={editingCategory.base_rate}
                    className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="cat_weekend_rate">
                    Weekend Rate (₹/night)
                  </label>
                  <input
                    id="cat_weekend_rate"
                    name="weekend_rate"
                    type="number"
                    min="0"
                    defaultValue={editingCategory.weekend_rate || ''}
                    placeholder="Leave blank for same"
                    className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="cat_max_occupancy">
                    Max Occupancy (Guests) *
                  </label>
                  <input
                    id="cat_max_occupancy"
                    name="max_occupancy"
                    type="number"
                    min="1"
                    max="10"
                    required
                    defaultValue={editingCategory.max_occupancy}
                    className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="cat_extra_bed_rate">
                    Extra Bed Rate (₹)
                  </label>
                  <input
                    id="cat_extra_bed_rate"
                    name="extra_bed_rate"
                    type="number"
                    min="0"
                    defaultValue={editingCategory.extra_bed_rate || 0}
                    className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-border-subtle text-ink-muted hover:bg-brand-sand text-sm font-medium transition-colors cursor-pointer min-h-touch text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-medium transition-colors cursor-pointer min-h-touch flex items-center justify-center gap-2 shadow-xs"
                >
                  {isSubmitting ? <span>Saving...</span> : <span>Save Category</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
       * MODAL 2: ROOM-SPECIFIC PRICE OVERRIDE
       * ---------------------------------------------------- */}
      {editingRoomOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 md:p-6 bg-brand-sand border-b border-border-subtle flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-h2 text-brand-forest font-serif font-bold">
                  Custom Tariff Override
                </h2>
                <p className="text-xs text-ink-muted">
                  {editingRoomOverride.room_number === 'FAMILY-APT'
                    ? 'Family Apartment'
                    : `Room ${editingRoomOverride.room_number}`} ({editingRoomOverride.category.name})
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-action-danger/10 border border-action-danger/30 rounded-lg text-xs text-action-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoomOverride} className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-brand-sand/50 rounded-xl border border-border-subtle text-xs space-y-1 text-ink-muted">
                <div className="flex justify-between">
                  <span>Category Default Weekday:</span>
                  <span className="font-semibold text-ink">{formatCurrency(editingRoomOverride.category.base_rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category Default Weekend:</span>
                  <span className="font-semibold text-ink">
                    {editingRoomOverride.category.weekend_rate ? formatCurrency(editingRoomOverride.category.weekend_rate) : 'Same as weekday'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="room_base_override">
                  Room Weekday Override (₹)
                </label>
                <input
                  id="room_base_override"
                  name="base_rate_override"
                  type="number"
                  min="0"
                  defaultValue={editingRoomOverride.base_rate_override || ''}
                  placeholder={`Leave blank to use ₹${editingRoomOverride.category.base_rate}`}
                  className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="room_weekend_override">
                  Room Weekend Override (₹)
                </label>
                <input
                  id="room_weekend_override"
                  name="weekend_rate_override"
                  type="number"
                  min="0"
                  defaultValue={editingRoomOverride.weekend_rate_override || ''}
                  placeholder="Leave blank for category default"
                  className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                />
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-border-subtle text-ink-muted hover:bg-brand-sand text-sm font-medium transition-colors cursor-pointer min-h-touch text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-medium transition-colors cursor-pointer min-h-touch flex items-center justify-center gap-2 shadow-xs"
                >
                  {isSubmitting ? <span>Saving...</span> : <span>Save Override</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
