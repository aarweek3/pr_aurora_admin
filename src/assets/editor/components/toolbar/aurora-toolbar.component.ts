/**
 * ════════════════════════════════════════════════════════════════════════════
 * AURORA TOOLBAR COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Компонент панели инструментов (toolbar) для Aurora Editor.
 * Содержит кнопки для форматирования текста.
 *
 * @module AuroraToolbarComponent
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuroraPlugin } from '../../plugins/aurora-plugin.interface';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';

/**
 * Интерфейс для кнопки тулбара
 */
export interface ToolbarButton {
  plugin: AuroraPlugin;
  isActive: boolean;
}

/**
 * Компонент панели инструментов
 */
@Component({
  selector: 'aurora-toolbar',
  standalone: true,
  imports: [CommonModule, EmojiPickerComponent],
  templateUrl: './aurora-toolbar.component.html',
  styleUrl: './aurora-toolbar.component.scss',
})
export class AuroraToolbarComponent {
  private sanitizer = inject(DomSanitizer);

  getSafeHtml(html: string | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }
  /**
   * Список плагинов для отображения в тулбаре
   */
  @Input()
  set plugins(value: AuroraPlugin[]) {
    console.log(
      `[AuroraToolbar] 📋 Received plugins: ${value?.length || 0}`,
      value?.map((p) => p.name),
    );
    this._plugins = value || [];
  }
  get plugins(): AuroraPlugin[] {
    return this._plugins;
  }
  private _plugins: AuroraPlugin[] = [];

  /**
   * Список активных плагинов (для подсветки кнопок)
   */
  @Input() activePlugins: string[] = [];

  /**
   * Элемент редактора (для проверки активности плагинов)
   */
  @Input() editorElement!: HTMLElement;

  /**
   * Событие клика на кнопку
   */
  @Output() buttonClick = new EventEmitter<AuroraPlugin>();

  /**
   * Открытый dropdown (если есть)
   */
  openDropdown: string | null = null;

  /**
   * Выбранное значение для Font Family
   */
  selectedFontFamily = '';

  /**
   * Выбранное значение для Font Size
   */
  selectedFontSize = '';

  /**
   * Сохранённый Range для восстановления выделения после клика на dropdown
   */
  private savedRange: Range | null = null;

  /**
   * Плагины форматирования (Bold, Italic, Underline, Strikethrough, FontFamily, FontSize, LineHeight, TextColor, BackgroundColor, ClearFormatting, Quote)
   */
  get formatPlugins(): AuroraPlugin[] {
    const filtered = this.plugins.filter(
      (p) =>
        p.name === 'bold' ||
        p.name === 'italic' ||
        p.name === 'underline' ||
        p.name === 'strikethrough' ||
        p.name === 'fontFamily' ||
        p.name === 'fontSize' ||
        p.name === 'lineHeight' ||
        p.name === 'textColor' ||
        p.name === 'backgroundColor' ||
        p.name === 'highlight' || // Маркер (highlighter)
        p.name === 'clearFormatting' || // Очистить форматирование
        p.name === 'textAlignmentAdvanced' || // Расширенное выравнивание
        p.name === 'insertQuote' || // Старый плагин цитат (базовая версия)
        p.name === 'quote' || // Новый плагин Quote (расширенный функционал)
        p.name === 'createQuoteStyle', // Плагин создания стилей цитат 🎨
    );

    return filtered;
  }

  /**
   * Плагины списков (Ordered, Unordered)
   */
  get listPlugins(): AuroraPlugin[] {
    return this.plugins.filter((p) => p.name === 'orderedList' || p.name === 'unorderedList');
  }

  /**
   * Плагины выравнивания (Left, Center, Right, Justify)
   */
  get alignmentPlugins(): AuroraPlugin[] {
    return this.plugins.filter(
      (p) =>
        p.name === 'alignLeft' ||
        p.name === 'alignCenter' ||
        p.name === 'alignRight' ||
        p.name === 'alignJustify',
    );
  }

  /**
   * Плагины отступов (Indent, Outdent)
   */
  get indentPlugins(): AuroraPlugin[] {
    return this.plugins.filter((p) => p.name === 'indent' || p.name === 'outdent');
  }

