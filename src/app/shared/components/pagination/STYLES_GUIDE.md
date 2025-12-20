# Pagination Component - Руководство по стилям

## Обзор

Компонент пагинации основан на минималистичном дизайне с квадратными кнопками (как в примере). Поддерживает множество вариантов отображения, размеров и тем.

## Базовое использование

```html
<nav class="av-pagination">
  <button class="av-pagination__button av-pagination__nav">&lt;</button>
  <button class="av-pagination__button av-pagination__page">1</button>
  <button class="av-pagination__button av-pagination__page av-pagination__button--active">2</button>
  <button class="av-pagination__button av-pagination__page">3</button>
  <button class="av-pagination__button av-pagination__nav">&gt;</button>
</nav>
```

## Структура классов

### Основной контейнер

- `.av-pagination` - базовый класс компонента

### Кнопки

- `.av-pagination__button` - базовый класс для всех кнопок
- `.av-pagination__nav` - кнопки навигации (prev/next)
- `.av-pagination__page` - кнопки страниц
- `.av-pagination__button--active` - активная (текущая) страница

### Дополнительные элементы

- `.av-pagination__ellipsis` - многоточие
- `.av-pagination__total` - информация о количестве
- `.av-pagination__size-changer` - селектор размера страницы
- `.av-pagination__quick-jumper` - поле быстрого перехода

## Размеры

```html
<!-- Маленький -->
<nav class="av-pagination av-pagination--small">...</nav>

<!-- Средний (по умолчанию) -->
<nav class="av-pagination">...</nav>

<!-- Большой -->
<nav class="av-pagination av-pagination--large">...</nav>
```

## Формы кнопок

```html
<!-- Квадратные (по умолчанию, как на примере) -->
<nav class="av-pagination av-pagination--shape-square">...</nav>

<!-- Скругленные -->
<nav class="av-pagination av-pagination--shape-rounded">...</nav>

<!-- Круглые -->
<nav class="av-pagination av-pagination--shape-circle">...</nav>
```

## Темы

```html
<!-- Outlined (по умолчанию, как на примере) -->
<nav class="av-pagination">...</nav>

<!-- Filled (заполненные) -->
<nav class="av-pagination av-pagination--theme-filled">...</nav>

<!-- Ghost (прозрачные) -->
<nav class="av-pagination av-pagination--theme-ghost">...</nav>

<!-- Gradient (градиентные) -->
<nav class="av-pagination av-pagination--theme-gradient">...</nav>
```

## Цветовые схемы

```html
<!-- Primary (по умолчанию) -->
<nav class="av-pagination">...</nav>

<!-- Success -->
<nav class="av-pagination av-pagination--color-success">...</nav>

<!-- Warning -->
<nav class="av-pagination av-pagination--color-warning">...</nav>

<!-- Danger -->
<nav class="av-pagination av-pagination--color-danger">...</nav>
```

## Варианты отображения

### Default (полный)

```html
<nav class="av-pagination">
  <!-- Все кнопки страниц + навигация -->
</nav>
```

### Simple (упрощенный)

```html
<nav class="av-pagination av-pagination--simple">
  <button class="av-pagination__button">&lt;</button>
  <span class="av-pagination__simple-text">Страница 3 из 10</span>
  <button class="av-pagination__button">&gt;</button>
</nav>
```

### Compact (компактный)

```html
<nav class="av-pagination av-pagination--compact">
  <button class="av-pagination__button">&lt;</button>
  <div class="av-pagination__compact-display">3 / 10</div>
  <button class="av-pagination__button">&gt;</button>
</nav>
```

### Minimal (минимальный)

```html
<nav class="av-pagination av-pagination--minimal">
  <button class="av-pagination__button">Назад</button>
  <button class="av-pagination__button">Далее</button>
</nav>
```

### Infinite Scroll

```html
<nav class="av-pagination av-pagination--infinite">
  <button class="av-pagination__load-more">Загрузить еще</button>
</nav>
```

## Отступы

```html
<!-- Компактные -->
<nav class="av-pagination av-pagination--spacing-compact">...</nav>

<!-- Комфортные -->
<nav class="av-pagination av-pagination--spacing-comfortable">...</nav>

<!-- Просторные -->
<nav class="av-pagination av-pagination--spacing-spacious">...</nav>
```

## Границы

```html
<!-- Жирные границы -->
<nav class="av-pagination av-pagination--border-bold">...</nav>

<!-- Без границ -->
<nav class="av-pagination av-pagination--border-none">...</nav>
```

