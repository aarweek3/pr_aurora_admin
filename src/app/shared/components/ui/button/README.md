# Button Component & Directive

Кнопки Aurora Admin доступны в двух вариантах API:

## 1. Component API (старый подход)

Использует Angular компонент `<app-button>`:

```html
<app-button type="primary" size="large" [loading]="isLoading()" (clicked)="handleClick()">
  Сохранить
</app-button>

<app-button type="danger" icon="delete" [iconOnly]="true" (clicked)="handleDelete()" />
```

### Преимущества:

- ✅ Поддержка иконок (prefix, suffix, icon-only)
- ✅ Автоматическая обработка loading индикатора
- ✅ Полная инкапсуляция стилей
- ✅ Удобный контент через `<ng-content>`

### Недостатки:

- ❌ Не нативный элемент
- ❌ Сложнее для форм и accessibility
- ❌ Больше DOM узлов

---

## 2. Directive API (новый подход) ⭐

Использует директиву `av-button` на нативных элементах:

```html
<button
  av-button
  avType="primary"
  avSize="large"
  [avLoading]="isLoading()"
  (clicked)="handleClick()"
>
  Сохранить
</button>

<button av-button avType="danger" disabled>Удалить</button>
```

### Преимущества:

- ✅ Нативный `<button>` элемент
- ✅ Лучше для accessibility
- ✅ Проще для форм
- ✅ Меньше DOM узлов
- ✅ Полная совместимость с HTML атрибутами

### Недостатки:

- ❌ Нет встроенной поддержки иконок (нужно добавлять вручную)
- ❌ Loading индикатор через CSS ::before

---

## API Reference

### Component (`<app-button>`)

| Input        | Type         | Default     | Description                                              |
| ------------ | ------------ | ----------- | -------------------------------------------------------- |
| `type`       | `ButtonType` | `'default'` | Тип кнопки: primary, default, dashed, text, link, danger |
| `size`       | `ButtonSize` | `'default'` | Размер: small, default, large                            |
| `htmlType`   | `string`     | `'button'`  | HTML type атрибут                                        |
| `icon`       | `string`     | -           | Иконка (nz-icon name)                                    |
| `suffixIcon` | `string`     | -           | Иконка справа                                            |
| `iconOnly`   | `boolean`    | `false`     | Только иконка без текста                                 |
| `loading`    | `boolean`    | `false`     | Состояние загрузки                                       |
| `disabled`   | `boolean`    | `false`     | Отключена                                                |
| `block`      | `boolean`    | `false`     | На всю ширину                                            |

| Output    | Type                       | Description    |
| --------- | -------------------------- | -------------- |
| `clicked` | `EventEmitter<MouseEvent>` | Клик по кнопке |

### Directive (`av-button`)

| Input       | Type         | Default     | Description        |
| ----------- | ------------ | ----------- | ------------------ |
| `avType`    | `ButtonType` | `'default'` | Тип кнопки         |
| `avSize`    | `ButtonSize` | `'default'` | Размер             |
| `avLoading` | `boolean`    | `false`     | Состояние загрузки |
| `avBlock`   | `boolean`    | `false`     | На всю ширину      |

| Output    | Type                       | Description    |
| --------- | -------------------------- | -------------- |
| `clicked` | `EventEmitter<MouseEvent>` | Клик по кнопке |

---

## Styling

Обе версии используют BEM классы:

### Component

- `.button` - базовый класс
- `.button--primary`, `.button--danger` - модификаторы типа
- `.button--small`, `.button--large` - модификаторы размера
- `.button__icon`, `.button__content` - элементы

### Directive

- `.av-btn` - базовый класс
- `.av-btn--primary`, `.av-btn--danger` - модификаторы типа
- `.av-btn--small`, `.av-btn--large` - модификаторы размера
- `.av-btn--loading`, `.av-btn--block` - модификаторы состояния

---

## Рекомендации

### Используйте Component когда:

- Нужны иконки
- Требуется сложная компоновка контента
- Используете в списках/таблицах

### Используйте Directive когда:

- Простые текстовые кнопки
- Важна семантика и accessibility
- Работаете с формами
- Нужна максимальная производительность

---

## Примеры

### Component с иконкой

```html
<app-button type="primary" icon="plus" (clicked)="onCreate()"> Создать </app-button>
```

### Directive с loading

```html
<button av-button avType="primary" [avLoading]="isSaving">
  {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
</button>
```

### Группа кнопок

```html
<div class="button-group">
  <button av-button avType="default">Отмена</button>
  <button av-button avType="primary">OK</button>
</div>
```

---

## Импорт

```typescript
import { ButtonComponent, ButtonDirective } from '@shared/components/ui/button';
// или
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { ButtonDirective } from '@shared/components/ui/button/button.directive';
```