  /**
   * Плагины блоков (Block - заголовки, параграфы)
   */
  get blockPlugins(): AuroraPlugin[] {
    return this.plugins.filter((p) => p.name === 'heading' || p.name === 'block');
  }

  /**
   * Плагины вставки (Insert - ссылки, изображения, якоря, горизонтальная линия, неразрывный пробел, специальные символы, YouTube)
   */
  get insertPlugins(): AuroraPlugin[] {
    return this.plugins.filter(
      (p) =>
        p.name === 'link' ||
        p.name === 'unlink' ||
        p.name === 'anchor' ||
        p.name === 'removeAnchor' ||
        p.name === 'linkToAnchor' ||
        p.name === 'horizontalRule' ||
        p.name === 'nonBreakingSpace' ||
        p.name === 'specialCharacters' ||
        p.name === 'emoji' || // Эмодзи пикер
        p.name === 'footnotes' || // Сноски (footnotes)
        p.name === 'table' || // Таблицы (tables)
        p.name === 'youtube' ||
        p.name === 'linkPreview' || // Превью ссылок (карточки)
        p.name === 'image',
    );
  }

  /**
   * Плагины поиска (Search Dialog, Find Replace)
   */
  get searchPlugins(): AuroraPlugin[] {
    return this.plugins.filter((p) => p.name === 'searchDialog' || p.name === 'findReplace');
  }

  /**
   * Утилитарные плагины (Source Code, History, Fullscreen, Show Invisibles, Show Blocks)
   */
  get utilityPlugins(): AuroraPlugin[] {
    return this.plugins.filter(
      (p) =>
        p.name === 'sourceCode' ||
        p.name === 'history' ||
        p.name === 'fullscreen' ||
        p.name === 'showInvisibles' ||
        p.name === 'showBlocks' ||
        p.name === 'wordCount', // Статистика текста
    );
  }

  /**
   * Плагины истории (Undo, Redo)
   */
  get historyPlugins(): AuroraPlugin[] {
    return this.plugins.filter((p) => p.name === 'undo' || p.name === 'redo');
  }

  /**
   * Проверить, активна ли кнопка
   */
  isButtonActive(pluginName: string): boolean {
    return this.activePlugins.includes(pluginName);
  }

  /**
   * Обработчик клика на кнопку
   */
  onButtonClick(plugin: AuroraPlugin, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.buttonClick.emit(plugin);
  }

  /**
   * Получить подсказку для кнопки
   */
  getTooltip(plugin: AuroraPlugin): string {
    let tooltip = plugin.title;
    if (plugin.shortcut) {
      tooltip += ` (${plugin.shortcut})`;
    }
    return tooltip;
  }

  /**
   * Переключить dropdown
   */
  toggleDropdown(pluginName: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Сохраняем текущее выделение перед открытием dropdown
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedRange = selection.getRangeAt(0).cloneRange();
    }

