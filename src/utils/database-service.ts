import { supabase, authHelpers, dbHelpers, testSupabaseConnection, getDemoMode } from './supabase/client';
import { LegacyProject, ProjectStatus, ProjectCategory } from '../types/project';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { Post } from '../types/social';
import { TaskStorage, ProjectStorage, PostStorage } from './enhanced-local-storage';
import { databaseManager, withDatabaseCheck, isDatabaseAvailable } from './database-availability-manager';

// Helper function to convert database project to frontend LegacyProject type
function mapDbProjectToProject(dbProject: DbProject): LegacyProject {
  return {
    id: dbProject.id,
    userId: dbProject.creator_id,
    title: dbProject.title,
    description: dbProject.description || '',
    category: (dbProject.category as ProjectCategory) || 'other',
    status: (dbProject.status as ProjectStatus) || 'planning',
    techStack: dbProject.tech_stack || [],
    startDate: dbProject.start_date || new Date().toISOString().split('T')[0],
    endDate: dbProject.end_date,
    githubUrl: dbProject.github_url,
    liveUrl: dbProject.live_url,
    images: dbProject.images || [],
    likes: dbProject.likes || 0,
    comments: [], // Will be populated separately if needed
    isPublic: dbProject.is_public ?? true,
    progress: dbProject.progress_percentage || 0,
    createdAt: dbProject.created_at || new Date().toISOString(),
    updatedAt: dbProject.updated_at || new Date().toISOString()
  };
}

// Helper function to convert frontend LegacyProject to database format
function mapProjectToDbProject(project: Partial<LegacyProject>, userId?: string): Partial<DbProject> {
  const dbProject: Partial<DbProject> = {
    title: project.title,
    description: project.description,
    creator_id: userId || project.userId,
    status: project.status,
    tech_stack: project.techStack,
    start_date: project.startDate,
    end_date: project.endDate,
    github_url: project.githubUrl,
    live_url: project.liveUrl,
    images: project.images,
    is_public: project.isPublic,
    progress_percentage: project.progress || 0
  };

  if (project.category) {
    dbProject.category = project.category;
  }

  return dbProject;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  title?: string;
  country?: string;
  phone?: string;
  tech_stack?: string[];
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Messaging and User Discovery Interfaces
export interface DiscoverableUser {
  id: string;
  full_name: string;
  email: string;
  title?: string;
  country?: string;
  phone?: string;
  tech_stack?: string[];
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
  projects_count?: number;
  online_status?: 'online' | 'away' | 'offline';
  last_seen?: string;
}

export interface MessagingMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
  sender_profile?: DiscoverableUser;
}

export interface MessagingConversation {
  id: string;
  participants: string[];
  last_message_at: string;
  created_at: string;
  updated_at: string;
  other_participant?: DiscoverableUser;
  last_message?: MessagingMessage;
  unread_count?: { [userId: string]: number };
}

export interface DbProject {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  tech_stack?: string[];
  timeline?: string;
  cover_image_url?: string;
  progress_percentage?: number;
  status?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  github_url?: string;
  live_url?: string;
  images?: string[];
  likes?: number;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type { LegacyProject, ProjectStatus, ProjectCategory, Comment, Activity } from '../types/project';



export interface PostAttachment {
  id: string;
  post_id: string;
  file_url: string;
  file_type: 'image' | 'document' | 'video';
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    profile_picture?: string;
    title?: string;
  };
}

export interface DbTask {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  assigned_to?: string;
  time_spent?: number;
  created_at?: string;
  completed_at?: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_hours?: number;
  position?: number;
  updated_at?: string;
  started_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'message_read' | 'message_delivered' | 'system';
  title: string;
  content?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export const convertDbPostToAppPost = (dbPost: any): Post => {
  return {
    id: dbPost.id,
    projectId: dbPost.project_id,
    authorId: dbPost.author_id,
    taskId: dbPost.task_id,
    content: dbPost.content,
    reflectionNotes: dbPost.reflection_notes,
    postType: dbPost.post_type as Post['postType'],
    attachments: dbPost.attachments || [],
    tags: dbPost.tags || [],
    viewCount: dbPost.view_count || 0,
    likeCount: dbPost.like_count?.count || 0,
    commentCount: dbPost.comment_count?.count || 0,
    createdAt: dbPost.created_at,
    updatedAt: dbPost.updated_at || dbPost.created_at,
    visibility: dbPost.visibility as 'public' | 'private',
    author: dbPost.author ? {
      id: dbPost.author.id,
      fullName: dbPost.author.full_name,
      profilePicture: dbPost.author.profile_image_url,
      title: dbPost.author.title
    } : undefined,
    project: dbPost.project ? {
      id: dbPost.project.id,
      name: dbPost.project.title,
      techStack: dbPost.project.tech_stack || []
    } : undefined,
    isLikedByCurrentUser: false,
    isCollaborative: dbPost.is_collaborative || false,
    collaborators: dbPost.collaborators || [],
    collaboratorApprovals: dbPost.collaborator_approvals || {},
    isPendingCollaboratorApproval: dbPost.is_pending_collaborator_approval || false,
    primaryAuthorId: dbPost.primary_author_id,
  };
};

// Auth functions for registration and login
export async function signUpUser(userData: {
  email: string;
  password: string;
  full_name: string;
  country: string;
  phone: string;
}): Promise<{ user: any | null; error: any | null }> {
  try {
    console.log('🔄 Registering user:', userData.email);

    const result = await authHelpers.signUp(userData.email, userData.password, {
      full_name: userData.full_name,
      country: userData.country,
      phone: userData.phone
    });

    if (result.error) {
      console.error('❌ Registration error:', result.error);
      return { user: null, error: result.error };
    }

    if (result.data?.user) {
      console.log('✅ User registered successfully');
      
      // Try to create user profile in database (non-blocking) only if database is available
      if (!getDemoMode() && isDatabaseAvailable()) {
        withDatabaseCheck(
          () => ensureUserExists(result.data.user.id, {
            email: userData.email,
            full_name: userData.full_name,
            country: userData.country,
            phone: userData.phone
          }),
          null,
          2000
        ).catch(error => {
          console.log('⚠️ Could not create user profile (non-critical):', error);
        });
      }

      return { user: result.data.user, error: null };
    }

    return { user: null, error: { message: 'Registration failed - no user created' } };
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return { 
      user: null, 
      error: { message: error instanceof Error ? error.message : 'Registration failed' }
    };
  }
}

export async function signInUser(email: string, password: string): Promise<{ user: any | null; error: any | null }> {
  try {
    console.log('🔄 Signing in user:', email);

    const result = await authHelpers.signInWithPassword(email, password);

    if (result.error) {
      console.error('❌ Login error:', result.error);
      return { user: null, error: result.error };
    }

    if (result.data?.user) {
      console.log('✅ User signed in successfully');
      return { user: result.data.user, error: null };
    }

    return { user: null, error: { message: 'Login failed - no user returned' } };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { 
      user: null, 
      error: { message: error instanceof Error ? error.message : 'Login failed' }
    };
  }
}

export async function getCurrentUser(): Promise<{ user: any | null; profile: UserProfile | null } | null> {
  try {
    if (getDemoMode()) {
      console.log('🎭 Demo mode - no current user available');
      return null;
    }

    const { data: { user }, error } = await authHelpers.getUser();
    
    if (error || !user) {
      return null;
    }

    // Try to get user profile from database only if available
    const profile = await withDatabaseCheck(
      async () => {
        const profileResult = await getUserProfile(user.id);
        return profileResult.data;
      },
      null,
      2000
    );

    return { user, profile };
  } catch (error) {
    console.log('⚠️ Get current user error (non-critical):', error);
    return null;
  }
}

// Test database connection with improved timeout and error handling
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing database connection...');
    return await databaseManager.forceCheck();
  } catch (error) {
    console.error('❌ Database connection test error:', error);
    return false;
  }
}

