export const CORE_FIELDS = [
  { name: 'CanonicalName', type: 'string', desc: 'Каноническое название программы (эталон).' },
  { name: 'Slug', type: 'string', desc: 'Уникальный URL-префикс (ЧПУ).' },
  { name: 'CategoryOfAggregatorId', type: 'int', desc: 'ID основной категории.' },
  { name: 'MainPlatformId', type: 'int', desc: 'ID основной платформы (Владелец).' },
  { name: 'SubCategoryOfAggregatorId', type: 'int?', desc: 'ID подкатегории (опционально).' },
  { name: 'DeveloperOfAggregatorId', type: 'int?', desc: 'ID разработчика программы.' },
  { name: 'IconPath', type: 'string?', desc: 'Путь к иконке программы.' },
  { name: 'Website', type: 'string?', desc: 'Официальный сайт программы.' },
  { name: 'SortOrder', type: 'int', desc: 'Порядок сортировки в каталоге.' },
  { name: 'NeedsReview', type: 'bool', desc: 'Флаг необходимости ручной проверки.' },
  { name: 'IsActive', type: 'bool', desc: 'Флаг активности в системе.' },
  { name: 'IsSystem', type: 'bool', desc: 'Защита от удаления (системная программа).' },
  { name: 'Status', type: 'Enum', desc: 'Статус публикации (Draft, Published, etc).' },
  { name: 'TotalDownloads', type: 'long?', desc: 'Суммарное количество загрузок.' },
  { name: 'AverageRating', type: 'double?', desc: 'Средний рейтинг программы.' },
  { name: 'RatingCount', type: 'int?', desc: 'Количество проголосовавших.' },
];

export const LOC_FIELDS = [
  { name: 'LanguageOfAggregatorId', type: 'int', desc: 'ID языка (RU=56, EN=1...)' },
  { name: 'LicenseTypeId', type: 'int?', desc: 'Тип лицензии (Free, Trial, etc).' },
  { name: 'LocalizedName', type: 'string', desc: 'Витринное название программы.' },
  { name: 'ShortDescription', type: 'string', desc: 'Краткое описание.' },
  { name: 'FullDescription', type: 'string', desc: 'Полное описание (HTML).' },
  { name: 'Pros', type: 'string', desc: 'Список преимуществ.' },
  { name: 'Cons', type: 'string', desc: 'Список недостатков.' },
  { name: 'MetaTitle', type: 'string', desc: 'SEO заголовок.' },
  { name: 'MetaDescription', type: 'string', desc: 'SEO описание.' },
];

export const VERSION_FIELDS = [
  { name: 'VersionNumber', type: 'string', desc: 'Номер версии (напр. 1.2.3).' },
  { name: 'ReleasedAt', type: 'DateTime', desc: 'Дата официального релиза.' },
  { name: 'IsLatest', type: 'bool', desc: 'Флаг актуальной (последней) версии.' },
  { name: 'SortOrder', type: 'int', desc: 'Приоритет в списке версий.' },
  { name: 'Status', type: 'Enum', desc: 'Статус версии (Stable, Beta, Alpha).' },
  { name: 'DownloadLinks', type: 'Collection', desc: 'Связанные файлы для скачивания.' },
];

export const PLATFORM_FIELDS = [
  { name: 'ProgramId', type: 'int', desc: 'ID программы.' },
  { name: 'PlatformId', type: 'int', desc: 'ID платформы (Windows, Android...).' },
  { name: 'MinOsVersion', type: 'string', desc: 'Минимальная версия ОС для работы.' },
];

export const MARKET_FIELDS = [
  { name: 'AggregatorSourceId', type: 'int', desc: 'ID источника (Google Play, Steam...).' },
  { name: 'RatingValue', type: 'double', desc: 'Рейтинг в этом магазине.' },
  {
    name: 'DownloadCountDisplay',
    type: 'string',
    desc: 'Отображаемое кол-во загрузок (напр. "1M+").',
  },
  { name: 'Price', type: 'string', desc: 'Актуальная цена в магазине.' },
];

