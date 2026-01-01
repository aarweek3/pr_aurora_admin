import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
} from '@angular/core';
import { AnchorModalComponent } from '../../modals/anchor-modal/anchor-modal.component';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для создания якорей (anchor) - элементов с id для внутренних ссылок
 *
 * Функциональность:
 * - Создание якоря через модальное окно
 * - Визуальный индикатор якоря (значок ⚓ с названием)
 * - Поддержка заголовков (h1-h6) и параграфов (p)
 * - Редактирование существующих якорей
 * - Валидация уникальности id
 *
 * @example
 * const anchorPlugin = new AnchorPlugin(appRef, injector);
 * anchorPlugin.execute(editorElement);
 */
@Injectable()
export class AnchorPlugin implements AuroraPlugin {
  name = 'anchor';
  title = 'Создать якорь (Ctrl+Alt+A)';
  icon = '⚓';
  shortcut = 'Ctrl+Alt+A';

  private modalComponentRef: ComponentRef<AnchorModalComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[AnchorPlugin] Initialized');
  }

  /**
   * Выполнение команды создания/редактирования якоря
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - Дополнительные параметры
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    if (!editorElement) {
      console.warn('[AnchorPlugin] Editor element not provided');
      return false;
    }

    // Получаем текущее выделение
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[AnchorPlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);
    let currentElement = range.commonAncestorContainer;

    // Если это текстовый узел, берем родительский элемент
    if (currentElement.nodeType === Node.TEXT_NODE) {
      currentElement = currentElement.parentElement!;
    }

    // Находим ближайший блочный элемент (заголовок или параграф)
    let targetElement: HTMLElement | null = null;
    let node: Node | null = currentElement;

    while (node && node !== editorElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as HTMLElement).tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'].includes(tag)) {
          targetElement = node as HTMLElement;
          break;
        }
      }
      node = node.parentElement;
    }

    if (!targetElement) {
      alert('Пожалуйста, разместите курсор внутри заголовка или параграфа');
      return false;
    }

    // Получаем текст элемента и существующий якорь (если есть)
    const elementText = targetElement.textContent?.replace(/⚓.*$/, '').trim() || '';
    const existingAnchor = this.findAnchorSpan(targetElement);
    const existingId = targetElement.id || '';
    const existingName = existingAnchor?.getAttribute('data-anchor-name') || '';

    // Открываем модальное окно
    this.openAnchorModal(editorElement, targetElement, elementText, existingId, existingName);
    return true;
  }

  /**
   * Проверка активности команды (активна если курсор внутри элемента с id)
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
        if (element.id && !element.classList.contains('anchor-indicator')) {
          return true;
        }
      }
      node = node.parentElement;
    }

    return false;
  }

  /**
   * Открытие модального окна для создания/редактирования якоря
   */
  private openAnchorModal(
    editorElement: HTMLElement,
    targetElement: HTMLElement,
    elementText: string,
    existingId: string,
    existingName: string,
  ): void {
    // Создаем компонент модального окна динамически
    this.modalComponentRef = createComponent(AnchorModalComponent, {
      environmentInjector: this.injector,
    });

    // Передаем данные в компонент
    const modalInstance = this.modalComponentRef.instance;
    modalInstance.elementText = elementText;
    modalInstance.existingId = existingId;
    modalInstance.existingName = existingName;

    // Подписываемся на событие сохранения
    modalInstance.save.subscribe((data: { id: string; name: string }) => {
      this.createOrUpdateAnchor(editorElement, targetElement, data.id, data.name);
      this.closeModal();
    });

    // Подписываемся на событие удаления якоря
    modalInstance.remove.subscribe(() => {
      this.removeAnchor(editorElement, targetElement);
      this.closeModal();
    });

    // Подписываемся на событие отмены
    modalInstance.cancel.subscribe(() => {
      this.closeModal();
    });

    // Добавляем компонент в DOM
    this.appRef.attachView(this.modalComponentRef.hostView);
    const domElem = this.modalComponentRef.location.nativeElement as HTMLElement;
    document.body.appendChild(domElem);

    // Открываем модальное окно
    modalInstance.open();

    console.log('[AnchorPlugin] Modal opened', { elementText, existingId, existingName });
  }

  /**
   * Создание нового якоря или обновление существующего
   */
  private createOrUpdateAnchor(
    editorElement: HTMLElement,
    targetElement: HTMLElement,
    id: string,
    name: string,
  ): void {
    // Проверяем уникальность id (если это новый id или он изменился)
    if (id !== targetElement.id) {
      const existingElement = document.getElementById(id);
      if (existingElement && existingElement !== targetElement) {
        alert(
          `ID "${id}" уже используется другим элементом. Пожалуйста, выберите другой ID.`,
        );
        return;
      }
    }

    // Устанавливаем id
    targetElement.id = id;

    // Удаляем старый индикатор якоря (если есть)
    const oldIndicator = this.findAnchorSpan(targetElement);
    if (oldIndicator) {
      oldIndicator.remove();
    }

    // Создаем визуальный индикатор якоря
    const anchorIndicator = document.createElement('span');
    anchorIndicator.className = 'anchor-indicator';
    anchorIndicator.contentEditable = 'false';
    anchorIndicator.setAttribute('data-anchor-id', id);
    if (name) {
      anchorIndicator.setAttribute('data-anchor-name', name);
      anchorIndicator.textContent = ` ⚓ ${name}`;
    } else {
      anchorIndicator.textContent = ' ⚓';
    }

    // Добавляем индикатор в конец элемента
    targetElement.appendChild(anchorIndicator);

    console.log('[AnchorPlugin] Anchor created/updated', { id, name, element: targetElement.tagName });

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Удаление якоря
   */
  private removeAnchor(editorElement: HTMLElement, targetElement: HTMLElement): void {
    // Удаляем id
    const removedId = targetElement.id;
    targetElement.removeAttribute('id');

    // Удаляем индикатор якоря
    const indicator = this.findAnchorSpan(targetElement);
    if (indicator) {
      indicator.remove();
    }

    console.log('[AnchorPlugin] Anchor removed', { id: removedId, element: targetElement.tagName });

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Поиск индикатора якоря внутри элемента
   */
  private findAnchorSpan(element: HTMLElement): HTMLElement | null {
    return element.querySelector('.anchor-indicator');
  }

  /**
   * Закрытие и удаление модального окна
   */
  private closeModal(): void {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
      console.log('[AnchorPlugin] Modal closed');
    }
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    this.closeModal();
    console.log('[AnchorPlugin] Destroyed');
  }
}
