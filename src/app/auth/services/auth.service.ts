// src/app/auth/services/auth.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { ApiEndpoints, STORAGE_KEYS } from '../../../environments/api-endpoints';
import { ApiResponse, ChangePasswordDto, LoginDto, RegisterDto, UserProfileDto } from '../models';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  // Простые сигналы состояния - только самое необходимое
  private currentUser = signal<UserProfileDto | null>(null);
  private userRoles = signal<string[]>([]);

  // Вычисляемые сигналы для удобства
  public isAuthenticated = computed(() => this.currentUser() !== null);
  public isAdmin = computed(() => this.userRoles().includes('Admin'));
  public isModerator = computed(() => this.userRoles().includes('Moderator'));

  constructor() {
    this.initializeAuth();
  }

  // === PUBLIC API ===

  /**
   * Регистрация пользователя
   */
  register(data: RegisterDto): Observable<ApiResponse<{ user: UserProfileDto }>> {
    return this.http
      .post<ApiResponse<{ user: UserProfileDto }>>(ApiEndpoints.AUTH.REGISTER, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data.user);
          }
        }),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /**
   * Вход в систему
   */
  login(data: LoginDto): Observable<ApiResponse<{ user: UserProfileDto }>> {
    return this.http
      .post<ApiResponse<{ user: UserProfileDto }>>(ApiEndpoints.AUTH.LOGIN, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data.user);
          }
        }),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  /**
   * Выход из системы
   */
  logout(): Observable<ApiResponse<void>> {
    return this.http
      .post<ApiResponse<void>>(ApiEndpoints.AUTH.LOGOUT, {}, { withCredentials: true })
      .pipe(
        tap(() => this.handleLogout()),
        catchError((error) => {
          // Очищаем сессию даже при ошибке
          this.handleLogout();
          return throwError(() => error);
        }),
      );
  }

  /**
   * Обновление токена
   */
  refreshToken(): Observable<ApiResponse<{ user: UserProfileDto }>> {
    return this.http
      .post<ApiResponse<{ user: UserProfileDto }>>(
        ApiEndpoints.AUTH.REFRESH,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data.user);
          }
        }),
        catchError((error) => {
          if (error.status === 401) {
            this.handleAuthFailure();
          }
          return throwError(() => error);
        }),
      );
  }

  /**
   * Получение профиля пользователя
   */
  getProfile(): Observable<ApiResponse<UserProfileDto>> {
    return this.http
      .get<ApiResponse<UserProfileDto>>(ApiEndpoints.AUTH.PROFILE, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.updateUserData(response.data);
          }
        }),
        catchError((error) => {
          if (error.status === 401) {
            this.handleAuthFailure();
          }
          return throwError(() => error);
        }),
      );
  }

  /**
   * Смена пароля
   */
  changePassword(data: ChangePasswordDto): Observable<ApiResponse<void>> {
    return this.http
      .post<ApiResponse<void>>(ApiEndpoints.AUTH.CHANGE_PASSWORD, data, {
        withCredentials: true,
      })
      .pipe(catchError((error) => throwError(() => error)));
  }

  /**
   * Получение ролей пользователя
   */
  loadUserRoles(): Observable<string[]> {
    return this.tokenService.getUserRoles().pipe(
      tap((roles) => {
        this.userRoles.set(roles);
        console.debug('User roles loaded:', roles);
      }),
      catchError((error) => {
        console.error('Failed to load user roles:', error);
        this.userRoles.set([]);
        return of([]);
      }),
    );
  }

  // === PUBLIC GETTERS ===

  getCurrentUser(): UserProfileDto | null {
    return this.currentUser();
  }

  getUserRoles(): string[] {
    return this.userRoles();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdminUser(): boolean {
    return this.isAdmin();
  }

  isModeratorUser(): boolean {
    return this.isModerator();
  }

  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  // === UTILITY METHODS ===

  /**
   * Определение маршрута после авторизации
   */
  getRedirectRoute(returnUrl?: string): string {
    // Если есть returnUrl и он не является страницей авторизации
    if (returnUrl && !returnUrl.startsWith('/auth')) {
      return returnUrl;
    }

    // Определяем маршрут на основе ролей
    const roles = this.userRoles();
    if (roles.includes('Admin')) {
      return '/admin-entrance-dashboard';
    } else if (roles.includes('Moderator')) {
      return '/admin/dashboard';
    } else {
      return '/dashboard';
    }
  }

  /**
   * Перенаправление после успешного входа
   */
  redirectAfterLogin(returnUrl?: string): void {
    const targetRoute = this.getRedirectRoute(returnUrl);
    console.debug('Redirecting after login:', { returnUrl, targetRoute, roles: this.userRoles() });
    this.router.navigate([targetRoute]);
  }

  /**
   * Принудительное обновление токена (алиас для совместимости)
   */
  forceTokenRefresh(): Observable<ApiResponse<{ user: UserProfileDto }>> {
    return this.refreshToken();
  }

  /**
   * Очистка сессии (для тестирования)
   */
  clearSession(): void {
    this.clearSessionData();
    this.tokenService.clearStatus();
  }

  // === PRIVATE METHODS ===

  /**
   * Инициализация сервиса
   */
  private async initializeAuth(): Promise<void> {
    try {
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this.currentUser.set(storedUser);

        // Проверяем валидность сессии
        this.getProfile().subscribe({
          next: () => {
            // Загружаем роли после успешной проверки профиля
            this.loadUserRoles().subscribe();
            console.debug('Auth session restored');
          },
          error: () => {
            console.debug('Stored session invalid, clearing');
            this.clearSessionData();
          },
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.clearSessionData();
    }
  }

  /**
   * Обработка успешной авторизации
   */
  private handleAuthSuccess(user: UserProfileDto): void {
    this.updateUserData(user);
    this.saveUserToStorage(user);

    // ВАЖНО: Запускаем мониторинг токенов ПОСЛЕ успешной авторизации
    this.tokenService.startMonitoring();

    // Загружаем роли
    this.loadUserRoles().subscribe();

    console.debug('Auth success:', user.email);
  }

  /**
   * Обновление данных пользователя
   */
  private updateUserData(user: UserProfileDto): void {
    this.currentUser.set(user);
    this.saveUserToStorage(user);
  }

  /**
   * Обработка выхода
   */
  private handleLogout(): void {
    this.clearSessionData();
    this.tokenService.clearStatus(); // Это уже останавливает мониторинг
    this.router.navigate(['/auth/login']);
  }

  /**
   * Обработка неудачи авторизации
   */
  private handleAuthFailure(): void {
    this.clearSessionData();
    this.tokenService.clearStatus();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Обработка ошибок авторизации
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    console.error('Auth error:', error);
    return throwError(() => error);
  }

  /**
   * Очистка данных сессии
   */
  private clearSessionData(): void {
    this.currentUser.set(null);
    this.userRoles.set([]);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Сохранение пользователя в localStorage
   */
  private saveUserToStorage(user: UserProfileDto): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  /**
   * Получение пользователя из localStorage
   */
  private getStoredUser(): UserProfileDto | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}
