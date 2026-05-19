# Архитектурный план: Компонент управления скриншотами
## Шаг 7 — Финальная версия (с учётом всех итераций, архревью и логических защит)

**Проекты:**
* `pr_srv_names` (Backend .NET)
* `Aurora Control` (Frontend Angular)

**Статус документа:** Финальная редакция. Все замечания архитектурного ревью, логические и многопоточные нюансы полностью устранены. Готово к реализации.

---

## 0. Итоговая таблица принятых решений

| # | Проблема | Решение | Где |
|---|---|---|---|
| **1** | Логика SyncScreenshotsAsync сломана | Использование `HashSet` входящих ID для выборки удаляемых скриншотов за линейное время $O(N+M)$. | `ScreenshotOfAggregatorService` |
| **2** | Гонка чтений внутри транзакции при Move | Чтение записей БД по `TempGuid` вынесено **до** открытия транзакции и **до** `Directory.Move`. | `ScreenshotOfAggregatorService` |
| **3** | Расточительное создание Scope в цикле воркера | `CreateScope()` вынесен из цикла. Scope создается один раз на весь метод `CleanupAsync`, а БД сохраняется атомарно. | `OrphanedScreenshotCleanupWorker` |
| **4** | Коллизия имен при batch-загрузках | Имена генерируются как `{timestamp}_{suffix}.webp`, где `suffix` — 6-символьный хэш GUID. | `ScreenshotOfAggregatorService` |
| **5** | Двойной запрос к БД при DELETE | Сигнатура `DeleteAsync` возвращает `bool`. Проверка существования и удаление происходят за один запрос. | Контроллер + Сервис |
| **6** | TempGuid в CreateDto при синхронизации | Создан чистый `ScreenshotOfAggregatorSyncDto` без поля `TempGuid` для разделения ответственности. | `ScreenshotOfAggregatorDto` |
| **7** | Promise.all прерывает батч при одной ошибке | В утилите `processInBatches` используется `Promise.allSettled`, позволяя обрабатывать файлы точечно. | `upload-queue.util.ts` |
| **8** | Двойное перечисление IEnumerable (Sync) | `incoming` материализуется через `.ToList()` на старте `SyncScreenshotsAsync` во избежание race conditions. | `ScreenshotOfAggregatorService` |
| **9** | Неверный неймспейс ValidationException | Контроллер ловит специфичный `FluentValidation.ValidationException` для корректного возврата 400 Bad Request. | `ProgramScreenshotController` |

---

## 1. Структура папок и файлов (Бэкенд)

Новый компонент является закрытым и размещается по пути:
[Project_Server_Auth/Pages/AGGREGATOR/ScreenshotOfAggregator/](file:///d:/_PROGECT/pr_srv_names/Project_Server_Auth/Pages/AGGREGATOR/ScreenshotOfAggregator)

| Файл | Назначение |
|---|---|
| **`Dtos/ScreenshotOfAggregatorDto.cs`** | Все DTO: CRUD + `ScreenshotOfAggregatorSyncDto` + multipart-загрузка |
| **`Interfaces/IScreenshotOfAggregatorService.cs`** | Контракт сервиса: CRUD + медиа-процессинг + `SyncScreenshotsAsync` |
| **`Services/ScreenshotOfAggregatorService.cs`** | Реализация: БД, ImageSharp, AspectRatio, SyncScreenshotsAsync |
| **`Mappings/ScreenshotOfAggregatorProfile.cs`** | AutoMapper профили (включая маппинг `ScreenshotOfAggregatorSyncDto`) |
| **`Validators/ScreenshotOfAggregatorValidators.cs`** | FluentValidation: CRUD + `ScreenshotUploadFormRequestValidator` |
| **`Helpers/AspectRatioValidator.cs`** | Статический хелпер проверки соотношения сторон с диагностикой отклонения |
| **`Workers/OrphanedScreenshotCleanupWorker.cs`** | `IHostedService` — фоновая очистка `/temp/` и осиротевших записей БД |
| **`Jsons/ScreenshotOfAggregator.json`** | Пустой файл-заполнитель для сидинга |
| **`Controllers/ProgramScreenshotController.cs`** | HTTP-эндпоинты: upload, delete, sync |

---

## 2. DTO-модели (ScreenshotOfAggregatorDto.cs)

### 2.1. Стандартные CRUD-DTO
* `ScreenshotOfAggregatorLocalizationDto` — локализация скриншота (Title, AltText).
* `ScreenshotOfAggregatorItemDto` — краткая модель для списков (Id, FilePath, SortOrder, LanguageOfAggregatorId, TempGuid).
* `ScreenshotOfAggregatorDetailDto` — полная модель с коллекцией локализаций.
* `ScreenshotOfAggregatorCreateDto` — создание (ProgramOfAggregatorId, FilePath, SortOrder, LanguageOfAggregatorId, TempGuid).
* `ScreenshotOfAggregatorUpdateDto` — обновление (наследует CreateDto + Id).
* `ScreenshotOfAggregatorPageRequestDto` / `ScreenshotOfAggregatorPagedResponseDto` — пагинация.
* `ScreenshotOfAggregatorSortField` — enum (Id, SortOrder, CreatedAt).

### 2.2. DTO синхронизации (ScreenshotOfAggregatorSyncDto)
```csharp
public class ScreenshotOfAggregatorSyncDto
{
    public int Id { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int LanguageOfAggregatorId { get; set; }
    public ICollection<ScreenshotOfAggregatorLocalizationDto> Localizations { get; set; } = new List<ScreenshotOfAggregatorLocalizationDto>();
}
```

### 2.3. DTO загрузки файла (multipart/form-data)
**`ScreenshotUploadFormRequest`**:
```csharp
public class ScreenshotUploadFormRequest
{
    public Microsoft.AspNetCore.Http.IFormFile File { get; set; } = null!;
    public string? ProgramSlug { get; set; }
    public string? TempGuid { get; set; }
    public int? LanguageOfAggregatorId { get; set; }
}
```

**`ScreenshotUploadResponseDto`**:
```csharp
public class ScreenshotUploadResponseDto
{
    public string FileName { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public string ThumbnailPath { get; set; } = string.Empty;
    public long Size { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}
```

### 2.4. AutoMapper маппинги (ScreenshotOfAggregatorProfile.cs)
Для синхронизации сущностей AutoMapper должен корректно маппить SyncDto в постоянную сущность `ScreenshotOfAggregator`, включая физический путь `FilePath`:
```csharp
public class ScreenshotOfAggregatorProfile : Profile
{
    public ScreenshotOfAggregatorProfile()
    {
        CreateMap<ScreenshotOfAggregatorSyncDto, ScreenshotOfAggregator>()
            .ForMember(dest => dest.FilePath, opt => opt.MapFrom(src => src.FilePath))
            .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder))
            .ForMember(dest => dest.LanguageOfAggregatorId, opt => opt.MapFrom(src => src.LanguageOfAggregatorId))
            .ForMember(dest => dest.Localizations, opt => opt.MapFrom(src => src.Localizations));

        CreateMap<ScreenshotOfAggregatorLocalizationDto, ScreenshotOfAggregatorLocalization>();
    }
}
```

---

## 3. Интерфейс сервиса (IScreenshotOfAggregatorService.cs)

```csharp
namespace pr_srv_names.Pages.AGGREGATOR.ScreenshotOfAggregator.Interfaces
{
    public interface IScreenshotOfAggregatorService
    {
        // CRUD
        Task<ScreenshotOfAggregatorPagedResponseDto> GetPagedAsync(ScreenshotOfAggregatorPageRequestDto request);
        Task<ScreenshotOfAggregatorDetailDto?> GetByIdAsync(int id);
        Task<ScreenshotOfAggregatorDetailDto> CreateAsync(ScreenshotOfAggregatorCreateDto dto);
        Task<ScreenshotOfAggregatorDetailDto> UpdateAsync(ScreenshotOfAggregatorUpdateDto dto);
        Task<bool> DeleteAsync(int id); // Возвращает true, если сущность удалена
        Task HardDeleteAsync(int id);
        Task RestoreAsync(int id);
        Task<int> ClearAllAsync();

        // Медиа-процессинг
        Task<ScreenshotUploadResponseDto> UploadScreenshotAsync(ScreenshotUploadFormRequest request);
        Task MoveTempScreenshotsToFinalDestinationAsync(string tempGuid, string programSlug);

        // Синхронизация (Diff-логика)
        Task SyncScreenshotsAsync(int programId, IEnumerable<ScreenshotOfAggregatorSyncDto> incoming);
    }
}
```

---

## 4. Реализация сервиса (ScreenshotOfAggregatorService.cs)

### 4.1. Загрузка изображения (UploadScreenshotAsync)
1. Открываем стрим через `request.File.OpenReadStream()`.
2. `Image.IdentifyAsync` считывает габариты изображения без полного декодирования пикселей в память.
3. Проверяем соотношение сторон через `AspectRatioValidator.Validate(width, height)`. При ошибке выбрасываем `ValidationException`.
4. **Генерация уникального имени с защитой от коллизий**: оригинальное имя файла отбрасывается. Новое имя формируется строго на сервере:
   ```csharp
   private string GenerateFileName()
   {
       var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
       var suffix = Guid.NewGuid().ToString("N")[..6]; // 6 уникальных символов исключают коллизии при параллельных batch-загрузках
       var ext = ".webp";
       return $"{timestamp}_{suffix}{ext}";
   }
   ```
5. Файл пережимается в WebP (качество 82-85%) через `SixLabors.ImageSharp` и сохраняется на диск под сгенерированным именем.
6. В ту же папку создается уменьшенная миниатюра высотой `160px` во вложенную директорию `/thumbnails/` под тем же именем `{timestamp}_{suffix}.webp`.
7. Возвращается `ScreenshotUploadResponseDto`.

### 4.2. Перемещение временных файлов (MoveTempScreenshotsToFinalDestinationAsync)
Чтение данных вынесено **до** транзакции и **до** физического `Directory.Move` во избежание блокировок и race conditions при многопоточных сохранениях. При падении БД выполняется безопасный откат ФС:

```csharp
public async Task MoveTempScreenshotsToFinalDestinationAsync(string tempGuid, string programSlug)
{
    var tempBase = $"uploads/programs/screenshots/temp/{tempGuid}";
    var firstLetter = programSlug[0].ToString().ToLower();
    var finalBase = $"uploads/programs/screenshots/{firstLetter}/{programSlug}";

    var tempPath = Path.Combine(_wwwroot, tempBase);
    var finalPath = Path.Combine(_wwwroot, finalBase);

    // 1. Читаем записи до открытия транзакции и до манипуляций с ФС
    var screenshots = await _db.ScreenshotsOfAggregator
        .Where(s => s.TempGuid == tempGuid)
        .ToListAsync();

    if (!screenshots.Any()) return;

    await using var transaction = await _db.Database.BeginTransactionAsync();
    try
    {
        // 2. Физическое перемещение атомарно на уровне ФС
        if (Directory.Exists(tempPath))
        {
            var finalParent = Directory.GetParent(finalPath).FullName;
            if (!Directory.Exists(finalParent))
                Directory.CreateDirectory(finalParent);
                
            Directory.Move(tempPath, finalPath);
        }

        // 3. Обновляем записи в БД
        foreach (var s in screenshots)
        {
            s.FilePath = s.FilePath.Replace(tempBase, finalBase);
            s.TempGuid = null; // Сбрасываем метку черновика
        }
        await _db.SaveChangesAsync();

        // 4. Коммитим транзакцию
        await transaction.CommitAsync();
    }
    catch (Exception ex)
    {
        // 5. Безопасный откат диска в исходное состояние при падении БД
        try
        {
            if (Directory.Exists(finalPath) && !Directory.Exists(tempPath))
                Directory.Move(finalPath, tempPath);
        }
        catch (Exception fsEx)
        {
            _logger.LogError(fsEx, "Критический сбой отката файловой системы при ошибке БД в MoveTempScreenshots");
        }
        
        throw; // Пробрасываем исходное исключение базы данных
    }
}
```

### 4.3. Синхронизация скриншотов (SyncScreenshotsAsync)
> [!IMPORTANT]
> Для предотвращения многократного перечисления `IEnumerable` (Multiple Enumeration) и потенциально пустых проходов в зависимости от сериализатора ASP.NET Core, коллекция `incoming` материализуется в список `incomingList` одной строкой на самом старте метода.

```csharp
public async Task SyncScreenshotsAsync(int programId, IEnumerable<ScreenshotOfAggregatorSyncDto> incoming)
{
    // Материализуем IEnumerable в List один раз
    var incomingList = incoming.ToList();

    // Найти существующие записи в БД
    var existing = await _db.ScreenshotsOfAggregator
        .Where(s => s.ProgramOfAggregatorId == programId)
        .ToListAsync();

    // Быстрый хэшсет входящих ID скриншотов (игнорируя новые с Id == 0)
    var incomingIds = incomingList
        .Where(i => i.Id != 0)
        .Select(i => i.Id)
        .ToHashSet();

    // Выбираем только те, которых реально больше нет во входящих
    var toDelete = existing
        .Where(e => !incomingIds.Contains(e.Id))
        .ToList();

    foreach (var s in toDelete)
    {
        DeleteFileAndThumbnail(s.FilePath);
        
        // Физическое удаление записи из БД (Hard Delete)
        _db.Entry(s).State = EntityState.Deleted; 
    }

    // Создать новые (id == 0), обновить существующие (sortOrder, languageId)
    foreach (var dto in incomingList)
    {
        if (dto.Id == 0)
        {
            var newScreenshot = _mapper.Map<ScreenshotOfAggregator>(dto);
            newScreenshot.ProgramOfAggregatorId = programId;
            await _db.ScreenshotsOfAggregator.AddAsync(newScreenshot);
        }
        else
        {
            var current = existing.FirstOrDefault(e => e.Id == dto.Id);
            if (current != null)
            {
                current.SortOrder = dto.SortOrder;
                current.LanguageOfAggregatorId = dto.LanguageOfAggregatorId;
            }
        }
    }

    await _db.SaveChangesAsync();
}
```

---

## 5. Хелперы и валидаторы

### 5.1. AspectRatioValidator.cs (Helpers/)
Разрешенные соотношения: 16:9, 16:10, 4:3. Допуск погрешности равен **`Tolerance = 0.04` (±4%)**.
Добавлена строгая проверка размеров на `width <= 0` и `height <= 0` для защиты от деления на ноль.

```csharp
public static class AspectRatioValidator
{
    private static readonly (int w, int h, string label)[] AllowedRatios =
    [
        (16, 9,  "16:9"),
        (16, 10, "16:10"),
        (4,  3,  "4:3")
    ];
    private const double Tolerance = 0.04; // ±4%

    public static string? Validate(int width, int height)
    {
        if (width <= 0 || height <= 0)
            return "Недопустимые размеры изображения (высота и ширина должны быть больше 0).";

        double actual = (double)width / height;

        var closest = AllowedRatios
            .OrderBy(r => Math.Abs(actual - (double)r.w / r.h))
            .First();

        double delta = Math.Abs(actual - (double)closest.w / closest.h);
        if (delta <= Tolerance) return null;

        double deltaPercent = Math.Round(delta / ((double)closest.w / closest.h) * 100, 1);

        return $"Изображение {width}×{height} не подходит. " +
               $"Ближайший допустимый формат: {closest.label} " +
               $"(отклонение {deltaPercent}%, допустимо ≤4%). " +
               $"Допустимые форматы: 16:9, 16:10, 4:3.";
    }
}
```

---

## 6. Контроллер (ProgramScreenshotController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;
using pr_srv_names.Pages.AGGREGATOR.ScreenshotOfAggregator.Interfaces;
using pr_srv_names.Pages.AGGREGATOR.ScreenshotOfAggregator.Dtos;

namespace pr_srv_names.Controllers
{
    [ApiController]
    [Route("api/v1/aggregator/programs/screenshots")]
    public class ProgramScreenshotController : ControllerBase
    {
        private readonly IScreenshotOfAggregatorService _service;

        public ProgramScreenshotController(IScreenshotOfAggregatorService service)
        {
            _service = service;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ScreenshotUploadResponseDto), 200)]
        [ProducesResponseType(typeof(string), 400)]
        public async Task<IActionResult> Upload([FromForm] ScreenshotUploadFormRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("Файл не передан или пуст.");

            try
            {
                var result = await _service.UploadScreenshotAsync(request);
                return Ok(result);
            }
            catch (FluentValidation.ValidationException valEx)
            {
                return BadRequest(valEx.Message); // Перехват специфичного исключения FluentValidation
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Внутренняя ошибка загрузки скриншота: {ex.Message}");
            }
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id); // Запрос выполняется за один проход БД
            return deleted ? NoContent() : NotFound("Скриншот не найден.");
        }

        [HttpPost("sync/{programId:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Sync(int programId, [FromBody] IEnumerable<ScreenshotOfAggregatorSyncDto> screenshots)
        {
            if (screenshots == null)
                return BadRequest("Массив скриншотов для синхронизации не передан.");

            try
            {
                await _service.SyncScreenshotsAsync(programId, screenshots);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка синхронизации скриншотов: {ex.Message}");
            }
        }
    }
}
```

---

## 7. Воркер очистки (OrphanedScreenshotCleanupWorker.cs)

> [!IMPORTANT]
> Для предотвращения утечек Scope создается **один раз на метод `CleanupAsync`**, а не внутри цикла. Context повторно используется, но `SaveChangesAsync` по-прежнему вызывается атомарно для каждого успешного удаления папки на диске.

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

public class OrphanedScreenshotCleanupWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OrphanedScreenshotCleanupWorker> _logger;
    private readonly string _wwwroot;

    public OrphanedScreenshotCleanupWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<OrphanedScreenshotCleanupWorker> logger,
        IHostEnvironment environment)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _wwwroot = environment.ContentRootPath;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                await CleanupAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при выполнении очистки временных скриншотов");
            }
            
            await Task.Delay(TimeSpan.FromHours(1), ct);
        }
    }

    private async Task CleanupAsync()
    {
        var tempRoot = Path.Combine(_wwwroot, "uploads/programs/screenshots/temp");
        if (!Directory.Exists(tempRoot)) return;

        var cutoff = DateTime.UtcNow.AddHours(-25);

        // 1. Создаем один Scope на весь метод CleanupAsync
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ProjectDbContext>();

        foreach (var dir in Directory.GetDirectories(tempRoot))
        {
            if (Directory.GetCreationTimeUtc(dir) >= cutoff) continue;

            var guid = Path.GetFileName(dir);
            
            // 2. Физическое удаление папки с диска
            try
            {
                Directory.Delete(dir, recursive: true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Не удалось физически удалить временную папку {dir}. Пропускаем БД-очистку для этой папки.");
                continue;
            }

            // 3. Логическое Hard-удаление осиротевших записей в БД
            var orphans = await db.ScreenshotsOfAggregator
                .Where(s => s.TempGuid == guid)
                .ToListAsync();
                
            foreach (var s in orphans)
            {
                db.Entry(s).State = EntityState.Deleted; // Физическое удаление строки (Hard Delete)
            }

            // Атомарное сохранение изменений ПОСЛЕ успешного удаления конкретной папки
            await db.SaveChangesAsync();
        }
    }
}
```

---

## 8. Миграция базы данных (Шаг 7.0)

Обязательный первый шаг реализации. 

**Сущность `ScreenshotOfAggregator` в `DAL`**:
```csharp
public class ScreenshotOfAggregator : FullAuditableEntityOfAggregator
{
    // ... существующие свойства ...
    
    [MaxLength(36)]
    public string? TempGuid { get; set; } // NEW: null = постоянный файл
}
```

**Fluent API конфигурация (`ScreenshotOfAggregatorConfiguration.cs` в `DAL`)**:
На колонку `TempGuid` вешается индекс:
```csharp
builder.HasIndex(x => x.TempGuid)
    .HasDatabaseName("IX_ScreenshotsOfAggregator_TempGuid");
```

**Команды выполнения миграции**:
```powershell
dotnet ef migrations add AddTempGuidToScreenshot --project DAL --startup-project Project_Server_Auth
dotnet ef database update --project Project_Server_Auth
```

---

## 9. Регистрация зависимостей (Program.cs)

```csharp
builder.Services.AddScoped<IScreenshotOfAggregatorService, ScreenshotOfAggregatorService>();
builder.Services.AddHostedService<OrphanedScreenshotCleanupWorker>();
```

---

## 10. Фронтенд (Angular)

### 10.1. Модель данных и контракт компонента
```typescript
export interface ScreenshotOfAggregator {
  id: number;                    // 0 для новых
  filePath: string;              // относительный путь к WebP
  sortOrder: number;             // порядок внутри таба
  languageOfAggregatorId: number;
}
```

### 10.2. Утилита очереди загрузки (upload-queue.util.ts)
Лимитирует параллельные сетевые запросы до `concurrency = 3` для стабильности UI и сети. Использование `Promise.allSettled` исключает отмену успешных параллельных загрузок при падении одной из них.

```typescript
export async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}
```

### 10.3. API-сервис (ProgramScreenshotApiService)
Отправляет файлы строго через `FormData`:
```typescript
uploadScreenshot(file: File, meta: { tempGuid?: string; languageOfAggregatorId: number }) {
  const form = new FormData();
  form.append('file', file);
  form.append('tempGuid', meta.tempGuid ?? '');
  form.append('languageOfAggregatorId', String(meta.languageOfAggregatorId));
  return this.http.post<ScreenshotUploadResponseDto>(
    'api/v1/aggregator/programs/screenshots/upload', form
  );
}
```

### 10.4. Компонент ProgramScreenshotManagerComponent
Размещение: `src/app/AGREGATOR/PAGES/SPRAVKA/ProgramOfAggregatorPage/components/program-screenshot-manager`

* **Логика вкладок (nz-tabset)**: Вкладки генерируются из `@Input() languages`. Вкладка English маркируется как дефолтная. Пустая вкладка показывает плейсхолдер.
* **Загрузка файлов**:
  * Скрытый `<input type="file" multiple accept="image/*">`.
  * Выбор файлов запускает `processInBatches(files, 3)`.
  * На время загрузки рендерится заглушка с индикатором (`loading = true`).
  * По завершении заглушка заменяется на готовое превью скриншота, вызывается `emitUpdatedList()`.
* **Таблица скриншотов**:
  * Колонки: `#` / Превью 80×50px / Путь к файлу / Сортировка ▲▼ / Удалить.
  * Клик по превью открывает Lightbox через `nz-modal` с `backdrop-filter: blur(8px)`.
  * Удаление происходит через `nz-popconfirm` **только локально в массиве фронтенда** (без немедленного HTTP-запроса `DELETE`).
* **Хелпер миниатюры (Convention over Configuration)**:
  ```typescript
  getThumbnailUrl(filePath: string): string {
    return filePath.replace(/\/([^/]+)$/, '/thumbnails/$1');
  }
  ```

### 10.5. Интеграция в ProgramFormComponent
1. Добавить `ProgramScreenshotManagerComponent` in `imports` родительской формы.
2. Инициализировать поле в FormGroup: `screenshots: [[]]`.
3. В `loadData` патчить: `screenshots: data.screenshots || []`.
4. Обработчик `@Output`: `onScreenshotsChange(updated) => setValue + markAsDirty`.
5. При отправке формы вызывать `syncScreenshots(programId, form.screenshots)`.

---

## 11. Файловая структура и жизненный цикл путей

* **Постоянный путь**: `uploads/programs/screenshots/[first_letter]/[slug]/{timestamp}_{suffix}.webp`
* **Временный путь**: `uploads/programs/screenshots/temp/[temp-guid]/{timestamp}_{suffix}.webp`

---

## 12. Дорожная карта реализации

| Шаг | Задача | Затрагивает |
|---|---|---|
| **7.0** | Миграция БД: добавить `TempGuid NVARCHAR(36) NULL` и индекс | DAL / EF Migration |
| **7.1** | Создать структуру папок `ScreenshotOfAggregator` бэкенда | Бэкенд |
| **7.2** | Реализовать DTO с `multipart` (без Base64), `AspectRatioValidator` (±4% и лог), AutoMapper | Бэкенд — DTO, Helpers |
| **7.3** | Реализовать `ScreenshotOfAggregatorService` (upload с {timestamp}_{suffix}, Move, Sync с Hard Delete и List-materialize) | Бэкенд — Service |
| **7.4** | Реализовать `ProgramScreenshotController` (upload с FluentValidation catch, single-pass delete, sync) | Бэкенд — Controller |
| **7.5** | Реализовать `OrphanedScreenshotCleanupWorker` (Scope-очистка вне цикла ФС + Hard Delete в БД) | Бэкенд — Worker |
| **7.6** | Регистрация зависимостей в `Program.cs` | Бэкенд — Program.cs |
| **7.7** | Создать фронтенд-утилиту очереди `upload-queue.util.ts` c `Promise.allSettled` | Фронтенд — утилита |
| **7.8** | Создать `ProgramScreenshotApiService` (`FormData` upload) | Фронтенд — сервис |
| **7.9** | Создать `ProgramScreenshotManagerComponent` (табы, сортировка стрелками, Lightbox) | Фронтенд — компонент |
| **7.10** | Интегрировать поле `screenshots` в FormGroup `ProgramFormComponent` | Фронтенд — форма |
| **7.11** | Интегрировать `<app-program-screenshot-manager>` в шаблон формы | Фронтенд — шаблон |
| **7.12** | Комплексное тестирование (dotnet build, Swagger, Postman, E2E) | Оба слоя |

---

## 13. План тестирования

### Бэкенд
1. **`dotnet build`** — отсутствие ошибок компиляции.
2. **Swagger UI** — появление эндпоинтов `upload`, `delete`, `sync`.
3. **Postman (Multipart Upload)** — отправка файлов, проверка генерации `{timestamp}_{suffix}.webp` и `/thumbnails/` на диске.
4. **Postman (Валидация сторон)** — отправка картинки 1:1, проверка возврата 400 Bad Request с подробным сообщением (отклонение в %, допустимо ≤4%).
5. **Postman (Размер файла)** — отправка файла >10 МБ, проверка возврата 400.
6. **Воркер** — ручной вызов `CleanupAsync`, проверка удаления `/temp/` и Hard Delete записей в БД по `TempGuid`.

### Фронтенд
1. **Пакетный upload** — отправка 10 файлов, верификация в Network DevTools, что параллельно шлется строго не более 3 запросов. Принудительный сбой одной картинки не должен сбрасывать весь батч (`allSettled`).
2. **Превью** — проверка корректности отображения миниатюр после загрузки.
3. **Сортировка** — проверка работы стрелок ▲▼ внутри текущего языкового таба.
4. **Lightbox** — клик на превью, открытие размытого оверлея `nz-modal`.
5. **Сохранение формы** — проверка корректности отправки sync-запроса с финальным diff.

---

## 14. Бэклог (TODO v2)

* **Drag-and-drop сортировка** (`@angular/cdk/drag-drop`).
* **Минимальное/максимальное разрешение скриншота** (внутри `AspectRatioValidator`).
* **Прогресс-бар загрузки** (`HttpClient reportProgress`).
* **CDN-пути в ThumbnailPath** (обновление хелпера при подключении CDN).
