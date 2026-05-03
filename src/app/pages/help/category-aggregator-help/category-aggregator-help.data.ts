export const CORE_FIELDS = [
  { name: 'Id', type: 'int', desc: 'Первичный ключ.' },
  { name: 'CanonicalName', type: 'string(255)', desc: 'Технический идентификатор (для кода).' },
  { name: 'Slug', type: 'string(100)', desc: 'ЧПУ-имя для URL.' },
  { name: 'ParentId', type: 'int?', desc: 'ID родительской категории (Tree support).' },
  { name: 'IconPath', type: 'string?', desc: 'Путь к иконке.' },
  { name: 'IsSystem', type: 'bool', desc: 'Флаг системной записи.' },
  { name: 'IsActive', type: 'bool', desc: 'Флаг активности.' },
  { name: 'SortOrder', type: 'int', desc: 'Приоритет сортировки.' },
];

export const LOC_FIELDS = [
  { name: 'Name', type: 'string(255)', desc: 'Название раздела.' },
  { name: 'Description', type: 'string?', desc: 'Описание раздела.' },
  { name: 'MetaTitle', type: 'string(200)', desc: 'SEO Title.' },
  { name: 'MetaDescription', type: 'string(500)', desc: 'SEO Description.' },
];

export const SERVER_SEARCH_CODE = `query = query.Where(x =>
    x.CanonicalName.ToLower().Contains(search) ||
    x.Slug.ToLower().Contains(search) ||
    x.Localizations.Any(l => l.Name.ToLower().Contains(search))
);`;

export const DX_DICTIONARY_CODE = `// Прямой доступ к локализации без LINQ
var nameRu = category.LocalizedNames["ru-RU"];
var descEn = category.LocalizedDescriptions["en-US"];`;

export const MERMAID_DIAGRAM_CODE = `graph TD
    A["[Category Page]"] --> B["[Page Header]"]
    B --> B1["Title & Breadcrumbs"]
    B --> B2["Actions (Add Category, Expand All)"]
    
    A --> C["[Category Manager]"]
    C --> D["[Tree List Component]"]
    D --> D1["Toolbar (Search, Sync, Trash)"]
    D --> D2["Hierarchical Tree Table"]
    D2 --> D2a["Parent/Child Rows"]
    D2 --> D2b["Inline Actions (Edit, Move, Delete)"]
    
    A --> E["[Status Bar]"]
    E --> E1["Totals (Root, Subcategories)"]
    E --> E2["State (Loading, Last Sync)"]`;

export const JSON_SAMPLE_CODE = `{
  "Id": 1,
  "ParentId": null,
  "CanonicalName": "MULTIMEDIA",
  "Slug": "multimedia",
  "IconPath": "category_multimedia",
  "IsActive": true,
  "IsSystem": false,
  "SortOrder": 10,
  "Localizations": [
    {
      "LanguageOfAggregatorId": 1,
      "Name": "Multimedia",
      "Description": "Audio, video, graphic and multimedia software suites.",
      "MetaTitle": "Multimedia Software",
      "MetaDescription": "Audio, video, graphic and multimedia software"
    }
  ]
}`;

export const STANDARD_ICONS = [
  { file: 'category_multimedia.svg', desc: 'Папка с медиа-символом (для корня).' },
  { file: 'multimedia_audio.svg', desc: 'Музыкальная нота (для раздела Аудио).' },
  { file: 'audio_players.svg', desc: 'Кнопка Play.' },
  { file: 'audio_editors.svg', desc: 'Звуковые волны.' },
  { file: 'audio_converters.svg', desc: 'Стрелки конвертации.' },
  { file: 'audio_cd.svg', desc: 'Диск.' },
  { file: 'audio_dj.svg', desc: 'Наушники.' },
  { file: 'audio_plugins.svg', desc: 'VST/плагин.' },
];
