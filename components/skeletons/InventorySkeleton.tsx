import React from 'react';
import { Skeleton } from './Skeleton';

export default function InventorySkeleton() {
  return (
    <div
      className="space-y-4 sm:space-y-4.5"
      role="status"
      aria-busy="true"
      aria-label="Loading Inventory & Assets..."
    >
      <span className="sr-only">Loading Inventory & Assets content, please wait...</span>

      {/* 1. Page Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-5 h-5 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-48" />
          </div>
          <Skeleton variant="text" className="h-3.5 w-64" />
        </div>

        {/* Global Operational Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-26 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-28 rounded-lg" />
          <Skeleton variant="rounded" className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* 2. Top-Level Operational & Financial KPIs (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border-subtle p-4 shadow-card flex flex-col justify-between min-h-[96px]">
            <div className="flex items-center justify-between text-ink-muted mb-2">
              <Skeleton variant="text" className="h-2.5 w-18" />
              <Skeleton variant="rounded" className="w-4 h-4 rounded" />
            </div>
            <Skeleton variant="rounded" className="h-7 w-16 my-1" />
            <Skeleton variant="text" className="h-2.5 w-20" />
          </div>
        ))}
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-brand-sand/60 rounded-xl border border-border-subtle overflow-x-auto">
        {['Stock & Asset Levels', 'Suggested Reorders', 'Asset Replacement', 'Wastage & Shrinkage', 'Audit Log'].map(
          (tab, idx) => (
            <Skeleton key={idx} variant="rounded" className="h-8 w-36 rounded-lg shrink-0" />
          )
        )}
      </div>

      {/* 4. Classification Filter Bar & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All Items', 'Linen & Bedding', 'Guest Amenities', 'Housekeeping Supplies', 'Food & Beverage', 'Maintenance'].map(
            (cat, idx) => (
              <Skeleton key={idx} variant="rounded" className="h-7 w-28 rounded-full shrink-0" />
            )
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton variant="rounded" className="h-9 w-full sm:w-64" />
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="h-9 w-32" />
            <Skeleton variant="rounded" className="h-9 w-32" />
          </div>
        </div>
      </div>

      {/* 5. Inventory Table */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-28" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-20" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-28" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-20" /></th>
                <th className="p-4 text-right"><Skeleton variant="text" className="h-3 w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-32" />
                    <Skeleton variant="text" className="h-2.5 w-20 mt-1" />
                  </td>
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-5 w-24 rounded-full" />
                  </td>
                  <td className="p-4 space-y-1.5">
                    <div className="flex justify-between items-center w-28">
                      <Skeleton variant="text" className="h-3 w-12" />
                      <Skeleton variant="text" className="h-2.5 w-8" />
                    </div>
                    <Skeleton variant="rounded" className="h-2 w-28 rounded-full" />
                  </td>
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-5 w-20 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-16" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton variant="rounded" className="h-7 w-7 rounded-md" />
                      <Skeleton variant="rounded" className="h-7 w-7 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
