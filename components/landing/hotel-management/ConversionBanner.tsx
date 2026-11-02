'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import GroveButton from '@/components/shared/GroveButton';

export default function ConversionBanner() {
  return (
    <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-[36px] bg-gradient-to-b from-[#1D403A] to-[#14322D] text-white p-8 sm:p-14 lg:p-16 border border-white/15 shadow-[0_24px_70px_-12px_rgba(20,38,34,0.30)] relative overflow-hidden">
        {/* Ambient Top Glow & Radial Flare */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-brand-forest-light/20 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Modernize Your Property Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.12]">
            Your Hotel Deserves a Smarter Operating System.
          </h2>

          <p className="text-sm sm:text-lg text-white/80 leading-relaxed max-w-2xl">
            Bring your front desk, housekeeping, billing and daily operations together with Grove PMS. Fast onboarding, transparent pricing at ₹999/month, and zero server maintenance.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <GroveButton
              href="/register-hotel"
              variant="primary"
              size="lg"
              withArrow
              className="w-full sm:w-auto bg-white hover:bg-brand-sand text-brand-forest shadow-lg"
            >
              Start Free Trial
            </GroveButton>

            <Link
              href="/contact"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-center text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Book a Personal Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/70">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full ₹999/mo transparent pricing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dedicated onboarding support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>No long-term lock-in</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

