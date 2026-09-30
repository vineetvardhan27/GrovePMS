import {
  getHotelWidePaymentStats,
  getUnifiedPaymentsLedgerPaginated,
  getOutstandingReceivables,
} from '../../../lib/payments/queries';
import PaymentsDashboard from '../../../components/payments/PaymentsDashboard';
import { getCurrentStaff } from '../../../lib/auth/session';

export const dynamic = 'force-dynamic';

interface PaymentsPageProps {
  searchParams?: {
    page?: string;
    tab?: string;
    source?: string;
    mode?: string;
    type?: string;
    search?: string;
    datePreset?: string;
  };
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const staff = await getCurrentStaff();
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const source = searchParams?.source || 'all';
  const mode = searchParams?.mode || 'all';
  const type = searchParams?.type || 'all';
  const search = searchParams?.search || '';
  const datePreset = searchParams?.datePreset || 'all';
  const tab = searchParams?.tab || 'ledger';

  const [paginatedLedger, outstanding, stats] = await Promise.all([
    getUnifiedPaymentsLedgerPaginated({
      hotelId: staff?.hotel_id,
      page,
      pageSize: 50,
      source,
      paymentMode: mode,
      paymentType: type,
      searchQuery: search,
      datePreset,
    }),
    getOutstandingReceivables(staff?.hotel_id),
    getHotelWidePaymentStats(staff?.hotel_id),
  ]);

  return (
    <div className="space-y-6">
      <PaymentsDashboard
        initialStats={stats}
        initialPaginatedTransactions={paginatedLedger}
        initialOutstanding={outstanding}
        initialFilters={{
          page,
          source,
          mode,
          type,
          search,
          datePreset,
          tab,
        }}
      />
    </div>
  );
}
