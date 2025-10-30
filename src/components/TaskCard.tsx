
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, Play, Pause, Calendar } from 'lucide-react';
import { Task, PRIORITY_COLORS, PRIORITY_ICONS } from '../types/task';

interface TaskCardProps {
  task: Task;
  onTaskClick: () => void;
  isTimerActive?: boolean;
  onStartTimer?: () => void;
  onStopTimer?: () => void;
  isDragging?: boolean;
  timerStartTime?: number; // Add timer start time prop
  isRestoredTimer?: boolean;
  onRestoreTimer?: () => void;
  onDismissRestoredTimer?: () => void;
}

export default function TaskCard({
  task,
  onTaskClick,
  isTimerActive = false,
  onStartTimer,
  onStopTimer,
  isDragging = false,
  timerStartTime,
  isRestoredTimer = false,
  onRestoreTimer,
  onDismissRestoredTimer
}: TaskCardProps) {
  const [currentTimerMinutes, setCurrentTimerMinutes] = useState(0);

  // Update timer display every second when timer is active
  useEffect(() => {
    if (!isTimerActive || !timerStartTime) {
      setCurrentTimerMinutes(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - timerStartTime) / 60000);
      setCurrentTimerMinutes(elapsed);
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [isTimerActive, timerStartTime]);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTimerActive) {
      onStopTimer?.();
    } else {
      onStartTimer?.();
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'shadow-lg opacity-90' : ''
      } ${isTimerActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${
        isRestoredTimer ? 'ring-2 ring-orange-500 ring-opacity-50' : ''
      }`}
      onClick={onTaskClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Priority and Title */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <Badge 
              variant="outline" 
              className={`${PRIORITY_COLORS[task.priority]} text-xs`}
            >
              {PRIORITY_ICONS[task.priority]} {task.priority}
            </Badge>
            
            {task.status === 'in_progress' && (onStartTimer || onStopTimer || isRestoredTimer) && (
              <div className="flex gap-1">
                {isRestoredTimer ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onRestoreTimer?.();
                      }}
                      className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700"
                    >
                      Resume
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDismissRestoredTimer?.();
                      }}
                      className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700"
                    >
                      Dismiss
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTimerClick}
                    className={`h-6 w-6 p-0 ${
                      isTimerActive
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {isTimerActive ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          <h4 className="font-medium line-clamp-2 leading-tight">
            {task.title}
          </h4>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Time and Date Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {(task.timeSpentMinutes > 0 || isTimerActive) && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {isTimerActive 
                    ? formatTime((task.timeSpentMinutes || 0) + currentTimerMinutes)
                    : formatTime(task.timeSpentMinutes)
                  }
                </span>
              </div>
            )}
            
            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <span>Est: {task.estimatedHours}h</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>

        {/* Progress indicator for estimated vs actual time */}
        {task.estimatedHours && task.timeSpentMinutes > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>
                {Math.round((task.timeSpentMinutes / 60 / task.estimatedHours) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all ${
                  (task.timeSpentMinutes / 60) > task.estimatedHours 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (task.timeSpentMinutes / 60 / task.estimatedHours) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Active timer indicator with live time */}
        {isTimerActive && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-blue-700 font-medium">Timer running</span>
            </div>
            {currentTimerMinutes > 0 && (
              <span className="text-xs text-blue-600 font-mono">
                +{formatTime(currentTimerMinutes)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}