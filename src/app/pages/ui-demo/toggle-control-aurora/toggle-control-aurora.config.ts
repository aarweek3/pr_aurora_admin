import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

/**
 * Конфигурация документации для ToggleControlAurora
 */
export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'ToggleControlAuroraComponent',
    path: 'src/app/pages/ui-demo/toggle-control-aurora/',
    description:
      'Демонстрационная страница с интерактивными возможностями управления переключателями',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'Toggle System (avToggle / av-toggle)',
    path: 'src/app/shared/components/ui/toggle/',
    description: 'Система компонентов и директив для бинарного выбора (Вкл/Выкл)',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'Toggle System Aurora',
    shortDescription: 'Высокопроизводительные переключатели на базе Angular Signals.',
    detailedDescription:
      'Система переключателей Aurora предоставляет три способа интеграции: легкую директиву avToggle для ' +
      'нативных checkbox-инпутов, полнофункциональный компонент av-toggle с поддержкой лейблов, ' +
      'и специализированный av-toggle-labeled для отображения текстового статуса. Все варианты ' +
      'поддерживают кастомную стилизацию размеров, цветов и скруглений.',
    keyFeatures: [
      '⚡ Три режима: Директива (avToggle), Компонент (av-toggle), Labeled (av-toggle-labeled)',
      '📏 Полная кастомизация размеров: ширина, высота и радиус скругления',
      '🌈 Поддержка системных цветов (primary, success, danger) и кастомных HEX',
      '🏷️ Умные лейблы: позиционирование текста со всех сторон (Top, Bottom, Left, Right)',
      '🔗 Бесшовная интеграция с Reactive Forms и [(ngModel)]',
      '♿ Доступность: полная поддержка фокуса и навигации с клавиатуры',
      '⬛ Формы: выбор между стандартным овалом и квадратом со скруглением',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'checked',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Состояние включения/выключения. Поддерживает двустороннюю связь.',
        required: false,
      },
      {
        name: 'size',
        type: "'small' | 'default' | 'large'",
        defaultValue: "'default'",
        description: 'Предустановленный размер переключателя.',
        required: false,
      },
      {
        name: 'color',
        type: 'string',
        defaultValue: "'primary'",
        description: 'Цвет активного состояния (пресет или HEX).',
        required: false,
      },
      {
        name: 'shape',
        type: "'default' | 'square'",
        defaultValue: "'default'",
        description: 'Форма переключателя (стандарт или квадрат со скруглением).',
        required: false,
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Блокировка взаимодействия с элементом.',
        required: false,
      },
      {
        name: 'labelPosition',
        type: "'top' | 'bottom' | 'left' | 'right'",
        defaultValue: "'right'",
        description: 'Расположение текстового лейбла (только для av-toggle).',
        required: false,
      },
      {
        name: 'width',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Кастомная ширина в пикселях или CSS единицах.',
        required: false,
      },
      {
        name: 'height',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Кастомная высота.',
        required: false,
      },
      {
        name: 'radius',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Кастомный радиус скругления.',
        required: false,
      },
      {
        name: 'leftLabel / rightLabel',
        type: 'string',
        defaultValue: "''",
        description: 'Текстовые метки для av-toggle-labeled.',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'checkedChange',
        type: 'boolean',
        description: 'Событие изменения состояния.',
      },
    ],
  },

  usageExamples: [
    {
      title: 'Использование директивы',
      description: 'Самый производительный вариант для простых форм.',
      htmlCode: `<label class="av-toggle">
  <input type="checkbox" avToggle [(ngModel)]="isActive" avColor="success" />
  <span class="av-toggle__slider"></span>
</label>`,
      tsCode: `isActive = signal(true);`,
    },
    {
      title: 'Компонент с лейблом',
      description: 'Удобный оберточный компонент с встроенным текстом.',
      htmlCode: `<av-toggle [(checked)]="isNotifications" labelPosition="right">
  Включить уведомления
</av-toggle>`,
      tsCode: `isNotifications = signal(false);`,
    },
    {
      title: 'Labeled переключатель',
      description: 'Отображение текущего статуса текстом.',
      htmlCode: `<av-toggle-labeled
  [(checked)]="isOnline"
  leftLabel="OFFLINE"
  rightLabel="ONLINE"
  color="#10b981">
</av-toggle-labeled>`,
      tsCode: `isOnline = signal(true);`,
    },
  ],

  architectureNotes: [
    {
      type: 'info',
      title: 'Производительность',
      content:
        'Использование директивы avToggle на нативном инпуте предпочтительнее в больших списках, ' +
        'так как она создает минимум DOM-элементов.',
    },
    {
      type: 'tip',
      title: 'Кастомная стилизация',
      content:
        'Для реализации уникальных дизайнов используйте параметры width и height. ' +
        'Компонент автоматически рассчитает размеры внутреннего переключателя.',
    },
  ],
};
