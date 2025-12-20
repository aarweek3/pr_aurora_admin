# Техническое Задание (ТЗ): Система Пагинации (Pagination System)

## 1. Общее описание

Необходимо разработать гибкую и переиспользуемую систему пагинации для Aurora Admin Panel. Компонент должен поддерживать различные варианты отображения, быть легко интегрируемым в любые списки/таблицы и предоставлять удобный API для управления.

Компонент должен соответствовать дизайн-системе проекта, поддерживать темизацию и быть доступным (accessibility).

---

## 2. Компонент: `av-pagination` (Основной)

### 2.1. Назначение

Универсальный компонент пагинации для навигации по страницам данных. Поддерживает различные режимы отображения и конфигурации.

### 2.2. API Компонента (Inputs)

| Свойство           | Тип                                               | Default             | Описание                               |
| ------------------ | ------------------------------------------------- | ------------------- | -------------------------------------- |
| `total`            | `number`                                          | `0`                 | Общее количество элементов             |
| `pageSize`         | `number`                                          | `10`                | Количество элементов на странице       |
| `currentPage`      | `number`                                          | `1`                 | Текущая страница (1-based)             |
| `variant`          | `'default' \| 'simple' \| 'compact' \| 'minimal'` | `'default'`         | Вариант отображения                    |
| `size`             | `'small' \| 'medium' \| 'large'`                  | `'medium'`          | Размер компонента                      |
| `showSizeChanger`  | `boolean`                                         | `true`              | Показать селектор размера страницы     |
| `pageSizeOptions`  | `number[]`                                        | `[10, 20, 50, 100]` | Опции для выбора размера               |
| `showQuickJumper`  | `boolean`                                         | `false`             | Показать поле быстрого перехода        |
| `showTotal`        | `boolean`                                         | `true`              | Показать общее количество              |
| `totalTemplate`    | `string \| TemplateRef`                           | `null`              | Кастомный шаблон для отображения total |
| `maxPages`         | `number`                                          | `7`                 | Максимум видимых кнопок страниц        |
| `disabled`         | `boolean`                                         | `false`             | Отключить пагинацию                    |
| `hideOnSinglePage` | `boolean`                                         | `false`             | Скрыть если только одна страница       |

### 2.3. Events (Outputs)

| Событие          | Тип      | Описание                   |
| ---------------- | -------- | -------------------------- |
| `pageChange`     | `number` | Изменение текущей страницы |
| `pageSizeChange` | `number` | Изменение размера страницы |

### 2.4. Варианты отображения (Variants)

#### Default (Полный)

```
[<] [1] [2] [3] ... [10] [>]  |  Показано 1-10 из 100  |  [10 ▼]  |  Перейти: [__]
```

- Все кнопки страниц с многоточием
- Информация о количестве
- Селектор размера страницы
- Поле быстрого перехода (опционально)

#### Simple (Упрощенный)

```
[<] Страница 3 из 10 [>]  |  [10 ▼]
```

- Только стрелки и текущая страница
- Селектор размера (опционально)

#### Compact (Компактный)

```
[<] [3 / 10] [>]
```

- Минимум места
- Только стрелки и счетчик

#### Minimal (Минимальный)

```
[Назад] [Далее]
```

- Только текстовые кнопки
- Для бесконечной прокрутки или простых списков

### 2.5. Дизайн-требования

- **Кнопки**: Четкие границы, hover/active состояния
- **Текущая страница**: Выделена цветом (primary)
- **Disabled состояние**: Визуально приглушено, курсор not-allowed
- **Адаптивность**: На мобильных устройствах автоматически переключаться на compact/simple
- **Transitions**: Плавная анимация при смене страниц
- **Dark Mode**: Полная поддержка темной темы

---

## 3. Вспомогательные утилиты

### 3.1. `PaginationService`

Сервис для управления состоянием пагинации в сложных сценариях.

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

class PaginationService {
  // Вычисление общего количества страниц
  getTotalPages(total: number, pageSize: number): number;

  // Получение диапазона элементов для текущей страницы
  getPageRange(page: number, pageSize: number): { start: number; end: number };

