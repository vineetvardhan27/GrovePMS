import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { getHotelOwnerIntelligence } from '../../../../lib/reports/queries';
import { ReportPeriod } from '../../../../lib/reports/types';
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
    const period = (searchParams.get('period') || 'this_month') as ReportPeriod;
    const today = new Date().toISOString().split('T')[0];

    const isHit = hasCachedKey(['owner-intelligence', staff.hotel_id, period, today]);
    const intelligence = await getHotelOwnerIntelligence(period, staff.hotel_id);

    return createCachedJsonResponse(req, intelligence, {
      maxAge: 300, // 5 minutes TTL
      staleWhileRevalidate: 600,
      isPrivate: true,
      isHit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
