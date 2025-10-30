/**
 * DEPRECATED: Performance Optimization Utilities
 * 
 * This file has been deprecated as DevTrack Africa now operates as a fully online application.
 * Performance optimizations specific to offline functionality are no longer needed.
 * 
 * This file is kept for reference but should not be used in the application.
 */

import React, { useCallback, useRef, useEffect } from 'react';

console.warn('⚠️ performance-optimizer.ts is deprecated. DevTrack Africa now operates fully online.');

/**
 * Basic debounce hook (kept for general use)
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}

/**
 * Basic throttle hook (kept for general use)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}

// Deprecated storage optimization class
export class PerformantStorage {
  static getItem() { 
    console.warn('PerformantStorage is deprecated. Use Supabase for data persistence.');
    return null; 
  }
  static setItem() { 
    console.warn('PerformantStorage is deprecated. Use Supabase for data persistence.');
    return false; 
  }
  static removeItem() { 
    console.warn('PerformantStorage is deprecated. Use Supabase for data persistence.');
  }
  static clearCache() { 
    console.warn('PerformantStorage is deprecated. Use Supabase for data persistence.');
  }
}

/**
 * Basic performance monitoring (kept for general debugging)
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();
  
  static start(label: string): void {
    if ('performance' in window) {
      performance.mark(`${label}-start`);
    }
  }
  
  static end(label: string): number | null {
    if ('performance' in window) {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const entries = performance.getEntriesByName(label, 'measure');
        if (entries.length > 0) {
          const duration = entries[entries.length - 1].duration;
          
          // Store measurement for analysis
          if (!this.measurements.has(label)) {
            this.measurements.set(label, []);
          }
          const measurements = this.measurements.get(label)!;
          measurements.push(duration);
          
          // Keep only last 100 measurements
          if (measurements.length > 100) {
            measurements.shift();
          }
          
          // Clean up performance entries
          performance.clearMarks(`${label}-start`);
          performance.clearMarks(`${label}-end`);
          performance.clearMeasures(label);
          
          return duration;
        }
      } catch (error) {
        console.warn(`Performance measurement failed for ${label}:`, error);
      }
    }
    return null;
  }
  
  static getAverageTime(label: string): number | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) return null;
    
    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }
  
  static logPerformanceReport(): void {
    console.group('DevTrack Performance Report');
    for (const [label, measurements] of this.measurements.entries()) {
      const average = measurements.reduce((acc, val) => acc + val, 0) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);
      
      console.log(`${label}: avg ${average.toFixed(2)}ms, min ${min.toFixed(2)}ms, max ${max.toFixed(2)}ms (${measurements.length} samples)`);
    }
    console.groupEnd();
  }
}

// Deprecated hooks and utilities
export function useIdleCallback() {
  console.warn('useIdleCallback is deprecated in online-only DevTrack Africa.');
}

export function useBatchedUpdates() {
  console.warn('useBatchedUpdates is deprecated in online-only DevTrack Africa.');
}

export function useDeepMemo() {
  console.warn('useDeepMemo is deprecated in online-only DevTrack Africa.');
}

export function withPerformanceMonitoring() {
  console.warn('withPerformanceMonitoring is deprecated in online-only DevTrack Africa.');
}

export class ResourcePreloader {
  static preloadComponent() {
    console.warn('ResourcePreloader is deprecated in online-only DevTrack Africa.');
  }
  static preloadRoute() {
    console.warn('ResourcePreloader is deprecated in online-only DevTrack Africa.');
  }
}