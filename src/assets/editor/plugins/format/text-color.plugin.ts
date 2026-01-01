/**
 * ════════════════════════════════════════════════════════════════════════════
 * TEXT COLOR PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для выбора цвета текста с модальным окном.
 *
 * @module TextColorPlugin
 */

import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuroraPlugin } from '../aurora-plugin.interface';

// Импортируем компонент
const ColorPickerModalComponent = () => import('../../components/color-picker-modal/color-picker-modal.component').then(m => m.ColorPickerModalComponent);

/**
 * Плагин выбора цвета текста
 */
export class TextColorPlugin implements AuroraPlugin {
  name = 'textColor';
  title = 'Цвет текста';
  icon = '🎨'; // Палитра

  private platformId = inject(PLATFORM_ID);
  private modal = inject(NzModalService);
  private savedSelection: Range | null = null;

  /**
   * Проверка, что код выполняется в браузере
   */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Выполнить плагин - открыть модальное окно выбора цвета
   */
  execute(editorElement: HTMLElement): boolean {
    console.log('[TextColorPlugin] Execute called');

    if (!this.isBrowser) {
      console.warn('[TextColorPlugin] Not running in browser');
      return false;
    }

    // Сохраняем выделение
    this.saveSelection();

    // Получаем текущий цвет
    const currentColor = this.getCurrentColor(editorElement);
    console.log('[TextColorPlugin] Current color:', currentColor);

    // Загружаем компонент асинхронно
    this.openColorPicker(currentColor, editorElement);

    return true;
  }

  /**
   * Открыть модальное окно выбора цвета
   */
  private async openColorPicker(currentColor: string, editorElement: HTMLElement): Promise<void> {
    // Загружаем компонент
    const component = await ColorPickerModalComponent();

    // Открываем модальное окно
    const modalRef = this.modal.create({
      nzTitle: '🎨 Выберите цвет текста',
      nzContent: component,
      nzData: {
        currentColor: currentColor,
        type: 'text',
        title: 'Выберите цвет текста'
      },
      nzFooter: null,
      nzWidth: 400,
      nzMaskClosable: true,
      nzClosable: true,
    });

    // Обрабатываем результат
    modalRef.afterClose.subscribe((result: any) => {
      console.log('[TextColorPlugin] Modal closed with result:', result);
      if (result && result.color) {
        this.applyColor(result.color, editorElement);
      }
    });
  }

  /**
   * Сохранить выделение
   */
  private saveSelection(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedSelection = selection.getRangeAt(0).cloneRange();
      console.log('[TextColorPlugin] Selection saved');
    }
  }

  /**
   * Восстановить выделение
   */
  private restoreSelection(): void {
    if (!this.savedSelection) {
      return;
    }

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(this.savedSelection);
      console.log('[TextColorPlugin] Selection restored');
    }
  }

  /**
   * Применить цвет к выделенному тексту
   */
  private applyColor(color: string, editorElement: HTMLElement): void {
    console.log('[TextColorPlugin] Applying color:', color);

    // Восстанавливаем выделение
    this.restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        console.warn('[TextColorPlugin] No text selected');
        return;
      }

      // Создаём span с цветом
      const span = document.createElement('span');
      span.style.color = color;

      try {
        range.surroundContents(span);
      } catch (error) {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }

      // Восстанавливаем выделение
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);

      // Отправляем событие input
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('[TextColorPlugin] Color applied successfully');
    } catch (error) {
      console.error('[TextColorPlugin] Error applying color:', error);
    }
  }

  /**
   * Проверить активность плагина
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container instanceof HTMLElement ? container : container.parentElement;

    if (element) {
      const color = window.getComputedStyle(element).color;
      return color !== 'rgb(0, 0, 0)';
    }

    return false;
  }

  /**
   * Получить текущий цвет текста
   */
  getCurrentColor(editorElement: HTMLElement): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return '#000000';
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container instanceof HTMLElement ? container : container.parentElement;

    if (element) {
      const rgb = window.getComputedStyle(element).color;
      return this.rgbToHex(rgb);
    }

    return '#000000';
  }

  /**
   * Конвертировать RGB в HEX
   */
  private rgbToHex(rgb: string): string {
    if (!rgb || rgb === 'transparent') {
      return '#000000';
    }

    const result = rgb.match(/\d+/g);
    if (result && result.length >= 3) {
      const r = parseInt(result[0]);
      const g = parseInt(result[1]);
      const b = parseInt(result[2]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    return '#000000';
  }

  init(): void {}
  destroy(): void {}
}
