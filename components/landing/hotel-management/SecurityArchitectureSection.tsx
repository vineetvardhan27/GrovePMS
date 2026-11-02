'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Database,
  Key,
  Users,
  CheckCircle2,
  ArrowRight,
  Layers,
  Server,
} from 'lucide-react';

export default function SecurityArchitectureSection() {
  const securityPillars = [
    {
      title: 'PostgreSQL Row-Level Security (RLS)',
      desc: 'Every database query is filtered cryptographically at the database engine level via public.get_my_hotel_id(). Cross-tenant data leakage is structurally impossible.',
      icon: Database,
    },
    {
      title: 'Strict Hotel Tenant Isolation',
      desc: 'All hotel reservations, folios, guest IDs, and accounts remain completely private to your property. Client-provided hotel IDs are never trusted.',
      icon: Layers,
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      desc: 'Granular permissions tailored for Owners, Managers, Receptionists, and Housekeepers ensure staff only access data required for their daily shift.',
      icon: Users,
    },
    {
      title: 'Enterprise Encryption Standards',
      desc: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Sensitive guest identity documents are protected with tokenized storage.',
      icon: Lock,
    },
  ];

  return (
    <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-[36px] bg-white/75 backdrop-blur-xl border border-[#1C2D29]/12 p-8 sm:p-12 lg:p-16 shadow-[0_24px_70px_-12px_rgba(20,38,34,0.08)] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-forest/30 to-transparent"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise Data Architecture</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
              Every Property.
              <br />
              Its Own Secure Operational Space.
            </h2>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Grove PMS delivers modern cloud flexibility with enterprise-grade data isolation. Powered by Supabase PostgreSQL and kernel-level Row-Level Security, your hotel records remain private, audited, and strictly isolated.
            </p>

            <div className="pt-2">
              <Link
                href="/security"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light group cursor-pointer"
              >
                <span>Read Full Security &amp; Compliance Whitepaper</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Architectural Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {securityPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-brand-sand/35 border border-[#1C2D29]/10 p-5 space-y-3 hover:bg-brand-sand/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-forest/10 border border-brand-forest/20 text-brand-forest flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#142320]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-ink-muted leading-relaxed mt-1">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

