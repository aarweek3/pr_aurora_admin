/**
 * Пример использования компонента
 */
export interface DemoExample {
  /** Заголовок примера */
  title: string;

  /** Описание примера (опционально) */
  description?: string;

  /** Код примера */
  code: string;

  /** Пометить как рекомендуемый пример */
  highlight?: boolean;
}
