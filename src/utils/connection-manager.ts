import { testSupabaseConnection, testDatabaseAvailability, hasSupabaseConfig } from './supabase/client';

export interface ConnectionStatus {
  online: boolean;
  supabaseReachable: boolean;
  databaseAvailable: boolean;
  lastChecked: Date;
  checking: boolean;
  error?: string;
}

type ConnectionListener = (status: ConnectionStatus) => void;

class ConnectionManager {
  private status: ConnectionStatus = {
    online: navigator.onLine,
    supabaseReachable: false,
    databaseAvailable: false,
    lastChecked: new Date(),
    checking: false
  };

  private listeners: ConnectionListener[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isChecking = false;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 2000; // Start with 2 seconds

  constructor() {
    // Listen for browser online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Start with an immediate check
    this.checkConnections();
    
    // Start periodic connection checks
    this.startPeriodicChecks();
  }

  private handleOnline = () => {
    console.log('🌐 Browser came online');
    this.status.online = true;
    this.status.error = undefined;
    this.retryCount = 0; // Reset retry count when online
    this.checkConnections();
  };

  private handleOffline = () => {
    console.log('🌐 Browser went offline');
    this.status = {
      ...this.status,
      online: false,
      supabaseReachable: false,
      databaseAvailable: false,
      checking: false,
      error: 'No internet connection'
    };
    this.notifyListeners();
  };

  private startPeriodicChecks() {
    // Check connections every 60 seconds
    this.checkInterval = setInterval(() => {
      if (this.status.online && !this.isChecking) {
        this.checkConnections();
      }
    }, 60000);
  }

  public async checkConnections(): Promise<void> {
    if (this.isChecking) {
      console.log('🔄 Connection check already in progress');
      return;
    }

    this.isChecking = true;
    this.status = { ...this.status, checking: true, error: undefined };
    this.notifyListeners();

    console.log('🔍 Checking connections...');

    try {
      // Update online status
      this.status.online = navigator.onLine;
      
      if (!this.status.online) {
        console.log('📱 Browser is offline');
        this.status = {
          ...this.status,
          supabaseReachable: false,
          databaseAvailable: false,
          lastChecked: new Date(),
          checking: false,
          error: 'No internet connection'
        };
        this.notifyListeners();
        return;
      }

      // Check if Supabase is configured
      if (!hasSupabaseConfig()) {
        console.log('⚠️ Supabase not configured');
        this.status = {
          ...this.status,
          supabaseReachable: false,
          databaseAvailable: false,
          lastChecked: new Date(),
          checking: false,
          error: 'Supabase not configured'
        };
        this.notifyListeners();
        return;
      }

      // Test Supabase connection with proper error handling
      let supabaseReachable = false;
      let supabaseError: string | undefined;
      
      try {
        console.log('🔗 Testing Supabase connection...');
        supabaseReachable = await this.testWithTimeout(
          testSupabaseConnection(),
          8000,
          'Supabase connection timeout'
        );
        console.log(`🔗 Supabase reachable: ${supabaseReachable}`);
        
        if (supabaseReachable) {
          this.retryCount = 0; // Reset retry count on success
        }
      } catch (error) {
        console.log('❌ Supabase connection test failed:', error);
        supabaseError = error instanceof Error ? error.message : 'Supabase connection failed';
        supabaseReachable = false;
      }

      this.status.supabaseReachable = supabaseReachable;

      // Test database availability (only if Supabase is reachable)
      let databaseAvailable = false;
      let databaseError: string | undefined;
      
      if (supabaseReachable) {
        try {
          console.log('🗄️ Testing database availability...');
          databaseAvailable = await this.testWithTimeout(
            testDatabaseAvailability(),
            5000,
            'Database connection timeout'
          );
          console.log(`🗄️ Database available: ${databaseAvailable}`);
        } catch (error) {
          console.log('❌ Database availability test failed:', error);
          databaseError = error instanceof Error ? error.message : 'Database connection failed';
          databaseAvailable = false;
        }
      } else {
        databaseAvailable = false;
        databaseError = supabaseError;
      }

      this.status = {
        ...this.status,
        supabaseReachable,
        databaseAvailable,
        lastChecked: new Date(),
        checking: false,
        error: supabaseError || databaseError
      };

      this.notifyListeners();

    } catch (error) {
      console.error('❌ Connection check error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Connection check failed';
      
      this.status = {
        ...this.status,
        supabaseReachable: false,
        databaseAvailable: false,
        lastChecked: new Date(),
        checking: false,
        error: errorMessage
      };
      
      this.notifyListeners();
    } finally {
      this.isChecking = false;
    }
  }

  private async testWithTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    timeoutMessage: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeout)
      )
    ]);
  }

  public async retryConnection(): Promise<void> {
    console.log('🔄 Retrying connection...');
    
    this.retryCount++;
    const delay = Math.min(this.retryDelay * Math.pow(2, this.retryCount - 1), 30000); // Max 30 seconds
    
    if (this.retryCount <= this.maxRetries) {
      console.log(`⏳ Retry attempt ${this.retryCount}/${this.maxRetries}, waiting ${delay}ms...`);
      
      // Add a small delay before retrying
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 2000)));
    }
    
    // Force a fresh connection check
    await this.checkConnections();
    
    // If still failing and we haven't exceeded max retries, schedule another retry
    if (!this.status.supabaseReachable && this.retryCount <= this.maxRetries) {
      setTimeout(() => this.retryConnection(), delay);
    }
  }

  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  public addListener(listener: ConnectionListener): void {
    this.listeners.push(listener);
    // Immediately notify new listeners of current status
    try {
      listener({ ...this.status });
    } catch (error) {
      console.error('❌ Error notifying new connection listener:', error);
    }
  }

  public removeListener(listener: ConnectionListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    const statusCopy = { ...this.status };
    this.listeners.forEach(listener => {
      try {
        listener(statusCopy);
      } catch (error) {
        console.error('❌ Error in connection listener:', error);
      }
    });
  }

  public destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.listeners = [];
  }

  // Get a human-readable status message
  public getStatusMessage(): string {
    if (this.status.checking) {
      return 'Checking connections...';
    }
    
    if (!this.status.online) {
      return 'No internet connection';
    }
    
    if (!hasSupabaseConfig()) {
      return 'Application not configured';
    }
    
    if (!this.status.supabaseReachable) {
      return this.status.error || 'Cannot reach Supabase servers';
    }
    
    if (!this.status.databaseAvailable) {
      return this.status.error || 'Database setup required';
    }
    
    return 'All systems operational';
  }

  // Check if we're in a good state for normal operations
  public isFullyOperational(): boolean {
    return this.status.online && 
           this.status.supabaseReachable && 
           this.status.databaseAvailable &&
           !this.status.checking;
  }

  // Check if we can at least reach Supabase (for auth operations)
  public canAuthenticate(): boolean {
    return this.status.online && 
           this.status.supabaseReachable &&
           !this.status.checking;
  }

  // Check if we have any connection issues
  public hasConnectionIssues(): boolean {
    return !this.status.online || 
           !this.status.supabaseReachable || 
           Boolean(this.status.error);
  }

  // Get detailed status for debugging
  public getDetailedStatus(): string {
    const details = [
      `Online: ${this.status.online}`,
      `Supabase: ${this.status.supabaseReachable}`,
      `Database: ${this.status.databaseAvailable}`,
      `Checking: ${this.status.checking}`,
      `Last checked: ${this.status.lastChecked.toLocaleTimeString()}`,
      `Error: ${this.status.error || 'None'}`
    ];
    
    return details.join(', ');
  }

  // Reset retry counter (useful after successful operations)
  public resetRetryCount(): void {
    this.retryCount = 0;
  }
}

// Create a singleton instance
export const connectionManager = new ConnectionManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  connectionManager.destroy();
});