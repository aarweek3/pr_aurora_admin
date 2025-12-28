import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  NavigationEntry,
  NavigationParams,
  NavigationStats,
  NavigationTrailConfig,
  NavigationType,
  RouteInfo,
} from '../models/navigation-trail.model';
import { LoggerConsoleService } from './logger-console.service';

/**
 * Navigation Trail Service
 * Отслеживает всю навигацию пользователя по приложению
 */
@Injectable({
  providedIn: 'root',
})
export class NavigationTrailService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loggerService = inject(LoggerConsoleService);

  private readonly logger = this.loggerService.getLogger('NavigationTrail');

  // Конфигурация
  private config: NavigationTrailConfig = {
    maxEntries: 100,
    logToConsole: true,
    trackQueryParams: true,
    trackRouteData: true,
    ignoredRoutes: [],
  };

  // Состояние
  private readonly _entries = signal<NavigationEntry[]>([]);
  private _currentUrl = '';
  private _navigationStartTime = 0;
  private _isNavigating = false;

  // Публичные сигналы (read-only)
  readonly entries = this._entries.asReadonly();
  readonly currentEntry = computed(() => {
    const all = this._entries();
    return all[all.length - 1];
  });

  // Статистика
  readonly stats = computed<NavigationStats>(() => {
    const allEntries = this._entries();
    const uniqueRoutes = new Set(allEntries.map((e) => e.route.path));

    const routeCounts = allEntries.reduce((acc, entry) => {
      acc[entry.route.path] = (acc[entry.route.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostVisited = Object.entries(routeCounts).sort(([, a], [, b]) => b - a)[0];

    const durations = allEntries.filter((e) => e.duration !== undefined).map((e) => e.duration!);
    const avgDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const backCount = allEntries.filter((e) => e.type === 'pop').length;

    return {
      totalNavigations: allEntries.length,
      uniqueRoutes: uniqueRoutes.size,
      mostVisitedRoute: mostVisited?.[0],
      averageTimeOnPage: Math.round(avgDuration),
      backNavigations: backCount,
    };
  });

  constructor() {
    this.initializeTracking();
  }

  /**
   * Инициализация отслеживания навигации
   */
  private initializeTracking(): void {
    // Отслеживаем начало навигации
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event) => {
        this._navigationStartTime = Date.now();
        this._isNavigating = true;

        if (this.config.logToConsole) {
          this.logger.debug('Navigation started', { url: event.url });
        }
      });

    // Отслеживаем успешную навигацию
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.handleNavigationEnd(event);
      });

    // Отслеживаем отмененную навигацию
    this.router.events
      .pipe(filter((event): event is NavigationCancel => event instanceof NavigationCancel))
      .subscribe((event) => {
        this.handleNavigationCancel(event);
      });

    // Отслеживаем ошибки навигации
    this.router.events
      .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
      .subscribe((event) => {
        this.handleNavigationError(event);
      });

    // Логируем начальный роут
    this.logInitialRoute();
  }

  /**
   * Логирование начального роута при загрузке приложения
   */
  private logInitialRoute(): void {
    setTimeout(() => {
      const url = this.router.url;
      const routeInfo = this.extractRouteInfo(url);

      const entry: NavigationEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        type: 'initial',
        route: routeInfo,
        success: true,
      };

      this.addEntry(entry);
      this._currentUrl = url;
    }, 0);
  }

  /**
   * Обработка успешной навигации
   */
  private handleNavigationEnd(event: NavigationEnd): void {
    const duration = Date.now() - this._navigationStartTime;
    const routeInfo = this.extractRouteInfo(event.urlAfterRedirects);

    // Определяем тип навигации
    const type = this.determineNavigationType(event.url);

    const entry: NavigationEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      route: routeInfo,
      previousUrl: this._currentUrl || undefined,
      duration: this._currentUrl ? duration : undefined,
      success: true,
    };

    this.addEntry(entry);
    this._currentUrl = event.urlAfterRedirects;
    this._isNavigating = false;

    if (this.config.logToConsole) {
      this.logger.info('Navigation completed', {
        url: event.urlAfterRedirects,
        duration: `${duration}ms`,
        type,
      });
    }
  }

  /**
   * Обработка отмененной навигации
   */
  private handleNavigationCancel(event: NavigationCancel): void {
    this._isNavigating = false;

    if (this.config.logToConsole) {
      this.logger.warn('Navigation canceled', {
        url: event.url,
        reason: event.reason,
      });
    }
  }

  /**
   * Обработка ошибки навигации
   */
  private handleNavigationError(event: NavigationError): void {
    const routeInfo = this.extractRouteInfo(event.url);

    const entry: NavigationEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'push',
      route: routeInfo,
      previousUrl: this._currentUrl || undefined,
      success: false,
      error: event.error?.toString(),
    };

    this.addEntry(entry);
    this._isNavigating = false;

    if (this.config.logToConsole) {
      this.logger.error('Navigation error', {
        url: event.url,
        error: event.error,
      });
    }
  }

  /**
   * Извлечение информации о роуте из URL
   */
  private extractRouteInfo(url: string): RouteInfo {
    const urlTree = this.router.parseUrl(url);
    const path = urlTree.root.children['primary']?.segments.map((s) => s.path).join('/') || '/';

    const queryParams: Record<string, string | string[]> = {};
    Object.keys(urlTree.queryParams).forEach((key) => {
      queryParams[key] = urlTree.queryParams[key];
    });

    const params: NavigationParams = {
      queryParams: this.config.trackQueryParams ? queryParams : {},
      routeParams: {}, // TODO: Extract route params from activated route
      fragment: urlTree.fragment,
    };

    return {
      url,
      path: '/' + path,
      params,
    };
  }

  /**
   * Определение типа навигации
   */
  private determineNavigationType(url: string): NavigationType {
    // Простая эвристика: если URL меньше текущего, вероятно это "назад"
    // В реальности это сложнее, но для начала подойдет
    if (url === this._currentUrl) {
      return 'reload';
    }
    return 'push';
  }

  /**
   * Добавление записи в историю
   */
  private addEntry(entry: NavigationEntry): void {
    // Проверяем игнорируемые роуты
    const isIgnored = this.config.ignoredRoutes.some((pattern) =>
      new RegExp(pattern).test(entry.route.url),
    );

    if (isIgnored) {
      return;
    }

    this._entries.update((entries) => {
      const newEntries = [...entries, entry];

      // Ограничиваем размер истории
      if (newEntries.length > this.config.maxEntries) {
        return newEntries.slice(-this.config.maxEntries);
      }

      return newEntries;
    });
  }

  /**
   * Генерация уникального ID
   */
  private generateId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение истории навигации
   */
  getHistory(): NavigationEntry[] {
    return this._entries();
  }

  /**
   * Очистка истории
   */
  clearHistory(): void {
    this._entries.set([]);
    this.logger.info('Navigation history cleared');
  }

  /**
   * Настройка конфигурации
   */
  configure(config: Partial<NavigationTrailConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Экспорт истории в JSON
   */
  exportToJSON(): string {
    const data = {
      exportDate: new Date().toISOString(),
      stats: this.stats(),
      entries: this._entries(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Навигация к определенной записи (для отладки)
   */
  navigateToEntry(entry: NavigationEntry): void {
    this.router.navigateByUrl(entry.route.url);
    this.logger.info('Navigating to historical entry', { url: entry.route.url });
  }
}
