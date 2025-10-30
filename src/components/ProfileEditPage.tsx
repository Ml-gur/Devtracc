import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Code, 
  MessageSquare, 
  Camera,
  X,
  Plus,
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { updateUserProfile, UserProfile } from '../utils/database-service';
import { supabase } from '../utils/supabase/client';

interface ProfileEditPageProps {
  user: any;
  profile?: UserProfile | null;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export default function ProfileEditPage({ user, profile, onSave, onCancel }: ProfileEditPageProps) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.fullName || '',
    email: profile?.email || user?.email || '',
    title: profile?.title || user?.title || '',
    country: profile?.country || user?.country || '',
    phone: profile?.phone || user?.phone || '',
    bio: profile?.bio || user?.bio || '',
    tech_stack: profile?.tech_stack || user?.techStack || [],
    profile_image_url: profile?.profile_image_url || user?.profilePicture || ''
  });
  
  const [newTech, setNewTech] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTechStack = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Update database profile if available
      const result = await updateUserProfile(user.id, {
        full_name: formData.full_name,
        title: formData.title,
        country: formData.country,
        phone: formData.phone,
        bio: formData.bio,
        tech_stack: formData.tech_stack,
        profile_image_url: formData.profile_image_url
      });

      if (result.error) {
        // If database update fails, try updating auth metadata
        console.warn('Database profile update failed, updating auth metadata:', result.error);
        
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: formData.full_name,
            title: formData.title,
            country: formData.country,
            phone: formData.phone,
            bio: formData.bio,
            tech_stack: formData.tech_stack,
            profile_picture: formData.profile_image_url
          }
        });

        if (authError) {
          throw authError;
        }

        // Create a mock profile object for the callback
        const mockProfile: UserProfile = {
          id: user.id,
          email: formData.email,
          full_name: formData.full_name,
          title: formData.title,
          country: formData.country,
          phone: formData.phone,
          bio: formData.bio,
          tech_stack: formData.tech_stack,
          profile_image_url: formData.profile_image_url
        };

        onSave(mockProfile);
      } else {
        // Database update successful
        onSave(result.data!);
      }

      setSuccess(true);
      setTimeout(() => {
        onCancel(); // Return to previous view
      }, 1500);

    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {formData.profile_image_url ? (
                  <img 
                    src={formData.profile_image_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="profile_image_url">Image URL</Label>
                <Input
                  id="profile_image_url"
                  value={formData.profile_image_url}
                  onChange={(e) => handleInputChange('profile_image_url', e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="e.g., Nigeria"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g., +234 123 456 7890"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                rows={4}
              />
            </div>

            <div>
              <Label>Tech Stack</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Add a technology (e.g., React, Python, Node.js)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechStack();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTechStack} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tech_stack.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => removeTechStack(tech)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}