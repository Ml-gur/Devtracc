import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Calendar, 
  Star, 
  Code, 
  Users, 
  MessageCircle, 
  UserPlus, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Globe, 
  Mail,
  Phone,
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  TrendingUp,
  Activity,
  BookOpen,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserProfile {
  id: string;
  full_name: string;
  profile_picture?: string;
  user_type: 'developer' | 'recruiter';
  title: string;
  company?: string;
  location: string;
  country: string;
  bio?: string;
  skills: string[];
  experience_years?: number;
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  projects_count: number;
  connections_count: number;
  posts_count: number;
  likes_received: number;
  profile_views: number;
  availability?: 'available' | 'busy' | 'not_looking';
  hourly_rate?: number;
  currency?: string;
  rating?: number;
  reviews_count?: number;
  join_date: string;
  last_active?: string;
  achievements?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    date: string;
  }[];
  work_experience?: {
    id: string;
    title: string;
    company: string;
    duration: string;
    description: string;
    current: boolean;
  }[];
  preferred_contact?: 'email' | 'phone' | 'messaging';
  timezone?: string;
  interests?: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  techStack: string[];
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  likes: number;
  views: number;
  createdAt: string;
  featured: boolean;
}

interface CommunityPost {
  id: string;
  type: string;
  title: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
}

interface ProfileViewerProps {
  userId: string;
  onBack: () => void;
  onStartConversation: (userId: string) => void;
  onConnect?: (userId: string) => void;
  currentUserId: string;
}

// Demo data - in a real app, this would come from an API
const DEMO_PROFILE: UserProfile = {
  id: 'user-1',
  full_name: 'Sarah Johnson',
  profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b639?w=300&h=300&fit=crop&crop=face',
  user_type: 'developer',
  title: 'Senior Full Stack Developer & Tech Lead',
  company: 'Flutterwave',
  location: 'Lagos, Nigeria',
  country: 'Nigeria',
  bio: 'Passionate full-stack developer with 6+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud architecture. Currently leading a team of 8 developers at Flutterwave, focusing on fintech solutions for African markets. Love mentoring junior developers and contributing to open source projects.',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'GraphQL', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'Microservices'],
  experience_years: 6,
  education: [
    {
      degree: 'B.Sc Computer Science',
      institution: 'University of Lagos',
      year: '2018'
    },
    {
      degree: 'AWS Solutions Architect Certification',
      institution: 'Amazon Web Services',
      year: '2022'
    }
  ],
  certifications: [
    {
      name: 'AWS Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: '2022-03-15'
    },
    {
      name: 'Certified Kubernetes Administrator',
      issuer: 'CNCF',
      date: '2021-09-20'
    }
  ],
  languages: ['English', 'Yoruba', 'French'],
  github_url: 'https://github.com/sarahjohnson',
  linkedin_url: 'https://linkedin.com/in/sarahjohnson',
  portfolio_url: 'https://sarahjohnson.dev',
  email: 'sarah@example.com',
  website: 'https://sarahjohnson.dev',
  projects_count: 23,
  connections_count: 156,
  posts_count: 45,
  likes_received: 234,
  profile_views: 1250,
  availability: 'available',
  hourly_rate: 85,
  currency: 'USD',
  rating: 4.9,
  reviews_count: 12,
  join_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  achievements: [
    {
      id: '1',
      title: 'Top Contributor',
      description: 'Recognized as top contributor for Q3 2024',
      icon: '🏆',
      date: '2024-09-30'
    },
    {
      id: '2',
      title: 'Mentor Excellence',
      description: 'Successfully mentored 15+ junior developers',
      icon: '🎓',
      date: '2024-06-15'
    }
  ],
  work_experience: [
    {
      id: '1',
      title: 'Senior Full Stack Developer & Tech Lead',
      company: 'Flutterwave',
      duration: '2022 - Present',
      description: 'Leading development of core payment infrastructure serving 1M+ users across Africa. Built scalable microservices architecture and mentored junior developers.',
      current: true
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'Paystack',
      duration: '2020 - 2022',
      description: 'Developed customer-facing dashboard and internal tools. Implemented automated testing and CI/CD pipelines.',
      current: false
    }
  ],
  preferred_contact: 'messaging',
  timezone: 'GMT+1',
  interests: ['Open Source', 'AI/ML', 'Fintech', 'Mentorship', 'Tech Communities']
};

const DEMO_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'African Payment Gateway',
    description: 'A comprehensive payment solution for African businesses with multi-currency support and mobile money integration.',
    category: 'fintech',
    status: 'completed',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'],
    githubUrl: 'https://github.com/sarahjohnson/african-payment-gateway',
    liveUrl: 'https://african-payments.demo.com',
    likes: 45,
    views: 1250,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    featured: true
  },
  {
    id: '2',
    title: 'Developer Mentorship Platform',
    description: 'Platform connecting experienced developers with junior developers for mentorship and skill development.',
    category: 'education',
    status: 'in-progress',
    techStack: ['React', 'TypeScript', 'GraphQL', 'Node.js', 'MongoDB'],
    images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop'],
    githubUrl: 'https://github.com/sarahjohnson/mentorship-platform',
    likes: 32,
    views: 850,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  }
];

