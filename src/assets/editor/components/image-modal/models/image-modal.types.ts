/**
 * Типы и интерфейсы для Image Modal Component
 * Включает модели для работы с API загрузки изображений и Advanced Image Processing
 */

// ============================================================================
// EDITOR IMAGE API (из image-api.service.ts)
// ============================================================================

/**
 * Запрос на загрузку изображения (простое API)
 */
export interface ImageUploadRequest {
  fileName: string;
  fileFormat: string;
  base64Data: string;
}

/**
 * Ответ от сервера при загрузке изображения
 */
export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  relativePath: string;
  fileSize: number;
}

/**
 * Запрос на валидацию изображения
 */
export interface ImageValidationRequest {
  base64Data: string;
  fileFormat: string;
}

/**
 * Ответ от сервера с результатом валидации
 */
export interface ImageValidationResponse {
  isValid: boolean;
  message: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

/**
 * Запрос на получение метаданных изображения
 */
export interface ImageMetadataRequest {
  base64Data: string;
}

/**
 * Ответ от сервера с метаданными изображения
 */
export interface ImageMetadataResponse {
  format: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  mimeType: string;
  isAnimated: boolean;
  durationMs: number;
}

/**
 * Конфигурация сервера для работы с изображениями
 */
export interface ConfigResponse {
  maxFileSizeBytes: number;
  supportedFormats: string[];
  uploadBaseUrl: string;
  cropConfig: {
    predefinedSizes: Array<{
      name: string;
      width: number;
      height: number;
    }>;
  };
  compressionConfig: {
    enabled: boolean;
    quality: number;
  };
}

/**
 * Модель ошибки API
 */
export interface ApiError {
  message: string;
  errors?: string[];
}

// ============================================================================
// ADVANCED IMAGE API (согласно ТЗ)
// ============================================================================

/**
 * Запрос на сохранение изображения на сервере
 * POST /api/advanced-image/save
 */
export interface SaveImageRequest {
  /** Base64 данные изображения с префиксом data:image/... */
  imageBase64: string;
  /** Имя файла с расширением (например, "photo.png") */
  fileName: string;
  /** Описание изображения (alt текст для SEO и доступности) */
  description?: string;
}

/**
 * Ответ от сервера при сохранении изображения
 */
export interface SaveImageResponse {
  /** Успешность операции */
  success: boolean;
  /** Сообщение от сервера */
  message: string;
  /** UUID изображения */
  imageId: string;
  /** Полный URL изображения (например, https://server.com/uploads/images/uuid.png) */
  imageUrl: string;
}

/**
 * Запрос на загрузку изображения с сервера
 * GET /api/advanced-image/load/{imageId}
 */
export interface LoadImageRequest {
  imageId: string;
}

/**
 * Ответ от сервера при загрузке изображения
 */
export interface LoadImageResponse {
  success: boolean;
  message: string;
  /** Base64 данные изображения с префиксом data:image/... */
  imageBase64: string;
  /** Оригинальное имя файла */
  fileName: string;
  /** Описание изображения */
  description?: string;
  /** Дата создания */
  createdAt: Date;
}

/**
 * Ответ от сервера при удалении изображения
 * DELETE /api/advanced-image/delete/{imageId}
 */
export interface DeleteImageResponse {
  success: boolean;
  message: string;
  imageId: string;
}

/**
 * Ответ от сервера со списком изображений
 * GET /api/advanced-image/list
 */
export interface ImageListResponse {
  success: boolean;
  count: number;
  images: string[]; // Массив imageId
}

// ============================================================================
// IMAGE MODAL COMPONENT (клиентские модели)
// ============================================================================

/**
 * Метаданные изображения для передачи на сервер
 */
export interface ImageMetadata {
  fileName: string;
  description?: string;
}

/**
 * Конфигурация редактора изображений (клиентская)
 * Эти данные НЕ передаются на сервер, используются только для генерации HTML
 */
export interface ImageEditorConfig {
  /** Alt текст (передаётся на сервер как description) */
  altText: string;
  /** Подпись к изображению */
  caption?: string;
  /** Ширина изображения: '100%' | '75%' | '50%' | 'auto' | число в пикселях */
  width?: string;
  /** Выравнивание: 'left' | 'center' | 'right' */
  alignment?: 'left' | 'center' | 'right';
  /** URL ссылки при клике на изображение */
  linkUrl?: string;

  // ========== НОВЫЕ НАСТРОЙКИ КОНТЕЙНЕРА ==========
  /** Использовать контейнер с фиксированными размерами */
  useContainer?: boolean;
  /** Ширина контейнера (px) */
  containerWidth?: number;
  /** Высота контейнера (px или 'auto') */
  containerHeight?: number | 'auto';
  /** Способ масштабирования изображения в контейнере */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Позиция изображения в контейнере */
  objectPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Качество сжатия изображения при сохранении (0.1 - 1.0) */
  imageQuality?: number;
}

/**
 * Данные изображения для Image Modal
 */
export interface ImageData {
  /** Data URL изображения (base64) */
  dataUrl: string;
  /** Оригинальное имя файла */
  fileName: string;
  /** Размер файла в байтах */
  fileSize: number;
  /** Ширина изображения */
  width: number;
  /** Высота изображения */
  height: number;
  /** MIME тип */
  mimeType: string;
}

/**
 * Состояние загрузки изображения на сервер
 */
export interface UploadState {
  /** Идёт ли загрузка */
  isUploading: boolean;
  /** Прогресс загрузки (не используется в MVP) */
  uploadProgress: number;
  /** Текст ошибки при загрузке */
  uploadError: string | null;
  /** ID изображения на сервере после успешной загрузки */
  serverImageId: string | null;
}

/**
 * Параметры для построения HTML разметки изображения
 */
export interface BuildImageHtmlParams {
  /** URL изображения */
  imageUrl: string;
  /** UUID изображения на сервере */
  imageId: string;
  /** Конфигурация редактора */
  config: ImageEditorConfig;
}

/**
 * Результат построения HTML
 */
export interface BuildImageHtmlResult {
  /** HTML строка для вставки в редактор */
  html: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Типы изображений поддерживаемые редактором
 */
export type SupportedImageFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp';

/**
 * Варианты ширины изображения
 */
export type ImageWidth = '100%' | '75%' | '50%' | 'auto' | number;

/**
 * Варианты выравнивания
 */
export type ImageAlignment = 'left' | 'center' | 'right';

/**
 * Статус операции с изображением
 */
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// CONTAINER PRESETS (предустановки размеров контейнера)
// ============================================================================

/**
 * Предустановка размеров контейнера
 */
export interface ContainerPreset {
  /** Название предустановки */
  name: string;
  /** Эмодзи иконка */
  icon: string;
  /** Ширина в пикселях */
  width: number;
  /** Высота в пикселях */
  height: number;
  /** Соотношение сторон (для отображения) */
  aspectRatio: string;
}

/**
 * Стандартные предустановки контейнеров
 */
export const CONTAINER_PRESETS: ContainerPreset[] = [
  { name: 'Квадрат', icon: '⬜', width: 300, height: 300, aspectRatio: '1:1' },
  { name: 'Портрет', icon: '📱', width: 300, height: 400, aspectRatio: '3:4' },
  { name: 'Альбом', icon: '🖼️', width: 400, height: 300, aspectRatio: '4:3' },
  { name: 'Широкий', icon: '📺', width: 400, height: 225, aspectRatio: '16:9' },
  { name: 'Instagram', icon: '📸', width: 320, height: 320, aspectRatio: '1:1' },
  { name: 'Story', icon: '📲', width: 270, height: 480, aspectRatio: '9:16' },
];
