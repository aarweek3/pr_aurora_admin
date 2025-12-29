// src/app/auth/services/auth.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
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
  private logger = inject(LoggerConsoleService).getLogger('AuthService');

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
        this.logger.debug('Роли пользователя загружены', roles);
      }),
      catchError((error: any) => {
        this.logger.error('Ошибка загрузки ролей', error);
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

    const roles = this.userRoles();
    if (roles.includes('Admin')) {
      return '/auth-control';
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

  /**
   * Установка сессии из внешних источников (например, после OAuth)
   */
  setSession(accessToken: string, refreshToken: string): void {
    this.logger.debug('Setting session from external source');

    // 1. Сохраняем в localStorage (для немедленного доступа)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // 2. Очищаем старые cookies
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';

    // 3. Устанавливаем новые cookies (как резервное хранилище)
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';

    document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Lax${secureFlag}`;
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`; // 30 дней

    // 4. Проверяем валидность сессии (токен уже в localStorage, будет использован сразу)
    this.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
          this.logger.info('External session validated successfully');
        }
      },
      error: (error) => {
        this.logger.warn('Failed to validate external session', error);
        // Очищаем некорректные токены
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },
    });
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
            this.logger.debug('Auth session restored');
          },
          error: (error: any) => {
            this.logger.debug('Stored session invalid, clearing', error);
            this.clearSessionData();
          },
        });
      }
    } catch (error: any) {
      this.logger.error('Auth initialization error:', error);
      this.clearSessionData();
    }
  }

  /**
   * Обработка успешной авторизации
   */
  private handleAuthSuccess(user: UserProfileDto): void {
    this.updateUserData(user);

    // Если роли пришли сразу в объекте пользователя, используем их
    if (user.roles && user.roles.length > 0) {
      this.userRoles.set(user.roles);
      this.logger.debug('Роли получены напрямую из ответа авторизации', user.roles);
    }

    // Запускаем мониторинг токенов (с небольшой задержкой для стабильности кук)
    setTimeout(() => {
      this.tokenService.startMonitoring();

      // Загружаем роли только если их еще нет
      if (this.userRoles().length === 0) {
        this.loadUserRoles().subscribe();
      }
    }, 500);

    this.logger.debug('Авторизация успешна:', user.email);
  }

  /**
   * Обновление данных пользователя
   */
  private updateUserData(user: UserProfileDto): void {
    this.currentUser.set(user);

    // Если в объекте есть роли, обновляем и их
    if (user.roles) {
      this.userRoles.set(user.roles);
    }

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
    this.logger.error('Auth error:', error);
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
