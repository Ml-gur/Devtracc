# DevTrack Africa Schema Fix

If you're getting "Could not find column" errors when creating projects, your database schema needs to be updated. 

## Quick Fix

Run this SQL command in your Supabase SQL Editor to add any missing columns:

```sql
-- Add missing columns to projects table if they don't exist
DO $$ 
BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='category') THEN
    ALTER TABLE projects ADD COLUMN category TEXT 
      CHECK (category IN ('web-app', 'mobile-app', 'api', 'library', 'game', 'ai-ml', 'blockchain', 'other'));
    UPDATE projects SET category = 'other' WHERE category IS NULL;
  END IF;
  
  -- Add other potentially missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='start_date') THEN
    ALTER TABLE projects ADD COLUMN start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='end_date') THEN
    ALTER TABLE projects ADD COLUMN end_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='github_url') THEN
    ALTER TABLE projects ADD COLUMN github_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='live_url') THEN
    ALTER TABLE projects ADD COLUMN live_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='images') THEN
    ALTER TABLE projects ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='likes') THEN
    ALTER TABLE projects ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='is_public') THEN
    ALTER TABLE projects ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='progress_percentage') THEN
    ALTER TABLE projects ADD COLUMN progress_percentage INTEGER DEFAULT 0;
  END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

## Alternative: Complete Database Reset

If you prefer to start fresh, you can also run the complete `database-setup.sql` script which includes all the required tables and columns.

## What This Fixes

- **Category column missing**: Allows you to categorize projects (web-app, mobile-app, etc.)
- **Date columns missing**: Enables start_date and end_date tracking
- **URL columns missing**: Allows GitHub and live demo links
- **Image support**: Enables project image galleries
- **Social features**: Adds likes and public/private project settings
- **Progress tracking**: Enables progress percentage tracking

After running this script, project creation should work without errors.