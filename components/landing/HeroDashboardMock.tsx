'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { useIsMobile, useReducedMotion, AnimatedCounter } from './animations';

const PRODUCT_NAME = 'Grove';

export function HeroDashboardSkeleton() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-border-subtle overflow-hidden text-left shadow-sm min-h-[380px] sm:min-h-[420px] flex flex-col">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border-subtle bg-brand-sand/30">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand-sand/80 animate-pulse" />
            <div className="w-16 h-3 rounded bg-brand-sand/80 animate-pulse" />
          </div>
          <div className="w-12 h-4 rounded-full bg-status-green/10 border border-status-green/20" />
        </div>
        {/* Body skeleton */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-brand-sand/30 rounded-xl p-3 sm:p-4 h-20 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-3 h-44 bg-brand-sand/20 rounded-xl animate-pulse" />
            <div className="sm:col-span-2 h-44 bg-brand-sand/20 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroDashboard({ inView }: { inView: boolean }) {
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
    if (!inView || transitioned || reduced) return;
    const timer = setTimeout(() => {
      setRooms((prev) =>
        prev.map((r) => (r.num === '102' ? { num: '102', status: 'available' } : r))
      );
      setTransitioned(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [inView, transitioned, reduced]);

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
    <div
      className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14 transition-all duration-700"
      style={{
        opacity: inView || reduced ? 1 : 0,
        transform: inView || reduced ? 'translateY(0) scale(1)' : `translateY(${isMobile ? '16px' : '28px'}) scale(0.98)`,
        transitionDelay: isMobile ? '200ms' : '350ms',
      }}
    >
      <div
        className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/60 shadow-glass overflow-hidden text-left relative"
        style={{
          boxShadow: inView || reduced
            ? '0 24px 80px -12px rgba(31, 61, 58, 0.15), 0 8px 24px -8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
            : '0 4px 12px rgba(0, 0, 0, 0.04)',
          transition: 'box-shadow 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Subtle architectural grid texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
          aria-hidden="true"
        />

        {/* Product Chrome Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border-subtle bg-brand-sand/30 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden bg-white border border-border-subtle flex items-center justify-center shrink-0">
              <Image
                src="/Grove.png"
                alt="Grove"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] text-ink font-semibold tracking-wide">
              {PRODUCT_NAME}
            </span>
            <span className="text-[10px] text-ink-muted hidden sm:inline">
              — Control Centre
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-green/10 border border-status-green/20">
            <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
            <span className="text-[10px] text-status-green font-semibold">Live</span>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 relative z-10">
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { label: 'Occupancy', value: 78, suffix: '%', color: 'text-brand-forest' },
              { label: 'Revenue', value: 24, suffix: 'L', prefix: '₹', color: 'text-brand-forest' },
              { label: 'Arrivals', value: 18, suffix: '', color: 'text-brand-forest' },
              { label: 'Departures', value: 6, suffix: '', color: 'text-brand-forest' },
            ].map((kpi, i) => (
              <div
                key={kpi.label}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/60 shadow-xs"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${400 + i * (isMobile ? 50 : 90)}ms`,
                }}
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-ink-muted block">
                  {kpi.label}
                </span>
                <div className={`text-lg sm:text-2xl font-serif font-bold mt-0.5 ${kpi.color}`}>
                  <AnimatedCounter
                    target={kpi.value}
                    suffix={kpi.suffix}
                    prefix={kpi.prefix || ''}
                    inView={inView}
                    duration={1400}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Room Matrix & Activity Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div
              className="sm:col-span-3"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? 'translateX(0)' : `translateX(${isMobile ? '0' : '-12px'})`,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 600ms',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider">
                  Room Matrix
                </span>
                <span className="text-[10px] text-ink-muted">Floor 1–3</span>
              </div>
              <div
                ref={gridRef}
                className="grid grid-cols-4 gap-2"
                onMouseMove={handleGridMouseMove}
                onMouseLeave={handleGridMouseLeave}
              >
                {rooms.map((room, i) => {
                  const isNear = nearTiles.has(i);
                  const isTransitioning = room.num === '102' && transitioned;
                  return (
                    <div
                      key={room.num}
                      data-tile-idx={i}
                      className={`relative p-2 sm:p-2.5 rounded-lg border text-center transition-all ${
                        room.status === 'occupied'
                          ? 'bg-status-red/8 border-status-red/20'
                          : room.status === 'reserved'
                          ? 'bg-status-blue/8 border-status-blue/20'
                          : room.status === 'cleaning'
                          ? 'bg-status-amber/8 border-status-amber/20'
                          : 'bg-status-green/8 border-status-green/20'
                      } ${isTransitioning ? 'ring-2 ring-status-green/40 ring-offset-1' : ''}`}
                      style={{
                        opacity: inView || reduced ? 1 : 0,
                        transform: inView || reduced
                          ? isNear
                            ? 'scale(1.02) translateY(-2px)'
                            : 'scale(1) translateY(0)'
                          : 'scale(0.92)',
                        boxShadow: isNear
                          ? '0 4px 12px rgba(31, 61, 58, 0.12)'
                          : '0 0 0 transparent',
                        transition: isNear
                          ? 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, opacity 0.4s ease'
                          : `transform 0.3s ease, box-shadow 0.3s ease, opacity 0.4s ease ${700 + i * 50}ms`,
                      }}
                    >
                      <span className="text-xs sm:text-sm font-bold text-ink block">{room.num}</span>
                      <span
                        className={`block text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${
                          room.status === 'occupied'
                            ? 'text-status-red'
                            : room.status === 'reserved'
                            ? 'text-status-blue'
                            : room.status === 'cleaning'
                            ? 'text-status-amber'
                            : 'text-status-green'
                        }`}
                      >
                        {room.status === 'occupied'
                          ? 'OCC'
                          : room.status === 'reserved'
                          ? 'RSV'
                          : room.status === 'cleaning'
                          ? 'CLN'
                          : 'AVL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="sm:col-span-2"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? 'translateX(0)' : `translateX(${isMobile ? '0' : '12px'})`,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 750ms',
              }}
            >
              <span className="text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider block mb-2">
                Recent Activity
              </span>
              <div className="space-y-2">
                {activities.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg bg-brand-sand/40"
                    style={{
                      opacity: inView || reduced ? 1 : 0,
                      transform: inView || reduced ? 'translateY(0)' : 'translateY(6px)',
                      transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${850 + i * (isMobile ? 60 : 100)}ms`,
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-green shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-ink leading-tight block truncate">{act.text}</span>
                      <span className="text-[9px] text-ink-muted">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(31,61,58,0.07) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
