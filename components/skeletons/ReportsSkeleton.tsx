import React from 'react';
import { Skeleton } from './Skeleton';

export default function ReportsSkeleton() {
  return (
    <div
      className="space-y-4 sm:space-y-4.5"
      role="status"
      aria-busy="true"
      aria-label="Loading Reports..."
    >
      <span className="sr-only">Loading Reports content, please wait...</span>

      {/* 1. Main Tab Switcher */}
      <div className="flex items-center gap-1.5 bg-brand-sand/60 rounded-xl p-1 w-fit border border-border-subtle overflow-x-auto">
        <Skeleton variant="rounded" className="h-8 w-44 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-44 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-44 rounded-lg" />
      </div>

      {/* 2. Executive Header & Period Selector Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="h-4 w-24 rounded" />
            <Skeleton variant="text" className="h-3 w-40" />
          </div>
          <Skeleton variant="rounded" className="h-7 w-64 sm:w-80" />
        </div>

        {/* Period Selector & Print Trigger */}
        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap shrink-0">
          <div className="flex items-center bg-brand-sand/60 p-0.5 rounded-lg border border-border-subtle gap-1">
            {['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'This Quarter', 'This Year'].map(
              (p, idx) => (
                <Skeleton key={idx} variant="rounded" className="h-6 w-18 rounded-md shrink-0" />
              )
            )}
          </div>
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg shrink-0" />
        </div>
      </div>

      {/* 3. Top Executive KPIs (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border-subtle p-3 sm:p-3.5 shadow-card flex flex-col justify-between min-h-[96px]">
            <div className="flex items-center justify-between text-ink-muted mb-1">
              <Skeleton variant="text" className="h-2.5 w-20" />
              <Skeleton variant="rounded" className="w-3.5 h-3.5 rounded" />
            </div>
            <Skeleton variant="rounded" className="h-7 w-24 my-0.5" />
            <Skeleton variant="text" className="h-2.5 w-24" />
          </div>
        ))}
      </div>

      {/* 4. Needs Attention Action Center Card */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b border-border-subtle bg-brand-sand/20">
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="w-4 h-4" />
            <Skeleton variant="rounded" className="h-4 w-32" />
            <Skeleton variant="rounded" className="h-4 w-6 rounded-full" />
          </div>
          <Skeleton variant="text" className="h-3 w-36" />
        </div>
        <div className="p-4 space-y-2.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-3 bg-brand-sand/30 rounded-lg border border-border-subtle flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton variant="text" className="h-3.5 w-48" />
                <Skeleton variant="text" className="h-2.5 w-64" />
              </div>
              <Skeleton variant="rounded" className="h-7 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Chart-Shaped Placeholders (2 columns: Revenue Breakdown + Daily Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Revenue by Department */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="space-y-1">
              <Skeleton variant="rounded" className="h-4 w-44" />
              <Skeleton variant="text" className="h-2.5 w-56" />
            </div>
            <Skeleton variant="rounded" className="w-7 h-7 rounded-lg" />
          </div>

          {/* Visual bar chart simulation */}
          <div className="h-48 pt-6 flex items-end justify-around gap-3 border-b border-border-subtle px-4">
            {[45, 75, 30, 90, 60, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <Skeleton
                  variant="rounded"
                  className="w-full max-w-[28px] rounded-t-md"
                  style={{ height: `${h}%` }}
                />
                <Skeleton variant="text" className="h-2 w-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: ADR & RevPAR Trend */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="space-y-1">
              <Skeleton variant="rounded" className="h-4 w-44" />
              <Skeleton variant="text" className="h-2.5 w-56" />
            </div>
            <Skeleton variant="rounded" className="w-7 h-7 rounded-lg" />
          </div>

          {/* Visual trend / area chart simulation */}
          <div className="h-48 pt-6 flex items-end justify-around gap-3 border-b border-border-subtle px-4">
            {[35, 55, 70, 65, 85, 95, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <Skeleton
                  variant="rounded"
                  className="w-full max-w-[28px] rounded-t-md"
                  style={{ height: `${h}%` }}
                />
                <Skeleton variant="text" className="h-2 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Top Outstanding Accounts Table */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center">
          <Skeleton variant="rounded" className="h-4 w-44" />
          <Skeleton variant="text" className="h-3 w-28" />
        </div>
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton variant="text" className="h-3.5 w-36" />
                <Skeleton variant="text" className="h-2.5 w-48" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton variant="rounded" className="h-4 w-20 ml-auto" />
                <Skeleton variant="text" className="h-2.5 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
