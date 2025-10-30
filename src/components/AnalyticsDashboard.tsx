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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Brain, 
  Zap, 
  Clock, 
  Calendar, 
  CheckCircle2,
  Timer,
  Award,
  Flame,
  Activity,
  BarChart3,
  Focus,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Coffee,
  Moon,
  Sun,
  Users,
  Code,
  Layers
} from 'lucide-react';
import { ProductivityMetrics, TimeGoal, ProductivityInsight } from '../types/analytics';

interface AnalyticsDashboardProps {
  userId: string;
  projectId?: string;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

// Enhanced mock data with realistic African developer patterns
const mockMetrics: ProductivityMetrics = {
  totalTimeSpent: 2340, // minutes
  tasksCompleted: 28,
  averageTaskTime: 83.6,
  streakDays: 7,
  weeklyGoalProgress: 78,
  mostProductiveHour: 14,
  timeByProject: {
    'proj1': 1200,
    'proj2': 800,
    'proj3': 340
  },
  timeByPriority: {
    high: 980,
    medium: 860,
    low: 500
  },
  dailyBreakdown: [
    { date: '2024-01-01', minutes: 240 },
    { date: '2024-01-02', minutes: 320 },
    { date: '2024-01-03', minutes: 180 },
    { date: '2024-01-04', minutes: 420 },
    { date: '2024-01-05', minutes: 360 },
    { date: '2024-01-06', minutes: 280 },
    { date: '2024-01-07', minutes: 310 }
  ],
  weeklyBreakdown: [
    { week: 'Week 1', minutes: 1680 },
    { week: 'Week 2', minutes: 1920 },
    { week: 'Week 3', minutes: 1740 },
    { week: 'Week 4', minutes: 2100 }
  ],
  monthlyBreakdown: [
    { month: 'Oct', minutes: 6800 },
    { month: 'Nov', minutes: 7200 },
    { month: 'Dec', minutes: 6400 }
  ]
};

// Enhanced productivity data
const productivityPatterns = [
  { hour: 6, productivity: 30, energy: 40, focus: 25 },
  { hour: 7, productivity: 45, energy: 55, focus: 40 },
  { hour: 8, productivity: 70, energy: 80, focus: 75 },
  { hour: 9, productivity: 85, energy: 90, focus: 88 },
  { hour: 10, productivity: 95, energy: 85, focus: 92 },
  { hour: 11, productivity: 88, energy: 80, focus: 85 },
  { hour: 12, productivity: 65, energy: 60, focus: 70 },
  { hour: 13, productivity: 50, energy: 45, focus: 55 },
  { hour: 14, productivity: 92, energy: 88, focus: 95 },
  { hour: 15, productivity: 88, energy: 85, focus: 90 },
  { hour: 16, productivity: 80, energy: 75, focus: 82 },
  { hour: 17, productivity: 70, energy: 65, focus: 75 },
  { hour: 18, productivity: 55, energy: 50, focus: 60 },
  { hour: 19, productivity: 40, energy: 35, focus: 45 },
  { hour: 20, productivity: 65, energy: 70, focus: 68 },
  { hour: 21, productivity: 75, energy: 80, focus: 78 },
  { hour: 22, productivity: 60, energy: 55, focus: 65 }
];

const codeComplexityData = [
  { week: 'W1', simple: 12, medium: 8, complex: 3, bugs: 2 },
  { week: 'W2', simple: 15, medium: 12, complex: 5, bugs: 1 },
  { week: 'W3', simple: 18, medium: 10, complex: 7, bugs: 3 },
  { week: 'W4', simple: 20, medium: 15, complex: 9, bugs: 2 }
];

const skillRadarData = [
  { skill: 'Frontend', current: 85, target: 90 },
  { skill: 'Backend', current: 78, target: 85 },
  { skill: 'Database', current: 72, target: 80 },
  { skill: 'DevOps', current: 65, target: 75 },
  { skill: 'Testing', current: 70, target: 80 },
  { skill: 'Architecture', current: 68, target: 78 }
];

const velocityData = [
  { sprint: 'S1', planned: 21, completed: 18, velocity: 0.86 },
  { sprint: 'S2', planned: 24, completed: 22, velocity: 0.92 },
  { sprint: 'S3', planned: 26, completed: 25, velocity: 0.96 },
  { sprint: 'S4', planned: 28, completed: 28, velocity: 1.0 },
  { sprint: 'S5', planned: 30, completed: 32, velocity: 1.07 }
];

const mockGoals: TimeGoal[] = [
  {
    id: '1',
    userId: 'user1',
    targetMinutesPerDay: 180,
    targetMinutesPerWeek: 1260,
    goalType: 'weekly',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const intelligentInsights: ProductivityInsight[] = [
  {
    id: '1',
    type: 'performance',
    title: 'Peak Performance Window Identified',
    description: 'Your highest productivity occurs between 9-11 AM and 2-4 PM. Consider scheduling complex tasks during these windows.',
    icon: '🎯',
    priority: 'high',
    actionable: true,
    actionText: 'Optimize Schedule',
    createdAt: '2024-01-07T10:00:00Z'
  },
  {
    id: '2',
    type: 'streak',
    title: 'Consistency Streak: 7 Days',
    description: 'You\'ve maintained consistent development activity. Your momentum is building strong habits.',
    icon: '🔥',
    priority: 'high',
    createdAt: '2024-01-07T10:00:00Z'
  },
  {
    id: '3',
    type: 'skill',
    title: 'Frontend Skills Accelerating',
    description: 'Your frontend development velocity has increased 23% this month. Consider taking on more challenging UI projects.',
    icon: '📈',
    priority: 'medium',
    actionable: true,
    actionText: 'Explore Advanced Projects',
    createdAt: '2024-01-06T15:00:00Z'
  },
  {
    id: '4',
    type: 'efficiency',
    title: 'Task Complexity Sweet Spot',
    description: 'You complete medium-complexity tasks 18% faster than average. Focus on this complexity level for maximum impact.',
    icon: '⚡',
    priority: 'medium',
    createdAt: '2024-01-05T12:00:00Z'
  }
];

const THEME_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))', 
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  accent: 'hsl(var(--chart-5))',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
};

