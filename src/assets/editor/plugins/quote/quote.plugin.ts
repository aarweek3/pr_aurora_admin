import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
} from '@angular/core';

import { BlockquoteModalComponent } from './modals/blockquote-modal/blockquote-modal.component';
import {
  DEFAULT_QUOTE_CONFIG,
  QUOTE_CONSTANTS,
  QuoteModalOptions,
  QuoteOperationResult,
  QuotePluginConfig,
} from './quote.config';
import { BlockquoteGenerator } from './services/blockquote-generator.service';
import { BlockquoteStylesService } from './services/blockquote-styles.service';
import { BlockquoteData } from './types/blockquote-styles.types';

/**
 * Интерфейс плагина Aurora Editor
 */
export interface AuroraPlugin {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  hotkey?: string;
  init(): void;
  execute(editorElement: HTMLElement, options?: any): void;
  isActive?(editorElement: HTMLElement): boolean;
  destroy(): void;
}

/**
 * Плагин Quote для Aurora Editor
 *
 * Функциональность:
 * - Вставка стилизованных цитат через модальное окно
 * - Выбор стиля из пресетов или кастомных стилей
 * - Редактирование существующих цитат
 * - Управление кастомными стилями
 * - Импорт/экспорт стилей
 * - Горячая клавиша Ctrl+Shift+Q
 * - Кнопка в тулбаре редактора
 */
export class QuotePlugin implements AuroraPlugin {
  // Конфигурация плагина
  public readonly config: QuotePluginConfig;

  // Публичные свойства для интерфейса AuroraPlugin
  public readonly id: string;
  public readonly name: string;
  public readonly title: string; // Отображаемое название для UI
  public readonly description: string;
  public readonly icon: string;
  public readonly hotkey: string;
  public readonly shortcut?: string; // Алиас для hotkey (для совместимости)

  // Сервисы
  private stylesService = inject(BlockquoteStylesService);
  private platformId = inject(PLATFORM_ID);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Ссылка на открытое модальное окно
  private modalComponentRef: ComponentRef<BlockquoteModalComponent> | null = null;

  // Сохраненная позиция курсора в редакторе
  private savedRange: Range | null = null;

  // Текущий элемент редактора
  private currentEditorElement: HTMLElement | null = null;

  /**
   * Конструктор плагина
   * @param customConfig - Пользовательская конфигурация (опционально)
   */
  constructor(customConfig?: Partial<QuotePluginConfig>) {
    this.config = { ...DEFAULT_QUOTE_CONFIG, ...customConfig };
    this.id = this.config.id;
    this.name = this.config.name; // Технический идентификатор 'quote'
    this.title = 'Цитата'; // Отображаемое название
    this.description = this.config.description;
    this.icon = this.config.icon;
    this.hotkey = this.config.hotkey;
    this.shortcut = this.config.hotkey; // Алиас для совместимости

    if (this.config.debug) {
      console.log('[QuotePlugin] Initialized with config:', this.config);
    }
  }

  /**
   * Инициализация плагина
   * Вызывается при регистрации плагина в редакторе
   */
  init(): void {
    if (!this.isBrowser) return;

    if (this.config.debug) {
      console.log('[QuotePlugin] init() called');
    }

    // Загружаем сохраненную конфигурацию из localStorage
    this.loadConfig();

    // Можно добавить глобальные обработчики событий
    this.setupGlobalListeners();
  }

  /**
   * Выполнение команды плагина
   * Вызывается при клике на кнопку в тулбаре или нажатии горячей клавиши
   *
   * @param editorElement - Элемент редактора
   * @param options - Опции выполнения
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: Partial<QuoteModalOptions>): boolean {
    if (!this.isBrowser) return false;

    if (this.config.debug) {
      console.log('[QuotePlugin] execute() called', { editorElement, options });
    }

    this.currentEditorElement = editorElement;

    // Сохраняем текущую позицию курсора
    this.saveSelection();

    // Получаем выделенный текст (если есть)
    const selectedText = this.getSelectedText();

    // Открываем модальное окно
    this.openQuoteModal({
      mode: 'insert',
      prefilledText: selectedText,
      savedSelection: this.savedRange || undefined,
      ...options,
    });

    return true;
  }

  /**
   * Проверяет, активен ли плагин в данный момент
   * (для подсветки кнопки в тулбаре)
   *
   * @param editorElement - Элемент редактора
   * @returns true, если курсор находится внутри blockquote
   */
  isActive(editorElement: HTMLElement): boolean {
    if (!this.isBrowser) return false;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const node = selection.anchorNode;
    if (!node) return false;

    // Проверяем, находится ли курсор внутри blockquote
    const blockquote = BlockquoteGenerator.findParentBlockquote(
      node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement!,
    );

    return blockquote !== null;
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    if (this.config.debug) {
      console.log('[QuotePlugin] destroy() called');
    }

    // Закрываем модальное окно, если оно открыто
    this.closeModal();

    // Удаляем глобальные обработчики
    this.removeGlobalListeners();

    // Очищаем ссылки
    this.currentEditorElement = null;
    this.savedRange = null;
  }

