import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { getHotelSettings } from '../../../../lib/hotels/queries';
import { createCachedJsonResponse } from '../../../../lib/cache/apiResponse';
import { hasCachedKey } from '../../../../lib/cache/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isHit = hasCachedKey(['hotel-details', staff.hotel_id]);
    const settings = await getHotelSettings(staff.hotel_id);

    return createCachedJsonResponse(req, settings, {
      maxAge: 3600, // 1 hour TTL
      staleWhileRevalidate: 7200,
      isPrivate: true,
      isHit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
