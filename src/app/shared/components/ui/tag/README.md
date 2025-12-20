# Tag Component

Компонент для отображения тегов, меток, категорий и статусов.

## Использование

### Базовый пример

```html
<av-tag label="Angular"></av-tag>
```

### С иконкой

```html
<av-tag label="Settings" icon="actions/av_settings" color="primary"></av-tag>
```

### Удаляемый тег

```html
<av-tag label="Angular" [removable]="true" color="primary" (removed)="onTagRemove()"> </av-tag>
```

### Кликабельный тег

```html
<av-tag label="Click me" [clickable]="true" color="info" (clicked)="onTagClick()"> </av-tag>
```

## API

### Inputs

| Свойство    | Тип                                                                               | Default     | Описание                 |
| ----------- | --------------------------------------------------------------------------------- | ----------- | ------------------------ |
| `label`     | `string`                                                                          | `''`        | Текст тега               |
| `size`      | `'small' \| 'medium' \| 'large'`                                                  | `'medium'`  | Размер                   |
| `variant`   | `'filled' \| 'outlined' \| 'soft'`                                                | `'soft'`    | Стиль                    |
| `color`     | `'primary' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'neutral' \| string` | `'neutral'` | Цвет                     |
| `shape`     | `'rounded' \| 'pill'`                                                             | `'rounded'` | Форма                    |
| `removable` | `boolean`                                                                         | `false`     | Показать кнопку удаления |
| `clickable` | `boolean`                                                                         | `false`     | Сделать кликабельным     |
| `icon`      | `string \| null`                                                                  | `null`      | Иконка слева             |

### Outputs

| Событие   | Тип          | Описание                     |
| --------- | ------------ | ---------------------------- |
| `clicked` | `MouseEvent` | Клик на тег (если clickable) |
| `removed` | `void`       | Клик на кнопку удаления      |

## Tag Input Component

Компонент для ввода и управления списком тегов.

### Использование

```html
<av-tag-input
  [(tags)]="myTags"
  placeholder="Добавьте навыки..."
  [allowDuplicates]="false"
  variant="soft"
></av-tag-input>
```

```typescript
// В компоненте
myTags = signal(['Frontend', 'UI/UX']);
```

### API

| Свойство          | Тип                        | Default            | Описание            |
| ----------------- | -------------------------- | ------------------ | ------------------- |
| `tags`            | `WritableSignal<string[]>` | -                  | Модель данных       |
| `placeholder`     | `string`                   | `'Введите тег...'` | Placeholder         |
| `allowDuplicates` | `boolean`                  | `false`            | Разрешить дубликаты |
| `variant`         | `TagVariant`               | `'soft'`           | Стиль тегов         |

## Примеры

Полные примеры использования доступны на странице **Tag UI Demo** в разделе UI Demo.
