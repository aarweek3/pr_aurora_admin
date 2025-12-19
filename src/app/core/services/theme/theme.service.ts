// src/app/core/services/theme/theme.service.ts
import { effect, Injectable, signal } from '@angular/core';

/**
 * Theme Types
 */
export type Theme = 'light' | 'dark';

/**
 * Theme Service
 *
 * Управляет темами приложения (light/dark).
 * Особенности:
 * - Persists тему в localStorage
 * - Применяет data-theme атрибут к <html>
 * - Reactive через signals
 * - Auto-detect system preference (опционально)
 *
 * Использование:
 * ```typescript
 * themeService.setTheme('dark');
 * themeService.toggleTheme();
 * const currentTheme = themeService.currentTheme();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'aurora-admin-theme';
  private readonly DEFAULT_THEME: Theme = 'light';

  // Reactive theme state
  currentTheme = signal<Theme>(this.DEFAULT_THEME);

  constructor() {
    // Загрузить тему из localStorage или использовать system preference
    const savedTheme = this.loadThemeFromStorage();
    const systemTheme = this.getSystemTheme();
    const initialTheme = savedTheme || systemTheme || this.DEFAULT_THEME;

    this.currentTheme.set(initialTheme);

    // Effect для применения темы при изменении
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.saveThemeToStorage(theme);
    });

    // Слушать изменения system preference
    this.listenToSystemThemeChanges();
  }

  /**
   * Установить тему
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Переключить тему (light <-> dark)
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Проверка, является ли тема тёмной
   */
  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  /**
   * Проверка, является ли тема светлой
   */
  isLight(): boolean {
    return this.currentTheme() === 'light';
  }

  /**
   * Применить тему к DOM
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;

    // Убрать предыдущие классы темы
    htmlElement.removeAttribute('data-theme');

    // Применить новую тему
    htmlElement.setAttribute('data-theme', theme);

    // Также можно добавить класс для совместимости
    htmlElement.classList.remove('theme-light', 'theme-dark');
    htmlElement.classList.add(`theme-${theme}`);

    console.info(`[ThemeService] Theme applied: ${theme}`);
  }

  /**
   * Загрузить тему из localStorage
   */
  private loadThemeFromStorage(): Theme | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (error) {
      console.warn('[ThemeService] Failed to load theme from storage:', error);
    }

    return null;
  }

  /**
   * Сохранить тему в localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('[ThemeService] Failed to save theme to storage:', error);
    }
  }

  /**
   * Получить системную тему (если поддерживается)
   */
  private getSystemTheme(): Theme | null {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return null;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Слушать изменения системной темы
   */
  private listenToSystemThemeChanges(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Современный API
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', (e) => {
        // Применить только если нет сохранённой темы
        const savedTheme = this.loadThemeFromStorage();
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
    // Старый API (для совместимости)
    else if (darkModeQuery.addListener) {
      darkModeQuery.addListener((e) => {
        const savedTheme = this.loadThemeFromStorage();
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
  }

  /**
   * Очистить сохранённую тему (вернуться к system preference)
   */
  resetToSystemTheme(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.STORAGE_KEY);
    }

    const systemTheme = this.getSystemTheme() || this.DEFAULT_THEME;
    this.setTheme(systemTheme);
  }

  /**
   * Получить доступные темы
   */
  getAvailableThemes(): Theme[] {
    return ['light', 'dark'];
  }
}
