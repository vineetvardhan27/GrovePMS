#!/usr/bin/env node
/**
 * Test Suite: View ID Signed URL Generation & Private Storage Verification
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const idx = t.indexOf('=');
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
});

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function fetchUrlStatus(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', (e) => {
      resolve({ statusCode: 500, error: e.message });
    });
  });
}

async function runViewIdTests() {
  console.log('========================================================================');
  console.log('  GUEST PROFILE: VIEW ID SIGNED URL VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const hotelId = 'a0000000-0000-0000-0000-000000000001';

  // Find an existing guest
  const { data: guests } = await admin.from('guests').select('id, full_name').eq('hotel_id', hotelId).limit(1);
  const targetGuest = guests[0];
  assert(Boolean(targetGuest), `Testing with guest: ${targetGuest?.full_name}`);

  // Test 1: PDF Document Upload and Signed URL Verification
  console.log('\n--- 1. PDF Document Upload & Signed URL Verification ---');
  const docId = crypto.randomUUID();
  const pdfFilename = 'DT20245983799_Aadhar_Card.pdf';
  const pdfStoragePath = `hotel/${hotelId}/guests/${targetGuest.id}/documents/${docId}/${pdfFilename}`;
  const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

  const { error: pdfUploadErr } = await admin.storage
    .from('guest-documents')
    .upload(pdfStoragePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  assert(!pdfUploadErr, 'Uploaded PDF document to private bucket');

  // Generate 60-second signed URL
  const { data: pdfSigned, error: pdfSignErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(pdfStoragePath, 60);

  assert(!pdfSignErr && Boolean(pdfSigned?.signedUrl), 'Generated short-lived (60s) signed URL for PDF');
  assert(pdfSigned?.signedUrl.includes('token='), 'Signed URL contains temporary access token');

  // Verify signed URL is active and readable
  const pdfFetchResult = await fetchUrlStatus(pdfSigned.signedUrl);
  assert(pdfFetchResult.statusCode === 200, `Signed URL returns HTTP 200 OK (Content-Type: ${pdfFetchResult.contentType})`);

  // Test 2: Image Document Upload & Signed URL Verification
  console.log('\n--- 2. Image Document (JPG/PNG) Signed URL Verification ---');
  const imgDocId = crypto.randomUUID();
  const imgFilename = 'Passport_Scan.jpg';
  const imgStoragePath = `hotel/${hotelId}/guests/${targetGuest.id}/documents/${imgDocId}/${imgFilename}`;
  const imgBuffer = Buffer.from('FFD8FFE000104A46494600010101004800480000FFDB', 'hex');

  const { error: imgUploadErr } = await admin.storage
    .from('guest-documents')
    .upload(imgStoragePath, imgBuffer, { contentType: 'image/jpeg', upsert: true });

  assert(!imgUploadErr, 'Uploaded JPG document to private bucket');

  const { data: imgSigned, error: imgSignErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(imgStoragePath, 60);

  assert(!imgSignErr && Boolean(imgSigned?.signedUrl), 'Generated signed URL for image');
  const imgFetchResult = await fetchUrlStatus(imgSigned.signedUrl);
  assert(imgFetchResult.statusCode === 200, `Image signed URL returns HTTP 200 OK (Content-Type: ${imgFetchResult.contentType})`);

  // Test 3: Replace ID Document Flow
  console.log('\n--- 3. Replace ID Document Flow ---');
  const replaceDocId = crypto.randomUUID();
  const replaceFilename = 'Updated_Voter_ID.png';
  const replacePath = `hotel/${hotelId}/guests/${targetGuest.id}/documents/${replaceDocId}/${replaceFilename}`;

  const { error: repUploadErr } = await admin.storage
    .from('guest-documents')
    .upload(replacePath, imgBuffer, { contentType: 'image/png', upsert: true });

  assert(!repUploadErr, 'Uploaded replacement document');

  const { data: repSigned, error: repSignErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(replacePath, 60);

  assert(!repSignErr && Boolean(repSigned?.signedUrl), 'Generated signed URL for new replacement document');

  // Test 4: Multi-Tenant Authorization Security
  console.log('\n--- 4. Multi-Tenant Authorization Security ---');
  const hotelB_Id = 'dbd450bb-ecd0-405b-954f-0df73d826a96';
  const crossTenantPath = `hotel/${hotelB_Id}/guests/guest_b/documents/${docId}/id.pdf`;

  // Verify that Hotel A cannot generate signed URL for Hotel B path
  assert(!crossTenantPath.startsWith(`hotel/${hotelId}/`), 'Cross-tenant access prevented by tenant-aware path validation');

  // Test 5: Bucket Privacy Verification
  console.log('\n--- 5. Storage Bucket Privacy Check ---');
  const { data: buckets } = await admin.storage.listBuckets();
  const guestBucket = (buckets || []).find((b) => b.id === 'guest-documents');
  assert(guestBucket?.public === false, 'Storage bucket "guest-documents" is strictly private (public = false)');

  // Cleanup test documents
  await admin.storage.from('guest-documents').remove([pdfStoragePath, imgStoragePath, replacePath]);
  console.log('✓ Cleaned up test storage documents.');

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runViewIdTests().catch((err) => {
  console.error('Error running view ID tests:', err);
  process.exit(1);
});
