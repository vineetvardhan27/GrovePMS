'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  CalendarCheck,
  ClipboardList,
  BedDouble,
  CreditCard,
  UtensilsCrossed,
  Wallet,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { useIsMobile, useReducedMotion } from './animations';

const workflowSteps = [
  { label: 'Reservation', icon: ClipboardList, step: '01', desc: 'Direct booking or OTA channel sync', isMajor: true, isFinal: false, x: 55, y: 88 },
  { label: 'Front Desk', icon: CalendarCheck, step: '02', desc: 'Express check-in & keycard assignment', isMajor: true, isFinal: false, x: 165, y: 72 },
  { label: 'Guest Stay', icon: BedDouble, step: '03', desc: 'Active room stay & guest ledger linking', isMajor: false, isFinal: false, x: 275, y: 58 },
  { label: 'Room Charges', icon: CreditCard, step: '04', desc: 'Automated nightly tariff posting', isMajor: false, isFinal: false, x: 385, y: 50 },
  { label: 'F&B / Banquet', icon: UtensilsCrossed, step: '05', desc: 'POS order & event charge ledger sync', isMajor: false, isFinal: false, x: 495, y: 50 },
  { label: 'Billing', icon: Wallet, step: '06', desc: 'Consolidated folio with GST compliance', isMajor: true, isFinal: false, x: 605, y: 58 },
  { label: 'Payment', icon: CheckCircle2, step: '07', desc: 'Multi-mode settlement: UPI, Card, Cash', isMajor: false, isFinal: false, x: 715, y: 72 },
  { label: 'Reports', icon: BarChart3, step: '08', desc: 'Real-time ADR, RevPAR & GST exports', isMajor: true, isFinal: true, x: 825, y: 88 },
];

const FLOW_CURVE_PATH = 'M 55,88 C 125,76 225,58 385,50 C 495,50 655,58 825,88';

export function OperationalTimelineSkeleton() {
  return (
    <div className="w-full py-4 min-h-[190px] flex items-center justify-center">
      <div className="w-full max-w-3xl h-24 bg-brand-sand/30 rounded-2xl animate-pulse" />
    </div>
  );
}

