import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  GitCommit,
  Activity,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw,
  Award,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Brain,
  Timer,
  Gauge,
} from 'lucide-react';

interface ProjectMetrics {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalTimeSpent: number; // in hours
  averageTaskTime: number;
  completionRate: number;
  velocity: number; // tasks per week
  collaborators: number;
  lastActivity: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'planning' | 'active' | 'on-hold' | 'completed';
}

interface TimeTrackingData {
  date: string;
  hoursWorked: number;
  tasksCompleted: number;
  productivity: number;
  focus: number;
}

interface TaskDistribution {
  name: string;
  value: number;
  color: string;
}

interface ProductivityTrend {
  period: string;
  completed: number;
  inProgress: number;
  blocked: number;
  efficiency: number;
}

interface EnhancedProjectAnalyticsProps {
  userId: string;
  projects: ProjectMetrics[];
}

const EnhancedProjectAnalytics: React.FC<EnhancedProjectAnalyticsProps> = ({
  userId,
  projects,
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockTimeTracking: TimeTrackingData[] = [
    { date: '2024-01-01', hoursWorked: 6, tasksCompleted: 3, productivity: 85, focus: 92 },
    { date: '2024-01-02', hoursWorked: 8, tasksCompleted: 5, productivity: 92, focus: 88 },
    { date: '2024-01-03', hoursWorked: 7, tasksCompleted: 4, productivity: 78, focus: 85 },
    { date: '2024-01-04', hoursWorked: 9, tasksCompleted: 6, productivity: 95, focus: 90 },
    { date: '2024-01-05', hoursWorked: 5, tasksCompleted: 2, productivity: 65, focus: 75 },
    { date: '2024-01-06', hoursWorked: 7, tasksCompleted: 4, productivity: 82, focus: 88 },
    { date: '2024-01-07', hoursWorked: 8, tasksCompleted: 5, productivity: 88, focus: 85 },
  ];

  const mockProductivityTrend: ProductivityTrend[] = [
    { period: 'Week 1', completed: 15, inProgress: 8, blocked: 2, efficiency: 85 },
    { period: 'Week 2', completed: 18, inProgress: 6, blocked: 1, efficiency: 92 },
    { period: 'Week 3', completed: 12, inProgress: 10, blocked: 3, efficiency: 75 },
    { period: 'Week 4', completed: 22, inProgress: 5, blocked: 1, efficiency: 95 },
  ];

  const taskDistribution: TaskDistribution[] = [
    { name: 'Frontend', value: 35, color: '#6366f1' },
    { name: 'Backend', value: 28, color: '#10b981' },
    { name: 'Testing', value: 20, color: '#f59e0b' },
    { name: 'Documentation', value: 12, color: '#ef4444' },
    { name: 'DevOps', value: 5, color: '#8b5cf6' },
  ];

  const calculateOverallMetrics = useMemo(() => {
    const filteredProjects = selectedProject === 'all' 
      ? projects 
      : projects.filter(p => p.id === selectedProject);

    const totalTasks = filteredProjects.reduce((sum, p) => sum + p.totalTasks, 0);
    const completedTasks = filteredProjects.reduce((sum, p) => sum + p.completedTasks, 0);
    const totalTime = filteredProjects.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    const avgCompletionRate = filteredProjects.reduce((sum, p) => sum + p.completionRate, 0) / filteredProjects.length;
    const avgVelocity = filteredProjects.reduce((sum, p) => sum + p.velocity, 0) / filteredProjects.length;

    return {
      totalTasks,
      completedTasks,
      totalTime,
      completionRate: avgCompletionRate || 0,
      velocity: avgVelocity || 0,
      activeProjects: filteredProjects.filter(p => p.status === 'active').length,
    };
  }, [projects, selectedProject]);

  const getProductivityInsights = () => {
    const insights = [];
    
    if (calculateOverallMetrics.completionRate > 90) {
      insights.push({
        type: 'success',
        message: 'Outstanding performance! Your completion rate shows excellent project management skills.',
        icon: <Award className="w-5 h-5" />,
        highlight: 'Exceptional',
      });
    } else if (calculateOverallMetrics.completionRate < 70) {
      insights.push({
        type: 'warning',
        message: 'Consider implementing task breakdown strategies and setting smaller milestones for better success rates.',
        icon: <Brain className="w-5 h-5" />,
        highlight: 'Optimize',
      });
    }

    if (calculateOverallMetrics.velocity > 5) {
      insights.push({
        type: 'success',
        message: 'Impressive velocity! You\'re maintaining excellent development momentum.',
        icon: <Zap className="w-5 h-5" />,
        highlight: 'High Velocity',
      });
    }

    if (calculateOverallMetrics.totalTime > 100) {
      insights.push({
        type: 'info',
        message: 'Great dedication! You\'ve logged significant development time this period.',
        icon: <Timer className="w-5 h-5" />,
        highlight: 'Time Investment',
      });
    }

    return insights;
  };

  const exportData = () => {
    const data = {
      metrics: calculateOverallMetrics,
      timeTracking: mockTimeTracking,
      projects: projects,
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtrack-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, className = "" }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
  }) => (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50"></div>
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground/80 tracking-wide uppercase">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trendValue && (
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  trend === 'up' ? 'text-emerald-600' : 
                  trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {trend === 'up' && <ArrowUp className="w-4 h-4" />}
                  {trend === 'down' && <ArrowDown className="w-4 h-4" />}
                  {trend === 'neutral' && <Minus className="w-4 h-4" />}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Professional Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl"></div>
        <div className="relative bg-white/50 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-lg text-muted-foreground/80 font-medium">
                    Professional insights into your development productivity
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-56 h-11 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-36 h-11 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={refreshData} 
                disabled={loading}
                className="h-11 border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white/90"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button 
                onClick={exportData}
                className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tasks"
          value={calculateOverallMetrics.totalTasks}
          subtitle="Across all projects"
          icon={Target}
          trend="up"
          trendValue="+12% this month"
        />
        <MetricCard
          title="Completion Rate"
          value={`${calculateOverallMetrics.completionRate.toFixed(1)}%`}
          subtitle="Task success rate"
          icon={CheckCircle}
          trend="up"
          trendValue="+5.2% improvement"
        />
        <MetricCard
          title="Time Invested"
          value={`${calculateOverallMetrics.totalTime}h`}
          subtitle="Development hours"
          icon={Clock}
          trend="neutral"
          trendValue="This period"
        />
        <MetricCard
          title="Velocity"
          value={calculateOverallMetrics.velocity.toFixed(1)}
          subtitle="Tasks per week"
          icon={Zap}
          trend="up"
          trendValue="Above average"
        />
      </div>

      {/* Enhanced Productivity Insights */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-blue-50/50 to-indigo-50/50"></div>
        <CardHeader className="relative border-b border-gray-100/50">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span>Intelligence & Insights</span>
            <Badge variant="secondary" className="ml-auto bg-white/80">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative p-6">
          <div className="space-y-4">
            {getProductivityInsights().map((insight, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg ${
                  insight.type === 'success' ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50' :
                  insight.type === 'warning' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200/50' :
                  'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-2xl ${
                    insight.type === 'success' ? 'bg-emerald-500 text-white' :
                    insight.type === 'warning' ? 'bg-amber-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          insight.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                          insight.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {insight.highlight}
                      </Badge>
                    </div>
                    <p className={`text-base font-medium ${
                      insight.type === 'success' ? 'text-emerald-900' :
                      insight.type === 'warning' ? 'text-amber-900' :
                      'text-blue-900'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="border-b border-gray-200/50">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-100/50 p-1 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-xl font-medium">Overview</TabsTrigger>
            <TabsTrigger value="productivity" className="rounded-xl font-medium">Productivity</TabsTrigger>
            <TabsTrigger value="time-tracking" className="rounded-xl font-medium">Time Analytics</TabsTrigger>
            <TabsTrigger value="projects" className="rounded-xl font-medium">Projects</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enhanced Task Distribution */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/30"></div>
              <CardHeader className="relative border-b border-gray-100/50">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                    <PieChartIcon className="w-5 h-5 text-white" />
                  </div>
                  <span>Task Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enhanced Productivity Trends */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-emerald-50/30"></div>
              <CardHeader className="relative border-b border-gray-100/50">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span>Weekly Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={mockProductivityTrend} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#64748b"
                      fontSize={12}
                      fontWeight={500}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      fontWeight={500}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="blocked" fill="#ef4444" name="Blocked" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50/30"></div>
            <CardHeader className="relative border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <span>Productivity & Focus Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockTimeTracking}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#6366f1"
                    strokeWidth={3}
                    name="Productivity %"
                    dot={{ fill: '#6366f1', strokeWidth: 0, r: 6 }}
                    activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="focus"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Focus %"
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-orange-50/30"></div>
            <CardHeader className="relative border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <span>Time Investment Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-6">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockTimeTracking}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hoursWorked"
                    stackId="1"
                    stroke="#f97316"
                    fill="url(#timeGradient)"
                    name="Hours Worked"
                  />
                  <defs>
                    <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 group-hover:to-blue-50/30 transition-colors duration-300"></div>
                <CardHeader className="relative border-b border-gray-100/50 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold truncate">{project.name}</CardTitle>
                    <Badge 
                      variant={
                        project.status === 'active' ? 'default' :
                        project.status === 'completed' ? 'secondary' :
                        project.status === 'on-hold' ? 'destructive' : 'outline'
                      }
                      className="shrink-0 ml-2"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Progress</span>
                      <span className="text-sm font-bold">{project.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={project.completionRate} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tasks</div>
                      <div className="text-lg font-bold">
                        {project.completedTasks}/{project.totalTasks}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</div>
                      <div className="text-lg font-bold">{project.totalTimeSpent}h</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Velocity</div>
                      <div className="text-lg font-bold">{project.velocity}/week</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Team</div>
                      <div className="text-lg font-bold flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {project.collaborators}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProjectAnalytics;