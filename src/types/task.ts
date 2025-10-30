export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  timeSpentMinutes: number;
  position: number;
  createdAt: string;
  completedAt?: string;
  startedAt?: string;
  updatedAt: string;
}

export interface TimeSession {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface TaskProgress {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  totalTimeSpent: number; // in minutes
  completionPercentage: number;
}

export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  high: 'bg-red-100 text-red-800 border-red-200'
};

export const PRIORITY_ICONS = {
  low: '🟢',
  medium: '🟡', 
  high: '🔴'
};

export const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed'
};

export const STATUS_ICONS = {
  todo: '📝',
  in_progress: '⚡',
  completed: '✅'
};