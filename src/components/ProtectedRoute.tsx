import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailConfirmation?: boolean;
  requireCompleteProfile?: boolean;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requireEmailConfirmation = true,
  requireCompleteProfile = false,
  fallback = null 
}: ProtectedRouteProps) {
  const { 
    loading, 
    isAuthenticated, 
    isEmailConfirmed, 
    user
  } = useAuth();

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-muted-foreground">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-muted-foreground">
            You need to be signed in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check email confirmation if required
  if (requireEmailConfirmation && !isEmailConfirmed) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Email Confirmation Required</h2>
          <p className="text-muted-foreground">
            Please confirm your email address to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check profile completion if required
  if (requireCompleteProfile && !user?.isProfileComplete) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Profile Setup Required</h2>
          <p className="text-muted-foreground">
            Please complete your profile setup to access this page.
          </p>
        </div>
      </div>
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}