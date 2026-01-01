/**
 * ════════════════════════════════════════════════════════════════════════════
 * FOOTNOTES PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для создания и управления сносками в тексте.
 * Поддерживает автоматическую нумерацию, навигацию туда-обратно,
 * и список сносок внизу документа.
 *
 * @module FootnotesPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Интерфейс сноски
 */
export interface Footnote {
  id: string; // Уникальный ID сноски
  number: number; // Номер сноски
  text: string; // Текст сноски
  referenceElement: HTMLElement; // Ссылка в тексте
  contentElement: HTMLElement; // Элемент с текстом сноски
}

/**
 * Плагин сносок
 */
export class FootnotesPlugin implements AuroraPlugin {
  name = 'footnotes';
  title = 'Добавить сноску';
  icon = '¹'; // Верхний индекс 1
  isDropdown = false;

  /**
   * Префикс для ID сносок
   */
  private readonly FOOTNOTE_PREFIX = 'footnote-';

  /**
   * Класс для контейнера сносок
   */
  private readonly FOOTNOTES_CONTAINER_CLASS = 'aurora-footnotes-container';

  /**
   * Класс для ссылки на сноску в тексте
   */
  private readonly FOOTNOTE_REF_CLASS = 'aurora-footnote-ref';

  /**
   * Класс для элемента сноски в списке
   */
  private readonly FOOTNOTE_ITEM_CLASS = 'aurora-footnote-item';

