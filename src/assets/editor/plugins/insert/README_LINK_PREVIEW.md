# Link Preview Plugin (Превью ссылок)

## Описание

Плагин для создания красивых превью-карточек ссылок в стиле социальных сетей. Загружает Open Graph данные (title, description, image) и создаёт стилизованные карточки в трёх размерах.

## Возможности

### 🎴 Три размера карточек

#### 1. Small (Компактная) - `PreviewSize.SMALL`
- Горизонтальная компактная карточка
- Миниатюра 80x80px слева
- Заголовок и URL справа
- Идеально для списков ссылок

**Пример:**
```
┌─────────────────────────────────┐
│ [IMG] Заголовок страницы       │
│  80x  🔗 example.com           │
│  80                             │
└─────────────────────────────────┘
```

#### 2. Medium (Стандартная) - `PreviewSize.MEDIUM` ⭐ **По умолчанию**
- Вертикальная карточка средних размеров
- Изображение 600x200px сверху
- Заголовок, описание (2 строки), URL
- Универсальный размер для большинства случаев

**Пример:**
```
┌────────────────────────────────┐
│                                │
│     [Изображение 200px]        │
│                                │
├────────────────────────────────┤
│ Заголовок страницы             │
│ Краткое описание...            │
│ 🔗 https://example.com          │
└────────────────────────────────┘
```

#### 3. Large (Полная) - `PreviewSize.LARGE`
- Большая вертикальная карточка
- Изображение 800x300px
- Название сайта, заголовок (3 строки), описание (4 строки), URL
- Максимум информации

**Пример:**
```
┌────────────────────────────────┐
│                                │
│     [Изображение 300px]        │
│                                │
├────────────────────────────────┤
│ EXAMPLE.COM                    │
│ Заголовок страницы             │
│ большего размера               │
│                                │
│ Более полное описание          │
│ с несколькими строками...      │
│ 🔗 https://example.com          │
└────────────────────────────────┘
```

---

## Использование

### В интерфейсе:

**Кнопка toolbar:** `🎴` (карточка)

**Расположение:** В группе Insert (Вставка)

**Действие:**
1. Нажать кнопку 🎴
2. В модальном окне ввести URL
3. Выбрать размер карточки (Small, Medium, Large)
4. Нажать "Вставить превью"

### Модальное окно

Интерфейс модального окна включает:

1. **Поле URL** - ввод полного URL адреса (`https://...`)
2. **Выбор размера** - 3 варианта с визуальными иконками
3. **Превью пример** - динамическая демонстрация выбранного размера
4. **Кнопки** - "Отмена" и "Вставить превью"

---

## Программное использование

```typescript
// Создание плагина
const linkPreviewPlugin = new LinkPreviewPlugin();

// Вставка превью (откроет модальное окно)
linkPreviewPlugin.execute(editorElement);

// Вставка превью напрямую (без модального окна)
linkPreviewPlugin.execute(editorElement, {
  url: 'https://example.com',
  size: PreviewSize.MEDIUM
});

// Разные размеры
linkPreviewPlugin.execute(editorElement, {
  url: 'https://github.com/anthropics/claude-code',
  size: PreviewSize.SMALL  // Компактная
});

linkPreviewPlugin.execute(editorElement, {
  url: 'https://anthropic.com',
  size: PreviewSize.LARGE  // Полная
});
```

---

## Open Graph данные

Плагин загружает следующие метаданные:

- **og:title** - Заголовок страницы
- **og:description** - Описание страницы
- **og:image** - Изображение для превью
- **og:site_name** - Название сайта (опционально)

### Backend API (требуется)

⚠️ **ВАЖНО**: Браузер не может напрямую загружать Open Graph данные из-за CORS ограничений.

Необходим backend API endpoint:

```typescript
// Пример backend API (Node.js/Express)
app.get('/api/og-data', async (req, res) => {
  const url = req.query.url;

  // Загрузка HTML страницы
  const html = await fetch(url).then(r => r.text());

  // Парсинг Open Graph тегов
  const ogData = parseOpenGraph(html);

  res.json({
    title: ogData['og:title'] || 'Без названия',
    description: ogData['og:description'] || '',
    image: ogData['og:image'] || '',
    siteName: ogData['og:site_name'] || '',
    url: url
  });
});
```

