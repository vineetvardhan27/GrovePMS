import { getCurrentStaff } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getBanquetHall,
  getBanquetBookings,
  getBanquetSummary,
} from '../../../lib/banquet/queries';
import BanquetDashboard from '../../../components/banquet/BanquetDashboard';

export const dynamic = 'force-dynamic';

export default async function BanquetPage() {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect('/login');
  }

  // Role permissions: Owner, Manager, Reception, and Housekeeping
  const [hall, bookings] = await Promise.all([
    getBanquetHall(staff.hotel_id),
    getBanquetBookings(staff.hotel_id),
  ]);
  const summary = await getBanquetSummary(staff.hotel_id, bookings);

  return (
    <BanquetDashboard
      hall={hall}
      bookings={bookings}
      summary={summary}
      userRole={staff.role}
    />
  );
}
