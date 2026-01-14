import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * Сервис для безопасного доступа к browser API.
 * Изолирует работу с window и navigator для поддержки SSR и предотвращения ошибок инициализации.
 */
@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly isBrowser: boolean;

  // Кэшированные значения (читаются один раз при создании)
  readonly userAgent: string;
  readonly initialUrl: string;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.userAgent =
      this.isBrowser && typeof navigator !== 'undefined' ? navigator.userAgent : 'server';

    this.initialUrl =
      this.isBrowser && typeof window !== 'undefined' ? window.location.href : 'unknown';
  }

  /**
   * Возвращает true, если код выполняется в браузере
   */
  get isPlatformBrowser(): boolean {
    return this.isBrowser;
  }

  /**
   * Получить текущий URL из window.location.
   * Если не в браузере, возвращает initialUrl.
   */
  getCurrentUrl(): string {
    if (!this.isBrowser || typeof window === 'undefined') {
      return this.initialUrl;
    }
    return window.location.href;
  }

  /**
   * Получить текущий pathname
   */
  getCurrentPathname(): string {
    if (!this.isBrowser || typeof window === 'undefined') {
      return '/';
    }
    return window.location.pathname;
  }

  /**
   * Безопасное получение ширины окна.
   * Полезно для компонентов, которые инициализируются до полной готовности DOM.
   */
  get innerWidth(): number {
    if (!this.isBrowser || typeof window === 'undefined') {
      return 1920; // Default Desktop fallback
    }
    return window.innerWidth || 1920;
  }
}
