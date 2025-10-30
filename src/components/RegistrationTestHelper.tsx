import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, User, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationTestHelperProps {
  onClose: () => void;
}

export default function RegistrationTestHelper({ onClose }: RegistrationTestHelperProps) {
  const { signUp, user } = useAuth();
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'running' | 'passed' | 'failed';
    message: string;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runRegistrationTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: Array<{
      test: string;
      status: 'running' | 'passed' | 'failed';
      message: string;
    }> = [];

    // Test 1: Basic registration
    results.push({ test: 'Basic Registration', status: 'running', message: 'Testing user registration...' });
    setTestResults([...results]);

    try {
      const testEmail = `test${Date.now()}@devtrack.africa`;
      const testData = {
        fullName: 'Test User',
        email: testEmail,
        password: 'TestPassword123!',
        country: 'Nigeria',
        phone: '+234123456789'
      };

      const registrationResult = await signUp(testData);

      if (registrationResult.success) {
        results[results.length - 1] = {
          test: 'Basic Registration',
          status: 'passed',
          message: `✅ Registration successful for ${testEmail}. Email confirmation: ${registrationResult.requiresConfirmation ? 'Required' : 'Not required'}`
        };
      } else {
        results[results.length - 1] = {
          test: 'Basic Registration',
          status: 'failed',
          message: `❌ Registration failed: ${registrationResult.error}`
        };
      }
    } catch (error: any) {
      results[results.length - 1] = {
        test: 'Basic Registration',
        status: 'failed',
        message: `❌ Registration error: ${error.message}`
      };
    }

    setTestResults([...results]);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Registration Flow Test
          </CardTitle>
          <CardDescription>
            Test the user registration and authentication flow to ensure everything is working correctly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current User Status */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Current User Status:</strong> {user ? `Signed in as ${user.email} (Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'})` : 'Not signed in'}
            </AlertDescription>
          </Alert>

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={runRegistrationTest}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Test Registration Flow
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Results:</h4>
              {testResults.map((result, index) => (
                <Alert key={index} variant={result.status === 'failed' ? 'destructive' : 'default'}>
                  <div className="flex items-center gap-2">
                    {result.status === 'running' && (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {result.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {result.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <div>
                      <strong>{result.test}:</strong> {result.message}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>How to use this test:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Test Registration Flow" to create a test user account</li>
              <li>Check the results to see if registration worked correctly</li>
              <li>If registration requires email confirmation, the test will show this</li>
              <li>The test creates a unique email address each time to avoid conflicts</li>
            </ol>
            <p className="text-xs">
              <strong>Note:</strong> This test creates real user accounts in your database. 
              Use it sparingly in production environments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}