/**
 * diagnose_session_cookies.js
 *
 * Simulates exactly what getCurrentStaff() does server-side:
 * Signs in, extracts the session cookies, then rebuilds the SSR Supabase
 * client with those cookies to query the staff table exactly as the
 * server component does.
 *
 * Usage: node scripts/diagnose_session_cookies.js
 */

global.WebSocket = class DummyWS {};
const fs   = require('fs');
const path = require('path');
const { createClient, createServerClient } = require('@supabase/supabase-js');

// ── Load .env.local ──────────────────────────────────────────────────────────
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const idx = t.indexOf('=');
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
});

const SUPABASE_URL     = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY         = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL       = 'owner@hotelgreeneryview.com';
const TEST_PASSWORD    = 'HotelDemo@2026!';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('══════════════════════════════════════════════════');
  console.log('  Session Cookie Simulation Diagnostics          ');
  console.log('══════════════════════════════════════════════════\n');

  // 1. Sign in to get a real session
  const browserClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: signIn, error: signInErr } = await browserClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signInErr || !signIn?.session) {
    console.error('✗ Sign-in failed:', signInErr?.message);
    return;
  }

  const { access_token, refresh_token } = signIn.session;
  console.log('✓ Signed in. User ID:', signIn.user.id);
  console.log('  Email confirmed:', !!signIn.user.email_confirmed_at);
  console.log('  Token type:', signIn.session.token_type);
  console.log('  Access token (40 chars):', access_token.slice(0, 40) + '...\n');

  // 2. Simulate what @supabase/ssr does with cookies
  // The cookie names used by @supabase/ssr are:
  //   sb-<project-ref>-auth-token         (chunked for large JWTs)
  //   sb-<project-ref>-auth-token.0       (chunk 0)
  //   sb-<project-ref>-auth-token.1       (chunk 1)
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log(`  Project ref: ${projectRef}`);

  // Encode session as @supabase/ssr would store it
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    token_type: 'bearer',
    expires_at: signIn.session.expires_at,
    expires_in: signIn.session.expires_in,
    user: signIn.user,
  });

  // Simulate a cookie store
  const cookieStore = {};
  const cookieName = `sb-${projectRef}-auth-token`;

  // Chunk the session (SSR client chunks at 3180 chars)
  const CHUNK_SIZE = 3180;
  if (sessionPayload.length > CHUNK_SIZE) {
    console.log(`  Session payload length: ${sessionPayload.length} → will be chunked`);
    let i = 0;
    while (i * CHUNK_SIZE < sessionPayload.length) {
      cookieStore[`${cookieName}.${i}`] = sessionPayload.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      i++;
    }
    cookieStore[`${cookieName}.0`] = cookieStore[`${cookieName}.0`]; // ensure first chunk exists
  } else {
    cookieStore[cookieName] = sessionPayload;
  }

  console.log('  Simulated cookies:', Object.keys(cookieStore).join(', '));

  // 3. Create SSR client the same way server.ts does
  const { createServerClient: createSSRClient } = require('@supabase/ssr');

  const ssrClient = createSSRClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      get(name) { return cookieStore[name]; },
      set(name, value) { cookieStore[name] = value; },
      remove(name) { delete cookieStore[name]; },
    },
  });

  // 4. getUser() — same as getCurrentStaff()
  console.log('\n── Simulating getCurrentStaff() ──');
  const { data: { user }, error: userErr } = await ssrClient.auth.getUser();

  if (userErr || !user) {
    console.error('✗ getUser() failed (this is why getCurrentStaff returns null):', userErr?.message);
    console.log('\n  LIKELY CAUSE: The SSR client cookie format differs from what was stored during sign-in.');
    console.log('  The Next.js app stores cookies via the browser login flow.');
    console.log('  Check that the login action calls supabase.auth.signInWithPassword() on an SSR client,');
    console.log('  not a browser client, so it properly sets HTTP-only cookies.\n');
  } else {
    console.log('✓ getUser() returned:', user.email);

    const { data: staffRow, error: staffErr } = await ssrClient
      .from('staff')
      .select('id, email, full_name, role, is_active, hotel_id, hotel:hotel_id(id, name, slug)')
      .eq('id', user.id)
      .maybeSingle();

    if (staffErr) {
      console.error('✗ Staff query error:', staffErr.message, staffErr.code);
    } else if (!staffRow) {
      console.error('✗ Staff query returned null — RLS blocking or no row');
    } else {
      console.log('✓ Staff row found:', staffRow.full_name, '[' + staffRow.role + ']');
      console.log('  Hotel:', staffRow.hotel?.name);
    }
  }

  // 5. Check login action — does it use SSR client?
  console.log('\n── Checking login action implementation ──');
  try {
    const loginActionPath = path.resolve(process.cwd(), 'app/(auth)/login/actions.ts');
    const loginAction = fs.readFileSync(loginActionPath, 'utf8');
    if (loginAction.includes("createClient") && loginAction.includes("supabase/server")) {
      console.log("✓ login/actions.ts uses lib/supabase/server (SSR client) — cookies set correctly");
    } else if (loginAction.includes("createClient") && loginAction.includes("supabase/client")) {
      console.log("✗ login/actions.ts uses lib/supabase/client (browser client) — cookies NOT set!");
      console.log("  This is the root cause. The login must use the SSR client to set HTTP-only cookies.");
    } else {
      console.log("  Could not determine client type. Printing relevant lines:");
      loginAction.split('\n').slice(0, 20).forEach(l => console.log(' ', l));
    }
  } catch (e) {
    console.log('  Could not read login/actions.ts:', e.message);
  }

  console.log('\n══════════════════════════════════════════════════\n');
}

main().catch(console.error);
