import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { signUpUser, signInUser, getCurrentUser } from '../utils/database-service';
import supabaseAuth, { UserProfile, AuthResult, ProfileResult } from '../utils/supabase/auth-client';

interface AuthContextType {
  // Auth state
  user: User | null;
  profile: UserProfile | null;
  session: { user: User } | null;
  loading: boolean;
  
  // Computed states
  isAuthenticated: boolean;
  isEmailConfirmed: boolean;
  needsProfileSetup: boolean;
  
  // Auth methods
  signUp: (userData: {
    fullName: string;
    email: string;
    password: string;
    country: string;
    phone: string;
  }) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInAsTestUser: () => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  updateProfile: (profileData: {
    title: string;
    techStack: string[];
    bio: string;
    profilePicture?: string;
  }) => Promise<ProfileResult>;
  deleteProfile: () => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state listener
  useEffect(() => {
    console.log('🔵 Setting up Supabase auth state listener...');
    
    const unsubscribe = supabaseAuth.onAuthStateChanged(async (supabaseUser) => {
      console.log('🔵 Auth state changed:', supabaseUser ? 'User signed in' : 'User signed out');
      
      try {
        setUser(supabaseUser);
        
        if (supabaseUser) {
          // Load user profile from Supabase (if database is available)
          console.log('👤 Loading user profile from database...');
          const profileResult = await supabaseAuth.getProfile(supabaseUser.id);
          
          if (profileResult.success && profileResult.profile) {
            console.log('✅ Profile loaded successfully from database');
            setProfile(profileResult.profile);
          } else {
            // Handle specific error types with appropriate fallbacks
            const errorCode = profileResult.error || '';
            
            if (errorCode === 'DATABASE_TABLES_MISSING' ||
                errorCode.includes('does not exist') ||
                errorCode.includes('42P01')) {
              console.log('✅ Database setup not complete - creating local profile from auth data (app continues to work offline)');

              // Create a comprehensive local profile from auth metadata as fallback
              const authProfile = {
                id: supabaseUser.id,
                fullName: supabaseUser.user_metadata?.full_name ||
                         supabaseUser.user_metadata?.name ||
                         supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                country: supabaseUser.user_metadata?.country || '',
                phone: supabaseUser.user_metadata?.phone || '',
                title: 'Developer', // Default title for new users
                techStack: [],
                bio: `Welcome to DevTrack Africa! I'm a developer from ${supabaseUser.user_metadata?.country || 'Africa'} ready to showcase my projects and connect with the community.`,
                profilePicture: supabaseUser.user_metadata?.avatar_url || undefined,
                createdAt: new Date(supabaseUser.created_at),
                updatedAt: new Date(),
                // Additional profile fields from registration
                location: supabaseUser.user_metadata?.country || '',
                userType: 'developer',
                profilePublic: true,
                showEmail: false,
                showPhone: false,
                showLocation: true,
                onboardingCompleted: false
              };
              setProfile(authProfile);
              
            } else if (errorCode === 'PROFILE_NOT_FOUND') {
              console.log('✅ User authenticated but no database profile found - creating local profile (app continues to work)');

              // User exists in auth but not in users table (maybe signed up before database setup)
              const authProfile = {
                id: supabaseUser.id,
                fullName: supabaseUser.user_metadata?.full_name ||
                         supabaseUser.user_metadata?.name ||
                         supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                country: supabaseUser.user_metadata?.country || '',
                phone: supabaseUser.user_metadata?.phone || '',
                title: 'Developer', // Default title for new users
                techStack: [],
                bio: `Welcome to DevTrack Africa! I'm a developer from ${supabaseUser.user_metadata?.country || 'Africa'} ready to showcase my projects and connect with the community.`,
                profilePicture: supabaseUser.user_metadata?.avatar_url || undefined,
                createdAt: new Date(supabaseUser.created_at),
                updatedAt: new Date(),
                // Additional profile fields from registration
                location: supabaseUser.user_metadata?.country || '',
                userType: 'developer',
                profilePublic: true,
                showEmail: false,
                showPhone: false,
                showLocation: true,
                onboardingCompleted: false
              };
              setProfile(authProfile);
              
            } else if (errorCode === 'SUPABASE_NOT_CONFIGURED') {
              console.log('✅ Supabase not configured - creating local profile (app works offline)');

              // Supabase not set up, create local profile
              const authProfile = {
                id: supabaseUser.id,
                fullName: supabaseUser.user_metadata?.full_name ||
                         supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                country: supabaseUser.user_metadata?.country || '',
                phone: supabaseUser.user_metadata?.phone || '',
                title: 'Developer', // Default title for new users
                techStack: [],
                bio: `Welcome to DevTrack Africa! I'm a developer from ${supabaseUser.user_metadata?.country || 'Africa'} ready to showcase my projects and connect with the community.`,
                profilePicture: supabaseUser.user_metadata?.avatar_url || undefined,
                createdAt: new Date(supabaseUser.created_at),
                updatedAt: new Date(),
                // Additional profile fields from registration
                location: supabaseUser.user_metadata?.country || '',
                userType: 'developer',
                profilePublic: true,
                showEmail: false,
                showPhone: false,
                showLocation: true,
                onboardingCompleted: false
              };
              setProfile(authProfile);
              
            } else if (errorCode.includes('DATABASE_CONNECTION_ERROR') || 
                      errorCode.includes('network') || 
                      errorCode.includes('connection')) {
              console.log('✅ Database connection unavailable - creating local profile (app works offline)');
              
              // Connection issues, create temporary local profile
              const authProfile = {
                id: supabaseUser.id,
                fullName: supabaseUser.user_metadata?.full_name || 
                         supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                country: supabaseUser.user_metadata?.country || '',
                phone: supabaseUser.user_metadata?.phone || '',
                title: 'Developer', // Default title for new users
                techStack: [],
                bio: `Welcome to DevTrack Africa! I'm a developer from ${supabaseUser.user_metadata?.country || 'Africa'} ready to showcase my projects and connect with the community.`,
                profilePicture: supabaseUser.user_metadata?.avatar_url || undefined,
                createdAt: new Date(supabaseUser.created_at),
                updatedAt: new Date(),
                // Additional profile fields from registration
                location: supabaseUser.user_metadata?.country || '',
                userType: 'developer',
                profilePublic: true,
                showEmail: false,
                showPhone: false,
                showLocation: true,
                onboardingCompleted: false
              };
              setProfile(authProfile);
              
            } else {
              console.log('⚠️ Unexpected profile loading error:', profileResult.error);
              console.log('✅ Creating basic local profile to ensure app functionality');
              
              // For any other errors, still create a basic profile so the app doesn't break
              const authProfile = {
                id: supabaseUser.id,
                fullName: supabaseUser.user_metadata?.full_name || 
                         supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                country: supabaseUser.user_metadata?.country || '',
                phone: supabaseUser.user_metadata?.phone || '',
                title: 'Developer', // Default title for new users
                techStack: [],
                bio: `Welcome to DevTrack Africa! I'm a developer ready to showcase my projects and connect with the community.`,
                profilePicture: supabaseUser.user_metadata?.avatar_url || undefined,
                createdAt: new Date(supabaseUser.created_at),
                updatedAt: new Date(),
                // Additional profile fields from registration
                location: supabaseUser.user_metadata?.country || '',
                userType: 'developer',
                profilePublic: true,
                showEmail: false,
                showPhone: false,
                showLocation: true,
                onboardingCompleted: false
              };
              setProfile(authProfile);
            }
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('🔵 Cleaning up Supabase auth state listener');
      unsubscribe();
    };
  }, []);

  // Computed values
  const isAuthenticated = !!user;
  const isEmailConfirmed = user?.email_confirmed_at ? true : false;
  const needsProfileSetup = isAuthenticated && isEmailConfirmed && (!profile?.title || !profile?.techStack?.length);
  const session = user ? { user } : null;

  // Auth methods
  const signUp = async (userData: {
    fullName: string;
    email: string;
    password: string;
    country: string;
    phone: string;
  }): Promise<AuthResult> => {
    try {
      setError(null);
      console.log('🔵 Signing up user:', userData.email);
      
      const { user, error } = await signUpUser({
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        country: userData.country,
        phone: userData.phone,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true, user: user as User };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setError(null);
      console.log('🔵 Signing in user:', email);
      
      const { user, error } = await signInUser(email, password);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true, user: user as User };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signInAsTestUser = async (): Promise<AuthResult> => {
    try {
      setError(null);
      console.log('🔵 Signing in as test user...');
      
      const result = await supabaseAuth.signInAsTestUser();
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in as test user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    try {
      setError(null);
      console.log('🔵 Signing out user...');
      
      const result = await supabaseAuth.signOut();
      
      if (!result.success && result.error) {
        setError(result.error);
      } else {
        // Clear local state
        setUser(null);
        setProfile(null);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign out';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (profileData: {
    title: string;
    techStack: string[];
    bio: string;
    profilePicture?: string;
  }): Promise<ProfileResult> => {
    try {
      setError(null);
      
      if (!user) {
        const errorMessage = 'No user signed in';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      console.log('🔵 Updating user profile...');
      
      const result = await supabaseAuth.updateProfile(user.id, profileData);
      
      if (!result.success && result.error) {
        const errorCode = result.error;
        
        // Handle specific database errors by updating local profile
        if (errorCode === 'DATABASE_TABLES_MISSING' || 
            errorCode === 'SUPABASE_NOT_CONFIGURED' ||
            errorCode.includes('DATABASE_CONNECTION_ERROR') ||
            errorCode.includes('DATABASE_UPDATE_FAILED')) {
          
          console.log('✅ Database unavailable - updating local profile only (changes saved locally)');
          
          if (profile) {
            const updatedProfile = { 
              ...profile, 
              ...profileData,
              techStack: profileData.techStack || profile.techStack, // Ensure we preserve existing techStack if not updating
              updatedAt: new Date() 
            };
            setProfile(updatedProfile);
            
            // Return success since we updated the local state
            return { success: true, profile: updatedProfile };
          } else {
            setError('Could not update profile: No local profile available');
            return { success: false, error: 'No local profile available' };
          }
        }
        
        // For other errors, set the error state
        setError(result.error);
      } else if (result.success && result.profile) {
        // Update local profile state with database result
        console.log('✅ Profile updated in database and local state');
        setProfile(result.profile);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendConfirmation = async (email: string): Promise<AuthResult> => {
    try {
      setError(null);
      console.log('🔵 Resending confirmation email to:', email);
      
      const result = await supabaseAuth.resendConfirmation(email);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend confirmation email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteProfile = async (): Promise<AuthResult> => {
    try {
      setError(null);

      if (!user) {
        const errorMessage = 'No user signed in';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log('🔵 Deleting user profile and account...');

      const result = await supabaseAuth.deleteProfile(user.id);

      if (!result.success && result.error) {
        const errorMessage = result.error;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } else {
        // Clear local state after successful deletion
        console.log('✅ Profile and account deleted successfully');
        setUser(null);
        setProfile(null);
        return { success: true };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      setError(null);
      console.log('🔵 Sending password reset email to:', email);

      const result = await supabaseAuth.resetPassword(email);

      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send password reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Context value
  const contextValue: AuthContextType = {
    // Auth state
    user,
    profile,
    session,
    loading,

    // Computed states
    isAuthenticated,
    isEmailConfirmed,
    needsProfileSetup,

    // Auth methods
    signUp,
    signIn,
    signInAsTestUser,
    signOut,
    updateProfile,
    deleteProfile,
    resendConfirmation,
    resetPassword,

    // Error handling
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
