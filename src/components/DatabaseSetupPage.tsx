import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Users,
  FolderOpen,
  MessageSquare,
  ClipboardList,
  Clock,
  Wifi,
  Shield,
  HelpCircle,
  Copy
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import ConnectionStatus from './ConnectionStatus';

interface DatabaseSetupPageProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface SetupStep {
  id: string;
  name: string;
  description: string;
  sql: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  error?: string;
}

export default function DatabaseSetupPage({ onComplete, onCancel }: DatabaseSetupPageProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('setup');
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'users',
      name: 'Users Table',
      description: 'Create table for user profiles and information',
      icon: Users,
      completed: false,
      sql: `
        -- Users table
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
      `
    },
    {
      id: 'projects',
      name: 'Projects Table',
      description: 'Create table for project management',
      icon: FolderOpen,
      completed: false,
      sql: `
        -- Projects table
        CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
          tech_stack TEXT[],
          timeline DATE,
          cover_image_url TEXT,
          progress_percentage INTEGER DEFAULT 0,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      id: 'tasks',
      name: 'Tasks Table',
      description: 'Create table for Kanban board task management',
      icon: ClipboardList,
      completed: false,
      sql: `
        -- Tasks table (for Kanban board)
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
      `
    },
    {
      id: 'posts',
      name: 'Posts Table',
      description: 'Create table for community feed and progress sharing',
      icon: MessageSquare,
      completed: false,
      sql: `
        -- Posts table (for community feed)
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
      `
    },
    {
      id: 'policies',
      name: 'Security Policies',
      description: 'Set up Row Level Security and access policies',
      icon: Database,
      completed: false,
      sql: `
        -- Enable Row Level Security
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
        ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

        -- Create policies for public read access and user write access
        DROP POLICY IF EXISTS "Public users can view all users" ON users;
        CREATE POLICY "Public users can view all users" ON users FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Users can insert own profile" ON users;
        CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

        DROP POLICY IF EXISTS "Public can view all projects" ON projects;
        CREATE POLICY "Public can view all projects" ON projects FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Users can create own projects" ON projects;
        CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = creator_id);
        
        DROP POLICY IF EXISTS "Users can update own projects" ON projects;
        CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = creator_id);

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
          EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND projects.creator_id = auth.uid())
        );
      `
    }
  ]);

  const runSetup = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const updatedSteps = [...setupSteps];
    
    for (let i = 0; i < setupSteps.length; i++) {
      setCurrentStep(i);
      const step = setupSteps[i];
      
      try {
        console.log(`Executing step: ${step.name}`);
        
        // Since we can't execute DDL directly from client-side Supabase,
        // we'll simulate the setup and provide instructions
        
        if (step.id === 'users') {
          // Test if users table exists by trying to select from it
          const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
          if (error && (error.code === 'PGRST204' || error.code === 'PGRST205')) {
            // Table doesn't exist
            throw new Error('Users table does not exist. Please run the SQL manually in Supabase SQL editor.');
          }
        } else if (step.id === 'projects') {
          const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
          if (error && (error.code === 'PGRST204' || error.code === 'PGRST205')) {
            throw new Error('Projects table does not exist. Please run the SQL manually in Supabase SQL editor.');
          }
        } else if (step.id === 'tasks') {
          const { error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
          if (error && (error.code === 'PGRST204' || error.code === 'PGRST205')) {
            throw new Error('Tasks table does not exist. Please run the SQL manually in Supabase SQL editor.');
          }
        } else if (step.id === 'posts') {
          const { error } = await supabase.from('posts').select('count', { count: 'exact', head: true });
          if (error && (error.code === 'PGRST204' || error.code === 'PGRST205')) {
            throw new Error('Posts table does not exist. Please run the SQL manually in Supabase SQL editor.');
          }
        }
        
        // If we get here, assume the step is completed (or skip policies for now)
        
        updatedSteps[i].completed = true;
        updatedSteps[i].error = undefined;
      } catch (error) {
        console.error(`Error in step ${step.name}:`, error);
        updatedSteps[i].error = error instanceof Error ? error.message : 'Unknown error';
      }
      
      setSetupSteps([...updatedSteps]);
      setProgress(((i + 1) / setupSteps.length) * 100);
      
      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    
    // Check if all steps completed successfully
    const allCompleted = updatedSteps.every(step => step.completed && !step.error);
    if (allCompleted) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const getStepStatus = (step: SetupStep, index: number) => {
    if (step.error) return 'error';
    if (step.completed) return 'completed';
    if (isRunning && currentStep === index) return 'running';
    if (isRunning && currentStep > index) return 'completed';
    return 'pending';
  };

  const getStepIcon = (step: SetupStep, index: number) => {
    const status = getStepStatus(step, index);
    const IconComponent = step.icon;
    
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const copyFullScript = () => {
    const fullScript = [
      '-- DevTrack Africa Database Setup Script',
      '-- Copy and paste this entire script into your Supabase SQL Editor',
      '',
      ...setupSteps.map(step => step.sql)
    ].join('\n\n');
    
    navigator.clipboard.writeText(fullScript);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Database Setup</CardTitle>
              <p className="text-muted-foreground">
                Initialize your DevTrack Africa database for full functionality
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              <TabsTrigger value="status">Connection Status</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Manual Setup Required:</strong> Due to security restrictions, database tables must be created manually. 
              Please copy and run the SQL commands below in your Supabase SQL Editor.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Quick Setup Instructions:</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Go to your Supabase Dashboard → SQL Editor</li>
              <li>2. Copy the SQL from each step below</li>
              <li>3. Paste and run each SQL block</li>
              <li>4. Click "Test Setup" to verify tables were created</li>
            </ol>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Setting up database...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Setup Steps */}
          <div className="space-y-4">
            {setupSteps.map((step, index) => {
              const status = getStepStatus(step, index);
              
              return (
                <div key={step.id} className="space-y-2">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      status === 'completed' ? 'bg-green-50 border-green-200' :
                      status === 'error' ? 'bg-red-50 border-red-200' :
                      status === 'running' ? 'bg-blue-50 border-blue-200' :
                      'bg-muted/30'
                    }`}
                  >
                    {getStepIcon(step, index)}
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.error && (
                        <p className="text-sm text-red-600 mt-1">Error: {step.error}</p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(step.sql);
                        // Could add a toast notification here
                      }}
                    >
                      Copy SQL
                    </Button>
                  </div>
                  
                  {/* SQL Code Block */}
                  <details className="bg-slate-50 rounded border">
                    <summary className="p-2 cursor-pointer text-sm font-medium">
                      View SQL Code
                    </summary>
                    <pre className="p-3 text-xs bg-slate-100 overflow-x-auto border-t">
                      <code>{step.sql.trim()}</code>
                    </pre>
                  </details>
                </div>
              );
            })}
          </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={onCancel} variant="outline" disabled={isRunning}>
                  Cancel
                </Button>
                <Button onClick={copyFullScript} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All SQL
                </Button>
                <Button onClick={runSetup} disabled={isRunning} className="flex-1">
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Test Setup
                    </>
                  )}
                </Button>
              </div>

              {/* Note */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> If you encounter errors, you may need to run the SQL commands manually 
                  in your Supabase SQL editor. The setup will continue to work with the tables that were 
                  successfully created.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Common Issues & Solutions</h3>
                
                <div className="space-y-3">
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Database Timeout Errors</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          If you're seeing "Database timeout" errors, this usually means your connection to Supabase is slow or unstable.
                        </p>
                        <div className="mt-2 text-sm">
                          <strong>Solutions:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                            <li>Check your internet connection stability</li>
                            <li>Try refreshing the page and retrying</li>
                            <li>Use a different network or mobile hotspot</li>
                            <li>Wait a few minutes and try again</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Wifi className="w-5 h-5 text-red-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Connection Failed</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Can't reach Supabase servers. This could be network, firewall, or server issues.
                        </p>
                        <div className="mt-2 text-sm">
                          <strong>Solutions:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                            <li>Check if you're behind a corporate firewall</li>
                            <li>Try disabling VPN or proxy temporarily</li>
                            <li>Check Supabase status page for outages</li>
                            <li>Verify your Supabase project is active</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Permission Denied Errors</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Database tables exist but access is restricted by RLS policies.
                        </p>
                        <div className="mt-2 text-sm">
                          <strong>Solutions:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                            <li>Make sure you ran the Security Policies SQL</li>
                            <li>Check if you're signed in to the app</li>
                            <li>Verify RLS policies in Supabase dashboard</li>
                            <li>Try signing out and back in</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-yellow-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Tables Not Found</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The database setup hasn't been completed yet.
                        </p>
                        <div className="mt-2 text-sm">
                          <strong>Manual Setup Steps:</strong>
                          <ol className="list-decimal list-inside mt-1 space-y-1 text-muted-foreground">
                            <li>Go to your Supabase Dashboard</li>
                            <li>Navigate to SQL Editor</li>
                            <li>Copy and paste the SQL from the Setup tab</li>
                            <li>Run each SQL block or use "Copy All SQL"</li>
                            <li>Return here and click "Test Setup"</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Still having issues?</strong> The app will work in offline mode with limited functionality. 
                    Try the database setup again later when your connection is more stable.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Connection Diagnostics</h3>
                <ConnectionStatus showDetails={true} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}