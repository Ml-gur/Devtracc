import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Clock, 
  CheckCheck, 
  Check, 
  Users, 
  Settings, 
  Archive, 
  Pin,
  Filter,
  X,
  Phone,
  Video,
  Info,
  MoreHorizontal,
  Send,
  Paperclip,
  Image,
  Smile,
  Link,
  File,
  Reply,
  Edit3,
  Trash2,
  Star,
  UserPlus,
  ArrowLeft,
  Circle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Conversation, Message, UserConnection, MessageDraft } from '../types/messaging';
import PeopleDiscovery from './PeopleDiscovery';
import ProfileViewer from './ProfileViewer';
import ProfileManager from './ProfileManager';

interface ProfessionalMessagingHubProps {
  currentUserId: string;
  userType: 'developer' | 'recruiter';
  onBack: () => void;
}

const DEMO_CONNECTIONS: UserConnection[] = [
  {
    id: '1',
    user_id: 'demo-user',
    connected_user_id: 'user-1',
    status: 'accepted',
    connection_type: 'professional',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    connected_user: {
      id: 'user-1',
      full_name: 'Sarah Johnson',
      profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b639?w=100&h=100&fit=crop&crop=face',
      user_type: 'developer',
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Africa',
      location: 'Lagos, Nigeria',
      skills: ['React', 'Node.js', 'TypeScript', 'Python'],
      mutual_connections: 5
    }
  },
  {
    id: '2',
    user_id: 'demo-user',
    connected_user_id: 'user-2',
    status: 'accepted',
    connection_type: 'colleague',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    connected_user: {
      id: 'user-2',
      full_name: 'Michael Okafor',
      profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      user_type: 'developer',
      title: 'Mobile App Developer',
      company: 'Innovation Hub',
      location: 'Accra, Ghana',
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      mutual_connections: 12
    }
  },
  {
    id: '3',
    user_id: 'demo-user',
    connected_user_id: 'user-3',
    status: 'accepted',
    connection_type: 'professional',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    connected_user: {
      id: 'user-3',
      full_name: 'Amara Osei',
      profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      user_type: 'recruiter',
      title: 'Senior Tech Recruiter',
      company: 'African Tech Talent',
      location: 'Cape Town, South Africa',
      skills: ['Talent Acquisition', 'Tech Recruitment', 'HR'],
      mutual_connections: 8
    }
  }
];

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    participants: ['demo-user', 'user-1'],
    last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unread_count: { 'demo-user': 2 },
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
    },
    last_message: {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      recipient_id: 'demo-user',
      content: 'That sounds like a great approach! When can we schedule a call to discuss the implementation details?',
      message_type: 'text',
      status: 'delivered',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'conv-2',
    type: 'direct',
    participants: ['demo-user', 'user-2'],
    last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread_count: { 'demo-user': 0 },
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
    },
    last_message: {
      id: 'msg-2',
      conversation_id: 'conv-2',
      sender_id: 'demo-user',
      recipient_id: 'user-2',
      content: 'Thanks for sharing that resource! I\'ll check it out.',
      message_type: 'text',
      status: 'read',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'conv-3',
    type: 'direct',
    participants: ['demo-user', 'user-3'],
    last_message_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    unread_count: { 'demo-user': 0 },
    other_participant: {
      id: 'user-3',
      full_name: 'Amara Osei',
      profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      user_type: 'recruiter',
      title: 'Senior Tech Recruiter',
      company: 'African Tech Talent',
      online_status: 'offline',
      last_seen: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      location: 'Cape Town, South Africa',
      skills: ['Talent Acquisition', 'Tech Recruitment', 'HR']
    },
    last_message: {
      id: 'msg-3',
      conversation_id: 'conv-3',
      sender_id: 'user-3',
      recipient_id: 'demo-user',
      content: 'I have some exciting opportunities that might interest you. Would you like to hear more?',
      message_type: 'text',
      status: 'read',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
];

export default function ProfessionalMessagingHub({ 
  currentUserId, 
  userType, 
  onBack 
}: ProfessionalMessagingHubProps) {
  const [conversations, setConversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [connections, setConnections] = useState<UserConnection[]>(DEMO_CONNECTIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'conversations' | 'connections'>('conversations');
  const [showPeopleDiscovery, setShowPeopleDiscovery] = useState(false);
  const [showProfileViewer, setShowProfileViewer] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConnectionRequests, setShowConnectionRequests] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationMessages = async (conversationId: string) => {
    // Demo messages for the selected conversation
    const demoMessages: Message[] = [
      {
        id: 'msg-demo-1',
        conversation_id: conversationId,
        sender_id: selectedConversation?.other_participant?.id || 'user-1',
        recipient_id: currentUserId,
        content: 'Hey! I saw your latest project on DevTrack. Really impressive work!',
        message_type: 'text',
        status: 'read',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        sender_profile: selectedConversation?.other_participant
      },
      {
        id: 'msg-demo-2',
        conversation_id: conversationId,
        sender_id: currentUserId,
        recipient_id: selectedConversation?.other_participant?.id || 'user-1',
        content: 'Thank you! I put a lot of effort into the user experience. Are you working on anything similar?',
        message_type: 'text',
        status: 'read',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-demo-3',
        conversation_id: conversationId,
        sender_id: selectedConversation?.other_participant?.id || 'user-1',
        recipient_id: currentUserId,
        content: 'Actually yes! I\'m building a similar platform for educational content. Would love to collaborate or share insights.',
        message_type: 'text',
        status: 'read',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        sender_profile: selectedConversation?.other_participant
      },
      {
        id: 'msg-demo-4',
        conversation_id: conversationId,
        sender_id: selectedConversation?.other_participant?.id || 'user-1',
        recipient_id: currentUserId,
        content: 'Check out this article I found - it might be helpful for your project: https://techcrunch.com/developer-tools-africa',
        message_type: 'link',
        attachment: {
          type: 'link',
          url: 'https://techcrunch.com/developer-tools-africa',
          name: 'Developer Tools Transforming Africa',
          metadata: {
            title: 'Developer Tools Transforming Africa\'s Tech Landscape',
            description: 'How modern development tools are empowering African developers to build world-class applications.',
            favicon: 'https://techcrunch.com/favicon.ico'
          }
        },
        status: 'delivered',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        sender_profile: selectedConversation?.other_participant
      }
    ];
    
    setMessages(demoMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    const messageId = `msg-${Date.now()}`;
    const now = new Date().toISOString();
    
    const message: Message = {
      id: messageId,
      conversation_id: selectedConversation?.id || '',
      sender_id: currentUserId,
      recipient_id: selectedConversation?.other_participant?.id || '',
      content: newMessage.trim(),
      message_type: attachments.length > 0 ? 'file' : 'text',
      status: 'sending',
      created_at: now,
      updated_at: now,
      reply_to: replyToMessage?.id
    };

    // Add message to conversation
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setAttachments([]);
    setReplyToMessage(null);
    
    // Simulate message sent
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ));
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const startNewConversation = (connection: UserConnection) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.participants.includes(connection.connected_user_id)
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      // Create new conversation
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        type: 'direct',
        participants: [currentUserId, connection.connected_user_id],
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_participant: connection.connected_user
      };
      
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
    }
    
    setShowNewConversation(false);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOnlineStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'sent': return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed': return <X className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.other_participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConnections = connections.filter(conn => 
    conn.connected_user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.connected_user?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.connected_user?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartConversation = (userId: string) => {
    // Find existing conversation or create new one
    const existingConv = conversations.find(conv => 
      conv.participants.includes(userId)
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      // Create new conversation (demo implementation)
      const connection = connections.find(c => c.connected_user_id === userId);
      if (connection) {
        startNewConversation(connection);
      }
    }
    
    setShowPeopleDiscovery(false);
  };

  const handleViewProfile = (userId: string) => {
    setProfileUserId(userId);
    setShowProfileViewer(true);
  };

  const handleProfileConnect = (userId: string) => {
    // Handle connection logic
    console.log('Connecting to user:', userId);
  };

  const handleManageProfile = () => {
    setShowProfileManager(true);
  };

  const handleProfileSave = (profileData: any) => {
    // Handle profile save logic
    console.log('Profile saved:', profileData);
    setShowProfileManager(false);
  };

  if (showProfileManager) {
    return (
      <ProfileManager
        currentUserId={currentUserId}
        onBack={() => setShowProfileManager(false)}
        onSave={handleProfileSave}
      />
    );
  }

  if (showProfileViewer && profileUserId) {
    return (
      <ProfileViewer
        userId={profileUserId}
        currentUserId={currentUserId}
        onBack={() => {
          setShowProfileViewer(false);
          setProfileUserId(null);
        }}
        onStartConversation={handleStartConversation}
        onConnect={handleProfileConnect}
      />
    );
  }

  if (showPeopleDiscovery) {
    return (
      <PeopleDiscovery
        currentUserId={currentUserId}
        userType={userType}
        onBack={() => setShowPeopleDiscovery(false)}
        onStartConversation={handleStartConversation}
      />
    );
  }

  if (selectedConversation) {
    return (
      <div className="flex flex-col h-full">
        {/* Conversation Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <ImageWithFallback
                    src={selectedConversation.other_participant?.profile_picture || ''}
                    alt={selectedConversation.other_participant?.full_name || 'User'}
                    fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.other_participant?.full_name || 'User')}&background=f0f0f0&color=333`}
                  />
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getOnlineStatusColor(selectedConversation.other_participant?.online_status)}`} />
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {selectedConversation.other_participant?.full_name}
                  </span>
                  {selectedConversation.other_participant?.user_type === 'recruiter' && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedConversation.other_participant.company || 'Recruiter'}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedConversation.other_participant?.online_status === 'online' ? (
                    <span className="flex items-center space-x-1">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                      <span>Active now</span>
                    </span>
                  ) : selectedConversation.other_participant?.last_seen ? (
                    `Last seen ${formatMessageTime(selectedConversation.other_participant.last_seen)}`
                  ) : 'Offline'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewProfile(selectedConversation.other_participant?.id || '')}>
                  <Info className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin Conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                  {message.reply_to && (
                    <div className="text-xs text-muted-foreground mb-1 px-3">
                      Replying to message
                    </div>
                  )}
                  
                  <div
                    className={`relative group ${
                      message.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    } rounded-2xl px-4 py-3`}
                  >
                    {message.attachment?.type === 'link' && (
                      <Card className="p-3 mb-2 bg-background/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <Link className="h-4 w-4" />
                          <span className="text-xs font-medium">Link Preview</span>
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {message.attachment.metadata?.title || message.attachment.name}
                        </div>
                        <div className="text-xs opacity-80 mb-2">
                          {message.attachment.metadata?.description}
                        </div>
                        <a 
                          href={message.attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          {message.attachment.url}
                        </a>
                      </Card>
                    )}
                    
                    {message.content && (
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{formatMessageTime(message.created_at)}</span>
                      {message.sender_id === currentUserId && (
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(message.status)}
                          {message.edited_at && (
                            <span className="text-xs">(edited)</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    <div className={`absolute top-0 ${message.sender_id === currentUserId ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-popover rounded-lg shadow-lg p-1`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => setReplyToMessage(message)}
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                      {message.sender_id === currentUserId && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => setEditingMessage(message)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Star className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {message.sender_id !== currentUserId && (
                  <Avatar className="h-8 w-8 order-1 mr-2">
                    <ImageWithFallback
                      src={message.sender_profile?.profile_picture || ''}
                      alt={message.sender_profile?.full_name || 'User'}
                      fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender_profile?.full_name || 'User')}&background=f0f0f0&color=333`}
                    />
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Reply Preview */}
        {replyToMessage && (
          <div className="px-4 py-2 bg-muted/50 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">Replying to:</span>
                <span className="ml-2 text-muted-foreground truncate">
                  {replyToMessage.content.substring(0, 50)}...
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReplyToMessage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-end space-x-2">
            <div className="flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add emoji</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="resize-none min-h-[40px] max-h-[120px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <MessageCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPeopleDiscovery(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Find People
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowNewConversation(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Filter className="h-4 w-4 mr-2" />
                Message Filters
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archived Chats
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'conversations' | 'connections')} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
          <TabsTrigger value="conversations" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Conversations</span>
            {conversations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {conversations.reduce((sum, conv) => sum + (conv.unread_count?.[currentUserId] || 0), 0)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Connections</span>
            <Badge variant="secondary" className="text-xs">
              {connections.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start connecting with fellow developers and recruiters
                </p>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowPeopleDiscovery(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find People
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewConversation(true)}>
                    Start a conversation
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
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
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium truncate">
                              {conversation.other_participant?.full_name}
                            </span>
                            {conversation.other_participant?.user_type === 'recruiter' && (
                              <Badge variant="secondary" className="text-xs">
                                {conversation.other_participant.company || 'Recruiter'}
                              </Badge>
                            )}
                            {(conversation.unread_count?.[currentUserId] || 0) > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count?.[currentUserId]}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {conversation.last_message?.sender_id === currentUserId && (
                              getStatusIcon(conversation.last_message.status)
                            )}
                            <Clock className="h-3 w-3" />
                            <span>{formatMessageTime(conversation.last_message_at)}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground truncate">
                          {conversation.other_participant?.title} • {conversation.other_participant?.company}
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.last_message?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="connections" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              {filteredConnections.map((connection) => (
                <Card key={connection.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <ImageWithFallback
                          src={connection.connected_user?.profile_picture || ''}
                          alt={connection.connected_user?.full_name || 'User'}
                          fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(connection.connected_user?.full_name || 'User')}&background=f0f0f0&color=333`}
                        />
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">
                            {connection.connected_user?.full_name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {connection.connection_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {connection.connected_user?.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {connection.connected_user?.company} • {connection.connected_user?.location}
                        </div>
                        {connection.connected_user?.mutual_connections && connection.connected_user.mutual_connections > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {connection.connected_user.mutual_connections} mutual connections
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(connection.connected_user_id)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => startNewConversation(connection)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* New Conversation Sheet */}
      <Sheet open={showNewConversation} onOpenChange={setShowNewConversation}>
        <SheetContent>
          <SheetTitle>Start New Conversation</SheetTitle>
          <SheetDescription>
            Choose a connection to start messaging with
          </SheetDescription>
          
          <div className="mt-6 space-y-4">
            <Input 
              placeholder="Search connections..." 
              className="mb-4"
            />
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {connections.map((connection) => (
                  <Card 
                    key={connection.id} 
                    className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => startNewConversation(connection)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <ImageWithFallback
                          src={connection.connected_user?.profile_picture || ''}
                          alt={connection.connected_user?.full_name || 'User'}
                          fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(connection.connected_user?.full_name || 'User')}&background=f0f0f0&color=333`}
                        />
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {connection.connected_user?.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {connection.connected_user?.title}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}