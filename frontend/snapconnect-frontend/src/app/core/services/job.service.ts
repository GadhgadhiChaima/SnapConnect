import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { Job, JobCreateRequest, JobListResponse, JobStatus } from '../models/job.model';
import { AuthService } from './auth.service';

const API = 'http://localhost:8080/api/jobs';
const STORAGE_KEY = 'snapconnect_jobs';

const INITIAL_JOBS: Job[] = [
  {
    id: 'jb-1',
    clientId: 'cl-1',
    clientName: 'Maison Alyssa Cosmétiques Bio',
    clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    clientRating: 4.9,
    categoryId: 'product-photography',
    categoryName: 'Product Photography',
    title: 'Besoin de 10 Photos Produits Esthétiques & 3 Reels Unboxing (iPhone 15/16)',
    description: 'Nous recherchons une créatrice mobile en Tunisie pour filmer un unboxing esthétique et des applications de texture pour notre nouvelle gamme de soins bio. Produits expédiés par voie postale.',
    budgetType: 'FIXED',
    budgetAmount: 250,
    budgetMin: 250,
    budgetMax: 250,
    deadline: '2026-09-01',
    location: 'À distance (Produits expédiés partout en Tunisie)',
    isRemote: true,
    requiredGear: 'iPhone 15/16 Pro avec Ring Light & 4K ProRes',
    requiredSkills: ['Soins UGC', 'Unboxing', 'Éclairage Studio', 'Mode Macro'],
    deliverables: ['10 Photos Haute Définition', '3 Reels Verticaux (9:16)'],
    proposalsCount: 7,
    status: 'OPEN',
    postedDate: '2026-08-12'
  },
  {
    id: 'jb-2',
    clientId: 'cl-2',
    clientName: 'Restaurant El Ali Médina',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    clientRating: 5.0,
    categoryId: 'food-restaurant',
    categoryName: 'Food & Restaurant',
    title: 'Vidéaste Mobile pour Service du Soir & Préparation Chef',
    description: 'Besoin d\'un créateur sur place pendant 2h le vendredi soir pour capturer les plats traditionnels tunisiens revisités, thés à la menthe et ambiance de la Médina.',
    budgetType: 'HOURLY',
    budgetMin: 40,
    budgetMax: 65,
    budgetAmount: 110,
    deadline: '2026-08-28',
    location: 'Tunis (Médina / Rue Jemaa Zitouna)',
    isRemote: false,
    requiredGear: 'Gimbal Stabilisateur + Smartphone 4K 60fps (iPhone / Galaxy Ultra)',
    requiredSkills: ['Vidéographie Culinaire', 'Basse Lumière Mobile', 'Speed Ramping'],
    deliverables: ['1 Master Reel 4K', '15 Clips Bruts B-Roll'],
    proposalsCount: 4,
    status: 'OPEN',
    postedDate: '2026-08-14'
  },
  {
    id: 'jb-3',
    clientId: 'cl-3',
    clientName: 'Streetwear Carthage Brand',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    clientRating: 4.8,
    categoryId: 'reels-tiktok',
    categoryName: 'Reels & TikTok',
    title: 'Drop Nouvelle Collection Streetwear — 5 TikToks Dynamiques',
    description: 'Recherche d\'un vidéaste mobile familier avec la culture urbaine pour créer des transitions rapides, plans portés et lookbook immersif à Tunis.',
    budgetType: 'FIXED',
    budgetAmount: 300,
    budgetMin: 300,
    budgetMax: 300,
    deadline: '2026-08-30',
    location: 'Tunis (Lac 2 / Marsa)',
    isRemote: false,
    requiredGear: 'iPhone / Galaxy Ultra avec Grand Angle & 4K 60fps',
    requiredSkills: ['Transitions Mode', 'Rythme Dynamique', 'Audio Tendance'],
    deliverables: ['5 TikToks Montés avec Synchro Audio'],
    proposalsCount: 9,
    status: 'OPEN',
    postedDate: '2026-08-15'
  },
  {
    id: 'jb-4',
    clientId: 'cl-4',
    clientName: 'California Gym Express Lac 2',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    clientRating: 4.95,
    categoryId: 'fashion-lifestyle',
    categoryName: 'Fashion & Lifestyle',
    title: 'Highlights Entraînement Crossfit — Reels Mobiles Dynamiques',
    description: 'Capture des séances d\'entraînement intensif, des équipements de pointe et des conseils coachs. Livraison rapide pour stories et réels quotidiens.',
    budgetType: 'FIXED',
    budgetAmount: 180,
    budgetMin: 180,
    budgetMax: 180,
    deadline: '2026-09-05',
    location: 'Tunis (Les Berges du Lac 2)',
    isRemote: false,
    requiredGear: 'Smartphone avec Mode Action / Stabilisateur',
    requiredSkills: ['Contenu Fitness', 'Suivi de Mouvement', 'Synchro Audio'],
    deliverables: ['3 Reels Instagram', '20 Photos Stills Stories HD'],
    proposalsCount: 5,
    status: 'OPEN',
    postedDate: '2026-08-16'
  }
];

