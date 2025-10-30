import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  CheckSquare, 
  Square, 
  X, 
  Trash2, 
  ArrowRight, 
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, PRIORITY_ICONS, STATUS_LABELS } from '../types/task';
import { BulkOperations } from './hooks/useBulkOperations';

interface BulkActionsToolbarProps {
  bulkOps: BulkOperations;
  visibleTasks: Task[];
  isVisible: boolean;
}

export default function BulkActionsToolbar({ 
  bulkOps, 
  visibleTasks, 
  isVisible 
}: BulkActionsToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isVisible || !bulkOps.isSelectionMode) {
    return null;
  }

  const selectedCount = bulkOps.selectedTaskIds.size;
  const allSelected = visibleTasks.length > 0 && visibleTasks.every(task => 
    bulkOps.selectedTaskIds.has(task.id)
  );

  const handleBulkStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      await bulkOps.bulkUpdateStatus(newStatus);
    } catch (error) {
      console.error('Bulk status update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkPriorityChange = async (priority: TaskPriority) => {
    setIsUpdating(true);
    try {
      await bulkOps.bulkUpdatePriority(priority);
    } catch (error) {
      console.error('Bulk priority update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await bulkOps.bulkDelete();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusCounts = () => {
    const counts = { todo: 0, in_progress: 0, completed: 0 };
    bulkOps.selectedTasks.forEach(task => {
      counts[task.status]++;
    });
    return counts;
  };

  const getPriorityCounts = () => {
    const counts = { low: 0, medium: 0, high: 0 };
    bulkOps.selectedTasks.forEach(task => {
      counts[task.priority]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border rounded-lg shadow-lg p-4 min-w-[600px]">
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bulkOps.toggleSelectAll(visibleTasks)}
              className="h-8 w-8 p-0"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedCount} selected
              </Badge>
              
              {selectedCount > 0 && (
                <div className="flex gap-1 text-xs text-muted-foreground">
                  <span>{statusCounts.todo}📝</span>
                  <span>{statusCounts.in_progress}⚡</span>
                  <span>{statusCounts.completed}✅</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <>
                {/* Status Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('todo')}
                    disabled={isUpdating}
                    title="Move to To Do"
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    📝
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('in_progress')}
                    disabled={isUpdating}
                    title="Move to In Progress"
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    ⚡
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('completed')}
                    disabled={isUpdating}
                    title="Mark as Completed"
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    ✅
                  </Button>
                </div>

                {/* Priority Actions */}
                <Select onValueChange={(value) => handleBulkPriorityChange(value as TaskPriority)}>
                  <SelectTrigger className="w-auto h-8">
                    <Flag className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Priority</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <span>{PRIORITY_ICONS.high}</span>
                        <span>High Priority</span>
                        <Badge variant="outline" className="ml-auto">
                          {priorityCounts.high}
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <span>{PRIORITY_ICONS.medium}</span>
                        <span>Medium Priority</span>
                        <Badge variant="outline" className="ml-auto">
                          {priorityCounts.medium}
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <span>{PRIORITY_ICONS.low}</span>
                        <span>Low Priority</span>
                        <Badge variant="outline" className="ml-auto">
                          {priorityCounts.low}
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Delete Action */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Tasks</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedCount} task{selectedCount > 1 ? 's' : ''}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete {selectedCount} Task{selectedCount > 1 ? 's' : ''}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {/* Exit Selection Mode */}
            <Button
              variant="ghost"
              size="sm"
              onClick={bulkOps.exitSelectionMode}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions Helper */}
        {selectedCount > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-4">
                <span>💡 Quick actions: Drag to move, or use buttons above</span>
              </div>
              <div className="flex gap-2">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+A</kbd>
                <span>Select all</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}