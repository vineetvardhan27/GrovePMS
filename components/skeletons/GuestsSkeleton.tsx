import React from 'react';
import { Skeleton } from './Skeleton';

export default function GuestsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Guest Directory..."
    >
      <span className="sr-only">Loading Guest Directory content, please wait...</span>

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-44" />
          </div>
          <Skeleton variant="text" className="h-4 w-72 sm:w-96" />
        </div>
      </div>

      {/* 2. Search & Counter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border-subtle">
        <div className="w-full sm:w-72">
          <Skeleton variant="rounded" className="h-9 w-full" />
        </div>

        <Skeleton variant="text" className="h-3.5 w-48" />
      </div>

      {/* 3. Guest Table */}
      <div className="bg-white rounded-lg border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-24" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-24" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-20" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4 text-center"><Skeleton variant="text" className="h-3 w-12 mx-auto" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-24" /></th>
                <th className="p-4 text-right"><Skeleton variant="text" className="h-3 w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {/* Guest Name + email */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Skeleton variant="text" className="h-4 w-32" />
                      {i % 2 === 0 && <Skeleton variant="rounded" className="h-4 w-14 rounded-full" />}
                    </div>
                    <Skeleton variant="text" className="h-2.5 w-24 mt-1" />
                  </td>

                  {/* Phone */}
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-28" />
                  </td>

                  {/* ID Document */}
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-24" />
                    <Skeleton variant="rounded" className="h-3.5 w-16 rounded mt-1" />
                  </td>

                  {/* Location */}
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-24" />
                  </td>

                  {/* Stays */}
                  <td className="p-4 text-center">
                    <Skeleton variant="rounded" className="h-5 w-8 rounded-full mx-auto" />
                  </td>

                  {/* Total Revenue */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-20" />
                  </td>

                  {/* Actions (Stay History button) */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton variant="rounded" className="h-7 w-24 rounded-lg" />
                    </div>
                  </td>
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
