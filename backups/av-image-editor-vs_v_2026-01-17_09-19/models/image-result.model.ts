/**
 * Результат работы редактора изображений.
 * Этот объект возвращается вызывающему коду (форме, TinyMCE и т.д.)
 */
export interface AvImageUploadResult {
  /**
   * Объект File (для отправки формой, если нужно)
   */
  file?: File;

  /**
   * Base64 URL (сразу после редактирования)
   * ИЛИ
   * Относительный путь на сервере (после успешного сохранения), например "/uploads/..."
   */
  dataUrl: string;

  /**
   * Имя файла (например "image.webp")
   */
  name: string;

  /**
   * ID изображения в базе данных (если сохранено на сервере)
   */
  imageId?: string;

  /**
   * Ширина в пикселях
   */
  width: number;

  /**
   * Высота в пикселях
   */
  height: number;

  /**
   * Размер файла в байтах
   */
  size: number;

  /**
   * SEO и прочие метаданные
   */
  metadata?: AvImageMetadata;

  /**
   * Флаг подтверждения (техническое поле для модального окна)
   */
  isConfirmed?: boolean;
}

export interface AvImageMetadata {
  fileName?: string;
  altText?: string;
  titleText?: string;
  caption?: string;
  description?: string;
  align?: 'left' | 'center' | 'right' | 'full'; // Для совместимости
  linkUrl?: string;
  isClickable?: boolean;
  isOpenNewWindow?: boolean;
  quality?: number;
}

/**
 * Финальный контракт данных, которые получает родитель от редактора Aurora.
 * Этот объект содержит всё необходимое для вставки в контент или сохранения в БД.
 */
export interface AvImageEditorOutput {
  // --- Пути и идентификация ---
  url: string; // Финальный URL на сервере ИЛИ base64 для превью
  imageId?: string; // ID из базы данных (если есть)
  name: string; // Имя файла (например, "summer-sale-banner")

  // --- Технические характеристики ---
  width: number; // Ширина результата
  height: number; // Высота результата
  size: number; // Вес в байтах
  format: 'image/jpeg' | 'image/png' | 'image/webp'; // Формат

  // --- SEO и Контент ---
  alt: string; // Alt текст (обязателен для SEO)
  title: string; // Title текст
  caption: string; // Подпись под картинкой (физическая подпись)
  description?: string; // Полное описание (если нужно)

  // --- Ссылки и Переходы ---
  link?: {
    url: string; // URL ссылки на картинке
    isClickable: boolean;
    target: '_blank' | '_self';
  };

  // --- Визуальное оформление ---
  align: 'left' | 'center' | 'right' | 'full';

  // --- Контейнер (Container Mode) ---
  container?: {
    enabled: boolean;
    width: number;
    height: number;
  };

  // --- Готовые сниппеты ---
  /**
   * Готовый HTML код для вставки.
   * Сгенерирован по стандартам Aurora (через AvImageSnippetService).
   */
  htmlSnippet: string;
}

/**
 * Конфигурация для генератора сниппетов.
 */
export interface AvImageSnippetConfig {
  url: string;
  imageId?: string;
  alt: string;
  title?: string;
  caption?: string;
  align: 'left' | 'center' | 'right' | 'full';
  width: number;
  height: number;
  link?: {
    url: string;
    isClickable: boolean;
    target: '_blank' | '_self';
  };
  container?: {
    enabled: boolean;
    width: number;
    height: number;
  };
}
