import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Filter,
  Search,
  X,
  Hash,
  Globe,
  Code2,
  Calendar,
  Star,
  TrendingUp,
  Github,
  Video,
  Bookmark,
  Settings
} from 'lucide-react';
import { FeedFilter, FilterPreset } from '../types/social';

interface CommunityFilteringProps {
  currentFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  totalResults: number;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all',
    name: 'All Posts',
    description: 'Show all community posts',
    icon: '🌍',
    filter: { postType: 'all', timeframe: 'all', sortBy: 'recent' },
    isDefault: true
  },
  {
    id: 'trending',
    name: 'Trending',
    description: 'Hot discussions and popular posts',
    icon: '🔥',
    filter: { postType: 'all', timeframe: 'week', sortBy: 'trending' }
  },
  {
    id: 'launches',
    name: 'Product Launches',
    description: 'New products and project launches',
    icon: '🚀',
    filter: { postType: 'launch', timeframe: 'month', sortBy: 'recent' }
  },
  {
    id: 'tutorials',
    name: 'Learning',
    description: 'Tutorials, guides, and educational content',
    icon: '📚',
    filter: { postType: 'tutorial', timeframe: 'all', sortBy: 'popular' }
  },
  {
    id: 'help',
    name: 'Help Needed',
    description: 'Questions and help requests',
    icon: '🤝',
    filter: { postType: 'help_request', timeframe: 'week', sortBy: 'recent' }
  },

  {
    id: 'african-devs',
    name: 'African Innovation',
    description: 'Projects from African developers',
    icon: '🌍',
    filter: { postType: 'all', tags: ['africa'], timeframe: 'all', sortBy: 'recent' }
  },
  {
    id: 'with-demos',
    name: 'Live Demos',
    description: 'Posts with working demos',
    icon: '🎬',
    filter: { postType: 'all', hasDemo: true, timeframe: 'month', sortBy: 'popular' }
  }
];

const TECH_TAGS = [
  'react', 'nodejs', 'python', 'typescript', 'javascript', 'vue', 'angular',
  'flutter', 'react-native', 'swift', 'kotlin', 'java', 'go', 'rust',
  'mongodb', 'postgresql', 'firebase', 'supabase', 'redis'
];

const CATEGORY_TAGS = [
  'fintech', 'edtech', 'healthtech', 'agritech', 'ecommerce', 'social',
  'productivity', 'gaming', 'ai', 'ml', 'blockchain', 'iot'
];

const AFRICAN_COUNTRIES = [
  'nigeria', 'kenya', 'ghana', 'southafrica', 'uganda', 'tanzania',
  'egypt', 'morocco', 'ethiopia', 'rwanda', 'senegal', 'tunisia'
];

