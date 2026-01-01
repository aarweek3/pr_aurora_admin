/**
 * ════════════════════════════════════════════════════════════════════════════
 * BACKGROUND COLOR PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для выбора цвета фона текста с модальным окном.
 *
 * @module BackgroundColorPlugin
 */

import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuroraPlugin } from '../aurora-plugin.interface';

// Импортируем компонент
const ColorPickerModalComponent = () => import('../../components/color-picker-modal/color-picker-modal.component').then(m => m.ColorPickerModalComponent);

/**
 * Плагин выбора цвета фона текста
 */
export class BackgroundColorPlugin implements AuroraPlugin {
  name = 'backgroundColor';
  title = 'Цвет фона';
  icon = '🖍️'; // Маркер

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
   * Выполнить плагин - открыть модальное окно выбора цвета фона
   */
  execute(editorElement: HTMLElement): boolean {
    console.log('[BackgroundColorPlugin] Execute called');

    if (!this.isBrowser) {
      console.warn('[BackgroundColorPlugin] Not running in browser');
      return false;
    }

    // Сохраняем выделение
    this.saveSelection();

    // Получаем текущий цвет фона
    const currentColor = this.getCurrentBackgroundColor(editorElement);
    console.log('[BackgroundColorPlugin] Current color:', currentColor);

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
      nzTitle: '🎨 Выберите цвет фона текста',
      nzContent: component,
      nzData: {
        currentColor: currentColor,
        type: 'background',
        title: 'Выберите цвет фона текста',
        showRemoveOption: true
      },
      nzFooter: null,
      nzWidth: 400,
      nzMaskClosable: true,
      nzClosable: true,
    });

    // Обрабатываем результат
    modalRef.afterClose.subscribe((result: any) => {
      console.log('[BackgroundColorPlugin] Modal closed with result:', result);
      if (result) {
        if (result.action === 'remove') {
          this.removeBackgroundColor(editorElement);
        } else if (result.color) {
          this.applyBackgroundColor(result.color, editorElement);
        }
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
      console.log('[BackgroundColorPlugin] Selection saved');
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
      console.log('[BackgroundColorPlugin] Selection restored');
    }
  }

  /**
   * Применить цвет фона к выделенному тексту
   */
  private applyBackgroundColor(color: string, editorElement: HTMLElement): void {
    console.log('[BackgroundColorPlugin] Applying background color:', color);

    // Восстанавливаем выделение
    this.restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        console.warn('[BackgroundColorPlugin] No text selected');
        return;
      }

      // Создаём span с цветом фона
      const span = document.createElement('span');
      span.style.backgroundColor = color;

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
      console.log('[BackgroundColorPlugin] Background color applied successfully');
    } catch (error) {
      console.error('[BackgroundColorPlugin] Error applying background color:', error);
    }
  }

  /**
   * Удалить цвет фона текста
   */
  private removeBackgroundColor(editorElement: HTMLElement): void {
    console.log('[BackgroundColorPlugin] Removing background color');

    this.restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      return;
    }

    try {
      // Извлекаем содержимое
      const fragment = range.extractContents();

      // Удаляем стили фона
      this.removeBackgroundColorFromNode(fragment);

      // Вставляем обратно
      range.insertNode(fragment);

      // Отправляем событие input
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('[BackgroundColorPlugin] Background color removed successfully');
    } catch (error) {
      console.error('[BackgroundColorPlugin] Error removing background color:', error);
    }
  }

  /**
   * Рекурсивно удалить стили фона из узла
   */
  private removeBackgroundColorFromNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      if (element.style) {
        element.style.backgroundColor = '';

        // Если стиль пустой, удаляем атрибут
        if (!element.style.cssText.trim()) {
          element.removeAttribute('style');
        }
      }

      // Обрабатываем дочерние элементы
      for (let i = 0; i < element.childNodes.length; i++) {
        this.removeBackgroundColorFromNode(element.childNodes[i]);
      }
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
      const bgColor = window.getComputedStyle(element).backgroundColor;
      return bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
    }

    return false;
  }

  /**
   * Получить текущий цвет фона
   */
  getCurrentBackgroundColor(editorElement: HTMLElement): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return 'transparent';
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container instanceof HTMLElement ? container : container.parentElement;

    if (element) {
      const rgb = window.getComputedStyle(element).backgroundColor;
      return this.rgbToHex(rgb);
    }

    return 'transparent';
  }

  /**
   * Конвертировать RGB в HEX
   */
  private rgbToHex(rgb: string): string {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
      return 'transparent';
    }

    const result = rgb.match(/\d+/g);
    if (result && result.length >= 3) {
      const r = parseInt(result[0]);
      const g = parseInt(result[1]);
      const b = parseInt(result[2]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    return 'transparent';
  }

  init(): void {}
  destroy(): void {}
}
