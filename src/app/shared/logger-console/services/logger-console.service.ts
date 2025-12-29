import {
  effect,
  inject,
  Injectable,
  Injector,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { environment } from '@environments/environment';
import {
  ClientInfo,
  ILoggerConsole,
  InteractionLogDetails,
  LogEntry,
  LoggerConsoleConfig,
} from '../models/logger-console.model';
import { SimpleLoggerConsole } from './logger-console.engine';

export interface CommandHandler {
  name: string;
  description: string;
  execute: (args: string[]) => string | Promise<string> | void;
}

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
  private clientInfoSignal = signal<ClientInfo>(this.detectClientInfo());
  private injector = inject(Injector);

  /** Публичный сигнал для UI-компонентов (только для чтения) */
  readonly logs = this.logsSignal.asReadonly();
  readonly clientInfo = this.clientInfoSignal.asReadonly();

  /** Реестр команд терминала */
  private commands = new Map<string, CommandHandler>();

  /** История команд для терминала */
  private terminalHistorySignal = signal<string[]>([]);
  readonly terminalHistory = this.terminalHistorySignal.asReadonly();

  constructor() {
    // Слушаем изменение размера окна для обновления viewport
    window.addEventListener('resize', () => this.updateClientInfo());

    // Слушаем состояние сети
    window.addEventListener('online', () => this.updateClientInfo());
    window.addEventListener('offline', () => this.updateClientInfo());

    // Инициализируем трекинг действий пользователя
    this.setupInteractionTracking();

    // Регистрируем встроенные команды
    this.registerDefaultCommands();
  }

  /** Регистрация новой команды */
  registerCommand(handler: CommandHandler): void {
    this.commands.set(handler.name.toLowerCase(), handler);
  }

  /** Выполнение команды из строки */
  async executeCommand(commandLine: string): Promise<string> {
    const parts = commandLine.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Добавляем в историю
    this.terminalHistorySignal.update((h) => [...h, commandLine]);

    const handler = this.commands.get(commandName);
    if (!handler) {
      return `Error: Command "${commandName}" not found. Type "help" for list of commands.`;
    }

    try {
      const result = await handler.execute(args);
      return result || `Command "${commandName}" executed successfully.`;
    } catch (err: any) {
      return `Error executing "${commandName}": ${err.message || err}`;
    }
  }

  /** Получить список всех команд */
  getCommandsList(): CommandHandler[] {
    return Array.from(this.commands.values());
  }

  private registerDefaultCommands(): void {
    this.registerCommand({
      name: 'help',
      description: 'Показать список всех доступных команд с описанием',
      execute: () => {
        const header = '=== Доступные команды ===\n';
        const list = this.getCommandsList()
          .map((c) => `${c.name.padEnd(15)} - ${c.description}`)
          .join('\n');
        return header + list;
      },
    });

    this.registerCommand({
      name: 'clear',
      description: 'Очистить историю терминала и буфер логов консоли',
      execute: () => {
        this.clear();
        return 'Очистка выполнена успешно.';
      },
    });

    this.registerCommand({
      name: 'echo',
      description: 'Вывести текст в терминал (пример: echo привет)',
      execute: (args) => args.join(' '),
    });

    this.registerCommand({
      name: 'clear-cache',
      description: 'Полная очистка LocalStorage и SessionStorage',
      execute: () => {
        localStorage.clear();
        sessionStorage.clear();
        return 'Кэш браузера (Storage) полностью очищен.';
      },
    });

    this.registerCommand({
      name: 'toggle-theme',
      description: 'Переключить тему оформления (Светлая/Темная)',
      execute: () => {
        return 'Запрос на смену темы отправлен.';
      },
    });

    this.registerCommand({
      name: 'auth-status',
      description: 'Состояние авторизации (кто залогинен, роли, токен)',
      execute: () => {
        // Ленивое получение AuthService через Injector для избежания круговой зависимости
        const authService = this.injector.get(AuthService);
        const user = authService.getCurrentUser();
        const roles = authService.getUserRoles();
        const isAuth = authService.isLoggedIn();

        if (!isAuth) {
          return 'Статус: Гость (Не авторизован)';
        }

        return [
          `=== Информация об аккаунте ===`,
          `Email: ${user?.email}`,
          `Имя  : ${user?.fullName}`,
          `Роли : ${roles.join(', ') || 'Нет ролей'}`,
          `Статус: Авторизован ✅`,
        ].join('\n');
      },
    });
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

// Импорт в конце файла для использования в Injector.get(AuthService)
import { AuthService } from '../../../auth/services/auth.service';
