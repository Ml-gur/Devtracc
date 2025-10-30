/**
 * Database Availability Manager
 * Acts as a global gate to prevent database operations when tables don't exist
 */

import { supabase } from './supabase/client';

export type DatabaseAvailability = 'unknown' | 'checking' | 'available' | 'unavailable';

class DatabaseAvailabilityManager {
  private static instance: DatabaseAvailabilityManager;
  private availability: DatabaseAvailability = 'unknown';
  private lastCheck = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private checkInProgress = false;
  private listeners: ((availability: DatabaseAvailability) => void)[] = [];

  static getInstance(): DatabaseAvailabilityManager {
    if (!DatabaseAvailabilityManager.instance) {
      DatabaseAvailabilityManager.instance = new DatabaseAvailabilityManager();
    }
    return DatabaseAvailabilityManager.instance;
  }

  /**
   * Check if database is available (with caching)
   */
  async isAvailable(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached result if recent
    if (this.availability !== 'unknown' && (now - this.lastCheck) < this.CACHE_DURATION) {
      return this.availability === 'available';
    }

    // If check is already in progress, wait for it
    if (this.checkInProgress) {
      return new Promise((resolve) => {
        const checkStatus = () => {
          if (!this.checkInProgress) {
            resolve(this.availability === 'available');
          } else {
            setTimeout(checkStatus, 100);
          }
        };
        checkStatus();
      });
    }

    return await this.performCheck();
  }

  /**
   * Perform actual database availability check
   */
  private async performCheck(): Promise<boolean> {
    if (this.checkInProgress) return this.availability === 'available';
    
    this.checkInProgress = true;
    this.setAvailability('checking');

    try {
      console.log('🔍 Checking database availability...');
      
      if (!supabase) {
        console.log('❌ No Supabase client');
        this.setAvailability('unavailable');
        return false;
      }

      // Quick test with short timeout
      const { error } = await Promise.race([
        supabase.from('users').select('count', { count: 'exact', head: true }).limit(1),
        new Promise<{ error: any }>((_, reject) => 
          setTimeout(() => reject({ error: new Error('Timeout') }), 3000)
        )
      ]);

      if (error) {
        const isTableMissing = error.message?.includes('relation') ||
                              error.message?.includes('does not exist') ||
                              error.code === 'PGRST116' ||
                              error.code === '42P01';
        
        if (isTableMissing) {
          console.log('📝 Database tables not found');
        } else {
          console.log('❌ Database error:', error.message);
        }
        
        this.setAvailability('unavailable');
        return false;
      }

      console.log('✅ Database is available');
      this.setAvailability('available');
      return true;

    } catch (error) {
      console.log('❌ Database check failed:', error);
      this.setAvailability('unavailable');
      return false;
    } finally {
      this.checkInProgress = false;
      this.lastCheck = Date.now();
    }
  }

  /**
   * Force a fresh check (bypass cache)
   */
  async forceCheck(): Promise<boolean> {
    this.lastCheck = 0;
    this.availability = 'unknown';
    return await this.performCheck();
  }

  /**
   * Get current availability status
   */
  getAvailability(): DatabaseAvailability {
    return this.availability;
  }

  /**
   * Set availability and notify listeners
   */
  private setAvailability(availability: DatabaseAvailability): void {
    if (this.availability !== availability) {
      this.availability = availability;
      this.notifyListeners();
    }
  }

  /**
   * Add listener for availability changes
   */
  addListener(listener: (availability: DatabaseAvailability) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (availability: DatabaseAvailability) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.availability);
      } catch (error) {
        console.error('Error in database availability listener:', error);
      }
    });
  }

  /**
   * Reset the manager (useful for testing)
   */
  reset(): void {
    this.availability = 'unknown';
    this.lastCheck = 0;
    this.checkInProgress = false;
    this.listeners = [];
  }

  /**
   * Mark database as unavailable (when we know it's not set up)
   */
  markUnavailable(): void {
    this.setAvailability('unavailable');
    this.lastCheck = Date.now();
  }

  /**
   * Mark database as available (after successful setup)
   */
  markAvailable(): void {
    this.setAvailability('available');
    this.lastCheck = Date.now();
  }
}

// Export singleton instance
export const databaseManager = DatabaseAvailabilityManager.getInstance();

/**
 * Helper function to safely execute database operations
 */
export async function withDatabaseCheck<T>(
  operation: () => Promise<T>,
  fallback: T,
  timeout: number = 5000
): Promise<T> {
  try {
    // Check if database is available
    const isAvailable = await databaseManager.isAvailable();
    if (!isAvailable) {
      console.log('📱 Database unavailable, using fallback');
      return fallback;
    }

    // Execute operation with timeout
    return await Promise.race([
      operation(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      )
    ]);

  } catch (error) {
    console.warn('⚠️ Database operation failed, using fallback:', error);
    
    // Mark as unavailable if it's a table missing error
    if (error instanceof Error) {
      const isTableMissing = error.message?.includes('relation') ||
                            error.message?.includes('does not exist') ||
                            error.message?.includes('timeout');
      if (isTableMissing) {
        databaseManager.markUnavailable();
      }
    }
    
    return fallback;
  }
}

/**
 * Simple check if database operations should be attempted
 */
export function isDatabaseAvailable(): boolean {
  return databaseManager.getAvailability() === 'available';
}

/**
 * Wait for database availability check to complete
 */
export async function waitForDatabaseCheck(): Promise<boolean> {
  const availability = databaseManager.getAvailability();
  
  if (availability === 'checking') {
    return new Promise((resolve) => {
      const listener = (newAvailability: DatabaseAvailability) => {
        if (newAvailability !== 'checking') {
          databaseManager.removeListener(listener);
          resolve(newAvailability === 'available');
        }
      };
      databaseManager.addListener(listener);
    });
  }
  
  if (availability === 'unknown') {
    return await databaseManager.isAvailable();
  }
  
  return availability === 'available';
}