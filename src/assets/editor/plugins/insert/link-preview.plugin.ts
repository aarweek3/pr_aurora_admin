/**
 * ════════════════════════════════════════════════════════════════════════════
 * LINK PREVIEW PLUGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Плагин для создания красивых превью-карточек ссылок.
 * Загружает Open Graph данные (og:title, og:description, og:image)
 * и создаёт стилизованные карточки в трёх размерах.
 *
 * @module LinkPreviewPlugin
 */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Размеры карточек превью
 */
export enum PreviewSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * Open Graph данные
 */
export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
}

/**
 * Плагин превью ссылок
 */
export class LinkPreviewPlugin implements AuroraPlugin {
  name = 'linkPreview';
  title = 'Превью ссылки';
  icon = '🎴'; // Карточка
  isDropdown = false;

  /**
   * Ссылка на модальное окно (устанавливается из компонента редактора)
   */
  modalComponent?: any;

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[LinkPreviewPlugin] Initialized');
  }

  /**
   * Установить ссылку на модальное окно
   */
  setModalComponent(modalComponent: any): void {
    this.modalComponent = modalComponent;
  }

  /**
   * Выполнить команду вставки превью
   */
  execute(
    editorElement: HTMLElement,
    options?: {
      url?: string;
      size?: PreviewSize;
    }
  ): boolean {
    try {
      // Если есть модальное окно, открываем его
      if (this.modalComponent && !options?.url) {
        this.modalComponent.open();
        return true;
      }

      // Если URL не передан, запрашиваем у пользователя
      const url = options?.url || this.promptForUrl();

      if (!url) {
        console.warn('[LinkPreviewPlugin] No URL provided');
        return false;
      }

      const size = options?.size || PreviewSize.MEDIUM;

      // Загружаем Open Graph данные и вставляем превью
      this.fetchOpenGraphData(url)
        .then((data) => {
          this.insertPreviewCard(editorElement, data, size);
        })
        .catch((error) => {
          console.error('[LinkPreviewPlugin] Error fetching OG data:', error);
          // Если не удалось загрузить OG данные, вставляем базовую карточку
          this.insertPreviewCard(
            editorElement,
            {
              title: url,
              description: '',
              image: '',
              url: url,
            },
            size
          );
        });

      return true;
    } catch (error) {
      console.error('[LinkPreviewPlugin] Error executing plugin:', error);
      return false;
    }
  }

  /**
   * Запросить URL у пользователя
   */
  private promptForUrl(): string | null {
    const url = prompt('Введите URL для создания превью:');
    return url?.trim() || null;
  }

  /**
   * Загрузить Open Graph данные
   *
   * ПРИМЕЧАНИЕ: В реальном приложении нужен backend API для загрузки OG данных,
   * так как браузер не может напрямую загружать мета-теги из-за CORS.
   * Здесь используется упрощённая версия для демонстрации.
   */
  private async fetchOpenGraphData(url: string): Promise<OpenGraphData> {
    // В production версии нужно отправить запрос на backend:
    // const response = await fetch(`/api/og-data?url=${encodeURIComponent(url)}`);
    // const data = await response.json();
    // return data;

    // Для демонстрации возвращаем mock данные
    // В реальном приложении замените это на настоящий API запрос
    return new Promise((resolve, reject) => {
      // Симуляция загрузки
      setTimeout(() => {
        // Пытаемся извлечь данные из URL
        const domain = this.extractDomain(url);

        resolve({
          title: `Ссылка на ${domain}`,
          description: 'Описание ссылки будет загружено автоматически при использовании backend API',
          image: '', // Пустое изображение, можно добавить placeholder
          url: url,
          siteName: domain,
        });
      }, 300);
    });
  }

  /**
   * Извлечь домен из URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'Неизвестный сайт';
    }
  }

  /**
   * Вставить карточку превью в редактор
   */
  private insertPreviewCard(
    editorElement: HTMLElement,
    data: OpenGraphData,
    size: PreviewSize
  ): void {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);

      // Проверяем, что выделение внутри редактора
      if (!editorElement.contains(range.commonAncestorContainer)) {
        return;
      }

      // Создаём карточку превью
      const card = this.createPreviewCard(data, size);

      // Вставляем карточку
      range.deleteContents();
      range.insertNode(card);

      // Добавляем пустой параграф после карточки для продолжения ввода
      const nextP = document.createElement('p');
      nextP.innerHTML = '<br>';
      card.parentNode?.insertBefore(nextP, card.nextSibling);

      // Перемещаем курсор в новый параграф
      const newRange = document.createRange();
      newRange.setStart(nextP, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      // Триггерим событие input для обновления состояния
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (error) {
      console.error('[LinkPreviewPlugin] Error inserting preview card:', error);
    }
  }

  /**
   * Создать HTML элемент карточки превью
   */
  private createPreviewCard(data: OpenGraphData, size: PreviewSize): HTMLElement {
    const card = document.createElement('div');
    card.className = `aurora-link-preview aurora-link-preview--${size}`;
    card.contentEditable = 'false'; // Карточка не редактируется

    // Создаём структуру карточки в зависимости от размера
    switch (size) {
      case PreviewSize.SMALL:
        card.innerHTML = this.createSmallCard(data);
        break;
      case PreviewSize.MEDIUM:
        card.innerHTML = this.createMediumCard(data);
        break;
      case PreviewSize.LARGE:
        card.innerHTML = this.createLargeCard(data);
        break;
    }

    // Добавляем обработчик клика для открытия ссылки
    card.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(data.url, '_blank', 'noopener,noreferrer');
    });

    return card;
  }

  /**
   * Создать компактную карточку (small)
   */
  private createSmallCard(data: OpenGraphData): string {
    return `
      <div class="aurora-link-preview__content">
        ${data.image ? `<div class="aurora-link-preview__image" style="background-image: url('${this.escapeHtml(data.image)}')"></div>` : ''}
        <div class="aurora-link-preview__text">
          <div class="aurora-link-preview__title">${this.escapeHtml(data.title)}</div>
          <div class="aurora-link-preview__url">🔗 ${this.escapeHtml(this.extractDomain(data.url))}</div>
        </div>
      </div>
    `;
  }

  /**
   * Создать стандартную карточку (medium)
   */
  private createMediumCard(data: OpenGraphData): string {
    return `
      ${data.image ? `<div class="aurora-link-preview__image" style="background-image: url('${this.escapeHtml(data.image)}')"></div>` : ''}
      <div class="aurora-link-preview__content">
        <div class="aurora-link-preview__title">${this.escapeHtml(data.title)}</div>
        ${data.description ? `<div class="aurora-link-preview__description">${this.escapeHtml(data.description)}</div>` : ''}
        <div class="aurora-link-preview__url">🔗 ${this.escapeHtml(data.url)}</div>
      </div>
    `;
  }

  /**
   * Создать полную карточку (large)
   */
  private createLargeCard(data: OpenGraphData): string {
    return `
      ${data.image ? `<div class="aurora-link-preview__image aurora-link-preview__image--large" style="background-image: url('${this.escapeHtml(data.image)}')"></div>` : ''}
      <div class="aurora-link-preview__content">
        ${data.siteName ? `<div class="aurora-link-preview__site-name">${this.escapeHtml(data.siteName)}</div>` : ''}
        <div class="aurora-link-preview__title aurora-link-preview__title--large">${this.escapeHtml(data.title)}</div>
        ${data.description ? `<div class="aurora-link-preview__description">${this.escapeHtml(data.description)}</div>` : ''}
        <div class="aurora-link-preview__url">
          <span class="aurora-link-preview__url-icon">🔗</span>
          <span>${this.escapeHtml(data.url)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Экранировать HTML для безопасности
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    console.log('[LinkPreviewPlugin] Destroyed');
  }
}
