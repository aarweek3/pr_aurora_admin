/**
 * Конфигурация для создания VS Modal
 */
export interface VSModalConfig<TData = any> {
  /** Заголовок окна */
  title: string;

  /** Данные, передаваемые в модальное окно */
  data?: TData;

  /** Ширина окна (px или строка с единицами измерения) */
  width?: string | number;

  /** Высота окна (px или строка с единицами измерения) */
  height?: string | number;

  /** Показывать ли backdrop (затемнение фона) */
  hasBackdrop?: boolean;

  /** Можно ли перетаскивать окно */
  draggable?: boolean;

  /** Текст статуса в footer (Status Bar) */
  statusText?: string;

  /** Можно ли изменять размер окна */
  resizable?: boolean;

  /** Закрывать ли окно по клавише Escape */
  closeOnEscape?: boolean;
}
