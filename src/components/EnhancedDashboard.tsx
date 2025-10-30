import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, BarChart3, Users, MessageCircle, Bell, Search, Menu, X, TestTube, Wifi, Star, TrendingUp, Calendar, Code2, UserCircle, Database, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import MinimalProjectCreator from './MinimalProjectCreator';
import ProjectCard from './ProjectCard';
import ProjectDetailsPage from './ProjectDetailsPage';
import SmartAnalyticsDashboard from './SmartAnalyticsDashboard';
import CommunityFeed from './CommunityFeed';
import EnhancedMessagingHub from './EnhancedMessagingHub';
import NotificationCenter from './NotificationCenter';
import RealTimeMessagingHub from './RealTimeMessagingHub';
import OnboardingFlow from './OnboardingFlow';
import AdvancedNotificationCenter from './AdvancedNotificationCenter';
import EnhancedProjectAnalytics from './EnhancedProjectAnalytics';
import AdvancedSearchEngine from './AdvancedSearchEngine';
import { notificationService } from '../utils/notification-service';
import TestingDashboard from './TestingDashboard';
import ProductionAuditDashboard from './ProductionAuditDashboard';
import ConnectionStatusComponent from './ConnectionStatus';
import UserProfileManager from './UserProfileManager';
import ProfileCompletionNotification from './ProfileCompletionNotification';
import RegistrationTestHelper from './RegistrationTestHelper';
import { supabase, getDemoMode } from '../utils/supabase/client';
import { connectionManager, ConnectionStatus as IConnectionStatus } from '../utils/connection-manager';
import {
  getUserProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllPosts,
  UserProfile,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask
} from '../utils/database-service';
import { ProjectStorage, TaskStorage } from '../utils/local-storage';
import { Task } from '../types/task';
import TimerStorage from '../utils/timer-storage';
import { LegacyProject as Project } from '../types/project';
import { Post } from '../types/social';
import { useAuth } from '../contexts/AuthContext';

interface EnhancedDashboardProps {
  user: any;
  profile?: UserProfile | null;
  onLogout: () => void;
  onNavigateToSetup?: () => void;
  databaseConnected?: boolean | null;
}

type DashboardView =
  | 'overview'
  | 'projects'
  | 'project-details'
  | 'analytics'
  | 'community'
  | 'messaging'
  | 'profile'
  | 'testing'
  | 'production-audit';

