import React from 'react';
import { Skeleton } from './Skeleton';

export default function FoodBeverageSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Food & Beverage..."
    >
      <span className="sr-only">Loading Food & Beverage content, please wait...</span>

      {/* 1. Top Module Subnavigation Bar */}
      <div className="bg-white rounded-xl border border-border-subtle p-2 shadow-card flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          {['Overview', 'Bills Ledger', 'Kitchen KOT', 'Menu Items', 'Reports'].map((tab, idx) => (
            <Skeleton key={idx} variant="rounded" className="h-8 w-24 sm:w-28 rounded-lg shrink-0" />
          ))}
        </div>

        <Skeleton variant="rounded" className="h-8 w-32 rounded-lg shrink-0" />
      </div>

      {/* 2. Page Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-60" />
          </div>
          <Skeleton variant="text" className="h-4 w-72 sm:w-96" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton variant="rounded" className="h-9 w-32" />
        </div>
      </div>

      {/* 3. Top Summary KPI Cards (8 columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between min-h-[88px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-2.5 w-14" />
              <Skeleton variant="rounded" className="w-5 h-5 rounded" />
            </div>
            <div className="mt-2 space-y-1">
              <Skeleton variant="rounded" className="h-5 w-16" />
              <Skeleton variant="text" className="h-2 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Quick Actions Shortcut Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-border-subtle shadow-2xs"
          >
            <Skeleton variant="rounded" className="w-8 h-8 rounded-md shrink-0" />
            <div className="space-y-1 flex-1 min-w-0">
              <Skeleton variant="text" className="h-3 w-20" />
              <Skeleton variant="text" className="h-2 w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* 5. Main Overview Columns (Live Kitchen Orders + Recent Bills) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Live Kitchen Tickets */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="w-4 h-4" />
              <Skeleton variant="rounded" className="h-4 w-36" />
            </div>
            <Skeleton variant="rounded" className="h-4 w-16" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-border-subtle bg-brand-sand/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton variant="rounded" className="h-4 w-24" />
                  <Skeleton variant="rounded" className="h-4 w-16 rounded-full" />
                </div>
                <div className="space-y-1">
                  <Skeleton variant="text" className="h-3 w-40" />
                  <Skeleton variant="text" className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Recent Food Bills */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="w-4 h-4" />
              <Skeleton variant="rounded" className="h-4 w-36" />
            </div>
            <Skeleton variant="rounded" className="h-4 w-16" />
          </div>

          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-border-subtle bg-white flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton variant="text" className="h-3.5 w-24 font-mono" />
                  <Skeleton variant="text" className="h-2.5 w-32" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton variant="rounded" className="h-4 w-16 ml-auto" />
                  <Skeleton variant="rounded" className="h-3.5 w-14 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