// Enhanced user profile creation with database availability check
export async function ensureUserExists(userId: string, userData: {
  email: string;
  full_name: string;
  country?: string;
  phone?: string;
  title?: string;
  tech_stack?: string[];
  bio?: string;
  profile_image_url?: string;
}): Promise<{ data: UserProfile | null; error: any }> {
  // If database is not available, return mock profile
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available, returning mock profile');
    return {
      data: {
        id: userId,
        email: userData.email,
        full_name: userData.full_name,
        country: userData.country,
        phone: userData.phone,
        title: userData.title,
        tech_stack: userData.tech_stack,
        bio: userData.bio,
        profile_image_url: userData.profile_image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    };
  }

  return await withDatabaseCheck(
    async () => {
      console.log('🔍 Ensuring user exists in database:', userId);
      
      // Check if user already exists
      const existingResult = await dbHelpers.query('users', async (table) => {
        const { data, error } = await table
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        return { data, error };
      });
      
      if (!existingResult.error && existingResult.data) {
        console.log('✅ User already exists in database');
        return { data: existingResult.data, error: null };
      }
      
      // Create user
      console.log('👤 Creating user profile in database');
      const createResult = await dbHelpers.query('users', async (table) => {
        const { data, error } = await table
          .insert({
            id: userId,
            email: userData.email,
            full_name: userData.full_name,
            country: userData.country,
            phone: userData.phone,
            title: userData.title,
            tech_stack: userData.tech_stack,
            bio: userData.bio,
            profile_image_url: userData.profile_image_url
          })
          .select()
          .maybeSingle();
        return { data, error };
      });

      return createResult;
    },
    {
      data: {
        id: userId,
        email: userData.email,
        full_name: userData.full_name,
        country: userData.country,
        phone: userData.phone,
        title: userData.title,
        tech_stack: userData.tech_stack,
        bio: userData.bio,
        profile_image_url: userData.profile_image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    },
    3000
  );
}

// User Management Functions
export async function createUserProfile(userData: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<{ data: UserProfile | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for user creation');
    return { data: null, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    () => dbHelpers.query('users', async (table) => {
      const { data, error } = await table
        .insert({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          title: userData.title,
          country: userData.country,
          phone: userData.phone,
          tech_stack: userData.tech_stack,
          bio: userData.bio,
          profile_image_url: userData.profile_image_url
        })
        .select()
        .maybeSingle();
      return { data, error };
    }),
    { data: null, error: 'Database not available' },
    3000
  );
}

export async function getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for user profile lookup');
    return { data: null, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    () => dbHelpers.query('users', async (table) => {
      const { data, error } = await table
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      return { data, error };
    }),
    { data: null, error: 'Database not available' },
    3000
  );
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for user profile update');
    return { data: null, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    () => dbHelpers.query('users', async (table) => {
      const { data, error } = await table
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .maybeSingle();
      return { data, error };
    }),
    { data: null, error: 'Database not available' },
    3000
  );
}

// Project Management Functions
export async function createProject(projectData: Omit<LegacyProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: LegacyProject | null; error: any; isTemporary?: boolean }> {
  if (!projectData.userId) {
    return { data: null, error: 'User ID is required to create a project.' };
  }
  // Always try local storage first as fallback
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const tempProject: LegacyProject = {
    ...projectData,
    id: tempId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    // Save to local storage immediately
    const projects = ProjectStorage.getProjects();
    projects.push(tempProject);
    ProjectStorage.saveProjects(projects);
    console.log('💾 Project saved to local storage');
  } catch (storageError) {
    console.warn('⚠️ Could not save to local storage:', storageError instanceof Error ? storageError.message : String(storageError));
  }

  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available, using local storage only');
    return { data: tempProject, error: null, isTemporary: true };
  }

  return await withDatabaseCheck(
    async () => {
      const dbProjectData = mapProjectToDbProject(projectData);
      
      const result = await dbHelpers.query('projects', async (table) => {
        const { data, error } = await table
          .insert(dbProjectData)
          .select()
          .maybeSingle();
          
        return { data, error };
      });
      
      if (result.data) {
        // Remove temporary project from local storage and replace with DB version
        try {
          const projects = ProjectStorage.getProjects().filter(p => p.id !== tempId);
          const dbProject = mapDbProjectToProject(result.data);
          projects.push(dbProject);
          ProjectStorage.saveProjects(projects);
          console.log('✅ Project created in database and local storage updated');
          return { data: dbProject, error: null };
        } catch (storageError) {
          console.warn('⚠️ Could not update local storage with DB project:', storageError instanceof Error ? storageError.message : String(storageError));
          return { data: mapDbProjectToProject(result.data), error: null };
        }
      }
      
      return { data: tempProject, error: result.error, isTemporary: true };
    },
    { data: tempProject, error: null, isTemporary: true },
    3000
  );
}

