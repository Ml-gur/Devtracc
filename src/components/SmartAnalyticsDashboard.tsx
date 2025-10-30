import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Award, 
  Users, 
  CheckCircle,
  Timer,
  BarChart3,
  Zap,
  Flame,
  AlertTriangle,
  Coffee,
  Lightbulb,
  Trophy,
  Activity,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import { Task } from '../types/task';
import { LegacyProject as Project } from '../types/project';
import { ProjectStorage, TaskStorage } from '../utils/local-storage';

interface SmartAnalyticsDashboardProps {
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

interface ProductivityInsight {
  id: string;
  type: 'achievement' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  actionText?: string;
  createdAt: string;
}

interface TimeAnalytics {
  totalTimeSpent: number;
  averageTimePerTask: number;
  tasksCompleted: number;
  productivityScore: number;
  mostProductiveDay: string;
  timeByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  dailyBreakdown: Array<{
    date: string;
    minutes: number;
    tasks: number;
    day: string;
  }>;
  weeklyTrend: Array<{
    week: string;
    minutes: number;
    tasks: number;
  }>;
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981', 
  tertiary: '#f59e0b',
  quaternary: '#ef4444',
  accent: '#8b5cf6',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#dc2626'
};

export default function SmartAnalyticsDashboard({ 
  timeRange, 
  onTimeRangeChange 
}: SmartAnalyticsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load real data from local storage
  const { projects, tasks, analytics, insights } = useMemo(() => {
    const allProjects = ProjectStorage.getAllProjects();
    const allTasksByProject = TaskStorage.getAllTasks();
    const flatTasks = Object.values(allTasksByProject).flat();
    
    const now = new Date();
    let startDate = new Date();
    
    // Calculate date range
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Filter tasks by date range
    const tasksInRange = flatTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= now;
    });

    // Calculate analytics
    const completedTasks = tasksInRange.filter(t => t.status === 'completed');
    const totalTimeSpent = tasksInRange.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0);
    const averageTimePerTask = completedTasks.length > 0 ? totalTimeSpent / completedTasks.length : 0;
    
    // Calculate productivity score (0-100)
    const targetTasksPerDay = 3; // Configurable target
    const daysInRange = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const actualTasksPerDay = completedTasks.length / daysInRange;
    const completionRate = tasksInRange.length > 0 ? (completedTasks.length / tasksInRange.length) * 100 : 0;
    const productivityScore = Math.min(100, Math.round((actualTasksPerDay / targetTasksPerDay) * 50 + completionRate * 0.5));

