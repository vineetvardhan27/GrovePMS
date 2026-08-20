import { getGuests } from '../../../lib/guests/queries';
import { getBookings } from '../../../lib/bookings/queries';
import GuestDirectory from '../../../components/guests/GuestDirectory';

export const dynamic = 'force-dynamic';

export default async function GuestsPage() {
  const [guests, bookings] = await Promise.all([
    getGuests(),
    getBookings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Guest Database</h1>
        <p className="text-body text-ink-muted">
          Search guest profiles, contact records, and repeat stay history
        </p>
      </div>

      <GuestDirectory initialGuests={guests} bookings={bookings} />
    </div>
  );
}
