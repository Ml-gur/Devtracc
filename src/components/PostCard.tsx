import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Clock,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  MoreHorizontal,
  Flag,
  ExternalLink,
  Send
} from 'lucide-react';
import { Post, PostComment } from '../types/social';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { togglePostLike, getPostComments, createPostComment } from '../utils/database-service';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  currentUserId: string;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  showComments?: boolean;
}

export default function PostCard({
  post,
  onLike,
  currentUserId,
  onComment,
  onShare,
  showComments = false
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullReflection, setShowFullReflection] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (showCommentsSection && comments.length === 0) {
      loadComments();
    }
  }, [showCommentsSection]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const result = await getPostComments(post.id);
      if (result.data) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      const result = await togglePostLike(post.id, currentUserId);
      if (result.error) {
        console.error('Error toggling like:', result.error);
        return;
      }

      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
      onLike(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const result = await createPostComment(post.id, currentUserId, newComment.trim());
      if (result.data) {
        setComments(prev => [...prev, result.data]);
        setNewComment('');
        // Update comment count
        post.commentCount = (post.commentCount || 0) + 1;
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'task_completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'help_request':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const isOwner = post.authorId === currentUserId;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Post Type Badge */}
            <Badge variant="secondary" className={`${getPostTypeColor(post.postType)} shrink-0`}>
              {getPostTypeIcon(post.postType)}
              <span className="ml-1">{getPostTypeLabel(post.postType)}</span>
            </Badge>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>{getInitials(post.author?.fullName || 'U')}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.author?.fullName}</span>
              {post.author?.title && (
                <Badge variant="outline" className="text-xs">
                  {post.author.title}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{post.project?.name}</span>
              {post.project?.techStack && post.project.techStack.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {post.project.techStack.slice(0, 2).map((tech, index) => (
                      <Badge key={`${post.id}-tech-${index}-${tech}`} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {post.project.techStack.length > 2 && (
                      <span className="text-xs">+{post.project.techStack.length - 2}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          {/* Main Content */}
          <div>
            <p className="text-base leading-relaxed">{post.content}</p>
          </div>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-3">
              {post.attachments.map((attachment, index) => (
                <div key={`${post.id}-attachment-${attachment.id || index}`}>
                  {attachment.fileType === 'image' ? (
                    <div className="relative">
                      <ImageWithFallback
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        className="w-full max-w-md rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                        onClick={() => setIsExpanded(!isExpanded)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.fileType}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reflection Notes */}
          {post.reflectionNotes && (
            <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-primary">Reflection</span>
                <Badge variant="outline" className="text-xs">
                  Learning Notes
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {showFullReflection 
                  ? post.reflectionNotes 
                  : truncateText(post.reflectionNotes, 150)
                }
                {post.reflectionNotes.length > 150 && (
                  <button
                    onClick={() => setShowFullReflection(!showFullReflection)}
                    className="ml-2 text-primary hover:underline text-xs font-medium"
                  >
                    {showFullReflection ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map((tag, index) => (
                <Badge key={`${post.id}-tag-${index}-${tag}`} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Post Stats and Actions */}
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </div>
            
            {post.likeCount > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount}</span>
              </div>
            )}
            
            {post.commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentCount}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-9 px-3 ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentsSection(!showCommentsSection)}
              className="h-9 px-3"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare && onShare(post.id)}
              className="h-9 px-3"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>

            {/* Help Request specific action */}
            {post.postType === 'help_request' && !isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 ml-2"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showCommentsSection && (
          <div className="mt-4 space-y-4">
            <Separator />

            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleComment();
                    }
                  }}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="h-8"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {isSubmittingComment ? 'Posting...' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author?.profilePicture} />
                      <AvatarFallback>
                        {comment.author?.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.author?.fullName || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        )}

        {/* Achievement Badge for Task Completion */}
        {post.postType === 'task_completed' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Task Completed! 🎉</p>
                <p className="text-xs text-green-600">Another step forward in your development journey</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}