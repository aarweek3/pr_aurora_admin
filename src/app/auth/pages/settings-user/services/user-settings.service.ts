import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { NotificationChannel, SidebarState, UiDensity, UiTheme } from '../enums';
import { DEFAULT_USER_SETTINGS, UserSettings, UserSettingsUpdateDto } from '../models';

/**
 * Интерфейс ответа API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Сервис для управления настройками пользователя
 *
 * Основные возможности:
 * - Загрузка настроек с сервера
 * - Обновление настроек (полное и частичное)
 * - Сброс к дефолтным значениям
 * - Автоматическое применение настроек к UI
 * - Реактивное состояние через Angular Signals
 */
@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  // ==========================================
  // SIGNALS (Реактивное состояние)
  // ==========================================

  /**
   * Текущие настройки пользователя
   */
  readonly settings = signal<UserSettings>(DEFAULT_USER_SETTINGS);

  /**
   * Состояние загрузки
   */
  readonly loading = signal<boolean>(false);

  /**
   * Состояние сохранения
   */
  readonly saving = signal<boolean>(false);

  /**
   * Последняя ошибка
   */
  readonly error = signal<string | null>(null);

  /**
   * Флаг наличия несохранённых изменений
   */
  readonly hasUnsavedChanges = signal<boolean>(false);

  // ==========================================
  // COMPUTED SIGNALS (Вычисляемые значения)
  // ==========================================

  /**
   * Текущая тема (для удобного доступа)
   */
  readonly currentTheme = computed(() => this.settings().theme);

  /**
   * Текущая плотность
   */
  readonly currentDensity = computed(() => this.settings().density);

  /**
   * Текущее состояние сайдбара
   */
  readonly currentSidebarState = computed(() => this.settings().sidebarState);

  /**
   * Включены ли Email уведомления
   */
  readonly emailNotificationsEnabled = computed(() => {
    const channels = this.settings().notificationChannels;
    return (channels & NotificationChannel.Email) === NotificationChannel.Email;
  });

  // ==========================================
  // PRIVATE FIELDS
  // ==========================================

  /**
   * Subject для отслеживания изменений настроек
   */
  private settingsChanged$ = new BehaviorSubject<UserSettings>(DEFAULT_USER_SETTINGS);

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(private http: HttpClient) {
    // Effect для автоматического применения настроек при изменении
    effect(() => {
      const currentSettings = this.settings();
      this.applySettingsToUI(currentSettings);
      this.settingsChanged$.next(currentSettings);
    });
  }

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  /**
   * Загрузить настройки текущего пользователя
   */
  loadSettings(): Observable<UserSettings> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .get<ApiResponse<UserSettings>>(ApiEndpoints.SETTINGS.GET, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data),
        tap((settings) => {
          this.settings.set(settings);
          this.hasUnsavedChanges.set(false);
          this.applySettingsToUI(settings);
        }),
        catchError((error) => {
          const errorMessage = error.error?.message || 'Ошибка загрузки настроек';
          this.error.set(errorMessage);
          console.error('Error loading settings:', error);
          return throwError(() => error);
        }),
        finalize(() => this.loading.set(false)),
      );
  }

  /**
   * Обновить настройки (полное обновление)
   */
  updateSettings(settings: UserSettingsUpdateDto): Observable<UserSettings> {
    this.saving.set(true);
    this.error.set(null);

    return this.http
      .put<ApiResponse<UserSettings>>(ApiEndpoints.SETTINGS.UPDATE, settings, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data),
        tap((updatedSettings) => {
          this.settings.set(updatedSettings);
          this.hasUnsavedChanges.set(false);
          this.applySettingsToUI(updatedSettings);
        }),
        catchError((error) => {
          const errorMessage = error.error?.message || 'Ошибка сохранения настроек';
          this.error.set(errorMessage);
          console.error('Error updating settings:', error);
          return throwError(() => error);
        }),
        finalize(() => this.saving.set(false)),
      );
  }

  /**
   * Частичное обновление настроек
   */
  patchSettings(partialSettings: Partial<UserSettings>): Observable<UserSettings> {
    const currentSettings = this.settings();
    const updatedSettings: UserSettingsUpdateDto = {
      ...currentSettings,
      ...partialSettings,
    };

    return this.updateSettings(updatedSettings);
  }

  /**
   * Сбросить настройки к дефолтным значениям
   */
  resetToDefaults(): Observable<UserSettings> {
    this.saving.set(true);
    this.error.set(null);

    return this.http
      .post<ApiResponse<UserSettings>>(ApiEndpoints.SETTINGS.RESET, {}, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        tap((settings) => {
          this.settings.set(settings);
          this.hasUnsavedChanges.set(false);
          this.applySettingsToUI(settings);
        }),
        catchError((error) => {
          const errorMessage = error.error?.message || 'Ошибка сброса настроек';
          this.error.set(errorMessage);
          console.error('Error resetting settings:', error);
          return throwError(() => error);
        }),
        finalize(() => this.saving.set(false)),
      );
  }

  /**
   * Проверить существование настроек
   */
  checkSettingsExist(): Observable<boolean> {
    return this.http
      .get<ApiResponse<{ exists: boolean }>>(ApiEndpoints.SETTINGS.EXISTS, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data.exists),
        catchError((error) => {
          console.error('Error checking settings existence:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Получить настройки пользователя по ID (только для админов)
   */
  getSettingsByUserId(userId: string): Observable<UserSettings> {
    return this.http
      .get<ApiResponse<UserSettings>>(ApiEndpoints.SETTINGS.BY_USER_ID(userId), {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error loading user settings:', error);
          return throwError(() => error);
        }),
      );
  }

  // ==========================================
  // LOCAL STATE MANAGEMENT
  // ==========================================

  /**
   * Локально обновить настройки (без сохранения на сервер)
   * Полезно для preview изменений
   */
  updateLocalSettings(partialSettings: Partial<UserSettings>): void {
    const currentSettings = this.settings();
    this.settings.set({ ...currentSettings, ...partialSettings });
    this.hasUnsavedChanges.set(true);
  }

  /**
   * Отменить локальные изменения
   */
  revertLocalChanges(): void {
    // Перезагрузить настройки с сервера
    this.loadSettings().subscribe();
  }

  // ==========================================
  // UI APPLICATION METHODS
  // ==========================================

  /**
   * Применить настройки к UI
   */
  private applySettingsToUI(settings: UserSettings): void {
    this.applyTheme(settings.theme);
    this.applyDensity(settings.density);
    this.applySidebarState(settings.sidebarState);

    if (settings.primaryColor) {
      this.applyPrimaryColor(settings.primaryColor);
    }

    this.applyAccessibilityLevel(settings.accessibilityLevel);
  }

  /**
   * Применить тему оформления
   */
  private applyTheme(theme: UiTheme): void {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');

    if (theme === UiTheme.System) {
      // Определить системную тему
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      body.classList.add(theme === UiTheme.Dark ? 'dark-theme' : 'light-theme');
    }
  }

  /**
   * Применить плотность интерфейса
   */
  private applyDensity(density: UiDensity): void {
    const body = document.body;
    body.classList.remove('density-compact', 'density-comfortable');

    switch (density) {
      case UiDensity.Compact:
        body.classList.add('density-compact');
        break;
      case UiDensity.Comfortable:
        body.classList.add('density-comfortable');
        break;
    }
  }

  /**
   * Применить основной цвет
   */
  private applyPrimaryColor(color: string): void {
    document.documentElement.style.setProperty('--primary-color', color);
  }

  /**
   * Применить состояние сайдбара
   */
  private applySidebarState(state: SidebarState): void {
    // Эмитим событие для компонента сайдбара
    window.dispatchEvent(
      new CustomEvent('sidebar-state-change', {
        detail: { state },
      }),
    );
  }

  /**
   * Применить уровень доступности
   */
  private applyAccessibilityLevel(level: number): void {
    const body = document.body;
    body.classList.remove(
      'accessibility-standard',
      'accessibility-large-font',
      'accessibility-high-contrast',
    );

    switch (level) {
      case 1: // Standard
        body.classList.add('accessibility-standard');
        break;
      case 2: // LargeFont
        body.classList.add('accessibility-large-font');
        break;
      case 3: // HighContrast
        body.classList.add('accessibility-high-contrast');
        break;
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Получить Observable для отслеживания изменений настроек
   */
  getSettingsChanges(): Observable<UserSettings> {
    return this.settingsChanged$.asObservable();
  }

  /**
   * Очистить ошибку
   */
  clearError(): void {
    this.error.set(null);
  }
}
