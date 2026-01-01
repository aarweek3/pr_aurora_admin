/**
 * ════════════════════════════════════════════════════════════════════════════
 * BLOCK PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для форматирования блоков (заголовки H1-H6, параграфы, цитаты).
 * Использует команду formatBlock через execCommand.
 *
 * @module BlockPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Типы блоков
 */
export type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';

/**
 * Опции для плагина блоков
 */
export interface BlockOptions {
  blockType: BlockType;
}

/**
 * Плагин блочных элементов
 */
export class BlockPlugin implements AuroraPlugin {
  name = 'block';
  title = 'Формат блока';
  icon = '¶'; // Символ параграфа
  shortcut = undefined;

  /**
   * Список доступных блоков
   */
  readonly blocks = [
    { value: 'p', label: 'Параграф', icon: '¶' },
    { value: 'h1', label: 'Заголовок 1', icon: 'H1' },
    { value: 'h2', label: 'Заголовок 2', icon: 'H2' },
    { value: 'h3', label: 'Заголовок 3', icon: 'H3' },
    { value: 'h4', label: 'Заголовок 4', icon: 'H4' },
    { value: 'h5', label: 'Заголовок 5', icon: 'H5' },
    { value: 'h6', label: 'Заголовок 6', icon: 'H6' },
    { value: 'blockquote', label: 'Цитата', icon: '"' },
  ];

  /**
   * Выполнить команду форматирования блока
   */
  execute(editorElement: HTMLElement, options?: BlockOptions): boolean {
    if (!options || !options.blockType) {
      console.warn('[BlockPlugin] No blockType provided');
      return false;
    }

    try {
      const tagName = options.blockType.toUpperCase();

      // Используем нативную команду formatBlock
      const success = document.execCommand('formatBlock', false, `<${tagName}>`);

      if (success) {
        console.log('[BlockPlugin] Applied block format:', tagName);
      }

      return success;
    } catch (error) {
      console.error('[BlockPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Проверить, какой блочный элемент активен
   * (возвращает название тега или null)
   */
  getActiveBlock(editorElement: HTMLElement): string | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    let node: Node | null = selection.anchorNode;

    // Проходим по родителям до редактора
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        // Проверяем, является ли элемент блочным
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tagName)) {
          return tagName;
        }
      }
      node = node.parentNode;
    }

    return null;
  }

  /**
   * Проверить, активен ли конкретный тип блока
   */
  isActive(editorElement: HTMLElement, blockType?: BlockType): boolean {
    const activeBlock = this.getActiveBlock(editorElement);

    if (blockType) {
      return activeBlock === blockType;
    }

    // Если тип не указан, просто проверяем, что курсор в каком-то блоке
    return activeBlock !== null;
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[BlockPlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[BlockPlugin] Destroyed');
  }
}
