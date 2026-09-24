/* Notification domain model */
export type NotificationType =
  | 'NEW_PROPOSAL'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REJECTED'
  | 'NEW_MESSAGE'
  | 'MESSAGE'
  | 'NEW_ORDER'
  | 'DELIVERY_SUBMITTED'
  | 'DELIVERY'
  | 'REVISION_REQUESTED'
  | 'REVISION'
  | 'CONTRACT_COMPLETED'
  | 'NEW_REVIEW'
  | 'REVIEW'
  | 'PAYMENT'
  | 'ESCROW'
  | 'NEW_JOB'
  | 'CONTRACT_CANCELLED'
  | 'SYSTEM'
  | string;

export interface Notification {
  id: string | number;
  userId: string | number;
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
