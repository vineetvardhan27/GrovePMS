import React from 'react';
import { Skeleton } from './Skeleton';

export default function BanquetHallSkeleton() {
  return (
    <div
      className="space-y-4 sm:space-y-4.5"
      role="status"
      aria-busy="true"
      aria-label="Loading Banquet Hall..."
    >
      <span className="sr-only">Loading Banquet Hall content, please wait...</span>

      {/* 1. Page Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-5 h-5 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-40" />
          </div>
          <Skeleton variant="text" className="h-3.5 w-64" />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-36 rounded-lg" />
        </div>
      </div>

      {/* 2. Hall Resource Overview Card (2-Column Layout) */}
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-card space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          {/* Left Column: Hall Identity */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton variant="rounded" className="w-8 h-8 rounded-lg shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton variant="rounded" className="h-5 w-36" />
                <Skeleton variant="rounded" className="h-4 w-18 rounded-full" />
                <Skeleton variant="text" className="h-3 w-20" />
              </div>
              <Skeleton variant="text" className="h-3 w-72" />
            </div>
          </div>

          {/* Right Column: Pricing */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-start sm:self-center">
            <div className="space-y-1 text-left sm:text-right">
              <Skeleton variant="text" className="h-2.5 w-18" />
              <Skeleton variant="rounded" className="h-5 w-20" />
            </div>
            <div className="h-7 w-px bg-border-subtle" />
            <div className="space-y-1 text-left sm:text-right">
              <Skeleton variant="text" className="h-2.5 w-18" />
              <Skeleton variant="rounded" className="h-5 w-20" />
            </div>
          </div>
        </div>

        {/* Amenities Bar */}
        <div className="pt-2 border-t border-border-subtle/60 flex items-center gap-2">
          <Skeleton variant="text" className="h-2.5 w-16" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" className="h-5 w-20 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Operational & Financial Metrics Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border-subtle p-3 sm:p-3.5 shadow-card flex flex-col justify-between min-h-[92px]">
            <div className="flex items-center justify-between text-ink-muted mb-1.5">
              <Skeleton variant="text" className="h-2.5 w-18" />
              <Skeleton variant="rounded" className="w-3.5 h-3.5 rounded" />
            </div>
            <Skeleton variant="rounded" className="h-6 sm:h-7 w-16 my-0.5" />
            <Skeleton variant="text" className="h-2 w-20" />
          </div>
        ))}
      </div>

      {/* 4. Event Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-brand-sand/60 rounded-xl border border-border-subtle w-fit">
        <Skeleton variant="rounded" className="h-8 w-32 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
      </div>

      {/* 5. Search & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Skeleton variant="rounded" className="h-9 w-full sm:w-72" />
        <div className="flex items-center gap-2">
          <Skeleton variant="rounded" className="h-9 w-32" />
          <Skeleton variant="rounded" className="h-9 w-32" />
        </div>
      </div>

      {/* 6. Banquet Events List Cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border-subtle p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton variant="rounded" className="h-5 w-40" />
                <Skeleton variant="rounded" className="h-4 w-18 rounded-full" />
                <Skeleton variant="rounded" className="h-4 w-18 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton variant="text" className="h-3 w-28" />
                <Skeleton variant="text" className="h-3 w-28" />
                <Skeleton variant="text" className="h-3 w-20" />
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
              <div className="space-y-1 text-left sm:text-right">
                <Skeleton variant="rounded" className="h-4 w-20" />
                <Skeleton variant="text" className="h-2.5 w-16" />
              </div>
              <Skeleton variant="rounded" className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
