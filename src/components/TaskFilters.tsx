import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { Task } from '../types/task';

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

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  tasks: Task[];
}

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: '🔴 High Priority' },
  { value: 'medium', label: '🟡 Medium Priority' },
  { value: 'low', label: '🟢 Low Priority' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: '📝 To Do' },
  { value: 'in_progress', label: '⚡ In Progress' },
  { value: 'completed', label: '✅ Completed' }
];

const SORT_OPTIONS = [
  { value: 'created', label: 'Date Created' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'timeSpent', label: 'Time Spent' },
  { value: 'title', label: 'Task Title' }
];

export default function TaskFiltersComponent({ filters, onFiltersChange, tasks }: TaskFiltersProps) {
  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priority: 'all',
      status: 'all',
      sortBy: 'created',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.search || 
                          filters.priority !== 'all' || 
                          filters.status !== 'all' || 
                          filters.sortBy !== 'created' || 
                          filters.sortOrder !== 'desc';

  const toggleSortOrder = () => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilter('search', '')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Priority Filter */}
        <Select 
          value={filters.priority} 
          onValueChange={(value) => updateFilter('priority', value as TaskFilters['priority'])}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select 
          value={filters.status} 
          onValueChange={(value) => updateFilter('status', value as TaskFilters['status'])}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select 
          value={filters.sortBy} 
          onValueChange={(value) => updateFilter('sortBy', value as TaskFilters['sortBy'])}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          className="h-9 px-3"
        >
          {filters.sortOrder === 'asc' ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filters.search}"
              <button
                onClick={() => updateFilter('search', '')}
                className="ml-1 hover:bg-destructive/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Priority: {filters.priority}
              <button
                onClick={() => updateFilter('priority', 'all')}
                className="ml-1 hover:bg-destructive/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status.replace('_', ' ')}
              <button
                onClick={() => updateFilter('status', 'all')}
                className="ml-1 hover:bg-destructive/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {(filters.sortBy !== 'created' || filters.sortOrder !== 'desc') && (
            <Badge variant="secondary" className="text-xs">
              Sort: {filters.sortBy} ({filters.sortOrder})
              <button
                onClick={() => {
                  updateFilter('sortBy', 'created');
                  updateFilter('sortOrder', 'desc');
                }}
                className="ml-1 hover:bg-destructive/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}