  /**
   * Открывает модальное окно для вставки/редактирования цитаты
   * @param options - Опции модального окна
   */
  private openQuoteModal(options: QuoteModalOptions): void {
    if (this.modalComponentRef) {
      // Модальное окно уже открыто
      if (this.config.debug) {
        console.warn('[QuotePlugin] Modal is already open');
      }
      return;
    }

    // Создаем компонент динамически
    this.modalComponentRef = createComponent(BlockquoteModalComponent, {
      environmentInjector: this.injector,
    });

    // Получаем экземпляр компонента
    const modalInstance = this.modalComponentRef.instance;

    // Подписываемся на события модального окна
    modalInstance.onInsert.subscribe((html: string) => {
      this.handleQuoteInsert(html, options.savedSelection);
      this.closeModal();
    });

    modalInstance.onCancel.subscribe(() => {
      this.closeModal();
    });

    modalInstance.onEditStyle.subscribe((style) => {
      if (this.config.debug) {
        console.log('[QuotePlugin] Edit style requested:', style);
      }
      // TODO: Открыть редактор стилей (Sprint 5)
    });

    // Добавляем компонент в DOM
    document.body.appendChild(this.modalComponentRef.location.nativeElement);

    // Регистрируем в Application для change detection
    this.appRef.attachView(this.modalComponentRef.hostView);

    // Открываем модальное окно
    modalInstance.open(options.prefilledText, options.savedSelection);

    // Диспатчим событие
    this.dispatchPluginEvent(QUOTE_CONSTANTS.EVENTS.MODAL_OPENED);
  }

  /**
   * Закрывает модальное окно
   */
  private closeModal(): void {
    if (!this.modalComponentRef) return;

    // Удаляем компонент из DOM
    this.appRef.detachView(this.modalComponentRef.hostView);
    this.modalComponentRef.destroy();
    this.modalComponentRef = null;

    // Диспатчим событие
    this.dispatchPluginEvent(QUOTE_CONSTANTS.EVENTS.MODAL_CLOSED);
  }

