/**
 * In-memory sliding-window rate limiter for contact form submissions.
 * Prevents automated abuse, spam flooding, and repeated submissions.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  rateLimitStore.forEach((record, ip) => {
    record.timestamps = record.timestamps.filter((ts: number) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(ip);
    }
  });
}

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Checks whether a given client IP is within rate limits.
 * Default: 5 requests per 10 minutes.
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const maxRequests = options.maxRequests ?? 5;
  const windowMs = options.windowMs ?? 10 * 60 * 1000; // 10 minutes

  cleanupExpired(windowMs);

  const now = Date.now();
  const normalizedIp = ip?.trim() || 'unknown';

  let record = rateLimitStore.get(normalizedIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(normalizedIp, record);
  }

  // Filter out timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = maxRequests - record.timestamps.length;
  const resetInSeconds = Math.ceil(windowMs / 1000);

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetInSeconds,
  };
}

/**
 * Resets rate limit store (useful for automated testing)
 */
export function resetRateLimits(): void {
  rateLimitStore.clear();
}
