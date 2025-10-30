import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, AlertTriangle } from 'lucide-react';

interface ProfileCompletionNotificationProps {
  profile: any;
  onNavigateToProfile: () => void;
}

export default function ProfileCompletionNotification({
  profile,
  onNavigateToProfile
}: ProfileCompletionNotificationProps) {

  // Calculate profile completeness based on available fields
  const calculateProfileCompleteness = () => {
    const fields = [
      profile?.fullName || profile?.full_name,
      profile?.title,
      profile?.location || profile?.country,
      profile?.bio,
      profile?.techStack?.length > 0 || profile?.skills?.length > 0,
      profile?.languages?.length > 0,
      profile?.work_experience?.length > 0 || profile?.workExperience?.length > 0,
      profile?.education?.length > 0,
      profile?.profilePicture || profile?.profile_picture
    ];

    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    return percentage;
  };

  const completeness = calculateProfileCompleteness();

  // Don't show notification if profile is 100% complete
  if (completeness >= 100) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">Complete Your Profile</span>
          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
            {completeness}%
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={onNavigateToProfile}
          className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 h-7"
        >
          Complete
        </Button>
      </div>
    </div>
  );
}
