import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  Star, 
  MessageCircle, 
  UserPlus, 
  Code, 
  Briefcase,
  Globe,
  Calendar,
  ArrowLeft,
  X,
  Check,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  getAllUsers, 
  searchUsers, 
  DiscoverableUser 
} from '../utils/database-service';

interface EnhancedPeopleDiscoveryProps {
  currentUserId: string;
  userType: 'developer' | 'recruiter';
  onBack: () => void;
  onStartConversation: (userId: string) => void;
}

export default function EnhancedPeopleDiscovery({ 
  currentUserId, 
  userType, 
  onBack, 
  onStartConversation 
}: EnhancedPeopleDiscoveryProps) {
  const [people, setPeople] = useState<DiscoverableUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    userType: 'all',
    country: 'all',
    onlineStatus: 'all'
  });
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<DiscoverableUser | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionStatuses, setConnectionStatuses] = useState<{ [userId: string]: 'none' | 'pending' | 'connected' }>({});

  // Load initial users
  useEffect(() => {
    loadUsers();
  }, [currentUserId]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading users for discovery...');
      const result = await getAllUsers(currentUserId, 50);
      
      if (result.error) {
        console.error('❌ Error loading users:', result.error);
        setError('Failed to load users. Please try again.');
        return;
      }
      
      if (result.data) {
        setPeople(result.data);
        console.log(`✅ Loaded ${result.data.length} users`);
      }
    } catch (error) {
      console.error('❌ Error in loadUsers:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      setError(null);
      
      console.log('🔍 Searching users with query:', searchQuery);
      const result = await searchUsers(currentUserId, searchQuery.trim(), 20);
      
      if (result.error) {
        console.error('❌ Error searching users:', result.error);
        setError('Failed to search users. Please try again.');
        return;
      }
      
      if (result.data) {
        setPeople(result.data);
        console.log(`✅ Found ${result.data.length} users`);
      }
    } catch (error) {
      console.error('❌ Error in handleSearch:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOnlineStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getOnlineStatusText = (status?: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      default: return 'Offline';
    }
  };

  const sendConnectionRequest = async (person: DiscoverableUser, message: string) => {
    // Update connection status to pending
    setConnectionStatuses(prev => ({ ...prev, [person.id]: 'pending' }));
    
    setShowConnectionModal(false);
    setSelectedPerson(null);
    setConnectionMessage('');
    
    console.log(`Connection request sent to ${person.full_name}`);
    
    // In a real implementation, this would make an API call
    // For now, simulate a successful connection request
    setTimeout(() => {
      console.log(`✅ Connection request to ${person.full_name} processed`);
    }, 1000);
  };

  const handleConnect = (person: DiscoverableUser) => {
    setSelectedPerson(person);
    setConnectionMessage(`Hi ${person.full_name.split(' ')[0]}! I'd love to connect with you on DevTrack Africa.`);
    setShowConnectionModal(true);
  };

  const handleMessage = (person: DiscoverableUser) => {
    onStartConversation(person.id);
  };

  const filteredPeople = people.filter(person => {
    const matchesUserType = filters.userType === 'all' || 
      (filters.userType === 'developer' && !person.title?.toLowerCase().includes('recruit')) ||
      (filters.userType === 'recruiter' && person.title?.toLowerCase().includes('recruit'));
    
    const matchesCountry = filters.country === 'all' || person.country === filters.country;
    const matchesOnlineStatus = filters.onlineStatus === 'all' || person.online_status === filters.onlineStatus;
    
    return matchesUserType && matchesCountry && matchesOnlineStatus;
  });

  const featuredPeople = filteredPeople.filter(p => p.projects_count && p.projects_count > 20);
  const otherPeople = filteredPeople.filter(p => !p.projects_count || p.projects_count <= 20);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Users className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Discover People</h1>
        </div>
        <Badge variant="secondary">
          {filteredPeople.length} people found
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, title, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchLoading && (
              <Loader2 className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" />
            )}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex space-x-2 overflow-x-auto">
          <Select value={filters.userType} onValueChange={(value) => setFilters(prev => ({ ...prev, userType: value }))}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All People</SelectItem>
              <SelectItem value="developer">Developers</SelectItem>
              <SelectItem value="recruiter">Recruiters</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.onlineStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, onlineStatus: value }))}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder="Online Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading people...</h3>
              <p className="text-muted-foreground">
                Finding developers and recruiters on DevTrack Africa
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-red-900">Error Loading People</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={loadUsers} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Featured People */}
              {featuredPeople.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <h2 className="text-lg font-semibold">Featured Professionals</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredPeople.map((person) => (
                      <Card key={person.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <ImageWithFallback
                                src={person.profile_image_url || ''}
                                alt={person.full_name}
                                fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.full_name)}&background=f0f0f0&color=333`}
                              />
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getOnlineStatusColor(person.online_status)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold truncate">{person.full_name}</h3>
                              {person.title?.toLowerCase().includes('recruit') ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  Recruiter
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <Code className="h-3 w-3 mr-1" />
                                  Developer
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {person.title}
                            </p>
                            
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
                              {person.country && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{person.country}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getOnlineStatusColor(person.online_status)}`} />
                                <span>{getOnlineStatusText(person.online_status)}</span>
                              </div>
                            </div>
                            
                            {person.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {person.bio}
                              </p>
                            )}
                            
                            {person.tech_stack && person.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {person.tech_stack.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {person.tech_stack.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{person.tech_stack.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                {person.projects_count && person.projects_count > 0 && (
                                  <span>{person.projects_count} projects</span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {connectionStatuses[person.id] === 'pending' ? (
                                  <Button size="sm" variant="outline" disabled>
                                    <Clock className="h-4 w-4 mr-1" />
                                    Pending
                                  </Button>
                                ) : connectionStatuses[person.id] === 'connected' ? (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleMessage(person)}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    Message
                                  </Button>
                                ) : (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleConnect(person)}
                                    >
                                      <UserPlus className="h-4 w-4 mr-1" />
                                      Connect
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleMessage(person)}
                                    >
                                      <MessageCircle className="h-4 w-4 mr-1" />
                                      Message
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Other People */}
              {otherPeople.length > 0 && (
                <div>
                  {featuredPeople.length > 0 && <Separator className="my-6" />}
                  <h2 className="text-lg font-semibold mb-4">More People</h2>
                  <div className="space-y-4">
                    {otherPeople.map((person) => (
                      <Card key={person.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <ImageWithFallback
                                src={person.profile_image_url || ''}
                                alt={person.full_name}
                                fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.full_name)}&background=f0f0f0&color=333`}
                              />
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getOnlineStatusColor(person.online_status)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-medium truncate">{person.full_name}</h3>
                                  {person.title?.toLowerCase().includes('recruit') && (
                                    <Badge variant="secondary" className="text-xs">
                                      Recruiter
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{person.title}</p>
                                <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                                  {person.country && <span>{person.country}</span>}
                                  <span>{getOnlineStatusText(person.online_status)}</span>
                                  {person.projects_count && person.projects_count > 0 && (
                                    <span>{person.projects_count} projects</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {connectionStatuses[person.id] === 'pending' ? (
                                  <Button size="sm" variant="outline" disabled>
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                ) : connectionStatuses[person.id] === 'connected' ? (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleMessage(person)}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleConnect(person)}
                                    >
                                      <UserPlus className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleMessage(person)}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredPeople.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No people found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 
                      `No results for "${searchQuery}". Try different keywords or remove filters.` :
                      'Try adjusting your filters to find more people.'
                    }
                  </p>
                  {searchQuery && (
                    <Button 
                      onClick={() => setSearchQuery('')} 
                      variant="outline" 
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Connection Request Modal */}
      <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Connection Request</DialogTitle>
            <DialogDescription>
              Send a personalized connection request to expand your professional network on DevTrack Africa.
            </DialogDescription>
          </DialogHeader>
          {selectedPerson && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <ImageWithFallback
                    src={selectedPerson.profile_image_url || ''}
                    alt={selectedPerson.full_name}
                    fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPerson.full_name)}&background=f0f0f0&color=333`}
                  />
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPerson.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPerson.title}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Personal message (optional)
                </label>
                <Textarea
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  placeholder="Add a personal note to your connection request..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 justify-end">
                <Button variant="outline" onClick={() => setShowConnectionModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => sendConnectionRequest(selectedPerson, connectionMessage)}>
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}