'use client';

import { useState, useEffect } from 'react';
import { BanquetHall } from '../../lib/banquet/types';
import { BanquetHallStatus } from '../../lib/types/database.types';
import { saveBanquetHallAction } from '../../lib/banquet/actions';
import { X, Building2, Save, AlertCircle, Loader2 } from 'lucide-react';

interface EditHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  hall: BanquetHall;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: { id: BanquetHallStatus; label: string; desc: string }[] = [
  { id: 'available',   label: 'Available',                  desc: 'Ready for new event bookings & inquiries' },
  { id: 'reserved',    label: 'Reserved',                   desc: 'Booked for an upcoming event' },
  { id: 'occupied',    label: 'Occupied / In Event',        desc: 'Active event currently in progress' },
  { id: 'maintenance', label: 'Maintenance / Unavailable',  desc: 'Under renovation or deep cleaning' },
];

export default function EditHallModal({
  isOpen,
  onClose,
  hall,
  onSuccess,
}: EditHallModalProps) {
  const [name,        setName]        = useState<string>(hall.name);
  const [capacity,    setCapacity]    = useState<string>(
    hall.capacity !== null && hall.capacity !== undefined ? String(hall.capacity) : ''
  );
  const [status,      setStatus]      = useState<BanquetHallStatus>(hall.current_status);
  const [halfDayRate, setHalfDayRate] = useState<string>(String(hall.half_day_rate || 18000));
  const [fullDayRate, setFullDayRate] = useState<string>(String(hall.full_day_rate || 35000));
  const [description, setDescription] = useState<string>(hall.description || '');
  const [notes,       setNotes]       = useState<string>(hall.notes || '');

  const [isSubmitting,  setIsSubmitting]  = useState<boolean>(false);
  const [errorMessage,  setErrorMessage]  = useState<string | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Banquet hall name is required.');
      return;
    }

    const cap  = capacity.trim() ? parseInt(capacity, 10) : null;
    const half = parseFloat(halfDayRate) || 0;
    const full = parseFloat(fullDayRate) || 0;

    setIsSubmitting(true);
    try {
      const res = await saveBanquetHallAction({
        id:             hall.id,
        name:           name.trim(),
        capacity:       cap,
        current_status: status,
        half_day_rate:  half,
        full_day_rate:  full,
        description:    description.trim() || undefined,
        notes:          notes.trim() || undefined,
        amenities:      hall.amenities,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-hall-modal-title"
    >
      {/* Backdrop dismiss */}
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-modal border border-border-subtle animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-brand-sand/50 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-brand-forest/10 text-brand-forest rounded-xl shrink-0">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 id="edit-hall-modal-title" className="font-serif font-bold text-base text-brand-forest leading-tight">
                Banquet Hall Configuration
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Configure operational status, capacity, and standard rates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable form body ── */}
        <div className="overflow-y-auto flex-1">
          <form id="edit-hall-form" onSubmit={handleSubmit} noValidate>
            <div className="p-5 space-y-4">

              {/* Error banner */}
              {errorMessage && (
                <div
                  className="p-3 bg-action-danger/10 border border-action-danger/25 text-action-danger rounded-lg text-sm flex items-center gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Hall Name */}
              <div>
                <label htmlFor="eh-name" className="pms-label">
                  Banquet Hall Name <span className="text-action-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="eh-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Grand Greenery Banquet & Convention Hall"
                  className="pms-input"
                  required
                  autoFocus
                />
              </div>

              {/* Capacity & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="eh-capacity" className="pms-label">
                    Capacity (guests)
                  </label>
                  <input
                    id="eh-capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 250"
                    className="pms-input font-mono"
                  />
                  <p className="text-[11px] text-ink-muted mt-1">Leave empty if unconfirmed</p>
                </div>

                <div>
                  <label htmlFor="eh-status" className="pms-label">
                    Operational Status <span className="text-action-danger" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="eh-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BanquetHallStatus)}
                    className="pms-select w-full"
                    required
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rental Tariffs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="eh-half-day" className="pms-label">
                    Half-Day Rate (₹)
                  </label>
                  <input
                    id="eh-half-day"
                    type="number"
                    min="0"
                    step="100"
                    value={halfDayRate}
                    onChange={(e) => setHalfDayRate(e.target.value)}
                    className="pms-input font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="eh-full-day" className="pms-label">
                    Full-Day Rate (₹)
                  </label>
                  <input
                    id="eh-full-day"
                    type="number"
                    min="0"
                    step="100"
                    value={fullDayRate}
                    onChange={(e) => setFullDayRate(e.target.value)}
                    className="pms-input font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="eh-description" className="pms-label">
                  Description / Features
                </label>
                <textarea
                  id="eh-description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hall features, audio/visual capabilities, stage details..."
                  className="pms-input h-auto py-2 resize-none leading-relaxed"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label htmlFor="eh-notes" className="pms-label">
                  Internal Operating Notes
                </label>
                <input
                  id="eh-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sound curfew at 23:00 per local regulations"
                  className="pms-input"
                />
              </div>

            </div>
          </form>
        </div>

        {/* ── Sticky footer (always visible) ── */}
        <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="pms-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-hall-form"
            disabled={isSubmitting}
            className="pms-btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
