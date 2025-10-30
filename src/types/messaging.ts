export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'link' | 'system' | 'voice';
  attachment?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
    thumbnail?: string;
    metadata?: {
      title?: string;
      description?: string;
      favicon?: string;
      width?: number;
      height?: number;
    };
  };
  reply_to?: string; // For threaded replies
  reactions?: {
    [emoji: string]: string[]; // emoji -> array of user IDs
  };
  edited_at?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    id: string;
    full_name: string;
    profile_picture?: string;
    user_type: 'developer' | 'recruiter';
    online_status?: 'online' | 'away' | 'offline';
    last_seen?: string;
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For group conversations
  participants: string[];
  admin_ids?: string[]; // For group conversations
  last_message_at: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: { [userId: string]: number };
  is_archived?: boolean;
  is_muted?: boolean;
  other_participant?: {
    id: string;
    full_name: string;
    profile_picture?: string;
    user_type: 'developer' | 'recruiter';
    title?: string;
    company?: string;
    online_status?: 'online' | 'away' | 'offline';
    last_seen?: string;
    location?: string;
    skills?: string[];
  };
}

export interface MessageDraft {
  conversation_id: string;
  content: string;
  attachment?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
  };
  created_at: string;
}

export interface TypingIndicator {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
  user_name?: string;
}

export interface MessageSearch {
  query: string;
  conversation_id?: string;
  message_type?: string;
  date_range?: {
    start: string;
    end: string;
  };
  has_attachments?: boolean;
}

export interface MessageSearchResult extends Message {
  conversation: {
    id: string;
    name?: string;
    other_participant?: {
      full_name: string;
      profile_picture?: string;
    };
  };
  highlighted_content?: string;
}

export interface UserConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  connection_type: 'colleague' | 'friend' | 'professional';
  created_at: string;
  updated_at: string;
  connected_user?: {
    id: string;
    full_name: string;
    profile_picture?: string;
    user_type: 'developer' | 'recruiter';
    title?: string;
    company?: string;
    location?: string;
    skills?: string[];
    mutual_connections?: number;
  };
}

export interface MessageNotification {
  id: string;
  user_id: string;
  type: 'new_message' | 'message_reaction' | 'connection_request' | 'mention';
  title: string;
  content?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  related_data?: {
    sender_name?: string;
    sender_picture?: string;
    conversation_id?: string;
    message_preview?: string;
  };
}

export interface ConversationSettings {
  conversation_id: string;
  user_id: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  archived: boolean;
  pinned: boolean;
  custom_name?: string;
  updated_at: string;
}

export interface MessageAnalytics {
  total_sent: number;
  total_received: number;
  response_rate: number;
  avg_response_time: number;
  conversations_count: number;
  active_conversations: number;
  most_contacted: {
    user_id: string;
    full_name: string;
    message_count: number;
  }[];
  activity_by_hour: {
    hour: number;
    message_count: number;
  }[];
  activity_by_day: {
    day: string;
    message_count: number;
  }[];
}