import { useEffect, useCallback, useRef, useState } from 'react';
import { Task, TaskStatus } from '../../types/task';

interface KeyboardNavigationOptions {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  enabled: boolean;
}

export function useKeyboardNavigation({
  tasks,
  onTaskSelect,
  onTaskMove,
  enabled
}: KeyboardNavigationOptions) {
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [focusedColumn, setFocusedColumn] = useState<TaskStatus>('todo');
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  // Group tasks by status for navigation
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed')
  };

  const columns: TaskStatus[] = ['todo', 'in_progress', 'completed'];

  const getFocusedTask = useCallback(() => {
    if (!focusedTaskId) return null;
    return tasks.find(task => task.id === focusedTaskId) || null;
  }, [focusedTaskId, tasks]);

  const getTaskIndex = useCallback((taskId: string, status: TaskStatus) => {
    return tasksByStatus[status].findIndex(task => task.id === taskId);
  }, [tasksByStatus]);

  const getColumnIndex = useCallback((status: TaskStatus) => {
    return columns.indexOf(status);
  }, []);

  const moveToNextTask = useCallback(() => {
    const columnTasks = tasksByStatus[focusedColumn];
    if (columnTasks.length === 0) return;

    if (!focusedTaskId) {
      // Focus first task in column
      setFocusedTaskId(columnTasks[0].id);
      return;
    }

    const currentIndex = getTaskIndex(focusedTaskId, focusedColumn);
    if (currentIndex < columnTasks.length - 1) {
      setFocusedTaskId(columnTasks[currentIndex + 1].id);
    }
  }, [focusedTaskId, focusedColumn, tasksByStatus, getTaskIndex]);

  const moveToPreviousTask = useCallback(() => {
    const columnTasks = tasksByStatus[focusedColumn];
    if (columnTasks.length === 0) return;

    if (!focusedTaskId) {
      // Focus last task in column
      setFocusedTaskId(columnTasks[columnTasks.length - 1].id);
      return;
    }

    const currentIndex = getTaskIndex(focusedTaskId, focusedColumn);
    if (currentIndex > 0) {
      setFocusedTaskId(columnTasks[currentIndex - 1].id);
    }
  }, [focusedTaskId, focusedColumn, tasksByStatus, getTaskIndex]);

  const moveToNextColumn = useCallback(() => {
    const currentColumnIndex = getColumnIndex(focusedColumn);
    if (currentColumnIndex < columns.length - 1) {
      const nextColumn = columns[currentColumnIndex + 1];
      setFocusedColumn(nextColumn);
      
      // Try to focus task at same position, or first task
      const columnTasks = tasksByStatus[nextColumn];
      if (columnTasks.length > 0) {
        const currentIndex = focusedTaskId ? getTaskIndex(focusedTaskId, focusedColumn) : 0;
        const targetIndex = Math.min(currentIndex, columnTasks.length - 1);
        setFocusedTaskId(columnTasks[targetIndex].id);
      } else {
        setFocusedTaskId(null);
      }
    }
  }, [focusedColumn, focusedTaskId, tasksByStatus, getColumnIndex, getTaskIndex]);

  const moveToPreviousColumn = useCallback(() => {
    const currentColumnIndex = getColumnIndex(focusedColumn);
    if (currentColumnIndex > 0) {
      const prevColumn = columns[currentColumnIndex - 1];
      setFocusedColumn(prevColumn);
      
      // Try to focus task at same position, or first task
      const columnTasks = tasksByStatus[prevColumn];
      if (columnTasks.length > 0) {
        const currentIndex = focusedTaskId ? getTaskIndex(focusedTaskId, focusedColumn) : 0;
        const targetIndex = Math.min(currentIndex, columnTasks.length - 1);
        setFocusedTaskId(columnTasks[targetIndex].id);
      } else {
        setFocusedTaskId(null);
      }
    }
  }, [focusedColumn, focusedTaskId, tasksByStatus, getColumnIndex, getTaskIndex]);

  const moveTaskToColumn = useCallback((targetStatus: TaskStatus) => {
    if (!focusedTaskId) return;
    
    const task = getFocusedTask();
    if (task && task.status !== targetStatus) {
      onTaskMove(focusedTaskId, targetStatus);
      setFocusedColumn(targetStatus);
    }
  }, [focusedTaskId, getFocusedTask, onTaskMove]);

  const selectFocusedTask = useCallback(() => {
    const task = getFocusedTask();
    if (task) {
      onTaskSelect(task);
    }
  }, [getFocusedTask, onTaskSelect]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !isKeyboardMode) return;

    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveToPreviousTask();
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveToNextTask();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveToPreviousColumn();
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveToNextColumn();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectFocusedTask();
        break;
      case 'Escape':
        event.preventDefault();
        setFocusedTaskId(null);
        setIsKeyboardMode(false);
        break;
      case '1':
        event.preventDefault();
        moveTaskToColumn('todo');
        break;
      case '2':
        event.preventDefault();
        moveTaskToColumn('in_progress');
        break;
      case '3':
        event.preventDefault();
        moveTaskToColumn('completed');
        break;
      case 'Tab':
        if (!event.shiftKey) {
          event.preventDefault();
          moveToNextColumn();
        } else {
          event.preventDefault();
          moveToPreviousColumn();
        }
        break;
    }
  }, [
    enabled,
    isKeyboardMode,
    moveToNextTask,
    moveToPreviousTask,
    moveToNextColumn,
    moveToPreviousColumn,
    selectFocusedTask,
    moveTaskToColumn
  ]);

  // Enable keyboard mode on first keyboard interaction
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
      setIsKeyboardMode(true);
      
      // Focus first task if none focused
      if (!focusedTaskId) {
        const firstColumnWithTasks = columns.find(col => tasksByStatus[col].length > 0);
        if (firstColumnWithTasks) {
          setFocusedColumn(firstColumnWithTasks);
          setFocusedTaskId(tasksByStatus[firstColumnWithTasks][0].id);
        }
      }
    }
  }, [enabled, focusedTaskId, tasksByStatus]);

  // Mouse interaction disables keyboard mode
  const handleMouseMove = useCallback(() => {
    if (isKeyboardMode) {
      setIsKeyboardMode(false);
      setFocusedTaskId(null);
    }
  }, [isKeyboardMode]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleKeyDown, handleKeyPress, handleMouseMove, enabled]);

  // Clear focus when tasks change significantly
  useEffect(() => {
    if (focusedTaskId && !tasks.find(task => task.id === focusedTaskId)) {
      setFocusedTaskId(null);
    }
  }, [tasks, focusedTaskId]);

  return {
    focusedTaskId,
    focusedColumn,
    isKeyboardMode,
    setFocusedTaskId,
    setFocusedColumn
  };
}