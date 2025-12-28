// src/app/auth/services/user-api.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '@environments/api-endpoints';
import { LoggingService } from '@shared/infrastructure/logging/logging.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  UserListItemDto,
  UserSearchResultDto,
  UserStatisticsDto,
} from '../../models';

/**
 * Сервис для работы с Users API
 */
@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggingService);

  /**
   * Получить пользователя по ID
   */
  getUserById(id: string): Observable<{ success: boolean; data: UserListItemDto }> {
    this.logger.debug('UserApiService', 'Получение пользователя по ID', { id });
    return this.http.get<{ success: boolean; data: UserListItemDto }>(ApiEndpoints.USERS.BY_ID(id));
  }

  /**
   * Получить пользователя по email
   */
  getUserByEmail(email: string): Observable<{ success: boolean; data: UserListItemDto }> {
    this.logger.debug('UserApiService', 'Получение пользователя по email', { email });
    return this.http.get<{ success: boolean; data: UserListItemDto }>(
      ApiEndpoints.USERS.BY_EMAIL(email),
    );
  }

  /**
   * Создать нового пользователя (только для админа)
   */
  createUser(
    data: CreateUserDto,
  ): Observable<{ success: boolean; message: string; data?: string }> {
    this.logger.debug('UserApiService', 'Создание пользователя', { data });
    return this.http.post<{ success: boolean; message: string; data?: string }>(
      ApiEndpoints.USERS.BASE,
      data,
    );
  }

  /**
   * Обновить пользователя
   */
  updateUser(id: string, data: UpdateUserDto): Observable<{ success: boolean; message: string }> {
    this.logger.debug('UserApiService', 'Обновление пользователя', { id, data });
    return this.http.put<{ success: boolean; message: string }>(ApiEndpoints.USERS.BY_ID(id), data);
  }

  /**
   * Деактивировать пользователя (только для админа)
   */
  deactivateUser(id: string): Observable<{ success: boolean; message: string }> {
    this.logger.debug('UserApiService', 'Деактивация пользователя', { id });
    return this.http.post<{ success: boolean; message: string }>(
      ApiEndpoints.USERS.DEACTIVATE(id),
      {},
    );
  }

  /**
   * Активировать пользователя (только для админа)
   */
  activateUser(id: string): Observable<{ success: boolean; message: string }> {
    this.logger.debug('UserApiService', 'Активация пользователя', { id });
    return this.http.post<{ success: boolean; message: string }>(
      ApiEndpoints.USERS.ACTIVATE(id),
      {},
    );
  }

  /**
   * Получить список пользователей с фильтрацией (только для админа)
   */
  getUsers(
    filter: UserFilterDto,
  ): Observable<{ success: boolean; data: { data: UserListItemDto[]; totalCount: number } }> {
    // Теперь правильный тип
    this.logger.debug('UserApiService', 'Получение списка пользователей', { filter });

    const params: any = {};
    if (filter.pageNumber) params.pageNumber = filter.pageNumber;
    if (filter.pageSize) params.pageSize = filter.pageSize;
    if (filter.searchTerm) params.searchTerm = filter.searchTerm;
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortDescending !== undefined) params.sortDescending = filter.sortDescending;

    return this.http.get<{
      success: boolean;
      data: { data: UserListItemDto[]; totalCount: number };
    }>(ApiEndpoints.USERS.BASE, { params });
  }

  /**
   * Получить статистику пользователей (только для админа)
   */
  getStatistics(): Observable<{ success: boolean; data: UserStatisticsDto }> {
    this.logger.debug('UserApiService', 'Получение статистики пользователей');
    return this.http.get<{ success: boolean; data: UserStatisticsDto }>(
      ApiEndpoints.USERS.STATISTICS,
    );
  }

  /**
   * Удалить пользователя (только для админа)
   */
  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    this.logger.debug('UserApiService', 'Удаление пользователя', { id });
    return this.http.delete<{ success: boolean; message: string }>(ApiEndpoints.USERS.BY_ID(id));
  }

  /**
   * Поиск пользователей
   */
  searchUsers(
    query: string,
    limit: number = 10,
  ): Observable<{ success: boolean; data: UserSearchResultDto[] }> {
    this.logger.debug('UserApiService', 'Поиск пользователей', { query, limit });
    return this.http.get<{ success: boolean; data: UserSearchResultDto[] }>(
      ApiEndpoints.USERS.SEARCH,
      { params: { query, limit } },
    );
  }
}
