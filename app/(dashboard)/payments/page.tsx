import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Payments & Collections</h1>
        <p className="text-body text-ink-muted">Cash, UPI, and card transaction records</p>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-12 text-center">
        <div className="inline-flex p-3 bg-brand-sand rounded-xl mb-3">
          <CreditCard className="w-8 h-8 text-brand-forest" />
        </div>
        <h3 className="text-h2 text-ink">Payment Collection Records</h3>
        <p className="text-body text-ink-muted max-w-md mx-auto mt-1">
          Coming in <strong>Phase 4 (Check-In / Check-Out & Billing)</strong> with real-time settlement logging.
        </p>
      </div>
    </div>
  );
}
