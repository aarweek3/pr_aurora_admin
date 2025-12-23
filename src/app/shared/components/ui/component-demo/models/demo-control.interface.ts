/**
 * Тип контрола для настройки свойства компонента
 */
export type DemoControlType = 'select' | 'boolean' | 'number' | 'text' | 'color';

/**
 * Опция для select контрола
 */
export interface DemoControlOption {
  label: string;
  value: any;
}

/**
 * Конфигурация контрола для настройки свойства компонента
 */
export interface DemoControl {
  /** Название свойства (например, 'size') */
  name: string;

  /** Метка для отображения (например, 'Размер кнопки') */
  label: string;

  /** Тип контрола */
  type: DemoControlType;

  /** Значение по умолчанию */
  defaultValue: any;

  /** Опции для select (обязательно если type = 'select') */
  options?: DemoControlOption[];

  /** Минимальное значение для number */
  min?: number;

  /** Максимальное значение для number */
  max?: number;

  /** Шаг для number */
  step?: number;

  /** Подсказка/описание */
  description?: string;
}
