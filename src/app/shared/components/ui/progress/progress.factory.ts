import { ProgressBarConfig } from './progress.types';

/**
 * Фабричные методы для создания конфигураций
 */
export class ProgressConfigFactory {
  /**
   * Создать базовую конфигурацию линейного прогресса
   */
  static createLine(percent: number, options?: Partial<ProgressBarConfig>): ProgressBarConfig {
    return {
      percent,
      type: 'line',
      status: 'normal',
      size: 'default',
      strokeWidth: 8,
      trailColor: '#f5f5f5',
      showInfo: true,
      strokeLinecap: 'round',
      animation: { enabled: true, duration: 300, easing: 'ease-out' },
      ...options,
    };
  }

  /**
   * Создать конфигурацию кругового прогресса
   */
  static createCircle(percent: number, options?: Partial<ProgressBarConfig>): ProgressBarConfig {
    return {
      percent,
      type: 'circle',
      status: 'normal',
      size: 'default',
      strokeWidth: 6,
      trailColor: '#f5f5f5',
      showInfo: true,
      strokeLinecap: 'round',
      animation: { enabled: true, duration: 300, easing: 'ease-out' },
      ...options,
    };
  }

  /**
   * Создать конфигурацию приборной панели
   */
  static createDashboard(percent: number, options?: Partial<ProgressBarConfig>): ProgressBarConfig {
    return {
      percent,
      type: 'dashboard',
      status: 'normal',
      size: 'default',
      strokeWidth: 6,
      gapDegree: 75,
      trailColor: '#f5f5f5',
      showInfo: true,
      strokeLinecap: 'round',
      animation: { enabled: true, duration: 300, easing: 'ease-out' },
      ...options,
    };
  }

  /**
   * Создать сегментированный прогресс
   */
  static createSteps(
    totalSteps: number,
    currentStep: number,
    options?: Partial<ProgressBarConfig>,
  ): ProgressBarConfig {
    const percent = (currentStep / totalSteps) * 100;
    return {
      percent,
      type: 'line',
      status: 'normal',
      size: 'default',
      steps: {
        total: totalSteps,
        current: currentStep,
        showNumbers: true,
        gap: 2,
      },
      showInfo: false,
      animation: { enabled: true, duration: 300, easing: 'ease-out' },
      ...options,
    };
  }

  /**
   * Создать неопределенный прогресс (бесконечная загрузка)
   */
  static createIndeterminate(options?: Partial<ProgressBarConfig>): ProgressBarConfig {
    return {
      percent: 0,
      type: 'line',
      status: 'active',
      size: 'default',
      indeterminate: true,
      showInfo: false,
      animation: {
        enabled: true,
        duration: 2000,
        easing: 'linear',
        stripes: true,
        stripesSpeed: 30,
      },
      ...options,
    };
  }
}
