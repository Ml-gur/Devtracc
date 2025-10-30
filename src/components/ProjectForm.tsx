import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Upload, Github, Globe, Image, Plus, Folder, Calendar, Code, Link, Camera } from 'lucide-react';
import { LegacyProject, ProjectStatus, ProjectCategory } from '../types/project';

interface ProjectFormProps {
  project?: LegacyProject;
  onSubmit: (projectData: Omit<LegacyProject, 'id' | 'userId' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TECH_STACK_OPTIONS = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Laravel',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Firebase', 'Supabase',
  'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify',
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  'TensorFlow', 'PyTorch', 'Scikit-learn',
  'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI'
];

const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'web-app', label: 'Web Application' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'api', label: 'API/Backend' },
  { value: 'library', label: 'Library/Package' },
  { value: 'game', label: 'Game' },
  { value: 'ai-ml', label: 'AI/ML Project' },
  { value: 'blockchain', label: 'Blockchain/Web3' },
  { value: 'other', label: 'Other' }
];

const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' }
];

export default function ProjectForm({ project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) {
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
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTechOptions = TECH_STACK_OPTIONS.filter(tech => 
    tech.toLowerCase().includes(techInput.toLowerCase()) &&
    !formData.techStack.includes(tech)
  );

  const addTechStack = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
    setTechInput('');
    setShowTechSuggestions(false);
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newImages = files.map(file => {
      const objectUrl = URL.createObjectURL(file);
      return objectUrl;
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5)
    }));
  };

  const addSampleImage = () => {
    const categoryImages = {
      'web-app': 'https://images.unsplash.com/photo-1638029202288-451a89e0d55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nJTIwcHJvamVjdHxlbnwxfHx8fDE3NTYyODU2MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'mobile-app': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NTYyMDA4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'api': 'https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGklMjBiYWNrZW5kJTIwcHJvZ3JhbW1pbmd8ZW58MXx8fHwxNzU2Mjg1NjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'ai-ml': 'https://images.unsplash.com/photo-1655891709738-a48aad482a3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMG1hY2hpbmUlMjBsZWFybmluZ3xlbnwxfHx8fDE3NTYxOTI2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'library': 'https://images.unsplash.com/photo-1603985585179-3d71c35a537c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTYyODU2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'game': 'https://images.unsplash.com/photo-1638029202288-451a89e0d55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nJTIwcHJvamVjdHxlbnwxfHx8fDE3NTYyODU2MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'blockchain': 'https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGklMjBiYWNrZW5kJTIwcHJvZ3JhbW1pbmd8ZW58MXx8fHwxNzU2Mjg1NjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'other': 'https://images.unsplash.com/photo-1603985585179-3d71c35a537c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTYyODU2NDF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    };

    const sampleImage = categoryImages[formData.category] || categoryImages['web-app'];
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, sampleImage].slice(0, 5)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Folder className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            {project ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {project 
              ? 'Update your project details and continue your development journey.'
              : 'Start your development journey by creating a new project. Fill out the details below to get started.'
            }
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50/80 to-blue-50/40 border-b border-slate-100/60 p-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              <CardTitle className="text-2xl font-bold text-slate-900">Project Details</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <div className="bg-red-50/80 border border-red-200/60 rounded-xl p-6 flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Information Section */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-semibold text-slate-800 flex items-center space-x-2">
                      <span>Project Title</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your project name"
                      required
                      className="h-14 text-base border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200 font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold text-slate-800 flex items-center space-x-2">
                      <span>Description</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what your project does and its key features"
                      rows={4}
                      required
                      className="text-base border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-slate-800">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: ProjectCategory) => 
                          setFormData(prev => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          {PROJECT_CATEGORIES.map(category => (
                            <SelectItem 
                              key={category.value} 
                              value={category.value}
                              className="rounded-lg text-base py-3 focus:bg-blue-50 focus:text-blue-900"
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-slate-800">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: ProjectStatus) => 
                          setFormData(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          {PROJECT_STATUSES.map(status => (
                            <SelectItem 
                              key={status.value} 
                              value={status.value}
                              className="rounded-lg text-base py-3 focus:bg-blue-50"
                            >
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${status.color}`}>
                                {status.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Stack Section */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Technology Stack</h3>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      value={techInput}
                      onChange={(e) => {
                        setTechInput(e.target.value);
                        setShowTechSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowTechSuggestions(techInput.length > 0)}
                      placeholder="Type to add technologies (e.g., React, Python, Node.js)"
                      className="h-14 text-base border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && techInput.trim()) {
                          e.preventDefault();
                          addTechStack(techInput.trim());
                        }
                      }}
                    />
                    
                    {showTechSuggestions && filteredTechOptions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredTechOptions.slice(0, 8).map(tech => (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => addTechStack(tech)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 text-base border-b border-slate-100 last:border-b-0 transition-colors duration-150 font-medium"
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {formData.techStack.map(tech => (
                        <Badge 
                          key={tech} 
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-lg font-medium text-sm hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                        >
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => removeTechStack(tech)}
                            className="hover:text-red-600 transition-colors duration-150"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Timeline</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-base font-semibold text-slate-800">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="h-14 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="text-base font-semibold text-slate-800">End Date <span className="text-slate-500 font-normal">(Optional)</span></Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="h-14 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Link className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Project Links</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="githubUrl" className="text-base font-semibold text-slate-800">GitHub Repository</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Github className="w-5 h-5 text-slate-400" />
                      </div>
                      <Input
                        id="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username/repo"
                        className="h-14 pl-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="liveUrl" className="text-base font-semibold text-slate-800">Live Demo</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Globe className="w-5 h-5 text-slate-400" />
                      </div>
                      <Input
                        id="liveUrl"
                        type="url"
                        value={formData.liveUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                        placeholder="https://your-project.com"
                        className="h-14 pl-12 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-slate-50/50 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Project Images</h3>
                </div>

                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-gradient-to-br from-slate-50/50 to-blue-50/30 hover:border-blue-400 hover:from-blue-50/50 hover:to-indigo-50/40 transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <Label htmlFor="images" className="cursor-pointer">
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-slate-800">Upload Project Images</h4>
                        <p className="text-slate-600">Drag and drop or click to select images</p>
                        <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB each (max 5 images)</p>
                      </div>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </Label>
                    <div className="mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSampleImage}
                        disabled={formData.images.length >= 5}
                        className="bg-white/80 hover:bg-white border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-all duration-200 rounded-xl px-6 py-3"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Add Sample Image
                      </Button>
                    </div>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={`image-${index}`} className="relative group">
                          <ImageWithFallback
                            src={image}
                            alt={`Project image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-xl border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Visibility Section */}
              <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/30 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="isPublic" className="text-base font-semibold text-slate-800 cursor-pointer">
                      Make this project public
                    </Label>
                    <p className="text-slate-600 mt-1">
                      Public projects are visible to the DevTrack community and can receive likes and comments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="px-8 py-3 h-12 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200 font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-3 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    project ? 'Update Project' : 'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}