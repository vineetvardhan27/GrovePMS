import { Database, SubscriptionStatus } from '../types/database.types';

export type SubscriptionRecord = Database['public']['Tables']['subscriptions']['Row'];

/**
 * Grove PMS Tenant Access States.
 * Distinct from Razorpay payment gateway lifecycle statuses.
 */
export type GroveAccessState =
  | 'trial'
  | 'active'
  | 'grace_period'
  | 'suspended'
  | 'cancelled'
  | 'expired';

export interface HotelAccessResolution {
  accessState: GroveAccessState;
  isAccessAllowed: boolean;
  reason: string;
  paidThroughDate: Date | null;
  isInGracePeriod: boolean;
  gracePeriodEndsAt: Date | null;
  cancellationPending: boolean;
  subscriptionId?: string;
  razorpaySubscriptionId?: string | null;
  gatewayStatus: SubscriptionStatus | 'none';
}

// Configurable grace period: 5 days after period_end before operations are suspended
export const DEFAULT_GRACE_PERIOD_DAYS = 5;

/**
 * Centralized subscription access state resolver.
 * Computes effective PMS tenant access by evaluating subscription status,
 * period dates, grace period windows, and cancellation paid-through rules.
 */
export function resolveSubscriptionAccess(
  subscription: SubscriptionRecord | null,
  options?: {
    gracePeriodDays?: number;
    currentTime?: Date;
    hotelCreatedAt?: string | Date;
  }
): HotelAccessResolution {
  const now = options?.currentTime ? options.currentTime.getTime() : Date.now();
  const graceDays = options?.gracePeriodDays ?? DEFAULT_GRACE_PERIOD_DAYS;
  const graceDurationMs = graceDays * 24 * 60 * 60 * 1000;

  // 1. No subscription record found
  if (!subscription) {
    // If hotel was created recently (< 14 days), consider in trial
    if (options?.hotelCreatedAt) {
      const createdAt = new Date(options.hotelCreatedAt).getTime();
      const trialDurationMs = 14 * 24 * 60 * 60 * 1000;
      if (now - createdAt < trialDurationMs) {
        const trialEnd = new Date(createdAt + trialDurationMs);
        return {
          accessState: 'trial',
          isAccessAllowed: true,
          reason: `Free onboarding trial active until ${trialEnd.toLocaleDateString('en-IN')}`,
          paidThroughDate: trialEnd,
          isInGracePeriod: false,
          gracePeriodEndsAt: null,
          cancellationPending: false,
          gatewayStatus: 'none',
        };
      }
    }

    return {
      accessState: 'expired',
      isAccessAllowed: false,
      reason: 'No active subscription or trial found for this property.',
      paidThroughDate: null,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: false,
      gatewayStatus: 'none',
    };
  }

  const {
    id: subscriptionId,
    razorpay_subscription_id: razorpaySubscriptionId,
    status: gatewayStatus,
    current_period_end: currentPeriodEndStr,
  } = subscription;

  const paidThroughDate = currentPeriodEndStr ? new Date(currentPeriodEndStr) : null;
  const periodEndMs = paidThroughDate ? paidThroughDate.getTime() : null;

  // 2. Gateway Status: ACTIVE
  if (gatewayStatus === 'active') {
    if (!periodEndMs || periodEndMs >= now) {
      return {
        accessState: 'active',
        isAccessAllowed: true,
        reason: 'Subscription is active with valid recurring mandate.',
        paidThroughDate,
        isInGracePeriod: false,
        gracePeriodEndsAt: null,
        cancellationPending: false,
        subscriptionId,
        razorpaySubscriptionId,
        gatewayStatus,
      };
    }

    // Period ended but renewal has not yet confirmed
    const graceEndMs = periodEndMs + graceDurationMs;
    if (now <= graceEndMs) {
      return {
        accessState: 'grace_period',
        isAccessAllowed: true,
        reason: `Billing renewal pending. In grace period until ${new Date(graceEndMs).toLocaleDateString('en-IN')}.`,
        paidThroughDate,
        isInGracePeriod: true,
        gracePeriodEndsAt: new Date(graceEndMs),
        cancellationPending: false,
        subscriptionId,
        razorpaySubscriptionId,
        gatewayStatus,
      };
    }

    return {
      accessState: 'suspended',
      isAccessAllowed: false,
      reason: 'Billing renewal grace period has expired. Please update payment mandate.',
      paidThroughDate,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: false,
      subscriptionId,
      razorpaySubscriptionId,
      gatewayStatus,
    };
  }

  // 3. Gateway Status: AUTHENTICATED (Mandate authorized, pending initial billing cycle)
  if (gatewayStatus === 'authenticated') {
    return {
      accessState: 'active',
      isAccessAllowed: true,
      reason: 'Mandate authenticated. Active subscription initialization in progress.',
      paidThroughDate,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: false,
      subscriptionId,
      razorpaySubscriptionId,
      gatewayStatus,
    };
  }

  // 4. Gateway Status: PENDING (Charge attempt failed; Razorpay retrying)
  if (gatewayStatus === 'pending') {
    const referenceEnd = periodEndMs ?? now;
    const graceEndMs = referenceEnd + graceDurationMs;

    if (now <= graceEndMs) {
      return {
        accessState: 'grace_period',
        isAccessAllowed: true,
        reason: 'Payment charge failed; Razorpay is retrying. Operations remain enabled during grace period.',
        paidThroughDate,
        isInGracePeriod: true,
        gracePeriodEndsAt: new Date(graceEndMs),
        cancellationPending: false,
        subscriptionId,
        razorpaySubscriptionId,
        gatewayStatus,
      };
    }

    return {
      accessState: 'suspended',
      isAccessAllowed: false,
      reason: 'Recurring subscription charge failed and grace period elapsed.',
      paidThroughDate,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: false,
      subscriptionId,
      razorpaySubscriptionId,
      gatewayStatus,
    };
  }

  // 5. Gateway Status: HALTED (All auto-retries failed; subscription stopped)
  if (gatewayStatus === 'halted') {
    return {
      accessState: 'suspended',
      isAccessAllowed: false,
      reason: 'Subscription halted due to multiple payment authorization failures.',
      paidThroughDate,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: false,
      subscriptionId,
      razorpaySubscriptionId,
      gatewayStatus,
    };
  }

  // 6. Gateway Status: CANCELLED
  // Critical hospitality rule: Respect the paid-through period!
  if (gatewayStatus === 'cancelled') {
    if (periodEndMs && periodEndMs > now) {
      return {
        accessState: 'active',
        isAccessAllowed: true,
        reason: `Subscription cancelled, but access is retained through prepaid period ending ${paidThroughDate?.toLocaleDateString('en-IN')}.`,
        paidThroughDate,
        isInGracePeriod: false,
        gracePeriodEndsAt: null,
        cancellationPending: true,
        subscriptionId,
        razorpaySubscriptionId,
        gatewayStatus,
      };
    }

    return {
      accessState: 'cancelled',
      isAccessAllowed: false,
      reason: 'Subscription was cancelled and paid period has expired.',
      paidThroughDate,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: true,
      subscriptionId,
      razorpaySubscriptionId,
      gatewayStatus,
    };
  }

  // 7. Gateway Status: COMPLETED
  if (gatewayStatus === 'completed') {
    if (periodEndMs && periodEndMs > now) {
      return {
        accessState: 'active',
        isAccessAllowed: true,
        reason: 'Scheduled cycles completed. Access retained through prepaid period.',
        paidThroughDate,
        isInGracePeriod: false,
        gracePeriodEndsAt: null,
        cancellationPending: false,
        subscriptionId,
        razorpaySubscriptionId,
        gatewayStatus,
      };
    }

    return {
      accessState: 'expired',
      isAccessAllowed: false,
      reason: 'Subscription agreement completed all scheduled cycles.',
      paidThroughDate,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: false,
      subscriptionId,
      razorpaySubscriptionId,
      gatewayStatus,
    };
  }

  // 8. Gateway Status: EXPIRED
  if (gatewayStatus === 'expired') {
    return {
      accessState: 'expired',
      isAccessAllowed: false,
      reason: 'Subscription expired.',
      paidThroughDate,
      isInGracePeriod: false,
      gracePeriodEndsAt: null,
      cancellationPending: false,
      subscriptionId,
      razorpaySubscriptionId,
      gatewayStatus,
    };
  }

  // 9. Gateway Status: CREATED (Draft / Checkout initiated)
  return {
    accessState: 'trial',
    isAccessAllowed: false,
    reason: 'Subscription checkout initiated but payment mandate has not been authorized.',
    paidThroughDate: null,
    isInGracePeriod: false,
    gracePeriodEndsAt: null,
    cancellationPending: false,
    subscriptionId,
    razorpaySubscriptionId,
    gatewayStatus,
  };
}

