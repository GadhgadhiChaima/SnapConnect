/* Message & Conversation domain models */
export type ConversationContextType = 'JOB' | 'SERVICE' | 'CONTRACT' | 'GENERAL';

export interface MessageAttachment {
  url: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'FILE';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  attachments?: MessageAttachment[];
  isRead: boolean;
  createdAt: string;
  editedAt?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames?: { [userId: string]: string };
  participantAvatars?: { [userId: string]: string };
  contextType: ConversationContextType;
  contextId?: string;
  contextTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
}

export interface MessageSendRequest {
  conversationId: string;
  content: string;
  attachments?: MessageAttachment[];
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
}
