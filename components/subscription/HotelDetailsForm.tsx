'use client';

import React from 'react';
import { Building2, User, Mail, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { CheckoutFormData, CheckoutErrors } from './types';

interface HotelDetailsFormProps {
  formData: CheckoutFormData;
  errors: CheckoutErrors;
  disabled?: boolean;
  isPrepopulated?: boolean;
  onChange: (field: keyof CheckoutFormData, value: string | boolean) => void;
}

export default function HotelDetailsForm({
  formData,
  errors,
  disabled = false,
  isPrepopulated = false,
  onChange,
}: HotelDetailsFormProps) {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-white/70 backdrop-blur-md border border-[#1C2D29]/10 shadow-[0_8px_24px_rgba(20,28,26,0.04)] transition-all">
      {/* Delicate specular highlight */}
      <div
        className="pointer-events-none absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-forest/8 text-brand-forest text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Building2 className="w-3 h-3 text-brand-forest" />
            <span>Property &amp; Contact</span>
          </div>
          <h2 className="font-serif font-bold text-lg sm:text-xl text-[#142320]">
            Hotel &amp; Owner Profile
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Identify the hotel property and primary administrative contact for your Grove PMS workspace.
          </p>
        </div>

        {isPrepopulated && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-green/10 border border-status-green/20 text-status-green text-[11px] font-medium shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Prepopulated from profile</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Hotel / Property Name */}
        <div>
          <label htmlFor="checkout-hotel-name" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
            Hotel / Property Name <span className="text-status-red">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              id="checkout-hotel-name"
              type="text"
              required
              disabled={disabled}
              value={formData.hotelName}
              onChange={(e) => onChange('hotelName', e.target.value)}
              placeholder="e.g. Greenery View Boutique Resort"
              aria-invalid={Boolean(errors.hotelName)}
              aria-describedby={errors.hotelName ? 'hotel-name-error' : undefined}
              className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.hotelName
                  ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                  : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
              }`}
            />
          </div>
          {errors.hotelName && (
            <p id="hotel-name-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.hotelName}</span>
            </p>
          )}
        </div>

        {/* Owner / Contact Person */}
        <div>
          <label htmlFor="checkout-owner-name" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
            Owner / Contact Person <span className="text-status-red">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
              <User className="w-4 h-4" />
            </div>
            <input
              id="checkout-owner-name"
              type="text"
              required
              disabled={disabled}
              value={formData.ownerName}
              onChange={(e) => onChange('ownerName', e.target.value)}
              placeholder="e.g. Rahul Sharma"
              aria-invalid={Boolean(errors.ownerName)}
              aria-describedby={errors.ownerName ? 'owner-name-error' : undefined}
              className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.ownerName
                  ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                  : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
              }`}
            />
          </div>
          {errors.ownerName && (
            <p id="owner-name-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.ownerName}</span>
            </p>
          )}
        </div>

        {/* Email Address & Phone Number (2 columns on sm) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkout-email" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
              Email Address <span className="text-status-red">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="checkout-email"
                type="email"
                required
                disabled={disabled}
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="owner@hotel.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.email
                    ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                    : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="checkout-phone" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
              Phone Number <span className="text-status-red">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="checkout-phone"
                type="tel"
                required
                disabled={disabled}
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.phone
                    ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                    : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
                }`}
              />
            </div>
            {errors.phone && (
              <p id="phone-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

