/**
 * ════════════════════════════════════════════════════════════════════════════
 * NON-BREAKING SPACE PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для вставки неразрывного пробела (non-breaking space, &nbsp;).
 * Неразрывный пробел предотвращает перенос строки между словами.
 *
 * Использование:
 * - Между инициалами: И.&nbsp;О.&nbsp;Фамилия
 * - Между числами и единицами измерения: 100&nbsp;км, 5&nbsp;кг
 * - Между предлогами и словами: в&nbsp;школе, к&nbsp;дому
 * - Перед тире: слово&nbsp;— слово
 *
 * @module NonBreakingSpacePlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

export class NonBreakingSpacePlugin implements AuroraPlugin {
  name = 'nonBreakingSpace';
  title = 'Неразрывный пробел';
  icon = '⎵'; // Unicode символ для пробела
  shortcut = 'Ctrl+Shift+Space';

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[NonBreakingSpacePlugin] Initialized');
  }

  /**
   * Выполнение команды - вставка неразрывного пробела
   */
  execute(editorElement: HTMLElement): boolean {
    console.log('[NonBreakingSpacePlugin] Inserting non-breaking space');

    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        console.warn('[NonBreakingSpacePlugin] No selection available');
        return false;
      }

      const range = selection.getRangeAt(0);

      // Если есть выделенный текст, удаляем его
      if (!range.collapsed) {
        range.deleteContents();
      }

      // Создаём текстовый узел с неразрывным пробелом
      // Используем Unicode символ U+00A0 (NO-BREAK SPACE)
      const nbsp = document.createTextNode('\u00A0');

      // Вставляем неразрывный пробел
      range.insertNode(nbsp);

      // Перемещаем курсор после вставленного пробела
      range.setStartAfter(nbsp);
      range.setEndAfter(nbsp);
      selection.removeAllRanges();
      selection.addRange(range);

      // Диспатчим событие input для обновления состояния редактора
      const inputEvent = new Event('input', { bubbles: true });
      editorElement.dispatchEvent(inputEvent);

      console.log('[NonBreakingSpacePlugin] Non-breaking space inserted successfully');
      return true;
    } catch (error) {
      console.error('[NonBreakingSpacePlugin] Error inserting non-breaking space:', error);
      return false;
    }
  }

  /**
   * Проверка активности плагина
   * Неразрывный пробел не имеет состояния активности
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[NonBreakingSpacePlugin] Destroyed');
  }
}
