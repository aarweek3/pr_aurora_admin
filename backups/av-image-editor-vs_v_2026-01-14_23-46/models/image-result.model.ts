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
 * Финальный пакет данных от редактора (Контракт с родителем)
 */
export interface AvImageEditorOutput {
  // Основное
  url: string; // Ссылка на сервер (/uploads/...)
  imageId?: string; // ID в базе
  name: string; // Имя файла (my-photo.webp)

  // Размеры
  width: number;
  height: number;

  // SEO и контент
  alt: string;
  title: string;
  caption: string; // Подпись

  // Поведение и ссылки
  link?: {
    url: string;
    target: '_blank' | '_self';
    isClickable: boolean;
  };

  // Оформление
  align: 'left' | 'center' | 'right' | 'full';

  // Генерируемый HTML (Золотой стандарт Aurora)
  htmlSnippet: string;
}
