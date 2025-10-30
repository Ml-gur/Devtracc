import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, Check, CheckCheck, X, Heart, Users, UserPlus, Star, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { supabase, hasSupabaseConfig } from '../utils/supabase/client';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Notification {
  id: string;
  user_id: string;
  type: 'new_message' | 'post_comment' | 'post_like' | 'collaboration_invite' | 'collaboration_request' | 'project_shared' | 'mention' | 'connection_request';
  title: string;
  content?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
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

interface NotificationCenterProps {
  currentUserId: string;
  onNotificationClick?: (notification: Notification) => void;
  onNavigateToMessages?: (conversationId?: string) => void;
  onNavigateToCommunity?: (postId?: string) => void;
  onNavigateToProject?: (projectId?: string) => void;
}

export default function NotificationCenter({ 
  currentUserId, 
  onNotificationClick,
  onNavigateToMessages,
  onNavigateToCommunity,
  onNavigateToProject
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);
  const [realTimeSubscription, setRealTimeSubscription] = useState<any>(null);

  useEffect(() => {
    if (!hasSupabaseConfig() || !currentUserId) {
      // Load demo notifications for offline mode
      loadDemoNotifications();
      setDatabaseAvailable(false);
      setLoading(false);
      return;
    }

    loadNotifications();
    const unsubscribe = subscribeToNotifications();
    return () => {
      if (unsubscribe) unsubscribe();
      if (realTimeSubscription) {
        supabase.removeChannel(realTimeSubscription);
      }
    };
  }, [currentUserId]);

  const loadDemoNotifications = () => {
    const demoNotifications: Notification[] = [
      {
        id: 'demo-notif-1',
        user_id: currentUserId,
        type: 'new_message',
        title: 'New message from Sarah Johnson',
        content: 'That sounds like a great approach! When can we schedule a call?',
        related_id: 'conv-1',
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        related_data: {
          sender_id: 'user-1',
          sender_name: 'Sarah Johnson',
          sender_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b639?w=100&h=100&fit=crop&crop=face',
          conversation_id: 'conv-1',
          message_preview: 'That sounds like a great approach! When can we schedule a call?'
        }
      },
      {
        id: 'demo-notif-2',
        user_id: currentUserId,
        type: 'post_like',
        title: 'Michael Okafor liked your post',
        content: 'Your project update "DevTrack Africa Progress" received a like',
        related_id: 'post-1',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        related_data: {
          sender_id: 'user-2',
          sender_name: 'Michael Okafor',
          sender_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          post_id: 'post-1'
        }
      },
      {
        id: 'demo-notif-3',
        user_id: currentUserId,
        type: 'collaboration_invite',
        title: 'Collaboration invitation from Amara Osei',
        content: 'You have been invited to collaborate on "E-Learning Platform"',
        related_id: 'project-2',
        is_read: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        related_data: {
          sender_id: 'user-3',
          sender_name: 'Amara Osei',
          sender_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          project_id: 'project-2'
        }
      },
      {
        id: 'demo-notif-4',
        user_id: currentUserId,
        type: 'post_comment',
        title: 'John Doe commented on your post',
        content: 'Great progress! The UI looks really clean and professional.',
        related_id: 'post-1',
        is_read: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        related_data: {
          sender_id: 'user-4',
          sender_name: 'John Doe',
          sender_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          post_id: 'post-1'
        }
      }
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.is_read).length);
  };

  const loadNotifications = async () => {
    try {
      if (!hasSupabaseConfig()) {
        loadDemoNotifications();
        setDatabaseAvailable(false);
        setLoading(false);
        return;
      }

      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select(`
          *,
          related_user:related_data->sender_id (
            id,
            full_name,
            profile_picture
          )
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        loadDemoNotifications();
        setDatabaseAvailable(false);
      } else {
        setNotifications(notificationsData || []);
        setUnreadCount((notificationsData || []).filter(n => !n.is_read).length);
        setDatabaseAvailable(true);
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      loadDemoNotifications();
      setDatabaseAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!hasSupabaseConfig() || !databaseAvailable) {
      return () => {}; // Return empty cleanup function
    }

    try {
      // Set up real-time subscription for notifications
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload) => {
            console.log('Real-time notification update:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as Notification;
              setNotifications(prev => {
                // Avoid duplicates
                if (prev.some(n => n.id === newNotification.id)) {
                  return prev;
                }
                return [newNotification, ...prev];
              });
              
              if (!newNotification.is_read) {
                setUnreadCount(prev => prev + 1);
                
                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                  new Notification(newNotification.title, {
                    body: newNotification.content,
                    icon: newNotification.related_data?.sender_picture || '/favicon.ico',
                    tag: newNotification.id
                  });
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedNotification = payload.new as Notification;
              setNotifications(prev => prev.map(n => 
                n.id === updatedNotification.id ? updatedNotification : n
              ));
              
              if (updatedNotification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            }
          }
        )
        .subscribe();

      setRealTimeSubscription(subscription);

      return () => {
        supabase.removeChannel(subscription);
      };
    } catch (error) {
      console.log('Error setting up notification subscription:', error);
      return () => {};
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!databaseAvailable || !hasSupabaseConfig()) {
      // Update local state for demo mode
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!databaseAvailable || !hasSupabaseConfig()) {
      // Update local state for demo mode
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'new_message':
        if (onNavigateToMessages) {
          onNavigateToMessages(notification.related_data?.conversation_id);
        }
        break;
      case 'post_comment':
      case 'post_like':
        if (onNavigateToCommunity) {
          onNavigateToCommunity(notification.related_data?.post_id);
        }
        break;
      case 'collaboration_invite':
      case 'project_shared':
        if (onNavigateToProject) {
          onNavigateToProject(notification.related_data?.project_id);
        }
        break;
      default:
        if (onNotificationClick) {
          onNotificationClick(notification);
        }
        break;
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'post_comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'post_like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'collaboration_invite':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'collaboration_request':
        return <UserPlus className="h-4 w-4 text-orange-500" />;
      case 'project_shared':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'mention':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'connection_request':
        return <UserPlus className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString();
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(notification);
    });
    
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0"
        onInteractOutside={() => setIsOpen(false)}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && databaseAvailable && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (!databaseAvailable && notifications.length === 0) ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h4>Demo Mode</h4>
              <p className="text-muted-foreground text-sm">
                Notifications work offline with demo data. Connect Supabase for real-time notifications.
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h4>No notifications yet</h4>
              <p className="text-muted-foreground text-sm">
                We'll notify you when you receive messages or updates
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                <div key={date}>
                  <div className="px-4 py-2 bg-muted/20">
                    <span className="text-xs font-medium text-muted-foreground">
                      {date}
                    </span>
                  </div>
                  {dateNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                        !notification.is_read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {notification.related_data?.sender_picture ? (
                          <Avatar className="h-8 w-8">
                            <img 
                              src={notification.related_data.sender_picture} 
                              alt={notification.related_data.sender_name || 'User'}
                            />
                          </Avatar>
                        ) : (
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          
                          {notification.content && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {notification.content}
                            </p>
                          )}
                          
                          <span className="text-xs text-muted-foreground">
                            {formatNotificationTime(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && databaseAvailable && (
          <div className="p-4 border-t">
            <Button variant="ghost" size="sm" className="w-full">
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}