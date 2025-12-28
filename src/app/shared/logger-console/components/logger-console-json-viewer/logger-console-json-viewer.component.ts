import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-logger-console-json-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logger-console-json-viewer.component.html',
  styleUrls: ['./logger-console-json-viewer.component.scss'],
})
export class LoggerConsoleJsonViewerComponent {
  /** Ключ объекта/индекса массива */
  @Input() key?: string;

  /** Значение данных */
  @Input() value: any;

  /** Путь до текущего ключа (для копирования) */
  @Input() path: string = '';

  /** Состояние развернутости */
  isExpanded = signal(false);

  /** Состояние полного отображения превью (снятие лимита строк) */
  isPreviewFullyVisible = signal(false);

  /** Тип значения */
  get valueType(): string {
    if (this.value === null) return 'null';
    if (Array.isArray(this.value)) return 'array';
    return typeof this.value;
  }

  /** Проверка, является ли значение сложным объектом/массивом */
  get isExpandable(): boolean {
    return this.valueType === 'object' || this.valueType === 'array';
  }

  /** Получение ключей для итерации (если объект/массив) */
  get objectKeys(): string[] {
    if (!this.value) return [];
    return Object.keys(this.value);
  }

  /** Название типа для отображения в скобках */
  get typeLabel(): string {
    if (Array.isArray(this.value)) return `Array(${this.value.length})`;
    // Для обычных объектов не пишем "Object", это лишний шум
    if (this.valueType === 'object') return '';
    return '';
  }

  /** Переключение видимости дерева */
  toggleExpand(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isExpandable) {
      this.isExpanded.update((v) => !v);
    }
  }

  /** Переключение полного текста превью */
  togglePreviewFullText(event: MouseEvent): void {
    event.stopPropagation();
    this.isPreviewFullyVisible.update((v) => !v);
  }

  /** Копирование пути в буфер обмена */
  copyPath(event: MouseEvent): void {
    event.stopPropagation();
    navigator.clipboard.writeText(this.path).then(() => {
      // Можно было бы добавить микро-нотификацию, но для логов достаточно молчаливого копирования
      console.debug('Path copied:', this.path);
    });
  }

  /** Формирование пути для дочерних элементов */
  getChildPath(childKey: string): string {
    const cleanPath = this.path ? this.path : '';
    if (Array.isArray(this.value)) {
      return `${cleanPath}[${childKey}]`;
    }
    return cleanPath ? `${cleanPath}.${childKey}` : childKey;
  }
}
