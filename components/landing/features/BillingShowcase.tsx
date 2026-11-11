'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Share2,
  Printer,
  Smartphone,
  Building2,
  FileText,
  BadgePercent,
  Sparkles,
} from 'lucide-react';

export default function BillingShowcase() {
  const [splitMode, setSplitMode] = useState<'single' | 'split'>('split');

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
                  Consolidated Guest Folio
                </span>
                <span className="text-xs text-ink-muted hidden sm:inline">—</span>
                <span className="text-xs text-ink-muted font-medium hidden sm:inline">
                  Invoice #GV-2026-1042
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">GST Compliant • Multi-Department Auto Billing</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-green/10 border border-status-green/20 text-status-green text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Settlement</span>
          </div>
        </div>

        {/* Folio Layout (Split 7 / 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 relative z-10">
          {/* Itemized Line Items (7 Cols) */}
          <div className="lg:col-span-7 bg-white/65 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
              <div>
                <span className="text-xs font-bold text-brand-forest uppercase tracking-wider block">
                  Guest: Kabir Mehta (Room 301)
                </span>
                <span className="text-[10px] text-ink-muted">GSTIN: 27AABCG1234F1Z5</span>
              </div>
              <span className="text-xs font-mono text-ink-muted">2 Nights Stay</span>
            </div>

            {/* Line Items List */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-white/60 border border-[#1C2D29]/6">
                <div>
                  <span className="font-semibold text-ink block">Heritage Penthouse (Room 301)</span>
                  <span className="text-[10px] text-ink-muted">SAC 996311 • 2 Nights @ ₹8,500</span>
                </div>
                <span className="font-mono font-bold text-ink">₹17,000.00</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-white/60 border border-[#1C2D29]/6">
                <div>
                  <span className="font-semibold text-ink block">Restaurant Dining (KOT #304)</span>
                  <span className="text-[10px] text-ink-muted">SAC 996331 • Dinner Tandoori &amp; Desserts</span>
                </div>
                <span className="font-mono font-bold text-ink">₹2,400.00</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-white/60 border border-[#1C2D29]/6">
                <div>
                  <span className="font-semibold text-ink block">Express Laundry Service</span>
                  <span className="text-[10px] text-ink-muted">SAC 999791 • 4 Garments Dry Clean</span>
                </div>
                <span className="font-mono font-bold text-ink">₹600.00</span>
              </div>
            </div>

            {/* Tax Computation Summary */}
            <div className="pt-2 border-t border-[#1C2D29]/8 space-y-1 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Taxable Subtotal:</span>
                <span className="font-mono text-ink">₹20,000.00</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>CGST @ 9%:</span>
                <span className="font-mono text-ink">₹1,800.00</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>SGST @ 9%:</span>
                <span className="font-mono text-ink">₹1,800.00</span>
              </div>
              <div className="pt-2 border-t border-[#1C2D29]/8 flex justify-between items-baseline font-bold text-brand-forest text-sm">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-lg">₹23,600.00</span>
              </div>
            </div>
          </div>

          {/* Payment Collection & Settlement (5 Cols) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
                <span className="font-serif font-bold text-base text-brand-forest">
                  Payment Collection
                </span>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSplitMode('split')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                      splitMode === 'split' ? 'bg-brand-forest text-white' : 'text-ink-muted'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('single')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                      splitMode === 'single' ? 'bg-brand-forest text-white' : 'text-ink-muted'
                    }`}
                  >
                    Single
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                {/* Advance Payment Record */}
                <div className="p-2.5 rounded-xl bg-status-green/10 border border-status-green/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-status-green" />
                    <div>
                      <span className="font-semibold text-ink block">UPI Advance Received</span>
                      <span className="text-[10px] text-ink-muted">Ref #UPI-849204</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-status-green">₹10,000.00</span>
                </div>

                {/* Remaining Amount */}
                <div className="p-3 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/8 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted font-medium">Balance Due:</span>
                    <span className="font-mono font-bold text-brand-forest text-base">
                      ₹13,600.00
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      className="py-1.5 px-2 rounded-lg bg-white border border-[#1C2D29]/15 text-[11px] font-semibold text-center hover:bg-brand-sand/40"
                    >
                      💳 Card
                    </button>
                    <button
                      type="button"
                      className="py-1.5 px-2 rounded-lg bg-brand-forest text-white text-[11px] font-semibold text-center"
                    >
                      📱 UPI QR
                    </button>
                    <button
                      type="button"
                      className="py-1.5 px-2 rounded-lg bg-white border border-[#1C2D29]/15 text-[11px] font-semibold text-center hover:bg-brand-sand/40"
                    >
                      💵 Cash
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions: Print, PDF, WhatsApp */}
            <div className="pt-2 border-t border-[#1C2D29]/8 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settle Folio</span>
              </button>
              <button
                type="button"
                title="Print GST Invoice"
                className="p-2 rounded-xl bg-white border border-[#1C2D29]/15 text-ink hover:bg-brand-sand/50 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Send via WhatsApp"
                className="p-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

