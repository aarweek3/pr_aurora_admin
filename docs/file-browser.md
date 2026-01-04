# Документация: Серверный Браузер Файлов (Aurora File Browser)

Данный модуль позволяет пользователям просматривать файловую систему сервера, выбирать директории, создавать новые папки и сохранять файлы (SVG) непосредственно на диск сервера.

## 📁 Расположение файлов

### Бэкенд (Project_Server_Auth)

- **Контроллер**: `Controllers/IconsLaboratoryController.cs` (Маршрут: `api/Icons`)
- **Сервис**: `Pages/Icons/Services/IconLaboratoryService.cs` (Логика: `BrowseFileSystemAsync`, `CreateDirectoryAsync`, `SaveIconToDiskAsync`)
- **Интерфейс**: `Pages/Icons/Interfaces/IIconLaboratoryService.cs`
- **Модели**:
  - `Pages/Icons/Models/BulkRenameRequest.cs` (Класс `FileSystemItem`)
  - `Pages/Icons/Models/Icons.cs` (Класс `SaveIconToDiskRequest`)

### Фронтенд (pr_aurora_admin)

- **API Сервис**: `src/app/shared/services/icon-laboratory.service.ts`
- **Конфигурация API**: `src/environments/api-endpoints.ts`
- **UI Компонент (Пример реализации)**: `src/app/pages/tools/icon-manager/icon-manager.component.ts`

---

## 🛠 Реализация Бэкенд (.NET)

### 1. Модель данных

Для передачи структуры файлов используется класс `FileSystemItem`:

```csharp
public class FileSystemItem {
    public string Name { get; set; }      // Имя файла/папки (напр. "Icons")
    public string Path { get; set; }      // Полный путь (напр. "C:/Icons")
    public string Type { get; set; }      // "file", "folder" или "drive"
    public string? Extension { get; set; }
    public long Size { get; set; }
}
```

### 2. Основные методы сервиса

- **`BrowseFileSystemAsync(string path)`**:
  - Если путь пустой -> возвращает список всех логических дисков системы (`DriveInfo.GetDrives()`) с типом `drive`.
  - Если путь указан -> возвращает список папок и SVG-файлов в данной директории.
- **`CreateDirectoryAsync(string path)`**: Создает физическую директорию на диске.
- **`SaveIconToDiskAsync(SaveIconToDiskRequest request)`**: Записывает SVG-контент в файл. Автоматически создает промежуточные папки.

---

## 💻 Реализация Фронтенд (Angular + Signals)

### 1. Состояние (Signals)

Логика построена на реактивных сигналах для мгновенного обновления UI:

- `currentBrowserPath`: Хранит текущий открытый путь.
- `browserItems`: Массив элементов (`FileSystemItem`), полученный с бека.
- `isBrowserLoading`: Индикатор загрузки.
- `isCreatingFolder`: Состояние режима создания папки.

### 2. Основная логика работы

```typescript
// Навигация вглубь
navigateToPath(path: string) {
  this.isBrowserLoading.set(true);
  this.currentBrowserPath.set(path);
  this.iconLabService.browseFileSystem(path).subscribe(items => {
    this.browserItems.set(items);
    this.isBrowserLoading.set(false);
  });
}

// Навигация вверх (Parent Directory)
goUpInBrowser() {
  const current = this.currentBrowserPath();
  // Логика обрезки строки пути до последнего слэша
  // Если корень диска -> переход к списку дисков (пустой путь)
}
```

---

## 🚀 Как подключить в другие компоненты (Пример)

Для интеграции браузера в новый компонент, используйте следующий шаблон:

### 1. TypeScript (Logic)

```typescript
import { Component, signal, inject } from '@angular/core';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';

@Component({ ... })
export class MyComponent {
  private iconLabService = inject(IconLaboratoryService);

  // Состояние браузера
  isBrowserOpen = signal(false);
  currentPath = signal('C:/');
  items = signal<any[]>([]);
  isLoading = signal(false);

  // Результат выбора
  selectedPath = signal('');

  openBrowser() {
    this.isBrowserOpen.set(true);
    this.loadPath(this.selectedPath() || 'C:/');
  }

  loadPath(path: string) {
    this.isLoading.set(true);
    this.currentPath.set(path);
    this.iconLabService.browseFileSystem(path).subscribe(res => {
      this.items.set(res);
      this.isLoading.set(false);
    });
  }

  onSelect(path: string) {
    this.selectedPath.set(path); // Получаем путь
    this.isBrowserOpen.set(false); // Закрываем
    console.log('Выбранный путь:', path);
  }
}
```

### 2. HTML (Template)

```html
<!-- Кнопка вызова -->
<div style="display: flex; gap: 8px;">
  <input nz-input [value]="selectedPath()" readonly placeholder="Путь не выбран" />
  <button nz-button (click)="openBrowser()">Обзор...</button>
</div>

<!-- Модальное окно -->
<nz-modal [(nzVisible)]="isBrowserOpen" nzTitle="Выберите папку" (nzOnCancel)="isBrowserOpen.set(false)">
  <div *nzModalContent>
    <!-- Заголовок с навигацией -->
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <button nz-button (click)="loadPath('')">Диски</button>
      <input nz-input [value]="currentPath()" readonly />
    </div>

    <!-- Список файлов -->
    <div style="height: 300px; overflow: auto; border: 1px solid #ddd;">
      <div *ngFor="let item of items()" (click)="item.type !== 'file' ? loadPath(item.path) : null" style="padding: 8px; cursor: pointer; border-bottom: 1px solid #eee;">
        <span>{{ item.type === 'folder' ? '📁' : '📄' }} {{ item.name }}</span>
        <button *ngIf="item.type !== 'file'" nz-button nzType="link" (click)="$event.stopPropagation(); onSelect(item.path)">Выбрать</button>
      </div>
    </div>
  </div>
</nz-modal>
```

### 3. Стилизация

Для полноценного вида (как в Icon Manager) скопируйте стили `.browser-item` и `.items-grid` из оригинального компонента. Они обеспечивают отступы, сетку и эффекты наведения.
