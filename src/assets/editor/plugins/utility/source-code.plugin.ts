/**
 * ════════════════════════════════════════════════════════════════════════════
 * SOURCE CODE PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для просмотра и редактирования исходного HTML-кода редактора.
 *
 * Особенности:
 * - Открывает модальное окно с HTML-кодом
 * - Позволяет редактировать код напрямую
 * - Применяет изменения через EditorService
 * - Иконка: </>
 *
 * @module SourceCodePlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин исходного кода
 */
export class SourceCodePlugin implements AuroraPlugin {
  name = 'sourceCode';
  title = 'Исходный код';
  icon = '&lt;/&gt;'; // HTML-encoded </>
  shortcut = 'Ctrl+Shift+E';

  /**
   * Callback для открытия модального окна
   * Устанавливается извне (из AuroraEditorComponent)
   */
  onOpenModal?: (html: string) => void;

  /**
   * Выполнить команду плагина
   * (открывает модальное окно с HTML-кодом)
   *
   * @param editorElement - Элемент редактора
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      // Получаем HTML-код из редактора
      const html = editorElement.innerHTML;

      // Вызываем callback для открытия модального окна
      if (this.onOpenModal) {
        this.onOpenModal(html);
        return true;
      }

      console.warn('[SourceCodePlugin] onOpenModal callback not set');
      return false;
    } catch (error) {
      console.error('[SourceCodePlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Проверить, активен ли плагин
   * (Source Code Plugin всегда неактивен, так как это действие, а не формат)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[SourceCodePlugin] Initialized');
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[SourceCodePlugin] Destroyed');
    this.onOpenModal = undefined;
  }
}
