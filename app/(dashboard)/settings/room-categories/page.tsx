import { getRoomCategories, getRooms, getPropertyResources } from '../../../../lib/rooms/queries';
import RoomCategoriesManager from './RoomCategoriesManager';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RoomCategoriesPage() {
  const staff = await getCurrentStaff();

  // Role check: Housekeeping is blocked from accessing room configuration & pricing
  if (staff && staff.role === 'housekeeping') {
    redirect('/dashboard?access_denied=true');
  }

  const [categories, rooms, propertyResources] = await Promise.all([
    getRoomCategories(),
    getRooms(),
    getPropertyResources(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-display text-brand-forest">Property &amp; Room Configuration</h1>
          <p className="text-body text-ink-muted">
            Configure room categories, weekday/weekend tariffs, guest capacity, and physical floor inventory
          </p>
        </div>
      </div>

      <RoomCategoriesManager
        initialCategories={categories}
        initialRooms={rooms}
        initialResources={propertyResources}
        userRole={staff?.role || 'reception'}
      />
    </div>
  );
}

