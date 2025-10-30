import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Heart, 
  MessageCircle, 
  Github, 
  Globe, 
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  Share2,
  ArrowRight,
  CloudOff,
  Users,
  Instagram
} from 'lucide-react';
import { LegacyProject, Comment } from '../types/project';

interface ProjectCardProps {
  project: LegacyProject;
  currentUserId?: string;
  onLike?: (projectId: string) => void;
  onComment?: (projectId: string, comment: string) => void;
  onEdit?: (project: LegacyProject) => void;
  onDelete?: (projectId: string) => void;
  onViewProfile?: (userId: string) => void;
  onViewProject?: (project: LegacyProject) => void;
  onClick?: (project: LegacyProject) => void; // Alternative to onViewProject for simpler usage
  showActions?: boolean;
  variant?: 'full' | 'compact';
  isTemporary?: boolean;
}

const STATUS_COLORS = {
  planning: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  'on-hold': 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function ProjectCard({ 
  project, 
  currentUserId,
  onLike, 
  onComment, 
  onEdit, 
  onDelete,
  onViewProfile,
  onViewProject,
  onClick,
  showActions = true,
  variant = 'full',
  isTemporary = false
}: ProjectCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false); // In real app, this would come from user data
  const [likesCount, setLikesCount] = useState(project.likes);

  const isOwner = currentUserId === project.userId;
  const isTemp = isTemporary || project.id.startsWith('temp-');
  
  const handleLike = () => {
    if (onLike) {
      onLike(project.id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComment && newComment.trim()) {
      onComment(project.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleViewProject = () => {
    if (onViewProject) {
      onViewProject(project);
    } else if (onClick) {
      onClick(project);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div 
              className="cursor-pointer"
              onClick={handleViewProject}
            >
              <CardTitle className="line-clamp-1 hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={STATUS_COLORS[project.status]}>
                {project.status.replace('-', ' ')}
              </Badge>
              {isTemp && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <CloudOff className="w-3 h-3 mr-1" />
                  Local
                </Badge>
              )}
              {project.isCollaborative && project.collaborators && project.collaborators.length > 0 && (
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  <Users className="w-3 h-3 mr-1" />
                  {project.collaborators.length + 1} collaborators
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {formatDate(project.startDate)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-1">
            {onViewProject && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewProject}
                title="View project details"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {isOwner && showActions && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(project)}
                  title="Edit project"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(project.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Project Images */}
        {project.images && project.images.length > 0 && (
          <div className="mt-4 cursor-pointer" onClick={handleViewProject}>
            {project.images.length === 1 ? (
              <ImageWithFallback
                src={project.images[0]}
                alt={project.title}
                className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {project.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <ImageWithFallback
                      src={image}
                      alt={`${project.title} ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                    {index === 3 && project.images.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <span className="text-white">
                          +{project.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="cursor-pointer" onClick={handleViewProject}>
          <p className="text-sm text-muted-foreground line-clamp-3 hover:text-foreground transition-colors">
            {project.description}
          </p>
        </div>

        {/* Collaborators */}
        {project.isCollaborative && project.collaborators && project.collaborators.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Collaborators:</span>
            <div className="flex -space-x-2">
              {project.collaborators.slice(0, 3).map((collaborator, index) => (
                <div key={collaborator.id} className="relative">
                  <Avatar className="w-6 h-6 border-2 border-background">
                    <ImageWithFallback
                      src={collaborator.profilePicture || ''}
                      alt={collaborator.fullName}
                    />
                  </Avatar>
                </div>
              ))}
              {project.collaborators.length > 3 && (
                <div className="flex items-center justify-center w-6 h-6 bg-muted border-2 border-background rounded-full">
                  <span className="text-xs">+{project.collaborators.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.techStack.slice(0, 4).map(tech => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.techStack.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.techStack.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2">
          {project.githubUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-1" />
                Code
              </a>
            </Button>
          )}
          {project.liveUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-1" />
                Live Demo
              </a>
            </Button>
          )}
        </div>

        {/* Social Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {likesCount}
              </button>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {project.comments ? project.comments.length : 0}
              </button>

              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            {/* Comments List */}
            {project.comments.length > 0 && (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {project.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.profilePicture} />
                      <AvatarFallback>
                        {comment.user.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.user.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" size="sm" disabled={!newComment.trim()}>
                Post
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}