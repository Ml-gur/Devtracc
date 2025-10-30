-- DevTrack Africa Database Migration Script
-- Run this script in your Supabase SQL Editor to add missing columns and align with frontend types

-- Migration 1: Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('web-app', 'mobile-app', 'api', 'library', 'game', 'ai-ml', 'blockchain', 'other')),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS live_url TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Migration 2: Update existing status column to match ProjectStatus enum
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold', 'cancelled'));

-- Update any existing 'active' status to 'in-progress'
UPDATE projects SET status = 'in-progress' WHERE status = 'active';

-- Migration 3: Create comments table for project comments
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration 4: Create activities table for tracking user activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('project_created', 'project_updated', 'project_completed', 'comment_added', 'like_added')) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration 5: Create project_likes table for tracking likes
CREATE TABLE IF NOT EXISTS project_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Migration 6: Enable RLS on new tables
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;

-- Migration 7: Create policies for new tables

-- Comments policies
DROP POLICY IF EXISTS "Users can view all comments" ON project_comments;
CREATE POLICY "Users can view all comments" ON project_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON project_comments;
CREATE POLICY "Users can create comments" ON project_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON project_comments;
CREATE POLICY "Users can update own comments" ON project_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON project_comments;
CREATE POLICY "Users can delete own comments" ON project_comments FOR DELETE USING (auth.uid() = user_id);

-- Activities policies
DROP POLICY IF EXISTS "Users can view all activities" ON activities;
CREATE POLICY "Users can view all activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own activities" ON activities;
CREATE POLICY "Users can create own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes policies
DROP POLICY IF EXISTS "Users can view all likes" ON project_likes;
CREATE POLICY "Users can view all likes" ON project_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON project_likes;
CREATE POLICY "Users can manage own likes" ON project_likes FOR ALL USING (auth.uid() = user_id);

-- Migration 8: Create function to update likes count
CREATE OR REPLACE FUNCTION update_project_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects 
    SET likes = (SELECT COUNT(*) FROM project_likes WHERE project_id = NEW.project_id)
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects 
    SET likes = (SELECT COUNT(*) FROM project_likes WHERE project_id = OLD.project_id)
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Migration 9: Create trigger to automatically update likes count
DROP TRIGGER IF EXISTS trigger_update_project_likes_count ON project_likes;
CREATE TRIGGER trigger_update_project_likes_count
  AFTER INSERT OR DELETE ON project_likes
  FOR EACH ROW EXECUTE FUNCTION update_project_likes_count();

-- Migration 10: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migration 11: Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration complete! 
-- Your database now has all the columns and relationships needed for the frontend Project type.