export async function getUserProjects(userId: string): Promise<{ data: LegacyProject[] | null; error: any }> {
  const localProjects = ProjectStorage.getProjects().filter(p => p.userId === userId);
  
  if (!isDatabaseAvailable()) {
    console.log(`📱 Database not available, using ${localProjects.length} local projects`);
    return { data: localProjects, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('projects', async (table) => {
        const { data, error } = await table
          .select('*')
          .eq('creator_id', userId)
          .order('created_at', { ascending: false });
          
        return { data, error };
      });
      
      if (result.data) {
        const dbProjects = result.data.map(mapDbProjectToProject);
        // Merge with local projects (temporary ones)
        const tempProjects = localProjects.filter(p => p.id.startsWith('temp-'));
        return { data: [...tempProjects, ...dbProjects], error: null };
      }
      
      return { data: localProjects, error: result.error };
    },
    { data: localProjects, error: null },
    3000
  );
}

export async function getAllPublicProjects(): Promise<{ data: LegacyProject[] | null; error: any }> {
  const localProjects = ProjectStorage.getProjects().filter(p => p.isPublic);
  
  if (!isDatabaseAvailable()) {
    console.log(`📱 Database not available, using ${localProjects.length} local public projects`);
    return { data: localProjects, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('projects', async (table) => {
        const { data, error } = await table
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(50);
          
        return { data, error };
      });
      
      if (result.data) {
        const dbProjects = result.data.map(mapDbProjectToProject);
        return { data: dbProjects, error: null };
      }
      
      return { data: localProjects, error: result.error };
    },
    { data: localProjects, error: null },
    3000
  );
}

export async function toggleProjectLike(projectId: string, userId: string): Promise<{ success: boolean; error: any; liked?: boolean }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available - like toggle not supported in offline mode');
    return { success: false, error: 'Database not available', liked: false };
  }

  return await withDatabaseCheck(
    async () => {
      // Check existing like
      const existingLike = await dbHelpers.query('project_likes', async (table) => {
        const { data, error } = await table
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle();
        return { data, error };
      });
      
      if (existingLike.data) {
        // Unlike
        const result = await dbHelpers.query('project_likes', async (table) => {
          const { error } = await table
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);
          return { error };
        });
        
        return { success: !result.error, error: result.error, liked: false };
      } else {
        // Like
        const result = await dbHelpers.query('project_likes', async (table) => {
          const { data, error } = await table
            .insert({ project_id: projectId, user_id: userId })
            .select()
            .maybeSingle();
          return { data, error };
        });
        
        return { success: !result.error, error: result.error, liked: true };
      }
    },
    { success: false, error: 'Database not available', liked: false },
    2000
  );
}

export async function updateProject(projectId: string, projectData: Partial<LegacyProject>): Promise<{ data: LegacyProject | null; error: any }> {
  // Handle temporary projects in local storage
  if (projectId.startsWith('temp-')) {
    try {
      const projects = ProjectStorage.getProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex >= 0) {
        projects[projectIndex] = { ...projects[projectIndex], ...projectData, updatedAt: new Date().toISOString() };
        ProjectStorage.saveProjects(projects);
        console.log('💾 Temporary project updated in local storage');
        return { data: projects[projectIndex], error: null };
      }
    } catch (storageError) {
      console.warn('⚠️ Could not update in local storage:', String(storageError));
    }
    return { data: null, error: 'Project not found' };
  }

  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for project update');
    return { data: null, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    async () => {
      const dbProjectData = mapProjectToDbProject(projectData);
      
      const result = await dbHelpers.query('projects', async (table) => {
        const { data, error } = await table
          .update({
            ...dbProjectData,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .select()
          .maybeSingle();
          
        return { data, error };
      });
      
      const project = result.data ? mapDbProjectToProject(result.data) : null;
      return { data: project, error: result.error };
    },
    { data: null, error: 'Database not available' },
    3000
  );
}

export async function deleteProject(projectId: string): Promise<{ success: boolean; error: any }> {
  // Handle temporary projects
  if (projectId.startsWith('temp-')) {
    try {
      const projects = ProjectStorage.getProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      ProjectStorage.saveProjects(filteredProjects);
      console.log('💾 Temporary project removed from local storage');
      return { success: true, error: null };
    } catch (storageError) {
      console.warn('⚠️ Could not remove from local storage:', storageError instanceof Error ? storageError.message : String(storageError));
      return { success: false, error: storageError };
    }
  }

  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for project deletion');
    return { success: false, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('projects', async (table) => {
        const { error } = await table
          .delete()
          .eq('id', projectId);
          
        return { error };
      });
      
      return { success: !result.error, error: result.error };
    },
    { success: false, error: 'Database not available' },
    3000
  );
}