const DEMO_POSTS: CommunityPost[] = [
  {
    id: '1',
    type: 'article',
    title: 'Building Scalable APIs for African Fintech',
    content: 'Lessons learned from building payment APIs that serve millions of users across Africa. Key considerations for scalability, reliability, and regulatory compliance.',
    likes: 89,
    comments: 23,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['fintech', 'api', 'scalability', 'africa']
  },
  {
    id: '2',
    type: 'tutorial',
    title: 'React Performance Optimization Techniques',
    content: 'Comprehensive guide to optimizing React applications for better performance, including code splitting, memoization, and bundle optimization.',
    likes: 156,
    comments: 45,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['react', 'performance', 'optimization', 'frontend']
  }
];

export default function ProfileViewer({ 
  userId, 
  onBack, 
  onStartConversation, 
  onConnect, 
  currentUserId 
}: ProfileViewerProps) {
  const [profile, setProfile] = useState<UserProfile>(DEMO_PROFILE);
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_POSTS);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionPending, setConnectionPending] = useState(false);

  useEffect(() => {
    // In a real app, fetch profile data based on userId
    // For demo, we're using static data
    console.log('Loading profile for user:', userId);
  }, [userId]);

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'not_looking': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityText = (availability?: string) => {
    switch (availability) {
      case 'available': return 'Available for work';
      case 'busy': return 'Currently busy';
      case 'not_looking': return 'Not looking for opportunities';
      default: return 'Status unknown';
    }
  };

  const handleConnect = () => {
    setConnectionPending(true);
    if (onConnect) {
      onConnect(userId);
    }
    // Simulate connection process
    setTimeout(() => {
      setConnectionPending(false);
      setIsConnected(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStartConversation(userId)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
          
          {!isConnected && !connectionPending && (
            <Button 
              size="sm"
              onClick={handleConnect}
              disabled={connectionPending}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Connect
            </Button>
          )}
          
          {connectionPending && (
            <Button size="sm" disabled>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </Button>
          )}
          
          {isConnected && (
            <Button size="sm" variant="secondary" disabled>
              <Users className="h-4 w-4 mr-2" />
              Connected
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <Avatar className="w-32 h-32 mb-4">
                    <ImageWithFallback
                      src={profile.profile_picture || ''}
                      alt={profile.full_name}
                      fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=f0f0f0&color=333&size=128`}
                    />
                  </Avatar>
                  
                  <div className="space-y-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getAvailabilityColor(profile.availability)} border-0`}
                    >
                      {getAvailabilityText(profile.availability)}
                    </Badge>
                    
                    {profile.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{profile.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({profile.reviews_count} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                    <p className="text-lg text-muted-foreground">{profile.title}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {profile.company && (
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{profile.company}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}, {profile.country}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(profile.join_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-sm leading-relaxed">{profile.bio}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{profile.projects_count}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{profile.connections_count}</div>
                      <div className="text-xs text-muted-foreground">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{profile.posts_count}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{profile.likes_received}</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex flex-wrap gap-2">
                    {profile.github_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {profile.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {profile.portfolio_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
              <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Skills & Technologies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Featured Projects</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('projects')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.filter(p => p.featured).map((project) => (
                      <Card key={project.id} className="overflow-hidden">
                        {project.images[0] && (
                          <div className="aspect-video overflow-hidden">
                            <ImageWithFallback
                              src={project.images[0]}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              fallback=""
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.techStack.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.techStack.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.techStack.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{project.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{project.views}</span>
                              </span>
                            </div>
                            <span>{formatTimeAgo(project.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              {profile.achievements && profile.achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Achievements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.achievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    {project.images[0] && (
                      <div className="aspect-video overflow-hidden">
                        <ImageWithFallback
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          fallback=""
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.techStack.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{project.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{project.views}</span>
                          </span>
                        </div>
                        <span>{formatTimeAgo(project.createdAt)}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {project.githubUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {post.type}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {post.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes} likes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments} comments</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              {/* Work Experience */}
              {profile.work_experience && profile.work_experience.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Work Experience</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.work_experience.map((work) => (
                      <div key={work.id} className="relative">
                        <div className="flex items-start space-x-4">
                          <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold">{work.title}</h4>
                              {work.current && (
                                <Badge variant="default" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground font-medium">{work.company}</p>
                            <p className="text-sm text-muted-foreground mb-2">{work.duration}</p>
                            <p className="text-sm">{work.description}</p>
                          </div>
                        </div>
                        {work.id !== profile.work_experience![profile.work_experience!.length - 1].id && (
                          <div className="w-px h-4 bg-border ml-1 mt-2" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Education & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.education && profile.education.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5" />
                        <span>Education</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile.education.map((edu, index) => (
                        <div key={index}>
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground">{edu.year}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {profile.certifications && profile.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span>Certifications</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile.certifications.map((cert, index) => (
                        <div key={index}>
                          <h4 className="font-medium">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(cert.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Languages & Interests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Languages</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language) => (
                        <Badge key={language} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {profile.interests && profile.interests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Interests</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Contact Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Preferred Contact:</span>
                      <p className="font-medium capitalize">{profile.preferred_contact}</p>
                    </div>
                    {profile.timezone && (
                      <div>
                        <span className="text-muted-foreground">Timezone:</span>
                        <p className="font-medium">{profile.timezone}</p>
                      </div>
                    )}
                    {profile.hourly_rate && (
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <p className="font-medium">${profile.hourly_rate}/{profile.currency || 'USD'} per hour</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Last Active:</span>
                      <p className="font-medium">
                        {profile.last_active ? formatTimeAgo(profile.last_active) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}