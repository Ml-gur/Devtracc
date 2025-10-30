import { useState, useEffect, useCallback } from 'react';
import { TaskTemplate, DEFAULT_TEMPLATES } from '../../types/template';
import { Task } from '../../types/task';

const STORAGE_KEY = 'devtrack-task-templates';

export function useTaskTemplates() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userTemplates = JSON.parse(stored) as TaskTemplate[];
        setTemplates([...DEFAULT_TEMPLATES, ...userTemplates]);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch (error) {
      console.error('Failed to load task templates:', error);
      setTemplates(DEFAULT_TEMPLATES);
    }
  }, []);

  // Save user templates to localStorage
  const saveTemplatesToStorage = useCallback((allTemplates: TaskTemplate[]) => {
    try {
      const userTemplates = allTemplates.filter(template => !template.isDefault);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
    } catch (error) {
      console.error('Failed to save task templates:', error);
    }
  }, []);

  const createTemplate = useCallback((templateData: Omit<TaskTemplate, 'id' | 'createdAt' | 'isDefault' | 'usageCount'>) => {
    const newTemplate: TaskTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDefault: false,
      usageCount: 0
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
    
    return newTemplate;
  }, [templates, saveTemplatesToStorage]);

  const createTemplateFromTask = useCallback((task: Task, templateName: string, description?: string) => {
    const template: Omit<TaskTemplate, 'id' | 'createdAt' | 'isDefault' | 'usageCount'> = {
      name: templateName,
      description,
      taskTitle: task.title,
      taskDescription: task.description,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      tags: ['custom'],
      category: 'other' // Default category, user can change
    };

    return createTemplate(template);
  }, [createTemplate]);

  const updateTemplate = useCallback((id: string, updates: Partial<Omit<TaskTemplate, 'id' | 'createdAt' | 'isDefault'>>) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === id && !template.isDefault) {
        return { ...template, ...updates };
      }
      return template;
    });

    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
  }, [templates, saveTemplatesToStorage]);

  const deleteTemplate = useCallback((id: string) => {
    const updatedTemplates = templates.filter(template => 
      template.id !== id || template.isDefault
    );

    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
  }, [templates, saveTemplatesToStorage]);

  const incrementUsage = useCallback((id: string) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === id) {
        return { 
          ...template, 
          usageCount: (template.usageCount || 0) + 1 
        };
      }
      return template;
    });

    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
  }, [templates, saveTemplatesToStorage]);

  const getTemplateById = useCallback((id: string) => {
    return templates.find(template => template.id === id);
  }, [templates]);

  const getTemplatesByCategory = useCallback((category: TaskTemplate['category']) => {
    return templates.filter(template => template.category === category);
  }, [templates]);

  const getPopularTemplates = useCallback((limit = 5) => {
    return [...templates]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit);
  }, [templates]);

  return {
    templates,
    createTemplate,
    createTemplateFromTask,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    getTemplateById,
    getTemplatesByCategory,
    getPopularTemplates
  };
}