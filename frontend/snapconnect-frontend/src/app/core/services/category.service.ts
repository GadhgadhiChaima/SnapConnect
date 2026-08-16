import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { Category } from '../models/category.model';

const API = 'http://localhost:8080/api/categories';

/* Platform content categories */
export const PLATFORM_CATEGORIES: Category[] = [
  { id: 'reels-tiktok',    name: 'Reels & TikTok',      slug: 'reels-tiktok',    emoji: '🎬', isActive: true },
  { id: 'product-photo',   name: 'Product Photography',  slug: 'product-photo',   emoji: '📦', isActive: true },
  { id: 'real-estate',     name: 'Real Estate',          slug: 'real-estate',     emoji: '🏠', isActive: true },
  { id: 'events',          name: 'Events & Moments',     slug: 'events',          emoji: '🎉', isActive: true },
  { id: 'ugc',             name: 'UGC Content',          slug: 'ugc',             emoji: '🤝', isActive: true },
  { id: 'food-resto',      name: 'Food & Restaurant',    slug: 'food-resto',      emoji: '🍽️', isActive: true },
  { id: 'fashion',         name: 'Fashion & Lifestyle',  slug: 'fashion',         emoji: '👗', isActive: true },
  { id: 'promo-video',     name: 'Promotional Video',    slug: 'promo-video',     emoji: '📢', isActive: true },
  { id: 'social-media',    name: 'Social Media Packs',   slug: 'social-media',    emoji: '📱', isActive: true },
  { id: 'other',           name: 'Other',                slug: 'other',           emoji: '✨', isActive: true },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {

  readonly categories = signal<Category[]>([]);

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(API).pipe(
      tap(cats => this.categories.set(cats))
    );
  }

  /** Returns local fallback categories if backend is not available */
  getAllWithFallback(): Observable<Category[]> {
    if (this.categories().length > 0) return of(this.categories());
    return this.http.get<Category[]>(API).pipe(
      tap(cats => this.categories.set(cats))
    );
  }

  getLocalCategories(): Category[] {
    return PLATFORM_CATEGORIES;
  }

  getBySlug(slug: string): Category | undefined {
    return PLATFORM_CATEGORIES.find(c => c.slug === slug);
  }

  /* Admin CRUD */
  create(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(API, data);
  }

  update(id: string, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${API}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
