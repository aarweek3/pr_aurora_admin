/**
 * ════════════════════════════════════════════════════════════════════════════
 * AURORA EDITOR COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Главный компонент WYSIWYG редактора Aurora.
 *
 * Особенности:
 * - Standalone компонент (Angular 19+)
 * - Реализация ControlValueAccessor для интеграции с Reactive Forms
 * - Поддержка всех событий редактора (input, paste, keydown)
 * - Character counter
 * - Placeholder
 * - Fullscreen режим
 *
 * @module AuroraEditorComponent
 */

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ElementRef,
  EnvironmentInjector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlignCenterPlugin } from '../plugins/alignment/align-center.plugin';
import { AlignJustifyPlugin } from '../plugins/alignment/align-justify.plugin';
import { AlignLeftPlugin } from '../plugins/alignment/align-left.plugin';
import { AlignRightPlugin } from '../plugins/alignment/align-right.plugin';
import { AuroraPlugin } from '../plugins/aurora-plugin.interface';
import { BackgroundColorPlugin } from '../plugins/format/background-color.plugin';
import { BoldPlugin } from '../plugins/format/bold.plugin';
import { ClearFormattingPlugin } from '../plugins/format/clear-formatting.plugin';
import { FontFamilyPlugin } from '../plugins/format/font-family.plugin';
import { FontSizePlugin } from '../plugins/format/font-size.plugin';
import { HighlightPlugin } from '../plugins/format/highlight.plugin';
import { IndentPlugin } from '../plugins/format/indent.plugin';
import { InsertQuotePlugin } from '../plugins/format/insert-quote.plugin';
import { ItalicPlugin } from '../plugins/format/italic.plugin';
import { LineHeightPlugin } from '../plugins/format/line-height.plugin';
import { OutdentPlugin } from '../plugins/format/outdent.plugin';
import { StrikethroughPlugin } from '../plugins/format/strikethrough.plugin';
import { TextAlignmentAdvancedPlugin } from '../plugins/format/text-alignment-advanced.plugin';
import { TextColorPlugin } from '../plugins/format/text-color.plugin';
import { UnderlinePlugin } from '../plugins/format/underline.plugin';
import { RedoPlugin } from '../plugins/history/redo.plugin';
import { UndoPlugin } from '../plugins/history/undo.plugin';
import { EmojiPlugin } from '../plugins/insert/emoji.plugin';
import { FootnotesPlugin } from '../plugins/insert/footnotes.plugin';
import { HorizontalRulePlugin } from '../plugins/insert/horizontal-rule.plugin';
import { ImagePlugin } from '../plugins/insert/image.plugin';
import { LinkPreviewPlugin } from '../plugins/insert/link-preview.plugin';
import { NonBreakingSpacePlugin } from '../plugins/insert/non-breaking-space.plugin';
import { SpecialCharactersPlugin } from '../plugins/insert/special-characters.plugin';
import { TablePlugin } from '../plugins/insert/table.plugin';
import { YouTubePlugin } from '../plugins/insert/youtube.plugin';
// Новый Quote Plugin с расширенным функционалом
import { CreateQuoteStylePlugin } from '../plugins/create-quote-style/create-quote-style.plugin';
// Search plugins
import { LinkPreviewModalComponent } from '../modals/link-preview-modal/link-preview-modal.component';
import { WordCountModalComponent } from '../modals/word-count-modal/word-count-modal.component';
import { HeadingPlugin } from '../plugins/block/heading.plugin';
import { AnchorPlugin } from '../plugins/link/anchor.plugin';
import { LinkToAnchorPlugin } from '../plugins/link/link-to-anchor.plugin';
import { LinkPlugin } from '../plugins/link/link.plugin';
import { RemoveAnchorPlugin } from '../plugins/link/remove-anchor.plugin';
import { UnlinkPlugin } from '../plugins/link/unlink.plugin';
import { OrderedListPlugin } from '../plugins/list/ordered-list.plugin';
import { UnorderedListPlugin } from '../plugins/list/unordered-list.plugin';
import { QuotePlugin } from '../plugins/quote/quote.plugin';
import { FindReplacePlugin } from '../plugins/search/find-replace.plugin';
import { SearchDialogPlugin } from '../plugins/search/search-dialog.plugin';
import { ShowBlocksPlugin } from '../plugins/utility/show-blocks.plugin';
import { ShowInvisiblesPlugin } from '../plugins/utility/show-invisibles.plugin';
import { SourceCodePlugin } from '../plugins/utility/source-code.plugin';
import { WordCountPlugin } from '../plugins/utility/word-count.plugin';
import { DialogManagerService } from '../services/dialog-manager.service';
import { EditorService } from '../services/editor.service';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { PluginRegistryService } from '../services/plugin-registry.service';
import { SearchReplaceService } from '../services/search-replace.service';
import { AuroraConfig } from '../types/editor.types';
import { ImageContextMenuComponent } from './image-context-menu/image-context-menu.component';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { SearchPanelComponent } from './search-panel/search-panel.component';
import { SourceCodeModalComponent } from './source-code-modal/source-code-modal.component';
import { TableModalComponent } from './table-modal/table-modal.component';
import { ToastNotificationComponent } from './toast-notification/toast-notification.component';
import { AuroraToolbarComponent } from './toolbar/aurora-toolbar.component';
import { YouTubeModalComponent } from './youtube-modal/youtube-modal.component';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AURORA EDITOR COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */
@Component({
  selector: 'aurora-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuroraToolbarComponent,
    SourceCodeModalComponent,
    YouTubeModalComponent,
    LinkPreviewModalComponent,
    WordCountModalComponent,
    TableModalComponent,
    ImageModalComponent,
    ImageContextMenuComponent,
    ToastNotificationComponent,
    SearchPanelComponent,
  ],
  templateUrl: './aurora-editor.component.html',
  styleUrls: ['./aurora-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuroraEditorComponent),
      multi: true,
    },
  ],
})
export class AuroraEditorComponent
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
{
  /**
   * Ссылка на contenteditable элемент редактора
   */
  @ViewChild('editorElement', { static: true })
  editorElementRef!: ElementRef<HTMLDivElement>;

  /**
   * Ссылка на модальное окно исходного кода
   */
  @ViewChild(SourceCodeModalComponent)
  sourceCodeModal?: SourceCodeModalComponent;

  /**
   * Ссылка на модальное окно YouTube
   */
  @ViewChild(YouTubeModalComponent)
  youtubeModal?: YouTubeModalComponent;

  /**
   * Ссылка на модальное окно Link Preview
   */
  @ViewChild(LinkPreviewModalComponent)
  linkPreviewModal?: LinkPreviewModalComponent;

  /**
   * Ссылка на модальное окно Word Count
   */
  @ViewChild(WordCountModalComponent)
  wordCountModal?: WordCountModalComponent;

  /**
   * Ссылка на модальное окно Table
   */
  @ViewChild(TableModalComponent)
  tableModal?: TableModalComponent;

  /**
   * Ссылка на модальное окно Image
   */
  @ViewChild(ImageModalComponent)
  imageModal?: ImageModalComponent;

  /**
   * Конфигурация редактора (опциональная)
   * Если не указана, используются дефолтные настройки из EDITOR_DEFAULTS
   */
  @Input() config?: Partial<AuroraConfig>;

  /**
   * Показывать ли character counter
   */
  @Input() showCharacterCount = false;

  /**
   * Максимальное количество символов (для валидации)
   */
  @Input() maxLength?: number;

  // ═══════════════════════════════════════════════════════════════════════════
  // SIGNALS ДЛЯ РЕАКТИВНОГО UI
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Текущее количество символов
   */
  characterCount = signal(0);

  /**
   * Fullscreen режим
   */
  isFullscreen = computed(() => this.editorService.isFullscreen$());

  /**
   * Disabled состояние
   */
  isDisabled = computed(() => this.editorService.isDisabled$());

  /**
   * Текст для character counter
   */
  characterCountText = computed(() => {
    const count = this.characterCount();
    if (this.maxLength) {
      return `${count} / ${this.maxLength}`;
    }
    return `${count}`;
  });

  /**
   * CSS класс для превышения лимита
   */
  isOverLimit = computed(() => {
    return this.maxLength ? this.characterCount() > this.maxLength : false;
  });

  /**
   * Видимость панели поиска
   */
  searchPanelVisible = computed(() => this.dialogManager.searchPanel().visible);

  /**
   * Показывать ли поля замены в панели поиска
   */
  searchPanelShowReplace = computed(() => this.dialogManager.searchPanel().showReplace);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROL VALUE ACCESSOR
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Callback для изменения значения формы
   */
  private onChange: (value: string) => void = () => {};

  /**
   * Callback для события touched
   */
  private onTouched: () => void = () => {};

  /**
   * Подписки RxJS
   */
  private subscriptions = new Subscription();

  // ═══════════════════════════════════════════════════════════════════════════
  // PLUGINS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Экземпляр плагина Source Code (для установки callback)
   */
  private sourceCodePlugin = new SourceCodePlugin();

  /**
   * Экземпляр плагина YouTube (для установки callback)
   */
  private youtubePlugin = new YouTubePlugin();

  /**
   * Экземпляр плагина Link (для динамического создания модалки)
   */
  private linkPlugin!: LinkPlugin;

  /**
   * Список плагинов форматирования - простое свойство с инициализацией в ngOnInit
   */
  plugins: AuroraPlugin[] = [];

  /**
   * Список активных плагинов (для подсветки кнопок)
   */
  activePlugins = signal<string[]>([]);

  /**
   * Элемент <style> для динамических SCSS стилей
   */
  private customStyleElement: HTMLStyleElement | null = null;

  /**
   * Текущие кастомные SCSS стили
   */
  private customScss = '';

  /**
   * Сохранённая позиция курсора перед открытием модалки YouTube
   */
  private savedYouTubeRange: Range | null = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════════

  constructor(
    public editorService: EditorService,
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    private dialogManager: DialogManagerService,
    private searchService: SearchReplaceService,
    private keyboardShortcuts: KeyboardShortcutsService,
    private pluginRegistry: PluginRegistryService,
  ) {
    console.log('[AuroraEditor] 🏗️ Constructor called - registering plugins EARLY');

    // ВАЖНО: Регистрируем плагины в constructor, чтобы они были доступны
    // до первого рендеринга template (который вызывает getter plugins)
    this.registerPlugins();

    // Effect для синхронизации disabled состояния с DOM
    effect(() => {
      const disabled = this.isDisabled();
      if (this.editorElementRef?.nativeElement) {
        this.editorElementRef.nativeElement.contentEditable = disabled ? 'false' : 'true';
      }
    });

    // Устанавливаем callback для открытия модального окна исходного кода
    this.sourceCodePlugin.onOpenModal = (html: string) => {
      this.openSourceCodeModal(html);
    };

    // Устанавливаем callback для открытия модального окна YouTube
    this.youtubePlugin.onOpenModal = () => {
      this.openYouTubeModal();
    };

    // Слушатель для открытия модального окна таблицы
    document.addEventListener('openTableModal', (event: any) => {
      this.openTableModal(event.detail.callback);
    });

    // Слушатель для открытия модального окна изображения
    document.addEventListener('openImageModal', (event: any) => {
      console.log('🔶 [AuroraEditor] openImageModal event received', event);
      this.openImageModal(event.detail.callback);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Инициализация компонента
   *
   * @remarks
   * - Инициализирует EditorService с DOM элементом
   * - Подписывается на изменения контента
   * - Обновляет character counter
   */
  ngOnInit(): void {
    console.log('[AuroraEditor] 🚀 ngOnInit() called - START');

    // Инициализация EditorService
    const element = this.editorElementRef.nativeElement;
    this.editorService.init(element, this.config);

    // Инициализация SearchReplaceService с элементом редактора
    this.searchService.setContentElement(element);

    // ═══════════════════════════════════════════════════════════════════════════
    // РЕГИСТРАЦИЯ ГОРЯЧИХ КЛАВИШ (плагины уже зарегистрированы в constructor)
    // ═══════════════════════════════════════════════════════════════════════════

    this.registerKeyboardShortcuts();

    // Инициализация всех плагинов через сервис
    console.log('[AuroraEditor] 🔧 Initializing plugins...');
    this.pluginRegistry.initializeAll();

    // Инициализируем массив плагинов
    this.plugins = this.pluginRegistry.getAllPlugins();
    console.log(`[AuroraEditor] ✅ Plugins initialized: ${this.plugins.length} plugins`);
    console.log(
      '[AuroraEditor] 📋 Plugin names:',
      this.plugins.map((p) => p.name),
    );

    // Подписка на изменения контента
    const contentSub = this.editorService.onContentChange$.subscribe(() => {
      // ВАЖНО: Используем innerHTML напрямую, БЕЗ санитизации
      // Санитизация будет выполнена только при финальном получении контента (getContent)
      const content = this.editorElementRef.nativeElement.innerHTML;
      this.updateCharacterCount(content);
      this.onChange(content);
    });

    this.subscriptions.add(contentSub);

    // Начальный подсчёт символов
    this.updateCharacterCount(element.textContent || '');

    console.log('[AuroraEditor] ✅ Component initialized - ngOnInit() END');
  }

  /**
   * После инициализации view - подключаем модальные окна к плагинам
   */
  ngAfterViewInit(): void {
    // Подключаем модальное окно к Link Preview плагину
    const linkPreviewPlugin = this.plugins.find((p) => p.name === 'linkPreview') as any;
    if (linkPreviewPlugin && this.linkPreviewModal) {
      linkPreviewPlugin.setModalComponent(this.linkPreviewModal);
    }

    // Подключаем модальное окно к Word Count плагину
    const wordCountPlugin = this.plugins.find((p) => p.name === 'wordCount') as any;
    if (wordCountPlugin && this.wordCountModal) {
      wordCountPlugin.setModalComponent(this.wordCountModal);
    }
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   *
   * @remarks
   * - Уничтожает все плагины через PluginRegistryService
   * - Очищает горячие клавиши
   * - Вызывает destroy() в EditorService
   * - Отписывается от всех Subject'ов
   */
  ngOnDestroy(): void {
    // Уничтожение всех плагинов через сервис
    this.pluginRegistry.destroyAll();

    // Очистка shortcuts
    this.keyboardShortcuts.clearAll();

    this.editorService.destroy();
    this.subscriptions.unsubscribe();
    console.log('[AuroraEditor] Component destroyed');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROL VALUE ACCESSOR METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Записывает значение в редактор (вызывается формой)
   *
   * @param value - HTML контент для установки
   *
   * @remarks
   * Используется Angular Forms API для установки значения извне.
   * Например: `formControl.setValue('<p>Hello</p>')`
   */
  writeValue(value: string): void {
    if (value !== undefined && value !== null) {
      this.editorService.setContent(value);
      this.updateCharacterCount(value);
    } else {
      // Если value пустое, очищаем редактор
      this.editorService.setContent('');
      this.updateCharacterCount('');
    }
    console.log('[AuroraEditor] writeValue called:', value?.substring(0, 50));
  }

  /**
   * Регистрирует callback для изменений (вызывается формой)
   *
   * @param fn - Callback функция
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Регистрирует callback для события touched (вызывается формой)
   *
   * @param fn - Callback функция
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Устанавливает disabled состояние (вызывается формой)
   *
   * @param isDisabled - true если редактор должен быть отключён
   *
   * @remarks
   * Используется формой для управления состоянием disabled.
   * Например: `formControl.disable()` или `formControl.enable()`
   */
  setDisabledState(isDisabled: boolean): void {
    this.editorService.setDisabled(isDisabled);
    console.log('[AuroraEditor] setDisabledState:', isDisabled);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Регистрация всех горячих клавиш редактора
   *
   * @remarks
   * Регистрирует 17 горячих клавиш для:
   * - Форматирования (Bold, Italic, Underline)
   * - Истории (Undo, Redo)
   * - Ссылок (Create Link, Remove Link)
   * - Якорей (Create Anchor, Remove Anchor, Link to Anchor)
   * - Цитат (Insert Quote - 2 версии, Create Quote Style)
   * - Выравнивания (Left, Center, Right, Justify)
   * - Вставки (Horizontal Rule)
   * - Утилит (Fullscreen)
   */
  private registerKeyboardShortcuts(): void {
    const editor = this.editorElementRef.nativeElement;

    // ═══════════════════════════════════════════════════════════════════════════
    // ФОРМАТИРОВАНИЕ
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'bold',
      key: 'b',
      ctrl: true,
      description: 'Жирный текст',
      category: 'format',
      action: () => this.editorService.execute('bold'),
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'italic',
      key: 'i',
      ctrl: true,
      description: 'Курсив',
      category: 'format',
      action: () => this.editorService.execute('italic'),
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'underline',
      key: 'u',
      ctrl: true,
      description: 'Подчёркивание',
      category: 'format',
      action: () => this.editorService.execute('underline'),
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ИСТОРИЯ
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'undo',
      key: 'z',
      ctrl: true,
      description: 'Отменить',
      category: 'history',
      action: () => this.editorService.undo(),
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'redo',
      key: 'y',
      ctrl: true,
      description: 'Вернуть',
      category: 'history',
      action: () => this.editorService.redo(),
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ССЫЛКИ
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'createLink',
      key: 'k',
      ctrl: true,
      description: 'Создать ссылку',
      category: 'link',
      action: () => {
        console.log('[AuroraEditor] Create link shortcut triggered');
        this.linkPlugin.execute(editor);
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'removeLink',
      key: 'K',
      ctrl: true,
      shift: true,
      description: 'Удалить ссылку',
      category: 'link',
      action: () => {
        console.log('[AuroraEditor] Remove link shortcut triggered');
        const unlinkPlugin = this.plugins.find((p) => p.name === 'unlink');
        if (unlinkPlugin) {
          unlinkPlugin.execute(editor);
        }
      },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ЯКОРЯ (ANCHORS)
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'createAnchor',
      key: 'a',
      ctrl: true,
      alt: true,
      description: 'Создать якорь',
      category: 'link',
      action: () => {
        console.log('[AuroraEditor] Create anchor shortcut triggered');
        const anchorPlugin = this.plugins.find((p) => p.name === 'anchor');
        if (anchorPlugin) {
          anchorPlugin.execute(editor);
        }
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'removeAnchor',
      key: 'A',
      ctrl: true,
      alt: true,
      shift: true,
      description: 'Удалить якорь',
      category: 'link',
      action: () => {
        console.log('[AuroraEditor] Remove anchor shortcut triggered');
        const removeAnchorPlugin = this.plugins.find((p) => p.name === 'removeAnchor');
        if (removeAnchorPlugin) {
          removeAnchorPlugin.execute(editor);
        }
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'linkToAnchor',
      key: 'A',
      ctrl: true,
      shift: true,
      description: 'Ссылка на якорь',
      category: 'link',
      action: () => {
        console.log('[AuroraEditor] Link to anchor shortcut triggered');
        const linkToAnchorPlugin = this.plugins.find((p) => p.name === 'linkToAnchor');
        if (linkToAnchorPlugin) {
          linkToAnchorPlugin.execute(editor);
        }
      },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ЦИТАТЫ
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'quote',
      key: 'Q',
      ctrl: true,
      shift: true,
      description: 'Вставить цитату',
      category: 'insert',
      action: () => {
        console.log('[AuroraEditor] Quote shortcut triggered (new version)');
        const quotePlugin = this.plugins.find((p) => p.name === 'quote');
        if (quotePlugin) {
          quotePlugin.execute(editor);
        }
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'insertQuote',
      key: 'I',
      ctrl: true,
      shift: true,
      description: 'Вставить цитату (базовая)',
      category: 'insert',
      action: () => {
        console.log('[AuroraEditor] Insert quote shortcut triggered (Ctrl+Shift+I)');
        const insertQuotePlugin = this.plugins.find((p) => p.name === 'insertQuote');
        if (insertQuotePlugin) {
          insertQuotePlugin.execute(editor);
        }
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'createQuoteStyle',
      key: 'S',
      ctrl: true,
      shift: true,
      description: 'Редактор стилей цитат',
      category: 'insert',
      action: () => {
        console.log('[AuroraEditor] Create Quote Style shortcut triggered (Ctrl+Shift+S)');
        const createQuoteStylePlugin = this.plugins.find((p) => p.name === 'createQuoteStyle');
        if (createQuoteStylePlugin) {
          createQuoteStylePlugin.execute(editor);
        }
      },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ВЫРАВНИВАНИЕ
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'alignLeft',
      key: 'L',
      ctrl: true,
      shift: true,
      description: 'Выравнивание по левому краю',
      category: 'format',
      action: () => {
        const alignLeftPlugin = this.plugins.find((p) => p.name === 'alignLeft');
        if (alignLeftPlugin) {
          alignLeftPlugin.execute(editor);
          this.updateActivePlugins();
        }
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'alignCenter',
      key: 'E',
      ctrl: true,
      shift: true,
      description: 'Выравнивание по центру',
      category: 'format',
      action: () => {
        const alignCenterPlugin = this.plugins.find((p) => p.name === 'alignCenter');
        if (alignCenterPlugin) {
          alignCenterPlugin.execute(editor);
          this.updateActivePlugins();
        }
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'alignRight',
      key: 'R',
      ctrl: true,
      shift: true,
      description: 'Выравнивание по правому краю',
      category: 'format',
      action: () => {
        const alignRightPlugin = this.plugins.find((p) => p.name === 'alignRight');
        if (alignRightPlugin) {
          alignRightPlugin.execute(editor);
          this.updateActivePlugins();
        }
      },
    });

    this.keyboardShortcuts.registerShortcut({
      id: 'alignJustify',
      key: 'J',
      ctrl: true,
      shift: true,
      description: 'Выравнивание по ширине',
      category: 'format',
      action: () => {
        const alignJustifyPlugin = this.plugins.find((p) => p.name === 'alignJustify');
        if (alignJustifyPlugin) {
          alignJustifyPlugin.execute(editor);
          this.updateActivePlugins();
        }
      },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ВСТАВКА
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'horizontalRule',
      key: 'H',
      ctrl: true,
      shift: true,
      description: 'Горизонтальная линия',
      category: 'insert',
      action: () => {
        const horizontalRulePlugin = this.plugins.find((p) => p.name === 'horizontalRule');
        if (horizontalRulePlugin) {
          horizontalRulePlugin.execute(editor);
        }
      },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // УТИЛИТЫ
    // ═══════════════════════════════════════════════════════════════════════════

    this.keyboardShortcuts.registerShortcut({
      id: 'fullscreen',
      key: 'F11',
      description: 'Полноэкранный режим',
      category: 'other',
      action: () => this.editorService.toggleFullscreen(),
    });

    console.log(
      `[AuroraEditor] Registered ${
        this.keyboardShortcuts.getShortcutsList().length
      } keyboard shortcuts`,
    );
  }

  /**
   * Регистрация всех плагинов редактора в PluginRegistryService
   *
   * @remarks
   * Регистрирует 40+ плагинов по категориям:
   * - Format: Bold, Italic, Underline, Strikethrough, Font Family, Font Size, etc.
   * - Block: Heading, Horizontal Rule
   * - List: Ordered List, Unordered List, Indent, Outdent
   * - Alignment: Left, Center, Right, Justify, Advanced
   * - Insert: Image, YouTube, Table, Emoji, Special Characters, etc.
   * - Link: Link, Unlink, Anchor, Remove Anchor, Link to Anchor
   * - History: Undo, Redo
   * - Search: Search Dialog, Find Replace
   * - Utility: Source Code, Word Count, Show Invisibles, Show Blocks
   */
  private registerPlugins(): void {
    console.log('[AuroraEditor] 🔧 registerPlugins() called - START');

    // Создаем LinkPlugin с зависимостями
    const linkPlugin = new LinkPlugin(this.appRef, this.injector);
    this.linkPlugin = linkPlugin;

    // Создаем AnchorPlugin с зависимостями
    const anchorPlugin = new AnchorPlugin(this.appRef, this.injector);

    // Создаем LinkToAnchorPlugin с зависимостями
    const linkToAnchorPlugin = new LinkToAnchorPlugin(this.appRef, this.injector);

    // Создаем старый InsertQuotePlugin (базовая версия)
    const insertQuotePlugin = new InsertQuotePlugin(this.appRef, this.injector);

    // Создаем QuotePlugin (новая версия с расширенным функционалом)
    const quotePlugin = new QuotePlugin();

    // Создаем CreateQuoteStylePlugin (редактор стилей цитат)
    const createQuoteStylePlugin = new CreateQuoteStylePlugin();

    // Регистрируем все плагины в сервисе с категориями
    this.pluginRegistry.registerMany([
      // ═════════════════════════════════════════════════════════════════════════
      // FORMAT PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      { plugin: new BoldPlugin(), category: 'format', description: 'Жирный текст' },
      { plugin: new ItalicPlugin(), category: 'format', description: 'Курсив' },
      { plugin: new UnderlinePlugin(), category: 'format', description: 'Подчёркивание' },
      { plugin: new StrikethroughPlugin(), category: 'format', description: 'Зачёркивание' },
      { plugin: new FontFamilyPlugin(), category: 'format', description: 'Выбор шрифта' },
      { plugin: new FontSizePlugin(), category: 'format', description: 'Размер шрифта' },
      { plugin: new LineHeightPlugin(), category: 'format', description: 'Межстрочный интервал' },
      { plugin: new TextColorPlugin(), category: 'format', description: 'Цвет текста' },
      {
        plugin: new BackgroundColorPlugin(),
        category: 'format',
        description: 'Цвет фона текста',
      },
      { plugin: new HighlightPlugin(), category: 'format', description: 'Маркер (highlighter)' },
      {
        plugin: new ClearFormattingPlugin(),
        category: 'format',
        description: 'Очистить форматирование',
      },
      {
        plugin: insertQuotePlugin,
        category: 'format',
        description: 'Вставить цитату (базовая)',
      },
      {
        plugin: quotePlugin,
        category: 'format',
        description: 'Вставить цитату (расширенная)',
      },
      {
        plugin: createQuoteStylePlugin,
        category: 'format',
        description: 'Редактор стилей цитат',
      },

      // ═════════════════════════════════════════════════════════════════════════
      // ALIGNMENT PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      {
        plugin: new AlignLeftPlugin(),
        category: 'alignment',
        description: 'Выравнивание по левому краю',
      },
      {
        plugin: new AlignCenterPlugin(),
        category: 'alignment',
        description: 'Выравнивание по центру',
      },
      {
        plugin: new AlignRightPlugin(),
        category: 'alignment',
        description: 'Выравнивание по правому краю',
      },
      {
        plugin: new AlignJustifyPlugin(),
        category: 'alignment',
        description: 'Выравнивание по ширине',
      },
      {
        plugin: new TextAlignmentAdvancedPlugin(),
        category: 'alignment',
        description: 'Расширенное выравнивание',
      },

      // ═════════════════════════════════════════════════════════════════════════
      // LIST PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      {
        plugin: new OrderedListPlugin(),
        category: 'list',
        description: 'Нумерованный список',
      },
      {
        plugin: new UnorderedListPlugin(),
        category: 'list',
        description: 'Маркированный список',
      },
      { plugin: new IndentPlugin(), category: 'list', description: 'Увеличить отступ' },
      { plugin: new OutdentPlugin(), category: 'list', description: 'Уменьшить отступ' },

      // ═════════════════════════════════════════════════════════════════════════
      // BLOCK PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      { plugin: new HeadingPlugin(), category: 'block', description: 'Заголовки H1-H6' },
      {
        plugin: new HorizontalRulePlugin(),
        category: 'block',
        description: 'Горизонтальная линия',
      },

      // ═════════════════════════════════════════════════════════════════════════
      // INSERT PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      {
        plugin: new NonBreakingSpacePlugin(),
        category: 'insert',
        description: 'Неразрывный пробел',
      },
      {
        plugin: new SpecialCharactersPlugin(),
        category: 'insert',
        description: 'Специальные символы',
      },
      { plugin: new EmojiPlugin(), category: 'insert', description: 'Эмодзи пикер' },
      { plugin: new FootnotesPlugin(), category: 'insert', description: 'Сноски (footnotes)' },
      { plugin: new TablePlugin(), category: 'insert', description: 'Таблицы' },
      { plugin: new ImagePlugin(), category: 'insert', description: 'Изображения' },
      { plugin: this.youtubePlugin, category: 'insert', description: 'YouTube видео' },
      {
        plugin: new LinkPreviewPlugin(),
        category: 'insert',
        description: 'Превью ссылок (карточки)',
      },

      // ═════════════════════════════════════════════════════════════════════════
      // LINK PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      { plugin: linkPlugin, category: 'link', description: 'Создать ссылку' },
      { plugin: new UnlinkPlugin(), category: 'link', description: 'Удалить ссылку' },
      { plugin: anchorPlugin, category: 'link', description: 'Создать якорь' },
      { plugin: new RemoveAnchorPlugin(), category: 'link', description: 'Удалить якорь' },
      { plugin: linkToAnchorPlugin, category: 'link', description: 'Ссылка на якорь' },

      // ═════════════════════════════════════════════════════════════════════════
      // HISTORY PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      { plugin: new UndoPlugin(), category: 'history', description: 'Отменить' },
      { plugin: new RedoPlugin(), category: 'history', description: 'Вернуть' },

      // ═════════════════════════════════════════════════════════════════════════
      // SEARCH PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      { plugin: new SearchDialogPlugin(), category: 'search', description: 'Поиск' },
      { plugin: new FindReplacePlugin(), category: 'search', description: 'Поиск и замена' },

      // ═════════════════════════════════════════════════════════════════════════
      // UTILITY PLUGINS
      // ═════════════════════════════════════════════════════════════════════════
      {
        plugin: new ShowInvisiblesPlugin(),
        category: 'utility',
        description: 'Показать невидимые символы',
      },
      { plugin: new ShowBlocksPlugin(), category: 'utility', description: 'Показать блоки' },
      {
        plugin: new WordCountPlugin(),
        category: 'utility',
        description: 'Статистика текста (подсчёт слов)',
      },
      {
        plugin: this.sourceCodePlugin,
        category: 'utility',
        description: 'Исходный код (HTML/SCSS)',
      },
    ]);

    console.log(`[AuroraEditor] ✅ Registered ${this.pluginRegistry.count()} plugins in registry`);

    // Выводим статистику по категориям
    const stats = this.pluginRegistry.getCategoryStats();
    console.log('[AuroraEditor] 📊 Plugin stats by category:', stats);

    // Проверяем что плагины доступны через getter
    const pluginsFromGetter = this.plugins;
    console.log(`[AuroraEditor] 🔍 Plugins accessible via getter: ${pluginsFromGetter.length}`);
    console.log('[AuroraEditor] 🔧 registerPlugins() called - END');
  }

  /**
   * Обработчик события input
   *
   * @remarks
   * - Проверяет и нормализует пустой contenteditable
   * - Запускает debounce для создания snapshot
   * - Обновляет character counter
   */
  onInput(): void {
    this.editorService.checkAndNormalizeEmpty();
    this.editorService.triggerInputDebounce();

    const content = this.editorElementRef.nativeElement.textContent || '';
    this.updateCharacterCount(content);
  }

  /**
   * Обработчик события keydown
   *
   * @param event - Клавиатурное событие
   *
   * @remarks
   * Делегирует обработку горячих клавиш в KeyboardShortcutsService
   */
  onKeyDown(event: KeyboardEvent): void {
    this.keyboardShortcuts.handleKeydown(event, this.editorElementRef.nativeElement);
  }

  /**
   * Обработчик события paste
   *
   * @param event - Событие вставки
   *
   * @remarks
   * - Перехватывает вставку из буфера обмена
   * - Очищает HTML через fullSanitize()
   * - Вставляет только безопасный контент
   */
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    // Получаем HTML из буфера обмена
    const clipboardData = event.clipboardData;
    if (!clipboardData) {
      return;
    }

    let pastedHtml = clipboardData.getData('text/html');

    // Если HTML пустой, пытаемся взять plain text
    if (!pastedHtml) {
      const pastedText = clipboardData.getData('text/plain');
      if (pastedText) {
        // Экранируем спецсимволы и заменяем переносы на <br>
        pastedHtml = pastedText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
      }
    }

    if (!pastedHtml) {
      return;
    }

    // Санитизация через EditorService (который использует fullSanitize)
    const sanitizedHtml = this.editorService['fullSanitize'](pastedHtml);

    // Вставка через execCommand для сохранения истории
    document.execCommand('insertHTML', false, sanitizedHtml);

    // Создание snapshot после вставки
    setTimeout(() => {
      this.editorService['pushSnapshot']();
    }, 0);

    console.log('[AuroraEditor] Paste handled', {
      original: pastedHtml.substring(0, 100),
      sanitized: sanitizedHtml.substring(0, 100),
    });
  }

  /**
   * Обработчик события blur
   *
   * @remarks
   * Вызывает callback onTouched для интеграции с формами
   */
  onBlur(): void {
    this.onTouched();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Обновляет счётчик символов
   *
   * @param content - Текстовое содержимое редактора
   *
   * @remarks
   * Использует textContent для подсчёта реальных символов (без HTML тегов)
   */
  private updateCharacterCount(content: string): void {
    // Создаём временный элемент для извлечения текста без HTML
    const temp = document.createElement('div');
    temp.innerHTML = content;
    const textContent = temp.textContent || temp.innerText || '';
    this.characterCount.set(textContent.length);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLUGIN METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Обработчик клика на кнопку плагина в тулбаре
   *
   * @param plugin - Плагин для выполнения
   */
  onToolbarButtonClick(plugin: AuroraPlugin): void {
    console.log('[AuroraEditor] Toolbar button clicked:', plugin.name);

    // Выполняем плагин
    const success = plugin.execute(this.editorElementRef.nativeElement);

    if (success) {
      // Обновляем список активных плагинов
      this.updateActivePlugins();

      // Создаём snapshot для undo/redo
      setTimeout(() => {
        this.editorService['pushSnapshot']();
      }, 0);

      // Триггерим onChange для формы
      const content = this.editorService.getContent();
      this.onChange(content);
    }
  }

  /**
   * Обновляет список активных плагинов
   * (вызывается после каждого действия для подсветки кнопок)
   */
  /**
   * Обновить список активных плагинов (для подсветки кнопок в toolbar)
   *
   * @remarks
   * Делегирует получение активных плагинов в PluginRegistryService
   */
  updateActivePlugins(): void {
    const active = this.pluginRegistry.getActivePlugins(this.editorElementRef.nativeElement);
    this.activePlugins.set(active);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOURCE CODE MODAL METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Открыть модальное окно с исходным кодом
   *
   * @param html - HTML-код для отображения
   */
  openSourceCodeModal(html: string): void {
    if (this.sourceCodeModal) {
      this.sourceCodeModal.open(html, this.customScss);
    } else {
      console.warn('[AuroraEditor] Source code modal not available');
    }
  }

  /**
   * Открыть модальное окно YouTube
   */
  openYouTubeModal(): void {
    console.log('[AuroraEditor] Opening YouTube modal and saving cursor position');
    const editorElement = this.editorElementRef.nativeElement;
    editorElement.focus();

    // Сохраняем текущую позицию курсора
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Проверяем, что курсор внутри редактора
      if (editorElement.contains(range.startContainer)) {
        this.savedYouTubeRange = range.cloneRange();
        console.log('[AuroraEditor] ✅ Cursor position saved:', {
          startContainer: range.startContainer.nodeName,
          startOffset: range.startOffset,
        });
      } else {
        console.log('[AuroraEditor] ⚠️ Cursor outside editor - will insert at end');
        this.savedYouTubeRange = null;
      }
    } else {
      console.log('[AuroraEditor] ⚠️ No selection - will insert at end');
      this.savedYouTubeRange = null;
    }

    // Открываем модальное окно
    if (this.youtubeModal) {
      this.youtubeModal.open();
    } else {
      console.warn('[AuroraEditor] YouTube modal not available');
    }
  }

  /**
   * Открыть модальное окно таблицы
   */
  openTableModal(callback: (config: any) => void): void {
    console.log('[AuroraEditor] Opening Table modal');

    if (this.tableModal) {
      // Открываем модальное окно
      this.tableModal.open();

      // Подписываемся на событие подтверждения
      const subscription = this.tableModal.confirmed.subscribe((config) => {
        callback(config);
        subscription.unsubscribe();
      });
    } else {
      console.warn('[AuroraEditor] Table modal not available');
    }
  }

  /**
   * Открыть модальное окно изображения
   */
  openImageModal(callback: (config: any, imageUrl: string) => void): void {
    console.log('🔶 [AuroraEditor] Opening Image modal');
    console.log('🔶 [AuroraEditor] imageModal exists:', !!this.imageModal);

    if (this.imageModal) {
      // Открываем модальное окно
      console.log('🔶 [AuroraEditor] Calling imageModal.open()');
      this.imageModal.open();

      // Подписываемся на событие выбора изображения
      const subscription = this.imageModal.imageSelected.subscribe(({ config, imageUrl }) => {
        console.log('🔶 [AuroraEditor] Image selected event received');
        callback(config, imageUrl);
        subscription.unsubscribe();
      });
    } else {
      console.warn('⚠️ [AuroraEditor] Image modal not available');
    }
  }

  /**
   * Обработчик применения изменений из модального окна
   *
   * @param newHtml - Новый HTML-код
   */
  onSourceCodeApply(newHtml: string): void {
    console.log('[AuroraEditor] Applying source code changes');

    // Устанавливаем новый HTML через EditorService
    this.editorService.setContent(newHtml);

    // Создаём snapshot для undo/redo
    setTimeout(() => {
      this.editorService['pushSnapshot']();
    }, 0);

    // Триггерим onChange для формы
    this.onChange(newHtml);

    // Обновляем character counter
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    const textContent = temp.textContent || temp.innerText || '';
    this.characterCount.set(textContent.length);
  }

  /**
   * Обработчик отмены изменений в модальном окне
   */
  onSourceCodeCancel(): void {
    console.log('[AuroraEditor] Source code changes cancelled');
  }

  /**
   * Обработчик сохранения (без закрытия модального окна)
   *
   * @param newHtml - Новый HTML-код
   */
  onSourceCodeSave(newHtml: string): void {
    console.log('[AuroraEditor] Saving source code (modal remains open)');

    // Устанавливаем новый HTML через EditorService
    this.editorService.setContent(newHtml);

    // Создаём snapshot для undo/redo
    setTimeout(() => {
      this.editorService['pushSnapshot']();
    }, 0);

    // Триггерим onChange для формы
    this.onChange(newHtml);

    // Обновляем character counter
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    const textContent = temp.textContent || temp.innerText || '';
    this.characterCount.set(textContent.length);
  }

  /**
   * Обработчик сохранения SCSS стилей
   *
   * @param newScss - Новый SCSS-код
   */
  onScssCodeSave(newScss: string): void {
    console.log('═══════════════════════════════════════════════════');
    console.log('[AuroraEditor] 🎨 SCSS Save triggered!');
    console.log('[AuroraEditor] SCSS length:', newScss.length);
    console.log('[AuroraEditor] SCSS content:', newScss);
    console.log('═══════════════════════════════════════════════════');

    // Сохраняем SCSS
    this.customScss = newScss;

    // Применяем стили динамически
    this.applyCustomStyles(newScss);
  }

  /**
   * Обработчик вставки YouTube видео
   * Оптимизированная версия без отладочного кода
   */
  onYouTubeInsert(settings: any): void {
    const T_START = performance.now();
    console.log('⏱️  [YouTubeInsert] START:', new Date().toISOString());

    // Валидация настроек
    if (!settings || !settings.videoId) {
      console.error('[YouTubeInsert] Invalid settings - missing videoId');
      return;
    }

    const editorElement = this.editorElementRef.nativeElement;

    // Создаём контейнер для видео
    const container = document.createElement('div');
    container.className = 'youtube-video-container';
    container.setAttribute('data-youtube-id', settings.videoId);

    // Применяем выравнивание
    if (settings.alignment === 'center') {
      container.style.textAlign = 'center';
      container.style.margin = '0 auto';
    } else if (settings.alignment === 'right') {
      container.style.textAlign = 'right';
      container.style.marginLeft = 'auto';
    } else if (settings.alignment === 'left') {
      container.style.textAlign = 'left';
      container.style.marginRight = 'auto';
    }

    // Создаём iframe
    const iframe = document.createElement('iframe');
    const embedUrl = `https://www.youtube.com/embed/${settings.videoId}`;
    iframe.src = embedUrl;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    );

    // Добавляем заголовок (если указан)
    if (settings.title && settings.title.trim()) {
      const titleElement = document.createElement('h3');
      titleElement.textContent = settings.title;
      titleElement.style.marginTop = '0';
      titleElement.style.marginBottom = '12px';
      titleElement.style.fontSize = '18px';
      titleElement.style.fontWeight = '600';
      container.appendChild(titleElement);
    }

    // Настраиваем размеры iframe
    const width = settings.width || 560;
    const height = settings.height || 315;
    iframe.width = width.toString();
    iframe.height = height.toString();

    // Адаптивный или фиксированный режим
    if (settings.responsive) {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.paddingBottom = '56.25%'; // 16:9
      wrapper.style.height = '0';
      wrapper.style.overflow = 'hidden';

      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';

      wrapper.appendChild(iframe);
      container.appendChild(wrapper);
    } else {
      container.appendChild(iframe);
    }

    // Добавляем подпись (если указана)
    if (settings.caption && settings.caption.trim()) {
      const captionElement = document.createElement('p');
      captionElement.textContent = settings.caption;
      captionElement.style.marginTop = '12px';
      captionElement.style.marginBottom = '0';
      captionElement.style.fontSize = '14px';
      captionElement.style.color = '#666';
      captionElement.style.fontStyle = 'italic';
      container.appendChild(captionElement);
    }

    // Восстанавливаем сохранённую позицию курсора и вставляем
    const selection = window.getSelection();
    let inserted = false;

    if (this.savedYouTubeRange && selection) {
      selection.removeAllRanges();
      selection.addRange(this.savedYouTubeRange);
      const range = selection.getRangeAt(0);

      if (editorElement.contains(range.startContainer)) {
        range.insertNode(container);

        // Создаём параграф после видео
        const nextP = document.createElement('p');
        nextP.innerHTML = '<br>';
        container.insertAdjacentElement('afterend', nextP);

        // Перемещаем курсор в новый параграф
        const newRange = document.createRange();
        newRange.setStart(nextP, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        inserted = true;
      }
    }

    // Если нет сохранённой позиции - вставляем в конец
    if (!inserted) {
      editorElement.appendChild(container);
      const nextP = document.createElement('p');
      nextP.innerHTML = '<br>';
      editorElement.appendChild(nextP);

      if (selection) {
        const newRange = document.createRange();
        newRange.setStart(nextP, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    // Очищаем сохранённую позицию
    this.savedYouTubeRange = null;

    // Фокусируем редактор
    editorElement.focus();

    const T_BEFORE_INPUT = performance.now();
    console.log(
      '⏱️  [YouTubeInsert] Before input event:',
      (T_BEFORE_INPUT - T_START).toFixed(2),
      'ms',
    );

    // Триггерим событие input для обновления состояния
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));

    const T_AFTER_INPUT = performance.now();
    console.log(
      '⏱️  [YouTubeInsert] After input event:',
      (T_AFTER_INPUT - T_BEFORE_INPUT).toFixed(2),
      'ms',
    );

    // Создаём snapshot для undo/redo (сразу, без задержки)
    this.editorService['pushSnapshot']();

    const T_END = performance.now();
    console.log('✅ [YouTubeInsert] COMPLETED in', (T_END - T_START).toFixed(2), 'ms');
    console.log('⏱️  [YouTubeInsert] END:', new Date().toISOString());
  }

  /**
   * Динамическая инъекция SCSS стилей в редактор
   *
   * @param scss - SCSS код для применения
   */
  private applyCustomStyles(scss: string): void {
    console.log('[AuroraEditor] 📝 Starting applyCustomStyles...');
    console.log('[AuroraEditor] Input SCSS:', scss);

    try {
      // Преобразуем SCSS в обычный CSS (упрощённо, без полноценного парсера)
      const css = this.convertScssToBasicCss(scss);
      console.log('[AuroraEditor] 🔄 Converted CSS:', css);

      // Создаём или обновляем элемент <style>
      if (!this.customStyleElement) {
        this.customStyleElement = document.createElement('style');
        this.customStyleElement.id = 'aurora-editor-custom-styles';
        document.head.appendChild(this.customStyleElement);
        console.log('[AuroraEditor] ✅ Created new <style> element in <head>');
      } else {
        console.log('[AuroraEditor] ♻️ Updating existing <style> element');
      }

      // Применяем стили
      this.customStyleElement.textContent = css;
      console.log('[AuroraEditor] ✨ Custom styles applied successfully!');
      console.log(
        '[AuroraEditor] Check DevTools → Elements → <head> → #aurora-editor-custom-styles',
      );
    } catch (error) {
      console.error('[AuroraEditor] ❌ Failed to apply custom styles:', error);
    }
  }

  /**
   * Простое преобразование SCSS в CSS
   * (без полноценного компилятора, только базовые возможности)
   *
   * @param scss - SCSS код
   * @returns CSS код
   */
  private convertScssToBasicCss(scss: string): string {
    console.log('[convertScssToBasicCss] 🔧 Starting conversion...');
    let css = scss;

    // Убираем комментарии //
    css = css.replace(/\/\/[^\n]*/g, '');
    console.log('[convertScssToBasicCss] Step 1: Removed // comments');

    // Убираем переменные SCSS (заменяем на значения по умолчанию)
    // Для демо - просто удаляем строки с переменными
    css = css.replace(/\$[a-z0-9_-]+\s*:\s*[^;]+;/gi, '');
    console.log('[convertScssToBasicCss] Step 2: Removed SCSS variables');

    // Раскрываем вложенные селекторы (упрощённо)
    // Это базовая реализация, для полноценной нужен парсер

    // Убираем пустые строки
    css = css.replace(/^\s*[\r\n]/gm, '');
    console.log('[convertScssToBasicCss] Step 3: Removed empty lines');

    // Добавляем префикс для всех селекторов, чтобы стили применялись только к редактору
    css = css.replace(/([^{}]+)(\{[^}]*\})/g, (match, selector, rules) => {
      const trimmedSelector = selector.trim();

      // Пропускаем @-правила
      if (trimmedSelector.startsWith('@')) {
        return match;
      }

      // Добавляем префикс .aurora-editor к селекторам
      const prefixedSelector = trimmedSelector
        .split(',')
        .map((s: string) => {
          s = s.trim();
          if (s.startsWith('.aurora-editor')) {
            return s;
          }
          return `.aurora-editor ${s}`;
        })
        .join(', ');

      console.log(
        `[convertScssToBasicCss] 🎯 Prefixed: "${trimmedSelector}" → "${prefixedSelector}"`,
      );
      return `${prefixedSelector} ${rules}`;
    });

    console.log('[convertScssToBasicCss] ✅ Conversion complete!');
    console.log('[convertScssToBasicCss] Final CSS:', css);
    return css;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH PANEL HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Обработчик изменения видимости панели поиска
   */
  onSearchPanelVisibleChange(visible: boolean): void {
    if (!visible) {
      this.dialogManager.closeSearchDialog();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LINK PREVIEW HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Обработчик вставки превью ссылки из модального окна
   */
  onLinkPreviewInsert(data: { url: string; size: string }): void {
    console.log('[AuroraEditor] Link preview insert:', data);

    // Получаем плагин Link Preview
    const linkPreviewPlugin = this.plugins.find((p) => p.name === 'linkPreview');
    if (!linkPreviewPlugin) {
      console.error('[AuroraEditor] Link Preview plugin not found');
      return;
    }

    // Выполняем плагин с переданными параметрами
    const editorElement = this.editorElementRef.nativeElement;
    linkPreviewPlugin.execute(editorElement, {
      url: data.url,
      size: data.size as any,
    });
  }
}
