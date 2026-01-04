import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * HTTP Request Options
 */
export interface HttpRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?:
    | HttpParams
    | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  observe?: 'body' | 'response';
  reportProgress?: boolean;
  withCredentials?: boolean;
}

/**
 * Base HTTP Service
 *
 * Унифицированный сервис для работы с HTTP запросами.
 * Предоставляет централизованную точку для всех HTTP операций с:
 * - Автоматическим формированием URL (baseUrl + endpoint)
 * - Стандартизированной обработкой headers
 * - Типизированными запросами
 * - Интеграцией с HttpErrorInterceptor
 *
 * @usage
 * ```typescript
 * constructor(private baseHttp: BaseHttpService) {}
 *
 * getUsers(): Observable<User[]> {
 *   return this.baseHttp.get<User[]>('/users');
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.baseUrl;

  /**
   * Построение полного URL
   */
  protected buildUrl(endpoint: string): string {
    // Убираем дублирование слешей
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  /**
   * GET запрос
   */
  get<T>(endpoint: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), options as any) as Observable<T>;
  }

  /**
   * POST запрос
   */
  post<T>(endpoint: string, body: any, options?: HttpRequestOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, options as any) as Observable<T>;
  }

  /**
   * PUT запрос
   */
  put<T>(endpoint: string, body: any, options?: HttpRequestOptions): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, options as any) as Observable<T>;
  }

  /**
   * PATCH запрос
   */
  patch<T>(endpoint: string, body: any, options?: HttpRequestOptions): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, options as any) as Observable<T>;
  }

  /**
   * DELETE запрос
   */
  delete<T>(endpoint: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), options as any) as Observable<T>;
  }

  /**
   * GET запрос с параметрами (helper метод)
   */
  getWithParams<T>(endpoint: string, params: { [key: string]: any }): Observable<T> {
    return this.get<T>(endpoint, { params });
  }

  /**
   * GET запрос с заголовками (helper метод)
   */
  getWithHeaders<T>(endpoint: string, headers: { [key: string]: string }): Observable<T> {
    return this.get<T>(endpoint, { headers });
  }
}
