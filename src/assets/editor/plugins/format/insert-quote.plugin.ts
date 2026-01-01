import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
} from '@angular/core';
import { BlockquoteModalComponent } from '../../modals/blockquote-modal/blockquote-modal.component';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для вставки цитат через модальное окно
 *
 * Функциональность:
 * - Открытие модального окна для ввода цитаты
 * - Поддержка автора и источника цитаты
 * - Выбор стиля оформления цитаты
 * - Вставка цитаты в текущую позицию курсора
 *
 * @example
 * const insertQuotePlugin = new InsertQuotePlugin(appRef, injector);
 * insertQuotePlugin.execute(editorElement);
 */
@Injectable()
export class InsertQuotePlugin implements AuroraPlugin {
  name = 'insertQuote';
  title = 'Вставить цитату (старая версия) (Ctrl+Shift+I)';
  icon = '💬';
  shortcut = 'Ctrl+Shift+I';

  private modalComponentRef: ComponentRef<BlockquoteModalComponent> | null = null;
  private savedRange: Range | null = null;

  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) {}

  /**
   * Инициализация плагина (вызывается при регистрации)
   */
  init(): void {
    console.log('[InsertQuotePlugin] Initialized');
  }

  /**
   * Выполнение команды вставки цитаты
   *
   * @param editorElement - Элемент редактора (contenteditable div)
   * @param options - Дополнительные параметры
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    if (!editorElement) {
      console.warn('[InsertQuotePlugin] Editor element not provided');
      return false;
    }

    // Сохраняем текущий Range перед открытием модалки
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedRange = selection.getRangeAt(0).cloneRange();
    }

    // Открываем модальное окно
    this.openQuoteModal(editorElement);
    return true;
  }

  /**
   * Проверка активности команды (не активна, т.к. это команда вставки)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Открытие модального окна для ввода цитаты
   */
  private openQuoteModal(editorElement: HTMLElement): void {
    // Создаем компонент модального окна динамически
    this.modalComponentRef = createComponent(BlockquoteModalComponent, {
      environmentInjector: this.injector,
    });

    const modalInstance = this.modalComponentRef.instance;

    // Подписываемся на событие сохранения
    modalInstance.save.subscribe(
      (data: { text: string; author: string; source: string; style: string }) => {
        this.insertQuote(editorElement, data.text, data.author, data.source, data.style);
        this.closeModal();
      },
    );

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

    console.log('[InsertQuotePlugin] Modal opened');
  }

  /**
   * Вставка цитаты в редактор
   */
  private insertQuote(
    editorElement: HTMLElement,
    text: string,
    author: string,
    source: string,
    style: string,
  ): void {
    const selection = window.getSelection();
    if (!selection) return;

    // Восстанавливаем сохраненный Range или используем текущий
    const range = this.savedRange || (selection.rangeCount > 0 ? selection.getRangeAt(0) : null);

    if (!range) {
      console.warn('[InsertQuotePlugin] No range available');
      return;
    }

    // Восстанавливаем выделение
    selection.removeAllRanges();
    selection.addRange(range);

    // Определяем класс стиля
    const styleClass = this.getStyleClassName(style);

    // Создаем blockquote
    const blockquote = document.createElement('blockquote');
    blockquote.className = styleClass;

    // Создаем параграф для текста цитаты
    const paragraph = document.createElement('p');
    paragraph.className = 'aurora-quote-text';
    paragraph.textContent = text;
    blockquote.appendChild(paragraph);

    // Создаем footer (подпись) с автором и источником
    if (author || source) {
      const citation = document.createElement('footer');
      citation.className = 'aurora-quote-citation aurora-citation-modern';

      let citationText = '';
      if (author) {
        citationText = author;
      }
      if (source) {
        citationText += author ? `, ${source}` : source;
      }

      citation.textContent = citationText;
      blockquote.appendChild(citation);
    }

    // Находим родительский параграф
    let parentBlock = this.getParentBlock(range.startContainer);

    // Если есть родительский параграф и он пустой, заменяем его на blockquote
    if (
      parentBlock &&
      parentBlock.tagName === 'P' &&
      (!parentBlock.textContent?.trim() || parentBlock.innerHTML === '<br>')
    ) {
      parentBlock.parentNode?.replaceChild(blockquote, parentBlock);
    } else {
      // Иначе вставляем blockquote в текущую позицию
      range.deleteContents();
      range.insertNode(blockquote);
    }

    // Создаем новый параграф после цитаты для продолжения набора
    const nextParagraph = document.createElement('p');
    nextParagraph.innerHTML = '<br>';
    blockquote.parentNode?.insertBefore(nextParagraph, blockquote.nextSibling);

    // Устанавливаем курсор после цитаты
    const newRange = document.createRange();
    newRange.setStart(nextParagraph, 0);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);

    console.log('[InsertQuotePlugin] Quote inserted', { text, author, source, style });

    // Очищаем сохраненный Range
    this.savedRange = null;

    // Триггерим событие input для сохранения в историю
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Получение имени класса стиля по значению
   */
  private getStyleClassName(style: string): string {
    const styleMap: Record<string, string> = {
      classic: 'aurora-quote-classic',
      modern: 'aurora-quote-modern',
      minimal: 'aurora-quote-minimal',
    };

    return styleMap[style] || 'aurora-quote-modern';
  }

  /**
   * Находит родительский блочный элемент
   */
  private getParentBlock(node: Node): HTMLElement | null {
    let current = node as HTMLElement;

    while (current && current.nodeType === Node.TEXT_NODE) {
      current = current.parentNode as HTMLElement;
    }

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tagName = current.tagName;
      if (
        tagName === 'P' ||
        tagName === 'DIV' ||
        tagName === 'H1' ||
        tagName === 'H2' ||
        tagName === 'H3' ||
        tagName === 'LI'
      ) {
        return current;
      }
      current = current.parentNode as HTMLElement;
    }

    return null;
  }

  /**
   * Закрытие и удаление модального окна
   */
  private closeModal(): void {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
      console.log('[InsertQuotePlugin] Modal closed');
    }
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    this.closeModal();
    console.log('[InsertQuotePlugin] Destroyed');
  }
}
