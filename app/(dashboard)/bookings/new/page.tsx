import { getRooms } from '../../../../lib/rooms/queries';
import { getGuests } from '../../../../lib/guests/queries';
import BookingForm from '../../../../components/bookings/BookingForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams?: { roomId?: string };
}) {
  const [rooms, guests] = await Promise.all([
    getRooms(),
    getGuests(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/bookings"
          className="p-2 rounded-lg bg-white border border-border-subtle text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-display text-brand-forest">New Reservation</h1>
          <p className="text-body text-ink-muted">Create a walk-in or advance booking</p>
        </div>
      </div>

      <BookingForm
        rooms={rooms}
        preSelectedRoomId={searchParams?.roomId}
        knownGuests={guests}
      />
    </div>
  );
}
