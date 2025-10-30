import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  Filter,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { Post, FeedFilter, TrendingProject } from '../types/social';
import { getAllPosts, createPost } from '../utils/database-service';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';

interface ProgressFeedProps {
  currentUser: any;
  onBack?: () => void;
  userId?: string;
  projectId?: string;
  isProjectSpecific?: boolean;
}

// Mock data - in real app, this would come from API
const mockPosts: Post[] = [
  {
    id: '1',
    projectId: 'proj1',
    authorId: 'user1',
    taskId: 'task1',
    content: 'Just finished implementing user authentication! 🎉',
    reflectionNotes: 'JWT tokens were confusing at first, but I learned about token expiry and refresh patterns. The middleware setup was tricky but worth understanding for security. Next up is role-based access control.',
    postType: 'task_completed',
    attachments: [
      {
        id: 'att1',
        postId: '1',
        fileUrl: '/mock-images/login-screen.png',
        fileType: 'image',
        fileName: 'login-screen.png',
        fileSize: 245760,
        uploadedAt: '2024-01-07T14:00:00Z'
      }
    ],
    tags: ['authentication', 'security', 'jwt'],
    viewCount: 23,
    likeCount: 8,
    commentCount: 3,
    createdAt: '2024-01-07T14:00:00Z',
    updatedAt: '2024-01-07T14:00:00Z',
    author: {
      id: 'user1',
      fullName: 'John Doe',
      profilePicture: '/mock-images/avatar1.png',
      title: 'Full Stack Developer'
    },
    project: {
      id: 'proj1',
      name: 'E-commerce Website',
      techStack: ['React', 'Node.js', 'MongoDB']
    },
    isLikedByCurrentUser: false
  },
  {
    id: '2',
    projectId: 'proj2',
    authorId: 'user2',
    content: 'Struggling with React state management in my quiz app 😅',
    reflectionNotes: 'I have multiple components that need to share quiz state, but props drilling is getting messy. Considering Context API vs Redux - what do you recommend for a beginner? The component tree is getting complex.',
    postType: 'help_request',
    attachments: [],
    tags: ['react', 'state-management', 'help'],
    viewCount: 45,
    likeCount: 12,
    commentCount: 7,
    createdAt: '2024-01-07T12:30:00Z',
    updatedAt: '2024-01-07T12:30:00Z',
    author: {
      id: 'user2',
      fullName: 'Sarah Kenya',
      profilePicture: '/mock-images/avatar2.png',
      title: 'Frontend Developer'
    },
    project: {
      id: 'proj2',
      name: 'Interactive Quiz App',
      techStack: ['React', 'TypeScript', 'Tailwind']
    },
    isLikedByCurrentUser: true
  },
  {
    id: '3',
    projectId: 'proj3',
    authorId: 'user3',
    content: 'Great progress on the mobile banking app today! Implemented biometric authentication.',
    reflectionNotes: 'Working with Touch ID and Face ID APIs was challenging but rewarding. Had to handle various edge cases like when biometrics aren\'t available or fail. The security considerations were extensive.',
    postType: 'progress_update',
    attachments: [
      {
        id: 'att2',
        postId: '3',
        fileUrl: '/mock-images/biometric-screen.png',
        fileType: 'image',
        fileName: 'biometric-auth.png',
        fileSize: 180240,
        uploadedAt: '2024-01-07T10:15:00Z'
      }
    ],
    tags: ['mobile', 'security', 'biometrics'],
    viewCount: 67,
    likeCount: 19,
    commentCount: 5,
    createdAt: '2024-01-07T10:15:00Z',
    updatedAt: '2024-01-07T10:15:00Z',
    author: {
      id: 'user3',
      fullName: 'Michael Okoye',
      profilePicture: '/mock-images/avatar3.png',
      title: 'Mobile Developer'
    },
    project: {
      id: 'proj3',
      name: 'Mobile Banking App',
      techStack: ['React Native', 'Node.js', 'PostgreSQL']
    },
    isLikedByCurrentUser: false
  }
];

const mockTrendingProjects: TrendingProject[] = [
  {
    projectId: 'proj3',
    projectName: 'Mobile Banking App',
    authorName: 'Michael Okoye',
    authorId: 'user3',
    techStack: ['React Native', 'Node.js'],
    recentPostCount: 5,
    totalViews: 234,
    totalLikes: 45
  },
  {
    projectId: 'proj1',
    projectName: 'E-commerce Website',
    authorName: 'John Doe',
    authorId: 'user1',
    techStack: ['React', 'Node.js'],
    recentPostCount: 3,
    totalViews: 189,
    totalLikes: 32
  }
];

