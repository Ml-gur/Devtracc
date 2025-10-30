import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  ArrowLeft,
  MapPin, 
  Calendar, 
  Github, 
  Globe, 
  Mail,
  Users,
  FolderOpen,
  Star,
  Heart,
  MessageCircle,
  Code2,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';
import { LegacyProject as Project } from '../types/project';
import { Post } from '../types/social';
import { getUserProjects, getUserPosts, getUserProfile, UserProfile } from '../utils/database-service';
import ProjectCard from './ProjectCard';
import PostCard from './PostCard';

interface DeveloperProfileProps {
  userId: string;
  currentUserId?: string;
  onBack?: () => void;
  onProjectClick?: (project: Project) => void;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

interface ProfileStats {
  projectsCount: number;
  postsCount: number;
  likesReceived: number;
  followers: number;
  following: number;
  completedProjects: number;
}

export default function DeveloperProfile({ 
  userId, 
  currentUserId, 
  onBack, 
  onProjectClick,
  onFollowToggle 
}: DeveloperProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    projectsCount: 0,
    postsCount: 0,
    likesReceived: 0,
    followers: 156,
    following: 89,
    completedProjects: 0
  });

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      try {
        const profileResult = await getUserProfile(userId);
        if (profileResult.error) {
          console.log('Profile not available, using mock data');
          setProfile(createMockProfile());
        } else {
          setProfile(profileResult.data || createMockProfile());
        }
      } catch (error) {
        console.log('Error loading profile, using mock data:', error);
        setProfile(createMockProfile());
      }

      // Load user projects
      try {
        const projectsResult = await getUserProjects(userId);
        if (projectsResult.error) {
          console.log('Projects not available, using mock data');
          setProjects(createMockProjects());
        } else {
          setProjects(projectsResult.data || createMockProjects());
        }
      } catch (error) {
        console.log('Error loading projects, using mock data:', error);
        setProjects(createMockProjects());
      }

      // Load user posts
      try {
        const postsResult = await getUserPosts(userId);
        if (postsResult.error) {
          console.log('Posts not available, using mock data');
          setPosts(createMockPosts());
        } else {
          setPosts(postsResult.data || createMockPosts());
        }
      } catch (error) {
        console.log('Error loading posts, using mock data:', error);
        setPosts(createMockPosts());
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
      // Fallback to mock data
      setProfile(createMockProfile());
      setProjects(createMockProjects());
      setPosts(createMockPosts());
    } finally {
      setLoading(false);
    }
  };

  // Update stats when data changes
  useEffect(() => {
    const projectsCount = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const likesReceived = projects.reduce((sum, p) => sum + p.likes, 0);
    
    setStats(prev => ({
      ...prev,
      projectsCount,
      postsCount: posts.length,
      likesReceived,
      completedProjects
    }));
  }, [projects, posts]);

  const createMockProfile = (): UserProfile => ({
    id: userId,
    email: 'developer@example.com',
    full_name: 'Amara Okafor',
    title: 'Full Stack Developer',
    country: 'Nigeria',
    phone: '+234123456789',
    tech_stack: ['React', 'Node.js', 'Python', 'TypeScript', 'MongoDB'],
    bio: 'Passionate full-stack developer from Lagos, Nigeria. Building innovative solutions for African markets with a focus on mobile-first experiences and offline functionality. Love mentoring young developers and contributing to open source.',
    profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-01-07T00:00:00Z'
  });

  const createMockProjects = (): Project[] => [
    {
      id: 'profile-proj-1',
      userId: userId,
      title: 'AgriConnect Mobile',
      description: 'Mobile platform connecting farmers with buyers and providing real-time market prices across Nigeria.',
      category: 'mobile-app',
      status: 'completed',
      techStack: ['React Native', 'Node.js', 'MongoDB', 'Socket.io'],
      startDate: '2023-09-01',
      endDate: '2024-01-15',
      githubUrl: 'https://github.com/example/agriconnect',
      liveUrl: 'https://agriconnect.example.com',
      images: [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop'
      ],
      likes: 89,
      comments: [],
      isPublic: true,
      progress: 100,
      createdAt: '2023-09-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'profile-proj-2',
      userId: userId,
      title: 'EduChain Certificate System',
      description: 'Blockchain-based system for verifying educational certificates and preventing fraud.',
      category: 'blockchain',
      status: 'in-progress',
      techStack: ['Solidity', 'Web3.js', 'React', 'IPFS'],
      startDate: '2024-01-01',
      githubUrl: 'https://github.com/example/educhain',
      images: [
        'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop'
      ],
      likes: 45,
      comments: [],
      isPublic: true,
      progress: 75,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-07T00:00:00Z'
    }
  ];

  const createMockPosts = (): Post[] => [
    {
      id: 'profile-post-1',
      projectId: 'profile-proj-1',
      authorId: userId,
      content: 'Just launched AgriConnect! 🚀 After 4 months of development, farmers can now connect directly with buyers.',
      postType: 'task_completed',
      attachments: [
        {
          id: 'att1',
          postId: 'profile-post-1',
          fileUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
          fileType: 'image',
          fileName: 'agriconnect-launch.png',
          fileSize: 245760,
          uploadedAt: '2024-01-15T14:00:00Z'
        }
      ],
      tags: ['react-native', 'agriculture', 'mobile', 'launch'],
      viewCount: 234,
      likeCount: 67,
      commentCount: 23,
      createdAt: '2024-01-15T14:00:00Z',
      updatedAt: '2024-01-15T14:00:00Z',
      author: {
        id: userId,
        fullName: profile?.full_name || 'Amara Okafor',
        profilePicture: profile?.profile_image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        title: profile?.title || 'Full Stack Developer'
      },
      project: {
        id: 'profile-proj-1',
        name: 'AgriConnect Mobile',
        techStack: ['React Native', 'Node.js', 'MongoDB']
      },
      isLikedByCurrentUser: false
    }
  ];

  const handleFollowToggle = () => {
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    
    // Update follower count
    setStats(prev => ({
      ...prev,
      followers: newFollowState ? prev.followers + 1 : prev.followers - 1
    }));
    
    onFollowToggle?.(userId, newFollowState);
  };

  const handleLike = (postId: string) => {
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

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-64"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Profile not found</h3>
          <p className="text-muted-foreground">This developer profile could not be loaded.</p>
          {onBack && (
            <Button className="mt-4" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.profile_image_url} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {!isOwnProfile && currentUserId && (
                <Button 
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "secondary" : "default"}
                  className="w-full md:w-auto"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-xl text-muted-foreground">{profile.title}</p>
              </div>

              {profile.bio && (
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Location and Join Date */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.country}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatJoinDate(profile.created_at || '')}
                </div>
              </div>

              {/* Tech Stack */}
              {profile.tech_stack && profile.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.tech_stack.map(tech => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Contact Links */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm">
                  <Globe className="w-4 h-4 mr-1" />
                  Portfolio
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FolderOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.projectsCount}</div>
            <div className="text-sm text-muted-foreground">Projects</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.postsCount}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.likesReceived}</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.followers}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.following}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects ({stats.projectsCount})</TabsTrigger>
          <TabsTrigger value="posts">Posts ({stats.postsCount})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't created any projects yet." : "This developer hasn't shared any projects yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewProject={() => onProjectClick?.(project)}
                  currentUserId={currentUserId}
                  showActions={isOwnProfile}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't shared any posts yet." : "This developer hasn't shared any posts yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="space-y-4">
            {/* Recent Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Completed project "AgriConnect Mobile"</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Shared a progress update</p>
                      <p className="text-sm text-muted-foreground">5 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Started new project "EduChain Certificate System"</p>
                      <p className="text-sm text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Gained 25 new followers</p>
                      <p className="text-sm text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">First Project Completed</p>
                      <p className="text-sm text-muted-foreground">Completed your first project</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Community Builder</p>
                      <p className="text-sm text-muted-foreground">Gained 100+ followers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Tech Enthusiast</p>
                      <p className="text-sm text-muted-foreground">Used 10+ technologies</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Rising Star</p>
                      <p className="text-sm text-muted-foreground">Received 500+ project likes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}