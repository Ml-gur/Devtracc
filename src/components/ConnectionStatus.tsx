import React, { useState, useEffect } from 'react';
import { connectionManager, ConnectionStatus as ConnectionStatusType } from '../utils/connection-manager';
import { hasSupabaseConfig } from '../utils/supabase/client';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock, RefreshCw, Database, Server } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface ConnectionStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  onRetry?: () => void;
}

export default function ConnectionStatus({ 
  showDetails = false, 
  compact = false,
  onRetry 
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionStatusType>(connectionManager.getStatus());
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleStatusChange = (newStatus: ConnectionStatusType) => {
      setStatus(newStatus);
      setIsRetrying(false);
    };

    connectionManager.addListener(handleStatusChange);
    
    return () => {
      connectionManager.removeListener(handleStatusChange);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await connectionManager.retryConnection();
      onRetry?.();
    } catch (error) {
      console.error('Retry failed:', error);
    }
    // isRetrying will be set to false when status updates
  };

  const getStatusIcon = () => {
    if (status.checking || isRetrying) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    
    if (!status.online) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    
    if (!hasSupabaseConfig()) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    
    if (!status.supabaseReachable) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    if (!status.databaseAvailable) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isRetrying) {
      return 'Retrying connection...';
    }
    
    return connectionManager.getStatusMessage();
  };

  const getStatusColor = () => {
    if (status.checking || isRetrying) {
      return 'blue';
    }
    
    if (!status.online || !status.supabaseReachable) {
      return 'red';
    }
    
    if (!status.databaseAvailable) {
      return 'yellow';
    }
    
    return 'green';
  };

  const shouldShowErrorState = () => {
    return !status.online || 
           !hasSupabaseConfig() || 
           !status.supabaseReachable || 
           status.error;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm">{getStatusText()}</span>
        {shouldShowErrorState() && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying || status.checking}
            className="ml-2"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        )}
      </div>
    );
  }

  if (!showDetails && connectionManager.isFullyOperational()) {
    return null; // Don't show anything when everything is working
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Connection Status</span>
          </div>
          <Badge variant={getStatusColor() === 'green' ? 'default' : 'destructive'}>
            {connectionManager.isFullyOperational() ? 'Operational' : 'Issues Detected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getStatusText()}</span>
          {shouldShowErrorState() && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying || status.checking}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </>
              )}
            </Button>
          )}
        </div>

        {/* Detailed Status */}
        <Collapsible>
          <CollapsibleTrigger 
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowDetailedView(!showDetailedView)}
          >
            <span>Show details</span>
            <RefreshCw className={`w-3 h-3 transition-transform ${showDetailedView ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3 space-y-3">
            {/* Internet Connection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Internet Connection</span>
              </div>
              <Badge variant={status.online ? 'default' : 'destructive'}>
                {status.online ? 'Connected' : 'Offline'}
              </Badge>
            </div>

            {/* Supabase Configuration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span className="text-sm">Supabase Configuration</span>
              </div>
              <Badge variant={hasSupabaseConfig() ? 'default' : 'destructive'}>
                {hasSupabaseConfig() ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>

            {/* Supabase Server */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span className="text-sm">Supabase Server</span>
              </div>
              <Badge variant={status.supabaseReachable ? 'default' : 'destructive'}>
                {status.supabaseReachable ? 'Reachable' : 'Unreachable'}
              </Badge>
            </div>

            {/* Database Tables */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span className="text-sm">Database Tables</span>
              </div>
              <Badge variant={status.databaseAvailable ? 'default' : 'destructive'}>
                {status.databaseAvailable ? 'Available' : 'Not Available'}
              </Badge>
            </div>

            {/* Last Checked */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last Checked</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {status.lastChecked.toLocaleTimeString()}
              </span>
            </div>

            {/* Error Details */}
            {status.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-red-800 dark:text-red-200">
                      Connection Error
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-300 mt-1">
                      {status.error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}