import {
  getDailyReport,
  getMonthlyReport,
  getHotelOwnerIntelligence,
} from '../../../lib/reports/queries';
import { ReportPeriod } from '../../../lib/reports/types';
import ReportsTabs from '../../../components/reports/ReportsTabs';
import { getCurrentStaff } from '../../../lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { tab?: string; period?: string };
}) {
  const staff = await getCurrentStaff();
  const activeTab = (searchParams?.tab === 'monthly'
    ? 'monthly'
    : searchParams?.tab === 'daily'
    ? 'daily'
    : 'intelligence') as 'intelligence' | 'daily' | 'monthly';

  const period = (searchParams?.period || 'this_month') as ReportPeriod;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const [intelligenceData, dailyReport, monthlyReport] = await Promise.all([
    getHotelOwnerIntelligence(period, staff?.hotel_id),
    getDailyReport(today, staff?.hotel_id),
    getMonthlyReport(now.getFullYear(), now.getMonth() + 1, staff?.hotel_id),
  ]);

  return (
    <div className="space-y-6">
      <ReportsTabs
        activeTab={activeTab}
        intelligenceData={intelligenceData}
        dailyReport={dailyReport}
        monthlyReport={monthlyReport}
      />
    </div>
  );
}
