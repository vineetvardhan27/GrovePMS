import { getCurrentStaff } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getInventoryItems,
  getInventoryTransactions,
  getInventorySummary,
  getWastageSummary,
} from '../../../lib/inventory/queries';
import InventoryDashboard from '../../../components/inventory/InventoryDashboard';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect('/login');
  }

  // Enforce strict role gating: Owner, Manager, and Housekeeping (damage/wastage reporting) have access
  if (staff.role !== 'owner' && staff.role !== 'manager' && staff.role !== 'housekeeping') {
    redirect('/dashboard?access_denied=true');
  }

  const [items, transactions, summary, wastageStats] = await Promise.all([
    getInventoryItems(staff.hotel_id),
    getInventoryTransactions(staff.hotel_id, undefined, 200),
    getInventorySummary(staff.hotel_id),
    getWastageSummary(staff.hotel_id),
  ]);

  return (
    <InventoryDashboard
      items={items}
      transactions={transactions}
      summary={summary}
      wastageStats={wastageStats}
      userRole={staff.role}
    />
  );
}
