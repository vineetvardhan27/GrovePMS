import { getCurrentStaff } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getInventoryItems,
  getInventoryTransactions,
  getInventorySummary,
} from '../../../lib/inventory/queries';
import InventoryDashboard from '../../../components/inventory/InventoryDashboard';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect('/login');
  }

  // Enforce strict role gating: Owner, Manager, and Housekeeping (damage reporting) have access
  if (staff.role !== 'owner' && staff.role !== 'manager' && staff.role !== 'housekeeping') {
    redirect('/dashboard?access_denied=true');
  }

  const [items, transactions, summary] = await Promise.all([
    getInventoryItems(staff.hotel_id),
    getInventoryTransactions(staff.hotel_id, undefined, 100),
    getInventorySummary(staff.hotel_id),
  ]);

  return (
    <InventoryDashboard
      items={items}
      transactions={transactions}
      summary={summary}
      userRole={staff.role}
    />
  );
}
