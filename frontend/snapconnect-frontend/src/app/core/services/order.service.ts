import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Order, OrderCreateRequest, OrderListResponse, OrderStatus } from '../models/order.model';

const API = 'http://localhost:8080/api/orders';

@Injectable({ providedIn: 'root' })
export class OrderService {

  readonly orders    = signal<Order[]>([]);
  readonly total     = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getAll(params: { clientId?: string; creatorId?: string; page?: number } = {}): Observable<OrderListResponse> {
    this.isLoading.set(true);
    return this.http.get<OrderListResponse>(API, { params: params as any }).pipe(
      tap(res => {
        this.orders.set(res.orders);
        this.total.set(res.total);
        this.isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${API}/${id}`);
  }

  place(data: OrderCreateRequest): Observable<Order> {
    return this.http.post<Order>(API, data);
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${API}/${id}/status`, { status });
  }

  cancel(id: string): Observable<Order> {
    return this.updateStatus(id, 'CANCELLED');
  }
}
