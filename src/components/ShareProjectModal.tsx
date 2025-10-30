import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Share2, 
  Github,
  Upload, 
  X, 
  Video,
  Rocket,
  Trophy,
  TrendingUp,
  Star,
  Eye,
  BookOpen,
  MessageSquare,
  ExternalLink,
  Hash,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { LegacyProject as Project } from '../types/project';
import { PostAttachment } from '../types/social';
import { ProjectStorage } from '../utils/local-storage';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: ProjectShareData) => Promise<void>;
  currentUser: {
    id: string;
    fullName: string;
    profilePicture?: string;
    title?: string;
  };
  projects: Project[];
}

export interface ProjectShareData {
  projectId: string;
  shareType: 'milestone' | 'launch' | 'update' | 'demo' | 'achievement' | 'showcase' | 'tutorial' | 'feedback';
  title: string;
  content: string;
  demoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  notes: string;
  techStack: string[];
  attachments: Omit<PostAttachment, 'id' | 'postId'>[];
  tags: string[];
  includeProgress: boolean;
  includeStats: boolean;
  visibility: 'public' | 'community' | 'followers';
}

const SHARE_TYPES = [
  {
    type: 'milestone' as const,
    icon: <Trophy className="w-5 h-5" />,
    label: 'Major Milestone',
    description: 'Share a significant achievement',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    type: 'launch' as const,
    icon: <Rocket className="w-5 h-5" />,
    label: 'Product Launch',
    description: 'Announce your project going live',
    color: 'bg-green-100 text-green-800'
  },
  {
    type: 'update' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Progress Update',
    description: 'Share development progress',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    type: 'demo' as const,
    icon: <Video className="w-5 h-5" />,
    label: 'Demo Showcase',
    description: 'Show off your project',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    type: 'showcase' as const,
    icon: <Eye className="w-5 h-5" />,
    label: 'Project Showcase',
    description: 'Showcase your complete project',
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    type: 'tutorial' as const,
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Tutorial/Guide',
    description: 'Share knowledge and teach others',
    color: 'bg-cyan-100 text-cyan-800'
  }
];

const SUGGESTED_TAGS = [
  'react', 'nodejs', 'python', 'typescript', 'javascript', 'vue', 'angular',
  'flutter', 'react-native', 'swift', 'kotlin', 'java', 'go', 'rust',
  'fintech', 'edtech', 'healthtech', 'agritech', 'ecommerce', 'social',
  'ai', 'ml', 'blockchain', 'iot', 'startup', 'opensource', 'mvp',
  'africa', 'innovation', 'developer', 'coding', 'tech', 'community'
];

