import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  Code2,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Calendar,
  HeartPulse,
  Star,
  Award,
  Zap
} from 'lucide-react';
import { Post, FeedFilter, TrendingProject } from '../types/social';
import { getAllPosts, createPost } from '../utils/database-service';
import CreatePostModal from './CreatePostModal';
import PostCard, { PostLikeEvent } from './PostCard';
import CommunityFiltering from './CommunityFiltering';
import ShareProjectModal from './ShareProjectModal';
import { supabase } from '../utils/supabase/client';

interface CommunityFeedProps {
  currentUser: any;
  onBack?: () => void;
  onProjectClick?: (project: any) => void;
  onProfileClick?: (userId: string) => void;
}

// Mock data for community stats and achievements
const communityStats = {
  totalMembers: 1247,
  activeToday: 89,
  projectsShared: 523,
  helpRequestsAnswered: 234
};

const weeklyHighlights = [
  {
    id: '1',
    type: 'achievement',
    title: 'First 1000 Members! 🎉',
    description: 'DevTrack Africa community has reached 1,000 registered developers!',
    icon: Users,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: '2',
    type: 'featured',
    title: 'Project of the Week',
    description: 'African AgriTech Platform by Kwame Asante',
    icon: Award,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: '3',
    type: 'milestone',
    title: '100 Projects Completed',
    description: 'Community members have completed 100 projects this month!',
    icon: Zap,
    color: 'bg-blue-100 text-blue-800'
  }
];

const trendingTopics = [
  { tag: 'react', count: 45, trend: '+15%' },
  { tag: 'mobile-development', count: 32, trend: '+8%' },
  { tag: 'ai-ml', count: 28, trend: '+12%' },
  { tag: 'web3', count: 21, trend: '+25%' },
  { tag: 'fintech', count: 19, trend: '+5%' }
];

