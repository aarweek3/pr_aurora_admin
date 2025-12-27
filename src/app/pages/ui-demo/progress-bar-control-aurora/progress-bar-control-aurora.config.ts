import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

/**
 * Конфигурация документации для ProgressBarControlAurora
 */
export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'ProgressBarControlAuroraComponent',
    path: 'src/app/pages/ui-demo/progress-bar-control-aurora/',
    description:
      'Демонстрационная страница с интерактивными возможностями управления индикатором прогресса',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'AvProgressComponent (av-progress)',
    path: 'src/app/shared/components/ui/progress/progress.component.ts',
    description:
      'Компонент для визуализации прогресса выполнения задач, загрузки данных или числовых показателей',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'AvProgressComponent (av-progress)',
    shortDescription: 'Высокопроизводительный индикатор прогресса на основе Angular Signals и SVG.',
    detailedDescription:
      'Компонент AvProgress предоставляет гибкие возможности для отображения прогресса в различных форматах: линейном, круговом и в виде дашборда. ' +
      'Благодаря использованию Angular Signals обеспечивается мгновенная реакция на изменения данных и высокая производительность. ' +
      'SVG-рендеринг гарантирует четкость изображения на любых экранах и позволяет создавать сложные градиентные заливки.',
    keyFeatures: [
      '📊 Три типа отображения: Line (линейный), Circle (круговой), Dashboard (панель)',
      '🌈 Поддержка градиентов и кастомных цветовых схем',
      '🔄 Режим Indeterminate для неопределенного времени ожидания',
      '⚡ Высокая производительность благодаря Angular Signals и SVG',
      '📏 Три предустановленных размера (S, M, L) и кастомная настройка толщины (strokeWidth)',
      '🎯 Интеллектуальное отображение статусов (Success, Error, Warning, Active)',
      '🧩 Гибкое форматирование текстового вывода через функцию format',
      '🛡️ Полная типизация и поддержка Accessibility (WAI-ARIA)',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'percent',
        type: 'number',
        defaultValue: '0',
        description:
          'Текущий процент прогресса (от 0 до 100). Значения вне диапазона автоматически ограничиваются.',
        required: true,
      },
      {
        name: 'type',
        type: "'line' | 'circle' | 'dashboard'",
        defaultValue: "'line'",
        description: 'Тип отображения индикатора прогресса.',
        required: false,
      },
      {
        name: 'status',
        type: "'normal' | 'active' | 'success' | 'error' | 'warning'",
        defaultValue: "'normal'",
        description: 'Статус выполнения, влияющий на цвет и анимацию активного состояния.',
        required: false,
      },
      {
        name: 'size',
        type: "'small' | 'default' | 'large' | number",
        defaultValue: "'default'",
        description:
          'Размер компонента. Может быть строковой константой или числом (пиксели) для круговых типов.',
        required: false,
      },
      {
        name: 'strokeWidth',
        type: 'number',
        defaultValue: 'undefined',
        description:
          'Толщина линии прогресса в пикселях. Если не задано, выбирается автоматически согласно размеру.',
        required: false,
      },
      {
        name: 'strokeColor',
        type: 'string | string[] | ProgressGradient',
        defaultValue: 'undefined',
        description:
          'Цвет линии прогресса. Поддерживает HEX, именованные цвета, массивы (для градиентов) и объект ProgressGradient.',
        required: false,
      },
      {
        name: 'trailColor',
        type: 'string',
        defaultValue: "'#f5f5f5'",
        description: 'Цвет фоновой дорожки индикатора.',
        required: false,
      },
      {
        name: 'showInfo',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Флаг отображения текстовой информации о прогрессе или иконок статуса.',
        required: false,
      },
      {
        name: 'indeterminate',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Режим бесконечного прогресса (бегущая анимация).',
        required: false,
      },
      {
        name: 'label',
        type: 'string',
        defaultValue: "''",
        description: 'Текстовая метка, отображаемая вместе с индикатором прогресса.',
        required: false,
      },
      {
        name: 'gapDegree',
        type: 'number',
        defaultValue: '75',
        description: 'Угол разрыва для типа dashboard (в градусах).',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'percentChange',
        type: 'EventEmitter<number>',
        description: 'Событие, возникающее при изменении процента прогресса.',
      },
      {
        name: 'complete',
        type: 'EventEmitter<void>',
        description: 'Событие, возникающее при достижении 100% прогресса.',
      },
    ],
  },

  usageExamples: [
    {
      title: 'Линейный прогресс (Line)',
      description: 'Стандартный горизонтальный индикатор с различными статусами.',
      htmlCode: `<av-progress [percent]="30"></av-progress>
<av-progress [percent]="50" status="active"></av-progress>
<av-progress [percent]="100" status="success"></av-progress>
<av-progress [percent]="70" status="error"></av-progress>`,
      tsCode: '',
    },
    {
      title: 'Круговые индикаторы (Circle & Dashboard)',
      description: 'Компактные индикаторы для дэшбордов и виджетов.',
      htmlCode: `<div style="display: flex; gap: 20px;">
  <av-progress [percent]="75" type="circle"></av-progress>
  <av-progress [percent]="60" type="dashboard" status="warning"></av-progress>
</div>`,
      tsCode: '',
    },
    {
      title: 'Использование градиентов',
      description: 'Настройка цветовой схемы с помощью плавных переходов.',
      htmlCode: `<av-progress
  [percent]="99"
  [strokeColor]="{ from: '#108ee9', to: '#87d068' }">
</av-progress>
<av-progress
  [percent]="65"
  type="circle"
  [strokeColor]="['#ff4d4f', '#faad14']">
</av-progress>`,
      tsCode: '',
    },
    {
      title: 'Режим Indeterminate',
      description: 'Для ситуаций, когда время операции неизвестно.',
      htmlCode: `<av-progress
  [percent]="50"
  [indeterminate]="true"
  label="Загрузка ресурсов...">
</av-progress>`,
      tsCode: '',
    },
  ],

  architectureNotes: [
    {
      type: 'info',
      title: 'Реактивность на сигналах',
      content:
        'Использование Angular Signals позволяет эффективно обновлять SVG-атрибуты без лишних циклов проверки изменений, ' +
        'что критично для анимированных компонентов.',
    },
    {
      type: 'tip',
      title: 'Производительность SVG',
      content:
        'Для круговых типов используются математически выверенные пути (path) и stroke-dasharray. ' +
        'Это обеспечивает идеально гладкое заполнение и минимальную нагрузку на DOM.',
    },
  ],
};
