import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, AlertTriangle, Database, Copy, ExternalLink, RefreshCw, ArrowRight, User } from 'lucide-react';
import { testDatabaseConnection } from '../utils/database-service';

interface DatabaseSetupHelperProps {
  onComplete?: () => void;
}

export default function DatabaseSetupHelper({ onComplete }: DatabaseSetupHelperProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [copied, setCopied] = useState(false);
  const [setupStep, setSetupStep] = useState<'instructions' | 'testing' | 'success'>('instructions');

  const testConnection = async () => {
    setIsTestingConnection(true);
    setSetupStep('testing');
    
    try {
      const isConnected = await testDatabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
      
      if (isConnected) {
        setSetupStep('success');
        if (onComplete) {
          setTimeout(onComplete, 1500); // Give user time to see success message
        }
      } else {
        setSetupStep('instructions');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setSetupStep('instructions');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const sqlScript = `-- DevTrack Africa - Complete Database Setup with Auto Profile Creation
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for storing user profiles
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.projects (
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
CREATE TABLE IF NOT EXISTS public.tasks (
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

-- Create posts table for community features
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'text',
    tags TEXT[],
    tech_stack TEXT[],
    visibility TEXT NOT NULL DEFAULT 'public',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL DEFAULT 'info',
    action_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle user profile creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all public profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for projects table
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view public projects" ON public.projects FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for tasks table
CREATE POLICY "Users can view tasks in accessible projects" ON public.tasks FOR SELECT USING (
    project_id IN (
        SELECT id FROM public.projects 
        WHERE user_id = auth.uid() 
        OR visibility = 'public'
    )
);
CREATE POLICY "Users can insert tasks in own projects" ON public.tasks FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update tasks in accessible projects" ON public.tasks FOR UPDATE USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete tasks in own projects" ON public.tasks FOR DELETE USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- RLS Policies for posts table
CREATE POLICY "Users can view public posts" ON public.posts FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for notifications table
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Confirm setup completion
SELECT 'DevTrack Africa database setup completed successfully! Auto-profile creation enabled.' AS status;`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (setupStep === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-800">Database Setup Complete!</h1>
          <p className="text-green-700">
            All database tables have been successfully created and verified. 
            You can now use all features of DevTrack Africa.
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            🎉 Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (setupStep === 'testing') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold">Verifying Database Setup</h1>
          <p className="text-muted-foreground">
            Testing connection and checking for required tables...
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            This may take a few moments. Please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Database className="w-7 h-7" />
          Database Setup Required
        </h1>
        <p className="text-muted-foreground">
          Your database tables need to be created before you can use DevTrack Africa
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">Database Connected</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">Ready</Badge>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive">Database Tables Missing</span>
                  <Badge variant="destructive">Setup Required</Badge>
                </>
              )}
              {connectionStatus === 'unknown' && (
                <>
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Status Unknown</span>
                  <Badge variant="outline">Test Needed</Badge>
                </>
              )}
            </div>
            
            <Button 
              onClick={testConnection} 
              disabled={isTestingConnection}
              variant="outline"
            >
              {isTestingConnection ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>

          {connectionStatus === 'connected' && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Perfect! Your database is properly set up. All required tables are available.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Your database tables are missing. Please follow the setup instructions below to create them.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick">Quick Setup</TabsTrigger>
          <TabsTrigger value="guide">Step-by-Step Guide</TabsTrigger>
          <TabsTrigger value="tester">Profile Tester</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Database Setup</CardTitle>
              <CardDescription>
                Copy the SQL script below and run it in your Supabase SQL Editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium">SQL Setup Script</label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Script'}
                  </Button>
                </div>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64 border">
                    <code>{sqlScript}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-blue-900">Quick Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Copy the SQL script above (click "Copy Script")</li>
                  <li>Open your Supabase dashboard in a new tab</li>
                  <li>Go to SQL Editor → New Query</li>
                  <li>Paste the script and click "Run"</li>
                  <li>Come back here and click "Test Connection"</li>
                </ol>
              </div>

              <Button 
                className="w-full" 
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Setup Guide</CardTitle>
              <CardDescription>
                Complete instructions for setting up your database tables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge variant="outline">1</Badge>
                    Access Supabase Dashboard
                  </h4>
                  <p className="text-sm text-muted-foreground pl-8">
                    Go to your Supabase project dashboard at <code>supabase.com/dashboard</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge variant="outline">2</Badge>
                    Open SQL Editor
                  </h4>
                  <p className="text-sm text-muted-foreground pl-8">
                    In the left sidebar, click on "SQL Editor" → "New Query"
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge variant="outline">3</Badge>
                    Run the SQL Script
                  </h4>
                  <p className="text-sm text-muted-foreground pl-8">
                    Copy the SQL script from the "Quick Setup" tab, paste it into the SQL Editor, and click "Run"
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge variant="outline">4</Badge>
                    Verify Setup
                  </h4>
                  <p className="text-sm text-muted-foreground pl-8">
                    Come back to this page and click "Test Connection" to verify everything is working
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Important:</strong> Make sure you're logged into the correct Supabase project. 
                  The script will create tables for users, projects, tasks, posts, notifications, and project likes.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Required Tables:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Badge variant="outline">users</Badge>
                  <Badge variant="outline">projects</Badge>
                  <Badge variant="outline">tasks</Badge>
                  <Badge variant="outline">posts</Badge>
                  <Badge variant="outline">notifications</Badge>
                  <Badge variant="outline">project_likes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tester" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Auto-Creation Tester</CardTitle>
              <CardDescription>
                Test and verify that automatic profile creation is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What this tests:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                    <li>Database connection and table existence</li>
                    <li>Automatic profile creation triggers and functions</li>
                    <li>User profile data recording</li>
                    <li>Current authentication status and profile loading</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">How it works:</h4>
                  <p className="text-sm text-amber-800">
                    When users sign up through Supabase Auth, a database trigger automatically creates 
                    their profile in the users table using their registration data. This ensures every 
                    user has a complete profile without manual intervention.
                  </p>
                </div>

                <Button 
                  onClick={() => window.open('/profile-tester', '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  Open Profile Auto-Creation Tester
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={testConnection} disabled={isTestingConnection}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Test Connection
        </Button>
        
        <Button onClick={testConnection} disabled={isTestingConnection}>
          {isTestingConnection ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>If you're having trouble with the setup:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Make sure you have admin access to your Supabase project</li>
            <li>Check that your Supabase project is active and properly configured</li>
            <li>Verify your internet connection and try again</li>
            <li>If tables already exist, the script will skip creating them</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}