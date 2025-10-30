import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Wifi, 
  RefreshCw, 
  Settings,
  Loader2 
} from 'lucide-react';
import { supabaseDatabaseManager, DatabaseAvailability } from '../utils/supabase/connection-manager';
import DatabaseErrorHandler, { DatabaseError } from '../utils/supabase/database-error-handler';

interface DatabaseStatusProps {
  availability: DatabaseAvailability;
  onSetupDatabase?: () => void;
  onRetryConnection?: () => void;
  error?: any;
  className?: string;
  showActions?: boolean;
}

export default function DatabaseStatus({ 
  availability, 
  onSetupDatabase, 
  onRetryConnection,
  error,
  className = '',
  showActions = true 
}: DatabaseStatusProps) {
  const [isChecking, setIsChecking] = useState(false);
  
  const handleRecheck = async () => {
    setIsChecking(true);
    try {
      await supabaseDatabaseManager.forceCheck();
    } catch (error) {
      console.error('Failed to recheck database:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = async () => {
    if (onRetryConnection) {
      await onRetryConnection();
    } else {
      await handleRecheck();
    }
  };

  // Handle specific error if provided
  let databaseError: DatabaseError | null = null;
  if (error) {
    databaseError = DatabaseErrorHandler.handleError(error);
  }

  // Determine status based on availability and error
  const getStatusInfo = () => {
    if (databaseError) {
      return {
        status: 'error' as const,
        icon: DatabaseErrorHandler.getErrorIcon(databaseError.code),
        title: 'Database Issue Detected',
        message: databaseError.userMessage,
        color: DatabaseErrorHandler.getSeverityColor(databaseError.severity),
        actionText: DatabaseErrorHandler.getActionText(databaseError.action),
        action: databaseError.action,
        canContinue: databaseError.canContinueOffline
      };
    }

    switch (availability) {
      case 'available':
        return {
          status: 'success' as const,
          icon: 'CheckCircle',
          title: 'Database Connected',
          message: 'Cloud sync is active. Your data is automatically saved and synchronized.',
          color: 'text-green-700 bg-green-100 border-green-200',
          actionText: null,
          action: null,
          canContinue: true
        };
        
      case 'unavailable':
        return {
          status: 'warning' as const,
          icon: 'Database',
          title: 'Database Setup Required',
          message: 'Database tables need to be created for cloud sync. App works offline with local storage.',
          color: 'text-blue-700 bg-blue-100 border-blue-200',
          actionText: 'Set up cloud sync',
          action: 'setup_database',
          canContinue: true
        };
        
      default:
        return {
          status: 'unknown' as const,
          icon: 'RefreshCw',
          title: 'Checking Database',
          message: 'Verifying database connection and setup...',
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          actionText: 'Check again',
          action: 'retry',
          canContinue: true
        };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = getIconComponent(statusInfo.icon);

  return (
    <Alert className={`${statusInfo.color} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isChecking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <IconComponent className="w-4 h-4" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{statusInfo.title}</h4>
            {availability !== 'unknown' && (
              <Badge 
                variant={availability === 'available' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {availability === 'available' ? 'Online' : 'Offline'}
              </Badge>
            )}
          </div>
          
          <AlertDescription className="text-sm">
            {statusInfo.message}
          </AlertDescription>
          
          {databaseError && databaseError.code && (
            <div className="mt-2 text-xs opacity-75">
              Error code: {databaseError.code}
            </div>
          )}
        </div>
        
        {showActions && statusInfo.actionText && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {statusInfo.action === 'setup_database' && onSetupDatabase && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSetupDatabase}
                className="text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                {statusInfo.actionText}
              </Button>
            )}
            
            {(statusInfo.action === 'retry' || statusInfo.action === 'check_connection') && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isChecking}
                className="text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : statusInfo.actionText}
              </Button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
}

// Helper function to get icon component
function getIconComponent(iconName: string) {
  const icons: Record<string, React.ComponentType<any>> = {
    CheckCircle,
    AlertTriangle,
    Database,
    Wifi,
    RefreshCw,
    Settings,
    Loader2
  };
  
  return icons[iconName] || AlertTriangle;
}

// Simplified version for inline use
export function DatabaseStatusBadge({ 
  availability, 
  error 
}: { 
  availability: DatabaseAvailability;
  error?: any;
}) {
  if (error) {
    const databaseError = DatabaseErrorHandler.handleError(error);
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {databaseError.code === 'TABLE_NOT_FOUND' ? 'Setup Required' : 'Error'}
      </Badge>
    );
  }

  switch (availability) {
    case 'available':
      return (
        <Badge variant="default" className="text-xs bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    case 'unavailable':
      return (
        <Badge variant="secondary" className="text-xs">
          <Database className="w-3 h-3 mr-1" />
          Setup Required
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          <RefreshCw className="w-3 h-3 mr-1" />
          Checking
        </Badge>
      );
  }
}