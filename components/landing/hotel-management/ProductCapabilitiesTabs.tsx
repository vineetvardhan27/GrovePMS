'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CreditCard,
  Sparkles,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  BedDouble,
  FileSpreadsheet,
  Building2,
  Receipt,
  Smartphone,
  ShieldCheck,
  Compass,
} from 'lucide-react';

type CapabilityCategory = 'front_desk' | 'billing' | 'housekeeping' | 'guest_crm' | 'reports';

export default function ProductCapabilitiesTabs() {
  const [activeTab, setActiveTab] = useState<CapabilityCategory>('front_desk');

  const tabs: { id: CapabilityCategory; label: string; icon: React.ElementType }[] = [
    { id: 'front_desk', label: 'Front Desk & Matrix', icon: CalendarCheck },
    { id: 'billing', label: 'Billing & GST Folios', icon: CreditCard },
    { id: 'housekeeping', label: 'Housekeeping Matrix', icon: Sparkles },
    { id: 'guest_crm', label: 'Guest Management', icon: Users },
    { id: 'reports', label: 'Operations & Reports', icon: BarChart3 },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] border-y border-[#1C2D29]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
            <span>Modular Architecture</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
            Designed for the People Who Run Your Property.
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Explore Grove&apos;s purpose-built operational interfaces tailored for front desk staff, managers, housekeepers, and owners.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 gap-2 mb-8 sm:mb-12 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-forest text-white shadow-sm ring-1 ring-brand-forest'
                    : 'bg-white/80 hover:bg-white text-ink border border-[#1C2D29]/10 hover:border-[#1C2D29]/25 shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-forest'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Capability Showcase Card */}
        <div className="rounded-[32px] bg-white/85 backdrop-blur-md border border-[#1C2D29]/12 p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_-10px_rgba(20,38,34,0.08)]">
          {/* TAB 1: FRONT DESK & MATRIX */}
          {activeTab === 'front_desk' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md">
                  Reception Operations
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320]">
                  Visual Front Desk &amp; Live Matrix
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  The central nerve centre of your hotel. Front desk agents monitor real-time arrivals, confirm guest reservations, assign rooms, and complete express check-ins in seconds.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-ink">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Real-time color-coded room availability (OCC / AVL / RSV)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Instant room assignment and stay date modifications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Arrival checklists with identity proof verification</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Link
                    href="/features/room-management"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light group cursor-pointer"
                  >
                    <span>Explore Room Management Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Visual Showcase Panel */}
              <div className="lg:col-span-7 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C2D29]/8 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-status-green" />
                    <span className="font-mono font-bold text-xs text-[#142320]">Live Front Desk Grid</span>
                  </div>
                  <span className="text-[11px] text-ink-muted">32 Total Rooms</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/10 text-center">
                    <span className="font-mono font-bold text-sm block">101 Dlx</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-status-red/10 text-status-red block mt-1">
                      OCCUPIED
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-1">A. Sharma</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/10 text-center">
                    <span className="font-mono font-bold text-sm block">102 Sup</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-status-green/10 text-status-green block mt-1">
                      AVAILABLE
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-1">Clean</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/10 text-center">
                    <span className="font-mono font-bold text-sm block">201 Ste</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2B6CB0]/10 text-[#2B6CB0] block mt-1">
                      RESERVED
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-1">2 PM Arrival</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/10 text-center">
                    <span className="font-mono font-bold text-sm block">301 Pnt</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-status-green/10 text-status-green block mt-1">
                      AVAILABLE
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-1">Inspected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BILLING & GST FOLIOS */}
          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md">
                  Cashier &amp; Accounts
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320]">
                  Automated Billing &amp; GST Invoicing
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Eliminate manual spreadsheet arithmetic. Every room tariff, dining KOT, minibar beverage, and laundry charge aggregates onto one live guest folio with tax breakdown.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-ink">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Automated split GST calculation (CGST, SGST, IGST)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Multi-mode settlement: Split Cash, UPI, Card, and Bank Transfer</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Clean B2B corporate billing with verified GSTIN prints</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Link
                    href="/features/billing-and-payments"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light group cursor-pointer"
                  >
                    <span>Explore Billing &amp; Folios Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Visual Showcase Panel */}
              <div className="lg:col-span-7 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C2D29]/8 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#142320]">Tax Invoice #INV-2026-089</span>
                    <span className="text-[11px] text-ink-muted block">The Heritage Retreat</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-green/10 text-status-green">
                    PAID VIA UPI
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#1C2D29]/8 space-y-2 text-xs">
                  <div className="flex justify-between text-ink-muted pb-1 border-b border-[#1C2D29]/6">
                    <span>Room 301 Tariff (2 Nights @ ₹7,000)</span>
                    <span className="font-mono text-[#142320]">₹14,000.00</span>
                  </div>
                  <div className="flex justify-between text-ink-muted pb-1 border-b border-[#1C2D29]/6">
                    <span>Restaurant Food &amp; Beverage (KOT #124)</span>
                    <span className="font-mono text-[#142320]">₹2,450.00</span>
                  </div>
                  <div className="flex justify-between text-ink-muted pb-1 border-b border-[#1C2D29]/6">
                    <span>CGST (6%) + SGST (6%)</span>
                    <span className="font-mono text-[#142320]">₹1,974.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#142320] pt-1">
                    <span>Total Settleable Paid</span>
                    <span className="font-serif text-brand-forest text-sm">₹18,424.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOUSEKEEPING MATRIX */}
          {activeTab === 'housekeeping' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md">
                  Floor Operations
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320]">
                  Live Housekeeping Turnarounds
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Equip floor supervisors and housekeeping attendants with a mobile-friendly checklist. Update room hygiene statuses in real time without shouting over intercoms.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-ink">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Four-stage turnaround: Dirty, In-Progress, Inspected, Ready</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Instant sync: Cleaned rooms immediately show Ready on Front Desk</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Mobile web app optimized for housekeeping smartphones</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Link
                    href="/features/room-management"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light group cursor-pointer"
                  >
                    <span>Explore Housekeeping Management</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Visual Showcase Panel */}
              <div className="lg:col-span-7 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2D29]/8 pb-2">
                  <span className="font-mono font-bold text-xs text-[#142320]">Housekeeping Floor Board</span>
                  <span className="text-[11px] text-ink-muted">Floor 2 (North Wing)</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/8 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-[#142320] block">Room 201 — Deluxe Suite</strong>
                      <span className="text-[11px] text-ink-muted">Assigned: Sunita K.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-green/10 text-status-green border border-status-green/20">
                      Inspected &amp; Ready
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/8 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-[#142320] block">Room 202 — Superior Twin</strong>
                      <span className="text-[11px] text-ink-muted">Assigned: Ramesh P.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-amber/10 text-status-amber border border-status-amber/20">
                      Cleaning In Progress (15m)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GUEST CRM */}
          {activeTab === 'guest_crm' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md">
                  Guest Profiles
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320]">
                  Guest History &amp; Identity CRM
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Deliver personalized hospitality. Store phone numbers, emails, past stays, room preferences, and encrypted identity documents in one accessible profile.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-ink">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Repeat guest recognition with automated history lookup</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Encrypted government ID upload &amp; audit compliance</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>VIP tagging, preference tracking, and dietary requests</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Link
                    href="/features/guest-management"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light group cursor-pointer"
                  >
                    <span>Explore Guest Management</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Visual Showcase Panel */}
              <div className="lg:col-span-7 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2D29]/8 pb-2">
                  <span className="font-mono font-bold text-xs text-[#142320]">Guest Ledger Profile</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-forest text-white">
                    Repeat Guest (3 Stays)
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#1C2D29]/8 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-sm font-semibold text-[#142320] block">Vikramaditya Rao</strong>
                      <span className="text-ink-muted text-[11px]">+91 98201 44520 • vikram@rao.org</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-brand-forest">Total Spend: ₹64,200</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-brand-sand/35 border border-[#1C2D29]/6 text-[11px] space-y-1 mt-2">
                    <span className="font-semibold text-[#142320] block">Special Preferences:</span>
                    <span className="text-ink-muted block">• High floor, quiet room away from elevator</span>
                    <span className="text-ink-muted block">• Late check-out requested (1:30 PM)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS & AUDITS */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/80 bg-brand-forest/8 px-2.5 py-1 rounded-md">
                  Management Audits
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#142320]">
                  Operations Intelligence &amp; Audits
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Gain instant visibility into hotel performance. Automated daily flash reports, occupancy curves, RevPAR trends, and month-end GST tax summaries ready for export.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-ink">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Daily flash audits of collections by mode (Cash, Card, UPI)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>Real-time occupancy percentages and revenue yield</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                    <span>1-click monthly GST audit data exports</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Link
                    href="/features/reports"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-forest hover:text-brand-forest-light group cursor-pointer"
                  >
                    <span>Explore Reports &amp; Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Visual Showcase Panel */}
              <div className="lg:col-span-7 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/10 p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C2D29]/8 pb-2">
                  <span className="font-mono font-bold text-xs text-[#142320]">Manager Daily Flash Audit</span>
                  <span className="text-[11px] text-ink-muted">Today • Auto-calculated</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/8 text-center">
                    <span className="text-[10px] text-ink-muted block uppercase">Occupancy</span>
                    <span className="font-serif font-bold text-lg text-[#142320] mt-0.5 block">78%</span>
                    <span className="text-[10px] text-status-green font-medium">+4% WoW</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/8 text-center">
                    <span className="text-[10px] text-ink-muted block uppercase">RevPAR</span>
                    <span className="font-serif font-bold text-lg text-[#142320] mt-0.5 block">₹3,420</span>
                    <span className="text-[10px] text-status-green font-medium">+8% WoW</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#1C2D29]/8 text-center">
                    <span className="text-[10px] text-ink-muted block uppercase">Collections</span>
                    <span className="font-serif font-bold text-lg text-[#142320] mt-0.5 block">₹86.4K</span>
                    <span className="text-[10px] text-brand-forest font-medium">8 Settleable</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

