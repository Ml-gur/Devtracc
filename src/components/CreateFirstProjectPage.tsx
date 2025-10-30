import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  FolderPlus, 
  Lightbulb, 
  Rocket, 
  ArrowRight, 
  Code, 
  Calendar, 
  Globe, 
  Github, 
  CheckCircle, 
  Sparkles,
  Target,
  Users,
  Trophy,
  ChevronLeft
} from 'lucide-react';
import { ProjectCategory } from '../types/project';

interface CreateFirstProjectPageProps {
  onProjectCreated: () => void;
  onBack: () => void;
  onCreateProject: (projectData: any) => Promise<{ success: boolean; error?: string }>;
  userProfile?: any;
}

const PROJECT_CATEGORIES: { value: ProjectCategory; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'web-app', 
    label: 'Web Application', 
    description: 'Full-stack web applications and websites',
    icon: <Globe className="w-5 h-5" />
  },
  { 
    value: 'mobile-app', 
    label: 'Mobile App', 
    description: 'iOS, Android, and cross-platform apps',
    icon: <Code className="w-5 h-5" />
  },
  { 
    value: 'api', 
    label: 'API/Backend', 
    description: 'RESTful APIs and backend services',
    icon: <Target className="w-5 h-5" />
  },
  { 
    value: 'ai-ml', 
    label: 'AI/ML Project', 
    description: 'Machine learning and AI applications',
    icon: <Sparkles className="w-5 h-5" />
  },
  { 
    value: 'game', 
    label: 'Game', 
    description: 'Video games and interactive applications',
    icon: <Trophy className="w-5 h-5" />
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Scripts, tools, and other projects',
    icon: <FolderPlus className="w-5 h-5" />
  }
];

const STARTER_TEMPLATES = [
  {
    title: 'Personal Portfolio',
    description: 'Showcase your skills and projects to potential employers',
    category: 'web-app' as ProjectCategory,
    techStack: ['React', 'Tailwind CSS', 'Vercel'],
    estimatedTime: '1-2 weeks'
  },
  {
    title: 'Task Manager App',
    description: 'Build a productivity app to organize your daily tasks',
    category: 'web-app' as ProjectCategory,
    techStack: ['Next.js', 'Supabase', 'TypeScript'],
    estimatedTime: '2-3 weeks'
  },
  {
    title: 'Mobile Weather App',
    description: 'Create a weather app with location-based forecasts',
    category: 'mobile-app' as ProjectCategory,
    techStack: ['React Native', 'Weather API', 'AsyncStorage'],
    estimatedTime: '1-2 weeks'
  },
  {
    title: 'REST API Service',
    description: 'Build a scalable backend API for web applications',
    category: 'api' as ProjectCategory,
    techStack: ['Node.js', 'Express', 'PostgreSQL'],
    estimatedTime: '2-4 weeks'
  }
];

