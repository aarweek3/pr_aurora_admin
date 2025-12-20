import { PROGRESS_THEMES, PROGRESS_VALIDATION } from './progress.constants';
import {
  ProgressBarConfig,
  ProgressGradient,
  ProgressStatus,
  ProgressTheme,
} from './progress.types';

export interface ProgressValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value: unknown;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    value: unknown;
  }>;
}

/**
 * Функция валидации конфигурации
 */
export function validateProgressConfig(config: ProgressBarConfig): ProgressValidationResult {
  const errors: Array<{ field: string; message: string; value: unknown }> = [];
  const warnings: Array<{ field: string; message: string; value: unknown }> = [];

  // Валидация percent
  if (
    config.percent < PROGRESS_VALIDATION.PERCENT.MIN ||
    config.percent > PROGRESS_VALIDATION.PERCENT.MAX
  ) {
    errors.push({
      field: 'percent',
      message: `Percent must be between ${PROGRESS_VALIDATION.PERCENT.MIN} and ${PROGRESS_VALIDATION.PERCENT.MAX}`,
      value: config.percent,
    });
  }

  // Валидация size
  if (typeof config.size === 'number' && config.size < PROGRESS_VALIDATION.SIZE.MIN_PX) {
    errors.push({
      field: 'size',
      message: `Custom size must be at least ${PROGRESS_VALIDATION.SIZE.MIN_PX}px`,
      value: config.size,
    });
  }

  // Валидация strokeWidth
  if (config.strokeWidth !== undefined) {
    if (
      config.strokeWidth < PROGRESS_VALIDATION.STROKE_WIDTH.MIN ||
      config.strokeWidth > PROGRESS_VALIDATION.STROKE_WIDTH.MAX
    ) {
      errors.push({
        field: 'strokeWidth',
        message: `Stroke width must be between ${PROGRESS_VALIDATION.STROKE_WIDTH.MIN} and ${PROGRESS_VALIDATION.STROKE_WIDTH.MAX}`,
        value: config.strokeWidth,
      });
    }
  }

  // Валидация gapDegree для dashboard
  if (config.type === 'dashboard' && config.gapDegree !== undefined) {
    if (
      config.gapDegree < PROGRESS_VALIDATION.GAP_DEGREE.MIN ||
      config.gapDegree > PROGRESS_VALIDATION.GAP_DEGREE.MAX
    ) {
      errors.push({
        field: 'gapDegree',
        message: `Gap degree must be between ${PROGRESS_VALIDATION.GAP_DEGREE.MIN} and ${PROGRESS_VALIDATION.GAP_DEGREE.MAX}`,
        value: config.gapDegree,
      });
    }
  }

  // Предупреждения
  if (config.showInfo === false && !config.a11y?.ariaLabel) {
    warnings.push({
      field: 'a11y.ariaLabel',
      message: 'Consider providing aria-label when showInfo is false for better accessibility',
      value: config.a11y?.ariaLabel,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Утилиты для работы с прогрессом
 */
export class ProgressUtils {
  /**
   * Безопасное ограничение процента в диапазоне 0-100
   */
  static clampPercent(percent: number): number {
    return Math.max(0, Math.min(100, percent));
  }

  /**
   * Интерполяция между двумя значениями процента
   */
  static interpolate(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
  }

  /**
   * Получить цвет статуса по умолчанию
   */
  static getStatusColor(
    status: ProgressStatus,
    theme: ProgressTheme = PROGRESS_THEMES['default'],
  ): string {
    return theme.colors[status] || theme.colors.normal;
  }

  /**
   * Форматирование процента по умолчанию
   */
  static defaultFormat(percent: number): string {
    return `${Math.round(percent)}%`;
  }

  /**
   * Создание градиента CSS из конфигурации
   */
  static createGradientCSS(gradient: ProgressGradient): string {
    const direction =
      typeof gradient.direction === 'number'
        ? `${gradient.direction}deg`
        : gradient.direction || 'to right';

    let stops = `${gradient.from}, ${gradient.to}`;

    if (gradient.stops) {
      const customStops = gradient.stops
        .map((stop) => `${stop.color} ${stop.position}%`)
        .join(', ');
      stops = `${gradient.from}, ${customStops}, ${gradient.to}`;
    }

    return `linear-gradient(${direction}, ${stops})`;
  }
}
