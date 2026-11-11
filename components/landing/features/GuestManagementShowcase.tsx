'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Users,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function GuestManagementShowcase() {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'preferences'>('profile');

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14">
      {/* ── Main Glassmorphic Container ── */}
      <div
        className="rounded-[28px] sm:rounded-[34px] overflow-hidden text-left relative p-5 sm:p-7 lg:p-8"
        style={{
          background: 'var(--dashboard-glass-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid var(--dashboard-glass-border)',
          boxShadow: 'var(--dashboard-glass-shadow)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-60"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-x-8 sm:inset-x-16 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent z-20"
          aria-hidden="true"
        />

        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(31,61,58,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-white/90 flex items-center justify-center shrink-0">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-brand-forest text-base sm:text-lg">
                  Digital Guest Dossier &amp; CRM
                </span>
                <span className="text-xs text-ink-muted hidden sm:inline">—</span>
                <span className="text-xs text-ink-muted font-medium hidden sm:inline">
                  Verified Guest Ledger
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Stay History • Government ID Verification • Preferences</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-green/10 border border-status-green/20 text-status-green text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt ID Verified</span>
          </div>
        </div>

        {/* Guest Dossier Layout (Split 7 / 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 relative z-10">
          {/* Main Guest Identity Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white/65 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#1C2D29]/8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-sand text-brand-forest font-serif font-bold text-lg flex items-center justify-center border border-[#1C2D29]/10 shadow-2xs">
                  AS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-brand-forest">
                      Dr. Aditya Singhania
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold border border-amber-500/20">
                      <Award className="w-3 h-3" /> VIP Repeat
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">Guest ID: #GST-48201 • Mumbai, MH</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-ink-muted block uppercase tracking-wider">Lifetime Spend</span>
                <span className="font-mono font-bold text-brand-forest text-base">₹1,48,200</span>
              </div>
            </div>

            {/* Quick Contact & Verified ID Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#1C2D29]/6 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-forest" />
                <span className="truncate text-ink font-medium">+91 98201 44821</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#1C2D29]/6 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-forest" />
                <span className="truncate text-ink font-medium">a.singhania@corp.in</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#1C2D29]/6 flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-3.5 h-3.5 text-status-green" />
                <span className="truncate text-status-green font-semibold">Aadhaar ••9421</span>
              </div>
            </div>

            {/* Stay History List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-forest uppercase tracking-wider block">
                Recent Property Stays (6 Total)
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/50 border border-[#1C2D29]/6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                    <div>
                      <span className="font-semibold text-ink">Heritage Penthouse (Room 301)</span>
                      <span className="text-[10px] text-ink-muted block">12 Oct – 15 Oct 2026 • 3 Nights</span>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-brand-forest">₹28,500</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/50 border border-[#1C2D29]/6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                    <div>
                      <span className="font-semibold text-ink">Executive Suite (Room 201)</span>
                      <span className="text-[10px] text-ink-muted block">18 Aug – 20 Aug 2026 • 2 Nights</span>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-brand-forest">₹15,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Preferences & Police Form Compliance (5 Cols) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
                <span className="font-serif font-bold text-base text-brand-forest">
                  Hospitality Profile
                </span>
                <span className="text-[10px] text-ink-muted font-medium">Front Desk &amp; F&amp;B Sync</span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                {/* Preferences Pills */}
                <div className="p-3 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/8 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-brand-forest">
                    <Heart className="w-3.5 h-3.5 text-status-red" />
                    <span>Recorded Guest Preferences:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#1C2D29]/10 text-[11px] text-ink font-medium">
                      High Floor Requested
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#1C2D29]/10 text-[11px] text-ink font-medium">
                      Extra Down Pillows
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#1C2D29]/10 text-[11px] text-ink font-medium">
                      Jain Breakfast Option
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#1C2D29]/10 text-[11px] text-ink font-medium">
                      Late Checkout (2 PM)
                    </span>
                  </div>
                </div>

                {/* Compliance Box */}
                <div className="p-3 rounded-xl bg-status-green/10 border border-status-green/20 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-status-green">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Statutory Compliance:</span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Local Police Station Guest Form &amp; Form-C digital export ready. No manual paperwork required.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C2D29]/8 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors text-center"
              >
                Create Direct Booking
              </button>
              <button
                type="button"
                className="py-2 px-3 rounded-xl bg-white border border-[#1C2D29]/15 text-xs font-semibold text-ink hover:bg-brand-sand/50 transition-colors"
              >
                Export Form-C
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

