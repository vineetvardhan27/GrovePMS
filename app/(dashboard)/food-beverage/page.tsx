import { getCurrentStaff } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Receipt,
  ChefHat,
  Menu,
  BarChart3,
  Plus,
  LayoutDashboard,
} from 'lucide-react';
import {
  getFBDashboardSummary,
  getFBBills,
  getActiveKitchenOrders,
  getFBMenuItemsWithDetails,
  getFBReportsData,
  getInHouseGuestsForFBBilling,
} from '../../../lib/fb/queries';
import { getMenuCategories } from '../../../lib/menu/queries';
import { getHotelSettings } from '../../../lib/hotels/queries';
import { FB_ROUTES } from '../../../lib/fb/routes';
import FBDashboard from '../../../components/fb/FBDashboard';
import FBBillsHistory from '../../../components/fb/FBBillsHistory';
import KitchenDisplayView from '../../../components/fb/KitchenDisplayView';
import FBMenuManagement from '../../../components/fb/FBMenuManagement';
import FBReportsView from '../../../components/fb/FBReportsView';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { tab?: string };
}

export default async function FoodAndBeveragePage({ searchParams }: PageProps) {
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect('/login');
  }

  const tab = searchParams?.tab || 'overview';
  const hotelId = staff.hotel_id;

  // Always fetch active kitchen orders count for the live subnav badge
  const kitchenOrdersPromise = getActiveKitchenOrders(hotelId);

  // Tab-scoped data queries (only fetch what the active tab displays)
  let summaryPromise: Promise<any> = Promise.resolve(null);
  let billsPromise: Promise<any> = Promise.resolve([]);
  let menuItemsPromise: Promise<any> = Promise.resolve([]);
  let menuCategoriesPromise: Promise<any> = Promise.resolve([]);
  let reportsPromise: Promise<any> = Promise.resolve(null);

  if (tab === 'overview') {
    summaryPromise = getFBDashboardSummary(hotelId);
    billsPromise = getFBBills(hotelId);
  } else if (tab === 'bills') {
    billsPromise = getFBBills(hotelId);
  } else if (tab === 'menu') {
    menuItemsPromise = getFBMenuItemsWithDetails(hotelId);
    menuCategoriesPromise = getMenuCategories(hotelId);
  } else if (tab === 'reports') {
    reportsPromise = getFBReportsData(hotelId, 'this_month');
  }

  const [
    kitchenOrders,
    summary,
    bills,
    menuItems,
    menuCategories,
    reports,
  ] = await Promise.all([
    kitchenOrdersPromise,
    summaryPromise,
    billsPromise,
    menuItemsPromise,
    menuCategoriesPromise,
    reportsPromise,
  ]);

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: FB_ROUTES.OVERVIEW },
    { id: 'bills', label: 'Bills Ledger', icon: Receipt, href: FB_ROUTES.BILLS },
    { id: 'kitchen', label: 'Kitchen KOT', icon: ChefHat, count: kitchenOrders.length, href: FB_ROUTES.KITCHEN },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, href: FB_ROUTES.MENU },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: FB_ROUTES.REPORTS },
  ];

  return (
    <div className="space-y-6">
      {/* Top Module Subnavigation Bar */}
      <div className="bg-white rounded-xl border border-border-subtle p-2 shadow-card flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          {navTabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <Link
                key={t.id}
                href={t.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-brand-forest text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-brand-sand/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-brand-forest' : 'bg-status-amber/20 text-status-amber'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <Link
          href={FB_ROUTES.NEW_BILL}
          className="pms-btn-primary flex items-center gap-1.5 text-xs shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Food Bill</span>
        </Link>
      </div>

      {/* Main Tab Render */}
      {tab === 'overview' && (
        <FBDashboard
          summary={summary}
          recentBills={bills}
          activeKitchenOrders={kitchenOrders}
          userRole={staff.role}
        />
      )}

      {tab === 'bills' && (
        <FBBillsHistory
          bills={bills}
          userRole={staff.role}
        />
      )}

      {tab === 'kitchen' && (
        <KitchenDisplayView
          initialOrders={kitchenOrders}
        />
      )}

      {tab === 'menu' && (
        <FBMenuManagement
          initialItems={menuItems}
          initialCategories={menuCategories}
          userRole={staff.role}
        />
      )}

      {tab === 'reports' && (
        <FBReportsView
          initialReports={reports}
          hotelId={hotelId}
        />
      )}
    </div>
  );
}
