import { DemoControl } from './demo-control.interface';
import { DemoDocumentation } from './demo-documentation.interface';
import { DemoExample } from './demo-example.interface';

/**
 * Полная конфигурация для демо-компонента
 */
export interface DemoConfig {
  /** Название компонента для отображения (например, "🔘 Button Component") */
  title: string;

  /** Название класса компонента (например, "ButtonComponent") */
  componentName: string;

  /** Путь к компоненту (например, "src/app/shared/components/ui/button") */
  componentPath: string;

  /** Контролы для настройки свойств компонента */
  controls: DemoControl[];

  /** Примеры использования */
  examples: DemoExample[];

  /** Документация */
  documentation: DemoDocumentation;

  /** Интерфейс API компонента (код в виде строки) */
  apiInterface: string;

  /** Код импорта компонента */
  importCode: string;
}
