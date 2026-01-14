/**
 * Входная конфигурация редактора
 */
export interface ImageEditorConfig {
  /** Изображение для редактирования (URL, Base64 или File) */
  image: string | File;
  /** Заголовок окна */
  title?: string;
  /** Жесткое ограничение пропорций (например, 16/9) */
  forcedAspectRatio?: number;
  /** Качество по умолчанию (0-100) */
  defaultQuality?: number;
  /** Формат по умолчанию */
  defaultFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Максимальный вес файла для экспорта (байт) */
  maxExportSize?: number;
}

/**
 * Результат работы редактора
 */
export interface ImageEditorResult {
  /** Обработанный файл */
  file: Blob;
  /** Превью (Base64) */
  dataUrl: string;
  /** Финальные размеры */
  dimensions: {
    width: number;
    height: number;
  };
  /** Примененные настройки */
  settings: {
    format: string;
    quality: number;
  };
}