export default function ProgressFeed({ currentUser, onBack, userId, projectId, isProjectSpecific = false }: ProgressFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<TrendingProject[]>(mockTrendingProjects);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>({ postType: 'all', timeframe: 'week' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveUserId = userId || currentUser?.id;

  useEffect(() => {
    if (effectiveUserId) {
      loadPosts();
    }
  }, [effectiveUserId, filter]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getAllPosts();
      
      if (result.error) {
        if (result.error.code === 'DB_NOT_AVAILABLE' || 
            result.error.code === 'PGRST205' || 
            result.error.message?.includes('could not find')) {
          setError('Community features are not available yet. Please set up the database to enable posts.');
          setPosts(mockPosts); // Fallback to mock data
        } else {
          throw result.error;
        }
      } else {
        // Convert database posts to app format
        const appPosts = (result.data || []).map((dbPost: any) => ({
          id: dbPost.id,
          projectId: dbPost.project_id,
          authorId: dbPost.author_id,
          content: dbPost.content,
          postType: dbPost.post_type,
          attachments: dbPost.attachments || [],
          tags: dbPost.tags || [],
          viewCount: 0, // Not tracked yet
          likeCount: 0, // Not tracked yet
          commentCount: 0, // Not tracked yet
          createdAt: dbPost.created_at,
          updatedAt: dbPost.created_at,
          author: {
            id: dbPost.author?.id || dbPost.author_id,
            fullName: dbPost.author?.full_name || 'Unknown User',
            profilePicture: dbPost.author?.profile_image_url,
            title: dbPost.author?.title || 'Developer'
          },
          project: {
            id: dbPost.project?.id || dbPost.project_id,
            name: dbPost.project?.title || 'Untitled Project',
            techStack: []
          },
          isLikedByCurrentUser: false
        }));
        
        setPosts(appPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load community posts');
      setPosts(mockPosts); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (isProjectSpecific && projectId && post.projectId !== projectId) {
      return false;
    }
    
    if (filter.postType && filter.postType !== 'all' && post.postType !== filter.postType) {
      return false;
    }
    
    // Add more filtering logic here
    return true;
  });

  const getPostTypeIcon = (type: Post['postType']) => {
    switch (type) {
      case 'progress_update':
        return <TrendingUp className="w-4 h-4" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'help_request':
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: Post['postType']) => {
    switch (type) {
      case 'progress_update':
        return 'bg-blue-100 text-blue-800';
      case 'task_completed':
        return 'bg-green-100 text-green-800';
      case 'help_request':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getPostTypeLabel = (type: Post['postType']) => {
    switch (type) {
      case 'progress_update':
        return 'Progress Update';
      case 'task_completed':
        return 'Task Completed';
      case 'help_request':
        return 'Help Request';
    }
  };

  const handleCreatePost = async (postData: any) => {
    try {
      if (!effectiveUserId) {
        throw new Error('User not authenticated');
      }

      const result = await createPost({
        project_id: postData.projectId || projectId,
        author_id: effectiveUserId,
        content: postData.content,
        post_type: postData.postType,
        attachments: postData.attachments || [],
        tags: postData.tags || []
      });

      if (result.error) {
        if (result.error.code === 'DB_NOT_AVAILABLE' || result.error.code === 'PGRST205') {
          throw new Error('Posts feature not available. Please set up the database first.');
        }
        throw result.error;
      }

      // Add the new post to the beginning of the list
      if (result.data) {
        const appPost = {
          id: result.data.id,
          projectId: result.data.project_id,
          authorId: result.data.author_id,
          content: result.data.content,
          postType: result.data.post_type,
          attachments: result.data.attachments || [],
          tags: result.data.tags || [],
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          createdAt: result.data.created_at,
          updatedAt: result.data.created_at,
          author: {
            id: result.data.author?.id || effectiveUserId,
            fullName: result.data.author?.full_name || currentUser?.fullName || 'Current User',
            profilePicture: result.data.author?.profile_image_url || currentUser?.profilePicture,
            title: result.data.author?.title || currentUser?.title || 'Developer'
          },
          project: {
            id: result.data.project?.id || result.data.project_id,
            name: result.data.project?.title || 'Current Project',
            techStack: []
          },
          isLikedByCurrentUser: false
        };
        
        setPosts(prev => [appPost, ...prev]);
      }
      
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
      // Show error to user or handle gracefully
      alert(error instanceof Error ? error.message : 'Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likeCount: post.isLikedByCurrentUser ? post.likeCount - 1 : post.likeCount + 1,
            isLikedByCurrentUser: !post.isLikedByCurrentUser
          }
        : post
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {isProjectSpecific ? 'Project Progress' : 'Community Feed'}
          </h2>
          <p className="text-muted-foreground">
            {isProjectSpecific 
              ? 'Share your development journey with the community'
              : 'Discover what developers are building across Africa'
            }
          </p>
        </div>
        
        <Button onClick={() => setShowCreatePost(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Share Progress
        </Button>
      </div>

      {/* Filters and Trending (for global feed) */}
      {!isProjectSpecific && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            
            <Select 
              value={filter.postType || 'all'} 
              onValueChange={(value) => setFilter(prev => ({ ...prev, postType: value as any }))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="progress_update">Progress Updates</SelectItem>
                <SelectItem value="task_completed">Completed Tasks</SelectItem>
                <SelectItem value="help_request">Help Requests</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filter.timeframe || 'week'} 
              onValueChange={(value) => setFilter(prev => ({ ...prev, timeframe: value as any }))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trending Projects */}
          {trendingProjects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold">Trending Projects</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingProjects.map(project => (
                    <div 
                      key={project.projectId} 
                      className="p-3 bg-muted/50 rounded-lg border hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{project.projectName}</h4>
                          <p className="text-sm text-muted-foreground">by {project.authorName}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {project.recentPostCount} posts
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {project.techStack.slice(0, 2).map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.techStack.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.techStack.length - 2}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {project.totalViews}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {project.totalLikes}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Limited Functionality</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6">
                {isProjectSpecific 
                  ? "Share your first progress update to get started!"
                  : "Be the first to share your development journey!"
                }
              </p>
              <Button onClick={() => setShowCreatePost(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              currentUserId={effectiveUserId}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredPosts.length > 0 && (
        <div className="text-center">
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More Posts'}
          </Button>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          userId={effectiveUserId || ''}
          projectId={projectId}
          onSubmit={handleCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
      )}
    </div>
  );
}