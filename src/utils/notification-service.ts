import { supabase, hasSupabaseConfig } from './supabase/client';

export interface NotificationData {
  user_id: string;
  type: 'new_message' | 'post_comment' | 'post_like' | 'collaboration_invite' | 'collaboration_request' | 'project_shared' | 'mention' | 'connection_request';
  title: string;
  content?: string;
  related_id?: string;
  related_data?: {
    sender_id?: string;
    sender_name?: string;
    sender_picture?: string;
    conversation_id?: string;
    post_id?: string;
    project_id?: string;
    message_preview?: string;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private subscribers: ((notification: NotificationData) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Subscribe to real-time notifications
  subscribe(callback: (notification: NotificationData) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Emit notification to all subscribers
  private emit(notification: NotificationData) {
    this.subscribers.forEach(callback => callback(notification));
  }

  // Create a new notification
  async createNotification(data: NotificationData): Promise<boolean> {
    try {
      if (hasSupabaseConfig()) {
        // Save to Supabase
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: data.user_id,
            type: data.type,
            title: data.title,
            content: data.content,
            related_id: data.related_id,
            related_data: data.related_data,
            is_read: false,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating notification:', error);
          // Fall back to local notification
          this.emit(data);
          return false;
        }
      } else {
        // Emit locally for demo mode
        this.emit(data);
      }

      // Show browser notification if permission granted
      await this.showBrowserNotification(data);

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      // Still emit locally as fallback
      this.emit(data);
      return false;
    }
  }

  // Show browser notification
  private async showBrowserNotification(data: NotificationData) {
    if (!('Notification' in window)) {
      return;
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.content,
        icon: data.related_data?.sender_picture || '/favicon.ico',
        tag: `${data.type}-${data.related_id}`,
        badge: '/favicon.ico',
        requireInteraction: false,
        silent: false
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Custom navigation logic can be added here
        this.handleNotificationClick(data);
      };
    }
  }

  // Handle notification click
  private handleNotificationClick(data: NotificationData) {
    // Emit click event that components can listen to
    const event = new CustomEvent('notificationClick', { detail: data });
    window.dispatchEvent(event);
  }

  // Bulk create notifications for multiple users
  async createBulkNotifications(notifications: NotificationData[]): Promise<boolean> {
    try {
      if (hasSupabaseConfig()) {
        const notificationRows = notifications.map(data => ({
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          content: data.content,
          related_id: data.related_id,
          related_data: data.related_data,
          is_read: false,
          created_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('notifications')
          .insert(notificationRows);

        if (error) {
          console.error('Error creating bulk notifications:', error);
          return false;
        }
      } else {
        // Emit locally for demo mode
        notifications.forEach(notification => this.emit(notification));
      }

      return true;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return false;
    }
  }

  // Create notification for new message
  async notifyNewMessage(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    conversationId: string,
    messageContent: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'new_message',
      title: `New message from ${senderName}`,
      content: messageContent,
      related_id: conversationId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture,
        conversation_id: conversationId,
        message_preview: messageContent
      }
    });
  }

  // Create notification for collaboration invite
  async notifyCollaborationInvite(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    projectId: string,
    projectName: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'collaboration_invite',
      title: `Collaboration invitation from ${senderName}`,
      content: `You have been invited to collaborate on "${projectName}"`,
      related_id: projectId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture,
        project_id: projectId
      }
    });
  }

  // Create notification for post comment
  async notifyPostComment(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    postId: string,
    commentContent: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'post_comment',
      title: `${senderName} commented on your post`,
      content: commentContent,
      related_id: postId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture,
        post_id: postId
      }
    });
  }

  // Create notification for post like
  async notifyPostLike(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    postId: string,
    postTitle: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'post_like',
      title: `${senderName} liked your post`,
      content: `Your post "${postTitle}" received a like`,
      related_id: postId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture,
        post_id: postId
      }
    });
  }

  // Create notification for project share
  async notifyProjectShared(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    projectId: string,
    projectName: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'project_shared',
      title: `${senderName} shared a project with you`,
      content: `"${projectName}" has been shared with you`,
      related_id: projectId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture,
        project_id: projectId
      }
    });
  }

  // Create notification for collaboration request
  async notifyCollaborationRequest(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    projectId: string,
    projectName: string,
    message?: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'collaboration_request',
      title: `Collaboration request from ${senderName}`,
      content: message || `${senderName} wants to collaborate on "${projectName}"`,
      related_id: projectId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture,
        project_id: projectId
      }
    });
  }

  // Create notification for mention
  async notifyMention(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    contextId: string,
    contextType: 'post' | 'comment' | 'message',
    content: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'mention',
      title: `${senderName} mentioned you`,
      content: content,
      related_id: contextId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture,
        ...(contextType === 'post' ? { post_id: contextId } : {}),
        ...(contextType === 'message' ? { conversation_id: contextId } : {})
      }
    });
  }

  // Create notification for connection request
  async notifyConnectionRequest(
    recipientId: string,
    senderId: string,
    senderName: string,
    senderPicture: string,
    message?: string
  ): Promise<boolean> {
    return this.createNotification({
      user_id: recipientId,
      type: 'connection_request',
      title: `Connection request from ${senderName}`,
      content: message || `${senderName} wants to connect with you`,
      related_id: senderId,
      related_data: {
        sender_id: senderId,
        sender_name: senderName,
        sender_picture: senderPicture
      }
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      if (hasSupabaseConfig()) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) {
          console.error('Error marking notification as read:', error);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      if (hasSupabaseConfig()) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (error) {
          console.error('Error marking all notifications as read:', error);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      if (hasSupabaseConfig()) {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) {
          console.error('Error deleting notification:', error);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Get notifications for a user
  async getNotifications(userId: string, limit: number = 50): Promise<any[]> {
    try {
      if (hasSupabaseConfig()) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching notifications:', error);
          return [];
        }

        return data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get unread count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      if (hasSupabaseConfig()) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (error) {
          console.error('Error fetching unread count:', error);
          return 0;
        }

        return count || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Convenience functions
export const createNotification = (data: NotificationData) => 
  notificationService.createNotification(data);

export const notifyNewMessage = (
  recipientId: string,
  senderId: string,
  senderName: string,
  senderPicture: string,
  conversationId: string,
  messageContent: string
) => notificationService.notifyNewMessage(
  recipientId, senderId, senderName, senderPicture, conversationId, messageContent
);

export const notifyCollaborationInvite = (
  recipientId: string,
  senderId: string,
  senderName: string,
  senderPicture: string,
  projectId: string,
  projectName: string
) => notificationService.notifyCollaborationInvite(
  recipientId, senderId, senderName, senderPicture, projectId, projectName
);

export const notifyPostComment = (
  recipientId: string,
  senderId: string,
  senderName: string,
  senderPicture: string,
  postId: string,
  commentContent: string
) => notificationService.notifyPostComment(
  recipientId, senderId, senderName, senderPicture, postId, commentContent
);

export const notifyPostLike = (
  recipientId: string,
  senderId: string,
  senderName: string,
  senderPicture: string,
  postId: string,
  postTitle: string
) => notificationService.notifyPostLike(
  recipientId, senderId, senderName, senderPicture, postId, postTitle
);