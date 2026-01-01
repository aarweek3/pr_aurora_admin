/**
 * ════════════════════════════════════════════════════════════════════════════
 * CONTENT INSERTION SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для вставки сложного контента в редактор (YouTube, таблицы, изображения).
 *
 * Отвечает за:
 * - Вставку YouTube видео с сохранением позиции курсора
 * - Вставку таблиц
 * - Вставку изображений с настройками
 * - Вставку link preview
 * - Утилиты для работы с Range и Selection
 *
 * @module ContentInsertionService
 */

import { Injectable } from '@angular/core';

/**
 * Настройки YouTube видео
 */
export interface YouTubeSettings {
  url: string;
  width: number;
  height: number;
  alignment: 'left' | 'center' | 'right';
  allowFullscreen: boolean;
}

/**
 * Настройки таблицы
 */
export interface TableConfig {
  rows: number;
  cols: number;
  headerRow: boolean;
  borderStyle: 'none' | 'light' | 'medium' | 'heavy';
}

/**
 * Настройки изображения
 */
export interface ImageConfig {
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  alignment: 'left' | 'center' | 'right';
}

/**
 * Сервис для вставки контента в редактор
 */
@Injectable({
  providedIn: 'root',
})
export class ContentInsertionService {
  /**
   * Сохраненная позиция курсора для восстановления после модального окна
   */
  private savedRange: Range | null = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // YOUTUBE ВИДЕО
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Сохраняет текущую позицию курсора перед открытием YouTube модального окна
   */
  saveRangeForYouTube(): void {
    this.savedRange = this.saveCurrentRange();
    console.log('[ContentInsertion] Range saved for YouTube modal');
  }

  /**
   * Вставляет YouTube видео в редактор
   *
   * @param editor - DOM элемент редактора
   * @param settings - Настройки YouTube видео
   * @param savedRange - Сохраненная позиция курсора (опционально)
   */
  insertYouTubeVideo(editor: HTMLElement, settings: YouTubeSettings, savedRange?: Range): void {
    console.log('[ContentInsertion] 🎬 Inserting YouTube video:', settings);
    console.log(
      '[ContentInsertion] 📍 Editor element:',
      editor.tagName,
      editor.id || editor.className,
    );
    console.log('[ContentInsertion] 📍 Editor contentEditable:', editor.contentEditable);
    console.log('[ContentInsertion] 📍 Editor innerHTML length:', editor.innerHTML.length);

    // Убеждаемся, что редактор редактируемый
    if (editor.contentEditable === 'false' || !editor.isContentEditable) {
      console.error('[ContentInsertion] ❌ Editor is not contenteditable');
      return;
    }

    // Получаем video ID из URL
    const videoId = this.extractYouTubeVideoId(settings.url);
    if (!videoId) {
      console.error('[ContentInsertion] ❌ Invalid YouTube URL:', settings.url);
      return;
    }

    console.log('[ContentInsertion] 🆔 Extracted video ID:', videoId);

    // Создаем HTML для YouTube iframe
    const youtubeHtml = this.createYouTubeIframe(videoId, settings);
    console.log('[ContentInsertion] 🔧 Generated YouTube HTML length:', youtubeHtml.length);

    // Фокусируем редактор
    editor.focus();

    // Используем переданный range или сохраненный
    const rangeToRestore = savedRange || this.savedRange;

    if (rangeToRestore) {
      // Восстанавливаем позицию курсора
      this.restoreRange(rangeToRestore);
      console.log('[ContentInsertion] 🔄 Range restored for YouTube insertion');
    }

    // Получаем текущий selection
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('[ContentInsertion] ⚠️ No selection found, creating range at end');

      // Создаем range в конце редактора
      const range = document.createRange();
      if (editor.childNodes.length > 0) {
        range.setStartAfter(editor.lastChild!);
      } else {
        range.setStart(editor, 0);
      }
      range.collapse(true);

      selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    if (!selection || selection.rangeCount === 0) {
      console.warn('[ContentInsertion] ❌ Still no selection, using fallback insertion');
      editor.insertAdjacentHTML('beforeend', youtubeHtml);
      return;
    }

    const range = selection.getRangeAt(0);
    console.log('[ContentInsertion] 📍 Current range container:', range.startContainer.nodeName);

    try {
      // Создаем временный div для YouTube
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = youtubeHtml;
      const youtubeContainer = tempDiv.firstChild as HTMLElement;

      if (!youtubeContainer) {
        throw new Error('Failed to create YouTube container from HTML');
      }

      // Удаляем любое выделение
      range.deleteContents();

      // Вставляем YouTube контейнер
      range.insertNode(youtubeContainer);
      console.log('[ContentInsertion] 🔧 YouTube container inserted via range.insertNode');

      // Создаем пустой параграф после видео для продолжения набора текста
      const nextP = this.createEmptyParagraph();
      youtubeContainer.insertAdjacentElement('afterend', nextP);

      // Устанавливаем курсор в новый параграф
      this.setCursorToElement(nextP);

      console.log(
        '[ContentInsertion] 📍 Editor content length after insert:',
        editor.innerHTML.length,
      );
    } catch (error) {
      console.error('[ContentInsertion] ❌ Error with range insertion, trying execCommand:', error);

      try {
        const success = document.execCommand('insertHTML', false, youtubeHtml);
        console.log('[ContentInsertion] 🔄 execCommand insertHTML result:', success);
      } catch (execError) {
        console.error(
          '[ContentInsertion] ❌ execCommand also failed, using direct insertion:',
          execError,
        );
        editor.insertAdjacentHTML('beforeend', youtubeHtml);
      }
    }

    // Очищаем сохраненный range
    this.savedRange = null;

    console.log('[ContentInsertion] ✅ YouTube video insertion completed');
  }

