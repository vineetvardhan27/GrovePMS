import React from 'react';
import { Skeleton } from './Skeleton';

export default function PaymentsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Payments..."
    >
      <span className="sr-only">Loading Payments content, please wait...</span>

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-64" />
          </div>
          <Skeleton variant="text" className="h-4 w-72 sm:w-96" />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Skeleton variant="rounded" className="h-9 w-28" />
        </div>
      </div>

      {/* 2. Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-3 w-28" />
              <Skeleton variant="rounded" className="w-8 h-8 rounded-lg" />
            </div>
            <div className="space-y-1">
              <Skeleton variant="rounded" className="h-8 w-28" />
              <Skeleton variant="text" className="h-3 w-36" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Time-Period Preset Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-lg border border-border-subtle shadow-2xs">
        <div className="flex items-center gap-1.5 px-2">
          <Skeleton variant="text" className="h-3.5 w-14" />
        </div>
        {['All History', 'Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'This Year'].map(
          (label, idx) => (
            <Skeleton key={idx} variant="rounded" className="h-7 w-20 rounded-md" />
          )
        )}
      </div>

      {/* 4. Breakdown Insights (Revenue Stream + Payment Mode) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Revenue Stream */}
        <div className="bg-white rounded-xl border border-border-subtle shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="space-y-1">
              <Skeleton variant="rounded" className="h-4 w-44" />
              <Skeleton variant="text" className="h-2.5 w-56" />
            </div>
            <Skeleton variant="rounded" className="w-7 h-7 rounded-lg" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circular" className="w-2 h-2" />
                    <Skeleton variant="text" className="h-3 w-20" />
                  </div>
                  <Skeleton variant="text" className="h-3 w-16" />
                </div>
                <Skeleton variant="rounded" className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Payment Mode */}
        <div className="bg-white rounded-xl border border-border-subtle shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="space-y-1">
              <Skeleton variant="rounded" className="h-4 w-44" />
              <Skeleton variant="text" className="h-2.5 w-56" />
            </div>
            <Skeleton variant="rounded" className="w-7 h-7 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-3 bg-brand-sand/40 rounded-xl border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" className="h-3 w-16" />
                  <Skeleton variant="circular" className="w-6 h-6" />
                </div>
                <Skeleton variant="rounded" className="h-5 w-20" />
                <Skeleton variant="text" className="h-2.5 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. View Tabs & Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-44 rounded-lg" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton variant="rounded" className="h-9 w-full sm:w-64" />
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="h-9 w-28" />
            <Skeleton variant="rounded" className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* 6. Transaction Table */}
      <div className="bg-white rounded-lg border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-20" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-24" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4 text-right"><Skeleton variant="text" className="h-3 w-12 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-20" />
                    <Skeleton variant="text" className="h-2.5 w-14 mt-1" />
                  </td>
                  <td className="p-4"><Skeleton variant="rounded" className="h-5 w-16 rounded-full" /></td>
                  <td className="p-4"><Skeleton variant="text" className="h-3.5 w-20 font-mono" /></td>
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-28" />
                    <Skeleton variant="text" className="h-2.5 w-20 mt-1" />
                  </td>
                  <td className="p-4"><Skeleton variant="text" className="h-3.5 w-16" /></td>
                  <td className="p-4"><Skeleton variant="rounded" className="h-5 w-16 rounded-md" /></td>
                  <td className="p-4"><Skeleton variant="rounded" className="h-4 w-18" /></td>
                  <td className="p-4"><Skeleton variant="rounded" className="h-5 w-16 rounded-full" /></td>
                  <td className="p-4 text-right"><Skeleton variant="rounded" className="h-7 w-12 rounded-md ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <Skeleton variant="text" className="h-3.5 w-44" />
          <div className="flex items-center gap-1">
            <Skeleton variant="rounded" className="h-8 w-16 rounded-lg" />
            <Skeleton variant="rounded" className="h-8 w-8 rounded-lg" />
            <Skeleton variant="rounded" className="h-8 w-8 rounded-lg" />
            <Skeleton variant="rounded" className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
