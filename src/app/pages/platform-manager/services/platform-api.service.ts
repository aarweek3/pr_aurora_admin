import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  PlatformCreateDto,
  PlatformDetailDto,
  PlatformPageRequest,
  PlatformPagedResponse,
  PlatformUpdateDto,
} from '../models/platform.model';

@Injectable({
  providedIn: 'root',
})
export class PlatformApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/platforms`;
  private cache = new Map<string, Observable<PlatformPagedResponse>>();

  constructor(private http: HttpClient) {}

  getPaged(request: PlatformPageRequest): Observable<PlatformPagedResponse> {
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
      if (request.sortDirection) params = params.set('sortDirection', request.sortDirection);

      const request$ = this.http.get<PlatformPagedResponse>(this.baseUrl, { params }).pipe(
        shareReplay(1),
        finalize(() => {
          setTimeout(() => this.cache.delete(cacheKey), 30000);
        }),
      );

      this.cache.set(cacheKey, request$);
    }

    return this.cache.get(cacheKey)!;
  }

  getById(id: string): Observable<PlatformDetailDto> {
    return this.http.get<PlatformDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: PlatformCreateDto): Observable<PlatformDetailDto> {
    this.clearCache();
    return this.http.post<PlatformDetailDto>(this.baseUrl, dto);
  }

  update(id: string, dto: PlatformUpdateDto): Observable<PlatformDetailDto> {
    this.clearCache();
    return this.http.put<PlatformDetailDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private clearCache(): void {
    this.cache.clear();
  }
}
