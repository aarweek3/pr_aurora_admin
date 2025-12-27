import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

/**
 * Конфигурация документации для HelpContainerControlAurora
 */
export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'HelpContainerControlAuroraComponent',
    path: 'src/app/pages/ui-demo/help-container-control-aurora/',
    description: 'Демонстрационная страница компонента для отображения и копирования кода',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'HelpCopyContainerComponent (av-help-copy-container)',
    path: 'src/app/shared/components/ui/container-help-copy-ui/',
    description:
      'Стилизованный контейнер для демонстрации фрагментов кода или текста с возможностью копирования и вызова справки.',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'Help Copy Container Aurora',
    shortDescription: 'Универсальный блок для отображения программного кода и документации.',
    detailedDescription:
      'HelpCopyContainer позволяет красиво оформить примеры кода, инструкции или техническую информацию. ' +
      'Он включает встроенную подсветку (через фон), кнопку быстрого копирования в буфер обмена ' +
      'и опциональную кнопку "?" для отображения контекстной справки.',
    keyFeatures: [
      '📜 Отображение многострочного контента с сохранением форматирования',
      '📋 Встроенная кнопка копирования с уведомлением',
      '❓ Опциональная кнопка справки с выпадающим окном',
      '🎨 Полная кастомизация фона (HEX, RGB или системные цвета)',
      '📏 Гибкая настройка размеров (Width, Height)',
      '🏗️ Совместимость с любыми типами контента (JSON, HTML, TS, Plain Text)',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'title',
        type: 'string',
        defaultValue: "'Код использования'",
        description: 'Заголовок блока, отображаемый в верхней части.',
        required: false,
      },
      {
        name: 'content',
        type: 'string',
        defaultValue: "''",
        description: 'Текст или код для отображения и копирования.',
        required: true,
      },
      {
        name: 'width',
        type: 'string',
        defaultValue: "'100%'",
        description: 'Ширина контейнера (CSS значение).',
        required: false,
      },
      {
        name: 'height',
        type: 'string',
        defaultValue: "'auto'",
        description: 'Высота контейнера (CSS значение).',
        required: false,
      },
      {
        name: 'bgColor',
        type: 'string',
        defaultValue: 'null',
        description:
          'Цвет фона контентной области (HEX/RGB). Если не задан, используется дефолтный темный фон.',
        required: false,
      },
      {
        name: 'showCopy',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Флаг отображения кнопки копирования.',
        required: false,
      },
      {
        name: 'showHelpButton',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Флаг отображения кнопки справки (?).',
        required: false,
      },
      {
        name: 'helpContent',
        type: 'string',
        defaultValue: 'null',
        description: 'Текст справки, который отображается при клике на "?".',
        required: false,
      },
      {
        name: 'disableInternalHelp',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'Отключает встроенное окно справки, позволяя использовать кнопку как внешний триггер.',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'helpToggled',
        type: 'boolean',
        description: 'Событие, возникающее при открытии/закрытии справки.',
      },
    ],
  },

  usageExamples: [
    {
      title: 'Базовый пример',
      description: 'Демонстрация JSON конфигурации.',
      htmlCode: `<av-help-copy-container
  title="Config Example"
  [content]="appConfig"
  bgColor="#1e293b">
</av-help-copy-container>`,
      tsCode: `appConfig = JSON.stringify({ theme: 'dark', version: '2.0' }, null, 2);`,
    },
    {
      title: 'Со справкой и кастомным размером',
      description: 'Использование кнопки "?" для пояснений.',
      htmlCode: `<av-help-copy-container
  title="Environment Variables"
  [content]="envData"
  [showHelpButton]="true"
  helpContent="Эти переменные должны храниться в секретах CI/CD"
  width="400px"
  height="200px">
</av-help-copy-container>`,
      tsCode: `envData = 'API_KEY=********\\nDB_URL=localhost:5432';`,
    },
  ],

  architectureNotes: [
    {
      type: 'info',
      title: 'Контекст использования',
      content:
        'Компонент оптимизирован для использования в администравтивных панелях и документации, ' +
        'где требуется частое копирование путей, ключей или фрагментов кода.',
    },
    {
      type: 'tip',
      title: 'Прокрутка',
      content:
        'При большом объеме контента и фиксированной высоте, контейнер автоматически включает вертикальную прокрутку.',
    },
  ],
};
