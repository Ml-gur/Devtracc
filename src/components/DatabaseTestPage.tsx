import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Users,
  FolderOpen,
  MessageSquare,
  ClipboardList,
  ArrowLeft
} from 'lucide-react';
import { 
  testDatabaseConnection,
  getUserProfile,
  getUserProjects,
  getAllPosts,
  getProjectTasks
} from '../utils/database-service';
import { supabase } from '../utils/supabase/client';

interface DatabaseTestPageProps {
  onBack: () => void;
  currentUser?: any;
}

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DatabaseTestPage({ onBack, currentUser }: DatabaseTestPageProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      name: 'Database Connection',
      status: 'pending',
      message: 'Not tested',
      icon: Database
    },
    {
      name: 'Users Table',
      status: 'pending',
      message: 'Not tested',
      icon: Users
    },
    {
      name: 'Projects Table',
      status: 'pending',
      message: 'Not tested',
      icon: FolderOpen
    },
    {
      name: 'Posts Table',
      status: 'pending',
      message: 'Not tested',
      icon: MessageSquare
    },
    {
      name: 'Tasks Table',
      status: 'pending',
      message: 'Not tested',
      icon: ClipboardList
    }
  ]);

  const runTests = async () => {
    setIsRunning(true);
    const results = [...testResults];

    // Test 1: Database Connection
    try {
      results[0].status = 'pending';
      setTestResults([...results]);
      
      const connected = await testDatabaseConnection();
      if (connected) {
        results[0].status = 'success';
        results[0].message = 'Database connection successful';
      } else {
        results[0].status = 'error';
        results[0].message = 'Database connection failed';
      }
    } catch (error) {
      results[0].status = 'error';
      results[0].message = 'Connection test failed';
    }
    setTestResults([...results]);

    // Test 2: Users Table
    try {
      results[1].status = 'pending';
      setTestResults([...results]);
      
      if (currentUser?.id) {
        const userResult = await getUserProfile(currentUser.id);
        if (userResult.error?.code === 'DB_NOT_AVAILABLE') {
          results[1].status = 'error';
          results[1].message = 'Users table not found';
        } else {
          results[1].status = 'success';
          results[1].message = 'Users table accessible';
        }
      } else {
        // Try to query the table structure
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error && (error.code === 'PGRST204' || error.code === 'PGRST205')) {
          results[1].status = 'error';
          results[1].message = 'Users table not found';
        } else {
          results[1].status = 'success';
          results[1].message = 'Users table exists';
        }
      }
    } catch (error) {
      results[1].status = 'error';
      results[1].message = 'Users table test failed';
    }
    setTestResults([...results]);

    // Test 3: Projects Table
    try {
      results[2].status = 'pending';
      setTestResults([...results]);
      
      if (currentUser?.id) {
        const projectsResult = await getUserProjects(currentUser.id);
        if (projectsResult.error?.code === 'DB_NOT_AVAILABLE') {
          results[2].status = 'error';
          results[2].message = 'Projects table not found';
        } else {
          results[2].status = 'success';
          results[2].message = 'Projects table accessible';
        }
      } else {
        const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
        if (error && (error.code === 'PGRST204' || error.code === 'PGRST205')) {
          results[2].status = 'error';
          results[2].message = 'Projects table not found';
        } else {
          results[2].status = 'success';
          results[2].message = 'Projects table exists';
        }
      }
    } catch (error) {
      results[2].status = 'error';
      results[2].message = 'Projects table test failed';
    }
    setTestResults([...results]);

    // Test 4: Posts Table
    try {
      results[3].status = 'pending';
      setTestResults([...results]);
      
      const postsResult = await getAllPosts();
      if (postsResult.error?.code === 'DB_NOT_AVAILABLE') {
        results[3].status = 'error';
        results[3].message = 'Posts table not found';
      } else {
        results[3].status = 'success';
        results[3].message = 'Posts table accessible';
      }
    } catch (error) {
      results[3].status = 'error';
      results[3].message = 'Posts table test failed';
    }
    setTestResults([...results]);

    // Test 5: Tasks Table
    try {
      results[4].status = 'pending';
      setTestResults([...results]);
      
      const { error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
      if (error && (error.code === 'PGRST204' || error.code === 'PGRST205')) {
        results[4].status = 'error';
        results[4].message = 'Tasks table not found';
      } else {
        results[4].status = 'success';
        results[4].message = 'Tasks table exists';
      }
    } catch (error) {
      results[4].status = 'error';
      results[4].message = 'Tasks table test failed';
    }
    setTestResults([...results]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return isRunning ? 
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> :
          <Database className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return isRunning ? 'bg-blue-50 border-blue-200' : 'bg-muted/30';
    }
  };

  const allTestsPassed = testResults.every(test => test.status === 'success');
  const anyTestsRun = testResults.some(test => test.status !== 'pending');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Database Test</h1>
            <p className="text-muted-foreground">
              Test your DevTrack Africa database setup
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Connectivity Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will test if your database tables are properly set up and accessible.
            </p>
            
            <Button onClick={runTests} disabled={isRunning} className="w-full mb-6">
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>

            <div className="space-y-3">
              {testResults.map((test, index) => {
                const IconComponent = test.icon;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(test.status)}`}
                  >
                    {getStatusIcon(test.status)}
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">{test.message}</p>
                    </div>
                    
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {anyTestsRun && (
          <Alert className={allTestsPassed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            {allTestsPassed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={allTestsPassed ? 'text-green-800' : 'text-yellow-800'}>
              {allTestsPassed ? (
                <strong>All tests passed!</strong> Your database is properly set up and ready to use.
              ) : (
                <>
                  <strong>Some tests failed.</strong> Please run the database setup SQL in your Supabase SQL Editor to create the missing tables.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}