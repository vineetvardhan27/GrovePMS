import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Reports & Analytics</h1>
        <p className="text-body text-ink-muted">Occupancy, ADR, RevPAR, and daily cash report</p>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-12 text-center">
        <div className="inline-flex p-3 bg-brand-sand rounded-xl mb-3">
          <BarChart3 className="w-8 h-8 text-brand-forest" />
        </div>
        <h3 className="text-h2 text-ink">Owner Reports & Daily Cash Flow</h3>
        <p className="text-body text-ink-muted max-w-md mx-auto mt-1">
          Coming in <strong>Phase 5 (Dashboard & Reports)</strong> with automated daily cash reconciliation.
        </p>
      </div>
    </div>
  );
}
