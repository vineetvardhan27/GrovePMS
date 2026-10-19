'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Route Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border-subtle p-8 shadow-card space-y-5">
        <div className="w-14 h-14 bg-status-red/10 border border-status-red/20 rounded-2xl flex items-center justify-center mx-auto text-status-red">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-ink">
            Unable to load page content
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            A temporary error occurred while retrieving data for this view. You can retry the request or return to the main dashboard.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="pms-btn-primary w-full justify-center text-xs h-9"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="pms-btn-secondary w-full justify-center text-xs h-9"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-brand-forest" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
