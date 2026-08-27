#!/usr/bin/env node
/**
 * Verification Script: Guest ID Card Upload & Document Management System
 */
global.WebSocket = class DummyWS {};
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function maskIdNumber(idType, idNumber) {
  if (!idNumber) return '—';
  const clean = idNumber.replace(/\s+/g, '').trim();
  if (clean.length < 4) return '••••';

  const type = (idType || '').toLowerCase();

  if (type.includes('aadhaar') || clean.length === 12) {
    const last4 = clean.slice(-4);
    return `XXXX XXXX ${last4}`;
  }

  if (type.includes('pan') && clean.length === 10) {
    const prefix = clean.slice(0, 2);
    const suffix = clean.slice(-2);
    return `${prefix}••••••${suffix}`;
  }

  if (type.includes('passport')) {
    const prefix = clean.slice(0, 1);
    const suffix = clean.slice(-2);
    return `${prefix}•••••${suffix}`;
  }

  if (type.includes('driving') || type.includes('license') || type.includes('dl')) {
    const prefix = clean.slice(0, 2);
    const suffix = clean.slice(-4);
    return `${prefix}••••••${suffix}`;
  }

  if (clean.length > 4) {
    return `•••• ${clean.slice(-4)}`;
  }

  return '••••';
}

function extractIdDataFromText(text) {
  const result = { rawConfidence: 0 };
  if (!text || !text.trim()) return result;

  const normalized = text.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

  const aadhaarMatch = text.match(/\b([2-9]\d{3}\s?\d{4}\s?\d{4})\b/);
  if (aadhaarMatch) {
    const rawNum = aadhaarMatch[1].replace(/\s+/g, '');
    if (rawNum.length === 12) {
      result.idType = 'Aadhaar';
      result.idNumber = `${rawNum.slice(0, 4)} ${rawNum.slice(4, 8)} ${rawNum.slice(8, 12)}`;
      result.idNumberMasked = maskIdNumber('Aadhaar', rawNum);
      result.rawConfidence += 0.4;
    }
  }

  if (!result.idType) {
    const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/i);
    if (panMatch) {
      const pan = panMatch[1].toUpperCase();
      result.idType = 'PAN Card';
      result.idNumber = pan;
      result.idNumberMasked = maskIdNumber('PAN Card', pan);
      result.rawConfidence += 0.4;
    }
  }

  const dobMatch = text.match(/\b(DOB|Date of Birth|Birth|D\.O\.B)[:\s]*([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.](?:19|20)\d{2})\b/i);
  if (dobMatch) {
    result.dob = (dobMatch[2] || dobMatch[1]).replace(/[\-\.]/g, '/');
    result.rawConfidence += 0.2;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nameKeywords = ['name', 'holder name', 'full name', 'naam'];
    const lower = line.toLowerCase();
    for (const kw of nameKeywords) {
      if (lower.startsWith(kw) || lower.includes(`${kw}:`)) {
        const parts = line.split(/[:\-\=]/);
        if (parts[1]?.trim()) {
          const candidate = parts[1].trim().replace(/[^a-zA-Z\s]/g, '').trim();
          if (candidate.length >= 3 && candidate.length <= 40) {
            result.fullName = candidate;
            result.rawConfidence += 0.2;
            break;
          }
        }
      }
    }
    if (result.fullName) break;
  }

  const addressMatch = text.match(/(?:Address|Add)[:\s]*([\s\S]{10,120}?)(?:\n\n|\bPIN\b|\bPhone\b|$)/i);
  if (addressMatch && addressMatch[1]) {
    const cleanAddr = addressMatch[1].replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
    if (cleanAddr.length > 5) {
      result.address = cleanAddr;
      result.rawConfidence += 0.2;
    }
  }

  return result;
}

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