    // Daily breakdown for charts
    const dailyMap = new Map<string, { minutes: number; tasks: number }>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyMap.set(dateKey, { minutes: 0, tasks: 0 });
    }
    
    // Populate with actual data
    tasksInRange.forEach(task => {
      const dateKey = task.updatedAt ? task.updatedAt.split('T')[0] : task.createdAt.split('T')[0];
      if (dailyMap.has(dateKey)) {
        const existing = dailyMap.get(dateKey)!;
        existing.minutes += task.timeSpentMinutes || 0;
        if (task.status === 'completed') {
          existing.tasks += 1;
        }
      }
    });

    const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      day: dayNames[new Date(date).getDay()],
      minutes: data.minutes,
      tasks: data.tasks
    }));

    // Find most productive day
    const mostProductiveDay = dailyBreakdown.reduce((max, day) => 
      day.minutes > max.minutes ? day : max, dailyBreakdown[0]
    ).day;

    // Time by priority
    const timeByPriority = {
      high: tasksInRange.filter(t => t.priority === 'high').reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0),
      medium: tasksInRange.filter(t => t.priority === 'medium').reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0),
      low: tasksInRange.filter(t => t.priority === 'low').reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0)
    };

    const analytics: TimeAnalytics = {
      totalTimeSpent,
      averageTimePerTask,
      tasksCompleted: completedTasks.length,
      productivityScore,
      mostProductiveDay,
      timeByPriority,
      dailyBreakdown,
      weeklyTrend: [] // Could be implemented for longer time ranges
    };

    // Generate insights
    const generatedInsights: ProductivityInsight[] = [];

    // Achievement insights
    if (completedTasks.length >= 10) {
      generatedInsights.push({
        id: 'milestone-10-tasks',
        type: 'achievement',
        title: '🎉 Task Master!',
        description: `You've completed ${completedTasks.length} tasks this ${timeRange}. Great productivity!`,
        icon: <Trophy className="w-4 h-4" />,
        priority: 'high',
        createdAt: new Date().toISOString()
      });
    }

    if (productivityScore >= 80) {
      generatedInsights.push({
        id: 'high-productivity',
        type: 'achievement',
        title: '⭐ Productivity Star!',
        description: `Your productivity score is ${productivityScore}%. You're crushing it!`,
        icon: <Star className="w-4 h-4" />,
        priority: 'high',
        createdAt: new Date().toISOString()
      });
    }

    // Warning insights
    if (tasksInRange.length > completedTasks.length * 3) {
      generatedInsights.push({
        id: 'too-many-tasks',
        type: 'warning',
        title: '⚠️ Task Overload',
        description: `You have ${tasksInRange.length - completedTasks.length} pending tasks. Consider prioritizing.`,
        icon: <AlertTriangle className="w-4 h-4" />,
        priority: 'high',
        actionable: true,
        actionText: 'Review Tasks',
        createdAt: new Date().toISOString()
      });
    }

    if (totalTimeSpent > 0 && averageTimePerTask > 120) {
      generatedInsights.push({
        id: 'long-task-duration',
        type: 'suggestion',
        title: '💡 Break Down Tasks',
        description: `Your average task takes ${Math.round(averageTimePerTask)} minutes. Consider breaking large tasks into smaller ones.`,
        icon: <Lightbulb className="w-4 h-4" />,
        priority: 'medium',
        actionable: true,
        actionText: 'Learn More',
        createdAt: new Date().toISOString()
      });
    }

    // Suggestion insights
    if (mostProductiveDay && dailyBreakdown.find(d => d.day === mostProductiveDay)?.minutes > 60) {
      generatedInsights.push({
        id: 'productive-day-pattern',
        type: 'suggestion',
        title: '📅 Peak Performance Day',
        description: `${mostProductiveDay} is your most productive day. Schedule important tasks then!`,
        icon: <Calendar className="w-4 h-4" />,
        priority: 'medium',
        actionable: true,
        actionText: 'Set Reminder',
        createdAt: new Date().toISOString()
      });
    }

    if (timeByPriority.high < timeByPriority.low) {
      generatedInsights.push({
        id: 'priority-imbalance',
        type: 'suggestion',
        title: '🎯 Focus on High Priority',
        description: 'You spend more time on low priority tasks. Try focusing on high priority items first.',
        icon: <Target className="w-4 h-4" />,
        priority: 'medium',
        actionable: true,
        actionText: 'Reorder Tasks',
        createdAt: new Date().toISOString()
      });
    }

    return {
      projects: allProjects,
      tasks: tasksInRange,
      analytics,
      insights: generatedInsights.slice(0, 4) // Limit to top 4 insights
    };
  }, [timeRange, refreshTrigger]);

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour} ${period}`;
  };

  const getPriorityData = () => [
    { name: 'High Priority', value: analytics.timeByPriority.high, color: COLORS.danger, percentage: 0 },
    { name: 'Medium Priority', value: analytics.timeByPriority.medium, color: COLORS.warning, percentage: 0 },
    { name: 'Low Priority', value: analytics.timeByPriority.low, color: COLORS.success, percentage: 0 }
  ].map(item => ({
    ...item,
    percentage: analytics.totalTimeSpent > 0 ? Math.round((item.value / analytics.totalTimeSpent) * 100) : 0
  }));

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductivityIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <Activity className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Analytics Dashboard</h1>
          <p className="text-muted-foreground">AI-powered insights to boost your productivity</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="h-8"
          >
            <Activity className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                <p className={`text-2xl font-bold ${getProductivityColor(analytics.productivityScore)}`}>
                  {analytics.productivityScore}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {getProductivityIcon(analytics.productivityScore)}
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Progress value={analytics.productivityScore} className="flex-1" />
              <span className="ml-2 text-xs text-muted-foreground">
                {analytics.productivityScore >= 80 ? 'Excellent' : 
                 analytics.productivityScore >= 60 ? 'Good' : 'Needs Work'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{analytics.tasksCompleted}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {tasks.length - analytics.tasksCompleted} remaining
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Timer className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-600 font-medium">
                {formatTime(analytics.averageTimePerTask)} avg/task
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Day</p>
                <p className="text-2xl font-bold">{analytics.mostProductiveDay}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Zap className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm text-orange-600 font-medium">Most productive</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Productivity Insights
              <Badge variant="secondary" className="ml-2">
                {insights.length} insights
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map(insight => (
              <div 
                key={insight.id} 
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  insight.type === 'achievement' ? 'bg-green-50 border-green-200' :
                  insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                  insight.type === 'suggestion' ? 'bg-blue-50 border-blue-200' :
                  'bg-purple-50 border-purple-200'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'achievement' ? 'bg-green-100' :
                    insight.type === 'warning' ? 'bg-red-100' :
                    insight.type === 'suggestion' ? 'bg-blue-100' :
                    'bg-purple-100'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
                
                {insight.actionable && (
                  <Button variant="outline" size="sm" className="ml-4">
                    {insight.actionText}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Daily Trends</TabsTrigger>
          <TabsTrigger value="priorities">Priority Analysis</TabsTrigger>
          <TabsTrigger value="projects">Project Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => formatTime(value)} />
                    <Tooltip 
                      formatter={(value: any, name) => [
                        name === 'minutes' ? formatTime(Number(value)) : value,
                        name === 'minutes' ? 'Time Spent' : 'Tasks Completed'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Completion Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Tasks Completed']} />
                    <Bar dataKey="tasks" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent> 
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Time by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getPriorityData().filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {getPriorityData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatTime(Number(value)), 'Time Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Breakdown Cards */}
            <div className="space-y-4">
              {getPriorityData().map((priority, index) => (
                <Card key={priority.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: priority.color }}
                        />
                        <span className="font-medium">{priority.name}</span>
                      </div>
                      <span className="font-bold">{formatTime(priority.value)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{priority.percentage}% of total time</span>
                      <Badge variant="outline">
                        {tasks.filter(t => 
                          (priority.name.includes('High') && t.priority === 'high') ||
                          (priority.name.includes('Medium') && t.priority === 'medium') ||
                          (priority.name.includes('Low') && t.priority === 'low')
                        ).length} tasks
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const completedTasks = projectTasks.filter(t => t.status === 'completed');
              const totalTime = projectTasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);
              const completion = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;

              return (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold truncate">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {projectTasks.length} tasks • {formatTime(totalTime)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(completion)}%</span>
                        </div>
                        <Progress value={completion} />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-medium">{completedTasks.length}/{projectTasks.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {projects.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <Coffee className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No projects found for this time period.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first project to see analytics here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}