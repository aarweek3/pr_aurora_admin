# Примеры использования Quote Plugin

Практические примеры работы с плагином вставки цитат.

## 📋 Оглавление

- [Базовые примеры](#базовые-примеры)
- [Работа со стилями](#работа-со-стилями)
- [Программный API](#программный-api)
- [Интеграция с редактором](#интеграция-с-редактором)
- [Продвинутые сценарии](#продвинутые-сценарии)
- [Обработка событий](#обработка-событий)

## 🎯 Базовые примеры

### Пример 1: Инициализация плагина

```typescript
import { Component, OnInit } from '@angular/core';
import { QuotePlugin } from './plugins/quote/quote.plugin';

@Component({
  selector: 'app-editor',
  template: `<div #editor class="aurora-editor" contenteditable="true"></div>`,
})
export class EditorComponent implements OnInit {
  private quotePlugin!: QuotePlugin;

  ngOnInit() {
    // Создаем плагин с настройками по умолчанию
    this.quotePlugin = new QuotePlugin();

    // Инициализируем
    this.quotePlugin.init();

    console.log('Quote plugin готов к работе!');
  }

  ngOnDestroy() {
    // Очищаем ресурсы
    this.quotePlugin.destroy();
  }
}
```

### Пример 2: Открытие модального окна по кнопке

```typescript
@Component({
  selector: 'app-editor',
  template: `
    <div #editor class="aurora-editor" contenteditable="true"></div>
    <button (click)="insertQuote()">Вставить цитату</button>
  `,
})
export class EditorComponent {
  @ViewChild('editor') editorRef!: ElementRef<HTMLElement>;
  private quotePlugin = new QuotePlugin();

  ngOnInit() {
    this.quotePlugin.init();
  }

  insertQuote() {
    const editorElement = this.editorRef.nativeElement;

    // Открываем модальное окно
    this.quotePlugin.execute(editorElement);
  }
}
```

### Пример 3: Вставка цитаты с предзаполненным текстом

```typescript
insertQuoteWithPrefilledText() {
  const editorElement = this.editorRef.nativeElement;

  this.quotePlugin.execute(editorElement, {
    mode: 'insert',
    prefilledText: 'Воображение важнее знания',
    prefilledAuthor: 'Альберт Эйнштейн',
    prefilledSource: 'Интервью 1929 года',
    preselectedStyleId: 'classic'
  });
}
```

## 🎨 Работа со стилями

### Пример 4: Получение всех стилей

```typescript
import { BlockquoteStylesService } from './plugins/quote/services/blockquote-styles.service';

@Component({...})
export class StylesManagerComponent implements OnInit {
  private stylesService = inject(BlockquoteStylesService);

  allStyles$ = this.stylesService.getAllStyles();

  ngOnInit() {
    // Подписка на изменения стилей
    this.allStyles$.subscribe(styles => {
      console.log(`Всего стилей: ${styles.length}`);

      const presets = styles.filter(s => !s.isCustom);
      const custom = styles.filter(s => s.isCustom);

      console.log(`Пресеты: ${presets.length}, Кастомные: ${custom.length}`);
    });
  }
}
```

### Пример 5: Создание кастомного стиля

```typescript
async createMyStyle() {
  const newStyle = {
    name: 'Синяя рамка',
    quoteStyles: {
      background: '#eff6ff',
      borderWidth: '3px',
      borderStyle: 'solid',
      borderColor: '#3b82f6',
      borderRadius: '8px',
      padding: '24px',
      margin: '20px 0',
      fontStyle: 'normal',
      fontSize: '16px',
      fontWeight: 'normal',
      color: '#1e40af',
      textAlign: 'left',
      lineHeight: '1.8',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
      opacity: '1',
      beforeContent: '💬',
      beforeFontSize: '32px',
      beforeColor: '#3b82f6',
      beforeOpacity: '0.5',
      beforePosition: {
        top: '10px',
        left: '10px'
      }
    },
    footerStyles: {
      marginTop: '12px',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 'normal',
      color: '#64748b',
      textAlign: 'right',
      opacity: '1',
      citeColor: '#3b82f6',
      citeFontStyle: 'normal',
      citeFontWeight: '600'
    }
  };

  try {
    const created = await this.stylesService.createCustomStyle(newStyle);
    console.log('Создан стиль:', created);
    alert(`Стиль "${created.name}" создан успешно!`);
  } catch (error) {
    console.error('Ошибка создания стиля:', error);
    alert('Не удалось создать стиль');
  }
}
```

### Пример 6: Обновление стиля

```typescript
async updateStyleColor(styleId: string, newColor: string) {
  const success = await this.stylesService.updateCustomStyle(styleId, {
    quoteStyles: {
      borderColor: newColor,
      beforeColor: newColor
    }
  });

  if (success) {
    console.log('Стиль обновлен');
  } else {
    console.error('Не удалось обновить стиль');
  }
}
```

### Пример 7: Удаление стиля

```typescript
async deleteStyle(styleId: string) {
  if (confirm('Удалить этот стиль?')) {
    const deleted = await this.stylesService.deleteCustomStyle(styleId);

    if (deleted) {
      console.log('Стиль удален');
    } else {
      console.error('Не удалось удалить стиль');
    }
  }
}
```

### Пример 8: Дублирование стиля

```typescript
async duplicateStyle(styleId: string) {
  const duplicated = await this.stylesService.duplicateStyle(
    styleId,
    'Копия моего стиля'
  );

  if (duplicated) {
    console.log('Создана копия:', duplicated.id);
  }
}
```

### Пример 9: Импорт стилей из JSON

```typescript
async importStylesFromJSON(jsonString: string) {
  try {
    const result = await this.stylesService.importStyles(jsonString);

    console.log(`Импортировано: ${result.imported}`);
    console.log(`Пропущено: ${result.skipped}`);
    console.log(`Обновлено: ${result.updated}`);

    if (result.errors.length > 0) {
      console.error('Ошибки импорта:', result.errors);
    }

    alert(`Успешно импортировано ${result.imported} стилей`);
  } catch (error) {
    console.error('Ошибка импорта:', error);
    alert('Не удалось импортировать стили');
  }
}
```

### Пример 10: Экспорт стилей

```typescript
async exportAllStyles() {
  try {
    // Экспорт в JSON строку
    const json = await this.stylesService.exportStyles();
    console.log('Экспортировано:', json);

    // Скачать как файл
    await this.stylesService.downloadStylesAsFile();

    alert('Стили экспортированы');
  } catch (error) {
    console.error('Ошибка экспорта:', error);
  }
}
```

## 💻 Программный API

### Пример 11: Прямая вставка цитаты

```typescript
async insertQuoteDirectly() {
  const quoteData = {
    text: 'Единственный способ сделать великую работу — любить то, что вы делаете',
    author: 'Стив Джобс',
    source: 'Стэнфордская речь 2005',
    styleId: 'modern'
  };

  const editorElement = this.editorRef.nativeElement;
  const result = await this.quotePlugin.insertQuote(quoteData, editorElement);

  if (result.success) {
    console.log('Цитата вставлена:', result.element);
  } else {
    console.error('Ошибка:', result.error);
  }
}
```

### Пример 12: Редактирование существующей цитаты

```typescript
editExistingQuote() {
  // Находим blockquote в редакторе
  const editorElement = this.editorRef.nativeElement;
  const blockquote = editorElement.querySelector('blockquote.aurora-blockquote') as HTMLElement;

  if (blockquote) {
    // Открываем модалку для редактирования
    this.quotePlugin.editQuote(blockquote);
  } else {
    alert('Цитата не найдена');
  }
}
```

### Пример 13: Генерация HTML без вставки

```typescript
import { BlockquoteGenerator } from './plugins/quote/services/blockquote-generator.service';

async generateQuoteHTML() {
  // Получаем стиль
  const style = await this.stylesService.getStyleById('classic');

  if (!style) return;

  const data = {
    text: 'Пример цитаты',
    author: 'Автор',
    styleId: 'classic'
  };

  // Генерируем HTML
  const html = BlockquoteGenerator.createBlockquoteHTML(data, style);
  console.log('Сгенерированный HTML:', html);

  // Можно использовать для:
  // - Отправки на сервер
  // - Копирования в буфер обмена
  // - Email рассылки
  // - Экспорта в другие форматы
}
```

### Пример 14: Извлечение данных из blockquote

```typescript
extractQuoteData(blockquoteElement: HTMLElement) {
  const data = BlockquoteGenerator.extractDataFromBlockquote(blockquoteElement);

  if (data) {
    console.log('Текст:', data.text);
    console.log('Автор:', data.author);
    console.log('Источник:', data.source);
    console.log('Стиль:', data.styleId);
  }
}
```

### Пример 15: Применение стилей к существующему элементу

```typescript
async updateQuoteStyle(blockquoteElement: HTMLElement, newStyleId: string) {
  const newStyle = await this.stylesService.getStyleById(newStyleId);

  if (newStyle) {
    BlockquoteGenerator.updateBlockquoteStyle(blockquoteElement, newStyle);
    console.log('Стиль обновлен');
  }
}
```

## 🔗 Интеграция с редактором

### Пример 16: Обработка горячих клавиш

```typescript
@HostListener('keydown', ['$event'])
handleKeyDown(event: KeyboardEvent) {
  // Ctrl+Shift+Q или Cmd+Shift+Q
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Q') {
    event.preventDefault();

    const editorElement = this.editorRef.nativeElement;
    this.quotePlugin.execute(editorElement);
  }
}
```

### Пример 17: Интеграция с тулбаром

```typescript
@Component({
  selector: 'app-toolbar',
  template: `
    <div class="toolbar">
      <button
        class="toolbar-btn"
        [class.active]="isQuoteActive"
        (click)="insertQuote()"
        title="Вставить цитату (Ctrl+Shift+Q)"
      >
        <svg><!-- Quote icon --></svg>
      </button>
    </div>
  `,
})
export class ToolbarComponent {
  isQuoteActive = false;

  insertQuote() {
    const editorElement = document.querySelector('.aurora-editor') as HTMLElement;
    this.quotePlugin.execute(editorElement);
  }

  // Обновляем активность кнопки при изменении курсора
  @HostListener('document:selectionchange')
  updateActiveState() {
    const editorElement = document.querySelector('.aurora-editor') as HTMLElement;
    this.isQuoteActive = this.quotePlugin.isActive(editorElement);
  }
}
```

### Пример 18: Контекстное меню для цитат

```typescript
@HostListener('contextmenu', ['$event'])
handleContextMenu(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const blockquote = BlockquoteGenerator.findParentBlockquote(target);

  if (blockquote) {
    event.preventDefault();

    // Показываем контекстное меню
    this.showQuoteContextMenu(blockquote, event.clientX, event.clientY);
  }
}

showQuoteContextMenu(blockquote: HTMLElement, x: number, y: number) {
  const menu = [
    {
      label: 'Редактировать цитату',
      action: () => this.quotePlugin.editQuote(blockquote)
    },
    {
      label: 'Изменить стиль',
      action: () => this.changeQuoteStyle(blockquote)
    },
    {
      label: 'Удалить цитату',
      action: () => blockquote.remove()
    }
  ];

  // Отображаем меню в позиции (x, y)
  this.displayContextMenu(menu, x, y);
}
```

## 🚀 Продвинутые сценарии

### Пример 19: Пакетная обработка цитат

```typescript
async processAllQuotes(editorElement: HTMLElement) {
  const allQuotes = editorElement.querySelectorAll('blockquote.aurora-blockquote');

  console.log(`Найдено цитат: ${allQuotes.length}`);

  for (const quote of Array.from(allQuotes)) {
    const data = BlockquoteGenerator.extractDataFromBlockquote(quote as HTMLElement);

    if (data) {
      console.log(`Цитата: "${data.text.substring(0, 50)}..."`);
      console.log(`Автор: ${data.author || 'Не указан'}`);
      console.log(`Стиль: ${data.styleId}`);
      console.log('---');
    }
  }
}
```

### Пример 20: Экспорт всех цитат из документа

```typescript
async exportQuotesToJSON(editorElement: HTMLElement) {
  const allQuotes = editorElement.querySelectorAll('blockquote.aurora-blockquote');
  const quotes = [];

  for (const quote of Array.from(allQuotes)) {
    const data = BlockquoteGenerator.extractDataFromBlockquote(quote as HTMLElement);
    if (data) {
      quotes.push(data);
    }
  }

  const json = JSON.stringify(quotes, null, 2);

  // Скачиваем файл
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  link.click();
  URL.revokeObjectURL(url);

  console.log(`Экспортировано ${quotes.length} цитат`);
}
```

### Пример 21: Импорт цитат в документ

```typescript
async importQuotesFromJSON(jsonString: string, editorElement: HTMLElement) {
  const quotes = JSON.parse(jsonString);

  for (const quoteData of quotes) {
    await this.quotePlugin.insertQuote(quoteData, editorElement);

    // Добавляем разделитель между цитатами
    const separator = document.createElement('p');
    separator.innerHTML = '<br>';
    editorElement.appendChild(separator);
  }

  console.log(`Импортировано ${quotes.length} цитат`);
}
```

### Пример 22: Поиск цитат по автору

```typescript
findQuotesByAuthor(editorElement: HTMLElement, authorName: string): HTMLElement[] {
  const allQuotes = editorElement.querySelectorAll('blockquote.aurora-blockquote');
  const matchingQuotes: HTMLElement[] = [];

  for (const quote of Array.from(allQuotes)) {
    const data = BlockquoteGenerator.extractDataFromBlockquote(quote as HTMLElement);

    if (data && data.author?.toLowerCase().includes(authorName.toLowerCase())) {
      matchingQuotes.push(quote as HTMLElement);
    }
  }

  console.log(`Найдено ${matchingQuotes.length} цитат автора "${authorName}"`);
  return matchingQuotes;
}
```

### Пример 23: Статистика по цитатам

```typescript
async getQuoteStatistics(editorElement: HTMLElement) {
  const allQuotes = editorElement.querySelectorAll('blockquote.aurora-blockquote');

  const stats = {
    total: allQuotes.length,
    withAuthor: 0,
    withSource: 0,
    byStyle: {} as Record<string, number>,
    averageLength: 0
  };

  let totalLength = 0;

  for (const quote of Array.from(allQuotes)) {
    const data = BlockquoteGenerator.extractDataFromBlockquote(quote as HTMLElement);

    if (data) {
      if (data.author) stats.withAuthor++;
      if (data.source) stats.withSource++;

      stats.byStyle[data.styleId] = (stats.byStyle[data.styleId] || 0) + 1;
      totalLength += data.text.length;
    }
  }

  stats.averageLength = Math.round(totalLength / stats.total);

  console.log('Статистика цитат:', stats);
  return stats;
}
```

## 📡 Обработка событий

### Пример 24: Подписка на события плагина

```typescript
ngOnInit() {
  const editorElement = this.editorRef.nativeElement;

  // Событие вставки цитаты
  editorElement.addEventListener('quote:inserted', (event: any) => {
    const { element, styleId } = event.detail;
    console.log('Вставлена цитата со стилем:', styleId);

    // Можно отправить аналитику
    this.analytics.track('quote_inserted', { styleId });
  });

  // Событие открытия модалки
  editorElement.addEventListener('quote:modal-opened', () => {
    console.log('Модальное окно открыто');
  });

  // Событие закрытия модалки
  editorElement.addEventListener('quote:modal-closed', () => {
    console.log('Модальное окно закрыто');
  });
}
```

### Пример 25: Автосохранение при изменении цитат

```typescript
setupAutoSave() {
  const editorElement = this.editorRef.nativeElement;

  editorElement.addEventListener('quote:inserted', () => {
    this.saveDocument();
  });

  editorElement.addEventListener('quote:updated', () => {
    this.saveDocument();
  });

  editorElement.addEventListener('quote:deleted', () => {
    this.saveDocument();
  });
}

private saveDocument() {
  const content = this.editorRef.nativeElement.innerHTML;
  localStorage.setItem('document', content);
  console.log('Документ автоматически сохранен');
}
```

### Пример 26: Уведомления пользователю

```typescript
ngOnInit() {
  const editorElement = this.editorRef.nativeElement;

  editorElement.addEventListener('quote:inserted', () => {
    this.showNotification('Цитата вставлена', 'success');
  });

  editorElement.addEventListener('quote:style-selected', (event: any) => {
    const styleName = event.detail.styleName;
    this.showNotification(`Выбран стиль: ${styleName}`, 'info');
  });
}

showNotification(message: string, type: 'success' | 'info' | 'error') {
  // Показываем toast уведомление
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
```

## 🎓 Полезные советы

### Совет 1: Предзагрузка стилей

```typescript
async preloadStyles() {
  // Загружаем стили при инициализации приложения
  const styles = await firstValueFrom(this.stylesService.getAllStyles());
  console.log('Предзагружено стилей:', styles.length);
}
```

### Совет 2: Кэширование последнего выбранного стиля

```typescript
private readonly LAST_STYLE_KEY = 'last-selected-style';

getLastUsedStyleId(): string {
  return localStorage.getItem(this.LAST_STYLE_KEY) || 'classic';
}

saveLastUsedStyleId(styleId: string) {
  localStorage.setItem(this.LAST_STYLE_KEY, styleId);
}
```

### Совет 3: Валидация перед вставкой

```typescript
async insertQuoteWithValidation(data: BlockquoteData) {
  // Проверяем длину текста
  if (data.text.length > 5000) {
    alert('Текст цитаты слишком длинный (максимум 5000 символов)');
    return;
  }

  // Проверяем существование стиля
  const style = await this.stylesService.getStyleById(data.styleId);
  if (!style) {
    alert('Стиль не найден');
    return;
  }

  // Вставляем
  const editorElement = this.editorRef.nativeElement;
  await this.quotePlugin.insertQuote(data, editorElement);
}
```

---

**Больше примеров:** См. [API.md](./API.md) и [README.md](./README.md)

**Версия:** 1.0.0
**Обновлено:** 6 декабря 2025 г.
