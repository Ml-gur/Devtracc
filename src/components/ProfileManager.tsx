import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  MapPin, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  Github, 
  Linkedin, 
  Edit3, 
  Plus, 
  X, 
  Eye, 
  EyeOff,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  Languages,
  Target,
  DollarSign,
  Clock,
  Settings,
  User,
  FileText,
  Activity,
  Users,
  Heart,
  MessageSquare,
  FolderOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';


interface ProfileFormData {
  // Basic Information
  full_name: string;
  title: string;
  company?: string;
  location: string;
  country: string;
  bio?: string;
  profile_picture?: string;
  
  // Professional Details
  user_type: 'developer' | 'recruiter';
  experience_years?: number;
  hourly_rate?: number;
  currency?: string;
  availability?: 'available' | 'busy' | 'not_looking';
  
  // Contact Information
  email?: string;
  phone?: string;
  website?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  preferred_contact?: 'email' | 'phone' | 'messaging';
  
  // Skills and Languages
  skills: string[];
  languages: string[];
  interests?: string[];
  
  // Work Experience
  work_experience?: WorkExperience[];
  
  // Education
  education?: Education[];
  
  // Certifications
  certifications?: Certification[];
  
  // Privacy Settings
  show_email: boolean;
  show_phone: boolean;
  show_rate: boolean;
  show_location: boolean;
  
  // Profile Settings
  timezone?: string;
}

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
  current: boolean;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
}

interface ProfileManagerProps {
  currentUserId: string;
  onBack: () => void;
  onSave?: (profileData: ProfileFormData) => void;
}

const DEMO_PROFILE_DATA: ProfileFormData = {
  full_name: 'Alex Thompson',
  title: 'Full Stack Developer',
  company: '',
  location: 'Nairobi',
  country: 'Kenya',
  bio: 'Passionate developer building the next generation of African tech solutions. I specialize in modern web technologies and love collaborating on impactful projects.',
  profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  user_type: 'developer',
  experience_years: 3,
  hourly_rate: 45,
  currency: 'USD',
  availability: 'available',
  email: 'alex@example.com',
  website: 'https://alexthompson.dev',
  github_url: 'https://github.com/alexthompson',
  linkedin_url: 'https://linkedin.com/in/alexthompson',
  portfolio_url: 'https://alexthompson.dev',
  preferred_contact: 'messaging',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
  languages: ['English', 'Swahili'],
  interests: ['Open Source', 'AI/ML', 'Fintech'],
  work_experience: [
    {
      id: '1',
      title: 'Full Stack Developer',
      company: 'TechStartup Kenya',
      duration: '2022 - Present',
      description: 'Building scalable web applications using React and Node.js. Leading frontend development and mentoring junior developers.',
      current: true
    }
  ],
  education: [
    {
      degree: 'B.Sc Computer Science',
      institution: 'University of Nairobi',
      year: '2021'
    }
  ],
  certifications: [
    {
      name: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2023-06-15'
    }
  ],
  show_email: false,
  show_phone: false,
  show_rate: true,
  show_location: true,
  timezone: 'GMT+3'
};

