import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { CreatorProfile, CreatorListResponse, Equipment } from '../models/creator.model';

const API = 'http://localhost:8080/api/creators';

export interface CreatorSearchParams {
  query?: string;
  categoryId?: string;
  location?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  availableOnly?: boolean;
  smartphoneModel?: string;
  verified?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class CreatorService {

  readonly creators  = signal<CreatorProfile[]>([]);
  readonly total     = signal<number>(0);
  readonly profile   = signal<CreatorProfile | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  search(params: CreatorSearchParams = {}): Observable<CreatorListResponse> {
    this.isLoading.set(true);
    let hp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') hp = hp.set(k, String(v));
    });
    return this.http.get<CreatorListResponse>(API, { params: hp }).pipe(
      tap(res => {
        this.creators.set(res.creators);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<CreatorProfile> {
    return this.http.get<any>(`${API}/${id}`).pipe(
      map(data => this.mapUserToCreatorProfile(data)),
      tap(c => this.profile.set(c))
    );
  }

  getCreatorById(id: string): Observable<CreatorProfile> {
    return this.getById(id);
  }

  /**
   * Transforms any user or UserDto from MySQL / session into a typed CreatorProfile.
   */
  mapUserToCreatorProfile(user: any): CreatorProfile {
    const id = String(user.id || 'cr-new');
    let localExtra: any = {};
    try {
      const raw = localStorage.getItem('snapconnect_creator_profile_' + id);
      if (raw) localExtra = JSON.parse(raw);
    } catch {}

    const fullName = user.fullName || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.email ? user.email.split('@')[0] : 'Créateur Mobile'));
    const title = user.title || localExtra.title || 'Vidéaste Mobile 4K & UGC';
    const bio = user.bio || localExtra.bio || 'Créateur de contenu smartphone certifié SnapConnect, disponible pour tournages vidéos et shootings photos en Tunisie.';
    const location = user.location || localExtra.location || 'Tunis, Tunisie';
    const smartphoneModel = user.smartphoneModel || localExtra.smartphoneModel || 'iPhone 16 Pro Max';
    const hourlyRate = Number(user.hourlyRate || localExtra.hourlyRate || (user.dailyRate ? Math.round(user.dailyRate / 6) : 45));
    const dailyRate = Number(user.dailyRate || localExtra.dailyRate || (user.hourlyRate ? user.hourlyRate * 6 : 270));
    const avatarUrl = user.avatarUrl || localExtra.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

    let specializations = ['Reels & TikTok', 'UGC Content', 'Fashion'];
    const lowerTitle = `${title} ${user.contentFormat || ''}`.toLowerCase();
    if (lowerTitle.includes('food') || lowerTitle.includes('resto') || lowerTitle.includes('gastro')) {
      specializations = ['Food & Restaurant', 'Product Photo', 'Reels & TikTok'];
    } else if (lowerTitle.includes('immo') || lowerTitle.includes('archi')) {
      specializations = ['Real Estate', 'Commercials', 'Events'];
    } else if (lowerTitle.includes('event') || lowerTitle.includes('soirée') || lowerTitle.includes('mariage')) {
      specializations = ['Events & Moments', 'Reels & TikTok'];
    } else if (lowerTitle.includes('auto') || lowerTitle.includes('voiture')) {
      specializations = ['Promo Video', 'Fashion', 'Events'];
    } else if (lowerTitle.includes('photo') || lowerTitle.includes('packshot')) {
      specializations = ['Product Photography', 'UGC Content', 'Fashion'];
    }

    return {
      id: id,
      userId: id,
      fullName: fullName,
      email: user.email || '',
      avatarUrl: avatarUrl,
      title: title,
      bio: bio,
      location: location,
      hourlyRate: hourlyRate,
      dailyRate: dailyRate,
      availabilityStatus: 'AVAILABLE',
      rating: 5.0,
      reviewsCount: user.reviewsCount ?? 1,
      completedProjectsCount: user.completedProjectsCount ?? 1,
      isVerified: true,
      verifiedCreator: true,
      specializations: specializations,
      equipment: {
        smartphoneModel: smartphoneModel,
        gimbal: 'DJI Osmo Mobile 6',
        audioGear: 'Micro HF Sans Fil 48kHz'
      }
    };
  }

  /**
   * Fetches all registered creators from backend MySQL database.
   */
  getRegisteredCreators(): Observable<CreatorProfile[]> {
    return this.http.get<any[]>(API).pipe(
      map(list => {
        if (!Array.isArray(list)) return [];
        return list.map(u => this.mapUserToCreatorProfile(u));
      }),
      catchError(() => {
        return this.http.get<any[]>('http://localhost:8080/api/users/creators').pipe(
          map(list => {
            if (!Array.isArray(list)) return [];
            return list.map(u => this.mapUserToCreatorProfile(u));
          }),
          catchError(() => of([]))
        );
      })
    );
  }

  /**
   * Retrieves locally stored creator profiles from localStorage.
   */
  getLocalCreators(): CreatorProfile[] {
    const list: CreatorProfile[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('snapconnect_creator_profile_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.role === 'CREATOR' || parsed.fullName || parsed.title)) {
              list.push(this.mapUserToCreatorProfile(parsed));
            }
          }
        }
      }
    } catch {}
    return list;
  }

  updateProfile(id: string, data: Partial<CreatorProfile>): Observable<CreatorProfile> {
    return this.http.patch<CreatorProfile>(`${API}/${id}`, data).pipe(
      tap(c => this.profile.set(c))
    );
  }

  updateEquipment(creatorId: string, equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${API}/${creatorId}/equipment`, equipment);
  }

  updateAvailability(creatorId: string, status: string): Observable<CreatorProfile> {
    return this.http.patch<CreatorProfile>(`${API}/${creatorId}/availability`, { status });
  }
}