  // Генерация массива видимых страниц с многоточием
  getVisiblePages(current: number, total: number, max: number): (number | 'ellipsis')[];

  // Проверка валидности страницы
  isValidPage(page: number, totalPages: number): boolean;
}
```

### 3.2. `PaginationPipe`

Pipe для клиентской пагинации массивов.

```typescript
// Использование
items | paginate: { page: currentPage, pageSize: 10 }
```

---

## 4. Интеграция с компонентами

### 4.1. Standalone использование

```html
<av-pagination
  [total]="totalItems"
  [pageSize]="itemsPerPage"
  [(currentPage)]="currentPage"
  (pageChange)="onPageChange($event)"
>
</av-pagination>
```

### 4.2. Интеграция с таблицами

```html
<av-table [dataSource]="data" [pagination]="paginationConfig">
  <!-- columns -->
</av-table>

<!-- Или внешняя пагинация -->
<av-table [dataSource]="currentPageData"></av-table>
<av-pagination [total]="totalItems" [(currentPage)]="currentPage" (pageChange)="loadPage($event)">
</av-pagination>
```

### 4.3. Server-side пагинация

```typescript
export class UserListComponent {
  users = signal<User[]>([]);
  total = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);

  constructor(private userService: UserService) {
    effect(() => {
      this.loadUsers(this.currentPage(), this.pageSize());
    });
  }

  loadUsers(page: number, size: number) {
    this.userService.getUsers({ page, size }).subscribe((response) => {
      this.users.set(response.data);
      this.total.set(response.total);
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}
```

```html
<av-pagination
  [total]="total()"
  [pageSize]="pageSize()"
  [currentPage]="currentPage()"
  (pageChange)="onPageChange($event)"
>
</av-pagination>
```

### 4.4. Client-side пагинация

```typescript
export class ProductListComponent {
  allProducts = signal<Product[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);

  // Computed для текущей страницы
  displayedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.allProducts().slice(start, end);
  });
}
```

```html
<div *ngFor="let product of displayedProducts()">{{ product.name }}</div>

<av-pagination [total]="allProducts().length" [pageSize]="pageSize()" [(currentPage)]="currentPage">
</av-pagination>
```

---

## 5. Accessibility (A11y)

- **Keyboard Navigation**:
  - `Tab` - навигация между элементами
  - `Enter/Space` - активация кнопки
  - `Arrow Left/Right` - переход между страницами
- **ARIA атрибуты**:
  - `role="navigation"`
  - `aria-label="Pagination"`
  - `aria-current="page"` для текущей страницы
  - `aria-disabled="true"` для неактивных кнопок
- **Screen readers**: Понятные метки для всех элементов

---

## 6. План реализации

### Этап 1: Базовый компонент

- Создать `PaginationComponent` с базовым функционалом
- Реализовать логику вычисления страниц
- Добавить кнопки навигации (prev/next)

### Этап 2: Варианты отображения

- Реализовать все 4 варианта (default, simple, compact, minimal)
- Добавить переключение вариантов через input
- Стилизация каждого варианта

### Этап 3: Дополнительные функции

- Селектор размера страницы
- Поле быстрого перехода
- Кастомный шаблон для total
- Адаптивность (автопереключение на мобильных)

### Этап 4: Утилиты

- Создать `PaginationService`
- Создать `PaginationPipe` для клиентской пагинации
- Добавить хелперы для интеграции

### Этап 5: Демонстрация

- Создать страницу `Pagination UI Demo`
- Примеры всех вариантов
- Интеграция с таблицей
- Server-side и client-side примеры

---

## 7. Примеры использования

### Базовый пример

```html
<av-pagination [total]="100" [pageSize]="10" [(currentPage)]="page"> </av-pagination>
```

### Компактный вариант

```html
<av-pagination [total]="500" [pageSize]="20" [(currentPage)]="page" variant="compact" size="small">
</av-pagination>
```

### С кастомным отображением total

```html
<av-pagination
  [total]="users.length"
  [pageSize]="pageSize"
  [(currentPage)]="currentPage"
  [totalTemplate]="totalTpl"
