/**
 * ════════════════════════════════════════════════════════════════════════════
 * HORIZONTAL RULE PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для вставки горизонтальной линии (<hr>).
 *
 * @module HorizontalRulePlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин вставки горизонтальной линии
 */
export class HorizontalRulePlugin implements AuroraPlugin {
  name = 'horizontalRule';
  title = 'Горизонтальная линия';
  icon = '─'; // Горизонтальная линия
  shortcut = 'Ctrl+Shift+H';

  /**
   * Выполнить вставку горизонтальной линии
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    try {
      const range = selection.getRangeAt(0);

      // Создаём элемент <hr>
      const hr = document.createElement('hr');

      // Удаляем текущее выделение
      range.deleteContents();

      // Вставляем <hr>
      range.insertNode(hr);

      // Создаём новый параграф после <hr> для продолжения ввода
      const newParagraph = document.createElement('p');
      newParagraph.innerHTML = '<br>'; // Пустой параграф с <br> для курсора

      // Вставляем параграф после <hr>
      if (hr.nextSibling) {
        hr.parentNode?.insertBefore(newParagraph, hr.nextSibling);
      } else {
        hr.parentNode?.appendChild(newParagraph);
      }

      // Перемещаем курсор в новый параграф
      range.setStart(newParagraph, 0);
      range.setEnd(newParagraph, 0);
      selection.removeAllRanges();
      selection.addRange(range);

      return true;
    } catch (error) {
      console.error('[HorizontalRulePlugin] Error inserting HR:', error);
      return false;
    }
  }

  /**
   * Проверить активность плагина
   */
  isActive(editorElement: HTMLElement): boolean {
    // Плагин всегда доступен, не имеет активного состояния
    return false;
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    // Плагин не требует инициализации
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    // Плагин не требует очистки ресурсов
  }
}
