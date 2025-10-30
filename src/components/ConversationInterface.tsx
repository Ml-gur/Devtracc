import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Paperclip, Smile, Calendar, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { db, hasFirebaseConfig } from '../utils/firebase/client';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { Conversation, Message, TypingIndicator } from '../types/messaging';
import MessageBubble from './MessageBubble';
import TemplateSelector from './TemplateSelector';

interface ConversationInterfaceProps {
  conversation: Conversation;
  currentUserId: string;
  userType: 'developer' | 'recruiter';
  onBack: () => void;
  onConversationUpdate: () => void;
}

export default function ConversationInterface({ 
  conversation, 
  currentUserId, 
  userType, 
  onBack,
  onConversationUpdate 
}: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const otherParticipantId = conversation.participants?.find(id => id !== currentUserId) || 
                            (conversation.participant_1 === currentUserId ? conversation.participant_2 : conversation.participant_1);

  useEffect(() => {
    if (!hasFirebaseConfig() || !currentUserId) {
      setDatabaseAvailable(false);
      setLoading(false);
      return;
    }

    loadMessages();
    markMessagesAsRead();
    const unsubscribe = subscribeToMessages();
    const unsubscribeTyping = subscribeToTyping();
    
    return () => {
      // Clear typing indicator on unmount
      updateTypingStatus(false);
      unsubscribe();
      unsubscribeTyping();
    };
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      if (!hasFirebaseConfig()) {
        setDatabaseAvailable(false);
        setLoading(false);
        return;
      }

      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversation.id),
        orderBy('created_at', 'asc')
      );

      const snapshot = await getDocs(q);
      
      const messagesData = await Promise.all(
        snapshot.docs.map(async (messageDoc) => {
          const messageData = {
            id: messageDoc.id,
            ...messageDoc.data(),
            created_at: messageDoc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
          };

          // Load sender profile
          let senderProfile = null;
          if (messageData.sender_id) {
            try {
              const senderRef = doc(db, 'users', messageData.sender_id);
              const senderSnap = await getDoc(senderRef);
              
              if (senderSnap.exists()) {
                const senderData = senderSnap.data();
                senderProfile = {
                  id: messageData.sender_id,
                  full_name: senderData.fullName,
                  profile_picture: senderData.profilePicture,
                  user_type: senderData.userType || 'developer'
                };
              }
            } catch (error) {
              console.log('Error loading sender profile:', error);
            }
          }

          return {
            ...messageData,
            sender_profile: senderProfile
          } as Message;
        })
      );
      
      setMessages(messagesData);
      setDatabaseAvailable(true);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      
      // Check if it's a Firebase permissions or collection doesn't exist error
      if (error.code === 'permission-denied' || 
          error.code === 'not-found' ||
          error.code === 'failed-precondition') {
        console.log('Messages collection not accessible - using empty state');
        setMessages([]);
        setDatabaseAvailable(false);
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!databaseAvailable || !hasFirebaseConfig()) return;

    try {
      // Get unread messages for this user in this conversation
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversation.id),
        where('recipient_id', '==', currentUserId),
        where('status', '!=', 'read')
      );

      const snapshot = await getDocs(q);
      
      // Update each unread message
      const updatePromises = snapshot.docs.map(messageDoc => 
        updateDoc(doc(db, 'messages', messageDoc.id), { 
          status: 'read',
          read_at: new Date()
        })
      );
      
      await Promise.all(updatePromises);
      onConversationUpdate();
    } catch (error) {
      console.log('Error marking messages as read (non-critical):', error);
    }
  };

  const subscribeToMessages = () => {
    if (!hasFirebaseConfig() || !databaseAvailable) {
      return () => {}; // Return empty cleanup function
    }

    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversation.id),
        orderBy('created_at', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const messageData = {
            id: change.doc.id,
            ...change.doc.data(),
            created_at: change.doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
          } as Message;

          if (change.type === 'added') {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === messageData.id)) {
                return prev;
              }
              return [...prev, messageData];
            });
            
            if (messageData.recipient_id === currentUserId) {
              markMessagesAsRead();
            }
          } else if (change.type === 'modified') {
            setMessages(prev => prev.map(msg => 
              msg.id === messageData.id ? messageData : msg
            ));
          }
        });
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

  const subscribeToTyping = () => {
    if (!hasFirebaseConfig() || !databaseAvailable) {
      return () => {}; // Return empty cleanup function
    }

    try {
      const typingRef = collection(db, 'typing_indicators');
      const q = query(
        typingRef,
        where('conversation_id', '==', conversation.id)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const indicator = {
            id: change.doc.id,
            ...change.doc.data(),
            updated_at: change.doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
          } as TypingIndicator;

          if (indicator.user_id !== currentUserId) {
            setTypingIndicator(indicator.is_typing ? indicator : null);
          }
        });
      }, (error) => {
        console.log('Error in typing subscription:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up typing subscription:', error);
      return () => {};
    }
  };

  const updateTypingStatus = async (typing: boolean) => {
    if (!databaseAvailable || !hasFirebaseConfig()) return;

    try {
      const typingRef = doc(db, 'typing_indicators', `${conversation.id}_${currentUserId}`);
      
      await setDoc(typingRef, {
        conversation_id: conversation.id,
        user_id: currentUserId,
        is_typing: typing,
        updated_at: new Date()
      }, { merge: true });
    } catch (error) {
      console.log('Error updating typing status (non-critical):', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (databaseAvailable && !isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  const sendMessage = async (content: string, templateId?: string) => {
    if (!content.trim() || sending || !databaseAvailable || !hasFirebaseConfig()) return;

    setSending(true);
    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: currentUserId,
        recipient_id: otherParticipantId,
        content: content.trim(),
        message_type: templateId ? 'template' : 'text',
        template_id: templateId || null,
        status: 'sent',
        created_at: new Date()
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update conversation last_message_at
      const conversationRef = doc(db, 'conversations', conversation.id);
      await updateDoc(conversationRef, { 
        last_message_at: new Date()
      });

      setNewMessage('');
      setIsTyping(false);
      updateTypingStatus(false);
      onConversationUpdate();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleTemplateSelect = (content: string, templateId: string) => {
    sendMessage(content, templateId);
    setShowTemplates(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-8 w-8">
            <img
              src={conversation.other_participant?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.other_participant?.full_name || 'User')}&background=f0f0f0&color=333`}
              alt={conversation.other_participant?.full_name || 'User'}
            />
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {conversation.other_participant?.full_name}
              </span>
              {conversation.other_participant?.user_type === 'recruiter' && (
                <Badge variant="secondary" className="text-xs">
                  {conversation.other_participant.company || 'Recruiter'}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {typingIndicator?.is_typing ? 'Typing...' : databaseAvailable ? 'Active now' : 'Firestore setup required'}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Block User</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Database Setup Notice */}
      {!databaseAvailable && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800">
            💬 Real-time messaging requires Firestore setup. Messages cannot be sent or received until the database is configured.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !databaseAvailable ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-accent rounded-full p-4 mb-4">
              <Smile className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3>Firestore Setup Required</h3>
            <p className="text-muted-foreground">
              Messages require Firestore setup to store and retrieve conversation history.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-accent rounded-full p-4 mb-4">
              <Smile className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3>Start the conversation!</h3>
            <p className="text-muted-foreground">
              Send a message to begin your conversation
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                showStatus={message.sender_id === currentUserId}
              />
            ))}
            {typingIndicator?.is_typing && (
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Avatar className="h-6 w-6">
                  <img
                    src={conversation.other_participant?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.other_participant?.full_name || 'User')}&background=f0f0f0&color=333`}
                    alt={conversation.other_participant?.full_name || 'User'}
                  />
                </Avatar>
                <span>is typing...</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Template Selector */}
      {showTemplates && userType === 'recruiter' && databaseAvailable && (
        <div className="border-t p-4">
          <TemplateSelector
            recipientData={{
              name: conversation.other_participant?.full_name || '',
              title: conversation.other_participant?.title || 'Developer'
            }}
            onSelectTemplate={handleTemplateSelect}
            onCancel={() => setShowTemplates(false)}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" size="sm" disabled={!databaseAvailable}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={!databaseAvailable}>
              <Smile className="h-4 w-4" />
            </Button>
            {userType === 'recruiter' && databaseAvailable && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder={databaseAvailable ? "Type your message..." : "Firestore setup required for messaging"}
            className="flex-1"
            disabled={sending || !databaseAvailable}
          />
          
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending || !databaseAvailable}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}