import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../../lib/auth/session';
import { getServiceSupabaseClient } from '../../../../../lib/supabase/admin';
import { getRazorpayClient, isRazorpayConfigured } from '../../../../../lib/razorpay/client';
import { resolveSubscriptionAccess } from '../../../../../lib/subscription/lifecycle';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const hotelId = staff.hotel_id;
    if (!hotelId) {
      return NextResponse.json({ error: 'No hotel property found for this account.' }, { status: 400 });
    }

    if (staff.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden. Only property owners may manage subscription lifecycle.' },
        { status: 403 }
      );
    }

    const adminSupabase = getServiceSupabaseClient();

    const { data: subData, error: subErr } = (await (adminSupabase
      .from('subscriptions') as any)
      .select('*')
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: any; error: any };

    if (subErr || !subData) {
      return NextResponse.json(
        { error: 'No subscription record found for this property.' },
        { status: 404 }
      );
    }

    // Only paused or halted subscriptions can be resumed
    if (subData.status === 'active') {
      return NextResponse.json(
        { message: 'Subscription is already active.', subscription: subData },
        { status: 200 }
      );
    }

    if (subData.status === 'cancelled' || subData.status === 'completed' || subData.status === 'expired') {
      return NextResponse.json(
        {
          error:
            'A cancelled or expired subscription agreement cannot be directly resumed under banking mandate rules. Please initiate a new subscription from the checkout page.',
          requireNewSubscription: true,
        },
        { status: 400 }
      );
    }

    const rzpSubId = subData.razorpay_subscription_id;
    if (rzpSubId && isRazorpayConfigured()) {
      try {
        const razorpay = getRazorpayClient();
        await razorpay.subscriptions.resume(rzpSubId);
      } catch (rzpErr: any) {
        console.error('[BILLING RESUME] Razorpay resume error:', rzpErr?.message);
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: `Payment gateway error: ${rzpErr?.message || 'Failed to resume subscription.'}` },
            { status: 502 }
          );
        }
      }
    }

    const nowIso = new Date().toISOString();
    const { data: updatedSub, error: updateErr } = (await (adminSupabase
      .from('subscriptions') as any)
      .update({
        status: 'active',
        updated_at: nowIso,
      })
      .eq('id', subData.id)
      .select()
      .single()) as { data: any; error: any };

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update subscription in database.' }, { status: 500 });
    }

    const access = resolveSubscriptionAccess(updatedSub);

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully resumed and activated.',
      subscription: updatedSub,
      access,
    });
  } catch (err: any) {
    console.error('[BILLING RESUME] Exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while resuming subscription.' },
      { status: 500 }
    );
  }
}

