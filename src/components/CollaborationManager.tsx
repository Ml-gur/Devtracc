import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  UserPlus, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Crown,
  Trash2,
  Settings,
  Send,
  Share2,
  Instagram,
  Handshake,
  MessageSquare,
  Globe,
  Star
} from 'lucide-react';
import { LegacyProject as Project } from '../types/project';
import { supabase, getDemoMode } from '../utils/supabase/client';
import CollaborativeShareModal from './CollaborativeShareModal';
import CollaborationInviteManager from './CollaborationInviteManager';
import { ProjectCollaborator, CollaborationInviteRequest } from '../types/collaboration';

interface Collaborator {
  id: string;
  userId: string;
  projectId: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'declined';
  joinedAt: string;
  profile?: {
    fullName: string;
    profilePicture?: string;
    title?: string;
  };
}

interface Invitation {
  id: string;
  projectId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

interface CollaborationManagerProps {
  project: Project;
  currentUserId: string;
  onCollaboratorChange?: () => void;
}

export default function CollaborationManager({ 
  project, 
  currentUserId,
  onCollaboratorChange 
}: CollaborationManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteManager, setShowInviteManager] = useState(false);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationInviteRequest[]>([]);

  useEffect(() => {
    loadCollaborationData();
  }, [project.id]);

