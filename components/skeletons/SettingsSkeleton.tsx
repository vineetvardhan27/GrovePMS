import React from 'react';
import { Skeleton } from './Skeleton';

export default function SettingsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Settings..."
    >
      <span className="sr-only">Loading Settings content, please wait...</span>

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-32" />
          </div>
          <Skeleton variant="text" className="h-4 w-72 sm:w-96" />
        </div>
      </div>

      {/* 2. Settings Modules Grid (4 cards in 2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {[
          { titleWidth: 'w-36', descWidth: 'w-full' },
          { titleWidth: 'w-44', descWidth: 'w-4/5' },
          { titleWidth: 'w-56', descWidth: 'w-full' },
          { titleWidth: 'w-32', descWidth: 'w-5/6' },
        ].map((mod, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden bg-white rounded-xl border border-border-subtle p-5 sm:p-6 shadow-2xs flex flex-col justify-between min-h-[170px] sm:min-h-[185px]"
          >
            {/* Top Content */}
            <div className="space-y-3 z-10">
              {/* Icon & Arrow Row */}
              <div className="flex items-center justify-between">
                <Skeleton variant="rounded" className="w-10 h-10 rounded-xl" />
                <Skeleton variant="rounded" className="w-4 h-4 rounded" />
              </div>

              {/* Title & Description */}
              <div className="pr-12 sm:pr-16 space-y-2">
                <Skeleton variant="rounded" className={`h-5 ${mod.titleWidth}`} />
                <div className="space-y-1.5">
                  <Skeleton variant="text" className="h-3.5 w-full" />
                  <Skeleton variant="text" className={`h-3.5 ${mod.descWidth}`} />
                </div>
              </div>
            </div>

            {/* Bottom Action Link */}
            <div className="mt-5 z-10 flex items-center justify-between">
              <Skeleton variant="rounded" className="h-4 w-36" />
            </div>

            {/* Contextual Illustration Placeholder in Lower-Right */}
            <div className="absolute right-3 bottom-3 opacity-30 pointer-events-none z-0">
              <Skeleton variant="circular" className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
