import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema, sanitizeInput, SanitizedContactData } from '@/lib/validations/contact';
import { verifyCaptchaToken } from '@/lib/security/captcha';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { deliverContactEmail } from '@/lib/email/contactDelivery';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Resolve client IP for rate limiting and audit logging
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const clientIp = cfConnectingIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 2. Enforce sliding-window rate limit (max 5 requests per 10 minutes per IP)
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many submissions from this connection. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
          errorCode: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimit.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 3. Parse JSON request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request format.',
          errorCode: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    // 4. Validate payload against Zod schema
    const parseResult = contactFormSchema.safeParse(body);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        const field = err.path.join('.') || 'general';
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted errors and try again.',
          errorCode: 'VALIDATION_ERROR',
          fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, hotelName, phone, category, captchaToken } = parseResult.data;

    // 5. Verify CAPTCHA token server-side (Cloudflare Turnstile or Google reCAPTCHA)
    const captchaResult = await verifyCaptchaToken(captchaToken, clientIp);
    if (!captchaResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: captchaResult.error || 'CAPTCHA verification failed. Please try again.',
          errorCode: captchaResult.errorCode || 'CAPTCHA_FAILED',
        },
        { status: 403 }
      );
    }

    // 6. Sanitize inputs to prevent stored XSS or control-character injection
    const sanitizedData: SanitizedContactData = {
      name: sanitizeInput(name),
      email: email.trim().toLowerCase(),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message),
      hotelName: hotelName ? sanitizeInput(hotelName) : undefined,
      phone: phone ? sanitizeInput(phone) : undefined,
      category,
    };

    // 7. Deliver email notification and persist submission in Supabase
    const delivery = await deliverContactEmail(sanitizedData, {
      ip: clientIp,
      userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for reaching out. Our team will review your inquiry and get back to you within 1 business day.',
        deliveryProvider: delivery.provider,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/contact] Unexpected server error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while processing your message. Please try again or contact us directly via email.',
        errorCode: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
