import { BedDouble } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
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
      <PageHeader
        title="Room Chart"
        description="Live room availability, housekeeping, and property inventory"
        icon={BedDouble}
      />

      <RoomGrid
        initialRooms={rooms}
        categories={categories}
        propertyResources={propertyResources}
      />
    </div>
  );
}
