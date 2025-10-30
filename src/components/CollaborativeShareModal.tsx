import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Users, 
  UserPlus, 
  Share, 
  CheckCircle, 
  Clock, 
  X,
  Send,
  Tag,
  Image,
  Calendar,
  Star,
  MessageSquare,
  UserCheck,
  AlertCircle,
  Instagram,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { LegacyProject as Project } from '../types/project';
import { ProjectCollaborator, CollaborativePost, CollaborativeShareRequest } from '../types/collaboration';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CollaborativeShareModalProps {
  project: Project;
  currentUserId: string;
  collaborators: ProjectCollaborator[];
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: CollaborativeShareData) => void;
  mode?: 'create' | 'invite';
  existingPost?: CollaborativePost;
}

interface CollaborativeShareData {
  title: string;
  content: string;
  images: string[];
  type: 'progress_update' | 'project_showcase' | 'milestone' | 'completion';
  tags: string[];
  isCollaborative: boolean;
  selectedCollaborators: string[];
  requireApproval: boolean;
  schedulePublish?: Date;
  isPublic: boolean;
  allowComments: boolean;
  crossPostToPlatforms: string[];
}

const POST_TYPES = [
  { 
    value: 'progress_update', 
    label: 'Progress Update', 
    description: 'Share your latest development progress',
    icon: '📈'
  },
  { 
    value: 'project_showcase', 
    label: 'Project Showcase', 
    description: 'Showcase your completed or ongoing project',
    icon: '🎨'
  },
  { 
    value: 'milestone', 
    label: 'Milestone Achievement', 
    description: 'Celebrate reaching a significant milestone',
    icon: '🎯'
  },
  { 
    value: 'completion', 
    label: 'Project Completion', 
    description: 'Announce your finished project',
    icon: '🎉'
  }
];

const DEMO_COLLABORATORS: ProjectCollaborator[] = [
  {
    id: 'collab-1',
    userId: 'user-1',
    projectId: 'demo-project',
    email: 'sarah@devtrack.africa',
    role: 'editor',
    status: 'active',
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    invitedBy: 'current-user',
    profile: {
      fullName: 'Sarah Okafor',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      title: 'UI/UX Designer',
      username: '@sarahokafor'
    }
  },
  {
    id: 'collab-2',
    userId: 'user-2',
    projectId: 'demo-project',
    email: 'john@devtrack.africa',
    role: 'admin',
    status: 'active',
    joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    invitedBy: 'current-user',
    profile: {
      fullName: 'John Adebayo',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      title: 'Backend Developer',
      username: '@johnadebayo'
    }
  },
  {
    id: 'collab-3',
    userId: 'user-3',
    projectId: 'demo-project',
    email: 'amara@devtrack.africa',
    role: 'viewer',
    status: 'active',
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    invitedBy: 'current-user',
    profile: {
      fullName: 'Amara Okonkwo',
      profilePicture: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
      title: 'Product Manager',
      username: '@amaraokonkwo'
    }
  }
];

