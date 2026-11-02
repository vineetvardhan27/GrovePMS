import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../../lib/auth/session';
import { getServiceSupabaseClient } from '../../../../../lib/supabase/admin';
import {
  getRazorpayClient,
  RAZORPAY_CONFIG,
  isRazorpayConfigured,
} from '../../../../../lib/razorpay/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user using Supabase session
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // 2. Identify hotel exclusively from authenticated staff membership
    const hotelId = staff.hotel_id;
    if (!hotelId) {
      return NextResponse.json(
        { error: 'No hotel property is associated with this account.' },
        { status: 400 }
      );
    }

    // Check authorization: hotel owners and managers are authorized to manage billing
    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return NextResponse.json(
        { error: 'Forbidden. Only property owners and managers may configure billing subscriptions.' },
        { status: 403 }
      );
    }

    const adminSupabase = getServiceSupabaseClient();

    // 3. Check whether the hotel already has an active subscription
    const { data: existingActiveSub, error: subCheckErr } = (await (adminSupabase
      .from('subscriptions') as any)
      .select('id, status, current_period_end')
      .eq('hotel_id', hotelId)
      .eq('status', 'active')
      .maybeSingle()) as { data: any; error: any };

    if (subCheckErr) {
      console.error('[BILLING CREATE] Error checking existing subscription:', subCheckErr.message);
    }

    if (existingActiveSub) {
      const isPeriodValid =
        !existingActiveSub.current_period_end ||
        new Date(existingActiveSub.current_period_end).getTime() > Date.now();

      if (isPeriodValid) {
        return NextResponse.json(
          {
            error: 'This property already has an active subscription.',
            subscriptionId: existingActiveSub.id,
          },
          { status: 409 }
        );
      }
    }

    // 4. Validate Razorpay server configuration
    const keyId = RAZORPAY_CONFIG.getKeyId();
    const planId = RAZORPAY_CONFIG.getPlanId();

    if (!isRazorpayConfigured() || !keyId || !planId) {
      console.error('[BILLING CREATE] Missing Razorpay environment variables (KEY_ID or PLAN_ID).');
      return NextResponse.json(
        {
          error:
            'Razorpay subscription service is not configured. Please ensure RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_PLAN_ID are set in environment variables.',
        },
        { status: 500 }
      );
    }

    // 5. Parse optional customer contact & billing payload from client
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional; fallback to empty object
    }

    const customerName = (body.ownerName || staff.full_name || '').trim();
    const customerEmail = (body.email || staff.email || '').trim();
    const customerPhone = (body.phone || '').trim();
    const billingAddress = (body.billingAddress || '').trim();
    const city = (body.city || '').trim();
    const state = (body.state || '').trim();
    const gstin = (body.gstin || '').trim().toUpperCase();

    // 6. Create Razorpay Subscription with fixed monthly plan
    const razorpay = getRazorpayClient();
    
    // Total count: 120 cycles (10 years) with recurring monthly interval
    // Quantity: strictly 1
    const rzpSubscription: any = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: {
        hotel_id: hotelId,
        hotel_name: staff.hotel_name || '',
        initiated_by_user: staff.id,
        contact_email: customerEmail,
        contact_phone: customerPhone,
      },
    });

    if (!rzpSubscription || !rzpSubscription.id) {
      throw new Error('Razorpay subscription creation returned an invalid response.');
    }

    // 7. Store subscription record in Supabase with 'created' status
    // Amount is strictly determined server-side (₹999/mo = 99900 paise)
    const fixedAmount = RAZORPAY_CONFIG.defaultAmountInPaise;
    const fixedCurrency = RAZORPAY_CONFIG.defaultCurrency;
    const planName = RAZORPAY_CONFIG.defaultPlanName;

    const { error: insertSubErr } = await (adminSupabase
      .from('subscriptions') as any)
      .insert({
        hotel_id: hotelId,
        plan_name: planName,
        razorpay_plan_id: planId,
        razorpay_subscription_id: rzpSubscription.id,
        status: 'created',
        amount: fixedAmount,
        currency: fixedCurrency,
        billing_interval: 'monthly',
      });

    if (insertSubErr) {
      console.error('[BILLING CREATE] Failed to store subscription record:', insertSubErr.message);
      return NextResponse.json(
        { error: 'Failed to record subscription record in database.' },
        { status: 500 }
      );
    }

    // 8. Upsert billing customer profile in Supabase if contact details were provided
    if (customerName || customerEmail || customerPhone || billingAddress) {
      const { error: upsertCustErr } = await (adminSupabase
        .from('billing_customers') as any)
        .upsert(
          {
            hotel_id: hotelId,
            customer_name: customerName || 'Property Administrator',
            email: customerEmail || staff.email,
            phone: customerPhone || null,
            billing_address: billingAddress || null,
            city: city || null,
            state: state || null,
            gstin: gstin || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'hotel_id' }
        );

      if (upsertCustErr) {
        console.warn('[BILLING CREATE] Note: could not upsert billing customer profile:', upsertCustErr.message);
      }
    }

    // 9. Return only safe checkout details to the client
    return NextResponse.json({
      success: true,
      subscriptionId: rzpSubscription.id,
      keyId,
      amount: fixedAmount,
      currency: fixedCurrency,
      planName,
    });
  } catch (err: any) {
    console.error('[BILLING CREATE] Unexpected exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while initiating subscription checkout.' },
      { status: 500 }
    );
  }
}
