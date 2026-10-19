import React from 'react';
import { Skeleton } from './Skeleton';

export default function BookingsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Bookings..."
    >
      <span className="sr-only">Loading Bookings content, please wait...</span>

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 shrink-0" />
            <Skeleton variant="rounded" className="h-7 w-36" />
          </div>
          <Skeleton variant="text" className="h-4 w-72 sm:w-96" />
        </div>
      </div>

      {/* 2. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border-subtle">
        <div className="w-full sm:w-72">
          <Skeleton variant="rounded" className="h-9 w-full" />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Skeleton variant="rounded" className="flex-1 sm:flex-initial h-9 w-32" />
          <Skeleton variant="rounded" className="flex-1 sm:flex-initial h-9 w-32" />
        </div>
      </div>

      {/* 3. Filter Tabs (All, Confirmed, Checked In, Checked Out, Cancelled) */}
      <div className="flex flex-wrap gap-2">
        <Skeleton variant="rounded" className="h-8 w-16 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-24 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-24 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-26 rounded-lg" />
        <Skeleton variant="rounded" className="h-8 w-22 rounded-lg" />
      </div>

      {/* 4. Bookings Table */}
      <div className="bg-white rounded-lg border border-border-subtle shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-20" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4 text-right"><Skeleton variant="text" className="h-3 w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {/* Booking # */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-20 font-mono" />
                    <Skeleton variant="text" className="h-2.5 w-14 mt-1" />
                  </td>

                  {/* Guest */}
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-28" />
                    <Skeleton variant="text" className="h-2.5 w-20 mt-1" />
                  </td>

                  {/* Room */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-16" />
                    <Skeleton variant="text" className="h-2.5 w-24 mt-1" />
                  </td>

                  {/* Stay Dates */}
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-32" />
                    <Skeleton variant="text" className="h-2.5 w-16 mt-1" />
                  </td>

                  {/* Amount */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-18" />
                    <Skeleton variant="text" className="h-2.5 w-14 mt-1" />
                  </td>

                  {/* Payment */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-5 w-24 rounded-full" />
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-5 w-20 rounded-full" />
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton variant="rounded" className="h-7 w-16 rounded-md" />
                      <Skeleton variant="rounded" className="h-7 w-7 rounded-md" />
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
