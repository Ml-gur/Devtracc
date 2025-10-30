import { supabase, testSupabaseConnection, hasSupabaseConfig } from './client';

export interface ConnectionStatus {
  online: boolean;
  supabaseReachable: boolean;
  databaseAvailable: boolean;
}

export type DatabaseAvailability = 'available' | 'unavailable' | 'unknown';

class SupabaseConnectionManager {
  private status: ConnectionStatus = {
    online: navigator.onLine,
    supabaseReachable: false,
    databaseAvailable: false
  };
  
  private listeners: ((status: ConnectionStatus) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    console.log('🔵 Initializing Supabase connection manager...');
    
    // Setup online/offline listeners
    window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
    
    // Initial connection check
    await this.checkConnection();
    
    // Start periodic checks
    this.startPeriodicChecks();
    
    this.isInitialized = true;
    console.log('��� Supabase connection manager initialized');
  }

  private handleOnlineStatusChange() {
    const wasOnline = this.status.online;
    this.status.online = navigator.onLine;
    
    console.log(`🔵 Network status changed: ${this.status.online ? 'online' : 'offline'}`);
    
    if (!wasOnline && this.status.online) {
      // Just came online, check connections
      this.checkConnection();
    } else if (!this.status.online) {
      // Just went offline
      this.status.supabaseReachable = false;
      this.status.databaseAvailable = false;
      this.notifyListeners();
    }
  }

  private async checkConnection() {
    console.log('🔍 Checking Supabase connection...');
    
    const previousStatus = { ...this.status };
    
    if (!this.status.online) {
      this.status.supabaseReachable = false;
      this.status.databaseAvailable = false;
    } else if (!hasSupabaseConfig()) {
      // No configuration, assume working for demo mode
      this.status.supabaseReachable = true;
      this.status.databaseAvailable = true;
    } else {
      try {
        // Test Supabase connection
        const supabaseConnected = await testSupabaseConnection();
        this.status.supabaseReachable = supabaseConnected;
        this.status.databaseAvailable = supabaseConnected;
        
        console.log(`🔵 Supabase connection check: ${supabaseConnected ? 'connected' : 'disconnected'}`);
      } catch (error) {
        console.error('❌ Supabase connection check error:', error);
        this.status.supabaseReachable = false;
        this.status.databaseAvailable = false;
      }
    }
    
    // Notify listeners if status changed
    if (this.hasStatusChanged(previousStatus, this.status)) {
      this.notifyListeners();
    }
  }

  private hasStatusChanged(prev: ConnectionStatus, current: ConnectionStatus): boolean {
    return prev.online !== current.online ||
           prev.supabaseReachable !== current.supabaseReachable ||
           prev.databaseAvailable !== current.databaseAvailable;
  }

  private startPeriodicChecks() {
    // Check connection every 30 seconds
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      if (this.status.online) {
        this.checkConnection();
      }
    }, 30000);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('❌ Connection status listener error:', error);
      }
    });
  }

  // Public methods
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  getStatusMessage(): string {
    if (!this.status.online) {
      return 'No internet connection';
    }
    
    if (!hasSupabaseConfig()) {
      return 'Supabase not configured - running in demo mode';
    }
    
    if (!this.status.supabaseReachable) {
      return 'Cannot connect to Supabase servers';
    }
    
    return 'Connected to Supabase';
  }

  addListener(listener: (status: ConnectionStatus) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (status: ConnectionStatus) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  async retryConnection(): Promise<void> {
    console.log('🔄 Retrying Supabase connection...');
    await this.checkConnection();
  }

  destroy() {
    window.removeEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.removeEventListener('offline', this.handleOnlineStatusChange.bind(this));
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.listeners = [];
    this.isInitialized = false;
  }
}

// Database availability manager for Supabase
class SupabaseDatabaseManager {
  private availability: DatabaseAvailability = 'unknown';
  private listeners: ((availability: DatabaseAvailability) => void)[] = [];
  private lastCheck: number = 0;
  private checkTimeout: NodeJS.Timeout | null = null;

  constructor() {
    console.log('🔵 Supabase database manager initialized');
  }

  async isAvailable(): Promise<boolean> {
    const now = Date.now();
    
    // Cache results for 5 minutes
    if (now - this.lastCheck < 5 * 60 * 1000 && this.availability !== 'unknown') {
      return this.availability === 'available';
    }

    return this.forceCheck();
  }

  async forceCheck(): Promise<boolean> {
    console.log('🔍 Checking Supabase database availability...');
    
    try {
      if (!hasSupabaseConfig()) {
        console.log('✅ No Supabase config - assuming database available');
        this.setAvailability('available');
        return true;
      }

      if (!supabase) {
        console.log('❌ No Supabase client available');
        this.setAvailability('unavailable');
        return false;
      }

      // Test database connectivity by checking if users table exists
      // Use a simple select query to test both connection and table existence
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        // Check for various table-not-found error patterns
        const errorMessage = error.message?.toLowerCase() || '';
        const errorCode = error.code;
        
        if (errorCode === '42P01' ||  // PostgreSQL undefined table error
            errorCode === 'PGRST116' || // PostgREST not found
            errorMessage.includes('relation') || 
            errorMessage.includes('does not exist') ||
            errorMessage.includes('table') && errorMessage.includes('not') ||
            errorMessage.includes('users') && errorMessage.includes('not found')) {
          
          console.log('🔧 Database tables not found - setup required for cloud sync (app works offline)');
          console.log('💡 Table error details:', { code: errorCode, message: error.message });
          this.setAvailability('unavailable');
          return false;
        }
        
        // For other errors (connection, permission, etc.)
        console.log('⚠️ Database connection or permission error:', error.message);
        this.setAvailability('unavailable');
        return false;
      }

      // If we get here, the query succeeded (even if no data)
      console.log('✅ Database availability check successful - users table exists and accessible');
      this.setAvailability('available');
      return true;
      
    } catch (error: any) {
      console.error('💥 Database availability check exception:', error);
      
      // Check for network/connection errors
      if (error.message?.includes('fetch') || 
          error.message?.includes('network') ||
          error.message?.includes('connection')) {
        console.log('🌐 Network connectivity issue detected');
      } else if (error.message?.includes('does not exist') ||
                 error.code === '42P01') {
        console.log('🔧 Database table missing detected in catch block');
      }
      
      this.setAvailability('unavailable');
      return false;
    } finally {
      this.lastCheck = Date.now();
    }
  }

  private setAvailability(availability: DatabaseAvailability) {
    if (this.availability !== availability) {
      this.availability = availability;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.availability);
      } catch (error) {
        console.error('❌ Database availability listener error:', error);
      }
    });
  }

  addListener(listener: (availability: DatabaseAvailability) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (availability: DatabaseAvailability) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  getAvailability(): DatabaseAvailability {
    return this.availability;
  }

  reset() {
    this.availability = 'unknown';
    this.lastCheck = 0;
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
      this.checkTimeout = null;
    }
  }
}

// Export singleton instances
export const supabaseConnectionManager = new SupabaseConnectionManager();
export const supabaseDatabaseManager = new SupabaseDatabaseManager();

export { SupabaseConnectionManager, SupabaseDatabaseManager };