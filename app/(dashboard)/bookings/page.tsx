import { getBookings } from '../../../lib/bookings/queries';
import BookingList from '../../../components/bookings/BookingList';

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Bookings</h1>
        <p className="text-body text-ink-muted">
          Manage reservations, guest arrivals, and check-in schedules
        </p>
      </div>

      <BookingList initialBookings={bookings} />
    </div>
  );
}
