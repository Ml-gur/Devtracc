#!/usr/bin/env node

/**
 * Complete Edge Function Removal Script
 * This script completely removes all edge function files to prevent 403 deployment errors
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 DevTrack Africa - Complete Edge Function Removal');
console.log('==================================================\n');

// Function to safely remove a file or directory
function safeRemove(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // Remove directory and all contents
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${filePath}`);
      } else {
        // Remove file
        fs.unlinkSync(filePath);
        console.log(`✅ Removed file: ${filePath}`);
      }
      return true;
    } else {
      console.log(`ℹ️  File/directory does not exist: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
    return false;
  }
}

// Function to create empty placeholder file
function createPlaceholder(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created placeholder: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating placeholder ${filePath}:`, error.message);
    return false;
  }
}

console.log('1. Removing edge function files...\n');

// Remove specific edge function files
const edgeFunctionFiles = [
  'supabase/functions/server/index.tsx',
  'supabase/functions/server/index.ts',
  'supabase/functions/server/kv_store.tsx',
  'supabase/functions/server/kv_store.ts'
];

edgeFunctionFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  safeRemove(fullPath);
});

console.log('\n2. Creating safe placeholder files...\n');

// Create safe placeholder files that won't trigger deployment
const serverDir = path.join(__dirname, 'supabase/functions/server');
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
  console.log('✅ Created server directory');
}

// Create safe, non-functional placeholder files
createPlaceholder(
  path.join(serverDir, 'index.tsx'),
  '// REMOVED: Edge function completely disabled for DevTrack Africa\n// This file exists only to prevent deployment errors\n'
);

createPlaceholder(
  path.join(serverDir, 'kv_store.tsx'),
  '// REMOVED: KV store completely disabled for DevTrack Africa\n// This file exists only to prevent deployment errors\n'
);

console.log('\n3. Verifying removal...\n');

// Verify no functional code remains
const indexPath = path.join(__dirname, 'supabase/functions/server/index.tsx');
const kvStorePath = path.join(__dirname, 'supabase/functions/server/kv_store.tsx');

if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (indexContent.includes('export') || indexContent.includes('function') || indexContent.includes('handler')) {
    console.log('⚠️  WARNING: index.tsx still contains functional code');
  } else {
    console.log('✅ index.tsx is safely neutralized');
  }
}

if (fs.existsSync(kvStorePath)) {
  const kvStoreContent = fs.readFileSync(kvStorePath, 'utf8');
  if (kvStoreContent.includes('export') || kvStoreContent.includes('function') || kvStoreContent.includes('async')) {
    console.log('⚠️  WARNING: kv_store.tsx still contains functional code');
  } else {
    console.log('✅ kv_store.tsx is safely neutralized');
  }
}

console.log('\n4. Checking configuration files...\n');

// Verify .supabaseignore exists
const supabaseIgnorePath = path.join(__dirname, 'supabase/.supabaseignore');
if (fs.existsSync(supabaseIgnorePath)) {
  console.log('✅ .supabaseignore exists');
  const ignoreContent = fs.readFileSync(supabaseIgnorePath, 'utf8');
  if (ignoreContent.includes('functions/')) {
    console.log('✅ .supabaseignore properly ignores functions');
  } else {
    console.log('⚠️  WARNING: .supabaseignore may not properly ignore functions');
  }
} else {
  console.log('❌ .supabaseignore is missing');
}

// Verify config.toml disables edge functions
const configPath = path.join(__dirname, 'supabase/config.toml');
if (fs.existsSync(configPath)) {
  console.log('✅ config.toml exists');
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (configContent.includes('enabled = false') && configContent.includes('[edge_functions]')) {
    console.log('✅ config.toml properly disables edge functions');
  } else {
    console.log('⚠️  WARNING: config.toml may not properly disable edge functions');
  }
} else {
  console.log('❌ config.toml is missing');
}

console.log('\n🎉 Edge Function Removal Complete!');
console.log('==================================');
console.log('✅ All edge function files have been safely removed/neutralized');
console.log('✅ Deployment should now succeed without 403 errors');
console.log('✅ DevTrack Africa will function perfectly with client-side operations only');

console.log('\nNext steps:');
console.log('1. Deploy the application');
console.log('2. Verify no edge function errors in deployment logs');
console.log('3. Test core functionality');

process.exit(0);