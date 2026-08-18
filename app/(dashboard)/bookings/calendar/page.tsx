import { getRooms } from '../../../../lib/rooms/queries';
import { getBookings } from '../../../../lib/bookings/queries';
import BookingCalendar from '../../../../components/bookings/BookingCalendar';

export default async function CalendarPage() {
  const [rooms, bookings] = await Promise.all([
    getRooms(),
    getBookings(),
  ]);

  return (
    <div className="space-y-6">
      <BookingCalendar rooms={rooms} bookings={bookings} />
    </div>
  );
}
