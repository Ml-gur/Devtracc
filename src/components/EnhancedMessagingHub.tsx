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
  WifiOff,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  getUserConversations, 
  getConversationMessages, 
  sendMessage,
  createConversation,
  MessagingConversation, 
  MessagingMessage,
  DiscoverableUser 
} from '../utils/database-service';
import EnhancedPeopleDiscovery from './EnhancedPeopleDiscovery';

interface EnhancedMessagingHubProps {
  currentUserId: string;
  userType: 'developer' | 'recruiter';
  onBack: () => void;
}

export default function EnhancedMessagingHub({ 
  currentUserId, 
  userType, 
  onBack 
}: EnhancedMessagingHubProps) {
  const [conversations, setConversations] = useState<MessagingConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<MessagingConversation | null>(null);
  const [messages, setMessages] = useState<MessagingMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'conversations' | 'people'>('conversations');
  const [showPeopleDiscovery, setShowPeopleDiscovery] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [currentUserId]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading conversations...');
      const result = await getUserConversations(currentUserId);
      
      if (result.error) {
        console.error('❌ Error loading conversations:', result.error);
        setError('Failed to load conversations. Please try again.');
        return;
      }
      
      if (result.data) {
        setConversations(result.data);
        console.log(`✅ Loaded ${result.data.length} conversations`);
      }
    } catch (error) {
      console.error('❌ Error in loadConversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      setError(null);
      
      console.log('📨 Loading messages for conversation:', conversationId);
      const result = await getConversationMessages(conversationId, 50);
      
      if (result.error) {
        console.error('❌ Error loading messages:', result.error);
        setError('Failed to load messages. Please try again.');
        return;
      }
      
      if (result.data) {
        setMessages(result.data);
        console.log(`✅ Loaded ${result.data.length} messages`);
      }
    } catch (error) {
      console.error('❌ Error in loadConversationMessages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setMessagesLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);
    
    try {
      console.log('📤 Sending message...');
      const recipientId = selectedConversation.other_participant?.id || '';
      
      const result = await sendMessage(
        selectedConversation.id, 
        currentUserId, 
        recipientId, 
        messageContent
      );
      
      if (result.error) {
        console.error('❌ Error sending message:', result.error);
        setError('Failed to send message. Please try again.');
        setNewMessage(messageContent); // Restore message
        return;
      }
      
      if (result.data) {
        // Add message to current conversation
        setMessages(prev => [...prev, result.data!]);
        
        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                last_message_at: result.data!.created_at,
                last_message: result.data!
              }
            : conv
        ));
        
        console.log('✅ Message sent successfully');
      }
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      setError('Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartConversation = async (userId: string) => {
    try {
      console.log('🚀 Starting conversation with user:', userId);
      
      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.participants.includes(userId)
      );
      
      if (existingConv) {
        console.log('✅ Existing conversation found');
        setSelectedConversation(existingConv);
        setShowPeopleDiscovery(false);
        setActiveTab('conversations');
        return;
      }

      // Create new conversation
      console.log('💬 Creating new conversation...');

      const result = await createConversation([currentUserId, userId], currentUserId);
      
      if (result.error) {
        console.error('❌ Error creating conversation:', result.error);
        setError('Failed to start conversation. Please try again.');
        return;
      }
      
      if (result.data) {
        // Add the new conversation to the list
        const newConversation: MessagingConversation = {
          id: result.data.id,
          participants: result.data.participants,
          last_message_at: result.data.last_message_at,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          other_participant: null, // Will be loaded when selecting
          unread_count: { [currentUserId]: 0 }
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        
        console.log('✅ New conversation created successfully');
      }
      
      setShowPeopleDiscovery(false);
      setActiveTab('conversations');
    } catch (error) {
      console.error('❌ Error in handleStartConversation:', error);
      setError('Failed to start conversation. Please try again.');
    }
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

  // Show people discovery
  if (showPeopleDiscovery) {
    return (
      <EnhancedPeopleDiscovery
        currentUserId={currentUserId}
        userType={userType}
        onBack={() => setShowPeopleDiscovery(false)}
        onStartConversation={handleStartConversation}
      />
    );
  }

  // Show conversation view
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
                    src={selectedConversation.other_participant?.profile_image_url || ''}
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
                  {selectedConversation.other_participant?.title?.toLowerCase().includes('recruit') && (
                    <Badge variant="secondary" className="text-xs">
                      Recruiter
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
                <DropdownMenuItem>
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
          {messagesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading messages...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`relative group ${
                        message.sender_id === currentUserId
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-muted mr-4'
                      } rounded-2xl px-4 py-3`}
                    >
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
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {message.sender_id !== currentUserId && (
                    <Avatar className="h-8 w-8 order-1 mr-2">
                      <ImageWithFallback
                        src={selectedConversation.other_participant?.profile_image_url || ''}
                        alt={selectedConversation.other_participant?.full_name || 'User'}
                        fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.other_participant?.full_name || 'User')}&background=f0f0f0&color=333`}
                      />
                    </Avatar>
                  )}
                </div>
              ))}
              
              {messages.length === 0 && !messagesLoading && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
                  <p className="text-muted-foreground">
                    Say hello to {selectedConversation.other_participant?.full_name}
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sendingMessage}
                size="sm"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main conversations list
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <MessageCircle className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        <Button 
          size="sm" 
          onClick={() => setShowPeopleDiscovery(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'conversations' | 'people')} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
          <TabsTrigger value="conversations" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Conversations</span>
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>People</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
                <h3 className="text-lg font-medium mb-2">Loading conversations...</h3>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-red-900">Error Loading Conversations</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button onClick={loadConversations} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start connecting with other developers and recruiters on DevTrack Africa
                </p>
                <Button onClick={() => setShowPeopleDiscovery(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Find People
                </Button>
              </div>
            ) : (
              <div className="py-4 space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card 
                    key={conversation.id} 
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <ImageWithFallback
                            src={conversation.other_participant?.profile_image_url || ''}
                            alt={conversation.other_participant?.full_name || 'User'}
                            fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.other_participant?.full_name || 'User')}&background=f0f0f0&color=333`}
                          />
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getOnlineStatusColor(conversation.other_participant?.online_status)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
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
                          {conversation.unread_count && conversation.unread_count[currentUserId] > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count[currentUserId]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="people" className="flex-1 mt-0">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Discover People</h3>
            <p className="text-muted-foreground mb-4">
              Find and connect with developers and recruiters across Africa
            </p>
            <Button onClick={() => setShowPeopleDiscovery(true)}>
              <Search className="h-4 w-4 mr-2" />
              Find People
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}