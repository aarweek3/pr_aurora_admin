export const CORE_FIELDS = [
  { name: 'Id', type: 'int', desc: 'Identity PK' },
  { name: 'Slug', type: 'string(150)', desc: 'Техническое название (Slug). Обязательное.' },
  { name: 'IconPath', type: 'string?', desc: 'Относительный путь к иконке.' },
  { name: 'Color', type: 'string?', desc: 'Hex-код цвета для UI.' },
  { name: 'IsActive', type: 'bool', desc: 'Статус активности.' },
  { name: 'SortOrder', type: 'int', desc: 'Приоритет сортировки.' },
];

export const LOC_FIELDS = [
  { name: 'Name', type: 'string(200)', desc: 'Локализованное имя (Витрина).' },
  { name: 'Description', type: 'string?', desc: 'Описание категории.' },
  { name: 'MetaTitle', type: 'string?', desc: 'SEO Title.' },
  { name: 'MetaDescription', type: 'string?', desc: 'SEO Description.' },
];

export const SERVER_SEARCH_CODE = `query = query.Where(x => 
    x.Slug.ToLower().Contains(search) || 
    x.Localizations.Any(l => l.Name.ToLower().Contains(search))
);`;

export const SERVER_SORTING_CODE = `return request.SortBy switch {
    CategoryTagSortField.Id => isAsc ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id),
    CategoryTagSortField.Name => isAsc ? query.OrderBy(x => x.Slug) : query.OrderByDescending(x => x.Slug),
    _ => query.OrderBy(x => x.Slug)
};`;

export const ICON_FOLDER_STRUCTURE = `wwwroot/uploads/category-tags/
├── a/ (shard)
│   └── apps.svg
└── m/
    └── music.svg`;

export const FALLBACK_LOGIC_CODE = `applyEnglishFallbacks(locs: any[], slug: string): any[] {
  const en = locs.find(l => l.languageCode === 'en-US');
  return locs.map(l => ({
    ...l,
    name: l.name || en?.name || slug
  }));
}`;

export const AI_PROMPT_CONTROLLER = `/* Промпт для реализации контроллера (v3.5) */
Создай CategoryTagOfAggregatorController.cs.
1. Маршрут: [Route("api/v1/aggregator/category-tags")].
2. Методы: GetPaged, GetById, Create, Update, Delete, Restore, Seed, Clear.
3. Для медиа: Используй UniversalMediaController с папкой "category-tags".`;

export const MERMAID_DIAGRAM_CODE = `graph TD
    A["[Category Tag Page]"] --> B["[Page Header]"]
    B --> B1["Title & Gear Icon"]
    B --> B2["Actions (Modal/Page Toggle, Add Category)"]
    
    A --> C["[Manager Content]"]
    C --> D["[List Component]"]
    D --> D1["Toolbar (Search, Language, Trash)"]
    D --> D2["Data Table (Flat)"]
    D2 --> D2a["Columns: ID, Category, Slug, Sort, Tags, Status"]
    D2 --> D2b["Actions: View, Edit, Trash, Hard Delete"]
    
    A --> E["[Status Bar]"]
    E --> E1["Stats (Total Records)"]
    E --> E2["State (Language Init, Version)"]`;
