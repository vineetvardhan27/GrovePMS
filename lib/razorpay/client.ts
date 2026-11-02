import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Server-side Razorpay environment configuration.
 * Secrets must never be exposed or passed to the client.
 */
export const RAZORPAY_CONFIG = {
  getKeyId: () => process.env.RAZORPAY_KEY_ID || '',
  getKeySecret: () =>
    process.env.RAZORPAY_KEY_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'grove_dev_key_secret' : ''),
  getPlanId: () => process.env.RAZORPAY_PLAN_ID || '',
  getWebhookSecret: () =>
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'grove_dev_webhook_secret' : ''),
  // Default Grove PMS monthly subscription: ₹999/month (in paise)
  defaultAmountInPaise: 99900,
  defaultCurrency: 'INR',
  defaultPlanName: 'Grove Operating System',
};

/**
 * Validates that the necessary Razorpay server credentials exist.
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_PLAN_ID
  );
}

/**
 * Returns a configured Razorpay Node.js SDK client instance.
 * Throws a descriptive error if environment credentials are unconfigured.
 */
export function getRazorpayClient(): Razorpay {
  const key_id = RAZORPAY_CONFIG.getKeyId();
  const key_secret = RAZORPAY_CONFIG.getKeySecret();

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay configuration error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured on the server.'
    );
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Verifies Razorpay Subscription Payment Signature.
 * 
 * In Razorpay Subscriptions workflow, after mandate authorization/first payment,
 * the checkout response returns:
 * - razorpay_payment_id
 * - razorpay_subscription_id
 * - razorpay_signature
 * 
 * Signature generation algorithm:
 * HMAC_SHA256(razorpay_payment_id + "|" + razorpay_subscription_id, RAZORPAY_KEY_SECRET)
 * 
 * Timing-safe comparison is used to protect against timing attacks.
 */
export function verifySubscriptionPaymentSignature({
  razorpay_payment_id,
  razorpay_subscription_id,
  razorpay_signature,
  secretOverride,
}: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
  secretOverride?: string;
}): boolean {
  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return false;
  }

  const secret = secretOverride || RAZORPAY_CONFIG.getKeySecret();
  if (!secret) {
    throw new Error(
      'Cannot verify payment signature: RAZORPAY_KEY_SECRET is not configured.'
    );
  }

  const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Guard against length differences before running timingSafeEqual
  if (generatedSignature.length !== razorpay_signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Verifies incoming Razorpay Webhook signature using RAZORPAY_WEBHOOK_SECRET.
 * 
 * Algorithm:
 * HMAC_SHA256(rawRequestBody, RAZORPAY_WEBHOOK_SECRET) === x-razorpay-signature
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
  secretOverride,
}: {
  rawBody: string;
  signature: string;
  secretOverride?: string;
}): boolean {
  if (!rawBody || !signature) {
    return false;
  }

  const secret = secretOverride || RAZORPAY_CONFIG.getWebhookSecret();
  if (!secret) {
    throw new Error(
      'Cannot verify webhook signature: RAZORPAY_WEBHOOK_SECRET is not configured.'
    );
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (generatedSignature.length !== signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

