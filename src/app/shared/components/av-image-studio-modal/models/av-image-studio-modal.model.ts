/**
 * ГЕОМЕТРИЯ (Базовые примитивы)
 */
export interface AvPoint {
  x: number;
  y: number;
}

export interface AvSize {
  width: number;
  height: number;
}

export interface AvRect extends AvPoint, AvSize {}

/**
 * КОНФИГУРАЦИЯ (Входные параметры компонента)
 */
export interface AvImageUploaderConfig {
  // Текст
  uploadText?: string; // "Перетащите файл сюда"

  // Ограничения
  maxSizeMB?: number; // По дефолту 5MB
  allowedFormats?: string[]; // ['image/jpeg', 'image/png', 'image/webp']

  // Поведение
  enableCrop?: boolean; // Включить редактор кропа
  enableResize?: boolean; // Разрешить изменение размера на выходе
  watermarkUrl?: string; // URL логотипа для ватермарка (опционально)
}

/**
 * СОСТОЯНИЕ РЕДАКТОРА (State)
 * То, что меняется в реальном времени при редактировании
 */
export interface AvImageEditorState {
  originalImage: HTMLImageElement | null; // Загруженное изображение

  // Трансформации
  scale: number; // Зум (1 = 100%)
  rotation: 0 | 90 | 180 | 270; // Поворот
  flipH: boolean; // Отражение гор.
  flipV: boolean; // Отражение верт.

  // Кроп
  cropRect: AvRect | null; // Область кропа (в координатах OriginalImage)

  // UI
  isProcessing: boolean; // Идет ли обработка
}

/**
 * ПРЕСЕТЫ ОБРЕЗКИ (Aspect Ratio Presets)
 */
export interface AvCropPreset {
  id: string; // '16:9', '1:1', 'free'
  label: string;
  ratio: number | null; // null для свободного кропа
  width?: number; // Фиксированная ширина (опционально)
  height?: number; // Фиксированная высота (опционально)
}

/**
 * НАСТРОЙКИ ЭКСПОРТА (Save Settings)
 */
export interface AvExportSettings {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0..100 (только для jpeg/webp)
  targetSize?: AvSize; // Если задано, будет ресайз
}

/**
 * МЕТАДАННЫЕ ИЗОБРАЖЕНИЯ (SEO & Behavioral)
 */
export interface AvImageMetadata {
  fileName: string;
  altText?: string;
  titleText?: string;
  caption?: string;
  align?: 'left' | 'center' | 'right' | 'justify'; // Расположение
  linkUrl?: string; // Ссылка при клике
  isClickable?: boolean;
  isOpenNewWindow?: boolean;
}

/**
 * РЕЗУЛЬТАТ (Output)
 */
export interface AvImageUploadResult {
  file: File; // Файл для отправки (Blob)
  dataUrl: string; // Base64 (для превью)
  width: number;
  height: number;
  size: number; // Размер в байтах
  name: string;
  metadata?: AvImageMetadata; // Новые поля
}
