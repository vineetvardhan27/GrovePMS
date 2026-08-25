'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-sand flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border-subtle p-8 text-center shadow-card space-y-6">
        <div className="w-16 h-16 bg-status-red/10 rounded-2xl flex items-center justify-center mx-auto text-status-red">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Something went wrong</h1>
          <p className="text-ink-muted text-sm mt-2">
            An unexpected error occurred. Please try again or contact support if the issue persists.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-forest text-white text-sm font-semibold rounded-xl hover:bg-brand-forest-light transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
