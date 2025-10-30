import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { X, Plus, Code2, Globe, Github, Eye, EyeOff } from 'lucide-react';
import { LegacyProject as Project, ProjectStatus, ProjectCategory } from '../types/project';

interface MinimalProjectCreatorProps {
  project?: Project;
  onSubmit: (projectData: Omit<Project, 'id' | 'userId' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PROJECT_CATEGORIES: { value: ProjectCategory; label: string; icon: string }[] = [
  { value: 'web-app', label: 'Web App', icon: '🌐' },
  { value: 'mobile-app', label: 'Mobile', icon: '📱' },
  { value: 'api', label: 'API', icon: '⚡' },
  { value: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { value: 'library', label: 'Library', icon: '📦' },
  { value: 'game', label: 'Game', icon: '🎮' },
  { value: 'blockchain', label: 'Web3', icon: '⛓️' },
  { value: 'other', label: 'Other', icon: '🔧' }
];

const TECH_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'JavaScript', 'Vue.js',
  'Next.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS',
  'Tailwind CSS', 'Firebase', 'Supabase', 'Git', 'Flutter', 'Swift'
];

export default function MinimalProjectCreator({ 
  project, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: MinimalProjectCreatorProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'web-app' as ProjectCategory,
    status: project?.status || 'planning' as ProjectStatus,
    techStack: project?.techStack || [],
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    isPublic: project?.isPublic ?? true,
    images: project?.images || []
  });

  const [techInput, setTechInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addTechStack = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
    setTechInput('');
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }

    const submitData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      techStack: formData.techStack,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      images: formData.images,
      isPublic: formData.isPublic,
      progress: 0
    };

    const result = await onSubmit(submitData as any);
    
    if (!result.success) {
      setError(result.error || 'Failed to save project');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {project ? 'Edit Project' : 'Create Project'}
          </h1>
          <p className="text-muted-foreground">
            {project ? 'Update your project details' : 'Start tracking your development journey'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Project Name *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What are you building?"
              className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project..."
              rows={3}
              className="bg-input-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label className="text-foreground">Category *</Label>
            <div className="grid grid-cols-4 gap-2">
              {PROJECT_CATEGORIES.map(category => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                  className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                    formData.category === category.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="text-lg mb-1">{category.icon}</div>
                  <div className="text-xs">{category.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <Label className="text-foreground">Tech Stack</Label>
            
            {/* Tech Input */}
            <div className="flex space-x-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology..."
                className="flex-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && techInput.trim()) {
                    e.preventDefault();
                    addTechStack(techInput.trim());
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => techInput.trim() && addTechStack(techInput.trim())}
                disabled={!techInput.trim()}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Tech Suggestions */}
            <div className="flex flex-wrap gap-2">
              {TECH_SUGGESTIONS.filter(tech => 
                !formData.techStack.includes(tech) && 
                tech.toLowerCase().includes(techInput.toLowerCase())
              ).slice(0, 6).map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => addTechStack(tech)}
                  className="px-2 py-1 text-xs border border-border rounded-md bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
                >
                  + {tech}
                </button>
              ))}
            </div>

            {/* Selected Tech */}
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.techStack.map(tech => (
                  <Badge 
                    key={tech} 
                    className="flex items-center space-x-1 bg-primary/10 text-primary border-primary/20"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTechStack(tech)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="text-foreground flex items-center space-x-1">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="Repository URL"
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveUrl" className="text-foreground flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>Live Demo</span>
              </Label>
              <Input
                id="liveUrl"
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                placeholder="Demo URL"
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
              <div className="flex items-center space-x-3">
                {formData.isPublic ? (
                  <Eye className="w-5 h-5 text-primary" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium text-foreground">
                    {formData.isPublic ? 'Public Project' : 'Private Project'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formData.isPublic 
                      ? 'Visible to the DevTrack community' 
                      : 'Only visible to you'
                    }
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.isPublic ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    formData.isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>{project ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <>
                  <Code2 className="w-4 h-4 mr-2" />
                  {project ? 'Update Project' : 'Create Project'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}