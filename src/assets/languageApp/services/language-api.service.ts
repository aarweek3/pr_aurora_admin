import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable } from 'rxjs';
import { AppLanguage } from '../models/appLanguage.model';

/**
 * Сервис для прямого взаимодействия с Backend API управления языками.
 * Использует централизованную конфигурацию ApiEndpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageApiService {
  private http = inject(HttpClient);

  /**
   * Получить список всех языков
   * @param includeDisabled Включать ли отключенные языки
   */
  getAll(includeDisabled = true): Observable<AppLanguage[]> {
    const params = new HttpParams().set('includeDisabled', includeDisabled.toString());
    return this.http.get<AppLanguage[]>(ApiEndpoints.LANGUAGES_APP.BASE, { params });
  }

  /**
   * Получить только активные языки
   */
  getAvailable(): Observable<AppLanguage[]> {
    return this.http.get<AppLanguage[]>(ApiEndpoints.LANGUAGES_APP.AVAILABLE);
  }

  /**
   * Получить язык по ID
   */
  getById(id: number): Observable<AppLanguage> {
    return this.http.get<AppLanguage>(ApiEndpoints.LANGUAGES_APP.BY_ID(id));
  }

  /**
   * Создать новый язык
   */
  create(language: Partial<AppLanguage>): Observable<AppLanguage> {
    return this.http.post<AppLanguage>(ApiEndpoints.LANGUAGES_APP.BASE, language);
  }

  /**
   * Обновить существующий язык
   */
  update(id: number, language: Partial<AppLanguage>): Observable<AppLanguage> {
    return this.http.put<AppLanguage>(ApiEndpoints.LANGUAGES_APP.BY_ID(id), language);
  }

  /**
   * Удалить язык
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.LANGUAGES_APP.BY_ID(id));
  }

  /**
   * Установить язык по умолчанию
   */
  setDefault(id: number): Observable<void> {
    return this.http.post<void>(ApiEndpoints.LANGUAGES_APP.DEFAULT(id), {});
  }

  /**
   * Переключить статус языка
   */
  toggleStatus(id: number, enabled: boolean): Observable<void> {
    const params = new HttpParams().set('enabled', enabled.toString());
    return this.http.patch<void>(ApiEndpoints.LANGUAGES_APP.STATUS(id), {}, { params });
  }
}
