#!/usr/bin/env node
/**
 * Verification Script: Password Visibility Toggle Across All PMS Modules
 */
const fs = require('fs');
const path = require('path');

function runVerification() {
  console.log('========================================================================');
  console.log('  PASSWORD VISIBILITY TOGGLE SYSTEM VERIFICATION');
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

  // 1. Check reusable PasswordInput component
  console.log('--- 1. Reusable PasswordInput Component ---');
  const passwordInputPath = path.resolve(process.cwd(), 'components/shared/PasswordInput.tsx');
  assert(fs.existsSync(passwordInputPath), 'components/shared/PasswordInput.tsx exists');

  const passwordInputCode = fs.readFileSync(passwordInputPath, 'utf8');
  assert(passwordInputCode.includes("const [isVisible, setIsVisible] = useState(false);"), 'Default state has isVisible = false (hidden/masked by default)');
  assert(passwordInputCode.includes("type={isVisible ? 'text' : 'password'}"), 'Dynamic type switching between text and password');
  assert(passwordInputCode.includes('aria-label={isVisible ? \'Hide password\' : \'Show password\'}'), 'Accessible aria-label for screen readers');
  assert(passwordInputCode.includes('title={isVisible ? \'Hide password\' : \'Show password\'}'), 'Tooltip title attribute present');
  assert(passwordInputCode.includes('type="button"'), 'Button uses type="button" to prevent form submission');
  assert(passwordInputCode.includes('e.preventDefault()'), 'Prevents default event triggers on click');
  assert(passwordInputCode.includes('<EyeOff') && passwordInputCode.includes('<Eye'), 'Uses Eye and EyeOff icons from lucide-react');
  assert(passwordInputCode.includes('KeyRound'), 'Retains left-side lock/key icon styling');
  assert(passwordInputCode.includes('pr-10'), 'Right padding prevents text overlapping eye icon');

  // 2. Check Sign In / Login Portal
  console.log('\n--- 2. Login / Sign In Portal ---');
  const loginPath = path.resolve(process.cwd(), 'app/(auth)/login/page.tsx');
  assert(fs.existsSync(loginPath), 'app/(auth)/login/page.tsx exists');
  const loginCode = fs.readFileSync(loginPath, 'utf8');
  assert(loginCode.includes('PasswordInput'), 'Login page imports and uses PasswordInput component');
  assert(!loginCode.includes('<input\n                id="password"\n                name="password"\n                type="password"'), 'Native untoggled password input removed from login page');

  // 3. Check Settings -> Staff Management (Add Staff Modal)
  console.log('\n--- 3. Staff & User Management (Add Staff Member) ---');
  const staffPath = path.resolve(process.cwd(), 'app/(dashboard)/settings/staff/StaffManager.tsx');
  assert(fs.existsSync(staffPath), 'StaffManager.tsx exists');
  const staffCode = fs.readFileSync(staffPath, 'utf8');
  assert(staffCode.includes('PasswordInput'), 'StaffManager.tsx imports and uses PasswordInput component');
  assert(!staffCode.includes('type="password"'), 'No raw type="password" input in StaffManager.tsx');

  // 4. Check Hotel Registration / Onboarding (Password + Confirm Password)
  console.log('\n--- 4. Hotel Registration & Onboarding ---');
  const registerPath = path.resolve(process.cwd(), 'app/(auth)/register-hotel/page.tsx');
  assert(fs.existsSync(registerPath), 'register-hotel/page.tsx exists');
  const registerCode = fs.readFileSync(registerPath, 'utf8');
  assert(registerCode.includes('PasswordInput'), 'register-hotel page uses PasswordInput component');
  assert(registerCode.includes('id="password"') && registerCode.includes('id="confirm_password"'), 'Both Password and Confirm Password fields use independent components');

  // 5. Codebase-wide audit for any untoggled type="password"
  console.log('\n--- 5. Global Codebase Scan for Untoggled Password Inputs ---');
  function scanDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (file === 'node_modules' || file === '.next' || file === '.git') continue;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath, fileList);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const allTsxFiles = scanDir(path.resolve(process.cwd(), 'app')).concat(scanDir(path.resolve(process.cwd(), 'components')));
  let untoggledFound = 0;
  for (const filePath of allTsxFiles) {
    if (filePath.includes('PasswordInput.tsx')) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('type="password"') || content.includes("type='password'")) {
      console.error(`  ❌ Found untoggled password input in: ${filePath}`);
      untoggledFound++;
    }
  }
  assert(untoggledFound === 0, 'No raw/untoggled type="password" inputs found anywhere in app/ or components/');

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runVerification();
