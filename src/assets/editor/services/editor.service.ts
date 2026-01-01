import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import {
  AuroraConfig,
  CommandHandler,
  EDITOR_DEFAULTS,
  EditorSnapshot,
  ImageData,
  LinkData,
  NativeCommand,
  SelectionPath,
  ToolbarButton,
  isNativeCommand,
} from '../types/editor.types';
import { normalizeDOM as normalizeDOMUtil } from '../utils/normalize-dom.utils';
import {
  fullSanitize as fullSanitizeUtil,
  quickSanitize as quickSanitizeUtil,
} from '../utils/sanitize.utils';
import {
  restoreSelection,
  restoreSelectionByAbsoluteOffset,
  saveSelection,
} from '../utils/selection.utils';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EditorService - Основной сервис WYSIWYG редактора Aurora
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Управляет всей логикой редактора:
 * - История изменений (Undo/Redo)
 * - Выполнение команд форматирования
 * - Управление состоянием и конфигурацией
 * - Регистрация плагинов и кнопок тулбара
 * - Санитизация и нормализация HTML
 *
 * @example
 * ```typescript
 * constructor(private editorService: EditorService) {}
 *
 * ngOnInit() {
 *   this.editorService.init(this.editorElement.nativeElement, config);
 *   this.editorService.onContentChange$.subscribe(html => {
 *     console.log('Content changed:', html);
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class EditorService {
  // ═══════════════════════════════════════════════════════════════════════════
  // ПРИВАТНЫЕ СВОЙСТВА
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * DOM элемент редактора (contenteditable)
   */
  private editorElement: HTMLElement | null = null;

  /**
   * Конфигурация редактора (с применением дефолтных значений)
   */
  private config: AuroraConfig = {
    maxHistorySize: EDITOR_DEFAULTS.MAX_HISTORY_SIZE,
    placeholder: EDITOR_DEFAULTS.DEFAULT_PLACEHOLDER,
    language: EDITOR_DEFAULTS.DEFAULT_LANGUAGE,
    pasteMode: EDITOR_DEFAULTS.DEFAULT_PASTE_MODE,
  };

  /**
   * История изменений для Undo/Redo
   */
  private history: EditorSnapshot[] = [];

  /**
   * Текущая позиция в истории (индекс)
   */
  private historyIndex = -1;

  /**
   * Subject для дебаунсинга событий input (300ms)
   */
  private inputDebounce$ = new Subject<void>();

  /**
   * Subject для эмиссии изменений контента во внешний мир
   */
  private contentChange$ = new Subject<string>();

  /**
   * Map для хранения кастомных обработчиков команд
   * Ключ - название команды, значение - функция-обработчик
   */
  private customHandlers = new Map<string, CommandHandler>();

  /**
   * Массив зарегистрированных кнопок тулбара
   */
  private toolbarButtons: ToolbarButton[] = [];

  /**
   * Signal для отслеживания режима fullscreen
   */
  private isFullscreen: WritableSignal<boolean> = signal(false);

  /**
   * Signal для отслеживания disabled состояния
   */
  private isDisabled: WritableSignal<boolean> = signal(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // ПУБЛИЧНЫЕ OBSERVABLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Observable для подписки на изменения контента
   * Эмитит HTML строку после каждого изменения
   */
  public readonly onContentChange$ = this.contentChange$.asObservable();

  /**
   * Signal для чтения состояния fullscreen
   */
  public readonly isFullscreen$: Signal<boolean> = this.isFullscreen.asReadonly();

  /**
   * Signal для чтения состояния disabled
   */
  public readonly isDisabled$: Signal<boolean> = this.isDisabled.asReadonly();

  // ═══════════════════════════════════════════════════════════════════════════
  // КОНСТРУКТОР
  // ═══════════════════════════════════════════════════════════════════════════

  constructor() {
    // Настройка debounce для автоматического сохранения snapshot
    this.inputDebounce$.pipe(debounceTime(300)).subscribe(() => {
      this.pushSnapshot();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ИНИЦИАЛИЗАЦИЯ И УНИЧТОЖЕНИЕ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Инициализация редактора
   *
   * @param element - DOM элемент contenteditable
   * @param config - Конфигурация редактора (опционально)
   *
   * @example
   * ```typescript
   * this.editorService.init(this.editorElement.nativeElement, {
   *   maxHistorySize: 50,
   *   placeholder: 'Начните вводить текст...',
   * });
   * ```
   */
  public init(element: HTMLElement, config?: Partial<AuroraConfig>): void {
    if (!element) {
      console.error('EditorService.init(): element is required');
      return;
    }

    // Сохраняем ссылку на DOM элемент
    this.editorElement = element;

    // Применяем пользовательскую конфигурацию поверх дефолтной
    if (config) {
      this.config = {
        maxHistorySize: config.maxHistorySize ?? EDITOR_DEFAULTS.MAX_HISTORY_SIZE,
        placeholder: config.placeholder ?? EDITOR_DEFAULTS.DEFAULT_PLACEHOLDER,
        language: config.language ?? EDITOR_DEFAULTS.DEFAULT_LANGUAGE,
        pasteMode: config.pasteMode ?? EDITOR_DEFAULTS.DEFAULT_PASTE_MODE,
        onImageUpload: config.onImageUpload,
        readonly: config.readonly,
        maxImageSize: config.maxImageSize,
        allowedImageTypes: config.allowedImageTypes,
        updateDelay: config.updateDelay,
        allowFullscreen: config.allowFullscreen,
        allowSourceMode: config.allowSourceMode,
        customClass: config.customClass,
        minHeight: config.minHeight,
        maxHeight: config.maxHeight,
      };
    }

    // Устанавливаем атрибут contenteditable
    this.editorElement.contentEditable = 'true';

    // Устанавливаем placeholder через data-атрибут (для CSS)
    if (this.config.placeholder) {
      this.editorElement.setAttribute('data-placeholder', this.config.placeholder);
    }

    // Очищаем историю
    this.history = [];
    this.historyIndex = -1;

    // Создаём начальный snapshot
    this.pushSnapshot();

    console.log('EditorService initialized', {
      element: this.editorElement,
      config: this.config,
    });
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   *
   * @example
   * ```typescript
   * ngOnDestroy() {
   *   this.editorService.destroy();
   * }
   * ```
   */
  public destroy(): void {
    // Завершаем все Subject'ы
    this.inputDebounce$.complete();
    this.contentChange$.complete();

    // Очищаем историю
    this.history = [];
    this.historyIndex = -1;

    // Очищаем кастомные обработчики
    this.customHandlers.clear();

    // Очищаем кнопки тулбара
    this.toolbarButtons = [];

    // Удаляем ссылку на DOM элемент
    if (this.editorElement) {
      this.editorElement.contentEditable = 'false';
      this.editorElement = null;
    }

    console.log('EditorService destroyed');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ИСТОРИЯ (UNDO/REDO)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Сохранение текущего состояния в историю
   *
   * @remarks
   * - Проверяет дубликаты через normalizeHtmlForComparison()
   * - Ограничивает размер истории (maxHistorySize)
   * - Сбрасывает "будущее" при новом изменении
   */
  public pushSnapshot(): void {
    if (!this.editorElement) {
      return;
    }

    // Получаем текущий HTML
    const currentHtml = this.editorElement.innerHTML;

    // Нормализуем HTML для сравнения
    const normalizedHtml = this.normalizeHtmlForComparison(currentHtml);

    // Проверяем, отличается ли от последнего snapshot
    if (this.history.length > 0 && this.historyIndex >= 0) {
      const lastSnapshot = this.history[this.historyIndex];
      const lastNormalizedHtml = this.normalizeHtmlForComparison(lastSnapshot.html);

      // Если HTML не изменился, не создаём дубликат
      if (normalizedHtml === lastNormalizedHtml) {
        return;
      }
    }

    // Сохраняем текущую позицию курсора
    const selection = this.saveSelection();

    // Создаём новый snapshot
    const snapshot: EditorSnapshot = {
      html: currentHtml,
      selection: selection,
      timestamp: Date.now(),
    };

    // Если мы не в конце истории, удаляем все "будущие" снимки
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Добавляем новый snapshot
    this.history.push(snapshot);

    // Ограничиваем размер истории
    const maxSize = this.config.maxHistorySize ?? EDITOR_DEFAULTS.MAX_HISTORY_SIZE;
    if (this.history.length > maxSize) {
      this.history.shift(); // Удаляем самый старый
    } else {
      this.historyIndex++;
    }

    console.log('Snapshot saved', {
      index: this.historyIndex,
      total: this.history.length,
      html: currentHtml.substring(0, 100) + '...',
    });
  }

  /**
   * Отмена последнего действия
   *
   * @returns true, если undo выполнен успешно
   */
  public undo(): boolean {
    if (!this.canUndo()) {
      console.log('Cannot undo: at the beginning of history');
      return false;
    }

    // Декрементируем индекс
    this.historyIndex--;

    // Восстанавливаем snapshot
    const snapshot = this.history[this.historyIndex];
    this.restoreSnapshot(snapshot);

    console.log('Undo performed', {
      newIndex: this.historyIndex,
      total: this.history.length,
    });

    return true;
  }

  /**
   * Повтор отменённого действия
   *
   * @returns true, если redo выполнен успешно
   */
  public redo(): boolean {
    if (!this.canRedo()) {
      console.log('Cannot redo: at the end of history');
      return false;
    }

    // Инкрементируем индекс
    this.historyIndex++;

    // Восстанавливаем snapshot
    const snapshot = this.history[this.historyIndex];
    this.restoreSnapshot(snapshot);

    console.log('Redo performed', {
      newIndex: this.historyIndex,
      total: this.history.length,
    });

    return true;
  }

  /**
   * Проверка возможности отмены
   *
   * @returns true, если есть что отменять
   */
  public canUndo(): boolean {
    return this.historyIndex > 0;
  }

  /**
   * Проверка возможности повтора
   *
   * @returns true, если есть что повторять
   */
  public canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Триггер для debounce при событии input
   *
   * @remarks
   * Вызывается из компонента при событии input.
   * Через 300ms автоматически вызовется pushSnapshot()
   */
  public triggerInputDebounce(): void {
    this.inputDebounce$.next();
  }

  /**
   * Нормализация HTML для сравнения (игнорирует пробелы и регистр)
   *
   * @param html - HTML строка для нормализации
   * @returns Нормализованная строка
   */
  private normalizeHtmlForComparison(html: string): string {
    return html
      .toLowerCase() // Приводим к нижнему регистру
      .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
      .replace(/>\s+</g, '><') // Удаляем пробелы между тегами
      .trim(); // Удаляем пробелы по краям
  }

  /**
   * Восстановление snapshot из истории
   *
   * @param snapshot - Снимок состояния для восстановления
   */
  private restoreSnapshot(snapshot: EditorSnapshot): void {
    if (!this.editorElement) {
      console.warn('Cannot restore snapshot: editorElement is null');
      return;
    }

    // Восстанавливаем HTML
    this.editorElement.innerHTML = snapshot.html;

    // Восстанавливаем позицию курсора
    if (snapshot.selection) {
      this.restoreSelectionSafe(snapshot.selection);
    }

    // Эмитим изменение контента
    this.contentChange$.next(snapshot.html);

    console.log('Snapshot restored', {
      timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
      html: snapshot.html.substring(0, 100) + '...',
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ВЫПОЛНЕНИЕ КОМАНД
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Выполнение команды форматирования
   *
   * @param command - Название команды (bold, italic, createLink, etc.)
   * @param payload - Дополнительные данные (для ссылок, изображений)
   *
   * @remarks
   * Алгоритм:
   * 1. Мгновенный snapshot перед командой
   * 2. Сохранение selection
   * 3. Выполнение команды (native или custom)
   * 4. normalizeDOM()
   * 5. quickSanitize()
   * 6. Восстановление selection
   * 7. Эмиссия изменений
   *
   * @example
   * ```typescript
   * this.editorService.execute('bold');
   * this.editorService.execute('createLink', { url: 'https://example.com', text: 'Link' });
   * ```
   */
  public execute(command: string, payload?: ImageData | LinkData | string): void {
    if (!this.editorElement) {
      console.warn('Cannot execute command: editorElement is null');
      return;
    }

    console.log('Executing command:', command, payload ? 'with payload' : '');

    // 1. Мгновенный snapshot перед командой
    this.pushSnapshot();

    // 2. Сохранение selection (для восстановления после манипуляций)
    const savedSelection = this.saveSelection();

    // 3. Выполнение команды (native или custom)
    if (this.customHandlers.has(command)) {
      // Кастомная команда через зарегистрированный handler
      const handler = this.customHandlers.get(command);
      if (handler) {
        handler(payload);
      }
    } else if (isNativeCommand(command as NativeCommand)) {
      // Native команда через document.execCommand
      try {
        if (payload && typeof payload === 'string') {
          // Команды с параметром (например, createLink, insertHTML)
          document.execCommand(command, false, payload);
        } else {
          // Команды без параметра (bold, italic, etc.)
          document.execCommand(command, false);
        }
      } catch (error) {
        console.error('execCommand failed:', command, error);
      }
    } else {
      console.warn('Unknown command:', command);
      return;
    }

    // 4. Нормализация DOM (пока заглушка, будет реализована в T-027)
    this.normalizeDOM();

    // 5. Быстрая санитизация (пока заглушка, будет реализована в T-025)
    const currentHtml = this.editorElement.innerHTML;
    const sanitizedHtml = this.quickSanitize(currentHtml);
    this.editorElement.innerHTML = sanitizedHtml;

    // 6. Восстановление selection
    if (savedSelection) {
      this.restoreSelectionSafe(savedSelection);
    }

    // 7. Эмиссия изменений (используем sanitizedHtml)
    this.contentChange$.next(sanitizedHtml);

    console.log('Command executed successfully:', command);
  }

  /**
   * Регистрация кастомного обработчика команды
   *
   * @param command - Название команды
   * @param handler - Функция-обработчик
   *
   * @example
   * ```typescript
   * this.editorService.registerCommandHandler('myCustomCommand', (payload) => {
   *   console.log('Custom command executed', payload);
   * });
   * ```
   */
  public registerCommandHandler(command: string, handler: CommandHandler): void {
    this.customHandlers.set(command, handler);
  }

  /**
   * Удаление кастомного обработчика команды
   *
   * @param command - Название команды
   */
  public unregisterCommandHandler(command: string): void {
    this.customHandlers.delete(command);
  }

  /**
   * Проверка, активна ли команда форматирования
   *
   * @param command - Название команды
   * @returns true, если команда активна (например, текст выделен жирным)
   *
   * @example
   * ```typescript
   * const isBold = this.editorService.isCommandActive('bold');
   * ```
   */
  public isCommandActive(command: string): boolean {
    // TODO: Реализация проверки активности
    console.log('EditorService.isCommandActive() called', command);
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // СОСТОЯНИЕ И КОНТЕНТ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Получение HTML контента редактора
   *
   * @returns Санитизированный HTML
   *
   * @example
   * ```typescript
   * const html = this.editorService.getContent();
   * console.log(html);
   * ```
   */
  public getContent(): string {
    if (!this.editorElement) {
      console.warn('Cannot get content: editorElement is null');
      return '';
    }

    // Получаем текущий HTML
    const rawHtml = this.editorElement.innerHTML;

    // Выполняем полную санитизацию
    const sanitizedHtml = this.fullSanitize(rawHtml);

    console.log('Content retrieved:', sanitizedHtml.substring(0, 100) + '...');

    return sanitizedHtml;
  }

  /**
   * Установка HTML контента редактора
   *
   * @param html - HTML строка для установки
   *
   * @remarks
   * - Выполняет полную санитизацию через fullSanitize()
   * - Создаёт новый snapshot
   *
   * @example
   * ```typescript
   * this.editorService.setContent('<p>Hello <strong>World</strong></p>');
   * ```
   */
  public setContent(html: string): void {
    if (!this.editorElement) {
      console.warn('Cannot set content: editorElement is null');
      return;
    }

    // Выполняем полную санитизацию входящего HTML
    const sanitizedHtml = this.fullSanitize(html);

    // Устанавливаем HTML в редактор
    this.editorElement.innerHTML = sanitizedHtml;

    // Создаём snapshot для истории
    this.pushSnapshot();

    // Эмитим изменение контента
    this.contentChange$.next(sanitizedHtml);

    console.log('Content set:', sanitizedHtml.substring(0, 100) + '...');
  }

  /**
   * Установка disabled состояния
   *
   * @param disabled - true для отключения редактора
   */
  public setDisabled(disabled: boolean): void {
    this.isDisabled.set(disabled);
    if (this.editorElement) {
      this.editorElement.contentEditable = disabled ? 'false' : 'true';
    }
  }

  /**
   * Переключение fullscreen режима
   *
   * @example
   * ```typescript
   * this.editorService.toggleFullscreen();
   * ```
   */
  public toggleFullscreen(): void {
    // TODO: Реализация переключения fullscreen
    this.isFullscreen.update((value) => !value);
    console.log('EditorService.toggleFullscreen() called');
  }

  /**
   * Проверка и нормализация пустого contenteditable
   *
   * @remarks
   * Если редактор полностью пуст, вставляет `<p><br></p>`
   * для корректной работы курсора
   */
  public checkAndNormalizeEmpty(): void {
    // TODO: Реализация проверки
    console.log('EditorService.checkAndNormalizeEmpty() called');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Сохранение текущей позиции курсора (selection)
   *
   * @returns Объект SelectionPath или null
   *
   * @remarks
   * Использует path-based подход для восстановления курсора
   */
  public saveSelection(): SelectionPath | null {
    if (!this.editorElement) {
      console.warn('[EditorService] Cannot save selection: editorElement is null');
      return null;
    }

    try {
      // Делегируем в утилиту selection.utils.ts
      const selectionPath = saveSelection(this.editorElement);

      if (!selectionPath) {
        console.warn('[EditorService] saveSelection returned null');
        return null;
      }

      console.log('[EditorService] Selection saved successfully');
      return selectionPath;
    } catch (error) {
      console.error('[EditorService] Error in saveSelection:', error);
      return null;
    }
  }
  /**
   * Восстановление позиции курсора с 3-уровневым fallback
   *
   * @param selectionPath - Сохранённая позиция курсора
   *
   * @remarks
   * Fallback:
   * 1. По path (startPath/endPath)
   * 2. По absoluteStart/absoluteEnd (если DOM изменился)
   * 3. Курсор в конец редактора
   */
  public restoreSelectionSafe(selectionPath: SelectionPath | null): void {
    if (!this.editorElement) {
      console.warn('[EditorService] Cannot restore selection: editorElement is null');
      return;
    }

    if (!selectionPath) {
      console.warn('[EditorService] Cannot restore selection: selectionPath is null');
      return;
    }

    try {
      // Уровень 1: Попытка восстановления по path (startPath/endPath)
      console.log('[EditorService] Attempting to restore selection by path...');
      const pathSuccess = restoreSelection(this.editorElement, selectionPath);

      if (pathSuccess) {
        console.log('[EditorService] Selection restored by path successfully');
        return;
      }

      // Уровень 2: Fallback на absolute offset (если DOM изменился)
      console.warn('[EditorService] Path restore failed, trying absolute offset...');
      const absoluteSuccess = restoreSelectionByAbsoluteOffset(this.editorElement, selectionPath);

      if (absoluteSuccess) {
        console.log('[EditorService] Selection restored by absolute offset successfully');
        return;
      }

      // Уровень 3: Крайний fallback - курсор в конец
      console.warn('[EditorService] All restore methods failed, setting cursor to end...');
      this.setCursorToEnd();
    } catch (error) {
      console.error('[EditorService] Error in restoreSelectionSafe:', error);
      // При ошибке также ставим курсор в конец
      this.setCursorToEnd();
    }
  }

  /**
   * Установка курсора в конец редактора
   */
  public setCursorToEnd(): void {
    if (!this.editorElement) {
      console.warn('[EditorService] Cannot set cursor to end: editorElement is null');
      return;
    }

    try {
      const range = document.createRange();
      const sel = window.getSelection();

      if (!sel) {
        console.warn('[EditorService] window.getSelection() returned null');
        return;
      }

      // Находим последний текстовый node
      const lastNode = this.getLastTextNode(this.editorElement);

      if (lastNode) {
        // Устанавливаем курсор в конец последнего текстового node
        const offset = lastNode.textContent?.length || 0;
        range.setStart(lastNode, offset);
        range.setEnd(lastNode, offset);
      } else {
        // Если нет текстовых nodes, устанавливаем в конец editorElement
        range.selectNodeContents(this.editorElement);
        range.collapse(false); // false = collapse to end
      }

      sel.removeAllRanges();
      sel.addRange(range);

      console.log('[EditorService] Cursor set to end successfully');
    } catch (error) {
      console.error('[EditorService] Error setting cursor to end:', error);
    }
  }

  /**
   * Установка курсора в начало редактора
   */
  public setCursorToStart(): void {
    if (!this.editorElement) {
      console.warn('[EditorService] Cannot set cursor to start: editorElement is null');
      return;
    }

    try {
      const range = document.createRange();
      const sel = window.getSelection();

      if (!sel) {
        console.warn('[EditorService] window.getSelection() returned null');
        return;
      }

      // Находим первый текстовый node
      const firstNode = this.getFirstTextNode(this.editorElement);

      if (firstNode) {
        // Устанавливаем курсор в начало первого текстового node
        range.setStart(firstNode, 0);
        range.setEnd(firstNode, 0);
      } else {
        // Если нет текстовых nodes, устанавливаем в начало editorElement
        range.selectNodeContents(this.editorElement);
        range.collapse(true); // true = collapse to start
      }

      sel.removeAllRanges();
      sel.addRange(range);

      console.log('[EditorService] Cursor set to start successfully');
    } catch (error) {
      console.error('[EditorService] Error setting cursor to start:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOOLBAR И ПЛАГИНЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Регистрация кнопки в тулбаре
   *
   * @param button - Объект кнопки
   *
   * @example
   * ```typescript
   * this.editorService.registerButton({
   *   command: 'bold',
   *   icon: 'format_bold',
   *   tooltip: 'Жирный',
   *   group: 'basic',
   * });
   * ```
   */
  public registerButton(button: ToolbarButton): void {
    this.toolbarButtons.push(button);
  }

  /**
   * Удаление кнопки из тулбара
   *
   * @param command - Название команды кнопки
   */
  public unregisterButton(command: string): void {
    const index = this.toolbarButtons.findIndex((btn) => btn.command === command);
    if (index !== -1) {
      this.toolbarButtons.splice(index, 1);
    }
  }

  /**
   * Получение всех зарегистрированных кнопок
   *
   * @returns Массив кнопок тулбара
   */
  public getButtons(): ToolbarButton[] {
    return this.toolbarButtons;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // САНИТИЗАЦИЯ И НОРМАЛИЗАЦИЯ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Быстрая санитизация (минимальная очистка)
   *
   * @param html - HTML строка для очистки
   * @returns Очищенный HTML
   *
   * @remarks
   * Используется после каждой команды форматирования.
   * Удаляет только опасные теги/атрибуты.
   */
  private quickSanitize(html: string): string {
    return quickSanitizeUtil(html);
  }

  /**
   * Полная санитизация (глубокая очистка)
   *
   * @param html - HTML строка для очистки
   * @returns Очищенный HTML
   *
   * @remarks
   * Используется при paste и getContent().
   * Применяет все правила безопасности.
   */
  private fullSanitize(html: string): string {
    return fullSanitizeUtil(html);
  }

  /**
   * Нормализация DOM структуры
   *
   * @remarks
   * - Замена устаревших тегов (b→strong, i→em)
   * - Safari fix (inline styles → semantic tags)
   * - Удаление вложенных дубликатов
   * - Объединение соседних тегов
   * - Удаление пустых элементов
   * - Firefox fix (лишние `<br>`)
   */
  private normalizeDOM(): void {
    normalizeDOMUtil(this.editorElement);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAFARI СПЕЦИФИЧНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Проверка, является ли браузер Safari
   *
   * @returns true, если Safari
   */
  public isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  /**
   * Ручная проверка стилей для Safari
   *
   * @param command - Команда для проверки (bold, italic, underline)
   * @returns true, если стиль применён
   *
   * @remarks
   * Safari не всегда корректно работает с document.queryCommandState().
   * Этот метод проверяет computed styles вручную.
   */
  public checkStyleManually(command: NativeCommand): boolean {
    // TODO: Реализация ручной проверки стилей
    console.log('EditorService.checkStyleManually() called', command);
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ПРИВАТНЫЕ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Получает первый текстовый node в элементе
   *
   * @param element - Корневой элемент для поиска
   * @returns Первый Text node или null
   */
  private getFirstTextNode(element: Node): Node | null {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    return walker.nextNode();
  }

  /**
   * Получает последний текстовый node в элементе
   *
   * @param element - Корневой элемент для поиска
   * @returns Последний Text node или null
   */
  private getLastTextNode(element: Node): Node | null {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    let lastNode: Node | null = null;
    let currentNode = walker.nextNode();

    while (currentNode) {
      lastNode = currentNode;
      currentNode = walker.nextNode();
    }

    return lastNode;
  }
}
