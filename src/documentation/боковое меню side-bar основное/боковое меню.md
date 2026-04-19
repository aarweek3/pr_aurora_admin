# где сам редактор TinyMCE&Документация: Управление боковым меню (Sidebar)

Боковое меню в приложении Aurora Admin строится на основе конфигурационного файла, который определяет структуру групп, пунктов и подменю.

## Файлы конфигурации

- **Основной конфиг**: [sidebar-default.config.ts](../app/shared/components/layout/left-sidebar/sidebar-default.config.ts)
- **Модель данных**: [sidebar.model.ts](../app/shared/components/layout/left-sidebar/sidebar.model.ts)

---

## Структура конфигурации

Меню состоит из массива **групп** (`menuGroups`). Каждая группа содержит массив **пунктов** (`items`).

### 1. Как добавить новую группу

Группы используются для визуального разделения блоков меню (например, «Администрирование», «Контент»).

```typescript
{
  id: 'my-group',
  title: 'Заголовок группы', // Отображается над пунктами
  highlight: false,         // Если true, группа будет выделена (например, для важных разделов)
  items: [
    // Пункты меню здесь
  ]
}
```

### 2. Как добавить обычный пункт (ссылку)

Пункт типа `link` выполняет переход по маршруту.

```typescript
{
  id: 'unique-id',
  icon: 'dashboard',      // Ключ иконки ng-zorro
  label: 'Главная',       // Текст в меню
  type: 'link',
  route: '/dashboard',     // Маршрут в Angular
  badge: {                // Необязательно: значок с числом или текстом
    value: 'New',
    intent: 'success'     // default, info, warning, error, success
  }
}
```

### 3. Как добавить подменю (Submenu)

Для группировки связанных страниц используется тип `submenu`.

```typescript
{
  id: 'ref-data',
  icon: 'book',
  label: 'Справочники',
  type: 'submenu',
  submenu: [
    {
       id: 'sub-item-1',
       label: 'Пункт 1',
       route: '/path/1',
       icon: 'star' // Необязательно
    },
    {
       id: 'sub-item-2',
       label: 'Пункт 2',
       route: '/path/2'
    }
  ]
}
```

### 4. Как удалить пункт или группу

Чтобы удалить пункт или целую группу, просто удалите соответствующий объект из массива `menuGroups` или `items` в файле [sidebar-default.config.ts](../app/shared/components/layout/left-sidebar/sidebar-default.config.ts).

---

## Иконки

Система использует иконки **Ant Design (ng-zorro)**.

- Список доступных иконок: [Ant Design Icons](https://ng.ant.design/components/icon/en)
- При указании иконки используйте её строковое название (например, `'team'`, `'setting'`, `'customer-service'`).

## Видимость и доступность

У пунктов меню есть дополнительные свойства:

- `visible: boolean`: управляет отображением пункта (по умолчанию `true`).
- `disabled: boolean`: делает пункт неактивным для клика.

---

## Пример полной группы

```typescript
{
  id: 'catalogs',
  title: 'Справочники',
  items: [
    {
      id: 'reference-data',
      icon: 'book',
      label: 'Справочники',
      type: 'submenu',
      submenu: [
        { id: 'ref-platforms', label: 'Платформы', route: '/platforms', icon: 'windows' },
        { id: 'ref-developers', label: 'Разработчики', route: '/developer', icon: 'code' },
      ]
    }
  ]
}
```
