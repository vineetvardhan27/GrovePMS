'use server';

import { getDailyReport, getMonthlyReport, DailyReport, MonthlyReport } from './queries';

/**
 * Server action wrapper — callable from client components.
 * Keeps all `next/headers` usage server-side.
 */
export async function fetchDailyReport(date: string): Promise<DailyReport> {
  return getDailyReport(date);
}

export async function fetchMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  return getMonthlyReport(year, month);
}
