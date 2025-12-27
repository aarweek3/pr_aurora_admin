import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogLevel } from '../../models/logger-console.model';
import { LoggerConsoleService } from '../../services/logger-console.service';
import { LoggerConsoleJsonViewerComponent } from '../logger-console-json-viewer/logger-console-json-viewer.component';

@Component({
  selector: 'app-logger-console',
  standalone: true,
  imports: [CommonModule, FormsModule, LoggerConsoleJsonViewerComponent],
  templateUrl: './logger-console.component.html',
  styleUrls: ['./logger-console.component.scss'],
})
export class LoggerConsoleComponent {
  public loggerService = inject(LoggerConsoleService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

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

  /** Флаг авто-скролла */
  autoScroll = true;

  /** Отфильтрованный список логов */
  filteredLogs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const active = this.activeLevels();

    return this.loggerService.logs().filter((log) => {
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
