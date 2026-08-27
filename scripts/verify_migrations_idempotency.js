#!/usr/bin/env node
/**
 * Verification Script: Supabase Migration Idempotency & Triggers Integrity
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

async function runMigrationAudit() {
  console.log('========================================================================');
  console.log('  SUPABASE MIGRATION HISTORY & TRIGGER IDEMPOTENCY AUDIT');
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

  // 1. Audit all migration SQL files for CREATE TRIGGER without DROP TRIGGER IF EXISTS
  console.log('--- 1. Static Audit of All Migration Files ---');
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  console.log(`Found ${migrationFiles.length} migration files in supabase/migrations.\n`);

  let unshieldedTriggersCount = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^CREATE\s+TRIGGER\s+/i.test(line)) {
        // Extract trigger name
        const match = line.match(/CREATE\s+TRIGGER\s+(\w+)/i);
        const triggerName = match ? match[1] : 'unknown';

        // Check if preceding non-empty lines contain DROP TRIGGER IF EXISTS
        let hasDrop = false;
        for (let j = Math.max(0, i - 5); j < i; j++) {
          if (lines[j].includes(`DROP TRIGGER IF EXISTS ${triggerName}`)) {
            hasDrop = true;
            break;
          }
        }

        if (hasDrop) {
          assert(true, `${file}: Trigger "${triggerName}" is safely preceded by DROP TRIGGER IF EXISTS`);
        } else {
          console.error(`  ❌ FAIL: ${file} (line ${i + 1}): Trigger "${triggerName}" lacks DROP TRIGGER IF EXISTS`);
          unshieldedTriggersCount++;
          failed++;
        }
      }
    }
  }

  assert(unshieldedTriggersCount === 0, 'Zero unshielded CREATE TRIGGER statements across entire migration history');

  // 2. Test live database trigger for hotels.updated_at
  console.log('\n--- 2. Live Database hotels.updated_at Trigger Functionality ---');
  const { data: hotel, error: hotelErr } = await admin.from('hotels').select('*').limit(1).single();
  assert(!hotelErr && hotel, `Fetched hotel record: ${hotel?.name} (${hotel?.id})`);

  const initialUpdatedAt = hotel.updated_at;
  // Wait 1 second to ensure timestamp differentiation
  await new Promise((resolve) => setTimeout(resolve, 1100));

  // Perform a small update on hotel settings
  const { data: updatedHotel, error: updateErr } = await admin
    .from('hotels')
    .update({ settings: { ...hotel.settings, _test_ping: Date.now() } })
    .eq('id', hotel.id)
    .select('*')
    .single();

  assert(!updateErr, 'Successfully updated hotel record in live database');
  const newUpdatedAt = updatedHotel?.updated_at;
  assert(
    new Date(newUpdatedAt).getTime() > new Date(initialUpdatedAt).getTime(),
    `hotels.updated_at automatically updated: "${initialUpdatedAt}" -> "${newUpdatedAt}"`
  );

  // Restore hotel settings (clean up test ping)
  const cleanSettings = { ...hotel.settings };
  delete cleanSettings._test_ping;
  await admin.from('hotels').update({ settings: cleanSettings }).eq('id', hotel.id);
  console.log('✓ Cleaned up test property from hotel settings.');

  console.log('\n========================================================================');
  console.log(`  AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runMigrationAudit().catch((err) => {
  console.error('Migration audit error:', err);
  process.exit(1);
});
