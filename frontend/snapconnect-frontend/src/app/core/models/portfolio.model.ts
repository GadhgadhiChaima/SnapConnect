/* Portfolio Item domain model */
export interface PortfolioItem {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  equipmentUsed?: string;
  projectLink?: string;
  isFeatured?: boolean;
  order?: number;
  createdAt: string;
}

export interface PortfolioItemCreateRequest {
  title: string;
  description?: string;
  categoryId?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  equipmentUsed?: string;
  projectLink?: string;
  isFeatured?: boolean;
}

export interface PortfolioListResponse {
  items: PortfolioItem[];
  total: number;
}
