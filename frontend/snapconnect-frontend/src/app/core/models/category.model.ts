/* Category domain model */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  emoji?: string;
  description?: string;
  parentId?: string;
  creatorsCount?: number;
  servicesCount?: number;
  jobsCount?: number;
  isActive: boolean;
}
