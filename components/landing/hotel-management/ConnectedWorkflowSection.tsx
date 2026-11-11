'use client';

import React from 'react';
import {
  Calendar,
  KeyRound,
  Sparkles,
  UtensilsCrossed,
  Receipt,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function ConnectedWorkflowSection() {
  const steps = [
    {
      num: '01',
      title: 'Reservation',
      subtitle: 'Booking & Room Allocation',
      description:
        'Direct booking capture, OTA channel syncing, and automatic inventory deduction with instant room allocation.',
      icon: Calendar,
      tag: 'Step 1',
    },
    {
      num: '02',
      title: 'Front Desk',
      subtitle: 'Arrival & Key Issuance',
      description:
        'Express guest check-in, mandatory government ID recording, tariff lock, and physical key assignment in under 60 seconds.',
      icon: KeyRound,
      tag: 'Step 2',
    },
    {
      num: '03',
      title: 'Housekeeping',
      subtitle: 'Live Readiness Status',
      description:
        'Floor teams update rooms through Dirty, In-Progress, Inspected, and Ready states directly from mobile browsers.',
      icon: Sparkles,
      tag: 'Step 3',
    },
    {
      num: '04',
      title: 'Restaurant & POS',
      subtitle: 'Direct Room Charge Posting',
      description:
        'Table orders, room service KOTs, minibar, and banquet charges post automatically to the central guest folio.',
      icon: UtensilsCrossed,
      tag: 'Step 4',
    },
    {
      num: '05',
      title: 'Billing & Checkout',
      subtitle: 'Unified GST Invoicing',
      description:
        'Single-click folio consolidation, split payments (Cash, UPI, Card), automated GST invoicing, and instant check-out release.',
      icon: Receipt,
      tag: 'Step 5',
    },
  ];

  return (
    <section className="py-20 sm:py-28 landing-section-flow border-y border-[#1C2D29]/8 dark:border-[rgba(137,184,153,0.12)] relative overflow-hidden">
      {/* Soft hospitality ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 50% 20%, rgba(66, 201, 149, 0.065) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest dark:bg-[#17352A] dark:border-[#42C995]/25 dark:text-[#42C995] text-xs font-semibold tracking-wider uppercase">
            <span>Operational Flow</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black dark:text-[#F1F5F2] tracking-tight leading-[1.15]">
            One Connected Workflow.
            <br className="hidden sm:inline" /> From Check-in to Checkout.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted dark:text-[#A9BDB1] leading-relaxed max-w-2xl mx-auto">
            Experience how Grove PMS connects your entire team without paper chits, repeated phone calls, or fragmented software tools.
          </p>
        </div>

        {/* Desktop Connected Horizontal Flow */}
        <div className="hidden lg:block relative">
          {/* Continuous connecting dashed line through all nodes */}
          <div
            className="absolute top-1/4 left-10 right-10 h-[2px] border-t-2 border-dashed border-brand-forest/25 dark:border-[#42C995]/25 -z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-3xl bg-white/80 backdrop-blur-md border border-[#1C2D29]/12 p-5 shadow-[0_8px_24px_rgba(20,28,26,0.03)] hover:shadow-lg hover:-translate-y-1 hover:border-brand-forest/30 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.30)] dark:backdrop-blur-none transition-all duration-300 flex flex-col justify-between group cursor-default"
                >
                  <div className="space-y-4">
                    {/* Top Node Indicator with Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono font-bold text-sm text-brand-forest/60 bg-brand-forest/8 px-2 py-0.5 rounded-md dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/25">
                        {step.num}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-[#142320] dark:text-[#F1F5F2] leading-snug">
                        {step.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-brand-forest dark:text-[#42C995] block mt-0.5">
                        {step.subtitle}
                      </span>
                      <p className="text-xs text-ink-muted dark:text-[#A9BDB1] mt-2 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1C2D29]/6 dark:border-[rgba(130,180,150,0.15)] flex items-center gap-1.5 text-[11px] font-semibold text-status-green dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Synchronized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile & Tablet Vertical Timeline */}
        <div className="lg:hidden relative pl-6 sm:pl-8 space-y-6">
          {/* Vertical continuous spine */}
          <div
            className="absolute left-3 sm:left-4 top-3 bottom-3 w-[2px] bg-gradient-to-b from-brand-forest/40 via-brand-forest/20 to-brand-forest/5 dark:from-[#42C995]/40 dark:via-[#42C995]/20 dark:to-[#42C995]/5"
            aria-hidden="true"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative group">
                {/* Node circle on spine */}
                <div className="absolute -left-[27px] sm:-left-[31px] top-4 w-7 h-7 rounded-full bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-xs">
                  <span className="font-mono text-[10px] font-bold">{step.num}</span>
                </div>

                {/* Card Content */}
                <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-[#1C2D29]/12 p-5 shadow-xs dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-forest/10 text-brand-forest dark:bg-[#17352A] dark:text-[#42C995] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#142320] dark:text-[#F1F5F2]">
                        {step.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-brand-forest dark:text-[#42C995] block">
                        {step.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted dark:text-[#A9BDB1] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