export default function CollaborativeShareModal({
  project,
  currentUserId,
  collaborators = DEMO_COLLABORATORS,
  isOpen,
  onClose,
  onShare,
  mode = 'create',
  existingPost
}: CollaborativeShareModalProps) {
  const [shareData, setShareData] = useState<CollaborativeShareData>({
    title: '',
    content: '',
    images: [],
    type: 'progress_update',
    tags: [],
    isCollaborative: false,
    selectedCollaborators: [],
    requireApproval: true,
    isPublic: true,
    allowComments: true,
    crossPostToPlatforms: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [pendingApprovals, setPendingApprovals] = useState<{ [userId: string]: 'pending' | 'approved' | 'declined' }>({});
  const [showCollaboratorApprovals, setShowCollaboratorApprovals] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingPost) {
      setShareData({
        title: existingPost.title,
        content: existingPost.content,
        images: existingPost.images || [],
        type: existingPost.type,
        tags: existingPost.tags,
        isCollaborative: existingPost.isCollaborative,
        selectedCollaborators: existingPost.collaboratorIds,
        requireApproval: true,
        isPublic: true,
        allowComments: true,
        crossPostToPlatforms: []
      });
      setPendingApprovals(existingPost.collaboratorApprovals || {});
    } else {
      // Auto-fill project info for new posts
      setShareData(prev => ({
        ...prev,
        title: `${project.title} - ${POST_TYPES.find(t => t.value === prev.type)?.label}`,
        content: `Excited to share the latest updates on ${project.title}! 🚀\n\n${project.description}`
      }));
    }
  }, [existingPost, project]);

  const handleCollaboratorToggle = (collaboratorId: string) => {
    setShareData(prev => ({
      ...prev,
      selectedCollaborators: prev.selectedCollaborators.includes(collaboratorId)
        ? prev.selectedCollaborators.filter(id => id !== collaboratorId)
        : [...prev.selectedCollaborators, collaboratorId]
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !shareData.tags.includes(currentTag.trim())) {
      setShareData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setShareData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setShareData(prev => ({
            ...prev,
            images: [...prev.images, e.target?.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setShareData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const requestApprovalFromCollaborators = async () => {
    const selectedCollabs = collaborators.filter(c => 
      shareData.selectedCollaborators.includes(c.userId)
    );

    const approvals: { [userId: string]: 'pending' | 'approved' | 'declined' } = {};
    selectedCollabs.forEach(collab => {
      approvals[collab.userId] = 'pending';
    });

    setPendingApprovals(approvals);
    setShowCollaboratorApprovals(true);

    // Simulate sending notifications to collaborators
    alert(`Collaboration requests sent to ${selectedCollabs.length} team members!`);
  };

  const handleSubmit = async () => {
    if (!shareData.title.trim() || !shareData.content.trim()) {
      alert('Please fill in the title and content');
      return;
    }

    setIsSubmitting(true);

    try {
      if (shareData.isCollaborative && shareData.requireApproval && shareData.selectedCollaborators.length > 0) {
        await requestApprovalFromCollaborators();
      } else {
        onShare(shareData);
        onClose();
      }
    } catch (error) {
      console.error('Error creating collaborative post:', error);
      alert('Failed to create collaborative post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishAfterApprovals = () => {
    onShare({
      ...shareData,
      selectedCollaborators: Object.keys(pendingApprovals).filter(
        userId => pendingApprovals[userId] === 'approved'
      )
    });
    onClose();
  };

  const selectedCollabs = collaborators.filter(c => 
    shareData.selectedCollaborators.includes(c.userId)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Instagram className="h-5 w-5" />
            <span>
              {mode === 'invite' ? 'Invite Collaborators' : 'Share Collaborative Post'}
            </span>
          </DialogTitle>
          <DialogDescription>
            Create a collaborative post that credits all team members who contributed to this project
          </DialogDescription>
        </DialogHeader>

        {!showCollaboratorApprovals ? (
          <div className="space-y-6">
            {/* Post Type Selection */}
            <div>
              <Label className="text-base font-medium">Post Type</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {POST_TYPES.map((type) => (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      shareData.type === type.value 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setShareData(prev => ({ ...prev, type: type.value as any }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="collaborators">
                  Collaborators ({shareData.selectedCollaborators.length})
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    value={shareData.title}
                    onChange={(e) => setShareData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your post an engaging title..."
                    className="mt-1"
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Post Content</Label>
                  <Textarea
                    id="content"
                    value={shareData.content}
                    onChange={(e) => setShareData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your progress, insights, and achievements..."
                    rows={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {shareData.content.length}/2000 characters
                  </p>
                </div>

                {/* Images */}
                <div>
                  <Label>Images</Label>
                  <div className="mt-2 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                        <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload images or drag and drop
                        </p>
                      </div>
                    </label>

                    {shareData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {shareData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <ImageWithFallback
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>

                    {shareData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {shareData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                            <span>#{tag}</span>
                            <button onClick={() => removeTag(tag)}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collaborators" className="space-y-4">
                {/* Collaboration Toggle */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Enable Collaboration</Label>
                        <p className="text-sm text-muted-foreground">
                          Credit team members who contributed to this project
                        </p>
                      </div>
                      <Switch
                        checked={shareData.isCollaborative}
                        onCheckedChange={(checked) => setShareData(prev => ({ 
                          ...prev, 
                          isCollaborative: checked,
                          selectedCollaborators: checked ? prev.selectedCollaborators : []
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {shareData.isCollaborative && (
                  <>
                    {/* Require Approval Toggle */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">Require Collaborator Approval</Label>
                            <p className="text-sm text-muted-foreground">
                              Collaborators must approve before the post is published
                            </p>
                          </div>
                          <Switch
                            checked={shareData.requireApproval}
                            onCheckedChange={(checked) => setShareData(prev => ({ 
                              ...prev, 
                              requireApproval: checked
                            }))}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Collaborator Selection */}
                    <div>
                      <Label className="text-base font-medium">Select Collaborators</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose team members to credit in this post
                      </p>

                      <div className="space-y-2">
                        {collaborators.filter(c => c.status === 'active').map((collaborator) => (
                          <Card 
                            key={collaborator.id}
                            className={`cursor-pointer transition-all ${
                              shareData.selectedCollaborators.includes(collaborator.userId)
                                ? 'ring-2 ring-primary bg-primary/5'
                                : 'hover:bg-accent'
                            }`}
                            onClick={() => handleCollaboratorToggle(collaborator.userId)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <ImageWithFallback
                                      src={collaborator.profile?.profilePicture || ''}
                                      alt={collaborator.profile?.fullName || collaborator.email}
                                      fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(collaborator.profile?.fullName || collaborator.email)}&background=f0f0f0&color=333`}
                                    />
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium">
                                      {collaborator.profile?.fullName || collaborator.email}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {collaborator.profile?.title} • {collaborator.role}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Badge className={collaborator.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                                    {collaborator.role}
                                  </Badge>
                                  {shareData.selectedCollaborators.includes(collaborator.userId) && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {selectedCollabs.length > 0 && (
                        <Alert className="mt-4">
                          <Users className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{selectedCollabs.length} collaborator{selectedCollabs.length > 1 ? 's' : ''} selected:</strong>
                            {' '}
                            {selectedCollabs.map(c => c.profile?.fullName || c.email).join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Privacy & Visibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Public Post</Label>
                        <p className="text-sm text-muted-foreground">
                          Anyone can see this post in the community feed
                        </p>
                      </div>
                      <Switch
                        checked={shareData.isPublic}
                        onCheckedChange={(checked) => setShareData(prev => ({ 
                          ...prev, 
                          isPublic: checked
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Allow Comments</Label>
                        <p className="text-sm text-muted-foreground">
                          Let others comment on your post
                        </p>
                      </div>
                      <Switch
                        checked={shareData.allowComments}
                        onCheckedChange={(checked) => setShareData(prev => ({ 
                          ...prev, 
                          allowComments: checked
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cross-posting Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Share To</CardTitle>
                    <CardDescription>
                      Cross-post to other platforms (coming soon)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 opacity-50">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" disabled />
                        <Label>LinkedIn</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" disabled />
                        <Label>Twitter</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" disabled />
                        <Label>GitHub</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" disabled />
                        <Label>Dev.to</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Collaborator Approval View */
          <div className="space-y-6">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Waiting for collaborator approvals. Your post will be published once approved.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-medium">Approval Status</h3>
              {Object.entries(pendingApprovals).map(([userId, status]) => {
                const collaborator = collaborators.find(c => c.userId === userId);
                if (!collaborator) return null;

                return (
                  <Card key={userId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <ImageWithFallback
                              src={collaborator.profile?.profilePicture || ''}
                              alt={collaborator.profile?.fullName || collaborator.email}
                              fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(collaborator.profile?.fullName || collaborator.email)}&background=f0f0f0&color=333`}
                            />
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {collaborator.profile?.fullName || collaborator.email}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {collaborator.profile?.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {status === 'pending' && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600">Pending</span>
                            </>
                          )}
                          {status === 'approved' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Approved</span>
                            </>
                          )}
                          {status === 'declined' && (
                            <>
                              <X className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">Declined</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowCollaboratorApprovals(false)}>
                Back to Edit
              </Button>
              <Button 
                onClick={publishAfterApprovals}
                disabled={!Object.values(pendingApprovals).some(status => status === 'approved')}
              >
                Publish with Approved Collaborators
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {!showCollaboratorApprovals && (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !shareData.title.trim() || !shareData.content.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {shareData.isCollaborative && shareData.requireApproval ? 'Requesting Approvals...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Share className="h-4 w-4 mr-2" />
                  {shareData.isCollaborative && shareData.requireApproval ? 'Request Collaboration' : 'Publish Post'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}