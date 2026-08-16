/* Creator Profile domain model */
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY';

export interface Equipment {
  id?: string;
  creatorId?: string;
  smartphoneModel: string;
  smartphone2ndModel?: string;
  gimbal?: string;
  audioGear?: string;
  lighting?: string;
  lenses?: string[];
  editingSoftware?: string[];
}

export interface CreatorProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  location: string;
  hourlyRate?: number;
  dailyRate?: number;
  responseTimeHours?: number;
  availabilityStatus: AvailabilityStatus;
  specializations: string[];
  contentTypes?: string[];
  languages?: string[];
  rating: number;
  reviewsCount: number;
  completedProjectsCount: number;
  isVerified?: boolean;
  isActive?: boolean;
  equipment?: Equipment;
  portfolioCount?: number;
  servicesCount?: number;
  createdAt?: string;
}

export interface CreatorListResponse {
  creators: CreatorProfile[];
  total: number;
  page: number;
  pageSize: number;
}
