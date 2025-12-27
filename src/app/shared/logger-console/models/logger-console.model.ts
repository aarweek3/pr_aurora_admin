/**
 * @description
 * Набор типов и интерфейсов для системы LoggerConsole.
 * Все названия строго на латинице согласно стандартам проекта.
 */

/** Уровни логирования */
export type LogLevel = 'log' | 'debug' | 'info' | 'warn' | 'error';

/** Структура одного лога */
export interface LogEntry {
  id: string; // Уникальный идентификатор (GUID или timestamp-based)
  timestamp: Date; // Время возникновения события
  level: LogLevel; // Уровень (importance)
  prefix: string; // Контекст / Источник (например, [AUTH], [API])
  message: string; // Текстовое сообщение
  data?: any[]; // Дополнительные данные (объекты, массивы, ошибки)
}

/** Конфигурация системы */
export interface LoggerConsoleConfig {
  minLevel: LogLevel; // Минимальный уровень для попадания в буфер
  enableConsole: boolean; // Дублировать ли вывод в нативную консоль браузера
  maxBuffer: number; // Максимальное количество записей в памяти
}

/** Интерфейс логгера для использования в компонентах/сервисах */
export interface ILoggerConsole {
  log(message: string, ...data: any[]): void;
  debug(message: string, ...data: any[]): void;
  info(message: string, ...data: any[]): void;
  warn(message: string, ...data: any[]): void;
  error(message: string, ...data: any[]): void;
}
