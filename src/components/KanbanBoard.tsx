import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Plus, Clock, AlertCircle, Keyboard, Info, CheckSquare, Timer } from 'lucide-react';
import { Task, TaskStatus, TaskProgress, STATUS_ICONS, STATUS_LABELS } from '../types/task';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import TaskDetailModal from './TaskDetailModal';
import TaskFiltersComponent, { TaskFilters } from './TaskFilters';
import FilterPresets from './FilterPresets';
import BulkActionsToolbar from './BulkActionsToolbar';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useBulkOperations } from './hooks/useBulkOperations';
import TimerStorage, { ActiveTimer } from '../utils/timer-storage';
import { TaskStorage } from '../utils/enhanced-local-storage';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskTimeUpdate: (taskId: string, minutes: number) => Promise<void>;
  isSaving?: boolean;
}

const COLUMNS: { id: TaskStatus; title: string; icon: string }[] = [
  { id: 'todo', title: STATUS_LABELS.todo, icon: STATUS_ICONS.todo },
  { id: 'in_progress', title: STATUS_LABELS.in_progress, icon: STATUS_ICONS.in_progress },
  { id: 'completed', title: STATUS_LABELS.completed, icon: STATUS_ICONS.completed }
];

const defaultFilters: TaskFilters = {
  search: '',
  priority: 'all',
  status: 'all',
  sortBy: 'created',
  sortOrder: 'desc'
};

// Enhanced draggable task wrapper with selection support
interface DraggableTaskCardProps {
  task: Task;
  onTaskClick: () => void;
  isTimerActive?: boolean;
  onStartTimer: () => void;
  onStopTimer: () => void;
  isDragging?: boolean;
  isFocused?: boolean;
  isKeyboardMode?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelectionToggle: () => void;
  timerStartTime?: number;
  style?: React.CSSProperties;
  [key: string]: any;
}

