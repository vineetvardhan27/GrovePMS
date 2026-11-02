'use client';

import React from 'react';
import Image from 'next/image';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Download,
  Calendar,
  Smartphone,
  CreditCard,
  Banknote,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function ReportsShowcase() {
  const collectionModes = [
    { mode: 'UPI / Instant QR', amount: '₹46,800', percent: '54%', icon: Smartphone, color: 'bg-status-green' },
    { mode: 'Credit / Debit Cards', amount: '₹27,600', percent: '32%', icon: CreditCard, color: 'bg-[#2B6CB0]' },
    { mode: 'Cash Ledger', amount: '₹12,000', percent: '14%', icon: Banknote, color: 'bg-amber-600' },
  ];

  const weeklyTrend = [
    { day: 'Mon', rev: 62 },
    { day: 'Tue', rev: 55 },
    { day: 'Wed', rev: 74 },
    { day: 'Thu', rev: 68 },
    { day: 'Fri', rev: 88 },
    { day: 'Sat', rev: 95 },
    { day: 'Sun', rev: 82 },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14">
      {/* ── Main Glassmorphic Container ── */}
      <div
        className="rounded-[28px] sm:rounded-[34px] overflow-hidden text-left relative p-5 sm:p-7 lg:p-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(255, 253, 249, 0.54) 50%, rgba(255, 255, 255, 0.68) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.90)',
          boxShadow:
            '0 28px 70px -16px rgba(15, 36, 33, 0.12), 0 8px 24px -6px rgba(15, 36, 33, 0.04), 0 0 0 1px rgba(31, 61, 58, 0.06), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px 0 rgba(15, 36, 33, 0.04)',
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
                  Executive Manager Flash Report
                </span>
                <span className="text-xs text-ink-muted hidden sm:inline">—</span>
                <span className="text-xs text-ink-muted font-medium hidden sm:inline">
                  Daily Night Audit &amp; Performance
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Automated Reconciliation • Real-Time RevPAR &amp; Collections</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-forest text-white text-xs font-semibold shadow-xs hover:bg-brand-forest-light transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export GSTR-1 Excel</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10 mb-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/85 shadow-2xs">
            <span className="text-[10px] text-ink-muted uppercase font-semibold tracking-wider block">
              Occupancy
            </span>
            <div className="font-serif font-bold text-xl sm:text-2xl text-brand-forest mt-0.5">78.1%</div>
            <span className="text-[10px] text-status-green font-medium">+4.2% vs last week</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/85 shadow-2xs">
            <span className="text-[10px] text-ink-muted uppercase font-semibold tracking-wider block">
              RevPAR
            </span>
            <div className="font-serif font-bold text-xl sm:text-2xl text-brand-forest mt-0.5">₹4,320</div>
            <span className="text-[10px] text-status-green font-medium">Per available room</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/85 shadow-2xs">
            <span className="text-[10px] text-ink-muted uppercase font-semibold tracking-wider block">
              ADR
            </span>
            <div className="font-serif font-bold text-xl sm:text-2xl text-brand-forest mt-0.5">₹5,540</div>
            <span className="text-[10px] text-ink-muted font-medium">Avg realized rate</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/85 shadow-2xs">
            <span className="text-[10px] text-ink-muted uppercase font-semibold tracking-wider block">
              Total Day Collection
            </span>
            <div className="font-serif font-bold text-xl sm:text-2xl text-brand-forest mt-0.5">₹86,400</div>
            <span className="text-[10px] text-status-green font-medium">8 folios settled</span>
          </div>
        </div>

        {/* Detailed Analytics Grid (Split 7 / 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 relative z-10">
          {/* Revenue Breakdown & Payment Modes (7 Cols) */}
          <div className="lg:col-span-7 bg-white/65 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
              <span className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                Collections by Payment Mode
              </span>
              <span className="text-[11px] font-semibold text-brand-forest">Today: ₹86,400</span>
            </div>

            <div className="space-y-2">
              {collectionModes.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.mode}
                    className="p-2.5 rounded-xl bg-white/60 border border-[#1C2D29]/6 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-forest/10 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-brand-forest" />
                      </div>
                      <div>
                        <span className="font-semibold text-ink block">{item.mode}</span>
                        <span className="text-[10px] text-ink-muted">{item.percent} of total turnover</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-ink">{item.amount}</span>
                  </div>
                );
              })}
            </div>

            {/* Weekly Trend Mini-Bar Graph */}
            <div className="pt-2 border-t border-[#1C2D29]/8">
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="text-ink-muted">7-Day Revenue Velocity:</span>
                <span className="font-semibold text-brand-forest">Peak: Saturday (₹95K)</span>
              </div>
              <div className="flex items-end gap-2 h-14 pt-1">
                {weeklyTrend.map((t) => (
                  <div key={t.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-brand-forest/80 hover:bg-brand-forest transition-colors"
                      style={{ height: `${(t.rev / 100) * 44}px` }}
                    />
                    <span className="text-[9px] text-ink-muted font-medium">{t.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Export & Financial Closeout (5 Cols) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
                <div>
                  <span className="font-serif font-bold text-base text-brand-forest block">
                    Tax &amp; Audit Ready
                  </span>
                  <span className="text-[11px] text-ink-muted">Zero Discrepancies</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-green/10 text-status-green border border-status-green/20">
                  <CheckCircle2 className="w-3 h-3" /> Balanced
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/8 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Total Room Tariff:</span>
                    <span className="font-mono text-ink">₹74,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">F&amp;B Restaurant Total:</span>
                    <span className="font-mono text-ink">₹12,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Output CGST (9%):</span>
                    <span className="font-mono text-ink">₹7,776</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Output SGST (9%):</span>
                    <span className="font-mono text-ink">₹7,776</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-status-green/10 border border-status-green/20 text-[11px] text-ink-muted flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-green shrink-0 mt-0.5" />
                  <span>Daily automated night audit matches PMS transaction log with bank deposits without manual ledger reconciliation.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C2D29]/8 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors text-center"
              >
                Download PDF Flash Report
              </button>
              <button
                type="button"
                className="py-2 px-3 rounded-xl bg-white border border-[#1C2D29]/15 text-xs font-semibold text-ink hover:bg-brand-sand/50 transition-colors"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