### Mock данные (текущая реализация)

В текущей версии плагин использует mock данные для демонстрации:

```typescript
{
  title: `Ссылка на ${domain}`,
  description: 'Описание ссылки будет загружено автоматически при использовании backend API',
  image: '', // Placeholder
  url: url,
  siteName: domain
}
```

---

## Интеграция

### Файлы:
- **Плагин:** `src/app/editor/plugins/insert/link-preview.plugin.ts`
- **Стили:** `src/app/editor/plugins/insert/link-preview.styles.scss`
- **Модальное окно:** `src/app/editor/modals/link-preview-modal/link-preview-modal.component.ts`
- **Модальный HTML:** `src/app/editor/modals/link-preview-modal/link-preview-modal.component.html`
- **Модальный CSS:** `src/app/editor/modals/link-preview-modal/link-preview-modal.component.scss`

### Регистрация в редакторе:

```typescript
// aurora-editor.component.ts
import { LinkPreviewPlugin } from '../plugins/insert/link-preview.plugin';
import { LinkPreviewModalComponent } from '../modals/link-preview-modal/link-preview-modal.component';

@Component({
  imports: [
    LinkPreviewModalComponent, // Добавить в imports
    // ...
  ]
})
export class AuroraEditorComponent implements AfterViewInit {
  @ViewChild(LinkPreviewModalComponent)
  linkPreviewModal?: LinkPreviewModalComponent;

  this.plugins = [
    // ...
    new LinkPreviewPlugin(), // Превью ссылок (карточки)
    // ...
  ];

  ngAfterViewInit(): void {
    // Подключаем модальное окно к плагину
    const linkPreviewPlugin = this.plugins.find((p) => p.name === 'linkPreview') as any;
    if (linkPreviewPlugin && this.linkPreviewModal) {
      linkPreviewPlugin.setModalComponent(this.linkPreviewModal);
    }
  }

  onLinkPreviewInsert(data: { url: string; size: string }): void {
    const linkPreviewPlugin = this.plugins.find((p) => p.name === 'linkPreview');
    if (linkPreviewPlugin) {
      linkPreviewPlugin.execute(this.editorElementRef.nativeElement, {
        url: data.url,
        size: data.size as any,
      });
    }
  }
}
```

### HTML шаблон:

```html
<!-- aurora-editor.component.html -->
<app-link-preview-modal (insert)="onLinkPreviewInsert($event)"></app-link-preview-modal>
```

### Toolbar:

```typescript
// aurora-toolbar.component.ts
get insertPlugins(): AuroraPlugin[] {
  return this.plugins.filter(
    (p) =>
      // ...
      p.name === 'linkPreview' || // Превью ссылок (карточки)
      // ...
  );
}
```

---

## Примеры использования

### Пример 1: Вставка статьи блога

**URL:** `https://blog.example.com/article-title`

**Размер:** Medium

**Результат:**
```html
<div class="aurora-link-preview aurora-link-preview--medium" contenteditable="false">
  <div class="aurora-link-preview__image" style="background-image: url('...')"></div>
  <div class="aurora-link-preview__content">
    <div class="aurora-link-preview__title">10 Ways to Improve Your Code</div>
    <div class="aurora-link-preview__description">
      Learn practical tips and techniques to write better, cleaner code...
    </div>
    <div class="aurora-link-preview__url">🔗 https://blog.example.com/article-title</div>
  </div>
</div>
```

---

### Пример 2: Компактная ссылка в списке

**URL:** `https://github.com/project`

**Размер:** Small

**Результат:**
```html
<div class="aurora-link-preview aurora-link-preview--small" contenteditable="false">
  <div class="aurora-link-preview__content">
    <div class="aurora-link-preview__image" style="background-image: url('...')"></div>
    <div class="aurora-link-preview__text">
      <div class="aurora-link-preview__title">GitHub Project</div>
      <div class="aurora-link-preview__url">🔗 github.com</div>
    </div>
  </div>
</div>
```

---

### Пример 3: Полная карточка продукта

