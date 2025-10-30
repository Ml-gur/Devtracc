import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, BarChart3, Users, MessageCircle, Bell, Search, Menu, X, TestTube, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import ProjectForm from './ProjectForm';
import ProjectCard from './ProjectCard';
import ProjectDetailsPage from './ProjectDetailsPage';
import AnalyticsDashboard from './AnalyticsDashboard';
import DonezoStyleDashboardContent from './DonezoStyleDashboardContent';
import ProgressFeed from './ProgressFeed';
import MessagingInterface from './MessagingInterface';
import NotificationCenter from './NotificationCenter';
import TestingDashboard from './TestingDashboard';
import ConnectionStatus from './ConnectionStatus';
import { supabase, getOfflineMode } from '../utils/supabase/client';
import { connectionManager, ConnectionStatus as IConnectionStatus } from '../utils/connection-manager';
import { 
  getUserProjects, 
  createProject, 
  getAllPosts, 
  UserProfile 
} from '../utils/database-service';
import { LegacyProject as Project } from '../types/project';
import { Post } from '../types/social';

interface DashboardProps {
  user: any;
  profile?: UserProfile | null;
  onLogout: () => void;
  onNavigateToSetup?: () => void;
  databaseConnected?: boolean | null;
}

type DashboardView = 'projects' | 'project-details' | 'analytics' | 'donezo-dashboard' | 'feed' | 'messaging' | 'testing';

