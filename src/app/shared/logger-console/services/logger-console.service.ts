import { effect, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { environment } from '@environments/environment';
import {
  ClientInfo,
  ILoggerConsole,
  InteractionLogDetails,
  LogEntry,
  LoggerConsoleConfig,
} from '../models/logger-console.model';
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

  /** Информация о клиенте */
  private clientInfoSignal: WritableSignal<ClientInfo> = signal(this.detectClientInfo());

  /** Публичный сигнал для UI-компонентов (только для чтения) */
  readonly logs = this.logsSignal.asReadonly();
  readonly clientInfo = this.clientInfoSignal.asReadonly();

  constructor() {
    // Слушаем изменение размера окна для обновления viewport
    window.addEventListener('resize', () => this.updateClientInfo());

    // Слушаем состояние сети
    window.addEventListener('online', () => this.updateClientInfo());
    window.addEventListener('offline', () => this.updateClientInfo());

    // Инициализируем трекинг действий пользователя
    this.setupInteractionTracking();
  }

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

  /** Публичный метод для добавления лога (используется интерсепторами) */
  addEntry(entry: LogEntry): void {
    this.pushEntry(entry);
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

  /** Принудительное обновление информации о клиенте */
  updateClientInfo(): void {
    this.clientInfoSignal.set(this.detectClientInfo());
  }

  /** Детекция параметров окружения */
  private detectClientInfo(): ClientInfo {
    const ua = navigator.userAgent;

    // Определение браузера
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    // Определение ОС
    let os = 'Unknown';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('X11')) os = 'Linux';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone')) os = 'iOS';

    const width = window.innerWidth;
    const device = width < 768 ? 'Mobile' : width < 1200 ? 'Tablet' : 'Desktop';

    // Определение темы (базируется на стандартных классах Aurora или системных предпочтениях)
    const isDark =
      document.body.classList.contains('dark-theme') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      browser,
      os,
      device,
      resolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      theme: isDark ? 'Dark' : 'Light',
      language: navigator.language,
      isOnline: navigator.onLine,
      apiEndpoint: environment.api.baseUrl,
    };
  }

  /** Настройка глобального перехвата кликов для Breadcrumbs */
  private setupInteractionTracking(): void {
    document.addEventListener(
      'click',
      (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target) return;

        // Игнорируем клики внутри самой консоли логгера, чтобы не зацикливаться
        if (target.closest('app-logger-console')) return;

        // Ищем ближайший интерактивный элемент (button, a, input, etc.)
        const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"]');
        if (!interactiveEl) return;

        const el = interactiveEl as HTMLElement;
        const details: InteractionLogDetails = {
          element: el.tagName.toLowerCase(),
          text:
            el.innerText?.trim().substring(0, 50) ||
            el.getAttribute('aria-label') ||
            el.getAttribute('placeholder') ||
            '',
          id: el.id || undefined,
          classes: el.className || undefined,
        };

        const entry: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          level: 'info',
          type: 'interaction',
          prefix: 'USER_ACTION',
          message: `Click: ${details.element}${details.text ? ' "' + details.text + '"' : ''}`,
          interactionDetails: details,
        };

        this.pushEntry(entry);
      },
      true, // Capture phase to catch events early
    );
  }

  /**
   * Подписаться на изменения сигнала для логирования
   * @param signalToTrack Сам сигнал
   * @param name Название для отображения в консоли
   */
  trackSignal<T>(signalToTrack: Signal<T>, name: string): void {
    let lastValue = signalToTrack();

    effect(() => {
      const newValue = signalToTrack();

      const entry: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        level: 'debug',
        type: 'state',
        prefix: 'SIGNAL',
        message: `Signal "${name}" changed`,
        stateDetails: {
          name,
          oldValue: lastValue,
          newValue: newValue,
        },
        data: [newValue], // Добавляем текущее значение в data для JSON Viewer
      };

      this.pushEntry(entry);
      lastValue = newValue;
    });
  }
}
