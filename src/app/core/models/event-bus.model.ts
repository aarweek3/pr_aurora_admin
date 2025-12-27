// src/app/core/models/event-bus.model.ts
import { Observable } from 'rxjs';

/**
 * Базовое событие
 */
export interface AppEvent<T = any> {
  // Тип события
  type: string;

  // Полезная нагрузка
  payload: T;

  // Временная метка
  timestamp: Date;

  // Источник события (опционально)
  source?: string;

  // Метаданные
  metadata?: Record<string, any>;
}

/**
 * Типы событий в системе
 */
export type EventType =
  // Context Events
  | 'contextChanged'
  | 'contextReset'
  | 'modeChanged'
  | 'selectionChanged'
  | 'dirtyStateChanged'

  // Command Events
  | 'commandRequested'
  | 'commandStarted'
  | 'commandCompleted'
  | 'commandFailed'

  // Error Events
  | 'errorRegistered'
  | 'errorResolved'
  | 'errorCleared'

  // Navigation Events
  | 'navigationStarted'
  | 'navigationCompleted'
  | 'submenuOpened'
  | 'submenuClosed'

  // Right Panel Events
  | 'rightPanelOpened'
  | 'rightPanelClosed'
  | 'rightPanelChanged'
  | 'openRightPanel'

  // Action Events
  | 'actionRequested'
  | 'actionCompleted'
  | 'actionFailed'

  // Console Events
  | 'openConsole'
  | 'toggleConsole'

  // System Events
  | 'backendAvailable'
  | 'backendUnavailable'
  | 'readOnlyEnabled'
  | 'readOnlyDisabled'
  | 'pluginLoaded'
  | 'pluginUnloaded';

/**
 * Обработчик событий
 */
export type EventHandler<T = any> = (event: AppEvent<T>) => void;

/**
 * Подписка на события
 */
export interface EventSubscription {
  // Отписаться
  unsubscribe(): void;
}

/**
 * Сервис Event Bus
 */
export interface IEventBus {
  /**
   * Опубликовать событие
   */
  publish<T = any>(event: Omit<AppEvent<T>, 'timestamp'>): void;

  /**
   * Подписаться на событие
   */
  subscribe<T = any>(type: EventType | EventType[], handler: EventHandler<T>): EventSubscription;

  /**
   * Подписаться на событие (RxJS Observable)
   */
  on<T = any>(type: EventType | EventType[]): Observable<AppEvent<T>>;

  /**
   * Получить все события (для отладки)
   */
  getHistory(type?: EventType): AppEvent[];

  /**
   * Очистить историю
   */
  clearHistory(): void;
}
