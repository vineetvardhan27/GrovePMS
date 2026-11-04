'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Crown,
  Trees,
  Hotel,
  Home,
  MapPin,
  Phone,
  Mail,
  Globe,
  Percent,
  Clock,
  BedDouble,
  Layers,
  UtensilsCrossed,
  PartyPopper,
  Wifi,
  Car,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Plus,
  Minus,
  Info,
  Compass,
  Coffee,
} from 'lucide-react';
import PasswordInput from '@/components/shared/PasswordInput';
import { registerHotelAndOwner, RegisterHotelState } from './actions';
import VisualRoomBuilder from '@/components/rooms/visual-builder/VisualRoomBuilder';
import {
  BuilderCategory,
  BuilderFloor,
  GeneratedRoom,
  PropertySummaryStats,
  DEFAULT_PRESET_CATEGORIES,
  DEFAULT_PRESET_FLOORS,
} from '@/components/rooms/visual-builder/types';

/* ══════════════════════════════════════════════
 * PROPERTY TYPES SPECIFICATION
 * ══════════════════════════════════════════════ */
interface PropertyTypeOption {
  id: string;
  label: string;
  categoryName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROPERTY_TYPES: PropertyTypeOption[] = [
  {
    id: 'hotel',
    label: 'Hotel',
    categoryName: 'Full-Service Hotel',
    description: 'Multi-floor commercial hotel with front desk, room service, and guest amenities.',
    icon: Building2,
  },
  {
    id: 'boutique',
    label: 'Boutique Hotel',
    categoryName: 'Boutique Property',
    description: 'Design-led, intimate hotel offering distinctive character and curated service.',
    icon: Crown,
  },
  {
    id: 'resort',
    label: 'Resort',
    categoryName: 'Luxury Resort & Spa',
    description: 'Destination property with extensive leisure facilities, scenic views, and hospitality.',
    icon: Trees,
  },
  {
    id: 'guesthouse',
    label: 'Guest House',
    categoryName: 'Bed & Breakfast / Lodge',
    description: 'Charming, welcoming property offering comfortable rooms for travelers and tourists.',
    icon: Hotel,
  },
  {
    id: 'homestay',
    label: 'Homestay',
    categoryName: 'Authentic Homestay',
    description: 'Residential hospitality offering personal hosting, local food, and cultural warmth.',
    icon: Home,
  },
];

/* ══════════════════════════════════════════════
 * AVAILABLE AMENITIES / FACILITIES
 * ══════════════════════════════════════════════ */
interface FacilityOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const FACILITIES_OPTIONS: FacilityOption[] = [
  { id: 'restaurant', name: 'In-house Restaurant (KOT POS)', icon: UtensilsCrossed, tag: 'F&B Dining' },
  { id: 'banquet', name: 'Banquet & Event Halls', icon: PartyPopper, tag: 'Events' },
  { id: 'room_service', name: '24/7 Room Service', icon: Coffee, tag: 'In-Room' },
  { id: 'wifi', name: 'High-Speed Wi-Fi', icon: Wifi, tag: 'Connectivity' },
  { id: 'parking', name: 'Guest Parking & Valet', icon: Car, tag: 'Parking' },
  { id: 'housekeeping', name: 'Housekeeping Dispatch', icon: Sparkles, tag: 'Housekeeping' },
  { id: 'travel_desk', name: 'Travel Desk & Airport Shuttle', icon: Compass, tag: 'Transport' },
];

/* ══════════════════════════════════════════════
 * DEFAULT ROOM CATEGORIES PRESETS
 * ══════════════════════════════════════════════ */
const DEFAULT_CATEGORY_PRESETS = [
  { name: 'Deluxe Room', rate: 3500 },
  { name: 'Super Deluxe Room', rate: 5000 },
  { name: 'Executive Suite', rate: 8500 },
  { name: 'Standard Room', rate: 2500 },
  { name: 'Family Villa', rate: 12000 },
];

/* ══════════════════════════════════════════════
 * FORM DATA STATE INTERFACE
 * ══════════════════════════════════════════════ */
interface RegistrationFormData {
  // Step 1: Property Details
  hotel_name: string;
  property_type: string;
  property_description: string;

  // Step 2: Location & Contact
  country: string;
  state: string;
  city: string;
  address: string;
  pin_code: string;
  phone: string;
  business_email: string;
  website: string;
  gst_number: string;

  // Step 3: Rooms & Operations
  total_floors: number;
  total_rooms: number;
  room_categories: string[];
  check_in_time: string;
  check_out_time: string;
  facilities: string[];