export default function Dashboard({ user, profile, onLogout, onNavigateToSetup, databaseConnected }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<IConnectionStatus>(connectionManager.getStatus());

  useEffect(() => {
    if (user?.id) {
      // Setup connection status listener
      const handleConnectionChange = (status: IConnectionStatus) => {
        setConnectionStatus(status);
      };
      
      connectionManager.addListener(handleConnectionChange);
      
      // Load dashboard data
      loadDashboardData();
      loadUnreadMessageCount();
      subscribeToMessages();

      return () => {
        connectionManager.removeListener(handleConnectionChange);
      };
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!connectionStatus.online) {
        console.log('📱 Offline mode - using cached/demo data');
        setProjects([]);
        setRecentPosts([]);
        setLoading(false);
        return;
      }
      
      // Load projects using database service
      try {
        const projectsResult = await getUserProjects(user.id);
        if (projectsResult.error) {
          console.log('📂 Projects load error:', projectsResult.error);
          setProjects([]);
        } else {
          // Database service now returns properly formatted Project objects
          setProjects(projectsResult.data || []);
        }
      } catch (error) {
        console.log('📂 Projects load error:', error);
        setProjects([]);
      }

      // Load recent posts using database service
      try {
        const postsResult = await getAllPosts();
        if (postsResult.error) {
          console.log('📝 Posts load error:', postsResult.error);
          setRecentPosts([]);
        } else {
          // Take only first 5 posts
          setRecentPosts((postsResult.data || []).slice(0, 5));
        }
      } catch (error) {
        console.log('📝 Posts load error:', error);
        setRecentPosts([]);
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadMessageCount = async () => {
    try {
      if (!connectionStatus.supabaseReachable) {
        setUnreadMessageCount(0);
        return;
      }

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .neq('status', 'read');

      if (error) {
        console.log('📬 Messages count error:', error);
        setUnreadMessageCount(0);
      } else {
        setUnreadMessageCount(count || 0);
      }
    } catch (error) {
      console.log('📬 Messages count error:', error);
      setUnreadMessageCount(0);
    }
  };

  const subscribeToMessages = () => {
    try {
      if (!connectionStatus.supabaseReachable) {
        console.log('📡 Realtime subscription skipped - Supabase not reachable');
        return () => {};
      }

      const subscription = supabase
        .channel('dashboard-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        }, () => {
          loadUnreadMessageCount();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        }, () => {
          loadUnreadMessageCount();
        })
        .subscribe();

      return () => subscription.unsubscribe();
    } catch (error) {
      console.log('📡 Message subscription error (non-critical):', error);
      return () => {};
    }
  };

  const handleProjectSave = async (projectData: any) => {
    try {
      // Always allow project creation attempt - handle errors gracefully
      const result = await createProject({
        title: projectData.title,
        description: projectData.description,
        userId: user.id,
        techStack: projectData.techStack || [],
        category: projectData.category || 'other',
        status: projectData.status || 'planning',
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        endDate: projectData.endDate,
        githubUrl: projectData.githubUrl,
        liveUrl: projectData.liveUrl,
        images: projectData.images || [],
        isPublic: projectData.isPublic ?? true,
        likes: 0,
        comments: []
      });

      if (result.error) {
        console.error('❌ Create project error:', result.error);
        
        // Provide helpful error messages based on error type
        if (result.error.message?.includes('offline') || result.error.code === 'OFFLINE') {
          return { 
            success: false, 
            error: 'Cannot create projects while offline. Please check your connection and try again.' 
          };
        }
        
        if (result.error.message?.includes('Network') || result.error.code === 'NETWORK_ERROR') {
          return { 
            success: false, 
            error: 'Network connection failed. Please check your connection and try again.' 
          };
        }
        
        if (result.error.message?.includes('relation') || result.error.code === 'DB_NOT_AVAILABLE') {
          return { 
            success: false, 
            error: 'Database setup required. Please set up the database to create projects.',
            requiresSetup: true
          };
        }
        
        // Handle column missing errors gracefully
        if (result.error.message?.includes('column') || result.error.message?.includes('does not exist')) {
          return { 
            success: false, 
            error: 'Some project features require database updates. The project may still be created with basic information.',
            isWarning: true
          };
        }
        
        return { 
          success: false, 
          error: result.error.message || 'Failed to create project. Please try again.' 
        };
      }

      if (result.data) {
        // Database service now returns properly formatted Project objects
        setProjects(prev => [result.data, ...prev]);
        setShowProjectForm(false);
        
        // Refresh project list if database is available
        if (connectionStatus.databaseAvailable) {
          setTimeout(() => loadDashboardData(), 500); // Small delay to allow database to sync
        }
        
        const message = result.isTemporary 
          ? 'Project created locally! It will sync when the database is available.' 
          : 'Project created successfully!';
          
        return { success: true, message };
      }
      
      return { success: false, error: 'Project creation failed - no data returned' };
    } catch (error) {
      console.error('❌ Error saving project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save project' 
      };
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-details');
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    setSelectedProject(updatedProject);
  };

  const handleProjectDelete = (deletedProjectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== deletedProjectId));
    setSelectedProject(null);
    setCurrentView('projects');
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
    { id: 'donezo-dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderOpen, badge: projects.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'feed', label: 'Community', icon: Users },
    { id: 'messaging', label: 'Messages', icon: MessageCircle, badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { id: 'testing', label: 'Testing', icon: TestTube }
  ];

  const SidebarContent = () => (
    <div className="space-y-2">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=f0f0f0&color=333`}
              alt={user?.fullName || 'User'}
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.title || 'Developer'}</p>
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
        {/* Connection Status in Sidebar */}
        <div className="px-2">
          <ConnectionStatus />
        </div>
        
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <span>Sign Out</span>
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
            onBack={() => setCurrentView('projects')}
            onUpdate={handleProjectUpdate}
            onDelete={handleProjectDelete}
            currentUser={user}
          />
        ) : null;

      case 'donezo-dashboard':
        return (
          <DonezoStyleDashboardContent
            user={user}
            projects={projects}
            onProjectCreate={() => setShowProjectForm(true)}
          />
        );

      case 'analytics':
        return (
          <AnalyticsDashboard
            userId={user.id}
            timeRange="week"
            onTimeRangeChange={() => {}}
          />
        );

      case 'feed':
        return (
          <ProgressFeed
            currentUser={user}
            onBack={() => setCurrentView('projects')}
          />
        );

      case 'messaging':
        return (
          <MessagingInterface
            currentUserId={user.id}
            userType={user.user_type || 'developer'}
            onBack={() => setCurrentView('projects')}
          />
        );

      case 'testing':
        return <TestingDashboard />;

      case 'projects':
      default:
        return (
          <div className="p-6">
            {/* Connection Status Alert */}
            {(!connectionStatus.online || !connectionStatus.supabaseReachable) && (
              <div className="mb-6">
                <ConnectionStatus showDetails={true} onRetry={handleConnectionRetry} />
              </div>
            )}
            
            {/* Database Setup Recommendation */}
            {connectionStatus.online && connectionStatus.supabaseReachable && !connectionStatus.databaseAvailable && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-yellow-800 text-sm">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">Database Setup Recommended</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      For full project management features, set up your database. You can still create basic projects without it.
                    </p>
                    {onNavigateToSetup && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                        onClick={onNavigateToSetup}
                      >
                        Setup Database
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1>My Projects</h1>
                <p className="text-muted-foreground">
                  Manage and track your development projects
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setShowProjectForm(true)}
                      disabled={!connectionStatus.online && !getOfflineMode()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </TooltipTrigger>
                  {(!connectionStatus.online && !getOfflineMode()) && (
                    <TooltipContent>
                      <p>Connect to the internet to create new projects</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-primary" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'in-progress').length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-yellow-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </Card>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3>No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 
                   !connectionStatus.online ? 'Connect to the internet to create and sync projects' :
                   !connectionStatus.databaseAvailable ? 'Database setup recommended for full project management features' :
                   'Create your first project to get started'}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setShowProjectForm(true)}
                    disabled={!connectionStatus.online && !getOfflineMode()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewProject={() => handleProjectClick(project)}
                    isTemporary={project.id.startsWith('temp-')}
                    currentUserId={user.id}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">DT</span>
            </div>
            <span className="font-bold">DevTrack</span>
          </div>
        </div>
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate to different sections of the application
                </SheetDescription>
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">DT</span>
                    </div>
                    <span className="font-bold">DevTrack</span>
                  </div>
                </div>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-bold">DevTrack Africa</span>
          </div>
          
          <NotificationCenter 
            currentUserId={user.id}
            onNotificationClick={handleNotificationClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:p-4 lg:border-b">
          <div className="flex-1"></div>
          <NotificationCenter 
            currentUserId={user.id}
            onNotificationClick={handleNotificationClick}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderCurrentView()}
        </div>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ProjectForm
              onSubmit={handleProjectSave}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}