export interface JobSearchParams {
  query?: string;
  categoryId?: string;
  budgetType?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  isRemote?: boolean;
  status?: JobStatus;
  clientId?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {

  readonly jobs       = signal<Job[]>(this.loadJobs());
  readonly total      = signal<number>(this.jobs().length);
  readonly currentJob = signal<Job | null>(null);
  readonly isLoading  = signal<boolean>(false);

  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  /** Force reload jobs from persistent storage */
  refresh(): Job[] {
    const list = this.loadJobs();
    this.jobs.set(list);
    this.total.set(list.length);
    return list;
  }

  search(params: JobSearchParams = {}): Observable<JobListResponse> {
    this.isLoading.set(true);
    let list = [...this.loadJobs()];
    this.jobs.set(list);

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.categoryName && j.categoryName.toLowerCase().includes(q)) ||
        (j.requiredGear && j.requiredGear.toLowerCase().includes(q))
      );
    }

    if (params.categoryId) {
      list = list.filter(j => j.categoryId === params.categoryId || j.categoryName === params.categoryId);
    }

    if (params.budgetType) {
      list = list.filter(j => j.budgetType === params.budgetType);
    }

    if (params.clientId) {
      list = list.filter(j => j.clientId === params.clientId);
    }

    if (params.isRemote !== undefined) {
      list = list.filter(j => j.isRemote === params.isRemote);
    }

    const response: JobListResponse = {
      jobs: list,
      total: list.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10
    };

    this.isLoading.set(false);
    return of(response);
  }

  getById(id: string): Observable<Job> {
    const currentList = this.loadJobs();
    const found = currentList.find(j => j.id === id) || this.jobs().find(j => j.id === id) || currentList[0];
    this.currentJob.set(found);
    return of(found);
  }

  getJobById(id: string): Observable<Job> {
    return this.getById(id);
  }

  create(data: JobCreateRequest): Observable<Job> {
    const currentUser = this.auth.currentUser();
    const newJob: Job = {
      id: `jb-${Date.now()}`,
      clientId: currentUser?.id ? String(currentUser.id) : 'cl-current',
      clientName: currentUser?.fullName || 'Entreprise Partenaire',
      clientAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      clientRating: 5.0,
      categoryId: data.categoryId || 'reels-tiktok',
      categoryName: data.category || (data.categoryId ? data.categoryId.replace('-', ' ') : 'General Mobile Shoot'),
      title: data.title,
      description: data.description,
      budgetType: data.budgetType || 'FIXED',
      budgetAmount: data.budgetAmount || (data.budgetType === 'FIXED' ? 250 : undefined),
      budgetMin: data.budgetMin || data.budgetAmount || 200,
      budgetMax: data.budgetMax || data.budgetAmount || 300,
      deadline: data.deadline || '2026-09-15',
      location: data.location || (data.isRemote ? 'Remote / Online' : 'On-Site'),
      isRemote: data.isRemote ?? true,
      requiredGear: data.requiredGear || 'iPhone 15/16 Pro or Samsung S24 Ultra (4K ProRes)',
      requiredSkills: data.requiredSkills || ['Mobile Shoot', '4K 60fps', 'Vertical 9:16'],
      deliverables: data.deliverables || ['Final 4K Edit', 'Raw Clips'],
      proposalsCount: 0,
      status: 'OPEN',
      postedDate: new Date().toISOString().split('T')[0]
    };

    const currentList = this.loadJobs();
    const updated = [newJob, ...currentList.filter(j => j.id !== newJob.id)];
    this.persistJobs(updated);
    this.jobs.set(updated);
    this.total.set(updated.length);

    return of(newJob);
  }

  createJob(data: JobCreateRequest): Observable<Job> {
    return this.create(data);
  }

  incrementProposalCount(jobId: string): void {
    const currentList = this.loadJobs();
    const list = currentList.map(j => {
      if (j.id === jobId) {
        return { ...j, proposalsCount: (j.proposalsCount || 0) + 1 };
      }
      return j;
    });
    this.persistJobs(list);
    this.jobs.set(list);
  }

  update(id: string, data: Partial<JobCreateRequest>): Observable<Job> {
    const currentList = this.loadJobs();
    const list = currentList.map(j => j.id === id ? { ...j, ...data } : j);
    this.persistJobs(list);
    this.jobs.set(list);
    const updated = list.find(j => j.id === id)!;
    return of(updated);
  }

  updateStatus(id: string, status: JobStatus): Observable<Job> {
    const currentList = this.loadJobs();
    const list = currentList.map(j => j.id === id ? { ...j, status } : j);
    this.persistJobs(list);
    this.jobs.set(list);
    const updated = list.find(j => j.id === id)!;
    return of(updated);
  }

  close(id: string): Observable<void> {
    this.updateStatus(id, 'COMPLETED');
    return of(void 0);
  }

  delete(id: string): Observable<void> {
    const currentList = this.loadJobs();
    const list = currentList.filter(j => j.id !== id);
    this.persistJobs(list);
    this.jobs.set(list);
    this.total.set(list.length);
    return of(void 0);
  }

  getByClientId(clientId: string): Observable<JobListResponse> {
    return this.search({ clientId });
  }

  private loadJobs(): Job[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    this.persistJobs(INITIAL_JOBS);
    return INITIAL_JOBS;
  }

  private persistJobs(jobs: Job[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {}
  }
}