    if (this.openDropdown === pluginName) {
      this.openDropdown = null;
    } else {
      this.openDropdown = pluginName;
    }
  }

  /**
   * Обработчик выбора значения из dropdown
   */
  onDropdownSelect(plugin: AuroraPlugin, value: any): void {
    // Восстанавливаем выделение перед применением форматирования
    if (this.savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
      }
    }

    this.openDropdown = null;

    // Эмитим событие клика с options
    this.buttonClick.emit({
      ...plugin,
      execute: (el: HTMLElement) => plugin.execute(el, value),
    } as AuroraPlugin);

    // Очищаем сохранённый Range
    this.savedRange = null;
  }

  /**
   * Обработчик клика на элемент dropdown (для заголовков)
   */
  onDropdownItemClick(plugin: AuroraPlugin, value: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Восстанавливаем выделение перед применением форматирования
    if (this.savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
      }
    }

    this.openDropdown = null;

    // Эмитим событие клика с параметром значения
    this.buttonClick.emit({
      ...plugin,
      execute: (el: HTMLElement) => plugin.execute(el, value),
    } as AuroraPlugin);

    // Очищаем сохранённый Range
    this.savedRange = null;
  }

  /**
   * Получить плагин по имени
   */
  getPluginByName(name: string): AuroraPlugin | undefined {
    return this.plugins.find((p) => p.name === name);
  }

  /**
   * Получить список шрифтов из плагина fontFamily
   */
  getFontFamilies(): any[] {
    const plugin = this.getPluginByName('fontFamily') as any;
    return plugin?.fonts || [];
  }

  /**
   * Получить список размеров шрифтов из плагина fontSize
   */
  getFontSizes(): any[] {
    const plugin = this.getPluginByName('fontSize') as any;
    return plugin?.fontSizes || [];
  }

  /**
   * Получить список межстрочных интервалов из плагина lineHeight
   */
  getLineHeights(): any[] {
    const plugin = this.getPluginByName('lineHeight') as any;
    return plugin?.lineHeights || [];
  }

  /**
   * Получить список цветов текста из плагина textColor
   */
  getTextColors(): any[] {
    const plugin = this.getPluginByName('textColor') as any;
    return plugin?.colors || [];
  }

  /**
   * Получить список цветов фона из плагина backgroundColor
   */
  getBackgroundColors(): any[] {
    const plugin = this.getPluginByName('backgroundColor') as any;
    return plugin?.colors || [];
  }

  /**
   * Получить цвета маркера из Highlight плагина
   */
  getHighlightColors(): any[] {
    const plugin = this.getPluginByName('highlight') as any;
    return plugin?.getColors() || [];
  }

  /**
   * Получить опции text-indent из плагина textAlignmentAdvanced
   */
  getTextIndentOptions(): any[] {
    const plugin = this.getPluginByName('textAlignmentAdvanced') as any;
    return plugin?.getTextIndentOptions() || [];
  }

  /**
   * Получить опции letter-spacing из плагина textAlignmentAdvanced
   */
  getLetterSpacingOptions(): any[] {
    const plugin = this.getPluginByName('textAlignmentAdvanced') as any;
    return plugin?.getLetterSpacingOptions() || [];
  }

  /**
   * Получить опции word-spacing из плагина textAlignmentAdvanced
   */
  getWordSpacingOptions(): any[] {
    const plugin = this.getPluginByName('textAlignmentAdvanced') as any;
    return plugin?.getWordSpacingOptions() || [];
  }

  /**
   * Получить опции vertical-align из плагина textAlignmentAdvanced
   */
  getVerticalAlignOptions(): any[] {
    const plugin = this.getPluginByName('textAlignmentAdvanced') as any;
    return plugin?.getVerticalAlignOptions() || [];
  }

  /**
   * Получить категории эмодзи из плагина emoji
   */
  getEmojiCategories(): any[] {
    const plugin = this.getPluginByName('emoji') as any;
    console.log('[Toolbar] Emoji plugin:', plugin);

    if (plugin && plugin.getCategories) {
      const categories = plugin.getCategories();
      console.log('[Toolbar] Categories from plugin:', categories);
      return categories;
    }

    console.warn('[Toolbar] Emoji plugin not found or no getCategories method');
    return [];
  }

  /**
   * Обработчик выбора эмодзи
   */
  onEmojiSelect(plugin: AuroraPlugin, emoji: string): void {
    if (this.editorElement) {
      plugin.execute(this.editorElement, { emoji });
      this.openDropdown = null;
    }
  }

  /**
   * Получить размер шрифта для заголовка (для превью в dropdown)
   */
  getHeadingSize(headingValue: string): string {
    const sizes: { [key: string]: string } = {
      h1: '24px',
      h2: '20px',
      h3: '18px',
      h4: '16px',
      h5: '14px',
      h6: '12px',
    };
    return sizes[headingValue] || '16px';
  }

  /**
   * Получить опции заголовков из плагина
   */
  getHeadingOptions(plugin: AuroraPlugin): any[] {
    return (plugin as any).options || [];
  }

  /**
   * Получить текущее значение заголовка
   */
  getHeadingCurrentValue(plugin: AuroraPlugin): string {
    if (this.editorElement && (plugin as any).getCurrentValue) {
      return (plugin as any).getCurrentValue(this.editorElement);
    }
    return '';
  }

  /**
   * Получить список специальных символов из плагина
   */
  getSpecialCharacters(plugin: AuroraPlugin): any[] {
    return (plugin as any).options || [];
  }

  /**
   * Закрыть dropdown при клике вне его
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.aurora-toolbar-dropdown')) {
      if (this.openDropdown) {
        this.openDropdown = null;
        // Очищаем сохранённый Range при закрытии без выбора
        this.savedRange = null;
      }
    }
  }
}
