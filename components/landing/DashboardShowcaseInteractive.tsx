'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from './animations';

/* ══════════════════════════════════════════════════════════════
 * DATA DEFINITIONS
 * ══════════════════════════════════════════════════════════════ */

interface KPICardItem {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  meta?: string;
}

const KPI_DATA: KPICardItem[] = [
  { id: 'kpi-occupancy', label: 'Occupancy', value: 78, suffix: '%' },
  { id: 'kpi-revenue', label: "Today's Revenue", value: 86, prefix: '₹', suffix: 'K' },
  { id: 'kpi-arrivals', label: 'Arrivals', value: 18 },
  { id: 'kpi-departures', label: 'Departures', value: 6 },
  { id: 'kpi-pending', label: 'Pending Payments', value: 3 },
  { id: 'kpi-available', label: 'Available Rooms', value: 12 },
];

interface OccupancyBar {
  day: string;
  fullDay: string;
  value: number;
  type: 'hist' | 'mid' | 'peak';
}

const OCCUPANCY_DATA: OccupancyBar[] = [
  { day: 'M', fullDay: 'Mon', value: 45, type: 'hist' },
  { day: 'T', fullDay: 'Tue', value: 52, type: 'hist' },
  { day: 'W', fullDay: 'Wed', value: 48, type: 'hist' },
  { day: 'T', fullDay: 'Thu', value: 65, type: 'mid' },
  { day: 'F', fullDay: 'Fri', value: 72, type: 'mid' },
  { day: 'S', fullDay: 'Sat', value: 78, type: 'peak' },
  { day: 'S', fullDay: 'Sun', value: 68, type: 'mid' },
  { day: 'M', fullDay: 'Mon', value: 85, type: 'peak' },
  { day: 'T', fullDay: 'Tue', value: 78, type: 'peak' },
  { day: 'W', fullDay: 'Wed', value: 82, type: 'peak' },
  { day: 'T', fullDay: 'Thu', value: 75, type: 'peak' },
  { day: 'F', fullDay: 'Fri', value: 78, type: 'peak' },
];

interface RevenueBar {
  day: string;
  value: number; // percentage height matching existing proportion
  formattedRevenue: string;
  rawRevenue: string;
}

const REVENUE_DATA: RevenueBar[] = [
  { day: 'Mon', value: 35, formattedRevenue: '₹35K', rawRevenue: '₹35,000' },
  { day: 'Tue', value: 48, formattedRevenue: '₹48K', rawRevenue: '₹48,000' },
  { day: 'Wed', value: 72, formattedRevenue: '₹72K', rawRevenue: '₹72,000' },
  { day: 'Thu', value: 55, formattedRevenue: '₹55K', rawRevenue: '₹55,000' },
  { day: 'Fri', value: 88, formattedRevenue: '₹88K', rawRevenue: '₹88,000' },
  { day: 'Sat', value: 65, formattedRevenue: '₹65K', rawRevenue: '₹65,000' },
  { day: 'Sun', value: 92, formattedRevenue: '₹92K', rawRevenue: '₹92,000' },
];

/* ══════════════════════════════════════════════════════════════
 * SKELETON PLACEHOLDER
 * ══════════════════════════════════════════════════════════════ */

