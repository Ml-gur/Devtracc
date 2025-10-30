import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
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
import exampleImage from 'figma:asset/ddd1cf385676275fce090e99ede83b1ffe624ba4.png';

interface DonezoStyleDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function DonezoStyleDashboard({ user, onLogout }: DonezoStyleDashboardProps) {
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

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', active: true },
    { icon: CheckCircle, label: 'Tasks', badge: '3' },
    { icon: Calendar, label: 'Calendar' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Users, label: 'Team' },
  ];

  const generalItems = [
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help' },
    { icon: LogOut, label: 'Logout', onClick: onLogout },
  ];

  const projectStats = [
    { title: 'Total Projects', value: '24', change: 'Increased from last month', trend: 'up', icon: '📊', color: 'bg-green-500' },
    { title: 'Ended Projects', value: '10', change: 'Increased from last month', trend: 'up', icon: '✅', color: 'bg-white border border-gray-200' },
    { title: 'Running Projects', value: '12', change: 'Increased from last month', trend: 'up', icon: '⚡', color: 'bg-white border border-gray-200' },
    { title: 'Pending Project', value: '2', change: 'On Discuss', trend: 'neutral', icon: '⏳', color: 'bg-white border border-gray-200' },
  ];

  const teamMembers = [
    { name: 'Alexandra Deff', task: 'Working on Github Project Repository', status: 'Completed', avatar: '👩‍💻' },
    { name: 'Edwin Akanji', task: 'Working on Integrate User Authentication System', status: 'In Progress', avatar: '👨‍💻' },
    { name: 'Isaac Oluwatomilorun', task: 'Working on Develop Search and Filter Functionality', status: 'Pending', avatar: '👨‍💻' },
    { name: 'David Odindi', task: 'Working on Responsive Layout for Homepage', status: 'In Progress', avatar: '👨‍💻' },
  ];

  const projects = [
    { title: 'Develop API Endpoints', due: 'Due Oct 10, 2024', status: 'in-progress', priority: 'high' },
    { title: 'Onboarding Flow', due: 'Due Nov 28, 2024', status: 'pending', priority: 'medium' },
    { title: 'Build Dashboard', due: 'Due Dec 30, 2024', status: 'completed', priority: 'high' },
    { title: 'Optimize Page Load', due: 'Due Dec 6, 2024', status: 'in-progress', priority: 'low' },
    { title: 'Cross-Browser Testing', due: 'Due Dec 6, 2024', status: 'pending', priority: 'medium' },
  ];

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
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case 'Pending':
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DT</span>
            </div>
            <span className="font-semibold text-lg">DevTrack</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4">
          <div className="space-y-1 mb-8">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">MENU</p>
            {sidebarItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  item.active
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-green-100 text-green-700 text-xs">{item.badge}</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">GENERAL</p>
            {generalItems.map((item, index) => (
              <div
                key={index}
                onClick={item.onClick}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download App Card */}
        <div className="p-4">
          <div className="bg-gray-900 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <Download className="w-4 h-4" />
              </div>
              <h4 className="font-medium mb-1">Download our Mobile App</h4>
              <p className="text-xs text-gray-300 mb-3">Get easy to connect away</p>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-xs">
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search task" 
                  className="pl-10 w-80 bg-gray-50 border-0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘ F</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="bg-green-500 text-white text-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Plan, prioritize, and accomplish your tasks with ease.</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
              <Button variant="outline">
                Import Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {projectStats.map((stat, index) => (
              <Card key={index} className={`${stat.color} ${index === 0 ? 'text-white' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-sm ${index === 0 ? 'text-green-100' : 'text-gray-600'}`}>
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-bold ${index === 0 ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3 h-3 ${index === 0 ? 'text-green-100' : 'text-green-500'}`} />
                    <span className={`text-xs ${index === 0 ? 'text-green-100' : 'text-gray-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">
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
                        <span className="text-xs text-gray-600">{item.day}</span>
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
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span>{member.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-600">{member.task}</p>
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
                      <h4 className="font-medium">Meeting with Arc Company</h4>
                      <p className="text-sm text-gray-600">Time: 09:00 pm - 04:00 pm</p>
                      <Button className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white">
                        Start Meeting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project List */}
              <Card>
                <CardHeader>
                  <CardTitle>Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.map((project, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {getPriorityIcon(project.priority)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-gray-500">{project.due}</p>
                        </div>
                      </div>
                    ))}
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
                        strokeDasharray={`${419 * 2.51} 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">419%</p>
                        <p className="text-xs text-gray-600">Project Ended</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Pending</span>
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
      </div>
    </div>
  );
}