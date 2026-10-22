'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  CalendarCheck,
  ClipboardList,
  BedDouble,
  CreditCard,
  UtensilsCrossed,
  Wallet,
  CheckCircle2,
  BarChart3,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useIsMobile, useReducedMotion } from './animations';

/* ══════════════════════════════════════════════════════════════
 * WORKFLOW STAGES DATA
 * Exact stage descriptions and icons matching Grove PMS branding
 * ══════════════════════════════════════════════════════════════ */
export interface WorkflowStep {
  id: string;
  label: string;
  step: string;
  desc: string;
  flow: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number; // ViewBox X coordinate (1040 x 280 coordinate space)
  y: number; // ViewBox Y coordinate
  isFinal?: boolean;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 'reservation',
    label: 'Reservation',
    icon: ClipboardList,
    step: '01',
    desc: 'Capture bookings and guest details.',
    flow: 'Feeds Front Desk arrivals & room folio',
    badge: 'Direct & OTA Channel Sync',
    x: 70,
    y: 170,
  },
  {
    id: 'front-desk',
    label: 'Front Desk',
    icon: CalendarCheck,
    step: '02',
    desc: 'Manage check-ins, check-outs, and room assignments.',
    flow: 'Assigns rooms & digital keycards',
    badge: 'Real-Time Room Matrix',
    x: 198,
    y: 135,
  },
  {
    id: 'guest-stay',
    label: 'Guest Stay',
    icon: BedDouble,
    step: '03',
    desc: 'Track occupancy and guest activity.',
    flow: 'Live housekeeping & service logs',
    badge: 'Active Guest Ledger',
    x: 326,
    y: 108,
  },
  {
    id: 'room-charges',
    label: 'Room Charges',
    icon: CreditCard,
    step: '04',
    desc: 'Automatically organize room-related charges.',
    flow: 'Nightly tariffs auto-posted',
    badge: 'Automated Posting Engine',
    x: 454,
    y: 94,
  },
  {
    id: 'fnb-banquet',
    label: 'F&B / Banquet',
    icon: UtensilsCrossed,
    step: '05',
    desc: 'Manage food orders and banquet bookings.',
    flow: 'POS orders synced to room folio',
    badge: 'Instant POS Integration',
    x: 586,
    y: 94,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: Wallet,
    step: '06',
    desc: 'Consolidate guest charges into clear invoices.',
    flow: 'Automated GST invoices & split bills',
    badge: 'Consolidated Folios',
    x: 714,
    y: 108,
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: CheckCircle2,
    step: '07',
    desc: 'Track payments and outstanding balances.',
    flow: 'UPI, card & cash settlements',
    badge: 'Multi-Mode Settlement',
    x: 842,
    y: 135,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    step: '08',
    desc: 'Turn operational data into actionable insights.',
    flow: 'Real-time ADR, RevPAR & audit export',
    badge: 'Audit-Ready Analytics',
    x: 970,
    y: 170,
    isFinal: true,
  },
];

/* Smooth Catmull-Rom Bézier spline connecting all 8 stage centers exactly */
const DESKTOP_CURVE_PATH =
  'M 70,170 C 112.7,158.3 155.3,145.3 198,135 C 240.7,124.7 283.3,114.8 326,108 C 368.7,101.2 410.7,96.3 454,94 C 497.3,91.7 542.7,91.7 586,94 C 629.3,96.3 671.3,101.2 714,108 C 756.7,114.8 799.3,124.7 842,135 C 884.7,145.3 927.3,158.3 970,170';

const ESTIMATED_PATH_LENGTH = 918;

export function OperationalTimelineSkeleton() {
  return (
    <div className="w-full py-8 min-h-[260px] flex items-center justify-center">
      <div className="w-full max-w-4xl h-36 bg-brand-sand/30 rounded-3xl animate-pulse" />
    </div>
  );
}