  /**
   * Извлекает video ID из YouTube URL
   */
  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Создает HTML для YouTube iframe
   */
  private createYouTubeIframe(videoId: string, settings: YouTubeSettings): string {
    const { width, height, alignment, allowFullscreen } = settings;

    const alignClass = alignment !== 'left' ? ` align-${alignment}` : '';
    const fullscreenAttr = allowFullscreen ? ' allowfullscreen' : '';

    return `
      <div class="youtube-container${alignClass}" style="margin: 1rem 0;">
        <iframe
          width="${width}"
          height="${height}"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"${fullscreenAttr}>
        </iframe>
      </div>
      <p><br></p>
    `.trim();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ТАБЛИЦЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Вставляет таблицу в редактор
   */
  insertTable(editor: HTMLElement, config: TableConfig): void {
    console.log('[ContentInsertion] 📋 Inserting table:', config);

    const tableHtml = this.createTableHtml(config);
    document.execCommand('insertHTML', false, tableHtml);

    console.log('[ContentInsertion] ✅ Table inserted successfully');
  }

  /**
   * Создает HTML для таблицы
   */
  private createTableHtml(config: TableConfig): string {
    const { rows, cols, headerRow, borderStyle } = config;

    let html = `<table class="editor-table border-${borderStyle}">`;

    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        const tag = headerRow && r === 0 ? 'th' : 'td';
        html += `<${tag}>&nbsp;</${tag}>`;
      }
      html += '</tr>';
    }

    html += '</table><p><br></p>';
    return html;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ИЗОБРАЖЕНИЯ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Вставляет изображение в редактор
   */
  insertImage(editor: HTMLElement, config: ImageConfig, url: string): void {
    console.log('[ContentInsertion] 🖼️ Inserting image:', { config, url });

    const imageHtml = this.createImageHtml(url, config);
    document.execCommand('insertHTML', false, imageHtml);

    console.log('[ContentInsertion] ✅ Image inserted successfully');
  }

  /**
   * Создает HTML для изображения
   */
  private createImageHtml(url: string, config: ImageConfig): string {
    const { alt, title, width, height, alignment } = config;

    let style = '';
    if (width) style += `width: ${width}px; `;
    if (height) style += `height: ${height}px; `;
    if (alignment !== 'left') style += `text-align: ${alignment}; `;

    const titleAttr = title ? ` title="${title}"` : '';
    const styleAttr = style ? ` style="${style}"` : '';

    return `<img src="${url}" alt="${alt}"${titleAttr}${styleAttr}><br>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LINK PREVIEW
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Вставляет link preview в редактор
   */
  insertLinkPreview(editor: HTMLElement, url: string, size: string): void {
    console.log('[ContentInsertion] 🔗 Inserting link preview:', { url, size });

    const previewHtml = this.createLinkPreviewHtml(url, size);
    document.execCommand('insertHTML', false, previewHtml);

    console.log('[ContentInsertion] ✅ Link preview inserted successfully');
  }

  /**
   * Создает HTML для link preview
   */
  private createLinkPreviewHtml(url: string, size: string): string {
    return `
      <div class="link-preview ${size}">
        <a href="${url}" target="_blank" rel="noopener noreferrer">
          ${url}
        </a>
      </div>
      <p><br></p>
    `.trim();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // УТИЛИТЫ ДЛЯ РАБОТЫ С RANGE И SELECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Сохраняет текущую позицию курсора
   */
  private saveCurrentRange(): Range | null {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  }

  /**
   * Восстанавливает позицию курсора
   */
  private restoreRange(range: Range): void {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Создает пустой параграф
   */
  private createEmptyParagraph(): HTMLParagraphElement {
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    return p;
  }

  /**
   * Устанавливает курсор в начало элемента
   */
  private setCursorToElement(element: HTMLElement): void {
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.setStart(element, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