// Task Management Functions
function mapDbTaskToTask(dbTask: DbTask): Task {
  // Ensure status is valid, default to 'todo' if invalid
  const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'completed'];
  const status = validStatuses.includes(dbTask.status as TaskStatus) 
    ? dbTask.status as TaskStatus 
    : 'todo';

  // Ensure priority is valid, default to 'medium' if invalid
  const validPriorities: TaskPriority[] = ['low', 'medium', 'high'];
  const priority = validPriorities.includes(dbTask.priority as TaskPriority) 
    ? dbTask.priority as TaskPriority 
    : 'medium';

  return {
    id: dbTask.id,
    userId: dbTask.user_id,
    projectId: dbTask.project_id,
    title: dbTask.title,
    description: dbTask.description,
    status: status,
    priority: priority,
    estimatedHours: dbTask.estimated_hours,
    timeSpentMinutes: dbTask.time_spent || 0,
    position: dbTask.position || 0,
    createdAt: dbTask.created_at || new Date().toISOString(),
    updatedAt: dbTask.updated_at || dbTask.created_at || new Date().toISOString(),
    completedAt: dbTask.completed_at,
    startedAt: dbTask.started_at
  };
}

function mapTaskToDbTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): any {
  // Validate and sanitize status
  const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'completed'];
  const status = validStatuses.includes(task.status) ? task.status : 'todo';

  // Validate and sanitize priority
  const validPriorities: TaskPriority[] = ['low', 'medium', 'high'];
  const priority = validPriorities.includes(task.priority) ? task.priority : 'medium';

  const dbTask: any = {
    user_id: task.userId,
    project_id: task.projectId,
    title: task.title,
    description: task.description,
    status: status,
    priority: priority,
    estimated_hours: task.estimatedHours,
    time_spent: task.timeSpentMinutes,
    position: task.position,
    started_at: task.startedAt
  };

  // Handle nullable timestamp fields - convert undefined to null for database
  if (task.completedAt !== undefined) {
    dbTask.completed_at = task.completedAt;
  } else {
    dbTask.completed_at = null;
  }

  return dbTask;
}

export async function getProjectTasks(projectId: string): Promise<{ data: Task[] | null; error: any }> {
  const localTasks = TaskStorage.getTasks(projectId);

  if (!isDatabaseAvailable()) {
    console.log(`📱 Database not available, using ${localTasks.length} local tasks`);
    return { data: localTasks, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('tasks', async (table) => {
        const { data, error } = await table
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true });

        return { data, error };
      });

      if (result.data) {
        const dbTasks = result.data.map((dbTask: DbTask) => mapDbTaskToTask(dbTask));
        
        // Merge DB and local tasks, preferring the version with newer updatedAt timestamp
        const dbTaskMap = new Map(dbTasks.map((t: Task) => [t.id, t]));
        const localTaskMap = new Map(localTasks.map((t: Task) => [t.id, t]));

        const allTaskIds = new Set([...dbTaskMap.keys(), ...localTaskMap.keys()]);
        const mergedTasks: Task[] = [];

        for (const taskId of allTaskIds) {
          const dbTask = dbTaskMap.get(taskId) as Task | undefined;
          const localTask = localTaskMap.get(taskId) as Task | undefined;

          if (dbTask && localTask) {
            // Both exist, compare updatedAt timestamps
            const dbUpdated = new Date(dbTask.updatedAt).getTime();
            const localUpdated = new Date(localTask.updatedAt).getTime();
            mergedTasks.push(localUpdated > dbUpdated ? localTask : dbTask);
          } else if (dbTask) {
            // Only in DB
            mergedTasks.push(dbTask);
          } else if (localTask) {
            // Only in local (non-temp, but shouldn't happen except for edge cases)
            mergedTasks.push(localTask);
          }
        }
        
        // Add temp tasks (local-only)
        const tempTasks = localTasks.filter(t => t.id.startsWith('temp-'));
        const finalTasks = [...mergedTasks, ...tempTasks];
        
        // Sort by position to maintain order
        finalTasks.sort((a, b) => (a.position || 0) - (b.position || 0));

        // Update local storage with the merged data to keep it in sync
        TaskStorage.saveTasks(projectId, finalTasks);

        return { data: finalTasks, error: null };
      }

      return { data: localTasks, error: result.error };
    },
    { data: localTasks, error: null },
    3000
  );
}

export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<{ data: Task | null; error: any }> {
  if (!userId) {
    return { data: null, error: 'User ID is required to create a task.' };
  }
  // Always try local storage first as fallback
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const tempTask: Task = {
    ...taskData,
    id: tempId,
    userId: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    // Save to local storage immediately
    const tasks = TaskStorage.getTasks(taskData.projectId);
    tasks.push(tempTask);
    TaskStorage.saveTasks(taskData.projectId, tasks);
    console.log('💾 Task saved to local storage');
  } catch (storageError) {
    console.warn('⚠️ Could not save to local storage:', storageError instanceof Error ? storageError.message : String(storageError));
  }

  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available, using local storage only');
    return { data: tempTask, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const dbTaskData = mapTaskToDbTask(taskData);
      
      const result = await dbHelpers.query('tasks', async (table) => {
        const { data, error } = await table
          .insert(dbTaskData)
          .select()
          .maybeSingle();
          
        return { data, error };
      });
      
      if (result.data) {
        // Remove temporary task from local storage and replace with DB version
        try {
          const tasks = TaskStorage.getTasks(taskData.projectId).filter(t => t.id !== tempId);
          const dbTask = mapDbTaskToTask(result.data);
          tasks.push(dbTask);
          TaskStorage.saveTasks(taskData.projectId, tasks);
          console.log('✅ Task created in database and local storage updated');
          return { data: dbTask, error: null };
        } catch (storageError) {
          console.warn('⚠️ Could not update local storage with DB task:', storageError instanceof Error ? storageError.message : String(storageError));
          return { data: mapDbTaskToTask(result.data), error: null };
        }
      }
      
      return { data: tempTask, error: result.error };
    },
    { data: tempTask, error: null },
    3000
  );
}

