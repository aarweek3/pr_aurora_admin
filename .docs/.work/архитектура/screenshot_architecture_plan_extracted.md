| Архитектурный план Компонент управления скриншотами Шаг 7 — Финальная версия (с учётом всех итераций) |
| --- |


| Проекты pr_srv_names (Backend .NET) Aurora Control (Frontend Angular) | Статус документа Финальная редакция. Все 6 замечаний архревью закрыты. Готово к реализации. |
| --- | --- |


| 0. Итоговая таблица принятых решений |
| --- |


| # | Проблема | Решение | Где |
| --- | --- | --- | --- |
| 1 | Хрупкий поиск по пути при Move | Nullable-столбец TempGuid + JOIN по нему. Воркер — двойной рубеж по диску. | Сущность + миграция + сервис + воркер |
| 2 | 20+ параллельных загрузок | processInBatches(files, 3) на фронтенде | upload-queue.util.ts |
| 3 | Base64 раздувает трафик на 33% | multipart/form-data, IFormFile.OpenReadStream() | Контроллер + DTO |
| 4 | Валидация сторон не реализована | AspectRatioValidator + ScreenshotUploadFormRequestValidator | Отдельный хелпер + Validators |
| 5 | Orphaned Files без плана | IHostedService + сканирование /temp/ по дате + зачистка БД по TempGuid | OrphanedScreenshotCleanupWorker |
| 6 | Diff-логика в чужом сервисе | SyncScreenshotsAsync инкапсулирован в ScreenshotOfAggregatorService | ScreenshotOfAggregatorService |



| 1. Структура папок и файлов (Бэкенд) |
| --- |


Новый компонент размещается по пути:
Project_Server_Auth/Pages/AGGREGATOR/ScreenshotOfAggregator/

| Файл | Назначение |
| --- | --- |
| Dtos/ScreenshotOfAggregatorDto.cs | Все DTO: CRUD + multipart-загрузка (без Base64) |
| Interfaces/IScreenshotOfAggregatorService.cs | Контракт сервиса: CRUD + медиа-процессинг + SyncScreenshotsAsync |
| Services/ScreenshotOfAggregatorService.cs | Реализация: БД, ImageSharp, AspectRatio, SyncScreenshotsAsync |
| Mappings/ScreenshotOfAggregatorProfile.cs | AutoMapper профили |
| Validators/ScreenshotOfAggregatorValidators.cs | FluentValidation: CRUD + ScreenshotUploadFormRequestValidator |
| Helpers/AspectRatioValidator.cs | Статический хелпер проверки соотношения сторон |
| Workers/OrphanedScreenshotCleanupWorker.cs | IHostedService — очистка /temp/ + зачистка БД |
| Jsons/ScreenshotOfAggregator.json | Пустой файл-заполнитель для сидинга |
| Controllers/ProgramScreenshotController.cs | HTTP-эндпоинты: upload, delete, sync (перенесено из Program-контроллера) |


| Важно: новая папка Helpers/ В отличие от исходного плана, добавляется подпапка Helpers/ для AspectRatioValidator.cs — статического хелпера, не зависящего от DI. Воркер OrphanedScreenshotCleanupWorker выносится в отдельную подпапку Workers/ внутри компонента. |
| --- |



| 2. DTO-модели (ScreenshotOfAggregatorDto.cs) |
| --- |


2.1. Стандартные CRUD-DTO (без изменений)
* ScreenshotOfAggregatorLocalizationDto — локализация скриншота (Title, AltText)
* ScreenshotOfAggregatorItemDto — краткая модель для списков
* ScreenshotOfAggregatorDetailDto — полная модель с коллекцией локализаций
* ScreenshotOfAggregatorCreateDto — создание (ProgramOfAggregatorId, FilePath, SortOrder, LanguageOfAggregatorId)
* ScreenshotOfAggregatorUpdateDto — обновление (наследует CreateDto + Id)
* ScreenshotOfAggregatorPageRequestDto — пагинация и фильтрация
* ScreenshotOfAggregatorPagedResponseDto — постраничный ответ
* ScreenshotOfAggregatorSortField — enum (Id, SortOrder, CreatedAt)

2.2. DTO загрузки файла (ИЗМЕНЕНО: Base64 → multipart)

| Критическое изменение ScreenshotUploadRequestDto с полем ImageBase64 УПРАЗДНЁН. Вместо него используется ScreenshotUploadFormRequest с IFormFile. Это устраняет раздувание трафика на 33% и снижает нагрузку на CPU при десериализации. |
| --- |


