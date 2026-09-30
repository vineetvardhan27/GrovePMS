'use client';

import React from 'react';
import { useReducedMotion, AnimatedCounter, FadeIn } from './animations';

export function DashboardShowcaseSkeleton() {
  return (
    <div className="bg-brand-sand/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border-subtle min-h-[320px] animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/80 rounded-xl p-3 sm:p-4 h-16" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/80 rounded-xl p-4 sm:p-5 h-36" />
        <div className="bg-white/80 rounded-xl p-4 sm:p-5 h-36" />
      </div>
    </div>
  );
}

export default function DashboardShowcaseInteractive({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();

  return (
    <FadeIn
      inView={inView}
      delay={150}
      scale={true}
      className="bg-brand-sand/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border-subtle"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        {[
          { label: 'Occupancy', val: 78, suf: '%' },
          { label: "Today's Revenue", val: 86, suf: 'K', pre: '₹' },
          { label: 'Arrivals', val: 18, suf: '' },
          { label: 'Departures', val: 6, suf: '' },
          { label: 'Pending Payments', val: 3, suf: '' },
          { label: 'Available Rooms', val: 12, suf: '' },
        ].map((kpi, i) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl p-3 sm:p-4 border border-border-subtle"
            style={{
              opacity: inView || reduced ? 1 : 0,
              transform: inView || reduced ? 'translateY(0)' : 'translateY(8px)',
              transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${250 + i * 50}ms`,
            }}
          >
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-ink-muted block truncate">
              {kpi.label}
            </span>
            <div className="text-lg sm:text-xl font-serif font-bold mt-0.5 text-brand-forest">
              <AnimatedCounter
                target={kpi.val}
                suffix={kpi.suf}
                prefix={kpi.pre || ''}
                inView={inView}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-border-subtle">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              Occupancy Trend
            </span>
            <span className="text-[10px] text-status-green font-semibold">+12% ↑</span>
          </div>
          <div className="flex items-end gap-1 sm:gap-1.5 h-20 sm:h-24">
            {[45, 52, 48, 65, 72, 78, 68, 85, 78, 82, 75, 78].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-brand-forest"
                style={{
                  height: `${h}%`,
                  transform: inView || reduced ? 'scaleY(1)' : 'scaleY(0)',
                  transformOrigin: 'bottom',
                  opacity: inView || reduced ? (h >= 75 ? 1 : h >= 60 ? 0.7 : 0.4) : 0,
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${500 + i * 40}ms, opacity 0.4s ease ${500 + i * 40}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-ink-muted">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F'].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-border-subtle">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              Revenue (₹)
            </span>
            <span className="text-[10px] text-brand-forest font-semibold">This Week</span>
          </div>
          <div className="flex items-end gap-2 h-20 sm:h-24">
            {[35, 48, 72, 55, 88, 65, 92].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-brand-forest"
                style={{
                  height: `${h}%`,
                  transform: inView || reduced ? 'scaleY(1)' : 'scaleY(0)',
                  transformOrigin: 'bottom',
                  opacity: inView || reduced ? 0.5 + (h / 100) * 0.5 : 0,
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${600 + i * 60}ms, opacity 0.4s ease ${600 + i * 60}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-ink-muted">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
