import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Payment, PaymentListResponse, EarningsSummary } from '../models/payment.model';

const API = 'http://localhost:8080/api/payments';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  readonly payments        = signal<Payment[]>([]);
  readonly total           = signal<number>(0);
  readonly earningsSummary = signal<EarningsSummary | null>(null);
  readonly isLoading       = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getAll(params: { userId?: string; page?: number; pageSize?: number } = {}): Observable<PaymentListResponse> {
    this.isLoading.set(true);
    return this.http.get<PaymentListResponse>(API, { params: params as any }).pipe(
      tap(res => {
        this.payments.set(res.payments);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getEarningsSummary(creatorId: string): Observable<EarningsSummary> {
    return this.http.get<EarningsSummary>(`${API}/earnings?creatorId=${creatorId}`).pipe(
      tap(summary => this.earningsSummary.set(summary))
    );
  }

  getById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${API}/${id}`);
  }
}
