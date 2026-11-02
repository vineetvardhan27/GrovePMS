'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { useIsMobile, useReducedMotion, AnimatedCounter } from '../animations';

const PRODUCT_NAME = 'Grove';

export default function HeroProductShowcase() {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const [rooms, setRooms] = useState([
    { num: '101', status: 'occupied' },
    { num: '102', status: 'cleaning' },
    { num: '103', status: 'available' },
    { num: '201', status: 'occupied' },
    { num: '202', status: 'reserved' },
    { num: '203', status: 'occupied' },
    { num: '301', status: 'available' },
    { num: '302', status: 'occupied' },
  ]);

  const [transitioned, setTransitioned] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => {
      setRooms((prev) =>
        prev.map((r) => (r.num === '102' ? { num: '102', status: 'available' } : r))
      );
      setTransitioned(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [reduced]);

  const activities = [
    { text: 'Booking #1042 confirmed — Room 301', time: '2m ago' },
    { text: 'Payment ₹4,200 received — UPI', time: '8m ago' },
    { text: 'Room 102 marked clean & inspected', time: 'Just now' },
  ];

  const gridRef = useRef<HTMLDivElement>(null);
  const [nearTiles, setNearTiles] = useState<Set<number>>(new Set());

  const handleGridMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || reduced) return;
      const grid = gridRef.current;
      if (!grid) return;

      const tiles = grid.querySelectorAll('[data-tile-idx]');
      const near = new Set<number>();

      tiles.forEach((tile) => {
        const rect = tile.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
        const idx = parseInt(tile.getAttribute('data-tile-idx') || '0');

        if (dist < 80) {
          near.add(idx);
        }
      });

      setNearTiles(near);
    },
    [isMobile, reduced]
  );

  const handleGridMouseLeave = useCallback(() => {
    setNearTiles(new Set());
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14 transition-all duration-700">
      {/* ── Main Glassmorphic Dashboard Panel ── */}
      <div
        className="rounded-[28px] sm:rounded-[34px] overflow-hidden text-left relative p-5 sm:p-7 lg:p-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 253, 249, 0.52) 50%, rgba(255, 255, 255, 0.65) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.88)',
          boxShadow:
            '0 28px 70px -16px rgba(15, 36, 33, 0.12), 0 8px 24px -6px rgba(15, 36, 33, 0.04), 0 0 0 1px rgba(31, 61, 58, 0.06), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1.5px 2px 0 rgba(15, 36, 33, 0.04)',
        }}
      >
        {/* Subtle architectural grid texture visible through translucent glass */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-60"
          aria-hidden="true"
        />

        {/* Crisp specular top-edge glass highlight */}
        <div
          className="pointer-events-none absolute inset-x-8 sm:inset-x-16 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent z-20"
          aria-hidden="true"
        />

        {/* Upper curved glass glare reflection */}
        <div
          className="pointer-events-none absolute inset-x-12 sm:inset-x-20 top-0 h-8 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[28px] sm:rounded-t-[34px] z-20"
          aria-hidden="true"
        />

        {/* ── Top Header: Logo + Title (Left) and Live Badge (Right) — Seamless without dividing border ── */}
        <div className="flex items-center justify-between relative z-10 mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(31,61,58,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-white/90 flex items-center justify-center shrink-0">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-serif font-bold text-brand-forest text-sm sm:text-base tracking-tight leading-none">
                {PRODUCT_NAME}
              </span>
              <span className="text-[11px] sm:text-xs text-ink-muted/80 font-medium tracking-normal leading-none">
                — Control Centre
              </span>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF5EE] border border-[#D1EBD9] shadow-[0_1px_3px_rgba(46,125,79,0.08),inset_0_1px_1px_rgba(255,255,255,0.85)]"
            title="Real-time operational status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" aria-hidden="true" />
            <span className="text-[10px] sm:text-[10.5px] font-semibold text-[#1F5C3A] tracking-wider uppercase">
              Live
            </span>
          </div>
        </div>

        {/* ── KPI Metric Cards Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10 mb-3.5 sm:mb-4">
          {[
            { label: 'Occupancy', value: 78, suffix: '%', prefix: '' },
            { label: 'Revenue', value: 24, suffix: 'L', prefix: '₹' },
            { label: 'Arrivals', value: 18, suffix: '', prefix: '' },
            { label: 'Departures', value: 6, suffix: '', prefix: '' },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className="relative group bg-white/70 hover:bg-white/85 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 lg:p-5 border border-white/85 hover:border-white shadow-[0_4px_20px_-4px_rgba(15,36,33,0.05),0_1px_3px_rgba(0,0,0,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] hover:shadow-[0_8px_26px_-6px_rgba(15,36,33,0.09),0_2px_6px_rgba(0,0,0,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              style={{
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${400 + i * (isMobile ? 50 : 90)}ms`,
              }}
            >
              {/* Subtle top edge specular reflection */}
              <div
                className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
                aria-hidden="true"
              />
              <span className="text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-muted/80 block">
                {kpi.label}
              </span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-brand-forest mt-1 sm:mt-1.5 tracking-tight flex items-baseline leading-none">
                <AnimatedCounter
                  target={kpi.value}
                  suffix={kpi.suffix}
                  prefix={kpi.prefix || ''}
                  inView={true}
                  duration={1400}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Room Matrix & Recent Activity Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 sm:gap-4 relative z-10">
          {/* Room Matrix Panel */}
          <div className="sm:col-span-3 bg-white/60 backdrop-blur-md rounded-2xl p-3.5 sm:p-5 border border-white/80 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.05),0_1px_3px_rgba(0,0,0,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)] relative overflow-hidden flex flex-col justify-between">
            <div
              className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
              aria-hidden="true"
            />
            <div>
              <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
                <span className="text-[11px] sm:text-xs font-bold text-brand-forest uppercase tracking-[0.14em]">
                  Room Matrix
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-medium text-ink-muted/75">
                  Floor 1–3
                </span>
              </div>

              <div
                ref={gridRef}
                className="grid grid-cols-4 gap-2 sm:gap-2.5"
                onMouseMove={handleGridMouseMove}
                onMouseLeave={handleGridMouseLeave}
              >
                {rooms.map((room, i) => {
                  const isNear = nearTiles.has(i);
                  const isTransitioning = room.num === '102' && transitioned;
                  const isOccupied = room.status === 'occupied';
                  const isReserved = room.status === 'reserved';
                  const isCleaning = room.status === 'cleaning';

                  const statusClass = isOccupied
                    ? 'bg-status-red/[0.08] hover:bg-status-red/[0.12] border-status-red/20 hover:border-status-red/35 text-status-red'
                    : isReserved
                    ? 'bg-status-blue/[0.08] hover:bg-status-blue/[0.12] border-status-blue/20 hover:border-status-blue/35 text-status-blue'
                    : isCleaning
                    ? 'bg-status-amber/[0.08] hover:bg-status-amber/[0.12] border-status-amber/20 hover:border-status-amber/35 text-status-amber'
                    : 'bg-status-green/[0.08] hover:bg-status-green/[0.12] border-status-green/22 hover:border-status-green/35 text-status-green';

                  const statusLabel = isOccupied
                    ? 'OCC'
                    : isReserved
                    ? 'RSV'
                    : isCleaning
                    ? 'CLN'
                    : 'AVL';

                  return (
                    <div
                      key={room.num}
                      data-tile-idx={i}
                      className={`relative p-2 sm:p-2.5 rounded-xl border text-center transition-all backdrop-blur-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)] cursor-default select-none ${statusClass} ${
                        isTransitioning ? 'ring-1.5 ring-status-green/40 ring-offset-1' : ''
                      }`}
                      style={{
                        transform: isNear ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
                        boxShadow: isNear
                          ? '0 6px 16px -2px rgba(15, 36, 33, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                          : '0 1px 3px rgba(15, 36, 33, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
                        transition: isNear
                          ? 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease'
                          : 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                    >
                      <span className="text-xs sm:text-sm font-bold text-ink tracking-tight block">
                        {room.num}
                      </span>
                      <span className="block text-[9px] sm:text-[9.5px] font-bold uppercase tracking-[0.14em] mt-0.5">
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity Panel */}
          <div className="sm:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl p-3.5 sm:p-5 border border-white/80 shadow-[0_4px_20px_-4px_rgba(15,36,33,0.05),0_1px_3px_rgba(0,0,0,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)] relative overflow-hidden flex flex-col justify-between">
            <div
              className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
              aria-hidden="true"
            />
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-brand-forest uppercase tracking-[0.14em] block mb-2.5 sm:mb-3.5">
                Recent Activity
              </span>
              <div className="space-y-2 sm:space-y-2.5">
                {activities.map((act, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/70 hover:bg-white/85 border border-white/80 hover:border-white shadow-[0_1px_3px_rgba(15,36,33,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-150"
                  >
                    <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-status-green/10 border border-status-green/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-status-green" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] sm:text-xs font-medium text-ink leading-tight block truncate">
                        {act.text}
                      </span>
                      <span className="text-[9px] sm:text-[9.5px] text-ink-muted/80 font-normal mt-0.5 block">
                        {act.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Soft Ambient Forest Glow (Behind floating glass panel) ── */}
      <div
        className="absolute -inset-8 -z-10 rounded-[40px] pointer-events-none opacity-80"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(31, 61, 58, 0.08) 0%, rgba(46, 90, 84, 0.03) 50%, transparent 75%)',
        }}
        aria-hidden="true"
      />
    </div>
  );
}
