import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface EmailConfirmationPageProps {
  email: string;
  onNavigate: (page: 'welcome' | 'register' | 'login' | 'profile-setup' | 'dashboard') => void;
  onResendConfirmation: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function EmailConfirmationPage({ 
  email, 
  onNavigate, 
  onResendConfirmation 
}: EmailConfirmationPageProps) {
  const { resendConfirmation } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeRemaining]);

  // Listen for auth state changes (email confirmation)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('📧 Email confirmation page auth change:', { event, hasSession: !!session, userConfirmed: session?.user?.email_confirmed_at });
      
      if (event === 'SIGNED_IN' && session && session.user.email_confirmed_at) {
        // Email confirmed and user signed in - redirect to dashboard
        console.log('✅ Email confirmed successfully, redirecting to dashboard');
        onNavigate('dashboard');
      } else if (event === 'TOKEN_REFRESHED' && session && session.user.email_confirmed_at) {
        // Token refreshed with confirmed email - redirect to dashboard
        console.log('✅ Token refreshed with confirmed email, redirecting to dashboard');
        onNavigate('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [onNavigate]);

  const handleResendConfirmation = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      const result = await resendConfirmation(email);
      
      if (result.success) {
        setResendMessage({ type: 'success', text: result.message || 'Confirmation email sent successfully!' });
        setTimeRemaining(60);
        setCanResend(false);
      } else {
        setResendMessage({ type: 'error', text: result.error || 'Failed to resend confirmation email' });
      }
    } catch (error) {
      setResendMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">DT</span>
            </div>
            <div className="text-2xl font-bold text-foreground">DevTrack Africa</div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            Email Confirmation Required
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl mb-2">Check Your Email</CardTitle>
              <CardDescription className="text-base">
                We've sent a confirmation link to:
              </CardDescription>
              <div className="mt-2 p-2 bg-muted rounded-lg">
                <span className="font-medium text-foreground">{email}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium text-blue-900">Check your inbox</p>
                  <p className="text-sm text-blue-700">Look for an email from DevTrack Africa</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium text-green-900">Click the confirmation link</p>
                  <p className="text-sm text-green-700">This will verify your email and sign you in</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium text-purple-900">Complete your profile</p>
                  <p className="text-sm text-purple-700">Add your developer details to get started</p>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {resendMessage && (
              <Alert variant={resendMessage.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{resendMessage.text}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleResendConfirmation}
                disabled={!canResend || isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : canResend ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Confirmation Email
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {formatTime(timeRemaining)}
                  </>
                )}
              </Button>

              <Button
                onClick={() => onNavigate('login')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Can't find the email? Check your spam folder.</p>
              <p className="mt-1">
                Need help?{' '}
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-sm"
                  onClick={() => onNavigate('welcome')}
                >
                  Contact Support
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh notice */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>This page will automatically redirect when your email is confirmed</span>
          </div>
        </div>
      </div>
    </div>
  );
}