import { getRooms, getRoomCategories, getPropertyResources } from '../../../lib/rooms/queries';
import RoomGrid from '../../../components/rooms/RoomGrid';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const [rooms, categories, propertyResources] = await Promise.all([
    getRooms(),
    getRoomCategories(),
    getPropertyResources(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Room Chart</h1>
        <p className="text-body text-ink-muted">
          Live room availability, housekeeping, and property inventory
        </p>
      </div>

      <RoomGrid
        initialRooms={rooms}
        categories={categories}
        propertyResources={propertyResources}
      />
    </div>
  );
}