>
</av-pagination>

<ng-template #totalTpl let-range let-total="total">
  Пользователи {{ range.start }}-{{ range.end }} из {{ total }}
</ng-template>
```

### С быстрым переходом

```html
<av-pagination
  [total]="1000"
  [pageSize]="50"
  [(currentPage)]="page"
  [showQuickJumper]="true"
  [pageSizeOptions]="[25, 50, 100, 200]"
>
</av-pagination>
```

---

## 8. Технические детали

### 8.1. Структура компонента

```
pagination/
├── pagination.component.ts       # Основной компонент
├── pagination.component.html     # Шаблон
├── pagination.component.scss     # Стили
├── pagination.service.ts         # Сервис-утилита
├── pagination.pipe.ts            # Pipe для массивов
├── pagination.models.ts          # Типы и интерфейсы
├── index.ts                      # Экспорты
└── README.md                     # Документация
```

### 8.2. Зависимости

- Angular Signals для реактивности
- Computed для вычисляемых значений
- Standalone компоненты

### 8.3. Производительность

- Использовать `OnPush` change detection
- Мемоизация вычислений видимых страниц
- Виртуализация для очень больших списков (опционально)

---

## 9. Тестирование

- Unit тесты для логики вычислений
- Component тесты для UI
- E2E тесты для интеграции с таблицами
- Accessibility тесты

---

## 10. Рекомендации по улучшениям

### 10.1. Двусторонняя привязка (Two-way binding)

**Проблема**: Использование отдельных `@Input()` и `@Output()` для `currentPage` и `pageSize` требует дополнительного кода.

**Решение**: Использовать Angular 19 `model()` для автоматической двусторонней привязки.

```typescript
// Вместо:
@Input() currentPage = 1;
@Output() currentPageChange = new EventEmitter<number>();

// Использовать:
currentPage = model<number>(1);
pageSize = model<number>(10);
```

**Использование**:

```html
<av-pagination [(currentPage)]="page" [(pageSize)]="size" [total]="total"> </av-pagination>
```

**Обоснование**: Упрощает использование в реактивных компонентах, уменьшает boilerplate код.

---

### 10.2. Вычисляемый диапазон (Computed Range)

**Проблема**: Родительские компоненты часто дублируют логику вычисления диапазона "Показано 1-10 из 100".

**Решение**: Добавить computed-свойство `range` и включать его в события.

```typescript
// В компоненте
range = computed(() => {
  const start = (this.currentPage() - 1) * this.pageSize() + 1;
  const end = Math.min(this.currentPage() * this.pageSize(), this.total());
  return { start, end };
});

// Новый output
@Output() paginationChange = new EventEmitter<{
  page: number;
  pageSize: number;
  range: { start: number; end: number };
}>();
```

**Использование**:

```html
<av-pagination [total]="100" [(currentPage)]="page" (paginationChange)="onPaginationChange($event)">
</av-pagination>

<!-- Или прямой доступ -->
<p>Показано {{ pagination.range().start }}-{{ pagination.range().end }} из {{ total }}</p>
```

**Обоснование**: Избегает дублирования логики, предоставляет готовые данные для отображения.

---

### 10.3. Валидация Quick Jumper

**Проблема**: Пользователь может ввести некорректный номер страницы (0, отрицательное число, больше totalPages).

**Решение**: Автоматическая валидация и коррекция ввода.

```typescript
onQuickJump(value: string) {
  let page = parseInt(value, 10);

  // Валидация
  if (isNaN(page) || page < 1) {
    page = 1;
  } else if (page > this.totalPages()) {
    page = this.totalPages();
  }

  this.currentPage.set(page);
  this.jumpInputValue = ''; // Очистить поле
}
```

**UI индикация**:

- Подсветка красным при некорректном вводе
- Автокоррекция при потере фокуса
- Tooltip с подсказкой "Введите число от 1 до X"

**Обоснование**: Предотвращает некорректные переходы, улучшает UX.

---

### 10.4. Локализация (i18n)

**Проблема**: Жестко закодированные тексты на русском языке.

**Решение**: Добавить input для локализации.

```typescript
@Input() locale: 'ru' | 'en' = 'ru';

