import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, HttpRequestOptions } from './base-http.service';

/**
 * Paginated Response Interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Query Parameters for List Operations
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * Base CRUD Service
 *
 * Абстрактный базовый класс для всех CRUD операций.
 * Предоставляет стандартные методы: getAll, getById, create, update, delete.
 *
 * @usage
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class UsersService extends BaseCrudService<User> {
 *   constructor() {
 *     super('/users');
 *   }
 * }
 * ```
 *
 * Использование в компоненте:
 * ```typescript
 * this.usersService.getAll({ page: 1, pageSize: 20 }).subscribe(response => {
 *   this.users = response.data;
 * });
 * ```
 */
export abstract class BaseCrudService<T> {
  protected readonly baseHttp = inject(BaseHttpService);

  /**
   * @param endpoint - Базовый endpoint для ресурса (например, '/users')
   */
  constructor(protected readonly endpoint: string) {}

  /**
   * Получить список всех записей с поддержкой пагинации и фильтрации
   */
  getAll(params?: QueryParams, options?: HttpRequestOptions): Observable<PaginatedResponse<T>> {
    const httpParams = this.buildQueryParams(params);
    return this.baseHttp.get<PaginatedResponse<T>>(this.endpoint, {
      ...options,
      params: httpParams,
    });
  }

  /**
   * Получить одну запись по ID
   */
  getById(id: string | number, options?: HttpRequestOptions): Observable<T> {
    return this.baseHttp.get<T>(`${this.endpoint}/${id}`, options);
  }

  /**
   * Создать новую запись
   */
  create(data: Partial<T>, options?: HttpRequestOptions): Observable<T> {
    return this.baseHttp.post<T>(this.endpoint, data, options);
  }

  /**
   * Обновить существующую запись (полное обновление)
   */
  update(id: string | number, data: Partial<T>, options?: HttpRequestOptions): Observable<T> {
    return this.baseHttp.put<T>(`${this.endpoint}/${id}`, data, options);
  }

  /**
   * Частично обновить запись
   */
  patch(id: string | number, data: Partial<T>, options?: HttpRequestOptions): Observable<T> {
    return this.baseHttp.patch<T>(`${this.endpoint}/${id}`, data, options);
  }

  /**
   * Удалить запись
   */
  delete(id: string | number, options?: HttpRequestOptions): Observable<void> {
    return this.baseHttp.delete<void>(`${this.endpoint}/${id}`, options);
  }

  /**
   * Массовое удаление записей
   */
  bulkDelete(ids: (string | number)[], options?: HttpRequestOptions): Observable<void> {
    return this.baseHttp.post<void>(`${this.endpoint}/bulk-delete`, { ids }, options);
  }

  /**
   * Поиск записей
   */
  search(
    query: string,
    params?: QueryParams,
    options?: HttpRequestOptions,
  ): Observable<PaginatedResponse<T>> {
    const httpParams = this.buildQueryParams({ ...params, search: query });
    return this.baseHttp.get<PaginatedResponse<T>>(`${this.endpoint}/search`, {
      ...options,
      params: httpParams,
    });
  }

  /**
   * Построение query параметров из объекта QueryParams
   */
  protected buildQueryParams(params?: QueryParams): Record<string, any> {
    if (!params) return {};

    const httpParams: Record<string, any> = {};

    if (params.page !== undefined) httpParams['page'] = params.page.toString();
    if (params.pageSize !== undefined) httpParams['pageSize'] = params.pageSize.toString();
    if (params.sortBy) httpParams['sortBy'] = params.sortBy;
    if (params.sortOrder) httpParams['sortOrder'] = params.sortOrder;
    if (params.search) httpParams['search'] = params.search;

    // Добавляем фильтры
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams[key] = value.toString();
        }
      });
    }

    return httpParams;
  }

  /**
   * Экспорт данных в CSV/Excel (опционально)
   */
  export(
    format: 'csv' | 'excel',
    params?: QueryParams,
    options?: HttpRequestOptions,
  ): Observable<Blob> {
    const httpParams = this.buildQueryParams(params);
    return this.baseHttp.get<Blob>(`${this.endpoint}/export/${format}`, {
      ...options,
      params: httpParams,
      responseType: 'blob' as any,
    });
  }
}
