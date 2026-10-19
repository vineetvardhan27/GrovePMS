import React from 'react';
import { Skeleton } from './Skeleton';

export default function BillingSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading Billing & Folios..."
    >
      <span className="sr-only">Loading Billing & Folios content, please wait...</span>

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

      {/* 2. Billing & Folios Table */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-dark/60 border-b border-border-subtle text-ink font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-16" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-18" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-14" /></th>
                <th className="p-4"><Skeleton variant="text" className="h-3 w-20" /></th>
                <th className="p-4 text-right"><Skeleton variant="text" className="h-3 w-14 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {/* Booking */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-20 font-mono" />
                    <Skeleton variant="text" className="h-2.5 w-16 mt-1" />
                  </td>

                  {/* Guest */}
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-28" />
                    <Skeleton variant="text" className="h-2.5 w-20 mt-1" />
                  </td>

                  {/* Room */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-20" />
                    <Skeleton variant="text" className="h-2.5 w-16 mt-1" />
                  </td>

                  {/* Stay */}
                  <td className="p-4">
                    <Skeleton variant="text" className="h-3.5 w-32" />
                  </td>

                  {/* Charges */}
                  <td className="p-4 space-y-1">
                    <Skeleton variant="text" className="h-3 w-24" />
                    {i % 2 === 0 && <Skeleton variant="text" className="h-2.5 w-20" />}
                  </td>

                  {/* Total */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-18" />
                  </td>

                  {/* Balance Due */}
                  <td className="p-4">
                    <Skeleton variant="rounded" className="h-4 w-20" />
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right">
                    <Skeleton variant="rounded" className="h-8 w-28 rounded-lg ml-auto" />
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
