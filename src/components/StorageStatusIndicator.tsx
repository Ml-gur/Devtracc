import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Cloud,
  HardDrive,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { getDatabaseAvailability } from '../utils/database-availability-manager';
import { ProjectStorage, EnhancedLocalStorage } from '../utils/local-storage';

interface StorageStatus {
  database: boolean;
  localStorage: boolean;
  projectsCount: number;
}

export default function StorageStatusIndicator() {
  const [status, setStatus] = useState<StorageStatus>({
    database: false,
    localStorage: false,
    projectsCount: 0
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = () => {
    const dbStatus = getDatabaseAvailability();
    const dbAvailable = dbStatus && typeof dbStatus === 'object' && 'isAvailable' in dbStatus ? dbStatus.isAvailable : false;
    const lsAvailable = EnhancedLocalStorage.isAvailable();

    // Get project count from local storage (as a proxy for data)
    let projectsCount = 0;
    if (lsAvailable) {
      try {
        projectsCount = ProjectStorage.getProjects().length;
      } catch (error) {
        console.warn('Could not get project count:', error);
      }
    }

    setStatus({
      database: dbAvailable,
      localStorage: lsAvailable,
      projectsCount
    });
  };

  const getStatusColor = () => {
    if (status.database) return 'bg-green-100 text-green-800';
    if (status.localStorage) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = () => {
    if (status.database) return <Cloud className="w-3 h-3" />;
    if (status.localStorage) return <HardDrive className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (status.database) return 'Database Connected';
    if (status.localStorage) return 'Local Storage Only';
    return 'Storage Unavailable';
  };

  return (
    <div className="relative">
      <Badge
        className={`${getStatusColor()} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>

      {showDetails && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Storage Status</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={checkStatus}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <span>Database</span>
                </div>
                {status.database ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-orange-500" />
                  <span>Local Storage</span>
                </div>
                {status.localStorage ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Projects Stored</span>
                <span className="font-medium">{status.projectsCount}</span>
              </div>
            </div>

            {!status.database && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Projects won't persist across sessions. Set up Supabase for full persistence.
              </div>
            )}

            <div className="text-xs text-gray-500">
              Click to refresh status
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
