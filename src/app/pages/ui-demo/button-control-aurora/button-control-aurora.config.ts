import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

/**
 * Конфигурация документации для ButtonControlAurora
 */
export const BUTTON_CONTROL_DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'ButtonControlAuroraComponent',
    path: 'src/app/pages/ui-demo/button-control-aurora/',
    description: 'Демонстрационная страница с интерактивными возможностями управления кнопками',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'ButtonSettingsControlComponent',
    path: 'src/app/shared/components/ui/button/button-settings-control/',
    description:
      'Основной компонент управления параметрами кнопок - готовое решение для интеграции',
    icon: 'general/av_settings',
  },

  mainDescription: {
    componentTitle: 'ButtonSettingsControlComponent',
    shortDescription:
      'Готовый компонент для управления всеми параметрами кнопки с живым предварительным просмотром.',
    detailedDescription:
      'Этот компонент предоставляет полноценный интерфейс для настройки всех параметров кнопки: тип (primary/danger), вариант отображения (default/dashed/ghost), размер (small/medium/large), форма (default/circle/square), состояние загрузки, отключения и т.д. Идеально подходит для админских панелей, конструкторов интерфейсов и инструментов дизайна.',
    keyFeatures: [
      '🎨 Поддержка всех типов кнопок: primary, danger, default',
      '🔄 Три варианта отображения: default (обводка), dashed (пунктир), ghost (прозрачный)',
      '📏 Три размера: small (маленький), medium (средний), large (большой)',
      '🔘 Три формы: default (прямоугольная), circle (круглая), square (квадратная)',
      '⚡ Состояния: loading (загрузка), disabled (отключена)',
      '🖼️ Поддержка иконок: prefix (слева), suffix (справа), icon-only (только иконка)',
      '🎭 Живой предварительный просмотр в реальном времени',
      '📝 Генерация кода для копирования',
      '🌙 Поддержка тёмной темы',
      '♿ Полная доступность (ARIA, клавиатура)',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'buttonType',
        type: 'string',
        defaultValue: '"primary"',
        description: 'Тип кнопки: "primary", "danger", "default"',
        required: false,
      },
      {
        name: 'variant',
        type: 'string',
        defaultValue: '"default"',
        description: 'Вариант отображения: "default", "dashed", "ghost"',
        required: false,
      },
      {
        name: 'size',
        type: 'string',
        defaultValue: '"medium"',
        description: 'Размер кнопки: "small", "medium", "large"',
        required: false,
      },
      {
        name: 'shape',
        type: 'string',
        defaultValue: '"default"',
        description: 'Форма кнопки: "default", "circle", "square"',
        required: false,
      },
      {
        name: 'loading',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Показать состояние загрузки со спиннером',
        required: false,
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Отключить кнопку',
        required: false,
      },
      {
        name: 'iconPrefix',
        type: 'string | null',
        defaultValue: 'null',
        description: 'Иконка слева от текста',
        required: false,
      },
      {
        name: 'iconSuffix',
        type: 'string | null',
        defaultValue: 'null',
        description: 'Иконка справа от текста',
        required: false,
      },
      {
        name: 'text',
        type: 'string',
        defaultValue: '"Button"',
        description: 'Текст кнопки',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'buttonConfigChange',
        type: 'ButtonConfig',
        description: 'Событие при изменении любого параметра кнопки',
      },
      {
        name: 'codeGenerated',
        type: 'string',
        description: 'Событие генерации HTML-кода кнопки',
      },
    ],
    methods: [
      {
        name: 'resetToDefaults',
        parameters: '',
        returnType: 'void',
        description: 'Сброс всех настроек к значениям по умолчанию',
      },
      {
        name: 'generateCode',
        parameters: '',
        returnType: 'string',
        description: 'Генерация HTML-кода с текущими настройками',
      },
    ],
  },

  usageExamples: [
    {
      title: 'Базовое использование',
      description: 'Простейший вариант использования с настройками по умолчанию',
      htmlCode: `<button-settings-control
  [buttonType]="'primary'"
  [variant]="'default'"
  (buttonConfigChange)="onConfigChange($event)">
</button-settings-control>`,
      tsCode: `export class MyComponent {
  onConfigChange(config: ButtonConfig) {
    console.log('Новая конфигурация:', config);
  }
}`,
    },
    {
      title: 'С начальными настройками',
      description: 'Использование с предустановленной конфигурацией',
      htmlCode: `<button-settings-control
  [buttonType]="'danger'"
  [variant]="'ghost'"
  [size]="'large'"
  [iconPrefix]="'general/av_delete'"
  [text]="'Удалить'"
  (codeGenerated)="onCodeGenerated($event)">
</button-settings-control>`,
      tsCode: `export class MyComponent {
  onCodeGenerated(htmlCode: string) {
    // Скопировать код в буфер обмена
    navigator.clipboard.writeText(htmlCode);
  }
}`,
    },
  ],

  architectureNotes: [
    {
      type: 'info',
      title: 'Интеграция с дизайн-системой',
      content:
        'Компонент использует глобальные стили из src/styles/components/_button.scss. Все созданные кнопки автоматически наследуют корректную стилизацию.',
    },
    {
      type: 'warning',
      title: 'Обновление стилей',
      content:
        'При изменении стилей кнопок в глобальном файле _button.scss изменения автоматически применятся ко всем кнопкам в проекте, включая демонстрационные.',
    },
    {
      type: 'tip',
      title: 'Производительность',
      content:
        'Компонент использует Angular Signals для реактивности, что обеспечивает оптимальную производительность при частых изменениях параметров.',
    },
  ],
};
