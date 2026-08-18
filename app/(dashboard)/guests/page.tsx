import { Users, Search } from 'lucide-react';

export default function GuestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-brand-forest">Guest Database</h1>
          <p className="text-body text-ink-muted">Search repeat guests and history</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-12 text-center">
        <div className="inline-flex p-3 bg-brand-sand rounded-xl mb-3">
          <Users className="w-8 h-8 text-brand-forest" />
        </div>
        <h3 className="text-h2 text-ink">Guest Database</h3>
        <p className="text-body text-ink-muted max-w-md mx-auto mt-1">
          Coming in <strong>Phase 3 (Bookings & Guests)</strong> with instant mobile/name lookup and stay history.
        </p>
      </div>
    </div>
  );
}
