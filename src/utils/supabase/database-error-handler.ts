/**
 * Database Error Handler for DevTrack Africa
 * Provides user-friendly error handling and guidance for database-related errors
 */

export interface DatabaseError {
  code: string;
  message: string;
  userMessage: string;
  action: 'setup_database' | 'check_connection' | 'retry' | 'contact_support' | 'none';
  severity: 'low' | 'medium' | 'high';
  canContinueOffline: boolean;
}

export class DatabaseErrorHandler {
  /**
   * Parse a database error and provide user-friendly information
   */
  static handleError(error: any): DatabaseError {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code || '';
    const originalMessage = error?.message || 'Unknown error';

    // Table not found / Database not set up
    if (errorCode === '42P01' || 
        errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
        errorMessage.includes('users') && errorMessage.includes('not found') ||
        errorMessage.includes('table') && errorMessage.includes('not')) {
      
      return {
        code: 'TABLE_NOT_FOUND',
        message: originalMessage,
        userMessage: 'Database tables are not set up yet. You can continue using the app offline or set up cloud sync.',
        action: 'setup_database',
        severity: 'medium',
        canContinueOffline: true
      };
    }

    // PostgREST not found (could be table or row)
    if (errorCode === 'PGRST116') {
      return {
        code: 'RESOURCE_NOT_FOUND',
        message: originalMessage,
        userMessage: 'The requested data was not found. This might indicate missing database setup.',
        action: 'setup_database',
        severity: 'low',
        canContinueOffline: true
      };
    }

    // Network/Connection errors
    if (errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('unreachable')) {
      
      return {
        code: 'CONNECTION_ERROR',
        message: originalMessage,
        userMessage: 'Unable to connect to the database. Check your internet connection and try again.',
        action: 'check_connection',
        severity: 'medium',
        canContinueOffline: true
      };
    }

    // Authentication/Permission errors
    if (errorMessage.includes('permission') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden') ||
        errorCode === '401' || 
        errorCode === '403') {
      
      return {
        code: 'PERMISSION_ERROR',
        message: originalMessage,
        userMessage: 'You do not have permission to access this resource. Please check your account settings.',
        action: 'contact_support',
        severity: 'high',
        canContinueOffline: true
      };
    }

    // Rate limiting
    if (errorMessage.includes('rate') && errorMessage.includes('limit') ||
        errorMessage.includes('too many requests') ||
        errorCode === '429') {
      
      return {
        code: 'RATE_LIMITED',
        message: originalMessage,
        userMessage: 'Too many requests. Please wait a moment and try again.',
        action: 'retry',
        severity: 'low',
        canContinueOffline: true
      };
    }

    // Database server errors
    if (errorCode.startsWith('5') || // 5xx HTTP errors
        errorMessage.includes('internal server error') ||
        errorMessage.includes('service unavailable') ||
        errorMessage.includes('bad gateway')) {
      
      return {
        code: 'SERVER_ERROR',
        message: originalMessage,
        userMessage: 'Database server is temporarily unavailable. Please try again later.',
        action: 'retry',
        severity: 'medium',
        canContinueOffline: true
      };
    }

    // Syntax or query errors
    if (errorMessage.includes('syntax error') ||
        errorMessage.includes('invalid query') ||
        errorCode === '42601') {
      
      return {
        code: 'QUERY_ERROR',
        message: originalMessage,
        userMessage: 'A database query error occurred. This might be a temporary issue.',
        action: 'retry',
        severity: 'medium',
        canContinueOffline: true
      };
    }

    // Generic fallback
    return {
      code: 'UNKNOWN_ERROR',
      message: originalMessage,
      userMessage: 'An unexpected database error occurred. The app will continue to work offline.',
      action: 'none',
      severity: 'low',
      canContinueOffline: true
    };
  }

  /**
   * Get user-friendly action text based on the error
   */
  static getActionText(action: DatabaseError['action']): string {
    switch (action) {
      case 'setup_database':
        return 'Set up cloud sync';
      case 'check_connection':
        return 'Check connection';
      case 'retry':
        return 'Try again';
      case 'contact_support':
        return 'Contact support';
      default:
        return 'Continue offline';
    }
  }

  /**
   * Get an icon name for the error type
   */
  static getErrorIcon(code: string): string {
    switch (code) {
      case 'TABLE_NOT_FOUND':
        return 'Database';
      case 'CONNECTION_ERROR':
        return 'Wifi';
      case 'PERMISSION_ERROR':
        return 'Lock';
      case 'RATE_LIMITED':
        return 'Clock';
      case 'SERVER_ERROR':
        return 'Server';
      default:
        return 'AlertTriangle';
    }
  }

  /**
   * Check if an error indicates missing database setup
   */
  static isDatabaseSetupNeeded(error: any): boolean {
    const handled = this.handleError(error);
    return handled.action === 'setup_database' && 
           (handled.code === 'TABLE_NOT_FOUND' || handled.code === 'RESOURCE_NOT_FOUND');
  }

  /**
   * Check if the error is temporary and retrying might help
   */
  static isRetryableError(error: any): boolean {
    const handled = this.handleError(error);
    return handled.action === 'retry' || handled.action === 'check_connection';
  }

  /**
   * Get a color class for the error severity
   */
  static getSeverityColor(severity: DatabaseError['severity']): string {
    switch (severity) {
      case 'low':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'medium':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  }
}

export default DatabaseErrorHandler;