import supabaseAuth from './supabase/auth-client';

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: 'developer' | 'recruiter' | 'admin';
  description: string;
}

// Demo accounts for testing purposes (manual creation required)
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'demo@devtrack.com',
    password: 'DevTrack123!',
    name: 'Alex Developer',
    role: 'developer',
    description: 'Full-stack Developer from Lagos'
  },
  {
    email: 'recruiter@devtrack.com',
    password: 'DevTrack123!',
    name: 'Sarah Recruiter',
    role: 'recruiter',
    description: 'Tech Recruiter at leading startup'
  },
  {
    email: 'admin@devtrack.com',
    password: 'DevTrack123!',
    name: 'Michael Admin',
    role: 'admin',
    description: 'Platform Administrator'
  },
  {
    email: 'test@example.com',
    password: 'DevTrack123!',
    name: 'Test User',
    role: 'developer',
    description: 'Test account for development'
  },
  {
    email: 'demo.user@gmail.com',
    password: 'DevTrack123!',
    name: 'Demo User',
    role: 'developer', 
    description: 'Demo account with common email format'
  }
];

export class DemoAccountManager {
  private static creationAttempted = false;
  private static creationFailed = false;
  private static lastCreationAttempt = 0;
  private static readonly RATE_LIMIT_COOLDOWN = 60000; // 1 minute
  private static rateLimitDetected = false;

  /**
   * Check if an email is a demo account
   */
  static isDemoAccount(email: string): boolean {
    return DEMO_ACCOUNTS.some(account => account.email === email);
  }

  /**
   * Get demo account info
   */
  static getDemoAccount(email: string): DemoAccount | null {
    return DEMO_ACCOUNTS.find(account => account.email === email) || null;
  }

  /**
   * Check if we're in rate limit cooldown
   */
  private static isInRateLimitCooldown(): boolean {
    return this.rateLimitDetected && 
           (Date.now() - this.lastCreationAttempt) < this.RATE_LIMIT_COOLDOWN;
  }

