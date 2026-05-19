# Окно мониторинга (Monitor Window)

Универсальный shared-компонент для отображения данных мониторинга, отладки и технической информации. Построен на базе **Ng-Zorro** и может быть вызван из любого места приложения через сервис.

## Основные возможности

- **Построчный вывод данных**: Отображение пар `name: value` с возможностью индивидуального копирования.
- **Мониторинг изображений**: Специальный блок с предпросмотром картинки (на фоне-шахматке) и сопутствующим JSON.
- **Копирование в буфер**:
  - Кнопка "Копировать всё" (собирает все данные в один текстовый блок).
  - Кнопка копирования для каждой строки.
- **Управление окном**:
  - **Draggable**: Окно можно перетаскивать за шапку.
  - **Fullscreen**: Кнопка разворачивания на весь экран.
  - **Resizable**: Стандартное поведение Zorro модалки с кастомной обработкой ширины.

---

## Использование через сервис

Для вызова окна используйте `AvMonitorService`.

```typescript
import { AvMonitorService } from '@shared/ui';

constructor(private monitor: AvMonitorService) {}

showStats() {
  this.monitor.show({
    title: 'Статистика обработки',
    data: [
      { name: 'Server', value: 'Production-01', description: 'ID сервера' },
      { name: 'Latency', value: '45ms' },
      { name: 'Status', value: 'Success' }
    ]
  });
}
```

---

## Мониторинг изображений

Если нужно проконтролировать параметры изображения, передайте `imageUrl` и `imageJson`.

```typescript
this.monitor.show({
  title: "Контроль картинки",
  imageUrl: "https://example.com/image.jpg",
  imageJson: {
    width: 800,
    height: 600,
    size: "1.2MB",
    format: "jpeg",
  },
  data: [{ name: "Action", value: "Resize & Crop" }],
});
```

---

## Интерфейс конфигурации (AvMonitorConfig)

| Свойство    | Тип                | Описание                                        |
| :---------- | :----------------- | :---------------------------------------------- |
| `title`     | `string`           | Заголовок окна                                  |
| `data`      | `AvMonitorEntry[]` | Массив строк `name/value`                       |
| `jsonData`  | `any`              | Любой объект для вывода в виде JSON блока внизу |
| `imageUrl`  | `string`           | URL для предпросмотра изображения               |
| `imageJson` | `any`              | JSON данные, специфичные для изображения        |
| `width`     | `string \| number` | Кастомная ширина окна (по умолчанию 800px)      |
| `draggable` | `boolean`          | Разрешить перетаскивание (по умолчанию true)    |

### AvMonitorEntry

```typescript
{
  name: string;        // Название параметра
  value: any;          // Значение
  description?: string; // Опциональный серый текст в скобках
}
```

---

## Расположение файлов

- **Модели**: `src/app/shared/components/ui/monitor-modal/models/monitor-modal.model.ts`
- **Сервис**: `src/app/shared/components/ui/monitor-modal/services/monitor.service.ts`
- **Компонент**: `src/app/shared/components/ui/monitor-modal/`
