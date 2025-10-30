import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  Plus, 
  Search, 
  Star, 
  Clock, 
  Users, 
  Code, 
  CheckCircle,
  ArrowRight,
  Filter,
  Rocket,
  Zap,
  Target
} from 'lucide-react';
import { ProjectTemplate, ProjectFromTemplate, TEMPLATE_CATEGORIES } from '../types/projectTemplate';

// Mock data - in real app, this would come from API
const mockTemplates: ProjectTemplate[] = [
  {
    id: 'template-ecommerce',
    name: 'E-commerce Website',
    description: 'Full-featured online store with shopping cart, payments, and admin dashboard',
    category: 'web_development',
    techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    estimatedDuration: 45,
    difficultyLevel: 'intermediate',
    tasks: [
      {
        id: 'task-1',
        title: 'Set up project structure',
        description: 'Initialize React app, set up folder structure, and configure basic routing',
        priority: 'high',
        estimatedHours: 2,
        status: 'todo',
        position: 0,
        category: 'setup',
        tags: ['setup', 'react']
      },
      {
        id: 'task-2',
        title: 'Design and implement homepage',
        description: 'Create responsive homepage with hero section, featured products, and navigation',
        priority: 'high',
        estimatedHours: 6,
        status: 'todo',
        position: 1,
        dependencies: ['task-1'],
        category: 'frontend',
        tags: ['design', 'responsive']
      },
      {
        id: 'task-3',
        title: 'Product catalog and search',
        description: 'Build product listing page with filtering, sorting, and search functionality',
        priority: 'high',
        estimatedHours: 8,
        status: 'todo',
        position: 2,
        dependencies: ['task-2'],
        category: 'frontend',
        tags: ['search', 'filtering']
      },
      {
        id: 'task-4',
        title: 'Shopping cart functionality',
        description: 'Implement add to cart, cart management, and local storage persistence',
        priority: 'medium',
        estimatedHours: 5,
        status: 'todo',
        position: 3,
        dependencies: ['task-3'],
        category: 'frontend',
        tags: ['cart', 'localstorage']
      },
      {
        id: 'task-5',
        title: 'User authentication system',
        description: 'Build login, register, and profile management with JWT authentication',
        priority: 'high',
        estimatedHours: 8,
        status: 'todo',
        position: 4,
        dependencies: ['task-1'],
        category: 'backend',
        tags: ['auth', 'jwt', 'security']
      },
      {
        id: 'task-6',
        title: 'Payment integration',
        description: 'Integrate Stripe for secure payment processing and order completion',
        priority: 'high',
        estimatedHours: 6,
        status: 'todo',
        position: 5,
        dependencies: ['task-4', 'task-5'],
        category: 'backend',
        tags: ['payments', 'stripe']
      },
      {
        id: 'task-7',
        title: 'Admin dashboard',
        description: 'Create admin interface for managing products, orders, and users',
        priority: 'medium',
        estimatedHours: 10,
        status: 'todo',
        position: 6,
        dependencies: ['task-5'],
        category: 'admin',
        tags: ['admin', 'dashboard']
      },
      {
        id: 'task-8',
        title: 'Testing and deployment',
        description: 'Write tests, optimize performance, and deploy to production',
        priority: 'medium',
        estimatedHours: 5,
        status: 'todo',
        position: 7,
        dependencies: ['task-6', 'task-7'],
        category: 'deployment',
        tags: ['testing', 'deployment']
      }
    ],
    tags: ['ecommerce', 'fullstack', 'payments'],
    isDefault: true,
    usageCount: 234,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template-mobile-app',
    name: 'React Native Mobile App',
    description: 'Cross-platform mobile app with authentication, navigation, and offline support',
    category: 'mobile_app',
    techStack: ['React Native', 'Expo', 'Firebase', 'AsyncStorage'],
    estimatedDuration: 30,
    difficultyLevel: 'intermediate',
    tasks: [
      {
        id: 'task-m1',
        title: 'Project setup and navigation',
        description: 'Initialize React Native app with navigation structure',
        priority: 'high',
        estimatedHours: 3,
        status: 'todo',
        position: 0,
        category: 'setup'
      },
      {
        id: 'task-m2',
        title: 'UI components and screens',
        description: 'Build reusable components and main app screens',
        priority: 'high',
        estimatedHours: 12,
        status: 'todo',
        position: 1,
        dependencies: ['task-m1'],
        category: 'ui'
      },
      {
        id: 'task-m3',
        title: 'Firebase integration',
        description: 'Set up Firebase for authentication and data storage',
        priority: 'medium',
        estimatedHours: 6,
        status: 'todo',
        position: 2,
        dependencies: ['task-m1'],
        category: 'backend'
      },
      {
        id: 'task-m4',
        title: 'Offline functionality',
        description: 'Implement offline data caching and sync',
        priority: 'medium',
        estimatedHours: 8,
        status: 'todo',
        position: 3,
        dependencies: ['task-m2', 'task-m3'],
        category: 'features'
      },
      {
        id: 'task-m5',
        title: 'Testing and deployment',
        description: 'Test on devices and deploy to app stores',
        priority: 'low',
        estimatedHours: 4,
        status: 'todo',
        position: 4,
        dependencies: ['task-m4'],
        category: 'deployment'
      }
    ],
    tags: ['mobile', 'react-native', 'firebase'],
    isDefault: true,
    usageCount: 156,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template-portfolio',
    name: 'Developer Portfolio Website',
    description: 'Personal portfolio showcasing projects, skills, and blog posts',
    category: 'web_development',
    techStack: ['React', 'Gatsby', 'GraphQL', 'Netlify'],
    estimatedDuration: 14,
    difficultyLevel: 'beginner',
    tasks: [
      {
        id: 'task-p1',
        title: 'Setup Gatsby project',
        description: 'Initialize Gatsby site with essential plugins and configuration',
        priority: 'high',
        estimatedHours: 2,
        status: 'todo',
        position: 0,
        category: 'setup'
      },
      {
        id: 'task-p2',
        title: 'Design landing page',
        description: 'Create hero section with introduction and navigation',
        priority: 'high',
        estimatedHours: 4,
        status: 'todo',
        position: 1,
        dependencies: ['task-p1'],
        category: 'design'
      },
      {
        id: 'task-p3',
        title: 'Projects showcase',
        description: 'Build projects gallery with filtering and details',
        priority: 'medium',
        estimatedHours: 6,
        status: 'todo',
        position: 2,
        dependencies: ['task-p2'],
        category: 'content'
      },
      {
        id: 'task-p4',
        title: 'Blog integration',
        description: 'Add markdown blog with tags and search',
        priority: 'low',
        estimatedHours: 5,
        status: 'todo',
        position: 3,
        dependencies: ['task-p2'],
        category: 'content'
      },
      {
        id: 'task-p5',
        title: 'Deploy and optimize',
        description: 'Deploy to Netlify and optimize for SEO',
        priority: 'medium',
        estimatedHours: 2,
        status: 'todo',
        position: 4,
        dependencies: ['task-p3', 'task-p4'],
        category: 'deployment'
      }
    ],
    tags: ['portfolio', 'gatsby', 'seo'],
    isDefault: true,
    usageCount: 89,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

interface ProjectTemplatesProps {
  onCreateFromTemplate: (templateData: ProjectFromTemplate) => Promise<void>;
}

export default function ProjectTemplates({ onCreateFromTemplate }: ProjectTemplatesProps) {
  const [templates, setTemplates] = useState<ProjectTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'duration'>('popular');

  const filteredTemplates = templates.filter(template => {
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !template.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    if (selectedCategory !== 'all' && template.category !== selectedCategory) {
      return false;
    }
    
    if (selectedDifficulty !== 'all' && template.difficultyLevel !== selectedDifficulty) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.usageCount - a.usageCount;
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'duration':
        return a.estimatedDuration - b.estimatedDuration;
      default:
        return 0;
    }
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return '🟢';
      case 'intermediate':
        return '🟡';
      case 'advanced':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const handleUseTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Project Templates</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Jump-start your development with proven project structures and task breakdowns created by the community
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates, technologies, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  {category.icon} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">🟢 Beginner</SelectItem>
              <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
              <SelectItem value="advanced">🔴 Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="duration">Shortest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const categoryInfo = TEMPLATE_CATEGORIES[template.category];
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryInfo.color}`}>
                    {categoryInfo.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {template.isDefault && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {template.usageCount} uses
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1">
                  {template.techStack.slice(0, 3).map(tech => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {template.techStack.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.techStack.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{template.estimatedDuration} days</span>
                  </div>
                  
                  <Badge className={getDifficultyColor(template.difficultyLevel)}>
                    {getDifficultyIcon(template.difficultyLevel)} {template.difficultyLevel}
                  </Badge>
                </div>

                {/* Tasks Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{template.tasks.length} Tasks</span>
                    <div className="text-xs text-muted-foreground">
                      {template.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}h total
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {template.tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    {template.tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{template.tasks.length - 3} more tasks...
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Rocket className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find the perfect template
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && !showCreateModal && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TEMPLATE_CATEGORIES[selectedTemplate.category].color}`}>
                  {TEMPLATE_CATEGORIES[selectedTemplate.category].icon}
                </div>
                {selectedTemplate.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Template Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{selectedTemplate.estimatedDuration} days</div>
                    <div className="text-xs text-muted-foreground">Estimated Duration</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{selectedTemplate.tasks.length} tasks</div>
                    <div className="text-xs text-muted-foreground">Total Tasks</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{selectedTemplate.usageCount}</div>
                    <div className="text-xs text-muted-foreground">Times Used</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="font-semibold mb-3">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.techStack.map(tech => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Task Breakdown */}
              <div>
                <h4 className="font-semibold mb-3">Task Breakdown</h4>
                <div className="space-y-3">
                  {selectedTemplate.tasks.map((task, index) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium">{task.title}</h5>
                              <div className="flex items-center gap-2">
                                {task.estimatedHours && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.estimatedHours}h
                                  </Badge>
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.priority === 'high' ? 'border-red-500 text-red-700' :
                                    task.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                    'border-green-500 text-green-700'
                                  }`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Depends on:</span>
                                {task.dependencies.map(depId => {
                                  const depTask = selectedTemplate.tasks.find(t => t.id === depId);
                                  return depTask ? (
                                    <Badge key={depId} variant="outline" className="text-xs">
                                      {depTask.title}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                <Rocket className="w-4 h-4 mr-2" />
                Use This Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Project Modal */}
      {showCreateModal && selectedTemplate && (
        <CreateFromTemplateModal
          template={selectedTemplate}
          onSubmit={async (data) => {
            await onCreateFromTemplate(data);
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}

// Create From Template Modal Component
interface CreateFromTemplateModalProps {
  template: ProjectTemplate;
  onSubmit: (data: ProjectFromTemplate) => Promise<void>;
  onClose: () => void;
}

function CreateFromTemplateModal({ template, onSubmit, onClose }: CreateFromTemplateModalProps) {
  const [projectName, setProjectName] = useState(template.name);
  const [projectDescription, setProjectDescription] = useState(template.description);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
    new Set(template.tasks.map(task => task.id))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const skippedTasks = template.tasks
        .filter(task => !selectedTasks.has(task.id))
        .map(task => task.id);

      await onSubmit({
        templateId: template.id,
        projectName,
        projectDescription: projectDescription || undefined,
        customizations: {
          skipTasks: skippedTasks.length > 0 ? skippedTasks : undefined
        }
      });
    } catch (error) {
      console.error('Error creating project from template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectedCount = selectedTasks.size;
  const totalHours = template.tasks
    .filter(task => selectedTasks.has(task.id))
    .reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Project from Template</DialogTitle>
          <DialogDescription>
            Customize your project based on the {template.name} template
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Project"
                required
              />
            </div>

            <div>
              <Label htmlFor="projectDescription">Project Description (Optional)</Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe what makes your project unique..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Task Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Select Tasks</h4>
                <p className="text-sm text-muted-foreground">
                  Choose which tasks to include in your project
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{selectedCount} of {template.tasks.length} tasks</div>
                <div>{totalHours}h estimated</div>
              </div>
            </div>

            <Progress value={(selectedCount / template.tasks.length) * 100} />

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {template.tasks.map(task => (
                <Card 
                  key={task.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTasks.has(task.id) ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedTasks.has(task.id) 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedTasks.has(task.id) && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{task.title}</h5>
                          <div className="flex items-center gap-1">
                            {task.estimatedHours && (
                              <Badge variant="outline" className="text-xs">
                                {task.estimatedHours}h
                              </Badge>
                            )}
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !projectName.trim() || selectedCount === 0}
            >
              {isSubmitting ? 'Creating...' : `Create Project (${selectedCount} tasks)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}