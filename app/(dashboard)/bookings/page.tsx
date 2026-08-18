import { CalendarDays, Plus } from 'lucide-react';

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-brand-forest">Bookings</h1>
          <p className="text-body text-ink-muted">Manage reservations and walk-ins</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-brand-forest opacity-80 cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium min-h-touch"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking (Phase 3)</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-12 text-center">
        <div className="inline-flex p-3 bg-brand-sand rounded-xl mb-3">
          <CalendarDays className="w-8 h-8 text-brand-forest" />
        </div>
        <h3 className="text-h2 text-ink">Bookings & Calendar Module</h3>
        <p className="text-body text-ink-muted max-w-md mx-auto mt-1">
          Coming in <strong>Phase 3 (Bookings & Guests)</strong> with double-booking prevention, calendar view, and quick check-in.
        </p>
      </div>
    </div>
  );
}
