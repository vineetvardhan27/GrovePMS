'use client';

import React from 'react';
import { MapPin, FileText, AlertCircle, Building, Hash } from 'lucide-react';
import { CheckoutFormData, CheckoutErrors, INDIAN_STATES } from './types';

interface BillingDetailsFormProps {
  formData: CheckoutFormData;
  errors: CheckoutErrors;
  disabled?: boolean;
  onChange: (field: keyof CheckoutFormData, value: string | boolean) => void;
}

export default function BillingDetailsForm({
  formData,
  errors,
  disabled = false,
  onChange,
}: BillingDetailsFormProps) {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-white/70 backdrop-blur-md border border-[#1C2D29]/10 shadow-[0_8px_24px_rgba(20,28,26,0.04)] transition-all">
      {/* Delicate specular highlight */}
      <div
        className="pointer-events-none absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
        aria-hidden="true"
      />

      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-forest/8 text-brand-forest text-[11px] font-semibold tracking-wide uppercase mb-1.5">
          <MapPin className="w-3 h-3 text-brand-forest" />
          <span>Invoicing &amp; Tax</span>
        </div>
        <h2 className="font-serif font-bold text-lg sm:text-xl text-[#142320]">
          Billing Address &amp; GSTIN
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Provide your property billing address for compliant tax invoice generation.
        </p>
      </div>

      <div className="space-y-4">
        {/* Billing Street Address */}
        <div>
          <label htmlFor="checkout-address" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
            Billing Street Address <span className="text-status-red">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="checkout-address"
              type="text"
              required
              disabled={disabled}
              value={formData.billingAddress}
              onChange={(e) => onChange('billingAddress', e.target.value)}
              placeholder="e.g. 14 Hill View Road, Near Mall Road"
              aria-invalid={Boolean(errors.billingAddress)}
              aria-describedby={errors.billingAddress ? 'address-error' : undefined}
              className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.billingAddress
                  ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                  : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
              }`}
            />
          </div>
          {errors.billingAddress && (
            <p id="address-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.billingAddress}</span>
            </p>
          )}
        </div>

        {/* City and State & PIN Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* City */}
          <div>
            <label htmlFor="checkout-city" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
              City <span className="text-status-red">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
                <Building className="w-4 h-4" />
              </div>
              <input
                id="checkout-city"
                type="text"
                required
                disabled={disabled}
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="e.g. Mussoorie"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? 'city-error' : undefined}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.city
                    ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                    : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
                }`}
              />
            </div>
            {errors.city && (
              <p id="city-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.city}</span>
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label htmlFor="checkout-state" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
              State <span className="text-status-red">*</span>
            </label>
            <select
              id="checkout-state"
              required
              disabled={disabled}
              value={formData.state}
              onChange={(e) => onChange('state', e.target.value)}
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? 'state-error' : undefined}
              className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.state
                  ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                  : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
              }`}
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && (
              <p id="state-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.state}</span>
              </p>
            )}
          </div>

          {/* PIN Code */}
          <div>
            <label htmlFor="checkout-pincode" className="block text-xs sm:text-sm font-semibold text-[#142320] mb-1.5">
              PIN Code <span className="text-status-red">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="checkout-pincode"
                type="text"
                required
                maxLength={6}
                disabled={disabled}
                value={formData.pincode}
                onChange={(e) => onChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="248179"
                aria-invalid={Boolean(errors.pincode)}
                aria-describedby={errors.pincode ? 'pincode-error' : undefined}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.pincode
                    ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                    : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
                }`}
              />
            </div>
            {errors.pincode && (
              <p id="pincode-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.pincode}</span>
              </p>
            )}
          </div>
        </div>

        {/* GSTIN (Optional) */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="checkout-gstin" className="block text-xs sm:text-sm font-semibold text-[#142320]">
              GSTIN <span className="text-ink-muted text-xs font-normal">(Optional for Input Tax Credit)</span>
            </label>
            <span className="text-[11px] text-ink-muted">15-digit alphanumeric</span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted/70">
              <FileText className="w-4 h-4" />
            </div>
            <input
              id="checkout-gstin"
              type="text"
              maxLength={15}
              disabled={disabled}
              value={formData.gstin}
              onChange={(e) => onChange('gstin', e.target.value.toUpperCase().slice(0, 15))}
              placeholder="e.g. 07AAACH7409R1ZZ"
              aria-invalid={Boolean(errors.gstin)}
              aria-describedby={errors.gstin ? 'gstin-error' : undefined}
              className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border text-sm text-[#142320] font-mono placeholder:font-sans placeholder:text-ink-muted/40 transition-colors bg-white/80 focus:bg-white focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.gstin
                  ? 'border-status-red/60 focus:ring-status-red/20 focus:border-status-red'
                  : 'border-[#1C2D29]/15 focus:ring-brand-forest/20 focus:border-brand-forest'
              }`}
            />
          </div>
          {errors.gstin ? (
            <p id="gstin-error" className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.gstin}</span>
            </p>
          ) : (
            <p className="text-[11px] text-ink-muted mt-1.5">
              If provided, tax invoices will include your GSTIN for claiming B2B input tax credit under Indian GST law.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

