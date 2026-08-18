import Link from 'next/link';
import { ArrowRight, Hotel, ShieldCheck, Zap, Database } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-sand">
      <div className="w-full max-w-xl bg-brand-sand-dark border border-border-subtle rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand-forest text-white rounded-xl">
            <Hotel className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-display text-brand-forest">Hotel Greenery View</h1>
            <p className="text-caption text-ink-muted">Hotel Control Centre — Phase 0 Ready</p>
          </div>
        </div>

        <div className="bg-white/80 rounded-xl p-5 border border-border-subtle mb-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <ShieldCheck className="w-5 h-5 text-status-green" />
            <span>Architecture & Design System Active</span>
          </div>
          <p className="text-sm text-ink-muted">
            Phase 0 setup complete: Next.js 14 App Router, Supabase RLS migrations, and color/typography tokens configured.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle text-xs text-ink-muted">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-status-amber" />
              <span>Realtime enabled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-status-blue" />
              <span>Multi-tenant schema</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="flex-1 flex items-center justify-center gap-2 bg-brand-forest hover:bg-brand-forest-light text-white font-medium px-6 py-3 rounded-lg transition-colors min-h-touch"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-brand-sand text-ink font-medium px-6 py-3 rounded-lg border border-border-subtle transition-colors min-h-touch"
          >
            <span>Open Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