const COUNTRIES = [
  'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Uganda', 'Tanzania', 
  'Rwanda', 'Ethiopia', 'Morocco', 'Egypt', 'Tunisia', 'Senegal',
  'Cameroon', 'Ivory Coast', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR', 'GHS'];

export default function ProfileManager({ currentUserId, onBack, onSave }: ProfileManagerProps) {
  const [formData, setFormData] = useState<ProfileFormData>(DEMO_PROFILE_DATA);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  useEffect(() => {
    calculateProfileCompleteness();
  }, [formData]);

  const calculateProfileCompleteness = () => {
    const fields = [
      formData.full_name,
      formData.title,
      formData.location,
      formData.country,
      formData.bio,
      formData.skills.length > 0,
      formData.languages.length > 0,
      formData.work_experience && formData.work_experience.length > 0,
      formData.education && formData.education.length > 0,
      formData.profile_picture
    ];
    
    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProfileCompleteness(percentage);
  };

  const updateFormData = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      updateFormData('skills', [...formData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData('skills', formData.skills.filter(s => s !== skill));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      updateFormData('languages', [...formData.languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    updateFormData('languages', formData.languages.filter(l => l !== language));
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      const interests = formData.interests || [];
      if (!interests.includes(newInterest.trim())) {
        updateFormData('interests', [...interests, newInterest.trim()]);
        setNewInterest('');
      }
    }
  };

  const removeInterest = (interest: string) => {
    const interests = formData.interests || [];
    updateFormData('interests', interests.filter(i => i !== interest));
  };

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      duration: '',
      description: '',
      current: false
    };
    
    const experiences = formData.work_experience || [];
    updateFormData('work_experience', [...experiences, newExperience]);
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    const experiences = formData.work_experience || [];
    const updated = experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateFormData('work_experience', updated);
  };

  const removeWorkExperience = (id: string) => {
    const experiences = formData.work_experience || [];
    updateFormData('work_experience', experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const education = formData.education || [];
    updateFormData('education', [...education, { degree: '', institution: '', year: '' }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const education = formData.education || [];
    const updated = education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    updateFormData('education', updated);
  };

  const removeEducation = (index: number) => {
    const education = formData.education || [];
    updateFormData('education', education.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    const certifications = formData.certifications || [];
    updateFormData('certifications', [...certifications, { name: '', issuer: '', date: '' }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const certifications = formData.certifications || [];
    const updated = certifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    updateFormData('certifications', updated);
  };

  const removeCertification = (index: number) => {
    const certifications = formData.certifications || [];
    updateFormData('certifications', certifications.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSave) {
        onSave(formData);
      }
      
      // Show success message
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Manage Profile</h1>
            <p className="text-sm text-muted-foreground">
              Control what others see about you
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium">Profile Completeness</div>
            <div className="flex items-center space-x-2">
              <Progress value={profileCompleteness} className="w-20" />
              <span className="text-xs text-muted-foreground">{profileCompleteness}%</span>
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Profile Header Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="w-32 h-32 mb-4">
                      <ImageWithFallback
                        src={formData.profile_picture || ''}
                        alt={formData.full_name}
                        fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name)}&background=f0f0f0&color=333&size=128`}
                      />
                    </Avatar>
                    <Button 
                      size="sm" 
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full p-0"
                      onClick={() => {
                        // In a real app, this would open a file picker
                        console.log('Change profile picture');
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge 
                      variant={formData.availability === 'available' ? 'default' : 'secondary'}
                      className={formData.availability === 'available' ? 'bg-green-500' : ''}
                    >
                      {formData.availability === 'available' ? 'Available for work' : 
                       formData.availability === 'busy' ? 'Currently busy' : 'Not looking'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{formData.full_name || 'Your Name'}</h1>
                  <p className="text-lg text-muted-foreground">{formData.title || 'Your Title'}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {formData.company && (
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{formData.company}</span>
                      </div>
                    )}
                    {formData.show_location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.location}, {formData.country}</span>
                      </div>
                    )}
                  </div>
                  
                  {formData.bio && (
                    <p className="text-sm leading-relaxed mt-4">{formData.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => updateFormData('full_name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        placeholder="e.g., Senior Full Stack Developer"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        value={formData.company || ''}
                        onChange={(e) => updateFormData('company', e.target.value)}
                        placeholder="Your current company"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="user_type">Profile Type</Label>
                      <Select value={formData.user_type} onValueChange={(value: 'developer' | 'recruiter') => updateFormData('user_type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="location">City</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                        placeholder="e.g., Lagos, Nairobi"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">About You</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ''}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      placeholder="Tell others about yourself, your passion, and what you're working on..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(formData.bio || '').length}/500 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="+254 123 456 789"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website/Portfolio</Label>
                      <Input
                        id="website"
                        value={formData.website || ''}
                        onChange={(e) => updateFormData('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
                      <Select value={formData.preferred_contact} onValueChange={(value: any) => updateFormData('preferred_contact', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="messaging">In-app Messaging</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="github_url">GitHub Profile</Label>
                      <Input
                        id="github_url"
                        value={formData.github_url || ''}
                        onChange={(e) => updateFormData('github_url', e.target.value)}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url || ''}
                        onChange={(e) => updateFormData('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Professional Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="experience_years">Years of Experience</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        value={formData.experience_years || ''}
                        onChange={(e) => updateFormData('experience_years', parseInt(e.target.value) || 0)}
                        placeholder="3"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate (Optional)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={formData.hourly_rate || ''}
                        onChange={(e) => updateFormData('hourly_rate', parseInt(e.target.value) || 0)}
                        placeholder="50"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(currency => (
                            <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="availability">Availability Status</Label>
                    <Select value={formData.availability} onValueChange={(value: any) => updateFormData('availability', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available for work</SelectItem>
                        <SelectItem value="busy">Currently busy</SelectItem>
                        <SelectItem value="not_looking">Not looking for opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={formData.timezone || ''}
                      onChange={(e) => updateFormData('timezone', e.target.value)}
                      placeholder="GMT+3"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Work Experience</span>
                    </CardTitle>
                    <Button size="sm" onClick={addWorkExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.work_experience || []).map((exp) => (
                    <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Work Experience</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeWorkExperience(exp.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={exp.title}
                          onChange={(e) => updateWorkExperience(exp.id, 'title', e.target.value)}
                          placeholder="Job Title"
                        />
                        <Input
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Input
                          value={exp.duration}
                          onChange={(e) => updateWorkExperience(exp.id, 'duration', e.target.value)}
                          placeholder="2020 - Present"
                          className="flex-1"
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={exp.current}
                            onCheckedChange={(checked) => updateWorkExperience(exp.id, 'current', checked)}
                          />
                          <Label className="text-sm">Current Position</Label>
                        </div>
                      </div>
                      
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your role and achievements..."
                        rows={3}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5" />
                      <span>Education</span>
                    </CardTitle>
                    <Button size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.education || []).map((edu, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Education</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeEducation(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="Degree"
                        />
                        <Input
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          placeholder="Year"
                        />
                      </div>
                      
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        placeholder="Institution"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Certifications</span>
                    </CardTitle>
                    <Button size="sm" onClick={addCertification}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.certifications || []).map((cert, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Certification</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeCertification(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          placeholder="Certification Name"
                        />
                        <Input
                          value={cert.date}
                          onChange={(e) => updateCertification(index, 'date', e.target.value)}
                          placeholder="Date Obtained"
                          type="date"
                        />
                      </div>
                      
                      <Input
                        value={cert.issuer}
                        onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                        placeholder="Issuing Organization"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Skills & Technologies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Languages className="h-5 w-5" />
                    <span>Languages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language) => (
                      <Badge key={language} variant="outline" className="flex items-center space-x-1">
                        <span>{language}</span>
                        <button
                          onClick={() => removeLanguage(language)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language..."
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <Button onClick={addLanguage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Interests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(formData.interests || []).map((interest) => (
                      <Badge key={interest} variant="outline" className="flex items-center space-x-1">
                        <span>{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest..."
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Privacy Settings</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Control what information is visible to other users
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Show Email Address</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your email address
                        </p>
                      </div>
                      <Switch
                        checked={formData.show_email}
                        onCheckedChange={(checked) => updateFormData('show_email', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Show Phone Number</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your phone number
                        </p>
                      </div>
                      <Switch
                        checked={formData.show_phone}
                        onCheckedChange={(checked) => updateFormData('show_phone', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Show Hourly Rate</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your hourly rate to potential clients
                        </p>
                      </div>
                      <Switch
                        checked={formData.show_rate}
                        onCheckedChange={(checked) => updateFormData('show_rate', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Show Location</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your city and country to others
                        </p>
                      </div>
                      <Switch
                        checked={formData.show_location}
                        onCheckedChange={(checked) => updateFormData('show_location', checked)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-muted-foreground">
                      Your profile is visible to all members of the DevTrack Africa community. 
                      You can control specific information through the settings above.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Stats</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These stats are automatically calculated based on your activity
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <FolderOpen className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">45</div>
                      <div className="text-xs text-muted-foreground">Connections</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <MessageSquare className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">23</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Heart className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
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