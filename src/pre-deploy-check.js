#!/usr/bin/env node

/**
 * Pre-Deployment Check for DevTrack Africa
 * Ensures Edge Functions are completely removed before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 DevTrack Africa - Pre-Deployment Check');
console.log('=========================================\n');

let canDeploy = true;
const issues = [];

// Function to check if dangerous Edge Function files exist
function checkForEdgeFunctionFiles() {
  const dangerouspaths = [
    'supabase/functions/server/index.tsx',
    'supabase/functions/server/index.ts',
    'supabase/functions/server/kv_store.tsx',
    'supabase/functions/server/kv_store.ts',
    'supabase/functions/make-server',
    'supabase/functions/*/index.tsx',
    'supabase/functions/*/index.ts'
  ];

  console.log('1. Checking for Edge Function files...');
  
  dangerouspaths.forEach(dangerousPath => {
    const fullPath = path.join(__dirname, dangerousPath);
    if (fs.existsSync(fullPath)) {
      issues.push(`❌ CRITICAL: Edge Function file exists: ${dangerousPath}`);
      canDeploy = false;
    }
  });

  // Check if server directory exists with TypeScript files
  const serverDir = path.join(__dirname, 'supabase/functions/server');
  if (fs.existsSync(serverDir)) {
    const files = fs.readdirSync(serverDir);
    const tsFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    
    if (tsFiles.length > 0) {
      issues.push(`❌ CRITICAL: TypeScript files found in server directory: ${tsFiles.join(', ')}`);
      canDeploy = false;
    } else {
      console.log('✅ Server directory exists but contains no TypeScript files');
    }
  } else {
    console.log('✅ Server directory does not exist');
  }

  if (issues.length === 0) {
    console.log('✅ No dangerous Edge Function files found');
  }
}

// Check configuration files
function checkConfiguration() {
  console.log('\n2. Checking configuration files...');
  
  // Check .supabaseignore
  const ignoreFile = path.join(__dirname, 'supabase/.supabaseignore');
  if (fs.existsSync(ignoreFile)) {
    const ignoreContent = fs.readFileSync(ignoreFile, 'utf8');
    if (ignoreContent.includes('functions/**/*.tsx') && ignoreContent.includes('functions/**/*.ts')) {
      console.log('✅ .supabaseignore properly configured');
    } else {
      issues.push('⚠️  WARNING: .supabaseignore may not properly ignore Edge Function files');
    }
  } else {
    issues.push('❌ CRITICAL: .supabaseignore file missing');
    canDeploy = false;
  }

  // Check config.toml
  const configFile = path.join(__dirname, 'supabase/config.toml');
  if (fs.existsSync(configFile)) {
    const configContent = fs.readFileSync(configFile, 'utf8');
    if (configContent.includes('enabled = false') && configContent.includes('[edge_functions]')) {
      console.log('✅ config.toml properly disables Edge Functions');
    } else {
      issues.push('⚠️  WARNING: config.toml may not properly disable Edge Functions');
    }
  } else {
    issues.push('⚠️  WARNING: config.toml file missing');
  }
}

// Check application files
function checkApplicationFiles() {
  console.log('\n3. Checking application files...');
  
  const criticalFiles = [
    'App.tsx',
    'components/EnhancedDashboard.tsx',
    'utils/database-service.ts',
    'contexts/AuthContext.tsx'
  ];

  let filesOk = true;
  criticalFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`✅ ${file} exists`);
    } else {
      issues.push(`❌ CRITICAL: Missing essential file: ${file}`);
      filesOk = false;
      canDeploy = false;
    }
  });

  if (filesOk) {
    console.log('✅ All essential application files present');
  }
}

// Check for any remaining edge function references
function checkForEdgeFunctionReferences() {
  console.log('\n4. Checking for Edge Function references in code...');
  
  const clientFile = path.join(__dirname, 'utils/supabase/client.ts');
  if (fs.existsSync(clientFile)) {
    const clientContent = fs.readFileSync(clientFile, 'utf8');
    const dangerousRefs = ['edge_functions', 'functions.invoke', 'supabase.functions'];
    
    let foundRefs = false;
    dangerousRefs.forEach(ref => {
      if (clientContent.includes(ref)) {
        issues.push(`⚠️  WARNING: Found potential Edge Function reference: ${ref}`);
        foundRefs = true;
      }
    });
    
    if (!foundRefs) {
      console.log('✅ No Edge Function references found in client code');
    }
  }
}

// Run all checks
checkForEdgeFunctionFiles();
checkConfiguration();
checkApplicationFiles();
checkForEdgeFunctionReferences();

// Summary
console.log('\n📊 Pre-Deployment Summary');
console.log('==========================');

if (issues.length === 0) {
  console.log('🎉 ALL CHECKS PASSED!');
  console.log('✅ Ready for deployment');
  console.log('\nThe application should deploy without Edge Function errors.');
} else {
  console.log('🚨 ISSUES FOUND:');
  issues.forEach(issue => console.log(`   ${issue}`));
  
  if (!canDeploy) {
    console.log('\n❌ DEPLOYMENT BLOCKED');
    console.log('Please fix critical issues before deploying.');
    process.exit(1);
  } else {
    console.log('\n⚠️  DEPLOYMENT ALLOWED WITH WARNINGS');
    console.log('Consider addressing warnings for optimal deployment.');
  }
}

console.log('\nNext steps:');
console.log('1. Fix any critical issues listed above');
console.log('2. Run this check again');
console.log('3. Deploy when all checks pass');
console.log('4. Monitor deployment for Edge Function errors');

// Clean exit
process.exit(canDeploy ? 0 : 1);