  // Step 4: Owner Account & Plan
  owner_full_name: string;
  email: string;
  owner_phone: string;
  password: string;
  confirm_password: string;
  selected_plan: 'monthly_999' | 'annual_9990';
  billing_cycle: 'monthly' | 'annual';
}

export default function RegisterHotelPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<RegistrationFormData>({
    hotel_name: '',
    property_type: 'boutique',
    property_description: '',

    country: 'India',
    state: 'Sikkim',
    city: 'Gangtok',
    address: '',
    pin_code: '737101',
    phone: '',
    business_email: '',
    website: '',
    gst_number: '',

    total_floors: 3,
    total_rooms: 15,
    room_categories: ['Deluxe Room', 'Super Deluxe Room', 'Executive Suite'],
    check_in_time: '12:00',
    check_out_time: '11:00',
    facilities: ['restaurant', 'room_service', 'wifi', 'housekeeping'],

    owner_full_name: '',
    email: '',
    owner_phone: '',
    password: '',
    confirm_password: '',
    selected_plan: 'monthly_999',
    billing_cycle: 'monthly',
  });

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverErrorCode, setServerErrorCode] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<RegisterHotelState | null>(null);
  const [isPending, startTransition] = useTransition();

  // Visual Room Builder state
  const [builderCategories, setBuilderCategories] = useState<BuilderCategory[]>(DEFAULT_PRESET_CATEGORIES);
  const [builderFloors, setBuilderFloors] = useState<BuilderFloor[]>(DEFAULT_PRESET_FLOORS);
  const [builderRooms, setBuilderRooms] = useState<GeneratedRoom[]>([]);
  const [builderStats, setBuilderStats] = useState<PropertySummaryStats | null>(null);

  const handleBuilderChange = (data: {
    categories: BuilderCategory[];
    floors: BuilderFloor[];
    generatedRooms: GeneratedRoom[];
    stats: PropertySummaryStats;
  }) => {
    setBuilderCategories(data.categories);
    setBuilderFloors(data.floors);
    setBuilderRooms(data.generatedRooms);
    setBuilderStats(data.stats);

    setFormData((prev) => ({
      ...prev,
      total_floors: data.stats.totalFloors,
      total_rooms: data.stats.totalRooms,
      room_categories: data.categories.map((c) => c.name),
    }));
  };

  // Helper to update field state
  const updateField = <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error on edit
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Toggle facilities
  const toggleFacility = (facilityId: string) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facilityId);
      const nextFacilities = exists
        ? prev.facilities.filter((f) => f !== facilityId)
        : [...prev.facilities, facilityId];
      return { ...prev, facilities: nextFacilities };
    });
  };

  // Toggle room category
  const toggleRoomCategory = (categoryName: string) => {
    setFormData((prev) => {
      const exists = prev.room_categories.includes(categoryName);
      if (exists && prev.room_categories.length <= 1) {
        return prev; // keep at least one category
      }
      const nextCategories = exists
        ? prev.room_categories.filter((c) => c !== categoryName)
        : [...prev.room_categories, categoryName];
      return { ...prev, room_categories: nextCategories };
    });
  };

  // ── STEP VALIDATION ──
  const validateCurrentStep = (stepToValidate: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepToValidate === 1) {
      if (!formData.hotel_name.trim() || formData.hotel_name.trim().length < 2) {
        errors.hotel_name = 'Please enter your Hotel or Property Name (at least 2 characters).';
      }
      if (!formData.property_type) {
        errors.property_type = 'Please select a hospitality category.';
      }
    } else if (stepToValidate === 2) {
      if (!formData.city.trim()) {
        errors.city = 'Please enter the city where your property is situated.';
      }
      if (!formData.state.trim()) {
        errors.state = 'Please enter your state or province.';
      }
      if (!formData.address.trim()) {
        errors.address = 'Please provide your property street address.';
      }
      if (!formData.phone.trim() || formData.phone.trim().length < 7) {
        errors.phone = 'Please provide a valid property contact phone number.';
      }
      if (formData.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
        errors.business_email = 'Please provide a valid business email format.';
      }
    } else if (stepToValidate === 3) {
      if (!builderCategories || builderCategories.length === 0) {
        errors.room_categories = 'Please configure at least one room category.';
      }
      const totalAllocated = builderFloors.reduce(
        (acc, fl) => acc + fl.allocations.reduce((a, b) => a + b.quantity, 0),
        0
      );
      if (totalAllocated < 1) {
        errors.total_rooms = 'Please allocate at least one room on a floor using the builder.';
      }
    } else if (stepToValidate === 4) {
      if (!formData.owner_full_name.trim() || formData.owner_full_name.trim().length < 2) {
        errors.owner_full_name = 'Please provide the Owner full legal name.';
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid work email address for primary owner login.';
      }
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
      }
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match. Please re-enter.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(currentStep)) {
      setServerError(null);
      setCurrentStep((prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrevStep = () => {
    setServerError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4);
  };

  // Jump to step if previous steps are valid
  const handleJumpToStep = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    // Verify each intermediate step
    for (let s = 1; s < targetStep; s++) {
      if (!validateCurrentStep(s)) {
        setCurrentStep(s as 1 | 2 | 3 | 4);
        return;
      }
    }
    setCurrentStep(targetStep);
  };

  // ── FINAL FORM SUBMISSION ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(4)) return;

    setServerError(null);
    setServerErrorCode(null);

    const payload = new FormData();
    payload.append('hotel_name', formData.hotel_name);
    payload.append('property_type', formData.property_type);
    payload.append('property_description', formData.property_description);

    payload.append('country', formData.country);
    payload.append('state', formData.state);
    payload.append('city', formData.city);
    payload.append('address', formData.address);
    payload.append('pin_code', formData.pin_code);
    payload.append('phone', formData.phone);
    payload.append('business_email', formData.business_email);
    payload.append('website', formData.website);
    payload.append('gst_number', formData.gst_number);

    payload.append('total_floors', String(formData.total_floors));
    payload.append('total_rooms', String(formData.total_rooms));
    payload.append('room_categories', JSON.stringify(formData.room_categories));
    payload.append('check_in_time', formData.check_in_time);
    payload.append('check_out_time', formData.check_out_time);
    payload.append('facilities', JSON.stringify(formData.facilities));

    payload.append('owner_full_name', formData.owner_full_name);
    payload.append('email', formData.email);
    payload.append('owner_phone', formData.owner_phone);
    payload.append('password', formData.password);
    payload.append('confirm_password', formData.confirm_password);
    payload.append('selected_plan', formData.selected_plan);

    // Visual Room Builder layout payload
    payload.append(
      'property_layout_json',
      JSON.stringify({
        categories: builderCategories,
        floors: builderFloors,
        generatedRooms: builderRooms,
        stats: builderStats,
      })
    );

    startTransition(async () => {
      try {
        const result = await registerHotelAndOwner(null, payload);
        if (result.success) {
          setRegistrationSuccess(result);
        } else if (result.error) {
          setServerError(result.error);
          setServerErrorCode(result.code || null);
        }
      } catch (err: any) {
        setServerError('An unexpected network interruption occurred. Please verify your connection.');
      }
    });
  };

  // Active property type metadata
  const selectedPropertyType =
    PROPERTY_TYPES.find((t) => t.id === formData.property_type) || PROPERTY_TYPES[0];

  // ══════════════════════════════════════════════
  // SUCCESS CELEBRATION VIEW
  // ══════════════════════════════════════════════
  if (registrationSuccess?.success) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-ink selection:bg-brand-forest/20 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background grid pattern */}
        <div className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-80" aria-hidden="true" />

        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />

        <div className="max-w-2xl mx-auto w-full relative z-10 my-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-border-subtle/80 rounded-[32px] shadow-[0_24px_60px_-15px_rgba(31,61,58,0.12)] p-7 sm:p-12 text-center space-y-8 onboarding-step-entrance">
            {/* Animated Celebration Icon */}
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-500/25 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-forest text-white flex items-center justify-center shadow-xs">
                <Crown className="w-4 h-4 text-emerald-300" />
              </div>
            </div>

            {/* Header Title */}
            <div className="space-y-2">
              <span className="grove-glass-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-forest text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Multi-Tenant Property Initialized</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-black tracking-tight">
                Hotel Workspace Ready.
              </h1>
              <p className="text-sm sm:text-base text-ink-muted max-w-md mx-auto leading-relaxed">
                Welcome to Grove PMS. Your isolated database schema, architectural room matrix, and primary owner permissions are configured.
              </p>
            </div>

            {/* Property Summary Dossier */}
            <div className="bg-[#FAF8F5] border border-border-subtle/80 rounded-2xl p-5 sm:p-6 text-left space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/60">
                <span className="text-ink-muted flex items-center gap-2 font-medium">
                  <Building2 className="w-4 h-4 text-brand-forest/70" />
                  Property Name:
                </span>
                <span className="font-semibold text-black font-serif text-sm sm:text-base">
                  {registrationSuccess.hotelName}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/60">
                <span className="text-ink-muted flex items-center gap-2 font-medium">
                  <selectedPropertyType.icon className="w-4 h-4 text-brand-forest/70" />
                  Category:
                </span>
                <span className="font-semibold text-black">
                  {selectedPropertyType.label}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/60">
                <span className="text-ink-muted flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-brand-forest/70" />
                  Location:
                </span>
                <span className="font-semibold text-black">
                  {formData.city}, {formData.state}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/60">
                <span className="text-ink-muted flex items-center gap-2 font-medium">
                  <BedDouble className="w-4 h-4 text-brand-forest/70" />
                  Room Matrix:
                </span>
                <span className="font-semibold text-black">
                  {formData.total_rooms} Rooms across {formData.total_floors} Floors
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/60">
                <span className="text-ink-muted flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-brand-forest/70" />
                  Primary Owner:
                </span>
                <span className="font-semibold text-black">
                  {formData.owner_full_name} ({registrationSuccess.ownerEmail})
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-ink-muted flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Subscription Plan:
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-semibold border border-emerald-500/20">
                  Grove Operating System • ₹999/mo (Active Trial)
                </span>
              </div>
            </div>

            {/* Call To Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base group hover:-translate-y-0.5"
              >
                <span>Enter Hotel PMS Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/subscription"
                className="w-full bg-white hover:bg-brand-sand/60 text-brand-forest font-semibold py-3 px-6 rounded-2xl border border-border-subtle transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>Activate Subscription License (₹999/mo)</span>
                <ShieldCheck className="w-4 h-4 text-brand-forest/70" />
              </Link>
            </div>

            {/* Security Footer Note */}
            <p className="text-xs text-ink-muted flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automated PostgreSQL Row-Level Security enabled for hotel tenant {registrationSuccess.hotelId?.slice(0, 8)}...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // MAIN ONBOARDING EXPERIENCE
  // ══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink selection:bg-brand-forest/20 flex flex-col justify-between relative overflow-x-hidden">
      {/* Subtle background texture */}
      <div className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-85" aria-hidden="true" />

      {/* Top Ambient Glow */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full" />
      <div className="pointer-events-none fixed top-1/3 right-1/4 w-[500px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full" />

      {/* ── TOP LUXURY NAVIGATION BAR ── */}
      <header className="sticky top-0 z-30 w-full bg-[#FAF8F5]/85 backdrop-blur-md border-b border-border-subtle/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-border-subtle/80 shadow-2xs flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl text-black tracking-tight">
                  Grove PMS
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest text-[10.5px] font-semibold border border-brand-forest/15">
                  Hospitality OS
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-ink-muted">
                Multi-Tenant Property Provisioning
              </p>
            </div>
          </Link>

          {/* Right Header Navigation Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-ink-muted border-r border-border-subtle/80 pr-4">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-forest" />
              <span>Dedicated Tenant Isolation</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline text-ink-muted">Existing Operator?</span>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full bg-white border border-border-subtle/80 hover:bg-brand-sand/60 text-brand-forest font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA (TWO-COLUMN DESKTOP / SINGLE-COLUMN MOBILE) ── */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ══════════════════════════════════════════════
           * LEFT COLUMN: ONBOARDING STEPS & PROGRESSION
           * ══════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step Progress Segmented Bar */}
            <div className="bg-white/80 backdrop-blur-md border border-border-subtle/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs">
              {/* Stepper Header Pills */}
              <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                {[
                  { step: 1, title: 'Property', label: 'Identity' },
                  { step: 2, title: 'Location', label: 'Contact' },
                  { step: 3, title: 'Rooms', label: 'Operations' },
                  { step: 4, title: 'Account', label: 'Plan' },
                ].map((item) => {
                  const isCompleted = currentStep > item.step;
                  const isActive = currentStep === item.step;
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => handleJumpToStep(item.step as 1 | 2 | 3 | 4)}
                      disabled={isPending}
                      className={`text-left p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-brand-forest text-white shadow-xs font-semibold'
                          : isCompleted
                          ? 'bg-[#F2ECE3] text-brand-forest font-semibold hover:bg-[#EBE3D7]'
                          : 'bg-[#FAF8F5] text-ink-muted/80 opacity-70 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'text-emerald-300' : isCompleted ? 'text-brand-forest/70' : 'text-ink-muted'
                          }`}
                        >
                          Step 0{item.step}
                        </span>
                        {isCompleted && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <div className="text-[11.5px] sm:text-xs truncate font-medium">
                        {item.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Smooth Animated Progress Line */}
              <div className="w-full bg-[#EAE5DB] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-forest h-full transition-all duration-400 ease-out rounded-full"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Server Error Alert Banner */}
            {serverError && (
              <div className="p-4 bg-action-danger/10 border border-action-danger/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-action-danger onboarding-step-entrance">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-action-danger" />
                  <span>{serverError}</span>
                </div>
                {serverErrorCode === 'EMAIL_EXISTS' && (
                  <Link
                    href="/login"
                    className="bg-white hover:bg-brand-sand text-brand-forest font-semibold px-3.5 py-1.5 rounded-xl border border-border-subtle text-xs shrink-0 text-center shadow-2xs"
                  >
                    Sign In to Existing Account →
                  </Link>
                )}
              </div>
            )}

            {/* Active Step Container */}
            <div className="bg-white border border-border-subtle/80 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_16px_40px_-15px_rgba(31,61,58,0.06)] relative overflow-hidden">
              <form onSubmit={handleSubmit} noValidate>
                {/* ══════════════════════════════════════════════
                 * STEP 1: PROPERTY DETAILS
                 * ══════════════════════════════════════════════ */}
                {currentStep === 1 && (
                  <div className="space-y-6 onboarding-step-entrance">
                    {/* Step Eyebrow & Title */}
                    <div className="space-y-1.5">
                      <div className="grove-glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-brand-forest text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Step 01 • Property Identity</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight">
                        Tell us about your property.
                      </h2>
                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                        Enter your official hotel name and select the hospitality category that best reflects your guest experience.
                      </p>
                    </div>

                    {/* Hotel Name Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="hotel_name" className="block text-xs font-bold uppercase tracking-wider text-black">
                        Property Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                        <input
                          id="hotel_name"
                          type="text"
                          required
                          value={formData.hotel_name}
                          onChange={(e) => updateField('hotel_name', e.target.value)}
                          placeholder="e.g. Hotel Greenery View or Whispering Pines Resort"
                          className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border rounded-2xl text-black text-sm sm:text-base font-medium placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 transition-all ${
                            stepErrors.hotel_name
                              ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                              : 'border-border-subtle focus:border-brand-forest focus:ring-brand-forest/20'
                          }`}
                        />
                      </div>
                      {stepErrors.hotel_name && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{stepErrors.hotel_name}</span>
                        </p>
                      )}
                    </div>

                    {/* Property Type Selection Grid */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-black">
                          Hospitality Category <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-ink-muted">Select one</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PROPERTY_TYPES.map((type) => {
                          const isSelected = formData.property_type === type.id;
                          const IconComponent = type.icon;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => updateField('property_type', type.id)}
                              className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between group hover:-translate-y-0.5 ${
                                isSelected
                                  ? 'bg-[#FAF8F5] border-brand-forest shadow-xs ring-1 ring-brand-forest'
                                  : 'bg-white border-border-subtle hover:border-brand-forest/40 hover:bg-[#FAF8F5]/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-brand-forest text-white'
                                      : 'bg-brand-sand text-brand-forest group-hover:bg-brand-forest/10'
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'border-brand-forest bg-brand-forest text-white'
                                      : 'border-border-subtle bg-white text-transparent'
                                  }`}
                                >
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              </div>
                              <div>
                                <h3 className="font-serif font-bold text-sm text-black tracking-tight">
                                  {type.label}
                                </h3>
                                <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">
                                  {type.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Property Description (Optional) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="property_description" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Property Bio / Description <span className="text-ink-muted font-normal lowercase">(optional)</span>
                        </label>
                        <span className="text-[10.5px] text-ink-muted">Shown on invoices &amp; manifests</span>
                      </div>
                      <textarea
                        id="property_description"
                        rows={3}
                        value={formData.property_description}
                        onChange={(e) => updateField('property_description', e.target.value)}
                        placeholder="e.g. A serene mountain getaway overlooking the valley with 19 boutique rooms, rooftop dining, and warm local hospitality."
                        className="w-full p-3.5 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════
                 * STEP 2: LOCATION & CONTACT
                 * ══════════════════════════════════════════════ */}
                {currentStep === 2 && (
                  <div className="space-y-6 onboarding-step-entrance">
                    {/* Step Eyebrow & Title */}
                    <div className="space-y-1.5">
                      <div className="grove-glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-brand-forest text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Step 02 • Location &amp; Contact</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight">
                        Where is your hotel situated?
                      </h2>
                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                        These details populate your official GST invoices, guest police registers, and direction chits.
                      </p>
                    </div>

                    {/* Animated Location Pin Preview Pill */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-border-subtle/80 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-7 h-7 rounded-full bg-emerald-50 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="absolute inset-0 rounded-full border border-emerald-500/40 location-radar-pulse" />
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-black block truncate">
                            {formData.city || 'City'}, {formData.state || 'State'}
                          </span>
                          <span className="text-[11px] text-ink-muted truncate block">
                            {formData.address || 'Street address pending'} • {formData.pin_code || 'PIN'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest bg-brand-forest/10 px-2 py-0.5 rounded-full shrink-0">
                        {formData.country}
                      </span>
                    </div>

                    {/* Country & State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="country"
                          value={formData.country}
                          onChange={(e) => updateField('country', e.target.value)}
                          className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                        >
                          <option value="India">India</option>
                          <option value="Nepal">Nepal</option>
                          <option value="Bhutan">Bhutan</option>
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Other">Other Region</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-black">
                          State / Region <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="state"
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          placeholder="e.g. Sikkim or West Bengal"
                          className={`w-full px-3.5 py-3 bg-[#FAF8F5] border rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                            stepErrors.state
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-border-subtle focus:border-brand-forest focus:ring-brand-forest/20'
                          }`}
                        />
                        {stepErrors.state && (
                          <p className="text-xs text-red-600 font-medium">{stepErrors.state}</p>
                        )}
                      </div>
                    </div>

                    {/* City & PIN Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-black">
                          City / Town <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="city"
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="e.g. Gangtok"
                          className={`w-full px-3.5 py-3 bg-[#FAF8F5] border rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                            stepErrors.city
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-border-subtle focus:border-brand-forest focus:ring-brand-forest/20'
                          }`}
                        />
                        {stepErrors.city && (
                          <p className="text-xs text-red-600 font-medium">{stepErrors.city}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="pin_code" className="block text-xs font-bold uppercase tracking-wider text-black">
                          PIN / Postal Code
                        </label>
                        <input
                          id="pin_code"
                          type="text"
                          value={formData.pin_code}
                          onChange={(e) => updateField('pin_code', e.target.value)}
                          placeholder="e.g. 737101"
                          className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                        />
                      </div>
                    </div>

                    {/* Complete Address */}
                    <div className="space-y-1.5">
                      <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-black">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="e.g. ICAR Road, Lingding Post Office Tadong"
                        className={`w-full px-3.5 py-3 bg-[#FAF8F5] border rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                          stepErrors.address
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-border-subtle focus:border-brand-forest focus:ring-brand-forest/20'
                        }`}
                      />
                      {stepErrors.address && (
                        <p className="text-xs text-red-600 font-medium">{stepErrors.address}</p>
                      )}
                    </div>

                    {/* Hotel Phone & Business Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Front Desk / Hotel Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+91 98000 12345"
                            className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                              stepErrors.phone
                                ? 'border-red-400 focus:ring-red-400'
                                : 'border-border-subtle focus:border-brand-forest focus:ring-brand-forest/20'
                            }`}
                          />
                        </div>
                        {stepErrors.phone && (
                          <p className="text-xs text-red-600 font-medium">{stepErrors.phone}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="business_email" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Hotel Business Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="business_email"
                            type="email"
                            value={formData.business_email}
                            onChange={(e) => updateField('business_email', e.target.value)}
                            placeholder="reservations@hotelgreeneryview.com"
                            className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Website & GSTIN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="website" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Hotel Website <span className="text-ink-muted font-normal lowercase">(optional)</span>
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => updateField('website', e.target.value)}
                            placeholder="https://hotelgreeneryview.com"
                            className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="gst_number" className="block text-xs font-bold uppercase tracking-wider text-black">
                          GSTIN / Tax ID <span className="text-ink-muted font-normal lowercase">(optional)</span>
                        </label>
                        <div className="relative">
                          <Percent className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="gst_number"
                            type="text"
                            value={formData.gst_number}
                            onChange={(e) => updateField('gst_number', e.target.value.toUpperCase())}
                            placeholder="e.g. 11AAACG0000A1Z5"
                            className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════
                 * STEP 3: ROOMS & OPERATIONS
                 * ══════════════════════════════════════════════ */}
                {currentStep === 3 && (
                  <div className="space-y-6 onboarding-step-entrance">
                    {/* Step Eyebrow & Title */}
                    <div className="space-y-1.5">
                      <div className="grove-glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-brand-forest text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                        <BedDouble className="w-3.5 h-3.5" />
                        <span>Step 03 • Rooms &amp; Operations</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight">
                        Visual Room &amp; Floor Builder
                      </h2>
                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                        Create room categories, adjust tariffs, and arrange rooms into floor building blocks. Sequential room numbering and inventory will be generated automatically.
                      </p>
                    </div>

                    {(stepErrors.room_categories || stepErrors.total_rooms) && (
                      <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{stepErrors.room_categories || stepErrors.total_rooms}</span>
                      </div>
                    )}

                    {/* Integrated Visual Room Builder */}
                    <div className="pt-1">
                      <VisualRoomBuilder
                        initialCategories={DEFAULT_PRESET_CATEGORIES}
                        initialFloors={DEFAULT_PRESET_FLOORS}
                        onChange={handleBuilderChange}
                      />
                    </div>

                    {/* Check-In and Check-Out Times */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border-subtle/70">
                      <div className="space-y-1.5">
                        <label htmlFor="check_in_time" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Standard Check-In Time
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="check_in_time"
                            type="time"
                            value={formData.check_in_time}
                            onChange={(e) => updateField('check_in_time', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="check_out_time" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Standard Check-Out Time
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="check_out_time"
                            type="time"
                            value={formData.check_out_time}
                            onChange={(e) => updateField('check_out_time', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operational Facilities Selection */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-black">
                          Facilities &amp; Operational Modules
                        </label>
                        <span className="text-[11px] text-ink-muted">Auto-enables dashboard modules</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {FACILITIES_OPTIONS.map((facility) => {
                          const isChecked = formData.facilities.includes(facility.id);
                          const FacilityIcon = facility.icon;
                          return (
                            <button
                              key={facility.id}
                              type="button"
                              onClick={() => toggleFacility(facility.id)}
                              className={`text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                                isChecked
                                  ? 'bg-[#FAF8F5] border-brand-forest shadow-2xs text-black font-semibold'
                                  : 'bg-white border-border-subtle hover:bg-[#FAF8F5]/60 text-ink-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    isChecked ? 'bg-brand-forest text-white' : 'bg-brand-sand text-ink-muted'
                                  }`}
                                >
                                  <FacilityIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs truncate">{facility.name}</span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                  isChecked ? 'bg-brand-forest border-brand-forest text-white' : 'border-border-subtle bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════
                 * STEP 4: OWNER ACCOUNT & SUBSCRIPTION
                 * ══════════════════════════════════════════════ */}
                {currentStep === 4 && (
                  <div className="space-y-6 onboarding-step-entrance">
                    {/* Step Eyebrow & Title */}
                    <div className="space-y-1.5">
                      <div className="grove-glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-brand-forest text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Step 04 • Owner Account &amp; Plan</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight">
                        Create your master owner profile.
                      </h2>
                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                        This account holds primary root administrative rights for your hotel&apos;s folios, staff management, and financial returns.
                      </p>
                    </div>

                    {/* Owner Legal Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="owner_full_name" className="block text-xs font-bold uppercase tracking-wider text-black">
                        Owner Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                        <input
                          id="owner_full_name"
                          type="text"
                          required
                          value={formData.owner_full_name}
                          onChange={(e) => updateField('owner_full_name', e.target.value)}
                          placeholder="e.g. Vikramaditya Rao"
                          className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                            stepErrors.owner_full_name
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-border-subtle focus:border-brand-forest focus:ring-brand-forest/20'
                          }`}
                        />
                      </div>
                      {stepErrors.owner_full_name && (
                        <p className="text-xs text-red-600 font-medium">{stepErrors.owner_full_name}</p>
                      )}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Owner Login Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="owner@yourhotel.com"
                            className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                              stepErrors.email
                                ? 'border-red-400 focus:ring-red-400'
                                : 'border-border-subtle focus:border-brand-forest focus:ring-brand-forest/20'
                            }`}
                          />
                        </div>
                        {stepErrors.email && (
                          <p className="text-xs text-red-600 font-medium">{stepErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="owner_phone" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Personal Mobile / WhatsApp
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/80 pointer-events-none" />
                          <input
                            id="owner_phone"
                            type="tel"
                            value={formData.owner_phone}
                            onChange={(e) => updateField('owner_phone', e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password & Confirmation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Master Password <span className="text-red-500">*</span>
                        </label>
                        <PasswordInput
                          id="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={(e) => updateField('password', e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                        />
                        {stepErrors.password && (
                          <p className="text-xs text-red-600 font-medium">{stepErrors.password}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="confirm_password" className="block text-xs font-bold uppercase tracking-wider text-black">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <PasswordInput
                          id="confirm_password"
                          name="confirm_password"
                          required
                          value={formData.confirm_password}
                          onChange={(e) => updateField('confirm_password', e.target.value)}
                          placeholder="Repeat password"
                          className="w-full py-3 bg-[#FAF8F5] border border-border-subtle rounded-2xl text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                        />
                        {stepErrors.confirm_password && (
                          <p className="text-xs text-red-600 font-medium">{stepErrors.confirm_password}</p>
                        )}
                      </div>
                    </div>

                    {/* Subscription Plan Selection Box */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-border-subtle/80 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle/60">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[10.5px] font-bold uppercase tracking-wider border border-emerald-500/20 mb-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Transparent Hospitality Licensing</span>
                          </div>
                          <h3 className="font-serif font-bold text-lg text-black">
                            Grove Operating System
                          </h3>
                        </div>

                        {/* Plan Price Tag */}
                        <div className="text-right">
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="font-serif font-bold text-2xl sm:text-3xl text-black">₹999</span>
                            <span className="text-xs text-ink-muted">/ month</span>
                          </div>
                          <span className="text-[10px] text-brand-forest font-semibold">
                            Monthly recurring • Zero commission
                          </span>
                        </div>
                      </div>

                      {/* Included Feature List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink">
                        {[
                          'Front Desk Matrix & Digital Folios',
                          'Dual-Slab GST Sequential Invoicing',
                          'Restaurant POS & Kitchen KOT Dispatch',
                          'Live Housekeeping Status & Turnarounds',
                          'Par-Level Stock & Auto-Purchase Orders',
                          'Daily Flash Reports & GSTR Exports',
                          'PostgreSQL Row-Level Security',
                          'Unlimited Staff Accounts & Devices',
                        ].map((feat) => (
                          <div key={feat} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* No-Charge Notice Banner */}
                      <div className="p-3.5 rounded-2xl bg-white border border-border-subtle/80 flex items-start gap-2.5 text-xs text-ink-muted">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-black font-semibold block">Zero charges required today.</strong>
                          Your dedicated property database and owner credentials will be initialized immediately with full access. You can initiate subscription billing from your dashboard or during Phase 1 checkout.
                        </div>
                      </div>
                    </div>

                    {/* Primary Owner Governance Notice */}
                    <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 text-xs text-ink-muted space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-brand-forest uppercase tracking-wider text-[10.5px]">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Single Owner Governance Policy</span>
                      </div>
                      <p>
                        This account is granted irreversible root administrative permissions over your hotel&apos;s data. Additional staff roles (Managers, Front Desk, Housekeeping) can be invited freely from Settings.
                      </p>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════
                 * FORM ACTIONS FOOTER (BACK / CONTINUE / SUBMIT)
                 * ══════════════════════════════════════════════ */}
                <div className="mt-8 pt-6 border-t border-border-subtle/80 flex items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FAF8F5] border border-border-subtle/80 hover:bg-brand-sand/60 text-brand-forest font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="text-xs text-ink-muted hover:text-brand-forest inline-flex items-center gap-1 font-medium"
                    >
                      <span>Already have an account? Sign In</span>
                    </Link>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-forest hover:bg-brand-forest-light text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4 text-emerald-300" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-forest hover:bg-brand-forest-light text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isPending ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-emerald-300" />
                          <span>Provisioning Hotel Database &amp; Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Property &amp; Launch Workspace</span>
                          <ArrowRight className="w-4 h-4 text-emerald-300" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
           * RIGHT COLUMN: DYNAMIC PROPERTY DOSSIER PREVIEW
           * ══════════════════════════════════════════════ */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-white/95 backdrop-blur-xl border border-border-subtle/80 rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_16px_40px_-15px_rgba(31,61,58,0.08)] space-y-5">
              {/* Terminal Dossier Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-border-subtle/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                    Live Property Dossier
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-ink-muted bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-border-subtle/50">
                  Step 0{currentStep} / 04
                </span>
              </div>

              {/* Dynamic Property Name & Category Badge */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <selectedPropertyType.icon className="w-3 h-3 text-emerald-600" />
                    <span>{selectedPropertyType.label}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ink-muted bg-[#FAF8F5] border border-border-subtle/70 px-2.5 py-0.5 rounded-full">
                    <MapPin className="w-3 h-3 text-brand-forest/70" />
                    <span>
                      {formData.city || 'City'}, {formData.state || 'State'}
                    </span>
                  </span>
                </div>

                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-black tracking-tight leading-tight">
                  {formData.hotel_name.trim() || 'Your Hotel Property'}
                </h3>

                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {formData.property_description.trim() ||
                    'Modern cloud hospitality operations powered by Grove PMS multi-tenant architecture.'}
                </p>
              </div>

              {/* Architectural Floor & Room Matrix Visualizer */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-brand-forest" />
                    <span>Architectural Room Grid</span>
                  </span>
                  <span className="text-[11px] font-semibold text-brand-forest">
                    {builderStats?.totalRooms ?? formData.total_rooms} Rooms • {builderStats?.totalFloors ?? formData.total_floors} Floors
                  </span>
                </div>

                {/* Live Floor Matrix Display */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-border-subtle/80 space-y-2.5 max-h-[280px] overflow-y-auto">
                  {builderFloors.length > 0 ? (
                    builderFloors
                      .slice()
                      .reverse()
                      .map((floor) => {
                        const floorRooms = builderRooms.filter((r) => r.floor === floor.floorNumber);
                        return (
                          <div key={floor.id} className="space-y-1 text-[10px]">
                            <div className="flex items-center justify-between text-ink-muted font-mono font-medium">
                              <span>{floor.name}</span>
                              <span className="text-[9.5px] font-sans text-brand-forest font-semibold">{floorRooms.length} rooms</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {floorRooms.length > 0 ? (
                                floorRooms.map((room) => (
                                  <div
                                    key={room.id}
                                    title={`${room.roomNumber} - ${room.categoryName} (₹${room.baseRate}/night)`}
                                    className="px-1.5 py-0.5 rounded-md bg-white border border-border-subtle/80 font-mono text-[9.5px] font-medium text-black shadow-2xs flex items-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>{room.roomNumber}</span>
                                    <span className="text-[8.5px] text-ink-muted font-sans truncate max-w-[48px]">
                                      {room.categoryName}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] text-ink-muted italic">No rooms allocated</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-3 text-ink-muted text-xs">
                      No floors configured yet
                    </div>
                  )}
                </div>

                {builderStats && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-500/20 flex items-center justify-between text-[11px]">
                    <span className="text-ink-muted">Nightly Inventory Value:</span>
                    <span className="font-bold text-emerald-800 font-mono">
                      ₹{builderStats.estimatedNightlyRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Facilities Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest/70 block">
                  Active Operational Modules
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {formData.facilities.map((facId) => {
                    const facility = FACILITIES_OPTIONS.find((f) => f.id === facId);
                    if (!facility) return null;
                    const IconComp = facility.icon;
                    return (
                      <span
                        key={facId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-border-subtle/70 text-[10.5px] font-medium text-black"
                      >
                        <IconComp className="w-3 h-3 text-brand-forest" />
                        <span>{facility.tag}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Primary Owner Card Preview */}
              {formData.owner_full_name && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-border-subtle/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-brand-forest text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {formData.owner_full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-black block truncate">
                        {formData.owner_full_name}
                      </span>
                      <span className="text-[11px] text-ink-muted truncate block">
                        {formData.email || 'Owner login pending'}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                    <Crown className="w-3 h-3 text-emerald-600" />
                    <span>Owner</span>
                  </span>
                </div>
              )}

              {/* Security & Multi-Tenancy Guarantee Badge */}
              <div className="pt-2 border-t border-border-subtle/80 flex items-center justify-between text-[11px] text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PostgreSQL Row-Level Security</span>
                </span>
                <span className="font-mono text-[10px]">99.9% Uptime</span>
              </div>
            </div>

            {/* Testimonial / Social Proof Snippet */}
            <div className="p-4 rounded-2xl bg-white/70 border border-border-subtle/60 text-xs text-ink-muted flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-sand flex items-center justify-center text-brand-forest shrink-0 font-serif font-bold text-xs">
                GV
              </div>
              <div>
                <p className="italic text-[11.5px] leading-relaxed text-ink">
                  &ldquo;Grove unified our 19 boutique rooms, dining KOTs, and evening folios without paper chaos.&rdquo;
                </p>
                <span className="text-[10px] text-brand-forest font-semibold block mt-1">
                  Hotel Greenery View • Gangtok, Sikkim
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER NOTICE ── */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-ink-muted border-t border-border-subtle/60 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Grove Operating System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-ink-muted">
            <Link href="/privacy-policy" className="hover:text-brand-forest">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-brand-forest">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-brand-forest">
              Assisted Onboarding
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
