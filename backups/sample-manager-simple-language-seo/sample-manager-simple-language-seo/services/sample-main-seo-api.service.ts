import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  SampleMainSeoCreateDto,
  SampleMainSeoDetailDto,
  SampleMainSeoPageRequest,
  SampleMainSeoPagedResponse,
  SampleMainSeoUpdateDto,
} from '../models/sample-main-seo.model';

@Injectable({
  providedIn: 'root',
})
export class SampleMainSeoApiService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/api/v1/samples-main-seo`;
  private cache = new Map<string, Observable<SampleMainSeoPagedResponse>>();

  getPaged(request: SampleMainSeoPageRequest): Observable<SampleMainSeoPagedResponse> {
    // Формируем ключ для кеша на основе параметров запроса
    // Отсортируем ключи объекта, чтобы порядок не влиял на хеш
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

      const request$ = this.http.get<SampleMainSeoPagedResponse>(this.baseUrl, { params }).pipe(
        shareReplay(1), // Кешируем последний (единственный) ответ
        finalize(() => {
          // Удаляем из кеша через 30 секунд или при следующей попытке, если нужно "живое" обновление.
          // В данном случае просто держим в памяти.
          // Но для "умного" кеша лучше таймер.
          setTimeout(() => this.cache.delete(cacheKey), 30000); // Кеш на 30 сек
        }),
      );

      this.cache.set(cacheKey, request$);
    }

    return this.cache.get(cacheKey)!;
  }

  getById(id: number): Observable<SampleMainSeoDetailDto> {
    return this.http.get<SampleMainSeoDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: SampleMainSeoCreateDto): Observable<SampleMainSeoDetailDto> {
    this.clearCache(); // Инвалидируем кеш при изменении данных
    return this.http.post<SampleMainSeoDetailDto>(this.baseUrl, dto);
  }

  update(id: number, dto: SampleMainSeoUpdateDto): Observable<SampleMainSeoDetailDto> {
    this.clearCache(); // Инвалидируем кеш при изменении данных
    return this.http.put<SampleMainSeoDetailDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    this.clearCache(); // Инвалидируем кеш при изменении данных
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private clearCache(): void {
    this.cache.clear();
  }
}
