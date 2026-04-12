import { Injectable } from '@angular/core';
import { AvImageUploadResult } from '../models/image-result.model';

/**
 * Сервис для генерации HTML-кода изображений (тег <figure>).
 * Используется для совместимости с TinyMCE и легаси-системами,
 * где требуется готовая верстка.
 */
@Injectable({
  providedIn: 'root',
})
export class AvImageFormatterService {
  /**
   * Генерирует HTML-код тега <figure> по стандарту Aurora.
   */
  generateFigureHtml(result: AvImageUploadResult): string {
    const meta = result.metadata || {};
    const url = result.dataUrl;

    const useContainer = false; // Пока хардкод, но можно расширить модель, если понадобится контейнер
    const alignment = meta.align || 'center';

    // 1. Формируем стили для <figure>
    const figureStyles: string[] = [];

    // Для совместимости с логикой плагина, если ширина не Auto, ставим ее
    // В нашем случае мы всегда знаем ширину result.width
    // Но часто хотят responsive, поэтому по умолчанию max-width: 100%
    figureStyles.push('max-width: 100%');

    if (alignment === 'left') {
      figureStyles.push('float: left', 'margin: 0 16px 8px 0');
    } else if (alignment === 'right') {
      figureStyles.push('float: right', 'margin: 0 0 8px 16px');
    } else if (alignment === 'center') {
      figureStyles.push('margin-left: auto', 'margin-right: auto', 'display: table');
    } else if (alignment === 'full') {
      figureStyles.push('width: 100%', 'display: block', 'margin: 0 0 16px 0');
    }

    // Добавляем ширину, если это не Full
    if (alignment !== 'full') {
      // Если хотим фиксированную ширину картинки
      // figureStyles.push(`width: ${result.width}px`);
      // Но обычно лучше auto
      figureStyles.push('width: auto');
    }

    // 2. Формируем контент (img или a > img)
    const imgStyle = 'max-width: 100%; height: auto; vertical-align: middle;';

    let imgTag = `<img class="aurora-image__img" src="${this.escape(url)}"`;
    if (meta.altText) imgTag += ` alt="${this.escape(meta.altText)}"`;
    if (meta.titleText) imgTag += ` title="${this.escape(meta.titleText)}"`;
    imgTag += ` style="${imgStyle}">`;

    let content = imgTag;

    // Если есть ссылка
    if (meta.linkUrl && meta.isClickable) {
      const target = meta.isOpenNewWindow ? ' target="_blank" rel="noopener noreferrer"' : '';
      content = `<a href="${this.escape(meta.linkUrl)}"${target}>${imgTag}</a>`;
    }

    // 3. Caption
    let captionTag = '';
    if (meta.caption) {
      captionTag = `<figcaption class="aurora-image__caption">${this.escape(
        meta.caption,
      )}</figcaption>`;
    }

    // 4. Сборка
    // data-атрибуты нужны для JS-плагинов на фронтенде
    const figureHtml = `
<figure class="aurora-image"
  data-image-id="${this.escape(result.imageId || '')}"
  data-align="${alignment}"
  data-width="${result.width}px"
  style="${figureStyles.join('; ')}">
  ${content}
  ${captionTag}
</figure>`.trim();

    return figureHtml;
  }

  private escape(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
