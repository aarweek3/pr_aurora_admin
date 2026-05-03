import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { 
  ProgramOfAggregatorItem, 
  ProgramOfAggregatorDetail, 
  ProgramOfAggregatorCreate, 
  ProgramOfAggregatorUpdate,
  VersionOfAggregatorItem,
  VersionOfAggregatorDetail,
  VersionOfAggregatorCreate,
  VersionOfAggregatorUpdate
} from '../models/program-of-aggregator.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramOfAggregatorApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/aggregator/programs`;

  constructor(private http: HttpClient) {}

  getPaged(request: any): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber?.toString() || '1')
      .set('pageSize', request.pageSize?.toString() || '10');

    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.languageId) params = params.set('languageId', request.languageId?.toString());
    if (request.categoryId) params = params.set('categoryId', request.categoryId?.toString());
    if (request.platformId) params = params.set('platformId', request.platformId?.toString());
    if (request.developerId) params = params.set('developerId', request.developerId?.toString());
    if (request.status !== undefined && request.status !== null) params = params.set('status', request.status.toString());
    if (request.showDeleted) params = params.set('showDeleted', 'true');
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDirection !== undefined && request.sortDirection !== null) params = params.set('sortDirection', request.sortDirection.toString());

    return this.http.get<any>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ProgramOfAggregatorDetail> {
    return this.http.get<ProgramOfAggregatorDetail>(`${this.baseUrl}/${id}`);
  }

  create(dto: ProgramOfAggregatorCreate): Observable<number> {
    return this.http.post<number>(this.baseUrl, dto);
  }

  update(id: number, dto: ProgramOfAggregatorUpdate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number, hardDelete: boolean = false): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}?hardDelete=${hardDelete}`);
  }

  restore(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  seedFromJson(): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${this.baseUrl}/seed-from-json`, {});
  }

  syncIcons(): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${this.baseUrl}/sync-icons`, {});
  }

  syncScreenshots(): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${this.baseUrl}/sync-screenshots`, {});
  }

  clearDatabase(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/maintenance/clear`, {});
  }

  // Versions
  getVersions(programId: number): Observable<VersionOfAggregatorItem[]> {
    return this.http.get<VersionOfAggregatorItem[]>(`${this.baseUrl}/${programId}/versions`);
  }

  getVersionById(id: number): Observable<VersionOfAggregatorDetail> {
    return this.http.get<VersionOfAggregatorDetail>(`${this.baseUrl}/versions/${id}`);
  }

  createVersion(dto: any): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/versions`, dto);
  }

  updateVersion(id: number, dto: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/versions/${id}`, dto);
  }

  deleteVersion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/versions/${id}`);
  }
}
