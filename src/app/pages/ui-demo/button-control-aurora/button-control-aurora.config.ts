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
    name: 'ButtonDirective (av-button)',
    path: 'src/app/shared/components/ui/button/button.directive.ts',
    description: 'Основная директива для создания стилизованных кнопок во всем приложении',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'ButtonDirective (av-button)',
    shortDescription:
      'Мощная директива для создания красивых и функциональных кнопок с поддержкой различных типов, размеров и состояний.',
    detailedDescription:
      'Директива av-button предоставляет единообразный API для создания кнопок любой сложности. Поддерживает различные типы (primary, danger, default), варианты отображения (default, dashed, ghost), размеры (small, medium, large), формы (default, circle, square), состояния загрузки и отключения. Автоматически применяет правильные стили, ARIA атрибуты и обеспечивает доступность.',
    keyFeatures: [
      '🎨 Поддержка типов: primary, danger, default',
      '🔄 Варианты отображения: default (обводка), dashed (пунктир), ghost (прозрачный)',
      '📏 Размеры: small, medium, large',
      '🔘 Формы: default (прямоугольная), circle (круглая), square (квадратная)',
      '⚡ Состояния: loading (спиннер), disabled (отключена)',
      '🖼️ Иконки: prefix/suffix поддержка с av-icon',
      '♿ Полная доступность: ARIA атрибуты, keyboard navigation',
      '🎯 Единый API: одинаковое поведение во всем приложении',
      '🧩 Совместимость: работает с Angular Forms, роутингом, событиями',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'avType',
        type: '"primary" | "danger" | "default"',
        defaultValue: '"primary"',
        description: 'Тип кнопки определяющий цветовую схему',
        required: false,
      },
      {
        name: 'avVariant',
        type: '"default" | "dashed" | "ghost"',
        defaultValue: '"default"',
        description: 'Вариант отображения (обводка, пунктир, прозрачная)',
        required: false,
      },
      {
        name: 'avSize',
        type: '"small" | "medium" | "large"',
        defaultValue: '"medium"',
        description: 'Размер кнопки',
        required: false,
      },
      {
        name: 'avShape',
        type: '"default" | "circle" | "square"',
        defaultValue: '"default"',
        description: 'Форма кнопки',
        required: false,
      },
      {
        name: 'avLoading',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Показать спиннер загрузки',
        required: false,
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Отключить кнопку (стандартный HTML атрибут)',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'click',
        type: 'MouseEvent',
        description: 'Стандартное событие клика по кнопке',
      },
    ],
    methods: [
      {
        name: 'focus',
        parameters: '',
        returnType: 'void',
        description: 'Программно установить фокус на кнопку',
      },
      {
        name: 'blur',
        parameters: '',
        returnType: 'void',
        description: 'Программно убрать фокус с кнопки',
      },
    ],
  },

  usageExamples: [
    {
      title: 'Базовая кнопка',
      description: 'Простейший вариант использования директивы av-button',
      htmlCode: `<button av-button avType="primary">
  Нажми меня
</button>`,
      tsCode: `// Никакого дополнительного TypeScript кода не требуется
// Директива работает автоматически`,
    },
    {
      title: 'Кнопка с иконкой и состояниями',
      description: 'Использование с иконкой, загрузкой и событием клика',
      htmlCode: `<button
  av-button
  avType="danger"
  avVariant="ghost"
  avSize="large"
  [avLoading]="isLoading"
  [disabled]="isDisabled"
  (click)="onDeleteClick()">
  <av-icon type="general/av_delete"></av-icon>
  Удалить
</button>`,
      tsCode: `export class MyComponent {
  isLoading = false;
  isDisabled = false;

  onDeleteClick() {
    this.isLoading = true;
    // Логика удаления...
  }
}`,
    },
  ],

  codeExamples: [
    {
      title: 'Базовые примеры использования',
      description: 'Визуальные примеры с различными конфигурациями',
      htmlCode: `<!-- Primary кнопки -->
<button av-button avType="primary">Primary</button>
<button av-button avType="primary" avVariant="ghost">Primary Ghost</button>

<!-- Danger кнопки -->
<button av-button avType="danger">Danger</button>
<button av-button avType="danger" avVariant="dashed">Danger Dashed</button>

<!-- С иконками -->
<button av-button avType="primary">
  <av-icon type="actions/av_check_mark"></av-icon>
  Сохранить
</button>`,
      tsCode: `// Никакой дополнительный TypeScript код не требуется`,
    },
  ],

  interactiveExample: {
    title: 'Интерактивный пример',
    description: 'Код, генерируемый на основе настроек в Playground',
  },

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
