# 🔍 Плагины поиска и замены

## Структура

```
search/
├── search-dialog.plugin.ts    # Плагин "Найти" (Ctrl+F)
└── find-replace.plugin.ts     # Плагин "Найти и заменить" (Ctrl+H)
```

## SearchDialogPlugin

**Файл:** `search-dialog.plugin.ts`

### Описание
Плагин для открытия диалога поиска текста без функции замены.

### Свойства
```typescript
name: 'searchDialog'
title: 'Найти'
icon: '🔍'
shortcut: 'Ctrl+F'
```

### Использование
- Нажмите кнопку 🔍 в тулбаре
- Или используйте горячую клавишу Ctrl+F
- Открывается модальное окно с полем поиска

### Зависимости
- `DialogManagerService` - управление модальными окнами
- `SearchReplaceService` - логика поиска

---

## FindReplacePlugin

**Файл:** `find-replace.plugin.ts`

### Описание
Плагин для открытия диалога поиска и замены текста.

### Свойства
```typescript
name: 'findReplace'
title: 'Найти и заменить'
icon: '🔄'
shortcut: 'Ctrl+H'
```

### Использование
- Нажмите кнопку 🔄 в тулбаре
- Или используйте горячую клавишу Ctrl+H
- Открывается модальное окно с полями поиска и замены

### Зависимости
- `DialogManagerService` - управление модальными окнами
- `SearchReplaceService` - логика поиска и замены

---

## Общая архитектура

### Реализация AuroraPlugin
Оба плагина реализуют интерфейс `AuroraPlugin`:

```typescript
interface AuroraPlugin {
  name: string;           // Уникальное имя плагина
  title: string;          // Отображаемое название
  icon?: string;          // Иконка (эмодзи)
  shortcut?: string;      // Горячая клавиша
  execute(editorElement: HTMLElement): boolean;  // Выполнение
  isActive?(editorElement: HTMLElement): boolean; // Проверка активности
  init?(): void;          // Инициализация
  destroy?(): void;       // Уничтожение
}
```

### Dependency Injection
Используется функция `inject()` для внедрения зависимостей:

```typescript
private platformId = inject(PLATFORM_ID);
private dialogManager = inject(DialogManagerService);
private searchService = inject(SearchReplaceService);
```

### Проверка браузерного окружения
```typescript
private get isBrowser(): boolean {
  return isPlatformBrowser(this.platformId);
}
```

### Метод execute()
```typescript
execute(editorElement: HTMLElement): boolean {
  // 1. Проверка браузерного окружения
  if (!this.isBrowser) return false;

  // 2. Установка элемента контента для поиска
  this.searchService.setContentElement(editorElement);

  // 3. Открытие модального окна
  this.dialogManager.openSearchDialog(showReplace);

  return true;
}
```

---

## Логирование

Оба плагина логируют важные события:

```typescript
// При инициализации
console.log('[SearchDialogPlugin] Initialized');

// При выполнении
console.log('[SearchDialogPlugin] Execute called');

// При проблемах
console.warn('[SearchDialogPlugin] Not running in browser');

// При уничтожении
console.log('[SearchDialogPlugin] Destroyed');
```

---

## Регистрация в Aurora Editor

В файле `aurora-editor.component.ts`:

```typescript
import { SearchDialogPlugin } from '../plugins/search/search-dialog.plugin';
import { FindReplacePlugin } from '../plugins/search/find-replace.plugin';

this.plugins = [
  // ... другие плагины
  new SearchDialogPlugin(),  // Плагин поиска
  new FindReplacePlugin(),   // Плагин поиска и замены
  // ...
];
```

---

## Связанные файлы

- **Сервисы:**
  - [SearchReplaceService](../../services/search-replace.service.ts)
  - [DialogManagerService](../../services/dialog-manager.service.ts)

- **Компоненты:**
  - [SearchDialogComponent](../../components/search-dialog/search-dialog.component.ts)

- **Интерфейсы:**
  - [AuroraPlugin](../aurora-plugin.interface.ts)

---

## Примеры использования

### Программное открытие поиска
```typescript
const searchPlugin = new SearchDialogPlugin();
searchPlugin.execute(editorElement);
```

### Программное открытие замены
```typescript
const replacePlugin = new FindReplacePlugin();
replacePlugin.execute(editorElement);
```

---

## Тестирование

Для тестирования плагинов:

1. Запустите приложение: `npm start`
2. Откройте редактор
3. Нажмите Ctrl+F - должен открыться диалог поиска
4. Нажмите Ctrl+H - должен открыться диалог замены
5. Проверьте логи в консоли браузера

---

## Возможные улучшения

- [ ] Добавить поддержку горячих клавиш F3/Shift+F3 для навигации
- [ ] Добавить анимацию при открытии модального окна
- [ ] Добавить сохранение последнего запроса между сессиями
- [ ] Добавить счётчик использования плагинов
