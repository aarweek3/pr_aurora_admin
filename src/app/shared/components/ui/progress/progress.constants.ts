import { ProgressTheme } from './progress.types';

/**
 * Константы валидации
 */
export const PROGRESS_VALIDATION = {
  PERCENT: {
    MIN: 0,
    MAX: 100,
  },
  SIZE: {
    MIN_PX: 10,
    MAX_PX: 1000,
  },
  STROKE_WIDTH: {
    MIN: 1,
    MAX: 50,
  },
  GAP_DEGREE: {
    MIN: 0,
    MAX: 295,
  },
  ANIMATION: {
    MIN_DURATION: 50,
    MAX_DURATION: 10000,
    MIN_STRIPES_SPEED: 1,
    MAX_STRIPES_SPEED: 100,
  },
} as const;

export const PROGRESS_THEMES: Record<string, ProgressTheme> = {
  default: {
    name: 'Default',
    colors: {
      normal: '#1677ff',
      active: '#4096ff',
      success: '#52c41a',
      error: '#ff4d4f',
      warning: '#faad14',
      trail: '#f5f5f5',
      text: '#000000d9',
      background: '#ffffff',
    },
    animation: {
      duration: 300,
      easing: 'ease-out',
      pulse: false,
      stripes: false,
    },
    typography: {
      fontSize: '14px',
      fontWeight: '400',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },

  dark: {
    name: 'Dark',
    colors: {
      normal: '#1890ff',
      active: '#40a9ff',
      success: '#73d13d',
      error: '#ff7875',
      warning: '#ffc53d',
      trail: '#262626',
      text: '#ffffffd9',
      background: '#141414',
    },
    animation: {
      duration: 300,
      easing: 'ease-out',
      pulse: false,
      stripes: false,
    },
    typography: {
      fontSize: '14px',
      fontWeight: '400',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },

  minimal: {
    name: 'Minimal',
    colors: {
      normal: '#000000',
      active: '#333333',
      success: '#00c851',
      error: '#ff3547',
      warning: '#ffaa00',
      trail: '#e0e0e0',
      text: '#333333',
      background: '#ffffff',
    },
    animation: {
      duration: 150,
      easing: 'linear',
      pulse: false,
      stripes: false,
    },
    typography: {
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
    },
  },
};
