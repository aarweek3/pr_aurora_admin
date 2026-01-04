import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { IconGetService } from '@core/services/icon/icon-get.service';
import { finalize, tap } from 'rxjs';
import { LANGUAGE_ICONS_MAP } from '../config/language-icons.config';
import { AppLanguage, LanguageState } from '../models/appLanguage.model';
import { LanguageApiService } from './language-api.service';

/**
 * Основной сервис для управления состоянием языков в приложении.
 * Использует Angular Signals для реактивности.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private apiService = inject(LanguageApiService);
  private iconService = inject(IconGetService);
  private readonly STORAGE_KEY = 'app_language';

  // --- Состояние (Signals) ---

  /** Полное состояние сервиса */
  private state = signal<LanguageState>({
    current: null,
    available: [],
    all: [],
    isLoading: false,
    syncStatus: 'idle',
  });

  /** Текущий активный язык */
  currentLanguage = computed(() => this.state().current);

  /** Список языков, доступных для выбора пользователем */
  availableLanguages = computed(() => this.state().available);

  /** Список всех языков (включая отключенные) для админки */
  allLanguages = computed(() => this.state().all ?? []);

  /** Флаг состояния загрузки */
  isLoading = computed(() => this.state().isLoading);

  constructor() {
    // Эффект для сохранения текущего языка в localStorage при его изменении
    effect(() => {
      const current = this.currentLanguage();
      if (current) {
        localStorage.setItem(this.STORAGE_KEY, current.code);
        // Здесь можно добавить смену локали для библиотек типа i18next или transloco
        document.documentElement.lang = current.code;
        document.documentElement.dir = current.direction || 'ltr';
      }
    });
  }

  /**
   * Инициализация сервиса: загрузка списка языков и выбор текущего
   */
  init(): void {
    this.state.update((s) => ({ ...s, isLoading: true, syncStatus: 'syncing' }));

    this.apiService
      .getAvailable()
      .pipe(
        tap((languages) => {
          const savedCode = localStorage.getItem(this.STORAGE_KEY);

          // Поиск языка: из хранилища -> по умолчанию -> первый доступный
          const current =
            languages.find((l) => l.code === savedCode) ||
            languages.find((l) => l.isDefault) ||
            languages[0] ||
            null;

          this.state.update((s) => ({
            ...s,
            available: languages,
            current: current,
            syncStatus: 'synced',
          }));

          // Массово предзагружаем иконки флагов
          this.preloadLanguageIcons(languages);
        }),
        finalize(() => this.state.update((s) => ({ ...s, isLoading: false }))),
      )
      .subscribe({
        error: (err) => {
          console.error('Ошибка инициализации языков:', err);
          this.state.update((s) => ({ ...s, syncStatus: 'error', lastSyncError: err.message }));
        },
      });
  }

  /**
   * Сменить текущий язык
   */
  setLanguage(language: AppLanguage): void {
    if (this.currentLanguage()?.id === language.id) return;
    this.state.update((s) => ({ ...s, current: language }));
  }

  /**
   * Обновить список всех языков (для админки)
   */
  refreshAdminList(): void {
    this.state.update((s) => ({ ...s, isLoading: true }));
    this.apiService
      .getAll()
      .pipe(
        tap((all) => {
          this.state.update((s) => ({ ...s, all }));
          this.preloadLanguageIcons(all);
        }),
        finalize(() => this.state.update((s) => ({ ...s, isLoading: false }))),
      )
      .subscribe();
  }

  /**
   * Предзагрузка иконок для списка языков
   */
  private preloadLanguageIcons(languages: AppLanguage[]): void {
    const iconNames = languages
      .map((l) =>
        l.iconKey ? LANGUAGE_ICONS_MAP[l.iconKey] || l.iconKey : LANGUAGE_ICONS_MAP['default'],
      )
      .filter((name) => !!name);

    if (iconNames.length > 0) {
      this.iconService.loadIconsBatch(iconNames).subscribe();
    }
  }

  /**
   * Сбросить состояние (например, при выходе)
   */
  reset(): void {
    const available = this.state().available;
    const defaultLang = available.find((l) => l.isDefault) || available[0] || null;
    this.state.update((s) => ({ ...s, current: defaultLang }));
  }
}