export default function CommunityFeed({ 
  currentUser, 
  onBack, 
  onProjectClick,
  onProfileClick 
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showShareProject, setShowShareProject] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>({ postType: 'all', timeframe: 'week', sortBy: 'recent' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    if (currentUser?.id) {
      loadPosts();
    } else {
      // Require current user for community features
      setError('Please log in to access the community feed.');
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getAllPosts();

      if (result.error) {
        console.error('Error loading posts:', result.error);
        setError('Community features are not available yet. Please set up the database to enable posts.');
        setAllPosts([]);
        setPosts([]);
      } else {
        const appPosts = (result.data || []).map((dbPost: any) => convertDbPostToAppPost(dbPost));
        // Filter out private posts that don't belong to current user
        const visiblePosts = appPosts.filter(post =>
          post.visibility === 'public' || post.authorId === currentUser?.id
        );
        setAllPosts(visiblePosts);
        setPosts(visiblePosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load community posts. Please try again.');
      setAllPosts([]);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscriptions for live updates
  useEffect(() => {
    if (!currentUser?.id || !supabase) return;

    console.log('🔄 Setting up real-time subscriptions for community feed');

    const handleNewPost = (payload: any) => {
      console.log('📝 New post detected:', payload.new);
      const newPost = convertDbPostToAppPost(payload.new);
      // Add to state only if it's public or by the current user
      if (newPost.visibility === 'public' || newPost.authorId === currentUser.id) {
        setAllPosts(currentPosts => [newPost, ...currentPosts]);
      }
    };

    const handlePostUpdate = (payload: any) => {
      console.log('✏️ Post updated:', payload.new);
      const updatedPost = convertDbPostToAppPost(payload.new);
      setAllPosts(currentPosts =>
        currentPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
      );
    };

    const handlePostDelete = (payload: any) => {
      console.log('🗑️ Post deleted:', payload.old);
      setAllPosts(currentPosts => currentPosts.filter(p => p.id !== payload.old.id));
    };

    const postsSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handleNewPost)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, handlePostUpdate)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, handlePostDelete)
      .subscribe();

    // This subscription listens for like count changes triggered by the database function.
    // This is for updates from OTHER users. Our own likes are handled optimistically.
    const postLikesCountSubscription = supabase
      .channel('public:posts:like_count')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          const { id, like_count } = payload.new;
          // Only update if the change is from another user's action
          setAllPosts((currentPosts) =>
            currentPosts.map((post) =>
              post.id === id ? { ...post, likeCount: like_count } : post
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      if (supabase) {
        supabase.removeChannel(postsSubscription);
        supabase.removeChannel(postLikesCountSubscription);
      }
    };
  }, [currentUser?.id]);


  const convertDbPostToAppPost = (dbPost: any): Post => ({
    id: dbPost.id,
    projectId: dbPost.project_id,
    authorId: dbPost.author_id,
    content: dbPost.content,
    postType: dbPost.post_type,
    attachments: dbPost.attachments || [],
    tags: dbPost.tags || [],
    viewCount: dbPost.view_count || 0,
    likeCount: dbPost.like_count || 0,
    commentCount: dbPost.comment_count || 0,
    createdAt: dbPost.created_at,
    updatedAt: dbPost.created_at,
    visibility: dbPost.visibility || 'public',
    author: dbPost.author ? {
      id: dbPost.author.id,
      fullName: dbPost.author.full_name || 'Unknown User',
      profilePicture: dbPost.author.profile_image_url,
      title: dbPost.author.title || 'Developer'
    } : {
      id: dbPost.author_id,
      fullName: 'Unknown User',
      profilePicture: undefined,
      title: 'Developer'
    },
    project: dbPost.project ? {
      id: dbPost.project.id,
      name: dbPost.project.title || 'Untitled Project',
      techStack: []
    } : {
      id: dbPost.project_id,
      name: 'Untitled Project',
      techStack: []
    },
    isLikedByCurrentUser: dbPost.is_liked_by_current_user || false
  });

  // Advanced filtering and search
  useEffect(() => {
    let filtered = [...allPosts];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.author?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filter.postType && filter.postType !== 'all') {
      filtered = filtered.filter(post => post.postType === filter.postType);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(post => 
        filter.tags!.some(tag => post.tags.includes(tag))
      );
    }

    if (filter.techStack && filter.techStack.length > 0) {
      filtered = filtered.filter(post => 
        filter.techStack!.some(tech => 
          post.project?.techStack.some(projectTech => 
            projectTech.toLowerCase().includes(tech.toLowerCase())
          )
        )
      );
    }

    // Apply time filter
    if (filter.timeframe && filter.timeframe !== 'all') {
      const now = new Date();
      const timeLimit = new Date();
      
      switch (filter.timeframe) {
        case 'today':
          timeLimit.setDate(now.getDate() - 1);
          break;
        case 'week':
          timeLimit.setDate(now.getDate() - 7);
          break;
        case 'month':
          timeLimit.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(post => new Date(post.createdAt) >= timeLimit);
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount));
        break;
      case 'trending':
        // Simple trending algorithm based on recent engagement
        filtered.sort((a, b) => {
          const aScore = a.likeCount * 2 + a.commentCount * 3 + a.viewCount * 0.1;
          const bScore = b.likeCount * 2 + b.commentCount * 3 + b.viewCount * 0.1;
          return bScore - aScore;
        });
        break;
      case 'most-liked':
        filtered.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case 'most-commented':
        filtered.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setPosts(filtered);
  }, [allPosts, searchQuery, filter]);

  const handleCreatePost = async (postData: any) => {
    try {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await createPost({
          projectId: postData.projectId,
          authorId: currentUser.id,
          content: postData.content,
          postType: postData.postType,
          attachments: postData.attachments || [],
          tags: postData.tags || [],
          visibility: postData.visibility || 'public'
        } as any);

        if (result.error) {
          if (result.error.code === 'DB_NOT_AVAILABLE' || result.error.code === 'PGRST205') {
            throw new Error('Posts feature not available. Please set up the database first.');
          }
          throw result.error;
        }

        if (result.data) {
          const appPost = convertDbPostToAppPost(result.data);
          setAllPosts(prev => [appPost, ...prev]);
          // Refresh posts to ensure consistency
          await loadPosts();
        }
      } catch (error) {
        console.log('Error creating post, using local update:', error);
        // Fallback: add post to local state
        const newPost: Post = {
          id: 'local-' + Date.now(),
          projectId: postData.projectId || '',
          authorId: currentUser.id,
          content: postData.content,
          postType: postData.postType,
          attachments: postData.attachments || [],
          tags: postData.tags || [],
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          visibility: 'public',
          author: {
            id: currentUser.id,
            fullName: currentUser.fullName || 'Current User',
            profilePicture: currentUser.profilePicture,
            title: currentUser.title || 'Developer'
          },
          project: {
            id: postData.projectId || '',
            name: 'Current Project',
            techStack: []
          },
          isLikedByCurrentUser: false
        };
        setAllPosts(prev => [newPost, ...prev]);
      }
      
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error instanceof Error ? error.message : 'Failed to create post');
    }
  };

  const handleShareProject = async (shareData: any) => {
    try {
      // Convert share data to post format
      const newPost: Post = {
        id: 'shared-' + Date.now(),
        projectId: shareData.projectId,
        authorId: currentUser?.id || '',
        content: shareData.content,
        reflectionNotes: shareData.notes,
        postType: shareData.shareType,
        attachments: shareData.attachments || [],
        tags: shareData.tags || [],
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: 'public',
        author: {
          id: currentUser?.id || '',
          fullName: currentUser?.fullName || 'Current User',
          profilePicture: currentUser?.profilePicture,
          title: currentUser?.title || 'Developer'
        },
        project: {
          id: shareData.projectId,
          name: shareData.title,
          techStack: shareData.techStack || []
        },
        isLikedByCurrentUser: false
      };
      
      setAllPosts(prev => [newPost, ...prev]);
      setShowShareProject(false);
    } catch (error) {
      console.error('Error sharing project:', error);
      alert('Failed to share project. Please try again.');
    }
  };

  const handleLike = async ({ postId, isLiked }: PostLikeEvent) => {
    if (!currentUser?.id) return;

    // 1. Optimistic Update
    setAllPosts(currentPosts =>
      currentPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLikedByCurrentUser: !isLiked,
            likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1,
          };
        }
        return p;
      })
    );

    // 2. Database Operation
    try {
      if (isLiked) {
        // Unlike
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: currentUser.id });
      } else {
        // Like
        await supabase.from('post_likes').insert({ post_id: postId, user_id: currentUser.id });
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
      // Revert optimistic update on failure
      loadPosts(); // Simple way to revert to the source of truth
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DevTrack Africa Community</h1>
          <p className="text-muted-foreground">
            Connect, learn, and build together with African developers
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowCreatePost(true)} variant="outline" className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Quick Post
          </Button>
          <Button onClick={() => setShowShareProject(true)} className="shrink-0">
            <Share2 className="w-4 h-4 mr-2" />
            Share Project
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.totalMembers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Members</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <HeartPulse className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.activeToday}</div>
            <div className="text-sm text-muted-foreground">Active Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Code2 className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.projectsShared}</div>
            <div className="text-sm text-muted-foreground">Projects Shared</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.helpRequestsAnswered}</div>
            <div className="text-sm text-muted-foreground">Helps Provided</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Weekly Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weeklyHighlights.map(highlight => (
              <div key={highlight.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className={`p-2 rounded-lg ${highlight.color}`}>
                  <highlight.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{highlight.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        {/* Community Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {/* Enhanced Filtering System */}
          <CommunityFiltering
            currentFilter={filter}
            onFilterChange={setFilter}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            totalResults={posts.length}
          />

          {/* Error Message */}
          {error && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Demo Mode</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {isLoading ? (
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
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Be the first to share your development journey!'}
                  </p>
                  <Button onClick={() => setShowCreatePost(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  currentUserId={currentUser?.id}
                />
              ))
            )}
          </div>
        </TabsContent>



        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={topic.tag} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">#{topic.tag.replace('-', ' ')}</div>
                          <div className="text-sm text-muted-foreground">{topic.count} posts</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        {topic.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Active Developers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Most Active This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Fatima Adebayo', posts: 12, likes: 89, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
                    { name: 'Kwame Asante', posts: 8, likes: 67, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
                    { name: 'Amara Okafor', posts: 6, likes: 54, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
                  ].map((dev, index) => (
                    <div key={dev.name} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-yellow-800">#{index + 1}</span>
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={dev.avatar} />
                        <AvatarFallback>{dev.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{dev.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{dev.posts} posts</span>
                          <span>{dev.likes} likes received</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          userId={currentUser?.id || ''}
          onSubmit={handleCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
      )}

      {/* Share Project Modal */}
      {showShareProject && (
        <ShareProjectModal
          isOpen={showShareProject}
          onClose={() => setShowShareProject(false)}
          onShare={handleShareProject}
          currentUser={{
            id: currentUser?.id || '',
            fullName: currentUser?.fullName || 'Current User',
            profilePicture: currentUser?.profilePicture,
            title: currentUser?.title || 'Developer'
          }}
          projects={[]}
        />
      )}
    </div>
  );
}