export default function OperationalTimeline({ inView }: { inView: boolean }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  // Active stage tracked for visual flow highlights
  const [activeStage, setActiveStage] = useState<number>(0);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);

  // Mobile expanded stage state (accordion)
  const [expandedMobileStage, setExpandedMobileStage] = useState<number | null>(0);

  // SVG DOM refs for 60/120fps hardware-accelerated animations with ZERO React state overhead
  const pathRef = useRef<SVGPathElement | null>(null);
  const trailRef = useRef<SVGPathElement | null>(null);
  const particleRef = useRef<SVGGElement | null>(null);
  const mobileParticleRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);

  // Animation flow control refs
  const isPausedRef = useRef<boolean>(false);
  const activeStageRef = useRef<number>(0);
  const pathLengthRef = useRef<number>(ESTIMATED_PATH_LENGTH);

  // Keep activeStageRef in sync
  activeStageRef.current = activeStage;

  // Track hover/focus pause without restarting stream
  useEffect(() => {
    isPausedRef.current = hoveredStage !== null;
  }, [hoveredStage]);

  /* ─────────────────────────────────────────────────────────────
   * 1. Viewport Entrance Animation Trigger
   * ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setRevealed(true);
      return;
    }

    const timer = setTimeout(() => {
      setRevealed(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [inView, reduced]);

  /* Measure actual SVG path length on mount/update */
  const onPathRefChange = useCallback((node: SVGPathElement | null) => {
    pathRef.current = node;
    if (node) {
      try {
        const len = node.getTotalLength();
        if (len > 0) {
          pathLengthRef.current = len;
        }
      } catch {
        // Fallback to pre-calculated estimate
        pathLengthRef.current = ESTIMATED_PATH_LENGTH;
      }
    }
  }, []);

  /* ─────────────────────────────────────────────────────────────
   * 2. High-Performance Fluid Particle & Trail Animation Loop
   * Uses direct DOM transform updates for 60-120fps butter-smooth
   * movement without triggering React component re-renders!
   * ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!inView || reduced) return;

    let rafId: number;
    let startTime: number | null = null;
    const cycleDuration = 7800; // Calm, professional pacing (~1s per stage)
    let accumulatedTime = 0;
    let lastTimestamp = performance.now();

    function animateStream(now: number) {
      const delta = now - lastTimestamp;
      lastTimestamp = now;

      // Don't advance time while user is inspecting a stage
      if (!isPausedRef.current) {
        accumulatedTime += delta;
      }

      const progress = (accumulatedTime % cycleDuration) / cycleDuration;
      const pathEl = pathRef.current;
      const particleEl = particleRef.current;
      const trailEl = trailRef.current;

      if (pathEl && particleEl) {
        const totalLen = pathLengthRef.current;
        const currentDist = progress * totalLen;

        try {
          const pt = pathEl.getPointAtLength(currentDist);
          particleEl.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);

          // Seamless loop opacity fading at extreme ends
          let opacity = 1;
          if (progress < 0.035) {
            opacity = progress / 0.035;
          } else if (progress > 0.965) {
            opacity = (1 - progress) / 0.035;
          }
          particleEl.style.opacity = opacity.toFixed(2);

          // Update trailing comet highlight behind the particle
          if (trailEl) {
            const trailLen = 130;
            trailEl.style.strokeDasharray = `${trailLen} ${totalLen}`;
            trailEl.style.strokeDashoffset = `${-currentDist + trailLen}`;
            trailEl.style.opacity = progress > 0.02 && progress < 0.98 ? '0.95' : '0.2';
          }
        } catch {
          // Fallback if SVG geometry not yet ready
        }

        // Advance active stage highlight cleanly once per stage transition
        const currentStageIdx = Math.min(Math.floor(progress * 8), 7);
        if (currentStageIdx !== activeStageRef.current) {
          setActiveStage(currentStageIdx);
        }
      }

      // Sync mobile timeline particle indicator
      if (mobileParticleRef.current && mobileTrackRef.current) {
        const trackHeight = mobileTrackRef.current.offsetHeight;
        const mobileY = progress * (trackHeight - 32);
        mobileParticleRef.current.style.transform = `translateY(${mobileY.toFixed(1)}px)`;

        let mobOpacity = 1;
        if (progress < 0.035) mobOpacity = progress / 0.035;
        else if (progress > 0.965) mobOpacity = (1 - progress) / 0.035;
        mobileParticleRef.current.style.opacity = mobOpacity.toFixed(2);
      }

      rafId = requestAnimationFrame(animateStream);
    }

    // Delay start until the initial path draw completes
    const kickoffTimer = setTimeout(() => {
      lastTimestamp = performance.now();
      rafId = requestAnimationFrame(animateStream);
    }, 1200);

    return () => {
      clearTimeout(kickoffTimer);
      cancelAnimationFrame(rafId);
    };
  }, [inView, reduced]);

  // Current interactive spotlight
  const currentInspectStage =
    hoveredStage !== null ? hoveredStage : selectedStage !== null ? selectedStage : null;

  const currentActiveStageIndex =
    hoveredStage !== null ? hoveredStage : selectedStage !== null ? selectedStage : activeStage;

  /* Keyboard stage navigation */
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % workflowSteps.length;
      setSelectedStage(next);
      setHoveredStage(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + workflowSteps.length) % workflowSteps.length;
      setSelectedStage(prev);
      setHoveredStage(prev);
    } else if (e.key === 'Escape') {
      setSelectedStage(null);
      setHoveredStage(null);
    }
  };

  return (
    <div className="w-full relative">
      {/* ══════════════════════════════════════════════════════════════
       * DESKTOP & TABLET: HORIZONTAL FLUID WORKFLOW (md:block)
       * Responsive Bézier curve with zero horizontal overflow
       * ══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block w-full max-w-5xl mx-auto relative pt-4 pb-12 select-none">
        {/* Aspect Ratio Container for 100% responsive vector/HTML lock */}
        <div
          className="relative w-full"
          style={{ paddingBottom: '27.5%' /* Aspect ratio 1040:286 */ }}
          role="region"
          aria-label="Interactive Hotel Operations Flow"
        >
          {/* SVG Animated Curves & Particle System */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1040 280"
            fill="none"
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            <defs>
              {/* Underlying muted sage track gradient */}
              <linearGradient id="opBaseTrack" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C8BCAB" stopOpacity="0.75" />
                <stop offset="35%" stopColor="#8EA49E" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#3B6B63" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1F3D3A" stopOpacity="1" />
              </linearGradient>

              {/* Glowing forest-green moving highlight trail */}
              <linearGradient id="opTrailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2E7D4F" stopOpacity="0" />
                <stop offset="50%" stopColor="#2E7D4F" stopOpacity="0.5" />
                <stop offset="85%" stopColor="#3B6B63" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>

              {/* Ambient particle glow filter */}
              <filter id="opGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Wide soft aura filter for active highlight */}
              <filter id="opAura" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
              </filter>
            </defs>

            {/* 1. Underlying dashed guide rail (subtle muted sage) */}
            <path
              d={DESKTOP_CURVE_PATH}
              fill="none"
              stroke="#DDD5C6"
              strokeWidth="2.5"
              strokeDasharray="4 6"
              opacity="0.55"
              strokeLinecap="round"
            />

            {/* 2. Primary connecting curve — Draws on scroll entrance */}
            <path
              ref={onPathRefChange}
              d={DESKTOP_CURVE_PATH}
              fill="none"
              stroke="url(#opBaseTrack)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={pathLengthRef.current}
              strokeDashoffset={revealed || reduced ? 0 : pathLengthRef.current}
              style={{
                transition: reduced
                  ? 'none'
                  : 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1) 150ms',
              }}
            />

            {/* 3. Traveling progress trail behind the particle */}
            {!reduced && (
              <path
                ref={trailRef}
                d={DESKTOP_CURVE_PATH}
                fill="none"
                stroke="url(#opTrailGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0"
                style={{
                  transition: 'opacity 0.25s ease',
                  filter: 'drop-shadow(0 0 4px rgba(46,125,79,0.45))',
                }}
              />
            )}

            {/* 4. Moving glowing light particle */}
            {!reduced && (
              <g
                ref={particleRef}
                opacity="0"
                style={{
                  willChange: 'transform, opacity',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Outermost soft green halo */}
                <circle r="16" fill="#2E7D4F" opacity="0.22" filter="url(#opAura)" />
                {/* Focused glow ring */}
                <circle r="9" fill="#2E5A54" opacity="0.45" filter="url(#opGlow)" />
                {/* Core bright spark */}
                <circle r="4" fill="#FFFFFF" stroke="#1F3D3A" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* ══════════════════════════════════════════════════════════════
           * 8 WORKFLOW NODES & INTERACTIVE HOVER CARDS
           * Positioned precisely via responsive percentages matching SVG
           * ══════════════════════════════════════════════════════════════ */}
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            const isHovered = hoveredStage === i;
            const isSelected = selectedStage === i;
            const isStreamActive = activeStage === i && hoveredStage === null && selectedStage === null;
            const isHighlighted = isHovered || isSelected || isStreamActive;
            const isCardOpen = isHovered || isSelected;

            // Percentage coordinates matching 1040 x 280 viewBox
            const leftPercent = (step.x / 1040) * 100;
            const topPercent = (step.y / 280) * 100;

            // Card alignment positioning to avoid viewport edge clipping
            let cardAlignmentClass = 'left-1/2 -translate-x-1/2';
            let caretAlignmentClass = 'left-1/2 -translate-x-1/2';

            if (i === 0) {
              cardAlignmentClass = 'left-0 translate-x-0';
              caretAlignmentClass = 'left-6';
            } else if (i === 1) {
              cardAlignmentClass = 'left-0 -translate-x-4';
              caretAlignmentClass = 'left-10';
            } else if (i === 6) {
              cardAlignmentClass = 'right-0 translate-x-4';
              caretAlignmentClass = 'right-10';
            } else if (i === 7) {
              cardAlignmentClass = 'right-0 translate-x-0';
              caretAlignmentClass = 'right-6';
            }

            return (
              <div
                key={step.id}
                className="absolute"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHighlighted ? 30 : 10,
                }}
              >
                {/* ── Compact Hover / Focus / Click Information Card ── */}
                <div
                  id={`detail-card-${step.id}`}
                  role="tooltip"
                  className={`absolute bottom-[calc(100%+14px)] ${cardAlignmentClass} w-60 sm:w-64 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-border-subtle shadow-xl shadow-brand-forest/10 transition-all duration-200 pointer-events-none ${
                    isCardOpen
                      ? 'opacity-100 translate-y-0 scale-100 visible'
                      : 'opacity-0 translate-y-2 scale-95 invisible'
                  }`}
                  style={{
                    willChange: 'opacity, transform',
                  }}
                >
                  {/* Top metadata pill */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-forest/8 text-[9px] font-mono font-bold text-brand-forest uppercase tracking-wider">
                      <span>Stage {step.step}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-brand-forest-light bg-status-green/10 px-2 py-0.5 rounded-full">
                      {step.badge}
                    </span>
                  </div>

                  {/* Stage Title */}
                  <h4 className="text-xs font-serif font-bold text-ink flex items-center gap-1.5">
                    <span>{step.label}</span>
                    {step.isFinal && (
                      <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                    )}
                  </h4>

                  {/* Stage description (Exact requirement from prompt) */}
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-1">{step.desc}</p>

                  {/* Connected operational workflow linkage */}
                  <div className="mt-2.5 pt-2 border-t border-border-subtle/60 flex items-center gap-1.5 text-[10px] font-medium text-brand-forest">
                    <Sparkles className="w-3 h-3 text-status-green shrink-0" />
                    <span className="truncate">{step.flow}</span>
                  </div>

                  {/* Downward pointing tooltip caret */}
                  <div
                    className={`absolute top-full ${caretAlignmentClass} -mt-1 w-2.5 h-2.5 rotate-45 bg-white border-r border-b border-border-subtle`}
                    aria-hidden="true"
                  />
                </div>

                {/* ── Interactive Node Button ── */}
                <button
                  type="button"
                  aria-expanded={isCardOpen}
                  aria-describedby={`detail-card-${step.id}`}
                  aria-label={`Stage ${step.step}: ${step.label}. ${step.desc}`}
                  onMouseEnter={() => setHoveredStage(i)}
                  onMouseLeave={() => setHoveredStage(null)}
                  onFocus={() => setHoveredStage(i)}
                  onBlur={() => setHoveredStage(null)}
                  onClick={() => setSelectedStage(selectedStage === i ? null : i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="group flex flex-col items-center focus-visible:outline-none cursor-pointer"
                  style={{
                    opacity: revealed || reduced ? 1 : 0,
                    transform:
                      revealed || reduced
                        ? isHighlighted
                          ? 'translateY(-4px) scale(1.06)'
                          : 'translateY(0) scale(1)'
                        : 'translateY(16px) scale(0.85)',
                    transition: reduced
                      ? 'none'
                      : `opacity 0.5s ease ${200 + i * 90}ms, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                          revealed ? '0ms' : `${200 + i * 90}ms`
                        }`,
                  }}
                >
                  {/* Step Number */}
                  <span
                    className={`text-[9px] lg:text-[10px] font-mono font-semibold tracking-wider uppercase mb-1.5 transition-colors duration-200 ${
                      isHighlighted
                        ? 'text-brand-forest font-bold'
                        : 'text-ink-muted/70 group-hover:text-brand-forest'
                    }`}
                  >
                    {step.step}
                  </span>

                  {/* Circular Node Icon Container */}
                  <div
                    className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.isFinal
                        ? 'w-12 h-12 lg:w-14 lg:h-14 bg-brand-forest text-white shadow-lg shadow-brand-forest/25 ring-4 ring-brand-forest/20 ring-offset-2 ring-offset-brand-sand'
                        : 'w-11 h-11 lg:w-12 lg:h-12 bg-brand-forest text-white shadow-md shadow-brand-forest/20'
                    } ${
                      isHighlighted
                        ? 'bg-brand-forest-light ring-4 ring-brand-forest/30 shadow-xl shadow-brand-forest/35 ring-offset-2 ring-offset-brand-sand'
                        : 'group-hover:bg-brand-forest-light group-hover:ring-2 group-hover:ring-brand-forest/25'
                    } focus-visible:ring-4 focus-visible:ring-brand-forest focus-visible:ring-offset-2`}
                  >
                    <Icon
                      className={`${
                        step.isFinal ? 'w-5 h-5 lg:w-6 lg:h-6' : 'w-4 h-4 lg:w-5 lg:h-5'
                      } text-white transition-transform duration-200 ${
                        isHighlighted ? 'scale-115' : 'group-hover:scale-110'
                      }`}
                    />

                    {/* Reports Final Stage: Live completion indicator */}
                    {step.isFinal && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-status-green border-2 border-white flex items-center justify-center shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      </span>
                    )}

                    {/* Active highlight micro halo */}
                    {isHighlighted && !step.isFinal && (
                      <span
                        className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-30 pointer-events-none"
                        style={{ animationDuration: '2.4s' }}
                      />
                    )}
                  </div>

                  {/* Stage Label Below */}
                  <span
                    className={`text-[11px] lg:text-xs font-medium tracking-tight mt-2 text-center leading-tight whitespace-nowrap transition-colors duration-200 ${
                      isHighlighted
                        ? 'font-bold text-brand-forest'
                        : 'text-ink group-hover:text-brand-forest'
                    } ${step.isFinal ? 'font-semibold text-brand-forest' : ''}`}
                  >
                    {step.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
       * MOBILE: DEDICATED CONNECTED VERTICAL TIMELINE (<768px)
       * Touch-friendly (>=44px), tap-to-expand details, zero overflow
       * ══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden w-full max-w-md mx-auto px-2 sm:px-4 relative pb-6 select-none">
        {/* Vertical SVG Connection Track Behind Nodes */}
        <div
          ref={mobileTrackRef}
          className="absolute left-[31px] sm:left-[35px] top-6 bottom-8 w-1 rounded-full pointer-events-none"
          aria-hidden="true"
        >
          {/* Base muted sage rail */}
          <div className="absolute inset-0 bg-[#DDD5C6]/70 rounded-full" />

          {/* Progressive revealed track */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(to bottom, #C8BCAB 0%, #8DA39F 25%, #3B6B63 60%, #1F3D3A 100%)',
              opacity: revealed || reduced ? 1 : 0,
              transform: revealed || reduced ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'top',
              transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
            }}
          />

          {/* Traveling green pulse on mobile track */}
          {!reduced && (
            <div
              ref={mobileParticleRef}
              className="absolute -left-1 w-3 h-3 rounded-full bg-white border-2 border-brand-forest shadow-md shadow-brand-forest/40 transition-opacity duration-200"
              style={{
                top: 0,
                willChange: 'transform, opacity',
              }}
            >
              <span className="absolute -inset-1 rounded-full bg-status-green/40 animate-ping opacity-60" />
            </div>
          )}
        </div>

        {/* 8 Connected Stages List */}
        <div className="space-y-3 relative z-10" role="list">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            const isExpanded = expandedMobileStage === i;
            const isStreamActive = activeStage === i;

            return (
              <div
                key={step.id}
                role="listitem"
                style={{
                  opacity: revealed || reduced ? 1 : 0,
                  transform:
                    revealed || reduced ? 'translateY(0)' : 'translateY(14px)',
                  transition: reduced
                    ? 'none'
                    : `opacity 0.4s ease ${120 + i * 55}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${
                        120 + i * 55
                      }ms`,
                }}
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedMobileStage(expandedMobileStage === i ? null : i)
                  }
                  className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 min-h-[52px] ${
                    isExpanded
                      ? 'bg-white shadow-md shadow-brand-forest/8 border-brand-forest/30 ring-1 ring-brand-forest/20'
                      : isStreamActive
                      ? 'bg-white/90 border-brand-forest/20 shadow-xs'
                      : 'bg-white/70 border-border-subtle hover:bg-white/90'
                  }`}
                >
                  {/* Left: 44px Touch-Optimized Node Circle */}
                  <div
                    className={`shrink-0 w-11 h-11 rounded-full bg-brand-forest text-white flex items-center justify-center transition-all duration-200 relative ${
                      step.isFinal
                        ? 'ring-2 ring-brand-forest/30 ring-offset-2 ring-offset-brand-sand shadow-sm'
                        : ''
                    } ${
                      isExpanded || isStreamActive
                        ? 'bg-brand-forest-light ring-3 ring-brand-forest/25 shadow-md shadow-brand-forest/20'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                    {step.isFinal && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-status-green border-2 border-white" />
                    )}
                  </div>

                  {/* Right: Content & Accordion Expansion */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-brand-forest/70 uppercase">
                          {step.step}
                        </span>
                        <h4
                          className={`text-sm font-serif font-bold text-ink ${
                            step.isFinal ? 'text-brand-forest' : ''
                          }`}
                        >
                          {step.label}
                        </h4>
                      </div>

                      {/* Expand/Collapse Chevron Indicator */}
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted transition-transform duration-200 shrink-0 ${
                          isExpanded ? 'rotate-180 text-brand-forest' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Concise description */}
                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-border-subtle/70 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center gap-1.5 text-brand-forest font-medium text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-status-green shrink-0" />
                          <span>{step.flow}</span>
                        </div>
                        <div className="mt-1.5 inline-block">
                          <span className="text-[10px] font-semibold text-brand-forest-light bg-brand-forest/8 px-2 py-0.5 rounded-full">
                            {step.badge}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
       * 6. UPGRADED AUDIT-TRAIL BADGE
       * Glassmorphic translucent pill with live animated waveform
       * ══════════════════════════════════════════════════════════════ */}
      <div className="mt-6 sm:mt-8 text-center px-4">
        <div
          className="inline-flex items-center gap-2.5 sm:gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/75 backdrop-blur-md border border-brand-forest/15 shadow-[0_2px_12px_rgba(31,61,58,0.06)] transition-all duration-300 hover:border-brand-forest/30 hover:bg-white/90 hover:shadow-[0_4px_16px_rgba(31,61,58,0.1)] max-w-full"
          role="status"
        >
          {/* Animated 4-Bar Activity Waveform */}
          <div
            className="flex items-center gap-[3px] h-3.5 px-0.5 shrink-0"
            aria-hidden="true"
          >
            <span className="w-[2.5px] bg-brand-forest rounded-full h-2 animate-audit-wave-1" />
            <span className="w-[2.5px] bg-status-green rounded-full h-3.5 animate-audit-wave-2" />
            <span className="w-[2.5px] bg-brand-forest-light rounded-full h-1.5 animate-audit-wave-3" />
            <span className="w-[2.5px] bg-brand-forest rounded-full h-3 animate-audit-wave-4" />
          </div>

          {/* Badge Label */}
          <span className="text-xs sm:text-sm font-medium text-brand-forest tracking-tight truncate">
            Every action creates a connected audit trail
          </span>
        </div>
      </div>
    </div>
  );
}
