import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { TAG_OF_AGGREGATOR_ENDPOINTS } from '../end-points';
import { TagOfAggregatorDetail, TagOfAggregatorItem } from '../models/tag-of-aggregator.model';

@Injectable({
  providedIn: 'root',
})
export class TagOfAggregatorApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getPaged(request: any): Observable<{ items: TagOfAggregatorItem[]; total: number }> {
    let params = new HttpParams();
    Object.keys(request).forEach((key) => {
      if (request[key] !== undefined && request[key] !== null) {
        params = params.set(key, request[key].toString());
      }
    });

    return this.http.get<{ items: TagOfAggregatorItem[]; total: number }>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.GET_PAGED}`,
      { params },
    );
  }

  getById(id: number): Observable<TagOfAggregatorDetail> {
    return this.http.get<TagOfAggregatorDetail>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.GET_BY_ID(id)}`,
    );
  }

  create(dto: any): Observable<TagOfAggregatorDetail> {
    return this.http.post<TagOfAggregatorDetail>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.CREATE}`,
      dto,
    );
  }

  update(dto: any): Observable<TagOfAggregatorDetail> {
    return this.http.put<TagOfAggregatorDetail>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.UPDATE(dto.id)}`,
      dto,
    );
  }

  delete(id: number, isHard: boolean = false): Observable<void> {
    let params = new HttpParams();
    if (isHard) params = params.set('isHard', 'true');
    return this.http.delete<void>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.DELETE(id)}`,
      { params }
    );
  }

  hardDelete(id: number): Observable<void> {
    return this.delete(id, true);
  }

  restore(id: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.RESTORE(id)}`,
      {},
    );
  }

  updateSortOrder(id: number, newSortOrder: number): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.UPDATE_SORT_ORDER(id)}`,
      newSortOrder,
    );
  }

  seedFromJson(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.SEED}`,
      {},
    );
  }

  clearDatabase(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${TAG_OF_AGGREGATOR_ENDPOINTS.CLEAR}`,
    );
  }
}
