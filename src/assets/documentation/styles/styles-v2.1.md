# Aurora Admin: Манифест Стилей v2.1 (Спецификация 2026)
**High-End CSS Architecture • Design Tokens • Cascade Layers • Container Queries**

---

## 1. Архитектурный Стек
- **Cascade Layers (`@layer`)**: Управление специфичностью (base, vendor, components, utilities).
- **Modern Tokens**: CSS Custom Properties для всех констант.
- **Fluid Typography**: Масштабирование через `clamp()`.
- **Component Logic**: Scoped Styles + CSS Variables в `:host`.
- **Advanced Layout**: CSS Grid + Flexbox + **Container Queries**.

---

## 2. Дизайн-Токены (v2.1 Standard)

Все токены определены в слое `@layer base` файла `_tokens.scss`.

### Типографика и Текст
- **Fluid Scale**: Все размеры от `base` до `xxxl` адаптивны по умолчанию.
- **Weights**: Используйте `--av-font-weight-[light|normal|medium|semibold|bold]`.

### Геометрия (Radius)
- `--av-radius-xs` (2px) — микро-элементы.
- `--av-radius-base` (6px) — стандартные кнопки/инпуты.
- `--av-radius-lg` (12px) — карточки, панели.
- `--av-radius-pill` (9999px) — капсульные элементы.

### Слои (Z-Index)
- `--av-z-dropdown`: 1000
- `--av-z-modal`: 1050
- `--av-z-tooltip`: 1070

---

## 3. Состояния и Эффекты (Advanced States)

Для состояний (hover, active) используйте нативную функцию `color-mix()` вместо создания новых переменных.

```scss
.av-btn {
  background-color: var(--av-color-primary);
  transition: var(--av-motion-duration-base) var(--av-motion-ease);

  &:hover {
    // 2026 approach: динамическое смешивание
    background-color: color-mix(in srgb, var(--av-color-primary), white 15%);
  }
}
```

---

## 4. Адаптивность 2.0 (Container Queries)

Мы переходим от адаптивности «от экрана» к адаптивности «от контейнера». Это позволяет компоненту выглядеть идеально в любом месте (и в узком сайдбаре, и в широком контенте).

```scss
// Определение контейнера
.card-wrapper {
  container-type: inline-size;
}

// Стили зависят от размера родителя, а не вьюпорта
@container (min-width: 400px) {
  .card-content {
    display: flex;
    gap: var(--av-spacing-md);
  }
}
```

---

## 5. CSS Cascade Layers (@layer)

Соблюдайте строгий приоритет слоев:
1. **base**: Токены, сброс, типографика.
2. **vendor**: Внешние библиотеки (NG-ZORRO).
3. **components**: Глобальные UI-атомы.
4. **utilities**: Финальные модификаторы.

---

## 6. Правила разработки (Do's and Don'ts)

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Используй `:host` для стилей компонента | Не пиши глобальные классы для локальных задач |
| Используй `var(--av-...)` | Никаких Hex-кодов или `rgba()` вне токенов |
| Применяй `@include av-glass` для панелей | Не используй старый прозрачный серый фон |
| Используй `gap` вместо `margin` во флексах | Не используй `!important` для перебития вендора |

---

**footer:** Aurora Admin • Design Manifesto v2.1 • Май 2026 • Premium Architecture
