import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';

interface User {
  id: string;
  email: string;
  fullName: string;
  country: string;
  phone: string;
}

interface ProfileSetupPageProps {
  onNavigate: (page: 'dashboard' | 'login') => void;
  onComplete: (profileData: {
    title: string;
    techStack: string[];
    bio: string;
    profilePicture?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  user: User | null;
}

interface FormData {
  title: string;
  techStack: string[];
  bio: string;
  profilePicture?: string;
}

const availableTechStack = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
  'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native',
  'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes',
  'Git', 'GraphQL', 'REST APIs', 'Microservices'
];

const jobTitleSuggestions = [
  'Frontend Developer',
  'Backend Developer', 
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Software Engineer',
  'Web Developer',
  'Data Scientist',
  'UI/UX Developer',
  'Game Developer',
  'Student',
  'Freelancer'
];

export default function ProfileSetupPage({ onNavigate, onComplete, user }: ProfileSetupPageProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    techStack: [],
    bio: '',
    profilePicture: undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleTechStackToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          profilePicture: event.target?.result as string
        }));
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Please enter your title/role');
      return false;
    }
    
    if (formData.techStack.length === 0) {
      setError('Please select at least one technology from your stack');
      return false;
    }
    
    if (!formData.bio.trim()) {
      setError('Please write a short bio about yourself');
      return false;
    }

    if (formData.bio.trim().length < 10) {
      setError('Bio must be at least 10 characters long');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const result = await onComplete(formData);
      
      if (!result.success) {
        if (result.error) {
          // Handle specific session errors
          if (result.error.includes('session') || result.error.includes('auth') || result.error.includes('login')) {
            setError(`${result.error} Please try logging in again.`);
          } else {
            setError(result.error);
          }
        } else {
          setError('Failed to save profile. Please try again.');
        }
      } else {
        setSuccessMessage('Profile completed successfully! Redirecting to dashboard...');
      }
    } catch (error) {
      console.error('Profile setup submission error:', error);
      setError('Failed to save profile. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip profile setup and complete it later
    onNavigate('dashboard');
  };

  const handleRetryLogin = () => {
    onNavigate('login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show error if no user data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Session Error</CardTitle>
            <CardDescription>
              Unable to load your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Your session has expired or is invalid. Please log in again to continue.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetryLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Complete Your Developer Profile</CardTitle>
          <CardDescription>
            Help the community know more about you and your skills
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  {(error.includes('session') || error.includes('auth') || error.includes('login')) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryLogin}
                      className="ml-2"
                    >
                      Login Again
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Profile Picture */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.profilePicture} alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Upload a profile picture (optional, max 5MB)</p>
            </div>

            {/* Title/Role */}
            <div className="space-y-2">
              <Label htmlFor="title">Title/Role *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Frontend Developer, Full Stack Student"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                list="title-suggestions"
                disabled={isLoading}
              />
              <datalist id="title-suggestions">
                {jobTitleSuggestions.map((title) => (
                  <option key={title} value={title} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                This will be displayed on your profile and in the community
              </p>
            </div>

            {/* Tech Stack */}
            <div className="space-y-4">
              <div>
                <Label>Tech Stack * (Select all that apply)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose technologies you work with or are learning ({formData.techStack.length} selected)
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {availableTechStack.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleTechStackToggle(tech)}
                    className={`text-left transition-all ${
                      formData.techStack.includes(tech)
                        ? 'opacity-100'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    disabled={isLoading}
                  >
                    <Badge
                      variant={formData.techStack.includes(tech) ? 'default' : 'outline'}
                      className="w-full justify-start cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {tech}
                    </Badge>
                  </button>
                ))}
              </div>
              
              {formData.techStack.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected ({formData.techStack.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech) => (
                      <Badge key={tech} variant="default" className="flex items-center gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleTechStackToggle(tech)}
                          className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                          disabled={isLoading}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio * ({formData.bio.length}/150)</Label>
              <Textarea
                id="bio"
                placeholder="Tell the community about yourself, your goals, or what you're working on..."
                value={formData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 150) {
                    setFormData(prev => ({ ...prev, bio: e.target.value }));
                  }
                }}
                maxLength={150}
                rows={3}
                className="resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will help other developers connect with you (minimum 10 characters)
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="sm:order-1"
                disabled={isLoading}
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Completing Profile...</span>
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="text-center text-sm text-muted-foreground">
              Step 2 of 2 - Profile Setup
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}