// Или через объект
@Input() labels = {
  previous: 'Назад',
  next: 'Далее',
  page: 'Страница',
  of: 'из',
  showing: 'Показано',
  jumpTo: 'Перейти к',
  itemsPerPage: 'элементов на странице'
};
```

**Встроенные локали**:

```typescript
const LOCALES = {
  ru: {
    previous: 'Назад',
    next: 'Далее',
    page: 'Страница',
    of: 'из',
    showing: 'Показано',
    jumpTo: 'Перейти к',
  },
  en: {
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    jumpTo: 'Go to',
  },
};
```

**Обоснование**: Поддержка многоязычных приложений, гибкость кастомизации текстов.

---

### 10.5. Объединенный эмиттер

**Проблема**: Два отдельных события `pageChange` и `pageSizeChange` требуют двух подписок.

**Решение**: Добавить объединенное событие `paginationChange`.

```typescript
// Сохранить старые для обратной совместимости
@Output() pageChange = new EventEmitter<number>();
@Output() pageSizeChange = new EventEmitter<number>();

// Новое объединенное событие
@Output() paginationChange = new EventEmitter<PaginationChangeEvent>();

interface PaginationChangeEvent {
  page: number;
  pageSize: number;
  range: { start: number; end: number };
  total: number;
}
```

**Использование**:

```typescript
// Вместо двух подписок:
onPageChange(page: number) { /* ... */ }
onPageSizeChange(size: number) { /* ... */ }

// Одна подписка:
onPaginationChange(event: PaginationChangeEvent) {
  console.log(`Страница ${event.page}, размер ${event.pageSize}`);
  console.log(`Диапазон: ${event.range.start}-${event.range.end}`);
  this.loadData(event.page, event.pageSize);
}
```

**Обоснование**: Упрощает подписку в родительских компонентах, предоставляет все данные в одном месте.

---

### 10.6. Infinite Scroll режим

**Проблема**: Для длинных списков классическая пагинация не всегда удобна.

**Решение**: Добавить вариант `variant="infinite"` с событием `loadMore`.

```typescript
@Input() variant: 'default' | 'simple' | 'compact' | 'minimal' | 'infinite' = 'default';
@Output() loadMore = new EventEmitter<void>();

// Для infinite scroll
@Input() hasMore = true; // Есть ли еще данные
@Input() loading = false; // Идет ли загрузка
```

**UI для infinite**:

```html
<!-- Вместо кнопок страниц -->
<div class="pagination-infinite">
  <button *ngIf="hasMore && !loading" (click)="loadMore.emit()" class="load-more-btn">
    Загрузить еще
  </button>

  <div *ngIf="loading" class="loading-spinner">Загрузка...</div>

  <div *ngIf="!hasMore" class="no-more">Все данные загружены</div>
</div>
```

**Обоснование**: Логичное развитие для длинных списков, современный UX паттерн.

---

### 10.7. Стилизация кнопок (Buttons vs Links)

**Проблема**: Использование `<a>` для кнопок страниц может вызвать проблемы с роутингом в SPA.

**Решение**: Использовать `<button>` для всех интерактивных элементов.

```html
<!-- ❌ Плохо -->
<a href="#" class="page-link" (click)="goToPage(1)">1</a>

<!-- ✅ Хорошо -->
<button
  type="button"
  class="page-btn"
  [class.active]="currentPage() === 1"
  [disabled]="disabled"
  (click)="goToPage(1)"
  aria-label="Перейти на страницу 1"
  [attr.aria-current]="currentPage() === 1 ? 'page' : null"
>
  1
