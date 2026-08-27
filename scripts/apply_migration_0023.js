#!/usr/bin/env node
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

async function main() {
  console.log('Applying Migration 0023 to Live Supabase DB...');

  // 1. Ensure private storage bucket 'guest-documents' exists
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.id === 'guest-documents');
  if (!exists) {
    const { error: bErr } = await admin.storage.createBucket('guest-documents', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'],
    });
    if (bErr) console.warn('Bucket creation notice:', bErr.message);
    else console.log('✓ Created private storage bucket: guest-documents');
  } else {
    await admin.storage.updateBucket('guest-documents', {
      public: false,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'],
    });
    console.log('✓ Verified private storage bucket: guest-documents (public=false)');
  }

  // 2. Check if table guest_documents and audit logs are accessible via Supabase REST
  // We can probe with admin client
  const { data: docs, error: docErr } = await admin.from('guest_documents').select('id').limit(1);
  if (docErr) {
    console.log('guest_documents table status:', docErr.message);
  } else {
    console.log('✓ guest_documents table is accessible.');
  }

  const { data: audit, error: auditErr } = await admin.from('guest_document_audit_logs').select('id').limit(1);
  if (auditErr) {
    console.log('guest_document_audit_logs table status:', auditErr.message);
  } else {
    console.log('✓ guest_document_audit_logs table is accessible.');
  }

  console.log('Migration 0023 preparation finished.');
}

main().catch(console.error);
