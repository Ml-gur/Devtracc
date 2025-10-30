-- DevTrack Africa - Final Optimized Database Setup
-- This script includes all performance optimizations and missing indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for storing user profiles
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    country TEXT,
    phone TEXT,
    title TEXT,
    tech_stack TEXT[], -- Array of technologies
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    priority TEXT NOT NULL DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tags TEXT[],
    tech_stack TEXT[],
    repository_url TEXT,
    live_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'private',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES public.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    time_estimate INTEGER, -- in minutes
    time_spent INTEGER DEFAULT 0, -- in minutes
    tags TEXT[],
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaboration table for project sharing
CREATE TABLE public.collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
    invited_by UUID REFERENCES public.users(id),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create posts table for community features
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'project', 'progress', 'question', 'showcase', 'help'
    tags TEXT[],
    tech_stack TEXT[],
    visibility TEXT NOT NULL DEFAULT 'public',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id),
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Create messages table for messaging system
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'project', 'group'
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    action_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comprehensive indexes for optimal performance
-- Primary lookup indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Foreign key covering indexes for performance
CREATE INDEX idx_collaborations_project_id ON public.collaborations(project_id);
CREATE INDEX idx_collaborations_user_id ON public.collaborations(user_id);
CREATE INDEX idx_collaborations_invited_by ON public.collaborations(invited_by);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_comment_id ON public.likes(comment_id);
CREATE INDEX idx_messages_project_id ON public.messages(project_id);
CREATE INDEX idx_posts_project_id ON public.posts(project_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);

-- Function to handle user profile creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, country, phone, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'country',
        NEW.raw_user_meta_data->>'phone',
        NEW.created_at,
        NEW.updated_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user profile updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Optimized RLS Policies for users table (using subquery for performance)
CREATE POLICY "Users can view all public profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = (select auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (id = (select auth.uid()));

-- Optimized RLS Policies for projects table
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can view public projects" ON public.projects FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view shared projects" ON public.projects FOR SELECT USING (
    id IN (SELECT project_id FROM public.collaborations WHERE user_id = (select auth.uid()))
);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (user_id = (select auth.uid()));

-- Optimized RLS Policies for tasks table
CREATE POLICY "Users can view tasks in accessible projects" ON public.tasks FOR SELECT USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE user_id = (select auth.uid())
        OR visibility = 'public'
        OR id IN (SELECT project_id FROM public.collaborations WHERE user_id = (select auth.uid()))
    )
);
CREATE POLICY "Users can insert tasks in own projects" ON public.tasks FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = (select auth.uid()))
);
CREATE POLICY "Users can update tasks in accessible projects" ON public.tasks FOR UPDATE USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE user_id = (select auth.uid())
        OR id IN (SELECT project_id FROM public.collaborations WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor'))
    )
);
CREATE POLICY "Users can delete tasks in own projects" ON public.tasks FOR DELETE USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = (select auth.uid()))
);

-- Optimized RLS Policies for collaborations table
CREATE POLICY "Users can view collaborations for accessible projects" ON public.collaborations FOR SELECT USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE user_id = (select auth.uid())
        OR id IN (SELECT project_id FROM public.collaborations WHERE user_id = (select auth.uid()))
    )
);
CREATE POLICY "Project owners can manage collaborations" ON public.collaborations FOR ALL USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = (select auth.uid()))
);
CREATE POLICY "Users can accept their own invitations" ON public.collaborations FOR UPDATE USING (user_id = (select auth.uid()));

-- Optimized RLS Policies for posts table
CREATE POLICY "Users can view public posts" ON public.posts FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (user_id = (select auth.uid()));

-- Optimized RLS Policies for comments table
CREATE POLICY "Users can view comments on accessible posts" ON public.comments FOR SELECT USING (
    post_id IN (
        SELECT id FROM public.posts
        WHERE visibility = 'public' OR user_id = (select auth.uid())
    )
);
CREATE POLICY "Users can insert comments on accessible posts" ON public.comments FOR INSERT WITH CHECK (
    user_id = (select auth.uid()) AND
    post_id IN (SELECT id FROM public.posts WHERE visibility = 'public')
);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (user_id = (select auth.uid()));

-- Optimized RLS Policies for likes table
CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.likes FOR ALL USING (user_id = (select auth.uid()));

-- Optimized RLS Policies for messages table
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
    sender_id = (select auth.uid()) OR recipient_id = (select auth.uid())
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = (select auth.uid()));
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (sender_id = (select auth.uid()));

-- Optimized RLS Policies for notifications table
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = (select auth.uid()));

-- Create functions for common operations
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    country TEXT,
    phone TEXT,
    title TEXT,
    tech_stack TEXT[],
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.full_name, u.email, u.country, u.phone, u.title, u.tech_stack, u.bio, u.profile_image_url, u.created_at, u.updated_at
    FROM public.users u
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
    user_uuid UUID,
    new_full_name TEXT DEFAULT NULL,
    new_country TEXT DEFAULT NULL,
    new_phone TEXT DEFAULT NULL,
    new_title TEXT DEFAULT NULL,
    new_tech_stack TEXT[] DEFAULT NULL,
    new_bio TEXT DEFAULT NULL,
    new_profile_image_url TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    country TEXT,
    phone TEXT,
    title TEXT,
    tech_stack TEXT[],
    bio TEXT,
    profile_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    UPDATE public.users
    SET
        full_name = COALESCE(new_full_name, full_name),
        country = COALESCE(new_country, country),
        phone = COALESCE(new_phone, phone),
        title = COALESCE(new_title, title),
        tech_stack = COALESCE(new_tech_stack, tech_stack),
        bio = COALESCE(new_bio, bio),
        profile_image_url = COALESCE(new_profile_image_url, profile_image_url),
        updated_at = NOW()
    WHERE users.id = user_uuid AND users.id = (select auth.uid());

    RETURN QUERY
    SELECT u.id, u.full_name, u.email, u.country, u.phone, u.title, u.tech_stack, u.bio, u.profile_image_url, u.updated_at
    FROM public.users u
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new project
CREATE OR REPLACE FUNCTION public.create_project(
    project_title TEXT,
    project_description TEXT DEFAULT NULL,
    project_status TEXT DEFAULT 'planning',
    project_priority TEXT DEFAULT 'medium',
    project_start_date DATE DEFAULT NULL,
    project_end_date DATE DEFAULT NULL,
    project_tags TEXT[] DEFAULT NULL,
    project_tech_stack TEXT[] DEFAULT NULL,
    project_visibility TEXT DEFAULT 'private'
)
RETURNS UUID AS $$
DECLARE
    new_project_id UUID;
BEGIN
    INSERT INTO public.projects (
        user_id, title, description, status, priority, start_date, end_date,
        tags, tech_stack, visibility
    )
    VALUES (
        (select auth.uid()), project_title, project_description, project_status,
        project_priority, project_start_date, project_end_date,
        project_tags, project_tech_stack, project_visibility
    )
    RETURNING id INTO new_project_id;

    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Confirm setup completion
SELECT 'DevTrack Africa final optimized database setup completed successfully!' AS status;
