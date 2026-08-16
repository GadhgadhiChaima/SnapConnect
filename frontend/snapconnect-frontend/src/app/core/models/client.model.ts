/* Client Profile domain model */
export interface ClientProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  industry?: string;
  location?: string;
  bio?: string;
  totalJobsPosted?: number;
  totalSpent?: number;
  hiredCount?: number;
  rating?: number;
  isVerified?: boolean;
  createdAt?: string;
}
