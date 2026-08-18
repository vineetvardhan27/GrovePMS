import { getRoomCategories } from '../../../../lib/rooms/queries';
import RoomCategoriesManager from './RoomCategoriesManager';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { redirect } from 'next/navigation';

export default async function RoomCategoriesPage() {
  const staff = await getCurrentStaff();

  // Role check: Only owner & manager
  if (staff && staff.role !== 'owner' && staff.role !== 'manager') {
    redirect('/dashboard?access_denied=true');
  }

  const categories = await getRoomCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-display text-brand-forest">Room Categories</h1>
          <p className="text-body text-ink-muted">
            Configure room types, occupancy limits, and seasonal/base rates
          </p>
        </div>
      </div>

      <RoomCategoriesManager initialCategories={categories} userRole={staff?.role || 'owner'} />
    </div>
  );
}