export function DashboardShowcaseSkeleton() {
  return (
    <div className="bg-brand-sand/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 border border-border-subtle min-h-[320px] animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 min-[1100px]:grid-cols-6 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 h-16 sm:h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5">
        <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 h-44 sm:h-48" />
        <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 h-44 sm:h-48" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * HIGH-PRECISION NUMERICAL COUNTER (LATCHED & ACCESSIBLE)
 * ══════════════════════════════════════════════════════════════ */

interface SmoothCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  startAnimation: boolean;
  reduced: boolean;
  isHydrated: boolean;
  duration?: number;
}

function SmoothCounter({
  target,
  prefix = '',
  suffix = '',
  startAnimation,
  reduced,
  isHydrated,
  duration = 1100,
}: SmoothCounterProps) {
  const [count, setCount] = useState<number>(target);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (reduced) {
      setCount(target);
      hasFinishedRef.current = true;
      return;
    }

    if (!startAnimation) {
      if (!hasFinishedRef.current) {
        setCount(0);
      }
      return;
    }

    if (hasFinishedRef.current) {
      setCount(target);
      return;
    }

    let rafId: number;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Quartic ease-out for silky deceleration into the final value
      const eased = 1 - Math.pow(1 - progress, 4);
      const val = Math.round(eased * target);
      setCount(val);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setCount(target);
        hasFinishedRef.current = true;
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [startAnimation, target, duration, reduced, isHydrated]);

  // Keep target visible if SSR or hydration hasn't run yet
  const displayValue = !isHydrated ? target : count;

  return (
    <span className="tabular-nums font-serif">
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
 * INTERACTIVE DASHBOARD SHOWCASE COMPONENT
 * ══════════════════════════════════════════════════════════════ */

export default function DashboardShowcaseInteractive({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  // Active hover/focus tooltip state
  const [activeOccupancyIndex, setActiveOccupancyIndex] = useState<number | null>(null);
  const [activeRevenueIndex, setActiveRevenueIndex] = useState<number | null>(null);

  // Hydration safety check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Latch entrance so animations don't re-trigger when scrolling away and back
  useEffect(() => {
    if (inView) {
      setHasEntered(true);
    }
  }, [inView]);

  const isVisible = hasEntered || reduced;

  return (
    <div
      className="bg-brand-sand/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 border border-border-subtle relative overflow-hidden shadow-2xs transition-all"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
        transition: reduced
          ? 'opacity 0.2s ease'
          : 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      role="region"
      aria-label="Hotel Operations Dashboard Overview"
    >
      {/* Subtle architectural grid texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
        aria-hidden="true"
      />

      {/* ── KPI STATISTICS GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 min-[1100px]:grid-cols-6 gap-2.5 sm:gap-3 mb-4 sm:mb-6 relative z-10">
        {KPI_DATA.map((kpi, i) => {
          const cardDelay = 160 + i * 50;

          return (
            <div
              key={kpi.id}
              className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border-subtle relative overflow-hidden select-none transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-forest/30"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
                transition: reduced
                  ? 'opacity 0.2s ease'
                  : `opacity 450ms cubic-bezier(0.16, 1, 0.3, 1) ${cardDelay}ms, transform 450ms cubic-bezier(0.16, 1, 0.3, 1) ${cardDelay}ms, box-shadow 250ms ease, border-color 250ms ease`,
              }}
              tabIndex={0}
              role="group"
              aria-label={`${kpi.label}: ${kpi.prefix || ''}${kpi.value}${kpi.suffix || ''}`}
            >
              {/* Subtle architectural grid texture within card */}
              <div
                className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-60 group-hover:opacity-90 transition-opacity duration-300"
                aria-hidden="true"
              />

              {/* Refined subtle entrance highlight & hover accent */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-forest/20 to-transparent transition-opacity duration-500 opacity-60 group-hover:opacity-100 group-hover:via-brand-forest/40"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <span className="text-[9px] min-[380px]:text-[10px] uppercase tracking-wider font-bold text-ink-muted block truncate">
                  {kpi.label}
                </span>
                <div className="text-lg min-[380px]:text-xl sm:text-2xl font-serif font-bold mt-0.5 sm:mt-1 text-brand-forest leading-tight min-h-[1.5rem] sm:min-h-[1.75rem] flex items-baseline">
                  <SmoothCounter
                    target={kpi.value}
                    suffix={kpi.suffix}
                    prefix={kpi.prefix || ''}
                    startAnimation={hasEntered}
                    reduced={reduced}
                    isHydrated={isHydrated}
                    duration={1000}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS CONTAINER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5 relative z-10">
        
        {/* ── 1. OCCUPANCY TREND CHART ── */}
        <div
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border-subtle relative overflow-visible shadow-xs"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
            transition: reduced
              ? 'opacity 0.2s ease'
              : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 500ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 500ms',
          }}
          role="region"
          aria-label="Occupancy Trend Chart"
        >
          {/* Subtle architectural grid texture */}
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Occupancy Trend
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-status-green font-semibold bg-status-green/10 border border-status-green/20 px-2 py-0.5 rounded-full"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.9)',
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 800ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 800ms',
                }}
              >
                +12% ↑
              </span>
            </div>

            {/* Screen-reader summary */}
            <div className="sr-only">
              Occupancy trend over the last 12 days, currently up 12 percent. Average recent occupancy is 78 percent.
            </div>

            {/* Plot Area with Floating Tooltip Support */}
            <div className="relative h-24 sm:h-28 pt-6 flex items-end gap-1 min-[380px]:gap-1.5">
              
              {/* Dynamic Non-Clipping Tooltip */}
              {activeOccupancyIndex !== null && (
                <div
                  className="absolute pointer-events-none z-30 transition-all duration-150 ease-out"
                  style={{
                    left: `${((activeOccupancyIndex + 0.5) / OCCUPANCY_DATA.length) * 100}%`,
                    bottom:
                      OCCUPANCY_DATA[activeOccupancyIndex].value > 80
                        ? 'calc(100% - 24px)'
                        : `calc(${OCCUPANCY_DATA[activeOccupancyIndex].value}% + 8px)`,
                    transform:
                      activeOccupancyIndex === 0
                        ? 'translateX(0)'
                        : activeOccupancyIndex === OCCUPANCY_DATA.length - 1
                        ? 'translateX(-100%)'
                        : 'translateX(-50%)',
                  }}
                  role="tooltip"
                >
                  <div className="bg-brand-forest text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-lg border border-brand-forest-light/40 whitespace-nowrap">
                    <span className="font-semibold text-brand-sand">
                      {OCCUPANCY_DATA[activeOccupancyIndex].fullDay}:
                    </span>{' '}
                    {OCCUPANCY_DATA[activeOccupancyIndex].value}% Occupancy
                  </div>
                </div>
              )}

              {/* 12 Occupancy Bars */}
              {OCCUPANCY_DATA.map((bar, i) => {
                const barDelay = 580 + i * 35;
                const isFocusedOrHovered = activeOccupancyIndex === i;

                // Subtle opacity transition distinguishing muted historical bars from peak recent bars
                const targetOpacity =
                  bar.type === 'peak' ? 1 : bar.type === 'mid' ? 0.68 : 0.42;

                return (
                  <div
                    key={i}
                    className="flex-1 h-full flex flex-col justify-end group/bar focus-visible:outline-none"
                    onMouseEnter={() => setActiveOccupancyIndex(i)}
                    onMouseLeave={() => setActiveOccupancyIndex(null)}
                    onFocus={() => setActiveOccupancyIndex(i)}
                    onBlur={() => setActiveOccupancyIndex(null)}
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${bar.fullDay}: ${bar.value}% occupancy`}
                  >
                    <div
                      className={`w-full rounded-t sm:rounded-t-sm bg-brand-forest transition-all cursor-pointer ${
                        isFocusedOrHovered
                          ? 'brightness-125 shadow-sm ring-2 ring-brand-forest/30'
                          : ''
                      }`}
                      style={{
                        height: `${bar.value}%`,
                        transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                        transformOrigin: 'bottom',
                        opacity: isVisible ? (isFocusedOrHovered ? 1 : targetOpacity) : 0,
                        transition: reduced
                          ? 'opacity 0.2s ease, filter 0.15s ease'
                          : `transform 650ms cubic-bezier(0.16, 1, 0.3, 1) ${barDelay}ms, opacity 400ms ease ${barDelay}ms, filter 150ms ease`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Weekday Initials Row — Mathematically Aligned with Each Bar */}
            <div
              className="flex gap-1 min-[380px]:gap-1.5 mt-2 select-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: reduced ? 'opacity 0.2s ease' : 'opacity 400ms ease 780ms',
              }}
              aria-hidden="true"
            >
              {OCCUPANCY_DATA.map((bar, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center text-[8.5px] min-[380px]:text-[9.5px] font-medium transition-colors duration-150 ${
                    activeOccupancyIndex === i ? 'text-brand-forest font-bold' : 'text-ink-muted'
                  }`}
                >
                  {bar.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. REVENUE (₹) CHART ── */}
        <div
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border-subtle relative overflow-visible shadow-xs"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
            transition: reduced
              ? 'opacity 0.2s ease'
              : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 580ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 580ms',
          }}
          role="region"
          aria-label="Revenue Chart"
        >
          {/* Subtle architectural grid texture */}
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Revenue (₹)
              </span>
              <span
                className="inline-flex items-center text-[10px] sm:text-[11px] text-brand-forest font-semibold bg-brand-forest/6 border border-brand-forest/15 px-2 py-0.5 rounded-full"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 750ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 750ms',
                }}
              >
                This Week
              </span>
            </div>

            {/* Screen-reader summary */}
            <div className="sr-only">
              Weekly revenue chart from Monday to Sunday. Peak revenue is Sunday at ₹92,000.
            </div>

            {/* Plot Area with Floating Tooltip Support */}
            <div className="relative h-24 sm:h-28 pt-6 flex items-end gap-1.5 sm:gap-2.5">
              
              {/* Dynamic Non-Clipping Tooltip */}
              {activeRevenueIndex !== null && (
                <div
                  className="absolute pointer-events-none z-30 transition-all duration-150 ease-out"
                  style={{
                    left: `${((activeRevenueIndex + 0.5) / REVENUE_DATA.length) * 100}%`,
                    bottom:
                      REVENUE_DATA[activeRevenueIndex].value > 80
                        ? 'calc(100% - 24px)'
                        : `calc(${REVENUE_DATA[activeRevenueIndex].value}% + 8px)`,
                    transform:
                      activeRevenueIndex === 0
                        ? 'translateX(0)'
                        : activeRevenueIndex === REVENUE_DATA.length - 1
                        ? 'translateX(-100%)'
                        : 'translateX(-50%)',
                  }}
                  role="tooltip"
                >
                  <div className="bg-brand-forest text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-lg border border-brand-forest-light/40 whitespace-nowrap">
                    <span className="font-semibold text-brand-sand">
                      {REVENUE_DATA[activeRevenueIndex].day}:
                    </span>{' '}
                    {REVENUE_DATA[activeRevenueIndex].rawRevenue}
                  </div>
                </div>
              )}

              {/* 7 Revenue Bars */}
              {REVENUE_DATA.map((bar, i) => {
                const barDelay = 660 + i * 50;
                const isFocusedOrHovered = activeRevenueIndex === i;
                const targetOpacity = 0.6 + (bar.value / 100) * 0.4;

                return (
                  <div
                    key={i}
                    className="flex-1 h-full flex flex-col justify-end group/bar focus-visible:outline-none"
                    onMouseEnter={() => setActiveRevenueIndex(i)}
                    onMouseLeave={() => setActiveRevenueIndex(null)}
                    onFocus={() => setActiveRevenueIndex(i)}
                    onBlur={() => setActiveRevenueIndex(null)}
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${bar.day}: ${bar.rawRevenue} revenue`}
                  >
                    <div
                      className={`w-full rounded-t sm:rounded-t-md bg-brand-forest transition-all cursor-pointer ${
                        isFocusedOrHovered
                          ? 'brightness-125 shadow-sm ring-2 ring-brand-forest/30'
                          : ''
                      }`}
                      style={{
                        height: `${bar.value}%`,
                        transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                        transformOrigin: 'bottom',
                        opacity: isVisible ? (isFocusedOrHovered ? 1 : targetOpacity) : 0,
                        transition: reduced
                          ? 'opacity 0.2s ease, filter 0.15s ease'
                          : `transform 650ms cubic-bezier(0.16, 1, 0.3, 1) ${barDelay}ms, opacity 400ms ease ${barDelay}ms, filter 150ms ease`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Weekday Labels Row — Mathematically Aligned with Each Bar */}
            <div
              className="flex gap-1.5 sm:gap-2.5 mt-2 select-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: reduced ? 'opacity 0.2s ease' : 'opacity 400ms ease 820ms',
              }}
              aria-hidden="true"
            >
              {REVENUE_DATA.map((bar, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center text-[9px] sm:text-[10px] font-medium transition-colors duration-150 ${
                    activeRevenueIndex === i ? 'text-brand-forest font-bold' : 'text-ink-muted'
                  }`}
                >
                  {bar.day}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

