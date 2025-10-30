import { connectionManager } from './connection-manager';
import { hasSupabaseConfig, authHelpers } from './supabase/client';

export interface ValidationResults {
  configuration: {
    supabaseConfigured: boolean;
    error?: string;
  };
  connection: {
    online: boolean;
    supabaseReachable: boolean;
    databaseAvailable: boolean;
    error?: string;
  };
  authentication: {
    sessionExists: boolean;
    userAuthenticated: boolean;
    emailConfirmed: boolean;
    error?: string;
  };
  overall: {
    status: 'ready' | 'partial' | 'failed';
    message: string;
    recommendations: string[];
  };
}

export class AuthConnectionValidator {
  static async validate(): Promise<ValidationResults> {
    const results: ValidationResults = {
      configuration: {
        supabaseConfigured: false
      },
      connection: {
        online: false,
        supabaseReachable: false,
        databaseAvailable: false
      },
      authentication: {
        sessionExists: false,
        userAuthenticated: false,
        emailConfirmed: false
      },
      overall: {
        status: 'failed',
        message: '',
        recommendations: []
      }
    };

    try {
      // Test configuration
      console.log('🔧 Validating configuration...');
      results.configuration.supabaseConfigured = hasSupabaseConfig();
      
      if (!results.configuration.supabaseConfigured) {
        results.configuration.error = 'Supabase not configured - missing environment variables';
        results.overall.recommendations.push('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
      }

      // Test connection
      console.log('🔍 Validating connection...');
      const connectionStatus = connectionManager.getStatus();
      results.connection = {
        online: connectionStatus.online,
        supabaseReachable: connectionStatus.supabaseReachable,
        databaseAvailable: connectionStatus.databaseAvailable,
        error: connectionStatus.error
      };

      if (!connectionStatus.online) {
        results.connection.error = 'No internet connection';
        results.overall.recommendations.push('Check your internet connection');
      } else if (!connectionStatus.supabaseReachable) {
        results.connection.error = 'Cannot reach Supabase servers';
        results.overall.recommendations.push('Verify Supabase configuration and network connectivity');
      } else if (!connectionStatus.databaseAvailable) {
        results.connection.error = 'Database tables not available';
        results.overall.recommendations.push('Run database migrations or setup database tables');
      }

      // Test authentication
      console.log('🔐 Validating authentication...');
      try {
        const { data: { session }, error: sessionError } = await authHelpers.getSession();
        
        if (sessionError) {
          results.authentication.error = `Session error: ${sessionError.message}`;
        } else if (session) {
          results.authentication.sessionExists = true;
          results.authentication.userAuthenticated = Boolean(session.user);
          results.authentication.emailConfirmed = Boolean(session.user?.email_confirmed_at);
          
          if (!results.authentication.emailConfirmed) {
            results.overall.recommendations.push('Confirm your email address to access all features');
          }
        } else {
          results.authentication.error = 'No active session';
        }
      } catch (authError) {
        results.authentication.error = `Authentication check failed: ${authError}`;
        results.overall.recommendations.push('Try logging in again');
      }

      // Determine overall status
      if (results.configuration.supabaseConfigured && 
          results.connection.online && 
          results.connection.supabaseReachable && 
          results.connection.databaseAvailable &&
          results.authentication.userAuthenticated &&
          results.authentication.emailConfirmed) {
        results.overall.status = 'ready';
        results.overall.message = 'All systems operational - authentication and connection working perfectly';
      } else if (results.configuration.supabaseConfigured && 
                 results.connection.online && 
                 results.connection.supabaseReachable) {
        results.overall.status = 'partial';
        
        if (!results.authentication.userAuthenticated) {
          results.overall.message = 'System partially operational - user needs to authenticate';
        } else if (!results.authentication.emailConfirmed) {
          results.overall.message = 'System partially operational - email confirmation required';
        } else if (!results.connection.databaseAvailable) {
          results.overall.message = 'System partially operational - database setup needed';
        } else {
          results.overall.message = 'System partially operational - some features may be limited';
        }
      } else {
        results.overall.status = 'failed';
        
        if (!results.configuration.supabaseConfigured) {
          results.overall.message = 'System not configured - missing environment variables';
        } else if (!results.connection.online) {
          results.overall.message = 'System offline - no internet connection';
        } else if (!results.connection.supabaseReachable) {
          results.overall.message = 'System unreachable - cannot connect to Supabase';
        } else {
          results.overall.message = 'System not operational - multiple issues detected';
        }
      }

      console.log('✅ Validation completed:', results.overall.status);
      return results;

    } catch (error) {
      console.error('❌ Validation failed:', error);
      
      results.overall.status = 'failed';
      results.overall.message = `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.overall.recommendations.push('Check browser console for detailed error information');
      
      return results;
    }
  }

  static async runContinuousValidation(
    onUpdate: (results: ValidationResults) => void,
    intervalMs: number = 30000
  ): Promise<() => void> {
    console.log('🔄 Starting continuous validation...');
    
    // Run initial validation
    const initialResults = await this.validate();
    onUpdate(initialResults);
    
    // Set up interval for continuous checking
    const interval = setInterval(async () => {
      try {
        const results = await this.validate();
        onUpdate(results);
      } catch (error) {
        console.error('❌ Continuous validation error:', error);
      }
    }, intervalMs);
    
    // Return cleanup function
    return () => {
      console.log('🛑 Stopping continuous validation');
      clearInterval(interval);
    };
  }

  static formatValidationReport(results: ValidationResults): string {
    const lines = [
      '🔍 DevTrack Africa - System Validation Report',
      '=' .repeat(50),
      '',
      `Overall Status: ${results.overall.status.toUpperCase()}`,
      `Message: ${results.overall.message}`,
      '',
      '📋 Configuration:',
      `  ✓ Supabase Configured: ${results.configuration.supabaseConfigured ? 'Yes' : 'No'}`,
      results.configuration.error ? `  ❌ Error: ${results.configuration.error}` : '',
      '',
      '🔗 Connection:',
      `  ✓ Online: ${results.connection.online ? 'Yes' : 'No'}`,
      `  ✓ Supabase Reachable: ${results.connection.supabaseReachable ? 'Yes' : 'No'}`,
      `  ✓ Database Available: ${results.connection.databaseAvailable ? 'Yes' : 'No'}`,
      results.connection.error ? `  ❌ Error: ${results.connection.error}` : '',
      '',
      '🔐 Authentication:',
      `  ✓ Session Exists: ${results.authentication.sessionExists ? 'Yes' : 'No'}`,
      `  ✓ User Authenticated: ${results.authentication.userAuthenticated ? 'Yes' : 'No'}`,
      `  ✓ Email Confirmed: ${results.authentication.emailConfirmed ? 'Yes' : 'No'}`,
      results.authentication.error ? `  ❌ Error: ${results.authentication.error}` : '',
      '',
      '💡 Recommendations:',
      ...results.overall.recommendations.map(rec => `  • ${rec}`),
      '',
      '=' .repeat(50)
    ].filter(line => line !== ''); // Remove empty strings

    return lines.join('\n');
  }
}

// Export for easy console usage
(window as any).validateSystem = () => {
  AuthConnectionValidator.validate().then(results => {
    console.log(AuthConnectionValidator.formatValidationReport(results));
  });
};

console.log('💡 Tip: Run validateSystem() in console to check system status');