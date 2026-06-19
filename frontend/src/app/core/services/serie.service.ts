import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AsignarDirectorRequest,
  Serie,
  SerieCreate,
  SerieUpdate,
} from '../models/serie.model';

@Injectable({
  providedIn: 'root',
})
export class SerieService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/series`;

  getAll(): Observable<Serie[]> {
    return this.http.get<Serie[]>(this.baseUrl);
  }

  getById(id: number): Observable<Serie> {
    return this.http.get<Serie>(`${this.baseUrl}/${id}`);
  }

  create(data: SerieCreate): Observable<Serie> {
    return this.http.post<Serie>(this.baseUrl, data);
  }

  update(id: number, data: SerieUpdate): Observable<Serie> {
    return this.http.put<Serie>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  assignDirector(
    serieId: number,
    directorId: number,
    data?: AsignarDirectorRequest
  ): Observable<Serie> {
    return this.http.post<Serie>(
      `${this.baseUrl}/${serieId}/directores/${directorId}`,
      data ?? {}
    );
  }

  unassignDirector(serieId: number, directorId: number): Observable<Serie> {
    return this.http.delete<Serie>(
      `${this.baseUrl}/${serieId}/directores/${directorId}`
    );
  }
}
