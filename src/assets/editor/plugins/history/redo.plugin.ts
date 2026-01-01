/**
 * ════════════════════════════════════════════════════════════════════════════
 * REDO PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для повтора отменённого действия (Redo).
 *
 * @module RedoPlugin
 */

import { inject } from '@angular/core';
import { EditorService } from '../../services/editor.service';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин повтора действия (Redo)
 */
export class RedoPlugin implements AuroraPlugin {
  name = 'redo';
  title = 'Вернуть';
  icon = '↷'; // Стрелка вправо с поворотом
  shortcut = 'Ctrl+Y';

  private editorService = inject(EditorService);

  /**
   * Выполнить повтор
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    return this.editorService.redo();
  }

  /**
   * Проверить активность плагина (доступность)
   */
  isActive(editorElement: HTMLElement): boolean {
    return this.editorService.canRedo();
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
