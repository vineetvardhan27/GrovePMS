import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { getDailyReport } from '../../../../lib/reports/queries';
import { createCachedJsonResponse } from '../../../../lib/cache/apiResponse';
import { hasCachedKey } from '../../../../lib/cache/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const isHit = hasCachedKey(['daily-report', staff.hotel_id, date]);
    const report = await getDailyReport(date, staff.hotel_id);

    return createCachedJsonResponse(req, report, {
      maxAge: 120, // 2 minutes TTL
      staleWhileRevalidate: 300,
      isPrivate: true,
      isHit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
