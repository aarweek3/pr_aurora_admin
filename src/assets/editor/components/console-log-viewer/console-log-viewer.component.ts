/**
 * ════════════════════════════════════════════════════════════════════════════
 * CONSOLE LOG VIEWER COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Компонент для отображения console.log сообщений под редактором.
 *
 * Особенности:
 * - Перехватывает все console.log вызовы
 * - Отображает лог в читаемом формате
 * - Кнопка копирования в буфер обмена
 * - Автоскролл к последнему сообщению
 * - Очистка логов
 *
 * @module ConsoleLogViewerComponent
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'log' | 'info' | 'warn' | 'error';
  args: any[];
}

@Component({
  selector: 'app-console-log-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './console-log-viewer.component.html',
  styleUrls: ['./console-log-viewer.component.scss'],
})
export class ConsoleLogViewerComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  isExpanded = true;
  maxLogs = 100; // Максимальное количество логов

  private originalConsoleLog: any;
  private originalConsoleInfo: any;
  private originalConsoleWarn: any;
  private originalConsoleError: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.interceptConsoleMethods();
  }

  ngOnDestroy(): void {
    this.restoreConsoleMethods();
  }

  /**
   * Перехватываем методы console
   */
  private interceptConsoleMethods(): void {
    // Сохраняем оригинальные методы
    this.originalConsoleLog = console.log;
    this.originalConsoleInfo = console.info;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;

    // Перехватываем console.log
    console.log = (...args: any[]) => {
      this.addLog('log', args);
      this.originalConsoleLog.apply(console, args);
    };

    // Перехватываем console.info
    console.info = (...args: any[]) => {
      this.addLog('info', args);
      this.originalConsoleInfo.apply(console, args);
    };

    // Перехватываем console.warn
    console.warn = (...args: any[]) => {
      this.addLog('warn', args);
      this.originalConsoleWarn.apply(console, args);
    };

    // Перехватываем console.error
    console.error = (...args: any[]) => {
      this.addLog('error', args);
      this.originalConsoleError.apply(console, args);
    };
  }

  /**
   * Восстанавливаем оригинальные методы console
   */
  private restoreConsoleMethods(): void {
    if (this.originalConsoleLog) {
      console.log = this.originalConsoleLog;
    }
    if (this.originalConsoleInfo) {
      console.info = this.originalConsoleInfo;
    }
    if (this.originalConsoleWarn) {
      console.warn = this.originalConsoleWarn;
    }
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
  }

  /**
   * Добавляем лог в массив
   */
  private addLog(type: 'log' | 'info' | 'warn' | 'error', args: any[]): void {
    // Используем setTimeout чтобы избежать ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      const message = args.map((arg) => this.formatArgument(arg)).join(' ');

      const entry: LogEntry = {
        timestamp: new Date(),
        message,
        type,
        args,
      };

      this.logs.push(entry);

      // Ограничиваем количество логов
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // Принудительно запускаем обнаружение изменений
      this.cdr.detectChanges();

      // Автоскролл к последнему сообщению
      setTimeout(() => this.scrollToBottom(), 0);
    }, 0);
  }

  /**
   * Форматируем аргумент для отображения
   */
  private formatArgument(arg: any): string {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }

  /**
   * Копируем все логи в буфер обмена
   */
  async copyToClipboard(): Promise<void> {
    const text = this.logs
      .map((log) => {
        const time = log.timestamp.toLocaleTimeString('ru-RU');
        return `[${time}] [${log.type.toUpperCase()}] ${log.message}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      alert('Логи скопированы в буфер обмена!');
    } catch (err) {
      console.error('Ошибка копирования:', err);
      alert('Не удалось скопировать логи');
    }
  }

  /**
   * Копируем один лог
   */
  async copyLog(log: LogEntry): Promise<void> {
    const time = log.timestamp.toLocaleTimeString('ru-RU');
    const text = `[${time}] [${log.type.toUpperCase()}] ${log.message}`;

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  }

  /**
   * Очищаем все логи
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Переключаем видимость панели
   */
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Скроллим к последнему сообщению
   */
  private scrollToBottom(): void {
    const element = document.querySelector('.console-log-viewer-content');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  /**
   * Получаем CSS класс для типа лога
   */
  getLogClass(type: string): string {
    return `console-log-entry-${type}`;
  }

  /**
   * Форматируем время
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }
}
