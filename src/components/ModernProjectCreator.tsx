import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  X, 
  Plus, 
  Code2, 
  Globe, 
  Github, 
  Calendar,
  Image,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Lightbulb,
  Zap,
  Target
} from 'lucide-react';
import { LegacyProject as Project, ProjectStatus, ProjectCategory } from '../types/project';
// Note: unsplash_tool is available globally

interface ModernProjectCreatorProps {
  project?: Project;
  onSubmit: (projectData: Omit<Project, 'id' | 'userId' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
}

type CreationStep = 'basics' | 'details' | 'resources' | 'finish';

const TECH_STACK_SUGGESTIONS = {
  'web-app': ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Node.js'],
  'mobile-app': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
  'api': ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker'],
  'library': ['TypeScript', 'Node.js', 'Jest', 'Rollup', 'npm'],
  'game': ['Unity', 'C#', 'Godot', 'JavaScript', 'WebGL'],
  'ai-ml': ['Python', 'TensorFlow', 'PyTorch', 'Jupyter', 'NumPy'],
  'blockchain': ['Solidity', 'Web3.js', 'Ethereum', 'Hardhat', 'React'],
  'other': ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB']
};

const PROJECT_CATEGORIES: { value: ProjectCategory; label: string; description: string; icon: string }[] = [
  { value: 'web-app', label: 'Web Application', description: 'Websites, dashboards, web platforms', icon: '🌐' },
  { value: 'mobile-app', label: 'Mobile App', description: 'iOS, Android, cross-platform apps', icon: '📱' },
  { value: 'api', label: 'API/Backend', description: 'REST APIs, microservices, backends', icon: '⚡' },
  { value: 'ai-ml', label: 'AI/ML Project', description: 'Machine learning, data science', icon: '🤖' },
  { value: 'library', label: 'Library/Package', description: 'NPM packages, open source libraries', icon: '📦' },
  { value: 'game', label: 'Game', description: 'Video games, interactive experiences', icon: '🎮' },
  { value: 'blockchain', label: 'Blockchain/Web3', description: 'DApps, smart contracts, DeFi', icon: '⛓️' },
  { value: 'other', label: 'Other', description: 'Desktop apps, scripts, tools', icon: '🔧' }
];

const PROJECT_TEMPLATES = [
  {
    title: 'E-commerce Platform',
    description: 'Modern online store with payment integration',
    category: 'web-app' as ProjectCategory,
    techStack: ['React', 'TypeScript', 'Stripe', 'Tailwind CSS', 'Node.js']
  },
  {
    title: 'Task Management App',
    description: 'Kanban-style productivity application',
    category: 'web-app' as ProjectCategory,
    techStack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS']
  },
  {
    title: 'Mobile Fitness Tracker',
    description: 'Cross-platform health and fitness app',
    category: 'mobile-app' as ProjectCategory,
    techStack: ['React Native', 'TypeScript', 'Firebase', 'Health APIs']
  },
  {
    title: 'REST API Service',
    description: 'Scalable backend API with authentication',
    category: 'api' as ProjectCategory,
    techStack: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Docker']
  }
];

export default function ModernProjectCreator({ 
  project, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ModernProjectCreatorProps) {
  const [currentStep, setCurrentStep] = useState<CreationStep>('basics');
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'web-app' as ProjectCategory,
    status: project?.status || 'planning' as ProjectStatus,
    techStack: project?.techStack || [],
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    endDate: project?.endDate || '',
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    images: project?.images || [],
    isPublic: project?.isPublic ?? true
  });

