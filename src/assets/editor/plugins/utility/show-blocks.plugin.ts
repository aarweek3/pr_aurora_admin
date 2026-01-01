/**
 * ════════════════════════════════════════════════════════════════════════════
 * SHOW BLOCKS PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для отображения границ блочных элементов в редакторе.
 * Показывает визуальные границы вокруг параграфов, div, заголовков и других блоков.
 *
 * Особенности:
 * - Пунктирные границы вокруг блоков
 * - Метки с названием тега (P, DIV, H1, H2, и т.д.)
 * - Разные цвета для разных типов блоков
 * - Не влияет на содержимое и выделение текста
 *
 * @module ShowBlocksPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

export class ShowBlocksPlugin implements AuroraPlugin {
  name = 'showBlocks';
  title = 'Показать блоки';
  icon = '🔲';
  private isEnabled = false;
  private styleElement: HTMLStyleElement | null = null;

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[ShowBlocksPlugin] Initialized');
  }

  /**
   * Выполнение команды - переключение видимости границ блоков
   */
  execute(editorElement: HTMLElement): boolean {
    this.isEnabled = !this.isEnabled;

    if (this.isEnabled) {
      this.showBlocks(editorElement);
    } else {
      this.hideBlocks(editorElement);
    }

    console.log('[ShowBlocksPlugin] Blocks:', this.isEnabled ? 'shown' : 'hidden');
    return true;
  }

  /**
   * Проверка активности плагина
   */
  isActive(editorElement: HTMLElement): boolean {
    return this.isEnabled;
  }

  /**
   * Показать границы блоков
   */
  private showBlocks(editorElement: HTMLElement): void {
    // Добавляем CSS класс к редактору
    editorElement.classList.add('show-blocks');

    // Создаём стили для отображения границ блоков
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'aurora-show-blocks-styles';
      this.styleElement.textContent = this.getBlocksCSS();
      document.head.appendChild(this.styleElement);
    }
  }

  /**
   * Скрыть границы блоков
   */
  private hideBlocks(editorElement: HTMLElement): void {
    // Удаляем CSS класс
    editorElement.classList.remove('show-blocks');

    // Удаляем стили
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * Генерация CSS для отображения границ блоков
   */
  private getBlocksCSS(): string {
    return `
      /* ═══════════════════════════════════════════════════════════════════════
         SHOW BLOCKS STYLES
         ═══════════════════════════════════════════════════════════════════════ */

      .aurora-editor-content.show-blocks {
        /* Базовые настройки */
        --block-border-color: rgba(0, 123, 255, 0.3);
        --block-label-bg: rgba(0, 123, 255, 0.1);
        --block-label-color: rgba(0, 123, 255, 0.8);
        --block-border-width: 1px;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         ПАРАГРАФЫ (P)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-blocks p {
        position: relative;
        border: var(--block-border-width) dashed rgba(0, 123, 255, 0.3);
        padding: 8px 8px 8px 40px !important;
        margin: 4px 0;
        min-height: 24px;
      }

      .aurora-editor-content.show-blocks p::before {
        content: 'P';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(0, 123, 255, 0.8);
        background: rgba(0, 123, 255, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         DIV
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-blocks div {
        position: relative;
        border: var(--block-border-width) dashed rgba(108, 117, 125, 0.3);
        padding: 8px 8px 8px 45px !important;
        margin: 4px 0;
        min-height: 24px;
      }

      .aurora-editor-content.show-blocks div::before {
        content: 'DIV';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(108, 117, 125, 0.8);
        background: rgba(108, 117, 125, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         ЗАГОЛОВКИ (H1-H6)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-blocks h1,
      .aurora-editor-content.show-blocks h2,
      .aurora-editor-content.show-blocks h3,
      .aurora-editor-content.show-blocks h4,
      .aurora-editor-content.show-blocks h5,
      .aurora-editor-content.show-blocks h6 {
        position: relative;
        border: var(--block-border-width) dashed rgba(220, 53, 69, 0.3);
        padding: 8px 8px 8px 40px !important;
        margin: 4px 0;
        min-height: 24px;
      }

      .aurora-editor-content.show-blocks h1::before {
        content: 'H1';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(220, 53, 69, 0.8);
        background: rgba(220, 53, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      .aurora-editor-content.show-blocks h2::before {
        content: 'H2';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(220, 53, 69, 0.8);
        background: rgba(220, 53, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      .aurora-editor-content.show-blocks h3::before {
        content: 'H3';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(220, 53, 69, 0.8);
        background: rgba(220, 53, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      .aurora-editor-content.show-blocks h4::before {
        content: 'H4';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(220, 53, 69, 0.8);
        background: rgba(220, 53, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      .aurora-editor-content.show-blocks h5::before {
        content: 'H5';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(220, 53, 69, 0.8);
        background: rgba(220, 53, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      .aurora-editor-content.show-blocks h6::before {
        content: 'H6';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(220, 53, 69, 0.8);
        background: rgba(220, 53, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         BLOCKQUOTE (Цитаты)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-blocks blockquote {
        position: relative;
        border: var(--block-border-width) dashed rgba(255, 193, 7, 0.3) !important;
        padding: 8px 8px 8px 85px !important;
        margin: 4px 0;
        min-height: 24px;
      }

      .aurora-editor-content.show-blocks blockquote::before {
        content: 'BLOCKQUOTE';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(255, 193, 7, 0.8);
        background: rgba(255, 193, 7, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         СПИСКИ (UL, OL, LI)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-blocks ul,
      .aurora-editor-content.show-blocks ol {
        position: relative;
        border: var(--block-border-width) dashed rgba(40, 167, 69, 0.3);
        padding: 8px 8px 8px 40px !important;
        margin: 4px 0;
        min-height: 24px;
      }

      .aurora-editor-content.show-blocks ul::before {
        content: 'UL';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(40, 167, 69, 0.8);
        background: rgba(40, 167, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      .aurora-editor-content.show-blocks ol::before {
        content: 'OL';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(40, 167, 69, 0.8);
        background: rgba(40, 167, 69, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      .aurora-editor-content.show-blocks li {
        position: relative;
        border: var(--block-border-width) dashed rgba(40, 167, 69, 0.2);
        padding: 4px 4px 4px 30px !important;
        margin: 2px 0;
        min-height: 20px;
      }

      .aurora-editor-content.show-blocks li::before {
        content: 'LI';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 9px;
        font-weight: bold;
        color: rgba(40, 167, 69, 0.7);
        background: rgba(40, 167, 69, 0.08);
        padding: 1px 3px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         PRE (Преформатированный текст)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-blocks pre {
        position: relative;
        border: var(--block-border-width) dashed rgba(111, 66, 193, 0.3);
        padding: 8px 8px 8px 45px !important;
        margin: 4px 0;
        min-height: 24px;
      }

      .aurora-editor-content.show-blocks pre::before {
        content: 'PRE';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(111, 66, 193, 0.8);
        background: rgba(111, 66, 193, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         TABLE (Таблицы)
         ═══════════════════════════════════════════════════════════════════════ */
      .aurora-editor-content.show-blocks table {
        position: relative;
        border: var(--block-border-width) dashed rgba(23, 162, 184, 0.3) !important;
        padding: 8px 8px 8px 55px !important;
        margin: 4px 0;
      }

      .aurora-editor-content.show-blocks table::before {
        content: 'TABLE';
        position: absolute;
        left: 2px;
        top: 2px;
        font-size: 10px;
        font-weight: bold;
        color: rgba(23, 162, 184, 0.8);
        background: rgba(23, 162, 184, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        user-select: none;
        z-index: 1;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         ОБЩИЕ ПРАВИЛА
         ═══════════════════════════════════════════════════════════════════════ */

      /* Убираем лишние отступы у вложенных блоков */
      .aurora-editor-content.show-blocks * + * {
        margin-top: 4px;
      }

      /* Первый элемент без верхнего отступа */
      .aurora-editor-content.show-blocks *:first-child {
        margin-top: 0;
      }

      /* Последний элемент без нижнего отступа */
      .aurora-editor-content.show-blocks *:last-child {
        margin-bottom: 0;
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

    console.log('[ShowBlocksPlugin] Destroyed');
  }

  /**
   * Получить текущее состояние
   */
  getState(): boolean {
    return this.isEnabled;
  }
}
