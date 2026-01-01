# API Documentation - Quote Plugin

Полная справка по API плагина вставки цитат.

## 📋 Оглавление

- [Интерфейсы и типы](#интерфейсы-и-типы)
- [QuotePlugin](#quoteplugin)
- [BlockquoteStylesService](#blockquotestylesservice)
- [BlockquoteGenerator](#blockquotegenerator)
- [AuroraDB](#auroradb)
- [Конфигурация](#конфигурация)
- [События](#события)

---

## 🎯 Интерфейсы и типы

### BlockquoteStyle

Основной интерфейс стиля цитаты.

```typescript
interface BlockquoteStyle {
  id: string; // Уникальный ID стиля
  name: string; // Отображаемое имя
  isCustom: boolean; // true = кастомный, false = пресет
  quoteStyles: QuoteStyles; // Стили для blockquote
  footerStyles: FooterStyles; // Стили для footer
}
```

### QuoteStyles

Стили для основного blockquote элемента (27 свойств).

```typescript
interface QuoteStyles {
  // Фон и рамка
  background?: string; // CSS color (например, '#f3f4f6')
  borderWidth?: string; // CSS border-width ('2px')
  borderStyle?: BorderStyle; // 'solid' | 'dashed' | 'dotted' | 'double' | 'none'
  borderColor?: string; // CSS color
  borderRadius?: string; // CSS border-radius ('8px')

  // Отступы
  padding?: string; // CSS padding ('20px')
  margin?: string; // CSS margin ('16px 0')

  // Типографика
  fontStyle?: FontStyle; // 'normal' | 'italic' | 'oblique'
  fontSize?: string; // CSS font-size ('16px')
  fontWeight?: FontWeight; // '300' | '400' | '500' | '600' | '700'
  color?: string; // CSS color текста
  textAlign?: TextAlign; // 'left' | 'center' | 'right' | 'justify'
  lineHeight?: string; // CSS line-height ('1.6')

  // Эффекты
  boxShadow?: string; // CSS box-shadow
  opacity?: string; // CSS opacity ('1')

  // Псевдоэлемент ::before
  beforeContent?: string; // Контент (emoji, unicode, текст)
  beforeFontSize?: string; // Размер шрифта для ::before
  beforeColor?: string; // Цвет ::before
  beforeOpacity?: string; // Прозрачность ::before
  beforePosition?: BeforePosition; // Позиционирование ::before
}
```

### FooterStyles

Стили для footer (автор/источник) - 11 свойств.

```typescript
interface FooterStyles {
  marginTop?: string; // CSS margin-top ('12px')
  fontSize?: string; // CSS font-size
  fontStyle?: FontStyle; // 'normal' | 'italic' | 'oblique'
  fontWeight?: FontWeight; // '300' | '400' | '500' | '600' | '700'
  color?: string; // CSS color
  textAlign?: TextAlign; // 'left' | 'center' | 'right' | 'justify'
  opacity?: string; // CSS opacity

  // Специфичные для <cite>
  citeColor?: string; // Цвет источника
  citeFontStyle?: FontStyle; // Стиль источника
  citeFontWeight?: FontWeight; // Жирность источника
  citeTextDecoration?: string; // CSS text-decoration ('underline')
}
```

### BeforePosition

Позиционирование псевдоэлемента ::before.

```typescript
interface BeforePosition {
  top?: string; // CSS top ('-10px')
  right?: string; // CSS right
  bottom?: string; // CSS bottom
  left?: string; // CSS left ('-20px')
}
```

### BlockquoteData

Данные для вставки цитаты.

```typescript
interface BlockquoteData {
  text: string; // Текст цитаты (обязательно)
  author?: string; // Автор (опционально)
  source?: string; // Источник (опционально)
  styleId: string; // ID стиля (обязательно)
}
```

### BlockquoteStyleRecord

Запись в IndexedDB (расширяет BlockquoteStyle).

```typescript
interface BlockquoteStyleRecord extends BlockquoteStyle {
  createdAt: number; // Timestamp создания
  updatedAt: number; // Timestamp последнего обновления
  syncedAt?: number; // Timestamp последней синхронизации
  deleted?: boolean; // Флаг мягкого удаления
}
```

### ImportResult

Результат операции импорта стилей.

```typescript
interface ImportResult {
  success: boolean; // Успешность операции
  imported: number; // Количество импортированных
  skipped: number; // Количество пропущенных
  updated: number; // Количество обновленных
  errors: string[]; // Массив ошибок
}
```

### ExportedStylesData

Формат экспортированных данных.

```typescript
interface ExportedStylesData {
  version: string; // Версия формата ('1.0')
  exportedAt: string; // ISO timestamp
  count: number; // Количество стилей
  styles: BlockquoteStyleRecord[]; // Массив стилей
}
```

### ValidationResult

Результат валидации стиля.

```typescript
interface ValidationResult {
  valid: boolean; // true = валиден
  errors: string[]; // Массив ошибок валидации
}
```

---

## 🔌 QuotePlugin

Главный класс плагина, реализующий интерфейс `AuroraPlugin`.

### Конструктор

```typescript
constructor(customConfig?: Partial<QuotePluginConfig>)
```

**Параметры:**

- `customConfig` - Пользовательская конфигурация (опционально)

**Пример:**

```typescript
const plugin = new QuotePlugin({
  hotkey: 'Ctrl+Alt+Q',
  debug: true,
  maxQuoteLength: 3000,
});
```

### Свойства

```typescript
readonly id: string              // ID плагина ('quote')
readonly name: string            // Имя ('Цитата')
readonly description: string     // Описание
readonly icon: string            // SVG иконка
readonly hotkey: string          // Горячая клавиша
readonly config: QuotePluginConfig  // Полная конфигурация
```

### Методы жизненного цикла

#### init()

Инициализация плагина (вызывается при регистрации).

```typescript
init(): void
```

**Что делает:**

- Загружает конфигурацию из localStorage
- Устанавливает глобальные обработчики событий
- Логирует инициализацию (если debug=true)

**Пример:**

```typescript
const plugin = new QuotePlugin();
plugin.init();
```

---

#### execute()

Выполнение команды плагина (открытие модального окна).

```typescript
execute(
  editorElement: HTMLElement,
  options?: Partial<QuoteModalOptions>
): void
```

**Параметры:**

- `editorElement` - Элемент редактора
- `options` - Опции для модального окна (опционально)

**Опции:**

```typescript
interface QuoteModalOptions {
  mode: 'insert' | 'edit'; // Режим работы
  prefilledText?: string; // Предзаполненный текст
  prefilledAuthor?: string; // Предзаполненный автор
  prefilledSource?: string; // Предзаполненный источник
  preselectedStyleId?: string; // Предвыбранный стиль
  savedSelection?: Range; // Сохраненная позиция курсора
  editingElement?: HTMLElement; // Редактируемый элемент
}
```

**Пример:**

```typescript
// Простой вызов
plugin.execute(editorElement);

// С опциями
plugin.execute(editorElement, {
  mode: 'insert',
  prefilledText: 'Выделенный текст',
  preselectedStyleId: 'modern',
});
```

---

#### isActive()

Проверка активности плагина (для подсветки кнопки в тулбаре).

```typescript
isActive(editorElement: HTMLElement): boolean
```

**Параметры:**

- `editorElement` - Элемент редактора

**Возвращает:**

- `true` если курсор находится внутри blockquote
- `false` в противном случае

**Пример:**

```typescript
const isActive = plugin.isActive(editorElement);
if (isActive) {
  // Подсветить кнопку в тулбаре
  button.classList.add('active');
}
```

---

#### destroy()

Очистка ресурсов при уничтожении плагина.

```typescript
destroy(): void
```

**Что делает:**

- Закрывает открытое модальное окно
- Удаляет глобальные обработчики событий
- Очищает ссылки

**Пример:**

```typescript
ngOnDestroy() {
  this.quotePlugin.destroy();
}
```

---

### Публичные API методы

#### insertQuote()

Программная вставка цитаты в редактор.

```typescript
async insertQuote(
  data: BlockquoteData,
  editorElement: HTMLElement
): Promise<QuoteOperationResult>
```

**Параметры:**

- `data` - Данные цитаты
- `editorElement` - Элемент редактора

**Возвращает:**

```typescript
interface QuoteOperationResult {
  success: boolean; // Успешность операции
  error?: string; // Сообщение об ошибке
  element?: HTMLElement; // Вставленный элемент
  styleId?: string; // ID использованного стиля
}
```

**Пример:**

```typescript
const result = await plugin.insertQuote(
  {
    text: 'Текст цитаты',
    author: 'Автор',
    styleId: 'classic',
  },
  editorElement,
);

if (result.success) {
  console.log('Цитата вставлена:', result.element);
} else {
  console.error('Ошибка:', result.error);
}
```

---

#### editQuote()

Открытие модального окна для редактирования существующей цитаты.

```typescript
editQuote(blockquoteElement: HTMLElement): void
```

**Параметры:**

- `blockquoteElement` - Элемент blockquote для редактирования

**Пример:**

```typescript
const blockquote = document.querySelector('blockquote.aurora-blockquote');
if (blockquote) {
  plugin.editQuote(blockquote as HTMLElement);
}
```

---

## 📦 BlockquoteStylesService

Сервис для управления стилями цитат (CRUD операции + импорт/экспорт).

### Свойства

```typescript
allStyles$: Observable<BlockquoteStyle[]>; // Реактивный поток всех стилей
```

### Методы получения

#### getAllStyles()

Получить Observable всех стилей (пресеты + кастомные).

```typescript
getAllStyles(): Observable<BlockquoteStyle[]>
```

**Возвращает:**

- Observable массива стилей

**Пример:**

```typescript
this.stylesService.getAllStyles().subscribe((styles) => {
  console.log(`Всего стилей: ${styles.length}`);
});
```

---

#### getStyleById()

Получить стиль по ID.

```typescript
async getStyleById(id: string): Promise<BlockquoteStyle | undefined>
```

**Параметры:**

- `id` - ID стиля

**Возвращает:**

- Promise с стилем или undefined

**Пример:**

```typescript
const style = await stylesService.getStyleById('classic');
if (style) {
  console.log('Найден стиль:', style.name);
}
```

---

#### getPresets()

Получить только предустановленные стили.

```typescript
async getPresets(): Promise<BlockquoteStyle[]>
```

**Возвращает:**

- Promise с массивом пресетов

**Пример:**

```typescript
const presets = await stylesService.getPresets();
console.log(`Пресетов: ${presets.length}`);
```

---

#### getCustomStyles()

Получить только кастомные стили.

```typescript
async getCustomStyles(): Promise<BlockquoteStyle[]>
```

**Возвращает:**

- Promise с массивом кастомных стилей

**Пример:**

```typescript
const custom = await stylesService.getCustomStyles();
console.log(`Кастомных стилей: ${custom.length}`);
```

---

### CRUD операции

#### createCustomStyle()

Создать новый кастомный стиль.

```typescript
async createCustomStyle(
  style: Omit<BlockquoteStyle, 'id' | 'isCustom'>
): Promise<BlockquoteStyle>
```

**Параметры:**

- `style` - Данные стиля (без id и isCustom)

**Возвращает:**

- Promise с созданным стилем

**Throws:**

- Error если достигнут лимит (MAX_CUSTOM_STYLES = 100)
- Error если валидация не пройдена

**Пример:**

```typescript
const newStyle = await stylesService.createCustomStyle({
  name: 'Мой стиль',
  quoteStyles: {
    /* ... */
  },
  footerStyles: {
    /* ... */
  },
});

console.log('Создан ID:', newStyle.id);
```

---

#### updateCustomStyle()

Обновить кастомный стиль.

```typescript
async updateCustomStyle(
  id: string,
  updates: Partial<BlockquoteStyle>
): Promise<boolean>
```

**Параметры:**

- `id` - ID стиля
- `updates` - Объект с обновлениями

**Возвращает:**

- `true` если обновлено успешно
- `false` если стиль не найден или не кастомный

**Пример:**

```typescript
const updated = await stylesService.updateCustomStyle('style-123', {
  name: 'Новое имя',
  quoteStyles: {
    background: '#f0f0f0',
  },
});
```

---

#### deleteCustomStyle()

Удалить кастомный стиль (soft delete).

```typescript
async deleteCustomStyle(id: string): Promise<boolean>
```

**Параметры:**

- `id` - ID стиля

**Возвращает:**

- `true` если удалено успешно
- `false` если стиль не найден или не кастомный

**Примечание:** Стиль помечается как удаленный (`deleted: true`), но физически остается в БД.

**Пример:**

```typescript
const deleted = await stylesService.deleteCustomStyle('style-123');
if (deleted) {
  console.log('Стиль удален');
}
```

---

#### hardDeleteCustomStyle()

Физически удалить стиль из IndexedDB.

```typescript
async hardDeleteCustomStyle(id: string): Promise<boolean>
```

**Параметры:**

- `id` - ID стиля

**Возвращает:**

- `true` если удалено успешно
- `false` в противном случае

**Пример:**

```typescript
await stylesService.hardDeleteCustomStyle('style-123');
```

---

#### duplicateStyle()

Создать копию стиля.

```typescript
async duplicateStyle(
  id: string,
  newName: string
): Promise<BlockquoteStyle | null>
```

**Параметры:**

- `id` - ID исходного стиля
- `newName` - Имя для копии

**Возвращает:**

- Promise с новым стилем или null

**Пример:**

```typescript
const copy = await stylesService.duplicateStyle('classic', 'Мой классический');
if (copy) {
  console.log('Создана копия:', copy.id);
}
```

---

### Импорт/Экспорт

#### exportStyles()

Экспортировать все стили в JSON строку.

```typescript
async exportStyles(): Promise<string>
```

**Возвращает:**

- Promise с JSON строкой

**Формат:**

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-06T10:00:00.000Z",
  "count": 10,
  "styles": [...]
}
```

**Пример:**

```typescript
const json = await stylesService.exportStyles();
console.log('Экспортировано:', json);
```

---

#### downloadStylesAsFile()

Скачать стили как JSON файл.

```typescript
async downloadStylesAsFile(): Promise<void>
```

**Что делает:**

- Экспортирует стили в JSON
- Создает Blob
- Инициирует скачивание файла

**Имя файла:** `aurora-blockquote-styles-YYYY-MM-DD.json`

**Пример:**

```typescript
await stylesService.downloadStylesAsFile();
// Браузер начнет скачивание файла
```

---

#### importStyles()

Импортировать стили из JSON строки.

```typescript
async importStyles(json: string): Promise<ImportResult>
```

**Параметры:**

- `json` - JSON строка со стилями

**Возвращает:**

- Promise с результатом импорта

**Пример:**

```typescript
const result = await stylesService.importStyles(jsonString);
console.log(`Импортировано: ${result.imported}`);
console.log(`Пропущено: ${result.skipped}`);
console.log(`Обновлено: ${result.updated}`);
```

---

#### importStylesFromFile()

Импортировать стили из File объекта.

```typescript
async importStylesFromFile(file: File): Promise<ImportResult>
```

**Параметры:**

- `file` - File объект (должен быть JSON)

**Возвращает:**

- Promise с результатом импорта

**Пример:**

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await stylesService.importStylesFromFile(file);
```

---

### Утилиты

#### getStats()

Получить статистику по стилям.

```typescript
async getStats(): Promise<{
  totalStyles: number;
  presetStyles: number;
  customStyles: number;
  deletedStyles: number;
  unsyncedStyles: number;
}>
```

**Пример:**

```typescript
const stats = await stylesService.getStats();
console.log('Всего стилей:', stats.totalStyles);
console.log('Кастомных:', stats.customStyles);
```

---

#### clearAllCustomStyles()

Удалить все кастомные стили.

```typescript
async clearAllCustomStyles(): Promise<void>
```

**Пример:**

```typescript
if (confirm('Удалить все кастомные стили?')) {
  await stylesService.clearAllCustomStyles();
}
```

---

## 🎨 BlockquoteGenerator

Статический класс для генерации и работы с HTML blockquote элементами.

### Создание элементов

#### createBlockquote()

Создать DOM элемент blockquote.

```typescript
static createBlockquote(
  data: BlockquoteData,
  style: BlockquoteStyle
): HTMLElement
```

**Параметры:**

- `data` - Данные цитаты
- `style` - Стиль для применения

**Возвращает:**

- HTMLElement (blockquote)

**Пример:**

```typescript
const element = BlockquoteGenerator.createBlockquote(
  {
    text: 'Текст цитаты',
    author: 'Автор',
    styleId: 'classic',
  },
  classicStyle,
);

document.body.appendChild(element);
```

---

#### createBlockquoteHTML()

Создать HTML строку blockquote.

```typescript
static createBlockquoteHTML(
  data: BlockquoteData,
  style: BlockquoteStyle
): string
```

**Параметры:**

- `data` - Данные цитаты
- `style` - Стиль для применения

**Возвращает:**

- HTML строка

**Пример:**

```typescript
const html = BlockquoteGenerator.createBlockquoteHTML(data, style);
console.log(html);
// <blockquote class="aurora-blockquote" data-style-id="classic">
//   <p class="aurora-blockquote-text">Текст цитаты</p>
//   <footer class="aurora-blockquote-footer">— Автор</footer>
// </blockquote>
```

---

### Применение стилей

#### updateBlockquoteStyle()

Обновить стили существующего blockquote элемента.

```typescript
static updateBlockquoteStyle(
  element: HTMLElement,
  style: BlockquoteStyle
): void
```

**Параметры:**

- `element` - Элемент blockquote
- `style` - Новый стиль

**Пример:**

```typescript
const blockquote = document.querySelector('blockquote');
BlockquoteGenerator.updateBlockquoteStyle(blockquote, newStyle);
```

---

#### getBlockquoteCSSObject()

Получить CSS объект для Angular [ngStyle].

```typescript
static getBlockquoteCSSObject(
  styles: QuoteStyles
): Record<string, string>
```

**Параметры:**

- `styles` - Объект стилей blockquote

**Возвращает:**

- Объект CSS свойств

**Пример:**

```typescript
<blockquote [ngStyle]="getBlockquoteCSSObject(style.quoteStyles)">
  ...
</blockquote>
```

---

#### getFooterCSSObject()

Получить CSS объект для footer.

```typescript
static getFooterCSSObject(
  styles: FooterStyles
): Record<string, string>
```

**Пример:**

```typescript
<footer [ngStyle]="getFooterCSSObject(style.footerStyles)">
  ...
</footer>
```

---

### Извлечение данных

#### extractDataFromBlockquote()

Извлечь данные из HTML blockquote элемента.

```typescript
static extractDataFromBlockquote(
  element: HTMLElement
): BlockquoteData | null
```

**Параметры:**

- `element` - Элемент blockquote

**Возвращает:**

- BlockquoteData или null если не blockquote

**Пример:**

```typescript
const blockquote = document.querySelector('blockquote');
const data = BlockquoteGenerator.extractDataFromBlockquote(blockquote);

if (data) {
  console.log('Текст:', data.text);
  console.log('Автор:', data.author);
  console.log('Стиль:', data.styleId);
}
```

---

### Утилиты

#### isBlockquote()

Проверить, является ли элемент blockquote.

```typescript
static isBlockquote(element: HTMLElement): boolean
```

**Пример:**

```typescript
if (BlockquoteGenerator.isBlockquote(element)) {
  console.log('Это blockquote');
}
```

---

#### findParentBlockquote()

Найти родительский blockquote элемент.

```typescript
static findParentBlockquote(element: HTMLElement): HTMLElement | null
```

**Параметры:**

- `element` - Начальный элемент

**Возвращает:**

- Родительский blockquote или null

**Пример:**

```typescript
const clicked = event.target as HTMLElement;
const blockquote = BlockquoteGenerator.findParentBlockquote(clicked);

if (blockquote) {
  console.log('Клик внутри blockquote');
}
```

---

## 💾 AuroraDB

Утилиты для работы с IndexedDB.

### Функции

#### initDB()

Инициализировать базу данных.

```typescript
async function initDB(): Promise<void>;
```

---

#### clearDB()

Очистить все данные из таблицы.

```typescript
async function clearDB(): Promise<void>;
```

---

#### deleteDB()

Полностью удалить базу данных.

```typescript
async function deleteDB(): Promise<void>;
```

---

#### getDBInfo()

Получить информацию о БД.

```typescript
async function getDBInfo(): Promise<{
  name: string;
  version: number;
  tables: string[];
}>;
```

---

#### getDBStats()

Получить статистику по БД.

```typescript
async function getDBStats(): Promise<{
  totalStyles: number;
  customStyles: number;
  deletedStyles: number;
  unsyncedStyles: number;
}>;
```

---

## ⚙️ Конфигурация

### QuotePluginConfig

Полная конфигурация плагина (17 опций).

```typescript
interface QuotePluginConfig {
  id: string; // ID плагина
  name: string; // Отображаемое имя
  description: string; // Описание
  icon: string; // SVG иконка
  hotkey: string; // Горячая клавиша
  showInToolbar: boolean; // Показывать в тулбаре
  toolbarOrder: number; // Порядок в тулбаре
  blockquoteClassName: string; // CSS класс
  styleIdAttribute: string; // Data-атрибут для ID
  maxQuoteLength: number; // Макс длина текста
  maxAuthorLength: number; // Макс длина автора
  maxSourceLength: number; // Макс длина источника
  useAnimations: boolean; // Использовать анимации
  autoFocusTextarea: boolean; // Автофокус
  rememberLastStyle: boolean; // Запоминать стиль
  debug: boolean; // Режим отладки
}
```

### DEFAULT_QUOTE_CONFIG

Значения по умолчанию.

```typescript
const DEFAULT_QUOTE_CONFIG: QuotePluginConfig = {
  id: 'quote',
  name: 'Цитата',
  description: 'Вставка стилизованных цитат',
  icon: '<svg>...</svg>',
  hotkey: 'Ctrl+Shift+Q',
  showInToolbar: true,
  toolbarOrder: 50,
  blockquoteClassName: 'aurora-blockquote',
  styleIdAttribute: 'data-style-id',
  maxQuoteLength: 5000,
  maxAuthorLength: 200,
  maxSourceLength: 500,
  useAnimations: true,
  autoFocusTextarea: true,
  rememberLastStyle: true,
  debug: false,
};
```

---

## 📡 События

Все события диспатчатся на элементе редактора как CustomEvent.

### quote:inserted

Цитата вставлена в редактор.

```typescript
editorElement.addEventListener('quote:inserted', (event: CustomEvent) => {
  const { element, styleId } = event.detail;
  console.log('Вставлена цитата со стилем:', styleId);
});
```

### quote:updated

Цитата обновлена.

```typescript
editorElement.addEventListener('quote:updated', (event: CustomEvent) => {
  const { element, styleId } = event.detail;
});
```

### quote:deleted

Цитата удалена.

```typescript
editorElement.addEventListener('quote:deleted', (event: CustomEvent) => {
  const { element } = event.detail;
});
```

### quote:style-selected

Стиль выбран в модальном окне.

```typescript
editorElement.addEventListener('quote:style-selected', (event: CustomEvent) => {
  const { styleId, styleName } = event.detail;
});
```

### quote:modal-opened

Модальное окно открыто.

```typescript
editorElement.addEventListener('quote:modal-opened', () => {
  console.log('Модальное окно открыто');
});
```

### quote:modal-closed

Модальное окно закрыто.

```typescript
editorElement.addEventListener('quote:modal-closed', () => {
  console.log('Модальное окно закрыто');
});
```

---

## 📚 Дополнительные ресурсы

- [README.md](./README.md) - Основная документация
- [EXAMPLES.md](./EXAMPLES.md) - Примеры использования
- [Техническая спецификация](../../../doc/TS%20plagin%20Quote%20Technical%20Specification.txt)

**Версия API:** 1.0.0
**Обновлено:** 6 декабря 2025 г.