export const MASTER_FIELDS = [
  // PROGRAM
  {
    model: 'Program',
    name: 'CanonicalName',
    type: 'string',
    desc: 'Системное имя программы (эталон).',
  },
  {
    model: 'Program',
    name: 'MainPlatformId',
    type: 'int',
    desc: 'ID основной платформы (контейнера).',
  },
  { model: 'Program', name: 'Slug', type: 'string', desc: 'URL-префикс (ЧПУ).' },
  {
    model: 'Program',
    name: 'IconPath',
    type: 'string',
    desc: 'Путь к иконке программы (логотип).',
  },
  { model: 'Program', name: 'Website', type: 'string', desc: 'Официальный сайт продукта.' },
  {
    model: 'Program',
    name: 'Status',
    type: 'Enum',
    desc: 'Статус публикации (Draft, Published...)',
  },
  {
    model: 'Program',
    name: 'NeedsReview',
    type: 'bool',
    desc: 'Требует ручной проверки модератором.',
  },
  {
    model: 'Program',
    name: 'IsSystem',
    type: 'bool',
    desc: 'Защита от удаления системных записей.',
  },
  {
    model: 'Program',
    name: 'TotalDownloads',
    type: 'long',
    desc: 'Агрегированное кол-во загрузок со всех платформ.',
  },

  // REDIRECTS
  {
    model: 'SlugRedirect',
    name: 'OldSlug',
    type: 'string',
    desc: 'Предыдущий URL-адрес (для SEO редиректа).',
  },
  { model: 'SlugRedirect', name: 'NewSlug', type: 'string', desc: 'Новый (текущий) URL-адрес.' },

  // LOCALIZATION
  {
    model: 'Localization',
    name: 'LocalizedName',
    type: 'string',
    desc: 'Название на конкретном языке.',
  },
  {
    model: 'Localization',
    name: 'ShortDescription',
    type: 'string',
    desc: 'Краткое описание для карточек.',
  },
  {
    model: 'Localization',
    name: 'FullDescription',
    type: 'string',
    desc: 'Полный текст обзора (HTML).',
  },
  {
    model: 'Localization',
    name: 'Pros/Cons',
    type: 'string',
    desc: 'Списки преимуществ и недостатков.',
  },
  {
    model: 'Localization',
    name: 'LicenseTypeId',
    type: 'int',
    desc: 'Тип лицензии (Бесплатно, Демо и т.д.).',
  },

  // VERSIONS
  { model: 'Version', name: 'VersionNumber', type: 'string', desc: 'Номер версии (напр. 1.0.1).' },
  { model: 'Version', name: 'IsLatest', type: 'bool', desc: 'Флаг актуальной версии.' },
  { model: 'Version', name: 'ReleasedAt', type: 'DateTime', desc: 'Дата выхода релиза.' },

  // CATEGORIES
  { model: 'Category', name: 'Slug', type: 'string', desc: 'Уникальный URL-код категории.' },
  {
    model: 'Category',
    name: 'HierarchyPath',
    type: 'string',
    desc: 'Материализованный путь (1/2/...) для дерева.',
  },
  { model: 'Category', name: 'Level', type: 'int', desc: 'Уровень вложенности категории.' },

  // TAGS SYSTEM
  {
    model: 'CategoryTag',
    name: 'Slug',
    type: 'string',
    desc: 'Тех. код группы тегов (напр. "OS", "LICENSE").',
  },
  {
    model: 'CategoryTag',
    name: 'Color',
    type: 'string',
    desc: 'HEX-цвет группы (наследуется тегами).',
  },
  { model: 'Tag', name: 'Slug', type: 'string', desc: 'Уникальный код тега.' },
  { model: 'Tag', name: 'Color', type: 'string', desc: 'Индивидуальный цвет или "inherit".' },
  {
    model: 'Tag',
    name: 'IsFeature',
    type: 'bool',
    desc: 'Флаг важной характеристики (вывод в топ).',
  },
  {
    model: 'ProgramTag',
    name: 'IsMain',
    type: 'bool',
    desc: 'Является ли тег основным для этой программы.',
  },

  // SNAPSHOTS
  { model: 'Snapshot', name: 'Price', type: 'string', desc: 'Цена на момент снимка.' },
  { model: 'Snapshot', name: 'RatingValue', type: 'double', desc: 'Рейтинг на момент снимка.' },
  { model: 'Snapshot', name: 'SnapshotDate', type: 'DateTime', desc: 'Дата фиксации состояния.' },

  // MEDIA
  { model: 'Screenshot', name: 'FilePath', type: 'string', desc: 'Путь к файлу скриншота.' },
  { model: 'Screenshot', name: 'Priority', type: 'int', desc: 'Порядок вывода в галерее.' },
  {
    model: 'Video',
    name: 'VideoUrl',
    type: 'string',
    desc: 'Ссылка на видео-превью (YouTube/Direct).',
  },
];

