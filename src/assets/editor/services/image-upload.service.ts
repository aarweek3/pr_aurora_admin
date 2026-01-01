import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImageUploadResult {
  success: boolean;
  imageId?: string;
  imageUrl?: string;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface BuildHtmlOptions {
  imageUrl: string;
  imageId: string;
  alt?: string;
  title?: string;
  caption?: string;
  width?: string | number; // Может быть "100%", "500px" или число
  height?: number;
  clickable?: boolean;
  openInNewWindow?: boolean;
  alignment?: 'left' | 'right' | 'center'; // Выравнивание с обтеканием
  linkUrl?: string; // URL для ссылки на изображении
  containerSettings?: {
    // Настройки контейнера с фиксированными размерами
    useContainer: boolean;
    containerWidth: number;
    containerHeight: number;
    objectFit: 'cover' | 'fill';
  };
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  constructor(private http: HttpClient) {}

  /**
   * Загрузить изображение на сервер
   * @param dataUrl - Data URL изображения
   * @param fileName - Имя файла
   * @returns Результат загрузки с ID и URL
   */
  async uploadImageToServer(
    dataUrl: string,
    fileName: string = 'image.png',
  ): Promise<ImageUploadResult> {
    try {
      // Конвертируем Data URL в Blob
      const blob = this.dataUrlToBlob(dataUrl);

      // Создаём FormData для отправки
      const formData = new FormData();
      formData.append('image', blob, fileName);

      // Отправляем на сервер
      const response = await firstValueFrom(
        this.http.post<{ imageId: string; imageUrl: string }>(
          `${environment.apiUrl}/images/upload`,
          formData,
        ),
      );

      return {
        success: true,
        imageId: response.imageId,
        imageUrl: response.imageUrl,
      };
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Построить HTML разметку для вставки изображения в редактор
   * Согласно ТЗ: ВСЕГДА используется <figure> с data-image-id на обёртке
   * Поддерживает:
   * - Выравнивание (left/right/center) с обтеканием текстом
   * - Контейнер с фиксированными размерами и object-fit
   * - Ссылки на изображении
   * - Caption (подпись)
   *
   * @param options - Параметры для построения HTML
   * @returns HTML строка для вставки в редактор
   */
  buildImageHtml(options: BuildHtmlOptions): string {
    const {
      imageUrl,
      imageId,
      alt = '',
      title = '',
      caption = '',
      width,
      height,
      clickable = false,
      openInNewWindow = false,
      alignment = 'center',
      linkUrl = '',
      containerSettings,
    } = options;

    // Экранируем HTML для безопасности
    const escapedAlt = this.escapeHtml(alt);
    const escapedTitle = this.escapeHtml(title);
    const escapedCaption = this.escapeHtml(caption);

    // 1. Построить атрибуты для <figure>
    const figureAttrs: string[] = [];

    // Добавляем класс aurora-image для применения стилей из ImagePlugin
    let figureClass = 'aurora-image';
    if (containerSettings?.useContainer) {
      figureClass += ' aurora-image--container';
    }
    figureAttrs.push(`class="${figureClass}"`);

    // data-image-id для идентификации
    figureAttrs.push(`data-image-id="${this.escapeHtml(imageId)}"`);

    // data-align и data-width для совместимости с существующими стилями
    figureAttrs.push(`data-align="${alignment}"`);
    const widthValue = width || '100%';
    figureAttrs.push(`data-width="${widthValue}"`);

    // 2. Построить style для <figure> (дополнительно к data-атрибутам)
    const figureStyles: string[] = [];

    // ========== КОНТЕЙНЕР ==========
    if (containerSettings?.useContainer) {
      // Фиксированные размеры контейнера
      figureStyles.push(`width: ${containerSettings.containerWidth}px`);
      figureStyles.push(`height: ${containerSettings.containerHeight}px`);
      figureStyles.push(`overflow: hidden`);
      figureStyles.push(`display: block`); // Для корректного отображения контейнера

      // Выравнивание контейнера
      if (alignment === 'left') {
        figureStyles.push(`float: left`);
        figureStyles.push(`margin: 0 16px 8px 0`);
      } else if (alignment === 'right') {
        figureStyles.push(`float: right`);
        figureStyles.push(`margin: 0 0 8px 16px`);
      } else if (alignment === 'center') {
        figureStyles.push(`margin-left: auto`);
        figureStyles.push(`margin-right: auto`);
      }
    } else {
      // ========== БЕЗ КОНТЕЙНЕРА (старая логика) ==========
      // Выравнивание и обтекание
      if (alignment === 'left') {
        // Обтекание справа
        figureStyles.push(`float: left`);
        figureStyles.push(`margin: 0 16px 8px 0`); // Убираем верхний margin!
      } else if (alignment === 'right') {
        // Обтекание слева
        figureStyles.push(`float: right`);
        figureStyles.push(`margin: 0 0 8px 16px`); // Убираем верхний margin!
      } else if (alignment === 'center') {
        // Центрирование без обтекания
        figureStyles.push(`margin-left: auto`);
        figureStyles.push(`margin-right: auto`);
        figureStyles.push(`display: table`); // display: table позволяет контейнеру принять ширину содержимого
      }

      // Ширина
      if (width && width !== 'auto') {
        const widthStr = typeof width === 'string' ? width : `${width}px`;
        // Для процентов используем max-width, чтобы изображение не растягивалось больше натуральной ширины
        if (widthStr.includes('%')) {
          figureStyles.push(`max-width: ${widthStr}`);
        } else {
          // Для пикселей используем точную ширину
          figureStyles.push(`width: ${widthStr}`);
        }
      }
    }

    if (figureStyles.length > 0) {
      figureAttrs.push(`style="${figureStyles.join('; ')}"`);
    }

    // 3. Построить <img> тег с классом aurora-image__img
    const imgStyles: string[] = [];

    if (containerSettings?.useContainer) {
      // В контейнере: изображение всегда заполняет контейнер
      imgStyles.push(`width: 100%`);
      imgStyles.push(`height: 100%`);
      imgStyles.push(`object-fit: ${containerSettings.objectFit}`);
    }

    const imgStyleAttr = imgStyles.length > 0 ? ` style="${imgStyles.join('; ')}"` : '';
    const imgTag = `<img class="aurora-image__img" src="${this.escapeHtml(
      imageUrl,
    )}" alt="${escapedAlt}"${escapedTitle ? ` title="${escapedTitle}"` : ''}${imgStyleAttr} />`;

    // 4. Обернуть в <a> если есть linkUrl или clickable
    const finalLinkUrl = linkUrl || (clickable ? imageUrl : '');
    const imageContent = finalLinkUrl
      ? `<a href="${this.escapeHtml(finalLinkUrl)}"${
          openInNewWindow ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>${imgTag}</a>`
      : imgTag;

    // 5. Добавить <figcaption> если есть caption
    const captionTag = caption
      ? `<figcaption class="aurora-image__caption">${escapedCaption}</figcaption>`
      : '';

    // 6. Собрать финальный HTML
    const figureTag = `<figure ${figureAttrs.join(' ')}>${imageContent}${captionTag}</figure>`;

    console.log('✅ buildImageHtml result:', {
      imageUrl,
      imageId,
      alt: escapedAlt,
      caption: escapedCaption,
      linkUrl: finalLinkUrl,
      width: widthValue,
      alignment,
      containerSettings,
      html: figureTag,
    });

    return figureTag;
  }

  /**
   * Получить размеры изображения из Data URL
   * @param dataUrl - Data URL изображения
   * @returns Размеры изображения
   */
  async getImageDimensions(dataUrl: string): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = dataUrl;
    });
  }

  /**
   * Конвертировать Data URL в Blob
   * @param dataUrl - Data URL для конвертации
   * @returns Blob объект
   */
  private dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(parts[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  }

  /**
   * Экранировать HTML спецсимволы
   * @param text - Текст для экранирования
   * @returns Экранированный текст
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Получить формат изображения из Data URL
   * @param dataUrl - Data URL изображения
   * @returns Формат (png, jpeg, webp и т.д.)
   */
  getImageFormat(dataUrl: string): string {
    const match = dataUrl.match(/^data:image\/(\w+);base64,/);
    return match ? match[1] : 'png';
  }

  /**
   * Генерировать имя файла на основе формата
   * @param format - Формат изображения (png, jpeg, webp)
   * @param prefix - Префикс для имени файла
   * @returns Имя файла
   */
  generateFileName(format: string = 'png', prefix: string = 'image'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.${format}`;
  }
}
