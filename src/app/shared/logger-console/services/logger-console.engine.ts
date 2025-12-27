import { ILoggerConsole, LogEntry, LogLevel } from '../models/logger-console.model';

/** Тип для колбэка, который будет принимать сформированные логи */
export type LogCallback = (entry: LogEntry) => void;

/**
 * @description
 * SimpleLoggerConsole — чистое TS-ядро системы.
 * Изолировано от Angular, реализует базовую логику формирования лога.
 */
export class SimpleLoggerConsole implements ILoggerConsole {
  constructor(
    private prefix: string,
    private callback: LogCallback,
    private enableConsole: boolean = true,
  ) {}

  log(message: string, ...data: any[]): void {
    this.createEntry('log', message, data);
  }

  debug(message: string, ...data: any[]): void {
    this.createEntry('debug', message, data);
  }

  info(message: string, ...data: any[]): void {
    this.createEntry('info', message, data);
  }

  warn(message: string, ...data: any[]): void {
    this.createEntry('warn', message, data);
  }

  error(message: string, ...data: any[]): void {
    this.createEntry('error', message, data);
  }

  /** Внутренний метод сборки записи */
  private createEntry(level: LogLevel, message: string, data: any[]): void {
    const entry: LogEntry = {
      id: btoa(Math.random().toString()).substring(10, 18), // Быстрый короткий ID
      timestamp: new Date(),
      level,
      prefix: this.prefix,
      message,
      data: data.length > 0 ? data : undefined,
    };

    // Если разрешено, дублируем в консоль браузера с красивыми стилями
    if (this.enableConsole) {
      this.printToNativeConsole(entry);
    }

    // Передаем сформированный объект "наверх" (в сервис)
    this.callback(entry);
  }

  /** Стилизованный вывод в DevTools */
  private printToNativeConsole(entry: LogEntry): void {
    const colors: Record<LogLevel, string> = {
      log: '#808080',
      debug: '#7f8c8d',
      info: '#0070f3',
      warn: '#f5a623',
      error: '#ff0000',
    };

    const style = `color: ${colors[entry.level]}; font-weight: bold;`;
    const label = `[${entry.prefix}]`;

    // Вызываем оригинальный метод console (log, info, warn, error)
    const method = entry.level === 'debug' ? 'log' : entry.level;

    (console as any)[method](
      `%c${label} %c${entry.message}`,
      style,
      'color: inherit; font-weight: normal;',
      ...(entry.data || []),
    );
  }
}
