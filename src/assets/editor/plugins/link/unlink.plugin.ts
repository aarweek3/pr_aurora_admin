import { Injectable } from '@angular/core';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для удаления гиперссылок
 *
 * Функциональность:
 * - Удаляет ссылку, сохраняя текст
 * - Активен только когда курсор находится внутри ссылки
 * - Работает с горячей клавишей Ctrl+Shift+K
 *
 * @example
 * const unlinkPlugin = new UnlinkPlugin();
 * unlinkPlugin.init();
 * unlinkPlugin.execute(editorElement);
 */
@Injectable()
export class UnlinkPlugin implements AuroraPlugin {
  name = 'unlink';
  title = 'Удалить ссылку (Ctrl+Shift+K)';
  icon = '🔗⛔';
  shortcut = 'Ctrl+Shift+K';

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[UnlinkPlugin] Initialized');
  }

  /**
   * Выполнение команды удаления ссылки
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - Дополнительные параметры
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    if (!editorElement) {
      console.warn('[UnlinkPlugin] Editor element not provided');
      return false;
    }

    // Получаем текущее выделение
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[UnlinkPlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);

    // Проверяем, находится ли курсор внутри существующей ссылки
    let linkElement: HTMLAnchorElement | null = null;
    let currentElement = range.commonAncestorContainer;

    if (currentElement.nodeType === Node.TEXT_NODE) {
      currentElement = currentElement.parentElement!;
    }

    // Ищем родительский элемент <a>
    while (currentElement && currentElement !== editorElement) {
      if (currentElement.nodeName === 'A') {
        linkElement = currentElement as HTMLAnchorElement;
        break;
      }
      currentElement = currentElement.parentElement!;
    }

    // Если ссылка не найдена, предупреждаем
    if (!linkElement) {
      console.warn('[UnlinkPlugin] Cursor is not inside a link');
      return false;
    }

    // Удаляем ссылку, сохраняя текст
    this.removeLink(editorElement, linkElement);
    return true;
  }

  /**
   * Проверка активности команды (активна если курсор внутри <a>)
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node = selection.anchorNode;
    if (!node) return false;

    // Проверяем, находится ли курсор внутри тега <a>
    while (node && node !== editorElement) {
      if (node.nodeName === 'A') {
        return true;
      }
      node = node.parentElement;
    }

    return false;
  }

  /**
   * Удаление ссылки (превращение в обычный текст)
   */
  private removeLink(editorElement: HTMLElement, link: HTMLAnchorElement): void {
    if (!link) return;

    // Заменяем <a> на текстовый узел
    const textNode = document.createTextNode(link.textContent || '');
    link.parentNode?.replaceChild(textNode, link);

    console.log('[UnlinkPlugin] Link removed');

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    console.log('[UnlinkPlugin] Destroyed');
  }
}
