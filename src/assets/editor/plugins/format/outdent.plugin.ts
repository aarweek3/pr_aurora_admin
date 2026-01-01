/**
 * ════════════════════════════════════════════════════════════════════════════
 * OUTDENT PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для уменьшения отступа блока.
 * Уменьшает margin-left на 40px у текущего блока.
 * Горячая клавиша: Shift+Tab
 *
 * @module OutdentPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин уменьшения отступа
 */
export class OutdentPlugin implements AuroraPlugin {
  name = 'outdent';
  title = 'Уменьшить отступ';
  icon = '←'; // Стрелка влево
  shortcut = 'Shift+Tab';

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[OutdentPlugin] Initialized');
  }

  /**
   * Выполнить команду уменьшения отступа
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      const range = selection.getRangeAt(0);

      // Проверяем, что выделение внутри редактора
      if (!editorElement.contains(range.commonAncestorContainer)) {
        return false;
      }

      // Находим текущий блочный элемент
      const block = this.getBlockElement(range.commonAncestorContainer, editorElement);

      if (!block) {
        return false;
      }

      // Уменьшаем отступ
      this.decreaseIndent(block);

      return true;
    } catch (error) {
      console.error('[OutdentPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Найти родительский блочный элемент
   */
  private getBlockElement(node: Node, editorElement: HTMLElement): HTMLElement | null {
    let current: Node | null = node;

    while (current && current !== editorElement) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        // Проверяем, является ли элемент блочным
        if (this.isBlockElement(tagName)) {
          return element;
        }
      }
      current = current.parentNode;
    }

    return null;
  }

  /**
   * Проверить, является ли тег блочным элементом
   */
  private isBlockElement(tagName: string): boolean {
    const blockElements = [
      'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'ul', 'ol', 'li'
    ];
    return blockElements.includes(tagName);
  }

  /**
   * Уменьшить отступ блока
   */
  private decreaseIndent(element: HTMLElement): void {
    const currentIndent = this.getCurrentIndent(element);
    const newIndent = Math.max(0, currentIndent - 40); // Уменьшаем на 40px, но не меньше 0

    if (newIndent === 0) {
      // Удаляем стиль, если отступ равен 0
      element.style.marginLeft = '';
    } else {
      element.style.marginLeft = `${newIndent}px`;
    }
  }

  /**
   * Получить текущий отступ элемента
   */
  private getCurrentIndent(element: HTMLElement): number {
    const marginLeft = element.style.marginLeft;
    if (!marginLeft) {
      return 0;
    }

    const value = parseInt(marginLeft, 10);
    return isNaN(value) ? 0 : value;
  }

  /**
   * Проверить, активен ли плагин (всегда неактивен)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[OutdentPlugin] Destroyed');
  }
}
