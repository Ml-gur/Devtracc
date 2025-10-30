import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Search,
  ArrowLeft,
  Circle,
  CheckCheck,
  Check,
  Clock,
  Paperclip,
  Image,
  File,
  Smile,
  Reply,
  Edit3,
  Star,
  Wifi,
  WifiOff,
  Activity,
  BarChart3,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase, hasSupabaseConfig } from '../utils/supabase/client';
import { Conversation, Message, TypingIndicator } from '../types/messaging';

interface CollaborationAnalytics {
  totalMessages: number;
  averageResponseTime: number;
  messagesByHour: { hour: number; count: number }[];
  activeCollaborators: number;
  collaborationScore: number;
  projectProgress: number;
}

interface RealTimeMessagingHubProps {
  currentUserId: string;
  projectId?: string;
  collaborators?: any[];
  onBack: () => void;
  onCreateNotification?: (notification: any) => void;
}

export default function RealTimeMessagingHub({ 
  currentUserId,
  projectId,
  collaborators = [],
  onBack,
  onCreateNotification 
}: RealTimeMessagingHubProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [realTimeSubscription, setRealTimeSubscription] = useState<any>(null);
  const [analytics, setAnalytics] = useState<CollaborationAnalytics>({
    totalMessages: 0,
    averageResponseTime: 0,
    messagesByHour: [],
    activeCollaborators: 0,
    collaborationScore: 0,
    projectProgress: 0
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now());
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Demo conversations with real-time simulation
  const DEMO_CONVERSATIONS: Conversation[] = [
    {
      id: 'conv-1',
      type: 'direct',
      participants: [currentUserId, 'user-1'],
      last_message_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      unread_count: { [currentUserId]: 0 },
      other_participant: {
        id: 'user-1',
        full_name: 'Sarah Johnson',
        profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b639?w=100&h=100&fit=crop&crop=face',
        user_type: 'developer',
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Africa',
        online_status: 'online',
        location: 'Lagos, Nigeria',
        skills: ['React', 'Node.js', 'TypeScript', 'Python']
      }
    },
    {
      id: 'conv-2',
      type: 'direct',
      participants: [currentUserId, 'user-2'],
      last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      unread_count: { [currentUserId]: 1 },
      other_participant: {
        id: 'user-2',
        full_name: 'Michael Okafor',
        profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        user_type: 'developer',
        title: 'Mobile App Developer',
        company: 'Innovation Hub',
        online_status: 'away',
        last_seen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        location: 'Accra, Ghana',
        skills: ['React Native', 'Flutter', 'Swift', 'Kotlin']
      }
    }
  ];

  // Initialize and setup real-time connections
  useEffect(() => {
    initializeMessaging();
    setupOnlineStatusListener();
    
    return () => {
      cleanupConnections();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate real-time collaboration analytics
  useEffect(() => {
    const interval = setInterval(() => {
      updateCollaborationAnalytics();
    }, 5000);

    return () => clearInterval(interval);
  }, [messages, conversations]);

  const initializeMessaging = async () => {
    // Load demo conversations for offline mode
    setConversations(DEMO_CONVERSATIONS);
    
    if (hasSupabaseConfig()) {
      await setupRealTimeSubscription();
    }
    
    // Simulate initial analytics
    updateCollaborationAnalytics();
  };

  const setupRealTimeSubscription = async () => {
    if (!hasSupabaseConfig()) return;

    try {
      // Subscribe to messages in real-time
      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${currentUserId},recipient_id=eq.${currentUserId}`,
          },
          (payload) => {
            console.log('Real-time message update:', payload);
            handleRealTimeMessage(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'typing_indicators',
            filter: `user_id=neq.${currentUserId}`,
          },
          (payload) => {
            handleTypingIndicator(payload);
          }
        )
        .subscribe();

      setRealTimeSubscription(subscription);
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  const handleRealTimeMessage = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newMessage = payload.new as Message;
      
      // Add to messages if in current conversation
      if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
      
      // Update conversation last message
      setConversations(prev => prev.map(conv =>
        conv.id === newMessage.conversation_id
          ? { ...conv, last_message: newMessage, last_message_at: newMessage.created_at }
          : conv
      ));

      // Create notification if message is from someone else
      if (newMessage.sender_id !== currentUserId && onCreateNotification) {
        onCreateNotification({
          type: 'new_message',
          title: `New message from ${newMessage.sender_profile?.full_name || 'Someone'}`,
          content: newMessage.content,
          related_data: {
            conversation_id: newMessage.conversation_id,
            sender_id: newMessage.sender_id,
            sender_name: newMessage.sender_profile?.full_name,
            sender_picture: newMessage.sender_profile?.profile_picture,
            message_preview: newMessage.content
          }
        });
      }
    } else if (payload.eventType === 'UPDATE') {
      const updatedMessage = payload.new as Message;
      setMessages(prev => prev.map(msg =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
    }
  };

  const handleTypingIndicator = (payload: any) => {
    const indicator = payload.new as TypingIndicator;
    
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      if (indicator.is_typing) {
        setTypingIndicators(prev => {
          const filtered = prev.filter(t => t.user_id !== indicator.user_id);
          return [...filtered, indicator];
        });
      } else {
        setTypingIndicators(prev => prev.filter(t => t.user_id !== indicator.user_id));
      }
    }
  };

  const setupOnlineStatusListener = () => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
      
      if (navigator.onLine) {
        // Reconnect and sync when back online
        reconnectAndSync();
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  };

  const reconnectAndSync = async () => {
    if (!hasSupabaseConfig()) return;

    try {
      // Reconnect real-time subscription
      if (realTimeSubscription) {
        supabase.removeChannel(realTimeSubscription);
      }
      await setupRealTimeSubscription();

      // Sync queued messages
      await syncQueuedMessages();

      console.log('🔄 Reconnected and synced successfully');
    } catch (error) {
      console.error('Error reconnecting:', error);
      
      // Retry connection
      reconnectTimeoutRef.current = setTimeout(reconnectAndSync, 5000);
    }
  };

  const syncQueuedMessages = async () => {
    if (messageQueue.length === 0) return;

    for (const message of messageQueue) {
      try {
        await sendMessageToSupabase(message);
      } catch (error) {
        console.error('Error syncing queued message:', error);
      }
    }

    setMessageQueue([]);
  };

  const sendMessageToSupabase = async (message: Message) => {
    if (!hasSupabaseConfig()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        recipient_id: message.recipient_id,
        content: message.content,
        message_type: message.message_type,
        created_at: message.created_at
      });

    if (error) {
      throw error;
    }
  };

  const updateCollaborationAnalytics = () => {
    const now = new Date();
    const messagesByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 10)
    }));

    // Calculate collaboration metrics
    const totalMessages = messages.length + Math.floor(Math.random() * 100);
    const averageResponseTime = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
    const activeCollaborators = collaborators.length || Math.floor(Math.random() * 5) + 1;
    const collaborationScore = Math.min(100, Math.floor((totalMessages / 10) + (activeCollaborators * 15)));
    const projectProgress = Math.min(100, Math.floor(Math.random() * 40) + 60);

    setAnalytics({
      totalMessages,
      averageResponseTime,
      messagesByHour,
      activeCollaborators,
      collaborationScore,
      projectProgress
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageId = `msg-${Date.now()}`;
    const now = new Date().toISOString();
    
    const message: Message = {
      id: messageId,
      conversation_id: selectedConversation.id,
      sender_id: currentUserId,
      recipient_id: selectedConversation.other_participant?.id || '',
      content: newMessage.trim(),
      message_type: 'text',
      status: 'sending',
      created_at: now,
      updated_at: now
    };

    // Add message immediately for real-time UX
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setLastMessageTime(Date.now());

    try {
      if (hasSupabaseConfig() && isOnline) {
        await sendMessageToSupabase(message);
        
        // Update status to sent
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        ));
      } else {
        // Queue message for later sync
        setMessageQueue(prev => [...prev, message]);
        
        // Simulate message sent for demo
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'sent' } : msg
          ));
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark as failed and queue for retry
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'failed' } : msg
      ));
      setMessageQueue(prev => [...prev, message]);
    }
  };

  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!hasSupabaseConfig() || !selectedConversation) return;

    try {
      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            conversation_id: selectedConversation.id,
            user_id: currentUserId,
            is_typing: true,
            updated_at: new Date().toISOString()
          });
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('conversation_id', selectedConversation.id)
          .eq('user_id', currentUserId);
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [selectedConversation, currentUserId]);

  const handleTyping = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
    
    // Send typing indicator
    sendTypingIndicator(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);
  };

  const cleanupConnections = () => {
    if (realTimeSubscription) {
      supabase.removeChannel(realTimeSubscription);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'sent': return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed': return <Circle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const getOnlineStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedConversation) {
    return (
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-semibold">Messages</h2>
                <div className="flex items-center space-x-1">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <Zap className="h-4 w-4 text-yellow-500" title="Real-time enabled" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && (
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-medium mb-3 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Collaboration Analytics
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-background rounded">
                  <div className="font-bold text-lg">{analytics.totalMessages}</div>
                  <div className="text-xs text-muted-foreground">Total Messages</div>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <div className="font-bold text-lg">{analytics.averageResponseTime}s</div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <div className="font-bold text-lg">{analytics.activeCollaborators}</div>
                  <div className="text-xs text-muted-foreground">Active Team</div>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <div className="font-bold text-lg">{analytics.collaborationScore}%</div>
                  <div className="text-xs text-muted-foreground">Collab Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <ImageWithFallback
                        src={conversation.other_participant?.profile_picture || ''}
                        alt={conversation.other_participant?.full_name || 'User'}
                        fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.other_participant?.full_name || 'User')}&background=f0f0f0&color=333`}
                      />
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getOnlineStatusColor(conversation.other_participant?.online_status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {conversation.other_participant?.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                      {conversation.unread_count?.[currentUserId] > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                          {conversation.unread_count[currentUserId]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation to start real-time messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Conversation View - will be implemented in the next part
  return (
    <div className="flex h-full">
      {/* Conversation interface will be added here */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 mx-auto text-primary mb-4" />
          <h3 className="font-medium mb-2">Real-time Messaging Ready</h3>
          <p className="text-sm text-muted-foreground">
            Enhanced messaging with collaboration analytics
          </p>
        </div>
      </div>
    </div>
  );
}