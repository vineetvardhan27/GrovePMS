import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../../lib/auth/session';
import { getServiceSupabaseClient } from '../../../../../lib/supabase/admin';
import { resolveSubscriptionAccess } from '../../../../../lib/subscription/lifecycle';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const hotelId = staff.hotel_id;
    if (!hotelId) {
      return NextResponse.json({ error: 'No hotel property found for this staff member.' }, { status: 400 });
    }

    const adminSupabase = getServiceSupabaseClient();

    // 1. Fetch latest subscription record for hotel
    const { data: subData, error: subErr } = (await (adminSupabase
      .from('subscriptions') as any)
      .select('*')
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: any; error: any };

    if (subErr) {
      console.error('[BILLING DETAILS] Error fetching subscription:', subErr.message);
    }

    // 2. Fetch billing customer tax profile
    const { data: customerData, error: custErr } = (await (adminSupabase
      .from('billing_customers') as any)
      .select('*')
      .eq('hotel_id', hotelId)
      .maybeSingle()) as { data: any; error: any };

    if (custErr) {
      console.warn('[BILLING DETAILS] Note: no billing customer profile found:', custErr.message);
    }

    // 3. Resolve effective Grove PMS tenant access state
    const accessResolution = resolveSubscriptionAccess(subData);

    // 4. Return scoped payload with role authorization metadata
    const canManage = staff.role === 'owner';

    return NextResponse.json({
      success: true,
      hotel: {
        id: hotelId,
        name: staff.hotel_name || 'Hotel Property',
      },
      user: {
        role: staff.role,
        canManage,
      },
      subscription: subData || null,
      access: accessResolution,
      customer: customerData || null,
    });
  } catch (err: any) {
    console.error('[BILLING DETAILS] Exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load subscription details.' },
      { status: 500 }
    );
  }
}

