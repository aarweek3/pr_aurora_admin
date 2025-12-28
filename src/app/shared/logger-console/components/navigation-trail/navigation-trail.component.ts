import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEntry, NavigationType } from '../../models/navigation-trail.model';
import { NavigationTrailService } from '../../services/navigation-trail.service';

@Component({
  selector: 'app-navigation-trail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navigation-trail.component.html',
  styleUrls: ['./navigation-trail.component.scss'],
})
export class NavigationTrailComponent {
  private readonly navigationService = inject(NavigationTrailService);

  // Expose Object for template
  readonly Object = Object;

  // Фильтры
  readonly searchQuery = signal('');
  readonly selectedType = signal<NavigationType | 'all'>('all');

  // Данные
  readonly entries = this.navigationService.entries;
  readonly stats = this.navigationService.stats;

  // Отфильтрованные записи
  readonly filteredEntries = computed(() => {
    let entries = this.entries();
    const query = this.searchQuery().toLowerCase();
    const type = this.selectedType();

    // Фильтр по типу
    if (type !== 'all') {
      entries = entries.filter((e) => e.type === type);
    }

    // Поиск
    if (query) {
      entries = entries.filter(
        (e) =>
          e.route.url.toLowerCase().includes(query) || e.route.path.toLowerCase().includes(query),
      );
    }

    return entries.slice().reverse(); // Показываем новые сверху
  });

  // UI состояние
  readonly expandedEntries = signal<Set<string>>(new Set());

  /**
   * Переключение раскрытия записи
   */
  toggleExpand(entryId: string): void {
    this.expandedEntries.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  }

  /**
   * Проверка, раскрыта ли запись
   */
  isExpanded(entryId: string): boolean {
    return this.expandedEntries().has(entryId);
  }

  /**
   * Навигация к записи
   */
  navigateToEntry(entry: NavigationEntry): void {
    this.navigationService.navigateToEntry(entry);
  }

  /**
   * Очистка истории
   */
  clearHistory(): void {
    if (confirm('Очистить всю историю навигации?')) {
      this.navigationService.clearHistory();
    }
  }

  /**
   * Экспорт истории
   */
  exportHistory(): void {
    const json = this.navigationService.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navigation-trail-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Получение иконки для типа навигации
   */
  getTypeIcon(type: NavigationType): string {
    const icons: Record<NavigationType, string> = {
      initial: '🏁',
      push: '➡️',
      pop: '⬅️',
      replace: '🔄',
      reload: '🔃',
    };
    return icons[type];
  }

  /**
   * Получение CSS класса для типа
   */
  getTypeClass(type: NavigationType): string {
    return `type-${type}`;
  }

  /**
   * Получение CSS класса для статуса
   */
  getStatusClass(success: boolean): string {
    return success ? 'status-success' : 'status-error';
  }

  /**
   * Форматирование времени
   */
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }

  /**
   * Форматирование длительности
   */
  formatDuration(ms: number | undefined): string {
    if (ms === undefined) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Проверка наличия параметров
   */
  hasParams(entry: NavigationEntry): boolean {
    return (
      Object.keys(entry.route.params.queryParams).length > 0 ||
      Object.keys(entry.route.params.routeParams).length > 0 ||
      entry.route.params.fragment !== null
    );
  }
}
