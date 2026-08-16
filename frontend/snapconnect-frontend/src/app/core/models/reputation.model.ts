/* Reputation, Levels and Two-Sided Rating domain model */

export type CreatorLevel = 'NEW' | 'RISING' | 'PRO' | 'TOP_CREATOR' | 'ELITE';

export type BadgeType =
  | 'VERIFIED_CREATOR'
  | 'TOP_CREATOR'
  | 'FAST_RESPONDER'
  | 'ON_TIME_DELIVERY'
  | 'RISING_TALENT'
  | 'IPHONE_PRO_EXPERT'
  | 'GIMBAL_MASTER'
  | 'HIGH_SATISFACTION';

export interface CreatorBadge {
  type: BadgeType;
  label: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface CreatorRatingBreakdown {
  overall: number;              // 1.0 - 5.0
  videoQuality: number;         // 4K resolution, color grading, clarity
  gearMastery: number;          // Smartphone stabilization, lighting, audio
  communication: number;        // Responsiveness & clarity
  deadlineRespect: number;      // On-time turnaround
  valueForMoney: number;        // Fair pricing
  tags: string[];               // Merit tags (e.g. "Fast Delivery", "Great Lighting")
  comment?: string;
  ratedAt: string;
}

export interface ClientRatingBreakdown {
  overall: number;              // 1.0 - 5.0
  briefClarity: number;         // Clear expectations
  scopeRespect: number;         // No unexpected extra demands
  communication: number;        // Polite & fast response
  promptApproval: number;       // Promptly released escrow funds
  professionalism: number;
  comment?: string;
  ratedAt: string;
}

export interface TwoSidedReview {
  id: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'CLIENT' | 'CREATOR';
  revieweeId: string;
  revieweeName?: string;
  revieweeRole?: 'CLIENT' | 'CREATOR';
  overallRating: number;
  qualityRating?: number;
  communicationRating: number;
  deadlinesRating?: number;
  equipmentMasteryRating?: number;
  comment: string;
  recommended: boolean;
  status: 'PUBLISHED' | 'FLAGGED' | 'REMOVED';
  createdAt: string;
}

export interface ReviewSubmitRequest {
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'CLIENT' | 'CREATOR';
  revieweeId: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating: number;
  deadlinesRating?: number;
  equipmentMasteryRating?: number;
  comment: string;
  recommended: boolean;
}

export interface CreatorReputationProfile {
  creatorId: string;
  level: CreatorLevel;
  weightedScore: number;         // Calculated ranking score (0 - 100)
  overallRating: number;         // Average stars
  totalReviewsCount: number;
  completedProjectsCount: number;
  completionRate: number;        // Percentage (e.g. 98%)
  onTimeDeliveryRate: number;    // Percentage (e.g. 96%)
  averageResponseHours: number;  // e.g. 1.2 hours
  disputeRate: number;           // Percentage (e.g. 0%)
  repeatClientsRate: number;     // Percentage (e.g. 35%)
  badges: CreatorBadge[];
  recentReviews: CreatorRatingBreakdown[];
}
