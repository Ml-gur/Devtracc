import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { 
  Bookmark, 
  Plus, 
  Star, 
  Clock, 
  Tag,
  Sparkles
} from 'lucide-react';
import { Task, TaskPriority, PRIORITY_COLORS, PRIORITY_ICONS } from '../types/task';
import { TaskTemplate, TEMPLATE_CATEGORIES } from '../types/template';
import { useTaskTemplates } from './hooks/useTaskTemplates';

interface AddTaskModalProps {
  projectId: string;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

export default function AddTaskModal({ projectId, onSubmit, onClose }: AddTaskModalProps) {
  const { templates, incrementUsage, getPopularTemplates, getTemplatesByCategory } = useTaskTemplates();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    estimatedHours: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const popularTemplates = getPopularTemplates(3);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.estimatedHours && (isNaN(Number(formData.estimatedHours)) || Number(formData.estimatedHours) <= 0)) {
      newErrors.estimatedHours = 'Estimated hours must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.taskTitle,
      description: template.taskDescription || '',
      priority: template.priority,
      estimatedHours: template.estimatedHours?.toString() || ''
    });
    incrementUsage(template.id);
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      estimatedHours: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: 'todo',
        priority: formData.priority,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
        timeSpentMinutes: 0,
        position: 0
      };

      await onSubmit(newTask);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const groupedTemplates = Object.entries(TEMPLATE_CATEGORIES).map(([key, categoryInfo]) => ({
    category: key as TaskTemplate['category'],
    ...categoryInfo,
    templates: getTemplatesByCategory(key as TaskTemplate['category'])
  }));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task from scratch or use a template to get started quickly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Task</TabsTrigger>
            <TabsTrigger value="templates">
              <Sparkles className="w-4 h-4 mr-1" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Selected Template Banner */}
            {selectedTemplate && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TEMPLATE_CATEGORIES[selectedTemplate.category].color}`}>
                        {TEMPLATE_CATEGORIES[selectedTemplate.category].icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedTemplate.name}</span>
                          {selectedTemplate.isDefault && (
                            <Star className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Template applied • {selectedTemplate.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTemplate}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Task Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="What needs to be done?"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add more details about this task..."
                  rows={4}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Priority and Estimated Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: TaskPriority) => 
                      handleInputChange('priority', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['low', 'medium', 'high'] as TaskPriority[]).map(priority => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <span>{PRIORITY_ICONS[priority]}</span>
                            <span className="capitalize">{priority}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours (Optional)</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                    placeholder="2.5"
                    className={errors.estimatedHours ? 'border-destructive' : ''}
                  />
                  {errors.estimatedHours && (
                    <p className="text-sm text-destructive">{errors.estimatedHours}</p>
                  )}
                </div>
              </div>

              {/* Task Preview */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm mb-2">Task Preview:</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`${PRIORITY_COLORS[formData.priority]} text-xs`}
                  >
                    {PRIORITY_ICONS[formData.priority]} {formData.priority}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formData.title || 'Task title'}
                  </span>
                </div>
                {formData.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {formData.description}
                  </p>
                )}
                {formData.estimatedHours && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Estimated: {formData.estimatedHours}h
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Popular Templates */}
            {popularTemplates.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Popular Templates</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {popularTemplates.map(template => (
                    <Card 
                      key={template.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => applyTemplate(template)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TEMPLATE_CATEGORIES[template.category].color}`}>
                            {TEMPLATE_CATEGORIES[template.category].icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{template.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {template.usageCount || 0} uses
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Templates by Category */}
            <div className="space-y-4">
              <span className="font-medium">All Templates</span>
              <div className="space-y-4">
                {groupedTemplates.map(({ category, label, icon, color, templates: categoryTemplates }) => (
                  categoryTemplates.length > 0 && (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${color}`}>
                          {icon}
                        </div>
                        <span className="text-sm font-medium">{label}</span>
                        <Badge variant="outline" className="text-xs">
                          {categoryTemplates.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-2 ml-8">
                        {categoryTemplates.map(template => (
                          <Card 
                            key={template.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => applyTemplate(template)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{template.name}</span>
                                    {template.isDefault && (
                                      <Star className="w-3 h-3 text-yellow-500" />
                                    )}
                                    {template.usageCount && template.usageCount > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {template.usageCount} uses
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {template.taskTitle}
                                  </p>
                                  {template.estimatedHours && (
                                    <p className="text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {template.estimatedHours}h
                                    </p>
                                  )}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`${PRIORITY_COLORS[template.priority]} text-xs`}
                                >
                                  {PRIORITY_ICONS[template.priority]}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}