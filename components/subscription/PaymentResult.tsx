'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Building2,
  Mail,
  ShieldCheck,
  FileText,
  PhoneCall,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { CheckoutFormData, GROVE_SUBSCRIPTION_PLAN } from './types';

interface PaymentResultProps {
  state: 'success' | 'failed' | 'pending';
  formData: CheckoutFormData;
  errorMessage?: string;
  referenceId?: string;
  onRetry: () => void;
  onSwitchState?: (newState: 'checkout' | 'success' | 'failed' | 'pending') => void;
}

export default function PaymentResult({
  state,
  formData,
  errorMessage,
  referenceId,
  onRetry,
  onSwitchState,
}: PaymentResultProps) {
  const plan = GROVE_SUBSCRIPTION_PLAN;

  const monthlyBase = plan.monthlyPrice;
  const monthlyGst = Math.round(monthlyBase * plan.gstRate * 100) / 100;
  const monthlyTotal = Math.round((monthlyBase + monthlyGst) * 100) / 100;

  const hasOnboarding = formData.includeOnboarding;
  const onboardingTotal = hasOnboarding
    ? Math.round(plan.onboardingFee * (1 + plan.gstRate) * 100) / 100
    : 0;

  const totalPaid = Math.round((monthlyTotal + onboardingTotal) * 100) / 100;

  const nextBillingDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  })();

  /* ─────────────────────────────────────────────────────────────
   * 1. SUCCESS STATE
   * ───────────────────────────────────────────────────────────── */
  if (state === 'success') {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 bg-white/80 backdrop-blur-md border border-[#1C2D29]/12 shadow-[0_16px_40px_rgba(20,28,26,0.06)] relative overflow-hidden text-center">
        {/* Specular highlight */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
          aria-hidden="true"
        />

        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-green/12 border border-status-green/25 text-status-green flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-green/10 border border-status-green/20 text-status-green text-xs font-semibold tracking-wide uppercase mt-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Authorized &amp; Confirmed</span>
        </div>

        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320] mt-3">
          Subscription Activated Successfully
        </h2>

        <p className="text-sm sm:text-base text-ink-muted mt-2 max-w-lg mx-auto leading-relaxed">
          Welcome to Grove PMS. Your property workspace has been provisioned and your monthly subscription is now active.
        </p>

        {/* Invoice / License Receipt Card */}
        <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 text-left text-xs sm:text-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2D29]/10">
            <div>
              <span className="text-[11px] text-ink-muted uppercase tracking-wider block font-medium">
                Receipt Reference
              </span>
              <span className="font-mono font-bold text-[#142320] text-sm">
                {referenceId || 'GROVE-SUB-2026-8942'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-ink-muted uppercase tracking-wider block font-medium">
                Amount Paid
              </span>
              <span className="font-serif font-bold text-base text-brand-forest">
                ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-ink-muted block text-[11px]">Hotel Property:</span>
              <span className="font-semibold text-[#142320]">
                {formData.hotelName || 'Your Hotel Property'}
              </span>
            </div>
            <div>
              <span className="text-ink-muted block text-[11px]">Account Admin:</span>
              <span className="font-semibold text-[#142320]">
                {formData.ownerName || 'Hotel Owner'} ({formData.email || 'admin@hotel.com'})
              </span>
            </div>
            <div>
              <span className="text-ink-muted block text-[11px]">Subscription Plan:</span>
              <span className="font-semibold text-[#142320]">
                Grove Operating System (₹999/mo + GST)
              </span>
            </div>
            <div>
              <span className="text-ink-muted block text-[11px]">Next Renewal Date:</span>
              <span className="font-semibold text-brand-forest">
                {nextBillingDate} (₹{monthlyTotal.toFixed(2)})
              </span>
            </div>
          </div>

          {hasOnboarding && (
            <div className="pt-2 border-t border-[#1C2D29]/8 text-xs flex items-center justify-between text-brand-forest">
              <span>White-Glove Implementation Package:</span>
              <span className="font-semibold">Activated (Engineer Assigned)</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] text-white font-semibold py-3.5 px-8 rounded-full border border-white/25 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group text-sm hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Go to Hotel Dashboard</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/pricing"
            className="w-full sm:w-auto bg-white/70 hover:bg-white text-ink font-semibold py-3.5 px-6 rounded-full border border-[#1C2D29]/15 shadow-2xs transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-brand-forest" />
            <span>Return to Pricing</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
   * 2. FAILED STATE
   * ───────────────────────────────────────────────────────────── */
  if (state === 'failed') {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 bg-white/80 backdrop-blur-md border border-status-red/20 shadow-[0_16px_40px_rgba(200,76,62,0.06)] relative overflow-hidden text-center">
        {/* Specular highlight */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
          aria-hidden="true"
        />

        {/* Failed Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-red/10 border border-status-red/25 text-status-red flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-red/10 border border-status-red/20 text-status-red text-xs font-semibold tracking-wide uppercase mt-5">
          <span>Authorization Incomplete</span>
        </div>

        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320] mt-3">
          Payment Authorization Declined
        </h2>

        <p className="text-sm sm:text-base text-ink-muted mt-2 max-w-lg mx-auto leading-relaxed">
          {errorMessage ||
            'Your financial institution or card issuer was unable to authorize the recurring monthly subscription charge.'}
          <strong className="block text-[#142320] mt-1 font-semibold">
            No money has been deducted from your account.
          </strong>
        </p>

        {/* Troubleshooting Checklist */}
        <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-brand-sand/35 border border-[#1C2D29]/10 text-left text-xs sm:text-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2D29]/10">
            <span className="font-semibold text-[#142320]">
              Common Resolution Steps:
            </span>
            <span className="font-mono text-xs text-status-red font-semibold">
              ERR_AUTH_DECLINED
            </span>
          </div>

          <ul className="space-y-2 text-xs text-ink-muted list-disc list-inside">
            <li>
              <strong className="text-[#142320]">Recurring E-Mandate Limit:</strong> Verify your debit/credit card supports automated online recurring mandates under RBI / banking guidelines.
            </li>
            <li>
              <strong className="text-[#142320]">Daily Transaction Limit:</strong> Ensure international or online transaction limits are enabled on your net banking portal.
            </li>
            <li>
              <strong className="text-[#142320]">Incorrect Details:</strong> Double check billing address, PIN code, and contact information.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] text-white font-semibold py-3.5 px-8 rounded-full border border-white/25 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group text-sm hover:-translate-y-0.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-45" />
            <span>Try Again / Edit Details</span>
          </button>

          <Link
            href="/contact"
            className="w-full sm:w-auto bg-white/70 hover:bg-white text-ink font-semibold py-3.5 px-6 rounded-full border border-[#1C2D29]/15 shadow-2xs transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-brand-forest" />
            <span>Contact Billing Support</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
   * 3. PENDING STATE
   * ───────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 bg-white/80 backdrop-blur-md border border-status-amber/25 shadow-[0_16px_40px_rgba(217,119,6,0.06)] relative overflow-hidden text-center">
      {/* Specular highlight */}
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
        aria-hidden="true"
      />

      {/* Pending Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-amber/12 border border-status-amber/25 text-status-amber flex items-center justify-center mx-auto shadow-sm">
        <Clock className="w-9 h-9 sm:w-11 sm:h-11 animate-pulse" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-amber/10 border border-status-amber/20 text-status-amber text-xs font-semibold tracking-wide uppercase mt-5">
        <span>Verification In Progress</span>
      </div>

      <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320] mt-3">
        Subscription Pending Activation
      </h2>

      <p className="text-sm sm:text-base text-ink-muted mt-2 max-w-lg mx-auto leading-relaxed">
        We have received your property registration and payment authorization request. Mandate confirmation and bank clearing are currently processing.
      </p>

      {/* Progress timeline */}
      <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 text-left text-xs space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2D29]/10 font-semibold text-[#142320]">
          <span>Activation Progress</span>
          <span className="text-status-amber">Typically 5–15 minutes</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-status-green">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium text-[#142320]">Hotel property profile registered: {formData.hotelName || 'Your Hotel'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-status-amber">
            <span className="w-4 h-4 rounded-full border-2 border-status-amber border-t-transparent animate-spin shrink-0" />
            <span className="font-medium text-[#142320]">Awaiting mandate webhook confirmation from issuing bank</span>
          </div>
          <div className="flex items-center gap-2.5 text-ink-muted/60">
            <span className="w-4 h-4 rounded-full border border-ink-muted/30 shrink-0" />
            <span>Grove PMS full workspace license provisioning</span>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-ink-muted border-t border-[#1C2D29]/8">
          A confirmation email will be delivered to <strong className="text-[#142320]">{formData.email || 'your registered email'}</strong> the moment activation completes.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (onSwitchState) onSwitchState('success');
          }}
          className="w-full sm:w-auto bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] text-white font-semibold py-3.5 px-8 rounded-full border border-white/25 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Check Status / Refresh</span>
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:w-auto bg-white/70 hover:bg-white text-ink font-semibold py-3.5 px-6 rounded-full border border-[#1C2D29]/15 shadow-2xs transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Edit Checkout Form</span>
        </button>
      </div>
    </div>
  );
}

