/**
 * ════════════════════════════════════════════════════════════════════════════
 * KEYBOARD SHORTCUTS CONFIGURATION SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для конфигурации и регистрации горячих клавиш редактора.
 *
 * Отвечает за:
 * - Конфигурацию всех горячих клавиш редактора
 * - Регистрацию сочетаний клавиш в KeyboardShortcutsService
 * - Организацию шорткатов по категориям
 * - Предоставление централизованной конфигурации
 *
 * @module KeyboardShortcutsConfigService
 */

import { Injectable } from '@angular/core';
import { AuroraPlugin } from '../plugins/aurora-plugin.interface';

/**
 * Конфигурация горячей клавиши
 */
export interface ShortcutConfig {
  /** Уникальный идентификатор */
  id: string;
  /** Основная клавиша */
  key: string;
  /** Требуется ли Ctrl */
  ctrl?: boolean;
  /** Требуется ли Alt */
  alt?: boolean;
  /** Требуется ли Shift */
  shift?: boolean;
  /** Описание действия */
  description: string;
  /** Категория шортката */
  category: 'format' | 'history' | 'link' | 'insert' | 'other';
  /** Функция действия */
  action: () => void;
}

/**
 * Контекст для создания действий шорткатов
 */
export interface ShortcutContext {
  /** Элемент редактора */
  editor: HTMLElement;
  /** Сервис редактора для базовых команд */
  editorService: any;
  /** Плагин ссылок */
  linkPlugin: any;
  /** Функция поиска плагина */
  findPlugin: (name: string) => AuroraPlugin | undefined;
  /** Функция обновления активных плагинов */
  updateActivePlugins: () => void;
}

/**
 * Сервис для конфигурации горячих клавиш
 */