export default function OperationalTimeline({ inView }: { inView: boolean }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const [pulseActive, setPulseActive] = useState(false);
  const [pulseProgress, setPulseProgress] = useState(0);
  const [pathElement, setPathElement] = useState<SVGPathElement | null>(null);

  useEffect(() => {
    if (!inView || isMobile || reduced) return;

    const timer = setTimeout(() => {
      setPulseActive(true);
      const startTime = performance.now();
      const duration = 850;

      function animateDot(now: number) {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setPulseProgress(eased);

        if (p < 1) {
          requestAnimationFrame(animateDot);
        } else {
          setTimeout(() => setPulseActive(false), 200);
        }
      }

      requestAnimationFrame(animateDot);
    }, 1600);

    return () => clearTimeout(timer);
  }, [inView, isMobile, reduced]);

  const pulsePoint = useMemo(() => {
    if (!pathElement || !pulseActive) return null;
    try {
      const len = pathElement.getTotalLength();
      const pt = pathElement.getPointAtLength(pulseProgress * len);
      return { x: pt.x, y: pt.y };
    } catch {
      return null;
    }
  }, [pathElement, pulseActive, pulseProgress]);

  return (
    <div>
      {/* ── DESKTOP HORIZONTAL CURVED RAIL (md:block) ── */}
      <div className="hidden md:block w-full overflow-x-auto pb-6 pt-2 scrollbar-none">
        <div className="relative mx-auto" style={{ width: '880px', height: '190px' }}>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 880 190"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="opFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C8BCAB" stopOpacity="0.7" />
                <stop offset="25%" stopColor="#8DA39F" />
                <stop offset="60%" stopColor="#3B6B63" />
                <stop offset="85%" stopColor="#244B45" />
                <stop offset="100%" stopColor="#1F3D3A" />
              </linearGradient>

              <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={FLOW_CURVE_PATH}
              fill="none"
              stroke="#DDD5C6"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              opacity="0.5"
            />

            <path
              ref={setPathElement}
              d={FLOW_CURVE_PATH}
              fill="none"
              stroke="url(#opFlowGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="800"
              strokeDashoffset={inView || reduced ? 0 : 800}
              style={{
                transition: reduced ? 'none' : 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 200ms',
              }}
            />

            {pulseActive && pulsePoint && (
              <g
                transform={`translate(${pulsePoint.x}, ${pulsePoint.y})`}
                style={{
                  opacity: pulseProgress > 0.9 ? 1 - (pulseProgress - 0.9) * 10 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                <circle r="9" fill="#2E5A54" opacity="0.3" filter="url(#pulseGlow)" />
                <circle r="4.5" fill="#FFFFFF" stroke="#1F3D3A" strokeWidth="1.5" />
              </g>
            )}
          </svg>

          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{
                  left: `${step.x}px`,
                  top: `${step.y}px`,
                  transform: 'translate(-50%, -50%)',
                  opacity: inView || reduced ? 1 : 0,
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : `opacity 0.5s ease ${300 + i * 100}ms, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${300 + i * 100}ms`,
                }}
              >
                <span className="text-[9px] font-mono font-semibold tracking-wider text-ink-muted/70 uppercase mb-1.5 transition-colors group-hover:text-brand-forest">
                  {step.step}
                </span>

                <div
                  className={`relative rounded-full bg-brand-forest text-white flex items-center justify-center transition-all duration-300 ${
                    step.isFinal
                      ? 'w-14 h-14 shadow-lg shadow-brand-forest/25 ring-4 ring-brand-forest/20 ring-offset-2 ring-offset-brand-sand'
                      : step.isMajor
                      ? 'w-12 h-12 shadow-md shadow-brand-forest/20'
                      : 'w-10 h-10 shadow-sm shadow-brand-forest/15'
                  } group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-brand-forest/30`}
                >
                  <Icon
                    className={`${
                      step.isFinal ? 'w-6 h-6' : step.isMajor ? 'w-5 h-5' : 'w-4 h-4'
                    } text-white transition-transform duration-200 group-hover:scale-110`}
                  />

                  {step.isFinal && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-status-green border-2 border-white flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </span>
                  )}
                </div>

                <span
                  className={`text-xs font-medium text-ink tracking-tight mt-2 text-center leading-tight whitespace-nowrap transition-colors group-hover:text-brand-forest ${
                    step.isFinal ? 'font-semibold text-brand-forest' : ''
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE VERTICAL TIMELINE (<768px) ── */}
      <div className="md:hidden max-w-sm mx-auto pl-4 sm:pl-6 relative">
        <div
          className="absolute left-9 sm:left-11 top-4 bottom-4 w-0.5 rounded-full"
          style={{
            background: 'linear-gradient(to bottom, #C8BCAB 0%, #8DA39F 25%, #3B6B63 60%, #1F3D3A 100%)',
            opacity: inView || reduced ? 1 : 0,
            transform: inView || reduced ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'top',
            transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
          }}
        />

        <div className="space-y-4">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="flex items-center gap-3.5 relative z-10 p-2.5 rounded-xl bg-white/70 border border-border-subtle"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 60}ms`,
                }}
              >
                <div
                  className={`rounded-full bg-brand-forest text-white flex items-center justify-center shrink-0 ${
                    step.isFinal
                      ? 'w-11 h-11 ring-2 ring-brand-forest/20 ring-offset-2'
                      : 'w-9 h-9'
                  }`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-semibold text-ink-muted uppercase">
                      {step.step}
                    </span>
                    <span className={`text-xs font-semibold text-ink ${step.isFinal ? 'text-brand-forest font-bold' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted truncate mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
