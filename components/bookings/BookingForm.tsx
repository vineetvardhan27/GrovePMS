'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  CreditCard,
  Building,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  FileText,
  MapPin,
  Sparkles,
  Bed,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RoomWithCategory,
  getEffectiveRoomRates,
} from '../../lib/rooms/types';
import type { Guest } from '../../lib/guests/queries';
import { createBookingAction, checkDoubleBooking } from '../../lib/bookings/actions';
import { BookingSource, PaymentMode } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import { calculateStayRates } from '../../lib/utils/dates';
import { useAuth } from '../providers/AuthProvider';
import IdUploadDropzone from '../guests/IdUploadDropzone';
import { uploadGuestDocumentAction } from '../../lib/guests/documents';

interface BookingFormProps {
  rooms: RoomWithCategory[];
  preSelectedRoomId?: string;
  knownGuests?: Guest[];
}

export default function BookingForm({
  rooms,
  preSelectedRoomId,
  knownGuests = [],
}: BookingFormProps) {
  const router = useRouter();
  const { hotelId } = useAuth();

  // Form state
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    preSelectedRoomId || (rooms[0]?.id ?? '')
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrowStr);

  // Guest details
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestIdType, setGuestIdType] = useState<string>('Aadhaar');
  const [guestIdNumber, setGuestIdNumber] = useState<string>('');
  const [guestAddress, setGuestAddress] = useState<string>('');
  const [isRepeatGuest, setIsRepeatGuest] = useState<boolean>(false);
  const [selectedIdFile, setSelectedIdFile] = useState<File | null>(null);

  // Stay & Financials
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [extraBeds, setExtraBeds] = useState<number>(0);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [otherExtraCharges, setOtherExtraCharges] = useState<number>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [source, setSource] = useState<BookingSource>('direct');
  const [remarks, setRemarks] = useState<string>('');
  const [showBreakdown, setShowBreakdown] = useState<boolean>(true);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [availabilityConflict, setAvailabilityConflict] = useState<string | null>(null);

  // Selected Room
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  // Selected Room Base and Weekend rates (considering optional room override)
  const roomRates = useMemo(() => {
    if (!selectedRoom) return { base_rate: 2500, weekend_rate: 3000, hasOverride: false };
    return getEffectiveRoomRates(selectedRoom);
  }, [selectedRoom]);

  // Stay calculations (respects weekday vs weekend pricing per stay night)
  const stayCalculation = useMemo(() => {
    const base = customRate !== null ? customRate : roomRates.base_rate;
    const weekend = customRate !== null ? customRate : roomRates.weekend_rate;
    return calculateStayRates(checkInDate, checkOutDate, base, weekend);
  }, [checkInDate, checkOutDate, customRate, roomRates]);

  // Extra Bed Charge Calculation (Rate from category * beds * nights)
  const extraBedRate = selectedRoom?.category?.extra_bed_rate || 0;
  const extraBedTotal = useMemo(() => {
    return extraBeds * extraBedRate * stayCalculation.nights;
  }, [extraBeds, extraBedRate, stayCalculation.nights]);

  // Total Extra charges (extra beds + other custom charges)
  const totalExtraCharges = useMemo(() => {
    return extraBedTotal + Number(otherExtraCharges || 0);
  }, [extraBedTotal, otherExtraCharges]);

  // Total reservation amount
  const totalAmount = useMemo(() => {
    return stayCalculation.totalRoomAmount + totalExtraCharges;
  }, [stayCalculation.totalRoomAmount, totalExtraCharges]);

  // Live Double-Booking Check
  useEffect(() => {
    if (!selectedRoomId || !checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      setAvailabilityConflict(null);
      return;
    }

    let active = true;
    setIsCheckingAvailability(true);

    checkDoubleBooking(
      hotelId || undefined,
      selectedRoomId,
      checkInDate,
      checkOutDate
    )
      .then((res) => {
        if (!active) return;
        if (!res.is_available) {
          const c = res.conflict;
          setAvailabilityConflict(
            `Room ${selectedRoom?.room_number} is already booked from ${c?.check_in_date} to ${c?.check_out_date} (Booking #${c?.booking_number}).`
          );
        } else {
          setAvailabilityConflict(null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsCheckingAvailability(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRoomId, checkInDate, checkOutDate, selectedRoom, hotelId]);

  // Auto-fill repeat guest profile
  const handlePhoneChange = (phoneVal: string) => {
    setGuestPhone(phoneVal);
    const clean = phoneVal.replace(/\D/g, '');
    if (clean.length >= 10) {
      const match = knownGuests.find((g) => g.phone.replace(/\D/g, '').includes(clean));
      if (match) {
        setGuestName(match.full_name);
        if (match.email) setGuestEmail(match.email);
        if (match.id_type) setGuestIdType(match.id_type);
        if (match.id_number) setGuestIdNumber(match.id_number);
        if (match.address) setGuestAddress(match.address);
        setIsRepeatGuest(true);
        return;
      }
    }
    setIsRepeatGuest(false);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (checkOutDate <= checkInDate) {
      setErrorMessage('Check-out date must be strictly after the check-in date.');
      return;
    }

    if (availabilityConflict) {
      setErrorMessage(availabilityConflict);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBookingAction({
        room_id: selectedRoomId,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail,
        guest_id_type: guestIdType,
        guest_id_number: guestIdNumber,
        guest_address: guestAddress,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults,
        children,
        rate_per_night: stayCalculation.averageRatePerNight,
        extra_charges: totalExtraCharges,
        advance_amount: advanceAmount,
        payment_mode: paymentMode,
        source,
        remarks: remarks.trim()
          ? `${remarks.trim()}${extraBeds > 0 ? ` (Extra beds: ${extraBeds})` : ''}`
          : extraBeds > 0
          ? `Extra beds: ${extraBeds}`
          : undefined,
      });

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      if (result.success) {
        // If an ID file was selected, upload and attach it to the guest profile
        const createdGuestId = result.booking?.guest_id;
        if (selectedIdFile && createdGuestId) {
          try {
            const formData = new FormData();
            formData.append('file', selectedIdFile);
            formData.append('guest_id', createdGuestId);
            formData.append('document_type', guestIdType || 'Aadhaar');
            formData.append('id_number', guestIdNumber || '');
            await uploadGuestDocumentAction(formData);
          } catch (uploadErr) {
            console.warn('ID document upload notice after booking creation:', uploadErr);
          }
        }

        router.push('/bookings');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred while creating booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-action-danger/10 border border-action-danger/30 rounded-xl flex items-start gap-3 text-action-danger">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Cannot Complete Reservation</p>
            <p className="text-xs text-action-danger/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Conflict Warning */}
      {availabilityConflict && !errorMessage && (
        <div className="p-4 bg-status-amber/15 border border-status-amber/30 rounded-xl flex items-start gap-3 text-ink">
          <Clock className="w-5 h-5 text-status-amber shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-status-amber">Room Conflict Detected</p>
            <p className="text-xs text-ink-muted mt-0.5">{availabilityConflict}</p>
          </div>
        </div>
      )}

      {/* Section 1: Guest Information */}
      <div className="bg-white rounded-2xl border border-border-subtle p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-sand rounded-lg text-brand-forest">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-ink text-base">Guest Information</h3>
              <p className="text-xs text-ink-muted">Enter mobile number to auto-fill repeat guests</p>
            </div>
          </div>

          {isRepeatGuest && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-status-green/15 text-status-green border border-status-green/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Repeat Guest Recognized</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="guest_phone">
              Mobile Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id="guest_phone"
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="guest_name">
              Full Name *
            </label>
            <input
              id="guest_name"
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="guest_email">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id="guest_email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full pl-9 pr-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="guest_id_type">
                ID Type
              </label>
              <select
                id="guest_id_type"
                value={guestIdType}
                onChange={(e) => setGuestIdType(e.target.value)}
                className="w-full px-2.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              >
                <option value="Aadhaar">Aadhaar</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="guest_id_number">
                ID Number
              </label>
              <input
                id="guest_id_number"
                type="text"
                value={guestIdNumber}
                onChange={(e) => setGuestIdNumber(e.target.value)}
                placeholder="•••• ••••"
                className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
          </div>

          {/* Upload ID Card Dropzone */}
          <div className="sm:col-span-2 pt-1">
            <label className="block text-sm font-medium text-ink mb-1.5">
              Upload ID Card
            </label>
            <IdUploadDropzone
              onFileSelected={(file) => setSelectedIdFile(file)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="guest_address">
              City / Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id="guest_address"
                type="text"
                value={guestAddress}
                onChange={(e) => setGuestAddress(e.target.value)}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full pl-9 pr-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Dates, Room & Rates */}
      <div className="bg-white rounded-2xl border border-border-subtle p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
          <div className="p-2 bg-brand-sand rounded-lg text-brand-forest">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-ink text-base">Stay &amp; Room Selection</h3>
            <p className="text-xs text-ink-muted">Choose stay duration and assign from 19 accommodation units</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="check_in_date">
              Check-In Date *
            </label>
            <input
              id="check_in_date"
              type="date"
              required
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="check_out_date">
              Check-Out Date *
            </label>
            <input
              id="check_out_date"
              type="date"
              required
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-3 bg-brand-sand rounded-lg border border-border-subtle flex items-center justify-between text-xs">
              <span className="text-ink-muted font-medium">Duration:</span>
              <span className="font-bold text-brand-forest text-sm">
                {stayCalculation.nights} Night{stayCalculation.nights > 1 ? 's' : ''}{' '}
                <span className="text-[11px] font-normal text-ink-muted">
                  ({stayCalculation.weekdayNights} Wkday{stayCalculation.weekendNights > 0 ? ` + ${stayCalculation.weekendNights} Wknd` : ''})
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Room Selector with all 19 units */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="room_select">
              Assign Unit (19 Available) *
            </label>
            <select
              id="room_select"
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setCustomRate(null);
              }}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch font-medium"
            >
              {rooms.map((r) => {
                const isFamily = r.room_number === 'FAMILY-APT';
                const effective = getEffectiveRoomRates(r);
                return (
                  <option key={r.id} value={r.id}>
                    {isFamily ? 'Family Apartment' : `Room ${r.room_number}`} — {r.category.name} ({formatCurrency(effective.base_rate)}/nt)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="rate_per_night">
              Tariff / Rate Override (₹)
            </label>
            <input
              id="rate_per_night"
              type="number"
              min="0"
              placeholder={`Auto: ₹${roomRates.base_rate}/nt`}
              value={customRate !== null ? customRate : ''}
              onChange={(e) => setCustomRate(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch font-bold"
            />
            <span className="text-[10px] text-ink-muted">
              Auto: {formatCurrency(roomRates.base_rate)} (Wkday) {roomRates.weekend_rate ? `/ ${formatCurrency(roomRates.weekend_rate)} (Wknd)` : ''}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="extra_charges_other">
              Other Extra Charges (₹)
            </label>
            <input
              id="extra_charges_other"
              type="number"
              min="0"
              value={otherExtraCharges}
              onChange={(e) => setOtherExtraCharges(Number(e.target.value))}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>
        </div>

        {/* Occupancy & Extra Bed Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-ink mb-1" htmlFor="adults_count">
              Adults
            </label>
            <input
              id="adults_count"
              type="number"
              min="1"
              max="10"
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1" htmlFor="children_count">
              Children
            </label>
            <input
              id="children_count"
              type="number"
              min="0"
              max="6"
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1" htmlFor="extra_beds_count">
              Extra Beds ({formatCurrency(extraBedRate)}/nt)
            </label>
            <input
              id="extra_beds_count"
              type="number"
              min="0"
              max="4"
              value={extraBeds}
              onChange={(e) => setExtraBeds(Number(e.target.value))}
              className="w-full px-3 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1" htmlFor="source_select">
              Booking Source
            </label>
            <select
              id="source_select"
              value={source}
              onChange={(e) => setSource(e.target.value as BookingSource)}
              className="w-full px-2.5 py-2 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            >
              <option value="direct">Direct</option>
              <option value="walk_in">Walk-in</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="travel_agent">Travel Agent</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Dynamic Stay Date Nightly Rate Breakdown Box */}
        <div className="mt-4 p-4 rounded-xl bg-brand-sand/40 border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-forest" />
              <span>Nightly Stay Rate Breakdown</span>
            </span>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-brand-forest font-semibold hover:underline flex items-center gap-1"
            >
              <span>{showBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}</span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showBreakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {stayCalculation.breakdown.map((night, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    night.isWeekend
                      ? 'bg-status-amber/10 border-status-amber/30 text-ink'
                      : 'bg-white border-border-subtle text-ink'
                  }`}
                >
                  <div>
                    <span className="font-medium">{night.formattedDate} ({night.dayName.slice(0, 3)})</span>
                    {night.isWeekend && (
                      <span className="ml-1.5 text-[10px] font-bold text-status-amber bg-status-amber/15 px-1.5 py-0.2 rounded">
                        Weekend
                      </span>
                    )}
                  </div>
                  <span className="font-bold tabular-nums">{formatCurrency(night.rate)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border-subtle/80 flex flex-wrap items-center justify-between text-xs text-ink-muted">
            <span>
              Room Total: <strong className="text-ink">{formatCurrency(stayCalculation.totalRoomAmount)}</strong> ({stayCalculation.nights} nights)
            </span>
            {extraBeds > 0 && (
              <span>
                Extra Beds: <strong className="text-ink">{formatCurrency(extraBedTotal)}</strong> ({extraBeds} bed × {stayCalculation.nights} nt)
              </span>
            )}
            <span>
              Avg Rate/Night: <strong className="text-brand-forest">{formatCurrency(stayCalculation.averageRatePerNight)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Advance Payment & Billing Summary */}
      <div className="bg-brand-sand-dark/70 rounded-2xl border border-border-subtle p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-lg text-brand-forest">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-ink text-base">Payment &amp; Billing Summary</h3>
              <p className="text-xs text-ink-muted">Enter advance received to auto-derive payment status</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-ink-muted block">Estimated Net Total:</span>
            <span className="text-2xl font-bold font-serif text-brand-forest tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="payment_mode_select">
              Payment Mode
            </label>
            <select
              id="payment_mode_select"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              className="w-full px-3.5 py-2.5 bg-white border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            >
              <option value="upi">UPI (GPay/PhonePe)</option>
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="advance_amount">
              Advance Payment Received (₹)
            </label>
            <input
              id="advance_amount"
              type="number"
              min="0"
              max={totalAmount}
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-white border border-border-subtle rounded-lg text-ink text-base font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
            <p className="text-xs text-ink-muted mt-1">
              Balance due at checkout: <span className="font-semibold text-ink tabular-nums">{formatCurrency(Math.max(0, totalAmount - advanceAmount))}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="remarks">
              Remarks / Special Requests
            </label>
            <input
              id="remarks"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Early check-in, anniversary"
              className="w-full px-3.5 py-2.5 bg-white border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>
        </div>
      </div>

      {/* Form Submission */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-5 py-3 rounded-lg border border-border-subtle bg-white hover:bg-brand-sand text-ink text-sm font-medium transition-colors cursor-pointer min-h-touch text-center"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isCheckingAvailability || Boolean(availabilityConflict)}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-base font-medium transition-colors cursor-pointer min-h-touch flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Creating Reservation...</span>
          ) : (
            <>
              <span>Confirm Reservation ({formatCurrency(totalAmount)})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
