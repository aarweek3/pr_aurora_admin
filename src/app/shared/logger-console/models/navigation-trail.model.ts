/**
 * Navigation Trail Models
 * Модели для отслеживания навигации пользователя по приложению
 */

/**
 * Тип навигационного события
 */
export type NavigationType =
  | 'initial' // Начальная загрузка
  | 'push' // Переход вперед
  | 'pop' // Возврат назад (browser back)
  | 'replace' // Замена текущего роута
  | 'reload'; // Перезагрузка страницы

/**
 * Информация о параметрах роута
 */
export interface NavigationParams {
  /** Query параметры (из URL после ?) */
  queryParams: Record<string, string | string[]>;
  /** Route параметры (например :id) */
  routeParams: Record<string, string>;
  /** Fragment (после #) */
  fragment: string | null;
}

/**
 * Информация о роуте
 */
export interface RouteInfo {
  /** Полный путь URL */
  url: string;
  /** Путь роута (без query params) */
  path: string;
  /** Название роута (если задано) */
  title?: string;
  /** Data из роута конфига */
  data?: Record<string, any>;
  /** Параметры навигации */
  params: NavigationParams;
}

/**
 * Запись о навигационном событии
 */
export interface NavigationEntry {
  /** Уникальный ID записи */
  id: string;
  /** Временная метка */
  timestamp: Date;
  /** Тип навигации */
  type: NavigationType;
  /** Информация о роуте */
  route: RouteInfo;
  /** Предыдущий URL (если есть) */
  previousUrl?: string;
  /** Время, проведенное на предыдущей странице (мс) */
  duration?: number;
  /** Была ли навигация успешной */
  success: boolean;
  /** Ошибка навигации (если была) */
  error?: string;
}

/**
 * Статистика навигации
 */
export interface NavigationStats {
  /** Общее количество переходов */
  totalNavigations: number;
  /** Количество уникальных роутов */
  uniqueRoutes: number;
  /** Самый посещаемый роут */
  mostVisitedRoute?: string;
  /** Среднее время на странице (мс) */
  averageTimeOnPage: number;
  /** Количество возвратов назад */
  backNavigations: number;
}

/**
 * Конфигурация Navigation Trail
 */
export interface NavigationTrailConfig {
  /** Максимальное количество записей в истории */
  maxEntries: number;
  /** Логировать в console */
  logToConsole: boolean;
  /** Отслеживать query параметры */
  trackQueryParams: boolean;
  /** Отслеживать route data */
  trackRouteData: boolean;
  /** Игнорируемые роуты (regex patterns) */
  ignoredRoutes: string[];
}
