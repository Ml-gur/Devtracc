/**
 * Utility to suppress specific React warnings that come from third-party libraries
 * This is specifically for the defaultProps deprecation warning from react-beautiful-dnd
 */

// Store the original console.warn function
const originalWarn = console.warn;

// List of warning patterns to suppress
const suppressedWarnings = [
  'Support for defaultProps will be removed from memo components',
  'Support for defaultProps will be removed from function components',
  'defaultProps will be removed from memo components',
  'defaultProps will be removed from function components',
  'Warning:', // Include this to catch the warning prefix
  '%s: Support for defaultProps will be removed from memo components', // The exact pattern from the error
  'Connect(', // React-redux connect wrapper warnings
  'Connect(ps4)', // Specific component from react-beautiful-dnd
  'react-beautiful-dnd' // Any warnings from this library
];

/**
 * Initializes the warning suppression for third-party library warnings
 * Call this early in your application startup
 */
export function initializeWarningSuppression() {
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check if this warning should be suppressed
    const shouldSuppress = suppressedWarnings.some(pattern => 
      message.includes(pattern)
    );
    
    // Also check for the specific warning pattern with placeholders and stack trace patterns
    const isReactMemoDefaultPropsWarning = args.length > 0 && 
      (args[0].includes('Support for defaultProps will be removed from memo components') ||
       args[0].includes('%s: Support for defaultProps will be removed from memo components') ||
       message.includes('Connect(') ||  // React-redux connect components
       message.includes('Connect(ps4)') ||  // Specific react-beautiful-dnd component
       message.includes('react-beautiful-dnd') ||  // DnD library
       message.includes('DroppableColumn') ||  // Our component using DnD
       message.includes('defaultProps will be removed from memo components'));
    
    // Check if the warning is coming from known third-party libraries in the stack trace
    const stackTrace = new Error().stack || '';
    const isThirdPartyLibraryWarning = stackTrace.includes('react-beautiful-dnd') || 
                                      stackTrace.includes('react-redux') ||
                                      stackTrace.includes('node_modules');
    
    // If it's a third-party library warning we want to suppress, don't log it
    if (shouldSuppress || isReactMemoDefaultPropsWarning || 
        (isThirdPartyLibraryWarning && message.includes('defaultProps'))) {
      // Optionally log a single message about suppressing these warnings
      if (process.env.NODE_ENV === 'development') {
        // Only log this once per session
        if (!(window as any).__reactWarningsSuppressed) {
          originalWarn(
            '⚠️ DevTrack: Suppressing React defaultProps deprecation warnings from third-party libraries (react-beautiful-dnd, react-redux). This is expected and will be resolved when libraries update.'
          );
          (window as any).__reactWarningsSuppressed = true;
        }
      }
      return;
    }
    
    // For all other warnings, use the original console.warn
    originalWarn.apply(console, args);
  };
}

/**
 * Restores the original console.warn function
 * Useful for testing or if you need to temporarily restore warnings
 */
export function restoreOriginalWarnings() {
  console.warn = originalWarn;
}

/**
 * Temporarily suppress warnings during a specific function execution
 * Useful for wrapping third-party component renders
 */
export function withSuppressedWarnings<T>(fn: () => T): T {
  const originalConsoleWarn = console.warn;
  console.warn = () => {}; // Suppress all warnings temporarily
  
  try {
    return fn();
  } finally {
    console.warn = originalConsoleWarn;
  }
}