**URL:** `https://shop.example.com/product`

**Размер:** Large

**Результат:**
```html
<div class="aurora-link-preview aurora-link-preview--large" contenteditable="false">
  <div class="aurora-link-preview__image aurora-link-preview__image--large" style="background-image: url('...')"></div>
  <div class="aurora-link-preview__content">
    <div class="aurora-link-preview__site-name">SHOP.EXAMPLE.COM</div>
    <div class="aurora-link-preview__title aurora-link-preview__title--large">
      Premium Product Name
    </div>
    <div class="aurora-link-preview__description">
      Complete product description with all details and specifications...
    </div>
    <div class="aurora-link-preview__url">
      <span class="aurora-link-preview__url-icon">🔗</span>
      <span>https://shop.example.com/product</span>
    </div>
  </div>
</div>
```

---

## Технические детали

### Структура карточки

Все карточки имеют:
- `contenteditable="false"` - не редактируются
- `cursor: pointer` - кликабельны
- Обработчик клика - открывает URL в новой вкладке
- Hover эффекты - поднятие и тень
- После вставки добавляется пустой `<p>` для продолжения ввода

### CSS классы

```scss
.aurora-link-preview {
  // Базовые стили
  &--small { /* Компактная */ }
  &--medium { /* Стандартная */ }
  &--large { /* Полная */ }

  &__image { /* Изображение */ }
  &__content { /* Контент */ }
  &__site-name { /* Название сайта */ }
  &__title { /* Заголовок */ }
  &__description { /* Описание */ }
  &__url { /* URL */ }
}
```

### Адаптивность

```scss
@media (max-width: 768px) {
  .aurora-link-preview--large {
    .aurora-link-preview__image {
      height: 200px; // Уменьшаем высоту
    }
  }
}
```

---

## API

```typescript
interface LinkPreviewPlugin {
  name: 'linkPreview';

  // Выполнить вставку превью
  execute(
    editorElement: HTMLElement,
    options?: {
      url?: string;
      size?: PreviewSize;
    }
  ): boolean;

  // Установить модальное окно
  setModalComponent(modalComponent: any): void;
}

enum PreviewSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
}
```

---

## Особенности

- ✅ Три размера карточек для разных случаев
- ✅ Красивое модальное окно с превью
- ✅ Hover эффекты и анимации
- ✅ Кликабельность - открытие ссылок в новой вкладке
- ✅ Автоматическое добавление параграфа после карточки
- ✅ Безопасность - экранирование HTML
- ✅ Адаптивный дизайн
- ✅ Поддержка Open Graph (требуется backend)
- ✅ Fallback на базовые данные

---

## Ограничения

⚠️ **CORS ограничение**: Браузер не может напрямую загружать Open Graph данные с других доменов. Необходим backend API для проксирования запросов.

⚠️ **Mock данные**: В текущей версии используются упрощённые данные для демонстрации. Для production необходимо реализовать backend API.

---

## Дорожная карта

### Планируется:

1. **Backend API интеграция**
   - Endpoint для загрузки Open Graph данных
   - Кэширование результатов
   - Обработка ошибок

2. **Дополнительные размеры**
   - Extra Small - для inline вставки
   - Extra Large - для hero секций

3. **Редактирование карточек**
   - Изменение размера после вставки
   - Ручное редактирование заголовка/описания

4. **Темы оформления**
   - Светлая/тёмная тема
   - Разные стили границ
   - Цветовые схемы

---

## Совместимость

- ✅ Все современные браузеры (Chrome, Firefox, Safari, Edge)
- ✅ Angular 19+
- ✅ TypeScript 5+
- ⚠️ Требуется backend API для production

---

## Сравнение с обычными ссылками

| Возможность | Обычная ссылка | Link Preview |
|-------------|----------------|--------------|
| Визуальное привлечение | ❌ | ✅ |
| Превью изображения | ❌ | ✅ |
| Описание контента | ❌ | ✅ |
| Размеры на выбор | ❌ | ✅ |
| Open Graph данные | ❌ | ✅ |
| Кликабельность | ✅ | ✅ |

Link Preview Plugin создаёт более привлекательные и информативные ссылки в стиле социальных сетей!
