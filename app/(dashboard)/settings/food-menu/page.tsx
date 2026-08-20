import { getCurrentStaff } from '../../../../lib/auth/session';
import { getMenuCategories, getMenuItems } from '../../../../lib/menu/queries';
import FoodMenuManager from './FoodMenuManager';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FoodMenuPage() {
  const staff = await getCurrentStaff();

  // Housekeeping is blocked from accessing menu management
  if (!staff || staff.role === 'housekeeping') {
    redirect('/dashboard?access_denied=true');
  }

  const [categories, items] = await Promise.all([
    getMenuCategories(staff.hotel_id),
    getMenuItems(staff.hotel_id, true), // include both active and inactive
  ]);

  const canEdit = staff.role === 'owner' || staff.role === 'manager';

  return (
    <div className="space-y-6">
      <FoodMenuManager
        initialCategories={categories}
        initialItems={items}
        userRole={staff.role}
        canEdit={canEdit}
      />
    </div>
  );
}
