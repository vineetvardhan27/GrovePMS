import { getPayments } from '../../../lib/payments/queries';
import PaymentsList from '../../../components/payments/PaymentsList';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const payments = await getPayments();

  // Today's collection
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = payments
    .filter((p) => p.created_at.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amount, 0);

  const allTimeTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Payments &amp; Collections</h1>
        <p className="text-body text-ink-muted">
          All payment transactions — advances, running payments, and settlements
        </p>
      </div>

      <PaymentsList
        payments={payments}
        todayTotal={todayTotal}
        allTimeTotal={allTimeTotal}
      />
    </div>
  );
}

