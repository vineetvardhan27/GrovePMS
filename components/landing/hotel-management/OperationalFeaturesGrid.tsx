'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CreditCard,
  Sparkles,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  BedDouble,
  Layers,
} from 'lucide-react';

export default function OperationalFeaturesGrid() {
  return (
    <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest dark:bg-[#17352A] dark:border-[#42C995]/25 dark:text-[#42C995] text-xs font-semibold tracking-wider uppercase">
          <Layers className="w-3.5 h-3.5" />
          <span>Operational Foundation</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black dark:text-[#F1F5F2] tracking-tight leading-[1.15]">
          Every Part of Your Hotel.
          <br className="hidden sm:inline" /> Working in Sync.
        </h2>
        <p className="text-base sm:text-lg text-ink-muted dark:text-[#A9BDB1] leading-relaxed max-w-2xl mx-auto">
          From front desk room allocation to housekeeping turnarounds and audited tax reporting, Grove connects the core workflows that keep your property running smoothly.
        </p>
      </div>

      {/* Asymmetric Varied Composition Feature Grid */}
      <div className="space-y-6 sm:space-y-8">
        {/* ── ROW 1: Front Desk (Large 7-col) + Billing (Medium 5-col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* 1. FRONT DESK & MATRIX (7 Columns) */}
          <div className="lg:col-span-7 rounded-3xl bg-white/75 backdrop-blur-md border border-[#1C2D29]/12 p-6 sm:p-8 shadow-[0_12px_32px_rgba(20,28,26,0.04)] hover:shadow-lg hover:border-brand-forest/30 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:backdrop-blur-none transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/25">
                  Front Desk Operations
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#142320] dark:text-[#F1F5F2]">
                  Visual Front Desk &amp; Room Matrix
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] mt-2 leading-relaxed max-w-xl">
                  Interactive multi-day visual calendar grid displaying real-time room statuses, arrival checklists, guest identities, and express check-in workflows.
                </p>
              </div>

              {/* Realistic Feature Preview Mockup: Interactive Matrix */}
              <div className="pt-2">
                <div className="rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 dark:bg-[#132D23]/70 dark:border-[rgba(130,180,150,0.18)] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#142320] dark:text-[#F1F5F2] border-b border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)] pb-2">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-brand-forest dark:text-[#42C995]" />
                      <span>Floor Layout &amp; Calendar Timeline</span>
                    </span>
                    <span className="text-[11px] font-mono text-ink-muted dark:text-[#A9BDB1]">Thu 28 Oct – Mon 01 Nov</span>
                  </div>

                  {/* Matrix Timeline Rows */}
                  <div className="space-y-2 text-xs">
                    {/* Row 1 */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 font-mono font-bold text-[#142320] dark:text-[#F1F5F2] text-xs">101 Dlx</span>
                      <div className="flex-1 h-7 rounded-lg bg-status-red/15 border border-status-red/30 dark:bg-red-950/40 dark:border-red-500/30 flex items-center px-2.5 justify-between text-[11px] text-status-red dark:text-red-300 font-medium">
                        <span>Ananya Sharma (2N)</span>
                        <span className="text-[10px] font-bold">OCCUPIED</span>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 font-mono font-bold text-[#142320] dark:text-[#F1F5F2] text-xs">202 Ste</span>
                      <div className="flex-1 h-7 rounded-lg bg-[#2B6CB0]/15 border border-[#2B6CB0]/30 dark:bg-blue-950/40 dark:border-blue-400/30 flex items-center px-2.5 justify-between text-[11px] text-[#2B6CB0] dark:text-blue-300 font-medium">
                        <span>Arjun Verma (Arrival 2 PM)</span>
                        <span className="text-[10px] font-bold">RESERVED</span>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 font-mono font-bold text-[#142320] dark:text-[#F1F5F2] text-xs">301 Pnt</span>
                      <div className="flex-1 h-7 rounded-lg bg-status-green/15 border border-status-green/30 dark:bg-emerald-950/40 dark:border-emerald-500/30 flex items-center px-2.5 justify-between text-[11px] text-status-green dark:text-emerald-300 font-medium">
                        <span>Ready for Check-In</span>
                        <span className="text-[10px] font-bold">AVAILABLE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)]">
              <Link
                href="/features/room-management"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light dark:text-[#42C995] dark:hover:text-[#6EE7B7] group/link cursor-pointer"
              >
                <span>Explore Room Management Architecture</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* 2. AUTOMATED BILLING & FOLIOS (5 Columns) */}
          <div className="lg:col-span-5 rounded-3xl bg-white/75 backdrop-blur-md border border-[#1C2D29]/12 p-6 sm:p-8 shadow-[0_12px_32px_rgba(20,28,26,0.04)] hover:shadow-lg hover:border-brand-forest/30 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:backdrop-blur-none transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/25">
                  Financial Management
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#142320] dark:text-[#F1F5F2]">
                  Automated Billing &amp; GST Folios
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] mt-2 leading-relaxed">
                  Consolidated guest ledgers combining room tariffs, extra beds, restaurant KOTs, and amenities with automated GST tax invoices.
                </p>
              </div>

              {/* Realistic Feature Preview Mockup: Itemized Folio */}
              <div className="pt-2">
                <div className="rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 dark:bg-[#132D23]/70 dark:border-[rgba(130,180,150,0.18)] p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)] pb-2">
                    <span className="font-mono font-bold text-[#142320] dark:text-[#F1F5F2]">Folio #1042</span>
                    <span className="px-2 py-0.5 rounded-full bg-status-green/10 text-status-green dark:bg-emerald-950/50 dark:text-emerald-300 dark:border dark:border-emerald-500/25 font-semibold text-[10px]">
                      B2B GST Verified
                    </span>
                  </div>

                  <div className="space-y-1.5 text-ink-muted dark:text-[#A9BDB1] text-[11px]">
                    <div className="flex justify-between">
                      <span>Room 301 Tariff (2 Nights)</span>
                      <span className="font-mono text-[#142320] dark:text-[#F1F5F2]">₹14,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restaurant KOT #208</span>
                      <span className="font-mono text-[#142320] dark:text-[#F1F5F2]">₹2,150</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (6%) + SGST (6%)</span>
                      <span className="font-mono text-[#142320] dark:text-[#F1F5F2]">₹1,938</span>
                    </div>
                    <div className="pt-1.5 border-t border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)] flex justify-between font-bold text-[#142320] dark:text-[#F1F5F2] text-xs">
                      <span>Total Balance</span>
                      <span className="font-serif text-brand-forest dark:text-[#42C995]">₹18,088</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)]">
              <Link
                href="/features/billing-and-payments"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light dark:text-[#42C995] dark:hover:text-[#6EE7B7] group/link cursor-pointer"
              >
                <span>Explore Billing &amp; Payments</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Housekeeping (4-col) + CRM (4-col) + Reports (4-col) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* 3. HOUSEKEEPING MATRIX */}
          <div className="rounded-3xl bg-white/75 backdrop-blur-md border border-[#1C2D29]/12 p-6 sm:p-7 shadow-[0_12px_32px_rgba(20,28,26,0.04)] hover:shadow-lg hover:border-brand-forest/30 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:backdrop-blur-none transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/25">
                  Housekeeping
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#142320] dark:text-[#F1F5F2]">
                  Live Housekeeping Matrix
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] mt-2 leading-relaxed">
                  Mobile-responsive cleaning queues. Floor teams update rooms through Dirty, Cleaning, Inspected, and Ready states instantaneously.
                </p>
              </div>

              {/* Status Pill Preview */}
              <div className="p-3.5 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 dark:bg-[#132D23]/70 dark:border-[rgba(130,180,150,0.18)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#142320] dark:text-[#F1F5F2]">Room 102</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-green/10 text-status-green border border-status-green/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500/30">
                    Inspected &amp; Ready
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#142320] dark:text-[#F1F5F2]">Room 201</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-amber/10 text-status-amber border border-status-amber/20 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-500/30">
                    Cleaning In Progress
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#142320] dark:text-[#F1F5F2]">Room 304</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-red/10 text-status-red border border-status-red/20 dark:bg-red-950/50 dark:text-red-300 dark:border-red-500/30">
                    Dirty (Departure)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)]">
              <Link
                href="/features/room-management"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light dark:text-[#42C995] dark:hover:text-[#6EE7B7] group/link cursor-pointer"
              >
                <span>Explore Housekeeping Features</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* 4. GUEST CRM & HISTORY */}
          <div className="rounded-3xl bg-white/75 backdrop-blur-md border border-[#1C2D29]/12 p-6 sm:p-7 shadow-[0_12px_32px_rgba(20,28,26,0.04)] hover:shadow-lg hover:border-brand-forest/30 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:backdrop-blur-none transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/25">
                  Guest CRM
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#142320] dark:text-[#F1F5F2]">
                  Guest History &amp; Identity CRM
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] mt-2 leading-relaxed">
                  Permanent guest ledgers capturing government ID records, phone numbers, past stay dates, room preferences, and VIP tags.
                </p>
              </div>

              {/* Guest Profile Card Preview */}
              <div className="p-3.5 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 dark:bg-[#132D23]/70 dark:border-[rgba(130,180,150,0.18)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="font-semibold text-[#142320] dark:text-[#F1F5F2]">Dr. S. Kulkarni</strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30">
                    VIP Guest
                  </span>
                </div>
                <div className="text-[11px] text-ink-muted dark:text-[#A9BDB1] leading-tight">
                  <span>Past Stays: 4 Visits • High Floor Preferred</span>
                  <div className="flex items-center gap-1 text-status-green dark:text-emerald-400 font-medium mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Aadhaar ID Verified &amp; Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)]">
              <Link
                href="/features/guest-management"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light dark:text-[#42C995] dark:hover:text-[#6EE7B7] group/link cursor-pointer"
              >
                <span>Explore Guest Management</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* 5. MANAGER FLASH REPORTS */}
          <div className="rounded-3xl bg-white/75 backdrop-blur-md border border-[#1C2D29]/12 p-6 sm:p-7 shadow-[0_12px_32px_rgba(20,28,26,0.04)] hover:shadow-lg hover:border-brand-forest/30 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:backdrop-blur-none transition-all duration-300 flex flex-col justify-between group md:col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/25">
                  Analytics &amp; Audits
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-forest text-white dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/30 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#142320] dark:text-[#F1F5F2]">
                  Manager Flash Reports
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] mt-2 leading-relaxed">
                  Real-time occupancy rates, RevPAR insights, daily collections by payment mode (Cash/Card/UPI), and month-end tax summary exports.
                </p>
              </div>

              {/* Reports Metric Snapshot */}
              <div className="p-3.5 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 dark:bg-[#132D23]/70 dark:border-[rgba(130,180,150,0.18)] space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-ink-muted dark:text-[#A9BDB1]">Daily RevPAR</span>
                  <span className="font-mono font-bold text-[#142320] dark:text-[#F1F5F2]">₹3,420</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-ink-muted dark:text-[#A9BDB1]">UPI / NetBanking Share</span>
                  <span className="font-mono font-bold text-status-green dark:text-emerald-400">74%</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-ink-muted dark:text-[#A9BDB1]">Month-to-Date Collections</span>
                  <span className="font-mono font-bold text-brand-forest dark:text-[#42C995]">₹12.4 Lakhs</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)]">
              <Link
                href="/features/reports"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light dark:text-[#42C995] dark:hover:text-[#6EE7B7] group/link cursor-pointer"
              >
                <span>Explore Operations Reports</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
