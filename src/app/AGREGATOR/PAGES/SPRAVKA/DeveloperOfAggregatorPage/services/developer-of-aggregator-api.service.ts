import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DeveloperOfAggregatorPageRequest,
  DeveloperOfAggregatorPagedResponse,
  DeveloperOfAggregatorDetail,
} from '../models/developer-of-aggregator.model';
import { environment } from '../../../../../../environments/environment';
import { DEVELOPER_OF_AGGREGATOR_BASE_URL } from '../end-points';

@Injectable({
  providedIn: 'root',
})
export class DeveloperOfAggregatorApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/${DEVELOPER_OF_AGGREGATOR_BASE_URL}`;

  getPaged(
    request: DeveloperOfAggregatorPageRequest,
  ): Observable<DeveloperOfAggregatorPagedResponse> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString())
      .set('sortDirection', request.sortDirection.toString())
      .set('showDeleted', request.showDeleted.toString());

    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.languageId) params = params.set('languageId', request.languageId.toString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);

    return this.http.get<DeveloperOfAggregatorPagedResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<DeveloperOfAggregatorDetail> {
    return this.http.get<DeveloperOfAggregatorDetail>(`${this.apiUrl}/${id}`);
  }

  create(dto: any): Observable<DeveloperOfAggregatorDetail> {
    return this.http.post<DeveloperOfAggregatorDetail>(this.apiUrl, dto);
  }

  update(dto: any): Observable<DeveloperOfAggregatorDetail> {
    const id = dto.id;
    return this.http.put<DeveloperOfAggregatorDetail>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number, isHard = false): Observable<void> {
    let params = new HttpParams();
    if (isHard) params = params.set('isHard', 'true');
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  restore(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/restore`, {});
  }

  seedFromJson(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/maintenance/seed`, {});
  }

  clearDatabase(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/maintenance/clear`);
  }
}
