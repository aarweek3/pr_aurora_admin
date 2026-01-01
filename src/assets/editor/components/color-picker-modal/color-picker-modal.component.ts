/**
 * Компонент модального окна выбора цвета
 * Предоставляет палитру цветов и возможность ввода hex-кода
 */

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ColorPickerResult {
  color?: string;
  action?: 'select' | 'remove';
}

@Component({
  selector: 'aurora-color-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-picker-modal.component.html',
  styleUrls: ['./color-picker-modal.component.scss'],
})
export class ColorPickerModalComponent implements OnDestroy {
  @ViewChild('dialog', { static: false }) dialogRef?: ElementRef<HTMLDialogElement>;

  @Output() onColorSelect = new EventEmitter<ColorPickerResult>();
  @Output() onCancel = new EventEmitter<void>();

  // Текущие параметры
  currentColor = '#000000';
  colorType: 'text' | 'background' = 'text';
  title = 'Выберите цвет';
  showRemoveOption = false;

  // Выбранный цвет
  selectedColor = '#000000';
  customColorInput = '#000000';

  // Палитра предустановленных цветов
  predefinedColors = [
    // Основные цвета
    ['#000000', '#FFFFFF', '#808080', '#C0C0C0'],
    // Красные оттенки
    ['#FF0000', '#DC143C', '#8B0000', '#FFC0CB'],
    // Оранжевые и жёлтые
    ['#FFA500', '#FF8C00', '#FFFF00', '#FFD700'],
    // Зелёные
    ['#00FF00', '#008000', '#90EE90', '#32CD32'],
    // Синие
    ['#0000FF', '#00008B', '#87CEEB', '#4169E1'],
    // Пурпурные и фиолетовые
    ['#FF00FF', '#800080', '#9370DB', '#DDA0DD'],
    // Голубые
    ['#00FFFF', '#008B8B', '#40E0D0', '#AFEEEE'],
    // Коричневые
    ['#A52A2A', '#8B4513', '#D2691E', '#CD853F'],
  ];

  /**
   * Открыть модальное окно
   */
  open(options: {
    currentColor?: string;
    type?: 'text' | 'background';
    title?: string;
    showRemoveOption?: boolean;
  }): void {
    console.log('[ColorPickerModal] Opening with options:', options);

    this.currentColor = options.currentColor || '#000000';
    this.selectedColor = this.currentColor;
    this.customColorInput = this.currentColor;
    this.colorType = options.type || 'text';
    this.title = options.title || 'Выберите цвет';
    this.showRemoveOption = options.showRemoveOption || false;

    console.log('[ColorPickerModal] State set:', {
      currentColor: this.currentColor,
      selectedColor: this.selectedColor,
      title: this.title,
    });

    this.showDialog();
  }

  /**
   * Показать диалог
   */
  private showDialog(): void {
    console.log('[ColorPickerModal] Showing dialog, dialogRef:', this.dialogRef);

    // Используем setTimeout чтобы дождаться рендера ViewChild
    setTimeout(() => {
      if (this.dialogRef?.nativeElement) {
        console.log('[ColorPickerModal] Dialog element:', this.dialogRef.nativeElement);
        this.dialogRef.nativeElement.showModal();
        console.log('[ColorPickerModal] showModal() called');
      } else {
        console.error('[ColorPickerModal] Dialog ref not available after timeout!');
      }
    }, 0);
  }

  /**
   * Закрыть диалог
   */
  close(): void {
    if (this.dialogRef?.nativeElement) {
      this.dialogRef.nativeElement.close();
    }
  }

  /**
   * Выбрать цвет из палитры
   */
  selectColor(color: string): void {
    this.selectedColor = color;
    this.customColorInput = color;
  }

  /**
   * Обновить выбранный цвет при изменении в input
   */
  onCustomColorChange(): void {
    // Валидация hex цвета
    if (/^#[0-9A-Fa-f]{6}$/.test(this.customColorInput)) {
      this.selectedColor = this.customColorInput;
    }
  }

  /**
   * Применить выбранный цвет
   */
  apply(): void {
    this.onColorSelect.emit({
      color: this.selectedColor,
      action: 'select',
    });
    this.close();
  }

  /**
   * Удалить цвет
   */
  remove(): void {
    this.onColorSelect.emit({
      action: 'remove',
    });
    this.close();
  }

  /**
   * Отмена
   */
  cancel(): void {
    this.onCancel.emit();
    this.close();
  }

  /**
   * Cleanup при уничтожении
   */
  ngOnDestroy(): void {
    this.close();
  }
}
