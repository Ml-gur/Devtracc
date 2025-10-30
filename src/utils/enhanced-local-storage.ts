/**
 * Enhanced Local Storage Utility
 * Provides robust local storage with error handling and data validation
 */

interface StorageItem<T> {
  data: T;
  timestamp: string;
  version: string;
}

class EnhancedLocalStorage {
  private static readonly VERSION = '1.0.0';
  private static readonly PREFIX = 'devtrack_';

  /**
   * Safely get an item from localStorage
   */
  static get<T>(key: string, defaultValue: T): T {
    try {
      const fullKey = this.PREFIX + key;
      const item = localStorage.getItem(fullKey);

      if (!item) {
        return defaultValue;
      }

      const parsed: StorageItem<T> = JSON.parse(item);

      // Validate storage item structure
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        console.warn(`Invalid storage item for key: ${key}`);
        return defaultValue;
      }

      return parsed.data;
    } catch (error) {
      console.warn(`Error reading from localStorage for key: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set an item in localStorage
   */
  static set<T>(key: string, value: T): boolean {
    try {
      const fullKey = this.PREFIX + key;
      const storageItem: StorageItem<T> = {
        data: value,
        timestamp: new Date().toISOString(),
        version: this.VERSION
      };

      localStorage.setItem(fullKey, JSON.stringify(storageItem));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage
   */
  static remove(key: string): boolean {
    try {
      const fullKey = this.PREFIX + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.warn(`Error removing from localStorage for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all DevTrack-related items from localStorage
   */
  static clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = this.PREFIX + 'test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage info for debugging
   */
  static getInfo(): { available: boolean; itemCount: number; totalSize: number } {
    const available = this.isAvailable();
    let itemCount = 0;
    let totalSize = 0;

    if (available) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.PREFIX)) {
            itemCount++;
            const item = localStorage.getItem(key);
            if (item) {
              totalSize += item.length;
            }
          }
        });
      } catch (error) {
        console.warn('Error getting storage info', error);
      }
    }

    return { available, itemCount, totalSize };
  }
}

// Project-specific storage functions
export class ProjectStorage {
  private static readonly PROJECTS_KEY = 'projects';

  static getProjects(): any[] {
    if (!EnhancedLocalStorage.isAvailable()) {
      console.warn('localStorage not available');
      return [];
    }

    const projects = EnhancedLocalStorage.get(this.PROJECTS_KEY, []);
    return Array.isArray(projects) ? projects : [];
  }

  static saveProjects(projects: any[]): boolean {
    if (!EnhancedLocalStorage.isAvailable()) {
      console.warn('localStorage not available');
      return false;
    }

    return EnhancedLocalStorage.set(this.PROJECTS_KEY, projects);
  }

  static addProject(project: any): boolean {
    const projects = this.getProjects();
    projects.push(project);
    return this.saveProjects(projects);
  }

  static updateProject(projectId: string, updates: any): boolean {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === projectId);

    if (index >= 0) {
      projects[index] = { ...projects[index], ...updates };
      return this.saveProjects(projects);
    }

    return false;
  }

  static removeProject(projectId: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    return this.saveProjects(filtered);
  }

  static getProjectById(projectId: string): any | null {
    const projects = this.getProjects();
    return projects.find(p => p.id === projectId) || null;
  }
}

// Task-specific storage functions
export class TaskStorage {
  static getTasks(projectId: string): any[] {
    if (!EnhancedLocalStorage.isAvailable()) {
      console.warn('localStorage not available');
      return [];
    }

    const key = `tasks_${projectId}`;
    const tasks = EnhancedLocalStorage.get(key, []);
    return Array.isArray(tasks) ? tasks : [];
  }

  static saveTasks(projectId: string, tasks: any[]): boolean {
    if (!EnhancedLocalStorage.isAvailable()) {
      console.warn('localStorage not available');
      return false;
    }

    const key = `tasks_${projectId}`;
    return EnhancedLocalStorage.set(key, tasks);
  }

  static addTask(projectId: string, task: any): boolean {
    const tasks = this.getTasks(projectId);
    tasks.push(task);
    return this.saveTasks(projectId, tasks);
  }

  static updateTask(projectId: string, taskId: string, updates: any): boolean {
    const tasks = this.getTasks(projectId);
    const index = tasks.findIndex(t => t.id === taskId);

    if (index >= 0) {
      tasks[index] = { ...tasks[index], ...updates };
      return this.saveTasks(projectId, tasks);
    }

    return false;
  }

  static removeTask(projectId: string, taskId: string): boolean {
    const tasks = this.getTasks(projectId);
    const filtered = tasks.filter(t => t.id !== taskId);
    return this.saveTasks(projectId, tasks);
  }
}

// Post-specific storage functions
export class PostStorage {
  private static readonly POSTS_KEY = 'posts';

  static getPosts(): any[] {
    if (!EnhancedLocalStorage.isAvailable()) {
      console.warn('localStorage not available');
      return [];
    }

    const posts = EnhancedLocalStorage.get(this.POSTS_KEY, []);
    return Array.isArray(posts) ? posts : [];
  }

  static savePosts(posts: any[]): boolean {
    if (!EnhancedLocalStorage.isAvailable()) {
      console.warn('localStorage not available');
      return false;
    }

    return EnhancedLocalStorage.set(this.POSTS_KEY, posts);
  }

  static addPost(post: any): boolean {
    const posts = this.getPosts();
    posts.push(post);
    return this.savePosts(posts);
  }

  static updatePost(postId: string, updates: any): boolean {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);

    if (index >= 0) {
      posts[index] = { ...posts[index], ...updates };
      return this.savePosts(posts);
    }

    return false;
  }

  static removePost(postId: string): boolean {
    const posts = this.getPosts();
    const filtered = posts.filter(p => p.id !== postId);
    return this.savePosts(filtered);
  }

  static getPostById(postId: string): any | null {
    const posts = this.getPosts();
    return posts.find(p => p.id === postId) || null;
  }
}

// User preferences storage
export class UserPreferencesStorage {
  private static readonly PREFERENCES_KEY = 'user_preferences';

  static getPreferences(): any {
    return EnhancedLocalStorage.get(this.PREFERENCES_KEY, {});
  }

  static savePreferences(preferences: any): boolean {
    return EnhancedLocalStorage.set(this.PREFERENCES_KEY, preferences);
  }

  static getPreference(key: string, defaultValue: any = null): any {
    const preferences = this.getPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  static setPreference(key: string, value: any): boolean {
    const preferences = this.getPreferences();
    preferences[key] = value;
    return this.savePreferences(preferences);
  }
}

// Debug function to check storage status
export function debugStorage(): void {
  console.log('🔍 Storage Debug Info:');
  const info = EnhancedLocalStorage.getInfo();
  console.log('- Available:', info.available);
  console.log('- DevTrack Items:', info.itemCount);
  console.log('- Total Size (chars):', info.totalSize);

  if (info.available) {
    const projects = ProjectStorage.getProjects();
    console.log('- Projects Count:', projects.length);

    // Show sample project if exists
    if (projects.length > 0) {
      const sample = projects[0];
      console.log('- Sample Project:', {
        id: sample.id,
        title: sample.title,
        createdAt: sample.createdAt
      });
    }
  }
}

// Export the enhanced localStorage class for advanced usage
export { EnhancedLocalStorage };
