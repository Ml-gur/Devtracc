export interface Post {
  id: string;
  projectId?: string;
  authorId: string;
  taskId?: string;
  content: string;
  reflectionNotes?: string;
  postType: 'progress_update' | 'task_completed' | 'help_request' | 'project_showcase' | 'milestone' | 'completion' | 'project_share' | 'challenge';
  attachments: PostAttachment[];
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  visibility: 'public' | 'private';
  author?: {
    id: string;
    fullName: string;
    profilePicture?: string;
    title?: string;
  };
  project?: {
    id: string;
    name: string;
    techStack: string[];
  };
  isLikedByCurrentUser?: boolean;
  // Collaboration features
  isCollaborative?: boolean;
  collaborators?: Array<{
    id: string;
    userId: string;
    fullName: string;
    profilePicture?: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
  }>;
  collaboratorApprovals?: { [userId: string]: 'pending' | 'approved' | 'declined' };
  isPendingCollaboratorApproval?: boolean;
  primaryAuthorId?: string;
}

export interface PostAttachment {
  id: string;
  postId: string;
  fileUrl: string;
  fileType: 'image' | 'document' | 'video';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface PostView {
  id: string;
  postId: string;
  viewerId: string;
  viewedAt: string;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface FeedFilter {
  postType?: 'progress_update' | 'task_completed' | 'help_request' | 'milestone' | 'launch' | 'demo' | 'achievement' | 'showcase' | 'tutorial' | 'feedback' | 'all';
  techStack?: string[];
  timeframe?: 'today' | 'week' | 'month' | 'all';
  following?: boolean;
  tags?: string[];
  category?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  sortBy?: 'recent' | 'popular' | 'trending' | 'most-liked' | 'most-commented';
  country?: string;
  hasDemo?: boolean;
  hasGithub?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filter: FeedFilter;
  isDefault?: boolean;
}

export interface CommunityStats {
  totalPosts: number;
  totalMembers: number;
  activeToday: number;
  projectsShared: number;
  helpRequestsAnswered: number;
  topTags: { tag: string; count: number }[];
  topCountries: { country: string; count: number }[];
}

export interface PostInteraction {
  id: string;
  postId: string;
  userId: string;
  type: 'like' | 'comment' | 'share' | 'bookmark';
  createdAt: string;
}

export interface TrendingProject {
  projectId: string;
  projectName: string;
  authorName: string;
  authorId: string;
  techStack: string[];
  recentPostCount: number;
  totalViews: number;
  totalLikes: number;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    profilePicture?: string;
    title?: string;
  };
}
