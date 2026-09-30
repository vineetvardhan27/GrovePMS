import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../lib/auth/session';
import { invalidateCacheByTags, getCacheStats } from '../../../../lib/cache/serverCache';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedTags: string[] = Array.isArray(body.tags) ? body.tags : [];

    // Ensure staff can only invalidate tags within their hotel scope or generic tags
    const allowedTags = requestedTags.filter(
      (t) =>
        t.includes(staff.hotel_id) ||
        ['reports', 'dashboard-stats', 'hotel-settings', 'room-categories', 'inventory', 'menu'].includes(t)
    );

    const result = invalidateCacheByTags(allowedTags);
    return NextResponse.json({
      success: true,
      invalidatedTags: allowedTags,
      invalidatedKeys: result.invalidatedKeys,
      stats: getCacheStats(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, stats: getCacheStats() });
}
