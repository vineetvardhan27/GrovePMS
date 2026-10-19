import React from 'react';
import { Skeleton } from './Skeleton';

export default function DashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Dashboard..."
    >
      <span className="sr-only">Loading Dashboard content, please wait...</span>

      {/* 1. Page Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-64" />
          </div>
          <Skeleton variant="text" className="h-4 w-72 sm:w-96" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton variant="rounded" className="h-9 w-32" />
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-3 w-48" />
          <Skeleton variant="text" className="h-3 w-36 hidden sm:block" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-brand-sand/40 border border-border-subtle"
            >
              <Skeleton variant="rounded" className="w-8 h-8 shrink-0 rounded-md" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton variant="text" className="h-3 w-16" />
                <Skeleton variant="text" className="h-2 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Property Status Cards (Available, Occupied, Reserved, Arriving Today) */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-3 w-44" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border-subtle p-4 sm:p-5 shadow-card flex flex-col justify-between min-h-[124px] sm:min-h-[136px]"
            >
              <div className="flex items-start justify-between gap-2">
                <Skeleton variant="text" className="h-3 w-28" />
                <Skeleton variant="circular" className="w-7 h-7 shrink-0" />
              </div>
              <div className="my-1">
                <Skeleton variant="rounded" className="h-8 w-16 sm:w-20" />
              </div>
              <div>
                <Skeleton variant="text" className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Floor-by-Floor Room Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-3 w-48" />
          <Skeleton variant="text" className="h-3 w-32" />
        </div>

        <div className="bg-white rounded-lg border border-border-subtle p-5 md:p-6 shadow-2xs space-y-5">
          {/* Room Chart Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <Skeleton variant="rounded" className="h-6 w-36" />
              <Skeleton variant="rounded" className="h-5 w-20" />
            </div>
            <Skeleton variant="rounded" className="h-4 w-36" />
          </div>

          {/* Simulated Floors: Basement + Ground + First Floor */}
          {[
            { name: 'Basement', count: 1 },
            { name: 'Ground Floor', count: 5 },
            { name: 'First Floor', count: 5 },
          ].map((floor, floorIdx) => (
            <div key={floorIdx} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <Skeleton variant="rounded" className="h-4 w-28" />
                <Skeleton variant="text" className="h-3 w-16" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: floor.count }).map((_, cardIdx) => (
                  <div
                    key={cardIdx}
                    className="p-3.5 rounded-xl border-2 border-border-subtle/80 bg-white min-h-[120px] flex flex-col justify-between shadow-2xs"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="space-y-1">
                        <Skeleton variant="rounded" className="h-6 w-14" />
                        <Skeleton variant="text" className="h-2.5 w-20" />
                      </div>
                      <Skeleton variant="rounded" className="w-7 h-7 rounded-lg shrink-0" />
                    </div>

                    <div className="mt-3 pt-2 border-t border-border-subtle/40 flex items-end justify-between gap-1.5">
                      <div className="space-y-1 flex-1">
                        <Skeleton variant="text" className="h-2.5 w-16" />
                        <Skeleton variant="text" className="h-2.5 w-20" />
                      </div>
                      <Skeleton variant="rounded" className="h-4 w-14 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Financial & Operational Summary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview Panel */}
        <div className="bg-white rounded-xl border border-border-subtle shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <Skeleton variant="rounded" className="h-4 w-36" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>

          <div className="p-4 bg-brand-sand/50 rounded-xl border border-border-subtle space-y-3">
            <div className="flex items-baseline justify-between">
              <Skeleton variant="text" className="h-3 w-32" />
              <Skeleton variant="rounded" className="h-7 w-28" />
            </div>
            <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-border-subtle">
                  <Skeleton variant="text" className="h-3 w-16" />
                  <Skeleton variant="text" className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-status-amber/10 rounded-xl border border-status-amber/25 flex justify-between items-center">
            <div className="space-y-1">
              <Skeleton variant="text" className="h-3 w-28" />
              <Skeleton variant="text" className="h-2.5 w-36" />
            </div>
            <Skeleton variant="rounded" className="h-6 w-24" />
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            <Skeleton variant="text" className="h-3 w-28" />
            <Skeleton variant="text" className="h-3 w-28" />
          </div>
        </div>

        {/* Guest Operations Panel */}
        <div className="bg-white rounded-xl border border-border-subtle shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <Skeleton variant="rounded" className="h-4 w-36" />
            <Skeleton variant="text" className="h-3 w-28" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-3 w-32" />
              <Skeleton variant="rounded" className="h-4 w-14" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-border-subtle bg-brand-sand/30 flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton variant="text" className="h-3.5 w-32" />
                  <Skeleton variant="text" className="h-2.5 w-24" />
                </div>
                <Skeleton variant="rounded" className="h-7 w-20" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-3 w-32" />
              <Skeleton variant="rounded" className="h-4 w-14" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-border-subtle bg-brand-sand/30 flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton variant="text" className="h-3.5 w-32" />
                  <Skeleton variant="text" className="h-2.5 w-24" />
                </div>
                <Skeleton variant="rounded" className="h-7 w-24" />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            <Skeleton variant="text" className="h-3 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