  /**
   * Хранилище сносок для каждого редактора
   */
  private footnotesMap = new WeakMap<HTMLElement, Footnote[]>();

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[FootnotesPlugin] Initialized');
    this.injectStyles();
  }

  /**
   * Выполнить команду создания сноски
   */
  execute(editorElement: HTMLElement): boolean {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      const range = selection.getRangeAt(0);

      // Проверяем, что выделение внутри редактора
      if (!editorElement.contains(range.commonAncestorContainer)) {
        return false;
      }

      // Запрашиваем текст сноски у пользователя
      const footnoteText = prompt('Введите текст сноски:');

      if (!footnoteText || !footnoteText.trim()) {
        return false;
      }

      // Создаём сноску
      this.createFootnote(editorElement, range, footnoteText.trim());

      // Триггерим событие input для обновления состояния
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));

      return true;
    } catch (error) {
      console.error('[FootnotesPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Создать сноску
   */
  private createFootnote(editorElement: HTMLElement, range: Range, footnoteText: string): void {
    try {
      // Получаем или создаём массив сносок для этого редактора
      let footnotes = this.footnotesMap.get(editorElement);
      if (!footnotes) {
        footnotes = [];
        this.footnotesMap.set(editorElement, footnotes);
      }

      // Определяем номер новой сноски
      const footnoteNumber = footnotes.length + 1;
      const footnoteId = `${this.FOOTNOTE_PREFIX}${Date.now()}-${footnoteNumber}`;

      // Создаём ссылку на сноску в тексте
      const refElement = this.createFootnoteReference(footnoteId, footnoteNumber);

      // Вставляем ссылку в текст
      range.deleteContents();
      range.insertNode(refElement);

      // Перемещаем курсор после ссылки
      const selection = window.getSelection();
      range.setStartAfter(refElement);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Создаём или обновляем контейнер сносок
      const container = this.getOrCreateFootnotesContainer(editorElement);

      // Создаём элемент сноски
      const contentElement = this.createFootnoteContent(footnoteId, footnoteNumber, footnoteText);

      // Добавляем сноску в контейнер
      container.appendChild(contentElement);

      // Сохраняем сноску в хранилище
      const footnote: Footnote = {
        id: footnoteId,
        number: footnoteNumber,
        text: footnoteText,
        referenceElement: refElement,
        contentElement: contentElement,
      };
      footnotes.push(footnote);

      console.log(`[FootnotesPlugin] Created footnote #${footnoteNumber}:`, footnoteText);
    } catch (error) {
      console.error('[FootnotesPlugin] Error creating footnote:', error);
    }
  }

  /**
   * Создать ссылку на сноску в тексте
   */
  private createFootnoteReference(id: string, number: number): HTMLElement {
    const sup = document.createElement('sup');
    sup.className = this.FOOTNOTE_REF_CLASS;
    sup.id = `${id}-ref`;
    sup.textContent = `${number}`;
    sup.contentEditable = 'false';
    sup.style.cursor = 'pointer';
    sup.title = 'Перейти к сноске';

    // Добавляем обработчик клика для навигации к сноске
    sup.addEventListener('click', (e) => {
      e.preventDefault();
      const contentElement = document.getElementById(id);
      if (contentElement) {
        contentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        contentElement.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
          contentElement.style.backgroundColor = '';
        }, 1500);
      }
    });

    return sup;
  }

  /**
   * Создать элемент сноски в списке
   */
  private createFootnoteContent(id: string, number: number, text: string): HTMLElement {
    const div = document.createElement('div');
    div.className = this.FOOTNOTE_ITEM_CLASS;
    div.id = id;
    div.contentEditable = 'false';

    // Номер сноски с обратной ссылкой
    const numberSpan = document.createElement('span');
    numberSpan.className = 'aurora-footnote-number';
    numberSpan.textContent = `${number}`;
    numberSpan.style.cursor = 'pointer';
    numberSpan.title = 'Вернуться к тексту';

    // Добавляем обработчик для возврата к тексту
    numberSpan.addEventListener('click', (e) => {
      e.preventDefault();
      const refElement = document.getElementById(`${id}-ref`);
      if (refElement) {
        refElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        refElement.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
          refElement.style.backgroundColor = '';
        }, 1500);
      }
    });

    // Текст сноски
    const textSpan = document.createElement('span');
    textSpan.className = 'aurora-footnote-text';
    textSpan.textContent = text;

    // Кнопка редактирования
    const editBtn = document.createElement('button');
    editBtn.className = 'aurora-footnote-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.editFootnote(id, textSpan);
    });

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'aurora-footnote-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.deleteFootnote(id);
    });

    // Собираем элемент
    div.appendChild(numberSpan);
    div.appendChild(textSpan);
    div.appendChild(editBtn);
    div.appendChild(deleteBtn);

    return div;
  }

  /**
   * Получить или создать контейнер для сносок
   */
  private getOrCreateFootnotesContainer(editorElement: HTMLElement): HTMLElement {
    let container = editorElement.querySelector(
      `.${this.FOOTNOTES_CONTAINER_CLASS}`,
    ) as HTMLElement;

    if (!container) {
      container = document.createElement('div');
      container.className = this.FOOTNOTES_CONTAINER_CLASS;
      container.contentEditable = 'false';

      // Заголовок
      const title = document.createElement('div');
      title.className = 'aurora-footnotes-title';
      title.textContent = 'Сноски:';

      // Разделитель
      const separator = document.createElement('hr');
      separator.className = 'aurora-footnotes-separator';

      container.appendChild(separator);
      container.appendChild(title);

      // Добавляем контейнер в конец редактора
      editorElement.appendChild(container);
    }

    return container;
  }

  /**
   * Редактировать сноску
   */
  private editFootnote(id: string, textElement: HTMLElement): void {
    const currentText = textElement.textContent || '';
    const newText = prompt('Редактировать текст сноски:', currentText);

    if (newText !== null && newText.trim()) {
      textElement.textContent = newText.trim();
      console.log(`[FootnotesPlugin] Edited footnote ${id}`);
    }
  }

  /**
   * Удалить сноску
   */
  private deleteFootnote(id: string): void {
    if (!confirm('Удалить эту сноску?')) {
      return;
    }

    try {
      // Удаляем ссылку из текста
      const refElement = document.getElementById(`${id}-ref`);
      if (refElement) {
        refElement.remove();
      }

      // Удаляем элемент сноски
      const contentElement = document.getElementById(id);
      if (contentElement) {
        const container = contentElement.parentElement;
        contentElement.remove();

        // Если контейнер пуст, удаляем его
        if (container && container.children.length <= 2) {
          // Остались только separator и title
          container.remove();
        }
      }

      // Перенумеровываем оставшиеся сноски
      this.renumberFootnotes();

      console.log(`[FootnotesPlugin] Deleted footnote ${id}`);
    } catch (error) {
      console.error('[FootnotesPlugin] Error deleting footnote:', error);
    }
  }

  /**
   * Перенумеровать все сноски
   */
  private renumberFootnotes(): void {
    try {
      const allRefs = document.querySelectorAll(`.${this.FOOTNOTE_REF_CLASS}`);
      const allItems = document.querySelectorAll(`.${this.FOOTNOTE_ITEM_CLASS}`);

      allRefs.forEach((ref, index) => {
        const newNumber = index + 1;
        ref.textContent = `${newNumber}`;
      });

      allItems.forEach((item, index) => {
        const newNumber = index + 1;
        const numberSpan = item.querySelector('.aurora-footnote-number');
        if (numberSpan) {
          numberSpan.textContent = `${newNumber}`;
        }
      });

      console.log(`[FootnotesPlugin] Renumbered ${allRefs.length} footnotes`);
    } catch (error) {
      console.error('[FootnotesPlugin] Error renumbering footnotes:', error);
    }
  }

  /**
   * Внедрить стили для сносок
   */
  private injectStyles(): void {
    const styleId = 'aurora-footnotes-styles';

    // Проверяем, не добавлены ли стили уже
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Ссылка на сноску в тексте */
      .${this.FOOTNOTE_REF_CLASS} {
        color: #4285f4;
        font-weight: 600;
        padding: 0 2px;
        transition: all 0.2s ease;
      }

      .${this.FOOTNOTE_REF_CLASS}:hover {
        background-color: #e3f2fd;
        border-radius: 2px;
      }

      /* Контейнер сносок */
      .${this.FOOTNOTES_CONTAINER_CLASS} {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 2px solid #e0e0e0;
      }

      .aurora-footnotes-separator {
        margin: 16px 0;
        border: none;
        border-top: 2px solid #e0e0e0;
      }

      .aurora-footnotes-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
      }

      /* Элемент сноски */
      .${this.FOOTNOTE_ITEM_CLASS} {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .${this.FOOTNOTE_ITEM_CLASS}:hover {
        background-color: #f5f5f5;
      }

      .aurora-footnote-number {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #4285f4;
        color: white;
        border-radius: 50%;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .aurora-footnote-number:hover {
        background-color: #3367d6;
        transform: scale(1.1);
      }

      .aurora-footnote-text {
        flex: 1;
        line-height: 1.6;
        color: #555;
        padding-top: 2px;
      }

      .aurora-footnote-btn {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        opacity: 0;
        transition: all 0.2s ease;
      }

      .${this.FOOTNOTE_ITEM_CLASS}:hover .aurora-footnote-btn {
        opacity: 1;
      }

      .aurora-footnote-btn:hover {
        transform: scale(1.2);
      }

      .aurora-footnote-btn:active {
        transform: scale(0.9);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Проверить, активен ли плагин
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[FootnotesPlugin] Destroyed');

    // Удаляем стили
    const styleElement = document.getElementById('aurora-footnotes-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }
}
