/**
 * Плагин "Создать стиль цитаты"
 *
 * Предоставляет быстрый доступ к редактору стилей цитат из панели инструментов.
 * Открывает BlockquoteStyleEditor в режиме создания нового стиля.
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
import { CREATE_QUOTE_STYLE_CONFIG } from './create-quote-style.config';
import { BlockquoteStyleEditorComponent } from './modals/blockquote-style-editor/blockquote-style-editor.component';

export class CreateQuoteStylePlugin implements AuroraPlugin {
  id = CREATE_QUOTE_STYLE_CONFIG['id'];
  name = CREATE_QUOTE_STYLE_CONFIG['name'];
  title = 'Создать стиль цитаты';
  category = CREATE_QUOTE_STYLE_CONFIG['category'];
  description = CREATE_QUOTE_STYLE_CONFIG['description'];
  icon = CREATE_QUOTE_STYLE_CONFIG['icon'];
  hotkey = CREATE_QUOTE_STYLE_CONFIG['hotkey'];
  showInToolbar = CREATE_QUOTE_STYLE_CONFIG['showInToolbar'];
  toolbarOrder = CREATE_QUOTE_STYLE_CONFIG['toolbarOrder'];
  requiresSelection = CREATE_QUOTE_STYLE_CONFIG['requiresSelection'];
  preservesContent = CREATE_QUOTE_STYLE_CONFIG['preservesContent'];

  // Сервисы
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private platformId = inject(PLATFORM_ID);

  // Ссылка на компонент редактора
  private styleEditorRef: ComponentRef<BlockquoteStyleEditorComponent> | null = null;

  constructor() {
    console.log('[CreateQuoteStylePlugin] Initialized');
  }

  /**
   * Проверка, что код выполняется в браузере
   */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Выполнить плагин: открыть редактор стилей
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    console.log('[CreateQuoteStylePlugin] Execute called');

    if (!this.isBrowser) {
      console.warn('[CreateQuoteStylePlugin] Not running in browser environment');
      return false;
    }

    // Открываем редактор стилей в режиме создания
    this.openStyleEditor();
    return true;
  }

  /**
   * Открыть редактор стилей в режиме создания нового стиля
   */
  private openStyleEditor(): void {
    // Если редактор уже открыт, не открываем второй раз
    if (this.styleEditorRef) {
      console.warn('[CreateQuoteStylePlugin] Style editor already open');
      return;
    }

    console.log('[CreateQuoteStylePlugin] Opening style editor');

    // Создаем компонент динамически
    this.styleEditorRef = createComponent(BlockquoteStyleEditorComponent, {
      environmentInjector: this.injector,
    });

    const editorInstance = this.styleEditorRef.instance;

    // Подписываемся на события
    editorInstance.onSave.subscribe((style) => {
      console.log('[CreateQuoteStylePlugin] Style created:', style);
      this.closeStyleEditor();
    });

    editorInstance.onCancel.subscribe(() => {
      console.log('[CreateQuoteStylePlugin] Style editor cancelled');
      this.closeStyleEditor();
    });

    // Добавляем в DOM
    document.body.appendChild(this.styleEditorRef.location.nativeElement);
    this.appRef.attachView(this.styleEditorRef.hostView);

    // Открываем в режиме создания нового стиля
    editorInstance.openNew();
  }

  /**
   * Закрыть редактор стилей
   */
  private closeStyleEditor(): void {
    if (!this.styleEditorRef) {
      return;
    }

    console.log('[CreateQuoteStylePlugin] Closing style editor');

    // Удаляем из DOM и уничтожаем компонент
    this.appRef.detachView(this.styleEditorRef.hostView);
    this.styleEditorRef.destroy();
    this.styleEditorRef = null;
  }

  /**
   * Проверить, активен ли плагин (всегда false для этого плагина)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Очистка ресурсов при уничтожении плагина
   */
  destroy(): void {
    console.log('[CreateQuoteStylePlugin] Destroy called');
    this.closeStyleEditor();
  }
}
