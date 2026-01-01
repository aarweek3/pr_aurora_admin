import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
} from '@angular/core';
import { LinkModalComponent } from '../../modals/link-modal/link-modal.component';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для создания и управления гиперссылками
 *
 * Функциональность:
 * - Создание новых ссылок с валидацией URL
 * - Редактирование существующих ссылок
 * - Удаление ссылок (unlink)
 * - Динамическое создание модального окна
 *
 * @example
 * const linkPlugin = new LinkPlugin(appRef, injector);
 * linkPlugin.init(editorElement);
 * linkPlugin.execute();
 */
@Injectable()
export class LinkPlugin implements AuroraPlugin {
  name = 'link';
  title = 'Создать ссылку (Ctrl+K)';
  icon = '🔗';
  shortcut = 'Ctrl+K';

  private modalComponentRef: ComponentRef<LinkModalComponent> | null = null;
  private savedRange: Range | null = null;

  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) {}

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[LinkPlugin] Initialized');
  }

  /**
   * Выполнение команды создания/редактирования ссылки
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - Дополнительные параметры
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    if (!editorElement) {
      console.warn('[LinkPlugin] Editor element not provided');
      return false;
    }

    // Получаем текущее выделение
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[LinkPlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    // Проверяем, находится ли курсор внутри существующей ссылки
    let existingLink: HTMLAnchorElement | null = null;
    let currentElement = range.commonAncestorContainer;

    if (currentElement.nodeType === Node.TEXT_NODE) {
      currentElement = currentElement.parentElement!;
    }

    // Ищем родительский элемент <a>
    while (currentElement && currentElement !== editorElement) {
      if (currentElement.nodeName === 'A') {
        existingLink = currentElement as HTMLAnchorElement;
        break;
      }
      currentElement = currentElement.parentElement!;
    }

    // Если выделения нет и мы не внутри ссылки, показываем предупреждение
    if (!selectedText && !existingLink) {
      alert('Пожалуйста, выделите текст для создания ссылки');
      return false;
    }

    // ВАЖНО: Сохраняем Range перед открытием модалки, т.к. фокус переходит на модалку
    this.savedRange = range.cloneRange();

    // Открываем модальное окно
    this.openLinkModal(editorElement, selectedText, existingLink);
    return true;
  }

  /**
   * Проверка активности команды (ссылка активна если курсор внутри <a>)
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
   * Открытие модального окна для создания/редактирования ссылки
   */
  private openLinkModal(
    editorElement: HTMLElement,
    selectedText: string,
    existingLink: HTMLAnchorElement | null,
  ): void {
    // Создаем компонент модального окна динамически
    this.modalComponentRef = createComponent(LinkModalComponent, {
      environmentInjector: this.injector,
    });

    // Передаем данные в компонент
    const modalInstance = this.modalComponentRef.instance;
    modalInstance.selectedText = selectedText;
    modalInstance.existingUrl = existingLink?.href || '';
    modalInstance.existingText = existingLink?.textContent || selectedText;
    modalInstance.existingTitle = existingLink?.title || '';
    modalInstance.existingOpenInNewTab = existingLink?.target === '_blank';
    // Проверяем наличие nofollow в rel
    modalInstance.existingAllowIndex = !existingLink?.rel.includes('nofollow');

    // Подписываемся на событие сохранения
    modalInstance.save.subscribe((data: { url: string; text: string; title: string; openInNewTab: boolean; allowIndex: boolean }) => {
      this.createOrUpdateLink(editorElement, data.url, data.text, data.title, data.openInNewTab, data.allowIndex, existingLink);
      this.closeModal();
    });

    // Подписываемся на событие удаления ссылки
    modalInstance.unlink.subscribe(() => {
      this.removeLink(editorElement, existingLink);
      this.closeModal();
    });

    // Подписываемся на событие отмены
    modalInstance.cancel.subscribe(() => {
      this.savedRange = null; // Очищаем сохраненный Range при отмене
      this.closeModal();
    });

    // Добавляем компонент в DOM
    this.appRef.attachView(this.modalComponentRef.hostView);
    const domElem = this.modalComponentRef.location.nativeElement as HTMLElement;
    document.body.appendChild(domElem);

    // Открываем модальное окно
    modalInstance.open();

    console.log('[LinkPlugin] Modal opened', { selectedText, existingUrl: existingLink?.href });
  }

  /**
   * Создание новой ссылки или обновление существующей
   */
  private createOrUpdateLink(
    editorElement: HTMLElement,
    url: string,
    text: string,
    title: string,
    openInNewTab: boolean,
    allowIndex: boolean,
    existingLink: HTMLAnchorElement | null,
  ): void {
    const selection = window.getSelection();
    if (!selection) return;

    if (existingLink) {
      // Обновляем существующую ссылку
      existingLink.href = url;
      existingLink.textContent = text;

      // Устанавливаем title
      if (title) {
        existingLink.title = title;
      } else {
        existingLink.removeAttribute('title');
      }

      // Устанавливаем target и rel
      const relValues: string[] = [];

      if (openInNewTab) {
        existingLink.target = '_blank';
        relValues.push('noopener', 'noreferrer');
      } else {
        existingLink.removeAttribute('target');
      }

      // Добавляем nofollow если индексация запрещена
      if (!allowIndex) {
        relValues.push('nofollow');
      }

      // Устанавливаем или удаляем rel
      if (relValues.length > 0) {
        existingLink.rel = relValues.join(' ');
      } else {
        existingLink.removeAttribute('rel');
      }

      console.log('[LinkPlugin] Link updated', { url, text, title, openInNewTab, allowIndex });
    } else {
      // Создаем новую ссылку
      // Используем сохраненный Range, т.к. текущее выделение потеряно
      const range = this.savedRange || selection.getRangeAt(0);

      // Восстанавливаем выделение
      selection.removeAllRanges();
      selection.addRange(range);

      range.deleteContents();

      const link = document.createElement('a');
      link.href = url;
      link.textContent = text;

      // Устанавливаем title (необязательный)
      if (title) {
        link.title = title;
      }

      // Устанавливаем target и rel
      const relValues: string[] = [];

      if (openInNewTab) {
        link.target = '_blank';
        relValues.push('noopener', 'noreferrer');
      }

      // Добавляем nofollow если индексация запрещена
      if (!allowIndex) {
        relValues.push('nofollow');
      }

      // Устанавливаем rel
      if (relValues.length > 0) {
        link.rel = relValues.join(' ');
      }

      range.insertNode(link);

      // Устанавливаем курсор после ссылки
      range.setStartAfter(link);
      range.setEndAfter(link);
      selection.removeAllRanges();
      selection.addRange(range);

      console.log('[LinkPlugin] Link created', { url, text, title, openInNewTab, allowIndex });
    }

    // Очищаем сохраненный Range
    this.savedRange = null;

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Удаление ссылки (превращение в обычный текст)
   */
  private removeLink(editorElement: HTMLElement, link: HTMLAnchorElement | null): void {
    if (!link) return;

    // Заменяем <a> на текстовый узел
    const textNode = document.createTextNode(link.textContent || '');
    link.parentNode?.replaceChild(textNode, link);

    console.log('[LinkPlugin] Link removed');

    // Очищаем сохраненный Range
    this.savedRange = null;

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Закрытие и удаление модального окна
   */
  private closeModal(): void {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
      console.log('[LinkPlugin] Modal closed');
    }
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    this.closeModal();
    console.log('[LinkPlugin] Destroyed');
  }
}
