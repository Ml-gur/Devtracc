import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, 
  UserPlus, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  X,
  Mail,
  Search,
  Star,
  MessageSquare,
  UserCheck,
  AlertCircle,
  Instagram,
  Globe,
  Eye,
  ArrowRight,
  Plus,
  Share2,
  Handshake
} from 'lucide-react';
import { LegacyProject as Project } from '../types/project';
import { ProjectCollaborator, CollaborationInviteRequest } from '../types/collaboration';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CollaborationInviteManagerProps {
  project: Project;
  currentUserId: string;
  onInvitesSent: (invites: CollaborationInviteRequest[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface DeveloperProfile {
  id: string;
  fullName: string;
  username: string;
  profilePicture?: string;
  title: string;
  company?: string;
  location: string;
  skills: string[];
  rating: number;
  projectsCount: number;
  isAvailable: boolean;
  responseTime: string;
  collaborationStyle: string[];
}

const DEMO_DEVELOPERS: DeveloperProfile[] = [
  {
    id: 'dev-1',
    fullName: 'Kemi Adebola',
    username: '@kemiadebola',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    title: 'Senior Frontend Developer',
    company: 'TechLagos',
    location: 'Lagos, Nigeria',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Figma'],
    rating: 4.9,
    projectsCount: 23,
    isAvailable: true,
    responseTime: 'Usually responds within 2 hours',
    collaborationStyle: ['Remote-first', 'Agile', 'Open Source']
  },
  {
    id: 'dev-2',
    fullName: 'Chuka Okoye',
    username: '@chukaokoye',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'Full Stack Developer',
    company: 'Freelance',
    location: 'Abuja, Nigeria',
    skills: ['Node.js', 'Python', 'React', 'PostgreSQL', 'AWS'],
    rating: 4.8,
    projectsCount: 31,
    isAvailable: true,
    responseTime: 'Usually responds within 1 hour',
    collaborationStyle: ['Full-time', 'Pair Programming', 'Mentoring']
  },
  {
    id: 'dev-3',
    fullName: 'Aisha Hassan',
    username: '@aishahassan',
    profilePicture: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
    title: 'Mobile Developer',
    company: 'InnovateTech',
    location: 'Kano, Nigeria',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    rating: 4.7,
    projectsCount: 18,
    isAvailable: false,
    responseTime: 'Usually responds within 6 hours',
    collaborationStyle: ['Part-time', 'Code Review', 'Documentation']
  },
  {
    id: 'dev-4',
    fullName: 'Emmanuel Okoro',
    username: '@emmanuelokoro',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'UI/UX Designer & Developer',
    company: 'DesignHub Africa',
    location: 'Accra, Ghana',
    skills: ['Figma', 'Adobe XD', 'React', 'CSS', 'User Research'],
    rating: 4.9,
    projectsCount: 27,
    isAvailable: true,
    responseTime: 'Usually responds within 3 hours',
    collaborationStyle: ['Design Systems', 'User Testing', 'Prototyping']
  },
  {
    id: 'dev-5',
    fullName: 'Fatima Musa',
    username: '@fatimamusa',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    title: 'DevOps Engineer',
    company: 'CloudAfrica',
    location: 'Nairobi, Kenya',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    rating: 4.8,
    projectsCount: 15,
    isAvailable: true,
    responseTime: 'Usually responds within 4 hours',
    collaborationStyle: ['Infrastructure', 'Automation', 'Monitoring']
  }
];

export default function CollaborationInviteManager({
  project,
  currentUserId,
  onInvitesSent,
  isOpen,
  onClose
}: CollaborationInviteManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectSkills = project.techStack || [];
  
  useEffect(() => {
    // Auto-generate invite message
    setInviteMessage(
      `Hi! I'd love to collaborate with you on "${project.title}". ` +
      `This is a ${project.category} project focused on ${project.description.slice(0, 100)}... ` +
      `Your expertise would be a great addition to our team! 🚀`
    );
  }, [project]);

  const filteredDevelopers = DEMO_DEVELOPERS.filter(dev => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!dev.fullName.toLowerCase().includes(query) && 
          !dev.title.toLowerCase().includes(query) &&
          !dev.skills.some(skill => skill.toLowerCase().includes(query))) {
        return false;
      }
    }

    // Skills filter
    if (skillsFilter.length > 0) {
      if (!skillsFilter.some(skill => dev.skills.includes(skill))) {
        return false;
      }
    }

    // Location filter
    if (locationFilter) {
      if (!dev.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'available' && !dev.isAvailable) return false;
      if (availabilityFilter === 'unavailable' && dev.isAvailable) return false;
    }

    return true;
  });

  const toggleDeveloperSelection = (developerId: string) => {
    setSelectedDevelopers(prev => 
      prev.includes(developerId)
        ? prev.filter(id => id !== developerId)
        : [...prev, developerId]
    );
  };

  const toggleSkillFilter = (skill: string) => {
    setSkillsFilter(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const sendCollaborationInvites = async () => {
    if (selectedDevelopers.length === 0) {
      alert('Please select at least one developer to invite');
      return;
    }

    setIsSubmitting(true);

    try {
      const invites: CollaborationInviteRequest[] = selectedDevelopers.map(devId => ({
        id: `invite-${Date.now()}-${devId}`,
        projectId: project.id,
        requesterId: currentUserId,
        targetUserId: devId,
        message: inviteMessage,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      // Simulate sending invites
      await new Promise(resolve => setTimeout(resolve, 2000));

      onInvitesSent(invites);
      
      // Show success message
      alert(`Collaboration invites sent to ${selectedDevelopers.length} developer${selectedDevelopers.length > 1 ? 's' : ''}!`);
      
      // Reset form
      setSelectedDevelopers([]);
      setInviteMessage('');
      
      onClose();
    } catch (error) {
      console.error('Error sending invites:', error);
      alert('Failed to send invites. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDevs = DEMO_DEVELOPERS.filter(dev => selectedDevelopers.includes(dev.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Handshake className="h-5 w-5" />
            <span>Invite Collaborators</span>
          </DialogTitle>
          <DialogDescription>
            Find and invite talented developers to collaborate on "{project.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Developers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Skills (Project Tech Stack)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {projectSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant={skillsFilter.includes(skill) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleSkillFilter(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Availability</Label>
                  <Select value={availabilityFilter} onValueChange={(value: any) => setAvailabilityFilter(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Developers</SelectItem>
                      <SelectItem value="available">Available Now</SelectItem>
                      <SelectItem value="unavailable">Currently Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">
                Browse Developers ({filteredDevelopers.length})
              </TabsTrigger>
              <TabsTrigger value="selected">
                Selected ({selectedDevelopers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDevelopers.map((developer) => (
                  <Card 
                    key={developer.id}
                    className={`cursor-pointer transition-all ${
                      selectedDevelopers.includes(developer.id)
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => toggleDeveloperSelection(developer.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <ImageWithFallback
                              src={developer.profilePicture || ''}
                              alt={developer.fullName}
                              fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(developer.fullName)}&background=f0f0f0&color=333`}
                            />
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{developer.fullName}</h4>
                            <p className="text-sm text-muted-foreground">{developer.username}</p>
                            <p className="text-sm font-medium">{developer.title}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {selectedDevelopers.includes(developer.id) && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          <Badge variant={developer.isAvailable ? 'default' : 'secondary'}>
                            {developer.isAvailable ? 'Available' : 'Busy'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Location:</span>
                          <span>{developer.location}</span>
                        </div>
                        
                        {developer.company && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">Company:</span>
                            <span>{developer.company}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{developer.rating}</span>
                          <span className="text-muted-foreground">• {developer.projectsCount} projects</span>
                        </div>

                        <p className="text-muted-foreground text-xs">{developer.responseTime}</p>
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {developer.skills.slice(0, 4).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {developer.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{developer.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {developer.collaborationStyle.map(style => (
                            <Badge key={style} variant="secondary" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDevelopers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No developers found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              {selectedDevs.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No developers selected</h3>
                  <p className="text-muted-foreground">
                    Go to the Browse tab to select developers to invite
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected Developers */}
                  <div className="space-y-3">
                    {selectedDevs.map((developer) => (
                      <Card key={developer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <ImageWithFallback
                                  src={developer.profilePicture || ''}
                                  alt={developer.fullName}
                                  fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(developer.fullName)}&background=f0f0f0&color=333`}
                                />
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{developer.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{developer.title}</p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDeveloperSelection(developer.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Invitation Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Invitation Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Role for New Collaborators</Label>
                        <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer - Can view project and tasks</SelectItem>
                            <SelectItem value="editor">Editor - Can create and edit tasks</SelectItem>
                            <SelectItem value="admin">Admin - Can manage project and invite others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Personal Message</Label>
                        <Textarea
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          placeholder="Add a personal message to your invitation..."
                          rows={4}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {inviteMessage.length}/500 characters
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={sendCollaborationInvites}
            disabled={isSubmitting || selectedDevelopers.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending Invites...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {selectedDevelopers.length} Invite{selectedDevelopers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}