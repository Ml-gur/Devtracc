import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, User, Database, Wifi, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseConnectionManager } from '../utils/supabase/connection-manager';
import { hasSupabaseConfig } from '../utils/supabase/client';

interface AuthDebugStatusProps {
  compact?: boolean;
}

export default function AuthDebugStatus({ compact = false }: AuthDebugStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    user, 
    session, 
    loading, 
    isAuthenticated, 
    isEmailConfirmed, 
    needsProfileSetup,
    error 
  } = useAuth();

  const connectionStatus = supabaseConnectionManager.getStatus();

  const getStatusColor = (status: boolean) => {
    return status ? 'default' : 'destructive';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'OK' : 'FAIL';
  };

  if (compact) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Debug Status</span>
              {!isAuthenticated && <Badge variant="destructive">AUTH ISSUE</Badge>}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-2 p-3 bg-muted rounded-lg text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span>Supabase:</span>
                <Badge variant={getStatusColor(hasSupabaseConfig())} className="text-xs">
                  {getStatusText(hasSupabaseConfig())}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Connection:</span>
                <Badge variant={getStatusColor(connectionStatus.online)} className="text-xs">
                  {getStatusText(connectionStatus.online)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Auth:</span>
                <Badge variant={getStatusColor(isAuthenticated)} className="text-xs">
                  {getStatusText(isAuthenticated)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <Badge variant={getStatusColor(isEmailConfirmed)} className="text-xs">
                  {getStatusText(isEmailConfirmed)}
                </Badge>
              </div>
            </div>
            {error && (
              <div className="text-red-600 dark:text-red-400 mt-2">
                Error: {error}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
          <Settings className="w-5 h-5" />
          <span>Authentication Debug Status</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-orange-900 dark:text-orange-100">Configuration</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Supabase Configured</span>
              <Badge variant={getStatusColor(hasSupabaseConfig())}>
                {getStatusText(hasSupabaseConfig())}
              </Badge>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-orange-900 dark:text-orange-100">Connection</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Internet Connection</span>
              <Badge variant={getStatusColor(connectionStatus.online)}>
                {getStatusText(connectionStatus.online)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Supabase Reachable</span>
              <Badge variant={getStatusColor(connectionStatus.supabaseReachable)}>
                {getStatusText(connectionStatus.supabaseReachable)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Available</span>
              <Badge variant={getStatusColor(connectionStatus.databaseAvailable)}>
                {getStatusText(connectionStatus.databaseAvailable)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-orange-900 dark:text-orange-100">Authentication</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Loading</span>
              <Badge variant={loading ? 'secondary' : 'default'}>
                {loading ? 'YES' : 'NO'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authenticated</span>
              <Badge variant={getStatusColor(isAuthenticated)}>
                {getStatusText(isAuthenticated)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Confirmed</span>
              <Badge variant={getStatusColor(isEmailConfirmed)}>
                {getStatusText(isEmailConfirmed)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Profile Complete</span>
              <Badge variant={getStatusColor(!needsProfileSetup)}>
                {getStatusText(!needsProfileSetup)}
              </Badge>
            </div>
          </div>
        </div>

        {/* User Information */}
        {user && (
          <div className="space-y-2">
            <h4 className="font-medium text-orange-900 dark:text-orange-100">User Info</h4>
            <div className="text-sm space-y-1">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>ID:</strong> {user.id}</div>
            </div>
          </div>
        )}

        {/* Session Information */}
        {session && (
          <div className="space-y-2">
            <h4 className="font-medium text-orange-900 dark:text-orange-100">Session Info</h4>
            <div className="text-sm space-y-1">
              <div><strong>Session ID:</strong> {session.user?.id || 'N/A'}</div>
              <div><strong>Email Confirmed:</strong> {session.user?.email_confirmed_at ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* Error Information */}
        {error && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 dark:text-red-300">Current Error</h4>
            <div className="text-sm p-2 bg-red-100 dark:bg-red-900/30 rounded border text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium text-orange-900 dark:text-orange-100">Troubleshooting</h4>
          <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            {!hasSupabaseConfig() && (
              <div>• Check Supabase configuration in client.ts</div>
            )}
            {!connectionStatus.online && (
              <div>• Check internet connection</div>
            )}
            {!connectionStatus.supabaseReachable && hasSupabaseConfig() && (
              <div>• Supabase may be unreachable - try again in a moment</div>
            )}
            {!isAuthenticated && hasSupabaseConfig() && connectionStatus.supabaseReachable && (
              <div>• Try demo account or create new account</div>
            )}
            {isAuthenticated && !isEmailConfirmed && (
              <div>• Check email for confirmation link</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}