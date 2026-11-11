'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Warehouse,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  TrendingDown,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StockItem {
  name: string;
  category: string;
  inStock: number;
  parLevel: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
}

export default function InventoryShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const stockList: StockItem[] = [
    { name: 'Bath Towels (600 GSM White)', category: 'Linen', inStock: 142, parLevel: 120, unit: 'pcs', status: 'healthy' },
    { name: 'Herbal Shampoo (50ml Glass)', category: 'Toiletries', inStock: 24, parLevel: 80, unit: 'btl', status: 'warning' },
    { name: 'Handcrafted Soap Bars (40g)', category: 'Toiletries', inStock: 180, parLevel: 100, unit: 'pcs', status: 'healthy' },
    { name: 'Sparkling Mineral Water (750ml)', category: 'Minibar', inStock: 8, parLevel: 24, unit: 'btl', status: 'critical' },
    { name: 'Single Bed Duvet Covers', category: 'Linen', inStock: 64, parLevel: 60, unit: 'pcs', status: 'healthy' },
  ];

  const filtered = selectedCategory === 'All' ? stockList : stockList.filter((s) => s.category === selectedCategory);

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
                  Property Inventory &amp; Stock Ledger
                </span>
                <span className="text-xs text-ink-muted hidden sm:inline">—</span>
                <span className="text-xs text-ink-muted font-medium hidden sm:inline">
                  Par Level Monitoring
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">Consumables Tracking • Automated Reorder Alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/70 border border-white/90 shadow-2xs">
            {['All', 'Linen', 'Toiletries', 'Minibar'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-forest text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Layout (Split 7 / 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 relative z-10">
          {/* Stock Items Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white/65 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
              <span className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                Active Consumables ({filtered.length} Items)
              </span>
              <span className="text-[11px] text-ink-muted">Par Threshold Status</span>
            </div>

            <div className="space-y-2">
              {filtered.map((item) => {
                const statusBadge =
                  item.status === 'healthy'
                    ? 'bg-status-green/10 text-status-green border-status-green/20'
                    : item.status === 'warning'
                    ? 'bg-status-amber/10 text-status-amber border-status-amber/20'
                    : 'bg-status-red/10 text-status-red border-status-red/20';

                const statusLabel =
                  item.status === 'healthy'
                    ? 'Optimal'
                    : item.status === 'warning'
                    ? 'Reorder Needed'
                    : 'Critical Stock';

                return (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-xl bg-white/60 border border-[#1C2D29]/6 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink block">{item.name}</span>
                      <span className="text-[10px] text-ink-muted">
                        Category: {item.category} • Par Target: {item.parLevel} {item.unit}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-mono font-bold text-ink block">
                          {item.inStock} {item.unit}
                        </span>
                        <span className="text-[10px] text-ink-muted">On Hand</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBadge}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#1C2D29]/8 flex items-center justify-between text-[11px] text-ink-muted">
              <span>Automatic deductions when rooms are checked out</span>
              <span className="font-semibold text-status-amber">2 Items Below Par</span>
            </div>
          </div>

          {/* Supplier PO Dispatch Box (5 Cols) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/85 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.04)] space-y-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2D29]/8">
                <div>
                  <span className="font-serif font-bold text-base text-brand-forest block">
                    Auto-Purchase Order
                  </span>
                  <span className="text-[11px] text-ink-muted">Low Stock Replenishment</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-forest/10 text-brand-forest border border-brand-forest/20">
                  PO #ORD-841
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-brand-sand/40 border border-[#1C2D29]/8 space-y-2">
                  <div className="flex justify-between items-center text-ink-muted">
                    <span>Approved Supplier:</span>
                    <span className="font-semibold text-ink">Himalaya Hospitality Supplies</span>
                  </div>
                  <div className="border-t border-[#1C2D29]/8 pt-2 space-y-1.5">
                    <div className="flex justify-between">
                      <span>• 56x Herbal Shampoo (50ml)</span>
                      <span className="font-mono text-ink">₹2,240</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• 16x Sparkling Water (750ml)</span>
                      <span className="font-mono text-ink">₹1,440</span>
                    </div>
                  </div>
                  <div className="border-t border-[#1C2D29]/8 pt-2 flex justify-between font-bold text-brand-forest">
                    <span>Estimated PO Value:</span>
                    <span className="font-mono">₹3,680.00</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-status-green/10 border border-status-green/20 text-[11px] text-ink-muted flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-green shrink-0 mt-0.5" />
                  <span>Stock levels automatically refresh once supplier delivery is marked received.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C2D29]/8 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl bg-brand-forest text-white text-xs font-semibold hover:bg-brand-forest-light transition-colors text-center"
              >
                Approve &amp; Email PO
              </button>
              <button
                type="button"
                className="py-2 px-3 rounded-xl bg-white border border-[#1C2D29]/15 text-xs font-semibold text-ink hover:bg-brand-sand/50 transition-colors"
              >
                Stock Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

