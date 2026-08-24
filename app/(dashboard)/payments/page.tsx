import { getHotelWidePaymentStats, getUnifiedPaymentsLedger, getOutstandingReceivables } from '../../../lib/payments/queries';
import PaymentsDashboard from '../../../components/payments/PaymentsDashboard';
import { getCurrentStaff } from '../../../lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const staff = await getCurrentStaff();
  const [transactions, outstanding] = await Promise.all([
    getUnifiedPaymentsLedger(staff?.hotel_id),
    getOutstandingReceivables(staff?.hotel_id),
  ]);
  const stats = await getHotelWidePaymentStats(staff?.hotel_id, transactions, outstanding);

  return (
    <div className="space-y-6">
      <PaymentsDashboard
        initialStats={stats}
        initialTransactions={transactions}
      />
    </div>
  );
}