</button>
```

**Преимущества**:

- Нет конфликтов с Angular Router
- Правильная семантика для accessibility
- Автоматическая поддержка `disabled` состояния
- Нет необходимости в `preventDefault()`

**Обоснование**: Лучше для SPA и accessibility, соответствует стандартам WAI-ARIA.

---

### 10.8. Сводная таблица улучшений

| Аспект                        | Приоритет  | Сложность | Влияние на UX |
| ----------------------------- | ---------- | --------- | ------------- |
| Двусторонняя привязка (model) | 🔴 Высокий | Низкая    | Высокое       |
| Вычисляемый диапазон          | 🟡 Средний | Низкая    | Среднее       |
| Валидация Quick Jumper        | 🟡 Средний | Средняя   | Высокое       |
| Локализация                   | 🟢 Низкий  | Средняя   | Среднее       |
| Объединенный эмиттер          | 🟡 Средний | Низкая    | Среднее       |
| Infinite Scroll               | 🟢 Низкий  | Высокая   | Высокое       |
| Buttons вместо Links          | 🔴 Высокий | Низкая    | Высокое       |

---

## 11. Будущие улучшения

- Виртуальная прокрутка для больших списков
- Сохранение состояния в URL (query params)
- Анимации переходов между страницами
- Preloading следующей страницы
- Интеграция с Angular CDK Virtual Scroll
- Поддержка RTL (right-to-left) языков

---

## 12. Продвинутые сценарии использования

### 12.1. Синхронизация с URL (Query Parameters)

**Задача**: Сохранять состояние пагинации в URL для возможности шаринга и навигации браузера.

**Реализация**:

```typescript
export class ProductListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentPage = signal(1);
  pageSize = signal(10);

  constructor() {
    // Читаем параметры из URL при инициализации
    effect(() => {
      const params = this.route.snapshot.queryParams;
      if (params['page']) {
        this.currentPage.set(+params['page']);
      }
      if (params['size']) {
        this.pageSize.set(+params['size']);
      }
    });
  }

  onPaginationChange(event: PaginationChangeEvent) {
    // Обновляем URL при изменении пагинации
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: event.page,
        size: event.pageSize,
      },
      queryParamsHandling: 'merge',
    });
  }
}
```

**Преимущества**:

- Пользователь может поделиться ссылкой на конкретную страницу
- Работает кнопка "Назад" в браузере
- Сохраняется состояние при перезагрузке страницы

---

### 12.2. Кэширование страниц

**Задача**: Избежать повторных запросов к серверу при возврате на уже загруженную страницу.

**Реализация**:

```typescript
export class CachedPaginationService {
  private cache = new Map<string, any>();

  getCachedPage<T>(
    key: string,
    page: number,
    pageSize: number,
    fetcher: () => Observable<T>,
  ): Observable<T> {
    const cacheKey = `${key}_${page}_${pageSize}`;

    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    return fetcher().pipe(tap((data) => this.cache.set(cacheKey, data)));
  }

  clearCache(key?: string) {
    if (key) {
      // Очистить кэш для конкретного ключа
      Array.from(this.cache.keys())
        .filter((k) => k.startsWith(key))
        .forEach((k) => this.cache.delete(k));
    } else {
      this.cache.clear();
    }
  }
}
```

**Использование**:

```typescript
export class UserListComponent {
  private cacheService = inject(CachedPaginationService);
  private userService = inject(UserService);

  loadUsers(page: number, size: number) {
    this.cacheService
      .getCachedPage('users', page, size, () => this.userService.getUsers({ page, size }))
      .subscribe((response) => {
        this.users.set(response.data);
        this.total.set(response.total);
      });
  }

  refreshData() {
    this.cacheService.clearCache('users');
    this.loadUsers(this.currentPage(), this.pageSize());
  }
}
```

---

### 12.3. Интеграция с фильтрами и сортировкой

**Задача**: Координировать пагинацию с фильтрацией и сортировкой данных.

**Реализация**:

```typescript
export class FilterablePaginatedListComponent {
  // Состояние
  currentPage = signal(1);
  pageSize = signal(20);
  sortField = signal<string>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  filters = signal<Record<string, any>>({});

  // Данные
  items = signal<Item[]>([]);
  total = signal(0);

  constructor(private dataService: DataService) {
    // Автоматическая перезагрузка при изменении любого параметра
    effect(() => {
      this.loadData({
        page: this.currentPage(),
        size: this.pageSize(),
        sort: this.sortField(),
        order: this.sortOrder(),
        filters: this.filters(),
      });
    });
  }