const DraggableTaskCard = React.memo(React.forwardRef<HTMLDivElement, DraggableTaskCardProps>(({ 
  task, 
  onTaskClick, 
  isTimerActive = false, 
  onStartTimer, 
  onStopTimer, 
  isDragging = false, 
  isFocused = false, 
  isKeyboardMode = false, 
  isSelected = false,
  isSelectionMode = false,
  onSelectionToggle,
  timerStartTime,
  style, 
  ...props 
}, ref) => {
  return (
    <div 
      ref={ref} 
      style={style} 
      {...props}
      className={`relative ${isFocused && isKeyboardMode ? 'ring-2 ring-primary ring-offset-2' : ''} ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
    >
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionToggle}
            className="bg-white shadow-md"
          />
        </div>
      )}
      
      <div 
        className={`${isSelectionMode ? 'ml-8' : ''} transition-all duration-200`}
        onClick={isSelectionMode ? onSelectionToggle : onTaskClick}
      >
        <TaskCard
          task={task}
          onTaskClick={isSelectionMode ? onSelectionToggle : onTaskClick}
          isTimerActive={isTimerActive}
          onStartTimer={onStartTimer}
          onStopTimer={onStopTimer}
          isDragging={isDragging}
          timerStartTime={timerStartTime}
        />
      </div>
    </div>
  );
}));

DraggableTaskCard.displayName = 'DraggableTaskCard';

// New component for virtualized task list
const VirtualizedTaskList = React.memo(({ tasks, columnId, ...rest }: { tasks: Task[], columnId: string, [key: string]: any }) => {
  // We need to render all the draggables, but only the visible ones will have content.
  // This is a requirement for react-beautiful-dnd to work with virtualization.
  return (
    <List
      height={600} // Adjust as needed, or calculate dynamically
      itemCount={tasks.length}
      itemSize={150} // Approximate height of a TaskCard + padding
      width="100%"
      itemData={{ tasks, ...rest }}
    >
      {({ index, style, data }) => {
        const task = data.tasks[index];
        if (!task) return null;

        return (
          <Draggable 
            key={task.id} 
            draggableId={task.id} 
            index={index}
            isDragDisabled={data.bulkOps.isSelectionMode}
          >
            {(provided, snapshot) => (
              <DraggableTaskCard
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{ ...provided.draggableProps.style, ...style }}
                task={task}
                onTaskClick={() => data.setSelectedTask(task)}
                isTimerActive={!!data.activeTimers[task.id]}
                onStartTimer={() => data.startTimer(task.id)}
                onStopTimer={() => data.stopTimer(task.id)}
                isDragging={snapshot.isDragging}
                // Pass other props from itemData
                {...data}
              />
            )}
          </Draggable>
        );
      }}
    </List>
  );
});

interface DroppableColumnProps {
  column: { id: TaskStatus; title: string; icon: string };
  tasks?: Task[];
  isKeyboardMode?: boolean;
  focusedColumn?: string | null;
  bulkOps: any;
  isClient?: boolean;
  hasFilters?: boolean;
  defaultFilters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  setShowAddTask: (show: boolean) => void;
  formatTime: (minutes: number) => string;
  activeTimers?: Record<string, any>;
  startTimer: (taskId: string) => void;
  stopTimer: (taskId: string) => void;
  setSelectedTask: (task: Task) => void;
  focusedTaskId?: string | null;
  restoredTimers?: ActiveTimer[];
  onRestoreTimer?: (taskId: string) => void;
  onDismissRestoredTimer?: (taskId: string) => void;
}

const DroppableColumn = React.memo(function DroppableColumn({
  column,
  tasks = [],
  isKeyboardMode = false,
  focusedColumn = null,
  bulkOps,
  isClient = false,
  hasFilters = false,
  defaultFilters,
  setFilters,
  setShowAddTask,
  formatTime,
  activeTimers = {},
  startTimer,
  stopTimer,
  setSelectedTask,
  focusedTaskId = null,
  restoredTimers = [],
  onRestoreTimer,
  onDismissRestoredTimer
}: DroppableColumnProps) {
  if (!isClient) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{column.icon}</span>
              <span>{column.title}</span>
              <Badge variant="secondary" className="ml-2">
                {tasks.length}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 min-h-[200px]">
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-lg">⏳</span>
            </div>
            <p className="text-sm">Loading board...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-fit ${
      isKeyboardMode && focusedColumn === column.id && !bulkOps.isSelectionMode ? 'ring-2 ring-primary/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bulkOps.isSelectionMode && (
              <Checkbox
                checked={tasks.every(task => 
                  bulkOps.selectedTaskIds.has(task.id)
                ) && tasks.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    tasks.forEach(task => 
                      bulkOps.selectTask(task.id)
                    );
                  } else {
                    tasks.forEach(task => 
                      bulkOps.unselectTask(task.id)
                    );
                  }
                }}
                className="mr-1"
              />
            )}
            
            <span>{column.icon}</span>
            <span>{column.title}</span>
            <Badge variant="secondary" className="ml-2">
              {tasks.length}
            </Badge>
          </div>
          
          {column.id === 'todo' && (
            <Button
              size="sm"
              onClick={() => setShowAddTask(true)}
              className="h-8 w-8 p-0"
              title="Add new task"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          
          {column.id === 'in_progress' && tasks.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(
                tasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0)
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <Droppable droppableId={column.id} isDropDisabled={bulkOps.isSelectionMode}>
        {(provided, snapshot) => (
          <CardContent
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver && !bulkOps.isSelectionMode ? 'bg-muted/50' : ''
            }`}
          >
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {hasFilters ? (
                  <div>
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks match current filters</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters(defaultFilters)}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : column.id === 'todo' ? (
                  <div>
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddTask(true)}
                      className="mt-2"
                    >
                      Add your first task
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center opacity-50">
                      {column.icon}
                    </div>
                    <p className="text-sm">
                      {column.id === 'in_progress' ? 'No active tasks' : 'No completed tasks'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <VirtualizedTaskList
                tasks={tasks}
                columnId={column.id}
                // Pass all necessary props for DraggableTaskCard here
                bulkOps={bulkOps}
                setSelectedTask={setSelectedTask}
                activeTimers={activeTimers}
                startTimer={startTimer}
                stopTimer={stopTimer}
                focusedTaskId={focusedTaskId}
                isKeyboardMode={isKeyboardMode}
              />
            )}
            {provided.placeholder}
          </CardContent>
        )}
      </Droppable>
    </Card>
  );
});

