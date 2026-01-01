# Console Log Viewer Component

## Описание

Компонент `ConsoleLogViewerComponent` перехватывает все вызовы `console.log`, `console.info`, `console.warn` и `console.error` и отображает их в удобной панели под редактором.

## Возможности

- ✅ **Перехват логов**: Автоматически перехватывает все console методы
- ✅ **Типизированные логи**: Различные стили для log, info, warn, error
- ✅ **Копирование**: Кнопка для копирования всех логов или отдельного сообщения
- ✅ **Очистка**: Кнопка очистки всех логов
- ✅ **Сворачивание**: Возможность свернуть/развернуть панель
- ✅ **Автоскролл**: Автоматическая прокрутка к последнему сообщению
- ✅ **Лимит логов**: Максимум 100 логов (настраивается)
- ✅ **Время**: Отображение точного времени каждого лога (с миллисекундами)
- ✅ **Форматирование**: Красивое отображение объектов (JSON.stringify)

## Использование

### Импорт

```typescript
import { ConsoleLogViewerComponent } from './editor/components/console-log-viewer/console-log-viewer.component';

@Component({
  // ...
  imports: [ConsoleLogViewerComponent],
})
export class AppComponent {}
```

### В шаблоне

```html
<aurora-editor [formControl]="editorControl"></aurora-editor>
<app-console-log-viewer></app-console-log-viewer>
```

## Структура

### TypeScript файл

```typescript
interface LogEntry {
  timestamp: Date; // Время лога
  message: string; // Форматированное сообщение
  type: 'log' | 'info' | 'warn' | 'error'; // Тип лога
  args: any[]; // Оригинальные аргументы
}
```

### Методы компонента

- `copyToClipboard()` - Копирует все логи в буфер обмена
- `copyLog(log: LogEntry)` - Копирует один лог
- `clearLogs()` - Очищает все логи
- `toggleExpanded()` - Сворачивает/разворачивает панель

## Стили логов

### Log (обычный)

```
Синяя метка, стандартный фон
```

### Info (информация)

```
Синяя граница слева, синяя метка
```

### Warn (предупреждение)

```
Оранжевая граница слева, жёлтый фон, оранжевый текст
```

### Error (ошибка)

```
Красная граница слева, красный фон, красный текст
```

## Примеры

### Простой лог

```typescript
console.log('Hello, World!');
```

Вывод:

```
[14:23:45.123] [LOG] Hello, World!
```

### Лог с объектом

```typescript
console.log('User data:', { name: 'John', age: 30 });
```

Вывод:

```
[14:23:45.456] [LOG] User data: {
  "name": "John",
  "age": 30
}
```

### Предупреждение

```typescript
console.warn('This is a warning!');
```

Вывод (с оранжевым фоном):

```
[14:23:45.789] [WARN] This is a warning!
```

### Ошибка

```typescript
console.error('Something went wrong!', new Error('Details'));
```

Вывод (с красным фоном):

```
[14:23:46.012] [ERROR] Something went wrong! Error: Details
```

## Настройки

### Максимальное количество логов

По умолчанию: 100

```typescript
export class ConsoleLogViewerComponent {
  maxLogs = 100; // Изменить на нужное значение
}
```

### Высота панели

По умолчанию: 400px

В `console-log-viewer.component.scss`:

```scss
.console-log-viewer-content {
  max-height: 400px; // Изменить на нужное значение
}
```

## Lifecycle

### Инициализация (ngOnInit)

При инициализации компонент перехватывает методы console:

```typescript
ngOnInit(): void {
  this.interceptConsoleMethods();
}
```

### Уничтожение (ngOnDestroy)

При уничтожении компонент восстанавливает оригинальные методы:

```typescript
ngOnDestroy(): void {
  this.restoreConsoleMethods();
}
```

Это важно, чтобы избежать утечек памяти и конфликтов.

## Копирование в буфер

### Все логи

Формат копирования:

```
[14:23:45.123] [LOG] First message
[14:23:45.456] [INFO] Second message
[14:23:45.789] [WARN] Third message
```

### Один лог

Формат:

```
[14:23:45.123] [LOG] Message content
```

## Responsive дизайн

На мобильных устройствах (< 768px):

- Заголовок панели вертикальный
- Кнопки на всю ширину
- Метаданные лога горизонтальные
- Кнопка копирования всегда видна

## Интеграция с редактором

Компонент отлично подходит для отладки редактора:

```typescript
// В плагине или компоненте редактора
console.log('[Plugin] Bold executed');
console.info('[Selection] Range saved:', range);
console.warn('[Sanitize] Removed dangerous tag');
console.error('[Editor] Failed to paste:', error);
```

Все эти логи будут автоматически отображаться в панели под редактором.

## Производительность

- **Лимит логов**: Автоматически удаляет старые логи при превышении лимита
- **Виртуальный скролл**: Не используется (оптимизация для будущего)
- **Ленивая загрузка**: Компонент standalone, загружается по требованию

## Кастомизация

### Изменение цветов

В `console-log-viewer.component.scss`:

```scss
.console-log-entry-warn {
  border-left-color: #your-color; // Цвет границы
  background: #your-bg; // Цвет фона
}
```

### Добавление новых типов логов

1. Расширить interface:

```typescript
type: 'log' | 'info' | 'warn' | 'error' | 'debug' | 'trace';
```

2. Перехватить новые методы:

```typescript
console.debug = (...args: any[]) => {
  this.addLog('debug', args);
  this.originalConsoleDebug.apply(console, args);
};
```

3. Добавить стили:

```scss
.console-log-entry-debug {
  border-left: 3px solid #9c27b0;
  // ...
}
```

## Troubleshooting

### Логи не отображаются

1. Убедитесь, что компонент добавлен в imports
2. Проверьте, что компонент присутствует в шаблоне
3. Проверьте консоль браузера на наличие ошибок

### Копирование не работает

1. Проверьте, что браузер поддерживает Clipboard API
2. Убедитесь, что сайт использует HTTPS (или localhost)
3. Проверьте права доступа к clipboard

### Компонент не сворачивается

1. Проверьте CSS класс `.collapsed`
2. Убедитесь, что `isExpanded` изменяется
3. Проверьте Angular change detection

## Будущие улучшения

- [ ] Фильтрация по типу логов
- [ ] Поиск по логам
- [ ] Экспорт логов в файл
- [ ] Виртуальный скролл для большого количества логов
- [ ] Группировка похожих логов
- [ ] Stack trace для ошибок
- [ ] Подсветка синтаксиса для объектов
- [ ] Разворачивание/сворачивание объектов

## Лицензия

Часть проекта Aurora Editor