  loadData(params: DataParams) {
    this.dataService.getData(params).subscribe((response) => {
      this.items.set(response.data);
      this.total.set(response.total);
    });
  }

  // При изменении фильтров - сбрасываем на первую страницу
  onFilterChange(newFilters: Record<string, any>) {
    this.filters.set(newFilters);
    this.currentPage.set(1); // Важно!
  }

  // При изменении сортировки - тоже на первую
  onSortChange(field: string, order: 'asc' | 'desc') {
    this.sortField.set(field);
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }
}
```

**HTML**:

```html
<!-- Фильтры -->
<av-filters (filterChange)="onFilterChange($event)"></av-filters>

<!-- Таблица с сортировкой -->
<av-table
  [data]="items()"
  [sortField]="sortField()"
  [sortOrder]="sortOrder()"
  (sortChange)="onSortChange($event.field, $event.order)"
>
</av-table>

<!-- Пагинация -->
<av-pagination
  [total]="total()"
  [pageSize]="pageSize()"
  [(currentPage)]="currentPage"
  [(pageSize)]="pageSize"
>
</av-pagination>
```

---

### 12.4. Prefetching следующей страницы

**Задача**: Предзагружать следующую страницу для мгновенного отображения.

**Реализация**:

```typescript
export class PrefetchPaginationComponent {
  currentPage = signal(1);
  pageSize = signal(20);

  // Текущие данные
  currentData = signal<Item[]>([]);

  // Предзагруженная следующая страница
  private nextPageCache = signal<Item[] | null>(null);

  constructor(private dataService: DataService) {
    // Загружаем текущую страницу
    effect(() => {
      const page = this.currentPage();
      const size = this.pageSize();

      // Проверяем кэш
      if (this.nextPageCache() && page > 1) {
        this.currentData.set(this.nextPageCache()!);
        this.nextPageCache.set(null);
      } else {
        this.loadPage(page, size);
      }

      // Предзагружаем следующую страницу
      this.prefetchNextPage(page + 1, size);
    });
  }

  private loadPage(page: number, size: number) {
    this.dataService.getData({ page, size }).subscribe((response) => {
      this.currentData.set(response.data);
    });
  }

  private prefetchNextPage(page: number, size: number) {
    // Загружаем в фоне
    this.dataService.getData({ page, size }).subscribe((response) => {
      this.nextPageCache.set(response.data);
    });
  }
}
```

**Преимущества**:

- Мгновенный переход на следующую страницу
- Улучшенный UX для последовательного просмотра
- Минимальная задержка при навигации

---

## 13. Оптимизация производительности

### 13.1. Виртуализация для больших списков

**Проблема**: Рендеринг тысяч элементов замедляет приложение.

**Решение**: Использовать Angular CDK Virtual Scroll с пагинацией.

```typescript
export class VirtualizedPaginationComponent {
  // Все данные (или большая порция)
  allItems = signal<Item[]>([]);

  // Виртуальный скролл показывает только видимые
  virtualScrollConfig = {
    itemSize: 50, // высота одного элемента
    bufferSize: 10, // количество элементов в буфере
  };

  // Пагинация для загрузки порций
  currentChunk = signal(1);
  chunkSize = 1000; // Загружаем по 1000 элементов

  loadChunk(chunk: number) {
    this.dataService.getChunk(chunk, this.chunkSize).subscribe((data) => {
      // Добавляем к существующим данным
      this.allItems.update((items) => [...items, ...data]);
    });
  }
}
```

**HTML**:

```html
<cdk-virtual-scroll-viewport [itemSize]="virtualScrollConfig.itemSize" class="viewport">
  <div *cdkVirtualFor="let item of allItems()" class="item">{{ item.name }}</div>
</cdk-virtual-scroll-viewport>

<!-- Пагинация для загрузки чанков -->
<av-pagination
  variant="infinite"
  [hasMore]="hasMoreChunks()"
  (loadMore)="loadChunk(currentChunk() + 1)"
