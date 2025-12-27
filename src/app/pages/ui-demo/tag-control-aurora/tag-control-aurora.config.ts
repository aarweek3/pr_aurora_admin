import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

/**
 * Конфигурация документации для TagControlAurora
 */
export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'TagControlAuroraComponent',
    path: 'src/app/pages/ui-demo/tag-control-aurora/',
    description:
      'Демонстрационная страница с интерактивными возможностями управления системой тегов',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'TagComponent (av-tag)',
    path: 'src/app/shared/components/ui/tag/tag.component.ts',
    description: 'Компонент для отображения категорий, статусов и меток',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'Tag System Aurora',
    shortDescription: 'Гибкая система тегов для классификации и ввода данных.',
    detailedDescription:
      'Система тегов Aurora включает в себя два основных компонента: av-tag для отображения информации ' +
      'и av-tag-input для интерактивного ввода списков. Оба компонента глубоко интегрированы с ' +
      'дизайн-системой, поддерживают 3 варианта заливки, 5 системных цветов и кастомные HEX-значения. ' +
      'Архитектура на Angular Signals обеспечивает мгновенную реакцию интерфейса на изменения.',
    keyFeatures: [
      '🎨 3 стиля: Soft (мягкий), Filled (сплошной) и Outlined (контурный)',
      '📏 3 предустановленных размера: Small, Medium, Large',
      '💠 2 формы: Rounded (стандарт) и Pill (овальный)',
      '🏷️ Tag Input: поддержка добавления через Enter/Запятую и удаление через Backspace',
      '🔗 Полная интеграция с Angular Forms (ControlValueAccessor)',
      '✨ Поддержка SVG-иконок для визуальной идентификации категорий',
      '🖱️ Интерактивность: поддержка режимов [clickable] и [removable]',
      '🌈 Поддержка любых кастомных HEX цветов для специфических категорий',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'label',
        type: 'string',
        defaultValue: "''",
        description: 'Текст тега (используется в av-tag).',
        required: true,
      },
      {
        name: 'color',
        type: 'TagColor | string',
        defaultValue: "'primary'",
        description: 'Цвет тега. Системный статус (primary, success и др.) или HEX.',
        required: false,
      },
      {
        name: 'variant',
        type: "'soft' | 'filled' | 'outlined'",
        defaultValue: "'soft'",
        description: 'Стиль заливки тега.',
        required: false,
      },
      {
        name: 'size',
        type: "'small' | 'medium' | 'large'",
        defaultValue: "'medium'",
        description: 'Размер компонента.',
        required: false,
      },
      {
        name: 'shape',
        type: "'rounded' | 'pill'",
        defaultValue: "'rounded'",
        description: 'Форма углов тега.',
        required: false,
      },
      {
        name: 'icon',
        type: 'string | null',
        defaultValue: 'null',
        description: 'Путь к SVG-иконке внутри тега.',
        required: false,
      },
      {
        name: 'removable',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Отображает кнопку удаления тега.',
        required: false,
      },
      {
        name: 'clickable',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Добавляет hover-эффект и делает тег интерактивным.',
        required: false,
      },
      {
        name: 'tags',
        type: 'string[]',
        defaultValue: '[]',
        description: 'Массив строк для av-tag-input. Поддерживает двустороннюю связь.',
        required: false,
      },
      {
        name: 'placeholder',
        type: 'string',
        defaultValue: "'Add tag...'",
        description: 'Текст в пустом поле ввода (av-tag-input).',
        required: false,
      },
      {
        name: 'allowDuplicates',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Разрешает добавление одинаковых тегов.',
        required: false,
      },
      {
        name: 'maxTags',
        type: 'number',
        defaultValue: 'undefined',
        description: 'Максимальное количество тегов в списке.',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'removed',
        type: 'string',
        description: 'Событие при нажатии на кнопку удаления.',
      },
      {
        name: 'clicked',
        type: 'string',
        description: 'Событие при клике на тег.',
      },
      {
        name: 'tagsChange',
        type: 'string[]',
        description: 'Событие при изменении списка тегов в av-tag-input.',
      },
    ],
  },

  usageExamples: [
    {
      title: 'Статусы задач',
      description: 'Использование системных цветов для индикации состояния.',
      htmlCode: `<av-tag label="В работе" color="warning" variant="soft"></av-tag>
<av-tag label="Выполнено" color="success" variant="filled"></av-tag>
<av-tag label="Ошибка" color="error" variant="outlined"></av-tag>`,
      tsCode: '',
    },
    {
      title: 'Интерактивный ввод навыков',
      description: 'Использование av-tag-input для управления списком.',
      htmlCode: `<av-tag-input
  [(tags)]="userSkills"
  placeholder="Введите навык..."
  color="primary"
  variant="soft">
</av-tag-input>`,
      tsCode: `userSkills = signal(['Angular', 'TypeScript']);`,
    },
    {
      title: 'Кликабельные категории с иконками',
      description: 'Теги как элементы навигации или фильтрации.',
      htmlCode: `<av-tag
  label="Дизайн"
  icon="actions/av_star"
  [clickable]="true"
  (clicked)="onCategoryClick('design')">
</av-tag>`,
      tsCode: `onCategoryClick(cat: string) { console.log(cat); }`,
    },
  ],

  architectureNotes: [
    {
      type: 'info',
      title: 'Двустороннее связывание',
      content:
        'Компонент av-tag-input поддерживает синтаксис [(tags)], что позволяет автоматически синхронизировать ' +
        'состояние массива в родительском компоненте через Angular Signals.',
    },
    {
      type: 'tip',
      title: 'Кастомные цвета',
      content:
        'Параметр [color] принимает не только системные пресеты, но и любое валидное CSS-значение цвета (Hex, RGB), ' +
        'что позволяет точно соответствовать элементам брендинга.',
    },
  ],
};
