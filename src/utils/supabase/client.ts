import { createClient } from '@supabase/supabase-js';

// Helper function to safely access environment variables
const getEnvVar = (key: string): string => {
  // Try import.meta.env first (modern bundlers like Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  
  // Fallback to process.env (if available)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  
  // Last resort: check window for environment variables (if set by bundler)
  if (typeof window !== 'undefined' && (window as any).env) {
    return (window as any).env[key] || '';
  }
  
  return '';
};

// Try to get Supabase configuration from multiple sources
const getSupabaseConfig = () => {
  // First try environment variables
  let supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
  let supabaseAnonKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');
  
  // If not found, try to import from info file (fallback)
  if (!supabaseUrl || !supabaseAnonKey) {
    try {
      const info = require('./info');
      if (info.projectId && info.publicAnonKey) {
        supabaseUrl = `https://${info.projectId}.supabase.co`;
        supabaseAnonKey = info.publicAnonKey;
      }
    } catch (error) {
      // Info file not available
    }
  }
  
  return { supabaseUrl, supabaseAnonKey };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Enhanced configuration validation
export const hasSupabaseConfig = (): boolean => {
  const hasUrl = Boolean(supabaseUrl && supabaseUrl.trim() !== '');
  const hasKey = Boolean(supabaseAnonKey && supabaseAnonKey.trim() !== '');
  return hasUrl && hasKey;
};

// Demo mode detection (simplified for production)
export const getDemoMode = (): boolean => {
  return !hasSupabaseConfig();
};

// Create Supabase client with error handling
export let supabase: any = null;

try {
  if (hasSupabaseConfig()) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'devtrack-africa'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.log('✅ Supabase client initialized');
  } else {
    console.warn('⚠️ No Supabase configuration found - please check environment variables');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
}

// Auth helpers for production use
export const authHelpers = {
  async signUp(email: string, password: string, metadata: any = {}) {
    if (!supabase) {
      throw new Error('Supabase client not initialized - please check configuration');
    }

    try {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
    } catch (error) {
      console.error('❌ Auth signup error:', error);
      throw error;
    }
  },

  async signInWithPassword(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase client not initialized - please check configuration');
    }

    try {
      return await supabase.auth.signInWithPassword({
        email,
        password
      });
    } catch (error) {
      console.error('❌ Auth signin error:', error);
      throw error;
    }
  },

  async signOut() {
    if (!supabase) {
      console.warn('⚠️ No Supabase client for signOut');
      return { error: null };
    }

    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ Auth signout error:', error);
      return { error: null }; // Don't block logout on network errors
    }
  },

  async getSession() {
    if (!supabase) {
      return { data: { session: null }, error: null };
    }

    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error('❌ Get session error:', error);
      return { data: { session: null }, error: null };
    }
  },

  async getUser() {
    if (!supabase) {
      return { data: { user: null }, error: null };
    }

    try {
      return await supabase.auth.getUser();
    } catch (error) {
      console.error('❌ Get user error:', error);
      return { data: { user: null }, error: null };
    }
  },

  async updateUser(updates: any) {
    if (!supabase) {
      throw new Error('Supabase client not initialized - please check configuration');
    }

    try {
      return await supabase.auth.updateUser({
        data: updates
      });
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    if (!supabase) {
      throw new Error('Supabase client not initialized - please check configuration');
    }

    try {
      return await supabase.auth.resetPasswordForEmail(email);
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  }
};

// Database connection testing
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) {
    console.log('❌ No Supabase client available for connection test');
    return false;
  }

  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Simple query with timeout
    const { data, error } = await Promise.race([
      supabase.from('users').select('count', { count: 'exact', head: true }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);

    if (error) {
      console.log('❌ Supabase connection test failed:', error.message);
      // If it's a table missing error, the connection works but database isn't set up
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('✅ Supabase connection works but database needs setup');
        return true; // Connection is working, just tables missing
      }
      return false;
    }

    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.log('❌ Supabase connection test error:', error);
    return false;
  }
};

export const testDatabaseAvailability = async (): Promise<boolean> => {
  if (!supabase) {
    console.log('❌ No Supabase client available for database test');
    return false;
  }

  try {
    console.log('🔍 Testing database availability...');
    
    // Test basic database connectivity with timeout
    const { error } = await Promise.race([
      supabase.from('users').select('count', { count: 'exact', head: true }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      )
    ]);

    if (error) {
      console.log('❌ Database availability test failed:', error.message);
      
      // Check if it's a schema issue vs connection issue
      if (error.message?.includes('relation') || 
          error.message?.includes('does not exist') ||
          error.code === 'PGRST116' ||
          error.code === '42P01') { // PostgreSQL undefined table error
        console.log('⚠️ Database schema not available');
        return false;
      }
      
      return false;
    }

    console.log('✅ Database availability test successful');
    return true;
  } catch (error) {
    console.log('❌ Database availability test error:', error);
    return false;
  }
};

// Database helpers for production use
export const dbHelpers = {
  async query(table: string, operation: (table: any) => Promise<any>) {
    if (!supabase) {
      return {
        data: null,
        error: { code: 'DB_NOT_AVAILABLE', message: 'Database not available - please check configuration' }
      };
    }

    try {
      const tableInstance = supabase.from(table);
      const result = await operation(tableInstance);
      return result;
    } catch (error) {
      console.error(`❌ Database query error for table "${table}":`, error);
      
      return {
        data: null,
        error: error instanceof Error ? 
          { code: 'DB_ERROR', message: error.message } : 
          { code: 'DB_ERROR', message: 'Unknown database error' }
      };
    }
  }
};

// Export default Supabase client (might be null in demo mode)
export default supabase;