'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BanquetHall, BanquetChargeCategory } from '../../lib/banquet/types';
import { BanquetEventType, TaxTreatment, PaymentMode } from '../../lib/types/database.types';
import { createBanquetBookingAction } from '../../lib/banquet/actions';
import { formatCurrency } from '../../lib/utils/currency';
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
  Utensils,
  CreditCard,
  Loader2,
  MapPin,
  FileText,
  Sparkles,
  Plus,
  Tv,
  Zap,
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

const PAYMENT_MODES: { id: PaymentMode; label: string }[] = [
  { id: 'upi', label: 'UPI / GPay / QR' },
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'other', label: 'Other' },
];

export default function BookEventModal({
  isOpen,
  onClose,
  hall,
  onSuccess,
}: BookEventModalProps) {
  const router = useRouter();
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // 1. Event Info
  const [eventName, setEventName] = useState<string>('');
  const [eventType, setEventType] = useState<BanquetEventType>('reception');
  const [eventDate, setEventDate] = useState<string>(tomorrowStr);
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('23:30');
  const [guestCount, setGuestCount] = useState<string>('');

  // 2. Customer Info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerGstin, setCustomerGstin] = useState<string>('');

  // 3. Hall Rental & Financials
  const [rentalAmount, setRentalAmount] = useState<string>(String(hall.full_day_rate || 35000));
  const [taxTreatment, setTaxTreatment] = useState<TaxTreatment>('gst');
  const [advancePaid, setAdvancePaid] = useState<string>('10000');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [paymentRef, setPaymentRef] = useState<string>('');

  // 4. Initial Add-on Services (Optional)
  const [addCatering, setAddCatering] = useState<boolean>(false);
  const [cateringRate, setCateringRate] = useState<string>('350');
  const [cateringNotes, setCateringNotes] = useState<string>('');

  const [addDecor, setAddDecor] = useState<boolean>(false);
  const [decorAmount, setDecorAmount] = useState<string>('15000');

  const [addAv, setAddAv] = useState<boolean>(false);
  const [avAmount, setAvAmount] = useState<string>('5000');

  const [remarks, setRemarks] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Folio Calculation
  const rentalNum = parseFloat(rentalAmount) || 0;
  const guestNum = parseInt(guestCount, 10) || 0;
  const cateringCost = addCatering ? guestNum * (parseFloat(cateringRate) || 0) : 0;
  const decorCost = addDecor ? parseFloat(decorAmount) || 0 : 0;
  const avCost = addAv ? parseFloat(avAmount) || 0 : 0;

  const subtotal = rentalNum + cateringCost + decorCost + avCost;
  const isGst = taxTreatment === 'gst';
  const taxAmount = isGst ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
  const grandTotal = subtotal + taxAmount;
  const advanceNum = parseFloat(advancePaid) || 0;
  const balanceDue = Math.max(0, grandTotal - advanceNum);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!eventName.trim()) {
      setErrorMessage('Event title / name is required.');
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

    const initialCharges: {
      category: BanquetChargeCategory;
      description: string;
      quantity: number;
      unit_price: number;
    }[] = [];

    if (addCatering && guestNum > 0) {
      initialCharges.push({
        category: 'catering',
        description: `Buffet Catering Service (${guestNum} pax × ₹${cateringRate})`,
        quantity: guestNum,
        unit_price: parseFloat(cateringRate) || 0,
      });
    }

    if (addDecor && decorCost > 0) {
      initialCharges.push({
        category: 'decoration',
        description: 'Stage Floral Decoration & Event Ambience Package',
        quantity: 1,
        unit_price: decorCost,
      });
    }

    if (addAv && avCost > 0) {
      initialCharges.push({
        category: 'audio_visual',
        description: 'HD AV Projector, High-Gain Screen & Collar Microphones',
        quantity: 1,
        unit_price: avCost,
      });
    }

    setIsSubmitting(true);
    try {
      const res = await createBanquetBookingAction({
        event_name: eventName.trim(),
        event_type: eventType,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        customer_address: customerAddress.trim() || undefined,
        customer_gstin: customerGstin.trim() || undefined,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        guest_count: guestNum > 0 ? guestNum : null,
        rental_amount: rentalNum,
        catering_required: addCatering,
        catering_notes: addCatering ? cateringNotes.trim() : undefined,
        estimated_total: grandTotal,
        advance_paid: advanceNum,
        payment_mode: paymentMode,
        payment_reference: paymentRef.trim() || undefined,
        tax_treatment: taxTreatment,
        remarks: remarks.trim() || undefined,
        booking_status: 'confirmed',
        initial_charges: initialCharges,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
      if (onSuccess) onSuccess();
      if (res.booking?.id) {
        router.push(`/banquet/${res.booking.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to book banquet event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-event-modal-title"
    >
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-modal border border-border-subtle animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-brand-forest text-white shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <PartyPopper className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 id="book-event-modal-title" className="font-serif font-bold text-base text-white leading-tight">
                Book Banquet Event
              </h3>
              <p className="text-xs text-white/70 truncate mt-0.5">{hall.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1">
          <form id="book-event-form" onSubmit={handleSubmit} noValidate>
            <div className="p-5 space-y-5">
              {errorMessage && (
                <div
                  className="p-3 bg-action-danger/10 border border-action-danger/25 text-action-danger rounded-lg text-sm flex items-center gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ── Section 1: Event Particulars ── */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-brand-forest uppercase tracking-wider">
                  1. Event Particulars
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="be-event-name" className="pms-label">
                      Event Name / Title <span className="text-action-danger">*</span>
                    </label>
                    <input
                      id="be-event-name"
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g. Vikram & Ananya Wedding Reception"
                      className="pms-input"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="be-event-type" className="pms-label">
                      Event Type <span className="text-action-danger">*</span>
                    </label>
                    <select
                      id="be-event-type"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as BanquetEventType)}
                      className="pms-select w-full"
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="be-event-date" className="pms-label">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Date <span className="text-action-danger">*</span>
                    </label>
                    <input
                      id="be-event-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="pms-input font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="be-start-time" className="pms-label">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Start <span className="text-action-danger">*</span>
                    </label>
                    <input
                      id="be-start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pms-input font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="be-end-time" className="pms-label">
                      <Clock className="w-3 h-3 inline mr-1" />
                      End <span className="text-action-danger">*</span>
                    </label>
                    <input
                      id="be-end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pms-input font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="be-guest-count" className="pms-label">
                      <Users className="w-3 h-3 inline mr-1" />
                      Guests (Pax)
                    </label>
                    <input
                      id="be-guest-count"
                      type="number"
                      min="1"
                      step="1"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      placeholder="e.g. 180"
                      className="pms-input font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 2: Host / Client Info & Tax ── */}
              <div className="p-4 bg-brand-sand/40 rounded-xl border border-border-subtle space-y-3">
                <p className="text-[11px] font-bold text-brand-forest uppercase tracking-wider">
                  2. Client &amp; Billing Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="be-customer-name" className="pms-label">
                      <User className="w-3 h-3 inline mr-1" />
                      Host Name <span className="text-action-danger">*</span>
                    </label>
                    <input
                      id="be-customer-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Vikramaditya Roy"
                      className="pms-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="be-customer-phone" className="pms-label">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Contact Phone <span className="text-action-danger">*</span>
                    </label>
                    <input
                      id="be-customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +91 98765 11223"
                      className="pms-input font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="be-customer-email" className="pms-label">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      id="be-customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="pms-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="be-customer-address" className="pms-label">
                      Billing Address (Optional)
                    </label>
                    <input
                      id="be-customer-address"
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="e.g. Alipore, Kolkata, WB"
                      className="pms-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="be-customer-gstin" className="pms-label">
                      Client GSTIN (If Corporate / B2B)
                    </label>
                    <input
                      id="be-customer-gstin"
                      type="text"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value)}
                      placeholder="e.g. 19AAACP1234F1Z5"
                      className="pms-input font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 3: Initial Charges & Folio Setup ── */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-brand-forest uppercase tracking-wider">
                  3. Hall Charges &amp; Initial Folio Services
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="be-rental-amount" className="pms-label">
                      Hall Rental Rate (₹) <span className="text-action-danger">*</span>
                    </label>
                    <input
                      id="be-rental-amount"
                      type="number"
                      min="0"
                      step="100"
                      value={rentalAmount}
                      onChange={(e) => setRentalAmount(e.target.value)}
                      className="pms-input font-mono font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="be-tax-treatment" className="pms-label">
                      Tax Treatment
                    </label>
                    <select
                      id="be-tax-treatment"
                      value={taxTreatment}
                      onChange={(e) => setTaxTreatment(e.target.value as TaxTreatment)}
                      className="pms-select w-full"
                    >
                      <option value="gst">GST (18% / Standard)</option>
                      <option value="non_gst">Non-GST (0%)</option>
                    </select>
                  </div>
                </div>

                {/* Add-on services expandable options */}
                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <span className="text-[11px] font-semibold text-ink block mb-1">
                    Optional Initial Add-ons (Can also be added later in Folio):
                  </span>

                  {/* Catering */}
                  <div className="p-3 bg-white rounded-xl border border-border-subtle space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addCatering}
                        onChange={(e) => setAddCatering(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-forest focus:ring-brand-forest border-border-subtle cursor-pointer"
                      />
                      <Utensils className="w-3.5 h-3.5 text-brand-forest" />
                      <span className="text-xs font-semibold text-ink">Include Hotel Catering &amp; Dining</span>
                    </label>
                    {addCatering && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 pl-6">
                        <div>
                          <label className="text-[10px] text-ink-muted block mb-0.5">Rate per Guest (₹/pax)</label>
                          <input
                            type="number"
                            value={cateringRate}
                            onChange={(e) => setCateringRate(e.target.value)}
                            className="pms-input h-8 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-ink-muted block mb-0.5">Menu / Catering Remarks</label>
                          <input
                            type="text"
                            value={cateringNotes}
                            onChange={(e) => setCateringNotes(e.target.value)}
                            placeholder="e.g. Vegetarian buffet, high tea"
                            className="pms-input h-8 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decoration */}
                  <div className="p-3 bg-white rounded-xl border border-border-subtle flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addDecor}
                        onChange={(e) => setAddDecor(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-forest focus:ring-brand-forest border-border-subtle cursor-pointer"
                      />
                      <Sparkles className="w-3.5 h-3.5 text-brand-forest" />
                      <span className="text-xs font-semibold text-ink">Stage &amp; Floral Decoration Package</span>
                    </label>
                    {addDecor && (
                      <div className="w-36">
                        <input
                          type="number"
                          value={decorAmount}
                          onChange={(e) => setDecorAmount(e.target.value)}
                          placeholder="Rate ₹"
                          className="pms-input h-8 text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* AV & Projector */}
                  <div className="p-3 bg-white rounded-xl border border-border-subtle flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addAv}
                        onChange={(e) => setAddAv(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-forest focus:ring-brand-forest border-border-subtle cursor-pointer"
                      />
                      <Tv className="w-3.5 h-3.5 text-brand-forest" />
                      <span className="text-xs font-semibold text-ink">HD Projector, Screen &amp; Audio Mics</span>
                    </label>
                    {addAv && (
                      <div className="w-36">
                        <input
                          type="number"
                          value={avAmount}
                          onChange={(e) => setAvAmount(e.target.value)}
                          placeholder="Rate ₹"
                          className="pms-input h-8 text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Section 4: Initial Advance Payment ── */}
              <div className="p-4 bg-brand-sand/40 rounded-xl border border-border-subtle space-y-3">
                <p className="text-[11px] font-bold text-brand-forest uppercase tracking-wider">
                  4. Advance Deposit &amp; Initial Receipt
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="be-advance-paid" className="pms-label text-status-green font-semibold">
                      Advance Amount (₹)
                    </label>
                    <input
                      id="be-advance-paid"
                      type="number"
                      min="0"
                      step="100"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(e.target.value)}
                      className="pms-input font-mono font-bold text-status-green"
                    />
                  </div>
                  <div>
                    <label htmlFor="be-payment-mode" className="pms-label">
                      Payment Mode
                    </label>
                    <select
                      id="be-payment-mode"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="pms-select w-full"
                    >
                      {PAYMENT_MODES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="be-payment-ref" className="pms-label">
                      Transaction Ref / UTR
                    </label>
                    <input
                      id="be-payment-ref"
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. UPI-92348"
                      className="pms-input font-mono"
                    />
                  </div>
                </div>

                {/* Live Folio Summary Box */}
                <div className="p-3 bg-white rounded-lg border border-border-subtle space-y-1 text-xs">
                  <div className="flex justify-between text-ink-muted">
                    <span>Estimated Subtotal:</span>
                    <span className="font-mono font-semibold text-ink">{formatCurrency(subtotal)}</span>
                  </div>
                  {isGst && (
                    <div className="flex justify-between text-ink-muted">
                      <span>GST (18%):</span>
                      <span className="font-mono text-ink">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-brand-forest pt-1 border-t border-border-subtle">
                    <span>Estimated Grand Total:</span>
                    <span className="font-mono text-sm">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-border-subtle">
                    <span className={balanceDue > 0 ? 'text-status-amber' : 'text-status-green'}>
                      Remaining Balance Due:
                    </span>
                    <span className={`font-mono ${balanceDue > 0 ? 'text-status-amber' : 'text-status-green'}`}>
                      {balanceDue > 0 ? formatCurrency(balanceDue) : '₹0.00 (Fully Settled)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Remarks */}
              <div>
                <label htmlFor="be-remarks" className="pms-label">
                  Special Setup &amp; Staff Operational Remarks
                </label>
                <textarea
                  id="be-remarks"
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Stage flower decoration and seating layout ready by 16:30"
                  className="pms-input h-auto py-2 resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0 bg-white rounded-b-2xl">
          <button type="button" onClick={handleClose} disabled={isSubmitting} className="pms-btn-secondary">
            Cancel
          </button>
          <button type="submit" form="book-event-form" disabled={isSubmitting} className="pms-btn-primary">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Booking &amp; Folio...</span>
              </>
            ) : (
              <>
                <PartyPopper className="w-4 h-4" />
                <span>Confirm Booking &amp; Open Folio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
