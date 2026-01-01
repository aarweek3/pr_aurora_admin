/**
 * ════════════════════════════════════════════════════════════════════════════
 * DIALOG MANAGER SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для управления встроенной панелью поиска.
 * Управляет видимостью и режимом работы панели поиска.
 *
 * @module DialogManagerService
 */

import { Injectable, signal } from '@angular/core';

export interface SearchPanelState {
  visible: boolean;
  showReplace: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DialogManagerService {
  /**
   * Состояние панели поиска (реактивный сигнал)
   */
  private searchPanelState = signal<SearchPanelState>({
    visible: false,
    showReplace: false
  });

  /**
   * Публичный readonly сигнал для подписки компонентов
   */
  readonly searchPanel = this.searchPanelState.asReadonly();

  /**
   * Открыть панель поиска
   * @param showReplace - показывать ли поля замены
   */
  openSearchDialog(showReplace: boolean = false): void {
    console.log('[DialogManagerService] Opening search panel, showReplace:', showReplace);

    this.searchPanelState.set({
      visible: true,
      showReplace: showReplace
    });
  }

  /**
   * Закрыть панель поиска
   */
  closeSearchDialog(): void {
    console.log('[DialogManagerService] Closing search panel');

    this.searchPanelState.set({
      visible: false,
      showReplace: false
    });
  }

  /**
   * Переключить видимость панели поиска
   */
  toggleSearchDialog(showReplace: boolean = false): void {
    const currentState = this.searchPanelState();

    if (currentState.visible) {
      this.closeSearchDialog();
    } else {
      this.openSearchDialog(showReplace);
    }
  }

  /**
   * Проверить, открыта ли панель поиска
   */
  isSearchDialogOpen(): boolean {
    return this.searchPanelState().visible;
  }

  /**
   * Получить текущее состояние панели
   */
  getSearchPanelState(): SearchPanelState {
    return this.searchPanelState();
  }
}
