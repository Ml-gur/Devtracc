import React from 'react';
import { CheckCircle, Circle, ArrowRight, User, Briefcase, Code, GraduationCap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface ProfileSetupGuideProps {
  profileData: {
    full_name: string;
    title: string;
    bio?: string;
    skills: string[];
    work_experience?: any[];
    education?: any[];
  };
  onTabChange: (tab: string) => void;
}

export default function ProfileSetupGuide({ profileData, onTabChange }: ProfileSetupGuideProps) {
  const setupSteps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Name, title, location',
      icon: User,
      completed: !!(profileData.full_name && profileData.title),
      tabTarget: 'basic'
    },
    {
      id: 'bio',
      title: 'Professional Bio',
      description: 'Tell others about yourself',
      icon: Star,
      completed: !!(profileData.bio && profileData.bio.length > 50),
      tabTarget: 'basic'
    },
    {
      id: 'skills',
      title: 'Skills & Technologies',
      description: 'Add your technical skills',
      icon: Code,
      completed: profileData.skills.length > 0,
      tabTarget: 'skills'
    },
    {
      id: 'experience',
      title: 'Work Experience',
      description: 'Share your professional journey',
      icon: Briefcase,
      completed: !!(profileData.work_experience && profileData.work_experience.length > 0),
      tabTarget: 'experience'
    },
    {
      id: 'education',
      title: 'Education & Certifications',
      description: 'Academic and professional credentials',
      icon: GraduationCap,
      completed: !!(profileData.education && profileData.education.length > 0),
      tabTarget: 'experience'
    }
  ];

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / setupSteps.length) * 100);

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Complete Your Profile</span>
          <div className="flex items-center space-x-2">
            <Progress value={progressPercentage} className="w-24" />
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            A complete profile helps you stand out in the DevTrack Africa community and increases your visibility to potential collaborators.
          </p>
          
          <div className="grid gap-3">
            {setupSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  step.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer'
                }`}
                onClick={() => !step.completed && onTabChange(step.tabTarget)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <step.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{step.title}</span>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                
                {!step.completed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabChange(step.tabTarget);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {completedSteps === setupSteps.length && (
            <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Profile Complete!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                🎉 Excellent! Your profile is now complete and ready to attract collaborators and opportunities.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}