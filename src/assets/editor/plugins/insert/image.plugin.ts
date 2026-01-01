import { ImageConfig } from '../../interfaces/image.interfaces';
import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Image Plugin для Aurora Editor
 * Обеспечивает вставку и редактирование изображений
 */
export class ImagePlugin implements AuroraPlugin {
  name = 'image';
  title = 'Вставить изображение';
  icon = '🖼️';

  private savedSelection: Range | null = null;

  /**
   * Выполняет вставку изображения
   */
  execute(editorElement: HTMLElement, options?: any): boolean {
    console.log('🖼️ ImagePlugin.execute() called');

    // Сохраняем текущую позицию курсора
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedSelection = selection.getRangeAt(0).cloneRange();
      console.log('💾 Saved selection:', this.savedSelection);
    }

    // Открываем модальное окно через CustomEvent
    const event = new CustomEvent('openImageModal', {
      detail: {
        callback: (config: ImageConfig, imageUrl: string) => {
          console.log('🖼️ ImagePlugin callback triggered with config:', config);
          this.insertImage(editorElement, config, imageUrl);
        },
      },
    });
    console.log('🖼️ Dispatching openImageModal event');
    document.dispatchEvent(event);
    return true;
  }

  /**
   * Вставляет изображение в редактор
   */
  private insertImage(editorElement: HTMLElement, config: ImageConfig, imageUrl: string): void {
    console.log('🖼️ Inserting image into editor:', { config, imageUrl });

    if (!editorElement) {
      console.error('❌ No content element available');
      return;
    }

    // Устанавливаем фокус на редактор
    editorElement.focus();

    // Даём время на установку фокуса
    setTimeout(() => {
      // Проверяем, является ли imageUrl готовым HTML (содержит <figure)
      if (imageUrl.includes('<figure')) {
        console.log('🖼️ Inserting ready HTML from server');
        this.insertReadyHtml(editorElement, imageUrl);
      } else {
        console.log('🖼️ Creating figure element from URL');
        this.performImageInsertion(editorElement, config, imageUrl);
      }
    }, 100);
  }
  /**
   * Вставляет готовый HTML (от сервера) в редактор
   */
  private insertReadyHtml(editorElement: HTMLElement, html: string): void {
    console.log('🖼️ insertReadyHtml called with HTML:', html.substring(0, 100));

    const selection = window.getSelection();
    let range: Range;

    // Используем сохранённую позицию курсора
    if (this.savedSelection) {
      console.log('✅ Restoring saved selection');
      range = this.savedSelection;
      selection?.removeAllRanges();
      selection?.addRange(range);
      this.savedSelection = null; // Очищаем после использования
    } else if (!selection || selection.rangeCount === 0) {
      console.log('⚠️ No selection available, creating range at end of content');
      range = document.createRange();
      range.selectNodeContents(editorElement);
      range.collapse(false); // В конец

      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      range = selection.getRangeAt(0);

      // Если текст выделен - переместиться после выделения
      if (!range.collapsed) {
        range.collapse(false);
      }
    }

    try {
      // Создаём временный контейнер для парсинга HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const figure = temp.firstElementChild as HTMLElement;

      if (!figure) {
        console.error('❌ Failed to parse HTML into element');
        return;
      }

      console.log('✅ Parsed figure element:', {
        tagName: figure.tagName,
        dataImageId: figure.getAttribute('data-image-id'),
        innerHTML: figure.innerHTML.substring(0, 100),
      });

      // Добавляем обработчик контекстного меню
      this.attachContextMenuHandler(figure);

      // Проверяем, находимся ли мы внутри <p> тега
      let container = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode!;
      }

      // Если мы внутри <p>, нужно выйти из него
      const parentP = (container as HTMLElement).closest('p');
      if (parentP) {
        console.log('⚠️ Range is inside <p>, moving figure outside');

        // Создаём новый range после <p>
        const newRange = document.createRange();
        newRange.setStartAfter(parentP);
        newRange.collapse(true);

        // Вставляем figure после <p>
        newRange.insertNode(figure);

        // Проверяем выравнивание (alignment)
        const alignment = figure.getAttribute('data-align');
        const isFloated = alignment === 'left' || alignment === 'right';

        if (isFloated) {
          // Для float-изображений НЕ создаём пробел - курсор остаётся после figure
          // Пользователь начнёт печатать и браузер создаст <p> автоматически
          newRange.setStartAfter(figure);
          newRange.collapse(true);
        } else {
          // Для обычных изображений (center) - добавляем пробел
          const space = document.createTextNode('\u00A0');
          newRange.setStartAfter(figure);
          newRange.insertNode(space);
          newRange.setStartAfter(space);
          newRange.collapse(true);
        }

        selection?.removeAllRanges();
        selection?.addRange(newRange);
      } else {
        // Вставляем через Range API (обычный путь)
        range.deleteContents();
        range.insertNode(figure);

        // Проверяем выравнивание (alignment)
        const alignment = figure.getAttribute('data-align');
        const isFloated = alignment === 'left' || alignment === 'right';

        if (isFloated) {
          // Для float-изображений НЕ создаём пробел - курсор остаётся после figure
          // Пользователь начнёт печатать и браузер создаст <p> автоматически
          range.setStartAfter(figure);
          range.collapse(true);
        } else {
          // Для обычных изображений (center) - добавляем пробел
          const space = document.createTextNode('\u00A0'); // неразрывный пробел
          range.setStartAfter(figure);
          range.insertNode(space);
          range.setStartAfter(space);
          range.collapse(true);
        }

        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      console.log('✅ Ready HTML successfully inserted');

      // Диспатчим событие для обновления состояния редактора
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (error) {
      console.error('❌ Error inserting ready HTML:', error);

      // Fallback - добавляем в конец
      try {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const figure = temp.firstElementChild as HTMLElement;

        if (figure) {
          const br = document.createElement('br');
          editorElement.appendChild(br);
          editorElement.appendChild(figure);

          console.log('✅ Ready HTML inserted using appendChild fallback');
          editorElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } catch (appendError) {
        console.error('❌ Even appendChild fallback failed:', appendError);
      }
    }
  }

  /**
   * Выполняет вставку изображения в DOM
   */
  private performImageInsertion(
    contentElement: HTMLElement,
    config: ImageConfig,
    imageUrl: string,
  ): void {
    const selection = window.getSelection();
    let range: Range;

    // Используем сохранённую позицию курсора
    if (this.savedSelection) {
      console.log('✅ Restoring saved selection');
      range = this.savedSelection;
      selection?.removeAllRanges();
      selection?.addRange(range);
      this.savedSelection = null; // Очищаем после использования
    } else if (!selection || selection.rangeCount === 0) {
      console.log('⚠️ No selection available, creating range at end of content');
      range = document.createRange();
      range.selectNodeContents(contentElement);
      range.collapse(false); // В конец

      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      range = selection.getRangeAt(0);

      // Если текст выделен - переместиться после выделения
      if (!range.collapsed) {
        range.collapse(false);
      }
    }

    // Создаём figure элемент
    const figure = this.createFigureElement(config, imageUrl);

    try {
      // Вставляем через Range API
      range.deleteContents();
      range.insertNode(figure);

      // Перемещаем курсор после изображения
      range.setStartAfter(figure);
      range.collapse(true);

      selection?.removeAllRanges();
      selection?.addRange(range);

      console.log('✅ Image successfully inserted');

      // Диспатчим событие для обновления состояния редактора
      contentElement.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (error) {
      console.error('❌ Error inserting image:', error);

      // Fallback - добавляем в конец
      try {
        const br = document.createElement('br');
        contentElement.appendChild(br);
        contentElement.appendChild(figure);

        console.log('✅ Image inserted using appendChild fallback');
        contentElement.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (appendError) {
        console.error('❌ Even appendChild failed:', appendError);
      }
    }
  }

  /**
   * Создаёт figure элемент с изображением
   */
  private createFigureElement(config: ImageConfig, imageUrl: string): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'aurora-image';
    figure.setAttribute('data-align', config.alignment);
    figure.setAttribute('data-width', config.width);
    figure.setAttribute('data-image-id', this.generateImageId());

    // Создаём img или a > img
    if (config.linkUrl) {
      const link = document.createElement('a');
      link.href = config.linkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      const img = this.createImageElement(imageUrl, config.alt);
      link.appendChild(img);
      figure.appendChild(link);
    } else {
      const img = this.createImageElement(imageUrl, config.alt);
      figure.appendChild(img);
    }

    // Добавляем caption если есть
    if (config.caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'aurora-image__caption';
      figcaption.textContent = config.caption;
      figure.appendChild(figcaption);
    }

    // Добавляем обработчик контекстного меню
    this.attachContextMenuHandler(figure);

    return figure;
  }

  /**
   * Создаёт img элемент
   */
  private createImageElement(src: string, alt?: string): HTMLImageElement {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.className = 'aurora-image__img';

    // Стили для изображения (будут переопределены через CSS)
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';

    return img;
  }

  /**
   * Добавляет обработчик контекстного меню
   */
  private attachContextMenuHandler(figure: HTMLElement): void {
    figure.addEventListener('contextmenu', (event: Event) => {
      event.preventDefault();
      const mouseEvent = event as MouseEvent;

      // Диспатчим событие для открытия контекстного меню
      const contextMenuEvent = new CustomEvent('showImageContextMenu', {
        detail: {
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
          figure: figure,
        },
      });
      document.dispatchEvent(contextMenuEvent);
    });
  }

  /**
   * Генерирует уникальный ID для изображения
   */
  private generateImageId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Проверяет, может ли плагин быть выполнен
   */
  isActive(editorElement: HTMLElement): boolean {
    return false; // Image plugin не имеет активного состояния
  }

  /**
   * Инициализирует плагин
   */
  init(): void {
    console.log('✅ Image Plugin initialized');

    // Инжектим стили для изображений
    this.injectStyles();
  }
  /**
   * Уничтожает плагин
   */
  destroy(): void {
    console.log('🗑️ Image Plugin destroyed');
  }

  /**
   * Инжектит CSS стили для изображений
   */
  private injectStyles(): void {
    const styleId = 'aurora-image-plugin-styles';

    // Проверяем, не были ли стили уже добавлены
    if (document.getElementById(styleId)) {
      return;
    }

    const styles = `
      .aurora-image {
        display: block;
        margin: 20px 0;
        max-width: 100%;
        transition: outline 0.2s ease;
        clear: both; /* Сбрасываем float предыдущих элементов */
        vertical-align: top; /* Выравнивание по верхнему краю */
      }

      .aurora-image[data-align="left"] {
        float: left !important;
        margin: 0 16px 8px 0 !important;
        clear: none !important; /* Разрешаем обтекание */
        vertical-align: top !important; /* Выравнивание текста по верхнему краю изображения */
      }

      .aurora-image[data-align="center"] {
        margin-left: auto !important;
        margin-right: auto !important;
        margin-top: 20px !important;
        margin-bottom: 20px !important;
        display: table !important;
        float: none !important;
      }

      .aurora-image[data-align="right"] {
        float: right !important;
        margin: 0 0 8px 16px !important;
        clear: none !important; /* Разрешаем обтекание */
        vertical-align: top !important; /* Выравнивание текста по верхнему краю изображения */
      }

      /* Сброс margin только у параграфов, следующих за floated изображением */
      .aurora-image[data-align="left"] ~ p,
      .aurora-image[data-align="right"] ~ p {
        margin-top: 0 !important;
      }

      .aurora-image[data-width="100%"] {
        max-width: 100%;
      }

      .aurora-image[data-width="75%"] {
        max-width: 75%;
      }

      .aurora-image[data-width="50%"] {
        max-width: 50%;
      }

      .aurora-image[data-width="auto"] {
        width: auto;
        max-width: 100%;
      }

      .aurora-image__img {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: 0;
        opacity: 0;
        animation: fadeIn 0.3s ease forwards;
      }

      @keyframes fadeIn {
        to { opacity: 1; }
      }

      .aurora-image__caption {
        display: block;
        text-align: center;
        font-size: 0.9em;
        font-style: italic;
        color: #666;
        margin-top: 8px;
        padding: 0 16px;
      }

      .aurora-image a {
        display: block;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .aurora-image a:hover {
        opacity: 0.9;
      }

      .aurora-image:hover {
        outline: 2px solid #4a90e2;
        outline-offset: 2px;
        cursor: pointer;
      }

      /* ========== CONTAINER STYLES ========== */
      .aurora-image--container {
        position: relative;
        overflow: hidden;
        display: block !important;
      }

      .aurora-image--container .aurora-image__img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Default, can be overridden by inline style */
        border-radius: 0;
      }

      /* Disable hover outline for container images */
      .aurora-image--container:hover {
        outline: 2px solid #4a90e2;
        outline-offset: 2px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .aurora-image {
          max-width: 100% !important;
          width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
      }

      /* Loading state */
      .aurora-image--loading {
        position: relative;
      }

      .aurora-image--loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4a90e2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}
