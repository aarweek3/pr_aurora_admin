/**
 * ════════════════════════════════════════════════════════════════════════════
 * UNDO PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для отмены последнего действия (Undo).
 *
 * @module UndoPlugin
 */

import { inject } from '@angular/core';
import { EditorService } from '../../services/editor.service';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин отмены действия (Undo)
 */
export class UndoPlugin implements AuroraPlugin {
  name = 'undo';
  title = 'Отменить';
  icon = '↶'; // Стрелка влево с поворотом
  shortcut = 'Ctrl+Z';

  private editorService = inject(EditorService);

  /**
   * Выполнить отмену
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    return this.editorService.undo();
  }

  /**
   * Проверить активность плагина (доступность)
   */
  isActive(editorElement: HTMLElement): boolean {
    return this.editorService.canUndo();
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
