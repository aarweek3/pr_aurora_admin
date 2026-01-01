import { Injectable } from '@angular/core';
import { AuroraPlugin } from '../plugins/aurora-plugin.interface';

/**
 * Категории плагинов для группировки
 */
export type PluginCategory =
  | 'format' // Форматирование текста (bold, italic, underline, etc.)
  | 'block' // Блочные элементы (heading, blockquote, etc.)
  | 'list' // Списки (ordered, unordered)
  | 'alignment' // Выравнивание текста
  | 'insert' // Вставка контента (image, video, table, etc.)
  | 'link' // Ссылки и якоря
  | 'history' // История (undo, redo)
  | 'search' // Поиск и замена
  | 'utility' // Утилиты (source code, word count, etc.)
  | 'other'; // Другое

/**
 * Метаданные плагина для регистрации
 */
export interface PluginMetadata {
  /** Плагин */
  plugin: AuroraPlugin;
  /** Категория плагина */
  category: PluginCategory;
  /** Описание функции плагина */
  description?: string;
  /** Приоритет загрузки (чем меньше, тем раньше) */
  priority?: number;
  /** Lazy load - загружать при первом использовании */
  lazyLoad?: boolean;
}

/**
 * Сервис для централизованного управления плагинами редактора
 *
 * Отвечает за:
 * - Регистрацию и хранение всех плагинов
 * - Получение плагинов по имени или категории
 * - Выполнение плагинов
 * - Определение активных плагинов (для подсветки кнопок в toolbar)
 * - Инициализацию и уничтожение плагинов
 *
 * Преимущества централизации:
 * - Единая точка управления плагинами
 * - Возможность lazy loading
 * - Легко добавлять новые плагины
 * - Изолированное тестирование
 *
 * @example
 * ```typescript
 * // Регистрация плагина
 * pluginRegistry.register({
 *   plugin: new BoldPlugin(),
 *   category: 'format',
 *   description: 'Жирный текст'
 * });
 *
 * // Выполнение плагина
 * pluginRegistry.execute('bold', editorElement);
 *
 * // Получение активных плагинов
 * const active = pluginRegistry.getActivePlugins(editorElement);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class PluginRegistryService {
  /**
   * Карта зарегистрированных плагинов
   * Key: имя плагина (plugin.name)
   * Value: метаданные плагина
   */
  private plugins = new Map<string, PluginMetadata>();

  /**
   * Зарегистрировать плагин в реестре
   *
   * @param metadata - Метаданные плагина
   *
   * @example
   * ```typescript
   * pluginRegistry.register({
   *   plugin: new BoldPlugin(),
   *   category: 'format',
   *   description: 'Жирный текст',
   *   priority: 1
   * });
   * ```
   */
  register(metadata: PluginMetadata): void {
    const name = metadata.plugin.name;

    if (this.plugins.has(name)) {
      console.warn(`[PluginRegistry] Plugin "${name}" already registered - overwriting`);
    }

    this.plugins.set(name, metadata);
    console.log(`[PluginRegistry] Registered: ${name} (${metadata.category})`);
  }

  /**
   * Зарегистрировать несколько плагинов за раз
   *
   * @param metadataList - Массив метаданных плагинов
   *
   * @example
   * ```typescript
   * pluginRegistry.registerMany([
   *   { plugin: new BoldPlugin(), category: 'format' },
   *   { plugin: new ItalicPlugin(), category: 'format' },
   *   { plugin: new UnderlinePlugin(), category: 'format' }
   * ]);
   * ```
   */
  registerMany(metadataList: PluginMetadata[]): void {
    metadataList.forEach((metadata) => this.register(metadata));
  }

  /**
   * Удалить плагин из реестра
   *
   * @param name - Имя плагина
   */
  unregister(name: string): void {
    const metadata = this.plugins.get(name);

    if (metadata) {
      // Вызываем destroy если есть
      if (metadata.plugin.destroy) {
        metadata.plugin.destroy();
      }

      this.plugins.delete(name);
      console.log(`[PluginRegistry] Unregistered: ${name}`);
    } else {
      console.warn(`[PluginRegistry] Plugin "${name}" not found`);
    }
  }

  /**
   * Получить плагин по имени
   *
   * @param name - Имя плагина
   * @returns Плагин или undefined если не найден
   *
   * @example
   * ```typescript
   * const boldPlugin = pluginRegistry.getPlugin('bold');
   * if (boldPlugin) {
   *   boldPlugin.execute(editorElement);
   * }
   * ```
   */
  getPlugin(name: string): AuroraPlugin | undefined {
    return this.plugins.get(name)?.plugin;
  }

  /**
   * Получить метаданные плагина
   *
   * @param name - Имя плагина
   * @returns Метаданные плагина или undefined
   */
  getMetadata(name: string): PluginMetadata | undefined {
    return this.plugins.get(name);
  }

  /**
   * Получить все зарегистрированные плагины
   *
   * @returns Массив всех плагинов
   *
   * @example
   * ```typescript
   * const allPlugins = pluginRegistry.getAllPlugins();
   * console.log(`Total plugins: ${allPlugins.length}`);
   * ```
   */
  getAllPlugins(): AuroraPlugin[] {
    return Array.from(this.plugins.values()).map((m) => m.plugin);
  }

  /**
   * Получить все метаданные плагинов
   *
   * @returns Массив метаданных
   */
  getAllMetadata(): PluginMetadata[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Получить плагины по категории
   *
   * @param category - Категория плагинов
   * @returns Массив плагинов в данной категории
   *
   * @example
   * ```typescript
   * const formatPlugins = pluginRegistry.getByCategory('format');
   * // => [BoldPlugin, ItalicPlugin, UnderlinePlugin, ...]
   * ```
   */
  getByCategory(category: PluginCategory): AuroraPlugin[] {
    return Array.from(this.plugins.values())
      .filter((m) => m.category === category)
      .map((m) => m.plugin);
  }

  /**
   * Выполнить плагин по имени
   *
   * @param name - Имя плагина
   * @param editor - HTML элемент редактора
   * @param params - Дополнительные параметры для плагина
   * @returns true если плагин выполнен, false если не найден или ошибка
   *
   * @example
   * ```typescript
   * // Выполнить плагин Bold
   * pluginRegistry.execute('bold', editorElement);
   *
   * // Выполнить плагин FontSize с параметром
   * pluginRegistry.execute('fontSize', editorElement, { size: '18px' });
   * ```
   */
  execute(name: string, editor: HTMLElement, params?: any): boolean {
    const plugin = this.getPlugin(name);

    if (!plugin) {
      console.warn(`[PluginRegistry] Plugin "${name}" not found`);
      return false;
    }

    try {
      plugin.execute(editor, params);
      console.log(`[PluginRegistry] Executed: ${name}`);
      return true;
    } catch (error) {
      console.error(`[PluginRegistry] Error executing "${name}":`, error);
      return false;
    }
  }

  /**
   * Получить список активных плагинов (для подсветки кнопок в toolbar)
   *
   * @param editor - HTML элемент редактора
   * @returns Массив имён активных плагинов
   *
   * @example
   * ```typescript
   * const activePlugins = pluginRegistry.getActivePlugins(editorElement);
   * // => ['bold', 'italic', 'alignCenter']
   * ```
   */
  getActivePlugins(editor: HTMLElement): string[] {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return [];
    }

    const active: string[] = [];

    // Проходим по всем плагинам и проверяем isActive
    for (const [name, metadata] of this.plugins.entries()) {
      const plugin = metadata.plugin;

      if (plugin.isActive && plugin.isActive(editor)) {
        active.push(name);
      }
    }

    return active;
  }

  /**
   * Инициализировать все плагины
   *
   * Вызывает метод init() для каждого плагина (если есть)
   *
   * @example
   * ```typescript
   * pluginRegistry.initializeAll();
   * ```
   */
  initializeAll(): void {
    let initialized = 0;

    for (const [name, metadata] of this.plugins.entries()) {
      const plugin = metadata.plugin;

      if (plugin.init) {
        try {
          plugin.init();
          initialized++;
        } catch (error) {
          console.error(`[PluginRegistry] Error initializing "${name}":`, error);
        }
      }
    }

    console.log(`[PluginRegistry] Initialized ${initialized}/${this.plugins.size} plugins`);
  }

  /**
   * Уничтожить все плагины
   *
   * Вызывает метод destroy() для каждого плагина (если есть)
   *
   * @example
   * ```typescript
   * pluginRegistry.destroyAll();
   * ```
   */
  destroyAll(): void {
    let destroyed = 0;

    for (const [name, metadata] of this.plugins.entries()) {
      const plugin = metadata.plugin;

      if (plugin.destroy) {
        try {
          plugin.destroy();
          destroyed++;
        } catch (error) {
          console.error(`[PluginRegistry] Error destroying "${name}":`, error);
        }
      }
    }

    console.log(`[PluginRegistry] Destroyed ${destroyed}/${this.plugins.size} plugins`);
  }

  /**
   * Проверить зарегистрирован ли плагин
   *
   * @param name - Имя плагина
   * @returns true если плагин зарегистрирован
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Получить количество зарегистрированных плагинов
   *
   * @returns Количество плагинов
   */
  count(): number {
    return this.plugins.size;
  }

  /**
   * Получить список имён всех плагинов
   *
   * @returns Массив имён плагинов
   *
   * @example
   * ```typescript
   * const names = pluginRegistry.getPluginNames();
   * // => ['bold', 'italic', 'underline', ...]
   * ```
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Получить статистику по категориям
   *
   * @returns Объект с количеством плагинов в каждой категории
   *
   * @example
   * ```typescript
   * const stats = pluginRegistry.getCategoryStats();
   * // => { format: 10, insert: 8, utility: 5, ... }
   * ```
   */
  getCategoryStats(): Record<PluginCategory, number> {
    const stats: Record<PluginCategory, number> = {
      format: 0,
      block: 0,
      list: 0,
      alignment: 0,
      insert: 0,
      link: 0,
      history: 0,
      search: 0,
      utility: 0,
      other: 0,
    };

    for (const metadata of this.plugins.values()) {
      stats[metadata.category]++;
    }

    return stats;
  }

  /**
   * Очистить все плагины
   *
   * Уничтожает все плагины и очищает реестр
   */
  clear(): void {
    this.destroyAll();
    const count = this.plugins.size;
    this.plugins.clear();
    console.log(`[PluginRegistry] Cleared ${count} plugins`);
  }
}
