import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogLevel } from '../../models/logger-console.model';
import { LoggerConsoleService } from '../../services/logger-console.service';
import { LoggerConsoleJsonViewerComponent } from '../logger-console-json-viewer/logger-console-json-viewer.component';
import { LoggerStorageEditorComponent } from '../logger-storage-editor/logger-storage-editor.component';
import { LoggerTerminalComponent } from '../logger-terminal/logger-terminal.component';
import { NavigationTrailComponent } from '../navigation-trail/navigation-trail.component';

@Component({
  selector: 'app-logger-console',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoggerConsoleJsonViewerComponent,
    NavigationTrailComponent,
    LoggerStorageEditorComponent,
    LoggerTerminalComponent,
  ],
  templateUrl: './logger-console.component.html',
  styleUrls: ['./logger-console.component.scss'],
  host: {
    '[class.light-theme]': '!isDarkTheme()',
  },
})
export class LoggerConsoleComponent {
  public loggerService = inject(LoggerConsoleService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  /** Активная вкладка */
  activeTab = signal<'logs' | 'navigation' | 'storage' | 'terminal'>('logs');

  /** Тема консоли: true = темная, false = светлая */
  isDarkTheme = signal(true);

  /** Поисковый запрос */
  searchQuery = signal('');

  /** Активные фильтры уровней */
  activeLevels = signal<Record<LogLevel, boolean>>({
    log: true,
    debug: true,
    info: true,
    warn: true,
    error: true,
  });

  /** Список всех уровней для кнопок фильтрации */
  readonly levels: LogLevel[] = ['log', 'debug', 'info', 'warn', 'error'];

  /** Флаг отображения HTTP запросов */
  showHttp = signal(true);

  /** Флаг отображения действий пользователя */
  showActions = signal(true);

  /** Флаг отображения изменений состояния (Signals) */
  showState = signal(true);

  /** Флаг отображения справки */
  showHelp = signal(false);

  /** Флаг авто-скролла */
  autoScroll = true;

  /** Флаг состояния копирования всех логов */
  isCopied = signal(false);

  /** Отфильтрованный список логов */
  filteredLogs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const active = this.activeLevels();
    const showHttp = this.showHttp();

    return this.loggerService.logs().filter((log) => {
      // Если это HTTP лог и фильтр выключен -> скрываем
      if (log.type === 'http' && !showHttp) {
        return false;
      }

      // Если это Action лог и фильтр выключен -> скрываем
      if (log.type === 'interaction' && !this.showActions()) {
        return false;
      }

      // Если это State лог и фильтр выключен -> скрываем
      if (log.type === 'state' && !this.showState()) {
        return false;
      }

      const matchLevel = active[log.level];
      const matchSearch =
        !query ||
        log.message.toLowerCase().includes(query) ||
        log.prefix.toLowerCase().includes(query);

      return matchLevel && matchSearch;
    });
  });

  /** Счетчики по уровням */
  counters = computed(() => {
    const logs = this.loggerService.logs();
    return this.levels.reduce((acc, level) => {
      acc[level] = logs.filter((l) => l.level === level).length;
      return acc;
    }, {} as Record<LogLevel, number>);
  });

  constructor() {
    // Эффект для автоматического скролла при добавлении новых логов
    effect(() => {
      // Подписываемся на изменение отфильтрованных логов
      this.filteredLogs();

      if (this.autoScroll) {
        this.scrollToBottom();
      }
    });
  }

  /** Переключение фильтра уровня */
  toggleLevel(level: LogLevel): void {
    this.activeLevels.update((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  }

  /** Очистка всех логов через сервис */
  clear(): void {
    this.loggerService.clear();
  }

  /** Экспорт в JSON через сервис */
  export(): void {
    this.loggerService.exportToJSON();
  }

  /** Получение относительного пути из URL для компактности */
  getUrlPath(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  }

  /** Переключение фильтра HTTP */
  toggleHttp(): void {
    this.showHttp.update((v) => !v);
  }

  /** Переключение фильтра действий пользователя */
  toggleActions(): void {
    this.showActions.update((v) => !v);
  }

  /** Переключение фильтра состояния */
  toggleState(): void {
    this.showState.update((v) => !v);
  }

  /** Переключение темы */
  toggleTheme(): void {
    this.isDarkTheme.update((v) => !v);
  }

  /** Переключение справки */
  toggleHelp(): void {
    this.showHelp.update((v) => !v);
  }

  /** Копирование сообщения в буфер */
  copyMessage(message: string): void {
    navigator.clipboard.writeText(message);
  }

  /** Копирование всех отфильтрованных логов в текстовом формате */
  copyAllLogs(): void {
    const logs = this.filteredLogs();
    const text = logs
      .map((log) => {
        const time = new Date(log.timestamp).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3,
        });
        const level = log.level.toUpperCase().padEnd(5);
        let content = '';

        if (log.type === 'http' && log.httpDetails) {
          content = `[HTTP] ${log.httpDetails.method} ${log.httpDetails.statusCode} ${log.httpDetails.url} (${log.httpDetails.duration}ms)`;
        } else if (log.type === 'interaction' && log.interactionDetails) {
          content = `[ACTION] [${log.prefix}] ${log.interactionDetails.element}: ${log.interactionDetails.text}`;
        } else if (log.type === 'state' && log.stateDetails) {
          const oldVal = JSON.stringify(log.stateDetails.oldValue);
          const newVal = JSON.stringify(log.stateDetails.newValue);
          content = `[STATE] [${log.prefix}] ${log.stateDetails.name}: ${oldVal} -> ${newVal}`;
        } else {
          content = (log.prefix ? `[${log.prefix}] ` : '') + log.message;
        }

        const dataStr =
          log.data && log.data.length > 0
            ? '\n  Data: ' + JSON.stringify(log.data, null, 2).replace(/\n/g, '\n  ')
            : '';

        return `[${time}] ${level} ${content}${dataStr}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);

    // Устанавливаем статус "Скопировано" на 5 секунд
    this.isCopied.set(true);
    setTimeout(() => {
      this.isCopied.set(false);
    }, 5000);
  }

  /** Копирование HTTP запроса как cURL */
  copyAsCurl(log: any): void {
    const details = log.httpDetails;
    if (!details) return;

    let curl = `curl -X ${details.method} '${details.url}'`;

    // Добавляем заголовки
    if (details.headers) {
      Object.entries(details.headers).forEach(([key, value]) => {
        curl += ` \\\n  -H '${key}: ${value}'`;
      });
    }

    // Ищем тело запроса в data
    const requestBodyItem = log.data?.find((d: any) => d && d['Request Body']);
    if (requestBodyItem) {
      const body = requestBodyItem['Request Body'];
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      curl += ` \\\n  --data-raw '${bodyStr}'`;
    }

    navigator.clipboard.writeText(curl);
  }

  /** Обработка скролла пользователем (для отключения авто-скролла) */
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 50; // Пикселей от низа
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + threshold;

    this.autoScroll = isAtBottom;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
