import { NextRequest, NextResponse } from 'next/server';
import { processRazorpayWebhook } from '../../../../lib/subscription/webhookHandler';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Read the RAW unparsed request body text directly
    // It is critical NOT to parse JSON beforehand, which would corrupt HMAC verification
    const rawBody = await req.text();

    if (!rawBody || !rawBody.trim()) {
      return NextResponse.json(
        { error: 'Empty webhook payload received.' },
        { status: 400 }
      );
    }

    // 2. Extract Razorpay signature and event headers
    const signature =
      req.headers.get('x-razorpay-signature') ||
      req.headers.get('X-Razorpay-Signature');

    const eventId =
      req.headers.get('x-razorpay-event-id') ||
      req.headers.get('X-Razorpay-Event-Id');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing X-Razorpay-Signature header in webhook request.' },
        { status: 400 }
      );
    }

    // 3. Process webhook event via the centralized handler
    const result = await processRazorpayWebhook(rawBody, signature, eventId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, eventId: result.eventId },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        received: true,
        message: result.message,
        eventId: result.eventId,
        eventType: result.eventType,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[WEBHOOK ROUTE] Unhandled webhook route exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while processing webhook.' },
      { status: 500 }
    );
  }
}