@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsConfigService {
  /**
   * Создает полную конфигурацию горячих клавиш для редактора
   *
   * @param context - Контекст с зависимостями для создания действий
   * @returns Массив конфигураций шорткатов
   */
  createShortcutsConfig(context: ShortcutContext): ShortcutConfig[] {
    const { editor, editorService, linkPlugin, findPlugin, updateActivePlugins } = context;

    return [
      // ═══════════════════════════════════════════════════════════════════════════
      // ФОРМАТИРОВАНИЕ
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'bold',
        key: 'b',
        ctrl: true,
        description: 'Жирный текст',
        category: 'format',
        action: () => editorService.execute('bold'),
      },
      {
        id: 'italic',
        key: 'i',
        ctrl: true,
        description: 'Курсив',
        category: 'format',
        action: () => editorService.execute('italic'),
      },
      {
        id: 'underline',
        key: 'u',
        ctrl: true,
        description: 'Подчёркивание',
        category: 'format',
        action: () => editorService.execute('underline'),
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // ИСТОРИЯ
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'undo',
        key: 'z',
        ctrl: true,
        description: 'Отменить',
        category: 'history',
        action: () => editorService.undo(),
      },
      {
        id: 'redo',
        key: 'y',
        ctrl: true,
        description: 'Вернуть',
        category: 'history',
        action: () => editorService.redo(),
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // ССЫЛКИ
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'createLink',
        key: 'k',
        ctrl: true,
        description: 'Создать ссылку',
        category: 'link',
        action: () => {
          console.log('[KeyboardShortcuts] Create link shortcut triggered');
          linkPlugin.execute(editor);
        },
      },
      {
        id: 'removeLink',
        key: 'K',
        ctrl: true,
        shift: true,
        description: 'Удалить ссылку',
        category: 'link',
        action: () => {
          console.log('[KeyboardShortcuts] Remove link shortcut triggered');
          const unlinkPlugin = findPlugin('unlink');
          if (unlinkPlugin) {
            unlinkPlugin.execute(editor);
          }
        },
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // ЯКОРЯ (ANCHORS)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'createAnchor',
        key: 'a',
        ctrl: true,
        alt: true,
        description: 'Создать якорь',
        category: 'link',
        action: () => {
          console.log('[KeyboardShortcuts] Create anchor shortcut triggered');
          const anchorPlugin = findPlugin('anchor');
          if (anchorPlugin) {
            anchorPlugin.execute(editor);
          }
        },
      },
      {
        id: 'removeAnchor',
        key: 'A',
        ctrl: true,
        alt: true,
        shift: true,
        description: 'Удалить якорь',
        category: 'link',
        action: () => {
          console.log('[KeyboardShortcuts] Remove anchor shortcut triggered');
          const removeAnchorPlugin = findPlugin('removeAnchor');
          if (removeAnchorPlugin) {
            removeAnchorPlugin.execute(editor);
          }
        },
      },
      {
        id: 'linkToAnchor',
        key: 'A',
        ctrl: true,
        shift: true,
        description: 'Ссылка на якорь',
        category: 'link',
        action: () => {
          console.log('[KeyboardShortcuts] Link to anchor shortcut triggered');
          const linkToAnchorPlugin = findPlugin('linkToAnchor');
          if (linkToAnchorPlugin) {
            linkToAnchorPlugin.execute(editor);
          }
        },
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // ЦИТАТЫ
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'quote',
        key: 'Q',
        ctrl: true,
        shift: true,
        description: 'Вставить цитату',
        category: 'insert',
        action: () => {
          console.log('[KeyboardShortcuts] Quote shortcut triggered');
          const quotePlugin = findPlugin('quote');
          if (quotePlugin) {
            quotePlugin.execute(editor);
          }
        },
      },
      {
        id: 'insertQuote',
        key: 'I',
        ctrl: true,
        shift: true,
        description: 'Вставить цитату (базовая)',
        category: 'insert',
        action: () => {
          console.log('[KeyboardShortcuts] Insert quote shortcut triggered (Ctrl+Shift+I)');
          const insertQuotePlugin = findPlugin('insertQuote');
          if (insertQuotePlugin) {
            insertQuotePlugin.execute(editor);
          }
        },
      },
      {
        id: 'createQuoteStyle',
        key: 'S',
        ctrl: true,
        shift: true,
        description: 'Редактор стилей цитат',
        category: 'insert',
        action: () => {
          console.log('[KeyboardShortcuts] Create Quote Style shortcut triggered (Ctrl+Shift+S)');
          const createQuoteStylePlugin = findPlugin('createQuoteStyle');
          if (createQuoteStylePlugin) {
            createQuoteStylePlugin.execute(editor);
          }
        },
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // ВЫРАВНИВАНИЕ
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'alignLeft',
        key: 'L',
        ctrl: true,
        shift: true,
        description: 'Выравнивание по левому краю',
        category: 'format',
        action: () => {
          const alignLeftPlugin = findPlugin('alignLeft');
          if (alignLeftPlugin) {
            alignLeftPlugin.execute(editor);
            updateActivePlugins();
          }
        },
      },
      {
        id: 'alignCenter',
        key: 'E',
        ctrl: true,
        shift: true,
        description: 'Выравнивание по центру',
        category: 'format',
        action: () => {
          const alignCenterPlugin = findPlugin('alignCenter');
          if (alignCenterPlugin) {
            alignCenterPlugin.execute(editor);
            updateActivePlugins();
          }
        },
      },
      {
        id: 'alignRight',
        key: 'R',
        ctrl: true,
        shift: true,
        description: 'Выравнивание по правому краю',
        category: 'format',
        action: () => {
          const alignRightPlugin = findPlugin('alignRight');
          if (alignRightPlugin) {
            alignRightPlugin.execute(editor);
            updateActivePlugins();
          }
        },
      },
      {
        id: 'alignJustify',
        key: 'J',
        ctrl: true,
        shift: true,
        description: 'Выравнивание по ширине',
        category: 'format',
        action: () => {
          const alignJustifyPlugin = findPlugin('alignJustify');
          if (alignJustifyPlugin) {
            alignJustifyPlugin.execute(editor);
            updateActivePlugins();
          }
        },
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // ВСТАВКА
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'horizontalRule',
        key: 'H',
        ctrl: true,
        shift: true,
        description: 'Горизонтальная линия',
        category: 'insert',
        action: () => {
          const horizontalRulePlugin = findPlugin('horizontalRule');
          if (horizontalRulePlugin) {
            horizontalRulePlugin.execute(editor);
          }
        },
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // УТИЛИТЫ
      // ═══════════════════════════════════════════════════════════════════════════
      {
        id: 'fullscreen',
        key: 'F11',
        description: 'Полноэкранный режим',
        category: 'other',
        action: () => editorService.toggleFullscreen(),
      },
    ];
  }

  /**
   * Регистрирует все горячие клавиши в KeyboardShortcutsService
   *
   * @param keyboardShortcutsService - Сервис для регистрации шорткатов
   * @param context - Контекст с зависимостями
   */
  registerAllShortcuts(keyboardShortcutsService: any, context: ShortcutContext): void {
    console.log('[KeyboardShortcutsConfig] 🚀 Starting keyboard shortcuts registration...');

    const shortcuts = this.createShortcutsConfig(context);

    shortcuts.forEach((shortcut) => {
      keyboardShortcutsService.registerShortcut(shortcut);
    });

    console.log(`[KeyboardShortcutsConfig] ✅ Registered ${shortcuts.length} keyboard shortcuts`);

    // Выводим статистику по категориям
    const categoryStats = shortcuts.reduce((stats, shortcut) => {
      stats[shortcut.category] = (stats[shortcut.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    console.log('[KeyboardShortcutsConfig] 📊 Shortcuts by category:', categoryStats);
  }
}
