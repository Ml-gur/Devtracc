-- DevTrack Africa - Task Status Persistence Fix
-- This script fixes the task status persistence issues by adding proper constraints and updating the schema

-- First, let's add CHECK constraints to ensure only valid status values are stored
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('todo', 'in_progress', 'completed'));

-- Add CHECK constraint for priority values
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('low', 'medium', 'high'));

-- Update any existing invalid status values to 'todo' (default)
UPDATE public.tasks 
SET status = 'todo' 
WHERE status NOT IN ('todo', 'in_progress', 'completed');

-- Update any existing invalid priority values to 'medium' (default)
UPDATE public.tasks 
SET priority = 'medium' 
WHERE priority NOT IN ('low', 'medium', 'high');

-- Add missing columns that might be needed for proper task tracking
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
ADD COLUMN IF NOT EXISTS actual_hours INTEGER;

-- Create indexes for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON public.tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON public.tasks(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_started_at ON public.tasks(started_at) WHERE started_at IS NOT NULL;

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_tasks_updated_at();

-- Add RLS (Row Level Security) policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tasks for projects they own or collaborate on
CREATE POLICY "Users can view tasks for their projects" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborations 
            WHERE collaborations.project_id = tasks.project_id 
            AND collaborations.user_id = auth.uid()
        )
    );

-- Policy: Users can insert tasks for projects they own or collaborate on
CREATE POLICY "Users can create tasks for their projects" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborations 
            WHERE collaborations.project_id = tasks.project_id 
            AND collaborations.user_id = auth.uid()
            AND collaborations.role IN ('owner', 'editor')
        )
    );

-- Policy: Users can update tasks for projects they own or collaborate on
CREATE POLICY "Users can update tasks for their projects" ON public.tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborations 
            WHERE collaborations.project_id = tasks.project_id 
            AND collaborations.user_id = auth.uid()
            AND collaborations.role IN ('owner', 'editor')
        )
    );

-- Policy: Users can delete tasks for projects they own or collaborate on
CREATE POLICY "Users can delete tasks for their projects" ON public.tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborations 
            WHERE collaborations.project_id = tasks.project_id 
            AND collaborations.user_id = auth.uid()
            AND collaborations.role IN ('owner', 'editor')
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.tasks TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
