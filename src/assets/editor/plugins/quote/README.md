# Quote Plugin для Aurora Editor

Плагин для вставки стилизованных цитат с настраиваемым оформлением.

## 📋 Оглавление

- [Возможности](#возможности)
- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Структура проекта](#структура-проекта)
- [Использование](#использование)
- [Конфигурация](#конфигурация)
- [API](#api)
- [Архитектура](#архитектура)
- [Разработка](#разработка)
- [FAQ](#faq)

## ✨ Возможности

### Основные функции

- 🎨 **5 готовых стилей** - Classic, Modern, Minimal, Accent, Elegant
- ✏️ **Кастомные стили** - создание, редактирование, удаление
- 💾 **Offline-first** - работа без интернета через IndexedDB
- 📤 **Импорт/Экспорт** - обмен стилями через JSON файлы
- 🔍 **Live preview** - предпросмотр цитаты в реальном времени
- ⌨️ **Горячая клавиша** - Ctrl+Shift+Q для быстрой вставки
- 📱 **Responsive** - адаптивный интерфейс для мобильных устройств

### Технические особенности

- **TypeScript** - полная типизация
- **Angular Standalone Components** - современная архитектура
- **Dexie.js** - обертка над IndexedDB для удобной работы с данными
- **RxJS** - реактивное управление состоянием
- **Inline CSS** - стили встраиваются напрямую в HTML

## 🚀 Установка

### 1. Установка зависимостей

```bash
npm install dexie
```

### 2. Копирование файлов плагина

Скопируйте папку `quote` в директорию плагинов вашего редактора:

```
src/app/editor/plugins/quote/
├── config/
│   └── quote-presets.ts          # Готовые стили
├── types/
│   └── blockquote-styles.types.ts # TypeScript типы
├── services/
│   ├── aurora-db.service.ts       # IndexedDB
│   ├── blockquote-styles.service.ts # CRUD операции
│   └── blockquote-generator.service.ts # Генератор HTML
├── modals/
│   └── blockquote-modal/          # Модальное окно
│       ├── blockquote-modal.component.ts
│       ├── blockquote-modal.component.html
│       └── blockquote-modal.component.scss
├── quote.config.ts                # Конфигурация
└── quote.plugin.ts                # Главный класс плагина
```

### 3. Регистрация плагина

В вашем `aurora-editor.component.ts`:

```typescript
import { QuotePlugin } from './plugins/quote/quote.plugin';

export class AuroraEditorComponent {
  private plugins: AuroraPlugin[] = [];

  ngOnInit() {
    // Создаем экземпляр плагина
    const quotePlugin = new QuotePlugin();

    // Инициализируем
    quotePlugin.init();

    // Добавляем в список плагинов
    this.plugins.push(quotePlugin);
  }
}
```

## 🎯 Быстрый старт

### Базовое использование

1. **Выделите текст** в редакторе, который хотите превратить в цитату
2. Нажмите **Ctrl+Shift+Q** или кликните на кнопку "Цитата" в тулбаре
3. Модальное окно откроется с выделенным текстом
4. Выберите стиль из галереи
5. Опционально заполните поля "Автор" и "Источник"
6. Нажмите **"Вставить цитату"**

### Программная вставка

```typescript
import { QuotePlugin } from './plugins/quote/quote.plugin';
import { BlockquoteData } from './plugins/quote/types/blockquote-styles.types';

// Создаем плагин
const quotePlugin = new QuotePlugin();
quotePlugin.init();

// Данные цитаты
const quoteData: BlockquoteData = {
  text: 'Воображение важнее знания',
  author: 'Альберт Эйнштейн',
  source: 'Интервью 1929 года',
  styleId: 'classic',
};

// Вставляем в редактор
const editorElement = document.querySelector('.aurora-editor') as HTMLElement;
await quotePlugin.insertQuote(quoteData, editorElement);
```

## 📁 Структура проекта

```
quote/
├── config/                        # Конфигурация и пресеты
│   └── quote-presets.ts          # 5 готовых стилей
│
├── types/                         # TypeScript определения
│   └── blockquote-styles.types.ts # 12+ интерфейсов
│
├── services/                      # Бизнес-логика
│   ├── aurora-db.service.ts      # IndexedDB (Dexie.js)
│   ├── blockquote-styles.service.ts # CRUD + импорт/экспорт
│   └── blockquote-generator.service.ts # HTML/CSS генерация
│
├── modals/                        # UI компоненты
│   └── blockquote-modal/
│       ├── blockquote-modal.component.ts    # 470 строк
│       ├── blockquote-modal.component.html  # 180 строк
│       └── blockquote-modal.component.scss  # 420 строк
│
├── quote.config.ts               # Конфигурация плагина (180 строк)
├── quote.plugin.ts               # Главный класс (550 строк)
└── README.md                     # Документация
```

**Итого:** 10 файлов, ~3,786 строк кода

## 🎨 Использование

### Работа с модальным окном

#### Вкладка "Содержимое"

- **Текст цитаты** (обязательно) - основной текст
- **Автор** (опционально) - имя автора цитаты
- **Источник** (опционально) - книга, статья, речь и т.д.
- **Preview** - живой предпросмотр с выбранным стилем

#### Вкладка "Стиль"

- **Готовые стили** - 5 предустановленных стилей
- **Мои стили** - ваши кастомные стили
- **Действия**:
  - ✏️ Редактировать (только кастомные)
  - 📋 Дублировать
  - 🗑️ Удалить (только кастомные)
  - 📤 Экспортировать все
  - 📥 Импортировать из JSON

### Управление стилями

#### Импорт стилей

```typescript
// Через UI
// 1. Открыть модальное окно
// 2. Перейти на вкладку "Стиль"
// 3. Нажать "Импортировать"
// 4. Выбрать JSON файл

// Программно
import { BlockquoteStylesService } from './services/blockquote-styles.service';

const stylesService = new BlockquoteStylesService();
const file = /* File object */;
const result = await stylesService.importStylesFromFile(file);

console.log(`Импортировано: ${result.imported}, Пропущено: ${result.skipped}`);
```

#### Экспорт стилей

```typescript
// Через UI
// 1. Открыть модальное окно
// 2. Перейти на вкладку "Стиль"
// 3. Нажать "Экспортировать"
// 4. Файл загрузится автоматически

// Программно
const stylesService = new BlockquoteStylesService();
await stylesService.downloadStylesAsFile();
```

#### Создание кастомного стиля

```typescript
import { BlockquoteStyle } from './types/blockquote-styles.types';

const customStyle: Omit<BlockquoteStyle, 'id' | 'isCustom'> = {
  name: 'Мой стиль',
  quoteStyles: {
    background: '#f0f9ff',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: '#0ea5e9',
    padding: '20px',
    fontStyle: 'italic',
    fontSize: '18px',
    color: '#0c4a6e',
    // ... остальные свойства
  },
  footerStyles: {
    fontSize: '14px',
    color: '#64748b',
    // ... остальные свойства
  },
};

const created = await stylesService.createCustomStyle(customStyle);
console.log('Создан стиль:', created.id);
```

## ⚙️ Конфигурация

### Параметры плагина

```typescript
import { QuotePlugin } from './quote.plugin';

const quotePlugin = new QuotePlugin({
  // ID плагина (должен быть уникальным)
  id: 'quote',

  // Отображаемое имя
  name: 'Цитата',

  // Горячая клавиша
  hotkey: 'Ctrl+Shift+Q',

  // Показывать кнопку в тулбаре
  showInToolbar: true,

  // Порядок в тулбаре
  toolbarOrder: 50,

  // CSS класс для blockquote
  blockquoteClassName: 'aurora-blockquote',

  // Лимиты
  maxQuoteLength: 5000,
  maxAuthorLength: 200,
  maxSourceLength: 500,

  // Анимации
  useAnimations: true,

  // Автофокус на textarea
  autoFocusTextarea: true,

  // Запоминать последний стиль
  rememberLastStyle: true,

  // Режим отладки
  debug: false,
});
```

### Константы

```typescript
import { QUOTE_CONSTANTS } from './quote.config';

// CSS классы
QUOTE_CONSTANTS.CSS_CLASSES.BLOCKQUOTE; // 'aurora-blockquote'
QUOTE_CONSTANTS.CSS_CLASSES.TEXT; // 'aurora-blockquote-text'
QUOTE_CONSTANTS.CSS_CLASSES.FOOTER; // 'aurora-blockquote-footer'

// Data-атрибуты
QUOTE_CONSTANTS.DATA_ATTRIBUTES.STYLE_ID; // 'data-style-id'
QUOTE_CONSTANTS.DATA_ATTRIBUTES.AUTHOR; // 'data-author'
QUOTE_CONSTANTS.DATA_ATTRIBUTES.SOURCE; // 'data-source'

// События
QUOTE_CONSTANTS.EVENTS.QUOTE_INSERTED; // 'quote:inserted'
QUOTE_CONSTANTS.EVENTS.MODAL_OPENED; // 'quote:modal-opened'
QUOTE_CONSTANTS.EVENTS.STYLE_SELECTED; // 'quote:style-selected'
```

## 🔌 API

### QuotePlugin (главный класс)

#### Методы жизненного цикла

```typescript
// Инициализация плагина
quotePlugin.init(): void

// Выполнение команды (открытие модалки)
quotePlugin.execute(editorElement: HTMLElement, options?: QuoteModalOptions): void

// Проверка активности (курсор в blockquote?)
quotePlugin.isActive(editorElement: HTMLElement): boolean

// Очистка ресурсов
quotePlugin.destroy(): void
```

#### Публичные методы

```typescript
// Программная вставка цитаты
await quotePlugin.insertQuote(
  data: BlockquoteData,
  editorElement: HTMLElement
): Promise<QuoteOperationResult>

// Редактирование существующей цитаты
quotePlugin.editQuote(blockquoteElement: HTMLElement): void
```

### BlockquoteStylesService

```typescript
// Получить все стили (Observable)
stylesService.getAllStyles(): Observable<BlockquoteStyle[]>

// Получить стиль по ID
await stylesService.getStyleById(id: string): Promise<BlockquoteStyle | undefined>

// Создать кастомный стиль
await stylesService.createCustomStyle(style: Omit<BlockquoteStyle, 'id' | 'isCustom'>): Promise<BlockquoteStyle>

// Обновить кастомный стиль
await stylesService.updateCustomStyle(id: string, updates: Partial<BlockquoteStyle>): Promise<boolean>

// Удалить кастомный стиль (soft delete)
await stylesService.deleteCustomStyle(id: string): Promise<boolean>

// Дублировать стиль
await stylesService.duplicateStyle(id: string, newName: string): Promise<BlockquoteStyle | null>

// Экспортировать все стили
await stylesService.exportStyles(): Promise<string> // JSON string

// Импортировать стили
await stylesService.importStyles(json: string): Promise<ImportResult>
await stylesService.importStylesFromFile(file: File): Promise<ImportResult>

// Статистика
await stylesService.getStats(): Promise<{
  totalStyles: number;
  presetStyles: number;
  customStyles: number;
  deletedStyles: number;
  unsyncedStyles: number;
}>
```

### BlockquoteGenerator (статический класс)

```typescript
// Создать blockquote элемент
BlockquoteGenerator.createBlockquote(
  data: BlockquoteData,
  style: BlockquoteStyle
): HTMLElement

// Создать HTML строку
BlockquoteGenerator.createBlockquoteHTML(
  data: BlockquoteData,
  style: BlockquoteStyle
): string

// Применить стили к существующему элементу
BlockquoteGenerator.updateBlockquoteStyle(
  element: HTMLElement,
  style: BlockquoteStyle
): void

// Извлечь данные из blockquote элемента
BlockquoteGenerator.extractDataFromBlockquote(
  element: HTMLElement
): BlockquoteData | null

// Получить CSS объект для Angular [ngStyle]
BlockquoteGenerator.getBlockquoteCSSObject(
  styles: QuoteStyles
): Record<string, string>

// Утилиты
BlockquoteGenerator.isBlockquote(element: HTMLElement): boolean
BlockquoteGenerator.findParentBlockquote(element: HTMLElement): HTMLElement | null
```

## 🏗️ Архитектура

### Слои приложения

```
┌─────────────────────────────────────────┐
│         UI Layer (Components)           │
│  - BlockquoteModalComponent             │
│  - BlockquoteStyleEditorComponent       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Business Logic (Services)          │
│  - BlockquoteStylesService (CRUD)       │
│  - BlockquoteGenerator (HTML/CSS)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Data Layer (IndexedDB)            │
│  - AuroraDB (Dexie.js wrapper)          │
│  - Table: blockquoteStyles              │
└─────────────────────────────────────────┘
```

### Паттерны проектирования

- **Singleton** - экземпляр базы данных `db`
- **Static Factory** - `BlockquoteGenerator` (статический класс)
- **Observable Pattern** - RxJS для реактивности
- **Dependency Injection** - Angular DI для сервисов
- **Offline-First** - все операции сначала в IndexedDB

### Поток данных

```
User Action (UI)
    ↓
Component Event
    ↓
Service Method (CRUD)
    ↓
IndexedDB Operation (Dexie)
    ↓
BehaviorSubject Update
    ↓
Observable Subscription
    ↓
UI Update (Angular)
```

## 🛠️ Разработка

### Требования

- Node.js >= 16
- Angular >= 15
- TypeScript >= 4.7
- Dexie.js >= 3.0

### Запуск в dev режиме

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run start

# Открыть в браузере
# http://localhost:4200
```

### Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run e2e

# Coverage
npm run test:coverage
```

### Сборка

```bash
# Production build
npm run build

# Проверка результата
ls dist/
```

### Debug режим

```typescript
const quotePlugin = new QuotePlugin({
  debug: true, // Включает логирование в консоль
});
```

Все операции плагина будут логироваться:

```
[QuotePlugin] Initialized with config: {...}
[QuotePlugin] execute() called
[QuotePlugin] Event dispatched: quote:inserted
```

## 📚 FAQ

### Как добавить свой готовый стиль?

Отредактируйте `config/quote-presets.ts`:

```typescript
export const MY_CUSTOM_STYLE: BlockquoteStyle = {
  id: 'my-style',
  name: 'Мой стиль',
  isCustom: false,
  quoteStyles: {
    /* ... */
  },
  footerStyles: {
    /* ... */
  },
};

export const BLOCKQUOTE_PRESETS = [
  CLASSIC_STYLE,
  MODERN_STYLE,
  MINIMAL_STYLE,
  ACCENT_STYLE,
  ELEGANT_STYLE,
  MY_CUSTOM_STYLE, // Добавить сюда
];
```

### Как изменить горячую клавишу?

```typescript
const quotePlugin = new QuotePlugin({
  hotkey: 'Ctrl+Alt+Q', // Новая комбинация
});
```

### Как ограничить количество кастомных стилей?

В `services/blockquote-styles.service.ts`:

```typescript
private readonly MAX_CUSTOM_STYLES = 50;  // Было 100
```

### Как очистить все данные?

```typescript
import { clearDB } from './services/aurora-db.service';

// Удалить все кастомные стили
await clearDB();

// Или через сервис
const stylesService = new BlockquoteStylesService();
await stylesService.clearAllCustomStyles();
```

### Можно ли использовать без Angular?

Нет, плагин использует Angular-специфичные API:

- Standalone Components
- Dependency Injection
- RxJS Observable
- ViewChild, ComponentRef

Для других фреймворков нужна адаптация.

### Как добавить синхронизацию с сервером?

В Sprint 2 оставлены заглушки:

```typescript
// В blockquote-styles.service.ts
async syncWithServer(): Promise<void> {
  // TODO: Реализовать синхронизацию
  // 1. Получить unsyncedStyles из IndexedDB
  // 2. Отправить на сервер (POST /api/styles/sync)
  // 3. Получить серверные стили
  // 4. Вызвать mergeServerStyles()
}

async mergeServerStyles(serverStyles: BlockquoteStyle[]): Promise<void> {
  // TODO: Реализовать merge логику
  // Сравнение по updatedAt, разрешение конфликтов
}
```

Смотрите секцию 2.5 в технической спецификации.

## 📄 Лицензия

MIT License

## 👥 Авторы

- **TomashBraun1964** - Основной разработчик
- Aurora Editor Team

## 🔗 Ссылки

- [Техническая спецификация](../../../doc/TS%20plagin%20Quote%20Technical%20Specification.txt)
- [API документация](./API.md)
- [Примеры использования](./EXAMPLES.md)
- [Dexie.js Documentation](https://dexie.org/)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)

---

**Версия плагина:** 1.0.0
**Дата обновления:** 6 декабря 2025 г.
**Статус:** Sprint 6 завершен (ядро готово к использованию)
