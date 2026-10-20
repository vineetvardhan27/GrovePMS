'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Globe,
  Building2,
  Crown,
  Users,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useReducedMotion } from './animations';

/* ══════════════════════════════════════════════════════════════
 * HOTEL TENANTS DATA
 * ══════════════════════════════════════════════════════════════ */
const HOTELS = [
  {
    name: 'Hotel Alpha',
    location: 'Mumbai',
    tier: 'Urban Boutique · 48 Rooms',
    delayDesktop: 480,
    delayMobile: 360,
  },
  {
    name: 'Hotel Beta',
    location: 'Jaipur',
    tier: 'Heritage Palace · 36 Rooms',
    delayDesktop: 600,
    delayMobile: 480,
  },
  {
    name: 'Hotel Gamma',
    location: 'Goa',
    tier: 'Coastal Resort · 64 Rooms',
    delayDesktop: 720,
    delayMobile: 600,
  },
];

interface MultiPropertyArchitectureProps {
  inView?: boolean;
}

export default function MultiPropertyArchitecture({
  inView: controlledInView,
}: MultiPropertyArchitectureProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [internalInView, setInternalInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Fallback observer if inView is not controlled from parent
  useEffect(() => {
    if (controlledInView !== undefined) return;
    const el = sectionRef.current;
    if (!el) return;

    if (reduced) {
      setInternalInView(true);
      setHasAnimated(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInternalInView(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInternalInView(true);
          setHasAnimated(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [controlledInView, reduced]);

  // Track parent controlled inView
  useEffect(() => {
    if (controlledInView) {
      setHasAnimated(true);
    }
  }, [controlledInView]);

  const isActive = reduced || hasAnimated || (controlledInView ?? internalInView);

  // -------------------------------------------------------------
  // DESKTOP / TABLET COORDINATE MEASUREMENT
  // -------------------------------------------------------------
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const card0Ref = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  const [desktopCoords, setDesktopCoords] = useState<{
    width: number;
    x1: number;
    x2: number;
    x3: number;
  }>({
    width: 768,
    x1: 128,
    x2: 384,
    x3: 640,
  });

  const updateDesktopCoords = () => {
    if (
      !desktopContainerRef.current ||
      !card0Ref.current ||
      !card1Ref.current ||
      !card2Ref.current
    ) {
      return;
    }
    const containerRect = desktopContainerRef.current.getBoundingClientRect();
    const c0 = card0Ref.current.getBoundingClientRect();
    const c1 = card1Ref.current.getBoundingClientRect();
    const c2 = card2Ref.current.getBoundingClientRect();

    if (containerRect.width === 0) return;

    setDesktopCoords({
      width: containerRect.width,
      x1: Math.round(c0.left + c0.width / 2 - containerRect.left),
      x2: Math.round(c1.left + c1.width / 2 - containerRect.left),
      x3: Math.round(c2.left + c2.width / 2 - containerRect.left),
    });
  };

  useLayoutEffect(() => {
    updateDesktopCoords();
    const ro = new ResizeObserver(() => {
      updateDesktopCoords();
    });
    if (desktopContainerRef.current) {
      ro.observe(desktopContainerRef.current);
    }
    window.addEventListener('resize', updateDesktopCoords, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDesktopCoords);
    };
  }, []);

  // -------------------------------------------------------------
  // MOBILE COORDINATE MEASUREMENT (Vertical Trunk & Branches)
  // -------------------------------------------------------------
  const mobileStackRef = useRef<HTMLDivElement>(null);
  const mobileCard0Ref = useRef<HTMLDivElement>(null);
  const mobileCard1Ref = useRef<HTMLDivElement>(null);
  const mobileCard2Ref = useRef<HTMLDivElement>(null);

  const [mobileYCoords, setMobileYCoords] = useState<{
    y1: number;
    y2: number;
    y3: number;
    height: number;
  }>({
    y1: 64,
    y2: 210,
    y3: 356,
    height: 420,
  });

  const updateMobileCoords = () => {
    if (
      !mobileStackRef.current ||
      !mobileCard0Ref.current ||
      !mobileCard1Ref.current ||
      !mobileCard2Ref.current
    ) {
      return;
    }
    const stackRect = mobileStackRef.current.getBoundingClientRect();
    const mc0 = mobileCard0Ref.current.getBoundingClientRect();
    const mc1 = mobileCard1Ref.current.getBoundingClientRect();
    const mc2 = mobileCard2Ref.current.getBoundingClientRect();

    if (stackRect.height === 0) return;

    setMobileYCoords({
      y1: Math.round(mc0.top + mc0.height / 2 - stackRect.top),
      y2: Math.round(mc1.top + mc1.height / 2 - stackRect.top),
      y3: Math.round(mc2.top + mc2.height / 2 - stackRect.top),
      height: Math.round(stackRect.height),
    });
  };

  useLayoutEffect(() => {
    updateMobileCoords();
    const ro = new ResizeObserver(() => {
      updateMobileCoords();
    });
    if (mobileStackRef.current) {
      ro.observe(mobileStackRef.current);
    }
    window.addEventListener('resize', updateMobileCoords, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateMobileCoords);
    };
  }, []);

  const { width: dWidth, x1, x2, x3 } = desktopCoords;
  const bridgeHeight = 56;
  const busY = 28;

  // Desktop SVG paths
  const desktopStemPath = `M ${x2} 0 V ${busY}`;
  const desktopBusPath = `M ${x1} ${busY} H ${x3}`;
  const desktopDropAlpha = `M ${x1} ${busY} V ${bridgeHeight}`;
  const desktopDropBeta = `M ${x2} ${busY} V ${bridgeHeight}`;
  const desktopDropGamma = `M ${x3} ${busY} V ${bridgeHeight}`;

  // Desktop full pulse paths from Platform center down to cards
  const alphaFlowPath = `M ${x2} 0 V ${busY} H ${x1} V ${bridgeHeight}`;
  const betaFlowPath = `M ${x2} 0 V ${bridgeHeight}`;
  const gammaFlowPath = `M ${x2} 0 V ${busY} H ${x3} V ${bridgeHeight}`;

  // Mobile coordinates
  const spineX = 10;
  const branchEndX = 26;
  const { y1: mY1, y2: mY2, y3: mY3, height: mHeight } = mobileYCoords;

  return (
    <div ref={sectionRef} className="w-full relative">
      {/* ─────────────────────────────────────────────────────────
       * 1. DESKTOP & TABLET VIEWPORT (md: 768px and up)
       * ───────────────────────────────────────────────────────── */}
      <div className="hidden md:block max-w-4xl mx-auto px-4 sm:px-6">
        {/* Grove Platform Node (Centered Entrance) */}
        <div className="flex flex-col items-center">
          <div
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 bg-brand-forest text-white rounded-2xl shadow-xs border border-brand-forest-light/30 transition-all duration-500 cursor-default"
            style={{
              opacity: isActive || reduced ? 1 : 0,
              transform:
                isActive || reduced
                  ? 'translateY(0) scale(1)'
                  : 'translateY(14px) scale(0.94)',
              transition: reduced
                ? 'opacity 0.2s ease'
                : 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1), transform 550ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Subtle luminous halo */}
            <div
              className="absolute -inset-1 rounded-2xl bg-brand-forest/15 blur-sm -z-10 opacity-70 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 animate-pulse-subtle" />
            <span className="font-serif font-bold text-sm sm:text-base tracking-wide">
              Grove Platform
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/12 text-white/90 border border-white/15 ml-1">
              <ShieldCheck className="w-3 h-3 text-status-green" />
              <span>Multi-Tenant Core</span>
            </span>
          </div>
        </div>

        {/* Responsive Desktop Connector SVG Bridge */}
        <div ref={desktopContainerRef} className="w-full relative my-1">
          <svg
            width={dWidth}
            height={bridgeHeight}
            viewBox={`0 0 ${dWidth} ${bridgeHeight}`}
            className="w-full overflow-visible pointer-events-none select-none"
            aria-hidden="true"
          >
            <defs>
              <filter id="grove-glow-desktop" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background static / progressive draw lines */}
            <g
              stroke="#1F3D3A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.32"
            >
              <path
                d={desktopStemPath}
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: isActive || reduced ? 0 : 30,
                  transition: reduced
                    ? 'none'
                    : 'stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1) 220ms',
                }}
              />
              <path
                d={desktopBusPath}
                style={{
                  strokeDasharray: Math.max(x3 - x1, 100),
                  strokeDashoffset: isActive || reduced ? 0 : Math.max(x3 - x1, 100),
                  transition: reduced
                    ? 'none'
                    : 'stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1) 320ms',
                }}
              />
              <path
                d={desktopDropAlpha}
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: isActive || reduced ? 0 : 30,
                  transition: reduced
                    ? 'none'
                    : 'stroke-dashoffset 350ms cubic-bezier(0.16, 1, 0.3, 1) 420ms',
                }}
              />
              <path
                d={desktopDropBeta}
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: isActive || reduced ? 0 : 30,
                  transition: reduced
                    ? 'none'
                    : 'stroke-dashoffset 350ms cubic-bezier(0.16, 1, 0.3, 1) 400ms',
                }}
              />
              <path
                d={desktopDropGamma}
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: isActive || reduced ? 0 : 30,
                  transition: reduced
                    ? 'none'
                    : 'stroke-dashoffset 350ms cubic-bezier(0.16, 1, 0.3, 1) 440ms',
                }}
              />
            </g>

            {/* Data Isolation Pulse Indicators (Refined Intermittent Glowing Flow) */}
            {isActive && !reduced && (
              <g
                stroke="#2E7D4F"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                filter="url(#grove-glow-desktop)"
              >
                <path d={alphaFlowPath} className="grove-pulse-flow-side-1" />
                <path d={betaFlowPath} className="grove-pulse-flow-center" />
                <path d={gammaFlowPath} className="grove-pulse-flow-side-2" />
              </g>
            )}

            {/* Precise Terminal Port Anchors at card entry points */}
            {[
              { x: x1, key: 'p0' },
              { x: x2, key: 'p1' },
              { x: x3, key: 'p2' },
            ].map((port) => (
              <g key={port.key}>
                {/* Port border ring */}
                <circle
                  cx={port.x}
                  cy={bridgeHeight}
                  r={5}
                  fill="#F6F2EC"
                  stroke="#1F3D3A"
                  strokeWidth="1.2"
                  opacity={isActive || reduced ? 0.9 : 0}
                  style={{
                    transition: reduced
                      ? 'none'
                      : 'opacity 400ms ease 450ms',
                  }}
                />
                {/* Port core dot */}
                <circle
                  cx={port.x}
                  cy={bridgeHeight}
                  r={2.5}
                  fill="#1F3D3A"
                  opacity={isActive || reduced ? 1 : 0}
                  style={{
                    transition: reduced
                      ? 'none'
                      : 'opacity 400ms ease 450ms',
                  }}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* 3 Hotel Cards in 1 Row (Centered, Equal Width, Interactive) */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full">
          {HOTELS.map((hotel, i) => {
            const cardRef = i === 0 ? card0Ref : i === 1 ? card1Ref : card2Ref;
            return (
              <div
                key={hotel.name}
                ref={cardRef}
                className="group relative bg-white rounded-2xl border border-border-subtle p-4 sm:p-5 text-center overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-forest/35 cursor-default select-none"
                style={{
                  opacity: isActive || reduced ? 1 : 0,
                  transform:
                    isActive || reduced
                      ? 'translateY(0) scale(1)'
                      : 'translateY(18px) scale(0.97)',
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${hotel.delayDesktop}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${hotel.delayDesktop}ms, border-color 200ms ease, box-shadow 250ms ease`,
                  boxShadow:
                    '0 1px 4px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(221, 213, 198, 0.8)',
                }}
              >
                {/* Architectural grid texture */}
                <div
                  className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-60"
                  aria-hidden="true"
                />

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Hotel Icon with Entrance Animation and subtle hover lift */}
                  <div
                    className="w-10 h-10 rounded-xl bg-brand-forest flex items-center justify-center mx-auto mb-2.5 shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5"
                    style={{
                      opacity: isActive || reduced ? 1 : 0,
                      transform:
                        isActive || reduced
                          ? 'scale(1) translateY(0)'
                          : 'scale(0.7) translateY(6px)',
                      transition: reduced
                        ? 'none'
                        : `transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${hotel.delayDesktop + 160}ms, opacity 450ms ease ${hotel.delayDesktop + 160}ms`,
                    }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="font-serif font-bold text-sm sm:text-base text-ink">
                    {hotel.name}
                  </h3>
                  <p className="text-[11px] text-ink-muted mt-0.5">{hotel.location}</p>

                  {/* Isolated Workspace Tenant Badge */}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-green/8 border border-status-green/20 text-status-green text-[10px] font-medium tracking-tight">
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-status-green shrink-0 ${
                        !reduced ? 'grove-isolation-pulse' : ''
                      }`}
                    />
                    <span>Isolated Workspace</span>
                  </div>

                  {/* Isolated Tenant Boundary Pillars */}
                  <div className="mt-3.5 space-y-1 text-[11px] text-ink-muted pt-2.5 border-t border-border-subtle/60">
                    <div className="flex items-center justify-center gap-1.5">
                      <Crown className="w-3 h-3 text-brand-forest" />
                      <span className="font-medium text-ink">Owner</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-3 h-3 text-brand-forest/70" />
                      <span>Dedicated Staff</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3 text-status-green" />
                      <span className="text-ink font-medium">PostgreSQL RLS</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
       * 2. MOBILE VIEWPORT (< 768px - Responsive Vertical Bus)
       * ───────────────────────────────────────────────────────── */}
      <div className="block md:hidden w-full max-w-md mx-auto px-3 sm:px-4">
        {/* Grove Platform Node (Centered Entrance) */}
        <div className="flex flex-col items-center">
          <div
            className="relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-brand-forest text-white rounded-2xl shadow-xs border border-brand-forest-light/30 transition-all duration-500 cursor-default"
            style={{
              opacity: isActive || reduced ? 1 : 0,
              transform:
                isActive || reduced
                  ? 'translateY(0) scale(1)'
                  : 'translateY(12px) scale(0.94)',
              transition: reduced
                ? 'opacity 0.2s ease'
                : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Globe className="w-4 h-4 text-white/90" />
            <span className="font-serif font-bold text-sm sm:text-base tracking-wide">
              Grove Platform
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/12 text-white/90 border border-white/15">
              <ShieldCheck className="w-2.5 h-2.5 text-status-green" />
              <span>Core Hub</span>
            </span>
          </div>

          {/* Mobile Platform-to-Spine Adapter Link */}
          <div className="w-full h-7 relative flex justify-center">
            <svg
              className="w-full h-7 overflow-visible pointer-events-none"
              viewBox="0 0 320 28"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Line from center (160, 0) downward and curving left toward spine (x=16) */}
              <path
                d="M 160 0 V 12 C 160 22, 16 14, 16 28"
                stroke="#1F3D3A"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.32"
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: isActive || reduced ? 0 : 200,
                  transition: reduced
                    ? 'none'
                    : 'stroke-dashoffset 450ms cubic-bezier(0.16, 1, 0.3, 1) 220ms',
                }}
              />
            </svg>
          </div>
        </div>

        {/* Vertical Stack with Left-Hand Backbone Spine */}
        <div ref={mobileStackRef} className="relative pl-7 sm:pl-8 space-y-3">
          {/* Vertical SVG Backbone with short horizontal branches to each card */}
          <div className="absolute left-0 top-0 bottom-0 w-7 pointer-events-none select-none">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 28 ${mHeight || 400}`}
              aria-hidden="true"
            >
              <defs>
                <filter id="grove-glow-mobile" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Vertical trunk line from top (y=0) down to the 3rd card center (mY3) */}
              <line
                x1={spineX}
                y1={0}
                x2={spineX}
                y2={mY3}
                stroke="#1F3D3A"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.32"
                style={{
                  strokeDasharray: mY3,
                  strokeDashoffset: isActive || reduced ? 0 : mY3,
                  transition: reduced
                    ? 'none'
                    : 'stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1) 300ms',
                }}
              />

              {/* 3 Horizontal Branches terminating at each card's left boundary */}
              {[
                { y: mY1, delay: 380, key: 'br0' },
                { y: mY2, delay: 460, key: 'br1' },
                { y: mY3, delay: 540, key: 'br2' },
              ].map((br) => (
                <g key={br.key}>
                  {/* Branch line */}
                  <line
                    x1={spineX}
                    y1={br.y}
                    x2={branchEndX}
                    y2={br.y}
                    stroke="#1F3D3A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.32"
                    style={{
                      strokeDasharray: 20,
                      strokeDashoffset: isActive || reduced ? 0 : 20,
                      transition: reduced
                        ? 'none'
                        : `stroke-dashoffset 250ms cubic-bezier(0.16, 1, 0.3, 1) ${br.delay}ms`,
                    }}
                  />
                  {/* Card Terminal Anchor Port (Right at card edge) */}
                  <circle
                    cx={branchEndX}
                    cy={br.y}
                    r={3.5}
                    fill="#1F3D3A"
                    stroke="#F6F2EC"
                    strokeWidth="1.2"
                    opacity={isActive || reduced ? 1 : 0}
                    style={{
                      transition: reduced ? 'none' : 'opacity 300ms ease 500ms',
                    }}
                  />
                </g>
              ))}

              {/* Mobile Data Isolation Pulse Flow Packets */}
              {isActive && !reduced && (
                <g
                  stroke="#2E7D4F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#grove-glow-mobile)"
                >
                  <path
                    d={`M ${spineX} 0 V ${mY1} H ${branchEndX}`}
                    className="grove-pulse-mobile-1"
                  />
                  <path
                    d={`M ${spineX} 0 V ${mY2} H ${branchEndX}`}
                    className="grove-pulse-mobile-2"
                  />
                  <path
                    d={`M ${spineX} 0 V ${mY3} H ${branchEndX}`}
                    className="grove-pulse-mobile-3"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Stacked Hotel Cards */}
          {HOTELS.map((hotel, i) => {
            const cardRef =
              i === 0 ? mobileCard0Ref : i === 1 ? mobileCard1Ref : mobileCard2Ref;
            return (
              <div
                key={hotel.name}
                ref={cardRef}
                className="relative bg-white rounded-2xl border border-border-subtle p-3.5 sm:p-4 overflow-hidden w-full select-none"
                style={{
                  opacity: isActive || reduced ? 1 : 0,
                  transform:
                    isActive || reduced
                      ? 'translateY(0) scale(1)'
                      : 'translateY(14px) scale(0.98)',
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : `opacity 550ms cubic-bezier(0.16, 1, 0.3, 1) ${hotel.delayMobile}ms, transform 550ms cubic-bezier(0.16, 1, 0.3, 1) ${hotel.delayMobile}ms`,
                  boxShadow:
                    '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(221, 213, 198, 0.8)',
                }}
              >
                {/* Architectural grid texture */}
                <div
                  className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-50"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  {/* Top: Hotel identity row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-forest flex items-center justify-center shrink-0 shadow-xs">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-ink leading-tight">
                          {hotel.name}
                        </h3>
                        <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                          {hotel.location}
                        </p>
                      </div>
                    </div>

                    {/* Isolated badge */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-green/10 border border-status-green/20 text-status-green text-[10px] font-medium shrink-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-status-green shrink-0 ${
                          !reduced ? 'grove-isolation-pulse' : ''
                        }`}
                      />
                      <span>Isolated</span>
                    </div>
                  </div>

                  {/* Bottom: 3 Isolation boundaries */}
                  <div className="grid grid-cols-3 gap-1 pt-2.5 mt-2.5 border-t border-border-subtle/60 text-center text-[10px] text-ink-muted">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="w-3 h-3 text-brand-forest shrink-0" />
                      <span className="font-medium text-ink">Owner</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-brand-forest/70 shrink-0" />
                      <span>Staff</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-status-green shrink-0" />
                      <span className="text-ink font-medium">RLS Policy</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
