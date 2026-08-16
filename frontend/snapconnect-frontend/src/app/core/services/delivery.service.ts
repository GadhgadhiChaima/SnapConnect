import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Delivery } from '../models/contract.model';

const API = 'http://localhost:8080/api/deliveries';

export interface DeliverySubmitRequest {
  contractId: string;
  note?: string;
  attachments?: { url: string; name: string; type: string }[];
  links?: string[];
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {

  constructor(private http: HttpClient) {}

  submit(data: DeliverySubmitRequest): Observable<Delivery> {
    return this.http.post<Delivery>(API, data);
  }

  approve(deliveryId: string): Observable<Delivery> {
    return this.http.patch<Delivery>(`${API}/${deliveryId}/approve`, {});
  }

  requestRevision(deliveryId: string, note: string): Observable<Delivery> {
    return this.http.patch<Delivery>(`${API}/${deliveryId}/revision`, { note });
  }

  resubmit(deliveryId: string, data: Partial<DeliverySubmitRequest>): Observable<Delivery> {
    return this.http.patch<Delivery>(`${API}/${deliveryId}/resubmit`, data);
  }

  getByContractId(contractId: string): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${API}?contractId=${contractId}`);
  }
}
