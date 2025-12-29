/**
 * @description
 * Набор типов и интерфейсов для системы LoggerConsole.
 * Все названия строго на латинице согласно стандартам проекта.
 */

/** Уровни логирования */
export type LogLevel = 'log' | 'debug' | 'info' | 'warn' | 'error';

/** Тип лога */
export type LogEntryType = 'standard' | 'http' | 'interaction' | 'state';

/** Детали HTTP запроса */
export interface HttpLogDetails {
  method: string;
  url: string;
  statusCode: number;
  statusText: string;
  duration: number;
  headers?: Record<string, string>;
}

/** Детали взаимодействия пользователя */
export interface InteractionLogDetails {
  element: string; // Тег элемента (button, a, etc.)
  text: string; // Текст внутри или aria-label
  id?: string; // Идентификатор элемента
  classes?: string; // CSS классы
}

/** Детали изменения состояния (Signals) */
export interface StateLogDetails {
  name: string; // Название сигнала
  oldValue: any; // Предыдущее значение
  newValue: any; // Новое значение
}

/** Структура одного лога */
export interface LogEntry {
  id: string; // Уникальный идентификатор (GUID или timestamp-based)
  timestamp: Date; // Время возникновения события
  level: LogLevel; // Уровень (importance)
  type: LogEntryType; // Тип записи
  prefix: string; // Контекст / Источник (например, [AUTH], [API])
  message: string; // Текстовое сообщение или URL
  data?: any[]; // Дополнительные данные (тело запроса/ответа)
  httpDetails?: HttpLogDetails; // Спец поля для сетевых запросов
  interactionDetails?: InteractionLogDetails; // Детали действий пользователя
  stateDetails?: StateLogDetails; // Детали изменений состояния
}

/** Конфигурация системы */
export interface LoggerConsoleConfig {
  minLevel: LogLevel; // Минимальный уровень для попадания в буфер
  enableConsole: boolean; // Дублировать ли вывод в нативную консоль браузера
  maxBuffer: number; // Максимальное количество записей в памяти
}

/** Инфо о клиенте (браузер, экран и т.д.) */
export interface ClientInfo {
  browser: string;
  os: string;
  device: string;
  resolution: string;
  viewport: string;
  theme: string;
  language: string;
  isOnline: boolean;
  apiEndpoint: string;
}

/** Интерфейс логгера для использования в компонентах/сервисах */
export interface ILoggerConsole {
  log(message: string, ...data: any[]): void;
  debug(message: string, ...data: any[]): void;
  info(message: string, ...data: any[]): void;
  warn(message: string, ...data: any[]): void;
  error(message: string, ...data: any[]): void;
}
