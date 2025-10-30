// Re-export all types for better module resolution
export * from './project';
export * from './task';
export * from './social';
export * from './analytics';
export * from './collaboration';
export * from './messaging';
export * from './template';
export * from './projectTemplate';

import type { Project } from './databaseProject';

// Ensure LegacyProject is explicitly available
export type { LegacyProject, ProjectStatus, ProjectCategory, Comment, Activity } from './project';
export type { Project };
