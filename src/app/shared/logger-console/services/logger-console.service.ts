import { Injectable, signal, WritableSignal } from '@angular/core';
import { ILoggerConsole, LogEntry, LoggerConsoleConfig } from '../models/logger-console.model';
import { SimpleLoggerConsole } from './logger-console.engine';

@Injectable({
  providedIn: 'root',
})
export class LoggerConsoleService {
  /** Конфигурация по умолчанию */
  private readonly config: LoggerConsoleConfig = {
    minLevel: 'log',
    enableConsole: true,
    maxBuffer: 1000,
  };

  /** Количество удаляемых строк при переполнении (Пакетная очистка) */
  private readonly BATCH_DELETE_SIZE = 100;

  /** Основное хранилище логов (реактивное) */
  private logsSignal: WritableSignal<LogEntry[]> = signal([]);

  /** Публичный сигнал для UI-компонентов (только для чтения) */
  readonly logs = this.logsSignal.asReadonly();

  /**
   * Получить экземпляр логгера для конкретного сервиса/компонента
   * @param source Префикс (строка) или сам инстанс компонента/сервиса (this)
   */
  getLogger(source: string | object): ILoggerConsole {
    const prefix = typeof source === 'string' ? source : source.constructor.name;

    return new SimpleLoggerConsole(
      prefix,
      (entry) => this.pushEntry(entry),
      this.config.enableConsole,
    );
  }

  /** Полная очистка списка логов */
  clear(): void {
    this.logsSignal.set([]);
  }

  /** Экспорт накопленных логов в файл JSON */
  exportToJSON(): void {
    const logs = this.logsSignal();
    if (logs.length === 0) return;

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `logger_export_${new Date().getTime()}.json`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  /** Добавление новой записи с логикой Smart FIFO */
  private pushEntry(entry: LogEntry): void {
    this.logsSignal.update((currentLogs) => {
      const updatedLogs = [...currentLogs, entry];

      // Если превысили лимит, удаляем сразу пачку (100 шт) для оптимизации памяти
      if (updatedLogs.length > this.config.maxBuffer) {
        return updatedLogs.slice(this.BATCH_DELETE_SIZE);
      }

      return updatedLogs;
    });
  }
}
