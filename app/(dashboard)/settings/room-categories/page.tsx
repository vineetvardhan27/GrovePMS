import { getRoomCategories, getRooms, getPropertyResources } from '../../../../lib/rooms/queries';
import RoomCategoriesManager from './RoomCategoriesManager';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { redirect } from 'next/navigation';
import SettingsHeader from '../../../../components/settings/SettingsHeader';

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
      <SettingsHeader
        title="Property & Room Configuration"
        description="Configure room categories, weekday/weekend tariffs, guest capacity, and physical floor inventory"
        currentPage="Room Categories"
      />

      <RoomCategoriesManager
        initialCategories={categories}
        initialRooms={rooms}
        initialResources={propertyResources}
        userRole={staff?.role || 'reception'}
      />
    </div>
  );
}
