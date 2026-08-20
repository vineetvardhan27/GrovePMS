'use client';

import { useState } from 'react';
import { BanquetHall } from '../../lib/banquet/types';
import { BanquetEventType, TaxTreatment } from '../../lib/types/database.types';
import { createBanquetBookingAction } from '../../lib/banquet/actions';
import {
  X,
  PartyPopper,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  AlertCircle,
  FileText,
  Utensils,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface BookEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  hall: BanquetHall;
  onSuccess?: () => void;
}

const EVENT_TYPES: { id: BanquetEventType; label: string }[] = [
  { id: 'reception', label: 'Wedding Reception' },
  { id: 'wedding', label: 'Wedding Ceremony' },
  { id: 'conference', label: 'Corporate Conference / Summit' },
  { id: 'corporate', label: 'Corporate Gala / Meeting' },
  { id: 'birthday', label: 'Birthday Celebration' },
  { id: 'anniversary', label: 'Anniversary Celebration' },
  { id: 'social', label: 'Social Gathering / Family Function' },
  { id: 'other', label: 'Other Special Event' },
];

export default function BookEventModal({
  isOpen,
  onClose,
  hall,
  onSuccess,
}: BookEventModalProps) {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [eventName, setEventName] = useState<string>('');
  const [eventType, setEventType] = useState<BanquetEventType>('reception');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(tomorrowStr);
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('23:30');
  const [guestCount, setGuestCount] = useState<string>('');
  const [rentalAmount, setRentalAmount] = useState<string>(String(hall.full_day_rate || 35000));
  const [cateringRequired, setCateringRequired] = useState<boolean>(false);
  const [cateringNotes, setCateringNotes] = useState<string>('');
  const [estimatedTotal, setEstimatedTotal] = useState<string>(String(hall.full_day_rate || 35000));
  const [advancePaid, setAdvancePaid] = useState<string>('10000');
  const [taxTreatment, setTaxTreatment] = useState<TaxTreatment>('gst');
  const [remarks, setRemarks] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!eventName.trim()) {
      setErrorMessage('Event title/name is required.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Customer / Host name is required.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Customer contact phone is required.');
      return;
    }

    if (!eventDate) {
      setErrorMessage('Event date is required.');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMessage('Start time and end time are required.');
      return;
    }

    const gCount = guestCount.trim() ? parseInt(guestCount, 10) : null;
    const rental = parseFloat(rentalAmount) || 0;
    const total = parseFloat(estimatedTotal) || rental;
    const advance = parseFloat(advancePaid) || 0;

    setIsSubmitting(true);
    try {
      const res = await createBanquetBookingAction({
        event_name: eventName.trim(),
        event_type: eventType,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        guest_count: gCount,
        rental_amount: rental,
        catering_required: cateringRequired,
        catering_notes: cateringRequired ? cateringNotes.trim() : undefined,
        estimated_total: total,
        advance_paid: advance,
        tax_treatment: taxTreatment,
        remarks: remarks.trim() || undefined,
        booking_status: 'confirmed',
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to book banquet event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-border-subtle animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-brand-forest text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <PartyPopper className="w-5 h-5 text-brand-sand-light" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Book Banquet Event</h3>
              <p className="text-xs text-brand-sand-light">
                {hall.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-action-danger/10 border border-action-danger/25 text-action-danger rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Event Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Event Name / Title *
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Vikram &amp; Ananya Wedding Reception"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Event Type *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as BanquetEventType)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-subtle bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                required
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer / Host Details */}
          <div className="p-3.5 bg-brand-sand/40 rounded-xl border border-border-subtle space-y-2.5">
            <span className="text-[11px] font-bold text-brand-forest block uppercase tracking-wider">
              Host / Client Contact Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-ink mb-1">
                  Customer / Host Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikramaditya Roy"
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-ink text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 11223"
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-ink text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-ink text-xs"
                />
              </div>
            </div>
          </div>

          {/* Date, Time Slots & Guests */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Event Date *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Guest Count
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="e.g. 180"
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs font-mono"
              />
            </div>
          </div>

          {/* Future Billing & Payment Compatibility */}
          <div className="p-3.5 bg-brand-sand/40 rounded-xl border border-border-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-brand-forest uppercase tracking-wider">
                Financials &amp; Advance Payment
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium text-ink">Tax Treatment:</label>
                <select
                  value={taxTreatment}
                  onChange={(e) => setTaxTreatment(e.target.value as TaxTreatment)}
                  className="px-2 py-0.5 rounded border border-border-subtle bg-white text-ink text-[11px]"
                >
                  <option value="gst">GST (18% / Standard)</option>
                  <option value="non_gst">Non-GST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-ink mb-1">
                  Hall Rental Rate (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={rentalAmount}
                  onChange={(e) => {
                    setRentalAmount(e.target.value);
                    setEstimatedTotal(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink mb-1">
                  Est. Total Folio (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={estimatedTotal}
                  onChange={(e) => setEstimatedTotal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-status-green mb-1">
                  Advance Deposit Paid (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-ink text-xs font-mono font-bold text-status-green"
                />
              </div>
            </div>
          </div>

          {/* Catering & Food Requirement */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqCatering"
                checked={cateringRequired}
                onChange={(e) => setCateringRequired(e.target.checked)}
                className="w-4 h-4 rounded text-brand-forest focus:ring-brand-forest border-border-subtle cursor-pointer"
              />
              <label htmlFor="reqCatering" className="text-xs font-semibold text-ink cursor-pointer flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-brand-forest" />
                <span>Hotel Food &amp; Catering Required</span>
              </label>
            </div>

            {cateringRequired && (
              <input
                type="text"
                value={cateringNotes}
                onChange={(e) => setCateringNotes(e.target.value)}
                placeholder="e.g. North Indian & South Indian buffet, High Tea at 16:30"
                className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-ink text-xs"
              />
            )}
          </div>

          {/* Remarks & Special Setup Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Special Setup, Stage &amp; Audio/Visual Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Stage flower decoration, projector and 2 cordless collar mics required"
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
              <PartyPopper className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Booking...' : 'Confirm Banquet Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
