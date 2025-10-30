import { useState, useEffect, useCallback } from 'react';
import { TaskFilters } from '../TaskFilters';

export interface FilterPreset {
  id: string;
  name: string;
  filters: TaskFilters;
  createdAt: string;
  isDefault?: boolean;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'high-priority',
    name: '🔥 High Priority',
    filters: {
      search: '',
      priority: 'high',
      status: 'all',
      sortBy: 'created',
      sortOrder: 'desc'
    },
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'in-progress',
    name: '⚡ Active Tasks',
    filters: {
      search: '',
      priority: 'all',
      status: 'in_progress',
      sortBy: 'updated',
      sortOrder: 'desc'
    },
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'completed-recent',
    name: '✅ Recently Completed',
    filters: {
      search: '',
      priority: 'all',
      status: 'completed',
      sortBy: 'updated',
      sortOrder: 'desc'
    },
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'time-spent',
    name: '⏱️ Most Time Spent',
    filters: {
      search: '',
      priority: 'all',
      status: 'all',
      sortBy: 'timeSpent',
      sortOrder: 'desc'
    },
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

const STORAGE_KEY = 'devtrack-filter-presets';

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userPresets = JSON.parse(stored) as FilterPreset[];
        setPresets([...DEFAULT_PRESETS, ...userPresets]);
      } else {
        setPresets(DEFAULT_PRESETS);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  // Save user presets to localStorage
  const savePresetsToStorage = useCallback((allPresets: FilterPreset[]) => {
    try {
      const userPresets = allPresets.filter(preset => !preset.isDefault);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets));
    } catch (error) {
      console.error('Failed to save filter presets:', error);
    }
  }, []);

  const createPreset = useCallback((name: string, filters: TaskFilters) => {
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
      isDefault: false
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    
    return newPreset;
  }, [presets, savePresetsToStorage]);

  const updatePreset = useCallback((id: string, updates: Partial<Omit<FilterPreset, 'id' | 'createdAt' | 'isDefault'>>) => {
    const updatedPresets = presets.map(preset => {
      if (preset.id === id && !preset.isDefault) {
        return { ...preset, ...updates };
      }
      return preset;
    });

    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
  }, [presets, savePresetsToStorage]);

  const deletePreset = useCallback((id: string) => {
    const updatedPresets = presets.filter(preset => 
      preset.id !== id || preset.isDefault
    );

    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
  }, [presets, savePresetsToStorage]);

  const getPresetById = useCallback((id: string) => {
    return presets.find(preset => preset.id === id);
  }, [presets]);

  return {
    presets,
    createPreset,
    updatePreset,
    deletePreset,
    getPresetById
  };
}