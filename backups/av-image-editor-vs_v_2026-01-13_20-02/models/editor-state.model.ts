/**
 * Состояние редактора изображений
 */
export interface ImageEditorState {
  activeTool: 'open' | 'crop' | 'rotate' | 'filters' | 'export';
  /** Исходный URL или Base64 */
  originalUrl: string | null;
  /** Текущий масштаб (100% = 1) */
  zoom: number;
  /** Прозрачность (0-100) */
  transparency: number;
  /** Угол поворота */
  rotation: number;

  /** Настройки экспорта */
  export: {
    format: 'image/jpeg' | 'image/png' | 'image/webp';
    quality: number;
    fileName: string;
  };

  /** Состояние кропа (обрезки) */
  crop: {
    enabled: boolean;
    aspectRatio: number | null; // null для свободного кропа
    width: number | null;
    height: number | null;
    x: number;
    y: number;
  };

  /** Метаданные изображения */
  metadata: {
    originalWidth: number;
    originalHeight: number;
    fileSize: number;
  };
}
