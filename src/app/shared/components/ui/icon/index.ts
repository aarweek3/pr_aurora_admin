export * from './icon-library/icon-library.component';
export * from './icon-settings-control/icon-settings-control.component';
export * from './icon.component';

/**
 * Базовый интерфейс свойств иконки
 */
export interface AvIconProps {
  /** Тип иконки или полный путь (напр. 'system/av_settings') */
  type?: string | null;
  /** Размер в пикселях (W=H). По умолчанию 24 */
  size?: number | null;
  /** Цвет иконки (HEX, RGB, currentColor). По умолчанию inherit */
  color?: string | null;
  /** Угол поворота в градусах (0-360) */
  rotation?: number | null;
  /** Масштаб (1.0 - оригинал) */
  scale?: number | null;
  /** Прозрачность (0-1) */
  opacity?: number | null;
  /** Отразить по горизонтали */
  flipX?: boolean | null;
  /** Отразить по вертикали */
  flipY?: boolean | null;
  /** Внутренние отступы (px или CSS строка) */
  padding?: number | string | null;
  /** Фон иконки (CSS background) */
  background?: string | null;
  /** Граница (напр. '1px solid #ccc') */
  border?: string | null;
  /** Радиус скругления (px или CSS строка) */
  radius?: number | string | null;

  // Поля совместимости с контролом настроек
  borderShow?: boolean | null;
  borderColor?: string | null;
  borderWidth?: number | null;
  borderRadius?: number | null;
}

/**
 * Расширенный интерфейс для хранения полного состояния настроек (для IconSettingsControl)
 */
export interface AvIconConfig extends AvIconProps {
  type: string | null;
  size: number;
  color: string;
  rotation: number;
  scale: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  padding: number;
  background: string;
  borderShow: boolean;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}
