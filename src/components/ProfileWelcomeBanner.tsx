import React from 'react';
import { Star, CheckCircle, User, MapPin, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProfileWelcomeBannerProps {
  isFirstTimeSetup: boolean;
  userProfile: {
    fullName?: string;
    email?: string;
    country?: string;
    phone?: string;
  };
}

export default function ProfileWelcomeBanner({ isFirstTimeSetup, userProfile }: ProfileWelcomeBannerProps) {
  if (!isFirstTimeSetup) return null;

  const registrationData = [
    {
      icon: User,
      label: 'Full Name',
      value: userProfile.fullName,
      present: !!userProfile.fullName
    },
    {
      icon: Mail,
      label: 'Email',
      value: userProfile.email,
      present: !!userProfile.email
    },
    {
      icon: MapPin,
      label: 'Country',
      value: userProfile.country,
      present: !!userProfile.country
    },
    {
      icon: Phone,
      label: 'Phone',
      value: userProfile.phone,
      present: !!userProfile.phone
    }
  ];

  const populatedFields = registrationData.filter(field => field.present).length;

  return (
    <div className="m-4 mb-0">
      {/* Welcome Alert */}
      <Alert className="border-green-200 bg-green-50 mb-4">
        <Star className="h-4 w-4" />
        <AlertDescription>
          <strong>Welcome to DevTrack Africa!</strong> We've automatically populated your profile with information from your registration. 
          Complete the sections below to help other developers connect with you and showcase your skills to the community.
        </AlertDescription>
      </Alert>

      {/* Registration Data Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Auto-populated from Registration ({populatedFields} of {registrationData.length} fields)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {registrationData.map((field, index) => (
              <div key={index} className="flex items-center space-x-2">
                <field.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{field.label}:</span>
                {field.present ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{field.value}</span>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                      ✓ Set
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500 border-gray-300">
                    Not provided
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Next steps:</strong> Add your skills, work experience, and bio to make your profile stand out. 
              A complete profile gets 3x more views and connection requests!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}