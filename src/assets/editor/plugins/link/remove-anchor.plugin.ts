import { Injectable } from '@angular/core';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для удаления якорей (anchor) - удаление атрибута id
 *
 * Функциональность:
 * - Удаление якоря (id) с текущего элемента
 * - Работает только если курсор находится внутри элемента с id
 * - Не удаляет элемент, только атрибут id
 *
 * @example
 * const removeAnchorPlugin = new RemoveAnchorPlugin();
 * removeAnchorPlugin.execute(editorElement);
 */
@Injectable()
export class RemoveAnchorPlugin implements AuroraPlugin {
  name = 'removeAnchor';
  title = 'Удалить якорь (Ctrl+Alt+Shift+A)';
  icon = '⚓⛔';
  shortcut = 'Ctrl+Alt+Shift+A';

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[RemoveAnchorPlugin] Initialized');
  }

  /**
   * Выполнение команды удаления якоря
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - Дополнительные параметры
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    if (!editorElement) {
      console.warn('[RemoveAnchorPlugin] Editor element not provided');
      return false;
    }

    // Получаем текущее выделение
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[RemoveAnchorPlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);
    let currentElement = range.commonAncestorContainer;

    // Если это текстовый узел, берем родительский элемент
    if (currentElement.nodeType === Node.TEXT_NODE) {
      currentElement = currentElement.parentElement!;
    }

    // Находим ближайший элемент с id
    let targetElement: HTMLElement | null = null;
    let node: Node | null = currentElement;

    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.id) {
          targetElement = element;
          break;
        }
      }
      node = node.parentElement;
    }

    if (!targetElement) {
      alert('Курсор не находится внутри элемента с якорем');
      return false;
    }

    // Сохраняем id для вывода в консоль
    const removedId = targetElement.id;

    // Удаляем id
    targetElement.removeAttribute('id');

    console.log('[RemoveAnchorPlugin] Anchor removed', { id: removedId, element: targetElement.tagName });

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));

    return true;
  }

  /**
   * Проверка активности команды (активна только если курсор внутри элемента с id)
   */
  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node = selection.anchorNode;
    if (!node) return false;

    // Проверяем, находится ли курсор внутри элемента с id
    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.id) {
          return true;
        }
      }
      node = node.parentElement;
    }

    return false;
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    console.log('[RemoveAnchorPlugin] Destroyed');
  }
}