export default function ShareProjectModal({ 
  isOpen, 
  onClose, 
  onShare,
  currentUser 
}: ShareProjectModalProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [shareData, setShareData] = useState<ProjectShareData>({
    projectId: '',
    shareType: 'update',
    title: '',
    content: '',
    demoUrl: '',
    githubUrl: '',
    liveUrl: '',
    notes: '',
    techStack: [],
    attachments: [],
    tags: [],
    includeProgress: true,
    includeStats: false,
    visibility: 'public'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTag, setNewTag] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const userProjects = ProjectStorage.getAllProjects();
      setProjects(userProjects);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProject) {
      setShareData(prev => ({
        ...prev,
        projectId: selectedProject.id,
        title: getDefaultTitle(prev.shareType, selectedProject),
        content: getDefaultContent(prev.shareType, selectedProject),
        techStack: selectedProject.techStack || [],
        tags: getDefaultTags(selectedProject)
      }));
    }
  }, [selectedProject]);

  const getDefaultTitle = (shareType: ProjectShareData['shareType'], project: Project) => {
    switch (shareType) {
      case 'milestone':
        return `🎉 Major milestone reached in ${project.title}!`;
      case 'launch':
        return `🚀 Excited to launch ${project.title}!`;
      case 'update':
        return `📈 Progress update on ${project.title}`;
      case 'demo':
        return `🎬 Check out ${project.title} in action!`;
      case 'showcase':
        return `✨ ${project.title} - Complete Project Showcase`;
      case 'tutorial':
        return `📚 How I built ${project.title}`;
      default:
        return `${project.title} - Latest Update`;
    }
  };

  const getDefaultContent = (shareType: ProjectShareData['shareType'], project: Project) => {
    switch (shareType) {
      case 'milestone':
        return `I'm thrilled to share that ${project.title} has reached a major milestone! This project focuses on ${project.description} and has been an incredible journey.`;
      case 'launch':
        return `After hard work, I'm excited to officially launch ${project.title}! Built with ${project.techStack.slice(0, 3).join(', ')}, this project aims to ${project.description}.`;
      case 'update':
        return `Great progress on ${project.title} this week! Here's what I've been working on and the insights I've gained.`;
      case 'demo':
        return `Here's a live demo of ${project.title} showcasing the key features I've built. This project demonstrates ${project.description}.`;
      case 'showcase':
        return `Complete showcase of ${project.title}! This project demonstrates ${project.description} using ${project.techStack.join(', ')}.`;
      case 'tutorial':
        return `Sharing my experience building ${project.title}. Here's how I approached ${project.description} and lessons learned.`;
      default:
        return `Working on ${project.title} - ${project.description}`;
    }
  };

  const getDefaultTags = (project: Project) => {
    const tags = [];
    
    if (project.category) {
      tags.push(project.category.replace('-', ''));
    }
    
    if (project.techStack) {
      project.techStack.slice(0, 3).forEach(tech => {
        tags.push(tech.toLowerCase().replace(/[^a-z0-9]/g, ''));
      });
    }
    
    if (project.status === 'completed') {
      tags.push('launch');
    } else if (project.status === 'in-progress') {
      tags.push('wip');
    }
    
    return tags.slice(0, 5);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!shareData.projectId) {
      newErrors.projectId = 'Please select a project to share';
    }

    if (!shareData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!shareData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (shareData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }

    if (!shareData.notes.trim()) {
      newErrors.notes = 'Developer notes are required';
    } else if (shareData.notes.length < 30) {
      newErrors.notes = 'Notes must be at least 30 characters';
    }

    if (shareData.tags.length === 0) {
      newErrors.tags = 'Please add at least one tag';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Add image attachment if selected
      let finalShareData = { ...shareData };
      if (selectedImage && imagePreview) {
        const imageAttachment = {
          fileUrl: imagePreview, // Base64 data URL
          fileType: 'image' as const,
          fileName: selectedImage.name,
          fileSize: selectedImage.size,
          uploadedAt: new Date().toISOString()
        };
        finalShareData.attachments = [...shareData.attachments, imageAttachment];
      }

      await onShare(finalShareData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error sharing project:', error);
      setErrors({ submit: 'Failed to share project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProject(null);
    setShareData({
      projectId: '',
      shareType: 'update',
      title: '',
      content: '',
      demoUrl: '',
      githubUrl: '',
      liveUrl: '',
      notes: '',
      techStack: [],
      attachments: [],
      tags: [],
      includeProgress: true,
      includeStats: false,
      visibility: 'public'
    });
    setErrors({});
    setNewTag('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim().toLowerCase();
    if (tagToAdd && !shareData.tags.includes(tagToAdd) && shareData.tags.length < 10) {
      setShareData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
      }));
      if (!tag) setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setShareData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: keyof ProjectShareData, value: any) => {
    setShareData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'shareType' && selectedProject) {
      const newTitle = getDefaultTitle(value, selectedProject);
      const newContent = getDefaultContent(value, selectedProject);
      setShareData(prev => ({
        ...prev,
        title: newTitle,
        content: newContent
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }

    // Clear any previous image errors
    if (errors.image) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Project Progress
          </DialogTitle>
          <DialogDescription>
            Share your development journey with the DevTrack Africa community
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Project Selection */}
            <div className="space-y-3">
              <Label>Select Project to Share *</Label>
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Create your first project to start sharing!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Select 
                  value={shareData.projectId} 
                  onValueChange={(value) => {
                    handleInputChange('projectId', value);
                    const project = projects.find(p => p.id === value);
                    setSelectedProject(project || null);
                  }}
                >
                  <SelectTrigger className={errors.projectId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Choose a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {project.status}
                          </Badge>
                          <span>{project.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.projectId && (
                <p className="text-sm text-destructive">{errors.projectId}</p>
              )}
            </div>

            {selectedProject && (
              <>
                {/* Share Type Selection */}
                <div className="space-y-3">
                  <Label>What are you sharing? *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SHARE_TYPES.map(type => (
                      <Card 
                        key={type.type}
                        className={`cursor-pointer transition-all border-2 ${
                          shareData.shareType === type.type 
                            ? 'ring-2 ring-primary ring-offset-1 border-primary' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleInputChange('shareType', type.type)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${type.color}`}>
                              {type.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs">{type.label}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Post Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title *</Label>
                  <Input
                    id="title"
                    value={shareData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Give your post an engaging title..."
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Post Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">What's your story? *</Label>
                  <Textarea
                    id="content"
                    value={shareData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Share your journey, challenges, and achievements..."
                    rows={4}
                    className={errors.content ? 'border-destructive' : ''}
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content}</p>
                  )}
                </div>

                {/* Project Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="liveUrl">Live Demo URL</Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="liveUrl"
                        value={shareData.liveUrl}
                        onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                        placeholder="https://your-app.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="githubUrl"
                        value={shareData.githubUrl}
                        onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <Label>Add Image (Optional)</Label>
                  
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Add a screenshot or image</p>
                          <p className="text-xs text-muted-foreground">
                            Show off your project with a visual. PNG, JPG up to 5MB
                          </p>
                        </div>
                        <div className="mt-4">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                              <Upload className="w-4 h-4" />
                              Choose Image
                            </div>
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border">
                        <ImageWithFallback
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span>{selectedImage?.name}</span>
                        </div>
                        <span>{selectedImage ? `${(selectedImage.size / 1024 / 1024).toFixed(1)}MB` : ''}</span>
                      </div>
                    </div>
                  )}
                  
                  {errors.image && (
                    <p className="text-sm text-destructive">{errors.image}</p>
                  )}
                </div>

                {/* Developer Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Developer Notes *</Label>
                  <Textarea
                    id="notes"
                    value={shareData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Share technical insights, challenges faced, lessons learned..."
                    rows={3}
                    className={errors.notes ? 'border-destructive' : ''}
                  />
                  {errors.notes && (
                    <p className="text-sm text-destructive">{errors.notes}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label>Tags *</Label>
                  
                  {/* Current Tags */}
                  <div className="flex flex-wrap gap-2">
                    {shareData.tags.map(tag => (
                      <Badge key={tag} variant="default" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Add Custom Tag */}
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag()}
                      disabled={!newTag.trim() || shareData.tags.includes(newTag.trim().toLowerCase())}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Suggested Tags */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_TAGS.filter(tag => !shareData.tags.includes(tag)).slice(0, 10).map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-muted"
                          onClick={() => addTag(tag)}
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {errors.tags && (
                    <p className="text-sm text-destructive">{errors.tags}</p>
                  )}
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={shareData.visibility}
                    onValueChange={(value) => handleInputChange('visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">🌍 Public - Everyone can see</SelectItem>
                      <SelectItem value="community">👥 Community - DevTrack Africa members</SelectItem>
                      <SelectItem value="followers">👥 Followers - People who follow you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sharing...' : 'Share Project'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}