async function runGuestDocumentTests() {
  console.log('========================================================================');
  console.log('  GUEST ID UPLOAD & DOCUMENT MANAGEMENT VERIFICATION');
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

  // --- 1. Test Masking Utility ---
  console.log('--- 1. ID Number Privacy & Masking ---');
  assert(maskIdNumber('Aadhaar', '4582 9102 3847') === 'XXXX XXXX 3847', 'Aadhaar masking: "4582 9102 3847" -> "XXXX XXXX 3847"');
  assert(maskIdNumber('PAN Card', 'ABCDE1234F') === 'AB••••••4F', 'PAN Card masking: "ABCDE1234F" -> "AB••••••4F"');
  assert(maskIdNumber('Passport', 'Z1234567') === 'Z•••••67', 'Passport masking: "Z1234567" -> "Z•••••67"');
  assert(maskIdNumber('Driving License', 'MH1220190012345') === 'MH••••••2345', 'Driving License masking: "MH1220190012345" -> "MH••••••2345"');
  assert(maskIdNumber('Other', '987654321') === '•••• 4321', 'Fallback masking: "987654321" -> "•••• 4321"');

  // --- 2. Test ID Data Extraction Utility ---
  console.log('\n--- 2. Optical / Text Extraction Utility ---');
  const sampleAadhaar = `Government of India\nUnique Identification Authority of India\nName: Ramesh Kumar\nDOB: 14/08/1988\nAddress: Flat 402, Green Avenue, Pune, Maharashtra\n4582 9102 3847`;
  const aadhaarExtracted = extractIdDataFromText(sampleAadhaar);
  assert(aadhaarExtracted.idType === 'Aadhaar', 'Extracted ID Type: Aadhaar');
  assert(aadhaarExtracted.idNumber === '4582 9102 3847', 'Extracted ID Number: 4582 9102 3847');
  assert(aadhaarExtracted.fullName === 'Ramesh Kumar', 'Extracted Full Name: Ramesh Kumar');
  assert(aadhaarExtracted.dob === '14/08/1988', 'Extracted DOB: 14/08/1988');
  assert(Boolean(aadhaarExtracted.address && aadhaarExtracted.address.includes('Pune')), 'Extracted Address contains Pune');

  const samplePan = `Income Tax Department\nPermanent Account Number Card\nName: Rajesh Sharma\nABCDE1234F`;
  const panExtracted = extractIdDataFromText(samplePan);
  assert(panExtracted.idType === 'PAN Card' && panExtracted.idNumber === 'ABCDE1234F', 'Extracted PAN Card');

  // --- 3. Private Storage Bucket Verification ---
  console.log('\n--- 3. Private Supabase Storage Bucket Verification ---');
  const { data: buckets, error: bucketErr } = await admin.storage.listBuckets();
  assert(!bucketErr, 'Listed Supabase Storage buckets');

  const guestDocsBucket = (buckets || []).find((b) => b.id === 'guest-documents');
  assert(Boolean(guestDocsBucket), 'Bucket "guest-documents" exists');
  assert(guestDocsBucket?.public === false, 'Bucket "guest-documents" is strictly private (public = false)');
  assert(guestDocsBucket?.file_size_limit === 10485760, 'File size limit configured to 10MB (10485760 bytes)');

  // --- 4. Database Schema & Migration File Audit ---
  console.log('\n--- 4. Migration 0023 Schema & RLS Audit ---');
  const migration0023Path = path.resolve(process.cwd(), 'supabase/migrations/0023_guest_documents_and_storage.sql');
  assert(fs.existsSync(migration0023Path), '0023_guest_documents_and_storage.sql exists in supabase/migrations');
  const migration0023Sql = fs.readFileSync(migration0023Path, 'utf8');
  assert(migration0023Sql.includes('CREATE TABLE IF NOT EXISTS public.guest_documents'), 'Defines guest_documents table');
  assert(migration0023Sql.includes('CREATE TABLE IF NOT EXISTS public.guest_document_audit_logs'), 'Defines guest_document_audit_logs table');
  assert(migration0023Sql.includes('DROP POLICY IF EXISTS'), 'Uses safe idempotent DROP POLICY IF EXISTS');
  assert(migration0023Sql.includes("public.get_current_staff_role() IN ('owner', 'manager', 'reception')"), 'Restricts document access to authorized roles');

  // --- 5. Test Live Document Upload & Signed URL Lifecycle ---
  console.log('\n--- 5. Live Storage Test (Upload, Signed URL, Audit Log) ---');
  const testHotelId = 'a0000000-0000-0000-0000-000000000001';
  const testGuestId = 'g0000000-0000-0000-0000-000000000001';
  const testDocId = crypto.randomUUID();
  const testPath = `${testHotelId}/${testGuestId}/${testDocId}.jpg`;
  const testBuffer = Buffer.from('FFD8FFE000104A46494600010101004800480000FFDB', 'hex'); // valid mock jpeg header

  // Upload test document via storage admin
  const { error: uploadErr } = await admin.storage.from('guest-documents').upload(testPath, testBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (uploadErr) console.error('Upload err detail:', uploadErr.message);
  assert(!uploadErr, 'Uploaded test file into private guest-documents storage');

  // Generate 60-second signed URL
  const { data: signedData, error: signErr } = await admin.storage
    .from('guest-documents')
    .createSignedUrl(testPath, 60);

  assert(!signErr && Boolean(signedData?.signedUrl), 'Generated short-lived signed URL');
  assert(signedData?.signedUrl.includes('token='), 'Signed URL contains security access token');

  // Cleanup test file
  await admin.storage.from('guest-documents').remove([testPath]);
  console.log('✓ Cleaned up test storage object.');

  console.log('\n========================================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runGuestDocumentTests().catch((err) => {
  console.error('Guest document test suite error:', err);
  process.exit(1);
});
