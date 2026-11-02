import React from 'react';
import Link from 'next/link';
import GroveButton from '@/components/shared/GroveButton';
import { Sparkles, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

interface FeatureConversionBannerProps {
  title: string;
  subtitle: string;
  primaryCtaText?: string;
}

export default function FeatureConversionBanner({
  title,
  subtitle,
  primaryCtaText = 'Start Free 14-Day Trial',
}: FeatureConversionBannerProps) {
  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#1D403A] via-[#163630] to-[#0E2420] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-[0_20px_50px_rgba(20,40,36,0.25)] border border-white/10">
        {/* Glow flare */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-brand-sand text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-status-green" />
            <span>Grove Operating System</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            {title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <GroveButton
              href="/register-hotel"
              variant="primary"
              size="lg"
              withArrow
              className="bg-white text-brand-forest hover:bg-brand-sand font-bold"
            >
              {primaryCtaText}
            </GroveButton>
            <GroveButton
              href="/contact"
              variant="secondary"
              size="lg"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-semibold"
            >
              Book a Live Demo
            </GroveButton>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-5 sm:gap-8 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-green" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-status-green" />
              <span>Full Indian GST compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-status-green" />
              <span>Set up in under 15 minutes</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

