import { Injectable } from '@angular/core';

/**
 * Конфигурация горячей клавиши
 */
export interface ShortcutConfig {
  /** Уникальный идентификатор shortcut */
  id: string;
  /** Основная клавиша (например, 'b', 'i', 'z') */
  key: string;
  /** Требуется ли Ctrl (или Cmd на Mac) */
  ctrl?: boolean;
  /** Требуется ли Shift */
  shift?: boolean;
  /** Требуется ли Alt */
  alt?: boolean;
  /** Описание действия (для help modal) */
  description: string;
  /** Действие при нажатии */
  action: (editor: HTMLElement) => void;
  /** Категория (для группировки в help modal) */
  category?: 'format' | 'history' | 'insert' | 'link' | 'other';
}

/**
 * Сервис для управления горячими клавишами редактора
 *
 * Отвечает за:
 * - Регистрацию горячих клавиш
 * - Обработку нажатий клавиш
 * - Предоставление списка shortcuts для help modal
 *
 * @example
 * ```typescript
 * // Регистрация shortcut
 * keyboardShortcuts.registerShortcut({
 *   id: 'bold',
 *   key: 'b',
 *   ctrl: true,
 *   description: 'Жирный текст',
 *   action: (editor) => document.execCommand('bold')
 * });
 *
 * // Обработка keydown
 * onKeyDown(event: KeyboardEvent): void {
 *   this.keyboardShortcuts.handleKeydown(event, this.editorElement);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsService {
  /**
   * Карта зарегистрированных shortcuts
   * Key: уникальный ID shortcut
   */
  private shortcuts = new Map<string, ShortcutConfig>();

  /**
   * Зарегистрировать горячую клавишу
   *
   * @param config - Конфигурация shortcut
   *
   * @example
   * ```typescript
   * keyboardShortcuts.registerShortcut({
   *   id: 'bold',
   *   key: 'b',
   *   ctrl: true,
   *   description: 'Жирный текст',
   *   action: (editor) => document.execCommand('bold'),
   *   category: 'format'
   * });
   * ```
   */
  registerShortcut(config: ShortcutConfig): void {
    if (this.shortcuts.has(config.id)) {
      console.warn(`[KeyboardShortcuts] Shortcut "${config.id}" already registered - overwriting`);
    }
    this.shortcuts.set(config.id, config);
    console.log(
      `[KeyboardShortcuts] Registered: ${config.id} (${this.getShortcutDisplay(config)})`,
    );
  }

  /**
   * Удалить зарегистрированную горячую клавишу
   *
   * @param id - ID shortcut
   */
  unregisterShortcut(id: string): void {
    if (this.shortcuts.delete(id)) {
      console.log(`[KeyboardShortcuts] Unregistered: ${id}`);
    } else {
      console.warn(`[KeyboardShortcuts] Shortcut "${id}" not found`);
    }
  }

  /**
   * Обработать событие keydown
   *
   * @param event - Событие клавиатуры
   * @param editor - HTML элемент редактора
   * @returns true если shortcut был обработан, false иначе
   *
   * @example
   * ```typescript
   * onKeyDown(event: KeyboardEvent): void {
   *   const handled = this.keyboardShortcuts.handleKeydown(
   *     event,
   *     this.editorElementRef.nativeElement
   *   );
   *   if (handled) {
   *     // Shortcut был обработан, ничего не делаем
   *   }
   * }
   * ```
   */
  handleKeydown(event: KeyboardEvent, editor: HTMLElement): boolean {
    // Ищем подходящий shortcut
    for (const [id, config] of this.shortcuts.entries()) {
      if (this.matchesShortcut(event, config)) {
        console.log(`[KeyboardShortcuts] Matched: ${id} (${this.getShortcutDisplay(config)})`);

        // Предотвращаем default действие
        event.preventDefault();

        // Выполняем действие
        try {
          config.action(editor);
          return true;
        } catch (error) {
          console.error(`[KeyboardShortcuts] Error executing "${id}":`, error);
          return false;
        }
      }
    }

    return false;
  }

  /**
   * Получить список всех зарегистрированных shortcuts
   *
   * @returns Массив конфигураций shortcuts
   *
   * @example
   * ```typescript
   * const shortcuts = keyboardShortcuts.getShortcutsList();
   * // Показать в help modal
   * shortcuts.forEach(s => {
   *   console.log(`${s.description}: ${getShortcutDisplay(s)}`);
   * });
   * ```
   */
  getShortcutsList(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Получить shortcuts по категории
   *
   * @param category - Категория shortcuts
   * @returns Массив shortcuts в данной категории
   */
  getShortcutsByCategory(category: string): ShortcutConfig[] {
    return this.getShortcutsList().filter((s) => s.category === category);
  }

  /**
   * Проверить активен ли shortcut (зарегистрирован ли)
   *
   * @param id - ID shortcut
   * @returns true если shortcut зарегистрирован
   */
  isShortcutActive(id: string): boolean {
    return this.shortcuts.has(id);
  }

  /**
   * Получить отображаемое название shortcut (для UI)
   *
   * @param config - Конфигурация shortcut
   * @returns Строка вида "Ctrl+Shift+K"
   *
   * @example
   * ```typescript
   * const display = keyboardShortcuts.getShortcutDisplay(config);
   * // => "Ctrl+Shift+K" или "Cmd+B" на Mac
   * ```
   */
  getShortcutDisplay(config: ShortcutConfig): string {
    const parts: string[] = [];

    // Определяем платформу (Mac использует Cmd вместо Ctrl)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if (config.ctrl) {
      parts.push(isMac ? 'Cmd' : 'Ctrl');
    }
    if (config.shift) {
      parts.push('Shift');
    }
    if (config.alt) {
      parts.push('Alt');
    }

    // Добавляем основную клавишу (с заглавной буквы)
    parts.push(config.key.toUpperCase());

    return parts.join('+');
  }

  /**
   * Очистить все зарегистрированные shortcuts
   * (используется при destroy компонента)
   */
  clearAll(): void {
    const count = this.shortcuts.size;
    this.shortcuts.clear();
    console.log(`[KeyboardShortcuts] Cleared ${count} shortcuts`);
  }

  /**
   * Проверить совпадает ли событие с конфигурацией shortcut
   *
   * @param event - Событие клавиатуры
   * @param config - Конфигурация shortcut
   * @returns true если событие соответствует shortcut
   */
  private matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
    // Проверяем основную клавишу (case-insensitive)
    if (event.key.toLowerCase() !== config.key.toLowerCase()) {
      return false;
    }

    // Проверяем модификаторы
    const ctrlOrCmd = event.ctrlKey || event.metaKey; // metaKey = Cmd на Mac

    if (config.ctrl && !ctrlOrCmd) return false;
    if (!config.ctrl && ctrlOrCmd) return false;

    if (config.shift && !event.shiftKey) return false;
    if (!config.shift && event.shiftKey) return false;

    if (config.alt && !event.altKey) return false;
    if (!config.alt && event.altKey) return false;

    return true;
  }
}
