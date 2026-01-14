/**
 * Конфигурация VS модального окна (Компромиссная версия)
 */
export interface VSModalConfig<TData = any> {
  /** Заголовок окна */
  title: string;

  /** Входные данные для компонента */
  data?: TData;

  /** Ширина окна (например, '600px', '80%') */
  width?: string | number;

  /** Высота окна */
  height?: string | number;

  /** Минимальная ширина при ресайзе */
  minWidth?: number;

  /** Минимальная высота при ресайзе */
  minHeight?: number;

  /** Можно ли перетаскивать окно за заголовок */
  draggable?: boolean;

  /** Можно ли менять размер (corner resize) */
  resizable?: boolean;

  /** Показывать ли затемнение фона */
  hasBackdrop?: boolean;

  /** Текст в статус-баре (footer) */
  statusText?: string;

  /** Закрывать ли при нажатии Escape */
  closeOnEscape?: boolean;

  /** Закрывать ли при клике на фон */
  closeOnBackdropClick?: boolean;

  /** Кастомный класс для overlay-панели */
  panelClass?: string | string[];

  /** Кастомный класс для backdrop */
  backdropClass?: string | string[];
}
