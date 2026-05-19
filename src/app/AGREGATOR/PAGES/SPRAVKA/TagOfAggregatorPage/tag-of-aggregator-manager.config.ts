import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'TagOfAggregatorManagerComponent',
    path: 'src/app/AGREGATOR/PAGES/SPRAVKA/TagOfAggregatorPage/',
    description: 'Административный интерфейс управления тегами агрегатора.',
    icon: 'general/av_page',
  },
  controlComponent: {
    name: 'AvShowcaseComponent',
    path: 'src/app/shared/components/ui/showcase/showcase.component.ts',
    description: 'Универсальный контейнер для отображения контента с боковой панелью управления.',
    icon: 'general/av_component',
  },
  mainDescription: {
    componentTitle: 'Менеджер тегов (v3.5 - Golden Sample)',
    shortDescription: 'Interface для управления тегами и семантическими метками.',
    detailedDescription:
      'Главный инструмент управления тегами. Поддерживает категории, типы тегов, SEO-параметры и наследование визуальных стилей от родительских категорий.',
    keyFeatures: [
      '🔗 Привязка к иерархии категорий',
      '🎨 Heritage Logic (наследование цвета и иконки)',
      '🚩RequiresTranslation: индикатор необходимости перевода',
      '🗑️ Режим корзины (Soft Delete)',
      '📱 Поддержка разных типов: Functional, OS, Hardware и др.',
    ],
  },
  apiDetails: {
    inputs: [],
    outputs: [],
    methods: [
      {
        name: 'loadItems',
        parameters: 'checkEmpty?: boolean',
        returnType: 'void',
        description:
          'Метод обновления списка с учетом текущих фильтров (slug, категория, корзина).',
      },
    ],
  },
  usageExamples: [
    {
      title: 'Регистрация в приложении',
      description: 'Маршрут регистрируется в app.routes.ts с ленивой загрузкой.',
      htmlCode: `{ path: 'agregator/references/tags', loadChildren: () => import(...) }`,
      tsCode: ``,
    },
  ],
  codeExamples: [],
  interactiveExample: {
    title: 'Фильтрация и Поиск',
    description: 'Тестирование рехтивной фильтрации по категориям и тексту.',
  },
  architectureNotes: [
    {
      type: 'tip',
      title: 'English Fallback',
      content:
        'Если перевод на текущий язык отсутствует, система автоматически подтягивает данные из en-US версии или Slug.',
    },
  ],
};
