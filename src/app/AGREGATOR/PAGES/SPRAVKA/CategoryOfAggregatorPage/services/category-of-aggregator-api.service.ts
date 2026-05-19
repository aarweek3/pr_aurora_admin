import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  CategoryOfAggregatorItem,
  CategoryOfAggregatorDetail,
  CategoryOfAggregatorPageRequest,
  CategoryOfAggregatorPagedResponse,
} from '../models/category-of-aggregator.model';
import { CATEGORY_OF_AGGREGATOR_BASE_URL } from '../end-points';

@Injectable({
  providedIn: 'root',
})
export class CategoryOfAggregatorApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = CATEGORY_OF_AGGREGATOR_BASE_URL;

  getPaged(
    request: CategoryOfAggregatorPageRequest,
  ): Observable<CategoryOfAggregatorPagedResponse> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString())
      .set('sortBy', request.sortBy)
      .set('sortDirection', request.sortDirection.toString())
      .set('showDeleted', request.showDeleted.toString());

    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.languageId) params = params.set('languageId', request.languageId.toString());
    if (request.parentId) params = params.set('parentId', request.parentId.toString());

    return this.http.get<CategoryOfAggregatorPagedResponse>(this.baseUrl, { params });
  }

  getById(id: number): Observable<CategoryOfAggregatorDetail> {
    return this.http.get<CategoryOfAggregatorDetail>(`${this.baseUrl}/${id}`);
  }

  create(dto: any): Observable<CategoryOfAggregatorDetail> {
    return this.http.post<CategoryOfAggregatorDetail>(this.baseUrl, dto);
  }

  update(dto: any): Observable<CategoryOfAggregatorDetail> {
    return this.http.put<CategoryOfAggregatorDetail>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number, hardDelete = false): Observable<void> {
    const params = new HttpParams().set('hardDelete', hardDelete.toString());
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { params });
  }

  restore(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  seedFromJson(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/maintenance/seed`, {});
  }

  clearDatabase(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/maintenance/clear`, {});
  }

  // Получение дерева (если поддерживается бэкендом)
  getTree(languageId?: number, parentId?: number): Observable<CategoryOfAggregatorItem[]> {
    let params = new HttpParams();
    if (languageId) params = params.set('languageId', languageId.toString());
    if (parentId) params = params.set('parentId', parentId.toString());
    return this.http.get<CategoryOfAggregatorItem[]>(`${this.baseUrl}/tree`, { params });
  }

  getChildren(parentId: number | string): Observable<CategoryOfAggregatorItem[]> {
    const params = new HttpParams()
      .set('parentId', parentId.toString())
      .set('pageSize', '500')
      .set('sortBy', 'CanonicalName')
      .set('sortDirection', '0')
      .set('showDeleted', 'false');

    return this.http
      .get<CategoryOfAggregatorPagedResponse>(this.baseUrl, { params })
      .pipe(map((res) => res.items));
  }
}