export default function AnalyticsDashboard({ 
  userId, 
  projectId, 
  timeRange, 
  onTimeRangeChange 
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<ProductivityMetrics>(mockMetrics);
  const [goals, setGoals] = useState<TimeGoal[]>(mockGoals);
  const [insights, setInsights] = useState<ProductivityInsight[]>(intelligentInsights);
  const [selectedTab, setSelectedTab] = useState('intelligence');

  // Intelligent calculations
  const smartMetrics = useMemo(() => {
    const avgDailyTime = metrics.totalTimeSpent / 7;
    const productivityScore = Math.round((metrics.tasksCompleted / (metrics.totalTimeSpent / 60)) * 100);
    const efficiencyTrend = '+12%'; // Would be calculated from historical data
    const focusIndex = Math.round((metrics.averageTaskTime / 90) * 100); // 90 min ideal task length
    
    return {
      avgDailyTime,
      productivityScore,
      efficiencyTrend,
      focusIndex,
      peakHours: productivityPatterns.filter(p => p.productivity > 85).map(p => p.hour),
      lowEnergyHours: productivityPatterns.filter(p => p.energy < 50).map(p => p.hour)
    };
  }, [metrics]);

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

  const getTrendIcon = (value: string) => {
    if (value.startsWith('+')) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (value.startsWith('-')) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTimeBreakdownData = () => {
    switch (timeRange) {
      case 'week':
        return metrics.dailyBreakdown.map(item => ({
          ...item,
          name: new Date(item.date).toLocaleDateString('en', { weekday: 'short' })
        }));
      case 'month':
        return metrics.weeklyBreakdown.map(item => ({ ...item, name: item.week }));
      case 'quarter':
      case 'year':
        return metrics.monthlyBreakdown.map(item => ({ ...item, name: item.month }));
      default:
        return metrics.dailyBreakdown;
    }
  };

  const currentGoal = goals.find(goal => goal.isActive);
  const weeklyProgress = currentGoal ? (metrics.totalTimeSpent / currentGoal.targetMinutesPerWeek) * 100 : 0;

  return (
    <div className="space-y-8 p-6">
      {/* Sophisticated Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Development Intelligence</h1>
              <p className="text-muted-foreground">Advanced analytics for African developers building the future</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <Activity className="h-3 w-3" />
            Live Analytics
          </Badge>
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

      {/* Intelligence Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Productivity Score</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{smartMetrics.productivityScore}</p>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(smartMetrics.efficiencyTrend)}
                  <span className="font-medium text-green-600">{smartMetrics.efficiencyTrend}</span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Development Time</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{formatTime(metrics.totalTimeSpent)}</p>
                <div className="flex items-center gap-1 text-sm text-emerald-600">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(smartMetrics.avgDailyTime)} daily avg</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <Code className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Focus Index</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{smartMetrics.focusIndex}%</p>
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <Focus className="h-3 w-3" />
                  <span>Deep work sessions</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Streak Power</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.streakDays} days</p>
                <div className="flex items-center gap-1 text-sm text-purple-600">
                  <Flame className="h-3 w-3" />
                  <span>Momentum building</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligent Insights Panel */}
      <Card className="border-0 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI-Powered Development Insights
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              Smart Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div key={insight.id} className="p-4 bg-card rounded-lg border border-border/50 hover:border-border transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-lg">
                      {insight.icon}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                  
                  {insight.actionable && (
                    <Button variant="outline" size="sm" className="text-xs shrink-0">
                      {insight.actionText}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="intelligence" className="gap-2">
            <Brain className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <Activity className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Layers className="h-4 w-4" />
            Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Productivity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  Daily Productivity Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityPatterns}>
                    <defs>
                      <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={formatHour}
                      stroke="var(--muted-foreground)" 
                      fontSize={12}
                    />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--color-foreground)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="productivity" 
                      stroke={THEME_COLORS.primary}
                      fill="url(#productivityGradient)"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="focus" 
                      stroke={THEME_COLORS.accent}
                      fill="transparent"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Development Velocity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Development Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="sprint" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--color-foreground)'
                      }}
                    />
                    <Bar dataKey="planned" fill={THEME_COLORS.secondary} opacity={0.6} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="completed" fill={THEME_COLORS.primary} radius={[2, 2, 0, 0]} />
                    <Line 
                      type="monotone" 
                      dataKey="velocity" 
                      stroke={THEME_COLORS.accent} 
                      strokeWidth={3}
                      yAxisId="right"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy vs Focus Correlation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-amber-500" />
                  Energy vs Focus Correlation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={productivityPatterns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="energy" name="Energy" stroke="var(--muted-foreground)" />
                    <YAxis dataKey="focus" name="Focus" stroke="var(--muted-foreground)" />
                    <ZAxis dataKey="productivity" range={[50, 400]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--color-foreground)'
                      }}
                    />
                    <Scatter fill={THEME_COLORS.primary} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Code Complexity Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-500" />
                  Code Complexity Evolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={codeComplexityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--color-foreground)'
                      }}
                    />
                    <Area type="monotone" dataKey="simple" stackId="1" stroke={THEME_COLORS.success} fill={THEME_COLORS.success} opacity={0.8} />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke={THEME_COLORS.warning} fill={THEME_COLORS.warning} opacity={0.8} />
                    <Area type="monotone" dataKey="complex" stackId="1" stroke={THEME_COLORS.danger} fill={THEME_COLORS.danger} opacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-500" />
                Development Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getTimeBreakdownData()}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis tickFormatter={(value) => formatTime(value)} stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [formatTime(Number(value)), 'Development Time']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--color-foreground)'
                    }}
                  />
                  <Bar dataKey="minutes" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Skills Development Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={skillRadarData}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke={THEME_COLORS.primary}
                    fill={THEME_COLORS.primary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke={THEME_COLORS.accent}
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Goal Progress Section */}
      {currentGoal && (
        <Card className="border-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Weekly Development Goal</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Target: {formatTime(currentGoal.targetMinutesPerWeek)} of focused development time
                </p>
              </div>
              <Badge 
                variant={weeklyProgress >= 100 ? 'default' : weeklyProgress >= 75 ? 'secondary' : 'outline'}
                className="text-sm px-3 py-1"
              >
                {Math.round(weeklyProgress)}% Complete
              </Badge>
            </div>
            
            <div className="space-y-3">
              <Progress value={Math.min(weeklyProgress, 100)} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  {formatTime(metrics.totalTimeSpent)} achieved
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatTime(Math.max(0, currentGoal.targetMinutesPerWeek - metrics.totalTimeSpent))} remaining
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}