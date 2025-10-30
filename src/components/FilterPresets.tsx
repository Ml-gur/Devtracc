import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Bookmark, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  Clock,
  Filter
} from 'lucide-react';
import { TaskFilters } from './TaskFilters';
import { FilterPreset, useFilterPresets } from './hooks/useFilterPresets';

interface FilterPresetsProps {
  currentFilters: TaskFilters;
  onApplyPreset: (filters: TaskFilters) => void;
  taskCount: number;
}

export default function FilterPresets({ 
  currentFilters, 
  onApplyPreset, 
  taskCount 
}: FilterPresetsProps) {
  const { presets, createPreset, updatePreset, deletePreset } = useFilterPresets();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState<FilterPreset | null>(null);
  const [presetName, setPresetName] = useState('');
  const [showManageDialog, setShowManageDialog] = useState(false);

  const hasActiveFilters = () => {
    return (
      currentFilters.search !== '' ||
      currentFilters.priority !== 'all' ||
      currentFilters.status !== 'all' ||
      currentFilters.sortBy !== 'created' ||
      currentFilters.sortOrder !== 'desc'
    );
  };

  const handleCreatePreset = () => {
    if (!presetName.trim()) return;

    createPreset(presetName.trim(), currentFilters);
    setPresetName('');
    setShowCreateDialog(false);
  };

  const handleUpdatePreset = () => {
    if (!editingPreset || !presetName.trim()) return;

    updatePreset(editingPreset.id, {
      name: presetName.trim(),
      filters: currentFilters
    });
    
    setEditingPreset(null);
    setPresetName('');
    setShowCreateDialog(false);
  };

  const handleEditPreset = (preset: FilterPreset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setShowCreateDialog(true);
  };

  const getPresetDescription = (preset: FilterPreset) => {
    const parts = [];
    
    if (preset.filters.search) {
      parts.push(`"${preset.filters.search}"`);
    }
    
    if (preset.filters.priority !== 'all') {
      parts.push(`${preset.filters.priority} priority`);
    }
    
    if (preset.filters.status !== 'all') {
      parts.push(`${preset.filters.status.replace('_', ' ')} tasks`);
    }
    
    parts.push(`sorted by ${preset.filters.sortBy} (${preset.filters.sortOrder})`);
    
    return parts.join(', ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Preset Buttons */}
      <div className="flex gap-1">
        {presets.slice(0, 4).map(preset => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset(preset.filters)}
            className="h-8 px-3 text-xs"
            title={getPresetDescription(preset)}
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* Presets Menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bookmark className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Presets</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManageDialog(true)}
              >
                <Edit className="w-3 h-3 mr-1" />
                Manage
              </Button>
            </div>

            {/* Create New Preset */}
            {hasActiveFilters() && (
              <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getPresetDescription({ filters: currentFilters } as FilterPreset)}
                </p>
              </div>
            )}

            {/* Preset List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => onApplyPreset(preset.filters)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {preset.name}
                      </span>
                      {preset.isDefault && (
                        <Star className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {getPresetDescription(preset)}
                    </p>
                  </div>
                  
                  {!preset.isDefault && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPreset(preset);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{preset.name}" preset? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePreset(preset.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Preset
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create/Edit Preset Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? 'Update Preset' : 'Save Filter Preset'}
            </DialogTitle>
            <DialogDescription>
              {editingPreset 
                ? 'Update this preset with your current filter settings.'
                : 'Save your current filter settings as a preset for quick access.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Preset Name</label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., High Priority Tasks, Today's Work"
                className="mt-1"
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Current Filters</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getPresetDescription({ filters: currentFilters } as FilterPreset)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingPreset(null);
                setPresetName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingPreset ? handleUpdatePreset : handleCreatePreset}
              disabled={!presetName.trim()}
            >
              {editingPreset ? 'Update Preset' : 'Save Preset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Presets Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Filter Presets</DialogTitle>
            <DialogDescription>
              Organize your saved filter presets. Default presets cannot be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {presets.map(preset => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{preset.name}</span>
                    {preset.isDefault ? (
                      <Badge variant="secondary">Default</Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(preset.createdAt)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getPresetDescription(preset)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyPreset(preset.filters)}
                  >
                    Apply
                  </Button>
                  
                  {!preset.isDefault && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowManageDialog(false);
                          handleEditPreset(preset);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{preset.name}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePreset(preset.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowManageDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}