export async function updateTask(taskId: string, taskData: Partial<Task>, projectIdToUpdate?: string): Promise<{ data: Task | null; error: any }> {
  // Handle temporary tasks in local storage
  if (taskId.startsWith('temp-')) {
    try {
      const projectId = projectIdToUpdate || taskData.projectId!;
      const tasks = TaskStorage.getTasks(projectId!);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex >= 0) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...taskData, updatedAt: new Date().toISOString() };
        TaskStorage.saveTasks(projectId, tasks);
        console.log('💾 Temporary task updated in local storage');
        return { data: tasks[taskIndex], error: null };
      }
    } catch (storageError) {
      console.warn('⚠️ Could not update in local storage:', String(storageError));
    }
    return { data: null, error: 'Task not found' };
  }

  // Validate task data before updating
  if (taskData.status && !['todo', 'in_progress', 'completed'].includes(taskData.status)) {
    console.warn('⚠️ Invalid task status provided:', taskData.status);
    taskData.status = 'todo'; // Default to todo for invalid status
  }

  if (taskData.priority && !['low', 'medium', 'high'].includes(taskData.priority)) {
    console.warn('⚠️ Invalid task priority provided:', taskData.priority);
    taskData.priority = 'medium'; // Default to medium for invalid priority
  }

  // Always try to update local storage first as fallback
  let localTask: Task | null = null;
  try {
    if (projectIdToUpdate) {
      // Find the task in local storage to update it
      const tasks = TaskStorage.getTasks(projectIdToUpdate);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const originalTask = tasks[taskIndex];
        tasks[taskIndex] = { ...originalTask, ...taskData, updatedAt: new Date().toISOString() };
        TaskStorage.saveTasks(projectIdToUpdate, tasks);
        localTask = tasks[taskIndex];
        console.log('💾 Task updated in local storage for optimistic UI');
      } else {
        console.warn(`Could not find task ${taskId} in project ${projectIdToUpdate} for local update.`);
      }
    }
  } catch (storageError) {
    console.warn('⚠️ Could not update in local storage:', String(storageError));
  }

  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available, using local storage only');
    return { data: localTask, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      // Create partial update data - only include fields that are actually being updated
      const dbTaskData: any = {
        updated_at: new Date().toISOString()
      };

      // Map frontend field names to database field names and only include defined values
      if (taskData.status !== undefined) {
        dbTaskData.status = taskData.status;
      }

      if (taskData.priority !== undefined) {
        dbTaskData.priority = taskData.priority;
      }

      if (taskData.title !== undefined) {
        dbTaskData.title = taskData.title;
      }

      if (taskData.description !== undefined) {
        dbTaskData.description = taskData.description;
      }

      if (taskData.estimatedHours !== undefined) {
        dbTaskData.estimated_hours = taskData.estimatedHours;
      }

      if (taskData.timeSpentMinutes !== undefined) {
        dbTaskData.time_spent = taskData.timeSpentMinutes;
      }

      if (taskData.position !== undefined) {
        dbTaskData.position = taskData.position;
      }

      if (taskData.startedAt !== undefined) {
        dbTaskData.started_at = taskData.startedAt;
      }

      // Handle completedAt specially - set to null when explicitly undefined
      if (taskData.completedAt !== undefined) {
        dbTaskData.completed_at = taskData.completedAt;
      } else if (taskData.hasOwnProperty('completedAt')) {
        dbTaskData.completed_at = null;
      }

      const result = await dbHelpers.query('tasks', async (table: any) => {
        const { data, error } = await table
          .update(dbTaskData)
          .eq('id', taskId)
          .select()
          .maybeSingle();

        return { data, error };
      });

      if (result.error) {
        // Database update failed, rollback local storage changes
        if (projectIdToUpdate) {
          console.warn('Database update failed, rolling back local storage');
          try {
            // Find and revert the task in local storage
            const tasks = TaskStorage.getTasks(projectIdToUpdate);
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex >= 0) {
              // A more robust rollback would store the original task state
              // For now, we can just log the failure. The UI should handle reverting.
              console.error(`Failed to sync task ${taskId} update to database. UI should revert.`);
            }
          } catch (rollbackError) {
            console.warn('Could not rollback local storage changes:', rollbackError);
          }
        }
        return { data: null, error: result.error };
      } else if (result.data && projectIdToUpdate) {
        // Sync successful, update local storage with definitive data from DB
        const tasks = TaskStorage.getTasks(projectIdToUpdate);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          tasks[taskIndex] = mapDbTaskToTask(result.data);
          TaskStorage.saveTasks(projectIdToUpdate, tasks);
        }
      }

      const task = result.data ? mapDbTaskToTask(result.data) : localTask;

      // Log successful update with status change
      if (result.data && taskData.status) {
        console.log(`✅ Task ${taskId} status updated to: ${taskData.status}`);
      }

      return { data: task, error: null };
    },
    { data: localTask, error: null },
    3000
  );
}