## Тени

```html
<!-- Маленькая тень -->
<nav class="av-pagination av-pagination--shadow-sm">...</nav>

<!-- Средняя тень -->
<nav class="av-pagination av-pagination--shadow-md">...</nav>

<!-- Большая тень -->
<nav class="av-pagination av-pagination--shadow-lg">...</nav>
```

## Анимации

```html
<!-- Масштабирование при наведении -->
<nav class="av-pagination av-pagination--animation-scale">...</nav>

<!-- Подъем при наведении -->
<nav class="av-pagination av-pagination--animation-lift">...</nav>

<!-- Свечение активной кнопки -->
<nav class="av-pagination av-pagination--animation-glow">...</nav>
```

## Готовые комбинации

### Modern (современный)

```html
<nav class="av-pagination av-pagination--modern">
  <!-- Rounded + Filled + Shadow + Comfortable spacing -->
</nav>
```

### Minimal Clean (минималистичный)

```html
<nav class="av-pagination av-pagination--minimal-clean">
  <!-- Ghost + No border + Compact spacing -->
</nav>
```

### Premium (премиум)

```html
<nav class="av-pagination av-pagination--premium">
  <!-- Gradient + Shadow + Lift animation + Comfortable spacing -->
</nav>
```

## Обертки для выравнивания

```html
<!-- По левому краю -->
<div class="pagination-wrapper pagination-wrapper--left">
  <nav class="av-pagination">...</nav>
</div>

<!-- По центру -->
<div class="pagination-wrapper pagination-wrapper--center">
  <nav class="av-pagination">...</nav>
</div>

<!-- По правому краю -->
<div class="pagination-wrapper pagination-wrapper--right">
  <nav class="av-pagination">...</nav>
</div>

<!-- Space-between (по умолчанию) -->
<div class="pagination-wrapper">
  <nav class="av-pagination">...</nav>
</div>
```

## Состояния кнопок

### Active (активная)

```html
<button class="av-pagination__button av-pagination__button--active">2</button>
```

### Disabled (отключена)

```html
<button class="av-pagination__button" disabled>&lt;</button>
```

### Отключить весь компонент

```html
<nav class="av-pagination av-pagination--disabled">...</nav>
```

## Адаптивность

Компонент автоматически адаптируется под мобильные устройства:

- На экранах < 768px скрываются некоторые кнопки страниц
- На экранах < 768px скрывается информация о total
- На экранах < 480px скрываются size changer и quick jumper

## Темная тема

Все стили автоматически поддерживают темную тему через CSS-переменные и миксин `@include dark-theme`.

## CSS-переменные

Основные переменные для кастомизации:

- `--color-primary` - основной цвет (по умолчанию #1890ff)
- `--border-color` - цвет границ
- `--bg-container` - фон кнопок
- `--text-primary` - цвет текста
- `--text-secondary` - вторичный цвет текста
- `--text-disabled` - цвет отключенного текста

## Accessibility

Компонент включает поддержку accessibility:

- `role="navigation"` на контейнере
- `aria-label` для навигации
- `aria-current="page"` для текущей страницы
- `aria-disabled` для отключенных кнопок
- Поддержка клавиатурной навигации (Tab, Enter, Space)
- Focus-visible для клавиатурного фокуса

## Примеры комбинаций

### Как на примере (базовый стиль)

```html
<nav class="av-pagination av-pagination--shape-square">
  <button class="av-pagination__button av-pagination__nav">&lt;</button>
  <button class="av-pagination__button av-pagination__page">1</button>
  <button class="av-pagination__button av-pagination__page av-pagination__button--active">2</button>
  <button class="av-pagination__button av-pagination__page">3</button>
  <span class="av-pagination__ellipsis">...</span>
  <button class="av-pagination__button av-pagination__page">20</button>
  <button class="av-pagination__button av-pagination__nav">&gt;</button>
</nav>
```

### Современный стиль

```html
<nav
  class="av-pagination av-pagination--shape-rounded av-pagination--theme-filled av-pagination--shadow-sm"
>
  <!-- ... -->
</nav>
```

### Минималистичный стиль

```html
<nav class="av-pagination av-pagination--theme-ghost av-pagination--border-none">
  <!-- ... -->
</nav>
```

## Файлы стилей

1. `pagination.component.scss` - основные стили компонента
2. `pagination-variants.scss` - дополнительные варианты и темы

Импортируйте оба файла в вашем компоненте:

```scss
@import './pagination.component.scss';
@import './pagination-variants.scss';
```
