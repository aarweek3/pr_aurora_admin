import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable } from 'rxjs';
import { LanguageAggregator } from '../models/language-aggregator.model';

/**
 * Сервис для взаимодействия с API языков агрегатора.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageAggregatorApiService {
  private http = inject(HttpClient);

  /**
   * Получить все языки агрегатора
   */
  getAll(includeDisabled = true): Observable<LanguageAggregator[]> {
    const params = new HttpParams().set('includeDisabled', includeDisabled.toString());
    return this.http.get<LanguageAggregator[]>(ApiEndpoints.AGGREGATOR_LANGUAGES.BASE, { params });
  }

  /**
   * Получить доступные языки
   */
  getAvailable(): Observable<LanguageAggregator[]> {
    return this.http.get<LanguageAggregator[]>(ApiEndpoints.AGGREGATOR_LANGUAGES.AVAILABLE);
  }

  /**
   * Получить по ID
   */
  getById(id: number): Observable<LanguageAggregator> {
    return this.http.get<LanguageAggregator>(ApiEndpoints.AGGREGATOR_LANGUAGES.BY_ID(id));
  }

  /**
   * Создать новый язык
   */
  create(payload: Partial<LanguageAggregator>): Observable<LanguageAggregator> {
    return this.http.post<LanguageAggregator>(ApiEndpoints.AGGREGATOR_LANGUAGES.BASE, payload);
  }

  /**
   * Обновить язык
   */
  update(id: number, payload: Partial<LanguageAggregator>): Observable<LanguageAggregator> {
    return this.http.put<LanguageAggregator>(ApiEndpoints.AGGREGATOR_LANGUAGES.BY_ID(id), payload);
  }

  /**
   * Удалить язык
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.AGGREGATOR_LANGUAGES.BY_ID(id));
  }

  /**
   * Установить по умолчанию
   */
  setDefault(id: number): Observable<void> {
    return this.http.post<void>(ApiEndpoints.AGGREGATOR_LANGUAGES.DEFAULT(id), {});
  }

  /**
   * Переключить статус
   */
  toggleStatus(id: number, enabled: boolean): Observable<void> {
    const params = new HttpParams().set('enabled', enabled.toString());
    return this.http.patch<void>(ApiEndpoints.AGGREGATOR_LANGUAGES.STATUS(id), {}, { params });
  }

  /**
   * Hard Reset
   */
  hardReset(): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.AGGREGATOR_LANGUAGES.HARD_RESET);
  }

  /**
   * Initialize
   */
  initialize(): Observable<void> {
    return this.http.post<void>(ApiEndpoints.AGGREGATOR_LANGUAGES.INITIALIZE, {});
  }
}
