import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import {
  Bell,
  Settings,
  Check,
  CheckAll,
  Trash2,
  Filter,
  User,
  MessageSquare,
  FolderPlus,
  GitCommit,
  Calendar,
  Trophy,
  AlertCircle,
  Info,
  Clock,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'project' | 'collaboration' | 'achievement' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sound: boolean;
  desktop: boolean;
  messages: boolean;
  projectUpdates: boolean;
  collaborationRequests: boolean;
  achievements: boolean;
  systemAlerts: boolean;
  reminders: boolean;
}

interface AdvancedNotificationCenterProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

const AdvancedNotificationCenter: React.FC<AdvancedNotificationCenterProps> = ({
  userId,
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sound: true,
    desktop: true,
    messages: true,
    projectUpdates: true,
    collaborationRequests: true,
    achievements: true,
    systemAlerts: true,
    reminders: true,
  });
  const [showPreferences, setShowPreferences] = useState(false);

  // Mock notifications for demonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'New Message from John Doe',
        message: 'Hey! I saw your React project. Would love to collaborate on the next phase.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        read: false,
        priority: 'medium',
        actionUrl: '/messages/john-doe',
        actionLabel: 'Reply',
      },
      {
        id: '2',
        type: 'project',
        title: 'Task Deadline Approaching',
        message: 'Your task "Implement user authentication" is due in 2 hours.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        priority: 'high',
        actionUrl: '/projects/my-app/tasks/auth',
        actionLabel: 'View Task',
      },
      {
        id: '3',
        type: 'collaboration',
        title: 'Collaboration Invitation',
        message: 'Sarah invited you to collaborate on "E-commerce Platform" project.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true,
        priority: 'medium',
        actionUrl: '/collaborations/ecommerce-platform',
        actionLabel: 'View Invitation',
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Milestone Reached! 🎉',
        message: 'You completed 10 tasks this week! Keep up the great work.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        priority: 'low',
        actionUrl: '/analytics',
        actionLabel: 'View Stats',
      },
      {
        id: '5',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM EAT.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: false,
        priority: 'low',
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'project':
        return <FolderPlus className="w-4 h-4" />;
      case 'collaboration':
        return <User className="w-4 h-4" />;
      case 'achievement':
        return <Trophy className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'reminder':
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    toast.success('All notifications cleared');
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    if (notification.actionUrl) {
      // In a real app, you would navigate to the URL
      console.log('Navigate to:', notification.actionUrl);
    }
  }, [markAsRead, onNotificationClick]);

  const updatePreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} notifications ${value ? 'enabled' : 'disabled'}`);
  }, []);

  // Real-time notification simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a new notification every 30 seconds (for demo)
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'system',
          title: 'Demo Notification',
          message: 'This is a real-time notification simulation.',
          timestamp: new Date(),
          read: false,
          priority: 'low',
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        if (preferences.sound) {
          // Play notification sound
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }
        
        if (preferences.desktop && 'Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/favicon.ico',
              });
            }
          });
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [preferences.sound, preferences.desktop]);

  return (
    <div className="relative">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferences(!showPreferences)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilter('all')}>
                      All Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('unread')}>
                      Unread Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('message')}>
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('project')}>
                      Projects
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('collaboration')}>
                      Collaborations
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={markAllAsRead}>
                      <CheckAll className="w-4 h-4 mr-2" />
                      Mark All Read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearAllNotifications}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-muted-foreground">
                      {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.read ? 'border-blue-200 bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm truncate">
                                  {notification.title}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(notification.timestamp)}
                                  </span>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              {notification.actionLabel && (
                                <div className="flex items-center space-x-2 mt-3">
                                  <Button size="sm" variant="outline">
                                    {notification.actionLabel}
                                  </Button>
                                  {!notification.read && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Mark Read
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Notification Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Email Notifications</div>
                        <div className="text-xs text-muted-foreground">
                          Receive notifications via email
                        </div>
                      </div>
                      <Switch
                        checked={preferences.email}
                        onCheckedChange={(value) => updatePreference('email', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Push Notifications</div>
                        <div className="text-xs text-muted-foreground">
                          Receive push notifications in browser
                        </div>
                      </div>
                      <Switch
                        checked={preferences.push}
                        onCheckedChange={(value) => updatePreference('push', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm flex items-center space-x-2">
                          {preferences.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          <span>Sound Alerts</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Play sound when notifications arrive
                        </div>
                      </div>
                      <Switch
                        checked={preferences.sound}
                        onCheckedChange={(value) => updatePreference('sound', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Desktop Notifications</div>
                        <div className="text-xs text-muted-foreground">
                          Show notifications on your desktop
                        </div>
                      </div>
                      <Switch
                        checked={preferences.desktop}
                        onCheckedChange={(value) => updatePreference('desktop', value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Messages</div>
                        <div className="text-xs text-muted-foreground">
                          New messages and chat notifications
                        </div>
                      </div>
                      <Switch
                        checked={preferences.messages}
                        onCheckedChange={(value) => updatePreference('messages', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Project Updates</div>
                        <div className="text-xs text-muted-foreground">
                          Task deadlines and project changes
                        </div>
                      </div>
                      <Switch
                        checked={preferences.projectUpdates}
                        onCheckedChange={(value) => updatePreference('projectUpdates', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Collaboration Requests</div>
                        <div className="text-xs text-muted-foreground">
                          Invitations and collaboration updates
                        </div>
                      </div>
                      <Switch
                        checked={preferences.collaborationRequests}
                        onCheckedChange={(value) => updatePreference('collaborationRequests', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Achievements</div>
                        <div className="text-xs text-muted-foreground">
                          Milestones and accomplishment notifications
                        </div>
                      </div>
                      <Switch
                        checked={preferences.achievements}
                        onCheckedChange={(value) => updatePreference('achievements', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">System Alerts</div>
                        <div className="text-xs text-muted-foreground">
                          Maintenance and important system updates
                        </div>
                      </div>
                      <Switch
                        checked={preferences.systemAlerts}
                        onCheckedChange={(value) => updatePreference('systemAlerts', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Reminders</div>
                        <div className="text-xs text-muted-foreground">
                          Task reminders and schedule notifications
                        </div>
                      </div>
                      <Switch
                        checked={preferences.reminders}
                        onCheckedChange={(value) => updatePreference('reminders', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedNotificationCenter;