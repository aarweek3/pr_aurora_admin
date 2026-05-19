# Чек-лист реализации компонента управления скриншотами
## Разработано на основе `screenshot_architecture_plan1.md`

Чек-лист разделен на два этапа: **Бэкенд** и **Фронтенд**. Каждый этап содержит пошаговые атомарные задачи для поочередного выполнения и тестирования.

---

## ЭТАП 1: BACKEND (C# / .NET Core / EF Core)

### Шаг 1.0: Модель данных и миграция базы данных (DAL)
- [x] **Модифицировать сущность `ScreenshotOfAggregator.cs`**
  - Добавить `public string? TempGuid { get; set; }` с атрибутом `[MaxLength(36)]`.
- [x] **Настроить индекс во Fluent API конфигурации (`ScreenshotOfAggregatorConfiguration.cs`)**
  - Задать индекс: `builder.HasIndex(x => x.TempGuid).HasDatabaseName("IX_ScreenshotsOfAggregator_TempGuid");`.
- [x] **Сгенерировать EF-миграцию через PMC/CLI**
  - `dotnet ef migrations add AddTempGuidToScreenshot --project DAL --startup-project Project_Server_Auth`
- [x] **Применить миграцию к базе данных**
  - `dotnet ef database update --project Project_Server_Auth`

### Шаг 7.1: Структура папок и пустые DTO/классы
- [x] **Создать закрытую папку компонента**
  - Путь: `Project_Server_Auth/Pages/AGGREGATOR/ScreenshotOfAggregator/`
- [x] **Создать поддиректории**: `Dtos/`, `Interfaces/`, `Services/`, `Mappings/`, `Validators/`, `Helpers/` (или использовать глобальный `Helpers/`), `Workers/`, `Jsons/`
- [x] **Создать пустой файл-заглушку `Jsons/ScreenshotOfAggregator.json`** (`[]`)

### Шаг 7.2: Описание DTO и AutoMapper Профиля
- [x] **Реализовать все CRUD-DTO в `Dtos/ScreenshotOfAggregatorDto.cs`**:
  - `ScreenshotOfAggregatorLocalizationDto` (Title, AltText).
  - `ScreenshotOfAggregatorItemDto` (Id, FilePath, SortOrder, LanguageOfAggregatorId, TempGuid).
  - `ScreenshotOfAggregatorDetailDto` (Id, FilePath, SortOrder, LanguageOfAggregatorId, Localizations).
  - `ScreenshotOfAggregatorCreateDto` (ProgramOfAggregatorId, FilePath, SortOrder, LanguageOfAggregatorId, TempGuid).
  - `ScreenshotOfAggregatorUpdateDto` (наследует CreateDto + Id).
  - `ScreenshotOfAggregatorPageRequestDto` / `ScreenshotOfAggregatorPagedResponseDto` / `ScreenshotOfAggregatorSortField`.
- [x] **Реализовать `ScreenshotOfAggregatorSyncDto`** (без `TempGuid` для синхронизации).
- [x] **Реализовать DTO загрузки**:
  - `ScreenshotUploadFormRequest` (IFormFile, ProgramSlug, TempGuid, LanguageOfAggregatorId).
  - `ScreenshotUploadResponseDto` (FileName, RelativePath, ThumbnailPath, Size, Width, Height).
- [x] **Написать AutoMapper маппинг в `Mappings/ScreenshotOfAggregatorProfile.cs`**
  - Зарегистрировать маппинг `ScreenshotOfAggregatorSyncDto` ➡️ `ScreenshotOfAggregator` с явным переносом `FilePath`, `SortOrder`, `LanguageOfAggregatorId` и `Localizations`.

### Шаг 7.3: Хелпер AspectRatioValidator и Валидаторы
- [x] **Реализовать статический `Helpers/AspectRatioValidator.cs`**
  - Проверка `width <= 0 || height <= 0` с возвратом ошибки.
  - Математический расчет ближайшего формата (16:9, 16:10, 4:3).
  - Проверка допуска погрешности `Tolerance = 0.04` (±4%).
  - Формирование диагностического сообщения с процентом отклонения.
- [x] **Создать FluentValidation валидатор `Validators/ScreenshotOfAggregatorValidators.cs`**
  - Проверка MIME-типа картинки и лимита размера (до 10 МБ).

### Шаг 7.4: Реализация бизнес-логики сервиса (`ScreenshotOfAggregatorService.cs`)
- [x] **Создать интерфейс `IScreenshotOfAggregatorService.cs`**
  - Прописать все сигнатуры (CRUD, Upload, Move, Sync).
  - Метод `DeleteAsync(int id)` должен возвращать `Task<bool>`.
- [x] **Метод `UploadScreenshotAsync`**:
  - Чтение стрима картинки, `Image.IdentifyAsync` для получения габаритов, AspectRatio-валидация.
  - Генерация имени `{timestamp}_{suffix}.webp` с 6-значным хэшем GUID.
  - Сжатие в WebP (качество 82-85%), запись оригинала и миниатюры высотой `160px` во вложенную `/thumbnails/`.
- [x] **Метод `MoveTempScreenshotsToFinalDestinationAsync`**:
  - Выборка записей по `TempGuid` из БД **до** открытия транзакции и **до** `Directory.Move`.
  - Открытие транзакции, перемещение папки, обновление `FilePath` и сброс `TempGuid` в null.
  - Безопасный nested `try-catch` в секции `catch` для отката папки на диске без маскирования исходного SQL-исключения.
- [x] **Метод `SyncScreenshotsAsync`**:
  - Вызов `.ToList()` для материализации `incoming` на старте метода.
  - Алгоритм `HashSet` O(N+M) для точного нахождения удаляемых скриншотов.
  - Физическое удаление файлов с диска и принудительный **Hard Delete** записей из БД (`EntityState.Deleted`).
  - Добавление новых (`Id == 0`) скриншотов с AutoMapper и обновление сортировки/языка у существующих.
- [x] **CRUD методы**:
  - Стандартная реализация пагинации, получения, обновления.
  - Метод `DeleteAsync` возвращает `true` при успешном удалении, или `false` если запись не найдена.

### Шаг 7.5: Контроллер API (`ProgramScreenshotController.cs`)
- [x] **Создать контроллер `ProgramScreenshotController.cs`**
  - Атрибуты маршрутизации `api/v1/aggregator/programs/screenshots`.
  - Эндпоинт `POST upload` (`[FromForm]`, перехват `FluentValidation.ValidationException` ➡️ `BadRequest(valEx.Message)`).
  - Эндпоинт `DELETE {id:int}` (вызов `DeleteAsync`, возврат `204 NoContent` при true, или `404 NotFound` при false).
  - Эндпоинт `POST sync/{programId:int}` (`[FromBody]`, вызов `SyncScreenshotsAsync` ➡️ `204 NoContent`).

### Шаг 7.6: Фоновый воркер очистки (`OrphanedScreenshotCleanupWorker.cs`)
- [x] **Реализовать `OrphanedScreenshotCleanupWorker.cs`**
  - Регистрация как `BackgroundService` (Singleton).
  - Внедрение `IServiceScopeFactory` для создания Scope.
  - Создание Scope один раз на весь метод `CleanupAsync` (до цикла `foreach`).
  - Сканирование папки `/temp/` старше 25 часов.
  - Физическое удаление папки с обработкой ошибок.
  - Поиск сирот в БД по `TempGuid` и физическое удаление (`EntityState.Deleted`).
  - Вызов `SaveChangesAsync()` атомарно для каждого успешного удаления папки.

### Шаг 7.7: Регистрация и Компиляция бэкенда
- [x] **Зарегистрировать сервисы в `Program.cs`**
  - `IScreenshotOfAggregatorService` ➡️ `ScreenshotOfAggregatorService` (Scoped).
  - `OrphanedScreenshotCleanupWorker` (HostedService).
- [x] **Запустить тестовую сборку проекта**
  - `dotnet build` в корне `pr_srv_names`.

---

## ЭТАП 2: FRONTEND (Angular / Aurora Control)

### Шаг 7.8: Инфраструктурные элементы фронтенда
- [ ] **Создать модель `ScreenshotOfAggregator`**
  - Путь: `src/app/core/models/screenshot-of-aggregator.model.ts` (или аналогичный).
- [ ] **Реализовать утилиту `processInBatches` с `Promise.allSettled`**
  - Путь: `src/app/shared/utils/upload-queue.util.ts`
  - Пакетная отправка запросов по `concurrency = 3` с сохранением независимости ошибок.
- [ ] **Создать `ProgramScreenshotApiService`**
  - Метод `uploadScreenshot` с отправкой `FormData` (файл, tempGuid, languageId).

### Шаг 7.9: UI-Компонент `ProgramScreenshotManagerComponent`
- [ ] **Создать структуру компонента**
  - Путь: `src/app/AGREGATOR/PAGES/SPRAVKA/ProgramOfAggregatorPage/components/program-screenshot-manager/`
- [ ] **Реализовать NZ-Tabset по языкам**:
  - Генерация вкладок из `@Input() languages`. Логика дефолтной вкладки.
  - Показ плейсхолдера, если в выбранной вкладке нет скриншотов.
- [ ] **Интегрировать скрытый `<input type="file" multiple>`**:
  - Фильтрация картинок, вызов `processInBatches` с батч-лимитом = 3.
  - Рендеринг временных карточек с лоадером (`loading = true`) на время отправки запросов.
  - Добавление скриншота в массив по факту успешного ответа сервера, вызов `emitUpdatedList()`.
- [ ] **Сетка скриншотов и таблица управления**:
  - Вывод скриншотов с сортировкой.
  - Отображение превью через хелпер `getThumbnailUrl` (автоматическая замена пути на `/thumbnails/`).
  - Стрелки сортировки ▲▼ (изменение `sortOrder` внутри текущего таба).
  - Кнопка удаления скриншота (через локальный `nz-popconfirm`, **только локально в массиве** фронтенда).
- [ ] **Интегрировать Lightbox просмотр**:
  - Клик по превью открывает `nz-modal` с картинкой оригинального размера и размытым фоном (`backdrop-filter: blur(8px)`).

### Шаг 7.10: Интеграция в форму программы (`ProgramFormComponent`)
- [ ] **Подключить менеджер в `ProgramFormComponent`**:
  - Добавить `ProgramScreenshotManagerComponent` в `imports` формы.
- [ ] **Добавить поле в FormGroup**:
  - Инициализировать поле `screenshots: [[]]` в `FbForm`.
- [ ] **Обработка данных**:
  - В методе загрузки данных патчить форму: `screenshots: data.screenshots || []`.
  - Навесить обработчик `@Output() onScreenshotsChange` для синхронизации массива, выставления `markAsDirty()` и отметки изменений формы.
- [ ] **Шаблон формы**:
  - Разместить `<app-program-screenshot-manager [screenshots]="form.get('screenshots')?.value" [languages]="languages" (onScreenshotsChange)="..."></app-program-screenshot-manager>`.
- [ ] **Отправка данных (Сохранение)**:
  - При сабмите формы, после успешного сохранения карточки программы, вызвать метод API `syncScreenshots(programId, screenshots)` для выполнения финального diff.