  const loadCollaborationData = async () => {
    setLoading(true);
    
    if (getDemoMode()) {
      // Demo data for collaboration
      const demoCollaborators: Collaborator[] = [
        {
          id: 'demo-collab-1',
          userId: currentUserId,
          projectId: project.id,
          email: 'owner@example.com',
          role: 'owner',
          status: 'active',
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          profile: {
            fullName: 'Project Owner',
            title: 'Lead Developer'
          }
        },
        {
          id: 'demo-collab-2',
          userId: 'demo-user-2',
          projectId: project.id,
          email: 'john@devtrack.com',
          role: 'editor',
          status: 'active',
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          profile: {
            fullName: 'John Doe',
            title: 'Frontend Developer'
          }
        },
        {
          id: 'demo-collab-3',
          userId: 'demo-user-3',
          projectId: project.id,
          email: 'sarah@devtrack.com',
          role: 'viewer',
          status: 'pending',
          joinedAt: new Date().toISOString(),
          profile: {
            fullName: 'Sarah Wilson',
            title: 'UI Designer'
          }
        }
      ];

      const demoInvitations: Invitation[] = [
        {
          id: 'demo-invite-1',
          projectId: project.id,
          email: 'newdev@devtrack.com',
          role: 'editor',
          status: 'pending',
          invitedBy: currentUserId,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setCollaborators(demoCollaborators);
      setInvitations(demoInvitations);
      setLoading(false);
      return;
    }

    try {
      // In a real implementation, these would load from Supabase
      // For now, show placeholder data
      setCollaborators([
        {
          id: 'owner-1',
          userId: currentUserId,
          projectId: project.id,
          email: 'you@example.com',
          role: 'owner',
          status: 'active',
          joinedAt: project.createdAt,
          profile: {
            fullName: 'You',
            title: 'Project Owner'
          }
        }
      ]);
      setInvitations([]);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    
    try {
      if (getDemoMode()) {
        // Demo invitation
        const newInvitation: Invitation = {
          id: `demo-invite-${Date.now()}`,
          projectId: project.id,
          email: inviteEmail,
          role: inviteRole,
          status: 'pending',
          invitedBy: currentUserId,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        setInvitations(prev => [...prev, newInvitation]);
        setInviteEmail('');
        
        // Simulate email being sent
        alert(`Demo: Invitation sent to ${inviteEmail} with ${inviteRole} role!`);
        return;
      }

      // Real implementation would:
      // 1. Insert invitation into database
      // 2. Send email via Supabase Edge Function
      // 3. Update local state

      const invitationData = {
        project_id: project.id,
        email: inviteEmail,
        role: inviteRole,
        invited_by: currentUserId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // This would be the actual Supabase call:
      // const { data, error } = await supabase
      //   .from('project_invitations')
      //   .insert(invitationData)
      //   .select();

      // For now, just show success message
      alert(`Invitation would be sent to ${inviteEmail} in production!`);
      setInviteEmail('');

    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;

    try {
      if (getDemoMode()) {
        setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
        return;
      }

      // Real implementation would remove from database
      // const { error } = await supabase
      //   .from('project_collaborators')
      //   .delete()
      //   .eq('id', collaboratorId);

      alert('Collaborator would be removed in production!');
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const updateCollaboratorRole = async (collaboratorId: string, newRole: string) => {
    try {
      if (getDemoMode()) {
        setCollaborators(prev => 
          prev.map(c => c.id === collaboratorId ? { ...c, role: newRole as any } : c)
        );
        return;
      }

      // Real implementation would update in database
      alert(`Role would be updated to ${newRole} in production!`);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleInvitesSent = (invites: CollaborationInviteRequest[]) => {
    setCollaborationRequests(prev => [...prev, ...invites]);
    console.log(`${invites.length} collaboration invites sent!`);
  };

  const handleCollaborativeShare = (shareData: any) => {
    console.log('Creating collaborative post:', shareData);
    // This would create a collaborative post with selected collaborators
    alert('Collaborative post created! All selected collaborators will be credited.');
  };

  const isOwner = collaborators.some(c => c.userId === currentUserId && c.role === 'owner');
  const canManageCollaborators = isOwner || collaborators.some(c => 
    c.userId === currentUserId && (c.role === 'admin' || c.role === 'owner')
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading collaboration data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Project Collaboration
          </CardTitle>
          <CardDescription>
            Manage team members and control access to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Actions */}
          {canManageCollaborators && (
            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-accent/50 rounded-lg">
              <Button
                onClick={() => setShowInviteManager(true)}
                className="flex items-center space-x-2"
              >
                <Handshake className="h-4 w-4" />
                <span>Find Collaborators</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2"
              >
                <Instagram className="h-4 w-4" />
                <span>Collaborative Post</span>
              </Button>

              {collaborators.length > 1 && (
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Globe className="h-4 w-4" />
                  <span>Share Project</span>
                </Button>
              )}
            </div>
          )}

          <Tabs defaultValue="collaborators" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collaborators">
                Team Members ({collaborators.length})
              </TabsTrigger>
              <TabsTrigger value="invitations">
                Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="requests">
                Collaboration Requests ({collaborationRequests.filter(r => r.status === 'pending').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collaborators" className="space-y-4">
              {/* Add New Collaborator */}
              {canManageCollaborators && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Invite New Collaborator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        type="email"
                        className="flex-1"
                      />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as any)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button 
                        onClick={sendInvitation}
                        disabled={isInviting || !inviteEmail.trim()}
                        className="gap-2"
                      >
                        {isInviting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Invite
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <strong>Role Permissions:</strong>
                      <ul className="mt-2 space-y-1 ml-4">
                        <li>• <strong>Viewer:</strong> Can view project and tasks</li>
                        <li>• <strong>Editor:</strong> Can create, edit, and manage tasks</li>
                        <li>• <strong>Admin:</strong> Can invite others and manage project settings</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Collaborators List */}
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <img
                              src={collaborator.profile?.profilePicture || 
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(collaborator.profile?.fullName || collaborator.email)}&background=f0f0f0&color=333`}
                              alt={collaborator.profile?.fullName || collaborator.email}
                            />
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {collaborator.profile?.fullName || collaborator.email}
                              </span>
                              {collaborator.role === 'owner' && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                              {getStatusIcon(collaborator.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {collaborator.profile?.title || collaborator.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={getRoleColor(collaborator.role)}>
                            {collaborator.role}
                          </Badge>
                          
                          {canManageCollaborators && collaborator.role !== 'owner' && (
                            <div className="flex gap-2">
                              <select
                                value={collaborator.role}
                                onChange={(e) => updateCollaboratorRole(collaborator.id, e.target.value)}
                                className="text-sm px-2 py-1 border rounded"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                              </select>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCollaborator(collaborator.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              {invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No pending invitations</h3>
                  <p className="text-sm text-muted-foreground">
                    All team members have been added to the project
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{invitation.email}</span>
                              <Badge variant={invitation.status === 'pending' ? 'secondary' : 'outline'}>
                                {invitation.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Invited as {invitation.role} • Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                            </div>
                          </div>

                          {canManageCollaborators && invitation.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setInvitations(prev => prev.filter(i => i.id !== invitation.id));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {collaborationRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No collaboration requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Use "Find Collaborators" to invite talented developers
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collaborationRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Collaboration Request</span>
                              <Badge variant={request.status === 'pending' ? 'secondary' : 'outline'}>
                                {request.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Sent to developer • Expires {new Date(request.expiresAt).toLocaleDateString()}
                            </div>
                            {request.message && (
                              <div className="text-sm mt-2 p-2 bg-muted rounded">
                                "{request.message.slice(0, 100)}..."
                              </div>
                            )}
                          </div>

                          {canManageCollaborators && request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCollaborationRequests(prev => prev.filter(r => r.id !== request.id));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Collaboration Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Collaboration Impact</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{collaborators.length}</div>
              <div className="text-xs text-muted-foreground">Team Members</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">12</div>
              <div className="text-xs text-muted-foreground">Collaborative Posts</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <Instagram className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">3.2K</div>
              <div className="text-xs text-muted-foreground">Total Reach</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <Globe className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">156</div>
              <div className="text-xs text-muted-foreground">Community Likes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Info */}
      <Alert>
        <Instagram className="h-4 w-4" />
        <AlertDescription>
          <strong>Instagram-Style Collaboration:</strong> Create collaborative posts that credit all team members, 
          find and invite talented developers, and share your project progress with proper attribution. 
          All collaborators get credited when you share updates to the community.
        </AlertDescription>
      </Alert>

      {/* Modals */}
      <CollaborativeShareModal
        project={project}
        currentUserId={currentUserId}
        collaborators={collaborators.map(c => ({
          ...c,
          profile: c.profile || { fullName: c.email }
        } as ProjectCollaborator))}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleCollaborativeShare}
      />

      <CollaborationInviteManager
        project={project}
        currentUserId={currentUserId}
        onInvitesSent={handleInvitesSent}
        isOpen={showInviteManager}
        onClose={() => setShowInviteManager(false)}
      />
    </div>
  );
}