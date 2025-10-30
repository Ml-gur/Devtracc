#!/usr/bin/env node
/**
 * Deployment Readiness Check for DevTrack Africa
 * Verifies that Edge Functions are properly removed and deployment will succeed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DevTrack Africa - Deployment Readiness Check\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkPassed(message) {
  console.log(`✅ ${message}`);
  checks.passed++;
}

function checkFailed(message) {
  console.log(`❌ ${message}`);
  checks.failed++;
}

function checkWarning(message) {
  console.log(`⚠️  ${message}`);
  checks.warnings++;
}

// Check 1: Edge Functions should not exist
console.log('1. Checking Edge Functions Status...');
const serverFunctionsPath = path.join(__dirname, 'supabase', 'functions', 'server');
const indexPath = path.join(serverFunctionsPath, 'index.tsx');
const kvStorePath = path.join(serverFunctionsPath, 'kv_store.tsx');

if (fs.existsSync(indexPath) || fs.existsSync(kvStorePath)) {
  checkFailed('Edge Function files still exist - these cause 403 deployment errors');
  console.log('   Please remove:');
  if (fs.existsSync(indexPath)) console.log(`   - ${indexPath}`);
  if (fs.existsSync(kvStorePath)) console.log(`   - ${kvStorePath}`);
} else {
  checkPassed('Edge Function files have been removed');
}

// Check 2: .supabaseignore should exist
console.log('\n2. Checking .supabaseignore...');
const supabaseIgnorePath = path.join(__dirname, 'supabase', '.supabaseignore');
if (fs.existsSync(supabaseIgnorePath)) {
  const ignoreContent = fs.readFileSync(supabaseIgnorePath, 'utf8');
  if (ignoreContent.includes('functions/')) {
    checkPassed('.supabaseignore exists and ignores functions/');
  } else {
    checkWarning('.supabaseignore exists but may not ignore functions properly');
  }
} else {
  checkFailed('.supabaseignore is missing - create it to prevent Edge Function deployment');
}

// Check 3: config.toml should disable Edge Functions
console.log('\n3. Checking config.toml...');
const configPath = path.join(__dirname, 'supabase', 'config.toml');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (configContent.includes('enabled = false') && configContent.includes('[edge_functions]')) {
    checkPassed('config.toml properly disables Edge Functions');
  } else {
    checkWarning('config.toml exists but Edge Functions may not be disabled');
  }
} else {
  checkWarning('config.toml is missing - Edge Functions might be enabled by default');
}

// Check 4: Application code should not reference Edge Functions
console.log('\n4. Checking application code...');
const clientPath = path.join(__dirname, 'utils', 'supabase', 'client.ts');
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  if (!clientContent.includes('edge') && !clientContent.includes('function')) {
    checkPassed('Client code does not reference Edge Functions');
  } else {
    checkWarning('Client code may still reference Edge Functions');
  }
} else {
  checkWarning('Supabase client file not found');
}

// Check 5: Essential files exist
console.log('\n5. Checking essential files...');
const essentialFiles = [
  'App.tsx',
  'components/EnhancedDashboard.tsx',
  'utils/database-service.ts',
  'contexts/AuthContext.tsx'
];

essentialFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    checkPassed(`Essential file exists: ${file}`);
  } else {
    checkFailed(`Essential file missing: ${file}`);
  }
});

// Summary
console.log('\n📊 Deployment Readiness Summary');
console.log('================================');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

if (checks.failed === 0) {
  console.log('\n🎉 DEPLOYMENT READY!');
  console.log('The application should deploy without 403 Edge Function errors.');
  console.log('\nNext steps:');
  console.log('1. Deploy the application');
  console.log('2. Test core functionality');
  console.log('3. Verify no Edge Function errors in console');
} else {
  console.log('\n🚨 DEPLOYMENT NOT READY');
  console.log('Please fix the failed checks before deploying.');
}

if (checks.warnings > 0) {
  console.log('\n⚠️  Please review warnings to ensure optimal deployment.');
}

console.log('\nFor detailed instructions, see:');
console.log('- DEPLOYMENT_FIX.md');
console.log('- DEPLOYMENT_VERIFICATION.md');