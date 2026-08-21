import { getHotelWidePaymentStats, getUnifiedPaymentsLedger } from '../../../lib/payments/queries';
import PaymentsDashboard from '../../../components/payments/PaymentsDashboard';
import { getCurrentStaff } from '../../../lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const staff = await getCurrentStaff();
  const [stats, transactions] = await Promise.all([
    getHotelWidePaymentStats(staff?.hotel_id),
    getUnifiedPaymentsLedger(staff?.hotel_id),
  ]);

  return (
    <div className="space-y-6">
      <PaymentsDashboard
        initialStats={stats}
        initialTransactions={transactions}
      />
    </div>
  );
}
