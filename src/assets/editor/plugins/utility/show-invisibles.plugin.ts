/**
 * ════════════════════════════════════════════════════════════════════════════
 * SHOW INVISIBLES PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для отображения невидимых символов в редакторе:
 * - Пробелы (·)
 * - Табуляция (→)
 * - Переносы строк (¶)
 * - Неразрывные пробелы (&nbsp;)
 *
 * @module ShowInvisiblesPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

export class ShowInvisiblesPlugin implements AuroraPlugin {
  name = 'showInvisibles';
  title = 'Показать невидимые символы';
  icon = '¶';
  private isEnabled = false;
  private styleElement: HTMLStyleElement | null = null;

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[ShowInvisiblesPlugin] Initialized');
  }

  /**
   * Выполнение команды - переключение видимости невидимых символов
   */
  execute(editorElement: HTMLElement): boolean {
    this.isEnabled = !this.isEnabled;

    if (this.isEnabled) {
      this.showInvisibles(editorElement);
    } else {
      this.hideInvisibles(editorElement);
    }

    console.log('[ShowInvisiblesPlugin] Invisibles:', this.isEnabled ? 'shown' : 'hidden');
    return true;
  }

  /**
   * Проверка активности плагина
   */
  isActive(editorElement: HTMLElement): boolean {
    return this.isEnabled;
  }

  /**
   * Показать невидимые символы
   */
  private showInvisibles(editorElement: HTMLElement): void {
    // Добавляем CSS класс к редактору
    editorElement.classList.add('show-invisibles');

    // Создаём стили для отображения невидимых символов
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'aurora-show-invisibles-styles';
      this.styleElement.textContent = this.getInvisiblesCSS();
      document.head.appendChild(this.styleElement);
    }
  }

  /**
   * Скрыть невидимые символы
   */
  private hideInvisibles(editorElement: HTMLElement): void {
    // Удаляем CSS класс
    editorElement.classList.remove('show-invisibles');

    // Удаляем стили
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * Генерация CSS для невидимых символов
   */
  private getInvisiblesCSS(): string {
    return `
      /* ═══════════════════════════════════════════════════════════════════════
         SHOW INVISIBLES STYLES
         ═══════════════════════════════════════════════════════════════════════ */

      .aurora-editor-content.show-invisibles {
        /* Базовые настройки для псевдоэлементов */
        --invisible-color: rgba(150, 150, 150, 0.4);
        --invisible-font-family: 'Courier New', monospace;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         ПРОБЕЛЫ (отображаем как ·)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-invisibles .aurora-space::after {
        content: '·';
        color: var(--invisible-color);
        font-family: var(--invisible-font-family);
        position: absolute;
        pointer-events: none;
        user-select: none;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         ТАБУЛЯЦИЯ (отображаем как →)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-invisibles .aurora-tab::after {
        content: '→';
        color: var(--invisible-color);
        font-family: var(--invisible-font-family);
        position: absolute;
        pointer-events: none;
        user-select: none;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         ПЕРЕНОСЫ СТРОК (отображаем как ¶)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-invisibles br::after,
      .aurora-editor-content.show-invisibles .aurora-line-break::after {
        content: '¶';
        color: var(--invisible-color);
        font-family: var(--invisible-font-family);
        position: absolute;
        pointer-events: none;
        user-select: none;
        margin-left: 2px;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         НЕРАЗРЫВНЫЕ ПРОБЕЛЫ (отображаем как °)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-invisibles .aurora-nbsp::after {
        content: '°';
        color: var(--invisible-color);
        font-family: var(--invisible-font-family);
        position: absolute;
        pointer-events: none;
        user-select: none;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         КОНЕЦ ПАРАГРАФА (отображаем как ¶ в конце каждого <p>, <div>, <h*>)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-invisibles p::after,
      .aurora-editor-content.show-invisibles div::after,
      .aurora-editor-content.show-invisibles h1::after,
      .aurora-editor-content.show-invisibles h2::after,
      .aurora-editor-content.show-invisibles h3::after,
      .aurora-editor-content.show-invisibles h4::after,
      .aurora-editor-content.show-invisibles h5::after,
      .aurora-editor-content.show-invisibles h6::after,
      .aurora-editor-content.show-invisibles blockquote::after,
      .aurora-editor-content.show-invisibles pre::after {
        content: '¶';
        color: var(--invisible-color);
        font-family: var(--invisible-font-family);
        margin-left: 4px;
        pointer-events: none;
        user-select: none;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         АЛЬТЕРНАТИВНЫЙ СПОСОБ: Показываем пробелы через word-spacing
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-invisibles {
        /* Подсвечиваем пробелы легким фоном */
        white-space: pre-wrap;
      }

      /* Пробелы внутри текстовых узлов */
      .aurora-editor-content.show-invisibles {
        background-image:
          /* Вертикальные линии для визуализации отступов */
          repeating-linear-gradient(
            to right,
            transparent,
            transparent 1ch,
            rgba(150, 150, 150, 0.1) 1ch,
            rgba(150, 150, 150, 0.1) 1.1ch
          );
      }
    `;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    // Удаляем стили если они есть
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }

    console.log('[ShowInvisiblesPlugin] Destroyed');
  }

  /**
   * Получить текущее состояние
   */
  getState(): boolean {
    return this.isEnabled;
  }
}
