import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS } from '../end-points';
import {
  CategoryTagOfAggregatorDetail,
  CategoryTagOfAggregatorItem,
} from '../models/category-tag-of-aggregator.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryTagOfAggregatorApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getPaged(request: any): Observable<{ items: CategoryTagOfAggregatorItem[]; total: number }> {
    let params = new HttpParams();
    Object.keys(request).forEach((key) => {
      if (request[key] !== undefined && request[key] !== null) {
        params = params.set(key, request[key].toString());
      }
    });

    return this.http.get<{ items: CategoryTagOfAggregatorItem[]; total: number }>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.GET_PAGED}`,
      { params },
    );
  }

  getById(id: number): Observable<CategoryTagOfAggregatorDetail> {
    return this.http.get<CategoryTagOfAggregatorDetail>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.GET_BY_ID(id)}`,
    );
  }

  create(dto: any): Observable<CategoryTagOfAggregatorDetail> {
    return this.http.post<CategoryTagOfAggregatorDetail>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.CREATE}`,
      dto,
    );
  }

  update(dto: any): Observable<CategoryTagOfAggregatorDetail> {
    return this.http.put<CategoryTagOfAggregatorDetail>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.UPDATE(dto.id)}`,
      dto,
    );
  }

  delete(id: number, isHard = false): Observable<void> {
    let params = new HttpParams();
    if (isHard) params = params.set('isHard', 'true');
    return this.http.delete<void>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.DELETE(id)}`,
      { params },
    );
  }

  hardDelete(id: number): Observable<void> {
    return this.delete(id, true);
  }

  restore(id: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.RESTORE(id)}`,
      {},
    );
  }

  seedFromJson(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.SEED}`,
      {},
    );
  }

  clearDatabase(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS.CLEAR}`,
    );
  }
}
