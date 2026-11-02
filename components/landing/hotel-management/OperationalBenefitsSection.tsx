'use client';

import React from 'react';
import { Compass, ShieldCheck, HeartHandshake, Eye, Coins, Network } from 'lucide-react';

export default function OperationalBenefitsSection() {
  const benefits = [
    {
      num: '01',
      title: 'Operational Clarity',
      subtitle: 'Complete Property Oversight',
      description:
        'See room availability, today’s arrivals, pending departures, and live housekeeping statuses on a single screen. Make instant room allocations without double-bookings or guesswork.',
      icon: Eye,
      details: [
        'Live color-coded room matrix',
        'Automatic arrival & departure checklists',
        'Real-time occupancy percentages',
      ],
    },
    {
      num: '02',
      title: 'Financial Control',
      subtitle: 'Audited Folios & Tax Compliance',
      description:
        'Manage consolidated guest ledgers, settled dining orders, and split payments (Cash, UPI, Card). Automatically generate GST tax invoices with state-wise tax slab classifications.',
      icon: Coins,
      details: [
        'Unified guest folio consolidation',
        'B2B/B2C GST tax invoice prints',
        'Daily mode-wise collection audits',
      ],
    },
    {
      num: '03',
      title: 'Connected Teams',
      subtitle: 'Synchronized Shift Operations',
      description:
        'Provide owners, managers, receptionists, and housekeeping teams with role-specific views so everyone stays informed without walking between floors or making repeated phone calls.',
      icon: Network,
      details: [
        'Dedicated staff role dashboards',
        'Instant housekeeping status updates',
        'Remote management visibility for owners',
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] border-y border-[#1C2D29]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
            <span>Practical Impact</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
            Less Administrative Work.
            <br className="hidden sm:inline" /> More Time for Hospitality.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Designed to remove operational friction from hotel operations, enabling your staff to focus on genuine guest care.
          </p>
        </div>

        {/* 3 Editorial Benefit Compositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.num}
                className="rounded-3xl bg-white/80 backdrop-blur-md border border-[#1C2D29]/12 p-7 sm:p-8 shadow-[0_12px_32px_rgba(20,28,26,0.03)] hover:shadow-lg hover:-translate-y-1 hover:border-brand-forest/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-2xl text-brand-forest/30 group-hover:text-brand-forest/70 transition-colors">
                      {b.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-brand-forest/10 border border-brand-forest/20 text-brand-forest flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#142320]">
                      {b.title}
                    </h3>
                    <span className="text-xs font-semibold text-brand-forest block mt-0.5">
                      {b.subtitle}
                    </span>
                    <p className="text-xs sm:text-sm text-ink-muted mt-3 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  <ul className="pt-2 space-y-1.5 text-xs text-ink/90 border-t border-[#1C2D29]/8">
                    {b.details.map((d, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