>
</av-pagination>
```

---

### 13.2. Debounce для Quick Jumper

**Проблема**: Каждое нажатие клавиши вызывает изменение страницы.

**Решение**: Использовать debounce для отложенного применения.

```typescript
export class PaginationComponent {
  private jumpSubject = new Subject<string>();

  constructor() {
    // Применяем изменение только после паузы в 500мс
    this.jumpSubject
      .pipe(
        debounceTime(500),
        map((value) => parseInt(value, 10)),
        filter((page) => !isNaN(page) && page >= 1 && page <= this.totalPages()),
      )
      .subscribe((page) => {
        this.currentPage.set(page);
      });
  }

  onJumpInputChange(value: string) {
    this.jumpSubject.next(value);
  }
}
```

---

### 13.3. Мемоизация вычислений

**Проблема**: Пересчет видимых страниц на каждый change detection.

**Решение**: Использовать `computed()` для автоматической мемоизации.

```typescript
export class PaginationComponent {
  total = input.required<number>();
  pageSize = input<number>(10);
  currentPage = model<number>(1);
  maxPages = input<number>(7);

  // Автоматически кэшируется
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));

  // Пересчитывается только при изменении зависимостей
  visiblePages = computed(() =>
    this.calculateVisiblePages(this.currentPage(), this.totalPages(), this.maxPages()),
  );

  private calculateVisiblePages(
    current: number,
    total: number,
    max: number,
  ): (number | 'ellipsis')[] {
    // Сложная логика вычисления
    // ...
  }
}
```

---

## 14. Реальные кейсы использования

### 14.1. E-commerce: Каталог товаров

```typescript
export class ProductCatalogComponent {
  // Фильтры
  category = signal<string | null>(null);
  priceRange = signal<[number, number]>([0, 10000]);
  inStock = signal<boolean>(false);

  // Сортировка
  sortBy = signal<'price' | 'name' | 'rating'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Пагинация
  currentPage = signal(1);
  pageSize = signal(24); // Сетка 4x6

  products = signal<Product[]>([]);
  total = signal(0);

  constructor(private productService: ProductService) {
    effect(() => {
      this.loadProducts({
        page: this.currentPage(),
        size: this.pageSize(),
        category: this.category(),
        priceRange: this.priceRange(),
        inStock: this.inStock(),
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder(),
      });
    });
  }
}
```

**HTML**:

```html
<!-- Фильтры -->
<div class="filters">
  <av-select [(value)]="category" [options]="categories"></av-select>
  <av-range-slider [(value)]="priceRange"></av-range-slider>
  <av-checkbox [(checked)]="inStock">Только в наличии</av-checkbox>
</div>

<!-- Сортировка -->
<av-sort-selector [(sortBy)]="sortBy" [(sortOrder)]="sortOrder"></av-sort-selector>

<!-- Сетка товаров -->
<div class="product-grid">
  <product-card *ngFor="let product of products()" [product]="product"></product-card>
</div>

<!-- Пагинация -->
<av-pagination
  [total]="total()"
  [pageSize]="pageSize()"
  [(currentPage)]="currentPage"
  [pageSizeOptions]="[12, 24, 48, 96]"
  variant="default"
>
</av-pagination>
```

---

### 14.2. Admin Panel: Таблица пользователей

```typescript
export class UserManagementComponent {
  // Поиск
  searchQuery = signal('');

  // Фильтры
  role = signal<UserRole | null>(null);
  status = signal<UserStatus | null>(null);

  // Пагинация
  currentPage = signal(1);
  pageSize = signal(50);

  // Выделение строк
  selectedUsers = signal<Set<string>>(new Set());

  users = signal<User[]>([]);
  total = signal(0);

  constructor(private userService: UserService) {
    effect(() => {
      this.loadUsers({
        page: this.currentPage(),
        size: this.pageSize(),
        search: this.searchQuery(),
        role: this.role(),
        status: this.status(),
      });
    });
  }

  // Массовые операции
  deleteSelected() {
    const ids = Array.from(this.selectedUsers());
    this.userService.deleteUsers(ids).subscribe(() => {
      this.selectedUsers.set(new Set());
      this.loadUsers(/* ... */);
    });
  }
}
```

---

### 14.3. Blog: Список статей с infinite scroll

```typescript
export class BlogListComponent {
  articles = signal<Article[]>([]);
  currentPage = signal(1);
  pageSize = 10;
  hasMore = signal(true);
  loading = signal(false);

