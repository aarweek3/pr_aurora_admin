/**
 * ════════════════════════════════════════════════════════════════════════════
 * CUSTOM ERROR HANDLER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Кастомный обработчик ошибок для подавления предупреждений о санитизации HTML.
 *
 * @remarks
 * Aurora Editor использует DOMPurify для санитизации HTML, поэтому предупреждения
 * Angular о санитизации можно безопасно игнорировать.
 *
 * @module CustomErrorHandler
 */

import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  /**
   * Обработка ошибок с фильтрацией предупреждений о санитизации
   *
   * @param error - Ошибка или предупреждение
   */
  handleError(error: any): void {
    // Игнорируем предупреждения о санитизации HTML
    if (error && typeof error === 'object') {
      const message = error.message || error.toString();

      // Фильтруем предупреждения Angular о санитизации
      if (message.includes('sanitizing HTML stripped some content')) {
        // Эти предупреждения ожидаемы, т.к. мы используем DOMPurify
        // для предварительной очистки HTML
        console.debug('[Aurora Editor] HTML санитизация выполнена успешно');
        return;
      }

      // Также игнорируем предупреждения о security#preventing-cross-site-scripting-xss
      if (message.includes('preventing-cross-site-scripting-xss')) {
        console.debug('[Aurora Editor] XSS защита активна');
        return;
      }
    }

    // Все остальные ошибки логируем как обычно
    console.error('Ошибка приложения:', error);
  }
}
