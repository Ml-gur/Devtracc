import { User, Session } from '@supabase/supabase-js';
import { supabase, authHelpers, dbHelpers, hasSupabaseConfig } from './client';

// User profile interface matching the Firebase structure
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  country?: string;
  phone?: string;
  title?: string;
  techStack?: string[];
  bio?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for enhanced profile auto-population
  location?: string;
  userType?: string;
  profilePublic?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  onboardingCompleted?: boolean;
}

// Auth result interfaces
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  requiresConfirmation?: boolean;
}

export interface ProfileResult {
  success: boolean;
  error?: string;
  profile?: UserProfile;
}

// Supabase Auth wrapper functions with same interface as Firebase
const supabaseAuthService = {
  // Create user account
  async signUp(userData: {
    fullName: string;
    email: string;
    password: string;
    country: string;
    phone: string;
  }): Promise<AuthResult> {
    try {
      console.log('🔵 Starting user sign up with Supabase...');
      const { email, password, fullName, country, phone } = userData;
      
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not configured. Please check your environment variables.'
        };
      }
      
      // Create user account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            country,
            phone
          }
        }
      });
      
      if (error) {
        console.error('❌ Supabase signUp error:', error);
        
        let errorMessage = 'Failed to create account';
        
        // Handle Supabase auth specific errors
        if (error.message?.includes('User already registered') || 
            error.message?.includes('email address is already registered') ||
            error.code === '23505' || // PostgreSQL unique violation
            error.status === 422) { // Unprocessable entity (duplicate)
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else {
          switch (error.message) {
            case 'Invalid email':
              errorMessage = 'Invalid email address';
              break;
            case 'Password should be at least 6 characters':
              errorMessage = 'Password is too weak. Please use at least 6 characters';
              break;
            case 'signup is disabled':
              errorMessage = 'Account creation is currently disabled. Please contact support.';
              break;
            case 'Invalid email format':
              errorMessage = 'Please enter a valid email address';
              break;
            case 'Password is too weak':
              errorMessage = 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers';
              break;
            default:
              // Generic fallback
              errorMessage = error.message || 'Failed to create account. Please try again.';
          }
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      if (data?.user) {
        console.log('✅ User sign up successful with Supabase');
        // Note: User profile will be automatically created by database trigger
        return {
          success: true,
          user: data.user,
          requiresConfirmation: !data.user.email_confirmed_at
        };
      }
      
      return {
        success: false,
        error: 'Failed to create user account'
      };
    } catch (error: any) {
      console.error('❌ Supabase signUp error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create account'
      };
    }
  },

  // Sign in user
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔵 Starting user sign in with Supabase...');
      
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not configured. Please check your environment variables.'
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Supabase signIn error:', error);
        let errorMessage = 'Failed to sign in';
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Invalid email or password';
            break;
          case 'Email not confirmed':
            return {
              success: false,
              error: 'Please verify your email before signing in',
              requiresConfirmation: true
            };
          case 'Too many requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          default:
            errorMessage = error.message || 'Failed to sign in';
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      if (data?.user && !data.user.email_confirmed_at) {
        return {
          success: false,
          error: 'Please verify your email before signing in',
          requiresConfirmation: true
        };
      }
      
      console.log('✅ User sign in successful with Supabase');
      return {
        success: true,
        user: data?.user || undefined
      };
    } catch (error: any) {
      console.error('❌ Supabase signIn error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in'
      };
    }
  },

  // Sign out user
  async signOut(): Promise<AuthResult> {
    try {
      console.log('🔵 Starting user sign out with Supabase...');
      
      if (!supabase) {
        console.log('✅ User sign out successful (no client)');
        return { success: true };
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        // Don't block logout on network errors
        return { success: true };
      }
      
      console.log('✅ User sign out successful with Supabase');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Supabase signOut error:', error);
      // Don't block logout on errors
      return { success: true };
    }
  },

  // Resend email verification
  async resendConfirmation(email: string): Promise<AuthResult> {
    try {
      console.log('🔵 Resending email verification with Supabase...');
      
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not configured. Please check your environment variables.'
        };
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        console.error('❌ Supabase resendConfirmation error:', error);
        return {
          success: false,
          error: error.message || 'Failed to resend confirmation email'
        };
      }
      
      console.log('✅ Email verification sent with Supabase');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Supabase resendConfirmation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend confirmation email'
      };
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      console.log('🔵 Sending password reset email with Supabase...');
      
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not configured. Please check your environment variables.'
        };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('❌ Supabase resetPassword error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send password reset email'
        };
      }
      
      console.log('✅ Password reset email sent with Supabase');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Supabase resetPassword error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email'
      };
    }
  },

  // Get user profile
  async getProfile(userId: string): Promise<ProfileResult> {
    try {
      console.log('🔵 Getting user profile with Supabase...');
      
      if (!supabase) {
        console.log('⚠️ No Supabase client available for profile fetch');
        return {
          success: false,
          error: 'SUPABASE_NOT_CONFIGURED'
        };
      }
      
      // Safely try to query the users table
      try {
        const { data, error } = await dbHelpers.query('users', (table) => 
          table.select('*').eq('id', userId).single()
        );
        
        if (error) {
          // Handle table not existing (database not set up) - PostgreSQL error codes
          if (error.code === '42P01' || 
              error.message?.includes('does not exist') ||
              error.message?.includes('relation') ||
              error.details?.includes('does not exist')) {
            console.log('🔧 Database tables not set up yet - this is expected and handled gracefully');
            console.log('📝 Error details:', { code: error.code, message: error.message });
            return {
              success: false,
              error: 'DATABASE_TABLES_MISSING'
            };
          }
          
          // For other errors, log as actual errors
          console.error('❌ Supabase getProfile database error:', error);
          
          // Handle profile not found (user exists in auth but not in our users table)
          if (error.code === 'PGRST116' || error.message?.includes('No rows returned')) {
            console.log('👤 User authenticated but no profile found in users table');
            return {
              success: false,
              error: 'PROFILE_NOT_FOUND'
            };
          }
          
          // Handle other database errors
          console.log('💥 Other database error:', error.code, error.message);
          return {
            success: false,
            error: `DATABASE_ERROR: ${error.message}`
          };
        }
        
        if (data) {
          const profile: UserProfile = {
            id: data.id,
            fullName: data.full_name || data.fullName || 'User', // Map from database column name
            email: data.email,
            country: data.country,
            phone: data.phone,
            title: data.title,
            techStack: data.tech_stack || data.techStack || [], // Map from database column name
            bio: data.bio,
            profilePicture: data.profile_image_url || data.profilePicture, // Map from database column name
            createdAt: new Date(data.created_at || data.createdAt),
            updatedAt: new Date(data.updated_at || data.updatedAt)
          };
          
          console.log('✅ User profile retrieved successfully from database');
          return {
            success: true,
            profile
          };
        }
        
        console.log('❓ No profile data returned from database');
        return {
          success: false,
          error: 'PROFILE_NOT_FOUND'
        };
        
      } catch (dbError: any) {
        // Check if it's a table not found error first (common and expected)
        if (dbError.message?.includes('does not exist') || 
            dbError.code === '42P01') {
          console.log('🔧 Database tables missing - this is expected when database setup is not complete');
          return {
            success: false,
            error: 'DATABASE_TABLES_MISSING'
          };
        }
        
        // Check if it's a connection error
        if (dbError.message?.includes('Failed to fetch') || 
            dbError.message?.includes('network') ||
            dbError.message?.includes('connection')) {
          console.log('🌐 Database connection issue - app will work offline');
          return {
            success: false,
            error: 'DATABASE_CONNECTION_ERROR'
          };
        }
        
        // For other unexpected errors, log as actual errors
        console.error('💥 Unexpected database query error:', dbError);
        return {
          success: false,
          error: `DATABASE_QUERY_FAILED: ${dbError.message}`
        };
      }
      
    } catch (error: any) {
      console.error('❌ Unexpected error in getProfile:', error);
      return {
        success: false,
        error: `UNEXPECTED_ERROR: ${error.message || 'Unknown error occurred'}`
      };
    }
  },

  // Update user profile
  async updateProfile(userId: string, profileData: {
    title?: string;
    techStack?: string[];
    bio?: string;
    profilePicture?: string;
  }): Promise<ProfileResult> {
    try {
      console.log('🔵 Updating user profile with Supabase...');
      
      if (!supabase) {
        return {
          success: false,
          error: 'SUPABASE_NOT_CONFIGURED'
        };
      }
      
      // Prepare update data
      const updateData = {
        title: profileData.title,
        tech_stack: profileData.techStack, // Map to database column name
        bio: profileData.bio,
        profile_image_url: profileData.profilePicture, // Map to database column name
        updated_at: new Date().toISOString()
      };
      
      try {
        const { error } = await dbHelpers.query('users', (table) => 
          table.update(updateData).eq('id', userId)
        );
        
        if (error) {
          // Handle table not existing (database not set up)
          if (error.code === '42P01' || 
              error.message?.includes('does not exist') ||
              error.details?.includes('does not exist')) {
            console.log('🔧 Cannot update profile in database - tables not set up yet (profile updated locally)');
            return {
              success: false,
              error: 'DATABASE_TABLES_MISSING'
            };
          }
          
          // For other errors, log as actual errors
          console.error('❌ Supabase updateProfile database error:', error);
          return {
            success: false,
            error: `DATABASE_UPDATE_ERROR: ${error.message}`
          };
        }
        
        // Get updated profile to return
        const result = await this.getProfile(userId);
        
        if (result.success) {
          console.log('✅ User profile updated successfully in database');
        }
        
        return result;
        
      } catch (dbError: any) {
        // Check if it's a table not found error
        if (dbError.message?.includes('does not exist') || 
            dbError.code === '42P01') {
          console.log('🔧 Database tables missing during update - this is expected when setup is not complete');
          return {
            success: false,
            error: 'DATABASE_TABLES_MISSING'
          };
        }
        
        // For other unexpected errors, log as actual errors
        console.error('💥 Unexpected database update error:', dbError);
        return {
          success: false,
          error: `DATABASE_UPDATE_FAILED: ${dbError.message}`
        };
      }
      
    } catch (error: any) {
      console.error('❌ Unexpected error in updateProfile:', error);
      return {
        success: false,
        error: `UNEXPECTED_ERROR: ${error.message || 'Unknown error occurred'}`
      };
    }
  },

  // Create test user (for development)
  async signInAsTestUser(): Promise<AuthResult> {
    try {
      console.log('🔵 Attempting demo user authentication...');
      
      if (!supabase) {
        console.log('⚠️ Supabase not configured - creating offline demo session');
        // Create a demo user object that matches the Supabase User interface
        const demoUser = {
          id: 'demo-user-id',
          email: 'demo@devtrack.africa',
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: 'Demo User',
            country: 'Nigeria',
            phone: '+234123456789'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {
            provider: 'demo',
            providers: ['demo']
          }
        } as User;
        
        return {
          success: true,
          user: demoUser
        };
      }

      // List of demo credentials to try
      const demoCredentials = [
        { email: 'demo@devtrack.africa', password: 'DemoUser123!' },
        { email: 'test@devtrack.africa', password: 'TestUser123!' },
        { email: 'developer@devtrack.africa', password: 'Developer123!' }
      ];

      // Try each demo credential
      for (const { email, password } of demoCredentials) {
        try {
          const signInResult = await this.signIn(email, password);
          if (signInResult.success) {
            console.log(`✅ Demo user signed in successfully: ${email}`);
            return signInResult;
          }
        } catch (err) {
          // Continue to next credential
          continue;
        }
      }

      // If none of the demo users work, try to create one
      console.log('🔧 Creating new demo user account...');
      const demoEmail = 'demo@devtrack.africa';
      const demoPassword = 'DemoUser123!';
      
      const signUpResult = await this.signUp({
        fullName: 'Demo User',
        email: demoEmail,
        password: demoPassword,
        country: 'Nigeria',
        phone: '+234123456789'
      });
      
      if (signUpResult.success) {
        console.log('✅ Demo user account created successfully');
        
        // Try to immediately sign in with the new account
        if (signUpResult.user?.email_confirmed_at) {
          const signInResult = await this.signIn(demoEmail, demoPassword);
          if (signInResult.success) {
            return signInResult;
          }
        }
        
        return {
          success: true,
          user: signUpResult.user,
          requiresConfirmation: signUpResult.requiresConfirmation
        };
      }

      // If all else fails, provide helpful error message
      return {
        success: false,
        error: 'Demo access is temporarily unavailable. Please create a new account or try again later.'
      };
      
    } catch (error: any) {
      console.error('❌ Demo user authentication error:', error);
      return {
        success: false,
        error: 'Demo access failed. Please try creating a new account instead.'
      };
    }
  },

  // Delete user profile and account
  async deleteProfile(userId: string): Promise<AuthResult> {
    try {
      console.log('🔵 Deleting user profile and account with Supabase...');

      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not configured. Please check your environment variables.'
        };
      }

      // First, delete the user profile from the database
      try {
        const { error: profileError } = await dbHelpers.query('users', (table) =>
          table.delete().eq('id', userId)
        );

        if (profileError) {
          // Handle table not existing (database not set up)
          if (profileError.code === '42P01' ||
              profileError.message?.includes('does not exist') ||
              profileError.details?.includes('does not exist')) {
            console.log('🔧 Database tables not set up - cannot delete profile from database');
          } else {
            console.error('❌ Error deleting profile from database:', profileError);
            return {
              success: false,
              error: `Failed to delete profile: ${profileError.message}`
            };
          }
        } else {
          console.log('✅ User profile deleted from database');
        }
      } catch (dbError: any) {
        console.error('❌ Database error during profile deletion:', dbError);
        // Continue with auth deletion even if database deletion fails
      }

      // Then, delete the user from Supabase Auth
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
          console.error('❌ Error deleting user from auth:', authError);
          return {
            success: false,
            error: `Failed to delete account: ${authError.message}`
          };
        }

        console.log('✅ User account deleted from Supabase Auth');
        return { success: true };
      } catch (authError: any) {
        console.error('❌ Auth deletion error:', authError);
        return {
          success: false,
          error: `Failed to delete account: ${authError.message}`
        };
      }

    } catch (error: any) {
      console.error('❌ Unexpected error in deleteProfile:', error);
      return {
        success: false,
        error: `Failed to delete profile: ${error.message || 'Unknown error occurred'}`
      };
    }
  },

  // Auth state observer
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!supabase) {
      console.warn('⚠️ No Supabase client for auth state observer');
      callback(null);
      return () => {};
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      callback(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔵 Supabase auth state changed:', event, session?.user ? 'User signed in' : 'User signed out');
        callback(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }
};

// Helper function to check if Supabase is configured
export const hasSupabaseConfiguration = hasSupabaseConfig;

export default supabaseAuthService;