  /**
   * Try to create demo accounts with rate limiting awareness
   */
  static async ensureDemoAccountsExist(): Promise<{ success: boolean; created: number; error?: string }> {
    // Skip if already attempted or in rate limit cooldown
    if (this.creationAttempted || this.isInRateLimitCooldown()) {
      return { 
        success: true, 
        created: 0,
        error: this.isInRateLimitCooldown() ? 'Rate limit cooldown active' : 'Already attempted'
      };
    }

    this.creationAttempted = true;
    this.lastCreationAttempt = Date.now();
    let createdCount = 0;

    try {
      // Add timeout for the entire demo account creation process
      const createAccountsWithTimeout = async () => {
        for (const account of DEMO_ACCOUNTS) {
          try {
            // Add timeout for individual account creation
            const accountCreationPromise = supabaseAuth.signUp({
              fullName: account.name,
              email: account.email,
              password: account.password,
              country: 'Nigeria',
              phone: '+234-xxx-xxx-xxxx'
            });
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Account creation timeout')), 5000)
            );
            
            const result = await Promise.race([accountCreationPromise, timeoutPromise]);

          if (result.success && result.user) {
            createdCount++;
            console.log(`✅ Demo account created: ${account.email}`);
          } else if (result.error) {
            // Handle different types of errors
            if (result.error.includes('already registered') || result.error.includes('already exists')) {
              // Silent - account already exists, this is expected
            } else if (result.error.includes('rate limit') || result.error.includes('too many requests')) {
              // Rate limiting detected - set flag and break
              this.rateLimitDetected = true;
              console.log('ℹ️ Demo account creation rate limited - will retry later');
              break;
            } else if (result.error.includes('invalid') && result.error.includes('email')) {
              // Email validation error - likely means demo emails aren't allowed
              console.log('ℹ️ Demo email format not supported in this Supabase configuration');
              break;
            } else {
              // Other errors - log but continue
              console.log(`ℹ️ Demo account creation skipped for ${account.email}: ${result.error}`);
            }
          }
        } catch (accountError: any) {
          // Handle rate limiting and other errors silently
          if (accountError?.message?.includes('rate limit') || accountError?.message?.includes('too many requests')) {
            this.rateLimitDetected = true;
            break;
          }
          console.log(`ℹ️ Demo account error for ${account.email} (non-critical)`);
        }

          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        return { success: true, created: createdCount };
      };
      
      // Run with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Demo accounts creation timeout')), 30000)
      );
      
      return await Promise.race([createAccountsWithTimeout(), timeoutPromise]);

    } catch (error: any) {
      if (error?.message?.includes('timeout')) {
        console.log('ℹ️ Demo account creation timed out (non-critical)');
        return { success: true, created: 0, error: 'Creation timed out' };
      }
      console.log('ℹ️ Demo account setup completed with issues (non-critical)');
      this.creationFailed = true;
      return { 
        success: true, // Always return success since demo accounts are optional
        created: createdCount,
        error: 'Setup completed with issues' 
      };
    }
  }

  /**
   * Enhanced login for demo accounts with better error handling
   */
  static async signInWithDemoAccount(email: string, password: string): Promise<{
    success: boolean;
    error?: string;
    data?: any;
  }> {
    try {
      // First attempt regular sign in
      const result = await supabaseAuth.signIn(email, password);

      if (result.success && result.user) {
        return { success: true, data: result };
      }

      // If login failed and it's a demo account, try to create it (if not rate limited)
      if (result.error && this.isDemoAccount(email)) {
        const demoAccount = this.getDemoAccount(email);
        
        if (demoAccount && result.error.includes('Invalid login credentials') && !this.isInRateLimitCooldown()) {
          console.log(`🎭 Demo account not found, attempting to create: ${email}`);
          
          try {
            // Try to create the demo account
            const signUpResult = await supabaseAuth.signUp({
              fullName: demoAccount.name,
              email: demoAccount.email,
              password: demoAccount.password,
              country: 'Nigeria',
              phone: '+234-xxx-xxx-xxxx'
            });

            if (signUpResult.success && signUpResult.user) {
              // Account created successfully, but may need email confirmation
              console.log(`✅ Demo account created: ${email}`);
              if (signUpResult.requiresConfirmation) {
                return {
                  success: false,
                  error: 'Demo account created but requires email confirmation. Please check the email address for a confirmation link, or use the Test User option below.'
                };
              }
              
              // Try to sign in again
              const retryResult = await supabaseAuth.signIn(email, password);
              if (retryResult.success && retryResult.user) {
                console.log(`✅ Demo account created and signed in: ${email}`);
                return { success: true, data: retryResult };
              }

              return {
                success: false,
                error: 'Demo account created but sign in failed. Please try again.'
              };
            } else if (signUpResult.error) {
              if (signUpResult.error.includes('already registered') || signUpResult.error.includes('already exists')) {
                return {
                  success: false,
                  error: `Demo account exists but password is incorrect. Use: ${demoAccount.password}`
                };
              } else if (signUpResult.error.includes('rate limit') || signUpResult.error.includes('too many requests')) {
                this.rateLimitDetected = true;
                this.lastCreationAttempt = Date.now();
                return {
                  success: false,
                  error: 'Demo account creation temporarily unavailable. Please try regular registration or wait a moment and try again.'
                };
              } else if (signUpResult.error.includes('invalid') && signUpResult.error.includes('email')) {
                return {
                  success: false,
                  error: 'Demo accounts are not supported in this configuration. Please register with a regular email address.'
                };
              }
              
              return {
                success: false,
                error: 'Demo account setup failed. Please try creating a new account with "Sign up" or use "Test User" mode below.'
              };
            }
          } catch (createError: any) {
            if (createError?.message?.includes('rate limit') || createError?.message?.includes('too many requests')) {
              this.rateLimitDetected = true;
              this.lastCreationAttempt = Date.now();
              return {
                success: false,
                error: 'Demo account creation temporarily unavailable. Please try regular registration or wait a moment and try again.'
              };
            }
            
            return {
              success: false,
              error: 'Demo account creation failed. Please try "Sign up" or "Test User" mode below.'
            };
          }
        } else if (this.isInRateLimitCooldown()) {
          return {
            success: false,
            error: 'Demo account creation temporarily unavailable. Please try regular registration or wait a moment and try again.'
          };
        }
      }

      return {
        success: false,
        error: result.error || 'Login failed'
      };

    } catch (error) {
      console.error('Demo sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Get demo credentials for display
   */
  static getDemoCredentialsText(): string {
    return DEMO_ACCOUNTS.map(account => 
      `${account.name} (${account.role})\nEmail: ${account.email}\nPassword: ${account.password}`
    ).join('\n\n');
  }

  /**
   * Reset rate limiting (for testing)
   */
  static resetRateLimit(): void {
    this.rateLimitDetected = false;
    this.lastCreationAttempt = 0;
  }
}