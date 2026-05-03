export const MERMAID_DIAGRAM_CODE = `graph TD
    A["[Page Container]"] --> B["[Page Header]"]
    B --> B1["Title Section"]
    B --> B2["Header Actions (Modal/Page Toggle, Add Button)"]
  
    A --> D["[Manager Content]"]
    D --> E["[List Component]"]
    E --> E1["Toolbar (Search, Language, Trash Toggle)"]
    E --> E2["Data Table (Sorting, Actions)"]
    E --> E3["Pagination Footer"]
  
    A --> F["[Sticky Status Bar]"]
    F --> F1["Stats (Total, Languages)"]
    F --> F2["Loading State / Version"]`;

export const ACTION_PATTERNS = [
  { name: 'Просмотр', icon: 'eye', color: 'primary', colorName: 'Primary', method: 'openView()', ux: 'Открывает Modal с деталями (Read-only)' },
  { name: 'Редактировать', icon: 'edit', color: 'gold', colorName: 'Warning', method: 'openEditForm()', ux: 'Форма редактирования с SEO-блоком' },
  { name: 'В корзину', icon: 'delete', color: 'error', colorName: 'Error', method: 'softDelete()', ux: 'Мягкое удаление (isDeleted = true)' },
  { name: 'Восстановить', icon: 'sync', color: 'success', colorName: 'Success', method: 'restore()', ux: 'Возврат записи из корзины' },
  { name: 'Hard Delete', icon: 'fire', color: 'red', colorName: 'Critical', method: 'hardDelete()', ux: 'Метод modal.challenge (Капча)' },
];

export const CATEGORY_FIELDS = [
  { name: 'Slug', type: 'string', desc: 'Уникальный код для URL' },
  { name: 'Color', type: 'string', desc: 'HEX-код цвета' },
  { name: 'IsActive', type: 'bool', desc: 'Флаг активности' }
];

export const TAG_FIELDS = [
  { name: 'Slug', type: 'string', desc: 'Уникальный код (URL)' },
  { name: 'Color', type: 'string', desc: 'Цвет ("inherit" для наследования)' },
  { name: 'IsActive', type: 'bool', desc: 'Флаг активности' }
];

export const SERVER_SEARCH_CODE = `if (!string.IsNullOrWhiteSpace(req.SearchTerm)) {
    var search = req.SearchTerm.ToLower();
    query = query.Where(x => x.Slug.ToLower().Contains(search) || 
                             x.Localizations.Any(l => l.Name.ToLower().Contains(search)));
}`;

export const HERITAGE_LOGIC_CODE = `.ForMember(d => d.DisplayColor, opt => opt.MapFrom(s => 
    s.Color == "inherit" && s.Category != null ? s.Category.Color : s.Color))`;

export const ICON_MAPPING_CODE = `.ForMember(d => d.DisplayIcon, opt => opt.MapFrom(s =>
    s.IconPath ?? (s.Category != null ? s.Category.IconPath : "assets/twotone/av-tag-default.svg")))`;

export const MASK_IMAGE_CODE = `<div 
  [style.background-color]="data.displayColor"
  [style.mask-image]="'url(' + data.displayIcon + ')'"
  style="mask-size: contain; mask-repeat: no-repeat;"
></div>`;

export const CONTROLLER_PROMPT_CODE = `Создай TagOfAggregatorController.cs.
1. Маршрут: [Route("api/v1/aggregator/tags")].
2. Методы: GetPaged, GetById, Create, Update, Delete, Restore.`;

export const LIST_ACTION_TEMPLATE_CODE = `<td class="action-cell">
  @if (!data.isDeleted) {
    <i nz-icon nzType="eye" (click)="view(data.id)"></i>
    <i nz-icon nzType="edit" (click)="edit(data.id)" class="text-blue"></i>
    <i nz-icon nzType="delete" (click)="softDelete(data.id)" class="text-orange"></i>
  } @else {
    <i nz-icon nzType="sync" (click)="restore(data.id)" class="text-green"></i>
    <i nz-icon nzType="fire" (click)="hardDelete(data.id)" class="text-red"></i>
  }
</td>`;

