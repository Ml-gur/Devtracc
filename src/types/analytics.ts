export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductivityMetrics {
  totalTimeSpent: number;
  tasksCompleted: number;
  averageTaskTime: number;
  streakDays: number;
  weeklyGoalProgress: number;
  mostProductiveHour: number;
  timeByProject: { [projectId: string]: number };
  timeByPriority: { high: number; medium: number; low: number };
  dailyBreakdown: { date: string; minutes: number }[];
  weeklyBreakdown: { week: string; minutes: number }[];
  monthlyBreakdown: { month: string; minutes: number }[];
}

export interface TimeGoal {
  id: string;
  userId: string;
  projectId?: string;
  targetMinutesPerDay: number;
  targetMinutesPerWeek: number;
  goalType: 'daily' | 'weekly' | 'project';
  isActive: boolean;
  createdAt: string;
  endDate?: string;
}

export interface ProductivityInsight {
  id: string;
  type: 'streak' | 'milestone' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  actionText?: string;
  createdAt: string;
}