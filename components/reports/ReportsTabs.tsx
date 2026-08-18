'use client';

import { useState } from 'react';
import { BarChart3, CalendarDays } from 'lucide-react';
import DailyReportView from './DailyReport';
import MonthlyReportView from './MonthlyReport';
import { DailyReport, MonthlyReport } from '../../lib/reports/queries';

interface ReportsTabsProps {
  activeTab: 'daily' | 'monthly';
  dailyReport: DailyReport;
  monthlyReport: MonthlyReport;
}

export default function ReportsTabs({ activeTab, dailyReport, monthlyReport }: ReportsTabsProps) {
  const [tab, setTab] = useState<'daily' | 'monthly'>(activeTab);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-brand-sand rounded-xl p-1 w-fit border border-border-subtle">
        <button
          type="button"
          onClick={() => setTab('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === 'daily'
              ? 'bg-white text-brand-forest shadow-2xs'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Daily Report
        </button>
        <button
          type="button"
          onClick={() => setTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === 'monthly'
              ? 'bg-white text-brand-forest shadow-2xs'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Monthly Report
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'daily' && <DailyReportView initialReport={dailyReport} />}
      {tab === 'monthly' && <MonthlyReportView initialReport={monthlyReport} />}
    </div>
  );
}
