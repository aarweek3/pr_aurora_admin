/**
 * Элемент данных для мониторинга
 */
export interface AvMonitorEntry {
  /** Название параметра */
  name: string;
  /** Значение параметра */
  value: any;
  /** Опциональное описание или подсказка */
  description?: string;
}

/**
 * Конфигурация окна мониторинга
 */
export interface AvMonitorConfig {
  /** Заголовок модального окна */
  title?: string;
  /** Список параметров для отображения построчно */
  data?: AvMonitorEntry[];
  /** Дополнительные данные в формате JSON (например, для всего объекта) */
  jsonData?: any;
  /** URL изображения для блока мониторинга изображения */
  imageUrl?: string;
  /** JSON данные, специфичные для изображения */
  imageJson?: any;
  /** HTML-код изображения (например, figure сниппет) для рендеринга */
  imageHtml?: string;
  /** Ширина модального окна (по умолчанию 800px) */
  width?: string | number;
  /** Разрешить перетаскивание (по умолчанию true) */
  draggable?: boolean;
}
