import { Calendar } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import { getBookingsPaginated } from '../../../lib/bookings/queries';
import BookingList from '../../../components/bookings/BookingList';

export const dynamic = 'force-dynamic';

interface BookingsPageProps {
  searchParams?: {
    page?: string;
    status?: string;
    search?: string;
    sortBy?: 'check_in_date' | 'check_out_date' | 'created_at' | 'total_amount';
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  };
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const statusFilter = searchParams?.status || 'all';
  const searchQuery = searchParams?.search || '';
  const sortBy = searchParams?.sortBy || 'check_in_date';
  const sortOrder = searchParams?.sortOrder || 'desc';

  const paginatedResult = await getBookingsPaginated({
    page,
    pageSize: 50,
    statusFilter,
    searchQuery,
    sortBy,
    sortOrder,
    startDate: searchParams?.startDate,
    endDate: searchParams?.endDate,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Manage reservations, guest arrivals, and check-in schedules"
        icon={Calendar}
      />

      <BookingList
        initialData={paginatedResult}
        initialStatus={statusFilter}
        initialSearch={searchQuery}
        initialSortBy={sortBy}
        initialSortOrder={sortOrder}
      />
    </div>
  );
}
