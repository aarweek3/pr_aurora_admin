/**
 * Frame Plugin Types for Aurora Editor
 * Типы для плагина рамок изображений
 */

// Тип рамки
export type FrameType =
  | 'solid' // Сплошная
  | 'dashed' // Пунктирная
  | 'dotted' // Точечная
  | 'double' // Двойная
  | 'groove' // Вдавленная
  | 'ridge' // Выпуклая
  | 'inset' // Внутренняя
  | 'outset' // Внешняя
  | 'shadow' // Тень
  | 'gradient' // Градиент
  | 'rounded' // Скругленная
  | 'modern' // Современная
  | 'vintage' // Винтажная
  | 'artistic'; // Художественная

// Категории рамок
export type FrameCategory = 'classic' | 'modern' | 'artistic' | 'decorative';

// Направление градиента
export type GradientDirection =
  | 'to-right' // Слева направо
  | 'to-left' // Справа налево
  | 'to-bottom' // Сверху вниз
  | 'to-top' // Снизу вверх
  | 'to-bottom-right' // Диагональ
  | 'to-bottom-left' // Диагональ
  | 'radial'; // Радиальный

// Конфигурация тени
export interface ShadowConfig {
  offsetX: number; // Смещение по X (px)
  offsetY: number; // Смещение по Y (px)
  blur: number; // Размытие (px)
  spread: number; // Распространение (px)
  color: string; // Цвет тени
  inset?: boolean; // Внутренняя тень
}

// Конфигурация градиента
export interface GradientConfig {
  direction: GradientDirection;
  colors: string[]; // Массив цветов
  stops?: number[]; // Позиции цветов (0-100%)
}

// Основная конфигурация рамки
export interface FrameConfig {
  type: FrameType;
  thickness: number; // Толщина (1-50px)
  color: string; // Цвет (#hex, rgb, rgba)
  opacity: number; // Прозрачность (0-1)
  padding: number; // Отступ от изображения (0-20px)
  borderRadius: number; // Скругление углов (0-25px)
  shadow?: ShadowConfig; // Настройки тени
  gradient?: GradientConfig; // Настройки градиента
}

// Предустановленный стиль рамки
export interface FramePreset {
  id: string;
  name: string; // Название стиля
  description: string; // Описание
  category: FrameCategory;
  config: FrameConfig;
  preview?: string; // base64 превью или URL
  isCustom?: boolean; // Пользовательский стиль
}

// Результат применения рамки
export interface FrameResult {
  success: boolean;
  dataUrl?: string; // Результирующее изображение
  error?: string; // Ошибка если есть
  originalSize: {
    width: number;
    height: number;
  };
  resultSize: {
    width: number;
    height: number;
  };
}

// События Frame сервиса
export interface FrameEvents {
  onConfigChange?: (config: FrameConfig) => void;
  onPreviewUpdate?: (previewUrl: string) => void;
  onApply?: (result: FrameResult) => void;
  onReset?: () => void;
  onError?: (error: string) => void;
}

// Состояние Frame сервиса
export interface FrameState {
  isActive: boolean;
  currentConfig: FrameConfig;
  presets: FramePreset[];
  previewUrl?: string;
  originalImage?: HTMLImageElement;
  canvasElement?: HTMLCanvasElement;
}

// Настройки Frame сервиса
export interface FrameServiceConfig {
  maxImageSize: number; // Максимальный размер изображения (MB)
  previewQuality: number; // Качество превью (0-1)
  autoPreview: boolean; // Автоматическое обновление превью
  saveConfig: boolean; // Сохранять настройки
  customPresets: boolean; // Разрешить пользовательские пресеты
}

// Интерфейс Frame сервиса
export interface IFrameService {
  // Основные методы
  activate(image: HTMLImageElement, canvas: HTMLCanvasElement): Promise<void>;
  deactivate(): void;

  // Применение рамки
  applyFrame(config: FrameConfig): Promise<FrameResult>;
  generatePreview(config: FrameConfig): Promise<string>;

  // Управление конфигурацией
  setConfig(config: Partial<FrameConfig>): void;
  getConfig(): FrameConfig;
  resetConfig(): void;
  validateConfig(config: FrameConfig): boolean;

  // Управление пресетами
  getPresets(): FramePreset[];
  addCustomPreset(preset: FramePreset): void;
  removeCustomPreset(id: string): void;
  applyPreset(presetId: string): void;

  // События
  on(event: keyof FrameEvents, callback: Function): void;
  off(event: keyof FrameEvents, callback: Function): void;

  // Состояние
  getState(): FrameState;
  isActive(): boolean;
}

// Дефолтная конфигурация
export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  type: 'solid',
  thickness: 3,
  color: '#000000',
  opacity: 1,
  padding: 0,
  borderRadius: 0,
};

// Дефолтные настройки сервиса
export const DEFAULT_FRAME_SERVICE_CONFIG: FrameServiceConfig = {
  maxImageSize: 5, // 5MB
  previewQuality: 0.8,
  autoPreview: true,
  saveConfig: true,
  customPresets: true,
};

// Константы для валидации
export const FRAME_CONSTRAINTS = {
  thickness: { min: 1, max: 50 },
  opacity: { min: 0, max: 1 },
  padding: { min: 0, max: 20 },
  borderRadius: { min: 0, max: 25 },
  shadow: {
    offset: { min: -50, max: 50 },
    blur: { min: 0, max: 50 },
    spread: { min: -50, max: 50 },
  },
};

// Цветовые константы
export const FRAME_COLORS = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY: '#808080',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  BROWN: '#8B4513',
  BLUE: '#0066CC',
  RED: '#CC0000',
  GREEN: '#00CC66',
};