export const MERMAID_CODE = `classDiagram
    direction LR
    class ProgramOfAggregator {
        +int Id
        +int MainPlatformId
        +string CanonicalName
        +string Slug
        +string IconPath
        +string Website
        +int SortOrder
        +bool NeedsReview
        +bool IsActive
        +bool IsSystem
        +ProgramStatus Status
    }
    class CategoryOfAggregator { 
        +int Id 
        +string Slug
        +string HierarchyPath
        +int Level
    }
    class ProgramSnapshotOfAggregator {
        +int ProgramId
        +string Price
        +double RatingValue
        +DateTime SnapshotDate
    }
    class ProgramOfAggregatorLocalization { +int ProgramId }
    class VersionOfAggregator { +int ProgramId }

    ProgramOfAggregator "1" --> "1" CategoryOfAggregator : Main Category
    ProgramOfAggregator "1" --> "1" PlatformOfAggregator : Main Platform
    ProgramOfAggregator "1" --> "0..1" CategoryOfAggregator : Sub Category
    ProgramOfAggregator "1" --o "*" ProgramSnapshotOfAggregator
    ProgramOfAggregator "1" --o "*" ProgramOfAggregatorLocalization
    ProgramOfAggregator "1" --o "*" VersionOfAggregator
    ProgramOfAggregator "1" --o "*" ProgramSlugRedirectOfAggregator
    
    ProgramOfAggregator "1" --o "*" ProgramTagOfAggregator
    ProgramTagOfAggregator "*" -- "1" TagOfAggregator
    TagOfAggregator "*" -- "1" CategoryTagOfAggregator`;

export const PLATFORM_HIERARCHY_DOC = `
### Архитектурная связь: Программа — Платформа (Hierarchical Option 1)

В версии Aurora v3.5 принята **иерархическая модель владения**, где каждая запись программы (ProgramOfAggregator) жестко привязана к одной основной операционной системе (Платформе). Это определяет её физическое местоположение в структуре сайта и SEO-пространстве.

#### 1. Основная связь (Main Relationship)
В сущность ProgramOfAggregator вводится обязательное поле MainPlatformId. Платформа выступает в роли «контейнера» или «родителя» для программы.

*   **Поле**: MainPlatformId (int, Required)
*   **Тип связи**: Many-to-One (Много программ к одной платформе)
*   **Навигационное свойство**: MainPlatform

#### 2. Правило уникальности (Composite Slug)
Slug программы перестает быть глобально уникальным. Уникальность проверяется только в рамках конкретной платформы. Это позволяет иметь одинаковые слаги для разных версий одной программы (например, Chrome для Windows и Chrome для Android).

*   **Индекс**: UX_Programs_Slug_MainPlatformId
*   **Логика**: Unique(Slug + MainPlatformId)

#### 3. Формирование URL (Routing)
Связь напрямую влияет на построение иерархического пути (Breadcrumbs и Canonical URL). Полный путь к программе генерируется автоматически по цепочке зависимостей:
/{Platform.SystemCode}/{Category.Slug}/{SubCategory.Slug?}/{Program.Slug}

*Пример:* /windows/browsers/chrome

#### 4. Влияние на контент и SEO
Благодаря этой связи, каждая запись ProgramOfAggregator является **автономной**. Это означает:
*   **Локализации**: Описания, заголовки и Meta-теги в ProgramOfAggregatorLocalization создаются отдельно для каждой платформы.
*   **Категории**: Программа может находиться в категории "Системные" на Windows, но в категории "Инструменты" на Android.
*   **Скриншоты и Видео**: Галерея медиа-файлов привязана к платформенной версии программы.

#### 5. Схема редиректов
При изменении MainPlatformId или Slug система автоматически фиксирует смену иерархии и генерирует 301-редирект со старого полного пути на новый, предотвращая потерю веса в поисковых системах.
`;

