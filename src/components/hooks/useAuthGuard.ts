import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requireEmailConfirmation?: boolean;
  requireCompleteProfile?: boolean;
  redirectTo?: () => void;
}

export function useAuthGuard({
  requireAuth = true,
  requireEmailConfirmation = true,
  requireCompleteProfile = false,
  redirectTo
}: UseAuthGuardOptions = {}) {
  const {
    loading,
    isAuthenticated,
    isEmailConfirmed,
    user,
    error
  } = useAuth();

  const isAuthorized = !loading && (
    !requireAuth || (
      isAuthenticated &&
      (!requireEmailConfirmation || isEmailConfirmed) &&
      (!requireCompleteProfile || user?.isProfileComplete)
    )
  );

  const authStatus = {
    loading,
    isAuthorized,
    isAuthenticated,
    isEmailConfirmed,
    hasCompleteProfile: Boolean(user?.isProfileComplete),
    error,
    user
  };

  useEffect(() => {
    if (!loading && !isAuthorized && redirectTo) {
      redirectTo();
    }
  }, [loading, isAuthorized, redirectTo]);

  return authStatus;
}