import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Director,
  DirectorCreate,
  DirectorUpdate,
} from '../models/director.model';

@Injectable({
  providedIn: 'root',
})
export class DirectorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/directores`;

  getAll(): Observable<Director[]> {
    return this.http.get<Director[]>(this.baseUrl);
  }

  getById(id: number): Observable<Director> {
    return this.http.get<Director>(`${this.baseUrl}/${id}`);
  }

  create(data: DirectorCreate): Observable<Director> {
    return this.http.post<Director>(this.baseUrl, data);
  }

  update(id: number, data: DirectorUpdate): Observable<Director> {
    return this.http.put<Director>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
