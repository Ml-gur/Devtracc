import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  Github, 
  Globe, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Users,
  Activity,
  Instagram,
  Handshake
} from 'lucide-react';
import { LegacyProject } from '../types/project';
import { Task, TaskProgress } from '../types/task';
import KanbanBoard from './KanbanBoard';
import CollaborationManager from './CollaborationManager';
import FileUploadManager from './FileUploadManager';
import CollaborativeShareModal from './CollaborativeShareModal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getProjectTasks, createTask, updateTask, deleteTask } from '../utils/database-service';

interface ProjectDetailsPageProps {
  project: LegacyProject;
  onBack: () => void;
  onUpdate?: (updatedProject: LegacyProject) => void;
  onDelete?: (projectId: string) => void;
  currentUser?: any;
  onEdit?: () => void;
}

// Mock recent activity data
const MOCK_ACTIVITY = [
  {
    id: '1',
    type: 'task_completed',
    message: 'Completed "Set up authentication"',
    timestamp: '2 hours ago'
  },
  {
    id: '2', 
    type: 'task_created',
    message: 'Created "Design user interface"',
    timestamp: '1 day ago'
  },
  {
    id: '3',
    type: 'project_updated',
    message: 'Updated project description',
    timestamp: '2 days ago'
  }
];

export default function ProjectDetailsPage({
  project,
  onBack,
  onUpdate,
  onDelete,
  currentUser,
  onEdit,
}: ProjectDetailsPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await getProjectTasks(project.id);
      if (data) {
        setTasks(data);
      }
    };
    fetchTasks();
  }, [project.id]);

  const handleTaskCreate = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await createTask(task, currentUser?.id);
    if (data) {
      setTasks([...tasks, data]);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    const { data } = await updateTask(taskId, updates, project.id);
    if (data) {
      setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId, project.id);
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleTaskTimeUpdate = async (taskId: string, minutes: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const newTime = (task.timeSpentMinutes || 0) + minutes;
      await handleTaskUpdate(taskId, { timeSpentMinutes: newTime });
    }
  };


  // Calculate project progress
  const progress: TaskProgress = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    todoTasks: tasks.filter(t => t.status === 'todo').length,
    totalTimeSpent: tasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0),
    completionPercentage: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneMessage = () => {
    if (progress.completionPercentage === 100) {
      return "🎉 Project Complete! Amazing work!";
    } else if (progress.completionPercentage >= 75) {
      return "🚀 Almost there! You're in the final stretch!";
    } else if (progress.completionPercentage >= 50) {
      return "💪 Halfway there! Keep up the great work!";
    } else if (progress.completionPercentage >= 25) {
      return "📈 Great progress! You're building momentum!";
    } else if (progress.completedTasks > 0) {
      return "🌟 First task complete! You're off to a great start!";
    }
    return null;
  };

  const milestoneMessage = getMilestoneMessage();

  const handleCollaborativeShare = (shareData: any) => {
    console.log('Creating collaborative project post:', shareData);
    alert('Collaborative project post created! All team members will be credited.');
    setShowShareModal(false);
  };

  // Mock collaborators for demo
  const mockCollaborators = project.isCollaborative ? (project.collaborators || []).map(c => ({
    id: c.id,
    userId: c.userId,
    projectId: project.id,
    email: `${c.fullName.toLowerCase().replace(' ', '.')}@example.com`,
    role: c.role,
    status: 'active' as const,
    joinedAt: c.joinedAt,
    invitedBy: currentUser?.id || '',
    profile: {
      fullName: c.fullName,
      profilePicture: c.profilePicture,
      title: 'Developer',
      username: `@${c.fullName.toLowerCase().replace(' ', '')}`
    }
  })) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Project
                </Button>
              )}
              
              {project.isCollaborative && mockCollaborators.length > 0 ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Collaborative Share
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
              
              {!project.isCollaborative && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('collaboration')}
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Add Collaborators
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="space-y-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-lg mb-4">
                {project.description}
              </p>

              {/* Tech Stack */}
              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.map(tech => (
                    <Badge key={tech} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3">
                {project.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                )}
                {project.liveUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Project Image */}
            {project.images && project.images.length > 0 && (
              <div className="ml-8 hidden md:block">
                <ImageWithFallback
                  src={project.images[0]}
                  alt={project.title}
                  className="w-48 h-32 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          {/* Progress Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Progress</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{progress.completionPercentage}%</span>
                      <span className="text-sm text-muted-foreground">
                        {progress.completedTasks}/{progress.totalTasks} tasks
                      </span>
                    </div>
                    <Progress value={progress.completionPercentage} className="h-2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time Spent</span>
                  </div>
                  <div className="text-2xl font-bold">{formatTime(progress.totalTimeSpent)}</div>
                  <div className="text-sm text-muted-foreground">
                    {progress.inProgressTasks} active tasks
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Started</span>
                  </div>
                  <div className="text-lg font-medium">{formatDate(project.startDate)}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.endDate ? `Due ${formatDate(project.endDate)}` : 'No deadline set'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <div className="text-lg font-medium capitalize">
                    {project.status.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated {formatDate(project.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Milestone Message */}
              {milestoneMessage && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium text-center">{milestoneMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="collaboration">
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="files">
              Files
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Category:</span>
                      <p className="text-sm text-muted-foreground capitalize">
                        {project.category?.replace('-', ' ') || 'Other'}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.description}
                      </p>
                    </div>

                    {project.techStack.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <span className="text-sm font-medium">Technologies:</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.techStack.map(tech => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Task Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No tasks yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Break down your project into manageable tasks
                      </p>
                      <Button onClick={() => setActiveTab('tasks')}>
                        Add Your First Task
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">{progress.todoTasks}</div>
                          <div className="text-sm text-muted-foreground">To Do</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{progress.inProgressTasks}</div>
                          <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{progress.completedTasks}</div>
                          <div className="text-sm text-muted-foreground">Completed</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{progress.completionPercentage}%</span>
                        </div>
                        <Progress value={progress.completionPercentage} className="h-2" />
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => setActiveTab('tasks')}
                      >
                        Manage Tasks
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_ACTIVITY.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <KanbanBoard
              projectId={project.id}
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskCreate={handleTaskCreate}
              onTaskDelete={handleTaskDelete}
              onTaskTimeUpdate={handleTaskTimeUpdate}
            />
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration">
            <CollaborationManager 
              project={project}
              currentUserId={currentUser?.id || ''}
              onCollaboratorChange={() => {
                // Refresh project data if needed
                console.log('Collaborator changed');
              }}
            />
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <FileUploadManager 
              projectId={project.id}
              onFilesChange={(files) => {
                console.log('Files updated:', files.length);
              }}
            />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Project Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_ACTIVITY.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Collaborative Share Modal */}
      <CollaborativeShareModal
        project={project}
        currentUserId={currentUser?.id || ''}
        collaborators={mockCollaborators}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleCollaborativeShare}
      />
    </div>
  );
}
