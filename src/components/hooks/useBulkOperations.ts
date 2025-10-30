import { useState, useCallback, useMemo } from 'react';
import { Task, TaskStatus } from '../../types/task';

export interface BulkOperations {
  selectedTaskIds: Set<string>;
  isSelectionMode: boolean;
  selectedTasks: Task[];
  selectTask: (taskId: string) => void;
  unselectTask: (taskId: string) => void;
  toggleTaskSelection: (taskId: string) => void;
  selectAll: (tasks: Task[]) => void;
  unselectAll: () => void;
  toggleSelectAll: (tasks: Task[]) => void;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  bulkUpdateStatus: (newStatus: TaskStatus) => Promise<void>;
  bulkDelete: () => Promise<void>;
  bulkUpdatePriority: (priority: 'low' | 'medium' | 'high') => Promise<void>;
  // Add compatibility methods for KanbanBoard
  bulkUpdateTasks: (updates: Partial<Task>) => Promise<void>;
  bulkDeleteTasks: () => Promise<void>;
}

interface UseBulkOperationsProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
}

export function useBulkOperations({
  tasks,
  onTaskUpdate,
  onTaskDelete
}: UseBulkOperationsProps): BulkOperations {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const selectedTasks = useMemo(() => {
    return tasks.filter(task => selectedTaskIds.has(task.id));
  }, [tasks, selectedTaskIds]);

  const selectTask = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => new Set([...prev, taskId]));
  }, []);

  const unselectTask = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  }, []);

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((tasksToSelect: Task[]) => {
    setSelectedTaskIds(new Set(tasksToSelect.map(task => task.id)));
  }, []);

  const unselectAll = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);

  const toggleSelectAll = useCallback((visibleTasks: Task[]) => {
    const allVisible = visibleTasks.every(task => selectedTaskIds.has(task.id));
    if (allVisible) {
      unselectAll();
    } else {
      selectAll(visibleTasks);
    }
  }, [selectedTaskIds, selectAll, unselectAll]);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedTaskIds(new Set());
  }, []);

  const bulkUpdateStatus = useCallback(async (newStatus: TaskStatus) => {
    const updatePromises = Array.from(selectedTaskIds).map(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return Promise.resolve();

      const updates: Partial<Task> = { status: newStatus };
      
      // Add timestamps for status changes
      if (newStatus === 'in_progress' && task.status !== 'in_progress') {
        updates.startedAt = new Date().toISOString();
      } else if (newStatus === 'completed' && task.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      }

      return onTaskUpdate(taskId, updates);
    });

    await Promise.all(updatePromises);
    unselectAll();
  }, [selectedTaskIds, tasks, onTaskUpdate, unselectAll]);

  const bulkDelete = useCallback(async () => {
    const deletePromises = Array.from(selectedTaskIds).map(taskId => 
      onTaskDelete(taskId)
    );

    await Promise.all(deletePromises);
    unselectAll();
  }, [selectedTaskIds, onTaskDelete, unselectAll]);

  const bulkUpdatePriority = useCallback(async (priority: 'low' | 'medium' | 'high') => {
    const updatePromises = Array.from(selectedTaskIds).map(taskId =>
      onTaskUpdate(taskId, { priority })
    );

    await Promise.all(updatePromises);
    unselectAll();
  }, [selectedTaskIds, onTaskUpdate, unselectAll]);

  // Add compatibility methods for KanbanBoard
  const bulkUpdateTasks = useCallback(async (updates: Partial<Task>) => {
    const updatePromises = Array.from(selectedTaskIds).map(taskId =>
      onTaskUpdate(taskId, updates)
    );

    await Promise.all(updatePromises);
    unselectAll();
  }, [selectedTaskIds, onTaskUpdate, unselectAll]);

  const bulkDeleteTasks = useCallback(async () => {
    const deletePromises = Array.from(selectedTaskIds).map(taskId => 
      onTaskDelete(taskId)
    );

    await Promise.all(deletePromises);
    unselectAll();
  }, [selectedTaskIds, onTaskDelete, unselectAll]);

  return {
    selectedTaskIds,
    isSelectionMode,
    selectedTasks,
    selectTask,
    unselectTask,
    toggleTaskSelection,
    selectAll,
    unselectAll,
    toggleSelectAll,
    enterSelectionMode,
    exitSelectionMode,
    bulkUpdateStatus,
    bulkDelete,
    bulkUpdatePriority,
    bulkUpdateTasks,
    bulkDeleteTasks
  };
}