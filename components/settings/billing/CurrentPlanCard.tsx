'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Building2,
  CreditCard,
  ArrowUpRight,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { BillingDashboardData } from './types';

interface CurrentPlanCardProps {
  data: BillingDashboardData;
  onOpenCancelModal: () => void;
  onOpenResumeModal?: () => void;
  onOpenBillingModal: () => void;
  isResuming?: boolean;
}

export default function CurrentPlanCard({
  data,
  onOpenCancelModal,
  onOpenResumeModal,
  onOpenBillingModal,
  isResuming,
}: CurrentPlanCardProps) {
  const { hotel, subscription, access, user } = data;
  const canManage = user.canManage;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // Determine visual status badge style
  const getStatusBadge = () => {
    switch (access.accessState) {
      case 'active':
        if (access.cancellationPending) {
          return {
            label: 'Active (Cancelling)',
            classes: 'bg-status-amber/10 border-status-amber/25 text-status-amber',
            dot: 'bg-status-amber',
          };
        }
        return {
          label: 'Active Mandate',
          classes: 'bg-status-green/10 border-status-green/25 text-status-green',
          dot: 'bg-status-green',
        };
      case 'grace_period':
        return {
          label: 'Grace Period',
          classes: 'bg-status-amber/10 border-status-amber/25 text-status-amber',
          dot: 'bg-status-amber',
        };
      case 'suspended':
        return {
          label: 'Suspended',
          classes: 'bg-status-red/10 border-status-red/25 text-status-red',
          dot: 'bg-status-red',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          classes: 'bg-status-red/10 border-status-red/25 text-status-red',
          dot: 'bg-status-red',
        };
      case 'trial':
        return {
          label: 'Onboarding Trial',
          classes: 'bg-brand-forest/10 border-brand-forest/25 text-brand-forest',
          dot: 'bg-brand-forest',
        };
      case 'expired':
      default:
        return {
          label: 'Expired',
          classes: 'bg-ink-muted/10 border-ink-muted/20 text-ink-muted',
          dot: 'bg-ink-muted',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-[#1C2D29]/12 shadow-[0_4px_20px_rgba(20,28,26,0.03)] overflow-hidden relative">
      {/* Subtle top specular line */}
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
        aria-hidden="true"
      />

      <div className="p-6 sm:p-7 space-y-6">
        {/* Header row: Plan title, badge, and hotel name */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-brand-forest tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Current SaaS Plan
              </span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320]">
              {subscription?.plan_name || 'Grove Operating System'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium pt-0.5">
              <Building2 className="w-3.5 h-3.5 text-brand-forest" />
              <span>Assigned Property:</span>
              <strong className="text-[#142320] font-semibold">{hotel.name}</strong>
            </div>
          </div>

          {/* Right badge & price */}
          <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
              {badge.label}
            </span>
            <div className="mt-1">
              <span className="font-serif font-bold text-2xl text-[#142320]">₹999</span>
              <span className="text-xs text-ink-muted font-medium"> / month</span>
            </div>
          </div>
        </div>

        {/* ── CONTEXTUAL ALERT BANNERS ── */}
        {access.cancellationPending && (
          <div className="p-4 rounded-xl bg-status-amber/10 border border-status-amber/25 text-xs text-[#142320] flex items-start gap-3">
            <Clock className="w-4 h-4 text-status-amber shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-status-amber">
                Cancellation Scheduled — Paid-Through Period Active
              </strong>
              <p className="mt-0.5 text-ink-muted leading-relaxed">
                Your subscription has been cancelled and auto-renewal is disabled. You maintain full access to all Grove PMS features until{' '}
                <strong className="text-[#142320]">{formatDate(subscription?.current_period_end)}</strong>.
              </p>
            </div>
          </div>
        )}

        {access.isInGracePeriod && !access.cancellationPending && (
          <div className="p-4 rounded-xl bg-status-amber/10 border border-status-amber/25 text-xs text-[#142320] flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-status-amber shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-status-amber">
                Mandate Renewal Pending (Grace Period Active)
              </strong>
              <p className="mt-0.5 text-ink-muted leading-relaxed">
                Razorpay was unable to charge your payment method on schedule. Operations remain enabled during your grace period ending{' '}
                <strong className="text-[#142320]">{formatDate(access.gracePeriodEndsAt?.toISOString())}</strong>. Please ensure your card supports online e-mandates.
              </p>
            </div>
          </div>
        )}

        {access.accessState === 'suspended' && (
          <div className="p-4 rounded-xl bg-status-red/10 border border-status-red/25 text-xs text-[#142320] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-status-red">
                Subscription Operations Suspended
              </strong>
              <p className="mt-0.5 text-ink-muted leading-relaxed">
                All scheduled retry attempts for your monthly subscription failed. Operational booking features are paused until your mandate is resumed or re-subscribed.
              </p>
            </div>
          </div>
        )}

        {/* ── PLAN SPECIFICATIONS GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {/* 1. Next Billing Date */}
          <div className="p-3.5 rounded-xl bg-brand-sand/35 border border-[#1C2D29]/8">
            <span className="text-[11px] font-medium text-ink-muted block uppercase tracking-wider">
              Next Billing Date
            </span>
            <span className="font-serif font-bold text-sm sm:text-base text-[#142320] mt-1 block">
              {access.cancellationPending
                ? 'Cancelled (No charge)'
                : formatDate(subscription?.next_billing_at || subscription?.current_period_end)}
            </span>
          </div>

          {/* 2. Current Period Start */}
          <div className="p-3.5 rounded-xl bg-brand-sand/35 border border-[#1C2D29]/8">
            <span className="text-[11px] font-medium text-ink-muted block uppercase tracking-wider">
              Period Start
            </span>
            <span className="font-serif font-bold text-sm sm:text-base text-[#142320] mt-1 block">
              {formatDate(subscription?.current_period_start || subscription?.created_at)}
            </span>
          </div>

          {/* 3. Current Period End */}
          <div className="p-3.5 rounded-xl bg-brand-sand/35 border border-[#1C2D29]/8">
            <span className="text-[11px] font-medium text-ink-muted block uppercase tracking-wider">
              Period End
            </span>
            <span className="font-serif font-bold text-sm sm:text-base text-[#142320] mt-1 block">
              {formatDate(subscription?.current_period_end)}
            </span>
          </div>

          {/* 4. Subscription Start Date */}
          <div className="p-3.5 rounded-xl bg-brand-sand/35 border border-[#1C2D29]/8">
            <span className="text-[11px] font-medium text-ink-muted block uppercase tracking-wider">
              Member Since
            </span>
            <span className="font-serif font-bold text-sm sm:text-base text-[#142320] mt-1 block">
              {formatDate(subscription?.created_at)}
            </span>
          </div>
        </div>

        {/* ── ACTION BUTTONS ROW ── */}
        <div className="pt-2 border-t border-[#1C2D29]/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-ink-muted flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-brand-forest" />
            <span>Recurring monthly mandate via Razorpay</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Update Billing Profile Button */}
            <button
              type="button"
              onClick={onOpenBillingModal}
              disabled={!canManage}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
                canManage
                  ? 'bg-white hover:bg-brand-sand/40 text-ink border-[#1C2D29]/15 hover:border-[#1C2D29]/30 cursor-pointer'
                  : 'bg-white/50 text-ink-muted border-[#1C2D29]/10 cursor-not-allowed'
              }`}
              title={canManage ? 'Edit legal invoicing name & GSTIN' : 'Only property owners may edit billing details'}
            >
              Update Billing Details
            </button>

            {/* Resume button if halted/paused */}
            {(subscription?.status === 'halted' || access.accessState === 'suspended') && onOpenResumeModal && (
              <button
                type="button"
                onClick={onOpenResumeModal}
                disabled={!canManage || isResuming}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-forest text-white hover:bg-[#15302B] transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResuming ? 'animate-spin' : ''}`} />
                <span>Resume Subscription</span>
              </button>
            )}

            {/* Cancel Button (when active and not already cancelling) */}
            {access.isAccessAllowed && !access.cancellationPending && subscription?.status === 'active' && (
              <button
                type="button"
                onClick={onOpenCancelModal}
                disabled={!canManage}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
                  canManage
                    ? 'bg-white hover:bg-status-red/5 text-status-red border-status-red/25 hover:border-status-red/50 cursor-pointer'
                    : 'bg-white/50 text-ink-muted border-[#1C2D29]/10 cursor-not-allowed'
                }`}
                title={canManage ? 'Cancel upcoming monthly subscription renewals' : 'Only property owners may cancel subscriptions'}
              >
                Cancel Subscription
              </button>
            )}

            {/* Re-subscribe CTA when expired or cancelled without active period */}
            {(!access.isAccessAllowed || access.accessState === 'cancelled' || access.accessState === 'expired') && (
              <Link
                href="/subscription"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-forest hover:bg-[#15302B] text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Subscribe to Grove</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

