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
  FolderOpen,
  Trash2,
  Download,
  Upload,
  AlertTriangle
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
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import ProfileWelcomeBanner from './ProfileWelcomeBanner';

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
  show_location: boolean;

  // Profile Settings
  timezone?: string;
  profile_public: boolean;
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

interface UserProfileManagerProps {
  currentUserId: string;
  onBack: () => void;
  onSave?: (profileData: ProfileFormData) => void;
  onDeleteProfile?: () => Promise<{ success: boolean; error?: string }>;
  initialProfile?: any; // Accept profile data from AuthContext
}


const COUNTRIES = [
  'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Uganda', 'Tanzania',
  'Rwanda', 'Ethiopia', 'Morocco', 'Egypt', 'Tunisia', 'Senegal',
  'Cameroon', 'Ivory Coast', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia'
];

export default function UserProfileManager({ currentUserId, onBack, onSave, onDeleteProfile, initialProfile }: UserProfileManagerProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    title: '',
    company: '',
    location: '',
    country: '',
    bio: '',
    profile_picture: '',
    user_type: 'developer',
    experience_years: undefined,
    availability: 'available',
    email: '',
    phone: '',
    website: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    preferred_contact: 'messaging',
    skills: [],
    languages: [],
    interests: [],
    work_experience: [],
    education: [],
    certifications: [],
    show_email: false,
    show_phone: false,
    show_location: true,
    timezone: '',
    profile_public: true
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  // Load profile data from AuthContext or initial profile
  const loadProfileFromAuthContext = () => {
    if (initialProfile) {
      // Map AuthContext profile to ProfileFormData format
      const mappedProfile: ProfileFormData = {
        full_name: initialProfile.fullName || '',
        title: initialProfile.title || 'Developer',
        company: '',
        location: initialProfile.location || initialProfile.country || '',
        country: initialProfile.country || '',
        bio: initialProfile.bio || '',
        profile_picture: initialProfile.profilePicture || '',
        user_type: initialProfile.userType || 'developer',
        email: initialProfile.email || '',
        phone: initialProfile.phone || '',
        skills: initialProfile.techStack || [],
        languages: ['English'], // Default language
        show_email: initialProfile.showEmail ?? false,
        show_phone: initialProfile.showPhone ?? false,
        show_location: initialProfile.showLocation ?? true,
        profile_public: initialProfile.profilePublic ?? true,
        // Set defaults for other fields
        experience_years: undefined,
        availability: 'available',
        website: '',
        github_url: '',
        linkedin_url: '',
        portfolio_url: '',
        preferred_contact: 'messaging',
        interests: [],
        work_experience: [],
        education: [],
        certifications: [],
        timezone: 'GMT+1'
      };

      setFormData(mappedProfile);
      
      // Check if this is a first-time setup based on profile completeness
      const hasBasicInfo = initialProfile.fullName && initialProfile.title;
      const hasDetailedInfo = initialProfile.bio && initialProfile.techStack?.length > 0;
      setIsFirstTimeSetup(!hasDetailedInfo);
      
      console.log('✅ Profile loaded from registration data:', {
        name: initialProfile.fullName,
        country: initialProfile.country,
        email: initialProfile.email,
        isFirstTime: !hasDetailedInfo
      });
    } else {
      // Fallback to demo data for development/testing
      setIsFirstTimeSetup(true);
      console.log('📝 Using demo profile data');
    }
  };

  useEffect(() => {
    // Load profile data from AuthContext with auto-populated registration data
    loadProfileFromAuthContext();
    calculateProfileCompleteness();
  }, [currentUserId, initialProfile]);

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
    setUnsavedChanges(true);
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
      // Save profile to Supabase database via callback
      if (onSave) {
        onSave(formData);
      }
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUnsavedChanges(false);
      console.log('Profile saved successfully to Supabase database');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      if (typeof onDeleteProfile === 'function') {
        const result = await onDeleteProfile();
        if (result.success) {
          setFormData({
            full_name: '',
            title: '',
            company: '',
            location: '',
            country: '',
            bio: '',
            profile_picture: '',
            user_type: 'developer',
            experience_years: undefined,
            availability: 'available',
            email: '',
            phone: '',
            website: '',
            github_url: '',
            linkedin_url: '',
            portfolio_url: '',
            preferred_contact: 'messaging',
            skills: [],
            languages: [],
            interests: [],
            work_experience: [],
            education: [],
            certifications: [],
            show_email: false,
            show_phone: false,
            show_location: true,
            timezone: '',
            profile_public: true
          });
          setShowDeleteDialog(false);
          setUnsavedChanges(false);
          console.log('✅ Profile deleted successfully');
        } else {
          console.error('❌ Failed to delete profile:', result.error);
        }
      } else {
        console.warn('⚠️ onDeleteProfile function not provided');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleExportProfile = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `devtrack_profile_${formData.full_name.replace(/\s+/g, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a service and get back a URL
      // For demo, we'll use a placeholder
      const reader = new FileReader();
      reader.onload = (e) => {
        updateFormData('profile_picture', e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
            <h1 className="text-lg font-semibold">My Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your professional profile and settings
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
          
          {unsavedChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Warning for unsaved changes */}
      {unsavedChanges && (
        <Alert className="m-4 mb-0 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your profile before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      <ScrollArea className="flex-1">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
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
                    <div className="absolute bottom-2 right-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="profile-picture-upload"
                      />
                      <label
                        htmlFor="profile-picture-upload"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge 
                      variant={formData.availability === 'available' ? 'default' : 'secondary'}
                      className={formData.availability === 'available' ? 'bg-green-500' : ''}
                    >
                      {formData.availability === 'available' ? 'Available for work' : 
                       formData.availability === 'busy' ? 'Currently busy' : 'Not looking'}
                    </Badge>
                    
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{formData.profile_public ? 'Public Profile' : 'Private Profile'}</span>
                    </div>
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
                    {formData.experience_years && (
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{formData.experience_years} years experience</span>
                      </div>
                    )}
                  </div>
                  
                  {formData.bio && (
                    <p className="text-sm leading-relaxed mt-4">{formData.bio}</p>
                  )}
                  
                  {/* Skills Preview */}
                  {formData.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {formData.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{formData.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Professional Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Professional Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
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

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleExportProfile}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Profile Data
                    </Button>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to other users
                        </p>
                      </div>
                      <Switch
                        checked={formData.profile_public}
                        onCheckedChange={(checked) => updateFormData('profile_public', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full justify-start">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Profile</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your profile? This action cannot be undone and will remove all your profile information.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteProfile}>
                            Delete Profile
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Completeness Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A complete profile helps you connect with other developers and showcase your skills
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Progress</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={profileCompleteness} className="w-32" />
                        <span className="text-sm font-medium">{profileCompleteness}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${formData.full_name ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>Basic Information</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${formData.bio ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>Professional Bio</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${formData.skills.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>Skills & Languages</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${formData.work_experience && formData.work_experience.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>Work Experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${formData.education && formData.education.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>Education</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${formData.profile_picture ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>Profile Picture</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                        placeholder="+234 123 456 789"
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
                      placeholder="GMT+1"
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
                            onCheckedChange={(checked: boolean) => updateWorkExperience(exp.id, 'current', checked)}
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

            <TabsContent value="settings" className="space-y-6">
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
                        onCheckedChange={(checked: boolean) => updateFormData('show_email', checked)}
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
                        onCheckedChange={(checked: boolean) => updateFormData('show_phone', checked)}
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
                        onCheckedChange={(checked: boolean) => updateFormData('show_location', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Public Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to all users
                        </p>
                      </div>
                      <Switch
                        checked={formData.profile_public}
                        onCheckedChange={(checked) => updateFormData('profile_public', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Export or delete your profile data
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Export Profile Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Download your profile information in JSON format
                    </p>
                    <Button variant="outline" onClick={handleExportProfile}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your profile and all associated data
                    </p>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Profile</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your profile? This action cannot be undone and will remove all your profile information, work experience, education, and settings.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteProfile}>
                            Delete Profile
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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