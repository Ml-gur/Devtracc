import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { LegacyProject as Project } from '../types/project';
import { 
  Search, 
  Plus, 
  Download, 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  Bell,
  Mail,
  Play,
  Pause,
  Square,
  Zap,
  Clock,
  CheckCircle,
  Timer,
  Globe,
  Star
} from 'lucide-react';

interface DonezoStyleDashboardContentProps {
  user: any;
  projects: Project[];
  onProjectCreate: () => void;
}

export default function DonezoStyleDashboardContent({ 
  user, 
  projects = [], 
  onProjectCreate 
}: DonezoStyleDashboardContentProps) {
  const [activeTimer, setActiveTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(5048); // 01:24:08

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTimerTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const projectStats = [
    { 
      title: 'Total Projects', 
      value: projects.length.toString(), 
      change: 'Increased from last month', 
      trend: 'up', 
      icon: '📊', 
      color: 'bg-green-500' 
    },
    { 
      title: 'Completed Projects', 
      value: projects.filter(p => p.status === 'completed').length.toString(), 
      change: 'Increased from last month', 
      trend: 'up', 
      icon: '✅', 
      color: 'bg-white border border-gray-200' 
    },
    { 
      title: 'Active Projects', 
      value: projects.filter(p => p.status === 'active' || p.status === 'in-progress').length.toString(), 
      change: 'Increased from last month', 
      trend: 'up', 
      icon: '⚡', 
      color: 'bg-white border border-gray-200' 
    },
    { 
      title: 'Planning Phase', 
      value: projects.filter(p => p.status === 'planning').length.toString(), 
      change: 'On Discuss', 
      trend: 'neutral', 
      icon: '⏳', 
      color: 'bg-white border border-gray-200' 
    },
  ];

  const teamMembers = [
    { name: 'Alexandra Deff', task: 'Working on Github Project Repository', status: 'Completed', avatar: '👩‍💻' },
    { name: 'Edwin Akanji', task: 'Working on Integrate User Authentication System', status: 'In Progress', avatar: '👨‍💻' },
    { name: 'Isaac Oluwatomilorun', task: 'Working on Develop Search and Filter Functionality', status: 'Pending', avatar: '👨‍💻' },
    { name: 'David Odindi', task: 'Working on Responsive Layout for Homepage', status: 'In Progress', avatar: '👨‍💻' },
  ];

  const recentProjects = projects.slice(0, 5).map(project => ({
    title: project.title,
    due: `Due ${new Date(project.createdAt || Date.now()).toLocaleDateString()}`,
    status: project.status || 'active',
    priority: 'high'
  }));

  const chartData = [
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 95 },
    { day: 'Wed', value: 75 },
    { day: 'Thu', value: 100 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 60 },
    { day: 'Sun', value: 90 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'In Progress':
      case 'in-progress':
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case 'Pending':
      case 'planning':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  // Calculate completion percentage
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalProjects = projects.length;
  const completionPercentage = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <div className="p-6 bg-muted/30 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={onProjectCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
          <Button variant="outline">
            Import Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {projectStats.map((stat, index) => (
          <Card key={index} className={`${index === 0 ? 'bg-green-500 text-white' : 'bg-card border'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-sm ${index === 0 ? 'text-green-100' : 'text-muted-foreground'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${index === 0 ? 'text-white' : 'text-foreground'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  index === 0 ? 'bg-white/20' : 'bg-muted'
                }`}>
                  <span className="text-lg">{stat.icon}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-3 h-3 ${index === 0 ? 'text-green-100' : 'text-green-500'}`} />
                <span className={`text-xs ${index === 0 ? 'text-green-100' : 'text-muted-foreground'}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className={`w-full ${index % 2 === 0 ? 'bg-green-500' : 'bg-gray-200'} rounded-t`}
                      style={{ height: `${item.value}%` }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{item.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Collaboration */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Collaboration</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span>{member.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.task}</p>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Reminders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reminders</CardTitle>
              <Button variant="ghost" size="sm" className="text-green-500">
                + New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Daily Standup Meeting</h4>
                  <p className="text-sm text-muted-foreground">Time: 09:00 am - 09:30 am</p>
                  <Button className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white">
                    Start Meeting
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProjects.length > 0 ? recentProjects.map((project, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {getPriorityIcon(project.priority)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.due}</p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No projects yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={onProjectCreate}
                    >
                      Create First Project
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${completionPercentage * 2.51} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{completionPercentage}%</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Completed ({completedProjects})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Active ({projects.filter(p => p.status === 'active' || p.status === 'in-progress').length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Planning ({projects.filter(p => p.status === 'planning').length})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracker */}
          <Card className="bg-green-500 text-white">
            <CardHeader>
              <CardTitle className="text-white">Time Tracker</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold mb-4">
                {formatTimerTime(timerSeconds)}
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setActiveTimer(!activeTimer)}
                >
                  {activeTimer ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    setActiveTimer(false);
                    setTimerSeconds(0);
                  }}
                >
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}