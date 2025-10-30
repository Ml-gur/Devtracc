import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Trash2, 
  Calendar, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, PRIORITY_COLORS, PRIORITY_ICONS, STATUS_LABELS } from '../types/task';

interface TaskDetailModalProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onClose: () => void;
  isTimerActive?: boolean;
  onStartTimer?: () => void;
  onStopTimer?: () => void;
}

export default function TaskDetailModal({
  task,
  onUpdate,
  onDelete,
  onClose,
  isTimerActive = false,
  onStartTimer,
  onStopTimer
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    estimatedHours: task.estimatedHours?.toString() || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      const updates: Partial<Task> = { status: newStatus };
      
      if (newStatus === 'in_progress' && task.status !== 'in_progress') {
        updates.startedAt = new Date().toISOString();
      } else if (newStatus === 'completed' && task.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
        onStopTimer?.(); // Stop timer if running
      }

      await onUpdate(task.id, updates);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    try {
      const updates: Partial<Task> = {
        title: editData.title.trim(),
        description: editData.description.trim() || undefined,
        priority: editData.priority,
        estimatedHours: editData.estimatedHours ? Number(editData.estimatedHours) : undefined
      };

      await onUpdate(task.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusActions = () => {
    const actions = [];
    
    if (task.status !== 'in_progress') {
      actions.push({
        label: 'Start Working',
        action: () => handleStatusChange('in_progress'),
        icon: Play,
        variant: 'default' as const
      });
    }
    
    if (task.status !== 'completed') {
      actions.push({
        label: 'Mark Complete',
        action: () => handleStatusChange('completed'),
        icon: CheckCircle,
        variant: 'default' as const
      });
    }
    
    if (task.status !== 'todo') {
      actions.push({
        label: 'Move to To Do',
        action: () => handleStatusChange('todo'),
        icon: AlertCircle,
        variant: 'outline' as const
      });
    }

    return actions;
  };

  const getTimeWarning = () => {
    if (!task.estimatedHours || task.timeSpentMinutes === 0) return null;
    
    const spentHours = task.timeSpentMinutes / 60;
    const percentage = (spentHours / task.estimatedHours) * 100;
    
    if (percentage > 100) {
      return {
        type: 'error',
        message: `${Math.round(percentage - 100)}% over estimated time`
      };
    } else if (percentage > 80) {
      return {
        type: 'warning', 
        message: `${Math.round(100 - percentage)}% time remaining`
      };
    }
    
    return null;
  };

  const timeWarning = getTimeWarning();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-semibold"
                />
              ) : (
                <DialogTitle className="text-lg">{task.title}</DialogTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isUpdating}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{task.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Task
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <DialogDescription>
            {isEditing ? 'Edit task details and save your changes.' : 'View and manage task details, track time, and update status.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="outline" className="capitalize">
                {STATUS_LABELS[task.status]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Priority:</span>
              {isEditing ? (
                <Select
                  value={editData.priority}
                  onValueChange={(value: TaskPriority) => 
                    setEditData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['low', 'medium', 'high'] as TaskPriority[]).map(priority => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <span>{PRIORITY_ICONS[priority]}</span>
                          <span className="capitalize">{priority}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge 
                  variant="outline" 
                  className={`${PRIORITY_COLORS[task.priority]} text-xs`}
                >
                  {PRIORITY_ICONS[task.priority]} {task.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Description:</span>
            {isEditing ? (
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          <Separator />

          {/* Time Tracking Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Tracking
              </h4>
              
              {task.status === 'in_progress' && (onStartTimer || onStopTimer) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={isTimerActive ? "destructive" : "default"}
                    size="sm"
                    onClick={isTimerActive ? onStopTimer : onStartTimer}
                  >
                    {isTimerActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause Timer
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Start Timer
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Time Spent</span>
                <div className="text-lg font-medium">
                  {formatTime(task.timeSpentMinutes)}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Estimated</span>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={editData.estimatedHours}
                    onChange={(e) => setEditData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="2.5"
                    className="w-20"
                  />
                ) : (
                  <div className="text-lg font-medium">
                    {task.estimatedHours ? `${task.estimatedHours}h` : 'Not set'}
                  </div>
                )}
              </div>
            </div>

            {/* Time Warning */}
            {timeWarning && (
              <div className={`p-3 rounded-lg ${
                timeWarning.type === 'error' 
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}>
                <p className="text-sm">{timeWarning.message}</p>
              </div>
            )}

            {/* Active Timer Indicator */}
            {isTimerActive && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700 font-medium">Timer is running</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
              
              {task.startedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span>{formatDate(task.startedAt)}</span>
                </div>
              )}
              
              {task.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{formatDate(task.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-3">
          {/* Status Actions */}
          {!isEditing && (
            <div className="flex flex-wrap gap-2 w-full">
              {getStatusActions().map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.action}
                  disabled={isUpdating}
                  className="flex items-center gap-1"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Edit Actions */}
          <div className="flex justify-end gap-2 w-full">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editData.title.trim()}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}