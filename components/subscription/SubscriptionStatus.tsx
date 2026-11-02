'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Building2,
  Shield,
  Percent,
} from 'lucide-react';
import { GROVE_SUBSCRIPTION_PLAN } from './types';

interface SubscriptionStatusProps {
  hotelName?: string;
  status?: 'ready' | 'active' | 'pending' | 'processing';
  nextBillingDate?: string;
  className?: string;
}

export default function SubscriptionStatus({
  hotelName = 'Selected Property',
  status = 'ready',
  nextBillingDate,
  className = '',
}: SubscriptionStatusProps) {
  const plan = GROVE_SUBSCRIPTION_PLAN;

  const defaultNextDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  })();

  const nextDate = nextBillingDate || defaultNextDate;

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 relative overflow-hidden bg-white/70 backdrop-blur-md border border-[#1C2D29]/10 shadow-[0_4px_16px_rgba(20,28,26,0.03)] text-xs text-[#142320] ${className}`}
    >
      {/* Delicate top-edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
        aria-hidden="true"
      />

      {/* Header with Status Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1C2D29]/8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-forest/10 flex items-center justify-center text-brand-forest">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs text-[#142320]">
            Subscription Summary
          </span>
        </div>

        {status === 'active' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-green/10 border border-status-green/20 text-status-green font-semibold text-[10.5px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active Subscription</span>
          </span>
        )}

        {status === 'pending' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-amber/10 border border-status-amber/20 text-status-amber font-semibold text-[10.5px]">
            <Clock className="w-3 h-3" />
            <span>Pending Activation</span>
          </span>
        )}

        {status === 'processing' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-forest/10 border border-brand-forest/20 text-brand-forest font-semibold text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-brand-forest animate-ping" />
            <span>Processing</span>
          </span>
        )}

        {status === 'ready' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-forest/8 text-brand-forest font-semibold text-[10.5px]">
            <Sparkles className="w-3 h-3" />
            <span>Standard Plan</span>
          </span>
        )}
      </div>

      {/* 2x2 Grid Summary Data */}
      <div className="grid grid-cols-2 gap-3 pt-3">
        {/* Plan Name */}
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-ink-muted font-medium block">
            Plan
          </span>
          <span className="font-bold text-[#142320] block mt-0.5">
            {plan.name}
          </span>
        </div>

        {/* Price & Cycle */}
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-ink-muted font-medium block">
            Price &amp; Billing
          </span>
          <span className="font-bold text-brand-forest block mt-0.5">
            ₹{plan.monthlyPrice}/mo <span className="text-[10px] text-ink-muted font-normal">+18% GST</span>
          </span>
        </div>

        {/* Selected Hotel Property */}
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-ink-muted font-medium block">
            Hotel Property
          </span>
          <span className="font-semibold text-[#142320] block mt-0.5 truncate">
            {hotelName.trim() || 'Your Hotel Property'}
          </span>
        </div>

        {/* Commission */}
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-ink-muted font-medium block">
            Commission
          </span>
          <span className="font-semibold text-status-green block mt-0.5">
            Zero (0% Commission)
          </span>
        </div>
      </div>

      {/* Next Billing Info Banner */}
      <div className="mt-3.5 pt-3 border-t border-[#1C2D29]/8 flex items-center justify-between text-[11px] text-ink-muted">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-brand-forest" />
          <span>Next Billing Date:</span>
        </span>
        <span className="font-semibold text-[#142320]">{nextDate}</span>
      </div>
    </div>
  );
}

