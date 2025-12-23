/**
 * Документация компонента
 */
export interface DemoDocumentation {
  /** Основное руководство по использованию (HTML или Markdown) */
  usage: string;

  /** Инструкция по установке (опционально) */
  installation?: string;

  /** Полезные советы */
  tips?: string[];

  /** Дополнительные ссылки */
  links?: { title: string; url: string }[];
}
