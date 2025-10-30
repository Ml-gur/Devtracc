import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { TestTube, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import DatabaseErrorHandler, { DatabaseError } from '../utils/supabase/database-error-handler';
import DatabaseStatus from './DatabaseStatus';
import { supabase } from '../utils/supabase/client';

export default function DatabaseErrorTest() {
  const [testResults, setTestResults] = useState<{ [key: string]: DatabaseError | null }>({});
  const [isRunning, setIsRunning] = useState(false);

  const errorTests = [
    {
      id: 'table_not_found',
      name: 'Table Not Found (42P01)',
      description: 'Simulates when database tables are not set up',
      error: { code: '42P01', message: 'relation "public.users" does not exist' }
    },
    {
      id: 'postgrest_not_found',
      name: 'PostgREST Not Found (PGRST116)',
      description: 'Simulates when a resource is not found',
      error: { code: 'PGRST116', message: 'No rows returned from query' }
    },
    {
      id: 'network_error',
      name: 'Network Connection Error',
      description: 'Simulates network connectivity issues',
      error: { message: 'Failed to fetch: network error' }
    },
    {
      id: 'permission_error',
      name: 'Permission Error (403)',
      description: 'Simulates authorization issues',
      error: { code: '403', message: 'Forbidden: insufficient permissions' }
    },
    {
      id: 'rate_limit',
      name: 'Rate Limit Error (429)',
      description: 'Simulates too many requests',
      error: { code: '429', message: 'Rate limit exceeded: too many requests' }
    },
    {
      id: 'server_error',
      name: 'Server Error (500)',
      description: 'Simulates internal server errors',
      error: { code: '500', message: 'Internal server error' }
    }
  ];

  const runAllTests = () => {
    setIsRunning(true);
    const results: { [key: string]: DatabaseError } = {};

    errorTests.forEach(test => {
      const result = DatabaseErrorHandler.handleError(test.error);
      results[test.id] = result;
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const testRealDatabaseConnection = async () => {
    setIsRunning(true);
    
    try {
      if (supabase) {
        // This will likely fail with the actual error we're trying to fix
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        if (error) {
          const handled = DatabaseErrorHandler.handleError(error);
          setTestResults(prev => ({
            ...prev,
            real_error: handled
          }));
        } else {
          setTestResults(prev => ({
            ...prev,
            real_error: {
              code: 'SUCCESS',
              message: 'Database connection successful',
              userMessage: 'Database is properly set up and accessible',
              action: 'none',
              severity: 'low',
              canContinueOffline: true
            } as DatabaseError
          }));
        }
      }
    } catch (error) {
      const handled = DatabaseErrorHandler.handleError(error);
      setTestResults(prev => ({
        ...prev,
        real_error: handled
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const getSeverityBadge = (severity: DatabaseError['severity']) => {
    const colors = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[severity] || colors.low}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
          <TestTube className="w-7 h-7" />
          Database Error Handler Test
        </h1>
        <p className="text-muted-foreground">
          Test how different database errors are handled and displayed to users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Run tests to see how different errors are handled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Run All Error Tests
            </Button>
            
            <Button 
              onClick={testRealDatabaseConnection} 
              disabled={isRunning}
              variant="outline"
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              Test Real Database Connection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Statistics</CardTitle>
            <CardDescription>
              Summary of test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter(r => r?.canContinueOffline).length}
                </div>
                <div className="text-sm text-muted-foreground">Can Continue Offline</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(testResults).filter(r => r?.action === 'setup_database').length}
                </div>
                <div className="text-sm text-muted-foreground">Need Database Setup</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Object.values(testResults).filter(r => r?.action === 'retry').length}
                </div>
                <div className="text-sm text-muted-foreground">Should Retry</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Test Results</h2>
        
        {testResults.real_error && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Real Database Connection Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DatabaseStatus
                availability={testResults.real_error.code === 'SUCCESS' ? 'available' : 'unavailable'}
                error={testResults.real_error.code === 'SUCCESS' ? null : testResults.real_error}
                showActions={false}
              />
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <strong>Raw Error Details:</strong>
                <pre className="mt-2 text-xs">{JSON.stringify(testResults.real_error, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
        
        {errorTests.map(test => {
          const result = testResults[test.id];
          if (!result) return null;

          return (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {result.code === 'SUCCESS' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    )}
                    {test.name}
                  </span>
                  {getSeverityBadge(result.severity)}
                </CardTitle>
                <CardDescription>
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>User Message:</strong> {result.userMessage}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Error Code:</strong>
                    <div className="text-muted-foreground">{result.code}</div>
                  </div>
                  <div>
                    <strong>Action:</strong>
                    <div className="text-muted-foreground">{result.action || 'none'}</div>
                  </div>
                  <div>
                    <strong>Severity:</strong>
                    <div className="text-muted-foreground">{result.severity}</div>
                  </div>
                  <div>
                    <strong>Can Continue:</strong>
                    <div className={result.canContinueOffline ? 'text-green-600' : 'text-red-600'}>
                      {result.canContinueOffline ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <strong>Original Error:</strong>
                  <div className="text-muted-foreground mt-1">{result.message}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(testResults).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <TestTube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Run the tests above to see how different database errors are handled
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}