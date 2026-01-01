/**
 * Image Plugin Interfaces
 * Интерфейсы для работы с изображениями в Aurora Editor
 */

/**
 * Конфигурация изображения
 */
export interface ImageConfig {
  /** Источник загрузки: URL, файл или drag & drop */
  source: 'url' | 'file' | 'drop';

  /** URL изображения (если source = 'url') */
  url?: string;

  /** Файл изображения (если source = 'file' или 'drop') */
  file?: File;

  /** Base64 данные изображения */
  base64?: string;

  /** Alt текст для accessibility */
  alt?: string;

  /** Подпись под изображением */
  caption?: string;

  /** Title - описание при наведении на изображение */
  title?: string;

  /** Ширина: '100%', '75%', '50%', 'auto', '500px' */
  width: string;

  /** Выравнивание изображения */
  alignment: 'left' | 'center' | 'right';

  /** URL ссылки (сделать изображение кликабельным) */
  linkUrl?: string;

  /** Сделать изображение кликабельным */
  clickable?: boolean;

  /** Открывать ссылку в новом окне */
  openInNewWindow?: boolean;

  /** Настройки редактирования */
  edits?: ImageEdits;
}

/**
 * Настройки редактирования изображения
 */
export interface ImageEdits {
  /** Координаты обрезки */
  crop?: CropCoords;

  /** Новые размеры */
  resize?: { width: number; height: number };

  /** Угол поворота: 0, 90, 180, 270 */
  rotate?: number;

  /** Отражение по горизонтали */
  flipH?: boolean;

  /** Отражение по вертикали */
  flipV?: boolean;

  /** Настройки фильтров */
  filters?: FilterSettings;
}

/**
 * Координаты обрезки изображения
 */
export interface CropCoords {
  /** X координата начала */
  x: number;

  /** Y координата начала */
  y: number;

  /** Ширина области обрезки */
  width: number;

  /** Высота области обрезки */
  height: number;
}

/**
 * Настройки фильтров
 */
export interface FilterSettings {
  /** Яркость: -100 to 100 */
  brightness?: number;

  /** Контраст: -100 to 100 */
  contrast?: number;

  /** Насыщенность: -100 to 100 */
  saturation?: number;

  /** Черно-белое изображение */
  grayscale?: boolean;

  /** Размытие: 0 to 10 */
  blur?: number;
}

/**
 * Результат загрузки изображения
 */
export interface ImageUploadResult {
  /** Успешность операции */
  success: boolean;

  /** URL загруженного изображения */
  imageUrl?: string;

  /** ID изображения на сервере */
  imageId?: string;

  /** Размер файла в байтах */
  fileSize?: number;

  /** Сообщение об ошибке или успехе */
  message?: string;
}

/**
 * Результат валидации изображения
 */
export interface ValidationResult {
  /** Валидно ли изображение */
  valid: boolean;

  /** Сообщение об ошибке */
  error?: string;
}

/**
 * Настройки toast уведомления
 */
export interface ToastOptions {
  /** Текст сообщения */
  message: string;

  /** Тип уведомления */
  type: 'success' | 'error' | 'warning' | 'info';

  /** Длительность отображения в миллисекундах (default: 3000) */
  duration?: number;
}

/**
 * Метаданные изображения
 */
export interface ImageMetadata {
  /** Ширина изображения */
  width: number;

  /** Высота изображения */
  height: number;

  /** Формат изображения */
  format: string;

  /** Размер файла в байтах */
  fileSize: number;

  /** MIME тип */
  mimeType: string;

  /** Анимированное ли изображение */
  isAnimated?: boolean;

  /** Длительность анимации (для GIF) */
  durationMs?: number;
}

/**
 * Запрос на загрузку изображения
 */
export interface ImageUploadRequest {
  /** Base64 данные изображения */
  base64Data: string;

  /** Имя файла */
  fileName: string;

  /** Формат файла */
  fileFormat: string;
}

/**
 * Ответ сервера на загрузку изображения
 */
export interface ImageUploadResponse {
  /** Успешность операции */
  success: boolean;

  /** URL загруженного изображения */
  imageUrl?: string;

  /** Относительный путь к файлу */
  relativePath?: string;

  /** Размер файла */
  fileSize?: number;

  /** Сообщение */
  message?: string;
}

/**
 * Конфигурация загрузки изображений
 */
export interface ImageUploadConfig {
  /** Максимальный размер файла в байтах */
  maxFileSizeBytes: number;

  /** Поддерживаемые форматы */
  supportedFormats: string[];

  /** Базовый URL для загрузки */
  uploadBaseUrl: string;
}
