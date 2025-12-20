// ============================================================================
// 📊 PROGRESS BAR COMPONENT - ПОЛНАЯ СПЕЦИФИКАЦИЯ ИНТЕРФЕЙСОВ
// ============================================================================

/**
 * Основные типы отображения progress bar
 */
export type ProgressType =
  | 'line' // Горизонтальная полоса прогресса
  | 'circle' // Круговой индикатор прогресса
  | 'dashboard'; // Полукруглая приборная панель (180-270°)

/**
 * Статусы выполнения, влияющие на цвет и анимацию
 */
export type ProgressStatus =
  | 'normal' // Обычное состояние (синий/серый)
  | 'active' // Активное состояние с анимацией (пульсация)
  | 'success' // Успешное завершение (зеленый)
  | 'error' // Ошибка выполнения (красный)
  | 'warning'; // Предупреждение (желтый/оранжевый)

/**
 * Предустановленные размеры компонента
 */
export type ProgressSize =
  | 'small' // Компактный: line=6px height, circle=60px diameter
  | 'default' // Стандартный: line=10px height, circle=120px diameter
  | 'large'; // Увеличенный: line=16px height, circle=180px diameter

/**
 * Конфигурация градиента для strokeColor
 */
export interface ProgressGradient {
  /** Начальный цвет градиента (hex, rgb, rgba, hsl) */
  from: string;

  /** Конечный цвет градиента (hex, rgb, rgba, hsl) */
  to: string;

  /**
   * Направление градиента:
   * - 'horizontal' | '0deg' - слева направо (default для line)
   * - 'vertical' | '90deg' - снизу вверх
   * - 'diagonal' | '45deg' - по диагонали
   * - 'radial' - радиальный (для circle)
   * - число в градусах: 0-360
   */
  direction?: string | number;

  /**
   * Промежуточные цвета градиента с позициями
   * Пример: [{ color: '#ff0000', position: 25 }, { color: '#00ff00', position: 75 }]
   */
  stops?: Array<{ color: string; position: number }>;
}

/**
 * Конфигурация сегментированного прогресса
 */
export interface ProgressSteps {
  /** Общее количество шагов/сегментов */
  total: number;

  /** Текущий завершенный шаг (0-based index) */
  current: number;

  /** Отображать ли номера шагов */
  showNumbers?: boolean;

  /** Кастомные лейблы для каждого шага */
  labels?: string[];

  /** Расстояние между сегментами в px */
  gap?: number;
}

/**
 * Настройки анимации
 */
export interface ProgressAnimation {
  /** Включить анимацию изменения прогресса */
  enabled: boolean;

  /** Длительность анимации в миллисекундах */
  duration: number;

  /** Функция плавности (CSS easing function) */
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;

  /** Включить пульсацию для активного статуса */
  pulse: boolean;

  /** Включить анимацию полосок для активного статуса */
  stripes: boolean;

  /** Скорость движения полосок (px/s) */
  stripesSpeed: number;
}

/**
 * Настройки accessibility (доступности)
 */
export interface ProgressA11y {
  /** ARIA label для screen readers */
  ariaLabel?: string;

  /** Описание текущего прогресса */
  ariaDescription?: string;

  /** ID элемента с дополнительным описанием */
  ariaDescribedBy?: string;

  /** Объявлять ли изменения прогресса screen reader'ам */
  announceChanges: boolean;

  /** Минимальный шаг изменения для объявления (%) */
  announceThreshold: number;

  /** Поддержка высокого контраста */
  highContrast: boolean;
}

/**
 * События компонента
 */
export interface ProgressEvents {
  /** Вызывается при изменении процента */
  onPercentChange?: (percent: number, previousPercent: number) => void;

  /** Вызывается при завершении анимации */
  onAnimationComplete?: () => void;

  /** Вызывается при достижении 100% */
  onComplete?: () => void;

  /** Вызывается при изменении статуса */
  onStatusChange?: (status: ProgressStatus, previousStatus: ProgressStatus) => void;

  /** Вызывается при клике на progress bar */
  onClick?: (event: MouseEvent, percent: number) => void;

  /** Вызывается при наведении мыши */
  onHover?: (event: MouseEvent, percent: number) => void;
}

/**
 * Кастомные стили
 */
export interface ProgressCustomStyles {
  /** CSS классы для контейнера */
  containerClass?: string;

  /** CSS классы для полосы прогресса */
  progressClass?: string;

  /** CSS классы для текста */
  textClass?: string;

  /** Inline стили для контейнера */
  containerStyle?: Partial<CSSStyleDeclaration>;

  /** Inline стили для полосы прогресса */
  progressStyle?: Partial<CSSStyleDeclaration>;

  /** CSS переменные для темизации */
  cssVariables?: Record<string, string>;
}

/**
 * 🎯 ГЛАВНЫЙ ИНТЕРФЕЙС КОНФИГУРАЦИИ PROGRESS BAR
 */
export interface ProgressBarConfig {
  percent: number;
  type?: ProgressType;
  status?: ProgressStatus;
  size?: ProgressSize | number;
  strokeWidth?: number;
  strokeColor?: string | string[] | ProgressGradient;
  trailColor?: string;
  strokeLinecap?: 'round' | 'square' | 'butt';
  showInfo?: boolean;
  format?: (percent: number) => string;
  label?: string;
  description?: string;
  gapDegree?: number;
  steps?: ProgressSteps;
  indeterminate?: boolean;
  animation?: Partial<ProgressAnimation>;
  interactive?: boolean;
  showTooltip?: boolean;
  tooltipContent?: string | ((percent: number) => string);
  a11y?: Partial<ProgressA11y>;
  events?: Partial<ProgressEvents>;
  customStyles?: Partial<ProgressCustomStyles>;
  theme?: string | ProgressTheme;
  disabled?: boolean;
  readonly?: boolean;
}

/**
 * Предустановленные темы
 */
export interface ProgressTheme {
  name: string;
  colors: {
    normal: string;
    active: string;
    success: string;
    error: string;
    warning: string;
    trail: string;
    text: string;
    background: string;
  };
  animation: {
    duration: number;
    easing: string;
    pulse: boolean;
    stripes: boolean;
  };
  typography: {
    fontSize: string;
    fontWeight: string;
    fontFamily: string;
  };
}

/**
 * Состояние компонента (internal)
 */
export interface ProgressState {
  currentPercent: number;
  previousPercent: number;
  isAnimating: boolean;
  isComplete: boolean;
  isHovered: boolean;
  isFocused: boolean;
  lastAnnouncedPercent: number;
}