  /**
   * Обрабатывает вставку цитаты из модального окна
   * @param html - HTML код цитаты
   * @param savedSelection - Сохраненная позиция курсора
   */
  private handleQuoteInsert(html: string, savedSelection?: Range): QuoteOperationResult {
    if (!this.currentEditorElement) {
      return { success: false, error: 'Editor element not found' };
    }

    try {
      // Создаем элемент из HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const blockquote = tempDiv.firstElementChild as HTMLElement;

      if (!blockquote || blockquote.tagName !== 'BLOCKQUOTE') {
        throw new Error('Invalid blockquote HTML');
      }

      // Вставляем в редактор
      this.insertBlockquote(blockquote, savedSelection);

      // Диспатчим событие
      this.dispatchPluginEvent(QUOTE_CONSTANTS.EVENTS.QUOTE_INSERTED, {
        element: blockquote,
        styleId: blockquote.getAttribute(QUOTE_CONSTANTS.DATA_ATTRIBUTES.STYLE_ID),
      });

      if (this.config.debug) {
        console.log('[QuotePlugin] Quote inserted successfully', blockquote);
      }

      return {
        success: true,
        element: blockquote,
        styleId: blockquote.getAttribute(QUOTE_CONSTANTS.DATA_ATTRIBUTES.STYLE_ID) || undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[QuotePlugin] Error inserting quote:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Вставляет blockquote элемент в редактор
   * @param blockquote - Элемент blockquote для вставки
   * @param savedSelection - Сохраненная позиция курсора
   */
  private insertBlockquote(blockquote: HTMLElement, savedSelection?: Range): void {
    if (!this.currentEditorElement) {
      throw new Error('Editor element not found');
    }

    // Восстанавливаем позицию курсора
    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }

    // Получаем текущую позицию курсора
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // Если курсора нет, вставляем в конец редактора
      this.currentEditorElement.appendChild(blockquote);
      return;
    }

    const range = selection.getRangeAt(0);

    // Удаляем выделенный текст (если есть)
    if (!range.collapsed) {
      range.deleteContents();
    }

    // Проверяем, находимся ли мы внутри блочного элемента
    const parentBlock = this.getParentBlock(range.startContainer);

    if (parentBlock && parentBlock !== this.currentEditorElement) {
      // Вставляем blockquote после родительского блока
      parentBlock.insertAdjacentElement('afterend', blockquote);
    } else {
      // Вставляем blockquote в текущую позицию
      range.insertNode(blockquote);
    }

    // Перемещаем курсор после blockquote
    this.moveCursorAfter(blockquote);

    // Прокручиваем к вставленной цитате
    blockquote.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Сохраняет текущую позицию курсора
   */
  private saveSelection(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  /**
   * Получает выделенный текст в редакторе
   */
  private getSelectedText(): string | undefined {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return undefined;

    const text = selection.toString().trim();
    return text.length > 0 ? text : undefined;
  }

  /**
   * Находит родительский блочный элемент
   * @param node - Начальный узел
   * @returns Родительский блочный элемент или null
   */
  private getParentBlock(node: Node): HTMLElement | null {
    let currentNode: Node | null = node;

    while (currentNode && currentNode !== this.currentEditorElement) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        const display = window.getComputedStyle(element).display;

        // Проверяем, является ли элемент блочным
        if (display === 'block' || element.tagName === 'P' || element.tagName === 'DIV') {
          return element;
        }
      }
      currentNode = currentNode.parentNode;
    }

    return null;
  }

  /**
   * Перемещает курсор после указанного элемента
   * @param element - Элемент, после которого нужно переместить курсор
   */
  private moveCursorAfter(element: HTMLElement): void {
    const selection = window.getSelection();
    if (!selection) return;

    // Создаем новый параграф после blockquote для продолжения ввода
    const newParagraph = document.createElement('p');
    newParagraph.innerHTML = '<br>'; // Пустой параграф с br для поддержания высоты
    element.insertAdjacentElement('afterend', newParagraph);

    // Перемещаем курсор в новый параграф
    const range = document.createRange();
    range.setStart(newParagraph, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Устанавливает глобальные обработчики событий
   */
  private setupGlobalListeners(): void {
    // Можно добавить глобальные обработчики, если нужно
    // Например, для обработки drag&drop цитат
  }

  /**
   * Удаляет глобальные обработчики событий
   */
  private removeGlobalListeners(): void {
    // Удаление обработчиков
  }

  /**
   * Загружает конфигурацию из localStorage
   */
  private loadConfig(): void {
    if (!this.isBrowser) return;

    try {
      const savedConfig = localStorage.getItem(QUOTE_CONSTANTS.CONFIG_STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        Object.assign(this.config, parsed);
      }
    } catch (error) {
      console.error('[QuotePlugin] Error loading config:', error);
    }
  }

  /**
   * Сохраняет конфигурацию в localStorage
   */
  private saveConfig(): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(QUOTE_CONSTANTS.CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('[QuotePlugin] Error saving config:', error);
    }
  }

  /**
   * Диспатчит пользовательское событие плагина
   * @param eventName - Имя события
   * @param detail - Детали события
   */
  private dispatchPluginEvent(eventName: string, detail?: any): void {
    if (!this.isBrowser || !this.currentEditorElement) return;

    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });

    this.currentEditorElement.dispatchEvent(event);

    if (this.config.debug) {
      console.log('[QuotePlugin] Event dispatched:', eventName, detail);
    }
  }

  /**
   * Публичный метод для программной вставки цитаты
   * (можно использовать из других частей приложения)
   *
   * @param data - Данные цитаты
   * @param styleId - ID стиля
   * @param editorElement - Элемент редактора
   */
  public async insertQuote(
    data: BlockquoteData,
    editorElement: HTMLElement,
  ): Promise<QuoteOperationResult> {
    this.currentEditorElement = editorElement;

    try {
      // Получаем стиль
      const style = await this.stylesService.getStyleById(data.styleId);
      if (!style) {
        throw new Error(`Style not found: ${data.styleId}`);
      }

      // Генерируем HTML
      const html = BlockquoteGenerator.createBlockquoteHTML(data, style);

      // Вставляем
      return this.handleQuoteInsert(html);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[QuotePlugin] Error in insertQuote:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Публичный метод для редактирования существующей цитаты
   *
   * @param blockquoteElement - Элемент blockquote для редактирования
   */
  public editQuote(blockquoteElement: HTMLElement): void {
    if (!BlockquoteGenerator.isBlockquote(blockquoteElement)) {
      console.error('[QuotePlugin] Element is not a blockquote');
      return;
    }

    // Извлекаем данные из элемента
    const data = BlockquoteGenerator.extractDataFromBlockquote(blockquoteElement);
    if (!data) {
      console.error('[QuotePlugin] Could not extract data from blockquote');
      return;
    }

    // Сохраняем ссылку на редактируемый элемент
    const editingElement = blockquoteElement;

    // Открываем модальное окно в режиме редактирования
    this.openQuoteModal({
      mode: 'edit',
      prefilledText: data.text,
      prefilledAuthor: data.author,
      prefilledSource: data.source,
      preselectedStyleId: data.styleId,
      editingElement,
    });

    // TODO: В обработчике onInsert нужно обновлять существующий элемент,
    // а не вставлять новый (реализовать в следующей версии)
  }
}

/**
 * Фабрика для создания экземпляра плагина
 * @param config - Пользовательская конфигурация
 */
export function createQuotePlugin(config?: Partial<QuotePluginConfig>): QuotePlugin {
  return new QuotePlugin(config);
}
