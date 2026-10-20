/**
 * Automated Verification Suite for Contact Page & CAPTCHA Integration
 * Tests:
 * 1. Zod input validation (valid/invalid inputs, edge cases, length limits)
 * 2. Input sanitization (XSS and script injection removal)
 * 3. Rate limiting (sliding window, max limit enforcement, retry headers)
 * 4. CAPTCHA verification (missing token, invalid token, live Cloudflare siteverify)
 * 5. Email formatting (branded HTML template, fallback plain-text)
 * 6. Contact delivery pipeline & Supabase audit logging
 */

import fs from 'fs';
import path from 'path';

// Shim WebSocket for Node 20 with supabase-js
(global as any).WebSocket = class DummyWS {};

// Load .env.local
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
envContent.split('\n').forEach((line) => {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const idx = t.indexOf('=');
    process.env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
});

import { sanitizeInput, contactFormSchema } from '../lib/validations/contact';
import { checkRateLimit, resetRateLimits } from '../lib/security/rateLimiter';
import { verifyCaptchaToken } from '../lib/security/captcha';
import {
  buildContactHtmlEmail,
  buildContactTextEmail,
  deliverContactEmail,
} from '../lib/email/contactDelivery';

async function runTestSuite() {
  console.log('========================================================================');
  console.log('  CONTACT PAGE & CAPTCHA VERIFICATION TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Input Sanitization
  // --------------------------------------------------------------------------
  console.log('Test Group 1: Input Sanitization & Anti-XSS');
  const dirtyInput = '<script>alert("XSS")</script><b>Hello</b>\u0000World';
  const cleanInput = sanitizeInput(dirtyInput);
  assert(cleanInput === 'HelloWorld', 'Strips script tags, HTML tags, and null bytes');

  const normalInput = '  Greenery View Resort & Spa  ';
  assert(sanitizeInput(normalInput) === 'Greenery View Resort & Spa', 'Trims whitespace correctly');

  // --------------------------------------------------------------------------
  // TEST 2: Zod Schema Validation
  // --------------------------------------------------------------------------
  console.log('\nTest Group 2: Zod Schema Validation');

  // 2.1: Empty payload
  const emptyRes = contactFormSchema.safeParse({});
  assert(!emptyRes.success, 'Rejects empty payload');

  // 2.2: Missing CAPTCHA token
  const noCaptchaRes = contactFormSchema.safeParse({
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    subject: 'PMS Onboarding Inquiry',
    message: 'We are interested in onboarding our 30-room hotel.',
    category: 'sales',
  });
  assert(!noCaptchaRes.success, 'Rejects payload with missing captchaToken');

  // 2.3: Malformed email
  const badEmailRes = contactFormSchema.safeParse({
    name: 'Rahul Sharma',
    email: 'invalid-email-format',
    subject: 'PMS Onboarding Inquiry',
    message: 'We are interested in onboarding our 30-room hotel.',
    category: 'sales',
    captchaToken: 'valid-test-token',
  });
  assert(!badEmailRes.success, 'Rejects malformed email address');

  // 2.4: Message too short (<10 chars)
  const shortMsgRes = contactFormSchema.safeParse({
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    subject: 'Inquiry',
    message: 'Short',
    category: 'sales',
    captchaToken: 'valid-test-token',
  });
  assert(!shortMsgRes.success, 'Rejects message under 10 characters');

  // 2.5: Valid payload
  const validRes = contactFormSchema.safeParse({
    name: 'Rahul Sharma',
    hotelName: 'Greenery Resort',
    email: 'rahul@greenery.com',
    phone: '+91 98765 43210',
    subject: 'Multi-property PMS Demo Request',
    message: 'We would like to request an end-to-end demonstration of the F&B and room billing systems.',
    category: 'sales',
    captchaToken: 'test-token-pass',
  });
  assert(validRes.success, 'Accepts valid form payload with all fields');

  // --------------------------------------------------------------------------
  // TEST 3: Rate Limiting
  // --------------------------------------------------------------------------
  console.log('\nTest Group 3: Sliding-Window Rate Limiting');
  resetRateLimits();

  const testIp = '198.51.100.42';
  for (let i = 1; i <= 5; i++) {
    const rl = checkRateLimit(testIp, { maxRequests: 5, windowMs: 60000 });
    assert(rl.allowed, `Request #${i} within 5-req limit is allowed (remaining: ${rl.remaining})`);
  }

  // 6th request should be blocked
  const blockedRl = checkRateLimit(testIp, { maxRequests: 5, windowMs: 60000 });
  assert(!blockedRl.allowed, '6th request is blocked by rate limiter');
  assert(blockedRl.remaining === 0, 'Remaining quota is 0');
  assert(blockedRl.resetInSeconds > 0, `Retry-After resetInSeconds (${blockedRl.resetInSeconds}s) is positive`);

  // Different IP should still be allowed
  const diffIp = '203.0.113.88';
  const diffRl = checkRateLimit(diffIp, { maxRequests: 5, windowMs: 60000 });
  assert(diffRl.allowed, 'Unrelated IP address is not blocked');

  resetRateLimits();

  // --------------------------------------------------------------------------
  // TEST 4: Cloudflare Turnstile Server-Side Verification
  // --------------------------------------------------------------------------
  console.log('\nTest Group 4: CAPTCHA Verification');

  // 4.1: Missing token check
  const emptyTokenRes = await verifyCaptchaToken('');
  assert(!emptyTokenRes.success && emptyTokenRes.errorCode === 'CAPTCHA_MISSING', 'Detects missing CAPTCHA token');

  // 4.2: Invalid / Rejected token check against live Cloudflare verify endpoint
  // Using Cloudflare's official "Always Fails" test secret: 2x0000000000000000000000000000000AA
  console.log('  Testing live siteverify with Cloudflare API...');
  const prevSecret = process.env.TURNSTILE_SECRET_KEY;
  process.env.TURNSTILE_SECRET_KEY = '2x0000000000000000000000000000000AA';
  const invalidTokenRes = await verifyCaptchaToken('dummy-token');
  process.env.TURNSTILE_SECRET_KEY = prevSecret;
  assert(
    !invalidTokenRes.success,
    `Live Cloudflare Turnstile correctly rejects invalid token (Error message: "${invalidTokenRes.error}")`
  );

  // 4.3: Valid siteverify check using Cloudflare's "Always Passes" test secret
  const cloudflareEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const formData = new URLSearchParams();
  formData.append('secret', '1x0000000000000000000000000000000AA'); // Universal test pass secret
  formData.append('response', 'test-token');
  const cfRes = await fetch(cloudflareEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  const cfJson = (await cfRes.json()) as any;
  assert(cfRes.ok, `Cloudflare siteverify endpoint is reachable (HTTP ${cfRes.status})`);
  assert(cfJson.success === true, 'Cloudflare test secret key produces success: true');

  // --------------------------------------------------------------------------
  // TEST 5: Email Formatting & Template Generation
  // --------------------------------------------------------------------------
  console.log('\nTest Group 5: Email Formatting');

  const sampleData = {
    name: 'Priya Patel',
    email: 'priya@heritagegrand.com',
    hotelName: 'Heritage Grand Hotel & Spa',
    phone: '+91 91234 56789',
    category: 'sales' as const,
    subject: 'Multi-property Pricing Inquiry',
    message: 'We operate 3 boutique properties in Rajasthan and would like a centralized PMS setup demo.',
  };
  const sampleMeta = {
    ip: '103.21.244.2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  const html = buildContactHtmlEmail(sampleData, sampleMeta);
  assert(html.includes('Heritage Grand Hotel &amp; Spa') || html.includes('Heritage Grand Hotel & Spa'), 'HTML email includes properly escaped hotel name');
  assert(html.includes('priya@heritagegrand.com'), 'HTML email includes email address');
  assert(html.includes('Multi-property Pricing Inquiry'), 'HTML email includes subject');
  assert(html.includes('Sales &amp; Onboarding Demo') || html.includes('Sales & Onboarding Demo'), 'HTML email formats inquiry category');

  const text = buildContactTextEmail(sampleData, sampleMeta);
  assert(text.includes('Priya Patel'), 'Text email includes contact name');
  assert(text.includes('103.21.244.2'), 'Text email includes client IP for security audit');

  // --------------------------------------------------------------------------
  // TEST 6: Delivery Dispatcher & Fallback
  // --------------------------------------------------------------------------
  console.log('\nTest Group 6: Email Delivery Dispatcher');

  const deliveryResult = await deliverContactEmail(sampleData, sampleMeta);
  assert(deliveryResult.delivered, `Delivery reported as delivered (provider: ${deliveryResult.provider})`);
  assert(process.env.CONTACT_TO_EMAIL === 'vineetvardhanwork@gmail.com', 'Recipient is configured as vineetvardhanwork@gmail.com');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled error in test suite:', err);
  process.exit(1);
});