export async function deleteTask(taskId: string, projectId: string): Promise<{ success: boolean; error: any }> {
  // Handle temporary tasks
  if (taskId.startsWith('temp-')) {
    try {
      const tasks = TaskStorage.getTasks(projectId);
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      TaskStorage.saveTasks(projectId, filteredTasks);
      console.log('💾 Temporary task removed from local storage');
      return { success: true, error: null };
    } catch (storageError) {
      console.warn('⚠️ Could not remove from local storage:', storageError instanceof Error ? storageError.message : String(storageError));
      return { success: false, error: storageError };
    }
  }

  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for task deletion');
    return { success: false, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('tasks', async (table) => {
        const { error } = await table
          .delete()
          .eq('id', taskId);
          
        return { error };
      });
      
      return { success: !result.error, error: result.error };
    },
    { success: false, error: 'Database not available' },
    3000
  );
}

// Social & Community Functions
export async function getPosts(): Promise<{ data: Post[] | null; error: any }> {
  const localPosts = PostStorage.getPosts();

  if (!isDatabaseAvailable()) {
    console.log(`📱 Database not available, using ${localPosts.length} local posts`);
    return { data: localPosts, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('posts', async (table) => {
        const { data, error } = await table
          .select(`
            *,
            author:users!author_id(id, full_name, profile_image_url, title),
            project:projects!project_id(id, title, tech_stack),
            like_count:post_likes(count),
            comment_count:post_comments(count)
          `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(50);

        return { data, error };
      });

      if (result.data) {
        // Convert DB posts to app format
        const dbPosts = result.data.map(convertDbPostToAppPost);

        // Merge DB and local posts, preferring the version with newer updatedAt timestamp
        const dbPostMap = new Map(dbPosts.map((p: Post) => [p.id, p]));
        const localPostMap = new Map(localPosts.map((p: Post) => [p.id, p]));

        const allPostIds = new Set([...dbPostMap.keys(), ...localPostMap.keys()]);
        const mergedPosts: Post[] = [];

        for (const postId of allPostIds) {
          const dbPost = dbPostMap.get(postId) as Post | undefined;
          const localPost = localPostMap.get(postId) as Post | undefined;

          if (dbPost && localPost) {
            // Both exist, compare updatedAt timestamps
            const dbUpdated = new Date(dbPost.updatedAt || dbPost.createdAt || '1970-01-01T00:00:00Z').getTime();
            const localUpdated = new Date(localPost.updatedAt || localPost.createdAt || '1970-01-01T00:00:00Z').getTime();
            mergedPosts.push(localUpdated > dbUpdated ? localPost : dbPost);
          } else if (dbPost) {
            // Only in DB
            mergedPosts.push(dbPost);
          } else if (localPost) {
            // Only in local (temp posts)
            mergedPosts.push(localPost);
          }
        }

        // Sort by createdAt descending
        mergedPosts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        // Update local storage with the merged data to keep it in sync
        PostStorage.savePosts(mergedPosts);

        return { data: mergedPosts, error: null };
      }

      return { data: localPosts, error: result.error };
    },
    { data: localPosts, error: null },
    3000
  );
}

export const getAllPosts = getPosts;

export async function createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Post | null; error: any }> {
  // Always try local storage first as fallback
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const tempPost: Post = {
    ...postData,
    id: tempId,
    createdAt: now,
    updatedAt: now
  };

  try {
    // Save to local storage immediately
    PostStorage.addPost(tempPost);
    console.log('💾 Post saved to local storage');
  } catch (storageError) {
    console.warn('⚠️ Could not save to local storage:', storageError instanceof Error ? storageError.message : String(storageError));
  }

  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available, using local storage only');
    return { data: tempPost, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('posts', async (table) => {
        const { data, error } = await table
          .insert({
            project_id: postData.projectId,
            author_id: postData.authorId,
            content: postData.content,
            post_type: postData.postType,
            attachments: postData.attachments,
            tags: postData.tags,
            visibility: postData.visibility || 'public',
            created_at: now,
            updated_at: now
          })
          .select()
          .maybeSingle();

        return { data, error };
      });

      if (result.data) {
        // Remove temporary post from local storage and replace with DB version
        try {
          const posts = PostStorage.getPosts().filter(p => p.id !== tempId);
          posts.push(result.data);
          PostStorage.savePosts(posts);
          console.log('✅ Post created in database and local storage updated');
          return { data: result.data, error: null };
        } catch (storageError) {
          console.warn('⚠️ Could not update local storage with DB post:', storageError instanceof Error ? storageError.message : String(storageError));
          return { data: result.data, error: null };
        }
      }

      return { data: tempPost, error: result.error };
    },
    { data: tempPost, error: null },
    3000
  );
}

// Post interaction functions
export async function togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likeCount: number; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for post likes');
    return { liked: false, likeCount: 0, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    async () => {
      // Check if like exists
      const existingLike = await dbHelpers.query('post_likes', async (table) => {
        const { data, error } = await table
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();
        return { data, error };
      });

      if (existingLike.data) {
        // Unlike
        const deleteResult = await dbHelpers.query('post_likes', async (table) => {
          const { error } = await table
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);
          return { error };
        });

        if (deleteResult.error) {
          return { liked: true, likeCount: 0, error: deleteResult.error };
        }

        // Get new count
        const countResult = await dbHelpers.query('post_likes', async (table) => {
          const { count, error } = await table
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);
          return { count, error };
        });

        return { liked: false, likeCount: countResult.count || 0, error: countResult.error };
      } else {
        // Like
        const insertResult = await dbHelpers.query('post_likes', async (table) => {
          const { data, error } = await table
            .insert({ post_id: postId, user_id: userId })
            .select()
            .maybeSingle();
          return { data, error };
        });

        if (insertResult.error) {
          return { liked: false, likeCount: 0, error: insertResult.error };
        }

        // Get new count
        const countResult = await dbHelpers.query('post_likes', async (table) => {
          const { count, error } = await table
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);
          return { count, error };
        });

        return { liked: true, likeCount: countResult.count || 0, error: countResult.error };
      }
    },
    { liked: false, likeCount: 0, error: 'Database not available' },
    2000
  );
}

