import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, Database, Wifi, Clock } from 'lucide-react';

interface AppStatusMessageProps {
  databaseConnected: boolean;
  userAuthenticated: boolean;
  profileLoaded: boolean;
  className?: string;
}

export default function AppStatusMessage({ 
  databaseConnected, 
  userAuthenticated, 
  profileLoaded,
  className = '' 
}: AppStatusMessageProps) {
  
  // Determine overall status - online-only application
  const getStatus = () => {
    if (userAuthenticated && profileLoaded && databaseConnected) {
      return {
        type: 'success' as const,
        icon: CheckCircle,
        title: 'DevTrack Africa - Connected',
        message: 'All systems operational. Your data is synchronized and backed up to the cloud.',
        color: 'text-green-700 bg-green-50 border-green-200'
      };
    }
    
    if (userAuthenticated && profileLoaded && !databaseConnected) {
      return {
        type: 'error' as const,
        icon: Database,
        title: 'DevTrack Africa - Connection Required',
        message: 'Database connection lost. Please check your internet connection and refresh the page.',
        color: 'text-red-700 bg-red-50 border-red-200'
      };
    }
    
    if (userAuthenticated && !profileLoaded) {
      return {
        type: 'loading' as const,
        icon: Clock,
        title: 'DevTrack Africa - Loading Profile',
        message: 'Setting up your workspace. Please wait a moment...',
        color: 'text-gray-700 bg-gray-50 border-gray-200'
      };
    }
    
    return {
      type: 'ready' as const,
      icon: Wifi,
      title: 'DevTrack Africa - Ready',
      message: 'Your project management platform is ready. Sign in to get started.',
      color: 'text-gray-700 bg-gray-50 border-gray-200'
    };
  };

  const status = getStatus();
  const IconComponent = status.icon;

  return (
    <Alert className={`${status.color} ${className}`}>
      <div className="flex items-center gap-3">
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{status.title}</h4>
            <Badge 
              variant={status.type === 'success' ? 'default' : status.type === 'error' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {status.type === 'success' && 'Connected'}
              {status.type === 'error' && 'Disconnected'}
              {status.type === 'loading' && 'Loading'}
              {status.type === 'ready' && 'Ready'}
            </Badge>
          </div>
          <AlertDescription className="text-sm">
            {status.message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

// Compact version for header/footer use
export function AppStatusBadge({ 
  databaseConnected, 
  userAuthenticated 
}: { 
  databaseConnected: boolean;
  userAuthenticated: boolean;
}) {
  if (userAuthenticated && databaseConnected) {
    return (
      <Badge className="bg-green-600 text-white text-xs">
        <CheckCircle className="w-3 h-3 mr-1" />
        Connected
      </Badge>
    );
  }
  
  if (userAuthenticated && !databaseConnected) {
    return (
      <Badge variant="destructive" className="text-xs">
        <Database className="w-3 h-3 mr-1" />
        Disconnected
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-xs">
      <Wifi className="w-3 h-3 mr-1" />
      Ready
    </Badge>
  );
}