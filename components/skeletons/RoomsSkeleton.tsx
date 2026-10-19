import React from 'react';
import { Skeleton } from './Skeleton';

export default function RoomsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Room Chart..."
    >
      <span className="sr-only">Loading Room Chart content, please wait...</span>

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-40" />
          </div>
          <Skeleton variant="text" className="h-4 w-72 sm:w-96" />
        </div>
      </div>

      {/* 2. Accommodation Inventory Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="h-7 w-60 sm:w-72" />
            <Skeleton variant="rounded" className="h-5 w-18 rounded-full" />
          </div>
          <Skeleton variant="text" className="h-3 w-64" />
        </div>

        {/* Group by toggle & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <Skeleton variant="rounded" className="h-9 w-full sm:w-52" />
          <Skeleton variant="rounded" className="h-9 w-full sm:w-36" />
        </div>
      </div>

      {/* 3. Filter Chips Bar (7 statuses) */}
      <div className="flex flex-wrap gap-2 items-center">
        <Skeleton variant="rounded" className="h-8 w-48 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-32 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-32 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-36 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-30 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-30 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-34 rounded-lg" />
      </div>

      {/* 4. Floor Sections (Basement Family Apt + Ground Floor + First Floor) */}
      <div className="space-y-8">
        {/* Floor 0: Basement Family Apartment */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between bg-brand-sand-dark/60 px-4 py-2.5 rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="h-4 w-48" />
              <Skeleton variant="text" className="h-3 w-28 hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl border-2 border-border-subtle/80 bg-white min-h-[120px] flex flex-col justify-between shadow-2xs">
              <div className="flex items-start justify-between w-full">
                <div className="space-y-1">
                  <Skeleton variant="rounded" className="h-5 w-28" />
                  <Skeleton variant="rounded" className="h-4 w-20 rounded" />
                </div>
                <Skeleton variant="rounded" className="w-7 h-7 rounded-lg shrink-0" />
              </div>
              <div className="mt-3 pt-2 border-t border-border-subtle/40 flex items-end justify-between gap-1.5">
                <div className="space-y-1 flex-1">
                  <Skeleton variant="text" className="h-3 w-20" />
                  <Skeleton variant="text" className="h-2.5 w-16" />
                </div>
                <Skeleton variant="rounded" className="h-4 w-14 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Floor 1: Ground Floor */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between bg-brand-sand-dark/60 px-4 py-2.5 rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="h-4 w-44" />
              <Skeleton variant="text" className="h-3 w-20 hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-20" />
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-xl border-2 border-border-subtle/80 bg-white min-h-[120px] flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-start justify-between w-full">
                  <div className="space-y-1">
                    <Skeleton variant="rounded" className="h-7 w-12" />
                    <Skeleton variant="text" className="h-2.5 w-18" />
                  </div>
                  <Skeleton variant="rounded" className="w-7 h-7 rounded-lg shrink-0" />
                </div>
                <div className="mt-3 pt-2 border-t border-border-subtle/40 flex items-end justify-between gap-1.5">
                  <div className="space-y-1 flex-1">
                    <Skeleton variant="text" className="h-3 w-16" />
                    <Skeleton variant="text" className="h-2.5 w-14" />
                  </div>
                  <Skeleton variant="rounded" className="h-4 w-14 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floor 2: First Floor */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between bg-brand-sand-dark/60 px-4 py-2.5 rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="h-4 w-32" />
              <Skeleton variant="text" className="h-3 w-20 hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-20" />
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-xl border-2 border-border-subtle/80 bg-white min-h-[120px] flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-start justify-between w-full">
                  <div className="space-y-1">
                    <Skeleton variant="rounded" className="h-7 w-12" />
                    <Skeleton variant="text" className="h-2.5 w-18" />
                  </div>
                  <Skeleton variant="rounded" className="w-7 h-7 rounded-lg shrink-0" />
                </div>
                <div className="mt-3 pt-2 border-t border-border-subtle/40 flex items-end justify-between gap-1.5">
                  <div className="space-y-1 flex-1">
                    <Skeleton variant="text" className="h-3 w-16" />
                    <Skeleton variant="text" className="h-2.5 w-14" />
                  </div>
                  <Skeleton variant="rounded" className="h-4 w-14 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
