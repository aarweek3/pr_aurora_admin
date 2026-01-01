/**
 * Типы и интерфейсы для плагина Circle
 * Обрезка изображений в форме круга
 */

/**
 * Конфигурация круговой обрезки
 */
export interface CircleConfig {
  /** Центр X (в пикселях относительно изображения) */
  centerX: number;

  /** Центр Y (в пикселях относительно изображения) */
  centerY: number;

  /** Радиус круга (в пикселях) */
  radius: number;

  /** Толщина обводки при редактировании */
  strokeWidth: number;

  /** Цвет обводки при редактировании */
  strokeColor: string;

  /** Прозрачность заливки области вне круга */
  fillOpacity: number;
}

/**
 * Результат применения круговой обрезки
 */
export interface CircleResult {
  /** Base64 данные обрезанного изображения (PNG с прозрачностью) */
  imageData?: string;

  /** Альтернативное поле для совместимости */
  croppedImage: string;

  /** Оригинальное изображение */
  originalImage: string;

  /** Конфигурация, использованная для обрезки */
  config: CircleConfig;

  /** Размер исходного изображения */
  originalSize: {
    width: number;
    height: number;
  };

  /** Размер результирующего изображения (диаметр × диаметр) */
  croppedSize: {
    width: number;
    height: number;
  };

  /** Информация о круге */
  info: {
    centerX: number;
    centerY: number;
    radius: number;
    diameter: number;
    area: number;
    circumference: number;
    outputFormat: string;
    hasTransparency: boolean;
    fileSize: number;
  };

  /** Метаданные */
  metadata: {
    timestamp: number;
    format: 'png';
    quality: number;
  };
}

/**
 * Настройки плагина Circle
 */
export interface CircleSettings {
  /** Радиус по умолчанию (в процентах от меньшей стороны изображения) */
  defaultRadiusPercent: number;

  /** Толщина границы круга при редактировании */
  strokeWidth: number;

  /** Цвет границы круга */
  strokeColor: string;

  /** Цвет заливки области вне круга */
  fillColor?: string;

  /** Прозрачность заливки области вне круга (0-1) */
  fillOpacity: number;

  /** Автоматическое центрирование при активации */
  autoCenter: boolean;

  /** Показывать ли ручки изменения размера */
  showHandles: boolean;

  /** Привязка к сетке */
  snapToGrid: boolean;

  /** Включить горячие клавиши */
  enableKeyboardShortcuts: boolean;

  /** Привязка к пиксельной сетке */
  snapToPixels: boolean;

  /** Минимальный радиус (в пикселях) */
  minRadius: number;

  /** Показывать координаты и размеры */
  showInfo: boolean;
}

/**
 * Состояние плагина Circle
 */
export type CircleState = 'idle' | 'configuring' | 'moving' | 'resizing' | 'processing' | 'error';

/**
 * Режимы взаимодействия с кругом
 */
export type InteractionMode = 'none' | 'move' | 'resize';

/**
 * Состояние плагина Circle (детальное)
 */
export interface CircleStateDetailed {
  /** Активен ли режим обрезки */
  isActive: boolean;

  /** Текущая конфигурация */
  config: CircleConfig | null;

  /** Перетаскивается ли круг */
  isDragging: boolean;

  /** Изменяется ли размер круга */
  isResizing: boolean;

  /** Тип текущего действия */
  currentAction: 'none' | 'drag' | 'resize';

  /** Исходная позиция мыши при начале действия */
  startMousePos: { x: number; y: number } | null;

  /** Исходная конфигурация при начале действия */
  startConfig: CircleConfig | null;
}

/**
 * События плагина Circle
 */
export interface CircleEvents {
  /** Плагин активирован */
  onActivate: (config: CircleConfig) => void;

  /** Плагин деактивирован */
  onDeactivate: () => void;

  /** Конфигурация изменена */
  onConfigChange: (config: CircleConfig) => void;

  /** Обрезка применена */
  onApply: (result: CircleResult) => void;

  /** Действие отменено */
  onCancel: () => void;

  /** Ошибка при обработке */
  onError: (error: string) => void;
}

/**
 * Координаты мыши относительно canvas
 */
export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Границы изображения для валидации
 */
export interface ImageBounds {
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Параметры рендеринга круга
 */
export interface CircleRenderOptions {
  /** Canvas для рендеринга */
  canvas: HTMLCanvasElement;

  /** Конфигурация круга */
  config: CircleConfig;

  /** Масштабирование отображения */
  scale: number;

  /** Смещение изображения на canvas */
  offset: { x: number; y: number };

  /** Показывать ли ручки изменения размера */
  showHandles: boolean;
}

/**
 * Утилиты для работы с кругом
 */
export interface CircleUtils {
  /** Рассчитать оптимальный радиус для изображения */
  calculateOptimalRadius(imageWidth: number, imageHeight: number): number;

  /** Центрировать круг на изображении */
  centerCircle(imageWidth: number, imageHeight: number, radius: number): CircleConfig;

  /** Проверить и скорректировать границы круга */
  validateBounds(config: CircleConfig, bounds: ImageBounds): CircleConfig;

  /** Проверить попадание точки в круг */
  isPointInCircle(point: MousePosition, config: CircleConfig): boolean;

  /** Проверить попадание точки в ручку изменения размера */
  isPointInResizeHandle(point: MousePosition, config: CircleConfig, handleSize: number): boolean;

  /** Рассчитать расстояние от центра круга до точки */
  distanceFromCenter(point: MousePosition, config: CircleConfig): number;
}

/**
 * Конфигурация по умолчанию
 */
export const DEFAULT_CIRCLE_CONFIG: Partial<CircleConfig> = {
  strokeWidth: 2,
  strokeColor: '#007bff',
  fillOpacity: 0.3,
};

export const DEFAULT_CIRCLE_SETTINGS: CircleSettings = {
  defaultRadiusPercent: 40, // 40% от меньшей стороны
  strokeWidth: 2,
  strokeColor: '#007bff',
  fillColor: '#000000',
  fillOpacity: 0.3,
  autoCenter: true,
  showHandles: true,
  snapToGrid: false,
  enableKeyboardShortcuts: true,
  snapToPixels: true,
  minRadius: 10,
  showInfo: true,
};

/**
 * Константы
 */
export const CIRCLE_CONSTANTS = {
  /** Размер ручки изменения размера (в пикселях) */
  RESIZE_HANDLE_SIZE: 8,

  /** Минимальный радиус (в пикселях) */
  MIN_RADIUS: 10,

  /** Максимальный радиус (ограничен размером изображения) */
  MAX_RADIUS_FACTOR: 0.8,

  /** Шаг изменения радиуса при использовании колеса мыши */
  WHEEL_STEP: 5,

  /** Качество экспорта PNG */
  EXPORT_QUALITY: 1.0,
} as const;
