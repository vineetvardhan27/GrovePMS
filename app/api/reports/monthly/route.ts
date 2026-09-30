import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { getMonthlyReport } from '../../../../lib/reports/queries';
import { createCachedJsonResponse } from '../../../../lib/cache/apiResponse';
import { hasCachedKey } from '../../../../lib/cache/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = Number(searchParams.get('year')) || now.getFullYear();
    const month = Number(searchParams.get('month')) || now.getMonth() + 1;
    const prefix = `${year}-${String(month).padStart(2, '0')}`;

    const isHit = hasCachedKey(['monthly-report', staff.hotel_id, prefix]);
    const report = await getMonthlyReport(year, month, staff.hotel_id);

    return createCachedJsonResponse(req, report, {
      maxAge: 300, // 5 minutes TTL
      staleWhileRevalidate: 600,
      isPrivate: true,
      isHit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