  const [techInput, setTechInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const steps: { id: CreationStep; title: string; icon: React.ComponentType<any> }[] = [
    { id: 'basics', title: 'Basics', icon: Lightbulb },
    { id: 'details', title: 'Details', icon: Code2 },
    { id: 'resources', title: 'Resources', icon: Globe },
    { id: 'finish', title: 'Finish', icon: Check }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const suggestedTechStack = TECH_STACK_SUGGESTIONS[formData.category] || [];

  const canProceed = () => {
    switch (currentStep) {
      case 'basics':
        return formData.title.trim().length > 0 && formData.category;
      case 'details':
        return formData.description.trim().length > 0;
      case 'resources':
        return true; // Optional step
      case 'finish':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && !isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(steps[prevIndex].id);
    }
  };

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

  const addSampleImage = async () => {
    setImageLoading(true);
    try {
      // Use the category-based image search
      const searchQuery = `${formData.category.replace('-', ' ')} development project`;
      
      // For now, use placeholder images based on category
      const categoryImages: { [key: string]: string } = {
        'web app development project': 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&auto=format',
        'mobile app development project': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&auto=format',
        'api development project': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&auto=format',
        'library development project': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format',
        'game development project': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop&auto=format',
        'ai ml development project': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop&auto=format',
        'blockchain development project': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop&auto=format',
        'other development project': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&auto=format'
      };

      const imageUrl = categoryImages[searchQuery] || categoryImages['other development project'];
      
      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl].slice(0, 3) // Limit to 3 images
        }));
      }
    } catch (error) {
      console.warn('Failed to load sample image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const applyTemplate = (template: typeof PROJECT_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      category: template.category,
      techStack: template.techStack
    }));
  };

  const handleSubmit = async () => {
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
      startDate: formData.startDate,
      endDate: formData.endDate,
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-8">
            {/* Quick Templates */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>Quick Start Templates</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROJECT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyTemplate(template)}
                    className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
                  >
                    <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-900">
                      {template.title}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold text-slate-900">
                Project Name *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What are you building?"
                className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-white"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-slate-900">
                Project Type *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROJECT_CATEGORIES.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                    className={`p-4 border rounded-xl text-left transition-all duration-200 ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-semibold text-slate-900">{category.label}</h4>
                        <p className="text-sm text-slate-600">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-semibold text-slate-900">
                Project Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project, its purpose, and key features..."
                rows={4}
                className="text-base border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-white resize-none"
              />
            </div>

            {/* Tech Stack */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-slate-900">
                Technology Stack
              </Label>
              
              {/* Suggested Tech */}
              {suggestedTechStack.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Suggested for {PROJECT_CATEGORIES.find(c => c.value === formData.category)?.label}:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTechStack.map(tech => (
                      <button
                        key={tech}
                        onClick={() => addTechStack(tech)}
                        disabled={formData.techStack.includes(tech)}
                        className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                          formData.techStack.includes(tech)
                            ? 'bg-blue-100 border-blue-200 text-blue-700 cursor-not-allowed'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {formData.techStack.includes(tech) ? <Check className="w-3 h-3 inline mr-1" /> : <Plus className="w-3 h-3 inline mr-1" />}
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Tech Input */}
              <div className="space-y-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Add custom technology..."
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && techInput.trim()) {
                      e.preventDefault();
                      addTechStack(techInput.trim());
                    }
                  }}
                />
              </div>

              {/* Selected Tech */}
              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map(tech => (
                    <Badge 
                      key={tech} 
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-lg"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTechStack(tech)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-base font-semibold text-slate-900">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="endDate" className="text-base font-semibold text-slate-900">
                  Target Completion <span className="text-slate-500 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-8">
            {/* Links */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="githubUrl" className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username/project"
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="liveUrl" className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Live Demo URL</span>
                </Label>
                <Input
                  id="liveUrl"
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                  placeholder="https://your-project.com"
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Project Images */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                <Image className="w-4 h-4" />
                <span>Project Screenshots</span>
              </Label>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSampleImage}
                  disabled={formData.images.length >= 3 || imageLoading}
                  className="mb-3"
                >
                  {imageLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Sample Image
                </Button>
                <p className="text-sm text-slate-600">
                  {formData.images.length}/3 images added
                </p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <ImageWithFallback
                        src={image}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'finish':
        return (
          <div className="space-y-8">
            {/* Project Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Project Summary</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-600">Name:</span>
                  <p className="font-semibold text-slate-900">{formData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Type:</span>
                  <p className="text-slate-900">
                    {PROJECT_CATEGORIES.find(c => c.value === formData.category)?.label}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Technologies:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.techStack.slice(0, 5).map(tech => (
                      <span key={tech} className="text-xs bg-white text-slate-700 px-2 py-1 rounded border">
                        {tech}
                      </span>
                    ))}
                    {formData.techStack.length > 5 && (
                      <span className="text-xs text-slate-500">+{formData.techStack.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="isPublic" className="font-semibold text-slate-900 cursor-pointer">
                    Share with DevTrack community
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Make your project visible to other developers for feedback and collaboration
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span>What's Next?</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Start adding tasks to track your progress</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Use the Kanban board to organize your workflow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Connect with other developers in the community</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {project ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-slate-600">
            {project 
              ? 'Update your project details and continue your journey'
              : 'Transform your idea into a trackable development project'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-white to-blue-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-xl font-semibold text-slate-900">
              {steps.find(s => s.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={isFirstStep ? onCancel : handleBack}
                className="px-6 py-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {isFirstStep ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </>
                )}
              </Button>

              <Button 
                type="button"
                onClick={isLastStep ? handleSubmit : handleNext}
                disabled={!canProceed() || isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : isLastStep ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {project ? 'Update Project' : 'Create Project'}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}