  constructor(private blogService: BlogService) {}

  loadMore() {
    if (this.loading() || !this.hasMore()) return;

    this.loading.set(true);
    const nextPage = this.currentPage() + 1;

    this.blogService.getArticles(nextPage, this.pageSize).subscribe((response) => {
      // Добавляем к существующим
      this.articles.update((articles) => [...articles, ...response.data]);

      // Обновляем состояние
      this.currentPage.set(nextPage);
      this.hasMore.set(response.data.length === this.pageSize);
      this.loading.set(false);
    });
  }
}
```

**HTML**:

```html
<div class="articles-list">
  <article-card *ngFor="let article of articles()" [article]="article"></article-card>
</div>

<av-pagination
  variant="infinite"
  [hasMore]="hasMore()"
  [loading]="loading()"
  (loadMore)="loadMore()"
>
</av-pagination>
```

---

## 15. Чеклист реализации

### Фаза 1: Базовый функционал ✅

- [ ] Создать `PaginationComponent` (standalone)
- [ ] Реализовать базовую логику вычисления страниц
- [ ] Добавить кнопки Previous/Next
- [ ] Реализовать отображение номеров страниц
- [ ] Добавить логику многоточия (ellipsis)
- [ ] Базовые стили (SCSS)

### Фаза 2: Варианты отображения ✅

- [ ] Реализовать `variant="default"`
- [ ] Реализовать `variant="simple"`
- [ ] Реализовать `variant="compact"`
- [ ] Реализовать `variant="minimal"`
- [ ] Адаптивное переключение вариантов

### Фаза 3: Дополнительные функции ✅

- [ ] Селектор размера страницы (`showSizeChanger`)
- [ ] Поле быстрого перехода (`showQuickJumper`)
- [ ] Отображение total (`showTotal`)
- [ ] Кастомный шаблон для total (`totalTemplate`)
- [ ] Размеры компонента (`size: small/medium/large`)

### Фаза 4: Улучшения ⚡

- [ ] Использовать `model()` для двусторонней привязки
- [ ] Добавить `computed()` для range
- [ ] Объединенное событие `paginationChange`
- [ ] Валидация Quick Jumper
- [ ] Локализация (i18n)
- [ ] Infinite scroll режим

### Фаза 5: Утилиты 🛠️

- [ ] Создать `PaginationService`
- [ ] Создать `PaginationPipe` для массивов
- [ ] Хелперы для интеграции с таблицами
- [ ] Кэширование страниц (опционально)

### Фаза 6: Accessibility ♿

- [ ] Keyboard navigation (Tab, Enter, Arrows)
- [ ] ARIA атрибуты
- [ ] Screen reader поддержка
- [ ] Focus management

### Фаза 7: Демонстрация 🎨

- [ ] Создать страницу `Pagination UI Demo`
- [ ] Примеры всех вариантов
- [ ] Интеграция с таблицей
- [ ] Server-side пример
- [ ] Client-side пример
- [ ] Infinite scroll пример

### Фаза 8: Тестирование 🧪

- [ ] Unit тесты для логики
- [ ] Component тесты
- [ ] Accessibility тесты
- [ ] E2E тесты

---

## 16. Заключение

Система пагинации является критически важным компонентом для любого admin panel. Правильная реализация должна учитывать:

1. **Гибкость**: Поддержка различных вариантов отображения
2. **Производительность**: Оптимизация для больших объемов данных
3. **UX**: Интуитивная навигация и быстрый доступ к данным
4. **Accessibility**: Доступность для всех пользователей
5. **Интеграция**: Легкая интеграция с другими компонентами

Следуя этому ТЗ, вы создадите мощный, переиспользуемый компонент пагинации, который будет служить основой для всех списков и таблиц в Aurora Admin Panel.

---

**Версия документа**: 1.0
**Дата**: 2025-12-20
**Автор**: Aurora Team