export default function CreateFirstProjectPage({ 
  onProjectCreated, 
  onBack, 
  onCreateProject, 
  userProfile 
}: CreateFirstProjectPageProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: 'web-app' as ProjectCategory,
    githubUrl: '',
    isPublic: true
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleTemplateSelect = (templateIndex: number) => {
    const template = STARTER_TEMPLATES[templateIndex];
    setSelectedTemplate(templateIndex);
    setProjectData({
      title: template.title,
      description: template.description,
      category: template.category,
      githubUrl: '',
      isPublic: true
    });
    setIsCustomProject(false);
  };

  const handleCustomProject = () => {
    setIsCustomProject(true);
    setSelectedTemplate(null);
    setProjectData({
      title: '',
      description: '',
      category: 'web-app',
      githubUrl: '',
      isPublic: true
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!projectData.title.trim() || !projectData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await onCreateProject({
        ...projectData,
        status: 'planning',
        techStack: selectedTemplate !== null ? STARTER_TEMPLATES[selectedTemplate].techStack : [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        images: [],
        progress: 0
      });

      if (result.success) {
        onProjectCreated();
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Step {step} of {totalSteps}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Getting Started</h2>
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200 rounded-full" />
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mb-8 shadow-xl shadow-blue-500/20">
            <Rocket className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            Create Your First Project
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Welcome to DevTrack Africa, {userProfile?.fullName || 'Developer'}! 
            Let's start your development journey by creating your first project.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          {/* Step 1: Choose Project Type */}
          {step === 1 && (
            <div className="space-y-8">
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50/90 to-blue-50/60 border-b border-slate-100/80 p-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-full"></div>
                    <CardTitle className="text-3xl font-bold text-slate-900">Choose Your Starting Point</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  {/* Template Options */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-amber-600" />
                        </div>
                        <span>Recommended Templates</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {STARTER_TEMPLATES.map((template, index) => (
                          <Card 
                            key={index}
                            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 ${
                              selectedTemplate === index 
                                ? 'ring-2 ring-blue-500 bg-blue-50/70 border-blue-300 shadow-lg' 
                                : 'hover:border-blue-300 border-slate-200'
                            }`}
                            onClick={() => handleTemplateSelect(index)}
                          >
                            <CardContent className="p-8">
                              <div className="flex items-start justify-between mb-4">
                                <h4 className="text-lg font-semibold text-slate-900">{template.title}</h4>
                                <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                                  {template.estimatedTime}
                                </Badge>
                              </div>
                              <p className="text-slate-600 mb-6 leading-relaxed">
                                {template.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {template.techStack.slice(0, 3).map((tech, techIndex) => (
                                  <Badge 
                                    key={techIndex} 
                                    variant="outline" 
                                    className="text-sm bg-slate-50 border-slate-200 text-slate-700 font-medium"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                                {template.techStack.length > 3 && (
                                  <Badge variant="outline" className="text-sm bg-slate-50 border-slate-200 text-slate-700 font-medium">
                                    +{template.techStack.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300"></div>
                      </div>
                      <div className="relative flex justify-center text-base">
                        <span className="px-6 bg-white text-slate-500 font-medium">or</span>
                      </div>
                    </div>

                    {/* Custom Project Option */}
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 border-dashed ${
                        isCustomProject 
                          ? 'border-blue-500 bg-blue-50/70 shadow-lg' 
                          : 'border-slate-300 hover:border-blue-400'
                      }`}
                      onClick={handleCustomProject}
                    >
                      <CardContent className="p-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-6">
                          <FolderPlus className="w-10 h-10 text-slate-600" />
                        </div>
                        <h4 className="text-xl font-semibold text-slate-900 mb-3">Start from Scratch</h4>
                        <p className="text-slate-600 text-lg">
                          Create a custom project with your own ideas and requirements
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6 shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-green-900 mb-3">Community Showcase</h4>
                    <p className="text-green-700 leading-relaxed">
                      Share your progress and get feedback from fellow African developers
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6 shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">Track Progress</h4>
                    <p className="text-blue-700 leading-relaxed">
                      Use our Kanban boards and analytics to monitor your development journey
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50/50 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-6 shadow-lg">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-purple-900 mb-3">Build Reputation</h4>
                    <p className="text-purple-700 leading-relaxed">
                      Establish yourself as a skilled developer in the African tech ecosystem
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNext}
                  disabled={!selectedTemplate && selectedTemplate !== 0 && !isCustomProject}
                  size="lg"
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50/90 to-blue-50/60 border-b border-slate-100/80 p-10">
                <div className="flex items-center space-x-4">
                  <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-full"></div>
                  <CardTitle className="text-3xl font-bold text-slate-900">Project Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {error && (
                  <div className="bg-red-50/90 border border-red-200/80 rounded-2xl p-6 flex items-start space-x-4">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Error</h4>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-10">
                  <div className="space-y-4">
                    <Label htmlFor="title" className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <span>Project Title</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={projectData.title}
                      onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your project name"
                      required
                      className="h-16 text-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl bg-slate-50/50 transition-all duration-200 font-medium placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="description" className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <span>Description</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={projectData.description}
                      onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what your project does and its main features"
                      rows={5}
                      required
                      className="text-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl bg-slate-50/50 transition-all duration-200 resize-none placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-slate-800">Category</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PROJECT_CATEGORIES.map(category => (
                        <Card 
                          key={category.value}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                            projectData.category === category.value 
                              ? 'ring-2 ring-blue-500 bg-blue-50/70 border-blue-300 shadow-lg' 
                              : 'hover:border-blue-300 border-slate-200'
                          }`}
                          onClick={() => setProjectData(prev => ({ ...prev, category: category.value }))}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-2xl ${
                                projectData.category === category.value 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {category.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-slate-900">{category.label}</h4>
                                <p className="text-slate-600">{category.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="githubUrl" className="text-lg font-semibold text-slate-800">GitHub Repository (Optional)</Label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                        <Github className="w-6 h-6 text-slate-400" />
                      </div>
                      <Input
                        id="githubUrl"
                        type="url"
                        value={projectData.githubUrl}
                        onChange={(e) => setProjectData(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username/repo"
                        className="h-16 pl-16 text-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl bg-slate-50/50 transition-all duration-200 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50/70 to-blue-50/50 rounded-3xl p-8 border border-slate-200/50">
                    <div className="flex items-start space-x-5">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={projectData.isPublic}
                        onChange={(e) => setProjectData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="w-6 h-6 text-blue-600 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="isPublic" className="text-lg font-semibold text-slate-800 cursor-pointer">
                          Make this project public
                        </Label>
                        <p className="text-slate-600 mt-2 leading-relaxed">
                          Public projects are visible to the DevTrack community and can receive likes and comments.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="px-8 py-4 h-14 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-2xl transition-all duration-200 font-semibold text-lg"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!projectData.title.trim() || !projectData.description.trim()}
                    size="lg"
                    className="px-10 py-4 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Ready to Launch */}
          {step === 3 && (
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50/90 to-emerald-50/60 border-b border-green-100/80 p-10">
                <div className="flex items-center space-x-4">
                  <div className="w-1 h-12 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  <CardTitle className="text-3xl font-bold text-slate-900">Ready to Launch! 🚀</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {error && (
                  <div className="bg-red-50/90 border border-red-200/80 rounded-2xl p-6 flex items-start space-x-4">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Error</h4>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-8">
                  <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-8 shadow-xl shadow-green-500/20">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-6">
                      Excellent! Your project is ready to be created.
                    </h3>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      You're about to join thousands of African developers showcasing their journey on DevTrack Africa.
                    </p>
                  </div>
                </div>

                {/* Project Summary */}
                <Card className="bg-gradient-to-br from-slate-50/70 to-blue-50/50 border border-slate-200/50 shadow-lg rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">Project Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-slate-600 uppercase tracking-wider">Title</Label>
                        <p className="text-lg font-semibold text-slate-900 mt-1">{projectData.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 uppercase tracking-wider">Category</Label>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {PROJECT_CATEGORIES.find(cat => cat.value === projectData.category)?.label}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600 uppercase tracking-wider">Description</Label>
                      <p className="text-slate-900 mt-2 leading-relaxed">{projectData.description}</p>
                    </div>
                    {selectedTemplate !== null && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600 uppercase tracking-wider">Tech Stack</Label>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {STARTER_TEMPLATES[selectedTemplate].techStack.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-sm px-3 py-1 font-medium">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">Visibility:</span>
                      <Badge variant={projectData.isPublic ? "default" : "secondary"} className="text-sm px-3 py-1 font-medium">
                        {projectData.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* What's Next */}
                <Card className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200/50 shadow-lg rounded-2xl">
                  <CardContent className="p-8">
                    <h4 className="text-xl font-semibold text-blue-900 mb-6 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>What happens next?</span>
                    </h4>
                    <ul className="space-y-4 text-blue-800">
                      <li className="flex items-start space-x-4">
                        <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-lg">Your project will be created with a Kanban board for task management</span>
                      </li>
                      <li className="flex items-start space-x-4">
                        <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-lg">You can start adding tasks and tracking your progress immediately</span>
                      </li>
                      <li className="flex items-start space-x-4">
                        <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-lg">Share updates with the community and get feedback from fellow developers</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="px-8 py-4 h-14 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-2xl transition-all duration-200 font-semibold text-lg"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    size="lg"
                    className="px-16 py-4 h-16 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Project...</span>
                      </div>
                    ) : (
                      <>
                        <Rocket className="w-6 h-6 mr-3" />
                        Create My Project
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}