export default function CommunityFiltering({
  currentFilter,
  onFilterChange,
  onSearch,
  searchQuery,
  totalResults
}: CommunityFilteringProps) {
  const [activePreset, setActivePreset] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customFilter, setCustomFilter] = useState<FeedFilter>(currentFilter);

  useEffect(() => {
    // Find matching preset when filter changes
    const matchingPreset = DEFAULT_PRESETS.find(preset => 
      JSON.stringify(preset.filter) === JSON.stringify(currentFilter)
    );
    if (matchingPreset) {
      setActivePreset(matchingPreset.id);
    } else {
      setActivePreset('custom');
    }
  }, [currentFilter]);

  const handlePresetClick = (preset: FilterPreset) => {
    setActivePreset(preset.id);
    onFilterChange(preset.filter);
  };

  const handleCustomFilterChange = (updates: Partial<FeedFilter>) => {
    const newFilter = { ...customFilter, ...updates };
    setCustomFilter(newFilter);
    onFilterChange(newFilter);
    setActivePreset('custom');
  };

  const addTag = (tag: string, type: 'tags' | 'techStack' | 'category') => {
    const currentTags = customFilter[type] || [];
    if (!currentTags.includes(tag)) {
      handleCustomFilterChange({
        [type]: [...currentTags, tag]
      });
    }
  };

  const removeTag = (tag: string, type: 'tags' | 'techStack' | 'category') => {
    const currentTags = customFilter[type] || [];
    handleCustomFilterChange({
      [type]: currentTags.filter(t => t !== tag)
    });
  };

  const clearAllFilters = () => {
    const emptyFilter: FeedFilter = { postType: 'all', timeframe: 'all', sortBy: 'recent' };
    setCustomFilter(emptyFilter);
    onFilterChange(emptyFilter);
    setActivePreset('all');
    onSearch('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilter.postType && currentFilter.postType !== 'all') count++;
    if (currentFilter.timeframe && currentFilter.timeframe !== 'all') count++;
    if (currentFilter.tags && currentFilter.tags.length > 0) count++;
    if (currentFilter.techStack && currentFilter.techStack.length > 0) count++;
    if (currentFilter.category && currentFilter.category.length > 0) count++;
    if (currentFilter.difficulty && currentFilter.difficulty !== 'all') count++;
    if (currentFilter.country) count++;
    if (currentFilter.hasDemo) count++;
    if (currentFilter.hasGithub) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search posts, projects, tags, or developers..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 pr-12"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => onSearch('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Results Count and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalResults.toLocaleString()} results
          </span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()} filters active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            Advanced
          </Button>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Presets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DEFAULT_PRESETS.map(preset => (
          <Card
            key={preset.id}
            className={`cursor-pointer transition-all border-2 ${
              activePreset === preset.id
                ? 'ring-2 ring-primary ring-offset-1 border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handlePresetClick(preset)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-lg mb-1">{preset.icon}</div>
              <div className="font-medium text-xs">{preset.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {preset.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="tech">Tech</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Filters */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Post Type</Label>
                    <Select
                      value={customFilter.postType || 'all'}
                      onValueChange={(value) => handleCustomFilterChange({ postType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="launch">🚀 Product Launches</SelectItem>
                        <SelectItem value="milestone">🎉 Milestones</SelectItem>
                        <SelectItem value="update">📈 Progress Updates</SelectItem>
                        <SelectItem value="demo">🎬 Demos</SelectItem>
                        <SelectItem value="tutorial">📚 Tutorials</SelectItem>
                        <SelectItem value="showcase">🎨 Showcases</SelectItem>
                        <SelectItem value="help_request">🤝 Help Requests</SelectItem>
                        <SelectItem value="feedback">💭 Seeking Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Time Period</Label>
                    <Select
                      value={customFilter.timeframe || 'all'}
                      onValueChange={(value) => handleCustomFilterChange({ timeframe: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Sort By</Label>
                    <Select
                      value={customFilter.sortBy || 'recent'}
                      onValueChange={(value) => handleCustomFilterChange({ sortBy: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="most-liked">Most Liked</SelectItem>
                        <SelectItem value="most-commented">Most Discussed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Difficulty Level</Label>
                    <Select
                      value={customFilter.difficulty || 'all'}
                      onValueChange={(value) => handleCustomFilterChange({ difficulty: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">🌱 Beginner</SelectItem>
                        <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
                        <SelectItem value="advanced">⭐ Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Technology Filters */}
              <TabsContent value="tech" className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">Technology Stack</Label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(customFilter.techStack || []).map(tech => (
                        <Badge key={tech} variant="default" className="text-xs">
                          {tech}
                          <button
                            onClick={() => removeTag(tech, 'techStack')}
                            className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TECH_TAGS.filter(tag => !customFilter.techStack?.includes(tag)).map(tech => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-muted"
                          onClick={() => addTag(tech, 'techStack')}
                        >
                          <Code2 className="w-3 h-3 mr-1" />
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Industry & Categories</Label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(customFilter.category || []).map(category => (
                        <Badge key={category} variant="default" className="text-xs">
                          {category}
                          <button
                            onClick={() => removeTag(category, 'category')}
                            className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_TAGS.filter(tag => !customFilter.category?.includes(tag)).map(category => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-muted"
                          onClick={() => addTag(category, 'category')}
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Location Filters */}
              <TabsContent value="location" className="space-y-4">
                <div>
                  <Label className="text-sm">Country/Region</Label>
                  <Select
                    value={customFilter.country || ''}
                    onValueChange={(value) => handleCustomFilterChange({ country: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {AFRICAN_COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>
                          <Globe className="w-3 h-3 mr-2 inline" />
                          {country.charAt(0).toUpperCase() + country.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">African Innovation Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {['africa', 'innovation', 'startup', 'local-solution', 'community-impact'].map(tag => (
                      <Badge
                        key={tag}
                        variant={customFilter.tags?.includes(tag) ? 'default' : 'outline'}
                        className="text-xs cursor-pointer hover:bg-muted"
                        onClick={() => {
                          const currentTags = customFilter.tags || [];
                          if (currentTags.includes(tag)) {
                            removeTag(tag, 'tags');
                          } else {
                            addTag(tag, 'tags');
                          }
                        }}
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Filters */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasDemo"
                      checked={customFilter.hasDemo || false}
                      onCheckedChange={(checked) => 
                        handleCustomFilterChange({ hasDemo: checked ? true : undefined })
                      }
                    />
                    <Label htmlFor="hasDemo" className="text-sm flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Has Live Demo/Video
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasGithub"
                      checked={customFilter.hasGithub || false}
                      onCheckedChange={(checked) => 
                        handleCustomFilterChange({ hasGithub: checked ? true : undefined })
                      }
                    />
                    <Label htmlFor="hasGithub" className="text-sm flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      Has GitHub Repository
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="following"
                      checked={customFilter.following || false}
                      onCheckedChange={(checked) => 
                        handleCustomFilterChange({ following: checked ? true : undefined })
                      }
                    />
                    <Label htmlFor="following" className="text-sm flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      From People I Follow
                    </Label>
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Custom Tags</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Add custom tags (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const tag = input.value.trim().toLowerCase();
                          if (tag && !customFilter.tags?.includes(tag)) {
                            addTag(tag, 'tags');
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(customFilter.tags || []).map(tag => (
                        <Badge key={tag} variant="default" className="text-xs">
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                          <button
                            onClick={() => removeTag(tag, 'tags')}
                            className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}