export const SEARCH_CODE_SAMPLE = `if (!string.IsNullOrWhiteSpace(request.SearchTerm))
{
    var search = request.SearchTerm.ToLower();
    query = query.Where(x =>
        x.Name.ToLower().Contains(search) ||
        x.SystemCode.ToLower().Contains(search) ||
        x.Localizations.Any(l => l.Name.ToLower().Contains(search))
    );
}`;

export const FALLBACK_CODE_SAMPLE = `applyEnglishFallbacks(localizations: any[], technicalName: string): any[] {
  const enLocale = localizations.find(l => l.languageCode === 'en-US');
  return localizations.map(loc => ({
    ...loc,
    name: loc.name || enLocale?.name || technicalName,
    description: loc.description || enLocale?.description,
    metaTitle: loc.metaTitle || enLocale?.metaTitle,
    metaDescription: loc.metaDescription || enLocale?.metaDescription
  }));
}`;

export const SERVICE_PROMPT = `/* Промпт для реализации Service Layer (v3.5) */
Создай ProgramOfAggregatorService.cs и IProgramOfAggregatorService.cs.
1. Зависимости: IUnitOfWork, IMapper, IValidator<T>, IMaintenanceSeeder.
2. GetPaged: Поддержка SearchTerm (Name, Slug, Loc.Name) и фильтра по PlatformId.
3. Create/Update: Реализуй глобальную проверку Slug (проверка в Programs + SlugRedirects).
4. Aggregation: При обновлении MarketData пересчитывай TotalDownloads и AverageRating у Program.
5. Versions: В VersionOfAggregatorService реализуй логику "Switch Latest" (только одна версия может быть IsLatest).
6. HardDelete: Реализуй полное каскадное удаление программы и всех дочерних сущностей.`;

export const SEARCH_PROMPT = `/* Промпт для реализации контроллера (v3.5) */
Создай DeveloperOfAggregatorController.cs.
1. Маршрут: [Route("api/v1/aggregator/developers")].
2. Методы: GetPaged, GetById, Create, Update, Delete, Restore, Seed, Clear.
3. Для медиа: Используй UniversalMediaController с папкой "developers".`;

export const ACTION_COLUMN_TEMPLATE = `<div class="actions">
  @if (data.isDeleted) {
    <button nz-button nzType="text" (click)="onRestore(data.id)">
      <i nz-icon nzType="undo"></i>
    </button>
    <button nz-button nzType="text" (click)="onHardDelete(data.id)">
      <i nz-icon nzType="fire"></i>
    </button>
  } @else {
    <button nz-button nzType="text" (click)="onView(data.id)">
      <i nz-icon nzType="eye"></i>
    </button>
    <button nz-button nzType="text" (click)="onEdit(data.id)">
      <i nz-icon nzType="edit"></i>
    </button>
    <button nz-button nzType="text" (click)="onDelete(data.id)">
      <i nz-icon nzType="rest"></i>
    </button>
  }
</div>`;
