import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '../../../../../lib/auth/session';
import { getServiceSupabaseClient } from '../../../../../lib/supabase/admin';
import {
  verifySubscriptionPaymentSignature,
  RAZORPAY_CONFIG,
} from '../../../../../lib/razorpay/client';

export const dynamic = 'force-dynamic';

interface VerifyRequestBody {
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user using Supabase session
    const staff = await getCurrentStaff();
    if (!staff) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to verify your payment.' },
        { status: 401 }
      );
    }

    const hotelId = staff.hotel_id;
    if (!hotelId) {
      return NextResponse.json(
        { error: 'No hotel property is associated with this account.' },
        { status: 400 }
      );
    }

    // 2. Parse and validate required Razorpay payment callback payload
    let body: VerifyRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error:
            'Missing required verification parameters: razorpay_payment_id, razorpay_subscription_id, and razorpay_signature are all required.',
        },
        { status: 400 }
      );
    }

    const adminSupabase = getServiceSupabaseClient();

    // 3. Retrieve expected subscription from database and verify hotel ownership
    const { data: subscriptionRecord, error: subFetchErr } = (await (adminSupabase
      .from('subscriptions') as any)
      .select('*')
      .eq('razorpay_subscription_id', razorpay_subscription_id)
      .eq('hotel_id', hotelId)
      .maybeSingle()) as { data: any; error: any };

    if (subFetchErr) {
      console.error('[BILLING VERIFY] Database lookup error:', subFetchErr.message);
      return NextResponse.json(
        { error: 'Database error while retrieving subscription record.' },
        { status: 500 }
      );
    }

    if (!subscriptionRecord) {
      console.warn(
        `[BILLING VERIFY] Subscription ${razorpay_subscription_id} not found for hotel ${hotelId}`
      );
      return NextResponse.json(
        {
          error:
            'No matching subscription record found for this hotel property. Verification failed.',
        },
        { status: 404 }
      );
    }

    // 4. Verify signature server-side using HMAC SHA-256 and secret
    const isValidSignature = verifySubscriptionPaymentSignature({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      console.error(
        `[BILLING VERIFY] Signature verification failed for payment: ${razorpay_payment_id}, sub: ${razorpay_subscription_id}`
      );
      return NextResponse.json(
        {
          error:
            'Payment verification failed: cryptographic signature mismatch. This event has been logged for security.',
        },
        { status: 400 }
      );
    }

    // 5. Idempotent payment recording: Check if payment transaction already exists
    const { data: existingTx, error: txCheckErr } = (await (adminSupabase
      .from('payment_transactions') as any)
      .select('id, razorpay_payment_id, status')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .maybeSingle()) as { data: any; error: any };

    if (txCheckErr) {
      console.error('[BILLING VERIFY] Error checking existing transaction:', txCheckErr.message);
    }

    // If transaction already processed, return existing confirmed state (idempotent)
    if (existingTx) {
      return NextResponse.json({
        success: true,
        status: subscriptionRecord.status === 'active' ? 'active' : 'authenticated',
        subscriptionId: subscriptionRecord.id,
        paymentId: razorpay_payment_id,
        alreadyProcessed: true,
        message: 'Payment already verified and processed.',
      });
    }

    // 6. Record verified transaction safely in payment_transactions
    // Amount is taken strictly from the server-side subscription record (paise)
    const transactionAmount = subscriptionRecord.amount || RAZORPAY_CONFIG.defaultAmountInPaise;
    const transactionCurrency = subscriptionRecord.currency || RAZORPAY_CONFIG.defaultCurrency;
    const invoiceRef = `GROVE-INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const { error: insertTxErr } = await (adminSupabase
      .from('payment_transactions') as any)
      .insert({
        hotel_id: hotelId,
        subscription_id: subscriptionRecord.id,
        razorpay_payment_id,
        amount: transactionAmount,
        currency: transactionCurrency,
        status: 'captured',
        payment_method: 'recurring_mandate',
        invoice_reference: invoiceRef,
      });

    if (insertTxErr) {
      console.error('[BILLING VERIFY] Failed to record payment transaction:', insertTxErr.message);
      return NextResponse.json(
        { error: 'Failed to record payment transaction.' },
        { status: 500 }
      );
    }

    // 7. Activate subscription and set initial 30-day billing period
    const now = new Date();
    const periodStart = now.toISOString();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateSubErr } = await (adminSupabase
      .from('subscriptions') as any)
      .update({
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        next_billing_at: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionRecord.id);

    if (updateSubErr) {
      console.error('[BILLING VERIFY] Failed to update subscription status to active:', updateSubErr.message);
      return NextResponse.json(
        { error: 'Payment recorded, but failed to activate subscription state in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'active',
      subscriptionId: subscriptionRecord.id,
      paymentId: razorpay_payment_id,
      invoiceReference: invoiceRef,
      currentPeriodEnd: periodEnd,
      message: 'Subscription successfully verified and activated.',
    });
  } catch (err: any) {
    console.error('[BILLING VERIFY] Unexpected error during verification:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during subscription verification.' },
      { status: 500 }
    );
  }
}
