/**
 * ════════════════════════════════════════════════════════════════════════════
 * HIGHLIGHT PLUGIN (TEXT MARKER)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для выделения текста цветным маркером (highlighter).
 * Использует тег <mark> с прозрачным фоном для имитации маркера.
 *
 * Отличие от Background Color:
 * - Background Color: сплошная заливка
 * - Highlight: прозрачный маркер (rgba), текст остаётся читаемым
 *
 * @module HighlightPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Цвета маркеров с прозрачностью
 */
export interface HighlightColor {
  name: string;
  color: string; // rgba цвет с прозрачностью
  emoji: string; // Эмодзи для визуализации
}

/**
 * Плагин выделения текста маркером
 */
export class HighlightPlugin implements AuroraPlugin {
  name = 'highlight';
  title = 'Маркер';
  icon = '🖍️'; // Highlighter pen
  isDropdown = true; // Показывать как dropdown

  /**
   * Предустановленные цвета маркеров
   */
  private readonly colors: HighlightColor[] = [
    { name: 'Жёлтый', color: 'rgba(255, 235, 59, 0.4)', emoji: '🟨' },
    { name: 'Зелёный', color: 'rgba(76, 175, 80, 0.3)', emoji: '🟩' },
    { name: 'Голубой', color: 'rgba(33, 150, 243, 0.3)', emoji: '🟦' },
    { name: 'Розовый', color: 'rgba(233, 30, 99, 0.3)', emoji: '🟪' },
    { name: 'Оранжевый', color: 'rgba(255, 152, 0, 0.3)', emoji: '🟧' },
    { name: 'Удалить', color: 'transparent', emoji: '🧹' },
  ];

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[HighlightPlugin] Initialized');
  }

  /**
   * Выполнить команду выделения маркером
   */
  execute(editorElement: HTMLElement, options?: { color?: string }): boolean {
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

      // Если ничего не выделено, ничего не делаем
      if (range.collapsed) {
        console.warn('[HighlightPlugin] No text selected');
        return false;
      }

      const color = options?.color || this.colors[0].color; // По умолчанию жёлтый

      // Если цвет transparent - удаляем highlight
      if (color === 'transparent') {
        this.removeHighlight(range);
      } else {
        this.applyHighlight(range, color);
      }

      // Триггерим событие input для обновления состояния
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));

      return true;
    } catch (error) {
      console.error('[HighlightPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Применить выделение маркером
   */
  private applyHighlight(range: Range, color: string): void {
    try {
      // Проверяем, находится ли выделение уже в <mark>
      const existingMark = this.findParentMark(range.commonAncestorContainer);

      if (existingMark) {
        // Если уже в mark - меняем цвет
        existingMark.style.backgroundColor = color;
      } else {
        // Создаём новый <mark>
        const mark = document.createElement('mark');
        mark.style.backgroundColor = color;
        mark.style.color = 'inherit'; // Сохраняем цвет текста

        // Извлекаем содержимое выделения
        const contents = range.extractContents();
        mark.appendChild(contents);

        // Вставляем mark
        range.insertNode(mark);

        // Восстанавливаем выделение
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(mark);
          selection.addRange(newRange);
        }
      }
    } catch (error) {
      console.error('[HighlightPlugin] Error applying highlight:', error);
    }
  }

  /**
   * Удалить выделение маркером
   */
  private removeHighlight(range: Range): void {
    try {
      const mark = this.findParentMark(range.commonAncestorContainer);

      if (mark) {
        // Заменяем <mark> на его содержимое
        const parent = mark.parentNode;
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
          }
          parent.removeChild(mark);
        }
      }
    } catch (error) {
      console.error('[HighlightPlugin] Error removing highlight:', error);
    }
  }

  /**
   * Найти родительский <mark> элемент
   */
  private findParentMark(node: Node): HTMLElement | null {
    let current: Node | null = node;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement;
      if (element.tagName.toLowerCase() === 'mark') {
        return element;
      }
      current = current.parentNode;
    }

    return null;
  }

  /**
   * Получить список цветов для dropdown
   */
  getColors(): HighlightColor[] {
    return this.colors;
  }

  /**
   * Проверить, активен ли плагин (находится ли курсор в выделенном тексте)
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    return !!this.findParentMark(range.commonAncestorContainer);
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[HighlightPlugin] Destroyed');
  }
}
