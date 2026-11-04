'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import SubscriptionCheckout from '@/components/subscription/SubscriptionCheckout';
import { PrepopulatedProfile } from '@/components/subscription/types';
import { ArrowLeft, Layers, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface SubscriptionClientProps {
  staffName?: string;
  staffRole?: string;
  prepopulatedProfile?: PrepopulatedProfile;
}

export default function SubscriptionClient({
  staffName,
  staffRole,
  prepopulatedProfile,
}: SubscriptionClientProps) {
  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 overflow-x-hidden relative flex flex-col justify-between">
      {/* Subtle background grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-85"
        aria-hidden="true"
      />

      {/* Public Header */}
      <PublicHeader staffName={staffName} staffRole={staffRole} />

      <main className="flex-1 pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Pricing Overview</span>
            </Link>
          </div>

          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-3 sm:mb-4 shadow-2xs">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={16}
                height={16}
                className="w-4 h-4 object-contain shrink-0"
              />
              <span>Grove PMS — Hotel License Activation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
              Activate Your Hotel License.
            </h1>

            <p className="mt-3 text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
              Complete your subscription for <strong className="text-[#142320] font-semibold">Grove Operating System</strong> at{' '}
              <strong className="text-brand-forest font-semibold">₹999/month</strong>. Monthly recurring, zero booking commissions, and full feature access.
            </p>
          </div>

          {/* Subscription Checkout Orchestrator */}
          <SubscriptionCheckout prepopulatedProfile={prepopulatedProfile} />

          {/* Bottom Trust & Compliance Guarantee */}
          <div className="mt-14 pt-8 border-t border-[#1C2D29]/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-ink-muted">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-[#1C2D29]/10 flex items-center justify-center shrink-0 text-brand-forest shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#142320] font-semibold block">Transparent Pricing</strong>
                <p className="mt-0.5 leading-relaxed">
                  ₹999/mo flat subscription. No surprise fee escalations or hidden booking commissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-[#1C2D29]/10 flex items-center justify-center shrink-0 text-brand-forest shadow-2xs">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#142320] font-semibold block">Cancel Anytime</strong>
                <p className="mt-0.5 leading-relaxed">
                  No multi-year lock-in contracts. You control your subscription directly from your settings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-[#1C2D29]/10 flex items-center justify-center shrink-0 text-brand-forest shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#142320] font-semibold block">White-Glove Support Available</strong>
                <p className="mt-0.5 leading-relaxed">
                  Need custom room mapping or staff training? Request our dedicated onboarding team at setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

