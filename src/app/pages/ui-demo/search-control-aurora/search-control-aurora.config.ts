import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

export const SEARCH_CONTROL_DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'SearchControlAuroraComponent',
    path: 'src/app/pages/ui-demo/search-control-aurora/',
    description: 'Демонстрация возможностей компонента "Живой поиск"',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'SearchInputComponent (av-search)',
    path: 'src/app/shared/components/ui/search/search.component.ts',
    description: 'Инпут поиска с поддержкой debounce, очистки и кастомизации',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'Search Input (av-search)',
    shortDescription:
      'Компонент поиска с поддержкой Angular Signals, дебаунсом (задержкой ввода) и кнопкой очистки.',
    detailedDescription:
      'Полнофункциональный компонент поиска, который оптимизирует нагрузку на API благодаря механизму debounce. Поддерживает двустороннее связывание данных через Signals, различные размеры и кастомизацию текста.',
    keyFeatures: [
      '⚡ Реактивность на основе Angular Signals',
      '⏳ Встроенный Debounce (защита от частых запросов)',
      '❌ Кнопка быстрой очистки поля',
      '📏 4 размера: Small, Default, Large, X-Large',
      '⌨️ Поддержка клавиатуры (Enter для мгновенного поиска)',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'value',
        type: 'string (ModelSignal)',
        defaultValue: "''",
        description: 'Двустороннее связывание значения поиска',
        required: true,
      },
      {
        name: 'avPlaceholder',
        type: 'string',
        defaultValue: "'Поиск...'",
        description: 'Текст плейсхолдера',
      },
      {
        name: 'avButtonText',
        type: 'string',
        defaultValue: "'Найти'",
        description: 'Текст кнопки поиска',
      },
      {
        name: 'avSize',
        type: "'small' | 'default' | 'large' | 'x-large'",
        defaultValue: "'default'",
        description: 'Размер компонента',
      },
      {
        name: 'avDebounceTime',
        type: 'number',
        defaultValue: '300',
        description: 'Время задержки перед отправкой события поиска (в мс)',
      },
      {
        name: 'avVariant',
        type: "'outlined' | 'filled' | 'borderless'",
        defaultValue: "'outlined'",
        description: 'Вариант стиля',
      },
      {
        name: 'avShape',
        type: "'default' | 'rounded' | 'rounded-big'",
        defaultValue: "'default'",
        description: 'Форма скругления',
      },
      {
        name: 'avStatus',
        type: "'default' | 'error' | 'warning' | 'success'",
        defaultValue: "'default'",
        description: 'Статус валидации',
      },
      {
        name: 'avWidth/Height/Radius',
        type: 'string | number',
        defaultValue: 'null',
        description: 'Кастомные размеры и радиус',
      },
    ],
    outputs: [
      {
        name: 'onSearch',
        type: 'string',
        description:
          'Событие, возникающее после окончания ввода (с учетом debounce) или при нажатии Enter/Найти',
      },
    ],
    methods: [],
  },

  usageExamples: [
    {
      title: 'Базовое использование',
      description: 'Простой поиск с дефолтными настройками (debounce 300ms)',
      htmlCode: `<av-search
  [(value)]="searchQuery"
  (onSearch)="handleSearch($event)">
</av-search>`,
      tsCode: `searchQuery = signal('');

handleSearch(query: string) {
  console.log('API Request:', query);
}`,
    },
    {
      title: 'Варианты отображения (Styles)',
      description: 'Использование различных вариантов (filled, borderless) и форм (rounded)',
      htmlCode: `<!-- Filled + Rounded -->
<av-search
  avVariant="filled"
  avShape="rounded"
  avPlaceholder="Поиск в архиве..."
  [(value)]="search1">
</av-search>

<!-- Borderless -->
<av-search
  avVariant="borderless"
  avPlaceholder="Поиск без границ..."
  [(value)]="search2">
</av-search>`,
    },
    {
      title: 'Статусы валидации (Status)',
      description: 'Визуальная индикация ошибок или успешных действий',
      htmlCode: `<av-search
  avStatus="error"
  avPlaceholder="Ошибка соединения..."
  [(value)]="errorSearch">
</av-search>

<av-search
  avStatus="success"
  avPlaceholder="Успешно найдено"
  [(value)]="successSearch">
</av-search>`,
    },
    {
      title: 'Кастомные размеры (Dimensions)',
      description: 'Полный контроль над шириной, высотой и радиусом',
      htmlCode: `<av-search
  avWidth="100%"
  avHeight="48px"
  avRadius="12px"
  avSize="large"
  avButtonText="Найти везде"
  [(value)]="customSearch">
</av-search>`,
    },
    {
      title: 'Управление задержкой (Debounce)',
      description: 'Увеличение времени ожидания до 800мс для снижения нагрузки на API',
      htmlCode: `<av-search
  [avDebounceTime]="800"
  [(value)]="query"
  (onSearch)="onSearch($event)">
</av-search>`,
    },
  ],

  codeExamples: [
    {
      title: 'Полная конфигурация',
      description: 'Пример со всеми доступными настройками',
      htmlCode: `<av-search
  [(value)]="searchQuery"
  avPlaceholder="Поиск сотрудников..."
  avButtonText="Найти"
  avSize="large"
  avVariant="outlined"
  avShape="rounded"
  avStatus="default"
  [avDebounceTime]="500"
  (onSearch)="performSearch($event)">
</av-search>`,
      tsCode: `import { Component, signal } from '@angular/core';
import { SearchInputComponent } from '@shared/components/ui/search';

@Component({
  selector: 'app-users-search',
  standalone: true,
  imports: [SearchInputComponent],
  template: \`<av-search [(value)]="searchQuery" (onSearch)="performSearch($event)"></av-search>\`
})
export class UsersSearchComponent {
  searchQuery = signal('');

  performSearch(query: string) {
    if (!query) return;
    console.log('Searching users:', query);
  }
}`,
    },
  ],

  architectureNotes: [
    {
      type: 'info',
      title: 'Принцип работы Debounce',
      content:
        'При вводе текста событие `onSearch` откладывается на указанное время (`avDebounceTime`). Если пользователь продолжает печатать, таймер сбрасывается. Это предотвращает отправку запросов на каждый введенный символ.',
    },
    {
      type: 'tip',
      title: 'Принудительный поиск',
      content:
        'Нажатие клавиши **Enter** или кнопки **Найти** игнорирует таймер debounce и вызывает событие `onSearch` мгновенно.',
    },
    {
      type: 'warning',
      title: 'Реактивность',
      content:
        'Компонент использует `ModelSignal` для `value`. Убедитесь, что вы передаете сигнал, если хотите реактивного обновления извне.',
    },
  ],
};
