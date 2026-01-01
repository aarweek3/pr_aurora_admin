/**
 * CreateQuoteStylePlugin - Плагин для создания кастомных стилей цитат
 *
 * @module CreateQuoteStylePlugin
 * @description
 * Плагин открывает визуальный редактор стилей цитат напрямую из тулбара,
 * позволяя создавать кастомные стили без необходимости вставлять цитату.
 *
 * Особенности:
 * - Отдельная кнопка в тулбаре (🎨 палитра)
 * - Горячая клавиша Ctrl+Shift+S
 * - Переиспользует BlockquoteStyleEditor
 * - Интегрирован с BlockquoteStylesService
 * - Стили автоматически доступны в Quote плагине
 *
 * @example
 * ```typescript
 * const plugin = new CreateQuoteStylePlugin();
 * plugin.init();
 * plugin.execute(editorElement);
 * ```
 */

import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { AuroraPlugin } from '../aurora-plugin.interface';
import { BlockquoteStyleEditorComponent } from '../quote/modals/blockquote-style-editor/blockquote-style-editor.component';
import {
  CreateQuoteStylePluginConfig,
  DEFAULT_CREATE_QUOTE_STYLE_CONFIG,
} from './create-quote-style.config';

/**
 * Плагин для создания кастомных стилей цитат
 */
export class CreateQuoteStylePlugin implements AuroraPlugin {
  // Конфигурация плагина
  public readonly config: CreateQuoteStylePluginConfig;

  // Публичные свойства для интерфейса AuroraPlugin
  public readonly id: string;
  public readonly name: string;
  public readonly title: string;
  public readonly description: string;
  public readonly icon: string;
  public readonly hotkey: string;
  public readonly shortcut?: string;

  // Angular сервисы
  private platformId = inject(PLATFORM_ID);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Ссылка на открытый редактор стилей
  private styleEditorRef: ComponentRef<BlockquoteStyleEditorComponent> | null = null;

  /**
   * Конструктор плагина
   * @param customConfig - Пользовательская конфигурация (опционально)
   */
  constructor(customConfig?: Partial<CreateQuoteStylePluginConfig>) {
    this.config = { ...DEFAULT_CREATE_QUOTE_STYLE_CONFIG, ...customConfig };
    this.id = this.config.id;
    this.name = this.config.name;
    this.title = 'Создать стиль цитаты';
    this.description = this.config.description;
    this.icon = this.config.icon;
    this.hotkey = this.config.hotkey;
    this.shortcut = this.config.hotkey;

    if (this.config.debug) {
      console.log('[CreateQuoteStylePlugin] Initialized with config:', this.config);
    }
  }

  /**
   * Инициализация плагина
   * Вызывается при регистрации плагина в редакторе
   */
  init(): void {
    if (!this.isBrowser) return;

    if (this.config.debug) {
      console.log('[CreateQuoteStylePlugin] init() called');
    }
  }

  /**
   * Выполнение команды плагина
   * Вызывается при клике на кнопку в тулбаре или нажатии горячей клавиши
   *
   * @param editorElement - Элемент редактора (не используется, но требуется интерфейсом)
   * @param options - Опции выполнения
   * @returns true если команда выполнена успешно
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    if (!this.isBrowser) return false;

    if (this.config.debug) {
      console.log('[CreateQuoteStylePlugin] execute() called');
    }

    this.openStyleEditor();
    return true;
  }

  /**
   * Проверяет, активен ли плагин в данный момент
   * (для подсветки кнопки в тулбаре)
   *
   * @param editorElement - Элемент редактора
   * @returns false - плагин не имеет активного состояния
   */
  isActive(editorElement: HTMLElement): boolean {
    // Плагин создания стилей не имеет активного состояния
    return false;
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    if (this.config.debug) {
      console.log('[CreateQuoteStylePlugin] destroy() called');
    }

    // Закрываем редактор, если он открыт
    this.closeStyleEditor();
  }

  // ═══════════════════════════════════════════════════════════════
  // ПРИВАТНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════════════

  /**
   * Открывает редактор стилей цитат
   * @private
   */
  private openStyleEditor(): void {
    if (this.styleEditorRef) {
      // Редактор уже открыт
      if (this.config.debug) {
        console.log('[CreateQuoteStylePlugin] Style editor already open');
      }
      return;
    }

    if (this.config.debug) {
      console.log('[CreateQuoteStylePlugin] Opening style editor...');
    }

    try {
      // Создаем компонент динамически
      this.styleEditorRef = createComponent(BlockquoteStyleEditorComponent, {
        environmentInjector: this.injector,
      });

      const editorInstance = this.styleEditorRef.instance;

      // Подписываемся на событие сохранения
      const saveSub = editorInstance.onSave.subscribe(() => {
        if (this.config.debug) {
          console.log('[CreateQuoteStylePlugin] Style saved');
        }
        this.closeStyleEditor();
      });

      // Подписываемся на событие отмены
      const cancelSub = editorInstance.onCancel.subscribe(() => {
        if (this.config.debug) {
          console.log('[CreateQuoteStylePlugin] Style editor cancelled');
        }
        this.closeStyleEditor();
      });

      // Добавляем в DOM
      document.body.appendChild(this.styleEditorRef.location.nativeElement);
      this.appRef.attachView(this.styleEditorRef.hostView);

      if (this.config.debug) {
        console.log('[CreateQuoteStylePlugin] Component added to DOM');
      }

      // Ждём следующий тик для инициализации ViewChild
      setTimeout(() => {
        if (this.config.debug) {
          console.log('[CreateQuoteStylePlugin] Calling openNew()...');
        }

        // Открываем редактор в режиме создания нового стиля
        editorInstance.openNew();

        if (this.config.debug) {
          console.log('[CreateQuoteStylePlugin] Style editor opened');
        }
      }, 0);
    } catch (error) {
      console.error('[CreateQuoteStylePlugin] Error opening style editor:', error);
      this.styleEditorRef = null;
    }
  }
  /**
   * Закрывает редактор стилей цитат
   * @private
   */
  private closeStyleEditor(): void {
    if (!this.styleEditorRef) return;

    if (this.config.debug) {
      console.log('[CreateQuoteStylePlugin] Closing style editor...');
    }

    // Удаляем компонент из DOM
    this.appRef.detachView(this.styleEditorRef.hostView);
    this.styleEditorRef.destroy();
    this.styleEditorRef = null;

    if (this.config.debug) {
      console.log('[CreateQuoteStylePlugin] Style editor closed');
    }
  }
}
