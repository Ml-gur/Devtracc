#!/usr/bin/env node

/**
 * Edge Functions Cleanup Script for DevTrack Africa
 * Removes all Edge Function files to prevent 403 deployment errors
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 DevTrack Africa - Edge Functions Cleanup');
console.log('============================================\n');

const filesToRemove = [
  'supabase/functions/server/index.tsx',
  'supabase/functions/server/index.ts', 
  'supabase/functions/server/kv_store.tsx',
  'supabase/functions/server/kv_store.ts',
  'supabase/functions/server/deno.json',
  'supabase/functions/server/import_map.json'
];

let removedCount = 0;
let notFoundCount = 0;

console.log('Removing Edge Function files...\n');

filesToRemove.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed: ${filePath}`);
      removedCount++;
    } catch (error) {
      console.log(`❌ Failed to remove: ${filePath} - ${error.message}`);
    }
  } else {
    console.log(`ℹ️  Not found: ${filePath}`);
    notFoundCount++;
  }
});

// Create the documentation file to indicate files have been removed
const removedDocPath = path.join(__dirname, 'supabase/functions/server/REMOVED.md');
if (!fs.existsSync(removedDocPath)) {
  const docContent = `# Edge Functions Removed

All Edge Function files have been removed from this directory to prevent 403 deployment errors.

## Files That Were Removed
- \`index.tsx\` - Main Edge Function file
- \`kv_store.tsx\` - KV Store utilities  
- Any other TypeScript/JavaScript files

## Why They Were Removed
- These files were causing 403 deployment errors
- DevTrack Africa works perfectly with client-side operations only
- No server-side functions are needed for the application

## Current Architecture  
The application now uses:
- ✅ Client-side Supabase authentication
- ✅ Standard database operations
- ✅ No Edge Functions or server-side code

This approach is more reliable and deploys without permission issues.

## Deployment Status
✅ Ready for deployment without Edge Function errors
`;

  try {
    fs.writeFileSync(removedDocPath, docContent);
    console.log(`✅ Created documentation: supabase/functions/server/REMOVED.md`);
  } catch (error) {
    console.log(`❌ Failed to create documentation: ${error.message}`);
  }
}

console.log('\n📊 Cleanup Summary');
console.log('==================');
console.log(`✅ Files removed: ${removedCount}`);
console.log(`ℹ️  Files not found: ${notFoundCount}`);

if (removedCount > 0) {
  console.log('\n🎉 Cleanup completed successfully!');
  console.log('Edge Function files have been removed.');
} else {
  console.log('\n✅ No Edge Function files found to remove.');
}

console.log('\nNext steps:');
console.log('1. Run pre-deploy-check.js to verify cleanup');
console.log('2. Deploy the application'); 
console.log('3. The 403 Edge Function error should be resolved');

console.log('\n🚀 DevTrack Africa is ready for client-side only deployment!');