ScreenshotUploadFormRequest (новый DTO для загрузки):
public class ScreenshotUploadFormRequest
{
    public IFormFile File { get; set; } = null!;
    public string? ProgramSlug { get; set; }
    public string? TempGuid { get; set; }
    public int? LanguageOfAggregatorId { get; set; }
}

ScreenshotUploadResponseDto (без изменений):
public class ScreenshotUploadResponseDto
{
    public string FileName { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public string ThumbnailPath { get; set; } = string.Empty;
    public long Size { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}


| 3. Интерфейс сервиса (IScreenshotOfAggregatorService.cs) |
| --- |


Полный контракт включает стандартные CRUD-методы, медиа-методы и новый SyncScreenshotsAsync:

public interface IScreenshotOfAggregatorService
{
    // CRUD
    Task<ScreenshotOfAggregatorPagedResponseDto> GetPagedAsync(ScreenshotOfAggregatorPageRequestDto request);
    Task<ScreenshotOfAggregatorDetailDto?> GetByIdAsync(int id);
    Task<ScreenshotOfAggregatorDetailDto> CreateAsync(ScreenshotOfAggregatorCreateDto dto);
    Task<ScreenshotOfAggregatorDetailDto> UpdateAsync(ScreenshotOfAggregatorUpdateDto dto);
    Task DeleteAsync(int id);
    Task HardDeleteAsync(int id);
    Task RestoreAsync(int id);
    Task<int> ClearAllAsync();

    // Медиа-процессинг
    Task<ScreenshotUploadResponseDto> UploadScreenshotAsync(ScreenshotUploadFormRequest request);
    Task MoveTempScreenshotsToFinalDestinationAsync(string tempGuid, string programSlug);

    // Синхронизация (инкапсулирует diff-логику)
    Task SyncScreenshotsAsync(int programId,
        IEnumerable<ScreenshotOfAggregatorCreateDto> incoming);
}


| 4. Реализация сервиса (ScreenshotOfAggregatorService.cs) |
| --- |


4.1. Загрузка изображения (UploadScreenshotAsync)
* Открыть стрим через IFormFile.OpenReadStream() — никакого Base64
* Image.IdentifyAsync читает только заголовок (габариты без декодирования пикселей)
* Вызвать AspectRatioValidator.Validate(width, height) — при ошибке бросить ValidationException
* Сконвертировать в WebP с качеством 82–85% через SixLabors.ImageSharp
* Определить путь: temp/{tempGuid}/ (новая программа) или [first_letter]/[slug]/ (редактирование)
* Сохранить оригинал WebP и сгенерировать thumbnail 160px в /thumbnails/ с тем же именем
* Вернуть ScreenshotUploadResponseDto с RelativePath и ThumbnailPath

4.2. Перемещение временных файлов (MoveTempScreenshotsToFinalDestinationAsync)

| Принятое решение: TempGuid как nullable-столбец БД Поиск записей выполняется по индексируемому столбцу TempGuid, а не через StartsWith по FilePath. Это даёт надёжный JOIN, устойчивый к любым изменениям структуры путей. Воркер как второй рубеж работает независимо через сканирование диска. |
| --- |


var screenshots = await _db.ScreenshotsOfAggregator
    .Where(s => s.TempGuid == tempGuid)
    .ToListAsync();

Directory.Move(tempPath, finalPath); // атомарная операция ФС

foreach (var s in screenshots)
{
    s.FilePath = s.FilePath.Replace(tempBase, finalBase);
    s.TempGuid = null; // сброс — файл на постоянном месте
}
await _db.SaveChangesAsync();

4.3. Синхронизация скриншотов (SyncScreenshotsAsync)
Метод полностью инкапсулирует diff-логику. ProgramOfAggregatorService вызывает одну строку.

// Найти существующие записи в БД
var existing = await _db.ScreenshotsOfAggregator
    .Where(s => s.ProgramOfAggregatorId == programId).ToListAsync();

// Удалить пропавшие из списка
var toDelete = existing.Where(e => incoming.All(i => i.Id != e.Id || i.Id == 0));
foreach (var s in toDelete) { DeleteFileAndThumbnail(s.FilePath); _db.Remove(s); }

// Создать новые (id == 0), обновить существующие (sortOrder, languageId)
foreach (var dto in incoming) { /* ... */ }

await _db.SaveChangesAsync();


| 5. Хелперы и валидаторы |
| --- |


5.1. AspectRatioValidator.cs (Helpers/)
Статический класс — не требует DI. Допустимые соотношения: 16:9, 16:10, 4:3. Погрешность ±2%.

public static class AspectRatioValidator
{
    private static readonly (int w, int h, string label)[] AllowedRatios =
        [(16,9,"16:9"), (16,10,"16:10"), (4,3,"4:3")];

    private const double Tolerance = 0.02;

    public static string? Validate(int width, int height)
    {
        double actual = (double)width / height;
        bool isValid = AllowedRatios.Any(r =>
            Math.Abs(actual - (double)r.w / r.h) < Tolerance);
        if (isValid) return null;
        return $"Недопустимое соотношение ({width}x{height}). Допустимо: 16:9, 16:10, 4:3";
    }
}

5.2. Валидаторы (ScreenshotOfAggregatorValidators.cs)
Добавляется новый класс ScreenshotUploadFormRequestValidator:

* ScreenshotOfAggregatorCreateDtoValidator
* ScreenshotOfAggregatorUpdateDtoValidator
* ScreenshotOfAggregatorPageRequestDtoValidator
* ScreenshotUploadFormRequestValidator (новый — проверяет размер файла ≤ 10 МБ, тип MIME image/*)

public class ScreenshotUploadFormRequestValidator
    : AbstractValidator<ScreenshotUploadFormRequest>
{
    public ScreenshotUploadFormRequestValidator()
    {
        RuleFor(x => x.File).NotNull();
        RuleFor(x => x.File.Length)
            .LessThanOrEqualTo(10 * 1024 * 1024)
            .WithMessage("Размер файла не должен превышать 10 МБ");
        RuleFor(x => x.File.ContentType)
            .Must(t => t.StartsWith("image/"))
            .WithMessage("Допускаются только изображения");
    }
}


| 6. Контроллер (ProgramScreenshotController.cs) |
| --- |


Контроллер предоставляет три эндпоинта. Третий эндпоинт (sync) является ключевым нововведением — он устраняет архитектурную дыру, при которой diff-логика была размазана по ProgramOfAggregatorController.

| Метод | URL | Описание |
| --- | --- | --- |
| POST | api/v1/aggregator/programs/screenshots/upload | Загрузка файла через multipart/form-data. Возвращает пути WebP + thumbnail. |
| DELETE | api/v1/aggregator/programs/screenshots/{id} | Мягкое удаление записи (физически — через SyncScreenshotsAsync при сохранении). |
| POST | api/v1/aggregator/programs/screenshots/sync/{programId} | Синхронизация полного списка скриншотов программы (diff: создать / обновить / удалить). |


Реализация эндпоинта sync:

[HttpPost("sync/{programId:int}")]
public async Task<IActionResult> Sync(
    int programId,
    [FromBody] IEnumerable<ScreenshotOfAggregatorCreateDto> screenshots)
{
    await _service.SyncScreenshotsAsync(programId, screenshots);
    return NoContent();
}


| 7. Воркер очистки (OrphanedScreenshotCleanupWorker.cs) |
| --- |


| Двойной рубеж защиты Рубеж 1 (диск): IHostedService каждый час сканирует /temp/ и удаляет папки старше 25 часов. Рубеж 2 (БД): для каждой удалённой папки зачищает записи ScreenshotOfAggregator по TempGuid. Оба рубежа независимы — при сбое одного второй гарантирует согласованность. |
| --- |


protected override async Task ExecuteAsync(CancellationToken ct)
{
    while (!ct.IsCancellationRequested)
    {
        await CleanupAsync();
        await Task.Delay(TimeSpan.FromHours(1), ct);
    }
}

private async Task CleanupAsync()
{
    var tempRoot = Path.Combine(_wwwroot,
        "uploads/programs/screenshots/temp");
    if (!Directory.Exists(tempRoot)) return;

    var cutoff = DateTime.UtcNow.AddHours(-25);
    foreach (var dir in Directory.GetDirectories(tempRoot))
    {
        if (Directory.GetCreationTimeUtc(dir) >= cutoff) continue;

        var guid = Path.GetFileName(dir);
        Directory.Delete(dir, recursive: true);

        var orphans = await _db.ScreenshotsOfAggregator
            .Where(s => s.TempGuid == guid).ToListAsync();
        _db.ScreenshotsOfAggregator.RemoveRange(orphans);
    }
    await _db.SaveChangesAsync();
}


| 8. Миграция базы данных |
| --- |


| Шаг 7.0 — обязательный первый шаг Миграция должна быть выполнена до начала реализации сервиса и воркера. Nullable-столбец без NOT NULL накатывается мгновенно даже на больших таблицах. |
| --- |


Изменение сущности:
public class ScreenshotOfAggregator
{
    // ... существующие поля ...
    public string? TempGuid { get; set; } // NEW: null = постоянный файл
}

Команды:
dotnet ef migrations add AddTempGuidToScreenshot
dotnet ef database update


| 9. Регистрация зависимостей (Program.cs) |
| --- |


// Сервис
builder.Services.AddScoped<
    IScreenshotOfAggregatorService,
    ScreenshotOfAggregatorService>();

// Воркер
builder.Services.AddHostedService<
    OrphanedScreenshotCleanupWorker>();

// Валидаторы подцепляются автоматически через
// AddValidatorsFromAssembly(Assembly.GetExecutingAssembly())


| 10. Фронтенд (Angular) |
| --- |


10.1. Модель данных и контракт компонента
Интерфейс ScreenshotOfAggregator (без изменений):

export interface ScreenshotOfAggregator {
  id: number;                    // 0 для новых
  filePath: string;              // относительный путь к WebP
  sortOrder: number;             // порядок внутри языка
  languageOfAggregatorId: number;
}

API компонента (без изменений):

@Input() screenshots: ScreenshotOfAggregator[] = [];
@Input() languages: AppLanguage[] = [];
@Output() screenshotsChange = new EventEmitter<ScreenshotOfAggregator[]>();

| Базовый язык (зафиксировано) Отдельная вкладка «Общие» с languageOfAggregatorId = null отклонена. Базовой локализацией является английский язык (isDefault === true). Пустые локализации других языков автоматически показывают английские скриншоты на публичном сайте. |
| --- |


10.2. Утилита очереди загрузки (upload-queue.util.ts) — НОВЫЙ ФАЙЛ

export async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

10.3. API-сервис (ProgramScreenshotApiService)
* uploadScreenshot(file: File, meta) — FormData, НЕ Base64
* deleteScreenshot(id: number) — мягкое удаление
* syncScreenshots(programId, screenshots[]) — вызывается при сохранении формы

uploadScreenshot(file: File, meta: UploadMeta) {
  const form = new FormData();
  form.append('file', file);
  form.append('tempGuid', meta.tempGuid ?? '');
  form.append('languageOfAggregatorId',
    String(meta.languageOfAggregatorId));
  return this.http.post<ScreenshotUploadResponseDto>(
    'api/v1/aggregator/programs/screenshots/upload', form);
}

10.4. Компонент ProgramScreenshotManagerComponent
Размещение: src/app/AGREGATOR/PAGES/SPRAVKA/ProgramOfAggregatorPage/components/program-screenshot-manager

Логика вкладок (nz-tabset)
* Вкладки генерируются динамически из @Input() languages
* Вкладка английского языка маркируется: English (По умолчанию)
* Пустая вкладка неосновного языка показывает placeholder с кнопкой [+ Добавить для ...]

Загрузка файлов
* Скрытый <input type="file" multiple accept="image/*">
* При выборе файлов — моментальные заглушки с индикатором загрузки
* Отправка через processInBatches(files, 3) — не более 3 одновременных запросов
* По завершении каждого файла — замена заглушки на превью, обновление массива, emit

Таблица скриншотов
* Колонки: # / Превью 80×50px / Путь к файлу / Сортировка ▲▼ / Удалить
* Превью: border-radius 8px, hover: scale(1.1) rotate(1deg)
* Клик по превью: Lightbox через nz-modal с backdrop-filter: blur(8px)
* Сортировка: кнопки ▲▼ меняют sortOrder только среди скриншотов текущего языка
* Удаление: nz-popconfirm, только локальное (без HTTP-запроса до сохранения формы)

Хелпер миниатюры
ThumbnailPath не хранится в БД — вычисляется на лету по конвенции:

getThumbnailUrl(filePath: string): string {
  return filePath.replace(/\/([^\/]+)$/, '/thumbnails/$1');
}

10.5. Интеграция в ProgramFormComponent
* Импортировать ProgramScreenshotManagerComponent в массив imports декоратора
* Добавить поле в FormGroup: screenshots: [[]]
* В loadData патчить: screenshots: data.screenshots || []
* Добавить обработчик: onScreenshotsChange(updated) → setValue + markAsDirty + markForCheck
* В шаблоне заменить заглушку на <app-program-screenshot-manager>
* При сохранении формы вызвать syncScreenshots(programId, form.screenshots)


| 11. Файловая структура и жизненный цикл путей |
| --- |


Постоянный путь
uploads/programs/screenshots/[first_letter]/[slug]/[name].webp
uploads/programs/screenshots/[first_letter]/[slug]/thumbnails/[name].webp

Временный путь (черновик новой программы)
uploads/programs/screenshots/temp/[temp-guid]/[name].webp
uploads/programs/screenshots/temp/[temp-guid]/thumbnails/[name].webp

| Жизненный цикл черновика 1. Загрузка: файлы попадают в /temp/[guid]/. TempGuid записывается в БД. 2. Сохранение: Directory.Move атомарно переносит папку. Записи в БД обновляются по TempGuid, затем TempGuid сбрасывается в null. 3. Отмена / брошенная вкладка: OrphanedScreenshotCleanupWorker через 25+ часов удаляет папку с диска и записи из БД по TempGuid. |
| --- |



| 12. Дорожная карта реализации |
| --- |


| Шаг | Задача | Затрагивает |
| --- | --- | --- |
| 7.0 | Миграция БД: добавить TempGuid NVARCHAR(36) NULL в ScreenshotsOfAggregator | DAL / EF Migration |
| 7.1 (BE) | Создать структуру папок ScreenshotOfAggregator со всеми файлами | Бэкенд |
| 7.2 (BE) | Реализовать DTO с multipart (без Base64), AspectRatioValidator, ScreenshotUploadFormRequestValidator | Бэкенд — DTO, Validators, Helpers |
| 7.3 (BE) | Реализовать ScreenshotOfAggregatorService: upload (multipart+WebP+thumb), Move (по TempGuid), SyncScreenshotsAsync | Бэкенд — Service |
| 7.4 (BE) | Реализовать ProgramScreenshotController: upload, delete, sync/{programId} | Бэкенд — Controller |
| 7.5 (BE) | Реализовать OrphanedScreenshotCleanupWorker: сканирование /temp/ + зачистка БД по TempGuid | Бэкенд — Worker |
| 7.6 (BE) | Зарегистрировать всё в Program.cs (DI + AddHostedService) | Бэкенд — Program.cs |
| 7.7 (FE) | Создать upload-queue.util.ts с processInBatches(files, 3) | Фронтенд — утилита |
| 7.8 (FE) | Создать ProgramScreenshotApiService: uploadScreenshot (multipart), deleteScreenshot, syncScreenshots | Фронтенд — сервис |
| 7.9 (FE) | Создать ProgramScreenshotManagerComponent: вкладки nz-tabset, таблица, сортировка стрелками, Lightbox | Фронтенд — компонент |
| 7.10 (FE) | Добавить поле screenshots: [[]] в FormGroup ProgramFormComponent + patchValue + onScreenshotsChange | Фронтенд — форма |
| 7.11 (FE) | Заменить заглушку в шаблоне на <app-program-screenshot-manager> | Фронтенд — шаблон |
| 7.12 | Тестирование: dotnet build, Swagger, Postman (multipart), фронтенд E2E | Оба слоя |


| Критический путь Шаги строго последовательны в рамках одного слоя. Бэкенд (7.0–7.7) должен быть полностью готов до начала интеграции фронтенда (7.7–7.12). Шаг 7.0 (миграция) — абсолютная зависимость для всего остального. |
| --- |



| 13. План тестирования |
| --- |


Бэкенд
* dotnet build — нулевые ошибки компиляции
* Swagger UI: проверить появление трёх эндпоинтов ProgramScreenshotController
* Postman: POST /upload с multipart/form-data (НЕ Base64) → проверить создание .webp и /thumbnails/
* Postman: загрузить изображение с соотношением 1:1 → ожидать 400 с сообщением об ошибке
* Postman: загрузить файл >10 МБ → ожидать 400
* Postman: POST /sync/{programId} → проверить diff (создание / обновление / удаление)
* Дождаться срабатывания воркера или вызвать CleanupAsync() вручную в тесте → проверить очистку /temp/ и БД

Фронтенд
* Выбрать 10 файлов одновременно → убедиться, что отправляется не более 3 запросов параллельно (DevTools → Network)
* Проверить корректное отображение превью и thumbnail после загрузки
* Проверить сортировку стрелками в пределах одного языкового таба
* Проверить Lightbox: клик по превью → открытие модального окна с blur
* Проверить placeholder в пустом языковом табе
* Сохранить форму → убедиться что sync-запрос отправлен с корректным diff


| 14. Бэклог (TODO v2) |
| --- |


| Задача | Обоснование |
| --- | --- |
| Drag-and-drop сортировка (@angular/cdk/drag-drop) | Признана избыточной для v1. Кнопки ▲▼ достаточны и надёжны. |
| Минимальное/максимальное разрешение скриншота | AspectRatioValidator расширяется на проверку min 1280×720 и max 7680×4320. |
| Прогресс-бар загрузки (HttpClient reportProgress) | Улучшает UX при медленном соединении. Усложняет код сервиса. |
| CDN-путь в ThumbnailPath | При подключении CDN хелпер getThumbnailUrl нужно обновить. |