export default function EnhancedDashboard({
  user,
  profile,
  onLogout,
  onNavigateToSetup,
  databaseConnected
}: EnhancedDashboardProps) {
  const { deleteProfile } = useAuth();
  
  // Online-only enforcement: Show connection required message if database not connected
  if (!databaseConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="font-semibold text-red-900 mb-2">
              Database Connection Required
            </div>
            <p className="text-sm text-red-700 mb-4">
              DevTrack Africa requires an active database connection to function. Please ensure you're connected to the internet and the database is properly configured.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
              {onNavigateToSetup && (
                <Button
                  onClick={onNavigateToSetup}
                  variant="outline"
                  className="w-full"
                >
                  Setup Database
                </Button>
              )}
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full"
              >
                Back to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [projectTasks, setProjectTasks] = useState<{ [projectId: string]: Task[] | null }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<IConnectionStatus>(connectionManager.getStatus());
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [savedSearches, setSavedSearches] = useState<Array<{ query: string; filters: any; name: string }>>([]);
  const [showRegistrationTest, setShowRegistrationTest] = useState(false);

  // Activity data for overview - will be calculated from actual projects
  const [weeklyActivity, setWeeklyActivity] = useState({
    projectsCreated: 0,
    tasksCompleted: 0,
    postsShared: 4,
    likesReceived: 23,
    commentsReceived: 8
  });

  useEffect(() => {
    const handleConnectionChange = (status: IConnectionStatus) => {
      setConnectionStatus(status);
    };
    
    connectionManager.addListener(handleConnectionChange);
    
    loadDashboardData();
    loadUnreadMessageCount();
    subscribeToMessages();
    loadUserProfile();
    setupNotificationService();
    checkOnboardingStatus();

    return () => {
      connectionManager.removeListener(handleConnectionChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Always try to load from database first if connected
      if (databaseConnected) {
        console.log('🔗 Loading projects from database...');
        try {
          const projectsResult = await getUserProjects(user.id);
          const dbProjects = projectsResult?.data || [];
          setProjects(dbProjects);

          // Load tasks for each project
          const tasksMap: { [projectId: string]: Task[] } = {};
          for (const project of dbProjects) {
            try {
              const tasksResult = await getProjectTasks(project.id);
              tasksMap[project.id] = tasksResult?.data || [];
            } catch (error) {
              console.warn(`Failed to load tasks for project ${project.id}:`, error);
              tasksMap[project.id] = [];
            }
          }
          setProjectTasks(tasksMap);

          // Calculate weekly activity from database data
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const recentProjects = dbProjects.filter(p => new Date(p.createdAt) > oneWeekAgo);

          const allTasks = Object.values(tasksMap).flat();
          const completedTasks = allTasks.filter(t =>
            t.status === 'completed' &&
            t.completedAt &&
            new Date(t.completedAt) > oneWeekAgo
          );

          setWeeklyActivity(prev => ({
            ...prev,
            projectsCreated: recentProjects.length,
            tasksCompleted: completedTasks.length
          }));

          setRecentPosts([]);
          setLoading(false);
          return;

        } catch (error) {
          console.error('❌ Failed to load data from database:', error);
          // Fall through to local storage fallback
        }
      }

      // Fallback to local storage if database is not connected or failed
      console.log('📱 Loading projects from local storage...');
      const localProjects = ProjectStorage.getProjects().filter(p => p.userId === user.id);
      setProjects(localProjects);

      // Load tasks for local projects
      const tasksMap: { [projectId: string]: Task[] } = {};
      for (const project of localProjects) {
        try {
          const localTasks = TaskStorage.getTasks(project.id);
          tasksMap[project.id] = localTasks;
        } catch (error) {
          console.warn(`Failed to load tasks for project ${project.id}:`, error);
          tasksMap[project.id] = [];
        }
      }
      setProjectTasks(tasksMap);

      // Calculate weekly activity from local data
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentProjects = localProjects.filter(p => new Date(p.createdAt) > oneWeekAgo);

      const allTasks = Object.values(tasksMap).flat();
      const completedTasks = allTasks.filter(t =>
        t.status === 'completed' &&
        t.completedAt &&
        new Date(t.completedAt) > oneWeekAgo
      );

      setWeeklyActivity(prev => ({
        ...prev,
        projectsCreated: recentProjects.length,
        tasksCompleted: completedTasks.length
      }));

      setRecentPosts([]);
      setLoading(false);

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setProjects([]);
      setProjectTasks({});
      setLoading(false);
    }
  };

  const loadUnreadMessageCount = async () => {
    setUnreadMessageCount(3); // Demo value
  };

  const subscribeToMessages = () => {
    console.log('📡 Realtime subscription skipped - demo mode');
    return () => {};
  };

  const loadUserProfile = () => {
    // Use the profile passed as prop from AuthContext
    if (profile) {
      setUserProfile(profile);
    } else if (user) {
      // Fallback to basic user info
      setUserProfile({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Developer',
        title: 'Developer',
        bio: '',
        skills: [],
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        location: '',
        avatar: user.user_metadata?.avatar_url || ''
      });
    }
  };

  const setupNotificationService = () => {
    // Subscribe to notifications from the notification service
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Listen for notification clicks to handle navigation
    const handleNotificationClick = (event: CustomEvent) => {
      const notification = event.detail;
      handleNotificationNavigation(notification);
    };

    window.addEventListener('notificationClick', handleNotificationClick as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('notificationClick', handleNotificationClick as EventListener);
    };
  };

  const checkOnboardingStatus = () => {
    // Check if user profile has onboarding data or if it's a new user
    if (profile && (profile as any).onboardingCompleted) {
      setHasSeenOnboarding(true);
    } else {
      // Show onboarding for new users
      setShowOnboarding(true);
      setHasSeenOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    // This would ideally update the user profile in the database
    // For now, just hide the onboarding
    setShowOnboarding(false);
  };

  const handleSaveSearch = (query: string, filters: any) => {
    const name = prompt('Enter a name for this search:');
    if (name) {
      const newSavedSearch = { query, filters, name };
      setSavedSearches(prev => [...prev, newSavedSearch]);
      
      // In a full implementation, this would save to the database
      console.log('Search saved (would be saved to database):', newSavedSearch);
    }
  };

  const handleSearchResultClick = (result: any) => {
    // Navigate based on result type
    switch (result.type) {
      case 'project':
        const project = projects.find(p => p.id === result.id);
        if (project) {
          handleProjectClick(project);
        }
        break;
      case 'task':
        // Find project containing this task and navigate to it
        Object.entries(projectTasks).forEach(([projectId, tasks]) => {
          if (tasks.some(t => t.id === result.id)) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
              handleProjectClick(project);
            }
          }
        });
        break;
      case 'message':
        setCurrentView('messaging');
        break;
      case 'user':
        setCurrentView('community');
        break;
      default:
        console.log('Navigate to:', result);
    }
  };

  const handleNotificationNavigation = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        setCurrentView('messaging');
        break;
      case 'post_comment':
      case 'post_like':
        setCurrentView('community');
        break;
      case 'collaboration_invite':
      case 'project_shared':
        setCurrentView('projects');
        break;
      default:
        break;
    }
  };

  const createNotification = async (notificationData: any) => {
    await notificationService.createNotification({
      user_id: 'demo-user',
      ...notificationData
    });
  };

  const handleProjectSave = async (projectData: any) => {
    setIsLoading(true);
    try {
      // Create a new project data object without id, createdAt, updatedAt, comments, likes
      const newProjectData = {
        userId: user.id,
        title: projectData.title,
        description: projectData.description,
        category: projectData.category || 'other',
        status: projectData.status || 'planning',
        techStack: projectData.techStack || [],
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        endDate: projectData.endDate,
        githubUrl: projectData.githubUrl,
        liveUrl: projectData.liveUrl,
        images: projectData.images || [],
        isPublic: projectData.isPublic ?? true,
        progress: 0
      };

      // Save to Supabase database - pass userId as second parameter
      const projectResult = await createProject(newProjectData as any, user.id);
      
      if (projectResult?.data) {
        // Update state
        setProjects(prev => [projectResult.data, ...prev]);
        setShowProjectForm(false);
        
        // Update weekly activity
        setWeeklyActivity(prev => ({
          ...prev,
          projectsCreated: prev.projectsCreated + 1
        }));
        
        console.log('✅ Project created and saved to database!');
        
        return { 
          success: true, 
          message: 'Project created successfully! Your project has been saved to the database.' 
        };
      } else {
        throw new Error(projectResult?.error || 'Failed to save project to database');
      }
    } catch (error) {
      console.error('❌ Error saving project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save project' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-details');
    
    // Load existing tasks for this project from database
    try {
      const tasksResult = await getProjectTasks(project.id);
      setProjectTasks(prev => ({ ...prev, [project.id]: tasksResult?.data || [] }));
    } catch (error) {
      console.warn(`Failed to load tasks for project ${project.id}:`, error);
      setProjectTasks(prev => ({ ...prev, [project.id]: [] }));
    }
  };

  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      // Update in Supabase database
      const result = await updateProject(updatedProject.id, updatedProject);
      
      // Update state
      setProjects(prev => 
        prev.map(p => p.id === updatedProject.id ? updatedProject : p)
      );
      setSelectedProject(updatedProject);
      
      console.log('✅ Project updated and saved to database!');
    } catch (error) {
      console.error('❌ Error updating project:', error);
    }
  };

  const handleProjectDelete = async (deletedProjectId: string) => {
    try {
      // Delete from Supabase database
      await deleteProject(deletedProjectId);
      
      // Update state
      setProjects(prev => prev.filter(p => p.id !== deletedProjectId));
      setProjectTasks(prev => {
        const newTasks = { ...prev };
        delete newTasks[deletedProjectId];
        return newTasks;
      });
      setSelectedProject(null);
      setCurrentView('overview');
      
      console.log('✅ Project deleted from database!');
    } catch (error) {
      console.error('❌ Error deleting project:', error);
    }
  };

  // Task management functions with Supabase database persistence
  const handleTaskCreate = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Save to Supabase database (the createTask function will add id, createdAt, updatedAt)
      const taskResult = await createTask(task);
      
      // Update state
      if (taskResult?.data) {
        setProjectTasks(prev => ({
          ...prev,
          [task.projectId]: [...(prev[task.projectId] || []), taskResult.data]
        }));
        
        console.log('✅ Task created and saved to database:', taskResult.data.title);
      } else {
        throw new Error(taskResult?.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Save to Supabase database
      await updateTask(taskId, updates);
      
      // Update state
      setProjectTasks(prev => {
        const newTasks: { [projectId: string]: Task[] } = {};
        Object.keys(prev).forEach(projectId => {
          newTasks[projectId] = prev[projectId].map(task => 
            task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
          );
        });
        return newTasks;
      });
      
      // Update weekly activity if task was completed
      if (updates.status === 'completed') {
        setWeeklyActivity(prev => ({
          ...prev,
          tasksCompleted: prev.tasksCompleted + 1
        }));
      }
      
      console.log('✅ Task updated and saved to database');
    } catch (error) {
      console.error('❌ Error updating task:', error);
      throw error;
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      // Delete from Supabase database
      await deleteTask(taskId);
      
      // Update state
      setProjectTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(projectId => {
          newTasks[projectId] = newTasks[projectId].filter(task => task.id !== taskId);
        });
        return newTasks;
      });
      
      console.log('✅ Task deleted from database');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  };

  const handleTaskTimeUpdate = async (taskId: string, minutes: number) => {
    try {
      // Find the task to get current time spent
      let currentTask: Task | undefined;
      Object.values(projectTasks).forEach(tasks => {
        const found = tasks.find(t => t.id === taskId);
        if (found) currentTask = found;
      });
      
      if (!currentTask) {
        console.error('Task not found for time update:', taskId);
        return;
      }
      
      const newTimeSpent = (currentTask.timeSpentMinutes || 0) + minutes;

      // Also update the timer session in storage for persistence
      const activeTimer = TimerStorage.getActiveTimer(taskId);
      if (activeTimer) {
        const session = {
          //... create a TimerSession object here
        };
        // TimerStorage.saveTimerSession(session);
      }
      await handleTaskUpdate(taskId, { timeSpentMinutes: newTimeSpent });
    } catch (error) {
      console.error('❌ Error updating task time:', error);
      throw error;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.type.includes('message')) {
      setCurrentView('messaging');
    }
  };

  const handleConnectionRetry = async () => {
    console.log('🔄 Retrying dashboard connections...');
    await connectionManager.retryConnection();
    if (connectionStatus.supabaseReachable) {
      loadDashboardData();
      loadUnreadMessageCount();
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.techStack?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'My Projects', icon: FolderOpen, badge: projects.length },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messaging', label: 'Messages', icon: MessageCircle, badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { id: 'testing', label: 'Testing', icon: TestTube },
    { id: 'production-audit', label: 'Production Audit', icon: Code2 }
  ];

  const SidebarContent = () => (
    <div className="space-y-2">
      <div className="p-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-accent rounded-lg p-2 -m-2"
          onClick={() => {
            setCurrentView('profile');
            setIsMobileMenuOpen(false);
          }}
        >
          <Avatar className="h-10 w-10">
            <img
              src={userProfile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'DevTrack User')}&background=f0f0f0&color=333`}
              alt={userProfile?.full_name || 'DevTrack User'}
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{userProfile?.full_name || 'DevTrack User'}</p>
            <p className="text-sm text-muted-foreground truncate">{userProfile?.title || 'Developer'}</p>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="space-y-1 p-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className="w-full justify-between"
            onClick={() => {
              setCurrentView(item.id as DashboardView);
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant={item.id === 'messaging' ? 'destructive' : 'secondary'} className="text-xs">
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      <Separator />

      <div className="p-2 space-y-2">
        <div className="px-2">
          <ConnectionStatusComponent compact={true} onRetry={handleConnectionRetry} />
        </div>

        {/* Added explicit Logout button */}
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <span>Logout</span>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <span>← Back to Homepage</span>
        </Button>
        
        {!connectionStatus.databaseAvailable && onNavigateToSetup && (
          <Button variant="outline" className="w-full justify-start" onClick={onNavigateToSetup}>
            <span>Setup Database</span>
          </Button>
        )}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'project-details':
        return selectedProject ? (
          <ProjectDetailsPage
            project={selectedProject}
            tasks={projectTasks[selectedProject.id] || []}
            onBack={() => setCurrentView('projects')}
            onUpdate={handleProjectUpdate}
            onDelete={handleProjectDelete}
            currentUser={{ id: 'demo-user', fullName: 'DevTrack User' }}
            onTaskCreate={handleTaskCreate}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskTimeUpdate={handleTaskTimeUpdate}
          />
        ) : null;

      case 'analytics':
        return (
          <EnhancedProjectAnalytics
            userId="demo-user"
            projects={projects.map(p => ({
              id: p.id,
              name: p.title,
              totalTasks: (projectTasks[p.id] || []).length,
              completedTasks: (projectTasks[p.id] || []).filter(t => t.status === 'completed').length,
              inProgressTasks: (projectTasks[p.id] || []).filter(t => t.status === 'in_progress').length,
              blockedTasks: (projectTasks[p.id] || []).filter(t => t.status === 'blocked').length,
              totalTimeSpent: (projectTasks[p.id] || []).reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0) / 60,
              averageTaskTime: ((projectTasks[p.id] || []).reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0) / 60) / Math.max((projectTasks[p.id] || []).length, 1),
              completionRate: ((projectTasks[p.id] || []).filter(t => t.status === 'completed').length / Math.max((projectTasks[p.id] || []).length, 1)) * 100,
              velocity: ((projectTasks[p.id] || []).filter(t => t.status === 'completed').length / 7), // tasks per week
              collaborators: 1, // demo value
              lastActivity: new Date(p.updatedAt),
              priority: 'medium' as const,
              status: p.status as 'planning' | 'active' | 'on-hold' | 'completed',
            }))}
          />
        );

      case 'community':
        return (
          <CommunityFeed
            currentUser={{ id: 'demo-user', fullName: 'DevTrack User' }}
            onBack={() => setCurrentView('overview')}
            onProjectClick={handleProjectClick}
            onProfileClick={(userId) => console.log('View profile:', userId)}
          />
        );



      case 'messaging':
        return (
          <EnhancedMessagingHub
            currentUserId={user.id}
            userType="developer"
            onBack={() => setCurrentView('overview')}
          />
        );

      case 'profile':
        return (
          <div>
            <ProfileCompletionNotification
              profile={profile}
              onNavigateToProfile={() => setCurrentView('profile')}
            />
            <UserProfileManager
              currentUserId={user?.id || "demo-user"}
              onBack={() => setCurrentView('overview')}
              onSave={(profileData) => {
                console.log('Profile saved:', profileData);
                // Profile data is saved to Supabase database
                // Update the user profile state to reflect changes in sidebar
                setUserProfile(profileData);
                // Show success message or update UI as needed
                setCurrentView('overview');
              }}
              onDeleteProfile={deleteProfile}
              initialProfile={profile}
            />
          </div>
        );

      case 'testing':
        return <TestingDashboard />;

      case 'production-audit':
        return <ProductionAuditDashboard />;

      case 'projects':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
                <p className="text-gray-600">
                  {isFirstTime 
                    ? 'Welcome! Start by exploring the demo projects or create your own.'
                    : 'Manage and track your development projects - all saved locally on your device.'
                  }
                </p>
              </div>
              <Button onClick={() => setShowProjectForm(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </div>

            <div className="mb-6">
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first project.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowProjectForm(true)}>
                    Create your first project
                  </Button>
                )}
              </div>
            )}


          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to DevTrack Africa</h1>
              <p className="text-gray-600">
                {isFirstTime 
                  ? 'Track your development journey and showcase your projects to the community. Start with the demo projects or create your own!'
                  : 'Track your development journey and showcase your projects to the community'
                }
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{weeklyActivity.tasksCompleted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Community Posts</p>
                      <p className="text-2xl font-bold text-gray-900">{weeklyActivity.postsShared}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Likes Received</p>
                      <p className="text-2xl font-bold text-gray-900">{weeklyActivity.likesReceived}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {isFirstTime ? 'Get Started' : 'Recent Projects'}
                </h2>
                <Button variant="outline" onClick={() => setCurrentView('projects')}>
                  View All
                </Button>
              </div>
              
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.slice(0, 3).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleProjectClick(project)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Create your first project to get started</p>
                  <Button onClick={() => setShowProjectForm(true)}>
                    Create Project
                  </Button>
                </div>
              )}
            </div>

            {/* First time user helpful tips */}
            {isFirstTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Welcome to DevTrack Africa!</h3>
                    <p className="text-blue-700 mb-3">
                      We've created some demo projects for you to explore. All your data is saved locally on your device for privacy and offline access.
                    </p>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• Click on any project to view details and manage tasks</li>
                      <li>• Use the Kanban board to track progress with drag-and-drop</li>
                      <li>• Create your own projects that will be saved locally</li>
                      <li>• All features work offline - no internet required</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-4">
              <h1 className="text-xl font-bold text-gray-900">DevTrack Africa</h1>
            </div>
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">DevTrack Africa</h1>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for DevTrack Africa dashboard
          </SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {renderCurrentView()}
        </main>
      </div>

      {/* Floating Action Button - Create Project */}
      {currentView !== 'project-details' && !showProjectForm && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowProjectForm(true)}
                className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 z-40"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-background border border-border text-foreground">
              <p>Create Project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Global Project Creator Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <MinimalProjectCreator
              onSubmit={handleProjectSave}
              onCancel={() => setShowProjectForm(false)}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}