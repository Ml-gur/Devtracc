export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

export type ProjectCategory = 'web-app' | 'mobile-app' | 'api' | 'library' | 'game' | 'ai-ml' | 'blockchain' | 'other';

// Main Project interface - properly exported
export interface LegacyProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  techStack: string[];
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  images: string[];
  likes: number;
  comments: Comment[];
  isPublic: boolean;
  progress?: number; // Progress percentage 0-100
  createdAt: string;
  updatedAt: string;
  // Collaboration features
  isCollaborative?: boolean;
  collaboratorIds?: string[];
  collaborators?: Array<{
    id: string;
    userId: string;
    fullName: string;
    profilePicture?: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joinedAt: string;
  }>;
  allowCollaborationRequests?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  projectId: string;
  content: string;
  createdAt: string;
  user: {
    fullName: string;
    profilePicture?: string;
  };
}

export interface Activity {
  id: string;
  userId: string;
  type: 'project_created' | 'project_updated' | 'project_completed' | 'comment_added' | 'like_added';
  projectId?: string;
  content: string;
  createdAt: string;
  user: {
    fullName: string;
    profilePicture?: string;
  };
}
