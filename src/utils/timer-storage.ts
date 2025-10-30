/**
 * Timer Storage Utility
 *
 * Handles persistence of active timers across browser sessions and page refreshes.
 * Provides both localStorage fallback and database synchronization when available.
 */

export interface ActiveTimer {
  taskId: string;
  startTime: number;
  projectId: string;
  taskTitle: string;
  intervalId?: number; // For cleanup purposes
}

export interface TimerSession {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  totalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

class TimerStorage {
  private static readonly STORAGE_KEY = 'devtrack_active_timers';
  private static readonly SESSION_KEY = 'devtrack_timer_sessions';

  /**
   * Save active timer to localStorage
   */
  static saveActiveTimer(timer: ActiveTimer): void {
    try {
      const timers = this.getActiveTimers();
      const existingIndex = timers.findIndex(t => t.taskId === timer.taskId);

      if (existingIndex >= 0) {
        timers[existingIndex] = timer;
      } else {
        timers.push(timer);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timers));
      console.log('💾 Active timer saved to localStorage:', timer.taskId);
    } catch (error) {
      console.warn('⚠️ Could not save active timer to localStorage:', error);
    }
  }

  /**
   * Get all active timers from localStorage
   */
  static getActiveTimers(): ActiveTimer[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const timers = JSON.parse(stored) as ActiveTimer[];
      // Filter out timers that are too old (more than 24 hours)
      const validTimers = timers.filter(timer =>
        Date.now() - timer.startTime < 24 * 60 * 60 * 1000
      );

      // Update storage if any timers were filtered out
      if (validTimers.length !== timers.length) {
        this.saveAllActiveTimers(validTimers);
      }

      return validTimers;
    } catch (error) {
      console.warn('⚠️ Could not load active timers from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a single active timer from localStorage
   */
  static getActiveTimer(taskId: string): ActiveTimer | undefined {
    return this.getActiveTimers().find(t => t.taskId === taskId);
  }

  /**
   * Remove active timer from localStorage
   */
  static removeActiveTimer(taskId: string): void {
    try {
      const timers = this.getActiveTimers();
      const filtered = timers.filter(t => t.taskId !== taskId);
      this.saveAllActiveTimers(filtered);
      console.log('💾 Active timer removed from localStorage:', taskId);
    } catch (error) {
      console.warn('⚠️ Could not remove active timer from localStorage:', error);
    }
  }

  /**
   * Clear all active timers
   */
  static clearActiveTimers(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('💾 All active timers cleared from localStorage');
    } catch (error) {
      console.warn('⚠️ Could not clear active timers from localStorage:', error);
    }
  }

  /**
   * Save all active timers (internal method)
   */
  private static saveAllActiveTimers(timers: ActiveTimer[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timers));
    } catch (error) {
      console.warn('⚠️ Could not save active timers to localStorage:', error);
    }
  }

  /**
   * Save timer session to localStorage
   */
  static saveTimerSession(session: TimerSession): void {
    try {
      const sessions = this.getTimerSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessions));
      console.log('💾 Timer session saved to localStorage:', session.id);
    } catch (error) {
      console.warn('⚠️ Could not save timer session to localStorage:', error);
    }
  }

  /**
   * Get timer sessions from localStorage
   */
  static getTimerSessions(): TimerSession[] {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as TimerSession[];
    } catch (error) {
      console.warn('⚠️ Could not load timer sessions from localStorage:', error);
      return [];
    }
  }

  /**
   * Get timer sessions for a specific task
   */
  static getTaskTimerSessions(taskId: string): TimerSession[] {
    return this.getTimerSessions().filter(s => s.taskId === taskId);
  }

  /**
   * Get timer sessions for a specific project
   */
  static getProjectTimerSessions(projectId: string): TimerSession[] {
    return this.getTimerSessions().filter(s => s.projectId === projectId);
  }

  /**
   * Calculate total time spent on a task from sessions
   */
  static getTotalTaskTime(taskId: string): number {
    return this.getTaskTimerSessions(taskId)
      .reduce((total, session) => total + session.totalMinutes, 0);
  }

  /**
   * Calculate total time spent on a project from sessions
   */
  static getTotalProjectTime(projectId: string): number {
    return this.getProjectTimerSessions(projectId)
      .reduce((total, session) => total + session.totalMinutes, 0);
  }

  /**
   * Clean up old timer sessions (older than 30 days)
   */
  static cleanupOldSessions(): void {
    try {
      const sessions = this.getTimerSessions();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      const recentSessions = sessions.filter(session =>
        new Date(session.createdAt).getTime() > thirtyDaysAgo
      );

      if (recentSessions.length !== sessions.length) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(recentSessions));
        console.log('🧹 Cleaned up old timer sessions');
      }
    } catch (error) {
      console.warn('⚠️ Could not cleanup old timer sessions:', error);
    }
  }

  /**
   * Export timer data for backup
   */
  static exportTimerData() {
    return {
      activeTimers: this.getActiveTimers(),
      sessions: this.getTimerSessions(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import timer data from backup
   */
  static importTimerData(data: { activeTimers: ActiveTimer[]; sessions: TimerSession[] }): void {
    try {
      if (data.activeTimers) {
        this.saveAllActiveTimers(data.activeTimers);
      }
      if (data.sessions) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(data.sessions));
      }
      console.log('💾 Timer data imported successfully');
    } catch (error) {
      console.warn('⚠️ Could not import timer data:', error);
    }
  }
}

// Auto-cleanup old sessions on module load
TimerStorage.cleanupOldSessions();

export default TimerStorage;
