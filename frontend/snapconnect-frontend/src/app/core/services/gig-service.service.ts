import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { GigService } from '../models/gig-service.model';
import { AuthService } from './auth.service';

const API = 'http://localhost:8080/api/services';
const STORAGE_KEY_PREFIX = 'snapconnect_creator_services_';

const DEFAULT_SERVICES: GigService[] = [
  {
    id: 1,
    creatorId: 'cr-1',
    creatorName: 'Sarah Ben Salem',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    categoryName: 'Reels & TikTok',
    title: '3 TikToks / Reels 4K ProRes Viraux avec Montage & Hooks Visuels',
    description: 'Pack complet de 3 vidéos courtes verticales tournées sur iPhone 16 Pro Max en 4K 60fps ProRes Log. Idéal pour doper la notoriété et les ventes d\'une marque sur TikTok et Instagram Reels.',
    deviceUsed: 'iPhone 16 Pro Max • DJI OM 6 • Rode Wireless Pro',
    rating: 4.95,
    reviewsCount: 28,
    status: 'ACTIVE',
    createdAt: '2026-08-01',
    packages: [
      {
        tier: 'BASIC',
        title: 'Pack Starter (1 Reel 4K)',
        description: '1 vidéo verticale de 15-30s tournée et étalonnée avec musique tendance.',
        price: 120,
        deliveryDays: 2,
        revisionsIncluded: 1,
        deliverables: '1 vidéo 9:16 4K MP4'
      },
      {
        tier: 'STANDARD',
        title: 'Pack Standard (3 Reels 4K)',
        description: '3 vidéos verticales avec script, sous-titres animés et accroches virales.',
        price: 280,
        deliveryDays: 3,
        revisionsIncluded: 2,
        deliverables: '3 vidéos 9:16 4K MP4 + fichiers bruts'
      },
      {
        tier: 'PREMIUM',
        title: 'Pack Booster Viral (5 Reels 4K + Formats Ads)',
        description: '5 Reels clés en main avec déclinaisons pour TikTok Ads et Meta Ads.',
        price: 450,
        deliveryDays: 5,
        revisionsIncluded: 3,
        deliverables: '5 vidéos 4K + 2 variations publicitaires'
      }
    ]
  },
  {
    id: 2,
    creatorId: 'cr-1',
    creatorName: 'Sarah Ben Salem',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    categoryName: 'Photos Produits',
    title: 'Pack 10 Photos Packshots Produits & Textures Macro Haute Résolution',
    description: 'Séance photo mobile professionnelle pour gammes cosmétiques, joaillerie ou accessoires. Éclairage LED bicolore et macrophotographie détaillée.',
    deviceUsed: 'iPhone 16 Pro Max (48MP Macro)',
    rating: 5.0,
    reviewsCount: 14,
    status: 'ACTIVE',
    createdAt: '2026-08-10',
    packages: [
      {
        tier: 'BASIC',
        title: '5 Packshots Studio',
        description: '5 photos produits sur fond neutre ou épuré.',
        price: 90,
        deliveryDays: 2,
        revisionsIncluded: 1,
        deliverables: '5 photos JPG/PNG HD retouchées'
      },
      {
        tier: 'STANDARD',
        title: '10 Photos Ambiance & Textures',
        description: '10 photos mêlant packshots et gros plans de textures pour e-commerce.',
        price: 160,
        deliveryDays: 3,
        revisionsIncluded: 2,
        deliverables: '10 photos 48MP retouchées'
      },
      {
        tier: 'PREMIUM',
        title: '20 Photos Catalogue + Stop-Motion',
        description: 'Collection intégrale pour site e-commerce et réseaux sociaux.',
        price: 290,
        deliveryDays: 4,
        revisionsIncluded: 3,
        deliverables: '20 photos 48MP + 1 mini-clip stop-motion'
      }
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class GigServiceService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly services = signal<GigService[]>([]);
  readonly isLoading = signal<boolean>(false);

  private getStorageKey(): string {
    const user = this.auth.currentUser();
    return user?.id ? `${STORAGE_KEY_PREFIX}${user.id}` : `${STORAGE_KEY_PREFIX}guest`;
  }

  loadServices(): void {
    this.isLoading.set(true);
    const user = this.auth.currentUser();
    const creatorId = user?.id || '';

    // Attempt backend first if creatorId is numeric, otherwise read local
    if (creatorId && !isNaN(Number(creatorId))) {
      this.http.get<GigService[]>(`${API}?creatorId=${creatorId}`).pipe(
        catchError(() => of(null))
      ).subscribe(res => {
        if (res && res.length > 0) {
          this.services.set(res);
          this.persistLocal(res);
          this.isLoading.set(false);
        } else {
          this.loadFromLocal();
        }
      });
    } else {
      this.loadFromLocal();
    }
  }

  private loadFromLocal(): void {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.services.set(parsed);
          this.isLoading.set(false);
          return;
        }
      }
    } catch {}

    // Fallback initial
    this.services.set(DEFAULT_SERVICES);
    this.persistLocal(DEFAULT_SERVICES);
    this.isLoading.set(false);
  }

  private persistLocal(list: GigService[]): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(list));
    } catch {}
  }

  createService(service: Omit<GigService, 'id'>): Observable<GigService> {
    const user = this.auth.currentUser();
    const newService: GigService = {
      ...service,
      id: Date.now(),
      creatorId: user?.id || 'cr-1',
      creatorName: user?.fullName || 'Sarah Ben Salem',
      creatorAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      rating: 5.0,
      reviewsCount: 0
    };

    // Try backend if creatorId is numeric
    if (user?.id && !isNaN(Number(user.id))) {
      this.http.post<GigService>(API, {
        ...newService,
        creatorId: Number(user.id)
      }).pipe(
        catchError(() => of(newService))
      ).subscribe(saved => {
        const updated = [saved || newService, ...this.services()];
        this.services.set(updated);
        this.persistLocal(updated);
      });
    } else {
      const updated = [newService, ...this.services()];
      this.services.set(updated);
      this.persistLocal(updated);
    }

    return of(newService);
  }

  toggleStatus(id: number | string): void {
    const updated = this.services().map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...s, status: nextStatus as 'ACTIVE' | 'PAUSED' };
      }
      return s;
    });
    this.services.set(updated);
    this.persistLocal(updated);
  }

  deleteService(id: number | string): void {
    const updated = this.services().filter(s => s.id !== id);
    this.services.set(updated);
    this.persistLocal(updated);

    if (typeof id === 'number') {
      this.http.delete(`${API}/${id}`).pipe(catchError(() => of(null))).subscribe();
    }
  }
}
