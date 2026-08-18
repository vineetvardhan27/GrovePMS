import { getRooms, getRoomCategories } from '../../../lib/rooms/queries';
import RoomGrid from '../../../components/rooms/RoomGrid';

export default async function RoomsPage() {
  const [rooms, categories] = await Promise.all([
    getRooms(),
    getRoomCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Room Chart</h1>
        <p className="text-body text-ink-muted">
          Live room availability, housekeeping, and occupancy grid
        </p>
      </div>

      <RoomGrid initialRooms={rooms} categories={categories} />
    </div>
  );
}
