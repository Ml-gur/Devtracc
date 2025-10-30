import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, AlertTriangle, User, Database, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase/client';

interface DatabaseTest {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
}

export default function ProfileAutoCreationTester() {
  const { user, profile } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<DatabaseTest[]>([
    {
      name: 'Database Connection',
      description: 'Test connection to Supabase database',
      status: 'pending'
    },
    {
      name: 'Users Table Exists',
      description: 'Verify users table is created',
      status: 'pending'
    },
    {
      name: 'Profile Trigger Function',
      description: 'Check if handle_new_user function exists',
      status: 'pending'
    },
    {
      name: 'Profile Auto-Creation Trigger',
      description: 'Verify trigger on auth.users table',
      status: 'pending'
    },
    {
      name: 'Current User Profile',
      description: 'Check if current user has a profile record',
      status: 'pending'
    }
  ]);

  const updateTest = (index: number, status: DatabaseTest['status'], result?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, result } : test
    ));
  };

  const runDatabaseTests = async () => {
    if (!supabase) {
      setTests(prev => prev.map(test => ({ 
        ...test, 
        status: 'error' as const, 
        result: 'Supabase client not configured' 
      })));
      return;
    }

    setIsRunning(true);

    try {
      // Test 1: Database Connection
      updateTest(0, 'running');
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .limit(1);
        
        if (error) {
          updateTest(0, 'error', `Connection failed: ${error.message}`);
        } else {
          updateTest(0, 'success', 'Database connection successful');
        }
      } catch (error: any) {
        updateTest(0, 'error', `Connection failed: ${error.message}`);
      }

      // Test 2: Users Table Exists
      updateTest(1, 'running');
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'users');
        
        if (error) {
          updateTest(1, 'error', `Error checking table: ${error.message}`);
        } else if (data && data.length > 0) {
          updateTest(1, 'success', 'Users table exists');
        } else {
          updateTest(1, 'error', 'Users table not found');
        }
      } catch (error: any) {
        updateTest(1, 'error', `Error checking table: ${error.message}`);
      }

      // Test 3: Profile Trigger Function
      updateTest(2, 'running');
      try {
        const { data, error } = await supabase.rpc('__check_function_exists', {
          function_name: 'handle_new_user'
        }).catch(async () => {
          // Fallback: Direct query to information_schema
          return await supabase
            .from('information_schema.routines')
            .select('routine_name')
            .eq('routine_schema', 'public')
            .eq('routine_name', 'handle_new_user');
        });
        
        if (error) {
          updateTest(2, 'error', `Error checking function: ${error.message}`);
        } else if (data && (Array.isArray(data) ? data.length > 0 : data)) {
          updateTest(2, 'success', 'handle_new_user function exists');
        } else {
          updateTest(2, 'error', 'handle_new_user function not found');
        }
      } catch (error: any) {
        updateTest(2, 'error', `Error checking function: ${error.message}`);
      }

      // Test 4: Profile Auto-Creation Trigger
      updateTest(3, 'running');
      try {
        const { data, error } = await supabase
          .from('information_schema.triggers')
          .select('trigger_name, event_object_table')
          .eq('trigger_name', 'on_auth_user_created');
        
        if (error) {
          updateTest(3, 'error', `Error checking trigger: ${error.message}`);
        } else if (data && data.length > 0) {
          updateTest(3, 'success', 'Auto-creation trigger exists');
        } else {
          updateTest(3, 'error', 'Auto-creation trigger not found');
        }
      } catch (error: any) {
        updateTest(3, 'error', `Error checking trigger: ${error.message}`);
      }

      // Test 5: Current User Profile
      updateTest(4, 'running');
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, full_name, email, created_at')
            .eq('id', user.id)
            .single();
          
          if (error) {
            if (error.code === '42P01') {
              updateTest(4, 'error', 'Users table does not exist');
            } else if (error.code === 'PGRST116') {
              updateTest(4, 'error', 'Profile not found for current user');
            } else {
              updateTest(4, 'error', `Error: ${error.message}`);
            }
          } else if (data) {
            updateTest(4, 'success', `Profile found: ${data.full_name || data.email}`);
          } else {
            updateTest(4, 'error', 'No profile data returned');
          }
        } catch (error: any) {
          updateTest(4, 'error', `Error checking profile: ${error.message}`);
        }
      } else {
        updateTest(4, 'error', 'No user signed in');
      }

    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DatabaseTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DatabaseTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'success');
  const anyTestsFailed = tests.some(test => test.status === 'error');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
          <User className="w-7 h-7" />
          Profile Auto-Creation Tester
        </h1>
        <p className="text-muted-foreground">
          Verify that automatic profile creation is working correctly
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">User Status</div>
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Signed In</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Not Signed In</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Profile Status</div>
              <div className="flex items-center gap-2">
                {profile ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Profile Loaded</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">No Profile</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Database Setup</div>
              <div className="flex items-center gap-2">
                {allTestsPassed ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Complete</span>
                  </>
                ) : anyTestsFailed ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Issues Found</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Unknown</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {user && profile && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Profile loaded for <strong>{profile.fullName}</strong> ({profile.email})
                {profile.createdAt && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    Created: {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Database Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Database Tests</CardTitle>
          <CardDescription>
            Run these tests to verify your database setup and auto-profile creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(test.status)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{test.name}</span>
                    {getStatusBadge(test.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                  {test.result && (
                    <p className={`text-sm ${
                      test.status === 'success' ? 'text-green-600' : 
                      test.status === 'error' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {test.result}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={runDatabaseTests} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run Database Tests
                </>
              )}
            </Button>
          </div>

          {allTestsPassed && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>All tests passed!</strong> Your database is properly configured with automatic profile creation.
              </AlertDescription>
            </Alert>
          )}

          {anyTestsFailed && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Some tests failed.</strong> Please run the database setup script from the Database Setup Helper to fix these issues.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Auto-Profile Creation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>When a user signs up through Supabase Auth, their account is created in the <code>auth.users</code> table</li>
            <li>A database trigger (<code>on_auth_user_created</code>) automatically fires when a new user is inserted</li>
            <li>The trigger calls the <code>handle_new_user()</code> function</li>
            <li>This function creates a profile record in the <code>public.users</code> table using the auth metadata</li>
            <li>The profile includes the user's name, email, country, and phone (if provided during signup)</li>
          </ol>
          
          <div className="bg-blue-50 p-3 rounded-lg mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> If you signed up before setting up the database, your profile may not exist. 
              The auto-creation only works for new signups after the database setup is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}