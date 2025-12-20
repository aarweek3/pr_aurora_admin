# Pagination Component

Универсальный компонент пагинации для навигации по страницам данных.

## Использование

### Базовый пример

```html
<av-pagination [total]="100" [(currentPage)]="page" [(pageSize)]="size"> </av-pagination>
```

### С обработчиком изменений

```html
<av-pagination
  [total]="totalItems"
  [(currentPage)]="currentPage"
  [(pageSize)]="pageSize"
  (paginationChange)="onPaginationChange($event)"
>
</av-pagination>
```

```typescript
onPaginationChange(event: PaginationChangeEvent) {
  console.log('Page:', event.page);
  console.log('Page Size:', event.pageSize);
  console.log('Range:', event.range); // { start: 1, end: 10 }
  console.log('Total:', event.total);
}
```

## API

### Inputs

| Свойство           | Тип                                               | Default             | Описание                        |
| ------------------ | ------------------------------------------------- | ------------------- | ------------------------------- |
| `total`            | `number`                                          | `0`                 | Общее количество элементов      |
| `variant`          | `'default' \| 'simple' \| 'compact' \| 'minimal'` | `'default'`         | Вариант отображения             |
| `size`             | `'small' \| 'medium' \| 'large'`                  | `'medium'`          | Размер компонента               |
| `showSizeChanger`  | `boolean`                                         | `true`              | Показать селектор размера       |
| `pageSizeOptions`  | `number[]`                                        | `[10, 20, 50, 100]` | Опции размера страницы          |
| `showQuickJumper`  | `boolean`                                         | `false`             | Показать поле быстрого перехода |
| `showTotal`        | `boolean`                                         | `true`              | Показать общее количество       |
| `maxPages`         | `number`                                          | `7`                 | Максимум видимых кнопок         |
| `disabled`         | `boolean`                                         | `false`             | Отключить пагинацию             |
| `hideOnSinglePage` | `boolean`                                         | `false`             | Скрыть если одна страница       |
| `locale`           | `'ru' \| 'en'`                                    | `'ru'`              | Язык интерфейса                 |

### Models (Two-way binding)

| Свойство      | Тип      | Default | Описание                   |
| ------------- | -------- | ------- | -------------------------- |
| `currentPage` | `number` | `1`     | Текущая страница (1-based) |
| `pageSize`    | `number` | `10`    | Размер страницы            |

### Outputs

| Событие            | Тип                     | Описание                       |
| ------------------ | ----------------------- | ------------------------------ |
| `paginationChange` | `PaginationChangeEvent` | Объединенное событие изменения |
| `pageChange`       | `number`                | Изменение страницы             |
| `pageSizeChange`   | `number`                | Изменение размера              |

### PaginationChangeEvent

```typescript
interface PaginationChangeEvent {
  page: number;
  pageSize: number;
  range: { start: number; end: number };
  total: number;
}
```

## Варианты отображения

### Default (Полный)

```html
<av-pagination [total]="100" [(currentPage)]="page" variant="default"> </av-pagination>
```

Отображает: кнопки страниц, информацию, селектор размера, быстрый переход.

### Simple (Упрощенный)

```html
<av-pagination [total]="100" [(currentPage)]="page" variant="simple"> </av-pagination>
```

Отображает: стрелки и текст "Страница X из Y".

### Compact (Компактный)

```html
<av-pagination [total]="100" [(currentPage)]="page" variant="compact"> </av-pagination>
```

Отображает: стрелки и счетчик "X / Y".

### Minimal (Минимальный)

```html
<av-pagination [total]="100" [(currentPage)]="page" variant="minimal"> </av-pagination>
```

Отображает: только кнопки "Назад" и "Далее".

## Размеры

```html
<!-- Маленький -->
<av-pagination [total]="100" [(currentPage)]="page" size="small"></av-pagination>

<!-- Средний (по умолчанию) -->
<av-pagination [total]="100" [(currentPage)]="page" size="medium"></av-pagination>

<!-- Большой -->
<av-pagination [total]="100" [(currentPage)]="page" size="large"></av-pagination>
```

## Дополнительные функции

### Селектор размера страницы

```html
<av-pagination
  [total]="500"
  [(currentPage)]="page"
  [(pageSize)]="size"
  [showSizeChanger]="true"
  [pageSizeOptions]="[10, 25, 50, 100]"
>
</av-pagination>
```

### Быстрый переход

```html
<av-pagination [total]="1000" [(currentPage)]="page" [showQuickJumper]="true"> </av-pagination>
```

### Локализация

```html
<!-- Русский (по умолчанию) -->
<av-pagination [total]="100" [(currentPage)]="page" locale="ru"></av-pagination>

<!-- Английский -->
<av-pagination [total]="100" [(currentPage)]="page" locale="en"></av-pagination>
```

## Интеграция

### Server-side пагинация

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
}
```

```html
<av-pagination [total]="total()" [(currentPage)]="currentPage" [(pageSize)]="pageSize">
</av-pagination>
```

### Client-side пагинация

```typescript
export class ProductListComponent {
  allProducts = signal<Product[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);

  displayedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.allProducts().slice(start, end);
  });
}
```

```html
<div *ngFor="let product of displayedProducts()">{{ product.name }}</div>

<av-pagination [total]="allProducts().length" [(currentPage)]="currentPage" [(pageSize)]="pageSize">
</av-pagination>
```

## Accessibility

- Полная поддержка клавиатуры (Tab, Enter, Arrow keys)
- ARIA атрибуты (`role="navigation"`, `aria-label`, `aria-current`)
- Screen reader friendly
- Правильная семантика (кнопки вместо ссылок)

## Темная тема

Компонент автоматически адаптируется к темной теме через `@include dark-theme`.
