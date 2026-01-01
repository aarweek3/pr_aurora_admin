import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableConfig } from '../../plugins/insert/table.plugin';

/**
 * Модальное окно для настройки параметров таблицы
 */
@Component({
  selector: 'app-table-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-modal.component.html',
  styleUrl: './table-modal.component.scss',
})
export class TableModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<TableConfig>();

  isVisible = false;
  Array = Array; // Для использования в template

  // Настройки таблицы
  rows = 3;
  cols = 3;
  hasHeader = true;
  bordered = true;
  striped = false;
  hover = true;
  widthType: 'full' | 'auto' | 'custom' = 'full';
  customWidth = 600;

  /**
   * Открывает модальное окно
   */
  open(): void {
    this.isVisible = true;
    // Сбрасываем настройки к дефолтным
    this.rows = 3;
    this.cols = 3;
    this.hasHeader = true;
    this.bordered = true;
    this.striped = false;
    this.hover = true;
    this.widthType = 'full';
    this.customWidth = 600;
  }

  /**
   * Закрывает модальное окно
   */
  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  /**
   * Подтверждает создание таблицы
   */
  confirm(): void {
    const config: TableConfig = {
      rows: this.rows,
      cols: this.cols,
      hasHeader: this.hasHeader,
      bordered: this.bordered,
      striped: this.striped,
      hover: this.hover,
      widthType: this.widthType,
      customWidth: this.widthType === 'custom' ? this.customWidth : undefined,
    };

    this.confirmed.emit(config);
    this.close();
  }

  /**
   * Закрытие по клику на оверлей
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  /**
   * Обработка нажатия Escape
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  /**
   * Увеличить/уменьшить значение
   */
  increment(field: 'rows' | 'cols'): void {
    if (field === 'rows' && this.rows < 20) {
      this.rows++;
    } else if (field === 'cols' && this.cols < 10) {
      this.cols++;
    }
  }

  decrement(field: 'rows' | 'cols'): void {
    if (field === 'rows' && this.rows > 1) {
      this.rows--;
    } else if (field === 'cols' && this.cols > 1) {
      this.cols--;
    }
  }
}
