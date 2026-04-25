import { ControlDocumentationConfig } from "@shared/components/ui/control-documentation";

export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: "CategoryTagOfAggregatorManagerComponent",
    path: "src/app/AGREGATOR/PAGES/SPRAVKA/CategoryTagOfAggregatorPage/",
    description: "Административный интерфейс управления категориями (группами) тегов агрегатора.",
    icon: "general/av_page",
  },
  controlComponent: {
    name: "AvShowcaseComponent",
    path: "src/app/shared/components/ui/showcase/showcase.component.ts",
    description: "Универсальный контейнер для отображения контента с боковой панелью управления.",
    icon: "general/av_component",
  },
  mainDescription: {
    componentTitle: "Менеджер категорий (v3.5 Signals)",
    shortDescription: "Interface для управления агрегацией тегов.",
    detailedDescription: "Позволяет создавать, редактировать и настраивать визуальное отображение категорий тегов. Реализован на базе Angular Signals для максимальной производительности.",
    keyFeatures: [
      "🎨 Настройка цвета и иконок (Heritage Logic)",
      "🌍 Полная поддержка локализации и фильтрация по языку",
      "🔄 Real-time валидация (FluentValidation)",
      "🗑️ Поддержка корзины (Soft Delete / Restore)",
      "🔍 Продвинутый поиск по названию и Slug",
      "⚡ Мгновенное обновление состояния через Signals"
    ],
  },
  apiDetails: {
    inputs: [],
    outputs: [],
    methods: [
      {
        name: "loadItems",
        parameters: "checkEmpty?: boolean",
        returnType: "void",
        description: "Загрузка списка категорий из БД с учетом фильтров."
      },
      {
        name: "seedFromJson",
        parameters: "",
        returnType: "void",
        description: "Инициализация базовых категорий из JSON файла обслуживания."
      },
      {
        name: "setShowDeleted",
        parameters: "show: boolean",
        returnType: "void",
        description: "Переключение режима отображения: Активные / Удаленные (Корзина)."
      },
      {
        name: "setLanguageFilter",
        parameters: "id: number | null",
        returnType: "void",
        description: "Фильтрация списка по конкретному языку локализации."
      }
    ],
  },
  usageExamples: [
    {
      title: "Базовая инициализация",
      description: "Пример загрузки данных при старте компонента.",
      htmlCode: `<app-category-tag-of-aggregator-manager></app-category-tag-of-aggregator-manager>`,
      tsCode: `// Внутри компонента:
ngOnInit() {
  this.state.loadItems();
}`,
    }
  ],
  codeExamples: [],
  interactiveExample: {
    title: "Интерактивное управление",
    description: "Используйте Playground для тестирования логики изменения состояния.",
  },
  architectureNotes: [
    {
      type: "info",
      title: "Heritage Logic",
      content: "Теги могут наследовать цвет и иконку от категории, если в их настройках указано 'inherit'.",
    },
    {
      type: "warning",
      title: "Валидация удаления",
      content: "Система заблокирует удаление категории, если к ней привязан хотя бы один активный тег.",
    }
  ],
};
