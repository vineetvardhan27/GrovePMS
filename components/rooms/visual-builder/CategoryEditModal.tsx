'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Percent,
  Plus,
  Trash2,
  BedDouble,
  Users,
  Sparkles,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { BuilderCategory, AMENITIES_CATALOG } from './types';

interface CategoryEditModalProps {
  isOpen: boolean;
  category: BuilderCategory | null;
  onSave: (updatedCategory: BuilderCategory) => void;
  onClose: () => void;
}

export default function CategoryEditModal({
  isOpen,
  category,
  onSave,
  onClose,
}: CategoryEditModalProps) {
  const [formData, setFormData] = useState<BuilderCategory | null>(category);
  const [customAmenity, setCustomAmenity] = useState('');

  useEffect(() => {
    setFormData(category);
  }, [category]);

  if (!isOpen || !formData) return null;

  // Auto-calculate weekend rate based on base rate and adjustment
  const calculateWeekendRate = (
    baseRate: number,
    adjType: 'fixed' | 'percent',
    adjVal: number
  ): number => {
    if (adjType === 'fixed') {
      return Math.max(0, baseRate + adjVal);
    }
    return Math.round(baseRate * (1 + adjVal / 100));
  };

  const handleBaseRateChange = (newBaseRate: number) => {
    const rate = Math.max(0, newBaseRate);
    const weekendRate = calculateWeekendRate(
      rate,
      formData.weekend_adjustment_type,
      formData.weekend_adjustment_val
    );
    setFormData({
      ...formData,
      base_rate: rate,
      weekend_rate: weekendRate,
    });
  };

  const handleWeekendAdjustmentChange = (
    adjType: 'fixed' | 'percent',
    adjVal: number
  ) => {
    const weekendRate = calculateWeekendRate(formData.base_rate, adjType, adjVal);
    setFormData({
      ...formData,
      weekend_adjustment_type: adjType,
      weekend_adjustment_val: adjVal,
      weekend_rate: weekendRate,
    });
  };

  const toggleAmenity = (amenity: string) => {
    const exists = formData.amenities.includes(amenity);
    const updated = exists
      ? formData.amenities.filter((a) => a !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities: updated });
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData({ ...formData, amenities: [...formData.amenities, trimmed] });
      setCustomAmenity('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-border-subtle overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-forest text-white flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-black">
                {category?.id.startsWith('new-') ? 'Create Room Category' : 'Edit Room Category'}
              </h3>
              <p className="text-xs text-ink-muted">
                Centralized tariff, occupancy parameters, and room amenities
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-ink-muted hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Category Identity */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Deluxe Room or Executive Suite"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Card Accent Color
                </label>
                <select
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      color: e.target.value as BuilderCategory['color'],
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20"
                >
                  <option value="forest">Forest Green</option>
                  <option value="emerald">Emerald</option>
                  <option value="amber">Warm Amber</option>
                  <option value="indigo">Indigo</option>
                  <option value="rose">Rose</option>
                  <option value="slate">Neutral Slate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-black">
                Short Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Spacious guest room with scenic mountain views and king-size bedding."
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-border-subtle rounded-xl text-black text-xs placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-forest/20"
              />
            </div>
          </div>

          {/* Rate Configuration Section */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-border-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/80">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-forest" />
                <span>Rate &amp; Tariff Configuration</span>
              </span>
              <span className="text-[11px] text-brand-forest font-semibold">
                Central Source of Truth
              </span>
            </div>

            {/* Base Nightly Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Base Nightly Tariff (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted font-serif font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    required
                    value={formData.base_rate}
                    onChange={(e) => handleBaseRateChange(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 bg-white border border-border-subtle rounded-xl text-black text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-forest/20"
                  />
                </div>
              </div>

              {/* Weekend Rate Adjustment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-black">
                    Weekend Rate
                  </label>
                  <span className="text-xs font-bold text-emerald-800 font-serif">
                    = ₹{formData.weekend_rate || formData.base_rate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.weekend_adjustment_type}
                    onChange={(e) =>
                      handleWeekendAdjustmentChange(
                        e.target.value as 'fixed' | 'percent',
                        formData.weekend_adjustment_val
                      )
                    }
                    className="px-2.5 py-2 bg-white border border-border-subtle rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="fixed">Fixed (+₹)</option>
                    <option value="percent">Percentage (+%)</option>
                  </select>
                  <input
                    type="number"
                    value={formData.weekend_adjustment_val}
                    onChange={(e) =>
                      handleWeekendAdjustmentChange(
                        formData.weekend_adjustment_type,
                        Number(e.target.value)
                      )
                    }
                    placeholder={formData.weekend_adjustment_type === 'fixed' ? '+500' : '+15%'}
                    className="flex-1 px-3 py-2 bg-white border border-border-subtle rounded-xl text-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20"
                  />
                </div>
              </div>
            </div>

            {/* Extra Guest & Child Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-black">
                  Extra Adult / Bed Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.extra_bed_rate}
                    onChange={(e) => setFormData({ ...formData, extra_bed_rate: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-border-subtle rounded-xl text-black text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-black">
                  Child Extra Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.child_charge}
                    onChange={(e) => setFormData({ ...formData, child_charge: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-border-subtle rounded-xl text-black text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy & Bedding Configuration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-black">Max Occupancy</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.max_occupancy}
                onChange={(e) => setFormData({ ...formData, max_occupancy: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-xs font-medium text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-black">Adults</label>
              <input
                type="number"
                min={1}
                max={8}
                value={formData.adult_capacity}
                onChange={(e) => setFormData({ ...formData, adult_capacity: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-xs font-medium text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-black">Children</label>
              <input
                type="number"
                min={0}
                max={4}
                value={formData.child_capacity}
                onChange={(e) => setFormData({ ...formData, child_capacity: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-xs font-medium text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-black">Bed Type</label>
              <select
                value={formData.bed_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bed_type: e.target.value as BuilderCategory['bed_type'],
                  })
                }
                className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-xs font-medium text-center"
              >
                <option value="King">King Bed</option>
                <option value="Queen">Queen Bed</option>
                <option value="Twin">Twin Beds</option>
                <option value="Double">Double Bed</option>
                <option value="Single">Single Bed</option>
              </select>
            </div>
          </div>

          {/* Room Amenities Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-black">
                Category Amenities ({formData.amenities.length})
              </label>
              <span className="text-[11px] text-ink-muted">Tap to toggle</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#FAF8F5] rounded-2xl border border-border-subtle">
              {AMENITIES_CATALOG.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-forest text-white border-brand-forest shadow-2xs'
                        : 'bg-white text-ink border-border-subtle hover:bg-brand-sand/60'
                    }`}
                  >
                    <span>{amenity}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-300" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Amenity Adder */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenity();
                  }
                }}
                placeholder="Add custom amenity..."
                className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-border-subtle rounded-xl text-xs text-black placeholder:text-ink-muted/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-3 py-1.5 bg-brand-forest text-white rounded-xl text-xs font-semibold hover:bg-brand-forest-light transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-subtle bg-white hover:bg-brand-sand text-xs font-semibold text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-semibold shadow-xs transition-all"
            >
              Save Room Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

