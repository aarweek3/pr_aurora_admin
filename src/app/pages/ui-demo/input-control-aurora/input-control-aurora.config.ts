import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

export const DOCUMENTATION: ControlDocumentationConfig = {
  // Информация о демонстрационном компоненте
  demoComponent: {
    name: 'InputControlAuroraComponent',
    path: 'src/app/pages/ui-demo/input-control-aurora/input-control-aurora.component.ts',
    description: 'Демонстрация полей ввода (Input)',
    icon: 'editor/av_edit',
  },

  // Описание основного функционала
  mainDescription: {
    componentTitle: 'Input UI Directive',
    shortDescription: 'Универсальная директива для создания полей ввода.',
    detailedDescription:
      'Директива применяется к стандартному input элементу и предоставляет стилизацию, размеры и управление состоянием.',
    keyFeatures: [
      'Поддержка размеров (small, default, large)',
      'Стилизация состояния (disabled, readonly, error)',
      'Интеграция с формами Angular',
    ],
  },

  // 1. Описание API (Inputs / Outputs)
  apiDetails: {
    inputs: [
      {
        name: 'avInput',
        type: 'directive',
        description: 'Применяет стили Aurora UI к нативному input элементу (только для директивы)',
      },
      {
        name: 'label',
        type: 'string',
        description: 'Текст подписи над полем (только для компонента <av-input>)',
      },
      {
        name: 'type',
        type: 'string',
        defaultValue: "'text'",
        description: 'Тип поля ввода (text, password, email и др.)',
      },
      {
        name: 'size / avSize',
        type: "'small' | 'default' | 'large' | 'x-large'",
        defaultValue: "'default'",
        description: 'Размер поля ввода',
      },
      {
        name: 'status / avStatus',
        type: "'default' | 'error' | 'warning' | 'success'",
        defaultValue: "'default'",
        description: 'Статус валидации (цвет границы)',
      },
      {
        name: 'variant / avVariant',
        type: "'outlined' | 'filled' | 'borderless'",
        defaultValue: "'outlined'",
        description: 'Вариант визуального оформления',
      },
      {
        name: 'shape / avShape',
        type: "'default' | 'rounded' | 'rounded-big'",
        defaultValue: "'default'",
        description: 'Форма скругления углов',
      },
      {
        name: 'hint',
        type: 'string',
        description: 'Текст подсказки под полем (только для компонента)',
      },
      {
        name: 'errorMessage',
        type: 'string',
        description: 'Текст ошибки, отображается при status="error" (только для компонента)',
      },
      {
        name: 'prefixIcon',
        type: 'string',
        description: 'Имя иконки в начале поля',
      },
      {
        name: 'suffixIcon',
        type: 'string',
        description: 'Имя иконки в конце поля',
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Блокирует поле ввода',
      },
      {
        name: 'block / avBlock',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Растягивает поле на 100% ширины контейнера',
      },
    ],
    outputs: [
      {
        name: 'valueChange / ngModelChange',
        type: 'string',
        description: 'Событие изменения значения поля',
      },
    ],
  },

  // 2. Примеры использования (для таба "Примеры")
  usageExamples: [
    {
      title: 'Простая директива',
      description: 'Базовое использование директивы avInput на стандартном input.',
      htmlCode: '<input avInput placeholder="Введите что-нибудь..." />',
    },
    {
      title: 'Компонент с Label и Hint',
      description: 'Использование <av-input> для автоматического вывода подписей.',
      htmlCode: `<av-input
  label="Электронная почта"
  placeholder="example@mail.com"
  hint="Мы не передаем ваши данные третьим лицам"
></av-input>`,
    },
    {
      title: 'Поле пароля',
      description: 'Автоматическая кнопка "показать пароль" при type="password".',
      htmlCode: `<av-input
  type="password"
  label="Пароль"
  placeholder="Введите пароль"
></av-input>`,
    },
    {
      title: 'Статусы валидации',
      description: 'Отображение ошибки.',
      htmlCode: `<av-input
  label="Логин"
  value="Invalid"
  status="error"
  errorMessage="Это имя уже занято"
></av-input>`,
    },
  ],

  // 3. Примеры кода (статические, для таба "Код", помимо интерактивного)
  codeExamples: [],

  // 4. Архитектурные заметки
  architectureNotes: [],

  // Интерактивный пример (описание для генерируемого блока)
  interactiveExample: {
    title: 'Интерактивный Playground',
    description: 'Настройте параметры инпута выше, чтобы увидеть сгенерированный код.',
  },
};
