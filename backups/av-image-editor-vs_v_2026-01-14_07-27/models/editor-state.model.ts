/**
 * Состояние редактора изображений
 */
export interface ImageEditorState {
  activeTool: 'open' | 'crop' | 'rotate' | 'resize' | 'filters' | 'export';
  /** Исходный URL или Base64 */
  originalUrl: string | null;
  /** Текущий масштаб (100% = 1) */
  zoom: number;
  /** Прозрачность (0-100) */
  transparency: number;
  /** Угол поворота */
  rotation: number;
  /** Системное сообщение в статус-баре */
  systemMessage: string | null;
  /** Режим предпросмотра результата */
  isPreviewMode: boolean;
  /** URL обработанного изображения (для превью) */
  processedUrl: string | null;

  /** Настройки экспорта */
  export: {
    format: 'image/jpeg' | 'image/png' | 'image/webp';
    quality: number;
    fileName: string;
  };

  /** Состояние кропа (обрезки) */
  crop: {
    enabled: boolean;
    shape: 'rectangle' | 'circle';
    aspectRatio: number | null; // null для свободного кропа
    width: number | null;
    height: number | null;
    x: number;
    y: number;
    lock: boolean; // Замок пропорций

    // Состояние панели ресайза
    resizePanelEnabled: boolean;
    resizeWidth: number;
    resizeHeight: number;
    resizeLocked: boolean;
  };

  /** Метаданные изображения */
  /** Метаданные изображения */
  metadata: {
    originalWidth: number;
    originalHeight: number;
    /** Размер исходного файла в байтах */
    originalSize?: number;
    /** Ширина после обработки */
    processedWidth?: number;
    /** Высота после обработки */
    processedHeight?: number;
    /** Примерный размер после сжатия (bytes) */
    estimatedSize?: number;
  };
}
