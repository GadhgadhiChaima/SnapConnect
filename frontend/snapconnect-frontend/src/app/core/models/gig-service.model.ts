export interface GigPackage {
  id?: number;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  title: string;
  description?: string;
  price: number;
  deliveryDays: number;
  revisionsIncluded?: number;
  deliverables?: string;
}

export interface GigService {
  id: number | string;
  creatorId: number | string;
  creatorName?: string;
  creatorAvatar?: string;
  categoryName: string;
  title: string;
  description: string;
  deviceUsed: string;
  rating?: number;
  reviewsCount?: number;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  packages: GigPackage[];
  createdAt?: string;
  updatedAt?: string;
}
