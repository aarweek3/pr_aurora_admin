/**
 * Модели для универсального компонента документации UI Control компонентов
 */

export interface ControlDocumentationConfig {
  /** Информация о демонстрационном компоненте */
  demoComponent: ComponentInfo;

  /** Информация о контрольном компоненте (если есть) */
  controlComponent?: ComponentInfo;

  /** Описание основного функционала */
  mainDescription: MainComponentDescription;

  /** Детали API компонента */
  apiDetails: ApiDetails;

  /** Примеры использования */
  usageExamples: UsageExample[];

  /** Примеры кода для табов (динамический контент) */
  codeExamples?: CodeExample[];

  /** Интерактивный пример для playground */
  interactiveExample?: InteractiveExample;

  /** Архитектурные заметки */
  architectureNotes?: ArchitectureNote[];
}

export interface ComponentInfo {
  /** Название компонента */
  name: string;

  /** Относительный путь от src/app */
  path: string;

  /** Краткое описание назначения */
  description: string;

  /** Иконка для отображения */
  icon: string;
}

export interface MainComponentDescription {
  /** Название компонента для заголовка */
  componentTitle: string;

  /** Краткое описание (1-2 предложения) */
  shortDescription: string;

  /** Подробное описание функционала */
  detailedDescription: string;

  /** Ключевые особенности */
  keyFeatures: string[];
}

export interface ApiDetails {
  /** Input параметры */
  inputs: ApiProperty[];

  /** Output события */
  outputs: ApiProperty[];

  /** Методы (если есть публичные) */
  methods?: ApiMethod[];
}

export interface ApiProperty {
  /** Название property/event */
  name: string;

  /** Тип данных */
  type: string;

  /** Значение по умолчанию */
  defaultValue?: string;

  /** Описание назначения */
  description: string;

  /** Обязательное ли поле */
  required?: boolean;
}

export interface ApiMethod {
  /** Название метода */
  name: string;

  /** Параметры метода */
  parameters: string;

  /** Возвращаемый тип */
  returnType: string;

  /** Описание назначения */
  description: string;
}

export interface UsageExample {
  /** Заголовок примера */
  title: string;

  /** HTML код */
  htmlCode: string;

  /** TypeScript код (если нужен) */
  tsCode?: string;

  /** Описание примера */
  description?: string;
}

export interface CodeExample {
  /** Заголовок примера для таба "💻 Код" */
  title: string;

  /** HTML код */
  htmlCode: string;

  /** TypeScript код */
  tsCode: string;

  /** Описание примера */
  description?: string;
}

export interface InteractiveExample {
  /** Заголовок для интерактивного примера */
  title: string;

  /** Описание интерактивного примера */
  description: string;
}

export interface ArchitectureNote {
  /** Тип заметки */
  type: 'info' | 'warning' | 'tip' | 'danger';

  /** Заголовок */
  title: string;

  /** Содержание */
  content: string;
}
