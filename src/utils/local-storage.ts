/**
 * DEPRECATED: Local Storage Utilities
 * 
 * This file has been deprecated as DevTrack Africa now operates as a fully online application.
 * All data persistence is handled through Supabase database connections.
 * 
 * This file is kept for reference but should not be used in the application.
 * All functions return empty/default values to prevent runtime errors.
 */

// Export empty interfaces to prevent build errors
export class TaskStorage {
  static getAllTasks() { return {}; }
  static getTasks() { return []; }
  static saveTasks() { return false; }
  static getProjectTasks() { return []; }
  static saveTask() { return false; }
  static updateTask() { return false; }
  static deleteTask() { return false; }
  static bulkUpdateTasks() { return false; }
  static clearProjectTasks() { return false; }
  static clearAllTasks() { return false; }
  static getSyncQueue() { return []; }
  static clearSyncQueue() { return false; }
  static removeSyncItem() { return false; }
}

export class ProjectStorage {
  static getAllProjects() { return []; }
  static getProjects() { return []; }
  static saveProjects() { return false; }
  static saveProject() { return false; }
  static updateProject() { return false; }
  static deleteProject() { return false; }
  static clearAllProjects() { return false; }
}

export class UserPreferences {
  static getPreference(key: string, defaultValue: any) { return defaultValue; }
  static setPreference() { return false; }
  static clearPreferences() { return false; }
}

export class StorageUtils {
  static getStorageUsage() { return { used: 0, available: 0, percentage: 0 }; }
  static isStorageAvailable() { return false; }
  static clearDevTrackData() { return false; }
  static exportData() { return { tasks: {}, projects: [], preferences: {}, syncQueue: [] }; }
  static importData() { return false; }
}

export default {
  TaskStorage,
  ProjectStorage,
  UserPreferences,
  StorageUtils
};