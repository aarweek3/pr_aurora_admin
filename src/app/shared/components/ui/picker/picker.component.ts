import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { DEFAULT_CUSTOM_COLORS, type CustomColor, type PickerMode } from './picker.types';

/**
 * Color Picker Component
 *
 * Универсальный компонент для выбора цвета с поддержкой:
 * - Только кастомные цвета
 * - Только color picker
 * - Комбинация кастомных цветов и picker
 *
 * @example
 * ```html
 * <!-- Только кастомные цвета -->
 * <av-picker
 *   mode="custom-only"
 *   [(selectedColor)]="color"
 *   [customColors]="myColors"
 * ></av-picker>
 *
 * <!-- Только picker -->
 * <av-picker
 *   mode="picker-only"
 *   [(selectedColor)]="color"
 * ></av-picker>
 *
 * <!-- Комбинация -->
 * <av-picker
 *   mode="custom-and-picker"
 *   [(selectedColor)]="color"
 *   [customColors]="myColors"
 * ></av-picker>
 * ```
 */
@Component({
  selector: 'av-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, NzColorPickerModule],
  templateUrl: './picker.component.html',
  styleUrl: './picker.component.scss',
})
export class PickerComponent {
  // Inputs
  mode = input<PickerMode>('custom-and-picker');
  avSize = input<'default' | 'compact'>('compact');
  customColors = input<CustomColor[]>(DEFAULT_CUSTOM_COLORS);
  allowTransparent = input<boolean>(false);
  showInput = input<boolean>(true);
  showAlpha = input<boolean>(false);
  avTitle = input<string | undefined>();
  showWrapper = input<boolean>(true);
  showBorder = input<boolean>(true);
  hideLabels = input<boolean>(false); // Скрыть надписи "ПАЛИТРА:" и "CUSTOM COLOR:"

  // Two-way binding
  selectedColor = model<string>('#1890ff');
  defaultColor = input<string>('#1890ff');

  // Output
  colorChange = output<string>();

  onReset(): void {
    const dColor = this.defaultColor();
    this.selectedColor.set(dColor);
    this.colorChange.emit(dColor);
  }

  onColorSelect(color: string): void {
    this.selectedColor.set(color);
    this.colorChange.emit(color);
  }

  onPickerChange(color: string): void {
    this.selectedColor.set(color);
    this.colorChange.emit(color);
  }

  isColorSelected(color: string): boolean {
    return this.selectedColor() === color;
  }

  shouldShowCustomColors(): boolean {
    return this.mode() === 'custom-only' || this.mode() === 'custom-and-picker';
  }

  shouldShowPicker(): boolean {
    return this.mode() === 'picker-only' || this.mode() === 'custom-and-picker';
  }
}
