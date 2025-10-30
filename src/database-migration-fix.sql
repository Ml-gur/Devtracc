-- DevTrack Africa Database Migration - Fix Missing Columns
-- Run this if you get "Could not find column" errors

-- Check if category column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='category') THEN
    ALTER TABLE projects ADD COLUMN category TEXT 
      CHECK (category IN ('web-app', 'mobile-app', 'api', 'library', 'game', 'ai-ml', 'blockchain', 'other'));
    
    -- Set default category for existing projects
    UPDATE projects SET category = 'other' WHERE category IS NULL;
  END IF;
END $$;

-- Check if start_date column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='start_date') THEN
    ALTER TABLE projects ADD COLUMN start_date DATE;
  END IF;
END $$;

-- Check if end_date column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='end_date') THEN
    ALTER TABLE projects ADD COLUMN end_date DATE;
  END IF;
END $$;

-- Check if github_url column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='github_url') THEN
    ALTER TABLE projects ADD COLUMN github_url TEXT;
  END IF;
END $$;

-- Check if live_url column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='live_url') THEN
    ALTER TABLE projects ADD COLUMN live_url TEXT;
  END IF;
END $$;

-- Check if images column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='images') THEN
    ALTER TABLE projects ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Check if likes column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='likes') THEN
    ALTER TABLE projects ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Check if is_public column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='is_public') THEN
    ALTER TABLE projects ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Check if progress_percentage column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='projects' AND column_name='progress_percentage') THEN
    ALTER TABLE projects ADD COLUMN progress_percentage INTEGER DEFAULT 0;
  END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- All done! Your DevTrack Africa database schema has been updated.