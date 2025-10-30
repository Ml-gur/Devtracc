import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Search,
  Filter,
  X,
  Clock,
  User,
  FolderOpen,
  CheckSquare,
  MessageSquare,
  Calendar,
  Tag,
  Star,
  Zap,
  History,
  Bookmark,
  TrendingUp,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'message' | 'user' | 'file';
  title: string;
  description: string;
  metadata: any;
  relevanceScore: number;
  lastModified: Date;
  tags: string[];
  isBookmarked?: boolean;
  projectName?: string;
  author?: string;
}

interface SearchFilter {
  type?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  authors?: string[];
  projects?: string[];
  status?: string[];
  priority?: string[];
}

interface AdvancedSearchEngineProps {
  onResultClick: (result: SearchResult) => void;
  onSaveSearch?: (query: string, filters: SearchFilter) => void;
  savedSearches?: Array<{ query: string; filters: SearchFilter; name: string }>;
}

const AdvancedSearchEngine: React.FC<AdvancedSearchEngineProps> = ({
  onResultClick,
  onSaveSearch,
  savedSearches = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'project',
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce application with React and Node.js',
      metadata: { status: 'active', priority: 'high', progress: 65 },
      relevanceScore: 0.95,
      lastModified: new Date('2024-01-15'),
      tags: ['react', 'node.js', 'mongodb', 'stripe'],
      isBookmarked: true,
    },
    {
      id: '2',
      type: 'task',
      title: 'Implement user authentication',
      description: 'Add JWT-based authentication with password reset functionality',
      metadata: { status: 'in-progress', priority: 'high', dueDate: new Date('2024-01-20') },
      relevanceScore: 0.88,
      lastModified: new Date('2024-01-14'),
      tags: ['authentication', 'jwt', 'security'],
      projectName: 'E-commerce Platform',
    },
    {
      id: '3',
      type: 'message',
      title: 'Project kickoff meeting',
      description: 'Discussion about project scope and timeline for the new mobile app',
      metadata: { channel: 'mobile-team', participantCount: 5 },
      relevanceScore: 0.75,
      lastModified: new Date('2024-01-13'),
      tags: ['meeting', 'mobile', 'planning'],
      author: 'Sarah Johnson',
    },
    {
      id: '4',
      type: 'user',
      title: 'John Doe',
      description: 'Senior Frontend Developer specializing in React and TypeScript',
      metadata: { role: 'developer', expertise: ['react', 'typescript', 'testing'] },
      relevanceScore: 0.82,
      lastModified: new Date('2024-01-12'),
      tags: ['react', 'typescript', 'frontend'],
    },
    {
      id: '5',
      type: 'file',
      title: 'API Documentation.md',
      description: 'Complete API documentation for the backend services',
      metadata: { size: '2.5 MB', type: 'markdown' },
      relevanceScore: 0.70,
      lastModified: new Date('2024-01-11'),
      tags: ['documentation', 'api', 'backend'],
      projectName: 'E-commerce Platform',
    },
  ];

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    mockResults.forEach(result => {
      result.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  const performSearch = useCallback(async (query: string, appliedFilters: SearchFilter = {}) => {
    if (!query.trim() && Object.keys(appliedFilters).length === 0) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = mockResults;

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply filters
    if (appliedFilters.type && appliedFilters.type.length > 0) {
      filtered = filtered.filter(result => appliedFilters.type!.includes(result.type));
    }

    if (appliedFilters.tags && appliedFilters.tags.length > 0) {
      filtered = filtered.filter(result =>
        appliedFilters.tags!.some(tag => result.tags.includes(tag))
      );
    }

    // Sort by relevance score
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

    setSearchResults(filtered);
    setLoading(false);

    // Add to recent searches
    if (query.trim()) {
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, performSearch]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="w-4 h-4" />;
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      case 'file':
        return <FolderOpen className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'message':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-orange-100 text-orange-800';
      case 'file':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = useMemo(() => {
    if (selectedTab === 'all') return searchResults;
    return searchResults.filter(result => result.type === selectedTab);
  }, [searchResults, selectedTab]);

  const resultCounts = useMemo(() => {
    const counts = { all: searchResults.length };
    ['project', 'task', 'message', 'user', 'file'].forEach(type => {
      counts[type] = searchResults.filter(r => r.type === type).length;
    });
    return counts;
  }, [searchResults]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const addFilter = (key: keyof SearchFilter, value: any) => {
    setFilters(prev => {
      if (key === 'type' || key === 'tags' || key === 'authors' || key === 'projects' || key === 'status') {
        const currentArray = prev[key] || [];
        const newArray = currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value];
        return { ...prev, [key]: newArray };
      }
      return { ...prev, [key]: value };
    });
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4 mr-2" />
        Search DevTrack...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="w-4 h-4 mr-2 opacity-50" />
          <input
            placeholder="Search projects, tasks, messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'text-blue-600' : ''}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5">
                  {Object.keys(filters).filter(key => {
                    const value = filters[key];
                    return Array.isArray(value) ? value.length > 0 : Boolean(value);
                  }).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <div className="flex flex-wrap gap-1">
                  {['project', 'task', 'message', 'user', 'file'].map(type => (
                    <Button
                      key={type}
                      variant={filters.type?.includes(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => addFilter('type', type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => addFilter('tags', tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <CommandList>
          {loading ? (
            <div className="py-6 text-center text-sm">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {searchQuery === '' && recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((query, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => setSearchQuery(query)}
                      className="flex items-center space-x-2"
                    >
                      <History className="w-4 h-4 opacity-50" />
                      <span>{query}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Saved Searches */}
              {searchQuery === '' && savedSearches.length > 0 && (
                <CommandGroup heading="Saved Searches">
                  {savedSearches.map((saved, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        setSearchQuery(saved.query);
                        setFilters(saved.filters);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Bookmark className="w-4 h-4 opacity-50" />
                      <span>{saved.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="p-2">
                  <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="all" className="text-xs">
                        All ({resultCounts.all})
                      </TabsTrigger>
                      <TabsTrigger value="project" className="text-xs">
                        Projects ({resultCounts.project})
                      </TabsTrigger>
                      <TabsTrigger value="task" className="text-xs">
                        Tasks ({resultCounts.task})
                      </TabsTrigger>
                      <TabsTrigger value="message" className="text-xs">
                        Messages ({resultCounts.message})
                      </TabsTrigger>
                      <TabsTrigger value="user" className="text-xs">
                        Users ({resultCounts.user})
                      </TabsTrigger>
                      <TabsTrigger value="file" className="text-xs">
                        Files ({resultCounts.file})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <ScrollArea className="h-96 mt-4">
                    <div className="space-y-2">
                      {filteredResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => {
                            onResultClick(result);
                            setIsOpen(false);
                          }}
                          className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-1 rounded ${getResultTypeColor(result.type)}`}>
                                {getResultIcon(result.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="font-medium truncate">
                                    {result.title}
                                  </div>
                                  {result.isBookmarked && (
                                    <Star className="w-3 h-3 text-yellow-500" />
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {result.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {result.description}
                                </p>
                                {result.projectName && (
                                  <p className="text-xs text-muted-foreground mb-1">
                                    in {result.projectName}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{result.lastModified.toLocaleDateString()}</span>
                                  {result.author && (
                                    <>
                                      <span>•</span>
                                      <span>by {result.author}</span>
                                    </>
                                  )}
                                </div>
                                {result.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {result.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        <Tag className="w-2 h-2 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                    {result.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{result.tags.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="text-xs text-muted-foreground">
                                {Math.round(result.relevanceScore * 100)}%
                              </div>
                              <TrendingUp className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Empty State */}
              {searchQuery && !loading && searchResults.length === 0 && (
                <div className="py-6 text-center text-sm">
                  <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </>
          )}
        </CommandList>

        {/* Save Search Option */}
        {searchQuery && searchResults.length > 0 && onSaveSearch && (
          <div className="border-t p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const name = prompt('Enter a name for this search:');
                if (name) {
                  onSaveSearch(searchQuery, filters);
                }
              }}
              className="w-full"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save this search
            </Button>
          </div>
        )}
      </CommandDialog>
    </>
  );
};

export default AdvancedSearchEngine;