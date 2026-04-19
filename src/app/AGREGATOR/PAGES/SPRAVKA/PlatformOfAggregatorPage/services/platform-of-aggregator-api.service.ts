import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { PLATFORM_OF_AGGREGATOR_BASE_URL } from '../end-points';
import {
  PlatformOfAggregatorCreateDto,
  PlatformOfAggregatorDetailDto,
  PlatformOfAggregatorPageRequestDto,
  PlatformOfAggregatorPagedResponseDto,
  PlatformOfAggregatorUpdateDto,
} from '../models/platform-of-aggregator.model';

@Injectable({
  providedIn: 'root',
})
export class PlatformOfAggregatorApiService {
  private readonly baseUrl = `${environment.apiUrl}/${PLATFORM_OF_AGGREGATOR_BASE_URL}`;
  private cache = new Map<string, Observable<PlatformOfAggregatorPagedResponseDto>>();

  constructor(private http: HttpClient) {}

  getPaged(request: PlatformOfAggregatorPageRequestDto): Observable<PlatformOfAggregatorPagedResponseDto> {
    const cacheKey = JSON.stringify(
      Object.keys(request)
        .sort()
        .reduce((obj: any, key) => {
          obj[key] = (request as any)[key];
          return obj;
        }, {}),
    );

    if (!this.cache.has(cacheKey)) {
      let params = new HttpParams()
        .set('pageNumber', request.pageNumber.toString())
        .set('pageSize', request.pageSize.toString());

      if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
      if (request.languageId) params = params.set('languageId', request.languageId.toString());
      if (request.sortBy) params = params.set('sortBy', request.sortBy);
      if (request.sortDirection !== undefined) params = params.set('sortDirection', request.sortDirection.toString());
      if (request.showDeleted) params = params.set('showDeleted', 'true');

      const request$ = this.http.get<PlatformOfAggregatorPagedResponseDto>(this.baseUrl, { params }).pipe(
        shareReplay(1),
        finalize(() => {
          setTimeout(() => this.cache.delete(cacheKey), 30000);
        }),
      );

      this.cache.set(cacheKey, request$);
    }

    return this.cache.get(cacheKey)!;
  }

  getById(id: number): Observable<PlatformOfAggregatorDetailDto> {
    return this.http.get<PlatformOfAggregatorDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: PlatformOfAggregatorCreateDto): Observable<PlatformOfAggregatorDetailDto> {
    this.clearCache();
    return this.http.post<PlatformOfAggregatorDetailDto>(this.baseUrl, dto);
  }

  update(id: number, dto: PlatformOfAggregatorUpdateDto): Observable<PlatformOfAggregatorDetailDto> {
    this.clearCache();
    return this.http.put<PlatformOfAggregatorDetailDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number, isHard: boolean = false): Observable<void> {
    this.clearCache();
    let params = new HttpParams();
    if (isHard) params = params.set('isHard', 'true');
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { params });
  }

  clearDatabase(): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.baseUrl}/maintenance/clear`);
  }

  restore(id: number): Observable<void> {
    this.clearCache();
    return this.http.post<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  seedFromJson(): Observable<{ message: string }> {
    this.clearCache();
    return this.http.post<{ message: string }>(`${this.baseUrl}/maintenance/seed`, {});
  }

  private clearCache(): void {
    this.cache.clear();
  }
}
