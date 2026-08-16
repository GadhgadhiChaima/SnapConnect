/* Review domain model */
export type ReviewRecipientType = 'CREATOR' | 'CLIENT';

export interface Review {
  id: string;
  contractId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  recipientId: string;
  recipientType: ReviewRecipientType;
  rating: number;
  comment: string;
  tags?: string[];
  isPublic?: boolean;
  createdAt: string;
}

export interface ReviewSubmitRequest {
  contractId: string;
  recipientId: string;
  recipientType: ReviewRecipientType;
  rating: number;
  comment: string;
  tags?: string[];
}

export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
  distribution: { [star: number]: number };
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  summary?: ReviewSummary;
}
