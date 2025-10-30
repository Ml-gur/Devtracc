import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, AlertCircle } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBack: () => void;
  onSuccess: () => void;
  onNeedConfirmation: (email: string) => void;
  onNavigateToRegister?: () => void;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage({ onBack, onSuccess, onNeedConfirmation, onNavigateToRegister }: LoginPageProps) {
  const { signIn, resetPassword, signInAsTestUser } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    if (emailConfirmationNeeded) {
      setEmailConfirmationNeeded(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setEmailConfirmationNeeded(false);
    
    try {
      const result = await signIn(formData.email, formData.password);
      
      if (!result.success) {
        if (result.error?.includes('Email not confirmed')) {
          setEmailConfirmationNeeded(true);
          onNeedConfirmation(formData.email);
        } else if (result.error) {
          setErrors({ general: result.error });
        }
      } else {
        onSuccess();
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      alert('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setShowForgotPassword(true);
    
    try {
      const result = await resetPassword(resetEmail);
      
      if (result.success) {
        setResetMessage('Password reset email sent! Check your inbox.');
      } else {
        setResetMessage(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      setResetMessage('Failed to send reset email. Please try again.');
    }

    setTimeout(() => {
      setShowForgotPassword(false);
      setResetMessage('');
      setResetEmail('');
    }, 5000);
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2"
        disabled={isLoading}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">DT</span>
            </div>
            <span className="text-xl font-bold">DevTrack</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue your development journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          {emailConfirmationNeeded ? (
            // Email confirmation required state
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Email Confirmation Required</h3>
                <p className="text-sm text-muted-foreground">
                  Your account needs to be verified before you can sign in.
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <Mail className="h-4 w-4" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  We're redirecting you to check your email and confirm your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full"
                >
                  Back to Welcome
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Don't see the confirmation email? Check your spam folder or try registering again.
                </p>
              </div>
            </div>
          ) : (
            // Login form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors.general}
                    {(errors.general.includes('No account found') || errors.general.includes('Invalid login credentials')) && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>💡 Quick Solutions:</strong>
                          <ul className="mt-1 ml-4 list-disc space-y-1">
                            <li>Try the demo account below: <strong>demo@devtrack.com</strong></li>
                            <li>Create a new account using "Sign up here" link</li>
                            <li>Double-check your email spelling</li>
                            <li>Try waiting a moment and logging in again</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reset Message */}
              {resetMessage && (
                <Alert variant={resetMessage.includes('sent') ? 'default' : 'destructive'}>
                  <AlertDescription>{resetMessage}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                    setResetEmail(e.target.value);
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={showForgotPassword || isLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {showForgotPassword ? 'Sending reset email...' : 'Forgot Password?'}
                </button>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>



              {/* Demo Access Option */}
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or try demo</span>
                  </div>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  setErrors({});
                  
                  try {
                    const result = await signInAsTestUser();
                    
                    if (result.success) {
                      console.log('🎭 Demo user signed in successfully');
                      onSuccess();
                    } else {
                      setErrors({ general: result.error || 'Demo access failed. Please try creating an account.' });
                    }
                  } catch (error) {
                    setErrors({ general: 'Demo access failed. Please try creating an account.' });
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Accessing demo...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🎭</span>
                    <span>Try Demo Dashboard</span>
                  </div>
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigateToRegister?.()}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}