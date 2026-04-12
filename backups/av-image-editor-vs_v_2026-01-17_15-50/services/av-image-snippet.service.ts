import { Injectable } from '@angular/core';
import { AvImageSnippetConfig } from '../models/image-result.model';

/**
 * Сервис для генерации эталонного HTML-кода (сниппета) изображения.
 * Построено на основе логики TinyMCE плагина, но с использованием чистых классов и BEM.
 */
@Injectable({
  providedIn: 'root',
})
export class AvImageSnippetService {
  /**
   * Генерирует финальный HTML код на основе конфигурации.
   */
  buildHtml(config: AvImageSnippetConfig): string {
    const { url, imageId, alt, title, caption, align, width, height, link, container } = config;

    // 1. Формируем список классов для figure
    const figureClasses = ['av-image'];
    figureClasses.push(`av-image--align-${align}`);

    if (container?.enabled) {
      figureClasses.push('av-image--container');
    }

    // 2. Стили для figure (только размеры для контейнера)
    let figureStyles = '';
    if (container?.enabled) {
      figureStyles = ` style="width: ${container.width}px; height: ${container.height}px;"`;
    }

    // 3. Атрибуты данных
    const dataAttrs = imageId ? ` data-image-id="${this.escapeHtml(imageId)}"` : '';

    // 4. Формируем <img>
    let imgHtml = `<img src="${url}" class="av-image__img" alt="${this.escapeHtml(alt || '')}"`;
    if (title) {
      imgHtml += ` title="${this.escapeHtml(title)}"`;
    }
    // Пишем оригинальные размеры для браузера
    imgHtml += ` width="${width}" height="${height}" />`;

    // 5. Оборачиваем в ссылку, если нужно
    let contentHtml = imgHtml;
    if (link?.isClickable && link.url) {
      const target = link.target === '_blank' ? ' target="_blank" rel="noopener"' : '';
      contentHtml = `<a href="${this.escapeHtml(
        link.url,
      )}"${target} class="av-image__link">${imgHtml}</a>`;
    }

    // 6. Формируем подпись
    const captionHtml = caption
      ? `\n  <figcaption class="av-image__caption">${this.escapeHtml(caption)}</figcaption>`
      : '';

    // 7. Сборка всего воедину
    return `<figure class="${figureClasses.join(' ')}"${figureStyles}${dataAttrs}>
  ${contentHtml}${captionHtml}
</figure>`.trim();
  }

  /**
   * Экранирование спецсимволов для безопасности HTML
   */
  private escapeHtml(str: string): string {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
