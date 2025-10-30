import { useMemo } from 'react';
import { Task } from '../../types/task';

export interface TaskFilters {
  search: string;
  priority: 'all' | 'low' | 'medium' | 'high';
  status: 'all' | 'todo' | 'in_progress' | 'completed';
  sortBy: 'created' | 'updated' | 'priority' | 'timeSpent' | 'title';
  sortOrder: 'asc' | 'desc';
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export function useTaskFilters(tasks: Task[], filters: TaskFilters): Task[] {
  return useMemo(() => {
    if (!tasks || !Array.isArray(tasks) || !filters) {
      return [];
    }

    let filteredTasks = [...tasks];

    // Search filter
    if (filters.search?.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.createdAt) return true;
        
        try {
          const taskDate = new Date(task.createdAt);
          
          if (isNaN(taskDate.getTime())) {
            return true; // Include tasks with invalid dates
          }
          
          if (filters.dateRange?.from && taskDate < filters.dateRange.from) {
            return false;
          }
          
          if (filters.dateRange?.to && taskDate > filters.dateRange.to) {
            return false;
          }
          
          return true;
        } catch (error) {
          console.warn('Error parsing task date:', task.createdAt, error);
          return true; // Include tasks with date parsing errors
        }
      });
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
      let comparison = 0;
      
      try {
        switch (filters.sortBy) {
          case 'created': {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            comparison = dateA - dateB;
            break;
          }
          case 'updated': {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            comparison = dateA - dateB;
            break;
          }
          case 'priority': {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          }
          case 'timeSpent': {
            const timeA = a.timeSpentMinutes || 0;
            const timeB = b.timeSpentMinutes || 0;
            comparison = timeA - timeB;
            break;
          }
          case 'title': {
            const titleA = a.title || '';
            const titleB = b.title || '';
            comparison = titleA.localeCompare(titleB);
            break;
          }
          default:
            comparison = 0;
        }
      } catch (error) {
        console.warn('Error sorting tasks:', error);
        comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filteredTasks;
  }, [tasks, filters]);
}