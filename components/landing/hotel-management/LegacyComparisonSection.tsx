'use client';

import React from 'react';
import { XCircle, CheckCircle2, Server, Cloud, Shield, Zap, Laptop, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LegacyComparisonSection() {
  const legacyPoints = [
    {
      title: 'Hardware-Dependent Infrastructure',
      desc: 'Requires dedicated on-site Windows servers, LAN cables, and costly annual AMC service contracts.',
    },
    {
      title: 'Manual & Fragile Backups',
      desc: 'Local hard-drive exports vulnerable to disk crashes, malware, fire, or accidental data loss.',
    },
    {
      title: 'Desktop-Locked Workflows',
      desc: 'Staff must remain chained to physical reception terminals; managers have zero remote visibility.',
    },
    {
      title: 'Disconnected Department Silos',
      desc: 'Kitchen orders, housekeeping statuses, and front desk bookings communicate via paper vouchers and calls.',
    },
    {
      title: 'Tedious Manual GST Invoicing',
      desc: 'Tax calculations and state-wise slabs (CGST/SGST/IGST) manually keyed into separate accounting software.',
    },
  ];

  const grovePoints = [
    {
      title: '100% Browser-Based Cloud Access',
      desc: 'Zero hardware to purchase or maintain. Runs seamlessly on any laptop, iPad, tablet, or smartphone.',
    },
    {
      title: 'Automated Real-Time Cloud Sync',
      desc: 'Continuous cloud backups with Supabase PostgreSQL, enterprise encryption, and instant disaster recovery.',
    },
    {
      title: 'Manage From Anywhere',
      desc: 'Full mobile-responsive control for owners and managers to inspect occupancy, revenue, and audits remotely.',
    },
    {
      title: 'Unified Cross-Department Pipeline',
      desc: 'Front desk arrivals instantly notify housekeeping queues and restaurant POS directly posts to guest folios.',
    },
    {
      title: 'Integrated 1-Click GST Invoices',
      desc: 'Automated tax calculations, SAC code classifications, split billing, and clean B2B/B2C PDF tax invoices.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest dark:bg-[#17352A] dark:border-[#42C995]/25 dark:text-[#42C995] text-xs font-semibold tracking-wider uppercase">
          <span>Technology Evolution</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black dark:text-[#F1F5F2] tracking-tight leading-[1.15]">
          Leave Legacy Hotel Software Behind.
        </h2>
        <p className="text-base sm:text-lg text-ink-muted dark:text-[#A9BDB1] leading-relaxed max-w-2xl mx-auto">
          Replace fragmented systems, manual processes and disconnected operations with one modern platform designed around the way hotels actually work.
        </p>
      </div>

      {/* Side-by-Side Architectural Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* LEFT COLUMN: Legacy On-Premise Systems (Muted Warm Red) */}
        <div className="rounded-3xl bg-white/50 backdrop-blur-md border border-[#C84C3E]/20 p-6 sm:p-9 shadow-[0_8px_24px_rgba(200,76,62,0.03)] dark:bg-[#1C1615]/70 dark:border-red-500/25 dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] dark:backdrop-blur-none flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#C84C3E]/15 dark:border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C84C3E]/10 text-status-red dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#142320] dark:text-[#F1F5F2]">
                    Legacy On-Premise Systems
                  </h3>
                  <span className="text-xs text-status-red dark:text-red-400 font-semibold">
                    Fragmented &amp; Hardware Bound
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {legacyPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-status-red/10 text-status-red dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-sm font-semibold text-[#142320] dark:text-[#F1F5F2] block">
                      {pt.title}
                    </strong>
                    <p className="text-xs text-ink-muted dark:text-[#A9BDB1] leading-relaxed mt-0.5">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#C84C3E]/15 dark:border-red-500/20 text-xs text-ink-muted dark:text-[#A9BDB1] flex items-center gap-2">
            <span className="font-semibold text-status-red dark:text-red-400">Result:</span>
            <span>Slow check-ins, high IT maintenance, and departmental friction.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Grove Cloud PMS (Forest Green & Glass) */}
        <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-brand-forest/25 p-6 sm:p-9 shadow-[0_16px_40px_rgba(20,38,34,0.08),0_0_0_1px_rgba(28,45,41,0.05)] dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.22)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] dark:backdrop-blur-none flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Top Specular Glass Line */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-forest/30 to-transparent"
            aria-hidden="true"
          />

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C2D29]/10 dark:border-[rgba(130,180,150,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-xs">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#142320] dark:text-[#F1F5F2]">
                    Grove Cloud Hospitality OS
                  </h3>
                  <span className="text-xs text-brand-forest dark:text-[#42C995] font-semibold">
                    Modern, Unified &amp; Reliable
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand-forest/10 border border-brand-forest/20 text-brand-forest dark:bg-[#17352A] dark:border-[#42C995]/25 dark:text-[#42C995] text-xs font-bold">
                100% Cloud Native
              </span>
            </div>

            <div className="space-y-4">
              {grovePoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-status-green/15 text-status-green dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-sm font-semibold text-[#142320] dark:text-[#F1F5F2] block">
                      {pt.title}
                    </strong>
                    <p className="text-xs text-ink-muted dark:text-[#A9BDB1] leading-relaxed mt-0.5">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#1C2D29]/10 dark:border-[rgba(130,180,150,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-ink-muted dark:text-[#A9BDB1] flex items-center gap-1.5">
              <span className="font-semibold text-brand-forest dark:text-[#42C995]">Result:</span>
              <span>Smooth front desk, instant billing, and complete financial peace of mind.</span>
            </div>
            <Link
              href="/register-hotel"
              className="text-xs font-semibold text-brand-forest hover:text-brand-forest-light dark:text-[#42C995] dark:hover:text-[#6EE7B7] inline-flex items-center gap-1 shrink-0"
            >
              <span>Switch to Grove</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

