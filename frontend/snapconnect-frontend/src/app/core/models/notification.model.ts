/* Notification domain model */
export type NotificationType =
  | 'NEW_PROPOSAL'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REJECTED'
  | 'NEW_MESSAGE'
  | 'NEW_ORDER'
  | 'DELIVERY_SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'CONTRACT_COMPLETED'
  | 'NEW_REVIEW'
  | 'PAYMENT'
  | 'CONTRACT_CANCELLED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  contextType?: string;
  contextId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
