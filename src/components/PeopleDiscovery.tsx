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
  Clock
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PeopleProfile {
  id: string;
  full_name: string;
  profile_picture?: string;
  user_type: 'developer' | 'recruiter';
  title: string;
  company?: string;
  location: string;
  bio?: string;
  skills: string[];
  experience_years?: number;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  projects_count: number;
  connections_count: number;
  mutual_connections?: number;
  connection_status?: 'none' | 'pending' | 'connected' | 'blocked';
  is_featured?: boolean;
  last_active?: string;
  join_date: string;
  languages?: string[];
  availability?: 'available' | 'busy' | 'not_looking';
  rating?: number;
  reviews_count?: number;
}

interface ConnectionRequest {
  id: string;
  from_user: PeopleProfile;
  to_user_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

interface PeopleDiscoveryProps {
  currentUserId: string;
  userType: 'developer' | 'recruiter';
  onBack: () => void;
  onStartConversation: (userId: string) => void;
}

const DEMO_PEOPLE: PeopleProfile[] = [
  {
    id: 'dev-1',
    full_name: 'Kemi Adebayo',
    profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b639?w=150&h=150&fit=crop&crop=face',
    user_type: 'developer',
    title: 'Senior Frontend Developer',
    company: 'Flutterwave',
    location: 'Lagos, Nigeria',
    bio: 'Passionate about building scalable web applications with React and TypeScript. Love mentoring junior developers.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    experience_years: 5,
    github_url: 'https://github.com/kemiadebayo',
    linkedin_url: 'https://linkedin.com/in/kemiadebayo',
    portfolio_url: 'https://kemiadebayo.dev',
    projects_count: 23,
    connections_count: 156,
    mutual_connections: 8,
    connection_status: 'none',
    is_featured: true,
    last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    join_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    languages: ['English', 'Yoruba'],
    availability: 'available',
    rating: 4.9,
    reviews_count: 12
  },
  {
    id: 'rec-1',
    full_name: 'David Thompson',
    profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    user_type: 'recruiter',
    title: 'Senior Technical Recruiter',
    company: 'African Tech Talent',
    location: 'Cape Town, South Africa',
    bio: 'Connecting exceptional African developers with global opportunities. 7+ years in tech recruitment.',
    skills: ['Technical Recruitment', 'Talent Sourcing', 'Interview Coaching', 'Salary Negotiation'],
    experience_years: 7,
    linkedin_url: 'https://linkedin.com/in/davidthompson',
    projects_count: 0,
    connections_count: 1250,
    mutual_connections: 23,
    connection_status: 'none',
    last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    join_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    languages: ['English', 'Afrikaans'],
    availability: 'available',
    rating: 4.7,
    reviews_count: 34
  },
  {
    id: 'dev-2',
    full_name: 'Amina Hassan',
    profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    user_type: 'developer',
    title: 'Full Stack Developer & Tech Lead',
    company: 'Andela',
    location: 'Nairobi, Kenya',
    bio: 'Building the future of African fintech. Expertise in React, Python, and cloud architecture.',
    skills: ['Python', 'React', 'Docker', 'Kubernetes', 'PostgreSQL', 'Django'],
    experience_years: 6,
    github_url: 'https://github.com/aminahassan',
    linkedin_url: 'https://linkedin.com/in/aminahassan',
    portfolio_url: 'https://aminahassan.tech',
    projects_count: 31,
    connections_count: 203,
    mutual_connections: 15,
    connection_status: 'pending',
    last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    join_date: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    languages: ['English', 'Swahili', 'Arabic'],
    availability: 'busy',
    rating: 4.8,
    reviews_count: 18
  },
  {
    id: 'dev-3',
    full_name: 'Kwame Asante',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    user_type: 'developer',
    title: 'Mobile App Developer',
    company: 'MEST Africa',
    location: 'Accra, Ghana',
    bio: 'Creating beautiful mobile experiences with React Native and Flutter. Open source contributor.',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    experience_years: 4,
    github_url: 'https://github.com/kwameasante',
    linkedin_url: 'https://linkedin.com/in/kwameasante',
    projects_count: 18,
    connections_count: 89,
    mutual_connections: 6,
    connection_status: 'connected',
    last_active: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    join_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    languages: ['English', 'Twi'],
    availability: 'available',
    rating: 4.6,
    reviews_count: 9
  }
];

const DEMO_CONNECTION_REQUESTS: ConnectionRequest[] = [
  {
    id: 'req-1',
    from_user: {
      id: 'dev-4',
      full_name: 'Sarah Okafor',
      profile_picture: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      user_type: 'developer',
      title: 'Backend Developer',
      company: 'Paystack',
      location: 'Lagos, Nigeria',
      skills: ['Node.js', 'MongoDB', 'Express', 'Redis'],
      projects_count: 12,
      connections_count: 67,
      join_date: new Date().toISOString()
    },
    to_user_id: 'demo-user',
    message: 'Hi! I saw your project on DevTrack and would love to connect. I\'m working on similar fintech solutions.',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function PeopleDiscovery({ 
  currentUserId, 
  userType, 
  onBack, 
  onStartConversation 
}: PeopleDiscoveryProps) {
  const [people, setPeople] = useState<PeopleProfile[]>(DEMO_PEOPLE);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(DEMO_CONNECTION_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'discover' | 'requests'>('discover');
  const [filters, setFilters] = useState({
    userType: 'all',
    location: 'all',
    experience: 'all',
    availability: 'all'
  });
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PeopleProfile | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');

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

  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'not_looking': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getAvailabilityText = (availability?: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'not_looking': return 'Not looking';
      default: return 'Unknown';
    }
  };

  const sendConnectionRequest = async (person: PeopleProfile, message: string) => {
    // Update person's connection status
    setPeople(prev => prev.map(p => 
      p.id === person.id 
        ? { ...p, connection_status: 'pending' }
        : p
    ));
    
    setShowConnectionModal(false);
    setSelectedPerson(null);
    setConnectionMessage('');
    
    // Show success message (in real app, this would be a toast notification)
    console.log(`Connection request sent to ${person.full_name}`);
  };

  const handleConnectionRequest = async (requestId: string, action: 'accept' | 'decline') => {
    const request = connectionRequests.find(r => r.id === requestId);
    if (!request) return;

    if (action === 'accept') {
      // Add to people list as connected
      setPeople(prev => {
        const existing = prev.find(p => p.id === request.from_user.id);
        if (existing) {
          return prev.map(p => 
            p.id === request.from_user.id 
              ? { ...p, connection_status: 'connected' }
              : p
          );
        } else {
          return [...prev, { ...request.from_user, connection_status: 'connected' }];
        }
      });
    }
    
    // Remove from requests
    setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesUserType = filters.userType === 'all' || person.user_type === filters.userType;
    const matchesAvailability = filters.availability === 'all' || person.availability === filters.availability;
    
    return matchesSearch && matchesUserType && matchesAvailability;
  });

  const featuredPeople = filteredPeople.filter(p => p.is_featured);
  const otherPeople = filteredPeople.filter(p => !p.is_featured);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Users className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Connect with People</h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search people, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex space-x-2 overflow-x-auto">
          <Select value={filters.userType} onValueChange={(value) => setFilters(prev => ({ ...prev, userType: value }))}>
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All People</SelectItem>
              <SelectItem value="developer">Developers</SelectItem>
              <SelectItem value="recruiter">Recruiters</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="not_looking">Not Looking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'discover' | 'requests')} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
          <TabsTrigger value="discover" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Discover People</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Requests</span>
            {connectionRequests.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {connectionRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="py-4 space-y-6">
              {/* Featured People */}
              {featuredPeople.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <h2 className="text-lg font-semibold">Featured Professionals</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredPeople.map((person) => (
                      <Card key={person.id} className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <ImageWithFallback
                                src={person.profile_picture || ''}
                                alt={person.full_name}
                                fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.full_name)}&background=f0f0f0&color=333`}
                              />
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getAvailabilityColor(person.availability)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold truncate">{person.full_name}</h3>
                              {person.user_type === 'recruiter' && (
                                <Badge variant="secondary" className="text-xs">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  Recruiter
                                </Badge>
                              )}
                              {person.user_type === 'developer' && (
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
                              {person.company && (
                                <div className="flex items-center space-x-1">
                                  <Building className="h-3 w-3" />
                                  <span>{person.company}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{person.location}</span>
                              </div>
                            </div>
                            
                            {person.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {person.bio}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {person.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {person.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{person.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{person.connections_count} connections</span>
                                {person.mutual_connections && person.mutual_connections > 0 && (
                                  <span>{person.mutual_connections} mutual</span>
                                )}
                                {person.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{person.rating}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {person.connection_status === 'none' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPerson(person);
                                      setShowConnectionModal(true);
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Connect
                                  </Button>
                                )}
                                
                                {person.connection_status === 'pending' && (
                                  <Button size="sm" variant="outline" disabled>
                                    <Clock className="h-4 w-4 mr-1" />
                                    Pending
                                  </Button>
                                )}
                                
                                {person.connection_status === 'connected' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => onStartConversation(person.id)}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    Message
                                  </Button>
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
                      <Card key={person.id} className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <ImageWithFallback
                                src={person.profile_picture || ''}
                                alt={person.full_name}
                                fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.full_name)}&background=f0f0f0&color=333`}
                              />
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getAvailabilityColor(person.availability)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-medium truncate">{person.full_name}</h3>
                                  {person.user_type === 'recruiter' && (
                                    <Badge variant="secondary" className="text-xs">
                                      Recruiter
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{person.title}</p>
                                <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                                  {person.company && (
                                    <span>{person.company}</span>
                                  )}
                                  <span>{person.location}</span>
                                  {person.mutual_connections && person.mutual_connections > 0 && (
                                    <span>{person.mutual_connections} mutual</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {person.connection_status === 'none' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPerson(person);
                                      setShowConnectionModal(true);
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                {person.connection_status === 'pending' && (
                                  <Button size="sm" variant="outline" disabled>
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                {person.connection_status === 'connected' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => onStartConversation(person.id)}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
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
                    Try adjusting your search or filters to find more people
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="py-4">
              {connectionRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No connection requests</h3>
                  <p className="text-muted-foreground">
                    When people want to connect with you, they'll appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <ImageWithFallback
                            src={request.from_user.profile_picture || ''}
                            alt={request.from_user.full_name}
                            fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(request.from_user.full_name)}&background=f0f0f0&color=333`}
                          />
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{request.from_user.full_name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {request.from_user.user_type}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.from_user.title} • {request.from_user.company}
                          </p>
                          
                          {request.message && (
                            <div className="bg-muted rounded-lg p-3 mb-3">
                              <p className="text-sm">{request.message}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(request.created_at)}
                            </span>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleConnectionRequest(request.id, 'decline')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleConnectionRequest(request.id, 'accept')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Connection Request Modal */}
      <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect with {selectedPerson?.full_name}</DialogTitle>
          </DialogHeader>
          
          {selectedPerson && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <ImageWithFallback
                    src={selectedPerson.profile_picture || ''}
                    alt={selectedPerson.full_name}
                    fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPerson.full_name)}&background=f0f0f0&color=333`}
                  />
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedPerson.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPerson.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedPerson.company}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add a personal message (optional)
                </label>
                <Textarea
                  placeholder="Hi, I'd like to connect with you..."
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConnectionModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => sendConnectionRequest(selectedPerson, connectionMessage)}
                >
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