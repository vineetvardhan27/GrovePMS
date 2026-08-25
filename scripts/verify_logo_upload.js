#!/usr/bin/env node
/**
 * Verification Script: Direct Hotel Logo Storage Upload & Multi-Tenant Branding
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

async function runLogoUploadVerification() {
  console.log('========================================================================');
  console.log('  DIRECT HOTEL LOGO UPLOAD & BRANDING SYSTEM VERIFICATION');
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

  // 1. Verify storage bucket exists and is public
  console.log('--- 1. Supabase Storage Bucket Configuration ---');
  const { data: buckets, error: bucketListErr } = await admin.storage.listBuckets();
  assert(!bucketListErr, 'Successfully queried Supabase Storage buckets');
  const logoBucket = buckets?.find((b) => b.name === 'hotel-logos');
  assert(Boolean(logoBucket), 'Storage bucket "hotel-logos" exists');
  assert(logoBucket?.public === true, 'Storage bucket "hotel-logos" is public');

  // 2. Fetch hotels to test multi-tenancy
  console.log('\n--- 2. Multi-Tenant Hotel Branding Verification ---');
  const { data: hotels, error: hotelsErr } = await admin
    .from('hotels')
    .select('id, name, slug, settings')
    .limit(3);

  assert(!hotelsErr && hotels?.length > 0, `Loaded ${hotels?.length || 0} hotels from database`);
  const targetHotel = hotels[0];
  console.log(`  Target hotel for upload test: ${targetHotel.name} (${targetHotel.id})`);

  // 3. Test direct file upload to storage
  console.log('\n--- 3. Direct Logo Upload Simulation ---');
  // Create synthetic 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const testFilePath = `${targetHotel.id}/test_logo_${Date.now()}.png`;
  const { data: uploadData, error: uploadErr } = await admin.storage
    .from('hotel-logos')
    .upload(testFilePath, samplePngBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  assert(!uploadErr, `Successfully uploaded logo image to hotel-logos/${testFilePath}`);

  const { data: publicUrlData } = admin.storage.from('hotel-logos').getPublicUrl(testFilePath);
  const testLogoUrl = publicUrlData.publicUrl;
  assert(Boolean(testLogoUrl) && testLogoUrl.includes(testFilePath), `Generated valid public storage URL: ${testLogoUrl}`);

  // 4. Update hotel record with uploaded logo URL
  console.log('\n--- 4. Update Hotel Record with Uploaded Logo ---');
  const originalSettings = targetHotel.settings || {};
  const originalLogoUrl = originalSettings.logo_url;

  const updatedSettings = {
    ...originalSettings,
    logo_url: testLogoUrl,
  };

  const { error: updateErr } = await admin
    .from('hotels')
    .update({
      settings: updatedSettings,
    })
    .eq('id', targetHotel.id);

  assert(!updateErr, 'Successfully updated hotels.settings.logo_url');

  // Verify persistence
  const { data: updatedHotel, error: verifyErr } = await admin
    .from('hotels')
    .select('id, name, settings')
    .eq('id', targetHotel.id)
    .single();

  assert(!verifyErr, 'Fetched updated hotel record');
  assert(updatedHotel.settings?.logo_url === testLogoUrl, 'hotels.settings.logo_url matches uploaded URL');

  // 5. Clean up / Restore original state
  console.log('\n--- 5. Clean Up & Restore State ---');
  const restoreSettings = {
    ...originalSettings,
    logo_url: originalLogoUrl || null,
  };

  const { error: restoreErr } = await admin
    .from('hotels')
    .update({
      settings: restoreSettings,
    })
    .eq('id', targetHotel.id);

  assert(!restoreErr, 'Successfully restored hotel logo settings');

  // Delete test file from storage
  const { error: deleteErr } = await admin.storage.from('hotel-logos').remove([testFilePath]);
  assert(!deleteErr, 'Cleaned up test image from storage bucket');

  // 6. Verify components exist and have proper bindings
  console.log('\n--- 6. Component Code Structure Verification ---');
  const logoUploadPath = path.resolve(process.cwd(), 'components/settings/HotelLogoUpload.tsx');
  assert(fs.existsSync(logoUploadPath), 'HotelLogoUpload.tsx component exists');

  const logoUploadCode = fs.readFileSync(logoUploadPath, 'utf8');
  assert(logoUploadCode.includes('uploadHotelLogoAction'), 'HotelLogoUpload invokes uploadHotelLogoAction');
  assert(logoUploadCode.includes('deleteHotelLogoAction'), 'HotelLogoUpload invokes deleteHotelLogoAction');
  assert(logoUploadCode.includes('refreshStaff'), 'HotelLogoUpload triggers refreshStaff for instant PMS sync');
  assert(logoUploadCode.includes('Replace Logo'), 'HotelLogoUpload includes Replace Logo option');
  assert(logoUploadCode.includes('Remove'), 'HotelLogoUpload includes Remove option');

  const gstFormPath = path.resolve(process.cwd(), 'app/(dashboard)/settings/gst/GSTSettingsForm.tsx');
  const gstFormCode = fs.readFileSync(gstFormPath, 'utf8');
  assert(gstFormCode.includes('HotelLogoUpload'), 'GSTSettingsForm embeds HotelLogoUpload');
  assert(!gstFormCode.includes('e.g. /images/hotel-logo.png'), 'Old manual URL text input removed from GSTSettingsForm');

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runLogoUploadVerification();