export const TOOLBAR_FILTER_CODE = `<div class="header-assembly">
  <av-search [(value)]="searchTerm" class="search-fluid"></av-search>
  <div class="trash-capsule" [class.active]="showDeleted()">
     <span>TRASH</span><nz-switch [(ngModel)]="showDeleted"></nz-switch>
  </div>
</div>`;

export const HEADER_ASSEMBLY_HTML_CODE = `.header-assembly { display: flex; gap: 16px; align-items: center; }
.search-fluid { flex: 1; }
.trash-capsule { background: #f1f5f9; padding: 4px 12px; border-radius: 99px; }`;

export const SERVER_CONTROLLER_CODE = `[HttpGet]
public async Task<ActionResult<PagedResult<TagItemDto>>> GetPaged([FromQuery] TagFilterRequest request) 
{
    var query = _unitOfWork.Tags.GetQuery();
    if (!string.IsNullOrEmpty(request.Search)) 
        query = query.Where(x => x.Slug.Contains(request.Search));
    return await query.ToPagedResultAsync(request);
}`;

export const FRONTEND_MAP_CODE_HTML = `
<strong style="color: #0366d6;">src/app/AGREGATOR/PAGES/SPRAVKA/TagOfAggregatorPage/</strong><br/>
├── 📂 <span style="color: #6aab73;">components/</span> (List, Form, Modal, Inline, View)<br/>
├── 📂 <span style="color: #6aab73;">models/</span> (DTOs + State Interface)<br/>
├── 📂 <span style="color: #6aab73;">services/</span><br/>
│   ├── 📄 tag-of-aggregator-api.service.ts<br/>
│   └── 📄 tag-of-aggregator-state.service.ts<br/>
├── 📄 tag-of-aggregator-manager.component.ts<br/>
├── 📄 tag-of-aggregator.routes.ts<br/>
└── 📄 end-points.ts`;

export const FRONTEND_CHECKLIST_CODE = `# Чек-лист: Создание фронтенд-модуля Tag & Category System (v3.5)

## 🏗 Фаза 1: Инфраструктура и Модели
- [ ] Создание структуры папок CategoryTagOfAggregatorPage и TagOfAggregatorPage
- [ ] Определение эндпоинтов в end-points.ts для обоих сущностей
- [ ] Создание интерфейсов DTO (Item, Detail, Create, Update) и интерфейса State

## 📡 Фаза 2: API и State Services
- [ ] Реализация TagOfAggregatorApiService (CRUD + Maintenance)
- [ ] Реализация TagOfAggregatorStateService на Angular Signals (SSOT)
- [ ] Внедрение executeWithLoading() для всех асинхронных операций
- [ ] Методы seedFromJson() и clearDatabase() в State

## 🏷 Фаза 3: Компоненты Категорий
- [ ] Реализация CategoryManager на базе AvShowcaseComponent
- [ ] Инлайн-редактирование названий и управление локализациями
- [ ] Внедрение Delete Guard: проверка на наличие тегов перед удалением

## 🏷 Фаза 4: Компоненты Тегов
- [ ] Создание TagManager, TagList и TagForm
- [ ] Интеграция AvSearchComponent и привязка к сигналу searchTerm
- [ ] Режим корзины: фильтрация isDeleted и смена набора кнопок действий
- [ ] Red dot logic: Отображение индикатора RequiresTranslation
- [ ] Форма: разделение на Основное, Локализации и SEO (English Fallback)

## 🚀 Фаза 5: Маршрутизация и Навигация
- [ ] Регистрация дочерних роутов в aggregator-pages.routes.ts
- [ ] Добавление в SidebarService (Группа: Справочники, Иконка: tags)
- [ ] Настройка хлебных крошек (Breadcrumbs)

## 🧪 Фаза 6: Полировка и UX
- [ ] Проверка Heritage Logic: визуальный тест наследования цвета/иконок
- [ ] Тестирование Maintenance: сброс и наполнение базы через JSON
- [ ] Оптимизация производительности через ChangeDetectionStrategy.OnPush
`;
