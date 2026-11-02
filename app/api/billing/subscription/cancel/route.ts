import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../../lib/auth/session';
import { getServiceSupabaseClient } from '../../../../../lib/supabase/admin';
import { getRazorpayClient, isRazorpayConfigured } from '../../../../../lib/razorpay/client';
import { resolveSubscriptionAccess } from '../../../../../lib/subscription/lifecycle';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const hotelId = staff.hotel_id;
    if (!hotelId) {
      return NextResponse.json({ error: 'No hotel property found for this account.' }, { status: 400 });
    }

    // 2. Strict Role Check: Only hotel owners may cancel recurring subscription agreements
    if (staff.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden. Only the property owner can cancel SaaS subscriptions.' },
        { status: 403 }
      );
    }

    const adminSupabase = getServiceSupabaseClient();

    // 3. Find active or cancellable subscription
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

    if (subData.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled.', subscription: subData },
        { status: 400 }
      );
    }

    // Parse optional body for cancellation mode
    let cancelImmediately = false;
    try {
      const body = await req.json();
      cancelImmediately = Boolean(body?.cancelImmediately);
    } catch {
      // Body is optional
    }

    // 4. Cancel via Razorpay API if subscription ID is present
    const rzpSubId = subData.razorpay_subscription_id;
    if (rzpSubId && isRazorpayConfigured()) {
      try {
        const razorpay = getRazorpayClient();
        // cancelAtCycleEnd: false cancels immediately; true keeps access until current period end
        const cancelAtCycleEnd = !cancelImmediately;
        await razorpay.subscriptions.cancel(rzpSubId, cancelAtCycleEnd);
      } catch (rzpErr: any) {
        console.error('[BILLING CANCEL] Razorpay cancellation error:', rzpErr?.message);
        // If razorpay reports it is already cancelled, proceed with db sync
        const isAlreadyCancelled = rzpErr?.message?.toLowerCase()?.includes('already');
        if (!isAlreadyCancelled && process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: `Payment gateway error: ${rzpErr?.message || 'Failed to cancel subscription mandate.'}` },
            { status: 502 }
          );
        }
      }
    }

    // 5. Synchronize Supabase subscription record
    // Keep current_period_end intact so the paid-through period is respected
    const nowIso = new Date().toISOString();
    const { data: updatedSub, error: updateErr } = (await (adminSupabase
      .from('subscriptions') as any)
      .update({
        status: 'cancelled',
        cancelled_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', subData.id)
      .select()
      .single()) as { data: any; error: any };

    if (updateErr) {
      console.error('[BILLING CANCEL] Error updating subscription in Supabase:', updateErr.message);
      return NextResponse.json(
        { error: 'Failed to update subscription status in database.' },
        { status: 500 }
      );
    }

    const access = resolveSubscriptionAccess(updatedSub);

    return NextResponse.json({
      success: true,
      message: 'Subscription has been cancelled. Your paid-through period will be respected.',
      subscription: updatedSub,
      access,
    });
  } catch (err: any) {
    console.error('[BILLING CANCEL] Exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during subscription cancellation.' },
      { status: 500 }
    );
  }
}

