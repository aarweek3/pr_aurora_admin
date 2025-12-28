import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogLevel } from '../../models/logger-console.model';
import { LoggerConsoleService } from '../../services/logger-console.service';
import { LoggerConsoleJsonViewerComponent } from '../logger-console-json-viewer/logger-console-json-viewer.component';
import { NavigationTrailComponent } from '../navigation-trail/navigation-trail.component';

@Component({
  selector: 'app-logger-console',
  standalone: true,
  imports: [CommonModule, FormsModule, LoggerConsoleJsonViewerComponent, NavigationTrailComponent],
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
  activeTab = signal<'logs' | 'navigation'>('logs');

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
