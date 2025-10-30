-- DevTrack Africa Database Setup (Alternative with backwards compatibility)
-- Use this if you're having column naming issues

-- 1. Drop existing tables if needed (CAUTION: This will delete data!)
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS projects;
-- DROP TABLE IF EXISTS users;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT,
  country TEXT,
  phone TEXT,
  tech_stack TEXT[],
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects table with both creator_id and user_id for compatibility
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Alternative column name
  tech_stack TEXT[],
  timeline DATE,
  cover_image_url TEXT,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add trigger to sync creator_id and user_id
CREATE OR REPLACE FUNCTION sync_project_user_ids()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.creator_id IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := NEW.creator_id;
  ELSIF NEW.user_id IS NOT NULL AND NEW.creator_id IS NULL THEN
    NEW.creator_id := NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_project_user_ids_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION sync_project_user_ids();

-- 4. Tasks table (for Kanban board)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
  assigned_to UUID REFERENCES users(id),
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Posts table (for community feed)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT CHECK (post_type IN ('progress_update', 'task_completed', 'help_request')) NOT NULL,
  attachments TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for public read access and user write access
DROP POLICY IF EXISTS "Public users can view all users" ON users;
CREATE POLICY "Public users can view all users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view all projects" ON projects;
CREATE POLICY "Public can view all projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own projects" ON projects;
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (
  auth.uid() = creator_id OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (
  auth.uid() = creator_id OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can view all posts" ON posts;
CREATE POLICY "Users can view all posts" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own posts" ON posts;
CREATE POLICY "Users can create own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage project tasks" ON tasks;
CREATE POLICY "Users can manage project tasks" ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND (projects.creator_id = auth.uid() OR projects.user_id = auth.uid()))
);

-- All done! Your DevTrack Africa database is now set up with compatibility for both naming conventions.