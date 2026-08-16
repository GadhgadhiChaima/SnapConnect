import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Review, ReviewSubmitRequest, ReviewListResponse, ReviewSummary } from '../models/review.model';

const API = 'http://localhost:8080/api/reviews';

@Injectable({ providedIn: 'root' })
export class ReviewService {

  readonly reviews   = signal<Review[]>([]);
  readonly total     = signal<number>(0);
  readonly summary   = signal<ReviewSummary | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getByRecipientId(recipientId: string, page = 1, pageSize = 10): Observable<ReviewListResponse> {
    this.isLoading.set(true);
    const hp = new HttpParams()
      .set('recipientId', recipientId)
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<ReviewListResponse>(API, { params: hp }).pipe(
      tap(res => {
        this.reviews.set(res.reviews);
        this.total.set(res.total);
        if (res.summary) this.summary.set(res.summary);
        this.isLoading.set(false);
      })
    );
  }

  getByContractId(contractId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${API}?contractId=${contractId}`);
  }

  submit(data: ReviewSubmitRequest): Observable<Review> {
    return this.http.post<Review>(API, data);
  }
}
