/**
 * Crop Plugin - TypeScript Interfaces
 * Aurora Editor
 */

/**
 * Область обрезки (координаты на canvas)
 */
export interface CropArea {
  x: number;        // Координата X (относительно canvas)
  y: number;        // Координата Y (относительно canvas)
  width: number;    // Ширина рамки
  height: number;   // Высота рамки
}

/**
 * Конфигурация обрезки
 */
export interface CropConfig {
  proportional: boolean;      // Чекбокс "Пропорционально"
  showGrid: boolean;          // Чекбокс "Показать сетку"
  hardSizeEnabled: boolean;   // Чекбокс "Жесткий размер"
  targetWidth?: number;       // Целевая ширина (если hardSize)
  targetHeight?: number;      // Целевая высота (если hardSize)
  proportionLocked: boolean;  // Замок пропорций в полях размера
}

/**
 * Пресет размера обрезки
 */
export interface CropPreset {
  id: string;           // UUID
  name: string;         // "Instagram Post"
  icon: string;         // "📷" emoji (позже можно SVG)
  width: number;        // 1080
  height: number;       // 1080
  isCustom: boolean;    // true для собственных, false для системных
  createdAt?: Date;     // Дата создания (для сортировки)
}

/**
 * Результат обрезки
 */
export interface CropResult {
  blob: Blob;                          // Blob для сохранения/отправки
  dataUrl: string;                     // Data URL для preview
  width: number;                       // Финальная ширина
  height: number;                      // Финальная высота
  format: 'image/jpeg' | 'image/png';  // Формат
}

/**
 * Маркеры изменения размера
 */
export type ResizeHandle =
  | 'nw' | 'n' | 'ne'  // Верхний ряд
  | 'e'                // Правый
  | 'se' | 's' | 'sw'  // Нижний ряд
  | 'w';               // Левый

/**
 * Опции для CropTool
 */
export interface CropToolOptions {
  aspectRatio?: number | null;      // Пропорции (null = свободно)
  minWidth?: number;                // Минимальная ширина (по умолчанию 20)
  minHeight?: number;               // Минимальная высота (по умолчанию 20)
  showGrid?: boolean;               // Показывать сетку
  overlayColor?: string;            // Цвет затемнения
  borderColor?: string;             // Цвет рамки
  borderWidth?: number;             // Толщина рамки
  handleSize?: number;              // Размер маркеров
  handleColor?: string;             // Цвет маркеров
}

/**
 * Стиль визуализации
 */
export interface VisualStyle {
  overlayColor: string;      // rgba(0,0,0,0.5)
  borderColor: string;       // #ffffff
  borderWidth: number;       // 2px
  handleSize: number;        // 8px
  handleColor: string;       // #4a90e2
  gridColor: string;         // rgba(255,255,255,0.5)
  gridWidth: number;         // 1px
}
