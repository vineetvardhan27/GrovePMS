import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';

export interface ApiResponseCacheOptions {
  /** max-age in seconds */
  maxAge: number;
  /** stale-while-revalidate in seconds */
  staleWhileRevalidate?: number;
  /** Is the response private to the authenticated user/tenant (default: true) */
  isPrivate?: boolean;
  /** Is the response served from cache hit */
  isHit?: boolean;
}

/**
 * Construct an optimized JSON NextResponse with HTTP Cache-Control and ETag headers.
 * Supports conditional GET with If-None-Match -> 304 Not Modified.
 */
export function createCachedJsonResponse<T>(
  req: NextRequest,
  data: T,
  options: ApiResponseCacheOptions
): NextResponse {
  const jsonString = JSON.stringify(data);
  const etag = `"${crypto.createHash('md5').update(jsonString).digest('hex')}"`;
  const cacheStatus = options.isHit ? 'HIT' : 'MISS';

  // Check If-None-Match header for client-side cache reuse (304 Not Modified)
  const clientEtag = req.headers.get('if-none-match');
  if (clientEtag && clientEtag === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Cache-Control': buildCacheControlHeader(options),
        'X-Cache': 'HIT (304)',
        'X-Cache-Status': 'HIT_NOT_MODIFIED',
      },
    });
  }

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag,
      'Cache-Control': buildCacheControlHeader(options),
      'X-Cache': cacheStatus,
      'X-Cache-Status': cacheStatus,
    },
  });
}

function buildCacheControlHeader(options: ApiResponseCacheOptions): string {
  const scope = options.isPrivate !== false ? 'private' : 'public';
  const parts = [`${scope}`, `no-transform`, `max-age=${options.maxAge}`];
  if (options.staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  return parts.join(', ');
}
