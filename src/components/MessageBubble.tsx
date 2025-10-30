import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Message } from '../types/messaging';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showStatus: boolean;
}

export default function MessageBubble({ message, isOwn, showStatus }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <Avatar className="h-6 w-6">
            <img
              src={message.sender_profile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender_profile?.full_name || 'User')}&background=f0f0f0&color=333`}
              alt={message.sender_profile?.full_name || 'User'}
            />
          </Avatar>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isOwn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
        }`}>
          {message.message_type === 'template' && (
            <Badge 
              variant={isOwn ? 'secondary' : 'outline'} 
              className="text-xs mb-2"
            >
              Template
            </Badge>
          )}
          
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          
          <div className={`flex items-center justify-between mt-1 ${
            isOwn ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <span className={`text-xs ${
              isOwn 
                ? 'text-primary-foreground/70' 
                : 'text-muted-foreground'
            }`}>
              {formatTime(message.created_at)}
            </span>
            
            {showStatus && (
              <div className="flex items-center space-x-1 ml-2">
                {getStatusIcon()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}