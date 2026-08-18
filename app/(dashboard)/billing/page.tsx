import { Receipt } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Billing & Invoicing</h1>
        <p className="text-body text-ink-muted">GST and Non-GST bill generation</p>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-12 text-center">
        <div className="inline-flex p-3 bg-brand-sand rounded-xl mb-3">
          <Receipt className="w-8 h-8 text-brand-forest" />
        </div>
        <h3 className="text-h2 text-ink">Checkout Billing Engine</h3>
        <p className="text-body text-ink-muted max-w-md mx-auto mt-1">
          Coming in <strong>Phase 4 (Check-In / Check-Out & Billing)</strong> with server-calculated totals and GST toggles.
        </p>
      </div>
    </div>
  );
}
