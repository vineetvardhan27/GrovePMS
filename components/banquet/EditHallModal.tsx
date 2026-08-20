'use client';

import { useState } from 'react';
import { BanquetHall } from '../../lib/banquet/types';
import { BanquetHallStatus } from '../../lib/types/database.types';
import { saveBanquetHallAction } from '../../lib/banquet/actions';
import { X, Building2, Save, AlertCircle, Sparkles } from 'lucide-react';

interface EditHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  hall: BanquetHall;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: { id: BanquetHallStatus; label: string; desc: string }[] = [
  { id: 'available', label: 'Available', desc: 'Ready for new event bookings & inquiries' },
  { id: 'reserved', label: 'Reserved', desc: 'Booked for an upcoming event' },
  { id: 'occupied', label: 'Occupied / In Event', desc: 'Active event currently in progress' },
  { id: 'maintenance', label: 'Maintenance / Unavailable', desc: 'Under renovation or deep cleaning' },
];

export default function EditHallModal({
  isOpen,
  onClose,
  hall,
  onSuccess,
}: EditHallModalProps) {
  const [name, setName] = useState<string>(hall.name);
  const [capacity, setCapacity] = useState<string>(
    hall.capacity !== null && hall.capacity !== undefined ? String(hall.capacity) : ''
  );
  const [status, setStatus] = useState<BanquetHallStatus>(hall.current_status);
  const [halfDayRate, setHalfDayRate] = useState<string>(String(hall.half_day_rate || 18000));
  const [fullDayRate, setFullDayRate] = useState<string>(String(hall.full_day_rate || 35000));
  const [description, setDescription] = useState<string>(hall.description || '');
  const [notes, setNotes] = useState<string>(hall.notes || '');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Banquet hall name is required.');
      return;
    }

    const cap = capacity.trim() ? parseInt(capacity, 10) : null;
    const half = parseFloat(halfDayRate) || 0;
    const full = parseFloat(fullDayRate) || 0;

    setIsSubmitting(true);
    try {
      const res = await saveBanquetHallAction({
        id: hall.id,
        name: name.trim(),
        capacity: cap,
        current_status: status,
        half_day_rate: half,
        full_day_rate: full,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        amenities: hall.amenities,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update banquet hall settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-subtle animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-brand-sand/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-forest/10 text-brand-forest rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-forest">
                Banquet Hall Configuration
              </h3>
              <p className="text-xs text-ink-muted">Configure operational status, capacity, and standard rates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-action-danger/10 border border-action-danger/25 text-action-danger rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hall Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Banquet Hall Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Grand Greenery Banquet &amp; Convention Hall"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
              required
            />
          </div>

          {/* Configurable Capacity & Operational Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Capacity (Configurable)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Unset (e.g. 250)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
              />
              <span className="text-[11px] text-ink-muted block mt-1">
                Leave empty if unconfirmed by hotel
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Current Operational Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BanquetHallStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Standard Rental Tariffs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Half-Day Rental Rate (₹)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={halfDayRate}
                onChange={(e) => setHalfDayRate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Full-Day Rental Rate (₹)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={fullDayRate}
                onChange={(e) => setFullDayRate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Description / Features
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hall features, audio/visual capabilities, stage details..."
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Internal Operating Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sound curfew at 23:00 per local regulations"
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-subtle text-ink font-medium text-xs hover:bg-brand-sand transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-forest-light text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
