/**
 * ════════════════════════════════════════════════════════════════════════════
 * SEARCH DIALOG PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для открытия диалога поиска текста.
 * Использует DialogManagerService и SearchReplaceService.
 *
 * @module SearchDialogPlugin
 */

import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuroraPlugin } from '../aurora-plugin.interface';
import { DialogManagerService } from '../../services/dialog-manager.service';
import { SearchReplaceService } from '../../services/search-replace.service';

/**
 * Плагин диалога поиска
 */
export class SearchDialogPlugin implements AuroraPlugin {
  name = 'searchDialog';
  title = 'Найти';
  icon = '🔍'; // Лупа
  shortcut = 'Ctrl+F';

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
    console.log('[SearchDialogPlugin] Initialized');
  }

  /**
   * Выполнить плагин - открыть диалог поиска
   */
  execute(editorElement: HTMLElement): boolean {
    console.log('[SearchDialogPlugin] Execute called');

    if (!this.isBrowser) {
      console.warn('[SearchDialogPlugin] Not running in browser');
      return false;
    }

    // Устанавливаем элемент контента для сервиса поиска
    this.searchService.setContentElement(editorElement);

    // Открываем диалог поиска (без полей замены)
    this.dialogManager.openSearchDialog(false);

    return true;
  }

  /**
   * Проверить активность плагина
   */
  isActive(editorElement: HTMLElement): boolean {
    // Плагин поиска не имеет состояния активности
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[SearchDialogPlugin] Destroyed');
  }
}
