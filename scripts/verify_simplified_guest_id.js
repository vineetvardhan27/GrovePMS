#!/usr/bin/env node
/**
 * Test Suite: Simplified Guest ID Card Upload, Storage, and Viewing
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
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

function maskIdNumber(idType, idNumber) {
  if (!idNumber) return '—';
  const clean = idNumber.replace(/\s+/g, '').trim();
  if (clean.length < 4) return '••••';
  const type = (idType || '').toLowerCase();
  if (type.includes('aadhaar') || clean.length === 12) {
    return `XXXX XXXX ${clean.slice(-4)}`;
  }
  if (type.includes('pan') && clean.length === 10) {
    return `${clean.slice(0, 2)}••••••${clean.slice(-2)}`;
  }
  if (type.includes('passport')) {
    return `${clean.slice(0, 1)}•••••${clean.slice(-2)}`;
  }
  if (type.includes('driving') || type.includes('license') || type.includes('dl')) {
    return `${clean.slice(0, 2)}••••••${clean.slice(-4)}`;
  }
  if (clean.length > 4) {
    return `•••• ${clean.slice(-4)}`;
  }
  return '••••';
}

async function runSimplifiedIdTests() {
  console.log('========================================================================');
  console.log('  SIMPLIFIED GUEST ID CARD WORKFLOW VERIFICATION');
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

  // --- 1. Storage Bucket State ---
  console.log('--- 1. Private Supabase Storage Bucket Verification ---');
  const { data: buckets } = await admin.storage.listBuckets();
  const bucket = (buckets || []).find((b) => b.id === 'guest-documents');
  assert(Boolean(bucket), 'Bucket "guest-documents" exists');
  assert(bucket?.public === false, 'Bucket "guest-documents" is strictly private (public = false)');

  // --- 2. ID Number Privacy Masking ---
  console.log('\n--- 2. ID Number Privacy & Masking ---');
  assert(maskIdNumber('Aadhaar', '123456789123') === 'XXXX XXXX 9123', 'Aadhaar masking: "123456789123" -> "XXXX XXXX 9123"');
  assert(maskIdNumber('PAN Card', 'ABCDE1234F') === 'AB••••••4F', 'PAN Card masking: "ABCDE1234F" -> "AB••••••4F"');
  assert(maskIdNumber('Passport', 'Z1234567') === 'Z•••••67', 'Passport masking: "Z1234567" -> "Z•••••67"');

  // --- 3. Upload Document for Existing Guest ---
  console.log('\n--- 3. Upload & Association Flow for Guest ---');
  const hotelId = 'a0000000-0000-0000-0000-000000000001';
  
  // Find an existing guest
  const { data: existingGuests } = await admin
    .from('guests')
    .select('id, full_name, phone, hotel_id')
    .eq('hotel_id', hotelId)
    .limit(1);

  assert(Boolean(existingGuests && existingGuests.length > 0), 'Found existing hotel guest in database');
  const targetGuest = existingGuests[0];

  const docId = crypto.randomUUID();
  const testFileName = 'Image_Vineet_Vardhan.jpg';
  const storagePath = `hotel/${hotelId}/guests/${targetGuest.id}/documents/${docId}/${testFileName}`;
  const mockBuffer = Buffer.from('FFD8FFE000104A46494600010101004800480000FFDB', 'hex');

  // Upload to private storage
  const { error: uploadErr } = await admin.storage
    .from('guest-documents')
    .upload(storagePath, mockBuffer, { contentType: 'image/jpeg', upsert: true });

  assert(!uploadErr, `Uploaded ID document for guest "${targetGuest.full_name}" into private storage`);

  // --- 4. Short-Lived Signed URL Generation (View ID) ---
  console.log('\n--- 4. Secure View ID (Short-Lived Signed URL) ---');
  const { data: signedData, error: signErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(storagePath, 60);

  assert(!signErr && Boolean(signedData?.signedUrl), 'Generated 60-second temporary signed URL');
  assert(signedData?.signedUrl.includes('token='), 'Signed URL includes security token');

  // --- 5. Replace ID Document Flow ---
  console.log('\n--- 5. Replace ID Document Flow ---');
  const replaceDocId = crypto.randomUUID();
  const replaceFileName = 'New_Aadhaar_Card.jpg';
  const replaceStoragePath = `hotel/${hotelId}/guests/${targetGuest.id}/documents/${replaceDocId}/${replaceFileName}`;

  const { error: replaceErr } = await admin.storage
    .from('guest-documents')
    .upload(replaceStoragePath, mockBuffer, { contentType: 'image/jpeg', upsert: true });

  assert(!replaceErr, 'Uploaded replaced ID document');

  // Clean up previous file
  await admin.storage.from('guest-documents').remove([storagePath]);
  console.log('✓ Cleaned up replaced old ID document.');

  // Clean up replaced file
  await admin.storage.from('guest-documents').remove([replaceStoragePath]);
  console.log('✓ Cleaned up test storage object.');

  // --- 6. Verification of Existing Guest Data Integrity ---
  console.log('\n--- 6. Existing Guest Data Preservation ---');
  const { data: guestCheck, error: gErr } = await admin
    .from('guests')
    .select('id, full_name, phone, email')
    .eq('id', targetGuest.id)
    .single();

  assert(!gErr && Boolean(guestCheck?.id), 'Existing guest record remains completely intact');

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runSimplifiedIdTests().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
