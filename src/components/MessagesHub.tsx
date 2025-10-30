import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Plus, Clock, CheckCheck, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { db, hasFirebaseConfig } from '../utils/firebase/client';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { Conversation, Message } from '../types/messaging';
import ConversationInterface from './ConversationInterface';

interface MessagesHubProps {
  currentUserId: string;
  userType: 'developer' | 'recruiter';
  onBack: () => void;
}

export default function MessagesHub({ currentUserId, userType, onBack }: MessagesHubProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);

  useEffect(() => {
    if (!hasFirebaseConfig() || !currentUserId) {
      setDatabaseAvailable(false);
      setLoading(false);
      return;
    }

    loadConversations();
    const unsubscribe = subscribeToConversations();
    return unsubscribe;
  }, [currentUserId]);

  const loadConversations = async () => {
    try {
      if (!hasFirebaseConfig()) {
        setDatabaseAvailable(false);
        setLoading(false);
        return;
      }

      // Query conversations where current user is participant
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', currentUserId),
        orderBy('last_message_at', 'desc')
      );

      const snapshot = await getDocs(q);
      
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        last_message_at: doc.data().last_message_at?.toDate?.()?.toISOString() || new Date().toISOString()
      }));

      // Get participant profiles, last messages, and unread counts
      const conversationsWithProfiles = await Promise.all(
        conversationsData.map(async (conv: any) => {
          const otherId = conv.participants?.find((id: string) => id !== currentUserId);
          
          let profileData = null;
          let lastMessage = null;
          let unreadCount = 0;

          try {
            // Get other participant's profile
            if (otherId) {
              const profileRef = doc(db, 'users', otherId);
              const profileSnap = await getDoc(profileRef);
              
              if (profileSnap.exists()) {
                const profile = profileSnap.data();
                profileData = {
                  full_name: profile.fullName,
                  profile_picture: profile.profilePicture,
                  user_type: profile.userType || 'developer',
                  title: profile.title,
                  company: profile.company
                };
              }
            }
          } catch (profileError) {
            console.log('Error loading participant profile:', profileError);
          }

          try {
            // Get last message
            const messagesRef = collection(db, 'messages');
            const messageQuery = query(
              messagesRef,
              where('conversation_id', '==', conv.id),
              orderBy('created_at', 'desc'),
              limit(1)
            );
            
            const messageSnapshot = await getDocs(messageQuery);
            
            if (!messageSnapshot.empty) {
              const messageDoc = messageSnapshot.docs[0];
              lastMessage = {
                id: messageDoc.id,
                ...messageDoc.data(),
                created_at: messageDoc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
              };
            }
          } catch (messageError) {
            console.log('Error loading last message:', messageError);
          }

          try {
            // Get unread count
            const unreadMessagesRef = collection(db, 'messages');
            const unreadQuery = query(
              unreadMessagesRef,
              where('conversation_id', '==', conv.id),
              where('recipient_id', '==', currentUserId),
              where('status', '!=', 'read')
            );
            
            const unreadSnapshot = await getDocs(unreadQuery);
            unreadCount = unreadSnapshot.size;
          } catch (unreadError) {
            console.log('Error loading unread count:', unreadError);
          }

          return {
            ...conv,
            other_participant: profileData ? {
              id: otherId,
              full_name: profileData.full_name,
              profile_picture: profileData.profile_picture,
              user_type: profileData.user_type,
              title: profileData.title,
              company: profileData.company
            } : {
              id: otherId,
              full_name: 'Unknown User',
              profile_picture: null,
              user_type: 'developer',
              title: null,
              company: null
            },
            last_message: lastMessage,
            unread_count: unreadCount
          };
        })
      );

      setConversations(conversationsWithProfiles);
      setDatabaseAvailable(true);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      
      // Check if it's a Firebase permissions or collection doesn't exist error
      if (error.code === 'permission-denied' || 
          error.code === 'not-found' ||
          error.code === 'failed-precondition') {
        console.log('Conversations collection not accessible - using empty state');
        setConversations([]);
        setDatabaseAvailable(false);
      } else {
        setConversations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    if (!hasFirebaseConfig() || !databaseAvailable) {
      return () => {}; // Return empty cleanup function
    }

    try {
      // Subscribe to messages for real-time updates
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('recipient_id', '==', currentUserId),
        orderBy('created_at', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let hasChanges = false;
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            hasChanges = true;
          }
        });

        if (hasChanges) {
          // Reload conversations when new messages arrive or status changes
          loadConversations();
        }
      }, (error) => {
        console.log('Error in message subscription:', error);
        setDatabaseAvailable(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up message subscription:', error);
      return () => {};
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.other_participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} min ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  if (selectedConversation) {
    return (
      <ConversationInterface
        conversation={selectedConversation}
        currentUserId={currentUserId}
        userType={userType}
        onBack={() => setSelectedConversation(null)}
        onConversationUpdate={loadConversations}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ←
          </Button>
          <MessageCircle className="h-5 w-5" />
          <h1>Messages</h1>
        </div>
        {userType === 'recruiter' && databaseAvailable && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        )}
      </div>

      {/* Database Setup Notice */}
      {!databaseAvailable && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800">
            💬 Messaging requires Firestore setup. Messages will be available once the database is configured.
          </p>
        </div>
      )}

      {/* Search */}
      {databaseAvailable && (
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
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !databaseAvailable ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3>Firestore Setup Required</h3>
            <p className="text-muted-foreground">
              Messaging functionality requires Firestore setup to store conversations and messages.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3>No conversations yet</h3>
            <p className="text-muted-foreground">
              {userType === 'recruiter' 
                ? 'Start reaching out to developers to begin conversations'
                : 'Recruiters will reach out to you based on your projects'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <img
                      src={conversation.other_participant?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.other_participant?.full_name || 'User')}&background=f0f0f0&color=333`}
                      alt={conversation.other_participant?.full_name || 'User'}
                    />
                  </Avatar>
                  
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
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {conversation.last_message && conversation.last_message.sender_id === currentUserId && (
                          getStatusIcon(conversation.last_message.status)
                        )}
                        <Clock className="h-3 w-3" />
                        <span>{formatMessageTime(conversation.last_message_at)}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm truncate">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}