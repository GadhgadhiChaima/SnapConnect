/* Service / Gig domain model — Model B */
export type ServiceStatus  = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type PackageTier    = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface FAQ {
  question: string;
  answer: string;
}

export interface ServicePackage {
  id?: string;
  serviceId?: string;
  tier: PackageTier;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisionsIncluded: number;
  deliverables: string[];
  isPopular?: boolean;
}

export interface ServiceMedia {
  id?: string;
  url: string;
  thumbnailUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string;
  order?: number;
}

export interface Service {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorRating?: number;
  creatorCompletedCount?: number;
  categoryId?: string;
  categoryName?: string;
  title: string;
  slug?: string;
  description: string;
  tags?: string[];
  mediaGallery?: ServiceMedia[];
  packages: ServicePackage[];
  requirements?: string;
  faqs?: FAQ[];
  location?: string;
  isRemotePossible?: boolean;
  status: ServiceStatus;
  rating: number;
  reviewsCount: number;
  ordersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceListResponse {
  services: Service[];
  total: number;
  page: number;
  pageSize: number;
}
