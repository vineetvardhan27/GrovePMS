import { getServiceSupabaseClient } from '../supabase/admin';
import { verifyWebhookSignature } from '../razorpay/client';

export interface WebhookProcessingResult {
  success: boolean;
  statusCode: number;
  message: string;
  eventId?: string;
  eventType?: string;
  subscriptionId?: string;
}

/**
 * Generates an audit invoice code when Razorpay invoice_id is not available.
 */
function generateInvoiceReference(): string {
  return `GROVE-INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
}

/**
 * Converts Razorpay UNIX epoch timestamp (seconds) to ISO-8601 string safely.
 */
function epochToIso(epochSeconds: number | null | undefined): string | null {
  if (!epochSeconds || typeof epochSeconds !== 'number') return null;
  try {
    return new Date(epochSeconds * 1000).toISOString();
  } catch {
    return null;
  }
}

/**
 * Core Razorpay Webhook Event Processor.
 * 
 * Guarantees:
 * 1. Cryptographic HMAC verification using raw body string.
 * 2. Strict idempotency via unique razorpay_event_id in webhook_events table.
 * 3. Safe re-processing for failed delivery retries.
 * 4. Atomic-like status transition and payment record auditing.
 */
export async function processRazorpayWebhook(
  rawBody: string,
  signature: string | null,
  headerEventId?: string | null
): Promise<WebhookProcessingResult> {
  // 1. Signature Verification
  if (!signature) {
    return {
      success: false,
      statusCode: 400,
      message: 'Missing X-Razorpay-Signature header.',
    };
  }

  const isValidSignature = verifyWebhookSignature({ rawBody, signature });
  if (!isValidSignature) {
    console.error('[WEBHOOK] Invalid Razorpay webhook signature.');
    return {
      success: false,
      statusCode: 400,
      message: 'Invalid webhook cryptographic signature. Request rejected.',
    };
  }

  // 2. Safe JSON Parsing
  let eventPayload: any;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch (err: any) {
    return {
      success: false,
      statusCode: 400,
      message: `Invalid JSON payload: ${err?.message}`,
    };
  }

  const eventType: string = eventPayload.event;
  if (!eventType) {
    return {
      success: false,
      statusCode: 400,
      message: 'Missing event type in webhook payload.',
    };
  }

  // Determine unique event ID from header, body, or deterministic fallback
  const subEntity = eventPayload.payload?.subscription?.entity;
  const paymentEntity = eventPayload.payload?.payment?.entity;
  const subId = subEntity?.id || paymentEntity?.subscription_id;
  const paymentId = paymentEntity?.id;

  const eventId: string =
    headerEventId ||
    eventPayload.id ||
    eventPayload.event_id ||
    `evt_${eventType}_${subId || paymentId || 'generic'}_${eventPayload.created_at || Date.now()}`;

  const adminSupabase = getServiceSupabaseClient();

  // 3. Idempotency Check in webhook_events
  const { data: existingEvent, error: checkEventErr } = (await (adminSupabase
    .from('webhook_events') as any)
    .select('id, razorpay_event_id, processing_status')
    .eq('razorpay_event_id', eventId)
    .maybeSingle()) as { data: any; error: any };

  if (checkEventErr) {
    console.error('[WEBHOOK] Error querying webhook_events:', checkEventErr.message);
  }

  // If already successfully processed, return 200 OK without re-executing
  if (existingEvent && existingEvent.processing_status === 'processed') {
    return {
      success: true,
      statusCode: 200,
      message: 'Event was already processed successfully (idempotent duplicate).',
      eventId,
      eventType,
    };
  }

  // Record initial or retry state in webhook_events
  if (!existingEvent) {
    const { error: insertEventErr } = await (adminSupabase
      .from('webhook_events') as any)
      .insert({
        razorpay_event_id: eventId,
        event_type: eventType,
        processing_status: 'pending',
        payload: eventPayload,
      });

    if (insertEventErr) {
      console.warn('[WEBHOOK] Could not insert initial webhook event log:', insertEventErr.message);
    }
  }

  try {
    // 4. Identify Target Subscription
    const targetSubId = subId;
    let subscriptionRecord: any = null;

    if (targetSubId) {
      const { data: subData, error: subErr } = (await (adminSupabase
        .from('subscriptions') as any)
        .select('*')
        .eq('razorpay_subscription_id', targetSubId)
        .maybeSingle()) as { data: any; error: any };

      if (subErr) {
        console.error('[WEBHOOK] Error fetching subscription by razorpay ID:', subErr.message);
      }
      subscriptionRecord = subData;
    }

    // Secondary fallback: match via hotel_id in notes if sub not found by ID
    if (!subscriptionRecord) {
      const hotelIdNote = subEntity?.notes?.hotel_id || paymentEntity?.notes?.hotel_id;
      if (hotelIdNote) {
        const { data: subByHotel, error: hotelSubErr } = (await (adminSupabase
          .from('subscriptions') as any)
          .select('*')
          .eq('hotel_id', hotelIdNote)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()) as { data: any; error: any };

        if (!hotelSubErr && subByHotel) {
          subscriptionRecord = subByHotel;
        }
      }
    }

    // If still no matching subscription found:
    if (!subscriptionRecord) {
      // Mark as ignored so Razorpay does not retry events for unrelated entities
      await (adminSupabase.from('webhook_events') as any)
        .update({
          processing_status: 'ignored',
          error_message: `No matching Grove PMS subscription found for sub_id: ${targetSubId || 'null'}`,
          processed_at: new Date().toISOString(),
        })
        .eq('razorpay_event_id', eventId);

      return {
        success: true,
        statusCode: 200,
        message: `Event acknowledged but ignored: No matching subscription found (${targetSubId || 'none'}).`,
        eventId,
        eventType,
      };
    }

    // 5. Handle Specific Razorpay Subscription and Payment Events
    const nowIso = new Date().toISOString();

    switch (eventType) {
      case 'subscription.authenticated': {
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'authenticated',
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'subscription.activated': {
        const periodStart = epochToIso(subEntity?.current_start) || nowIso;
        const periodEnd = epochToIso(subEntity?.current_end);
        const nextBilling = epochToIso(subEntity?.charge_at);

        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'active',
            current_period_start: periodStart,
            current_period_end: periodEnd,
            next_billing_at: nextBilling,
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'subscription.charged': {
        const periodStart = epochToIso(subEntity?.current_start) || nowIso;
        const periodEnd = epochToIso(subEntity?.current_end);
        const nextBilling = epochToIso(subEntity?.charge_at);

        // 1. Update subscription dates and active status
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'active',
            current_period_start: periodStart,
            current_period_end: periodEnd,
            next_billing_at: nextBilling,
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);

        // 2. Record payment transaction idempotently if payment entity is present
        if (paymentEntity && paymentEntity.id) {
          const rzpPaymentId = paymentEntity.id;
          const { data: existingTx } = (await (adminSupabase
            .from('payment_transactions') as any)
            .select('id')
            .eq('razorpay_payment_id', rzpPaymentId)
            .maybeSingle()) as { data: any };

          if (!existingTx) {
            const txAmount = paymentEntity.amount || subscriptionRecord.amount;
            const txCurrency = paymentEntity.currency || subscriptionRecord.currency || 'INR';
            const invoiceRef = paymentEntity.invoice_id || generateInvoiceReference();

            await (adminSupabase.from('payment_transactions') as any).insert({
              hotel_id: subscriptionRecord.hotel_id,
              subscription_id: subscriptionRecord.id,
              razorpay_payment_id: rzpPaymentId,
              amount: txAmount,
              currency: txCurrency,
              status: 'captured',
              payment_method: paymentEntity.method || 'recurring_mandate',
              invoice_reference: invoiceRef,
            });
          }
        }
        break;
      }

      case 'subscription.pending': {
        // Recurring charge attempt failed; Razorpay will auto-retry
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'pending',
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'subscription.halted': {
        // Max retries exceeded; billing halted
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'halted',
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'subscription.cancelled': {
        // Respect paid-through period: keep current_period_end intact
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'cancelled',
            cancelled_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'subscription.completed': {
        // All scheduled recurring cycles finished
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'completed',
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'subscription.paused': {
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'halted',
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'subscription.resumed': {
        await (adminSupabase.from('subscriptions') as any)
          .update({
            status: 'active',
            updated_at: nowIso,
          })
          .eq('id', subscriptionRecord.id);
        break;
      }

      case 'payment.captured': {
        if (paymentEntity && paymentEntity.id) {
          const rzpPaymentId = paymentEntity.id;
          const { data: existingTx } = (await (adminSupabase
            .from('payment_transactions') as any)
            .select('id')
            .eq('razorpay_payment_id', rzpPaymentId)
            .maybeSingle()) as { data: any };

          if (!existingTx) {
            const txAmount = paymentEntity.amount || subscriptionRecord.amount;
            const txCurrency = paymentEntity.currency || subscriptionRecord.currency || 'INR';

            await (adminSupabase.from('payment_transactions') as any).insert({
              hotel_id: subscriptionRecord.hotel_id,
              subscription_id: subscriptionRecord.id,
              razorpay_payment_id: rzpPaymentId,
              amount: txAmount,
              currency: txCurrency,
              status: 'captured',
              payment_method: paymentEntity.method || 'card',
              invoice_reference: paymentEntity.invoice_id || generateInvoiceReference(),
            });
          }
        }
        break;
      }

      case 'payment.failed': {
        if (paymentEntity && paymentEntity.id) {
          const rzpPaymentId = paymentEntity.id;
          const { data: existingTx } = (await (adminSupabase
            .from('payment_transactions') as any)
            .select('id')
            .eq('razorpay_payment_id', rzpPaymentId)
            .maybeSingle()) as { data: any };

          if (!existingTx) {
            await (adminSupabase.from('payment_transactions') as any).insert({
              hotel_id: subscriptionRecord.hotel_id,
              subscription_id: subscriptionRecord.id,
              razorpay_payment_id: rzpPaymentId,
              amount: paymentEntity.amount || subscriptionRecord.amount,
              currency: paymentEntity.currency || subscriptionRecord.currency || 'INR',
              status: 'failed',
              payment_method: paymentEntity.method || 'card',
              invoice_reference: null,
            });
          }
        }
        break;
      }

      default: {
        console.log(`[WEBHOOK] Unhandled event type: ${eventType}. Acknowledged without mutation.`);
      }
    }

    // 6. Mark event as successfully processed in webhook_events
    await (adminSupabase.from('webhook_events') as any)
      .update({
        processing_status: 'processed',
        processed_at: nowIso,
        error_message: null,
      })
      .eq('razorpay_event_id', eventId);

    return {
      success: true,
      statusCode: 200,
      message: `Event ${eventType} successfully processed and synchronized.`,
      eventId,
      eventType,
      subscriptionId: subscriptionRecord.id,
    };
  } catch (processingErr: any) {
    console.error(`[WEBHOOK] Error processing event ${eventId}:`, processingErr);

    // Record failure in webhook_events so retries can pick it up
    await (adminSupabase.from('webhook_events') as any)
      .update({
        processing_status: 'failed',
        error_message: processingErr?.message || 'Unknown processing error',
      })
      .eq('razorpay_event_id', eventId);

    return {
      success: false,
      statusCode: 500,
      message: `Processing failed: ${processingErr?.message || 'Internal database error'}`,
      eventId,
      eventType,
    };
  }
}