export async function getPostComments(postId: string): Promise<{ data: any[] | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for post comments');
    return { data: [], error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('post_comments', async (table) => {
        const { data, error } = await table
          .select(`
            *,
            author:users!user_id(id, full_name, profile_image_url, title)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
        return { data, error };
      });

      return result;
    },
    { data: [], error: null },
    2000
  );
}

export async function createPostComment(postId: string, userId: string, content: string): Promise<{ data: any | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for creating comments');
    return { data: null, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('post_comments', async (table) => {
        const { data, error } = await table
          .insert({
            post_id: postId,
            user_id: userId,
            content: content
          })
          .select(`
            *,
            author:users!user_id(id, full_name, profile_image_url, title)
          `)
          .maybeSingle();
        return { data, error };
      });

      return result;
    },
    { data: null, error: 'Database not available' },
    2000
  );
}

// Export database manager functions
export function resetDatabaseCache(): void {
  databaseManager.reset();
  console.log('🔄 Database cache reset');
}

export function getDatabaseAvailability() {
  return databaseManager.getAvailability();
}

export function addDatabaseAvailabilityListener(listener: (availability: any) => void): void {
  databaseManager.addListener(listener);
}

export function removeDatabaseAvailabilityListener(listener: (availability: any) => void): void {
  databaseManager.removeListener(listener);
}

// Messaging Functions
export async function getUserConversations(userId: string): Promise<{ data: MessagingConversation[] | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for conversations');
    return { data: [], error: null };
  }

  return await withDatabaseCheck(
    async () => {
      console.log('🔍 Loading conversations for user:', userId);
      
      const result = await dbHelpers.query('conversations', async (table) => {
        const { data, error } = await table
          .select(`
            *,
            messages!inner(id, content, sender_id, created_at, status)
          `)
          .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
          .order('last_message_at', { ascending: false })
          .limit(50);
        
        return { data, error };
      });

      if (result.error) {
        console.error('❌ Error loading conversations:', result.error);
        return { data: null, error: result.error };
      }

      if (!result.data) {
        return { data: [], error: null };
      }

      // Process conversations to include other participant details
      const conversations = await Promise.all(
        result.data.map(async (conv: any) => {
          const otherParticipantId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
          
          let otherParticipant = null;
          if (otherParticipantId) {
            const userResult = await dbHelpers.query('users', async (table) => {
              const { data, error } = await table
                .select('id, full_name, profile_image_url, title, email, created_at')
                .eq('id', otherParticipantId)
                .maybeSingle();
              
              return { data, error };
            });
            
            if (userResult.data) {
              otherParticipant = {
                ...userResult.data,
                online_status: 'offline' as const,
                last_seen: new Date().toISOString()
              };
            }
          }

          // Get the most recent message for this conversation
          const lastMessage = conv.messages && conv.messages.length > 0 
            ? conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : null;

          return {
            id: conv.id,
            participants: [conv.participant_1, conv.participant_2],
            last_message_at: conv.last_message_at,
            created_at: conv.created_at,
            updated_at: conv.updated_at || conv.created_at,
            other_participant: otherParticipant,
            last_message: lastMessage,
            unread_count: { [userId]: 0 }
          };
        })
      );

      console.log(`✅ Loaded ${conversations.length} conversations`);
      return { data: conversations, error: null };
    },
    { data: [], error: null },
    5000
  );
}

export async function getConversationMessages(conversationId: string, limit: number = 50): Promise<{ data: MessagingMessage[] | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for messages');
    return { data: [], error: null };
  }

  return await withDatabaseCheck(
    async () => {
      console.log('📨 Loading messages for conversation:', conversationId);
      
      const result = await dbHelpers.query('messages', async (table) => {
        const { data, error } = await table
          .select(`
            *,
            sender_profile:users!sender_id(
              id,
              full_name,
              profile_image_url,
              title
            )
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(limit);
        
        return { data, error };
      });

      if (result.error) {
        console.error('❌ Error loading messages:', result.error);
        return { data: null, error: result.error };
      }

      const messages = result.data?.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        content: msg.content,
        message_type: msg.message_type || 'text',
        status: msg.status || 'sent',
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        sender_profile: msg.sender_profile
      })) || [];

      console.log(`✅ Loaded ${messages.length} messages`);
      return { data: messages, error: null };
    },
    { data: [], error: null },
    5000
  );
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  content: string
): Promise<{ data: MessagingMessage | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for sending messages');
    return { data: null, error: 'Database not available' };
  }

  return await withDatabaseCheck(
    async () => {
      console.log('📤 Sending message to conversation:', conversationId);
      
      // Create message
      const messageResult = await dbHelpers.query('messages', async (table) => {
        const { data, error } = await table
          .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            recipient_id: recipientId,
            content: content,
            message_type: 'text',
            status: 'sent'
          })
          .select(`
            *,
            sender_profile:users!sender_id(
              id,
              full_name,
              profile_image_url,
              title
            )
          `)
          .maybeSingle();
        
        return { data, error };
      });

      if (messageResult.error) {
        console.error('❌ Error sending message:', messageResult.error);
        return { data: null, error: messageResult.error };
      }

      // Update conversation last_message_at
      if (messageResult.data) {
        await dbHelpers.query('conversations', async (table) => {
          const { error } = await table
            .update({ 
              last_message_at: messageResult.data.created_at,
              updated_at: new Date().toISOString()
            })
            .eq('id', conversationId);
          
          return { error };
        });

        const message = {
          id: messageResult.data.id,
          conversation_id: messageResult.data.conversation_id,
          sender_id: messageResult.data.sender_id,
          recipient_id: messageResult.data.recipient_id,
          content: messageResult.data.content,
          message_type: messageResult.data.message_type || 'text',
          status: messageResult.data.status || 'sent',
          created_at: messageResult.data.created_at,
          updated_at: messageResult.data.updated_at,
          sender_profile: messageResult.data.sender_profile
        };

        console.log('✅ Message sent successfully');
        return { data: message, error: null };
      }

      return { data: null, error: 'Failed to create message' };
    },
    { data: null, error: 'Database not available' },
    5000
  );
}

