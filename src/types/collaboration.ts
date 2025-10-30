export interface TeamMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
  invitedBy: string;
  isActive: boolean;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  assigneeId: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  status: 'pending' | 'accepted' | 'completed';
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  inviteeEmail: string;
  inviterId: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  inviteCode: string;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityFeed {
  id: string;
  userId: string;
  projectId: string;
  activityType: 'task_created' | 'task_completed' | 'task_assigned' | 'comment_added' | 'member_joined' | 'project_updated';
  entityId: string; // task id, comment id, etc.
  description: string;
  metadata?: { [key: string]: any };
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId?: string;
  postId?: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCollaborator {
  id: string;
  userId: string;
  projectId: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'declined';
  joinedAt: string;
  invitedBy: string;
  profile?: {
    fullName: string;
    profilePicture?: string;
    title?: string;
    username?: string;
  };
}

export interface CollaborativePost {
  id: string;
  projectId: string;
  primaryAuthorId: string;
  collaboratorIds: string[];
  title: string;
  content: string;
  images?: string[];
  type: 'progress_update' | 'project_showcase' | 'milestone' | 'completion';
  tags: string[];
  isCollaborative: boolean;
  collaboratorApprovals: { [userId: string]: 'pending' | 'approved' | 'declined' };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationInviteRequest {
  id: string;
  projectId: string;
  requesterId: string;
  targetUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface CollaborativeShareRequest {
  id: string;
  postId: string;
  projectId: string;
  requesterId: string;
  targetCollaboratorIds: string[];
  message?: string;
  postType: 'progress_update' | 'project_showcase' | 'milestone' | 'completion';
  status: 'pending' | 'approved' | 'published' | 'declined';
  approvals: { [userId: string]: 'pending' | 'approved' | 'declined' };
  createdAt: string;
  scheduledPublishAt?: string;
}