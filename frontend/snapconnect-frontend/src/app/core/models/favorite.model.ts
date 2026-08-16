/* Favorite domain model */
export type FavoriteEntityType = 'CREATOR' | 'SERVICE' | 'JOB';

export interface Favorite {
  id: string;
  userId: string;
  entityType: FavoriteEntityType;
  entityId: string;
  createdAt: string;
}

export interface FavoriteListResponse {
  favorites: Favorite[];
  total: number;
}
