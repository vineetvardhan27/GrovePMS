/**
 * CAPTCHA Verification Service
 * Supports Cloudflare Turnstile (preferred, privacy-friendly, lightweight)
 * and Google reCAPTCHA v3 as a secondary alternative.
 */

export interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  hostname?: string;
}

/**
 * Verifies a CAPTCHA token server-side using Cloudflare Turnstile or Google reCAPTCHA.
 *
 * @param token The token received from the client-side CAPTCHA widget.
 * @param remoteIp The client IP address for enhanced security check.
 */
export async function verifyCaptchaToken(
  token: string,
  remoteIp?: string
): Promise<CaptchaVerificationResult> {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return {
      success: false,
      error: 'CAPTCHA token is missing. Please complete the verification.',
      errorCode: 'CAPTCHA_MISSING',
    };
  }

  // Check if Google reCAPTCHA is explicitly configured
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (recaptchaSecret && !process.env.TURNSTILE_SECRET_KEY) {
    return verifyGoogleRecaptcha(token, recaptchaSecret, remoteIp);
  }

  // Otherwise, use Cloudflare Turnstile (preferred)
  return verifyCloudflareTurnstile(token, remoteIp);
}

/**
 * Cloudflare Turnstile Server-Side Verification
 * Spec: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
async function verifyCloudflareTurnstile(
  token: string,
  remoteIp?: string
): Promise<CaptchaVerificationResult> {
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY ||
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('[CAPTCHA] Cloudflare Turnstile secret key (TURNSTILE_SECRET_KEY) is not configured in .env.');
    return {
      success: false,
      error: 'Security verification is temporarily unavailable. Please configure TURNSTILE_SECRET_KEY in .env.',
      errorCode: 'CAPTCHA_CONFIG_MISSING',
    };
  }

  const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout for server-side siteverify

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[CAPTCHA] Turnstile verify HTTP error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: 'CAPTCHA verification server error. Please try again.',
        errorCode: 'CAPTCHA_UPSTREAM_ERROR',
      };
    }

    const data = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
      challenge_ts?: string;
      hostname?: string;
    };

    if (data.success === true) {
      return {
        success: true,
        hostname: data.hostname,
      };
    }

    const errorCodes = data['error-codes'] || [];
    console.warn('[CAPTCHA] Turnstile validation rejected:', errorCodes);

    let clientMessage = 'CAPTCHA verification failed. Please try checking the box again.';
    if (errorCodes.includes('timeout-or-duplicate')) {
      clientMessage = 'CAPTCHA challenge expired or was already used. Please verify again.';
    } else if (errorCodes.includes('invalid-input-response')) {
      clientMessage = 'Invalid security token. Please refresh the page and try again.';
    }

    return {
      success: false,
      error: clientMessage,
      errorCode: errorCodes[0] || 'CAPTCHA_REJECTED',
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('[CAPTCHA] Turnstile verification timed out.');
      return {
        success: false,
        error: 'Security verification timed out. Please check your connection and try again.',
        errorCode: 'CAPTCHA_TIMEOUT',
      };
    }

    console.error('[CAPTCHA] Network or unexpected error during Turnstile verification:', err);
    return {
      success: false,
      error: 'Security verification encountered a network error. Please try again.',
      errorCode: 'CAPTCHA_NETWORK_ERROR',
    };
  }
}

/**
 * Google reCAPTCHA v3 Server-Side Verification
 */
async function verifyGoogleRecaptcha(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<CaptchaVerificationResult> {
  const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: 'reCAPTCHA verification server error. Please try again.',
        errorCode: 'RECAPTCHA_UPSTREAM_ERROR',
      };
    }

    const data = (await response.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      'error-codes'?: string[];
      hostname?: string;
    };

    if (data.success && (data.score === undefined || data.score >= 0.5)) {
      return {
        success: true,
        hostname: data.hostname,
      };
    }

    return {
      success: false,
      error: 'reCAPTCHA verification failed or score too low.',
      errorCode: 'RECAPTCHA_LOW_SCORE',
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'reCAPTCHA verification timed out.',
        errorCode: 'RECAPTCHA_TIMEOUT',
      };
    }

    return {
      success: false,
      error: 'reCAPTCHA verification failed due to network error.',
      errorCode: 'RECAPTCHA_NETWORK_ERROR',
    };
  }
}
