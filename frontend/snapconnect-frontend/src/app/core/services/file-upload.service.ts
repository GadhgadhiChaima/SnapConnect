import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.apiUrl + '/uploads'; // e.g., http://localhost:8080/api/uploads

  constructor(private http: HttpClient) {}

  uploadPortfolio(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/portfolio`, formData).pipe(
      map(res => res.url)
    );
  }

  uploadDeliverable(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/deliverables`, formData).pipe(
      map(res => res.url)
    );
  }
}