export async function createConversation(
  participantIds: string[],
  initiatorId: string
): Promise<{ data: MessagingConversation | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for creating conversations');
    return { data: null, error: 'Database not available' };
  }

  if (participantIds.length !== 2) {
    return { data: null, error: 'Exactly two participants required' };
  }

  return await withDatabaseCheck(
    async () => {
      console.log('💬 Creating conversation between:', participantIds);
      
      const [participant1, participant2] = participantIds.sort(); // Sort for consistent ordering
      
      // Check if conversation already exists (check both orderings)
      const existingResult = await dbHelpers.query('conversations', async (table) => {
        const { data, error } = await table
          .select('*')
          .or(`and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`)
          .maybeSingle();
        
        return { data, error };
      });

      if (existingResult.data) {
        console.log('✅ Conversation already exists');
        return { 
          data: {
            id: existingResult.data.id,
            participants: [existingResult.data.participant_1, existingResult.data.participant_2],
            last_message_at: existingResult.data.last_message_at,
            created_at: existingResult.data.created_at,
            updated_at: existingResult.data.updated_at || existingResult.data.created_at
          }, 
          error: null 
        };
      }

      // Create new conversation
      const createResult = await dbHelpers.query('conversations', async (table) => {
        const { data, error } = await table
          .insert({
            participant_1: participant1,
            participant_2: participant2,
            last_message_at: new Date().toISOString()
          })
          .select()
          .maybeSingle();
        
        return { data, error };
      });

      if (createResult.error) {
        console.error('❌ Error creating conversation:', createResult.error);
        return { data: null, error: createResult.error };
      }

      const conversation = {
        id: createResult.data.id,
        participants: [createResult.data.participant_1, createResult.data.participant_2],
        last_message_at: createResult.data.last_message_at,
        created_at: createResult.data.created_at,
        updated_at: createResult.data.updated_at || createResult.data.created_at
      };

      console.log('✅ Conversation created successfully');
      return { data: conversation, error: null };
    },
    { data: null, error: 'Database not available' },
    5000
  );
}

// User discovery functions
export async function getAllUsers(currentUserId: string, limit: number = 50): Promise<{ data: DiscoverableUser[] | null; error: any }> {
  return getDiscoverableUsers(currentUserId, undefined, undefined, limit);
}

export async function searchUsers(
  currentUserId: string,
  searchQuery: string,
  userType?: 'developer' | 'recruiter',
  limit: number = 20
): Promise<{ data: DiscoverableUser[] | null; error: any }> {
  return getDiscoverableUsers(currentUserId, userType, searchQuery, limit);
}

export async function getDiscoverableUsers(
  currentUserId: string,
  userType?: 'developer' | 'recruiter',
  searchQuery?: string,
  limit: number = 20
): Promise<{ data: DiscoverableUser[] | null; error: any }> {
  if (!isDatabaseAvailable()) {
    console.log('📱 Database not available for user discovery');
    return { data: [], error: null };
  }

  return await withDatabaseCheck(
    async () => {
      console.log('🔍 Discovering users...');
      
      let query = dbHelpers.query('users', async (table) => {
        let baseQuery = table
          .select(`
            id,
            full_name,
            email,
            title,
            country,
            phone,
            tech_stack,
            bio,
            profile_image_url,
            created_at,
            updated_at
          `)
          .neq('id', currentUserId);

        if (searchQuery) {
          baseQuery = baseQuery.or(`full_name.ilike.%${searchQuery}%, email.ilike.%${searchQuery}%, title.ilike.%${searchQuery}%`);
        }

        if (userType) {
          if (userType === 'recruiter') {
            baseQuery = baseQuery.ilike('title', '%recruit%');
          } else {
            baseQuery = baseQuery.not('title', 'ilike', '%recruit%');
          }
        }

        const { data, error } = await baseQuery
          .order('created_at', { ascending: false })
          .limit(limit);
        
        return { data, error };
      });

      const result = await query;

      if (result.error) {
        console.error('❌ Error discovering users:', result.error);
        return { data: null, error: result.error };
      }

      // Get project counts for each user
      const users = await Promise.all(
        (result.data || []).map(async (user: any) => {
          const projectCountResult = await dbHelpers.query('projects', async (table: any) => {
            const { count, error } = await table
              .select('*', { count: 'exact', head: true })
              .eq('creator_id', user.id as string);

            return { count, error };
          });

          return {
            ...user,
            projects_count: projectCountResult.count || 0,
            online_status: 'offline' as const,
            last_seen: new Date().toISOString()
          };
        })
      );

      console.log(`✅ Discovered ${users.length} users`);
      return { data: users, error: null };
    },
    { data: [], error: null },
    5000
  );
}