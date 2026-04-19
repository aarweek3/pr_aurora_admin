/**
 * Размеры модального окна
 */
export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';

/**
 * Позиционирование модального окна
 */
export type ModalPosition = 'center' | 'top' | 'bottom';

/**
 * Типы модальных окон
 */
export type ModalType = 'default' | 'confirm' | 'alert' | 'custom';

/**
 * Типы alert модалов
 */
export type ModalAlertType = 'info' | 'success' | 'warning' | 'error';

/**
 * Конфигурация модального окна
 */
export interface ModalConfig<TData = any> {
  /** Размер модала */
  size?: ModalSize;

  /** Позиция модала */
  position?: ModalPosition;

  /** Заголовок модала */
  title?: string;

  /** Подзаголовок */
  subtitle?: string;

  /** Закрывать при клике на backdrop */
  closeOnBackdrop?: boolean;

  /** Закрывать при нажатии ESC */
  closeOnEsc?: boolean;

  /** Показывать кнопку закрытия (X) */
  showCloseButton?: boolean;

  /** Показывать backdrop (затемнение фона) */
  showBackdrop?: boolean;

  /** Автоматический fullscreen на мобильных */
  mobileFullscreen?: boolean;

  /** Breakpoint для мобильной версии (px) */
  mobileBreakpoint?: number;

  /** Данные для передачи в компонент */
  data?: TData;

  /** CSS классы для панели модала */
  panelClass?: string | string[];

  /** CSS классы для backdrop */
  backdropClass?: string | string[];

  /** Кастомная ширина */
  width?: string;

  /** Кастомная высота */
  height?: string;

  /** Максимальная ширина */
  maxWidth?: string;

  /** Максимальная высота */
  maxHeight?: string;

  /** Hook перед закрытием (может предотвратить закрытие) */
  beforeClose?: (result?: any) => boolean | Promise<boolean>;

  /** Блокировать закрытие footer во время loading */
  disableFooterWhileLoading?: boolean;

  /** Центрировать содержимое (для диалогов с иконками) */
  centered?: boolean;

  /** Разрешить перетаскивание за хедер */
  draggable?: boolean;

  /** Разрешить изменение размера */
  resizable?: boolean;
}

/**
 * Конфигурация для Confirm модала
 */
export interface ConfirmConfig<TData = any> extends ModalConfig<TData> {
  /** Текст сообщения */
  message: string;

  /** Текст кнопки подтверждения */
  confirmText?: string;

  /** Текст кнопки отмены */
  cancelText?: string;

  /** Тип подтверждения (влияет на цвет кнопки и иконку) */
  confirmType?: 'primary' | 'danger' | 'warning' | 'success' | 'info';

  /** Название иконки */
  icon?: string;
}

/**
 * Конфигурация для Alert модала
 */
export interface AlertConfig<TData = any> extends ModalConfig<TData> {
  /** Текст сообщения */
  message: string;

  /** Тип алерта */
  alertType?: ModalAlertType;

  /** Текст кнопки OK */
  okText?: string;

  /** Тип кнопки OK */
  okType?: 'primary' | 'danger' | 'default';

  /** Название иконки */
  icon?: string;
}

/**
 * Размеры модальных окон в пикселях
 */
export const MODAL_SIZES: Record<ModalSize, string> = {
  small: 'var(--av-modal-width-small)',
  medium: 'var(--av-modal-width-medium)',
  large: 'var(--av-modal-width-large)',
  xlarge: 'var(--av-modal-width-xlarge)',
  fullscreen: '100vw',
};