export default function KanbanBoard({
  projectId,
  tasks = [],
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskTimeUpdate,
  isSaving: isSavingProp = false
}: KanbanBoardProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTimers, setActiveTimers] = useState<{ [taskId: string]: { startTime: number; interval: NodeJS.Timeout } }>({});
  const [restoredTimers, setRestoredTimers] = useState<ActiveTimer[]>([]);
  const [showTimerRecovery, setShowTimerRecovery] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ref to track updating state for beforeunload event
  const isUpdatingRef = useRef(isUpdating);
  useEffect(() => {
    isUpdatingRef.current = isUpdating;
  }, [isUpdating]);

  // Prevent navigation while a drag-and-drop save is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUpdatingRef.current) {
        e.preventDefault();
        e.returnValue = 'A task is being saved. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Apply filters to tasks
  const safeTasksArray = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = useTaskFilters(safeTasksArray, filters);

  // Bulk operations
  const bulkOps = useBulkOperations({
    tasks: filteredTasks,
    onTaskUpdate,
    onTaskDelete
  });

  // Group filtered tasks by status
  const tasksByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredTasks
      .filter(task => task?.status === column.id)
      .sort((a, b) => (a?.position || 0) - (b?.position || 0));
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Timer functions
  const formatTime = useCallback((minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }, []);

  const startTimer = useCallback((taskId: string) => {
    if (activeTimers[taskId]) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 60000);
      if (elapsed > 0) {
        onTaskTimeUpdate(taskId, elapsed);
      }
    }, 60000);

    setActiveTimers(prev => ({
      ...prev,
      [taskId]: { startTime, interval }
    }));

    // Remove from restored timers if it exists
    setRestoredTimers(prev => prev.filter(timer => timer.taskId !== taskId));

    console.log('▶️ Timer started for task:', taskId, 'at', new Date(startTime).toISOString());
  }, [activeTimers, onTaskTimeUpdate]);

  const stopTimer = useCallback((taskId: string) => {
    const timer = activeTimers[taskId];
    if (!timer) return;

    clearInterval(timer.interval);
    const totalMinutes = Math.floor((Date.now() - timer.startTime) / 60000);

    if (totalMinutes > 0) {
      onTaskTimeUpdate(taskId, totalMinutes);
    }

    // Remove from storage
    TimerStorage.removeActiveTimer(taskId);

    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[taskId];
      return newTimers;
    });

    console.log('⏹️ Timer stopped for task:', taskId, 'total time:', totalMinutes, 'minutes');
  }, [activeTimers, onTaskTimeUpdate]);

  // Handle restored timer actions
  const handleRestoreTimer = useCallback((taskId: string) => {
    const restoredTimer = restoredTimers.find(t => t.taskId === taskId);
    if (!restoredTimer) return;

    // Start the timer with the original start time
    const startTime = restoredTimer.startTime;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 60000);
      if (elapsed > 0) {
        onTaskTimeUpdate(taskId, elapsed);
      }
    }, 60000);

    setActiveTimers(prev => ({
      ...prev,
      [taskId]: { startTime, interval }
    }));

    // Remove from restored timers
    setRestoredTimers(prev => prev.filter(timer => timer.taskId !== taskId));
  }, [restoredTimers, onTaskTimeUpdate]);

  const handleDismissRestoredTimer = useCallback((taskId: string) => {
    setRestoredTimers(prev => prev.filter(timer => timer.taskId !== taskId));
    TimerStorage.removeActiveTimer(taskId);
  }, []);

  const handleDismissAllRestoredTimers = useCallback(() => {
    restoredTimers.forEach(timer => {
      TimerStorage.removeActiveTimer(timer.taskId);
    });
    setRestoredTimers([]);
    setShowTimerRecovery(false);
  }, [restoredTimers]);

  // Keyboard navigation
  const {
    focusedTaskId,
    focusedColumn,
    isKeyboardMode
  } = useKeyboardNavigation({
    tasks: filteredTasks,
    onTaskSelect: (task) => {
      try {
        if (bulkOps.isSelectionMode) {
          bulkOps.toggleTaskSelection(task.id);
        } else {
          setSelectedTask(task);
        }
      } catch (error) {
        console.error('Error handling task selection:', error);
      }
    },
    onTaskMove: async (taskId: string, newStatus: TaskStatus) => {
      try {
        const task = safeTasksArray.find(t => t.id === taskId);
        if (!task) return;

        const updates: Partial<Task> = { status: newStatus };

        if (newStatus === 'in_progress' && task.status !== 'in_progress') {
          updates.startedAt = new Date().toISOString();
          // Start timer automatically when task moves to in_progress
          startTimer(taskId);
        } else if (newStatus === 'completed' && task.status !== 'completed') {
          updates.completedAt = new Date().toISOString();
          stopTimer(taskId);
        } else if (newStatus === 'todo' && task.status === 'in_progress') {
          // Stop timer when task moves back to todo
          stopTimer(taskId);
        }

        await onTaskUpdate(taskId, updates);
      } catch (error) {
        console.error('Error handling task move:', error);
      }
    },
    enabled: !bulkOps.isSelectionMode
  });

  // Calculate progress from filtered tasks
  const progress: TaskProgress = {
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: filteredTasks.filter(t => t.status === 'in_progress').length,
    todoTasks: filteredTasks.filter(t => t.status === 'todo').length,
    totalTimeSpent: filteredTasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0),
    completionPercentage: filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100) : 0
  };

  // Drag end handler with improved persistence
  const onDragEnd = useCallback(async (result: DropResult) => {
    try {
      setIsUpdating(true);
      setDragError(null);
      const { destination, source, draggableId } = result;

      if (!destination) return;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const taskId = draggableId;
      const newStatus = destination.droppableId as TaskStatus;
      const task = safeTasksArray.find(t => t.id === taskId);

      if (!task) return;

      const updates: Partial<Task> = {
        status: newStatus,
        position: destination.index
      };

      if (newStatus === 'in_progress' && task.status !== 'in_progress') {
        updates.startedAt = new Date().toISOString();
        // Start timer automatically when task moves to in_progress (including from completed)
        console.log('▶️ Starting timer for task moved to In Progress:', taskId);
        startTimer(taskId);
      } else if (newStatus === 'completed' && task.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
        // Stop timer when task moves to completed
        console.log('⏹️ Stopping timer for task moved to Completed:', taskId);
        stopTimer(taskId);
      } else if (newStatus === 'todo' && task.status === 'in_progress') {
        // Stop timer when task moves back to todo
        console.log('⏹️ Stopping timer for task moved back to Todo:', taskId);
        stopTimer(taskId);
      } else if (newStatus === 'todo' && task.status === 'completed') {
        // Clear completed timestamp when moving back to todo
        updates.completedAt = undefined;
        console.log('🔄 Clearing completion timestamp for task moved back to Todo:', taskId);
      }

      // Wait for database update
      await onTaskUpdate(taskId, updates);

      // Success - the parent component handles optimistic updates
      console.log(`✅ Task ${taskId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error handling drag end:', error);
      setDragError('Failed to save task status. Changes reverted.');
    } finally {
      setIsUpdating(false);
    }
  }, [safeTasksArray, onTaskUpdate, stopTimer, startTimer, setIsUpdating, projectId]);

  // Keyboard shortcuts for bulk operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (!bulkOps.isSelectionMode) {
          bulkOps.enterSelectionMode();
        }
        bulkOps.toggleSelectAll(filteredTasks);
      }

      if (e.key === 'Escape') {
        if (bulkOps.isSelectionMode) {
          bulkOps.exitSelectionMode();
        }
      }

      if (e.key === 'm' && !bulkOps.isSelectionMode) {
        e.preventDefault();
        bulkOps.enterSelectionMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bulkOps, filteredTasks]);

  // Handle client-side mounting for react-beautiful-dnd
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Timer restoration on component mount - only restore timers for tasks that are still in progress
  useEffect(() => {
    const restoreTimers = () => {
      const storedTimers = TimerStorage.getActiveTimers();
      const projectTimers = storedTimers.filter(timer => timer.projectId === projectId);

      // Only restore timers for tasks that are currently in 'in_progress' status
      const validTimers = projectTimers.filter(timer => {
        const task = safeTasksArray.find(t => t.id === timer.taskId);
        return task && task.status === 'in_progress';
      });

      // Only restore if we don't already have these timers running
      const timersToRestore = validTimers.filter(timer => !activeTimers[timer.taskId]);

      if (timersToRestore.length > 0) {
        console.log('🔄 Restoring timers for project:', projectId, timersToRestore);
        setRestoredTimers(timersToRestore);
        setShowTimerRecovery(true);

        // Automatically resume timers for tasks in progress
        timersToRestore.forEach(timer => {
          const task = safeTasksArray.find(t => t.id === timer.taskId);
          if (task && task.status === 'in_progress') {
            console.log('▶️ Auto-resuming timer for task:', timer.taskId);
            handleRestoreTimer(timer.taskId);
          }
        });
      }
    };

    // Only run restoration on mount or when project/tasks change, not when activeTimers changes
    restoreTimers();
  }, [projectId, safeTasksArray]); // Removed activeTimers from dependencies

  // Timer persistence - save active timers to storage
  useEffect(() => {
    const saveTimers = () => {
      // Clear existing timers for this project first
      const existingTimers = TimerStorage.getActiveTimers();
      const otherProjectTimers = existingTimers.filter(timer => timer.projectId !== projectId);
      TimerStorage.clearActiveTimers();

      // Save back other project timers
      otherProjectTimers.forEach(timer => TimerStorage.saveActiveTimer(timer));

      // Save current active timers for this project
      Object.entries(activeTimers).forEach(([taskId, timer]) => {
        const task = safeTasksArray.find(t => t.id === taskId);
        if (task && task.status === 'in_progress') {
          const activeTimer: ActiveTimer = {
            taskId,
            startTime: timer.startTime,
            projectId,
            taskTitle: task.title
          };
          TimerStorage.saveActiveTimer(activeTimer);
        }
      });
    };

    // Always save timers when they change
    saveTimers();
  }, [activeTimers, projectId, safeTasksArray]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(activeTimers).forEach(timer => {
        clearInterval(timer.interval);
      });
    };
  }, [activeTimers]);

  const hasFilters = filters.search || filters.priority !== 'all' || filters.status !== 'all' || 
                    filters.sortBy !== 'created' || filters.sortOrder !== 'desc';

  return (
    <div className="space-y-6">
      {/* Filters and Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-4xl">
            <TaskFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              tasks={tasks}
            />
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <FilterPresets
              currentFilters={filters}
              onApplyPreset={setFilters}
              taskCount={tasks.length}
            />
            
            {!bulkOps.isSelectionMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={bulkOps.enterSelectionMode}
                title="Multi-select mode (M)"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Select
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timer Recovery Alert */}
      {showTimerRecovery && restoredTimers.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Timer className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium text-blue-800">
                {restoredTimers.length} timer{restoredTimers.length > 1 ? 's' : ''} restored!
              </span>
              <span className="text-blue-600 ml-2">
                These timers were running when you last left the page.
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismissAllRestoredTimers}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                Dismiss All
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Individual Restored Timer Alerts */}
      {restoredTimers.map((timer) => {
        const task = tasks.find(t => t.id === timer.taskId);
        if (!task) return null;

        const elapsedMinutes = Math.floor((Date.now() - timer.startTime) / 60000);
        const elapsedHours = Math.floor(elapsedMinutes / 60);
        const remainingMinutes = elapsedMinutes % 60;

        return (
          <Alert key={timer.taskId} className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium text-orange-800">
                  Timer for "{timer.taskTitle}"
                </span>
                <span className="text-orange-600 ml-2">
                  has been running for {elapsedHours > 0 ? `${elapsedHours}h ` : ''}{remainingMinutes}m
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreTimer(timer.taskId)}
                  className="text-orange-600 border-orange-300 hover:bg-orange-100"
                >
                  Resume Timer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismissRestoredTimer(timer.taskId)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
      })}

      {/* Error Alert */}
      {dragError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dragError}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDragError(null)}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {dragError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dragError}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDragError(null)}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Keyboard Navigation Help */}
      {isKeyboardMode && !bulkOps.isSelectionMode && (
        <Alert>
          <Keyboard className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Keyboard navigation active. Use arrow keys to navigate, Enter to select, numbers 1-3 to move between columns.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            >
              <Info className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Selection Mode Help */}
      {bulkOps.isSelectionMode && (
        <Alert>
          <CheckSquare className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Multi-select mode active. Click tasks to select, use toolbar below for bulk actions.
              </span>
              <div className="flex gap-2 text-xs">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+A</kbd>
                <span>Select all</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd>
                <span>Exit</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showKeyboardHelp && (
        <Alert>
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Navigation:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>↑↓ - Navigate tasks</li>
                    <li>←→ - Switch columns</li>
                    <li>Tab/Shift+Tab - Column navigation</li>
                  </ul>
                </div>
                <div>
                  <strong>Actions:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>Enter/Space - Open task</li>
                    <li>1/2/3 - Move to column</li>
                    <li>M - Multi-select mode</li>
                    <li>Esc - Exit modes</li>
                  </ul>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.totalTasks}</div>
              <div className="text-sm text-muted-foreground">
                {hasFilters ? 'Filtered Tasks' : 'Total Tasks'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.completedTasks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.inProgressTasks}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(progress.totalTimeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
          </div>
          
          {progress.totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Progress</span>
                <span className="text-sm font-medium">{progress.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
              {progress.completionPercentage >= 25 && progress.completionPercentage % 25 === 0 && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  🎉 {progress.completionPercentage}% Complete! Keep going!
                </div>
              )}
            </div>
          )}

          {hasFilters && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Showing {filteredTasks.length} of {tasks.length} tasks
                {filteredTasks.length !== tasks.length && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setFilters(defaultFilters)}
                    className="ml-2 h-auto p-0 text-blue-600"
                  >
                    Show all tasks
                  </Button>
                )}
              </p>
            </div>
          )}

          {bulkOps.selectedTaskIds.size > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                {bulkOps.selectedTaskIds.size} task{bulkOps.selectedTaskIds.size > 1 ? 's' : ''} selected
                • Use the toolbar below for bulk actions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isClient ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isUpdating ? 'opacity-70 pointer-events-none' : ''}`}>
            {COLUMNS.map(column => (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id] || []}
                isKeyboardMode={isKeyboardMode}
                focusedColumn={focusedColumn}
                bulkOps={bulkOps}
                isClient={true}
                hasFilters={hasFilters}
                defaultFilters={defaultFilters}
                setFilters={setFilters}
                setShowAddTask={setShowAddTask}
                formatTime={formatTime}
                activeTimers={activeTimers}
                startTimer={startTimer}
                stopTimer={stopTimer}
                setSelectedTask={setSelectedTask}
                focusedTaskId={focusedTaskId}
                restoredTimers={restoredTimers}
                onRestoreTimer={handleRestoreTimer}
                onDismissRestoredTimer={handleDismissRestoredTimer}
              />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(column => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              isKeyboardMode={false}
              focusedColumn={null}
              bulkOps={{
                isSelectionMode: false,
                selectedTaskIds: new Set(),
                selectTask: () => {},
                unselectTask: () => {}
              }}
              isClient={false}
              hasFilters={hasFilters}
              defaultFilters={defaultFilters}
              setFilters={setFilters}
              setShowAddTask={setShowAddTask}
              formatTime={formatTime}
              activeTimers={{}}
              startTimer={() => {}}
              stopTimer={() => {}}
              setSelectedTask={() => {}}
              focusedTaskId={null}
            />
          ))}
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {bulkOps.isSelectionMode && bulkOps.selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <BulkActionsToolbar
            selectedTaskIds={Array.from(bulkOps.selectedTaskIds)}
            onBulkUpdate={bulkOps.bulkUpdate}
            onBulkDelete={bulkOps.bulkDelete}
            onClearSelection={bulkOps.clearSelection}
            onExitSelectionMode={bulkOps.exitSelectionMode}
          />
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setShowAddTask(false)}
          onSubmit={onTaskCreate}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          isTimerActive={!!activeTimers[selectedTask.id]}
          onStartTimer={() => startTimer(selectedTask.id)}
          onStopTimer={() => stopTimer(selectedTask.id)}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setShowAddTask(false)}
          onSubmit={onTaskCreate}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          isTimerActive={!!activeTimers[selectedTask.id]}
          onStartTimer={() => startTimer(selectedTask.id)}
          onStopTimer={() => stopTimer(selectedTask.id)}
        />
      )}
    </div>
  );
}