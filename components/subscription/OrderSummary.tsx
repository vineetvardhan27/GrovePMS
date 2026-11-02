'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { CheckoutFormData, CheckoutErrors, GROVE_SUBSCRIPTION_PLAN } from './types';

interface OrderSummaryProps {
  formData: CheckoutFormData;
  errors: CheckoutErrors;
  isSubmitting?: boolean;
  disabled?: boolean;
  onChange: (field: keyof CheckoutFormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function OrderSummary({
  formData,
  errors,
  isSubmitting = false,
  disabled = false,
  onChange,
  onSubmit,
}: OrderSummaryProps) {
  const plan = GROVE_SUBSCRIPTION_PLAN;

  // Recurring Base & GST calculation
  const monthlyBase = plan.monthlyPrice;
  const monthlyGst = Math.round(monthlyBase * plan.gstRate * 100) / 100; // ₹179.82
  const monthlyTotal = Math.round((monthlyBase + monthlyGst) * 100) / 100; // ₹1178.82

  // Optional One-time Onboarding calculation
  const hasOnboarding = formData.includeOnboarding;
  const onboardingBase = hasOnboarding ? plan.onboardingFee : 0;
  const onboardingGst = hasOnboarding ? Math.round(onboardingBase * plan.gstRate * 100) / 100 : 0;
  const onboardingTotal = onboardingBase + onboardingGst;

  // Final amount payable today
  const payableToday = Math.round((monthlyTotal + onboardingTotal) * 100) / 100;

  // Next recurring charge date (30 days from today)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);
  const formattedNextDate = nextBillingDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden bg-white/80 backdrop-blur-md border border-[#1C2D29]/12 shadow-[0_12px_32px_rgba(20,28,26,0.06)] flex flex-col justify-between">
      {/* Specular highlight */}
      <div
        className="pointer-events-none absolute inset-x-5 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
        aria-hidden="true"
      />

      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1C2D29]/10">
          <div>
            <span className="text-[10.5px] uppercase tracking-[0.14em] font-bold text-ink-muted block mb-0.5">
              Order Summary
            </span>
            <h3 className="font-serif font-bold text-xl text-[#142320]">
              {plan.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-forest/10 border border-brand-forest/15 text-brand-forest text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Full Access</span>
            </span>
          </div>
        </div>

        {/* Selected Property Callout */}
        <div className="py-3.5 px-4 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/8 mt-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted font-medium">Licensed Property:</span>
            <span className="font-semibold text-[#142320] max-w-[190px] truncate">
              {formData.hotelName.trim() || 'Your Hotel Property'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-ink-muted">
            <span>Billing Frequency:</span>
            <span className="font-semibold text-brand-forest">Monthly Recurring (Cancel Anytime)</span>
          </div>
        </div>

        {/* Core Plan Inclusions */}
        <div className="py-4 space-y-2 text-xs text-[#1C2D29]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span>Unlimited room matrix, bookings &amp; guest folios</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span>F&amp;B POS, banquet events &amp; inventory tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span>GST invoices, payments ledger &amp; daily audit reports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span className="font-semibold text-brand-forest">0% commission on any direct or front-desk bookings</span>
          </div>
        </div>

        {/* White-Glove Onboarding Optional Add-on (Strictly Non-Recurring) */}
        <div className="pt-3 pb-4 border-t border-[#1C2D29]/8">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#1C2D29]/10 bg-white/60 hover:bg-white cursor-pointer transition-all">
            <input
              type="checkbox"
              disabled={disabled || isSubmitting}
              checked={formData.includeOnboarding}
              onChange={(e) => onChange('includeOnboarding', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-forest focus:ring-brand-forest"
            />
            <div className="text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#142320]">
                  White-Glove Implementation Support
                </span>
                <span className="font-semibold text-[#142320] shrink-0">
                  +₹10,000 <span className="text-[10px] text-ink-muted font-normal">one-time</span>
                </span>
              </div>
              <p className="text-ink-muted mt-0.5 text-[11px] leading-relaxed">
                Dedicated implementation engineer configures your property details, room layouts, GST tax slabs, and conducts live staff training.
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium text-brand-forest bg-brand-forest/6 px-2 py-0.5 rounded">
                One-time setup only · Not included in recurring billing
              </span>
            </div>
          </label>
        </div>

        {/* Itemized Price Breakdown */}
        <div className="py-3 border-t border-b border-[#1C2D29]/10 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#142320]">
            <span>Monthly Recurring Subscription</span>
            <span className="font-semibold">₹{monthlyBase.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-ink-muted">
            <span className="flex items-center gap-1">
              <span>GST on Software (18%)</span>
              <span title="Goods and Services Tax on software as a service in India">
                <HelpCircle className="w-3 h-3 text-ink-muted/70" />
              </span>
            </span>
            <span>₹{monthlyGst.toFixed(2)}</span>
          </div>

          {hasOnboarding && (
            <>
              <div className="flex items-center justify-between text-[#142320] pt-1">
                <span>One-Time Onboarding Fee</span>
                <span className="font-semibold">₹{onboardingBase.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-muted">
                <span>GST on Implementation (18%)</span>
                <span>₹{onboardingGst.toFixed(2)}</span>
              </div>
            </>
          )}

          {/* Subtotal summary */}
          <div className="pt-2 border-t border-dashed border-[#1C2D29]/10 flex items-baseline justify-between">
            <span className="font-semibold text-[#142320] text-sm">Amount Due Today</span>
            <div className="text-right">
              <span className="font-serif font-bold text-2xl text-brand-forest leading-none">
                ₹{payableToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Clear Distinction of Future Recurring Charges */}
          <div className="pt-1 text-[11px] text-ink-muted flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-forest" />
              <span>Next billing on {formattedNextDate}:</span>
            </span>
            <span className="font-semibold text-[#142320]">
              ₹{monthlyTotal.toFixed(2)}/month
            </span>
          </div>
        </div>

        {/* Terms and Conditions Acceptance Checkbox */}
        <div className="pt-4">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink leading-relaxed">
            <input
              type="checkbox"
              id="checkout-agree-terms"
              disabled={disabled || isSubmitting}
              checked={formData.agreeTerms}
              onChange={(e) => onChange('agreeTerms', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-forest focus:ring-brand-forest cursor-pointer"
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="font-semibold text-brand-forest underline hover:text-brand-forest-light">
                Terms of Service
              </Link>{' '}
              and authorize Grove PMS to initiate a monthly recurring subscription of ₹{monthlyTotal.toFixed(2)}/mo until canceled.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-status-red mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.agreeTerms}</span>
            </p>
          )}
        </div>
      </div>

      {/* CTA Button and Security Badges */}
      <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isSubmitting}
          className="w-full bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] text-white font-semibold py-3.5 sm:py-4 px-6 rounded-full border border-white/25 shadow-[0_4px_16px_rgba(22,61,55,0.22),inset_0_1px_1px_rgba(255,255,255,0.30)] transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authorizing Subscription...</span>
            </span>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Proceed to Payment · ₹{payableToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {/* Security Assurances */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] text-ink-muted text-center">
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3 h-3 text-status-green" />
            <span>256-bit SSL Secure Checkout</span>
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-brand-forest" />
            <span>Cancel anytime</span>
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-status-green" />
            <span>Instant Workspace Activation</span>
          </span>
        </div>
      </div>
    </div>
  );
}

