import { Users } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import { getGuestsPaginated } from '../../../lib/guests/queries';
import GuestDirectory from '../../../components/guests/GuestDirectory';

export const dynamic = 'force-dynamic';

interface GuestsPageProps {
  searchParams?: {
    page?: string;
    search?: string;
  };
}

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const searchQuery = searchParams?.search || '';

  const paginatedGuests = await getGuestsPaginated({
    page,
    pageSize: 50,
    query: searchQuery,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Directory"
        description="Search guest profiles, contact records, and repeat stay history"
        icon={Users}
      />

      <GuestDirectory initialData={paginatedGuests} initialSearch={searchQuery} />
    </div>
  );
}
