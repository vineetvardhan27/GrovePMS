import { getDailyReport, getMonthlyReport } from '../../../lib/reports/queries';
import DailyReportView from '../../../components/reports/DailyReport';
import MonthlyReportView from '../../../components/reports/MonthlyReport';
import ReportsTabs from '../../../components/reports/ReportsTabs';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const activeTab = searchParams?.tab === 'monthly' ? 'monthly' : 'daily';

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const [dailyReport, monthlyReport] = await Promise.all([
    getDailyReport(today),
    getMonthlyReport(now.getFullYear(), now.getMonth() + 1),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Reports & Analytics</h1>
        <p className="text-body text-ink-muted">
          Daily cash report, monthly occupancy, ADR, and RevPAR
        </p>
      </div>

      <ReportsTabs
        activeTab={activeTab}
        dailyReport={dailyReport}
        monthlyReport={monthlyReport}
      />
    </div>
  );
}
