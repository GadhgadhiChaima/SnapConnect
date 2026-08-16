/* Subscription & Monetization domain model */

export type CreatorPlanType = 'FREE' | 'PRO' | 'PREMIUM';
export type ClientPlanType = 'FREE' | 'BUSINESS' | 'BUSINESS_PRO';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  targetRole: 'CREATOR' | 'CLIENT';
  code: CreatorPlanType | ClientPlanType;
  title: string;
  badgeLabel?: string;
  priceMonthly: number;
  currency: string;
  platformFeePercent: number;     // e.g. 12% for Free, 8% for Pro, 5% for Premium
  proposalsMonthlyLimit?: number; // e.g. 10, 40, unlimited (-1)
  featuredPlacement: boolean;
  features: PlanFeature[];
}

export interface UserSubscription {
  userId: string;
  planId: string;
  planCode: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
  startDate: string;
  renewalDate: string;
  autoRenew: boolean;
}
