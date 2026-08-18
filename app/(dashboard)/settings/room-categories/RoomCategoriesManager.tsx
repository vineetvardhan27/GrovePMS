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
} from 'lucide-react';
import { RoomCategory } from '../../../../lib/rooms/queries';
import { saveRoomCategoryAction } from '../../../../lib/rooms/actions';
import { formatCurrency } from '../../../../lib/utils/currency';
import { StaffRole } from '../../../../lib/types/database.types';

interface RoomCategoriesManagerProps {
  initialCategories: RoomCategory[];
  userRole: StaffRole;
}

export default function RoomCategoriesManager({
  initialCategories,
  userRole,
}: RoomCategoriesManagerProps) {
  const [categories, setCategories] = useState<RoomCategory[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const canEdit = userRole === 'owner' || userRole === 'manager';

  const handleOpenEdit = (category: RoomCategory) => {
    setEditingCategory(category);
    setIsCreatingNew(false);
  };

  const handleOpenCreate = () => {
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
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setIsCreatingNew(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const base_rate = Number(formData.get('base_rate'));
      const weekend_rate = formData.get('weekend_rate') ? Number(formData.get('weekend_rate')) : null;
      const max_occupancy = Number(formData.get('max_occupancy')) || 2;
      const extra_bed_rate = formData.get('extra_bed_rate') ? Number(formData.get('extra_bed_rate')) : null;

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
          setSuccessNotice(`Category "${result.category.name}" updated successfully.`);
        }
      }

      handleCloseModal();
      setTimeout(() => setSuccessNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 bg-status-green/10 border border-status-green/30 rounded-xl flex items-center justify-between text-status-green text-sm font-medium">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button type="button" onClick={() => setSuccessNotice(null)}>
            <X className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          Categories define rates, guest capacity, and room pricing across the PMS.
        </p>

        {canEdit && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-brand-forest hover:bg-brand-forest-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-touch"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Categories Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl border border-border-subtle p-5 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-brand-sand rounded-xl text-brand-forest">
                  <BedDouble className="w-6 h-6" />
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(category)}
                    className="p-2 rounded-lg text-ink-muted hover:text-brand-forest hover:bg-brand-sand transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-h2 text-ink font-bold">{category.name}</h3>
                <p className="text-caption text-ink-muted mt-1 line-clamp-2">
                  {category.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Base Rate (Weekday):</span>
                <span className="font-bold text-ink text-sm tabular-nums">
                  {formatCurrency(category.base_rate)} / night
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Weekend Rate:</span>
                <span className="font-semibold text-ink tabular-nums">
                  {category.weekend_rate ? formatCurrency(category.weekend_rate) : 'Same as base'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Max Occupancy:</span>
                <span className="font-medium text-ink flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-ink-muted" />
                  {category.max_occupancy} Guests
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Extra Bed Rate:</span>
                <span className="font-medium text-ink tabular-nums">
                  {category.extra_bed_rate ? formatCurrency(category.extra_bed_rate) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
            <div className="p-6 bg-brand-sand border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-h2 text-brand-forest">
                {isCreatingNew ? 'Add New Room Category' : `Edit Category: ${editingCategory.name}`}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="name">
                  Category Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCategory.name}
                  placeholder="e.g. Executive Suite"
                  className="w-full px-3.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={editingCategory.description || ''}
                  placeholder="Room features, bed size, view, etc."
                  className="w-full px-3.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="base_rate">
                    Base Rate (₹/night) *
                  </label>
                  <input
                    id="base_rate"
                    name="base_rate"
                    type="number"
                    min="0"
                    required
                    defaultValue={editingCategory.base_rate}
                    className="w-full px-3.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="weekend_rate">
                    Weekend Rate (₹/night)
                  </label>
                  <input
                    id="weekend_rate"
                    name="weekend_rate"
                    type="number"
                    min="0"
                    defaultValue={editingCategory.weekend_rate || ''}
                    placeholder="Leave blank for same"
                    className="w-full px-3.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="max_occupancy">
                    Max Occupancy (Guests) *
                  </label>
                  <input
                    id="max_occupancy"
                    name="max_occupancy"
                    type="number"
                    min="1"
                    max="10"
                    required
                    defaultValue={editingCategory.max_occupancy}
                    className="w-full px-3.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="extra_bed_rate">
                    Extra Bed Rate (₹)
                  </label>
                  <input
                    id="extra_bed_rate"
                    name="extra_bed_rate"
                    type="number"
                    min="0"
                    defaultValue={editingCategory.extra_bed_rate || 0}
                    className="w-full px-3.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-lg border border-border-subtle text-ink-muted hover:bg-brand-sand text-sm font-medium transition-colors cursor-pointer min-h-touch"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-medium transition-colors cursor-pointer min-h-touch flex items-center gap-2"
                >
                  {isSubmitting ? <span>Saving...</span> : <span>Save Category</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
