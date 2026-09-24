import { Injectable, signal, computed } from '@angular/core';
import { CreatorService, CreatorSearchParams } from './creator.service';
import { JobService, JobSearchParams } from './job.service';
import { CreatorProfile } from '../models/creator.model';
import { Job } from '../models/job.model';

export type SearchContext = 'CREATOR' | 'JOB';
export type SearchResult  = CreatorProfile | Job;

export interface FilterState {
  query:      string;
  categoryId: string;
  location:   string;
  minPrice:   number | null;
  maxPrice:   number | null;
  minRating:  number | null;
  sort:       string;
  page:       number;
  pageSize:   number;
  [key: string]: any;
}

const DEFAULT_FILTERS: FilterState = {
  query:      '',
  categoryId: '',
  location:   '',
  minPrice:   null,
  maxPrice:   null,
  minRating:  null,
  sort:       'relevant',
  page:       1,
  pageSize:   12,
};

/**
 * Unified search service — feeds creator and job marketplace pages.
 * Components provide a context ('CREATOR' | 'JOB') and this service
 * delegates to the appropriate domain service.
 */
@Injectable({ providedIn: 'root' })
export class MarketplaceSearchService {

  readonly context = signal<SearchContext>('CREATOR');
  readonly filters = signal<FilterState>({ ...DEFAULT_FILTERS });
  readonly results = signal<SearchResult[]>([]);
  readonly total   = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  readonly hasResults  = computed(() => this.results().length > 0);
  readonly totalPages  = computed(() => Math.ceil(this.total() / this.filters().pageSize));

  constructor(
    private creatorSvc: CreatorService,
    private jobSvc:     JobService,
  ) {}

  setContext(ctx: SearchContext): void {
    this.context.set(ctx);
    this.resetFilters();
  }

  updateFilter(key: keyof FilterState, value: any): void {
    this.filters.update(f => ({ ...f, [key]: value, page: 1 }));
    this.search();
  }

  setPage(page: number): void {
    this.filters.update(f => ({ ...f, page }));
    this.search();
  }

  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.results.set([]);
    this.total.set(0);
  }

  search(): void {
    const f   = this.filters();
    const ctx = this.context();

    if (ctx === 'CREATOR') {
      const params: CreatorSearchParams = {
        query:      f.query       || undefined,
        categoryId: f.categoryId  || undefined,
        location:   f.location    || undefined,
        minRate:    f.minPrice    ?? undefined,
        maxRate:    f.maxPrice    ?? undefined,
        minRating:  f.minRating   ?? undefined,
        page:       f.page,
        pageSize:   f.pageSize,
        sort:       f.sort,
      };
      this.creatorSvc.search(params).subscribe(res => {
        this.results.set(res.creators);
        this.total.set(res.total);
      });

    } else {
      const params: JobSearchParams = {
        query:      f.query       || undefined,
        categoryId: f.categoryId  || undefined,
        location:   f.location    || undefined,
        budgetMin:  f.minPrice    ?? undefined,
        budgetMax:  f.maxPrice    ?? undefined,
        page:       f.page,
        pageSize:   f.pageSize,
        sort:       f.sort,
      };
      this.jobSvc.search(params).subscribe(res => {
        this.results.set(res.jobs);
        this.total.set(res.total);
      });
    }
  }
}

