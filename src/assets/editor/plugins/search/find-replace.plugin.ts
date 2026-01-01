/**
 * ════════════════════════════════════════════════════════════════════════════
 * FIND AND REPLACE PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для открытия диалога поиска и замены текста.
 * Использует DialogManagerService и SearchReplaceService.
 *
 * @module FindReplacePlugin
 */

import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuroraPlugin } from '../aurora-plugin.interface';
import { DialogManagerService } from '../../services/dialog-manager.service';
import { SearchReplaceService } from '../../services/search-replace.service';

/**
 * Плагин поиска и замены
 */
export class FindReplacePlugin implements AuroraPlugin {
  name = 'findReplace';
  title = 'Найти и заменить';
  icon = '🔄'; // Стрелки замены
  shortcut = 'Ctrl+H';

  private platformId = inject(PLATFORM_ID);
  private dialogManager = inject(DialogManagerService);
  private searchService = inject(SearchReplaceService);

  /**
   * Проверка, что код выполняется в браузере
   */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[FindReplacePlugin] Initialized');
  }

  /**
   * Выполнить плагин - открыть диалог поиска и замены
   */
  execute(editorElement: HTMLElement): boolean {
    console.log('[FindReplacePlugin] Execute called');

    if (!this.isBrowser) {
      console.warn('[FindReplacePlugin] Not running in browser');
      return false;
    }

    // Устанавливаем элемент контента для сервиса поиска
    this.searchService.setContentElement(editorElement);

    // Открываем диалог поиска с полями замены
    this.dialogManager.openSearchDialog(true);

    return true;
  }

  /**
   * Проверить активность плагина
   */
  isActive(editorElement: HTMLElement): boolean {
    // Плагин поиска и замены не имеет состояния активности
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[FindReplacePlugin] Destroyed');
  }
}
