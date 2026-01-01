/**
 * ════════════════════════════════════════════════════════════════════════════
 * PLUGIN CONFIGURATION SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для конфигурации и регистрации всех плагинов редактора.
 * Содержит централизованную конфигурацию всех плагинов с полными импортами.
 *
 * @module PluginConfigurationService
 */

import { ApplicationRef, EnvironmentInjector, Injectable } from '@angular/core';

// Alignment Plugins
import { AlignCenterPlugin } from '../plugins/alignment/align-center.plugin';
import { AlignJustifyPlugin } from '../plugins/alignment/align-justify.plugin';
import { AlignLeftPlugin } from '../plugins/alignment/align-left.plugin';
import { AlignRightPlugin } from '../plugins/alignment/align-right.plugin';

// Block Plugins
import { HeadingPlugin } from '../plugins/block/heading.plugin';

// Format Plugins
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

// History Plugins
import { RedoPlugin } from '../plugins/history/redo.plugin';
import { UndoPlugin } from '../plugins/history/undo.plugin';

// Insert Plugins
import { EmojiPlugin } from '../plugins/insert/emoji.plugin';
import { FootnotesPlugin } from '../plugins/insert/footnotes.plugin';
import { HorizontalRulePlugin } from '../plugins/insert/horizontal-rule.plugin';
import { ImagePlugin } from '../plugins/insert/image.plugin';
import { LinkPreviewPlugin } from '../plugins/insert/link-preview.plugin';
import { NonBreakingSpacePlugin } from '../plugins/insert/non-breaking-space.plugin';
import { SpecialCharactersPlugin } from '../plugins/insert/special-characters.plugin';
import { TablePlugin } from '../plugins/insert/table.plugin';

// Link Plugins
import { AnchorPlugin } from '../plugins/link/anchor.plugin';
import { LinkToAnchorPlugin } from '../plugins/link/link-to-anchor.plugin';
import { LinkPlugin } from '../plugins/link/link.plugin';
import { RemoveAnchorPlugin } from '../plugins/link/remove-anchor.plugin';
import { UnlinkPlugin } from '../plugins/link/unlink.plugin';

// List Plugins
import { OrderedListPlugin } from '../plugins/list/ordered-list.plugin';
import { UnorderedListPlugin } from '../plugins/list/unordered-list.plugin';

// Quote Plugins
import { CreateQuoteStylePlugin } from '../plugins/create-quote-style/create-quote-style.plugin';
import { QuotePlugin } from '../plugins/quote/quote.plugin';

// Search Plugins
import { FindReplacePlugin } from '../plugins/search/find-replace.plugin';
import { SearchDialogPlugin } from '../plugins/search/search-dialog.plugin';

// Utility Plugins
import { ShowBlocksPlugin } from '../plugins/utility/show-blocks.plugin';
import { ShowInvisiblesPlugin } from '../plugins/utility/show-invisibles.plugin';
import { WordCountPlugin } from '../plugins/utility/word-count.plugin';

/**
 * Конфигурация плагина для регистрации
 */
export interface PluginConfig {
  /** Экземпляр плагина */
  plugin: any;
  /** Категория плагина */
  category:
    | 'format'
    | 'alignment'
    | 'list'
    | 'block'
    | 'insert'
    | 'link'
    | 'history'
    | 'search'
    | 'utility';
  /** Описание плагина */
  description: string;
}

/**
 * Контекст для создания плагинов с зависимостями
 */
export interface PluginCreationContext {
  /** ApplicationRef для создания динамических компонентов */
  appRef: ApplicationRef;
  /** EnvironmentInjector для внедрения зависимостей */
  injector: EnvironmentInjector;
  /** Специальные плагины из компонента */
  youtubePlugin: any;
  sourceCodePlugin: any;
}

/**
 * Сервис для конфигурации плагинов
 */
@Injectable({
  providedIn: 'root',
})
export class PluginConfigurationService {
  /**
   * Регистрирует все плагины в PluginRegistryService
   *
   * @param pluginRegistry - Сервис регистрации плагинов
   * @param context - Контекст с зависимостями для создания плагинов
   * @returns LinkPlugin для сохранения в компоненте
   */
  registerAllPlugins(pluginRegistry: any, context: PluginCreationContext): any {
    console.log('[PluginConfig] 🚀 Starting plugins registration via service...');

    // Создаем все плагины
    const { plugins, linkPlugin } = this.createAllPlugins(context);

    // Регистрируем все плагины
    pluginRegistry.registerMany(plugins);

    console.log(`[PluginConfig] ✅ Registered ${plugins.length} plugins in registry`);

    // Выводим статистику по категориям
    const stats = pluginRegistry.getCategoryStats();
    console.log('[PluginConfig] 📊 Plugin stats by category:', stats);

    // Обновляем signal плагинов для использования в template
    const allPlugins = pluginRegistry.getAllPlugins();

    console.log('[PluginConfig] 🔧 Plugin registration completed via service');

    return { linkPlugin, allPlugins };
  }

  /**
   * Создает все плагины с их конфигурациями
   */
  private createAllPlugins(context: PluginCreationContext): {
    plugins: PluginConfig[];
    linkPlugin: any;
  } {
    console.log('[PluginConfig] 🔧 Creating all plugin instances...');

    // Создаем LinkPlugin с зависимостями
    const linkPlugin = new LinkPlugin(context.appRef, context.injector);

    // Создаем AnchorPlugin с зависимостями
    const anchorPlugin = new AnchorPlugin(context.appRef, context.injector);

    // Создаем LinkToAnchorPlugin с зависимостями
    const linkToAnchorPlugin = new LinkToAnchorPlugin(context.appRef, context.injector);

    // Создаем старый InsertQuotePlugin (базовая версия)
    const insertQuotePlugin = new InsertQuotePlugin(context.appRef, context.injector);

    // Создаем QuotePlugin (новая версия с расширенным функционалом)
    const quotePlugin = new QuotePlugin();

    // Создаем CreateQuoteStylePlugin (редактор стилей цитат)
    const createQuoteStylePlugin = new CreateQuoteStylePlugin();

    const plugins: PluginConfig[] = [
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
      { plugin: context.youtubePlugin, category: 'insert', description: 'YouTube видео' },
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
        plugin: context.sourceCodePlugin,
        category: 'utility',
        description: 'Исходный код (HTML/SCSS)',
      },
    ];

    console.log(`[PluginConfig] ✅ Created ${plugins.length} plugin instances`);

    return { plugins, linkPlugin };
  }
}
