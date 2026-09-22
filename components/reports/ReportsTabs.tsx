'use client';

import { useState } from 'react';
import { BarChart3, CalendarDays, LineChart, Building2 } from 'lucide-react';
import DailyReportView from './DailyReport';
import MonthlyReportView from './MonthlyReport';
import OwnerIntelligenceDashboard from './OwnerIntelligenceDashboard';
import type { DailyReport, MonthlyReport } from '../../lib/reports/queries';
import type { HotelOwnerIntelligence } from '../../lib/reports/types';

interface ReportsTabsProps {
  activeTab?: 'intelligence' | 'daily' | 'monthly';
  intelligenceData: HotelOwnerIntelligence;
  dailyReport: DailyReport;
  monthlyReport: MonthlyReport;
}

export default function ReportsTabs({
  activeTab = 'intelligence',
  intelligenceData,
  dailyReport,
  monthlyReport,
}: ReportsTabsProps) {
  const [tab, setTab] = useState<'intelligence' | 'daily' | 'monthly'>(activeTab);

  return (
    <div className="space-y-4 sm:space-y-4.5">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 bg-brand-sand/60 rounded-xl p-1 w-fit border border-border-subtle overflow-x-auto print:hidden">
        <button
          type="button"
          onClick={() => setTab('intelligence')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'intelligence'
              ? 'bg-brand-forest text-white shadow-2xs'
              : 'text-ink-muted hover:text-ink hover:bg-white/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Executive Intelligence</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('daily')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'daily'
              ? 'bg-brand-forest text-white shadow-2xs'
              : 'text-ink-muted hover:text-ink hover:bg-white/60'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Daily Operations Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('monthly')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            tab === 'monthly'
              ? 'bg-brand-forest text-white shadow-2xs'
              : 'text-ink-muted hover:text-ink hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Monthly Review &amp; ADR</span>
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'intelligence' && (
        <OwnerIntelligenceDashboard data={intelligenceData} />
      )}
      {tab === 'daily' && (
        <DailyReportView
          initialReport={dailyReport}
          inHouseGuestsCount={intelligenceData.inHouseGuestsCount}
        />
      )}
      {tab === 'monthly' && <MonthlyReportView initialReport={monthlyReport} />}
    </div>
  );
}
