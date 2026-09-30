import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { getDashboardStats } from '../../../../lib/reports/queries';
import { createCachedJsonResponse } from '../../../../lib/cache/apiResponse';
import { hasCachedKey } from '../../../../lib/cache/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const isHit = hasCachedKey(['dashboard-stats', staff.hotel_id, today]);
    const stats = await getDashboardStats();

    return createCachedJsonResponse(req, stats, {
      maxAge: 60, // 60 seconds TTL
      staleWhileRevalidate: 120,
      isPrivate: true,
      isHit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
