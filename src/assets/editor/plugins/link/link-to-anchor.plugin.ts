import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
} from '@angular/core';
import {
  AnchorInfo,
  LinkToAnchorModalComponent,
} from '../../modals/link-to-anchor-modal/link-to-anchor-modal.component';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для создания ссылок на якоря в документе
 *
 * Функциональность:
 * - Отображение списка всех якорей в документе
 * - Создание внутренних ссылок (#anchor-id)
 * - Поддержка выделенного текста
 * - Валидация якорей
 *
 * @example
 * const linkToAnchorPlugin = new LinkToAnchorPlugin(appRef, injector);
 * linkToAnchorPlugin.execute(editorElement);
 */
@Injectable()
export class LinkToAnchorPlugin implements AuroraPlugin {
  name = 'linkToAnchor';
  title = 'Ссылка на якорь (Ctrl+Shift+A)';
  icon = '🔗⚓';
  shortcut = 'Ctrl+Shift+A';

  private modalComponentRef: ComponentRef<LinkToAnchorModalComponent> | null = null;
  private savedRange: Range | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[LinkToAnchorPlugin] Initialized');
  }

  /**
   * Выполнение команды создания ссылки на якорь
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - Дополнительные параметры
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    if (!editorElement) {
      console.warn('[LinkToAnchorPlugin] Editor element not provided');
      return false;
    }

    // Получаем текущее выделение
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('[LinkToAnchorPlugin] No selection available');
      return false;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    // Если выделения нет, показываем предупреждение
    if (!selectedText) {
      alert('Пожалуйста, выделите текст для создания ссылки на якорь');
      return false;
    }

    // ВАЖНО: Сохраняем Range перед открытием модалки, т.к. фокус переходит на модалку
    this.savedRange = range.cloneRange();

    // Получаем список всех якорей в документе
    const availableAnchors = this.findAllAnchors(editorElement);

    if (availableAnchors.length === 0) {
      alert(
        'В документе нет якорей. Сначала создайте якорь с помощью кнопки ⚓ "Создать якорь" или нажмите Ctrl+Alt+A',
      );
      this.savedRange = null;
      return false;
    }

    // Открываем модальное окно
    this.openLinkToAnchorModal(editorElement, selectedText, availableAnchors);
    return true;
  }

  /**
   * Проверка активности команды (не активна, т.к. это отдельная команда)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Поиск всех якорей в документе
   */
  private findAllAnchors(editorElement: HTMLElement): AnchorInfo[] {
    const anchors: AnchorInfo[] = [];
    const elementsWithId = editorElement.querySelectorAll('[id]');

    elementsWithId.forEach((element) => {
      const id = element.id;
      // Пропускаем служебные элементы
      if (id && !element.classList.contains('anchor-indicator')) {
        const anchorSpan = element.querySelector('.anchor-indicator');
        const name = anchorSpan?.getAttribute('data-anchor-name') || '';
        anchors.push({ id, name });
      }
    });

    return anchors;
  }

  /**
   * Открытие модального окна для выбора якоря
   */
  private openLinkToAnchorModal(
    editorElement: HTMLElement,
    selectedText: string,
    availableAnchors: AnchorInfo[],
  ): void {
    // Создаем компонент модального окна динамически
    this.modalComponentRef = createComponent(LinkToAnchorModalComponent, {
      environmentInjector: this.injector,
    });

    // Передаем данные в компонент
    const modalInstance = this.modalComponentRef.instance;
    modalInstance.selectedText = selectedText;
    modalInstance.availableAnchors = availableAnchors;

    // Подписываемся на событие сохранения
    modalInstance.save.subscribe((data: { anchorId: string; text: string }) => {
      this.createLinkToAnchor(editorElement, data.anchorId, data.text);
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

    console.log('[LinkToAnchorPlugin] Modal opened', { selectedText, anchorsCount: availableAnchors.length });
  }

  /**
   * Создание ссылки на якорь
   */
  private createLinkToAnchor(
    editorElement: HTMLElement,
    anchorId: string,
    text: string,
  ): void {
    const selection = window.getSelection();
    if (!selection) return;

    // Используем сохраненный Range, т.к. текущее выделение потеряно
    const range = this.savedRange || selection.getRangeAt(0);

    // Восстанавливаем выделение
    selection.removeAllRanges();
    selection.addRange(range);

    range.deleteContents();

    // Создаем ссылку на якорь
    const link = document.createElement('a');
    link.href = `#${anchorId}`;
    link.textContent = text;
    link.className = 'anchor-link';

    range.insertNode(link);

    // Устанавливаем курсор после ссылки
    range.setStartAfter(link);
    range.setEndAfter(link);
    selection.removeAllRanges();
    selection.addRange(range);

    console.log('[LinkToAnchorPlugin] Link to anchor created', { anchorId, text });

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
      console.log('[LinkToAnchorPlugin] Modal closed');
    }
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    this.closeModal();
    console.log('[LinkToAnchorPlugin] Destroyed');
  }
}
