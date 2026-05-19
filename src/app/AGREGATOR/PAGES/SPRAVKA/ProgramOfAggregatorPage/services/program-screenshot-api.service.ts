import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  ScreenshotOfAggregator,
  ScreenshotOfAggregatorPageRequest,
  ScreenshotOfAggregatorPagedResponse,
  ScreenshotOfAggregatorSync,
  ScreenshotUploadResponse
} from '../models/screenshot-of-aggregator.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramScreenshotApiService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/api/v1/aggregator/programs/screenshots`;

  getPaged(request: ScreenshotOfAggregatorPageRequest): Observable<ScreenshotOfAggregatorPagedResponse> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.languageId) params = params.set('languageId', request.languageId.toString());
    if (request.showDeleted) params = params.set('showDeleted', 'true');
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDirection !== undefined && request.sortDirection !== null)
      params = params.set('sortDirection', request.sortDirection.toString());

    return this.http.get<ScreenshotOfAggregatorPagedResponse>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ScreenshotOfAggregator> {
    return this.http.get<ScreenshotOfAggregator>(`${this.baseUrl}/${id}`);
  }

  create(dto: any): Observable<ScreenshotOfAggregator> {
    return this.http.post<ScreenshotOfAggregator>(this.baseUrl, dto);
  }

  update(id: number, dto: any): Observable<ScreenshotOfAggregator> {
    return this.http.put<ScreenshotOfAggregator>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadScreenshot(file: File, tempGuid?: string, programSlug?: string): Observable<ScreenshotUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (tempGuid) {
      formData.append('tempGuid', tempGuid);
    }
    if (programSlug) {
      formData.append('programSlug', programSlug);
    }
    return this.http.post<ScreenshotUploadResponse>(`${this.baseUrl}/upload`, formData);
  }

  syncScreenshots(programId: number, screenshots: ScreenshotOfAggregatorSync[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sync/${programId}`, screenshots);
  }

  clearAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/maintenance/clear`);
  }

  seedFromJson(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/maintenance/seed`, {});
  }
}
