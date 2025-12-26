import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

/**
 * Конфигурация документации для FieldGroupControlAurora
 * Используется унифицированное имя DOCUMENTATION для всех компонентов
 */
export const DOCUMENTATION: ControlDocumentationConfig = {
  // 1. Информация о демонстрационном компоненте
  demoComponent: {
    name: 'FieldGroupControlAuroraComponent',
    path: 'src/app/pages/ui-demo/field-group-component-aurora/',
    description: 'Демонстрационная страница с интерактивными возможностями управления',
    icon: 'general/av_page',
  },

  // 2. Информация о целевом компоненте/директиве
  controlComponent: {
    name: 'FieldGroupComponent (av-field-group)',
    path: 'src/app/shared/components/ui/field-group/field-group.component.ts',
    description:
      'Основной компонент для создания логических групп полей формы с поддержкой сворачивания и кастомизации стилей',
    icon: 'general/av_component',
  },

  // 3. Основное описание компонента
  mainDescription: {
    componentTitle: 'FieldGroupComponent (av-field-group)',
    shortDescription:
      'Компонент для логической группировки элементов управления в формах с расширенной кастомизацией',
    detailedDescription:
      'Универсальный компонент предназначен для создания визуальных групп полей в формах. Поддерживает множество стилевых вариантов, механизм сворачивания, гибкую настройку цветов и форм. Автоматически адаптируется под содержимое и обеспечивает удобный пользовательский интерфейс.',
    keyFeatures: [
      '🎨 5 стилевых вариантов (Block, Default, Minimal, Filled, Highlighted)',
      '📐 4 предустановленных формы углов + кастомное скругление',
      '🔄 Интеллектуальный механизм сворачивания с анимациями',
      '🎯 3 размера (Small, Medium, Large)',
      '🌈 Полная кастомизация цветов (8 цветовых свойств)',
      '� Адаптивный дизайн и поддержка Grid/Flex',
      '⚡ Эффекты наведения с плавными анимациями',
      '🔧 Двусторонняя привязка состояния сворачивания',
    ],
  },

  // 4. Детальное API (самая важная секция)
  apiDetails: {
    inputs: [
      {
        name: 'label',
        type: 'string',
        defaultValue: 'undefined',
        description: 'Текст заголовка группы',
        required: false,
      },
      {
        name: 'variant',
        type: "'block' | 'default' | 'minimal' | 'filled' | 'highlighted'",
        defaultValue: "'block'",
        description: 'Стилевой вариант группы',
        required: false,
      },
      {
        name: 'size',
        type: "'small' | 'medium' | 'large'",
        defaultValue: "'medium'",
        description: 'Размер группы (влияет на отступы и размер шрифта)',
        required: false,
      },
      {
        name: 'shape',
        type: "'square' | 'default' | 'rounded' | 'rounded-big'",
        defaultValue: "'default'",
        description: 'Форма углов группы',
        required: false,
      },
      {
        name: 'radius',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Произвольное скругление углов (переопределяет shape)',
        required: false,
      },
      {
        name: 'collapsible',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Включить механизм сворачивания',
        required: false,
      },
      {
        name: 'isCollapsed',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Состояние сворачивания (поддерживает двустороннюю привязку)',
        required: false,
      },
      {
        name: 'showBackground',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Отображать фон области по умолчанию',
        required: false,
      },
      {
        name: 'hoverBackground',
        type: "'none' | 'intensify'",
        defaultValue: "'intensify'",
        description: 'Поведение фона при наведении',
        required: false,
      },
      {
        name: 'labelColor',
        type: 'string',
        defaultValue: "'#8c8c8c'",
        description: 'Цвет текста заголовка',
        required: false,
      },
      {
        name: 'labelColorHover',
        type: 'string',
        defaultValue: "'#1890ff'",
        description: 'Цвет текста заголовка при наведении',
        required: false,
      },
      {
        name: 'arrowColor',
        type: 'string',
        defaultValue: "'#8c8c8c'",
        description: 'Цвет стрелки сворачивания',
        required: false,
      },
      {
        name: 'arrowColorHover',
        type: 'string',
        defaultValue: "'#1890ff'",
        description: 'Цвет стрелки при наведении',
        required: false,
      },
      {
        name: 'borderColor',
        type: 'string',
        defaultValue: "'#dcdee0'",
        description: 'Цвет рамки',
        required: false,
      },
      {
        name: 'borderColorHover',
        type: 'string',
        defaultValue: "'#1890ff'",
        description: 'Цвет рамки при наведении',
        required: false,
      },
      {
        name: 'headerBgColor',
        type: 'string',
        defaultValue: "'#ffffff'",
        description: 'Цвет фона заголовка',
        required: false,
      },
      {
        name: 'headerBgColorHover',
        type: 'string',
        defaultValue: "'#ffffff'",
        description: 'Цвет фона заголовка при наведении',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'isCollapsedChange',
        type: 'boolean',
        description: 'Событие изменения состояния сворачивания',
      },
    ],
    methods: [
      {
        name: 'toggle',
        parameters: '',
        returnType: 'void',
        description: 'Переключить состояние сворачивания',
      },
      {
        name: 'collapse',
        parameters: '',
        returnType: 'void',
        description: 'Свернуть группу',
      },
      {
        name: 'expand',
        parameters: '',
        returnType: 'void',
        description: 'Развернуть группу',
      },
    ],
  },

  // 5. Примеры использования (для вкладки "Примеры")
  usageExamples: [
    {
      title: 'Базовый пример',
      description: 'Простейший вариант использования с заголовком',
      htmlCode: `<av-field-group label="Персональные данные">
  <input av-input placeholder="Введите имя..." />
  <input av-input placeholder="Введите email..." />
</av-field-group>`,
    },
    {
      title: 'Сворачиваемая группа',
      description: 'Группа с возможностью сворачивания и двусторонней привязкой',
      htmlCode: `<av-field-group
  label="Дополнительные настройки"
  [collapsible]="true"
  [(isCollapsed)]="isCollapsed">
  <div class="settings-content">
    <p>Расширенные опции конфигурации</p>
  </div>
</av-field-group>`,
      tsCode: `export class MyComponent {
  isCollapsed = signal(false);
}`,
    },
    {
      title: 'Кастомные стили',
      description: 'Группа с индивидуальными цветами и формой',
      htmlCode: `<av-field-group
  label="Статус системы"
  variant="filled"
  shape="rounded"
  [labelColor]="'#52c41a'"
  [borderColor]="'#52c41a'">
  <div class="status-content">
    <span>Все системы работают штатно</span>
  </div>
</av-field-group>`,
    },
  ],

  // 6. Примеры кода (для вкладки "Код")
  codeExamples: [
    {
      title: 'Стилевые варианты',
      description: 'Демонстрация всех доступных вариантов оформления',
      htmlCode: `<!-- Block (по умолчанию) -->
<av-field-group label="Block стиль">
  <input av-input placeholder="Легкий режим без рамки" />
</av-field-group>

<!-- Default с рамкой -->
<av-field-group label="Default стиль" variant="default">
  <input av-input placeholder="Классическая рамка" />
</av-field-group>

<!-- Минимальный стиль -->
<av-field-group label="Minimal стиль" variant="minimal">
  <input av-input placeholder="Пунктирная линия" />
</av-field-group>

<!-- Заливка -->
<av-field-group label="Filled стиль" variant="filled">
  <input av-input placeholder="Сплошная заливка" />
</av-field-group>

<!-- Выделенная -->
<av-field-group label="Highlighted стиль" variant="highlighted">
  <input av-input placeholder="Акцентная рамка" />
</av-field-group>`,
      tsCode: `// Все варианты доступны из коробки
// Дополнительный TypeScript код не требуется`,
    },
    {
      title: 'Формы и размеры',
      description: 'Различные размеры и формы углов',
      htmlCode: `<!-- Размеры -->
<av-field-group label="Small размер" size="small">
  <input av-input placeholder="Компактный вид" />
</av-field-group>

<av-field-group label="Large размер" size="large">
  <input av-input placeholder="Увеличенные отступы" />
</av-field-group>

<!-- Формы углов -->
<av-field-group label="Прямоугольные углы" shape="square">
  <input av-input placeholder="Без скругления" />
</av-field-group>

<av-field-group label="Сильное скругление" shape="rounded-big">
  <input av-input placeholder="Мягкие углы" />
</av-field-group>

<av-field-group label="Кастомное скругление" [radius]="24">
  <input av-input placeholder="Произвольное значение" />
</av-field-group>`,
      tsCode: `// Для кастомного радиуса можно использовать переменные
export class MyComponent {
  customRadius = 24; // или '1.5rem', '20px' и т.д.
}`,
    },
  ],

  // 7. Интерактивный пример (ссылка на Playground)
  interactiveExample: {
    title: 'Интерактивный Playground',
    description: 'Настройте все параметры компонента и получите готовый код для использования',
  },

  // 8. Архитектурные заметки
  architectureNotes: [
    {
      type: 'info',
      title: 'Интеграция с дизайн-системой',
      content:
        'Компонент полностью интегрирован с Aurora Design System и автоматически наследует цветовую схему и типографику из глобальных стилей. Поддерживает темную тему через CSS переменные.',
    },
    {
      type: 'warning',
      title: 'Производительность при множественном использовании',
      content:
        'При использовании большого количества FieldGroup компонентов на странице рекомендуется использовать OnPush стратегию изменений и избегать частых изменений цветовых свойств.',
    },
    {
      type: 'tip',
      title: 'Оптимизация анимаций',
      content:
        "Для улучшения производительности анимации сворачивания используют CSS transitions. При необходимости отключения анимаций добавьте класс 'reduce-motion' к родительскому элементу.",
    },
    {
      type: 'info',
      title: 'Семантическая доступность',
      content:
        'Компонент автоматически добавляет ARIA атрибуты для сворачиваемых элементов, что обеспечивает корректную работу со скринридерами и улучшает доступность.',
    },
  ],
};
