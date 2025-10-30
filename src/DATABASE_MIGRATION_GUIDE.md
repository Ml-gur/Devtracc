# DevTrack Africa Database Migration Guide

## Overview

This guide helps you migrate your DevTrack Africa database from the old schema to the new enhanced schema that supports all frontend features including project categories, start/end dates, GitHub/live URLs, images, likes, and comments.

## What's New in the Enhanced Schema

The new schema adds the following features:

### Projects Table Enhancements
- **category**: Project categories (web-app, mobile-app, api, library, game, ai-ml, blockchain, other)
- **start_date** & **end_date**: Project timeline tracking
- **github_url** & **live_url**: Repository and demo links
- **images**: Array of project images
- **likes**: Like count (automatically maintained)
- **is_public**: Visibility control

### New Tables
- **project_comments**: User comments on projects
- **activities**: Activity tracking for user actions
- **project_likes**: Like tracking with automatic count updates

## Migration Options

### Option 1: Fresh Installation (Recommended for New Projects)

If you're starting fresh or can recreate your data:

1. **Drop existing tables** (⚠️ This will delete all data):
```sql
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

2. **Run the updated setup script**:
   - Copy the entire contents of `/database-setup.sql`
   - Paste into your Supabase SQL Editor
   - Execute the script

### Option 2: Migration Script (Preserves Existing Data)

If you have existing data you want to keep:

1. **Run the migration script**:
   - Copy the entire contents of `/database-migration.sql`
   - Paste into your Supabase SQL Editor
   - Execute the script

2. **Verify the migration**:
```sql
-- Check that new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Check that new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('project_comments', 'activities', 'project_likes');
```

## Post-Migration Steps

### 1. Update Default Values (Optional)

Set default categories for existing projects:
```sql
UPDATE projects 
SET category = 'web-app' 
WHERE category IS NULL;
```

Set default start dates for existing projects:
```sql
UPDATE projects 
SET start_date = created_at::date 
WHERE start_date IS NULL;
```

### 2. Test the Application

1. **Restart your application** to pick up the new schema
2. **Create a new project** with all fields to test functionality
3. **Try liking a project** to test the automatic like counting
4. **Add comments** to test the commenting system

### 3. Verify Database Functions

Test that the automatic like counting works:
```sql
-- Insert a test like
INSERT INTO project_likes (project_id, user_id) 
SELECT id, (SELECT id FROM users LIMIT 1) 
FROM projects LIMIT 1;

-- Check that the likes count updated
SELECT id, title, likes FROM projects WHERE likes > 0;
```

## Troubleshooting

### Common Issues

**Issue**: "column does not exist" errors
**Solution**: Ensure you've run the migration script completely

**Issue**: RLS policy errors
**Solution**: Check that all new policies were created:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('project_comments', 'activities', 'project_likes');
```

**Issue**: Frontend still showing old data structure
**Solution**: The updated database service automatically maps between old and new schemas

### Rollback (If Needed)

If you need to rollback the migration:
```sql
-- Remove new columns (⚠️ This will lose new data)
ALTER TABLE projects 
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS github_url,
DROP COLUMN IF EXISTS live_url,
DROP COLUMN IF EXISTS images,
DROP COLUMN IF EXISTS likes,
DROP COLUMN IF EXISTS is_public;

-- Drop new tables (⚠️ This will lose all data in these tables)
DROP TABLE IF EXISTS project_likes CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS project_comments CASCADE;
```

## Verification Checklist

After migration, verify:

- [ ] All existing projects are still visible
- [ ] New projects can be created with all fields
- [ ] Project categories work in the form
- [ ] Start/end dates are saved correctly
- [ ] GitHub and live URLs are saved
- [ ] Project images can be added
- [ ] Like functionality works
- [ ] Comments can be added to projects
- [ ] Public/private visibility works

## Database Schema Reference

### Updated Projects Table
```sql
projects (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  category TEXT CHECK (category IN ('web-app', 'mobile-app', 'api', 'library', 'game', 'ai-ml', 'blockchain', 'other')),
  status TEXT CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  tech_stack TEXT[],
  start_date DATE,
  end_date DATE,
  github_url TEXT,
  live_url TEXT,
  images TEXT[],
  likes INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  -- Legacy fields for backward compatibility
  timeline DATE,
  cover_image_url TEXT,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Support

If you encounter issues during migration:

1. Check the browser console for detailed error messages
2. Verify your Supabase connection is working
3. Ensure all SQL scripts ran without errors
4. Check that your user has the necessary permissions

The application includes fallback handling for partially migrated databases, so basic functionality should continue to work even if some advanced features aren't available.