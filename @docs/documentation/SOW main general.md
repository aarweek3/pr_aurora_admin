ТЕХНИЧЕСКОЕ ЗАДАНИЕ
Универсальная админ-панель (Enterprise Admin Panel)
Angular 19 Standalone + ng-zorro (частичная интеграция)

ОГЛАВЛЕНИЕ
ЧАСТЬ 1: EXECUTIVE SUMMARY
1.1 Цели проекта
1.2 Технологический стек
1.3 Принципы архитектуры
1.4 Фазы разработки

ЧАСТЬ 2: ГЛОБАЛЬНАЯ АРХИТЕКТУРА
2.1 Структура приложения
2.2 Иерархия компонентов
2.3 Разделение ответственности
2.4 Взаимодействие слоёв

ЧАСТЬ 3: CORE ARCHITECTURE (v1.0)
3.1 Context Model
3.2 Error Registry
3.3 Event Bus
3.4 Command Service
3.5 Icon Provider

ЧАСТЬ 4: LAYOUT КОМПОНЕНТЫ
4.1 Header
4.2 Left Sidebar (Navigation)
4.3 Right Panel (ГИБРИД)
4.4 Footer
4.5 Global Status Bar

ЧАСТЬ 5: BODY & FORMS
5.1 Page Shell
5.2 Error Handling System (ИНТЕГРАЦИЯ)
5.3 ng-zorro интеграция

ЧАСТЬ 6: UI COMPONENTS LIBRARY
6.1 Grid System
6.2 Tables
6.3 Buttons
6.4 Forms
6.5 Modals
6.6 Status/Feedback

ЧАСТЬ 7: STYLING SYSTEM
7.1 CSS Architecture (BEM + is-\*)
7.2 ng-zorro интеграция
7.3 Theming

ЧАСТЬ 8: ANGULAR IMPLEMENTATION
8.1 Структура проекта (Layer-based)
8.2 Standalone компоненты
8.3 Сервисы
8.4 Change Detection
8.5 Routing

ЧАСТЬ 9: PERMISSIONS MODEL
9.1 Концепция
9.2 Интерфейсы
9.3 Интеграция с Context
9.4 Влияние на UI

ЧАСТЬ 10: ВИЗУАЛЬНЫЕ СХЕМЫ
10.1 Layout Schema
10.2 Error Flow
10.3 Context Transitions
10.4 Right Panel States
10.5 Command Lifecycle

ЧАСТЬ 11: КОНФИГУРАЦИОННЫЕ ПРИМЕРЫ
11.1 Right Menu Config
11.2 Error Registry Structure
11.3 Context Model Example
11.4 Command Configuration

ЧАСТЬ 12: EXTENSIBILITY ROADMAP (v2.0)
12.1 Command Pipeline
12.2 Plugin System
12.3 Icon Provider (multi-source)
12.4 Feature Flags

ПРИЛОЖЕНИЯ
A. Полный список интерфейсов
B. CSS классы (справочник)
C. ng-zorro компоненты
D. Глоссарий терминов

ЧАСТЬ 1: EXECUTIVE SUMMARY
1.1 Цели проекта
Разработать масштабируемую, универсальную админ-панель для управления сайтами/сервисами/данными со следующими возможностями:
✅ Добавление новых разделов без переработки layout
✅ Использование как standalone-проекта
✅ Частичная замена UI-библиотек в будущем
✅ Enterprise-уровень обработки ошибок
✅ Плагин-ориентированная архитектура
✅ Предсказуемый UX без скрытой логики
Ключевые принципы:
┌─────────────────────────────────────────────────┐
│ 1. ng-zorro = инфраструктура │
│ Семантика и визуал — СВОИ │
│ │
│ 2. Классы описывают РОЛЬ, не внешний вид │
│ State — только через is-\* классы │
│ │
│ 3. Core — единственный источник правды │
│ UI — только представления (dumb components) │
│ │
│ 4. Слабая связанность через Event Bus │
│ Никаких прямых вызовов между UI-частями │
│ │
│ 5. Ошибки — трёхуровневая система │
│ Toast → Modal → Registry + Status Bars │
└─────────────────────────────────────────────────┘

1.2 Технологический стек
Используется:
// Core
├─ HTML5
├─ CSS / SCSS (BEM + is-\* модификаторы)
├─ TypeScript 5.x
├─ Angular 19 (standalone компоненты)
│
// UI Framework (ЧАСТИЧНО)
├─ ng-zorro-antd
│ ├─ Grid (24 колонки)
│ ├─ Table
│ ├─ Pagination
│ ├─ Modal
│ ├─ Message (Toast)
│ ├─ Input / Select (опционально)
│ └─ Icons (через Icon Provider)
│
// State Management (Custom)
├─ Context Model (Core)
├─ Error Registry (Core)
├─ Event Bus (Core)
└─ Command Service (Core)

НЕ используется:
❌ Bootstrap
❌ Angular Material
❌ Сторонние UI-киты
❌ Глобальное переопределение .ant-\* классов
❌ RxJS для state (только для HTTP и события)
❌ NgRx / Akita / etc (используем свой Core)

1.3 Принципы архитектуры
Разделение ответственности:
┌──────────────────────────────────────────────────┐
│ СЛОЙ │ ОТВЕТСТВЕННОСТЬ │
├──────────────────────────────────────────────────┤
│ Header │ Брендинг, глобальные действия│
│ Left Sidebar │ Навигация по разделам │
│ Right Panel │ Контекст + детали │
│ Body │ Работа с данными │
│ Form Status Bar │ Состояние формы (агрегат) │
│ Error Block │ Детализация ошибок │
│ Global Status Bar │ Состояние системы │
│ Footer │ Мета-информация │
├──────────────────────────────────────────────────┤
│ Core (Context) │ Текущее состояние приложения │
│ Core (Registry) │ Хранилище ошибок │
│ Core (Event Bus) │ Связь компонентов │
│ Core (Commands) │ Выполнение действий │
└──────────────────────────────────────────────────┘

Архитектурные ограничения:
❌ ЗАПРЕЩЕНО:

1. Прямые вызовы между UI-компонентами
   Body → Right Panel ❌
   Правильно: Body → Event Bus → Right Panel ✅

2. Бизнес-логика в UI
   Component содержит HTTP запросы ❌
   Правильно: Component → Command Service → HTTP ✅

3. Дублирование состояния
   Ошибка в Registry + ошибка в Component ❌
   Правильно: Единственный источник — Registry ✅

4. Прямая работа с ng-zorro стилями
   .ant-table { color: red } ❌
   Правильно: .table-panel { color: red } ✅

5. Смешивание уровней ошибок
   Global error в Form Status Bar ❌
   Правильно: Global → Global Status Bar ✅

1.4 Фазы разработки
v1.0 (MVP - Current Scope)
✅ Layout Shell
├─ Header
├─ Left Sidebar
├─ Body (Page Shell)
├─ Right Panel
├─ Status Bars
└─ Footer

✅ Core Architecture (минимум)
├─ Context Model (полная версия)
├─ Error Registry (полная версия)
├─ Event Bus (упрощённая - pub/sub)
├─ Command Service (без pipeline - execute only)
└─ Icon Provider (ng-zorro only)

✅ Error Handling (интеграция существующей)
├─ HttpErrorInterceptor
├─ ErrorHandlingService
├─ GlobalErrorHandler
└─ Интеграция с Registry

✅ Forms & Tables
├─ Form Status Bar
├─ Error Block
├─ ng-zorro Tables
└─ Validation система

✅ Permissions Model (базовая)
├─ Context интеграция
├─ JWT декодирование
└─ UI visibility rules

v2.0 (Roadmap - Future)
📋 Command Pipeline
├─ Before/After/Error hooks
├─ Middleware support
└─ Retry logic

📋 Plugin System
├─ Plugin manifest
├─ Dynamic loading
└─ Isolated namespaces

📋 Icon Provider (multi-source)
├─ ng-zorro
├─ SVG sprite
├─ Custom библиотека
└─ Dynamic loading

📋 Advanced Features
├─ Feature flags
├─ A/B testing
├─ Telemetry
└─ Micro-frontends

ЧАСТЬ 2: ГЛОБАЛЬНАЯ АРХИТЕКТУРА
2.1 Структура приложения
ASCII Layout Schema:
┌─────────────────────────────────────────────────────────────┐
│ ADMIN-HEADER │
│ [Logo/Brand] [User] [Actions] │
└─────────────────────────────────────────────────────────────┘
┌──────┬──────────────────────────────────────────┬───────────┐
│ │ │ │
│ │ ADMIN-MAIN (Body) │ │
│ │ ┌────────────────────────────────────┐ │ RIGHT │
│ LEFT │ │ PAGE-HEADER │ │ PANEL │
│ SIDE │ ├────────────────────────────────────┤ │ │
│ BAR │ │ FORM-STATUS-BAR │ │ ┌──────┐ │
│ │ ├────────────────────────────────────┤ │ │Context│ │
│ ┌──┐ │ │ ERROR-BLOCK (если есть) │ │ │ Zone │ │
│ │ │ │ ├────────────────────────────────────┤ │ └──────┘ │
│ │Nav│ │ │ SEARCH/FILTERS │ │ ──────── │
│ │ │ │ ├────────────────────────────────────┤ │ ┌──────┐ │
│ │ │ │ │ │ │ │ Menu │ │
│ └──┘ │ │ CONTENT AREA │ │ │ Zone │ │
│ │ │ (Table/Form) │ │ │ │ │
│ │ │ │ │ └──────┘ │
│ │ ├────────────────────────────────────┤ │ │
│ │ │ FOOTER (Pagination + Actions) │ │ │
│ │ └────────────────────────────────────┘ │ │
└──────┴──────────────────────────────────────────┴───────────┘
┌─────────────────────────────────────────────────────────────┐
│ GLOBAL-STATUS-BAR │
│ [System] [Backend] [Data] [Validation] [Operations] │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ADMIN-FOOTER │
│ Version 1.0.0 | © 2025 | Help | Privacy │
└─────────────────────────────────────────────────────────────┘

2.2 Иерархия компонентов
AdminApp
└─ AdminLayout
├─ AdminHeader
│ ├─ HeaderBranding
│ ├─ HeaderActions
│ └─ HeaderUser
│
├─ AdminWorkspace
│ ├─ LeftSidebar
│ │ ├─ SidebarTrigger (collapsed mode)
│ │ ├─ SidebarNav
│ │ └─ SidebarSubMenu (dynamic)
│ │
│ ├─ AdminMain (Body)
│ │ └─ RouterOutlet
│ │ └─ Page (любая страница)
│ │ ├─ PageHeader
│ │ ├─ FormStatusBar
│ │ ├─ ErrorBlock (conditional)
│ │ ├─ SearchFilters
│ │ ├─ ContentArea
│ │ │ ├─ Table (ng-zorro wrapper)
│ │ │ └─ Form (custom)
│ │ └─ PageFooter
│ │ ├─ PaginationBlock
│ │ └─ ActionsBlock
│ │
│ └─ RightPanel
│ ├─ ContextZone (dynamic)
│ │ └─ PropertiesPanel
│ └─ MenuZone (static)
│ ├─ ActionsPanel
│ ├─ ErrorsPanel
│ ├─ HistoryPanel
│ └─ DebugPanel
│
├─ GlobalStatusBar
│ ├─ SystemIndicator
│ ├─ DataIndicator
│ ├─ ValidationIndicator
│ └─ OperationsIndicator
│
└─ AdminFooter
├─ FooterInfo
├─ FooterVersion
└─ FooterLinks

2.3 Разделение ответственности
Таблица компонентов:
┌───────────────────┬──────────────────────────┬─────────────────┐
│ КОМПОНЕНТ │ ОТВЕЧАЕТ ЗА │ НЕ ОТВЕЧАЕТ ЗА │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Header │ • Брендинг │ • Layout │
│ │ • Глобальные действия │ • Навигация │
│ │ • Пользовательское меню │ • Состояния │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Left Sidebar │ • Навигация по разделам │ • Состояние │
│ │ • Подменю │ приложения │
│ │ • Активные маршруты │ • Ошибки │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Right Panel │ • Контекстные данные │ • Навигация │
│ │ • Детализация │ • Layout │
│ │ • Действия над объектом │ • Routing │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Body │ • Отображение данных │ • Глобальные │
│ │ • Формы/таблицы │ состояния │
│ │ • Локальные статусы │ • Навигация │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Form Status Bar │ • Агрегат ошибок формы │ • Детализация │
│ │ • Состояние формы │ • Решения │
│ │ • Индикаторы │ • Системные │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Error Block │ • Список ошибок │ • Исправление │
│ │ • Подсветка полей │ • Глобальные │
│ │ • Рекомендации │ ошибки │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Global Status Bar │ • Системные состояния │ • Ошибки формы │
│ │ • Backend статус │ • Действия │
│ │ • Глобальные индикаторы │ • Навигация │
├───────────────────┼──────────────────────────┼─────────────────┤
│ Footer │ • Мета-информация │ • Любая логика │
│ │ • Версия │ • Состояния │
│ │ • Ссылки │ • Данные │
└───────────────────┴──────────────────────────┴─────────────────┘

2.4 Взаимодействие слоёв
Event Bus Architecture:
┌─────────────────────────────────────────────────────────┐
│ EVENT BUS (CORE) │
│ │
│ publish(event) subscribe(type, handler) │
└─────────────────────────────────────────────────────────┘
↑ ↓
│ │
┌────┴────┐ ┌────┴────┐
│ │ │ │
┌───┴───┐ ┌──┴───┐ ┌───┴───┐ ┌───┴────┐
│ Body │ │ Left │ │ Right │ │ Status │
│ │ │ Menu │ │ Panel │ │ Bars │
└───────┘ └──────┘ └───────┘ └────────┘

ПРИМЕРЫ СОБЫТИЙ:

1. Body → "formDirty" → Form Status Bar обновляется
2. Body → "errorOccurred" → Error Block показывается
3. Left Menu → "navigationChange" → Context Model обновляется
4. Command → "commandCompleted" → Status Bars обновляются
5. Error Registry → "errorRegistered" → UI реагирует

Поток данных (КРИТИЧНО):
┌──────────────────────────────────────────────────────┐
│ ПРАВИЛО: UI НИКОГДА НЕ ОБЩАЕТСЯ НАПРЯМУЮ │
└──────────────────────────────────────────────────────┘

❌ НЕПРАВИЛЬНО:
Body.component.ts:
this.rightPanel.open(); // Прямой вызов

✅ ПРАВИЛЬНО:
Body.component.ts:
this.eventBus.publish({
type: 'openRightPanel',
payload: { panelId: 'errors' }
});

RightPanel.component.ts:
ngOnInit() {
this.eventBus.subscribe('openRightPanel', (event) => {
this.open(event.payload.panelId);
});
}

Context-driven Updates:
┌─────────────────────────────────────────────────────┐
│ CONTEXT MODEL (Single Source) │
│ │
│ currentForm: 'users' │
│ mode: 'edit' │
│ dirty: true │
│ valid: false │
│ errors: [...errorRegistry] │
│ permissions: {...} │
└─────────────────────────────────────────────────────┘
↓ ↓ ↓ ↓
┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
│ Body │ │ Right │ │ Status │ │Commands │
│ │ │ Panel │ │ Bars │ │ │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

    Подписываются     Реагируют        Обновляются
    на изменения      на Context       по событиям

ЧАСТЬ 3: CORE ARCHITECTURE (v1.0)
3.1 Context Model
Назначение:
Context Model — это единственный источник правды о текущем состоянии приложения. Он НЕ хранит бизнес-данные, а описывает текущую ситуацию.
Интерфейсы:
// ===== CORE CONTEXT MODEL =====

/\*\*

- Основной контекст приложения
- Единственный источник правды о текущем состоянии
  \*/
  export interface AppContext {
  // Идентификация текущей области
  activeArea: ContextArea;

// Состояние данных
dataState: ContextDataState;

// Операционное состояние
operationalState: ContextOperationalState;

// Права доступа
permissions: ContextPermissions;

// Метаданные
metadata: ContextMetadata;
}

/\*\*

- Описание активной области работы
  \*/
  export interface ContextArea {
  // Тип контента (таблица/форма/дашборд)
  type: 'table' | 'form' | 'dashboard' | 'custom';

// Идентификатор сущности (например, 'users', 'orders')
entityId: string;

// Режим работы
mode: ContextMode;

// ID конкретной записи (для form в режиме edit/view)
recordId?: string;

// Выбранные элементы (для bulk операций)
selection?: ContextSelection;
}

export type ContextMode =
| 'view' // Просмотр
| 'edit' // Редактирование
| 'create' // Создание
| 'readonly'; // Только чтение (системная блокировка)

export interface ContextSelection {
// Массив ID выбранных элементов
selectedIds: string[];

// Общее количество доступных элементов
totalCount: number;

// Выбраны все элементы?
allSelected: boolean;
}

/\*\*

- Состояние данных в контексте
  \*/
  export interface ContextDataState {
  // Есть несохранённые изменения?
  dirty: boolean;

// Валидность данных
valid: boolean;

// Текущая операция
operation?: DataOperation;

// Состояние загрузки
loading: boolean;

// Время последнего изменения
lastModified?: Date;
}

export type DataOperation =
| 'loading' // Загрузка данных
| 'saving' // Сохранение
| 'deleting' // Удаление
| 'exporting' // Экспорт
| 'importing'; // Импорт

/\*\*

- Операционное состояние
  \*/
  export interface ContextOperationalState {
  // Система работает нормально?
  healthy: boolean;

// Backend доступен?
backendAvailable: boolean;

// Режим только для чтения (глобальный)?
globalReadOnly: boolean;

// Текущие блокировки
locks: ContextLock[];

// Фоновые операции
backgroundTasks: BackgroundTask[];
}

export interface ContextLock {
id: string;
reason: string;
source: 'system' | 'user' | 'backend';
timestamp: Date;
}

export interface BackgroundTask {
id: string;
name: string;
progress: number; // 0-100
status: 'running' | 'completed' | 'failed';
}

/\*\*

- Права доступа пользователя
  \*/
  export interface ContextPermissions {
  // Информация о пользователе
  user: {
  id: string;
  name: string;
  email: string;
  roles: string[]; // ['admin', 'editor']
  };

// Глобальные права
global: string[]; // ['admin.read', 'admin.write']

// Права на текущую сущность
entity: EntityPermissions;
}

export interface EntityPermissions {
// Название сущности
entityName: string;

// Доступные операции
operations: {
read: boolean;
create: boolean;
update: boolean;
delete: boolean;
export: boolean;
};

// Ограничения на поля
fieldRestrictions?: Record<string, 'hidden' | 'readonly' | 'writable'>;
}

/\*\*

- Метаданные контекста
  \*/
  export interface ContextMetadata {
  // Версия контекста (для отладки)
  version: number;

// Время создания контекста
createdAt: Date;

// Время последнего обновления
updatedAt: Date;

// Произвольные данные
extra?: Record<string, any>;
}

Context API:
/\*\*

- Сервис для работы с контекстом
  \*/
  export interface IContextService {
  // Получить текущий контекст
  getContext(): AppContext;

// Получить Observable контекста
context$: Observable<AppContext>;

// Обновить контекст (полностью)
setContext(context: AppContext): void;

// Обновить контекст (частично)
updateContext(partial: Partial<AppContext>): void;

// Обновить активную область
setActiveArea(area: Partial<ContextArea>): void;

// Обновить состояние данных
updateDataState(state: Partial<ContextDataState>): void;

// Проверка прав
hasPermission(permission: string): boolean;
hasAnyPermission(permissions: string[]): boolean;
hasRole(role: string): boolean;

// Управление блокировками
addLock(lock: ContextLock): void;
removeLock(lockId: string): void;
isLocked(): boolean;

// Управление выбором
setSelection(selection: ContextSelection): void;
clearSelection(): void;

// Сброс контекста
reset(): void;
}

State Transitions (текстовое описание):
ПЕРЕХОДЫ СОСТОЯНИЙ CONTEXT:

1. ИНИЦИАЛИЗАЦИЯ
   null → { activeArea: null, mode: 'view' }

2. НАВИГАЦИЯ НА СТРАНИЦУ
   setActiveArea({ type: 'table', entityId: 'users' })
   → Context обновляется
   → Event Bus: 'contextChanged'
   → UI реагирует

3. ОТКРЫТИЕ ФОРМЫ РЕДАКТИРОВАНИЯ
   setActiveArea({ type: 'form', mode: 'edit', recordId: '123' })
   → Context обновляется
   → Right Panel показывает properties
   → Commands проверяют permissions

4. ИЗМЕНЕНИЕ ДАННЫХ
   updateDataState({ dirty: true })
   → Form Status Bar показывает "Несохранённые изменения"
   → Command 'Save' становится available

5. СОХРАНЕНИЕ
   updateDataState({ operation: 'saving' })
   → Command Pipeline выполняется
   → Success: updateDataState({ dirty: false, operation: null })
   → Error: updateDataState({ valid: false, operation: null })

6. СИСТЕМНАЯ ОШИБКА (Backend недоступен)
   updateOperationalState({ backendAvailable: false })
   → Global Status Bar показывает индикатор
   → All Commands становятся disabled
   → Context mode → 'readonly'

7. ВЫБОР СТРОК В ТАБЛИЦЕ
   setSelection({ selectedIds: ['1', '2'], totalCount: 100 })
   → Right Panel Context Zone показывает "2 selected"
   → Bulk Actions становятся available

8. ПЕРЕХОД НА ДРУГУЮ СТРАНИЦУ
   reset() → setActiveArea({ type: 'dashboard', entityId: 'main' })
   → Локальные ошибки очищаются
   → Selection очищается
   → Event Bus: 'contextChanged'

Context Integration Example:
// ===== ПРИМЕР ИСПОЛЬЗОВАНИЯ В КОМПОНЕНТЕ =====

@Component({
selector: 'app-user-form',
standalone: true,
// ...
})
export class UserFormComponent implements OnInit, OnDestroy {
private readonly contextService = inject(ContextService);
private readonly commandService = inject(CommandService);
private readonly destroy$ = new Subject<void>();

canSave = signal(false);
isReadOnly = signal(false);

ngOnInit() {
// Установить контекст при открытии формы
this.contextService.setActiveArea({
type: 'form',
entityId: 'users',
mode: 'edit',
recordId: this.userId
});

    // Подписаться на изменения контекста
    this.contextService.context$
      .pipe(takeUntil(this.destroy$))
      .subscribe(context => {
        // Проверить права на сохранение
        this.canSave.set(
          context.dataState.dirty &&
          context.dataState.valid &&
          context.permissions.entity.operations.update
        );

        // Проверить режим readonly
        this.isReadOnly.set(
          context.mode === 'readonly' ||
          context.operationalState.globalReadOnly
        );
      });

}

onFieldChange() {
// Пометить форму как dirty
this.contextService.updateDataState({ dirty: true });
}

onSave() {
// Выполнить команду через Command Service
this.commandService.execute('save', {
entityId: 'users',
data: this.formValue
});
}

ngOnDestroy() {
this.destroy$.next();
    this.destroy$.complete();

    // Очистить контекст при уходе
    this.contextService.reset();

}
}

3.2 Error Registry
Назначение:
Error Registry — это центральное хранилище всех ошибок в системе. Он агрегирует ошибки с разных уровней и предоставляет единый API для доступа к ним.
Интерфейсы:
// ===== ERROR REGISTRY CORE =====

/\*\*

- Уровень ошибки в системе
  \*/
  export type ErrorLevel =
  | 'global' // Системная ошибка (backend, network)
  | 'contextual' // Ошибка формы/таблицы
  | 'local'; // Ошибка поля/строки

/\*\*

- Источник ошибки
  \*/
  export type ErrorSource =
  | 'http' // HTTP запрос
  | 'validation' // Client-side validation
  | 'runtime' // JavaScript runtime error
  | 'system' // Системная ошибка
  | 'plugin'; // Ошибка плагина

/\*\*

- Статус жизненного цикла ошибки
  \*/
  export type ErrorLifecycle =
  | 'active' // Активная ошибка
  | 'resolved' // Исправлена
  | 'dismissed'; // Закрыта пользователем

/\*\*

- Зарегистрированная ошибка
  \*/
  export interface RegisteredError {
  // Уникальный ID ошибки в Registry
  registryId: string;

// Уровень ошибки
level: ErrorLevel;

// Источник ошибки
source: ErrorSource;

// Связанный контекст (если есть)
contextId?: string; // formId, tableId

// Связанное поле/строка (если есть)
fieldId?: string;
rowId?: string;

// Сама ошибка (из существующей системы)
errorResponse: ErrorResponse;

// Жизненный цикл
lifecycle: ErrorLifecycle;

// Временные метки
registeredAt: Date;
resolvedAt?: Date;
dismissedAt?: Date;

// Метаданные
metadata?: Record<string, any>;
}

/\*\*

- Фильтр для поиска ошибок
  \*/
  export interface ErrorFilter {
  level?: ErrorLevel | ErrorLevel[];
  source?: ErrorSource | ErrorSource[];
  lifecycle?: ErrorLifecycle | ErrorLifecycle[];
  contextId?: string;
  fieldId?: string;
  rowId?: string;
  }

/\*\*

- Агрегированное состояние ошибок
  \*/
  export interface ErrorSummary {
  // Общее количество активных ошибок
  total: number;

// По уровням
byLevel: {
global: number;
contextual: number;
local: number;
};

// По severity (из ErrorResponse)
bySeverity: {
critical: number;
error: number;
warning: number;
info: number;
};

// Самая критичная ошибка
highestSeverity: 'critical' | 'error' | 'warning' | 'info' | null;
}

Error Registry API:
/\*\*

- Сервис Error Registry
  \*/
  export interface IErrorRegistry {
  // ===== РЕГИСТРАЦИЯ =====

/\*\*

- Зарегистрировать новую ошибку
  \*/
  register(error: Omit<RegisteredError, 'registryId' | 'registeredAt'>): string;

/\*\*

- Зарегистрировать HTTP ошибку (интеграция с ErrorHandlingService)
  \*/
  registerHttpError(
  errorResponse: ErrorResponse,
  contextId?: string
  ): string;

/\*\*

- Зарегистрировать ошибку валидации
  \*/
  registerValidationError(
  fieldId: string,
  message: string,
  contextId: string
  ): string;

// ===== ПОЛУЧЕНИЕ =====

/\*\*

- Получить ошибку по ID
  \*/
  get(registryId: string): RegisteredError | null;

/\*\*

- Получить все ошибки (с фильтром)
  \*/
  getAll(filter?: ErrorFilter): RegisteredError[];

/\*\*

- Получить агрегированную сводку
  \*/
  getSummary(filter?: ErrorFilter): ErrorSummary;

/\*\*

- Observable всех ошибок
  \*/
  errors$: Observable<RegisteredError[]>;

/\*\*

- Observable сводки
  \*/
  summary$: Observable<ErrorSummary>;

// ===== УПРАВЛЕНИЕ ЖИЗНЕННЫМ ЦИКЛОМ =====

/\*\*

- Пометить ошибку как исправленную
  \*/
  resolve(registryId: string): void;

/\*\*

- Закрыть ошибку (dismiss)
  \*/
  dismiss(registryId: string): void;

/\*\*

- Очистить ошибки по фильтру
  \*/
  clear(filter: ErrorFilter): void;

/\*\*

- Очистить все ошибки контекста
  \*/
  clearContext(contextId: string): void;

/\*\*

- Очистить все ошибки
  \*/
  clearAll(): void;

// ===== ПОИСК =====

/\*\*

- Найти ошибки для конкретного поля
  \*/
  getFieldErrors(fieldId: string, contextId: string): RegisteredError[];

/\*\*

- Найти ошибки для конкретной строки таблицы
  \*/
  getRowErrors(rowId: string, contextId: string): RegisteredError[];

/\*\*

- Есть ли активные ошибки?
  \*/
  hasErrors(filter?: ErrorFilter): boolean;

/\*\*

- Количество активных ошибок
  \*/
  count(filter?: ErrorFilter): number;
  }

Integration with ErrorHandlingService:
// ===== РАСШИРЕНИЕ СУЩЕСТВУЮЩЕГО ErrorHandlingService =====

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService implements OnDestroy {
// Существующие зависимости
private readonly message = inject(NzMessageService);
private readonly modalService = inject(NzModalService);
private readonly router = inject(Router);
private readonly logger = inject(LoggingService);

// НОВЫЕ ЗАВИСИМОСТИ
private readonly errorRegistry = inject(ErrorRegistry);
private readonly contextService = inject(ContextService);
private readonly eventBus = inject(EventBus);

handleError(
errorResponse: ErrorResponse,
options?: Partial<ErrorDisplayConfig>
): void {
try {
this.validateErrorResponse(errorResponse);
this.logError(errorResponse);

      // === НОВОЕ: Регистрация в Error Registry ===
      const registryId = this.registerInRegistry(errorResponse);

      const config = {
        ...this.getErrorConfig(errorResponse.status),
        ...options,
      };

      // Существующее поведение (Toast/Modal)
      this.displayError(errorResponse, config);

      // === НОВОЕ: Публикация события ===
      this.eventBus.publish({
        type: 'errorRegistered',
        payload: {
          registryId,
          errorResponse,
          level: this.determineErrorLevel(errorResponse)
        }
      });

    } catch (error) {
      this.logger.error(this.context, 'Ошибка при обработке ошибки', {
        originalError: errorResponse,
        processingError: error,
      });
      this.fallbackErrorHandling();
    }

}

private registerInRegistry(errorResponse: ErrorResponse): string {
const level = this.determineErrorLevel(errorResponse);
const context = this.contextService.getContext();

    return this.errorRegistry.register({
      level,
      source: 'http',
      errorResponse,
      contextId: context.activeArea?.entityId,
      lifecycle: 'active',
      metadata: {
        url: errorResponse.requestUrl,
        timestamp: errorResponse.timestamp,
      }
    });

}

private determineErrorLevel(err: ErrorResponse): ErrorLevel {
// Global: системные и сетевые ошибки
if ([500, 502, 503, 504, 0].includes(err.status)) {
return 'global';
}

    // Contextual: ошибки формы/таблицы
    if ([422, 400, 409].includes(err.status)) {
      return 'contextual';
    }

    // Остальные тоже contextual (401, 403, 404)
    return 'contextual';

}
}

Error Registry Example:
// ===== ПРИМЕР ИСПОЛЬЗОВАНИЯ В FORM STATUS BAR =====

@Component({
selector: 'app-form-status-bar',
standalone: true,
template: `    <div class="form-status-bar" [class.is-error]="hasErrors()">
      @if (summary(); as s) {
        <div class="status-indicator" (click)="scrollToErrors()">
          <span class="status-icon">{{ getIcon(s) }}</span>
          <span class="status-text">{{ getText(s) }}</span>
        </div>
      }
    </div>
 `
})
export class FormStatusBarComponent implements OnInit {
private readonly errorRegistry = inject(ErrorRegistry);
private readonly contextService = inject(ContextService);

summary = signal<ErrorSummary | null>(null);

ngOnInit() {
const context = this.contextService.getContext();
const contextId = context.activeArea?.entityId;

    // Подписаться на изменения ошибок текущего контекста
    this.errorRegistry.summary$
      .pipe(
        map(summary => this.filterByContext(summary, contextId)),
        takeUntilDestroyed()
      )
      .subscribe(summary => {
        this.summary.set(summary);
      });

}

hasErrors(): boolean {
return (this.summary()?.total ?? 0) > 0;
}

getIcon(summary: ErrorSummary): string {
if (summary.bySeverity.critical > 0) return '❌';
if (summary.bySeverity.error > 0) return '⚠️';
if (summary.bySeverity.warning > 0) return '⚡';
return '✅';
}

getText(summary: ErrorSummary): string {
const total = summary.total;
if (total === 0) return 'Нет ошибок';
if (total === 1) return '1 ошибка';
if (total < 5) return `${total} ошибки`;
return `${total} ошибок`;
}

scrollToErrors() {
// Скроллить к Error Block
document.querySelector('.error-block')?.scrollIntoView({
behavior: 'smooth'
});
}
}

3.3 Event Bus
Назначение:
Event Bus — это центральная шина событий, обеспечивающая слабую связанность между компонентами через паттерн publish/subscribe.
Интерфейсы:
// ===== EVENT BUS CORE =====

/\*\*

- Базовое событие
  \*/
  export interface AppEvent<T = any> {
  // Тип события
  type: string;

// Полезная нагрузка
payload: T;

// Временная метка
timestamp: Date;

// Источник события (опционально)
source?: string;

// Метаданные
metadata?: Record<string, any>;
}

/\*\*

- Типы событий в системе
  \*/
  export type EventType =
  // Context Events
  | 'contextChanged'
  | 'contextReset'
  | 'modeChanged'
  | 'selectionChanged'
  | 'dirtyStateChanged'

// Command Events
| 'commandRequested'
| 'commandStarted'
| 'commandCompleted'
| 'commandFailed'

// Error Events
| 'errorRegistered'
| 'errorResolved'
| 'errorCleared'

// Navigation Events
| 'navigationStarted'
| 'navigationCompleted'
| 'submenuOpened'
| 'submenuClosed'

// Right Panel Events
| 'rightPanelOpened'
| 'rightPanelClosed'
| 'rightPanelChanged'

// System Events
| 'backendAvailable'
| 'backendUnavailable'
| 'readOnlyEnabled'
| 'readOnlyDisabled'
| 'pluginLoaded'
| 'pluginUnloaded';

/\*\*

- Обработчик событий
  \*/
  export type EventHandler<T = any> = (event: AppEvent<T>) => void;

/\*\*

- Подписка на события
  \*/
  export interface EventSubscription {
  // Отписаться
  unsubscribe(): void;
  }

Event Bus API:
/\*\*

- Сервис Event Bus
  \*/
  export interface IEventBus {
  /\*\*
  - Опубликовать событие
    \*/
    publish<T = any>(event: Omit<AppEvent<T>, 'timestamp'>): void;

/\*\*

- Подписаться на событие
  \*/
  subscribe<T = any>(
  type: EventType | EventType[],
  handler: EventHandler<T>
  ): EventSubscription;

/\*\*

- Подписаться на событие (RxJS Observable)
  \*/
  on<T = any>(type: EventType | EventType[]): Observable<AppEvent<T>>;

/\*\*

- Получить все события (для отладки)
  \*/
  getHistory(type?: EventType): AppEvent[];

/\*\*

- Очистить историю
  \*/
  clearHistory(): void;
  }

Event Bus Implementation:
@Injectable({ providedIn: 'root' })
export class EventBus implements IEventBus {
private readonly events$ = new Subject<AppEvent>();
private readonly history: AppEvent[] = [];
private readonly maxHistorySize = 100;

publish<T = any>(event: Omit<AppEvent<T>, 'timestamp'>): void {
const fullEvent: AppEvent<T> = {
...event,
timestamp: new Date()
};

    // Добавить в историю
    this.history.push(fullEvent);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Опубликовать
    this.events$.next(fullEvent);

}

subscribe<T = any>(
type: EventType | EventType[],
handler: EventHandler<T>
): EventSubscription {
const types = Array.isArray(type) ? type : [type];

    const subscription = this.events$
      .pipe(
        filter(event => types.includes(event.type as EventType))
      )
      .subscribe(handler);

    return {
      unsubscribe: () => subscription.unsubscribe()
    };

}

on<T = any>(type: EventType | EventType[]): Observable<AppEvent<T>> {
const types = Array.isArray(type) ? type : [type];

    return this.events$.pipe(
      filter(event => types.includes(event.type as EventType))
    ) as Observable<AppEvent<T>>;

}

getHistory(type?: EventType): AppEvent[] {
if (!type) return [...this.history];
return this.history.filter(e => e.type === type);
}

clearHistory(): void {
this.history.length = 0;
}
}

Event Bus Examples:
// ===== ПРИМЕР 1: Body публикует изменение формы =====

@Component({
selector: 'app-user-form'
})
export class UserFormComponent {
private readonly eventBus = inject(EventBus);

onFieldChange() {
// Опубликовать событие
this.eventBus.publish({
type: 'dirtyStateChanged',
payload: { dirty: true, formId: 'users' },
source: 'UserFormComponent'
});
}
}

// ===== ПРИМЕР 2: Form Status Bar подписывается =====

@Component({
selector: 'app-form-status-bar'
})
export class FormStatusBarComponent implements OnInit {
private readonly eventBus = inject(EventBus);

isDirty = signal(false);

ngOnInit() {
// Подписаться на изменения dirty state
this.eventBus.on('dirtyStateChanged')
.pipe(takeUntilDestroyed())
.subscribe(event => {
this.isDirty.set(event.payload.dirty);
});
}
}

// ===== ПРИМЕР 3: Несколько подписчиков на одно событие =====

// Form Status Bar
this.eventBus.subscribe('errorRegistered', (event) => {
this.updateErrorCount();
});

// Error Block
this.eventBus.subscribe('errorRegistered', (event) => {
this.showError(event.payload);
});

// Right Panel
this.eventBus.subscribe('errorRegistered', (event) => {
if (event.payload.level === 'critical') {
this.openErrorsPanel();
}
});

// Global Status Bar
this.eventBus.subscribe('errorRegistered', (event) => {
if (event.payload.level === 'global') {
this.showGlobalIndicator();
}
});

3.4 Command Service
Назначение:
Command Service — это единая точка входа для выполнения всех действий (команд) в системе. Он обеспечивает валидацию, логирование и связь с Event Bus.
Интерфейсы:
// ===== COMMAND SERVICE CORE =====

/\*\*

- Базовая команда
  \*/
  export interface Command<T = any, R = any> {
  // Уникальный ID команды (например, 'save', 'delete')
  id: string;

// Параметры команды
payload: T;

// Результат выполнения
result?: R;

// Ошибка (если была)
error?: Error;

// Статус выполнения
status: CommandStatus;

// Временные метки
requestedAt: Date;
startedAt?: Date;
completedAt?: Date;
}

export type CommandStatus =
| 'pending' // Ожидает выполнения
| 'validating' // Валидация
| 'executing' // Выполняется
| 'completed' // Успешно завершена
| 'failed'; // Ошибка

/\*\*

- Обработчик команды
  \*/
  export type CommandHandler<T = any, R = any> = (
  payload: T,
  context: AppContext
  ) => Observable<R> | Promise<R>;

/\*\*

- Результат выполнения команды
  \*/
  export interface CommandResult<R = any> {
  success: boolean;
  data?: R;
  error?: Error;
  }

Command Service API:
/\*\*

- Сервис команд (v1.0 - упрощённая версия без pipeline)
  \*/
  export interface ICommandService {
  /\*\*
  - Зарегистрировать команду
    \*/
    register<T = any, R = any>(
    commandId: string,
    handler: CommandHandler<T, R>
    ): void;

/\*\*

- Выполнить команду
  \*/
  execute<T = any, R = any>(
  commandId: string,
  payload: T
  ): Observable<CommandResult<R>>;

/\*\*

- Проверить доступность команды
  \*/
  isAvailable(commandId: string): boolean;

/\*\*

- Получить список зарегистрированных команд
  \*/
  getRegisteredCommands(): string[];
  }

Command Service Implementation:
@Injectable({ providedIn: 'root' })
export class CommandService implements ICommandService {
private readonly contextService = inject(ContextService);
private readonly eventBus = inject(EventBus);
private readonly logger = inject(LoggingService);

private readonly handlers = new Map<string, CommandHandler>();
private readonly context = 'CommandService';

register<T = any, R = any>(
commandId: string,
handler: CommandHandler<T, R>
): void {
if (this.handlers.has(commandId)) {
this.logger.warn(this.context, `Command ${commandId} already registered`);
return;
}

    this.handlers.set(commandId, handler);
    this.logger.info(this.context, `Command registered: ${commandId}`);

}

execute<T = any, R = any>(
commandId: string,
payload: T
): Observable<CommandResult<R>> {
// 1. Валидация
const handler = this.handlers.get(commandId);
if (!handler) {
return throwError(() => new Error(`Command ${commandId} not registered`));
}

    if (!this.isAvailable(commandId)) {
      return throwError(() => new Error(`Command ${commandId} not available`));
    }

    // 2. Получить контекст
    const context = this.contextService.getContext();

    // 3. Опубликовать событие начала
    this.eventBus.publish({
      type: 'commandRequested',
      payload: { commandId, payload },
      source: 'CommandService'
    });

    // 4. Выполнить команду
    const result$ = from(handler(payload, context)).pipe(
      map(data => ({ success: true, data } as CommandResult<R>)),
      catchError(error => {
        this.eventBus.publish({
          type: 'commandFailed',
          payload: { commandId, error },
          source: 'CommandService'
        });
        return of({ success: false, error } as CommandResult<R>);
      }),
      tap(result => {
        if (result.success) {
          this.eventBus.publish({
            type: 'commandCompleted',
            payload: { commandId, result: result.data },
            source: 'CommandService'
          });
        }
      })
    );

    return result$;

}

isAvailable(commandId: string): boolean {
const context = this.contextService.getContext();

    // Проверка блокировок
    if (context.operationalState.locks.length > 0) {
      return false;
    }

    // Проверка режима readonly
    if (context.mode === 'readonly') {
      return false;
    }

    // Проверка backend
    if (!context.operationalState.backendAvailable) {
      return false;
    }

    return true;

}

getRegisteredCommands(): string[] {
return Array.from(this.handlers.keys());
}
}

Command Examples:
// ===== РЕГИСТРАЦИЯ КОМАНД =====

@Injectable({ providedIn: 'root' })
export class CommandsInitializer {
private readonly commandService = inject(CommandService);
private readonly httpClient = inject(HttpClient);
private readonly contextService = inject(ContextService);
private readonly errorRegistry = inject(ErrorRegistry);

init() {
// Команда: Save
this.commandService.register('save', (payload, context) => {
const url = `/api/${context.activeArea.entityId}`;

      return this.httpClient.post(url, payload).pipe(
        tap(() => {
          // Успех → очистить dirty
          this.contextService.updateDataState({
            dirty: false,
            operation: null
          });
        }),
        catchError(error => {
          // Ошибка уже обработана HttpErrorInterceptor
          return throwError(() => error);
        })
      );
    });

    // Команда: Delete
    this.commandService.register('delete', (payload: { id: string }, context) => {
      const url = `/api/${context.activeArea.entityId}/${payload.id}`;

      return this.httpClient.delete(url);
    });

    // Команда: Refresh
    this.commandService.register('refresh', (payload, context) => {
      const url = `/api/${context.activeArea.entityId}`;

      return this.httpClient.get(url);
    });

    // Команда: Export
    this.commandService.register('export', (payload: { format: 'csv' | 'xlsx' }, context) => {
      const url = `/api/${context.activeArea.entityId}/export?format=${payload.format}`;

      return this.httpClient.get(url, { responseType: 'blob' });
    });

}
}

// ===== ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТАХ =====

@Component({
selector: 'app-user-form'
})
export class UserFormComponent {
private readonly commandService = inject(CommandService);

canSave = computed(() => this.commandService.isAvailable('save'));

onSave() {
this.commandService.execute('save', this.formValue)
.subscribe({
next: (result) => {
if (result.success) {
console.log('Saved successfully');
} else {
console.error('Save failed', result.error);
}
}
});
}
}

3.5 Icon Provider
Назначение:
Icon Provider — это абстракция для работы с иконками, позволяющая использовать разные источники (ng-zorro, SVG, custom) через единый API.
Интерфейсы:
// ===== ICON PROVIDER CORE =====

/\*\*

- Тип иконки
  \*/
  export type IconType =
  | 'nz-icon' // ng-zorro icon
  | 'svg' // SVG inline/sprite
  | 'custom'; // Будущая библиотека

/\*\*

- Описание иконки
  \*/
  export interface IconDescriptor {
  // Тип иконки
  type: IconType;

// Ключ/идентификатор иконки
key: string;

// Дополнительные параметры (зависит от типа)
options?: IconOptions;
}

export interface IconOptions {
// Для ng-zorro
theme?: 'fill' | 'outline' | 'twotone';

// Для SVG
svgPath?: string;
viewBox?: string;

// Общие
size?: string; // '16px', '24px'
color?: string;
className?: string;
}

/\*\*

- Результат разрешения иконки
  \*/
  export interface ResolvedIcon {
  type: IconType;
  content: string; // HTML content или ng-zorro name
  className?: string;
  }

Icon Provider API:
/\*\*

- Сервис Icon Provider (v1.0 - только ng-zorro)
  \*/
  export interface IIconProvider {
  /\*\*
  - Получить иконку по ключу
    \*/
    resolve(iconKey: string): ResolvedIcon;

/\*\*

- Зарегистрировать иконку
  \*/
  register(iconKey: string, descriptor: IconDescriptor): void;

/\*\*

- Проверить наличие иконки
  \*/
  has(iconKey: string): boolean;

/\*\*

- Получить fallback иконку
  \*/
  getFallback(): ResolvedIcon;
  }

Icon Provider Implementation (v1.0):
@Injectable({ providedIn: 'root' })
export class IconProvider implements IIconProvider {
private readonly registry = new Map<string, IconDescriptor>();
private readonly logger = inject(LoggingService);
private readonly context = 'IconProvider';

constructor() {
this.registerDefaults();
}

resolve(iconKey: string): ResolvedIcon {
const descriptor = this.registry.get(iconKey);

    if (!descriptor) {
      this.logger.warn(this.context, `Icon ${iconKey} not found, using fallback`);
      return this.getFallback();
    }

    // v1.0 - только ng-zorro
    if (descriptor.type === 'nz-icon') {
      return {
        type: 'nz-icon',
        content: descriptor.key,
        className: descriptor.options?.className
      };
    }

    return this.getFallback();

}

register(iconKey: string, descriptor: IconDescriptor): void {
this.registry.set(iconKey, descriptor);
}

has(iconKey: string): boolean {
return this.registry.has(iconKey);
}

getFallback(): ResolvedIcon {
return {
type: 'nz-icon',
content: 'question-circle',
className: 'icon-fallback'
};
}

private registerDefaults() {
// Системные иконки
this.register('icon-save', { type: 'nz-icon', key: 'save' });
this.register('icon-delete', { type: 'nz-icon', key: 'delete' });
this.register('icon-refresh', { type: 'nz-icon', key: 'reload' });
this.register('icon-export', { type: 'nz-icon', key: 'download' });
this.register('icon-edit', { type: 'nz-icon', key: 'edit' });
this.register('icon-view', { type: 'nz-icon', key: 'eye' });
this.register('icon-close', { type: 'nz-icon', key: 'close' });
this.register('icon-settings', { type: 'nz-icon', key: 'setting' });

    // Ошибки
    this.register('icon-error', { type: 'nz-icon', key: 'close-circle', options: { theme: 'fill' } });
    this.register('icon-warning', { type: 'nz-icon', key: 'warning', options: { theme: 'fill' } });
    this.register('icon-success', { type: 'nz-icon', key: 'check-circle', options: { theme: 'fill' } });
    this.register('icon-info', { type: 'nz-icon', key: 'info-circle', options: { theme: 'fill' } });

    // Навигация
    this.register('icon-menu', { type: 'nz-icon', key: 'menu' });
    this.register('icon-home', { type: 'nz-icon', key: 'home' });
    this.register('icon-back', { type: 'nz-icon', key: 'arrow-left' });
    this.register('icon-forward', { type: 'nz-icon', key: 'arrow-right' });
    this.register('icon-up', { type: 'nz-icon', key: 'arrow-up' });
    this.register('icon-down', { type: 'nz-icon', key: 'arrow-down' });

}
}

// ===== ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТАХ =====

@Component({
selector: 'app-button',
template: `    @if (icon(); as iconData) {
      @if (iconData.type === 'nz-icon') {
        <span nz-icon [nzType]="iconData.content" [class]="iconData.className"></span>
      }
    }
    <span class="btn-text"><ng-content></ng-content></span>
 `
})
export class ButtonComponent {
private readonly iconProvider = inject(IconProvider);

@Input() iconKey?: string;

icon = computed(() => {
if (!this.iconKey) return null;
return this.iconProvider.resolve(this.iconKey);
});
}

ЧАСТЬ 4: LAYOUT КОМПОНЕНТЫ
4.1 Header
Назначение:
Header — это статическая верхняя полоса идентификации системы и пользователя. Header НЕ участвует в управлении интерфейсом и НЕ отражает состояние приложения.
Ответственность Header:
✅ ЧТО ДЕЛАЕТ:
• Отображает логотип/название системы
• Показывает информацию о текущем пользователе
• Предоставляет пользовательское меню (Profile/Logout)
• Глобальные действия (Settings, Help)

❌ ЧТО НЕ ДЕЛАЕТ:
• Управление layout (сворачивание sidebar)
• Навигация по разделам
• Контекст страницы
• Breadcrumbs
• Статусы
• Ошибки
• Валидация
• Сохранение данных

Интерфейсы:
// ===== HEADER INTERFACES =====

/\*\*

- Конфигурация Header
  \*/
  export interface HeaderConfig {
  branding: HeaderBranding;
  actions: HeaderAction[];
  user?: HeaderUser;
  state?: HeaderState;
  }

/\*\*

- Брендинг (логотип/название)
  \*/
  export interface HeaderBranding {
  // URL логотипа (опционально)
  logoUrl?: string;

// Название системы (обязательно)
title: string;

// Подзаголовок (опционально)
subtitle?: string;

// Ссылка при клике на логотип
href?: string;
}

/\*\*

- Глобальное действие в Header
  \*/
  export interface HeaderAction {
  // Уникальный ID действия
  id: string;

// Иконка (через Icon Provider)
icon?: string;

// Текст (опционально - может быть icon-only)
label?: string;

// Отключено?
disabled?: boolean;

// Видимо?
visible?: boolean;

// Обработчик клика
handler: () => void;

// Tooltip
tooltip?: string;
}

/\*\*

- Информация о пользователе
  \*/
  export interface HeaderUser {
  // ID пользователя
  id: string;

// Имя пользователя
name: string;

// URL аватара (опционально)
avatarUrl?: string;

// Роль пользователя (отображение)
role?: string;

// Email (опционально)
email?: string;
}

/\*\*

- Состояние Header (минимальное)
  \*/
  export interface HeaderState {
  // Режим только для чтения (визуальная индикация)
  readonly?: boolean;

// Отключен (вся панель)
disabled?: boolean;
}

/\*\*

- Пользовательское меню
  \*/
  export interface UserMenuItem {
  id: string;
  label: string;
  icon?: string;
  handler: () => void;
  divider?: boolean; // Разделитель после пункта
  }

Header Component:
// ===== HEADER COMPONENT =====

@Component({
selector: 'app-admin-header',
standalone: true,
imports: [CommonModule, NzIconModule, NzDropDownModule, NzAvatarModule],
template: `
<header class="admin-header" [class.is-readonly]="config().state?.readonly">
<!-- Branding -->
<div class="header-brand">
@if (config().branding.logoUrl) {
<img
[src]="config().branding.logoUrl"
alt="Logo"
class="header-logo"
/>
}
<div class="header-titles">
<h1 class="header-title">{{ config().branding.title }}</h1>
@if (config().branding.subtitle) {
<span class="header-subtitle">{{ config().branding.subtitle }}</span>
}
</div>
</div>

      <!-- Spacer -->
      <div class="header-spacer"></div>

      <!-- Actions -->
      <div class="header-actions">
        @for (action of visibleActions(); track action.id) {
          <button
            class="header-action-btn"
            [disabled]="action.disabled"
            [nz-tooltip]="action.tooltip"
            (click)="action.handler()"
          >
            @if (action.icon) {
              <app-icon [iconKey]="action.icon"></app-icon>
            }
            @if (action.label) {
              <span class="action-label">{{ action.label }}</span>
            }
          </button>
        }
      </div>

      <!-- User Menu -->
      @if (config().user; as user) {
        <div class="header-user" nz-dropdown [nzDropdownMenu]="userMenu">
          <nz-avatar
            [nzSrc]="user.avatarUrl"
            [nzText]="getInitials(user.name)"
            class="user-avatar"
          ></nz-avatar>
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            @if (user.role) {
              <span class="user-role">{{ user.role }}</span>
            }
          </div>
        </div>

        <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu>
            @for (item of userMenuItems(); track item.id) {
              @if (item.divider) {
                <li nz-menu-divider></li>
              }
              <li nz-menu-item (click)="item.handler()">
                @if (item.icon) {
                  <app-icon [iconKey]="item.icon"></app-icon>
                }
                {{ item.label }}
              </li>
            }
          </ul>
        </nz-dropdown-menu>
      }
    </header>

`,
  styles: [`
.admin-header {
display: flex;
align-items: center;
height: 64px;
padding: 0 24px;
background: #fff;
border-bottom: 1px solid #e8e8e8;

      &.is-readonly::after {
        content: '🔒';
        margin-left: 8px;
      }
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-logo {
      height: 40px;
      width: auto;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
    }

    .header-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
    }

    .header-subtitle {
      font-size: 12px;
      color: #8c8c8c;
    }

    .header-spacer {
      flex: 1;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      margin-right: 16px;
    }

    .header-action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;

      &:hover:not(:disabled) {
        background: #f5f5f5;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .header-user {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background 0.2s;

      &:hover {
        background: #f5f5f5;
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
    }

    .user-role {
      font-size: 12px;
      color: #8c8c8c;
    }

`]
})
export class AdminHeaderComponent {
private readonly router = inject(Router);
private readonly authService = inject(AuthService);

config = input.required<HeaderConfig>();

visibleActions = computed(() =>
this.config().actions.filter(a => a.visible !== false)
);

userMenuItems = computed<UserMenuItem[]>(() => [
{
id: 'profile',
label: 'Профиль',
icon: 'icon-user',
handler: () => this.router.navigate(['/profile'])
},
{
id: 'settings',
label: 'Настройки',
icon: 'icon-settings',
handler: () => this.router.navigate(['/settings'])
},
{
id: 'divider',
label: '',
handler: () => {},
divider: true
},
{
id: 'logout',
label: 'Выйти',
icon: 'icon-logout',
handler: () => this.authService.logout()
}
]);

getInitials(name: string): string {
return name
.split(' ')
.map(part => part[0])
.join('')
.toUpperCase()
.slice(0, 2);
}
}

Header Configuration Example:
// ===== ИСПОЛЬЗОВАНИЕ В APP =====

@Component({
selector: 'app-admin-layout',
template: `    <app-admin-header [config]="headerConfig()"></app-admin-header>
    <!-- ... rest of layout ... -->
 `
})
export class AdminLayoutComponent {
private readonly router = inject(Router);
private readonly contextService = inject(ContextService);

headerConfig = computed<HeaderConfig>(() => {
const context = this.contextService.getContext();

    return {
      branding: {
        logoUrl: '/assets/logo.svg',
        title: 'Admin Panel',
        subtitle: 'Enterprise CMS'
      },
      actions: [
        {
          id: 'refresh',
          icon: 'icon-refresh',
          tooltip: 'Обновить',
          handler: () => window.location.reload()
        },
        {
          id: 'help',
          icon: 'icon-help',
          tooltip: 'Справка',
          handler: () => this.router.navigate(['/help'])
        },
        {
          id: 'settings',
          icon: 'icon-settings',
          tooltip: 'Настройки',
          handler: () => this.router.navigate(['/settings'])
        }
      ],
      user: {
        id: context.permissions.user.id,
        name: context.permissions.user.name,
        email: context.permissions.user.email,
        role: context.permissions.user.roles[0],
        avatarUrl: '/assets/avatar.jpg'
      },
      state: {
        readonly: context.mode === 'readonly'
      }
    };

});
}

4.2 Left Sidebar (Navigation)
Назначение:
Left Sidebar — это навигационная панель для перехода между разделами админ-панели с поддержкой иерархических меню.
Состояния Sidebar:
┌──────────────────────────────────────────────────┐
│ СОСТОЯНИЕ │ ОПИСАНИЕ │
├──────────────────────────────────────────────────┤
│ Collapsed │ Только иконки │
│ │ Текст скрыт │
│ │ Подменю недоступны │
├──────────────────────────────────────────────────┤
│ Expanded │ Иконки + текст │
│ │ Подменю закрыты │
│ │ Кнопка закрытия скрыта │
├──────────────────────────────────────────────────┤
│ Expanded + Submenu │ Sidebar развернут │
│ │ Одно подменю открыто │
│ │ Кнопка закрытия видна │
└──────────────────────────────────────────────────┘

Интерфейсы:
// ===== LEFT SIDEBAR INTERFACES =====

/\*\*

- Состояние Sidebar
  \*/
  export type SidebarState = 'collapsed' | 'expanded';

/\*\*

- Конфигурация Sidebar
  \*/
  export interface SidebarConfig {
  // Текущее состояние
  state: SidebarState;

// Группы меню
menuGroups: MenuGroup[];

// ID открытого подменю (если есть)
openSubmenuId?: string;

// ID активного пункта меню
activeMenuId?: string;
}

/\*\*

- Группа меню (опционально для визуального разделения)
  \*/
  export interface MenuGroup {
  id: string;
  title?: string; // Заголовок группы (опционально)
  items: MenuItem[];
  }

/\*\*

- Пункт меню
  \*/
  export interface MenuItem {
  // Уникальный ID
  id: string;

// Иконка (через Icon Provider)
icon: string;

// Название
label: string;

// Тип пункта
type: 'link' | 'submenu';

// Для type='link': маршрут
route?: string;

// Для type='submenu': вложенные пункты
submenu?: SubMenuItem[];

// Состояния
disabled?: boolean;
visible?: boolean;

// Badge (опционально)
badge?: MenuBadge;
}

/\*\*

- Пункт подменю
  \*/
  export interface SubMenuItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  badge?: MenuBadge;
  }

/\*\*

- Badge для пункта меню
  \*/
  export interface MenuBadge {
  value: number | string;
  intent?: 'default' | 'info' | 'warning' | 'error';
  }

/\*\*

- События Sidebar
  \*/
  export interface SidebarEvents {
  onToggle: (state: SidebarState) => void;
  onMenuClick: (menuId: string) => void;
  onSubmenuClick: (menuId: string, submenuId: string) => void;
  onCloseSubmenu: () => void;
  }

Sidebar State Machine:
СОСТОЯНИЯ И ПЕРЕХОДЫ:

1. COLLAPSED → EXPANDED
   Триггер: Клик на toggle button
   Действие:

   - state = 'expanded'
   - Показать текст пунктов
   - Разрешить открытие подменю

2. EXPANDED → COLLAPSED
   Триггер: Клик на toggle button
   Действие:

   - state = 'collapsed'
   - Скрыть текст
   - Закрыть все подменю
   - openSubmenuId = null

3. КЛИК ПО ПУНКТУ БЕЗ ПОДМЕНЮ (type='link')
   Условие: state = 'expanded'
   Действие:

   - Закрыть текущее подменю (если было)
   - Навигация на route
   - activeMenuId = menuId
   - Event: 'navigationStarted'

4. КЛИК ПО ПУНКТУ С ПОДМЕНЮ (type='submenu')
   Условие: state = 'expanded'
   Действие:

   - Если подменю закрыто:
     - Закрыть другое подменю (если было)
     - openSubmenuId = menuId
     - Показать кнопку "Закрыть подменю"
   - Если подменю уже открыто:
     - openSubmenuId = null
     - Скрыть кнопку "Закрыть подменю"

5. КЛИК ПО ПУНКТУ ПОДМЕНЮ
   Действие:

   - Навигация на route
   - Подменю остаётся открытым
   - activeMenuId = parentMenuId
   - Event: 'navigationStarted'

6. КЛИК НА "ЗАКРЫТЬ ПОДМЕНЮ"
   Действие:
   - openSubmenuId = null
   - Скрыть кнопку
   - Sidebar остаётся expanded
   - activeMenuId сохраняется

Sidebar Component:
// ===== LEFT SIDEBAR COMPONENT =====

@Component({
selector: 'app-left-sidebar',
standalone: true,
imports: [CommonModule, RouterModule, NzIconModule, NzBadgeModule],
template: `
<aside
class="left-sidebar"
[class.is-collapsed]="state() === 'collapsed'"
[class.is-expanded]="state() === 'expanded'" >
<!-- Toggle Button -->
<button
class="sidebar-toggle"
(click)="toggleSidebar()" >
<app-icon [iconKey]="state() === 'collapsed' ? 'icon-menu-unfold' : 'icon-menu-fold'"></app-icon>
</button>

      <!-- Close Submenu Button -->
      @if (showCloseSubmenuButton()) {
        <button
          class="sidebar-close-submenu"
          (click)="closeSubmenu()"
        >
          <app-icon iconKey="icon-close"></app-icon>
          <span class="close-submenu-text">Закрыть подменю</span>
        </button>
        <div class="sidebar-divider"></div>
      }

      <!-- Menu Groups -->
      <nav class="sidebar-nav">
        @for (group of config().menuGroups; track group.id) {
          <div class="sidebar-group">
            @if (group.title && state() === 'expanded') {
              <div class="sidebar-group-title">{{ group.title }}</div>
            }

            @for (item of visibleItems(group.items); track item.id) {
              <!-- Menu Item -->
              <div
                class="sidebar-item"
                [class.is-active]="isActive(item)"
                [class.is-disabled]="item.disabled"
                [class.has-submenu]="item.type === 'submenu'"
                [class.is-open]="isSubmenuOpen(item.id)"
              >
                <button
                  class="sidebar-item-btn"
                  [disabled]="item.disabled"
                  (click)="handleMenuClick(item)"
                >
                  <app-icon [iconKey]="item.icon" class="sidebar-item-icon"></app-icon>
                  @if (state() === 'expanded') {
                    <span class="sidebar-item-label">{{ item.label }}</span>
                  }
                  @if (item.badge) {
                    <nz-badge
                      [nzCount]="item.badge.value"
                      [nzStyle]="getBadgeStyle(item.badge.intent)"
                      class="sidebar-item-badge"
                    ></nz-badge>
                  }
                  @if (item.type === 'submenu' && state() === 'expanded') {
                    <app-icon
                      [iconKey]="isSubmenuOpen(item.id) ? 'icon-down' : 'icon-right'"
                      class="sidebar-item-arrow"
                    ></app-icon>
                  }
                </button>

                <!-- Submenu -->
                @if (item.type === 'submenu' && isSubmenuOpen(item.id) && item.submenu) {
                  <div class="sidebar-submenu">
                    @for (subitem of visibleItems(item.submenu); track subitem.id) {

                        class="sidebar-subitem"
                        [routerLink]="subitem.route"
                        routerLinkActive="is-active"
                        [class.is-disabled]="subitem.disabled"
                      >
                        @if (subitem.icon) {
                          <app-icon [iconKey]="subitem.icon" class="sidebar-subitem-icon"></app-icon>
                        }
                        <span class="sidebar-subitem-label">{{ subitem.label }}</span>
                        @if (subitem.badge) {
                          <nz-badge
                            [nzCount]="subitem.badge.value"
                            [nzStyle]="getBadgeStyle(subitem.badge.intent)"
                          ></nz-badge>
                        }
                      </a>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </nav>
    </aside>

`,
  styles: [`
.left-sidebar {
width: 64px; /_ collapsed _/
height: 100%;
background: #001529;
transition: width 0.2s;
overflow-x: hidden;
display: flex;
flex-direction: column;

      &.is-expanded {
        width: 240px;
      }
    }

    .sidebar-toggle {
      height: 48px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.65);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #fff;
      }
    }

    .sidebar-close-submenu {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      height: 40px;
      padding: 0 16px;
      border: none;
      background: #002140;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #003a66;
      }
    }

    .sidebar-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 8px 0;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .sidebar-group {
      margin-bottom: 16px;
    }

    .sidebar-group-title {
      padding: 8px 16px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.45);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sidebar-item {
      position: relative;

      &.is-active > .sidebar-item-btn {
        background: #1890ff;
        color: #fff;
      }

      &.is-disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }

    .sidebar-item-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      height: 48px;
      padding: 0 16px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.65);
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }

    .sidebar-item-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .sidebar-item-label {
      flex: 1;
      text-align: left;
      white-space: nowrap;
    }

    .sidebar-item-arrow {
      font-size: 12px;
      transition: transform 0.2s;
    }

    .sidebar-submenu {
      background: #000c17;
      padding: 4px 0;
    }

    .sidebar-subitem {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px 0 48px;
      color: rgba(255, 255, 255, 0.65);
      text-decoration: none;
      transition: all 0.2s;

      &:hover:not(.is-disabled) {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }

      &.is-active {
        background: #1890ff;
        color: #fff;
      }

      &.is-disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }

    .sidebar-subitem-icon {
      font-size: 14px;
    }

    .sidebar-subitem-label {
      flex: 1;
      font-size: 14px;
    }

`]
})
export class LeftSidebarComponent {
private readonly router = inject(Router);
private readonly eventBus = inject(EventBus);

config = input.required<SidebarConfig>();

state = signal<SidebarState>('expanded');
openSubmenuId = signal<string | null>(null);

showCloseSubmenuButton = computed(() =>
this.state() === 'expanded' && this.openSubmenuId() !== null
);

ngOnInit() {
this.state.set(this.config().state);
this.openSubmenuId.set(this.config().openSubmenuId ?? null);
}

toggleSidebar() {
const newState = this.state() === 'collapsed' ? 'expanded' : 'collapsed';
this.state.set(newState);

    if (newState === 'collapsed') {
      this.openSubmenuId.set(null);
    }

    this.eventBus.publish({
      type: 'sidebarToggled',
      payload: { state: newState }
    });

}

handleMenuClick(item: MenuItem) {
if (item.disabled) return;

    if (item.type === 'link') {
      // Закрыть подменю и перейти на маршрут
      this.openSubmenuId.set(null);
      this.router.navigate([item.route]);

      this.eventBus.publish({
        type: 'navigationStarted',
        payload: { route: item.route, menuId: item.id }
      });
    } else if (item.type === 'submenu') {
      // Переключить подменю
      if (this.openSubmenuId() === item.id) {
        this.openSubmenuId.set(null);
      } else {
        this.openSubmenuId.set(item.id);
      }

      this.eventBus.publish({
        type: 'submenuToggled',
        payload: { menuId: item.id, open: this.openSubmenuId() === item.id }
      });
    }

}

closeSubmenu() {
this.openSubmenuId.set(null);

    this.eventBus.publish({
      type: 'submenuClosed',
      payload: {}
    });

}

isSubmenuOpen(menuId: string): boolean {
return this.openSubmenuId() === menuId;
}

isActive(item: MenuItem): boolean {
if (item.type === 'link') {
return this.router.url === item.route;
}

    // Если это submenu, проверить активен ли хоть один subitem
    if (item.type === 'submenu' && item.submenu) {
      return item.submenu.some(sub => this.router.url === sub.route);
    }

    return false;

}

visibleItems<T extends MenuItem | SubMenuItem>(items: T[]): T[] {
return items.filter(item => item.visible !== false);
}

getBadgeStyle(intent?: 'default' | 'info' | 'warning' | 'error') {
const colors = {
default: { backgroundColor: '#d9d9d9' },
info: { backgroundColor: '#1890ff' },
warning: { backgroundColor: '#faad14' },
error: { backgroundColor: '#ff4d4f' }
};
return colors[intent || 'default'];
}
}

Sidebar Configuration Example:
// ===== ПРИМЕР КОНФИГУРАЦИИ SIDEBAR =====

const sidebarConfig: SidebarConfig = {
state: 'expanded',
menuGroups: [
{
id: 'main',
title: 'Основное',
items: [
{
id: 'dashboard',
icon: 'icon-dashboard',
label: 'Дашборд',
type: 'link',
route: '/dashboard'
},
{
id: 'analytics',
icon: 'icon-chart',
label: 'Аналитика',
type: 'link',
route: '/analytics'
}
]
},
{
id: 'admin',
title: 'Администрирование',
items: [
{
id: 'users',
icon: 'icon-user',
label: 'Пользователи',
type: 'submenu',
submenu: [
{
id: 'users-list',
label: 'Список пользователей',
route: '/admin/users'
},
{
id: 'users-roles',
label: 'Роли',
route: '/admin/users/roles'
},
{
id: 'users-permissions',
label: 'Права доступа',
route: '/admin/users/permissions'
}
]
},
{
id: 'content',
icon: 'icon-file',
label: 'Контент',
type: 'submenu',
submenu: [
{
id: 'content-pages',
label: 'Страницы',
route: '/admin/content/pages'
},
{
id: 'content-posts',
label: 'Публикации',
route: '/admin/content/posts',
badge: { value: 5, intent: 'warning' }
},
{
id: 'content-media',
label: 'Медиа',
route: '/admin/content/media'
}
]
},
{
id: 'settings',
icon: 'icon-settings',
label: 'Настройки',
type: 'link',
route: '/admin/settings'
}
]
}
]
};

4.3 Right Panel (ГИБРИД)
Назначение:
Right Panel — это контекстная панель с гибридной архитектурой: динамическая контекстная зона + статичная зона меню.
Архитектура Right Panel:
┌─────────────────────────────────────┐
│ RIGHT PANEL (ГИБРИД) │
├─────────────────────────────────────┤
│ │
│ [КОНТЕКСТНАЯ ЗОНА] ← Динамическая │
│ ┌───────────────────────────────┐ │
│ │ Selected Row Properties │ │
│ │ • ID: 123 │ │
│ │ • Status: Active │ │
│ │ • Created: 2024-01-15 │ │
│ │ • Modified: 2024-12-15 │ │
│ │ │ │
│ │ [Quick Actions] │ │
│ │ • Edit │ │
│ │ • Duplicate │ │
│ │ • Delete │ │
│ └───────────────────────────────┘ │
│ │
│ ────────────────────────────────── │
│ │
│ [МЕНЮ ЗОНА] ← Статическая │
│ • Actions [>] │
│ • Errors [>] │
│ • History [>] │
│ • Debug [>] │
│ │
└─────────────────────────────────────┘

ПОВЕДЕНИЕ:

- Контекстная зона: появляется при selection
- Меню зона: всегда видна
- Клик на меню → SubMenu внутри зоны
- Нет selection → контекст скрыт

Интерфейсы:
// ===== RIGHT PANEL INTERFACES =====

/\*\*

- Конфигурация Right Panel
  \*/
  export interface RightPanelConfig {
  // Текущее состояние панели
  state: RightPanelState;

// Контекстная зона (динамическая)
contextZone?: ContextZone;

// Меню зона (статическая)
menuZone: MenuZone;
}

/\*\*

- Состояние Right Panel
  \*/
  export interface RightPanelState {
  // Видимость панели
  visible: boolean;

// Ширина панели (px)
width?: number;

// ID активной панели в меню зоне (если открыта)
activePanelId?: string;
}

/\*\*

- Контекстная зона (появляется при selection)
  \*/
  export interface ContextZone {
  // Тип контекста
  type: 'row-properties' | 'item-details' | 'custom';

// Заголовок
title: string;

// Свойства для отображения
properties?: ContextProperty[];

// Быстрые действия
quickActions?: QuickAction[];

// Произвольный контент (для custom type)
customContent?: any;
}

export interface ContextProperty {
label: string;
value: string | number | Date;
type?: 'text' | 'date' | 'number' | 'link';
href?: string; // Для type='link'
}

export interface QuickAction {
id: string;
label: string;
icon?: string;
handler: () => void;
disabled?: boolean;
}

/\*\*

- Меню зона (статическая)
  \*/
  export interface MenuZone {
  // Панели меню
  panels: RightPanel[];
  }

/\*\*

- Панель в меню зоне
  \*/
  export interface RightPanel {
  // Уникальный ID панели
  id: string;

// Тип панели
type: RightPanelType;

// Название панели
title: string;

// Иконка
icon?: string;

// Видимость
visible?: boolean;

// Подменю (раскрывается при клике)
subMenu?: RightSubMenu;
}

export type RightPanelType =
| 'actions' // Действия
| 'errors' // Ошибки
| 'history' // История
| 'debug' // Отладка
| 'info' // Информация
| 'custom'; // Произвольный тип

/\*\*

- Подменю панели
  \*/
  export interface RightSubMenu {
  // Заголовок подменю
  header?: RightSubMenuHeader;

// Секции подменю
sections: RightSubMenuSection[];
}

export interface RightSubMenuHeader {
title: string;
closable: boolean;
}

export interface RightSubMenuSection {
id: string;
title?: string;
items: RightSubMenuItem[];
}

/\*\*

- Элемент подменю
  \*/
  export interface RightSubMenuItem {
  id: string;
  label: string;
  value?: string;
  level?: 'info' | 'warning' | 'error';
  expandable?: boolean;
  expanded?: boolean;
  meta?: Record<string, any>;
  handler?: () => void;
  }

Right Panel Component:
// ===== RIGHT PANEL COMPONENT =====

@Component({
selector: 'app-right-panel',
standalone: true,
imports: [CommonModule, NzCollapseModule, NzIconModule],
template: `
<aside
class="right-panel"
[class.is-visible]="config().state.visible"
[style.width.px]="config().state.width || 320" >
<!-- Контекстная зона (если есть) -->
@if (config().contextZone; as context) {
<div class="context-zone">
<div class="context-header">
<h3 class="context-title">{{ context.title }}</h3>
</div>

          <!-- Properties -->
          @if (context.properties && context.properties.length > 0) {
            <div class="context-properties">
              @for (prop of context.properties; track prop.label) {
                <div class="context-property">
                  <span class="property-label">{{ prop.label }}</span>
                  @switch (prop.type) {
                    @case ('link') {
                      <a [href]="prop.href" class="property-value is-link">
                        {{ prop.value }}
                      </a>
                    }
                    @case ('date') {
                      <span class="property-value">
                        {{ prop.value | date:'dd.MM.yyyy HH:mm' }}
                      </span>
                    }
                    @default {
                      <span class="property-value">{{ prop.value }}</span>
                    }
                  }
                </div>
              }
            </div>
          }

          <!-- Quick Actions -->
          @if (context.quickActions && context.quickActions.length > 0) {
            <div class="context-actions">
              <div class="actions-title">Быстрые действия</div>
              @for (action of context.quickActions; track action.id) {
                <button
                  class="action-btn"
                  [disabled]="action.disabled"
                  (click)="action.handler()"
                >
                  @if (action.icon) {
                    <app-icon [iconKey]="action.icon"></app-icon>
                  }
                  <span>{{ action.label }}</span>
                </button>
              }
            </div>
          }
        </div>

        <div class="zone-divider"></div>
      }

      <!-- Меню зона (всегда видна) -->
      <div class="menu-zone">
        @for (panel of visiblePanels(); track panel.id) {
          <div
            class="menu-panel"
            [class.is-active]="isActive(panel.id)"
          >
            <button
              class="panel-trigger"
              (click)="togglePanel(panel.id)"
            >
              @if (panel.icon) {
                <app-icon [iconKey]="panel.icon" class="panel-icon"></app-icon>
              }
              <span class="panel-title">{{ panel.title }}</span>
              <app-icon
                [iconKey]="isActive(panel.id) ? 'icon-down' : 'icon-right'"
                class="panel-arrow"
              ></app-icon>
            </button>

            <!-- SubMenu -->
            @if (isActive(panel.id) && panel.subMenu) {
              <div class="panel-submenu">
                @if (panel.subMenu.header) {
                  <div class="submenu-header">
                    <span class="submenu-title">{{ panel.subMenu.header.title }}</span>
                    @if (panel.subMenu.header.closable) {
                      <button
                        class="submenu-close"
                        (click)="closePanel()"
                      >
                        <app-icon iconKey="icon-close"></app-icon>
                      </button>
                    }
                  </div>
                }

                @for (section of panel.subMenu.sections; track section.id) {
                  <div class="submenu-section">
                    @if (section.title) {
                      <div class="section-title">{{ section.title }}</div>
                    }

                    @for (item of section.items; track item.id) {
                      <div
                        class="submenu-item"
                        [class.is-warning]="item.level === 'warning'"
                        [class.is-error]="item.level === 'error'"
                        [class.is-clickable]="item.handler"
                        (click)="item.handler && item.handler()"
                      >
                        <div class="item-label">{{ item.label }}</div>
                        @if (item.value) {
                          <div class="item-value">{{ item.value }}</div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </aside>

`,
  styles: [`
.right-panel {
height: 100%;
background: #fafafa;
border-left: 1px solid #e8e8e8;
display: flex;
flex-direction: column;
overflow-y: auto;
transform: translateX(100%);
transition: transform 0.3s;

      &.is-visible {
        transform: translateX(0);
      }
    }

    /* КОНТЕКСТНАЯ ЗОНА */
    .context-zone {
      background: #fff;
      padding: 16px;
      border-bottom: 1px solid #e8e8e8;
    }

    .context-header {
      margin-bottom: 16px;
    }

    .context-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .context-properties {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .context-property {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .property-label {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 500;
    }

    .property-value {
      font-size: 14px;
      color: #262626;

      &.is-link {
        color: #1890ff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .context-actions {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .actions-title {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 8px;

      &:hover:not(:disabled) {
        border-color: #1890ff;
        color: #1890ff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .zone-divider {
      height: 8px;
      background: #f0f0f0;
    }

    /* МЕНЮ ЗОНА */
    .menu-zone {
      flex: 1;
      padding: 8px;
    }

    .menu-panel {
      margin-bottom: 4px;
      background: #fff;
      border-radius: 4px;
      overflow: hidden;

      &.is-active {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .panel-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f5f5f5;
      }
    }

    .panel-icon {
      font-size: 16px;
    }

    .panel-title {
      flex: 1;
      text-align: left;
      font-weight: 500;
    }

    .panel-arrow {
      font-size: 12px;
      transition: transform 0.2s;
    }

    .panel-submenu {
      border-top: 1px solid #f0f0f0;
      padding: 12px;
    }

    .submenu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }

    .submenu-title {
      font-weight: 600;
      font-size: 14px;
    }

    .submenu-close {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;
      color: #8c8c8c;

      &:hover {
        color: #262626;
      }
    }

    .submenu-section {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .section-title {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 500;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .submenu-item {
      padding: 8px 12px;
      margin-bottom: 4px;
      border-radius: 4px;
      background: #fafafa;

      &.is-clickable {
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f0f0f0;
        }
      }

      &.is-warning {
        background: #fffbe6;
        border-left: 3px solid #faad14;
      }

      &.is-error {
        background: #fff2f0;
        border-left: 3px solid #ff4d4f;
      }
    }

    .item-label {
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .item-value {
      font-size: 12px;
      color: #8c8c8c;
    }

`]
})
export class RightPanelComponent {
private readonly eventBus = inject(EventBus);

config = input.required<RightPanelConfig>();

activePanelId = signal<string | null>(null);

ngOnInit() {
this.activePanelId.set(this.config().state.activePanelId ?? null);
}

visiblePanels() {
return this.config().menuZone.panels.filter(p => p.visible !== false);
}

isActive(panelId: string): boolean {
return this.activePanelId() === panelId;
}

togglePanel(panelId: string) {
if (this.activePanelId() === panelId) {
this.activePanelId.set(null);
this.eventBus.publish({
type: 'rightPanelClosed',
payload: { panelId }
});
} else {
this.activePanelId.set(panelId);
this.eventBus.publish({
type: 'rightPanelOpened',
payload: { panelId }
});
}
}

closePanel() {
this.activePanelId.set(null);
this.eventBus.publish({
type: 'rightPanelClosed',
payload: {}
});
}
}

Right Panel Configuration (TypeScript):
// ===== КОНФИГУРАЦИЯ RIGHT PANEL =====

export const rightPanelConfig: RightPanelConfig = {
state: {
visible: true,
width: 320
},

// Контекстная зона (динамическая - появляется при selection)
contextZone: {
type: 'row-properties',
title: 'Выбранная строка #123',
properties: [
{ label: 'ID', value: '123', type: 'text' },
{ label: 'Статус', value: 'Active', type: 'text' },
{ label: 'Создано', value: new Date('2024-01-15'), type: 'date' },
{ label: 'Изменено', value: new Date('2024-12-15'), type: 'date' },
{
label: 'Автор',
value: 'John Doe',
type: 'link',
href: '/users/john-doe'
}
],
quickActions: [
{
id: 'edit',
label: 'Редактировать',
icon: 'icon-edit',
handler: () => console.log('Edit')
},
{
id: 'duplicate',
label: 'Дублировать',
icon: 'icon-copy',
handler: () => console.log('Duplicate')
},
{
id: 'delete',
label: 'Удалить',
icon: 'icon-delete',
handler: () => console.log('Delete'),
disabled: false
}
]
},

// Меню зона (статическая)
menuZone: {
panels: [
{
id: 'actions',
type: 'actions',
title: 'Действия',
icon: 'icon-thunderbolt',
subMenu: {
header: {
title: 'Доступные действия',
closable: true
},
sections: [
{
id: 'primary',
title: 'Основные',
items: [
{
id: 'save',
label: 'Сохранить',
handler: () => console.log('Save')
},
{
id: 'export',
label: 'Экспортировать',
handler: () => console.log('Export')
}
]
},
{
id: 'bulk',
title: 'Массовые операции',
items: [
{
id: 'bulk-delete',
label: 'Удалить выбранные',
level: 'warning',
handler: () => console.log('Bulk delete')
}
]
}
]
}
},
{
id: 'errors',
type: 'errors',
title: 'Ошибки',
icon: 'icon-warning',
subMenu: {
header: {
title: 'Ошибки формы',
closable: true
},
sections: [
{
id: 'validation',
title: 'Валидация',
items: [
{
id: 'email-error',
label: 'Email',
value: 'Неверный формат email',
level: 'error'
},
{
id: 'name-warning',
label: 'Имя',
value: 'Слишком короткое имя',
level: 'warning'
}
]
}
]
}
},
{
id: 'history',
type: 'history',
title: 'История',
icon: 'icon-history',
subMenu: {
sections: [
{
id: 'recent',
items: [
{
id: 'h1',
label: 'Обновлено поле "Статус"',
value: '15.12.2024 14:30'
},
{
id: 'h2',
label: 'Создана запись',
value: '15.01.2024 10:00'
}
]
}
]
}
},
{
id: 'debug',
type: 'debug',
title: 'Отладка',
icon: 'icon-bug',
visible: true, // Показывать только в dev mode
subMenu: {
sections: [
{
id: 'technical',
title: 'Техническая информация',
items: [
{
id: 'correlation',
label: 'Correlation ID',
value: 'err_1234567890_abc123'
},
{
id: 'timestamp',
label: 'Timestamp',
value: new Date().toISOString()
}
]
}
]
}
}
]
}
};

Продолжить с 4.4 Footer, 4.5 Global Status Bar?
ЧАСТЬ 4: LAYOUT КОМПОНЕНТЫ (продолжение)
4.4 Footer
Назначение:
Footer — это статическая нижняя полоса для отображения мета-информации о системе. Footer НЕ содержит бизнес-логики и НЕ управляет состоянием.
Ответственность Footer:
✅ ЧТО ДЕЛАЕТ:
• Отображает версию приложения
• Показывает copyright информацию
• Предоставляет ссылки на справку/документацию
• Отображает статичную информацию

❌ ЧТО НЕ ДЕЛАЕТ:
• Статусы системы (это Global Status Bar)
• Пагинация (это Page Footer в Body)
• Действия над данными
• Навигация по разделам
• Отображение ошибок

Интерфейсы:
// ===== FOOTER INTERFACES =====

/\*\*

- Конфигурация Footer
  \*/
  export interface FooterConfig {
  // Информационные блоки
  info: FooterInfo;

// Ссылки
links: FooterLink[];

// Видимость
visible?: boolean;
}

/\*\*

- Информация в Footer
  \*/
  export interface FooterInfo {
  // Версия приложения
  version?: string;

// Copyright текст
copyright?: string;

// Год (если не указан, используется текущий)
year?: number;

// Название компании
company?: string;

// Произвольный текст
customText?: string;
}

/\*\*

- Ссылка в Footer
  \*/
  export interface FooterLink {
  id: string;
  label: string;
  href?: string;
  handler?: () => void;
  external?: boolean; // Открывать в новой вкладке
  icon?: string;
  }

Footer Component:
// ===== FOOTER COMPONENT =====

@Component({
selector: 'app-admin-footer',
standalone: true,
imports: [CommonModule, NzIconModule],
template: `
@if (config().visible !== false) {
<footer class="admin-footer">
<!-- Info Section -->
<div class="footer-info">
@if (config().info.version) {
<span class="footer-version">
v{{ config().info.version }}
</span>
}

          @if (config().info.copyright || config().info.company) {
            <span class="footer-copyright">
              © {{ config().info.year || currentYear }}
              {{ config().info.company || config().info.copyright }}
            </span>
          }

          @if (config().info.customText) {
            <span class="footer-custom">
              {{ config().info.customText }}
            </span>
          }
        </div>

        <!-- Links Section -->
        @if (config().links.length > 0) {
          <div class="footer-links">
            @for (link of config().links; track link.id; let last = $last) {
              @if (link.href) {

                  [href]="link.href"
                  [target]="link.external ? '_blank' : '_self'"
                  [rel]="link.external ? 'noopener noreferrer' : ''"
                  class="footer-link"
                >
                  @if (link.icon) {
                    <app-icon [iconKey]="link.icon"></app-icon>
                  }
                  {{ link.label }}
                  @if (link.external) {
                    <app-icon iconKey="icon-external"></app-icon>
                  }
                </a>
              } @else {
                <button
                  class="footer-link"
                  (click)="link.handler && link.handler()"
                >
                  @if (link.icon) {
                    <app-icon [iconKey]="link.icon"></app-icon>
                  }
                  {{ link.label }}
                </button>
              }

              @if (!last) {
                <span class="footer-separator">|</span>
              }
            }
          </div>
        }
      </footer>
    }

`,
  styles: [`
.admin-footer {
display: flex;
align-items: center;
justify-content: space-between;
height: 48px;
padding: 0 24px;
background: #fafafa;
border-top: 1px solid #e8e8e8;
font-size: 12px;
color: #8c8c8c;
}

    .footer-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .footer-version {
      padding: 2px 8px;
      background: #f0f0f0;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 500;
    }

    .footer-copyright,
    .footer-custom {
      white-space: nowrap;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #8c8c8c;
      text-decoration: none;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        color: #1890ff;
        background: #f0f0f0;
      }
    }

    .footer-separator {
      color: #d9d9d9;
    }

    @media (max-width: 768px) {
      .admin-footer {
        flex-direction: column;
        height: auto;
        padding: 12px 16px;
        gap: 8px;
      }

      .footer-info,
      .footer-links {
        width: 100%;
        justify-content: center;
      }
    }

`]
})
export class AdminFooterComponent {
config = input.required<FooterConfig>();

currentYear = new Date().getFullYear();
}

Footer Configuration Example:
// ===== ПРИМЕР КОНФИГУРАЦИИ FOOTER =====

const footerConfig: FooterConfig = {
visible: true,
info: {
version: '1.0.0',
company: 'Your Company Name',
year: 2025,
customText: 'Enterprise Admin Panel'
},
links: [
{
id: 'help',
label: 'Справка',
icon: 'icon-question',
href: '/help'
},
{
id: 'docs',
label: 'Документация',
icon: 'icon-book',
href: 'https://docs.example.com',
external: true
},
{
id: 'privacy',
label: 'Политика конфиденциальности',
href: '/privacy'
},
{
id: 'terms',
label: 'Условия использования',
href: '/terms'
},
{
id: 'support',
label: 'Поддержка',
icon: 'icon-support',
handler: () => {
// Открыть модалку поддержки или чат
console.log('Open support');
}
}
]
};

4.5 Global Status Bar
Назначение:
Global Status Bar — это единственный слой системы, отвечающий за отображение глобального состояния приложения. Он агрегирует статусы из Context Model и Error Registry.
Ответственность Global Status Bar:
✅ ЧТО ПОКАЗЫВАЕТ:
• Системные состояния (backend доступен/недоступен)
• Глобальные ошибки (критические, сетевые)
• Режим работы (read-only, maintenance)
• Фоновые операции (синхронизация, экспорт)

❌ ЧТО НЕ ПОКАЗЫВАЕТ:
• Ошибки формы (это Form Status Bar)
• Детализацию ошибок (это Error Block)
• Состояние конкретной формы (это Form Status Bar)
• Навигационную информацию

Архитектура взаимодействия:
┌─────────────────────────────────────────────────┐
│ GLOBAL STATUS BAR FLOW │
└─────────────────────────────────────────────────┘

Context Model Error Registry
↓ ↓
├──→ System State ├──→ Global Errors
├──→ Backend Status ├──→ Network Errors
├──→ Read-Only Mode └──→ Critical Errors
└──→ Background Tasks
↓
┌─────────────────┐
│ Global Status │
│ Bar │
└─────────────────┘
↓ ↓
Indicators Modal (по клику на ошибку)

Интерфейсы:
// ===== GLOBAL STATUS BAR INTERFACES =====

/\*\*

- Конфигурация Global Status Bar
  \*/
  export interface GlobalStatusBarConfig {
  // Индикаторы состояния
  indicators: StatusIndicator[];

// Видимость
visible?: boolean;
}

/\*\*

- Индикатор состояния
  \*/
  export interface StatusIndicator {
  // Уникальный ID
  id: string;

// Тип индикатора
type: StatusIndicatorType;

// Уровень важности
level: StatusLevel;

// Иконка
icon: string;

// Текст сообщения
message: string;

// Интерактивный (можно кликнуть)
interactive?: boolean;

// Обработчик клика (для интерактивных)
onClick?: () => void;

// Видимость
visible?: boolean;

// Метаданные
metadata?: Record<string, any>;
}

export type StatusIndicatorType =
| 'system' // Системное состояние
| 'backend' // Backend статус
| 'data' // Состояние данных
| 'validation' // Валидация
| 'operation'; // Операции

export type StatusLevel =
| 'ok' // Всё в порядке
| 'info' // Информация
| 'warning' // Предупреждение
| 'error' // Ошибка
| 'critical'; // Критическая ошибка

/\*\*

- Модальное окно глобальной ошибки
  \*/
  export interface GlobalErrorModal {
  visible: boolean;
  title: string;
  severity: StatusLevel;
  content: GlobalErrorContent;
  }

export interface GlobalErrorContent {
summary: string;
details?: string;
errorCode?: string;
timestamp?: Date;
correlationId?: string;
recommendation?: string;
}

Global Status Bar Component:
// ===== GLOBAL STATUS BAR COMPONENT =====

@Component({
selector: 'app-global-status-bar',
standalone: true,
imports: [CommonModule, NzIconModule, NzModalModule],
template: `
@if (config().visible !== false) {
<div class="global-status-bar">
<!-- Indicators -->
<div class="status-indicators">
@for (indicator of visibleIndicators(); track indicator.id) {
<div
class="status-indicator"
[class.is-ok]="indicator.level === 'ok'"
[class.is-info]="indicator.level === 'info'"
[class.is-warning]="indicator.level === 'warning'"
[class.is-error]="indicator.level === 'error'"
[class.is-critical]="indicator.level === 'critical'"
[class.is-interactive]="indicator.interactive"
(click)="handleIndicatorClick(indicator)" >
<app-icon
[iconKey]="indicator.icon"
class="indicator-icon" ></app-icon>
<span class="indicator-message">{{ indicator.message }}</span>
</div>
}

          <!-- Default OK state if no errors -->
          @if (visibleIndicators().length === 0) {
            <div class="status-indicator is-ok">
              <app-icon iconKey="icon-check-circle" class="indicator-icon"></app-icon>
              <span class="indicator-message">Система работает нормально</span>
            </div>
          }
        </div>
      </div>
    }

`,
  styles: [`
.global-status-bar {
height: 32px;
background: #fff;
border-top: 1px solid #e8e8e8;
display: flex;
align-items: center;
padding: 0 16px;
font-size: 12px;
}

    .status-indicators {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;

      &.is-interactive {
        cursor: pointer;

        &:hover {
          background: rgba(0, 0, 0, 0.04);
        }
      }

      &.is-ok {
        color: #52c41a;
      }

      &.is-info {
        color: #1890ff;
      }

      &.is-warning {
        color: #faad14;
        background: #fffbe6;
      }

      &.is-error {
        color: #ff4d4f;
        background: #fff2f0;
      }

      &.is-critical {
        color: #fff;
        background: #ff4d4f;
        font-weight: 600;
        animation: pulse 2s infinite;
      }
    }

    .indicator-icon {
      font-size: 14px;
    }

    .indicator-message {
      white-space: nowrap;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    @media (max-width: 768px) {
      .status-indicators {
        flex-wrap: wrap;
        gap: 8px;
      }

      .indicator-message {
        display: none;
      }
    }

`]
})
export class GlobalStatusBarComponent implements OnInit, OnDestroy {
private readonly contextService = inject(ContextService);
private readonly errorRegistry = inject(ErrorRegistry);
private readonly modalService = inject(NzModalService);
private readonly destroy$ = new Subject<void>();

config = input<GlobalStatusBarConfig>({
indicators: [],
visible: true
});

indicators = signal<StatusIndicator[]>([]);

ngOnInit() {
this.subscribeToContext();
this.subscribeToErrors();
}

ngOnDestroy() {
this.destroy$.next();
    this.destroy$.complete();
}

visibleIndicators() {
return this.indicators().filter(i => i.visible !== false);
}

handleIndicatorClick(indicator: StatusIndicator) {
if (!indicator.interactive) return;

    if (indicator.onClick) {
      indicator.onClick();
    } else if (indicator.type === 'system' && indicator.level !== 'ok') {
      this.openErrorModal(indicator);
    }

}

private subscribeToContext() {
this.contextService.context$
      .pipe(takeUntil(this.destroy$))
.subscribe(context => {
this.updateIndicators(context);
});
}

private subscribeToErrors() {
this.errorRegistry.summary$
      .pipe(takeUntil(this.destroy$))
.subscribe(summary => {
this.updateErrorIndicators(summary);
});
}

private updateIndicators(context: AppContext) {
const newIndicators: StatusIndicator[] = [];

    // Backend Status
    if (!context.operationalState.backendAvailable) {
      newIndicators.push({
        id: 'backend',
        type: 'backend',
        level: 'critical',
        icon: 'icon-disconnect',
        message: 'Backend недоступен',
        interactive: true,
        onClick: () => this.openBackendErrorModal()
      });
    }

    // Read-Only Mode
    if (context.operationalState.globalReadOnly) {
      newIndicators.push({
        id: 'readonly',
        type: 'system',
        level: 'warning',
        icon: 'icon-lock',
        message: 'Режим только для чтения',
        interactive: false
      });
    }

    // Background Tasks
    const runningTasks = context.operationalState.backgroundTasks
      .filter(t => t.status === 'running');

    if (runningTasks.length > 0) {
      newIndicators.push({
        id: 'tasks',
        type: 'operation',
        level: 'info',
        icon: 'icon-loading',
        message: `Выполняется ${runningTasks.length} операций`,
        interactive: false
      });
    }

    // Unsaved Changes
    if (context.dataState.dirty) {
      newIndicators.push({
        id: 'unsaved',
        type: 'data',
        level: 'warning',
        icon: 'icon-warning',
        message: 'Есть несохранённые изменения',
        interactive: false
      });
    }

    this.indicators.update(current => {
      // Merge with existing indicators (keep error indicators)
      const errorIndicators = current.filter(i => i.type === 'validation');
      return [...newIndicators, ...errorIndicators];
    });

}

private updateErrorIndicators(summary: ErrorSummary) {
// Показываем только глобальные ошибки
const globalErrors = summary.byLevel.global;

    if (globalErrors === 0) {
      // Удалить индикатор ошибок
      this.indicators.update(current =>
        current.filter(i => i.id !== 'global-errors')
      );
      return;
    }

    // Определить уровень по severity
    let level: StatusLevel = 'error';
    if (summary.highestSeverity === 'critical') {
      level = 'critical';
    } else if (summary.highestSeverity === 'warning') {
      level = 'warning';
    }

    const errorIndicator: StatusIndicator = {
      id: 'global-errors',
      type: 'validation',
      level,
      icon: level === 'critical' ? 'icon-close-circle' : 'icon-warning',
      message: `${globalErrors} ${this.getErrorText(globalErrors)}`,
      interactive: true,
      onClick: () => this.openGlobalErrorsModal()
    };

    this.indicators.update(current => {
      const filtered = current.filter(i => i.id !== 'global-errors');
      return [...filtered, errorIndicator];
    });

}

private getErrorText(count: number): string {
if (count === 1) return 'ошибка';
if (count < 5) return 'ошибки';
return 'ошибок';
}

private openErrorModal(indicator: StatusIndicator) {
this.modalService.error({
nzTitle: 'Системная ошибка',
nzContent: indicator.message,
nzOkText: 'Понятно'
});
}

private openBackendErrorModal() {
this.modalService.error({
nzTitle: 'Backend недоступен',
nzContent: `        <p>Не удаётся подключиться к серверу.</p>
        <p><strong>Рекомендация:</strong> Проверьте подключение к интернету и обновите страницу.</p>
     `,
nzOkText: 'Обновить страницу',
nzOnOk: () => window.location.reload()
});
}

private openGlobalErrorsModal() {
const errors = this.errorRegistry.getAll({
level: 'global',
lifecycle: 'active'
});

    if (errors.length === 0) return;

    // Взять первую критическую ошибку
    const criticalError = errors.find(e =>
      e.errorResponse.status >= 500
    ) || errors[0];

    const content = `
      <div>
        <p><strong>Описание:</strong> ${criticalError.errorResponse.getUserMessage()}</p>
        ${criticalError.errorResponse.correlationId ?
          `<p><strong>ID корреляции:</strong> ${criticalError.errorResponse.correlationId}</p>` : ''}
        ${criticalError.errorResponse.timestamp ?
          `<p><strong>Время:</strong> ${new Date(criticalError.errorResponse.timestamp).toLocaleString()}</p>` : ''}
      </div>
    `;

    this.modalService.error({
      nzTitle: `Ошибка (${criticalError.errorResponse.status})`,
      nzContent: content,
      nzOkText: 'Понятно',
      nzWidth: 600
    });

}
}

Global Status Bar Integration Example:
// ===== ИСПОЛЬЗОВАНИЕ В LAYOUT =====

@Component({
selector: 'app-admin-layout',
template: `
<div class="admin-layout">
<app-admin-header [config]="headerConfig()"></app-admin-header>

      <div class="admin-workspace">
        <app-left-sidebar [config]="sidebarConfig()"></app-left-sidebar>
        <main class="admin-main">
          <router-outlet></router-outlet>
        </main>
        <app-right-panel [config]="rightPanelConfig()"></app-right-panel>
      </div>

      <!-- Global Status Bar -->
      <app-global-status-bar></app-global-status-bar>

      <app-admin-footer [config]="footerConfig()"></app-admin-footer>
    </div>

`
})
export class AdminLayoutComponent implements OnInit {
private readonly contextService = inject(ContextService);
private readonly errorRegistry = inject(ErrorRegistry);

ngOnInit() {
// Инициализация контекста
this.contextService.setContext({
activeArea: {
type: 'dashboard',
entityId: 'main',
mode: 'view'
},
dataState: {
dirty: false,
valid: true,
loading: false
},
operationalState: {
healthy: true,
backendAvailable: true,
globalReadOnly: false,
locks: [],
backgroundTasks: []
},
permissions: {
user: {
id: 'user-123',
name: 'Admin User',
email: 'admin@example.com',
roles: ['admin']
},
global: ['admin.read', 'admin.write'],
entity: {
entityName: 'main',
operations: {
read: true,
create: true,
update: true,
delete: true,
export: true
}
}
},
metadata: {
version: 1,
createdAt: new Date(),
updatedAt: new Date()
}
});
}
}

ЧАСТЬ 5: BODY & FORMS
5.1 Page Shell
Назначение:
Page Shell — это обязательная обёртка для всех страниц админ-панели. Каждая страница ОБЯЗАНА использовать структуру Page Shell.
Структура Page Shell:
┌───────────────────────────────────────┐
│ PAGE SHELL │
├───────────────────────────────────────┤
│ │
│ PAGE-HEADER │
│ ├─ page-title │
│ ├─ page-subtitle (optional) │
│ └─ page-toolbar (optional) │
│ │
│ ───────────────────────────────── │
│ │
│ FORM-STATUS-BAR │
│ └─ Агрегат состояния формы │
│ │
│ ───────────────────────────────── │
│ │
│ ERROR-BLOCK (conditional) │
│ └─ Детализация ошибок │
│ │
│ ───────────────────────────────── │
│ │
│ SEARCH/FILTERS AREA (optional) │
│ └─ Поиск и фильтры │
│ │
│ ───────────────────────────────── │
│ │
│ CONTENT AREA │
│ ├─ Table (ng-zorro) │
│ └─ Form (custom) │
│ │
│ ───────────────────────────────── │
│ │
│ PAGE-FOOTER │
│ ├─ Pagination Block │
│ └─ Actions Block │
│ │
└───────────────────────────────────────┘

Интерфейсы:
// ===== PAGE SHELL INTERFACES =====

/\*\*

- Конфигурация страницы
  \*/
  export interface PageConfig {
  // Заголовок страницы
  header: PageHeader;

// Тип контента
contentType: 'table' | 'form' | 'custom';

// Показывать Form Status Bar?
showFormStatusBar?: boolean;

// Показывать Search/Filters?
showSearchFilters?: boolean;

// Показывать Footer?
showFooter?: boolean;
}

/\*\*

- Заголовок страницы
  \*/
  export interface PageHeader {
  // Основной заголовок
  title: string;

// Подзаголовок (опционально)
subtitle?: string;

// Кнопки в toolbar (опционально)
toolbarActions?: PageAction[];
}

export interface PageAction {
id: string;
label: string;
icon?: string;
type?: 'primary' | 'default' | 'danger';
disabled?: boolean;
handler: () => void;
}

/\*\*

- Footer страницы (не путать с Admin Footer)
  \*/
  export interface PageFooter {
  // Блок пагинации
  pagination?: PagePagination;

// Блок действий
actions?: PageAction[];
}

export interface PagePagination {
total: number;
pageSize: number;
currentPage: number;
pageSizeOptions?: number[];
showSizeChanger?: boolean;
showTotal?: boolean;
onPageChange: (page: number) => void;
onPageSizeChange: (size: number) => void;
}

Page Shell Component:
// ===== PAGE SHELL COMPONENT =====

@Component({
selector: 'app-page-shell',
standalone: true,
imports: [CommonModule, NzButtonModule, NzIconModule],
template: `
<div class="page">
<!-- Page Header -->
<header class="page-header">
<div class="page-header-main">
<h1 class="page-title">{{ config().header.title }}</h1>
@if (config().header.subtitle) {
<p class="page-subtitle">{{ config().header.subtitle }}</p>
}
</div>

        @if (config().header.toolbarActions && config().header.toolbarActions.length > 0) {
          <div class="page-toolbar">
            @for (action of config().header.toolbarActions; track action.id) {
              <button
                nz-button
                [nzType]="action.type || 'default'"
                [disabled]="action.disabled"
                (click)="action.handler()"
              >
                @if (action.icon) {
                  <app-icon [iconKey]="action.icon"></app-icon>
                }
                {{ action.label }}
              </button>
            }
          </div>
        }
      </header>

      <!-- Form Status Bar -->
      @if (config().showFormStatusBar !== false) {
        <app-form-status-bar></app-form-status-bar>
      }

      <!-- Error Block (conditional - показывается через компонент) -->
      <app-error-block></app-error-block>

      <!-- Search/Filters Area -->
      @if (config().showSearchFilters) {
        <div class="page-search-filters">
          <ng-content select="[search-filters]"></ng-content>
        </div>
      }

      <!-- Content Area -->
      <div class="page-body">
        <ng-content></ng-content>
      </div>

      <!-- Page Footer -->
      @if (config().showFooter !== false) {
        <footer class="page-footer">
          <ng-content select="[page-footer]"></ng-content>
        </footer>
      }
    </div>

`,
  styles: [`
.page {
display: flex;
flex-direction: column;
height: 100%;
background: #fff;
}

    /* PAGE HEADER */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .page-header-main {
      flex: 1;
    }

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      line-height: 1.3;
      color: #262626;
    }

    .page-subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: #8c8c8c;
    }

    .page-toolbar {
      display: flex;
      gap: 8px;
      margin-left: 16px;
    }

    /* SEARCH/FILTERS */
    .page-search-filters {
      padding: 16px 24px;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;
    }

    /* CONTENT */
    .page-body {
      flex: 1;
      overflow: auto;
      padding: 16px 24px;
    }

    /* FOOTER */
    .page-footer {
      border-top: 1px solid #f0f0f0;
      padding: 12px 24px;
      background: #fafafa;
    }

`]
})
export class PageShellComponent {
config = input.required<PageConfig>();
}

Page Shell Usage Example:
// ===== ПРИМЕР ИСПОЛЬЗОВАНИЯ PAGE SHELL =====

// Страница со списком пользователей (таблица)
@Component({
selector: 'app-users-page',
standalone: true,
imports: [CommonModule, PageShellComponent, NzTableModule, NzPaginationModule],
template: `
<app-page-shell [config]="pageConfig()">
<!-- Search/Filters -->
<div search-filters>
<input
type="text"
placeholder="Поиск по имени..."
[(ngModel)]="searchTerm"
(input)="onSearch()"
/>
</div>

      <!-- Table Content -->
      <nz-table
        [nzData]="users()"
        [nzLoading]="loading()"
        [nzShowPagination]="false"
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (user of users(); track user.id) {
            <tr>
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button nz-button nzType="link" (click)="editUser(user)">
                  Редактировать
                </button>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>

      <!-- Pagination Footer -->
      <div page-footer class="page-footer-content">
        <div class="pagination-block">
          <nz-pagination
            [nzTotal]="totalUsers()"
            [nzPageSize]="pageSize()"
            [nzPageIndex]="currentPage()"
            [nzShowSizeChanger]="true"
            [nzPageSizeOptions]="[10, 20, 50, 100]"
            (nzPageIndexChange)="onPageChange($event)"
            (nzPageSizeChange)="onPageSizeChange($event)"
          ></nz-pagination>
        </div>

        <div class="actions-block">
          <button nz-button nzType="primary" (click)="createUser()">
            Создать пользователя
          </button>
        </div>
      </div>
    </app-page-shell>

`,
  styles: [`
.page-footer-content {
display: flex;
justify-content: space-between;
align-items: center;
}

    .pagination-block {
      flex: 1;
    }

    .actions-block {
      display: flex;
      gap: 8px;
    }

`]
})
export class UsersPageComponent implements OnInit {
private readonly userService = inject(UserService);
private readonly contextService = inject(ContextService);
private readonly commandService = inject(CommandService);

users = signal<User[]>([]);
loading = signal(false);
totalUsers = signal(0);
currentPage = signal(1);
pageSize = signal(20);
searchTerm = '';

pageConfig = computed<PageConfig>(() => ({
header: {
title: 'Пользователи',
subtitle: 'Управление пользователями системы',
toolbarActions: [
{
id: 'refresh',
label: 'Обновить',
icon: 'icon-refresh',
handler: () => this.loadUsers()
},
{
id: 'export',
label: 'Экспорт',
icon: 'icon-export',
handler: () => this.exportUsers()
}
]
},
contentType: 'table',
showFormStatusBar: true,
showSearchFilters: true,
showFooter: true
}));

ngOnInit() {
// Установить контекст
this.contextService.setActiveArea({
type: 'table',
entityId: 'users',
mode: 'view'
});

    this.loadUsers();

}

loadUsers() {
this.loading.set(true);
this.contextService.updateDataState({ loading: true });

    this.userService.getUsers({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalUsers.set(response.total);
        this.loading.set(false);
        this.contextService.updateDataState({ loading: false });
      },
      error: (error) => {
        this.loading.set(false);
        this.contextService.updateDataState({ loading: false });
        // Ошибка обработается HttpErrorInterceptor
      }
    });

}

onPageChange(page: number) {
this.currentPage.set(page);
this.loadUsers();
}

onPageSizeChange(size: number) {
this.pageSize.set(size);
this.currentPage.set(1);
this.loadUsers();
}

onSearch() {
this.currentPage.set(1);
this.loadUsers();
}

createUser() {
// Навигация на форму создания
this.router.navigate(['/admin/users/create']);
}

editUser(user: User) {
this.router.navigate(['/admin/users', user.id, 'edit']);
}

exportUsers() {
this.commandService.execute('export', {
entityId: 'users',
format: 'xlsx'
}).subscribe({
next: (result) => {
if (result.success && result.data) {
// Скачать файл
const blob = result.data as Blob;
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `users_${new Date().getTime()}.xlsx`;
a.click();
}
}
});
}
}

ЧАСТЬ 5: BODY & FORMS (продолжение)
5.2 Error Handling System (ИНТЕГРАЦИЯ)
Назначение:
Интеграция существующей системы обработки ошибок (ErrorHandlingService, GlobalErrorHandler, HttpErrorInterceptor) с новой архитектурой (Error Registry, Context Model, Event Bus).
Трёхуровневая система отображения ошибок:
┌─────────────────────────────────────────────────────┐
│ ТРЁХУРОВНЕВАЯ СИСТЕМА ОШИБОК │
└─────────────────────────────────────────────────────┘

УРОВЕНЬ 1: TOAST (NzMessage)
├─ Назначение: Быстрые уведомления
├─ Статусы: 422, 502, 503, 0 (сеть)
├─ Поведение: Авто-скрытие через 5 сек
└─ Компонент: ErrorHandlingService.showMessage()

УРОВЕНЬ 2: MODAL (NzModal)
├─ Назначение: Критические ошибки
├─ Статусы: 400, 401, 403, 404, 500
├─ Поведение: Требует подтверждения
├─ Авто-редирект: 401, 404, 500
└─ Компонент: ErrorHandlingService.showModal()

УРОВЕНЬ 3: REGISTRY + STATUS BARS
├─ Назначение: Агрегация и детализация
├─ Компоненты:
│ ├─ Error Registry (Core) - хранилище
│ ├─ Form Status Bar - агрегат ошибок формы
│ ├─ Error Block - детализация локальных
│ ├─ Right Panel "Errors" - расширенный контекст
│ └─ Global Status Bar - глобальные индикаторы
└─ Поведение: Реактивное обновление через Event Bus

5.2.1 Расширение ErrorHandlingService
// ===== ИНТЕГРАЦИЯ С ERROR REGISTRY =====

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService implements OnDestroy {
// Существующие зависимости
private readonly destroy$ = new Subject<void>();
private readonly message = inject(NzMessageService);
private readonly modalService = inject(NzModalService);
private readonly router = inject(Router);
private readonly logger = inject(LoggingService);

// === НОВЫЕ ЗАВИСИМОСТИ ===
private readonly errorRegistry = inject(ErrorRegistry);
private readonly contextService = inject(ContextService);
private readonly eventBus = inject(EventBus);

private activeModals = new Map<string, NzModalRef>();
private readonly context = 'ErrorHandlingService';

// Существующие конфигурации ошибок
private readonly errorConfigs: Record<number, ErrorDisplayConfig> = {
400: {
showModal: true,
showMessage: false,
autoRedirect: false,
showTechnicalInfo: false,
messageType: 'error',
},
401: {
showModal: true,
showMessage: false,
autoRedirect: true,
showTechnicalInfo: false,
messageType: 'warning',
},
403: {
showModal: true,
showMessage: false,
autoRedirect: false,
showTechnicalInfo: false,
messageType: 'error',
},
404: {
showModal: true,
showMessage: false,
autoRedirect: true,
showTechnicalInfo: false,
messageType: 'error',
},
409: {
showModal: false,
showMessage: false, // Только Registry
autoRedirect: false,
showTechnicalInfo: false,
messageType: 'warning',
},
422: {
showModal: false,
showMessage: true,
autoRedirect: false,
showTechnicalInfo: false,
messageType: 'error',
},
500: {
showModal: true,
showMessage: false,
autoRedirect: true,
showTechnicalInfo: true,
messageType: 'error',
},
502: {
showModal: false,
showMessage: true,
autoRedirect: false,
showTechnicalInfo: false,
messageType: 'error',
},
503: {
showModal: false,
showMessage: true,
autoRedirect: false,
showTechnicalInfo: false,
messageType: 'warning',
},
0: {
showModal: false,
showMessage: true,
autoRedirect: false,
showTechnicalInfo: false,
messageType: 'error',
},
};

ngOnDestroy(): void {
this.destroy$.next();
    this.destroy$.complete();
this.closeAllModals();
}

/\*\*

- Главный метод обработки ошибок (РАСШИРЕННЫЙ)
  \*/
  handleError(
  errorResponse: ErrorResponse,
  options?: Partial<ErrorDisplayConfig>
  ): void {
  try {
  this.validateErrorResponse(errorResponse);
  this.logError(errorResponse);

      // === НОВОЕ: Регистрация в Error Registry ===
      const registryId = this.registerInRegistry(errorResponse);

      const config = {
        ...this.getErrorConfig(errorResponse.status),
        ...options,
      };

      // === СУЩЕСТВУЮЩЕЕ: Toast/Modal отображение ===
      this.displayError(errorResponse, config);

      // === НОВОЕ: Публикация события в Event Bus ===
      this.eventBus.publish({
        type: 'errorRegistered',
        payload: {
          registryId,
          errorResponse,
          level: this.determineErrorLevel(errorResponse),
          config
        },
        source: 'ErrorHandlingService'
      });

      // === НОВОЕ: Обновление Context при критических ошибках ===
      if (errorResponse.status >= 500 || errorResponse.status === 0) {
        this.updateContextForCriticalError(errorResponse);
      }


    } catch (error) {
      this.logger.error(this.context, 'Ошибка при обработке ошибки', {
        originalError: errorResponse,
        processingError: error,
      });
      this.fallbackErrorHandling();
    }

}

/\*\*

- === НОВЫЙ МЕТОД: Регистрация в Error Registry ===
  \*/
  private registerInRegistry(errorResponse: ErrorResponse): string {
  const level = this.determineErrorLevel(errorResponse);
  const context = this.contextService.getContext();


    return this.errorRegistry.register({
      level,
      source: 'http',
      errorResponse,
      contextId: context.activeArea?.entityId,
      lifecycle: 'active',
      metadata: {
        url: errorResponse.requestUrl,
        timestamp: errorResponse.timestamp,
        retryable: errorResponse.retryable
      }
    });

}

/\*\*

- === НОВЫЙ МЕТОД: Определение уровня ошибки ===
  \*/
  private determineErrorLevel(err: ErrorResponse): ErrorLevel {
  // Global: системные и сетевые ошибки
  if ([500, 502, 503, 504, 0].includes(err.status)) {
  return 'global';
  }


    // Contextual: ошибки формы/таблицы
    if ([422, 400, 409].includes(err.status)) {
      return 'contextual';
    }

    // Остальные тоже contextual (401, 403, 404)
    return 'contextual';

}

/\*\*

- === НОВЫЙ МЕТОД: Обновление контекста при критических ошибках ===
  \*/
  private updateContextForCriticalError(errorResponse: ErrorResponse): void {
  if (errorResponse.status === 0) {
  // Сетевая ошибка → Backend недоступен
  this.contextService.updateContext({
  operationalState: {
  ...this.contextService.getContext().operationalState,
  backendAvailable: false,
  healthy: false
  }
  });
  } else if (errorResponse.status >= 500) {
  // Серверная ошибка → добавить lock
  const lock: ContextLock = {
  id: `error-${errorResponse.correlationId}`,
  reason: `Server error: ${errorResponse.status}`,
  source: 'system',
  timestamp: new Date()
  };

      const context = this.contextService.getContext();
      this.contextService.updateContext({
        operationalState: {
          ...context.operationalState,
          locks: [...context.operationalState.locks, lock]
        }
      });

  }
  }

// === СУЩЕСТВУЮЩИЕ МЕТОДЫ (без изменений) ===

showErrorMessage(message: string, duration: number = 5000): void {
this.message.error(message, { nzDuration: duration });
}

closeAllModals(): void {
this.activeModals.forEach(modal => modal.close());
this.activeModals.clear();
this.modalService.closeAll();
}

private validateErrorResponse(errorResponse: ErrorResponse): void {
if (
!errorResponse ||
!errorResponse.title ||
!errorResponse.detail ||
!errorResponse.instance
) {
throw new Error(
'Invalid ErrorResponse: missing required fields (title, detail, instance)'
);
}
}

private logError(errorResponse: ErrorResponse): void {
this.logger.logErrorResponse(errorResponse);
}

private getErrorConfig(status: number): ErrorDisplayConfig {
return (
this.errorConfigs[status] || {
showModal: true,
showMessage: false,
autoRedirect: false,
showTechnicalInfo: true,
messageType: 'error',
}
);
}

private displayError(
errorResponse: ErrorResponse,
config: ErrorDisplayConfig
): void {
if (config.showMessage) {
const userMessage = this.getUserFriendlyMessage(errorResponse);
this.showErrorMessage(userMessage);
}
if (config.showModal) {
this.showErrorModal(errorResponse, config);
}
}

private showErrorModal(
errorResponse: ErrorResponse,
config: ErrorDisplayConfig
): void {
if (!errorResponse) {
this.fallbackErrorHandling();
return;
}
const modalKey = this.generateModalKey(errorResponse);
if (this.activeModals.has(modalKey)) {
return;
}
const modalTitle = this.buildModalTitle(errorResponse);
const modalData: ModalData = {
errorResponse,
config,
recommendation: this.getRecommendation(errorResponse),
};
const modalRef: NzModalRef = this.modalService.create({
nzTitle: modalTitle,
nzContent: ErrorModalContentComponent,
nzData: modalData,
nzClosable: true,
nzOkText: 'Понятно',
nzWidth: 600,
nzClassName: 'error-modal',
nzOnOk: () => {
this.closeModal(modalKey);
},
nzOnCancel: () => {
this.closeModal(modalKey);
},
});
this.activeModals.set(modalKey, modalRef);
if (config.autoRedirect) {
modalRef.afterClose.subscribe(() => {
this.handleAutoRedirect(errorResponse.status);
});
}
}

private generateModalKey(errorResponse: ErrorResponse): string {
return `${errorResponse.status}_${
      errorResponse.correlationId || Date.now()
    }`;
}

private closeModal(modalKey: string): void {
const modal = this.activeModals.get(modalKey);
if (modal) {
modal.close();
this.activeModals.delete(modalKey);
}
}

private buildModalTitle(errorResponse: ErrorResponse): string {
const humanReadableTitle = this.getHumanReadableTitle(errorResponse);
const statusText =
errorTitles[errorResponse.status] || 'Неизвестная ошибка';
return `${humanReadableTitle} (${statusText}: ${errorResponse.status})`;
}

private getHumanReadableTitle(errorResponse: ErrorResponse): string {
return errorResponse.title &&
!['OK', 'error', 'Error'].includes(errorResponse.title)
? errorResponse.title
: errorTitles[errorResponse.status] || 'Неожиданная ошибка';
}

private getUserFriendlyMessage(errorResponse: ErrorResponse): string {
if (errorResponse.userMessage && errorResponse.userMessage.trim() !== '') {
return errorResponse.userMessage;
}
if (
errorResponse.detail &&
!errorResponse.detail.includes('status') &&
!errorResponse.detail.includes('error code')
) {
return errorResponse.detail;
}
return (
errorMessages[errorResponse.status] || 'Произошла неопределенная ошибка.'
);
}

private getRecommendation(errorResponse: ErrorResponse): string | null {
if (errorResponse.status === 409 && errorResponse.conflictField) {
return `Измените значение поля "${errorResponse.conflictField}" и попробуйте снова.`;
}
return errorRecommendations[errorResponse.status] || null;
}

private handleAutoRedirect(status: number): void {
const redirects: Record<number, string> = {
401: '/login',
404: '/not-found',
500: '/',
};
const redirectPath = redirects[status];
if (redirectPath) {
this.router.navigate([redirectPath]);
}
}

private fallbackErrorHandling(): void {
this.message.error(
'Произошла критическая ошибка в системе обработки ошибок. Обратитесь в техническую поддержку.'
);
}
}

5.2.2 Form State Machine
// ===== FORM STATE MACHINE =====

/\*\*

- Состояния формы
  \*/
  export type FormState =
  | 'idle' // Нет изменений, валидно
  | 'loading' // Загрузка данных
  | 'dirty' // Несохранённые изменения
  | 'validating' // Клиентская валидация
  | 'saving' // Отправка на сервер
  | 'valid' // Валидно после проверки
  | 'invalid' // Есть ошибки
  | 'error'; // Критическая ошибка операции

/\*\*

- Модель состояния формы
  \*/
  export interface FormStateModel {
  // Текущее состояние
  state: FormState;

// Валидность
valid: boolean;

// Есть изменения
dirty: boolean;

// Сводка ошибок
errorSummary: FormErrorSummary;

// Метаданные
metadata: {
lastSaved?: Date;
lastModified?: Date;
saveAttempts: number;
};
}

export interface FormErrorSummary {
total: number;
byLevel: {
field: number; // Ошибки полей
form: number; // Ошибки формы
server: number; // Серверные ошибки
};
bySeverity: {
error: number;
warning: number;
};
highestSeverity: 'error' | 'warning' | null;
}

/\*\*

- Переходы состояний (State Transitions)
  \*/
  export const FORM_STATE_TRANSITIONS: Record<FormState, FormState[]> = {
  idle: ['loading', 'dirty'],
  loading: ['idle', 'error'],
  dirty: ['validating', 'saving', 'idle'],
  validating: ['valid', 'invalid'],
  saving: ['valid', 'error', 'invalid'],
  valid: ['idle', 'dirty'],
  invalid: ['dirty', 'validating'],
  error: ['idle', 'dirty']
  };

/\*\*

- Сервис управления состоянием формы
  \*/
  @Injectable()
  export class FormStateService {
  private readonly contextService = inject(ContextService);
  private readonly errorRegistry = inject(ErrorRegistry);
  private readonly eventBus = inject(EventBus);

private readonly stateSubject = new BehaviorSubject<FormStateModel>({
state: 'idle',
valid: true,
dirty: false,
errorSummary: {
total: 0,
byLevel: { field: 0, form: 0, server: 0 },
bySeverity: { error: 0, warning: 0 },
highestSeverity: null
},
metadata: {
saveAttempts: 0
}
});

readonly state$ = this.stateSubject.asObservable();

/\*\*

- Переход в новое состояние
  \*/
  transition(newState: FormState): void {
  const currentState = this.stateSubject.value.state;
  const allowedTransitions = FORM_STATE_TRANSITIONS[currentState];


    if (!allowedTransitions.includes(newState)) {
      console.warn(
        `Invalid state transition: ${currentState} → ${newState}`
      );
      return;
    }

    this.stateSubject.next({
      ...this.stateSubject.value,
      state: newState
    });

    // Публикация события
    this.eventBus.publish({
      type: 'formStateChanged',
      payload: {
        from: currentState,
        to: newState
      },
      source: 'FormStateService'
    });

    // Обновление Context
    this.updateContext(newState);

}

/\*\*

- Обновить сводку ошибок
  \*/
  updateErrorSummary(contextId: string): void {
  const errors = this.errorRegistry.getAll({
  contextId,
  lifecycle: 'active'
  });


    const summary: FormErrorSummary = {
      total: errors.length,
      byLevel: {
        field: errors.filter(e => e.fieldId).length,
        form: errors.filter(e => !e.fieldId && !e.rowId).length,
        server: errors.filter(e => e.source === 'http').length
      },
      bySeverity: {
        error: errors.filter(e =>
          e.errorResponse.status >= 400 && e.errorResponse.status < 500
        ).length,
        warning: errors.filter(e =>
          e.errorResponse.status === 409
        ).length
      },
      highestSeverity: this.getHighestSeverity(errors)
    };

    this.stateSubject.next({
      ...this.stateSubject.value,
      errorSummary: summary,
      valid: summary.total === 0
    });

}

/\*\*

- Пометить форму как изменённую
  \*/
  markAsDirty(): void {
  this.stateSubject.next({
  ...this.stateSubject.value,
  dirty: true
  });


    if (this.stateSubject.value.state === 'idle') {
      this.transition('dirty');
    }

}

/\*\*

- Пометить форму как сохранённую
  \*/
  markAsSaved(): void {
  this.stateSubject.next({
  ...this.stateSubject.value,
  dirty: false,
  metadata: {
  ...this.stateSubject.value.metadata,
  lastSaved: new Date()
  }
  });


    this.transition('idle');

}

/\*\*

- Получить текущее состояние
  \*/
  getState(): FormStateModel {
  return this.stateSubject.value;
  }

/\*\*

- Сбросить состояние
  \*/
  reset(): void {
  this.stateSubject.next({
  state: 'idle',
  valid: true,
  dirty: false,
  errorSummary: {
  total: 0,
  byLevel: { field: 0, form: 0, server: 0 },
  bySeverity: { error: 0, warning: 0 },
  highestSeverity: null
  },
  metadata: {
  saveAttempts: 0
  }
  });
  }

private updateContext(newState: FormState): void {
const dataState: Partial<ContextDataState> = {};

    switch (newState) {
      case 'loading':
        dataState.loading = true;
        break;
      case 'saving':
        dataState.operation = 'saving';
        break;
      case 'dirty':
        dataState.dirty = true;
        break;
      case 'valid':
      case 'idle':
        dataState.loading = false;
        dataState.operation = undefined;
        dataState.dirty = false;
        break;
      case 'invalid':
      case 'error':
        dataState.valid = false;
        break;
    }

    this.contextService.updateDataState(dataState);

}

private getHighestSeverity(
errors: RegisteredError[]
): 'error' | 'warning' | null {
if (errors.length === 0) return null;

    const hasError = errors.some(e =>
      e.errorResponse.status >= 400 && e.errorResponse.status < 500
    );

    return hasError ? 'error' : 'warning';

}
}

5.2.3 Form Status Bar Component
// ===== FORM STATUS BAR COMPONENT =====

@Component({
selector: 'app-form-status-bar',
standalone: true,
imports: [CommonModule, NzIconModule],
template: `
@if (shouldShow()) {
<div
class="form-status-bar"
[class.is-idle]="state() === 'idle'"
[class.is-dirty]="state() === 'dirty'"
[class.is-loading]="state() === 'loading'"
[class.is-saving]="state() === 'saving'"
[class.is-error]="hasErrors()"
[class.is-warning]="hasWarnings()" >
<div class="status-content">
<!-- Icon -->
<span class="status-icon">
<app-icon [iconKey]="getIcon()"></app-icon>
</span>

          <!-- Message -->
          <span class="status-message">{{ getMessage() }}</span>

          <!-- Error Count (if errors) -->
          @if (hasErrors()) {
            <button
              class="error-count-btn"
              (click)="scrollToErrors()"
            >
              {{ errorSummary().total }}
              {{ getErrorText(errorSummary().total) }}
            </button>
          }

          <!-- Metadata -->
          @if (showMetadata()) {
            <span class="status-metadata">
              {{ getMetadataText() }}
            </span>
          }
        </div>
      </div>
    }

`,
  styles: [`
.form-status-bar {
height: 40px;
padding: 0 24px;
display: flex;
align-items: center;
border-bottom: 1px solid #f0f0f0;
transition: all 0.3s;

      &.is-idle {
        background: #f6ffed;
        border-color: #b7eb8f;
      }

      &.is-dirty {
        background: #fffbe6;
        border-color: #ffe58f;
      }

      &.is-loading,
      &.is-saving {
        background: #e6f7ff;
        border-color: #91d5ff;
      }

      &.is-error {
        background: #fff2f0;
        border-color: #ffccc7;
      }

      &.is-warning {
        background: #fffbe6;
        border-color: #ffe58f;
      }
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .status-icon {
      font-size: 16px;
      display: flex;
      align-items: center;
    }

    .status-message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    .error-count-btn {
      padding: 4px 12px;
      border: 1px solid #ff4d4f;
      background: #fff;
      color: #ff4d4f;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;

      &:hover {
        background: #ff4d4f;
        color: #fff;
      }
    }

    .status-metadata {
      font-size: 12px;
      color: #8c8c8c;
    }

`]
})
export class FormStatusBarComponent implements OnInit, OnDestroy {
private readonly formStateService = inject(FormStateService, { optional: true });
private readonly contextService = inject(ContextService);
private readonly errorRegistry = inject(ErrorRegistry);
private readonly destroy$ = new Subject<void>();

state = signal<FormState>('idle');
errorSummary = signal<FormErrorSummary>({
total: 0,
byLevel: { field: 0, form: 0, server: 0 },
bySeverity: { error: 0, warning: 0 },
highestSeverity: null
});

metadata = signal<{
lastSaved?: Date;
lastModified?: Date;
}>({});

ngOnInit() {
if (this.formStateService) {
// Подписка на состояние формы
this.formStateService.state$
        .pipe(takeUntil(this.destroy$))
.subscribe(formState => {
this.state.set(formState.state);
this.errorSummary.set(formState.errorSummary);
this.metadata.set(formState.metadata);
});
} else {
// Fallback: подписка на Context и Error Registry
this.subscribeToContextAndRegistry();
}
}

ngOnDestroy() {
this.destroy$.next();
    this.destroy$.complete();
}

shouldShow(): boolean {
// Показывать только если есть что-то важное
return this.state() !== 'idle' || this.hasErrors() || this.hasWarnings();
}

hasErrors(): boolean {
return this.errorSummary().bySeverity.error > 0;
}

hasWarnings(): boolean {
return this.errorSummary().bySeverity.warning > 0;
}

showMetadata(): boolean {
return this.state() === 'idle' && !!this.metadata().lastSaved;
}

getIcon(): string {
if (this.state() === 'loading' || this.state() === 'saving') {
return 'icon-loading';
}
if (this.hasErrors()) {
return 'icon-close-circle';
}
if (this.hasWarnings()) {
return 'icon-warning';
}
if (this.state() === 'dirty') {
return 'icon-edit';
}
return 'icon-check-circle';
}

getMessage(): string {
if (this.state() === 'loading') {
return 'Загрузка данных...';
}
if (this.state() === 'saving') {
return 'Сохранение...';
}
if (this.hasErrors()) {
return 'Обнаружены ошибки';
}
if (this.hasWarnings()) {
return 'Есть предупреждения';
}
if (this.state() === 'dirty') {
return 'Есть несохранённые изменения';
}
return 'Всё в порядке';
}

getErrorText(count: number): string {
if (count === 1) return 'ошибка';
if (count < 5) return 'ошибки';
return 'ошибок';
}

getMetadataText(): string {
if (this.metadata().lastSaved) {
const saved = this.metadata().lastSaved!;
const diff = Date.now() - saved.getTime();
const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return 'Только что сохранено';
      if (minutes === 1) return 'Сохранено 1 минуту назад';
      if (minutes < 60) return `Сохранено ${minutes} минут назад`;

      return `Сохранено в ${saved.toLocaleTimeString()}`;
    }
    return '';

}

scrollToErrors() {
// Скролл к Error Block
const errorBlock = document.querySelector('.error-block');
if (errorBlock) {
errorBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
}

private subscribeToContextAndRegistry() {
// Подписка на Context
this.contextService.context$
      .pipe(takeUntil(this.destroy$))
.subscribe(context => {
if (context.dataState.loading) {
this.state.set('loading');
} else if (context.dataState.operation === 'saving') {
this.state.set('saving');
} else if (context.dataState.dirty) {
this.state.set('dirty');
} else {
this.state.set('idle');
}
});

    // Подписка на Error Registry
    this.errorRegistry.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        // Фильтр только контекстных ошибок
        const contextId = this.contextService.getContext().activeArea?.entityId;
        if (contextId) {
          const contextErrors = this.errorRegistry.getAll({
            contextId,
            lifecycle: 'active'
          });

          this.errorSummary.set({
            total: contextErrors.length,
            byLevel: {
              field: contextErrors.filter(e => e.fieldId).length,
              form: contextErrors.filter(e => !e.fieldId && !e.rowId).length,
              server: contextErrors.filter(e => e.source === 'http').length
            },
            bySeverity: {
              error: contextErrors.filter(e =>
                e.errorResponse.status >= 400 && e.errorResponse.status < 500
              ).length,
              warning: contextErrors.filter(e =>
                e.errorResponse.status === 409
              ).length
            },
            highestSeverity: contextErrors.length > 0 ? 'error' : null
          });
        }
      });

}
}

5.2.4 Error Block Component
// ===== ERROR BLOCK COMPONENT =====

@Component({
selector: 'app-error-block',
standalone: true,
imports: [CommonModule, NzCollapseModule, NzAlertModule, NzIconModule],
template: `
@if (visible() && errors().length > 0) {
<div
class="error-block"
[class.is-warning]="highestSeverity() === 'warning'"
[class.is-error]="highestSeverity() === 'error'"
[class.is-critical]="highestSeverity() === 'critical'"
[style.max-height.px]="maxHeight()" >
<!-- Header -->
<div class="error-block-header">
<span class="error-block-title">
<app-icon [iconKey]="getHeaderIcon()"></app-icon>
{{ getHeaderTitle() }}
</span>
<button
class="error-block-close"
(click)="dismissAll()"
title="Закрыть все ошибки" >
<app-icon iconKey="icon-close"></app-icon>
</button>
</div>

        <!-- Errors List -->
        <div class="error-block-content">
          <!-- Группировка по секциям -->
          @if (shouldGroupBySection()) {
            <nz-collapse [nzBordered]="false">
              @for (section of groupedErrors(); track section.title) {
                <nz-collapse-panel
                  [nzHeader]="section.title"
                  [nzActive]="true"
                >
                  @for (error of section.errors; track error.registryId) {
                    <app-error-item
                      [error]="error"
                      (click)="handleErrorClick(error)"
                      (dismiss)="dismissError(error.registryId)"
                    ></app-error-item>
                  }
                </nz-collapse-panel>
              }
            </nz-collapse>
          } @else {
            <!-- Плоский список -->
            @for (error of errors(); track error.registryId) {
              <app-error-item
                [error]="error"
                (click)="handleErrorClick(error)"
                (dismiss)="dismissError(error.registryId)"
              ></app-error-item>
            }
          }
        </div>

        <!-- Footer (если много ошибок) -->
        @if (errors().length > 5) {
          <div class="error-block-footer">
            Показано {{ errors().length }}
            {{ getErrorText(errors().length) }}
          </div>
        }
      </div>
    }

`,
  styles: [`
.error-block {
margin: 0 24px 16px;
border-radius: 4px;
overflow: hidden;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &.is-warning {
        border: 1px solid #ffe58f;
        background: #fffbe6;
      }

      &.is-error {
        border: 1px solid #ffccc7;
        background: #fff2f0;
      }

      &.is-critical {
        border: 2px solid #ff4d4f;
        background: #fff2f0;
      }
    }

    .error-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      background: rgba(0, 0, 0, 0.02);
    }

    .error-block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
    }

    .error-block-close {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;
      color: #8c8c8c;
      transition: color 0.2s;

      &:hover {
        color: #262626;
      }
    }

    .error-block-content {
      overflow-y: auto;
      padding: 8px;
    }

    .error-block-footer {
      padding: 8px 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      background: rgba(0, 0, 0, 0.02);
      font-size: 12px;
      color: #8c8c8c;
      text-align: center;
    }

`]
})
export class ErrorBlockComponent implements OnInit, OnDestroy {
private readonly errorRegistry = inject(ErrorRegistry);
private readonly contextService = inject(ContextService);
private readonly eventBus = inject(EventBus);
private readonly destroy$ = new Subject<void>();

errors = signal<RegisteredError[]>([]);
visible = signal(false);
highestSeverity = signal<'warning' | 'error' | 'critical' | null>(null);
maxHeight = signal(300);

ngOnInit() {
this.subscribeToErrors();
}

ngOnDestroy() {
this.destroy$.next();
    this.destroy$.complete();
}

shouldGroupBySection(): boolean {
// Группировать если > 5 ошибок
return this.errors().length > 5;
}

groupedErrors(): { title: string; errors: RegisteredError[] }[] {
const errors = this.errors();
const groups: Record<string, RegisteredError[]> = {
field: [],
form: [],
server: []
};

    errors.forEach(error => {
      if (error.fieldId) {
        groups.field.push(error);
      } else if (error.source === 'http') {
        groups.server.push(error);
      } else {
        groups.form.push(error);
      }
    });

    const result: { title: string; errors: RegisteredError[] }[] = [];

    if (groups.field.length > 0) {
      result.push({ title: 'Ошибки полей', errors: groups.field });
    }
    if (groups.server.length > 0) {
      result.push({ title: 'Серверные ошибки', errors: groups.server });
    }
    if (groups.form.length > 0) {
      result.push({ title: 'Общие ошибки', errors: groups.form });
    }

    return result;

}

getHeaderIcon(): string {
const severity = this.highestSeverity();
if (severity === 'critical') return 'icon-close-circle';
if (severity === 'error') return 'icon-warning';
return 'icon-info-circle';
}

getHeaderTitle(): string {
const count = this.errors().length;
if (count === 1) return '1 ошибка';
if (count < 5) return `${count} ошибки`;
return `${count} ошибок`;
}

getErrorText(count: number): string {
if (count === 1) return 'ошибка';
if (count < 5) return 'ошибки';
return 'ошибок';
}

handleErrorClick(error: RegisteredError) {
// Если есть fieldId → подсветить поле
if (error.fieldId) {
this.highlightField(error.fieldId);
}

    // Опционально: открыть Right Panel с деталями
    this.eventBus.publish({
      type: 'rightPanelOpened',
      payload: {
        panelId: 'errors',
        errorId: error.registryId
      }
    });

}

dismissError(registryId: string) {
this.errorRegistry.dismiss(registryId);
}

dismissAll() {
const contextId = this.contextService.getContext().activeArea?.entityId;
if (contextId) {
this.errorRegistry.clearContext(contextId);
}
}

private subscribeToErrors() {
// Подписка на изменения в Error Registry
this.errorRegistry.errors$
      .pipe(takeUntil(this.destroy$))
.subscribe(() => {
const contextId = this.contextService.getContext().activeArea?.entityId;
if (contextId) {
const contextErrors = this.errorRegistry.getAll({
contextId,
lifecycle: 'active',
level: ['contextual', 'local']
});

          this.errors.set(contextErrors);
          this.visible.set(contextErrors.length > 0);

          // Определить severity
          if (contextErrors.length > 0) {
            const hasCritical = contextErrors.some(e =>
              e.errorResponse.status >= 500
            );
            const hasError = contextErrors.some(e =>
              e.errorResponse.status >= 400 && e.errorResponse.status < 500
            );

            if (hasCritical) {
              this.highestSeverity.set('critical');
              this.maxHeight.set(400); // Больше места для критических
            } else if (hasError) {
              this.highestSeverity.set('error');
              this.maxHeight.set(300);
            } else {
              this.highestSeverity.set('warning');
              this.maxHeight.set(200);
            }
          } else {
            this.highestSeverity.set(null);
          }
        }
      });

}

private highlightField(fieldId: string) {
// Найти поле в DOM и подсветить
const field = document.querySelector(`[data-field-id="${fieldId}"]`);
if (field) {
field.scrollIntoView({ behavior: 'smooth', block: 'center' });
field.classList.add('is-highlighted');

      // Убрать подсветку через 2 секунды
      setTimeout(() => {
        field.classList.remove('is-highlighted');
      }, 2000);
    }

}
}

// ===== ERROR ITEM COMPONENT =====

@Component({
selector: 'app-error-item',
standalone: true,
imports: [CommonModule, NzAlertModule, NzIconModule],
template: `    <nz-alert
      [nzType]="getAlertType()"
      [nzMessage]="getMessage()"
      [nzDescription]="getDescription()"
      [nzCloseable]="true"
      (nzOnClose)="dismiss.emit()"
      class="error-item"
      [class.is-clickable]="error().fieldId"
      (click)="handleClick()"
    >
      <ng-template #nzDescription>
        <div class="error-details">
          @if (error().fieldId) {
            <div class="error-field">
              <strong>Поле:</strong> {{ error().fieldId }}
            </div>
          }
          @if (error().errorResponse.recommendation) {
            <div class="error-recommendation">
              💡 {{ error().errorResponse.recommendation }}
            </div>
          }
        </div>
      </ng-template>
    </nz-alert>
 `,
styles: [`
.error-item {
margin-bottom: 8px;

      &.is-clickable {
        cursor: pointer;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }

    .error-details {
      margin-top: 8px;
      font-size: 13px;
    }

    .error-field {
      margin-bottom: 4px;
      color: #595959;
    }

    .error-recommendation {
      padding: 8px;
      background: #f6ffed;
      border-left: 3px solid #52c41a;
      border-radius: 2px;
      margin-top: 8px;
    }

`]
})
export class ErrorItemComponent {
error = input.required<RegisteredError>();
dismiss = output<void>();

getAlertType(): 'error' | 'warning' | 'info' {
const status = this.error().errorResponse.status;
if (status >= 500) return 'error';
if (status === 409) return 'warning';
if (status >= 400) return 'error';
return 'info';
}

getMessage(): string {
return this.error().errorResponse.getUserMessage();
}

getDescription(): string | undefined {
const details = this.error().errorResponse.details;
if (details && details.length > 0) {
return details.join(', ');
}
return undefined;
}

handleClick() {
// Обрабатывается родительским компонентом
}
}

Продолжить с 5.2.5 Подробные сценарии обработки ошибок?
ЧАСТЬ 5: BODY & FORMS (продолжение)
5.2.5 Подробные сценарии обработки ошибок
Сценарий 1: Локальная клиентская ошибка (Field-level)
┌────────────────────────────────────────────────────┐
│ СЦЕНАРИЙ 1: Локальная ошибка поля (Client-side) │
└────────────────────────────────────────────────────┘

ТРИГГЕР:
User вводит невалидный email в поле формы

ШАГ 1: Angular FormControl Validation
├─ FormControl.setErrors({ email: true })
├─ FormControl.markAsTouched()
└─ FormControl.updateValueAndValidity()

ШАГ 2: FormStateService регистрирует ошибку
├─ НЕ через ErrorHandlingService (это не HTTP)
├─ НЕ через HttpErrorInterceptor
└─ Напрямую в Error Registry:
errorRegistry.registerValidationError(
fieldId: 'email',
message: 'Неверный формат email',
contextId: 'users-form'
)

ШАГ 3: Error Registry
├─ Создаёт RegisteredError:
│ ├─ level: 'local'
│ ├─ source: 'validation'
│ ├─ fieldId: 'email'
│ ├─ contextId: 'users-form'
│ └─ lifecycle: 'active'
└─ Публикует событие в Event Bus:
type: 'errorRegistered'

ШАГ 4: Form Status Bar реагирует
├─ Подписан на errorRegistry.summary$
├─ Получает обновлённую сводку:
│ total: 1
│ byLevel: { field: 1, form: 0, server: 0 }
│ bySeverity: { error: 1, warning: 0 }
├─ Обновляет UI:
│ [⚠️] "1 ошибка"
│ background: #fff2f0
└─ Кнопка "1 ошибка" → кликабельна

ШАГ 5: Error Block реагирует
├─ Подписан на errorRegistry.errors$
├─ Фильтрует ошибки по contextId: 'users-form'
├─ Отображает:
│ ┌─────────────────────────────────┐
│ │ [⚠️] 1 ошибка [×] │
│ ├─────────────────────────────────┤
│ │ Email │
│ │ Неверный формат email │
│ │ Поле: email │
│ └─────────────────────────────────┘
└─ НЕ группирует (только 1 ошибка)

ШАГ 6: Поле подсвечивается
├─ CSS класс: .is-invalid добавлен к form-control
├─ Инлайн сообщение под полем:
│ <span class="form-error">
│ Неверный формат email
│ </span>
└─ НЕ требует клика на Error Block

ШАГ 7: Right Panel
├─ НЕ открывается автоматически
├─ НЕ показывает эту ошибку
└─ Локальные ошибки обрабатываются в Form

ШАГ 8: Toast/Modal
├─ НЕ показывается
└─ Только для HTTP ошибок

ШАГ 9: Global Status Bar
├─ НЕ реагирует
└─ Только для глобальных ошибок

═════════════════════════════════════════════════════

ИСПРАВЛЕНИЕ:
User исправляет email → вводит корректный

ШАГ 1: FormControl
├─ Валидация проходит
├─ FormControl.setErrors(null)
└─ FormControl.updateValueAndValidity()

ШАГ 2: FormStateService
├─ errorRegistry.resolve(registryId)
└─ Или errorRegistry.clearField('email', 'users-form')

ШАГ 3: Error Registry
├─ Обновляет lifecycle: 'resolved'
├─ Публикует событие: 'errorResolved'
└─ Удаляет из active errors

ШАГ 4: UI обновляется
├─ Form Status Bar: [✓] "Всё в порядке"
├─ Error Block: скрывается
├─ Поле: убирается .is-invalid
└─ FormStateService: transition('valid')

Сценарий 2: Серверная ошибка валидации (422)
┌────────────────────────────────────────────────────┐
│ СЦЕНАРИЙ 2: Серверная ошибка валидации (422) │
└────────────────────────────────────────────────────┘

ТРИГГЕР:
User нажимает кнопку "Сохранить"
Backend возвращает 422 + массив ошибок валидации

ПРЕДУСЛОВИЕ:
├─ Форма прошла клиентскую валидацию
├─ FormStateService.state = 'valid'
└─ User кликнул Save

ШАГ 1: Command Service
├─ commandService.execute('save', formData)
├─ FormStateService.transition('saving')
├─ Context.dataState.operation = 'saving'
└─ Form Status Bar: [⏳] "Сохранение..."

ШАГ 2: HTTP Request
├─ POST /api/users
├─ Body: { name: "John", email: "john@", age: 15 }
└─ Backend валидация:
├─ email: "Invalid format"
├─ age: "Must be 18+"
├─ phone: "Required field"
└─ status: 422

ШАГ 3: HttpErrorInterceptor перехватывает
├─ Определяет статус: 422
├─ Создаёт ErrorResponse:
│ {
│ status: 422,
│ title: "Ошибка валидации",
│ detail: "Проверьте правильность полей",
│ details: [
│ "Email: Invalid format",
│ "Age: Must be 18+",
│ "Phone: Required field"
│ ]
│ }
└─ Вызывает: errorHandlingService.handleError()

ШАГ 4: ErrorHandlingService обрабатывает
├─ Проверяет конфигурацию для 422:
│ showModal: false
│ showMessage: true ← TOAST
│ showTechnicalInfo: false
│
├─ Регистрирует в Error Registry:
│ level: 'contextual' (form-level)
│ source: 'http'
│ contextId: 'users-form'
│ errorResponse: {...}
│
├─ Показывает TOAST:
│ [⚠️] "Проверьте правильность полей"
│ duration: 5000ms
│ auto-close: true
│
├─ Публикует событие:
│ type: 'errorRegistered'
│ payload: { registryId, errorResponse, level }
│
└─ FormStateService.transition('invalid')

ШАГ 5: Form Status Bar обновляется
├─ Получает событие 'errorRegistered'
├─ errorRegistry.summary$ обновляется:
│ total: 3
│ byLevel: { field: 0, form: 0, server: 3 }
│ bySeverity: { error: 3, warning: 0 }
│
├─ Отображает:
│ [⚠️] "5 ошибок" [Клик]
│ background: #fff2f0
│ border: #ffccc7
│
└─ state: 'invalid'

ШАГ 6: Error Block открывается
├─ visible: true
├─ Получает ошибки из Registry:
│ contextId: 'users-form'
│ lifecycle: 'active'
│
├─ Группирует (>5 ошибок):
│ ┌─────────────────────────────────────┐
│ │ [⚠️] 5 ошибок [×] │
│ ├─────────────────────────────────────┤
│ │ ▼ Серверные ошибки (3) │
│ │ • Email: Invalid format │
│ │ • Age: Must be 18+ │
│ │ • Phone: Required field │
│ │ │
│ │ ▼ Ошибки полей (2) │
│ │ • Username: Already exists │
│ │ • Password: Too weak │
│ └─────────────────────────────────────┘
│
├─ maxHeight: 300px
├─ overflow-y: auto
└─ Клик на ошибку → scroll к полю + focus

ШАГ 7: Поля подсвечиваются
├─ Для каждой ошибки с fieldId:
│ ├─ Добавить .is-invalid к полю
│ ├─ Показать inline сообщение
│ └─ FormControl.setErrors()
│
└─ Для ошибок без fieldId:
└─ Только в Error Block

ШАГ 8: Right Panel (опционально)
├─ Клик на ошибку в Error Block
├─ eventBus.publish('rightPanelOpened', { panelId: 'errors' })
├─ Right Panel открывается с панелью "Errors"
├─ Показывает расширенный контекст:
│ ┌─────────────────────────────────┐
│ │ × Errors Panel │
│ ├─────────────────────────────────┤
│ │ Correlation ID: │
│ │ err_1234567890_abc123 │
│ │ │
│ │ Timestamp: │
│ │ 2024-12-17 15:30:45 │
│ │ │
│ │ Request URL: │
│ │ POST /api/users │
│ │ │
│ │ Рекомендация: │
│ │ Исправьте ошибки в форме │
│ │ (выделены красным) и │
│ │ отправьте заново. │
│ └─────────────────────────────────┘
└─ НЕ открывается автоматически

ШАГ 9: Global Status Bar
├─ НЕ реагирует (это не глобальная ошибка)
└─ Остаётся: [✓] "Система работает нормально"

ШАГ 10: Context обновляется
├─ dataState.operation = null
├─ dataState.valid = false
├─ mode остаётся 'edit'
└─ НЕ блокируется форма (можно исправить)

═════════════════════════════════════════════════════

ИСПРАВЛЕНИЕ:
User исправляет все поля и повторно нажимает Save

ШАГ 1: Форма валидна
├─ Все FormControl.valid = true
├─ Error Registry очищен от старых ошибок
└─ FormStateService.state = 'valid'

ШАГ 2: Command Service
├─ commandService.execute('save', formData)
├─ FormStateService.transition('saving')
└─ Form Status Bar: [⏳] "Сохранение..."

ШАГ 3: Backend Success (200)
├─ Данные сохранены
└─ Response: { id: 123, name: "John", ... }

ШАГ 4: Command Service Success
├─ FormStateService.transition('valid')
├─ FormStateService.markAsSaved()
├─ Context.dataState.dirty = false
├─ Context.dataState.operation = null
└─ metadata.lastSaved = new Date()

ШАГ 5: Form Status Bar
├─ [✓] "Всё в порядке"
├─ background: #f6ffed
└─ "Сохранено в 15:31"

ШАГ 6: Error Block
├─ visible: false
└─ Скрывается (нет ошибок)

ШАГ 7: Toast Success (опционально)
├─ message.success("Данные сохранены")
└─ duration: 3000ms

Сценарий 3: Конфликт данных (409)
┌────────────────────────────────────────────────────┐
│ СЦЕНАРИЙ 3: Конфликт данных (409) │
└────────────────────────────────────────────────────┘

ТРИГГЕР:
User пытается создать пользователя с email,
который уже существует в базе

ШАГ 1: Command Service
├─ commandService.execute('save', { email: "admin@example.com" })
├─ FormStateService.transition('saving')
└─ POST /api/users

ШАГ 2: Backend возвращает 409
├─ Status: 409 Conflict
├─ Response:
│ {
│ title: "Дублирование пользователя",
│ status: 409,
│ detail: "Пользователь с таким email уже существует",
│ conflictField: "email",
│ entityName: "User"
│ }
└─ HttpErrorInterceptor перехватывает

ШАГ 3: ErrorHandlingService
├─ Конфигурация для 409:
│ showModal: false ← НЕ показывать Modal
│ showMessage: false ← НЕ показывать Toast
│ → Только Registry!
│
├─ Регистрирует в Error Registry:
│ level: 'contextual'
│ source: 'http'
│ contextId: 'users-form'
│ fieldId: 'email' ← ВАЖНО
│ errorResponse: {...}
│
└─ Публикует событие

ШАГ 4: Form Status Bar
├─ [⚠️] "1 ошибка"
├─ background: #fffbe6 (warning)
└─ border: #ffe58f

ШАГ 5: Error Block
├─ visible: true
├─ Отображает:
│ ┌─────────────────────────────────────┐
│ │ [⚠️] 1 ошибка [×] │
│ ├─────────────────────────────────────┤
│ │ Дублирование пользователя │
│ │ Пользователь с таким email │
│ │ уже существует │
│ │ │
│ │ Поле: email │
│ │ │
│ │ 💡 Измените значение поля "email" │
│ │ и попробуйте снова. │
│ └─────────────────────────────────────┘
│
└─ level: 'warning' (не 'error')

ШАГ 6: Поле email подсвечивается
├─ .is-invalid класс
├─ border: orange (warning)
├─ inline сообщение:
│ "Email уже используется"
└─ Focus на поле при клике на ошибку

ШАГ 7: Right Panel (при клике)
├─ User кликает на ошибку в Error Block
├─ Right Panel "Errors" открывается
├─ Показывает:
│ ┌─────────────────────────────────┐
│ │ × Errors Panel │
│ ├─────────────────────────────────┤
│ │ Конфликтное поле: │
│ │ email │
│ │ │
│ │ Сущность: │
│ │ User │
│ │ │
│ │ Рекомендация: │
│ │ Измените значение поля "email" │
│ │ и попробуйте снова. │
│ │ │
│ │ Correlation ID: │
│ │ err_1234567890_xyz789 │
│ └─────────────────────────────────┘
└─ НЕ открывается автоматически

ШАГ 8: Toast/Modal
├─ НЕ показывается
└─ По конфигурации 409: только Registry

ШАГ 9: Global Status Bar
├─ НЕ реагирует
└─ [✓] "Система работает нормально"

ШАГ 10: FormStateService
├─ state: 'invalid'
├─ valid: false
├─ dirty: true (можно исправить)
└─ Context.mode остаётся 'edit'

═════════════════════════════════════════════════════

ИСПРАВЛЕНИЕ:
User изменяет email на уникальный

ШАГ 1: FormControl
├─ User вводит новый email
├─ FormControl.markAsDirty()
├─ FormStateService.markAsDirty()
└─ Error Registry: ошибка остаётся (до Save)

ШАГ 2: User нажимает Save
├─ FormStateService.transition('saving')
└─ POST /api/users с новым email

ШАГ 3: Backend Success (201)
├─ User создан
└─ Response: { id: 124, email: "new@example.com" }

ШАГ 4: Очистка ошибок
├─ errorRegistry.resolve(registryId)
├─ FormStateService.transition('valid')
├─ FormStateService.markAsSaved()
└─ Error Block: visible = false

ШАГ 5: Form Status Bar
├─ [✓] "Всё в порядке"
└─ "Сохранено в 15:35"

Сценарий 4: Критическая серверная ошибка (500)
┌────────────────────────────────────────────────────┐
│ СЦЕНАРИЙ 4: Критическая серверная ошибка (500) │
└────────────────────────────────────────────────────┘

ТРИГГЕР:
User нажимает Save, Backend возвращает 500

ШАГ 1: Command Service
├─ commandService.execute('save', formData)
├─ FormStateService.transition('saving')
└─ POST /api/users

ШАГ 2: Backend 500 Internal Server Error
├─ Status: 500
├─ Response:
│ {
│ title: "Ошибка сервера",
│ status: 500,
│ detail: "Internal server error",
│ type: "https://httpstatuses.com/500",
│ correlationId: "err_1234567890_abc"
│ }
└─ HttpErrorInterceptor перехватывает

ШАГ 3: ErrorHandlingService
├─ Конфигурация для 500:
│ showModal: true ← MODAL!
│ showMessage: false
│ autoRedirect: true ← Редирект на главную
│ showTechnicalInfo: true ← Correlation ID
│
├─ Регистрирует в Error Registry:
│ level: 'global' ← ВАЖНО!
│ source: 'http'
│ contextId: 'users-form'
│ errorResponse: {...}
│
├─ Показывает MODAL:
│ ┌─────────────────────────────────────┐
│ │ ❌ Ошибка сервера (500) │
│ ├─────────────────────────────────────┤
│ │ Описание: │
│ │ Внутренняя ошибка сервера. │
│ │ Попробуйте позже. │
│ │ │
│ │ 💡 Что делать: │
│ │ Попробуйте повторить операцию │
│ │ через несколько минут. │
│ │ │
│ │ ─────────────────────────────── │
│ │ Техническая информация: │
│ │ ID корреляции: │
│ │ err_1234567890_abc │
│ │ Endpoint: POST /api/users │
│ ├─────────────────────────────────────┤
│ │ [Понятно] │
│ └─────────────────────────────────────┘
│ width: 600px
│ closable: true
│
├─ Публикует событие: 'errorRegistered'
│
└─ Обновляет Context:
operationalState.locks.push({
id: 'error-err_1234567890_abc',
reason: 'Server error: 500',
source: 'system'
})

ШАГ 4: Form Status Bar
├─ [❌] "Системная ошибка"
├─ background: #fff2f0
├─ border: #ffccc7
└─ state: 'error'

ШАГ 5: Error Block
├─ visible: true
├─ Отображает:
│ ┌─────────────────────────────────────┐
│ │ [❌] 1 ошибка [×] │
│ ├─────────────────────────────────────┤
│ │ Ошибка сервера │
│ │ Внутренняя ошибка сервера. │
│ │ Попробуйте позже. │
│ │ │
│ │ 💡 Попробуйте повторить операцию │
│ │ через несколько минут. │
│ └─────────────────────────────────────┘
│
└─ maxHeight: 400px (критическая)

ШАГ 6: Global Status Bar (ВАЖНО!)
├─ Получает событие 'errorRegistered'
├─ level: 'global' → реагирует!
├─ Обновляет индикаторы:
│ [❌] "Системная ошибка" [Клик]
│ background: #ff4d4f
│ color: #fff
│ animation: pulse
│
└─ Клик открывает Modal (тот же, что уже открыт)

ШАГ 7: Context блокируется
├─ Context.operationalState.locks: [...]
├─ commandService.isAvailable('save') → false
├─ commandService.isAvailable('delete') → false
└─ Все действия заблокированы

ШАГ 8: Form UI блокируется
├─ Все inputs: disabled (через Context)
├─ Кнопки действий: disabled
├─ Form Status Bar показывает lock icon: 🔒
└─ Tooltip: "Форма заблокирована из-за системной ошибки"

ШАГ 9: Right Panel
├─ НЕ открывается автоматически
├─ Клик на ошибку → показывает:
│ ┌─────────────────────────────────┐
│ │ × Debug Panel │
│ ├─────────────────────────────────┤
│ │ Status: 500 │
│ │ Correlation ID: │
│ │ err_1234567890_abc │
│ │ │
│ │ Timestamp: │
│ │ 2024-12-17 15:40:12 │
│ │ │
│ │ Request: │
│ │ POST /api/users │
│ │ │
│ │ Retryable: false │
│ └─────────────────────────────────┘
└─ visible только если debug mode

ШАГ 10: Auto-redirect
├─ User закрывает Modal
├─ modalRef.afterClose.subscribe()
├─ autoRedirect: true
├─ router.navigate(['/'])
└─ Переход на главную страницу

ШАГ 11: FormStateService
├─ state: 'error'
├─ valid: false
├─ dirty: true
└─ metadata.saveAttempts++

═════════════════════════════════════════════════════

ВОССТАНОВЛЕНИЕ:
Backend снова доступен (перезапущен)

ШАГ 1: Health Check (фоновый)
├─ setInterval(() => ping('/api/health'), 30000)
├─ GET /api/health → 200 OK
└─ Backend снова работает

ШАГ 2: Context обновляется
├─ operationalState.backendAvailable = true
├─ operationalState.locks = [] (очистка)
└─ eventBus.publish('backendAvailable')

ШАГ 3: Global Status Bar
├─ [✓] "Система работает нормально"
├─ background: #f6ffed
└─ Убрать индикатор ошибки

ШАГ 4: Error Registry
├─ Старые ошибки остаются в lifecycle: 'active'
├─ User может очистить вручную
└─ Или auto-clear при смене контекста

ШАГ 5: Form разблокируется
├─ Inputs: enabled
├─ Buttons: enabled
└─ User может повторить Save

Сценарий 5: Сетевая ошибка (0)
┌────────────────────────────────────────────────────┐
│ СЦЕНАРИЙ 5: Сетевая ошибка (Network Error) │
└────────────────────────────────────────────────────┘

ТРИГГЕР:
User нажимает Save, но нет интернет-соединения

ШАГ 1: Command Service
├─ commandService.execute('save', formData)
├─ FormStateService.transition('saving')
└─ POST /api/users (timeout)

ШАГ 2: HttpErrorResponse (status: 0)
├─ HttpErrorResponse.status = 0
├─ HttpErrorResponse.statusText = "Unknown Error"
├─ HttpErrorResponse.error = null
└─ HttpErrorInterceptor перехватывает

ШАГ 3: ErrorHandlingService
├─ Определяет status: 0
├─ Создаёт ErrorResponse.createNetworkError()
│ {
│ title: "Проблемы с подключением",
│ status: 0,
│ detail: "Не удается подключиться к серверу",
│ userMessage: "Проверьте интернет-соединение",
│ retryable: true
│ }
│
├─ Конфигурация для 0:
│ showModal: false
│ showMessage: true ← TOAST
│ autoRedirect: false
│
├─ Регистрирует в Error Registry:
│ level: 'global' ← Сетевая ошибка = глобальная
│ source: 'http'
│ errorResponse: {...}
│
├─ Показывает TOAST:
│ [📡] "Проверьте интернет-соединение"
│ duration: 5000ms
│ type: 'error'
│
├─ Публикует событие
│
└─ Обновляет Context:
operationalState.backendAvailable = false

ШАГ 4: Global Status Bar (ВАЖНО!)
├─ level: 'global' → реагирует!
├─ Добавляет индикатор:
│ [📡] "Backend недоступен" [Клик]
│ background: #ff4d4f
│ color: #fff
│
├─ Клик открывает Modal:
│ ┌─────────────────────────────────────┐
│ │ 📡 Backend недоступен │
│ ├─────────────────────────────────────┤
│ │ Не удаётся подключиться к серверу. │
│ │ │
│ │ 💡 Рекомендация: │
│ │ Проверьте подключение к интернету │
│ │ и обновите страницу. │
│ ├─────────────────────────────────────┤
│ │ [Обновить страницу] │
│ └─────────────────────────────────────┘
│
└─ nzOnOk: () => window.location.reload()

ШАГ 5: Form Status Bar
├─ [⚠️] "Системная ошибка"
├─ background: #fff2f0
└─ state: 'error'

ШАГ 6: Error Block
├─ visible: true
├─ Отображает:
│ ┌─────────────────────────────────────┐
│ │ [📡] 1 ошибка [×] │
│ ├─────────────────────────────────────┤
│ │ Проблемы с подключением │
│ │ Не удается подключиться к серверу │
│ │ │
│ │ 💡 Проверьте подключение к │
│ │ интернету и попробуйте снова. │
│ └─────────────────────────────────────┘
└─ НЕ показывает технических деталей

ШАГ 7: Context блокируется
├─ operationalState.backendAvailable = false
├─ commandService.isAvailable() → false (все команды)
└─ Форма переходит в read-only

ШАГ 8: Form UI
├─ Inputs: НЕ disabled (можно продолжить редактировать)
├─ Кнопка Save: disabled
├─ Tooltip: "Backend недоступен"
└─ User может продолжить ввод данных

ШАГ 9: FormStateService
├─ state: 'error'
├─ dirty: true (данные НЕ потеряны)
└─ Можно восстановить после подключения

ШАГ 10: Right Panel
├─ НЕ открывается
└─ Нет смысла показывать детали сетевой ошибки

═════════════════════════════════════════════════════

ВОССТАНОВЛЕНИЕ:
Интернет появился

ШАГ 1: Retry механизм (автоматический)
├─ HttpClient: retry(3)
├─ Или User нажимает "Обновить"
└─ Backend снова доступен

ШАГ 2: Context обновляется
├─ operationalState.backendAvailable = true
├─ eventBus.publish('backendAvailable')
└─ Очистка блокировок

ШАГ 3: Global Status Bar
├─ Убирает индикатор 📡
└─ [✓] "Система работает нормально"

ШАГ 4: Error Block
├─ visible: false (если ошибки очищены)
└─ Или остаётся, пока User не закроет

ШАГ 5: Form разблокируется
├─ Кнопка Save: enabled
├─ FormStateService: state = 'dirty'
└─ User может повторить Save

5.2.6 UX-правила подсветки полей и строк
// ===== UX ПРАВИЛА ПОДСВЕТКИ =====

/\*\*

- Правила подсветки полей формы
  \*/
  export const FIELD_HIGHLIGHT_RULES = {
  // 1. INVALID FIELD (клиентская валидация)
  clientValidation: {
  trigger: 'FormControl.invalid && FormControl.touched',
  cssClass: 'is-invalid',
  borderColor: '#ff4d4f',
  backgroundColor: '#fff2f0',
  showInlineError: true,
  errorPosition: 'below', // под полем
  errorStyle: {
  color: '#ff4d4f',
  fontSize: '12px',
  marginTop: '4px'
  }
  },

// 2. SERVER ERROR (422 с fieldId)
serverValidation: {
trigger: 'ErrorRegistry contains error with fieldId',
cssClass: 'is-invalid is-server-error',
borderColor: '#ff4d4f',
backgroundColor: '#fff2f0',
showInlineError: true,
errorPosition: 'below',
icon: 'icon-warning',
errorStyle: {
color: '#ff4d4f',
fontSize: '12px',
marginTop: '4px',
fontWeight: '500'
}
},

// 3. CONFLICT (409 с conflictField)
conflict: {
trigger: 'ErrorRegistry contains 409 error',
cssClass: 'is-invalid is-conflict',
borderColor: '#faad14',
backgroundColor: '#fffbe6',
showInlineError: true,
showRecommendation: true,
errorStyle: {
color: '#d48806',
fontSize: '12px',
marginTop: '4px'
}
},

// 4. FOCUSED ON ERROR (клик из Error Block)
highlighted: {
trigger: 'User clicked error in Error Block',
cssClass: 'is-highlighted',
animation: 'highlight-pulse 2s ease-out',
scrollBehavior: 'smooth',
scrollBlock: 'center',
focusField: true,
removeDuration: 2000 // ms
},

// 5. READONLY
readonly: {
trigger: 'Context.mode === "readonly"',
cssClass: 'is-readonly',
disabled: true,
backgroundColor: '#f5f5f5',
cursor: 'not-allowed'
}
};

/\*\*

- Правила подсветки строк таблицы
  \*/
  export const ROW_HIGHLIGHT_RULES = {
  // 1. INVALID ROW (серверная ошибка с rowId)
  invalid: {
  trigger: 'ErrorRegistry contains error with rowId',
  cssClass: 'is-invalid',
  backgroundColor: '#fff2f0',
  borderLeft: '3px solid #ff4d4f',
  icon: {
  position: 'first-column',
  iconKey: 'icon-warning',
  color: '#ff4d4f',
  tooltip: 'Есть ошибки в этой строке'
  },
  showInErrorBlock: true
  },

// 2. WARNING ROW (предупреждение)
warning: {
trigger: 'ErrorRegistry contains warning with rowId',
cssClass: 'is-warning',
backgroundColor: '#fffbe6',
borderLeft: '3px solid #faad14',
icon: {
position: 'first-column',
iconKey: 'icon-info-circle',
color: '#faad14',
tooltip: 'Есть предупреждения'
}
},

// 3. SELECTED ROW
selected: {
trigger: 'Context.selection.selectedIds includes rowId',
cssClass: 'is-selected',
backgroundColor: '#e6f7ff',
borderLeft: '3px solid #1890ff',
checkbox: {
checked: true
}
},

// 4. HIGHLIGHTED ROW (клик из Error Block)
highlighted: {
trigger: 'User clicked row error in Error Block',
cssClass: 'is-highlighted',
animation: 'highlight-pulse 2s ease-out',
scrollBehavior: 'smooth',
scrollBlock: 'center',
removeDuration: 2000
}
};

CSS для подсветки:
// ===== FIELD STYLES =====

.form-control {
transition: all 0.3s;
border: 1px solid #d9d9d9;

&.is-invalid {
border-color: #ff4d4f;
background-color: #fff2f0;

    &:focus {
      border-color: #ff4d4f;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }

}

&.is-conflict {
border-color: #faad14;
background-color: #fffbe6;

    &:focus {
      border-color: #faad14;
      box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
    }

}

&.is-highlighted {
animation: highlight-pulse 2s ease-out;
}

&.is-readonly {
background-color: #f5f5f5;
cursor: not-allowed;
pointer-events: none;
}
}

.form-error {
display: block;
color: #ff4d4f;
font-size: 12px;
margin-top: 4px;
animation: slide-down 0.3s ease-out;
}

@keyframes highlight-pulse {
0%, 100% {
box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
}
50% {
box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.4);
}
}

@keyframes slide-down {
from {
opacity: 0;
transform: translateY(-4px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

// ===== TABLE ROW STYLES =====

.table-row {
transition: all 0.3s;

&.is-invalid {
background-color: #fff2f0;
border-left: 3px solid #ff4d4f;

    &:hover {
      background-color: #ffe7e5;
    }

}

&.is-warning {
background-color: #fffbe6;
border-left: 3px solid #faad14;

    &:hover {
      background-color: #fff7d1;
    }

}

&.is-selected {
background-color: #e6f7ff;
border-left: 3px solid #1890ff;

    &:hover {
      background-color: #d1edff;
    }

}

&.is-highlighted {
animation: highlight-pulse 2s ease-out;
}
}

.row-error-icon {
display: inline-flex;
align-items: center;
justify-content: center;
width: 20px;
height: 20px;
border-radius: 50%;

&.is-error {
color: #ff4d4f;
background-color: #fff2f0;
}

}

&.is-warning {
color: #faad14;
background-color: #fffbe6;
}

Продолжить с 5.3 ng-zorro интеграция (обёртки компонентов)?

ЧАСТЬ 5: BODY & FORMS (продолжение)
5.3 ng-zorro интеграция
Назначение:
ng-zorro используется только для инфраструктуры (Grid, Table, Pagination, Modal, Input/Select). Все компоненты ng-zorro ОБЯЗАТЕЛЬНО обёртываются своими классами. Прямое использование .ant-\* классов ЗАПРЕЩЕНО.
Принципы интеграции:
┌─────────────────────────────────────────────────┐
│ ПРИНЦИПЫ ИНТЕГРАЦИИ NG-ZORRO │
└─────────────────────────────────────────────────┘

1. ng-zorro = UI-ИНФРАСТРУКТУРА
   ✅ Grid (nz-row, nz-col)
   ✅ Table (nz-table)
   ✅ Pagination (nz-pagination)
   ✅ Modal (nz-modal)
   ✅ Message (nz-message)
   ✅ Input/Select (опционально)
   ✅ Icons (nz-icon через Icon Provider)

2. ОБЯЗАТЕЛЬНАЯ ОБЁРТКА
   ❌ <nz-table> напрямую
   ✅ <div class="table-panel"><nz-table></nz-table></div>

3. ЗАПРЕТ НА .ant-\* КЛАССЫ
   ❌ .ant-table { color: red }
   ✅ .table-panel { color: red }

4. СЕМАНТИКА — НАША
   ng-zorro отвечает только за поведение
   Внешний вид — наши классы

5. ЗАМЕНА В БУДУЩЕМ
   Обёртки позволяют заменить ng-zorro
   без изменения HTML/логики

5.3.1 Grid System (nz-row / nz-col)
// ===== GRID WRAPPER COMPONENT =====

@Component({
selector: 'app-grid-row',
standalone: true,
imports: [CommonModule, NzGridModule],
template: `    <nz-row
      [nzGutter]="gutter()"
      [nzAlign]="align()"
      [nzJustify]="justify()"
      class="grid-row"
    >
      <ng-content></ng-content>
    </nz-row>
 `,
styles: [`
.grid-row {
/* Наши стили для grid-row */
/* НЕ стилизуем .ant-row напрямую */
}
`]
})
export class GridRowComponent {
gutter = input<number | [number, number]>(16);
align = input<'top' | 'middle' | 'bottom'>('top');
justify = input<'start' | 'end' | 'center' | 'space-around' | 'space-between'>('start');
}

@Component({
selector: 'app-grid-col',
standalone: true,
imports: [CommonModule, NzGridModule],
template: `    <nz-col
      [nzSpan]="span()"
      [nzOffset]="offset()"
      [nzPush]="push()"
      [nzPull]="pull()"
      [nzXs]="xs()"
      [nzSm]="sm()"
      [nzMd]="md()"
      [nzLg]="lg()"
      [nzXl]="xl()"
      [nzXXl]="xxl()"
      class="grid-col"
    >
      <ng-content></ng-content>
    </nz-col>
 `,
styles: [`
.grid-col {
/* Наши стили для grid-col */
}
`]
})
export class GridColComponent {
span = input<number>(24);
offset = input<number>(0);
push = input<number>(0);
pull = input<number>(0);

// Responsive
xs = input<number | { span: number; offset?: number }>();
sm = input<number | { span: number; offset?: number }>();
md = input<number | { span: number; offset?: number }>();
lg = input<number | { span: number; offset?: number }>();
xl = input<number | { span: number; offset?: number }>();
xxl = input<number | { span: number; offset?: number }>();
}

Использование Grid:
// ===== ПРИМЕР ИСПОЛЬЗОВАНИЯ GRID =====

@Component({
selector: 'app-user-form',
template: `
<app-page-shell [config]="pageConfig()">
<app-grid-row [gutter]="16">
<!-- Left Column -->
<app-grid-col [span]="16">
<section class="page-body">
<h2>Основная информация</h2>
<!-- Form fields -->
</section>
</app-grid-col>

        <!-- Right Column -->
        <app-grid-col [span]="8">
          <aside class="page-sidebar">
            <h3>Дополнительно</h3>
            <!-- Metadata -->
          </aside>
        </app-grid-col>
      </app-grid-row>
    </app-page-shell>

`,
  styles: [`
.page-body {
/_ Семантические стили для контента _/
background: #fff;
padding: 24px;
border-radius: 4px;
}

    .page-sidebar {
      /* Семантические стили для sidebar */
      background: #fafafa;
      padding: 16px;
      border-radius: 4px;
    }

`]
})
export class UserFormComponent {
// ...
}

5.3.2 Table Wrapper
// ===== TABLE WRAPPER INTERFACES =====

export interface TableConfig<T = any> {
// Данные
data: T[];

// Колонки
columns: TableColumn<T>[];

// Состояния
loading?: boolean;
bordered?: boolean;
size?: 'default' | 'middle' | 'small';

// Пагинация (отключена в wrapper - через page-footer)
showPagination?: false;

// Сортировка
sortable?: boolean;

// Selection
selectable?: boolean;
selectedRows?: T[];

// События
onRowClick?: (row: T) => void;
onSelectionChange?: (selected: T[]) => void;
}

export interface TableColumn<T = any> {
key: string;
title: string;
width?: string;
align?: 'left' | 'center' | 'right';
sortable?: boolean;
render?: (value: any, row: T) => string | TemplateRef<any>;
cellClass?: (row: T) => string;
}

// ===== TABLE WRAPPER COMPONENT =====

@Component({
selector: 'app-table',
standalone: true,
imports: [CommonModule, NzTableModule, NzCheckboxModule],
template: `
<div
class="table-panel"
[class.is-loading]="config().loading"
[class.is-bordered]="config().bordered" >
<!-- Table Header (optional toolbar) -->
<div class="table-header">
<ng-content select="[table-header]"></ng-content>
</div>

      <!-- Table Body -->
      <nz-table
        #basicTable
        [nzData]="config().data"
        [nzLoading]="config().loading || false"
        [nzBordered]="config().bordered || false"
        [nzSize]="config().size || 'default'"
        [nzShowPagination]="false"
        class="table-body"
      >
        <thead>
          <tr>
            <!-- Selection Column -->
            @if (config().selectable) {
              <th
                nzWidth="50px"
                [nzChecked]="isAllSelected()"
                (nzCheckedChange)="onSelectAll($event)"
              ></th>
            }

            <!-- Data Columns -->
            @for (col of config().columns; track col.key) {
              <th
                [nzWidth]="col.width"
                [nzAlign]="col.align"
                [nzSortFn]="col.sortable ? getSortFn(col.key) : null"
              >
                {{ col.title }}
              </th>
            }
          </tr>
        </thead>

        <tbody>
          @for (row of config().data; track row; let i = $index) {
            <tr
              class="table-row"
              [class]="getRowClass(row)"
              (click)="handleRowClick(row)"
            >
              <!-- Selection Cell -->
              @if (config().selectable) {
                <td>
                  <label
                    nz-checkbox
                    [ngModel]="isRowSelected(row)"
                    (ngModelChange)="onRowSelect(row, $event)"
                    (click)="$event.stopPropagation()"
                  ></label>
                </td>
              }

              <!-- Data Cells -->
              @for (col of config().columns; track col.key) {
                <td
                  [align]="col.align"
                  [class]="col.cellClass ? col.cellClass(row) : ''"
                >
                  @if (col.render) {
                    <ng-container
                      *ngTemplateOutlet="col.render(getCellValue(row, col.key), row)"
                    ></ng-container>
                  } @else {
                    {{ getCellValue(row, col.key) }}
                  }
                </td>
              }
            </tr>
          }

          <!-- Empty State -->
          @if (config().data.length === 0 && !config().loading) {
            <tr>
              <td [attr.colspan]="getColspan()" class="table-empty">
                <div class="empty-state">
                  <app-icon iconKey="icon-inbox"></app-icon>
                  <p>Нет данных</p>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>

      <!-- Table Footer (optional) -->
      <div class="table-footer">
        <ng-content select="[table-footer]"></ng-content>
      </div>
    </div>

`,
  styles: [`
.table-panel {
background: #fff;
border-radius: 4px;
overflow: hidden;

      &.is-loading {
        opacity: 0.6;
        pointer-events: none;
      }

      &.is-bordered {
        border: 1px solid #f0f0f0;
      }
    }

    .table-header,
    .table-footer {
      padding: 12px 16px;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;
    }

    .table-footer {
      border-bottom: none;
      border-top: 1px solid #f0f0f0;
    }

    .table-body {
      /* Стилизуем wrapper, НЕ .ant-table */
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #fafafa;
      }

      &.is-selected {
        background-color: #e6f7ff;

        &:hover {
          background-color: #d1edff;
        }
      }

      &.is-invalid {
        background-color: #fff2f0;
        border-left: 3px solid #ff4d4f;
      }

      &.is-warning {
        background-color: #fffbe6;
        border-left: 3px solid #faad14;
      }
    }

    .table-empty {
      text-align: center;
      padding: 48px 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #8c8c8c;

      app-icon {
        font-size: 48px;
        opacity: 0.3;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

`]
})
export class TableComponent<T = any> {
config = input.required<TableConfig<T>>();

private selectedRows = signal<T[]>([]);

ngOnInit() {
if (this.config().selectedRows) {
this.selectedRows.set(this.config().selectedRows);
}
}

isAllSelected(): boolean {
const data = this.config().data;
if (data.length === 0) return false;

    return data.every(row => this.isRowSelected(row));

}

isRowSelected(row: T): boolean {
return this.selectedRows().includes(row);
}

onSelectAll(checked: boolean) {
if (checked) {
this.selectedRows.set([...this.config().data]);
} else {
this.selectedRows.set([]);
}

    this.emitSelectionChange();

}

onRowSelect(row: T, checked: boolean) {
if (checked) {
this.selectedRows.update(rows => [...rows, row]);
} else {
this.selectedRows.update(rows => rows.filter(r => r !== row));
}

    this.emitSelectionChange();

}

handleRowClick(row: T) {
if (this.config().onRowClick) {
this.config().onRowClick(row);
}
}

getRowClass(row: T): string {
const classes: string[] = [];

    if (this.isRowSelected(row)) {
      classes.push('is-selected');
    }

    // Проверка на ошибки из Error Registry
    // (должно быть реализовано через ErrorRegistry.getRowErrors)

    return classes.join(' ');

}

getCellValue(row: T, key: string): any {
return (row as any)[key];
}

getColspan(): number {
let count = this.config().columns.length;
if (this.config().selectable) count++;
return count;
}

getSortFn(key: string) {
return (a: T, b: T) => {
const aVal = this.getCellValue(a, key);
const bVal = this.getCellValue(b, key);

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal);
      }

      return aVal - bVal;
    };

}

private emitSelectionChange() {
if (this.config().onSelectionChange) {
this.config().onSelectionChange(this.selectedRows());
}
}
}

Использование Table:
// ===== ПРИМЕР ИСПОЛЬЗОВАНИЯ TABLE =====

@Component({
selector: 'app-users-list',
template: `
<app-page-shell [config]="pageConfig()">
<!-- Search/Filters -->
<div search-filters>
<input
type="text"
placeholder="Поиск..."
[(ngModel)]="searchTerm"
/>
</div>

      <!-- Table -->
      <app-table
        [config]="tableConfig()"
      >
        <!-- Table Header Toolbar -->
        <div table-header>
          <span>Всего пользователей: {{ totalUsers() }}</span>
          <button
            nz-button
            nzType="primary"
            (click)="exportSelected()"
            [disabled]="selectedUsers().length === 0"
          >
            Экспорт выбранных ({{ selectedUsers().length }})
          </button>
        </div>

        <!-- Table Footer (if needed) -->
        <div table-footer>
          <small>Показано {{ users().length }} из {{ totalUsers() }}</small>
        </div>
      </app-table>

      <!-- Pagination -->
      <div page-footer class="page-footer-content">
        <app-pagination [config]="paginationConfig()"></app-pagination>

        <div class="actions-block">
          <button nz-button nzType="primary" (click)="createUser()">
            Создать пользователя
          </button>
        </div>
      </div>
    </app-page-shell>

`
})
export class UsersListComponent {
users = signal<User[]>([]);
totalUsers = signal(0);
selectedUsers = signal<User[]>([]);
searchTerm = '';

tableConfig = computed<TableConfig<User>>(() => ({
data: this.users(),
loading: this.loading(),
bordered: true,
selectable: true,
selectedRows: this.selectedUsers(),
columns: [
{
key: 'id',
title: 'ID',
width: '80px',
sortable: true
},
{
key: 'name',
title: 'Имя',
sortable: true,
render: (value, row) => this.nameTemplate
},
{
key: 'email',
title: 'Email',
sortable: true
},
{
key: 'role',
title: 'Роль',
width: '120px',
render: (value) => this.roleTemplate
},
{
key: 'status',
title: 'Статус',
width: '100px',
cellClass: (row) => this.getStatusClass(row.status),
render: (value) => this.statusTemplate
},
{
key: 'actions',
title: 'Действия',
width: '120px',
align: 'center',
render: () => this.actionsTemplate
}
],
onRowClick: (user) => this.editUser(user),
onSelectionChange: (selected) => this.selectedUsers.set(selected)
}));

// Templates
@ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
@ViewChild('roleTemplate', { static: true }) roleTemplate!: TemplateRef<any>;
@ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
@ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

getStatusClass(status: string): string {
const classes: Record<string, string> = {
active: 'status-success',
inactive: 'status-warning',
banned: 'status-error'
};
return classes[status] || '';
}
}

// ===== TEMPLATES В HTML =====
/\*
<ng-template #nameTemplate let-value let-row="row">

  <div class="user-name-cell">
    <nz-avatar [nzSrc]="row.avatarUrl" [nzText]="row.name[0]"></nz-avatar>
    <span>{{ value }}</span>
  </div>
</ng-template>

<ng-template #roleTemplate let-value>
<nz-tag [nzColor]="getRoleColor(value)">
{{ value }}
</nz-tag>
</ng-template>

<ng-template #statusTemplate let-value>
<span class="status-badge" [class]="getStatusClass(value)">
{{ getStatusLabel(value) }}
</span>
</ng-template>

<ng-template #actionsTemplate let-row="row">
<button
nz-button
nzType="link"
nzSize="small"
(click)="editUser(row); $event.stopPropagation()"

>

    Редактировать

  </button>
</ng-template>
*/

5.3.3 Pagination Wrapper
// ===== PAGINATION WRAPPER =====

export interface PaginationConfig {
total: number;
pageSize: number;
currentPage: number;
pageSizeOptions?: number[];
showSizeChanger?: boolean;
showTotal?: boolean;
showQuickJumper?: boolean;
onPageChange: (page: number) => void;
onPageSizeChange: (size: number) => void;
}

@Component({
selector: 'app-pagination',
standalone: true,
imports: [CommonModule, NzPaginationModule],
template: `
<div class="pagination-panel">
<nz-pagination
[nzTotal]="config().total"
[nzPageSize]="config().pageSize"
[nzPageIndex]="config().currentPage"
[nzPageSizeOptions]="config().pageSizeOptions || [10, 20, 50, 100]"
[nzShowSizeChanger]="config().showSizeChanger !== false"
[nzShowTotal]="totalTemplate"
[nzShowQuickJumper]="config().showQuickJumper"
(nzPageIndexChange)="config().onPageChange($event)"
        (nzPageSizeChange)="config().onPageSizeChange($event)"
class="pagination-control" ></nz-pagination>

      <ng-template #totalTemplate let-total let-range="range">
        <span class="pagination-total">
          Показано {{ range[0] }}–{{ range[1] }} из {{ total }}
        </span>
      </ng-template>
    </div>

`,
  styles: [`
.pagination-panel {
display: flex;
justify-content: space-between;
align-items: center;
}

    .pagination-control {
      /* Стилизуем wrapper, НЕ .ant-pagination */
    }

    .pagination-total {
      color: #8c8c8c;
      font-size: 14px;
    }

`]
})
export class PaginationComponent {
config = input.required<PaginationConfig>();
}

5.3.4 Modal Wrapper
// ===== MODAL WRAPPER =====

export interface ModalConfig {
title: string;
content?: string | TemplateRef<any>;
width?: number | string;
closable?: boolean;
maskClosable?: boolean;
footer?: ModalFooter;
onOk?: () => void | Promise<void>;
onCancel?: () => void;
}

export interface ModalFooter {
showOk?: boolean;
showCancel?: boolean;
okText?: string;
cancelText?: string;
okLoading?: boolean;
okDisabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
private readonly nzModalService = inject(NzModalService);

/\*\*

- Открыть информационный модал
  \*/
  info(config: ModalConfig): NzModalRef {
  return this.nzModalService.info({
  nzTitle: config.title,
  nzContent: config.content,
  nzWidth: config.width || 520,
  nzClosable: config.closable !== false,
  nzMaskClosable: config.maskClosable,
  nzOkText: config.footer?.okText || 'Понятно',
  nzClassName: 'modal-panel modal-info',
  nzOnOk: config.onOk
  });
  }

/\*\*

- Открыть модал подтверждения
  \*/
  confirm(config: ModalConfig): NzModalRef {
  return this.nzModalService.confirm({
  nzTitle: config.title,
  nzContent: config.content,
  nzWidth: config.width || 520,
  nzClosable: config.closable !== false,
  nzMaskClosable: config.maskClosable,
  nzOkText: config.footer?.okText || 'Подтвердить',
  nzCancelText: config.footer?.cancelText || 'Отмена',
  nzOkDanger: false,
  nzClassName: 'modal-panel modal-confirm',
  nzOnOk: config.onOk,
  nzOnCancel: config.onCancel
  });
  }

/\*\*

- Открыть модал ошибки
  \*/
  error(config: ModalConfig): NzModalRef {
  return this.nzModalService.error({
  nzTitle: config.title,
  nzContent: config.content,
  nzWidth: config.width || 520,
  nzClosable: config.closable !== false,
  nzMaskClosable: config.maskClosable,
  nzOkText: config.footer?.okText || 'Понятно',
  nzClassName: 'modal-panel modal-error',
  nzOnOk: config.onOk
  });
  }

/\*\*

- Открыть предупреждающий модал
  \*/
  warning(config: ModalConfig): NzModalRef {
  return this.nzModalService.warning({
  nzTitle: config.title,
  nzContent: config.content,
  nzWidth: config.width || 520,
  nzClosable: config.closable !== false,
  nzMaskClosable: config.maskClosable,
  nzOkText: config.footer?.okText || 'Понятно',
  nzClassName: 'modal-panel modal-warning',
  nzOnOk: config.onOk
  });
  }

/\*\*

- Открыть успешный модал
  \*/
  success(config: ModalConfig): NzModalRef {
  return this.nzModalService.success({
  nzTitle: config.title,
  nzContent: config.content,
  nzWidth: config.width || 520,
  nzClosable: config.closable !== false,
  nzMaskClosable: config.maskClosable,
  nzOkText: config.footer?.okText || 'Отлично',
  nzClassName: 'modal-panel modal-success',
  nzOnOk: config.onOk
  });
  }

/\*\*

- Создать кастомный модал с компонентом
  \*/
  create<T = any>(component: Type<T>, config: ModalConfig & { data?: any }): NzModalRef<T> {
  return this.nzModalService.create({
  nzTitle: config.title,
  nzContent: component,
  nzData: config.data,
  nzWidth: config.width || 720,
  nzClosable: config.closable !== false,
  nzMaskClosable: config.maskClosable,
  nzFooter: this.buildFooter(config.footer),
  nzClassName: 'modal-panel modal-custom',
  nzOnOk: config.onOk,
  nzOnCancel: config.onCancel
  });
  }

private buildFooter(footer?: ModalFooter): TemplateRef<any> | null {
if (!footer || (footer.showOk === false && footer.showCancel === false)) {
return null;
}

    // Вернуть default footer ng-zorro
    return null as any;

}
}

Использование Modal:
// ===== ПРИМЕР ИСПОЛЬЗОВАНИЯ MODAL =====

@Component({
selector: 'app-user-form'
})
export class UserFormComponent {
private readonly modalService = inject(ModalService);
private readonly commandService = inject(CommandService);

onDelete() {
this.modalService.confirm({
title: 'Удалить пользователя?',
content: 'Это действие нельзя отменить. Все данные пользователя будут удалены.',
footer: {
okText: 'Удалить',
cancelText: 'Отмена'
},
onOk: async () => {
return this.commandService.execute('delete', {
id: this.userId
}).toPromise();
}
});
}

onSaveError(error: ErrorResponse) {
this.modalService.error({
title: 'Ошибка сохранения',
content: `        <p>${error.getUserMessage()}</p>
        ${error.recommendation ?`<p><strong>Рекомендация:</strong> ${error.recommendation}</p>`: ''}
     `,
footer: {
okText: 'Понятно'
}
});
}

onSaveSuccess() {
this.modalService.success({
title: 'Данные сохранены',
content: 'Изменения успешно применены',
footer: {
okText: 'Отлично'
},
onOk: () => {
this.router.navigate(['/admin/users']);
}
});
}
}

5.3.5 Form Controls Wrappers
// ===== INPUT WRAPPER =====

@Component({
selector: 'app-input',
standalone: true,
imports: [CommonModule, FormsModule, ReactiveFormsModule, NzInputModule],
template: `
<div
class="form-control-wrapper"
[class.is-invalid]="invalid()"
[class.is-disabled]="disabled()"
[class.is-readonly]="readonly()" >
<input
nz-input
[type]="type()"
[placeholder]="placeholder()"
[disabled]="disabled()"
[readonly]="readonly()"
[ngModel]="value()"
(ngModelChange)="valueChange.emit($event)"
(blur)="onBlur()"
class="form-control"
/>

      @if (invalid() && errorMessage()) {
        <span class="form-error">
          <app-icon iconKey="icon-warning"></app-icon>
          {{ errorMessage() }}
        </span>
      }
    </div>

`,
  styles: [`
.form-control-wrapper {
display: flex;
flex-direction: column;
gap: 4px;
}

    .form-control {
      /* Стилизуем wrapper, НЕ .ant-input */
      transition: all 0.3s;

      &:focus {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }

    .form-control-wrapper.is-invalid .form-control {
      border-color: #ff4d4f;
      background-color: #fff2f0;

      &:focus {
        border-color: #ff4d4f;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }
    }

    .form-control-wrapper.is-disabled .form-control {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .form-control-wrapper.is-readonly .form-control {
      background-color: #fafafa;
      border-color: #d9d9d9;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff4d4f;
      font-size: 12px;
      animation: slide-down 0.3s ease-out;
    }

`]
})
export class InputComponent {
type = input<string>('text');
placeholder = input<string>('');
value = input<string>('');
disabled = input<boolean>(false);
readonly = input<boolean>(false);
invalid = input<boolean>(false);
errorMessage = input<string>('');

valueChange = output<string>();
blur = output<void>();

onBlur() {
this.blur.emit();
}
}

// ===== SELECT WRAPPER =====

@Component({
selector: 'app-select',
standalone: true,
imports: [CommonModule, FormsModule, NzSelectModule],
template: `
<div
class="form-control-wrapper"
[class.is-invalid]="invalid()"
[class.is-disabled]="disabled()" >
<nz-select
[nzPlaceHolder]="placeholder()"
[nzDisabled]="disabled()"
[ngModel]="value()"
(ngModelChange)="valueChange.emit($event)"
[nzShowSearch]="searchable()"
[nzAllowClear]="clearable()"
class="form-control" >
@for (option of options(); track option.value) {
<nz-option
[nzValue]="option.value"
[nzLabel]="option.label"
[nzDisabled]="option.disabled" ></nz-option>
}
</nz-select>

      @if (invalid() && errorMessage()) {
        <span class="form-error">
          <app-icon iconKey="icon-warning"></app-icon>
          {{ errorMessage() }}
        </span>
      }
    </div>

`,
  styles: [`
.form-control-wrapper {
display: flex;
flex-direction: column;
gap: 4px;
}

    .form-control {
      width: 100%;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff4d4f;
      font-size: 12px;
    }

`]
})
export class SelectComponent {
placeholder = input<string>('Выберите...');
value = input<any>();
options = input.required<SelectOption[]>();
disabled = input<boolean>(false);
searchable = input<boolean>(false);
clearable = input<boolean>(false);
invalid = input<boolean>(false);
errorMessage = input<string>('');

valueChange = output<any>();
}

export interface SelectOption {
value: any;
label: string;
disabled?: boolean;
}

5.3.6 Alert/Message Wrapper
// ===== MESSAGE SERVICE WRAPPER =====

@Injectable({ providedIn: 'root' })
export class MessageService {
private readonly nzMessage = inject(NzMessageService);

success(message: string, duration: number = 3000) {
return this.nzMessage.success(message, {
nzDuration: duration,
nzAnimate: true
});
}

error(message: string, duration: number = 5000) {
return this.nzMessage.error(message, {
nzDuration: duration,
nzAnimate: true
});
}

warning(message: string, duration: number = 4000) {
return this.nzMessage.warning(message, {
nzDuration: duration,
nzAnimate: true
});
}

info(message: string, duration: number = 3000) {
return this.nzMessage.info(message, {
nzDuration: duration,
nzAnimate: true
});
}

loading(message: string) {
return this.nzMessage.loading(message, {
nzDuration: 0 // Не скрывать автоматически
});
}
}

// ===== ALERT COMPONENT WRAPPER =====

@Component({
selector: 'app-alert',
standalone: true,
imports: [CommonModule, NzAlertModule],
template: `    <nz-alert
      [nzType]="type()"
      [nzMessage]="message()"
      [nzDescription]="description()"
      [nzShowIcon]="showIcon() !== false"
      [nzCloseable]="closeable()"
      [nzBanner]="banner()"
      (nzOnClose)="close.emit()"
      class="alert-panel"
      [class.is-banner]="banner()"
    ></nz-alert>
 `,
styles: [`
.alert-panel {
/_ Стилизуем wrapper, НЕ .ant-alert _/
margin-bottom: 16px;

      &.is-banner {
        border-radius: 0;
        border: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }
    }

`]
})
export class AlertComponent {
type = input<'success' | 'info' | 'warning' | 'error'>('info');
message = input.required<string>();
description = input<string>();
showIcon = input<boolean>(true);
closeable = input<boolean>(false);
banner = input<boolean>(false);

close = output<void>();
}

5.3.7 CSS для ng-zorro интеграции
// ===== styles/ng-zorro-overrides.scss =====

/\*\*

- КРИТИЧНО: Этот файл переопределяет ТОЛЬКО CSS-переменные ng-zorro
- НЕ переопределяем .ant-_ классы напрямую!
  _/

:root {
// Primary Color
--ant-primary-color: #1890ff;
--ant-primary-color-hover: #40a9ff;
--ant-primary-color-active: #096dd9;

// Success
--ant-success-color: #52c41a;

// Warning
--ant-warning-color: #faad14;

// Error
--ant-error-color: #ff4d4f;

// Info
--ant-info-color: #1890ff;

// Text
--ant-text-color: #262626;
--ant-text-color-secondary: #8c8c8c;

// Border
--ant-border-color-base: #d9d9d9;
--ant-border-radius-base: 4px;

// Background
--ant-background-color-base: #f0f0f0;

// Font
--ant-font-size-base: 14px;
--ant-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/\*\*

- ЗАПРЕЩЕНО:
- .ant-table { ... }
- .ant-input { ... }
- .ant-modal { ... }
-
- РАЗРЕШЕНО:
- .table-panel { ... }
- .form-control { ... }
- .modal-panel { ... }
  \*/

Продолжить с ЧАСТЬ 6: UI COMPONENTS LIBRARY?
ЧАСТЬ 6: UI COMPONENTS LIBRARY
6.1 Buttons
Назначение:
Единая система кнопок для всего приложения. Все кнопки используют свою реализацию, ng-zorro НЕ используется для кнопок (за исключением интеграции в формах через nz-button директиву).
Интерфейсы:
// ===== BUTTON INTERFACES =====

/\*\*

- Конфигурация кнопки
  \*/
  export interface ButtonConfig {
  // Текст кнопки
  label: string;

// Тип кнопки
type?: ButtonType;

// Размер
size?: ButtonSize;

// Иконка (через Icon Provider)
icon?: string;

// Позиция иконки
iconPosition?: 'left' | 'right';

// Состояния
disabled?: boolean;
loading?: boolean;

// Варианты отображения
block?: boolean; // На всю ширину
ghost?: boolean; // Прозрачная с рамкой

// Обработчик клика
onClick?: () => void | Promise<void>;
}

export type ButtonType =
| 'primary' // Основное действие
| 'secondary' // Вторичное действие
| 'success' // Успешное действие (Save, Confirm)
| 'warning' // Предупреждение
| 'danger' // Опасное действие (Delete)
| 'link'; // Ссылка-кнопка

export type ButtonSize =
| 'sm' // Маленькая (28px)
| 'md' // Средняя (32px) - default
| 'lg'; // Большая (40px)

/\*\*

- Группа кнопок
  \*/
  export interface ButtonGroupConfig {
  buttons: ButtonConfig[];
  direction?: 'horizontal' | 'vertical';
  gap?: number; // px
  }

Button Component:
// ===== BUTTON COMPONENT =====

@Component({
selector: 'app-button',
standalone: true,
imports: [CommonModule],
template: `
<button
class="btn"
[class.btn-primary]="type() === 'primary'"
[class.btn-secondary]="type() === 'secondary'"
[class.btn-success]="type() === 'success'"
[class.btn-warning]="type() === 'warning'"
[class.btn-danger]="type() === 'danger'"
[class.btn-link]="type() === 'link'"
[class.btn-sm]="size() === 'sm'"
[class.btn-md]="size() === 'md'"
[class.btn-lg]="size() === 'lg'"
[class.btn-block]="block()"
[class.btn-ghost]="ghost()"
[class.is-loading]="loading()"
[class.is-disabled]="disabled()"
[disabled]="disabled() || loading()"
(click)="handleClick()" >
@if (loading()) {
<span class="btn-spinner">
<app-icon iconKey="icon-loading"></app-icon>
</span>
}

      @if (icon() && iconPosition() === 'left' && !loading()) {
        <app-icon [iconKey]="icon()!" class="btn-icon btn-icon-left"></app-icon>
      }

      <span class="btn-text">
        <ng-content></ng-content>
      </span>

      @if (icon() && iconPosition() === 'right' && !loading()) {
        <app-icon [iconKey]="icon()!" class="btn-icon btn-icon-right"></app-icon>
      }
    </button>

`,
  styles: [`
.btn {
display: inline-flex;
align-items: center;
justify-content: center;
gap: 8px;
padding: 6px 16px;
border: 1px solid transparent;
border-radius: 4px;
font-size: 14px;
font-weight: 500;
line-height: 1.5;
cursor: pointer;
transition: all 0.3s;
white-space: nowrap;
user-select: none;

      &:focus {
        outline: none;
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }
    }

    /* TYPES */
    .btn-primary {
      color: #fff;
      background: #1890ff;
      border-color: #1890ff;

      &:hover:not(:disabled) {
        background: #40a9ff;
        border-color: #40a9ff;
      }

      &:active:not(:disabled) {
        background: #096dd9;
        border-color: #096dd9;
      }

      &:focus {
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }

    .btn-secondary {
      color: #262626;
      background: #fff;
      border-color: #d9d9d9;

      &:hover:not(:disabled) {
        color: #1890ff;
        border-color: #1890ff;
      }

      &:active:not(:disabled) {
        color: #096dd9;
        border-color: #096dd9;
      }

      &:focus {
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
      }
    }

    .btn-success {
      color: #fff;
      background: #52c41a;
      border-color: #52c41a;

      &:hover:not(:disabled) {
        background: #73d13d;
        border-color: #73d13d;
      }

      &:active:not(:disabled) {
        background: #389e0d;
        border-color: #389e0d;
      }

      &:focus {
        box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
      }
    }

    .btn-warning {
      color: #fff;
      background: #faad14;
      border-color: #faad14;

      &:hover:not(:disabled) {
        background: #ffc53d;
        border-color: #ffc53d;
      }

      &:active:not(:disabled) {
        background: #d48806;
        border-color: #d48806;
      }

      &:focus {
        box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
      }
    }

    .btn-danger {
      color: #fff;
      background: #ff4d4f;
      border-color: #ff4d4f;

      &:hover:not(:disabled) {
        background: #ff7875;
        border-color: #ff7875;
      }

      &:active:not(:disabled) {
        background: #d9363e;
        border-color: #d9363e;
      }

      &:focus {
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }
    }

    .btn-link {
      color: #1890ff;
      background: transparent;
      border-color: transparent;
      padding: 0;

      &:hover:not(:disabled) {
        color: #40a9ff;
      }

      &:active:not(:disabled) {
        color: #096dd9;
      }
    }

    /* SIZES */
    .btn-sm {
      height: 28px;
      padding: 2px 12px;
      font-size: 12px;
    }

    .btn-md {
      height: 32px;
      padding: 4px 16px;
      font-size: 14px;
    }

    .btn-lg {
      height: 40px;
      padding: 8px 24px;
      font-size: 16px;
    }

    /* VARIANTS */
    .btn-block {
      width: 100%;
    }

    .btn-ghost {
      background: transparent;

      &.btn-primary {
        color: #1890ff;
        border-color: #1890ff;

        &:hover:not(:disabled) {
          background: rgba(24, 144, 255, 0.1);
        }
      }

      &.btn-danger {
        color: #ff4d4f;
        border-color: #ff4d4f;

        &:hover:not(:disabled) {
          background: rgba(255, 77, 79, 0.1);
        }
      }
    }

    /* STATES */
    .is-loading {
      pointer-events: none;
      opacity: 0.7;
    }

    .is-disabled,
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .btn-spinner {
      display: inline-flex;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .btn-icon {
      display: inline-flex;
      font-size: 16px;

      &.btn-icon-left {
        margin-right: -4px;
      }

      &.btn-icon-right {
        margin-left: -4px;
      }
    }

    .btn-sm .btn-icon {
      font-size: 14px;
    }

    .btn-lg .btn-icon {
      font-size: 18px;
    }

`]
})
export class ButtonComponent {
type = input<ButtonType>('secondary');
size = input<ButtonSize>('md');
icon = input<string>();
iconPosition = input<'left' | 'right'>('left');
disabled = input<boolean>(false);
loading = input<boolean>(false);
block = input<boolean>(false);
ghost = input<boolean>(false);

click = output<void>();

async handleClick() {
if (this.disabled() || this.loading()) return;
this.click.emit();
}
}

Button Group Component:
// ===== BUTTON GROUP COMPONENT =====

@Component({
selector: 'app-button-group',
standalone: true,
imports: [CommonModule],
template: `    <div
      class="btn-group"
      [class.btn-group-vertical]="direction() === 'vertical'"
      [class.btn-group-horizontal]="direction() === 'horizontal'"
      [style.gap.px]="gap()"
    >
      <ng-content></ng-content>
    </div>
 `,
styles: [`
.btn-group {
display: flex;

      &.btn-group-horizontal {
        flex-direction: row;
        align-items: center;
      }

      &.btn-group-vertical {
        flex-direction: column;
        align-items: stretch;
      }
    }

`]
})
export class ButtonGroupComponent {
direction = input<'horizontal' | 'vertical'>('horizontal');
gap = input<number>(8);
}

Использование Buttons:
// ===== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ =====

@Component({
selector: 'app-user-form',
template: `
<app-page-shell [config]="pageConfig()">
<!-- Form content -->

      <div page-footer class="page-footer-content">
        <!-- Actions Group -->
        <app-button-group [gap]="12">
          <!-- Primary Action -->
          <app-button
            type="primary"
            [loading]="saving()"
            [disabled]="!canSave()"
            icon="icon-save"
            (click)="onSave()"
          >
            Сохранить
          </app-button>

          <!-- Secondary Action -->
          <app-button
            type="secondary"
            (click)="onCancel()"
          >
            Отмена
          </app-button>

          <!-- Danger Action -->
          <app-button
            type="danger"
            icon="icon-delete"
            [ghost]="true"
            (click)="onDelete()"
          >
            Удалить
          </app-button>
        </app-button-group>

        <!-- Additional Actions -->
        <app-button-group>
          <app-button
            type="link"
            icon="icon-history"
            (click)="showHistory()"
          >
            История изменений
          </app-button>

          <app-button
            type="link"
            icon="icon-export"
            (click)="exportData()"
          >
            Экспорт
          </app-button>
        </app-button-group>
      </div>
    </app-page-shell>

`
})
export class UserFormComponent {
saving = signal(false);

canSave = computed(() => {
return !this.saving() && this.form.valid && this.form.dirty;
});

async onSave() {
this.saving.set(true);

    try {
      await this.commandService.execute('save', this.form.value).toPromise();
      this.messageService.success('Данные сохранены');
    } catch (error) {
      // Обработка через ErrorHandlingService
    } finally {
      this.saving.set(false);
    }

}
}

6.2 Forms
Назначение:
Единая система форм с валидацией, обработкой ошибок и интеграцией с Context Model.
Интерфейсы:
// ===== FORM INTERFACES =====

/\*\*

- Конфигурация формы
  \*/
  export interface FormConfig {
  // ID формы (для Error Registry)
  id: string;

// Layout
layout?: 'vertical' | 'horizontal' | 'inline';

// Label width (для horizontal)
labelWidth?: string;

// Интеграция с FormStateService
useFormState?: boolean;
}

/\*\*

- Конфигурация поля формы
  \*/
  export interface FormFieldConfig {
  // ID поля (для Error Registry)
  id: string;

// Label
label: string;

// Тип поля
type: FormFieldType;

// Placeholder
placeholder?: string;

// Валидация
required?: boolean;
validators?: any[];

// Состояния
disabled?: boolean;
readonly?: boolean;

// Помощь
hint?: string;

// Для select/radio/checkbox
options?: FormFieldOption[];
}

export type FormFieldType =
| 'text'
| 'email'
| 'password'
| 'number'
| 'tel'
| 'url'
| 'textarea'
| 'select'
| 'checkbox'
| 'radio'
| 'date'
| 'datetime';

export interface FormFieldOption {
value: any;
label: string;
disabled?: boolean;
}

Form Components:
// ===== FORM GROUP COMPONENT =====

@Component({
selector: 'app-form-group',
standalone: true,
imports: [CommonModule],
template: `
<div
class="form-group"
[class.is-invalid]="invalid()"
[class.is-required]="required()" >
@if (label()) {
<label class="form-label" [for]="fieldId()">
{{ label() }}
@if (required()) {
<span class="required-mark">\*</span>
}
</label>
}

      <div class="form-control-container">
        <ng-content></ng-content>
      </div>

      @if (hint() && !invalid()) {
        <span class="form-hint">
          {{ hint() }}
        </span>
      }

      @if (invalid() && errorMessage()) {
        <span class="form-error">
          <app-icon iconKey="icon-warning"></app-icon>
          {{ errorMessage() }}
        </span>
      }
    </div>

`,
  styles: [`
.form-group {
display: flex;
flex-direction: column;
gap: 8px;
margin-bottom: 24px;
}

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #262626;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required-mark {
      color: #ff4d4f;
      font-weight: 600;
    }

    .form-control-container {
      position: relative;
    }

    .form-hint {
      font-size: 12px;
      color: #8c8c8c;
      line-height: 1.5;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #ff4d4f;
      animation: slide-down 0.3s ease-out;
    }

    @keyframes slide-down {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

`]
})
export class FormGroupComponent {
label = input<string>();
fieldId = input<string>();
required = input<boolean>(false);
invalid = input<boolean>(false);
errorMessage = input<string>();
hint = input<string>();
}

// ===== FORM FIELD COMPONENT =====

@Component({
selector: 'app-form-field',
standalone: true,
imports: [CommonModule, FormsModule, ReactiveFormsModule],
template: `    <div
      class="form-field"
      [class.is-invalid]="isInvalid()"
      [class.is-disabled]="disabled()"
      [class.is-readonly]="readonly()"
      [class.is-highlighted]="highlighted()"
      [attr.data-field-id]="fieldId()"
    >
      @switch (type()) {
        @case ('textarea') {
          <textarea
            [id]="fieldId()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [readonly]="readonly()"
            [formControl]="control()"
            (blur)="onBlur()"
            class="form-control form-textarea"
            rows="4"
          ></textarea>
        }
        @case ('select') {
          <select
            [id]="fieldId()"
            [disabled]="disabled()"
            [formControl]="control()"
            (blur)="onBlur()"
            class="form-control form-select"
          >
            <option value="" disabled selected>
              {{ placeholder() || 'Выберите...' }}
            </option>
            @for (option of options(); track option.value) {
              <option
                [value]="option.value"
                [disabled]="option.disabled"
              >
                {{ option.label }}
              </option>
            }
          </select>
        }
        @case ('checkbox') {
          <label class="form-checkbox">
            <input
              type="checkbox"
              [id]="fieldId()"
              [disabled]="disabled()"
              [formControl]="control()"
              (blur)="onBlur()"
            />
            <span class="checkbox-label">{{ label() }}</span>
          </label>
        }
        @default {
          <input
            [type]="type()"
            [id]="fieldId()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [readonly]="readonly()"
            [formControl]="control()"
            (blur)="onBlur()"
            class="form-control"
          />
        }
      }
    </div>
 `,
styles: [`
.form-field {
width: 100%;
}

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.5;
      transition: all 0.3s;
      background: #fff;

      &:hover:not(:disabled):not(:readonly) {
        border-color: #40a9ff;
      }

      &:focus {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        outline: none;
      }

      &::placeholder {
        color: #bfbfbf;
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23262626' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }

    .form-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .checkbox-label {
        font-size: 14px;
      }
    }

    .is-invalid .form-control {
      border-color: #ff4d4f;
      background-color: #fff2f0;

      &:focus {
        border-color: #ff4d4f;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }
    }

    .is-disabled .form-control {
      background-color: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .is-readonly .form-control {
      background-color: #fafafa;
      cursor: default;
    }

    .is-highlighted {
      animation: highlight-pulse 2s ease-out;
    }

    @keyframes highlight-pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
      }
      50% {
        box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.4);
      }
    }

`]
})
export class FormFieldComponent implements OnInit, OnDestroy {
private readonly errorRegistry = inject(ErrorRegistry);
private readonly destroy$ = new Subject<void>();

type = input<FormFieldType>('text');
fieldId = input.required<string>();
placeholder = input<string>('');
disabled = input<boolean>(false);
readonly = input<boolean>(false);
control = input.required<FormControl>();
options = input<FormFieldOption[]>([]);
label = input<string>(''); // Для checkbox

blur = output<void>();

highlighted = signal(false);

ngOnInit() {
// Подписка на ошибки из Error Registry
this.errorRegistry.errors$
      .pipe(takeUntil(this.destroy$))
.subscribe(() => {
this.checkFieldErrors();
});

    // Подписка на изменения FormControl
    this.control().statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateErrorState();
      });

}

ngOnDestroy() {
this.destroy$.next();
    this.destroy$.complete();
}

isInvalid(): boolean {
const ctrl = this.control();
return (ctrl.invalid && ctrl.touched) || this.hasRegistryError();
}

onBlur() {
this.control().markAsTouched();
this.blur.emit();
}

private hasRegistryError(): boolean {
const errors = this.errorRegistry.getFieldErrors(
this.fieldId(),
this.getContextId()
);
return errors.length > 0;
}

private checkFieldErrors() {
const errors = this.errorRegistry.getFieldErrors(
this.fieldId(),
this.getContextId()
);

    if (errors.length > 0) {
      // Установить ошибку в FormControl
      const error = errors[0];
      this.control().setErrors({
        server: error.errorResponse.getUserMessage()
      });
      this.control().markAsTouched();
    }

}

private updateErrorState() {
// Синхронизация состояния с Error Registry
}

private getContextId(): string {
// Получить из Context Service
const contextService = inject(ContextService);
return contextService.getContext().activeArea?.entityId || '';
}

highlight() {
this.highlighted.set(true);
setTimeout(() => {
this.highlighted.set(false);
}, 2000);
}
}

Form Integration Example:
// ===== ПРИМЕР ИНТЕГРАЦИИ ФОРМЫ =====

@Component({
selector: 'app-user-form',
standalone: true,
imports: [
CommonModule,
ReactiveFormsModule,
PageShellComponent,
FormGroupComponent,
FormFieldComponent,
ButtonComponent,
ButtonGroupComponent
],
template: `
<app-page-shell [config]="pageConfig()">
<form [formGroup]="form" (ngSubmit)="onSubmit()">
<!-- Name Field -->
<app-form-group
label="Имя пользователя"
fieldId="name"
[required]="true"
[invalid]="isFieldInvalid('name')"
[errorMessage]="getFieldError('name')"
hint="Введите полное имя пользователя" >
<app-form-field
type="text"
fieldId="name"
placeholder="Введите имя..."
[control]="form.controls.name" ></app-form-field>
</app-form-group>

        <!-- Email Field -->
        <app-form-group
          label="Email"
          fieldId="email"
          [required]="true"
          [invalid]="isFieldInvalid('email')"
          [errorMessage]="getFieldError('email')"
        >
          <app-form-field
            type="email"
            fieldId="email"
            placeholder="user@example.com"
            [control]="form.controls.email"
          ></app-form-field>
        </app-form-group>

        <!-- Role Field -->
        <app-form-group
          label="Роль"
          fieldId="role"
          [required]="true"
          [invalid]="isFieldInvalid('role')"
          [errorMessage]="getFieldError('role')"
        >
          <app-form-field
            type="select"
            fieldId="role"
            placeholder="Выберите роль..."
            [control]="form.controls.role"
            [options]="roleOptions()"
          ></app-form-field>
        </app-form-group>

        <!-- Bio Field -->
        <app-form-group
          label="О себе"
          fieldId="bio"
          [invalid]="isFieldInvalid('bio')"
          [errorMessage]="getFieldError('bio')"
          hint="Краткая биография (до 500 символов)"
        >
          <app-form-field
            type="textarea"
            fieldId="bio"
            placeholder="Расскажите о себе..."
            [control]="form.controls.bio"
          ></app-form-field>
        </app-form-group>

        <!-- Active Checkbox -->
        <app-form-group fieldId="active">
          <app-form-field
            type="checkbox"
            fieldId="active"
            label="Активный пользователь"
            [control]="form.controls.active"
          ></app-form-field>
        </app-form-group>
      </form>

      <!-- Actions -->
      <div page-footer class="page-footer-content">
        <app-button-group>
          <app-button
            type="primary"
            icon="icon-save"
            [loading]="saving()"
            [disabled]="!canSave()"
            (click)="onSubmit()"
          >
            Сохранить
          </app-button>

          <app-button
            type="secondary"
            (click)="onCancel()"
          >
            Отмена
          </app-button>
        </app-button-group>
      </div>
    </app-page-shell>

`,
  styles: [`
.page-footer-content {
display: flex;
justify-content: space-between;
align-items: center;
padding: 16px 24px;
border-top: 1px solid #f0f0f0;
background: #fafafa;
}
`],
providers: [FormStateService]
})
export class UserFormComponent implements OnInit {
private readonly fb = inject(FormBuilder);
private readonly contextService = inject(ContextService);
private readonly formStateService = inject(FormStateService);
private readonly commandService = inject(CommandService);
private readonly router = inject(Router);

@Input() userId?: string;

form!: FormGroup;
saving = signal(false);

roleOptions = signal<FormFieldOption[]>([
{ value: 'admin', label: 'Администратор' },
{ value: 'editor', label: 'Редактор' },
{ value: 'viewer', label: 'Наблюдатель' }
]);

pageConfig = computed<PageConfig>(() => ({
header: {
title: this.userId ? 'Редактирование пользователя' : 'Создание пользователя',
subtitle: this.userId ? `ID: ${this.userId}` : undefined
},
contentType: 'form',
showFormStatusBar: true,
showFooter: true
}));

canSave = computed(() => {
return this.form.valid && this.form.dirty && !this.saving();
});

ngOnInit() {
this.initForm();
this.setupContext();
this.subscribeToFormChanges();

    if (this.userId) {
      this.loadUser();
    }

}

private initForm() {
this.form = this.fb.group({
name: ['', [Validators.required, Validators.minLength(2)]],
email: ['', [Validators.required, Validators.email]],
role: ['', Validators.required],
bio: ['', Validators.maxLength(500)],
active: [true]
});
}

private setupContext() {
this.contextService.setActiveArea({
type: 'form',
entityId: 'users',
mode: this.userId ? 'edit' : 'create',
recordId: this.userId
});
}

private subscribeToFormChanges() {
// Подписка на изменения формы
this.form.valueChanges
.pipe(takeUntilDestroyed())
.subscribe(() => {
this.formStateService.markAsDirty();
this.contextService.updateDataState({ dirty: true });
});

    // Подписка на изменения статуса
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(status => {
        this.contextService.updateDataState({
          valid: status === 'VALID'
        });
      });

}

private async loadUser() {
this.formStateService.transition('loading');

    try {
      const user = await this.userService.getUser(this.userId!).toPromise();
      this.form.patchValue(user);
      this.formStateService.transition('idle');
    } catch (error) {
      this.formStateService.transition('error');
      // Ошибка обработана HttpErrorInterceptor
    }

}

async onSubmit() {
if (!this.canSave()) return;

    this.saving.set(true);
    this.formStateService.transition('saving');

    try {
      const command = this.userId ? 'update' : 'create';
      const result = await this.commandService.execute(command, {
        id: this.userId,
        data: this.form.value
      }).toPromise();

      if (result.success) {
        this.formStateService.markAsSaved();
        this.messageService.success('Данные сохранены');
        this.router.navigate(['/admin/users']);
      }
    } catch (error) {
      this.formStateService.transition('error');
      // Ошибка обработана ErrorHandlingService
    } finally {
      this.saving.set(false);
    }

}

onCancel() {
if (this.form.dirty) {
this.modalService.confirm({
title: 'Отменить изменения?',
content: 'Все несохранённые изменения будут потеряны.',
footer: {
okText: 'Да, отменить',
cancelText: 'Продолжить редактирование'
},
onOk: () => {
this.router.navigate(['/admin/users']);
}
});
} else {
this.router.navigate(['/admin/users']);
}
}

isFieldInvalid(fieldName: string): boolean {
const field = this.form.get(fieldName);
return !!(field && field.invalid && field.touched);
}

getFieldError(fieldName: string): string {
const field = this.form.get(fieldName);
if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    if (errors['required']) return 'Это поле обязательно';
    if (errors['email']) return 'Неверный формат email';
    if (errors['minlength']) {
      return `Минимум ${errors['minlength'].requiredLength} символов`;
    }
    if (errors['maxlength']) {
      return `Максимум ${errors['maxlength'].requiredLength} символов`;
    }
    if (errors['server']) return errors['server'];

    return 'Ошибка валидации';

}
}

Продолжить с 6.3 Status/Feedback компоненты?
ЧАСТЬ 6: UI COMPONENTS LIBRARY (продолжение)
6.3 Status/Feedback компоненты
Назначение:
Единая система компонентов для отображения статусов, состояний и обратной связи с пользователем.

6.3.1 Badge Component
// ===== BADGE INTERFACES =====

export interface BadgeConfig {
// Значение badge
value: number | string;

// Тип badge
type?: BadgeType;

// Размер
size?: BadgeSize;

// Отображение
dot?: boolean; // Показать только точку
showZero?: boolean; // Показывать 0
max?: number; // Максимальное значение (99+)
}

export type BadgeType =
| 'default'
| 'primary'
| 'success'
| 'warning'
| 'error'
| 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

// ===== BADGE COMPONENT =====

@Component({
selector: 'app-badge',
standalone: true,
imports: [CommonModule],
template: `    <span
      class="badge"
      [class.badge-default]="type() === 'default'"
      [class.badge-primary]="type() === 'primary'"
      [class.badge-success]="type() === 'success'"
      [class.badge-warning]="type() === 'warning'"
      [class.badge-error]="type() === 'error'"
      [class.badge-info]="type() === 'info'"
      [class.badge-sm]="size() === 'sm'"
      [class.badge-md]="size() === 'md'"
      [class.badge-lg]="size() === 'lg'"
      [class.badge-dot]="dot()"
    >
      @if (!dot()) {
        {{ displayValue() }}
      }
    </span>
 `,
styles: [`
.badge {
display: inline-flex;
align-items: center;
justify-content: center;
min-width: 20px;
height: 20px;
padding: 0 6px;
border-radius: 10px;
font-size: 12px;
font-weight: 600;
line-height: 1;
white-space: nowrap;

      &.badge-sm {
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        font-size: 10px;
        border-radius: 8px;
      }

      &.badge-lg {
        min-width: 24px;
        height: 24px;
        padding: 0 8px;
        font-size: 14px;
        border-radius: 12px;
      }

      &.badge-dot {
        min-width: 6px;
        width: 6px;
        height: 6px;
        padding: 0;
        border-radius: 50%;
      }
    }

    /* TYPES */
    .badge-default {
      color: #262626;
      background: #d9d9d9;
    }

    .badge-primary {
      color: #fff;
      background: #1890ff;
    }

    .badge-success {
      color: #fff;
      background: #52c41a;
    }

    .badge-warning {
      color: #fff;
      background: #faad14;
    }

    .badge-error {
      color: #fff;
      background: #ff4d4f;
    }

    .badge-info {
      color: #fff;
      background: #1890ff;
    }

`]
})
export class BadgeComponent {
value = input.required<number | string>();
type = input<BadgeType>('default');
size = input<BadgeSize>('md');
dot = input<boolean>(false);
showZero = input<boolean>(false);
max = input<number>(99);

displayValue = computed(() => {
const val = this.value();

    // Не показывать 0
    if (val === 0 && !this.showZero()) return '';

    // Числовое значение
    if (typeof val === 'number') {
      const max = this.max();
      return val > max ? `${max}+` : val.toString();
    }

    return val;

});
}

6.3.2 Status Indicator Component
// ===== STATUS INDICATOR INTERFACES =====

export interface StatusConfig {
// Тип статуса
type: StatusType;

// Текст статуса
label: string;

// Иконка (опционально)
icon?: string;

// Размер
size?: 'sm' | 'md' | 'lg';

// Показать точку
showDot?: boolean;

// Анимация точки (пульсация)
pulse?: boolean;
}

export type StatusType =
| 'success'
| 'warning'
| 'error'
| 'info'
| 'processing'
| 'default';

// ===== STATUS INDICATOR COMPONENT =====

@Component({
selector: 'app-status',
standalone: true,
imports: [CommonModule],
template: `
<span
class="status"
[class.status-success]="type() === 'success'"
[class.status-warning]="type() === 'warning'"
[class.status-error]="type() === 'error'"
[class.status-info]="type() === 'info'"
[class.status-processing]="type() === 'processing'"
[class.status-default]="type() === 'default'"
[class.status-sm]="size() === 'sm'"
[class.status-md]="size() === 'md'"
[class.status-lg]="size() === 'lg'" >
@if (showDot()) {
<span
class="status-dot"
[class.status-dot-pulse]="pulse()" ></span>
}

      @if (icon()) {
        <app-icon [iconKey]="icon()!" class="status-icon"></app-icon>
      }

      <span class="status-text">{{ label() }}</span>
    </span>

`,
  styles: [`
.status {
display: inline-flex;
align-items: center;
gap: 6px;
padding: 4px 12px;
border-radius: 12px;
font-size: 14px;
font-weight: 500;

      &.status-sm {
        padding: 2px 8px;
        font-size: 12px;
        gap: 4px;
      }

      &.status-lg {
        padding: 6px 16px;
        font-size: 16px;
        gap: 8px;
      }
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;

      &.status-dot-pulse {
        animation: status-pulse 1.5s ease-in-out infinite;
      }
    }

    @keyframes status-pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.2);
      }
    }

    .status-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .status-text {
      line-height: 1;
    }

    /* TYPES */
    .status-success {
      color: #52c41a;
      background: #f6ffed;
      border: 1px solid #b7eb8f;

      .status-dot {
        background: #52c41a;
      }
    }

    .status-warning {
      color: #faad14;
      background: #fffbe6;
      border: 1px solid #ffe58f;

      .status-dot {
        background: #faad14;
      }
    }

    .status-error {
      color: #ff4d4f;
      background: #fff2f0;
      border: 1px solid #ffccc7;

      .status-dot {
        background: #ff4d4f;
      }
    }

    .status-info {
      color: #1890ff;
      background: #e6f7ff;
      border: 1px solid #91d5ff;

      .status-dot {
        background: #1890ff;
      }
    }

    .status-processing {
      color: #1890ff;
      background: #e6f7ff;
      border: 1px solid #91d5ff;

      .status-dot {
        background: #1890ff;
        animation: status-pulse 1.5s ease-in-out infinite;
      }
    }

    .status-default {
      color: #262626;
      background: #fafafa;
      border: 1px solid #d9d9d9;

      .status-dot {
        background: #d9d9d9;
      }
    }

`]
})
export class StatusComponent {
type = input.required<StatusType>();
label = input.required<string>();
icon = input<string>();
size = input<'sm' | 'md' | 'lg'>('md');
showDot = input<boolean>(true);
pulse = input<boolean>(false);
}

6.3.3 Progress Component
// ===== PROGRESS INTERFACES =====

export interface ProgressConfig {
// Процент выполнения (0-100)
percent: number;

// Тип progress bar
type?: ProgressType;

// Размер
size?: ProgressSize;

// Показать текст
showText?: boolean;

// Формат текста
format?: (percent: number) => string;

// Статус
status?: ProgressStatus;
}

export type ProgressType = 'line' | 'circle';
export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressStatus = 'normal' | 'success' | 'exception' | 'active';

// ===== PROGRESS COMPONENT =====

@Component({
selector: 'app-progress',
standalone: true,
imports: [CommonModule],
template: `
@if (type() === 'line') {
<div
class="progress-line"
[class.progress-sm]="size() === 'sm'"
[class.progress-md]="size() === 'md'"
[class.progress-lg]="size() === 'lg'" >
<div class="progress-outer">
<div class="progress-inner">
<div
class="progress-bg"
[class.progress-success]="getStatus() === 'success'"
[class.progress-exception]="getStatus() === 'exception'"
[class.progress-active]="getStatus() === 'active'"
[style.width.%]="percent()" ></div>
</div>
</div>

        @if (showText()) {
          <span class="progress-text">
            {{ getFormattedText() }}
          </span>
        }
      </div>
    } @else {
      <div
        class="progress-circle"
        [class.progress-sm]="size() === 'sm'"
        [class.progress-md]="size() === 'md'"
        [class.progress-lg]="size() === 'lg'"
      >
        <svg
          [attr.width]="getCircleSize()"
          [attr.height]="getCircleSize()"
          viewBox="0 0 100 100"
        >
          <!-- Background circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f0f0f0"
            stroke-width="8"
          />

          <!-- Progress circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            [attr.stroke]="getStrokeColor()"
            stroke-width="8"
            stroke-linecap="round"
            [attr.stroke-dasharray]="getCircumference()"
            [attr.stroke-dashoffset]="getStrokeDashoffset()"
            transform="rotate(-90 50 50)"
            class="progress-circle-path"
          />
        </svg>

        <div class="progress-circle-text">
          {{ getFormattedText() }}
        </div>
      </div>
    }

`,
  styles: [`
/_ LINE PROGRESS _/
.progress-line {
display: flex;
align-items: center;
gap: 8px;
}

    .progress-outer {
      flex: 1;
      background: #f5f5f5;
      border-radius: 100px;
      overflow: hidden;
    }

    .progress-inner {
      position: relative;
    }

    .progress-bg {
      height: 8px;
      background: #1890ff;
      border-radius: 100px;
      transition: width 0.3s ease;

      &.progress-success {
        background: #52c41a;
      }

      &.progress-exception {
        background: #ff4d4f;
      }

      &.progress-active {
        animation: progress-active 2s ease infinite;
      }
    }

    .progress-sm .progress-bg {
      height: 6px;
    }

    .progress-lg .progress-bg {
      height: 10px;
    }

    @keyframes progress-active {
      0% {
        opacity: 0.3;
        width: 0;
      }
      100% {
        opacity: 0;
        width: 100%;
      }
    }

    .progress-text {
      min-width: 40px;
      font-size: 14px;
      color: #262626;
      text-align: right;
    }

    /* CIRCLE PROGRESS */
    .progress-circle {
      position: relative;
      display: inline-block;
    }

    .progress-circle-path {
      transition: stroke-dashoffset 0.3s ease;
    }

    .progress-circle-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }

    .progress-sm .progress-circle-text {
      font-size: 16px;
    }

    .progress-lg .progress-circle-text {
      font-size: 32px;
    }

`]
})
export class ProgressComponent {
percent = input.required<number>();
type = input<ProgressType>('line');
size = input<ProgressSize>('md');
showText = input<boolean>(true);
format = input<(percent: number) => string>();
status = input<ProgressStatus>('normal');

getStatus(): ProgressStatus {
const percent = this.percent();

    if (this.status() !== 'normal') {
      return this.status();
    }

    if (percent === 100) {
      return 'success';
    }

    return 'normal';

}

getFormattedText(): string {
const format = this.format();

    if (format) {
      return format(this.percent());
    }

    return `${Math.round(this.percent())}%`;

}

getCircleSize(): number {
const sizes = { sm: 80, md: 120, lg: 160 };
return sizes[this.size()];
}

getCircumference(): number {
return 2 _ Math.PI _ 45; // r = 45
}

getStrokeDashoffset(): number {
const circumference = this.getCircumference();
const offset = circumference - (this.percent() / 100) \* circumference;
return offset;
}

getStrokeColor(): string {
const status = this.getStatus();
const colors = {
normal: '#1890ff',
success: '#52c41a',
exception: '#ff4d4f',
active: '#1890ff'
};
return colors[status];
}
}

6.3.4 Skeleton Component
// ===== SKELETON INTERFACES =====

export interface SkeletonConfig {
// Активная анимация
active?: boolean;

// Показать аватар
avatar?: boolean;

// Размер аватара
avatarSize?: SkeletonAvatarSize;

// Количество строк
rows?: number;

// Показать заголовок
title?: boolean;
}

export type SkeletonAvatarSize = 'sm' | 'md' | 'lg';

// ===== SKELETON COMPONENT =====

@Component({
selector: 'app-skeleton',
standalone: true,
imports: [CommonModule],
template: `
<div
class="skeleton"
[class.skeleton-active]="active()" >
@if (avatar()) {
<div
class="skeleton-avatar"
[class.skeleton-avatar-sm]="avatarSize() === 'sm'"
[class.skeleton-avatar-md]="avatarSize() === 'md'"
[class.skeleton-avatar-lg]="avatarSize() === 'lg'" ></div>
}

      <div class="skeleton-content">
        @if (title()) {
          <div class="skeleton-title"></div>
        }

        @for (row of rowsArray(); track $index) {
          <div
            class="skeleton-row"
            [style.width]="getRowWidth($index)"
          ></div>
        }
      </div>
    </div>

`,
  styles: [`
.skeleton {
display: flex;
gap: 16px;
}

    .skeleton-avatar {
      flex-shrink: 0;
      background: #f0f0f0;
      border-radius: 50%;

      &.skeleton-avatar-sm {
        width: 32px;
        height: 32px;
      }

      &.skeleton-avatar-md {
        width: 40px;
        height: 40px;
      }

      &.skeleton-avatar-lg {
        width: 48px;
        height: 48px;
      }
    }

    .skeleton-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-title,
    .skeleton-row {
      height: 16px;
      background: #f0f0f0;
      border-radius: 4px;
    }

    .skeleton-title {
      width: 40%;
      height: 18px;
    }

    .skeleton-active {
      .skeleton-avatar,
      .skeleton-title,
      .skeleton-row {
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s ease infinite;
      }
    }

    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

`]
})
export class SkeletonComponent {
active = input<boolean>(true);
avatar = input<boolean>(false);
avatarSize = input<SkeletonAvatarSize>('md');
rows = input<number>(3);
title = input<boolean>(true);

rowsArray = computed(() => {
return Array.from({ length: this.rows() }, (\_, i) => i);
});

getRowWidth(index: number): string {
const total = this.rows();

    // Последняя строка короче
    if (index === total - 1) {
      return '60%';
    }

    return '100%';

}
}

6.3.5 Empty State Component
// ===== EMPTY STATE INTERFACES =====

export interface EmptyStateConfig {
// Иконка
icon?: string;

// Изображение (URL)
image?: string;

// Заголовок
title?: string;

// Описание
description?: string;

// Действия
actions?: EmptyStateAction[];
}

export interface EmptyStateAction {
label: string;
type?: ButtonType;
icon?: string;
handler: () => void;
}

// ===== EMPTY STATE COMPONENT =====

@Component({
selector: 'app-empty-state',
standalone: true,
imports: [CommonModule, ButtonComponent],
template: `
<div class="empty-state">
@if (image()) {
<img
[src]="image()!"
alt="Empty"
class="empty-state-image"
/>
} @else if (icon()) {
<div class="empty-state-icon">
<app-icon [iconKey]="icon()!"></app-icon>
</div>
} @else {
<div class="empty-state-icon">
<app-icon iconKey="icon-inbox"></app-icon>
</div>
}

      @if (title()) {
        <h3 class="empty-state-title">{{ title() }}</h3>
      }

      @if (description()) {
        <p class="empty-state-description">{{ description() }}</p>
      }

      @if (actions() && actions()!.length > 0) {
        <div class="empty-state-actions">
          @for (action of actions(); track action.label) {
            <app-button
              [type]="action.type || 'primary'"
              [icon]="action.icon"
              (click)="action.handler()"
            >
              {{ action.label }}
            </app-button>
          }
        </div>
      }
    </div>

`,
  styles: [`
.empty-state {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 64px 24px;
text-align: center;
}

    .empty-state-image {
      max-width: 200px;
      height: auto;
      margin-bottom: 24px;
      opacity: 0.8;
    }

    .empty-state-icon {
      font-size: 64px;
      color: #d9d9d9;
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .empty-state-title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      color: #262626;
    }

    .empty-state-description {
      margin: 0 0 24px;
      font-size: 14px;
      color: #8c8c8c;
      max-width: 400px;
    }

    .empty-state-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

`]
})
export class EmptyStateComponent {
icon = input<string>();
image = input<string>();
title = input<string>('Нет данных');
description = input<string>();
actions = input<EmptyStateAction[]>();
}

6.3.6 Spinner Component
// ===== SPINNER COMPONENT =====

@Component({
selector: 'app-spinner',
standalone: true,
imports: [CommonModule],
template: `
<div
class="spinner"
[class.spinner-sm]="size() === 'sm'"
[class.spinner-md]="size() === 'md'"
[class.spinner-lg]="size() === 'lg'"
[style.color]="color()" >
<div class="spinner-circle"></div>

      @if (text()) {
        <span class="spinner-text">{{ text() }}</span>
      }
    </div>

`,
  styles: [`
.spinner {
display: inline-flex;
flex-direction: column;
align-items: center;
gap: 12px;
}

    .spinner-circle {
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spinner-rotate 0.8s linear infinite;
    }

    .spinner-sm .spinner-circle {
      width: 16px;
      height: 16px;
      border-width: 2px;
    }

    .spinner-md .spinner-circle {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }

    .spinner-lg .spinner-circle {
      width: 48px;
      height: 48px;
      border-width: 4px;
    }

    @keyframes spinner-rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .spinner-text {
      font-size: 14px;
      color: #8c8c8c;
    }

`]
})
export class SpinnerComponent {
size = input<'sm' | 'md' | 'lg'>('md');
color = input<string>('#1890ff');
text = input<string>();
}

6.3.7 Tooltip Component
// ===== TOOLTIP DIRECTIVE =====

@Directive({
selector: '[appTooltip]',
standalone: true,
host: {
'(mouseenter)': 'show()',
'(mouseleave)': 'hide()',
'(focus)': 'show()',
'(blur)': 'hide()'
}
})
export class TooltipDirective implements OnDestroy {
private readonly overlay = inject(Overlay);
private readonly viewContainerRef = inject(ViewContainerRef);

appTooltip = input.required<string>();
tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');

private overlayRef?: OverlayRef;
private hideTimeout?: any;

ngOnDestroy() {
this.destroyTooltip();
}

show() {
if (this.hideTimeout) {
clearTimeout(this.hideTimeout);
}

    if (!this.overlayRef) {
      this.createTooltip();
    }

}

hide() {
this.hideTimeout = setTimeout(() => {
this.destroyTooltip();
}, 100);
}

private createTooltip() {
const positionStrategy = this.overlay
.position()
.flexibleConnectedTo(this.viewContainerRef.element)
.withPositions([
{
originX: 'center',
originY: 'top',
overlayX: 'center',
overlayY: 'bottom',
offsetY: -8
}
]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    const tooltipPortal = new ComponentPortal(
      TooltipComponent,
      this.viewContainerRef
    );

    const componentRef = this.overlayRef.attach(tooltipPortal);
    componentRef.setInput('text', this.appTooltip());

}

private destroyTooltip() {
if (this.overlayRef) {
this.overlayRef.dispose();
this.overlayRef = undefined;
}
}
}

// ===== TOOLTIP COMPONENT =====

@Component({
selector: 'app-tooltip',
standalone: true,
imports: [CommonModule],
template: `    <div class="tooltip">
      <div class="tooltip-arrow"></div>
      <div class="tooltip-inner">{{ text() }}</div>
    </div>
 `,
styles: [`
.tooltip {
position: relative;
z-index: 1060;
animation: tooltip-fade-in 0.2s ease-out;
}

    @keyframes tooltip-fade-in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .tooltip-arrow {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      background: #262626;
      transform: translateX(-50%) rotate(45deg);
    }

    .tooltip-inner {
      padding: 6px 12px;
      background: #262626;
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
      white-space: nowrap;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

`]
})
export class TooltipComponent {
text = input.required<string>();
}

Использование Status/Feedback компонентов:
// ===== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ =====

@Component({
selector: 'app-dashboard',
template: `
<app-page-shell [config]="pageConfig()">
<!-- Status Indicators -->
<div class="dashboard-stats">
<div class="stat-card">
<app-status
type="success"
label="Активные пользователи"
icon="icon-user"
[showDot]="true" ></app-status>
<span class="stat-value">1,234</span>
</div>

        <div class="stat-card">
          <app-status
            type="processing"
            label="Обработка заказов"
            [showDot]="true"
            [pulse]="true"
          ></app-status>
          <span class="stat-value">56</span>
        </div>

        <div class="stat-card">
          <app-status
            type="error"
            label="Ошибки"
            icon="icon-warning"
            [showDot]="true"
          ></app-status>
          <app-badge
            [value]="errorCount()"
            type="error"
          ></app-badge>
        </div>
      </div>

      <!-- Progress -->
      <div class="progress-section">
        <h3>Загрузка данных</h3>
        <app-progress
          [percent]="uploadProgress()"
          [status]="uploadStatus()"
          [showText]="true"
        ></app-progress>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <app-skeleton
          [active]="true"
          [avatar]="true"
          [rows]="4"
          [title]="true"
        ></app-skeleton>
      } @else if (data().length === 0) {
        <!-- Empty State -->
        <app-empty-state
          icon="icon-inbox"
          title="Нет данных"
          description="Данные отсутствуют. Создайте первую запись."
          [actions]="emptyActions()"
        ></app-empty-state>
      } @else {
        <!-- Data -->
        <app-table [config]="tableConfig()"></app-table>
      }

      <!-- Spinner Overlay -->
      @if (globalLoading()) {
        <div class="loading-overlay">
          <app-spinner
            size="lg"
            text="Загрузка..."
          ></app-spinner>
        </div>
      }
    </app-page-shell>

`,
  styles: [`
.dashboard-stats {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 16px;
margin-bottom: 24px;
}

    .stat-card {
      padding: 16px;
      background: #fff;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }

    .progress-section {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

`]
})
export class DashboardComponent {
loading = signal(false);
globalLoading = signal(false);
uploadProgress = signal(0);
uploadStatus = signal<ProgressStatus>('normal');
errorCount = signal(3);
data = signal<any[]>([]);

emptyActions = signal<EmptyStateAction[]>([
{
label: 'Создать запись',
type: 'primary',
icon: 'icon-plus',
handler: () => this.createRecord()
},
{
label: 'Импортировать',
type: 'secondary',
icon: 'icon-upload',
handler: () => this.importData()
}
]);

createRecord() {
this.router.navigate(['/create']);
}

importData() {
// Import logic
}
}

Продолжить с ЧАСТЬ 7: STYLING SYSTEM?
ЧАСТЬ 7: STYLING SYSTEM
7.1 CSS Architecture (BEM + is-\* формализация)
Назначение:
Единая методология именования классов для всего приложения, обеспечивающая масштабируемость, читаемость и предсказуемость стилей.

7.1.1 BEM Methodology
┌─────────────────────────────────────────────────┐
│ BEM (Block Element Modifier) │
└─────────────────────────────────────────────────┘

СТРУКТУРА:
block\_\_element--modifier

ОПРЕДЕЛЕНИЯ:
Block (Блок) - Независимая сущность
Element (Элемент) - Часть блока
Modifier (Модификатор) - Вариант блока/элемента

ПРАВИЛА:

1. Блок описывает СУЩНОСТЬ, не внешний вид
2. Элемент связан с блоком через \_\_
3. Модификатор через --
4. Состояние через is-\* (НЕ BEM, но расширение)
5. Никаких каскадов (.block .element ❌)

7.1.2 Naming Conventions
// ===== NAMING CONVENTIONS =====

/\*\*

- БЛОКИ (Block)
- Независимые компоненты интерфейса
  \*/

// ✅ ПРАВИЛЬНО
.page-header { }
.user-card { }
.navigation-menu { }
.data-table { }

// ❌ НЕПРАВИЛЬНО
.header { } // Слишком общее
.red-button { } // Описывает внешний вид
.left-sidebar { } // Описывает позицию

/\*\*

- ЭЛЕМЕНТЫ (Element)
- Части блока, не имеющие смысла вне блока
  \*/

// ✅ ПРАВИЛЬНО
.page-header**title { }
.page-header**subtitle { }
.user-card**avatar { }
.user-card**name { }
.user-card\_\_email { }

// ❌ НЕПРАВИЛЬНО
.page-header .title { } // Каскад
.page-header-title { } // Неправильный разделитель
.page-header**user**name { } // Вложенность элементов

/\*\*

- МОДИФИКАТОРЫ (Modifier)
- Варианты блока или элемента
  \*/

// ✅ ПРАВИЛЬНО
.button--primary { }
.button--secondary { }
.button--large { }
.user-card--compact { }
.page-header--dark { }

// ❌ НЕПРАВИЛЬНО
.button-primary { } // Неправильный разделитель
.button.primary { } // Не BEM
.large-button { } // Модификатор как блок

/\*\*

- СОСТОЯНИЯ (State) - is-\* расширение
- Динамические состояния компонентов
  \*/

// ✅ ПРАВИЛЬНО
.is-active { }
.is-disabled { }
.is-loading { }
.is-open { }
.is-collapsed { }
.is-invalid { }
.is-selected { }
.is-highlighted { }

// ❌ НЕПРАВИЛЬНО
.active { } // Может конфликтовать
.button-disabled { } // Смешивание с BEM
.open-menu { } // Не состояние

7.1.3 State Classes (is-\* формализация)
// ===== STATE CLASSES TAXONOMY =====

/\*\*

- КАТЕГОРИЯ 1: Layout States
- Состояния, влияющие на расположение/видимость
  \*/
  .is-open { } // Элемент открыт (модал, меню, панель)
  .is-closed { } // Элемент закрыт
  .is-collapsed { } // Элемент свёрнут (sidebar, секция)
  .is-expanded { } // Элемент развёрнут
  .is-hidden { } // Элемент скрыт (display: none)
  .is-visible { } // Элемент видим
  .is-fixed { } // Элемент зафиксирован (sticky header)
  .is-floating { } // Элемент плавающий (dropdown)

/\*\*

- КАТЕГОРИЯ 2: Data States
- Состояния данных и загрузки
  \*/
  .is-loading { } // Загрузка данных
  .is-saving { } // Сохранение данных
  .is-empty { } // Нет данных
  .is-dirty { } // Есть несохранённые изменения
  .is-pristine { } // Нет изменений (противоположность dirty)
  .is-valid { } // Данные валидны
  .is-invalid { } // Данные невалидны
  .is-pending { } // Ожидание (асинхронная операция)

/\*\*

- КАТЕГОРИЯ 3: Interaction States
- Состояния взаимодействия с пользователем
  \*/
  .is-active { } // Элемент активен (текущая вкладка, маршрут)
  .is-selected { } // Элемент выбран (строка таблицы, checkbox)
  .is-disabled { } // Элемент отключён
  .is-readonly { } // Только чтение
  .is-focused { } // Элемент в фокусе
  .is-hovered { } // Наведение мыши (JS-driven)
  .is-pressed { } // Элемент нажат
  .is-dragging { } // Элемент перетаскивается
  .is-clickable { } // Элемент кликабельный (курсор pointer)

/\*\*

- КАТЕГОРИЯ 4: Validation States
- Состояния валидации
  \*/
  .is-error { } // Есть ошибка
  .is-warning { } // Есть предупреждение
  .is-success { } // Успешно
  .is-info { } // Информационное состояние
  .is-critical { } // Критическое состояние

/\*\*

- КАТЕГОРИЯ 5: Visual States
- Визуальные состояния
  \*/
  .is-highlighted { } // Элемент подсвечен (scroll to, search result)
  .is-blinking { } // Мигающий элемент
  .is-animated { } // Анимация активна
  .is-transparent { } // Прозрачный
  .is-bordered { } // С рамкой

/\*\*

- КАТЕГОРИЯ 6: Responsive States
- Адаптивные состояния (альтернатива media queries)
  \*/
  .is-mobile { } // Мобильная версия
  .is-tablet { } // Планшет
  .is-desktop { } // Десктоп
  .is-fullscreen { } // Полноэкранный режим

7.1.4 SCSS Structure
// ===== FILE STRUCTURE =====

/\*\*

- styles/
- ├── abstracts/
- │ ├── \_variables.scss // CSS переменные
- │ ├── \_mixins.scss // SCSS mixins
- │ └── \_functions.scss // SCSS функции
- ├── base/
- │ ├── \_reset.scss // CSS Reset
- │ ├── \_typography.scss // Типографика
- │ └── \_global.scss // Глобальные стили
- ├── components/
- │ ├── \_buttons.scss // Кнопки
- │ ├── \_forms.scss // Формы
- │ ├── \_tables.scss // Таблицы
- │ └── ... // Другие компоненты
- ├── layout/
- │ ├── \_header.scss // Header
- │ ├── \_sidebar.scss // Sidebar
- │ ├── \_footer.scss // Footer
- │ └── \_grid.scss // Grid система
- ├── states/
- │ └── \_states.scss // is-\* классы
- ├── utilities/
- │ └── \_helpers.scss // Утилиты
- ├── vendors/
- │ └── \_ng-zorro.scss // ng-zorro overrides
- └── main.scss // Главный файл
  \*/

// ===== abstracts/\_variables.scss =====

:root {
// Colors
--color-primary: #1890ff;
--color-primary-hover: #40a9ff;
--color-primary-active: #096dd9;

--color-success: #52c41a;
--color-warning: #faad14;
--color-error: #ff4d4f;
--color-info: #1890ff;

// Text
--color-text-primary: #262626;
--color-text-secondary: #8c8c8c;
--color-text-disabled: #bfbfbf;

// Background
--color-bg-base: #fff;
--color-bg-light: #fafafa;
--color-bg-dark: #f0f0f0;

// Border
--color-border-base: #d9d9d9;
--color-border-light: #f0f0f0;

// Spacing
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;

// Border Radius
--radius-sm: 2px;
--radius-md: 4px;
--radius-lg: 8px;
--radius-round: 50%;

// Font
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-code: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;

--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

// Line Height
--line-height-tight: 1.2;
--line-height-base: 1.5;
--line-height-loose: 1.8;

// Shadows
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);

// Transitions
--transition-fast: 0.15s;
--transition-base: 0.3s;
--transition-slow: 0.5s;

// Z-index
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
}

// ===== abstracts/\_mixins.scss =====

// Responsive breakpoints
@mixin respond-to($breakpoint) {
@if $breakpoint == 'mobile' {
@media (max-width: 767px) { @content; }
}
@else if $breakpoint == 'tablet' {
@media (min-width: 768px) and (max-width: 1023px) { @content; }
}
@else if $breakpoint == 'desktop' {
@media (min-width: 1024px) { @content; }
}
}

// Flexbox center
@mixin flex-center {
display: flex;
align-items: center;
justify-content: center;
}

// Truncate text
@mixin truncate {
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}

// Multi-line truncate
@mixin line-clamp($lines: 2) {
display: -webkit-box;
-webkit-line-clamp: $lines;
-webkit-box-orient: vertical;
overflow: hidden;
}

// Focus outline
@mixin focus-outline($color: var(--color-primary)) {
  outline: none;
  box-shadow: 0 0 0 2px rgba($color, 0.2);
}

// Hover lift effect
@mixin hover-lift {
transition: transform var(--transition-base), box-shadow var(--transition-base);

&:hover {
transform: translateY(-2px);
box-shadow: var(--shadow-md);
}
}

// ===== base/\_reset.scss =====

_,
_::before,
\*::after {
box-sizing: border-box;
margin: 0;
padding: 0;
}

html {
font-size: 16px;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

body {
font-family: var(--font-family-base);
font-size: var(--font-size-sm);
line-height: var(--line-height-base);
color: var(--color-text-primary);
background: var(--color-bg-base);
}

a {
color: var(--color-primary);
text-decoration: none;
transition: color var(--transition-base);

&:hover {
color: var(--color-primary-hover);
}
}

button {
font-family: inherit;
cursor: pointer;
}

img {
max-width: 100%;
height: auto;
display: block;
}

// ===== base/\_typography.scss =====

h1, h2, h3, h4, h5, h6 {
margin: 0 0 var(--spacing-md);
font-weight: var(--font-weight-semibold);
line-height: var(--line-height-tight);
color: var(--color-text-primary);
}

h1 { font-size: 32px; }
h2 { font-size: 24px; }
h3 { font-size: 20px; }
h4 { font-size: 18px; }
h5 { font-size: 16px; }
h6 { font-size: 14px; }

p {
margin: 0 0 var(--spacing-md);
line-height: var(--line-height-base);
}

code {
font-family: var(--font-family-code);
font-size: 0.9em;
padding: 2px 6px;
background: var(--color-bg-light);
border-radius: var(--radius-sm);
}

pre {
font-family: var(--font-family-code);
padding: var(--spacing-md);
background: var(--color-bg-light);
border-radius: var(--radius-md);
overflow-x: auto;

code {
padding: 0;
background: none;
}
}

// ===== states/\_states.scss =====

/\*\*

- CRITICAL: State классы ВСЕГДА имеют высший приоритет
- Используем !important ТОЛЬКО для is-_ классов
  _/

// Layout States
.is-hidden {
display: none !important;
}

.is-visible {
display: block !important;
}

.is-collapsed {
// Определяется в контексте компонента
}

.is-expanded {
// Определяется в контексте компонента
}

// Data States
.is-loading {
pointer-events: none !important;
opacity: 0.6 !important;
cursor: wait !important;
}

.is-dirty {
// Визуальный индикатор несохранённых изменений
position: relative;

&::after {
content: '';
position: absolute;
top: 0;
right: 0;
width: 8px;
height: 8px;
background: var(--color-warning);
border-radius: var(--radius-round);
}
}

.is-valid {
border-color: var(--color-success) !important;

&:focus {
box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
}
}

.is-invalid {
border-color: var(--color-error) !important;
background-color: #fff2f0 !important;

&:focus {
box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
}
}

// Interaction States
.is-disabled {
opacity: 0.5 !important;
cursor: not-allowed !important;
pointer-events: none !important;
}

.is-readonly {
background-color: var(--color-bg-light) !important;
cursor: default !important;
}

.is-active {
// Определяется в контексте компонента
// Например, активная вкладка, активный маршрут
}

.is-selected {
background-color: #e6f7ff !important;
border-left: 3px solid var(--color-primary) !important;
}

.is-highlighted {
animation: highlight-pulse 2s ease-out !important;
}

@keyframes highlight-pulse {
0%, 100% {
box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
}
50% {
box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.4);
}
}

.is-clickable {
cursor: pointer !important;
}

// Validation States
.is-error {
color: var(--color-error) !important;

&.is-bordered {
border-color: var(--color-error) !important;
}
}

.is-warning {
color: var(--color-warning) !important;

&.is-bordered {
border-color: var(--color-warning) !important;
}
}

.is-success {
color: var(--color-success) !important;

&.is-bordered {
border-color: var(--color-success) !important;
}
}

.is-info {
color: var(--color-info) !important;

&.is-bordered {
border-color: var(--color-info) !important;
}
}

// ===== utilities/\_helpers.scss =====

// Spacing utilities
.mt-0 { margin-top: 0 !important; }
.mt-xs { margin-top: var(--spacing-xs) !important; }
.mt-sm { margin-top: var(--spacing-sm) !important; }
.mt-md { margin-top: var(--spacing-md) !important; }
.mt-lg { margin-top: var(--spacing-lg) !important; }
.mt-xl { margin-top: var(--spacing-xl) !important; }

.mb-0 { margin-bottom: 0 !important; }
.mb-xs { margin-bottom: var(--spacing-xs) !important; }
.mb-sm { margin-bottom: var(--spacing-sm) !important; }
.mb-md { margin-bottom: var(--spacing-md) !important; }
.mb-lg { margin-bottom: var(--spacing-lg) !important; }
.mb-xl { margin-bottom: var(--spacing-xl) !important; }

.p-0 { padding: 0 !important; }
.p-xs { padding: var(--spacing-xs) !important; }
.p-sm { padding: var(--spacing-sm) !important; }
.p-md { padding: var(--spacing-md) !important; }
.p-lg { padding: var(--spacing-lg) !important; }
.p-xl { padding: var(--spacing-xl) !important; }

// Text utilities
.text-left { text-align: left !important; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }

.text-truncate {
@include truncate;
}

.text-line-clamp-2 {
@include line-clamp(2);
}

.text-line-clamp-3 {
@include line-clamp(3);
}

// Display utilities
.d-none { display: none !important; }
.d-block { display: block !important; }
.d-inline { display: inline !important; }
.d-inline-block { display: inline-block !important; }
.d-flex { display: flex !important; }
.d-inline-flex { display: inline-flex !important; }

// Flex utilities
.flex-row { flex-direction: row !important; }
.flex-column { flex-direction: column !important; }
.flex-wrap { flex-wrap: wrap !important; }
.flex-nowrap { flex-wrap: nowrap !important; }

.justify-start { justify-content: flex-start !important; }
.justify-center { justify-content: center !important; }
.justify-end { justify-content: flex-end !important; }
.justify-between { justify-content: space-between !important; }
.justify-around { justify-content: space-around !important; }

.align-start { align-items: flex-start !important; }
.align-center { align-items: center !important; }
.align-end { align-items: flex-end !important; }
.align-stretch { align-items: stretch !important; }

.gap-xs { gap: var(--spacing-xs) !important; }
.gap-sm { gap: var(--spacing-sm) !important; }
.gap-md { gap: var(--spacing-md) !important; }
.gap-lg { gap: var(--spacing-lg) !important; }
.gap-xl { gap: var(--spacing-xl) !important; }

7.1.5 Component Example (полный стиль)
// ===== components/\_button.scss =====

/\*\*

- Button Component
-
- СТРУКТУРА:
- .btn - Блок
- .btn\_\_icon - Элемент (иконка)
- .btn\_\_text - Элемент (текст)
- .btn--primary - Модификатор (тип)
- .btn--sm - Модификатор (размер)
- .is-loading - Состояние
- .is-disabled - Состояние
  \*/

// Блок
.btn {
// Базовые стили
display: inline-flex;
align-items: center;
justify-content: center;
gap: var(--spacing-sm);
padding: 6px 16px;
border: 1px solid transparent;
border-radius: var(--radius-md);
font-size: var(--font-size-sm);
font-weight: var(--font-weight-medium);
line-height: var(--line-height-base);
cursor: pointer;
user-select: none;
white-space: nowrap;
transition: all var(--transition-base);

&:focus {
outline: none;
}

&:active:not(:disabled):not(.is-disabled) {
transform: scale(0.98);
}

// Модификаторы типа
&--primary {
color: #fff;
background: var(--color-primary);
border-color: var(--color-primary);

    &:hover:not(:disabled):not(.is-disabled) {
      background: var(--color-primary-hover);
      border-color: var(--color-primary-hover);
    }

    &:active:not(:disabled):not(.is-disabled) {
      background: var(--color-primary-active);
      border-color: var(--color-primary-active);
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

}

&--secondary {
color: var(--color-text-primary);
background: #fff;
border-color: var(--color-border-base);

    &:hover:not(:disabled):not(.is-disabled) {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
    }

}

&--danger {
color: #fff;
background: var(--color-error);
border-color: var(--color-error);

    &:hover:not(:disabled):not(.is-disabled) {
      background: #ff7875;
      border-color: #ff7875;
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }

}

&--link {
color: var(--color-primary);
background: transparent;
border-color: transparent;
padding: 0;

    &:hover:not(:disabled):not(.is-disabled) {
      color: var(--color-primary-hover);
    }

}

// Модификаторы размера
&--sm {
height: 28px;
padding: 2px 12px;
font-size: var(--font-size-xs);
}

&--md {
height: 32px;
padding: 4px 16px;
font-size: var(--font-size-sm);
}

&--lg {
height: 40px;
padding: 8px 24px;
font-size: var(--font-size-md);
}

// Модификатор block
&--block {
width: 100%;
}

// Модификатор ghost
&--ghost {
background: transparent;

    &.btn--primary {
      color: var(--color-primary);
      border-color: var(--color-primary);

      &:hover:not(:disabled):not(.is-disabled) {
        background: rgba(24, 144, 255, 0.1);
      }
    }

}

// Элементы
&\_\_icon {
display: inline-flex;
font-size: 16px;

    .btn--sm & {
      font-size: 14px;
    }

    .btn--lg & {
      font-size: 18px;
    }

}

&\_\_text {
line-height: 1;
}

&\_\_spinner {
display: inline-flex;
animation: btn-spin 1s linear infinite;
}

@keyframes btn-spin {
from { transform: rotate(0deg); }
to { transform: rotate(360deg); }
}
}

// Состояния (is-\* классы применяются ВМЕСТЕ с .btn)
.btn.is-loading {
pointer-events: none;
opacity: 0.7;
}

.btn.is-disabled,
.btn:disabled {
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
}

Продолжить с 7.2 ng-zorro интеграция (переменные и theming)?
ЧАСТЬ 7: STYLING SYSTEM (продолжение)
7.2 ng-zorro интеграция (переменные и theming)
Назначение:
Переопределение ng-zorro через CSS-переменные для поддержания единого визуального стиля без прямого изменения .ant-\* классов.

7.2.1 ng-zorro CSS Variables Override
// ===== vendors/\_ng-zorro.scss =====

/\*\*

- КРИТИЧНО:
- - Переопределяем ТОЛЬКО CSS-переменные ng-zorro
- - НЕ переопределяем .ant-\* классы напрямую
- - Все визуальные изменения через наши обёртки
    \*/

:root {
// ===== PRIMARY COLORS =====
--ant-primary-color: #1890ff;
--ant-primary-color-hover: #40a9ff;
--ant-primary-color-active: #096dd9;
--ant-primary-color-outline: rgba(24, 144, 255, 0.2);

--ant-primary-1: #e6f7ff; // Lightest
--ant-primary-2: #bae7ff;
--ant-primary-3: #91d5ff;
--ant-primary-4: #69c0ff;
--ant-primary-5: #40a9ff;
--ant-primary-6: #1890ff; // Base
--ant-primary-7: #096dd9;
--ant-primary-8: #0050b3;
--ant-primary-9: #003a8c;
--ant-primary-10: #002766; // Darkest

// ===== SUCCESS COLORS =====
--ant-success-color: #52c41a;
--ant-success-color-hover: #73d13d;
--ant-success-color-active: #389e0d;
--ant-success-color-outline: rgba(82, 196, 26, 0.2);

// ===== WARNING COLORS =====
--ant-warning-color: #faad14;
--ant-warning-color-hover: #ffc53d;
--ant-warning-color-active: #d48806;
--ant-warning-color-outline: rgba(250, 173, 20, 0.2);

// ===== ERROR COLORS =====
--ant-error-color: #ff4d4f;
--ant-error-color-hover: #ff7875;
--ant-error-color-active: #d9363e;
--ant-error-color-outline: rgba(255, 77, 79, 0.2);

// ===== INFO COLORS =====
--ant-info-color: #1890ff;
--ant-info-color-hover: #40a9ff;
--ant-info-color-active: #096dd9;

// ===== TEXT COLORS =====
--ant-text-color: #262626;
--ant-text-color-secondary: #8c8c8c;
--ant-text-color-inverse: #fff;
--ant-text-color-dark: rgba(0, 0, 0, 0.85);
--ant-text-color-secondary-dark: rgba(0, 0, 0, 0.45);

// ===== HEADING COLORS =====
--ant-heading-color: #262626;
--ant-heading-color-dark: rgba(0, 0, 0, 0.85);

// ===== BACKGROUND COLORS =====
--ant-background-color-base: #f0f0f0;
--ant-background-color-light: #fafafa;
--ant-component-background: #fff;
--ant-body-background: #fff;
--ant-popover-background: #fff;
--ant-tooltip-bg: #262626;

// ===== BORDER COLORS =====
--ant-border-color-base: #d9d9d9;
--ant-border-color-split: #f0f0f0;
--ant-border-color-inverse: #fff;

// ===== BORDER RADIUS =====
--ant-border-radius-base: 4px;
--ant-border-radius-sm: 2px;
--ant-border-radius-lg: 8px;

// ===== SHADOW =====
--ant-shadow-1-up: 0 -2px 8px rgba(0, 0, 0, 0.09);
--ant-shadow-1-down: 0 2px 8px rgba(0, 0, 0, 0.09);
--ant-shadow-1-left: -2px 0 8px rgba(0, 0, 0, 0.09);
--ant-shadow-1-right: 2px 0 8px rgba(0, 0, 0, 0.09);
--ant-shadow-2: 0 4px 12px rgba(0, 0, 0, 0.15);
--ant-box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);

// ===== FONT =====
--ant-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
--ant-code-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
Courier, monospace;

--ant-font-size-base: 14px;
--ant-font-size-lg: 16px;
--ant-font-size-sm: 12px;

--ant-font-weight-base: 400;
--ant-font-weight-bold: 600;

--ant-line-height-base: 1.5;

// ===== SPACING =====
--ant-padding-lg: 24px;
--ant-padding-md: 16px;
--ant-padding-sm: 12px;
--ant-padding-xs: 8px;
--ant-padding-xss: 4px;

--ant-margin-lg: 24px;
--ant-margin-md: 16px;
--ant-margin-sm: 12px;
--ant-margin-xs: 8px;
--ant-margin-xss: 4px;

// ===== HEIGHTS =====
--ant-height-base: 32px;
--ant-height-lg: 40px;
--ant-height-sm: 28px;

// ===== Z-INDEX =====
--ant-zindex-base: 0;
--ant-zindex-popup-base: 1000;
--ant-zindex-affix: 10;
--ant-zindex-back-top: 10;
--ant-zindex-picker-panel: 1050;
--ant-zindex-popup: 1050;
--ant-zindex-dropdown: 1050;
--ant-zindex-picker: 1050;
--ant-zindex-tooltip: 1060;
--ant-zindex-notification: 1010;
--ant-zindex-message: 1010;
--ant-zindex-modal-mask: 1000;
--ant-zindex-modal: 1000;
--ant-zindex-image: 1080;

// ===== ANIMATION =====
--ant-ease-base-out: cubic-bezier(0.7, 0.3, 0.1, 1);
--ant-ease-base-in: cubic-bezier(0.9, 0, 0.3, 0.7);
--ant-ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
--ant-ease-in: cubic-bezier(0.55, 0.055, 0.675, 0.19);
--ant-ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);

--ant-animation-duration-slow: 0.3s;
--ant-animation-duration-base: 0.2s;
--ant-animation-duration-fast: 0.1s;

// ===== DISABLED =====
--ant-disabled-color: rgba(0, 0, 0, 0.25);
--ant-disabled-bg: #f5f5f5;
--ant-disabled-color-dark: rgba(0, 0, 0, 0.25);

// ===== LINK =====
--ant-link-color: #1890ff;
--ant-link-hover-color: #40a9ff;
--ant-link-active-color: #096dd9;
--ant-link-decoration: none;
--ant-link-hover-decoration: none;
--ant-link-focus-decoration: none;
--ant-link-focus-outline: 0;
}

/\*\*

- COMPONENT-SPECIFIC OVERRIDES
- Только если КРИТИЧНО необходимо
  \*/

// Table
:root {
--ant-table-header-bg: #fafafa;
--ant-table-header-color: #262626;
--ant-table-header-sort-bg: #f0f0f0;
--ant-table-body-sort-bg: #fafafa;
--ant-table-row-hover-bg: #fafafa;
--ant-table-selected-row-bg: #e6f7ff;
--ant-table-selected-row-hover-bg: #d1edff;
--ant-table-expanded-row-bg: #fbfbfb;
--ant-table-padding-vertical: 16px;
--ant-table-padding-horizontal: 16px;
--ant-table-padding-vertical-md: 12px;
--ant-table-padding-horizontal-md: 8px;
--ant-table-padding-vertical-sm: 8px;
--ant-table-padding-horizontal-sm: 8px;
--ant-table-border-color: #f0f0f0;
--ant-table-border-radius-base: 4px;
--ant-table-footer-bg: #fafafa;
--ant-table-footer-color: #262626;
--ant-table-header-bg-sm: #fafafa;
--ant-table-font-size: 14px;
--ant-table-font-size-md: 14px;
--ant-table-font-size-sm: 14px;
--ant-table-header-cell-split-color: #f0f0f0;
--ant-table-filter-btns-bg: #fff;
--ant-table-filter-dropdown-bg: #fff;
--ant-table-expand-icon-bg: #fff;
--ant-table-selection-column-width: 60px;
--ant-table-sticky-scroll-bar-bg: rgba(0, 0, 0, 0.35);
--ant-table-sticky-scroll-bar-radius: 4px;
}

// Modal
:root {
--ant-modal-header-bg: #fff;
--ant-modal-header-padding: 16px 24px;
--ant-modal-header-border-width: 1px;
--ant-modal-header-border-style: solid;
--ant-modal-header-border-color-split: #f0f0f0;
--ant-modal-header-close-size: 56px;
--ant-modal-content-bg: #fff;
--ant-modal-heading-color: #262626;
--ant-modal-close-color: #8c8c8c;
--ant-modal-footer-bg: transparent;
--ant-modal-footer-border-color-split: #f0f0f0;
--ant-modal-footer-border-style: solid;
--ant-modal-footer-padding-vertical: 10px;
--ant-modal-footer-padding-horizontal: 16px;
--ant-modal-footer-border-width: 1px;
--ant-modal-mask-bg: rgba(0, 0, 0, 0.45);
--ant-modal-confirm-body-padding: 32px 32px 24px;
--ant-modal-confirm-title-font-size: 16px;
--ant-modal-border-radius: 4px;
}

// Input
:root {
--ant-input-height-base: 32px;
--ant-input-height-lg: 40px;
--ant-input-height-sm: 28px;
--ant-input-padding-horizontal: 11px;
--ant-input-padding-horizontal-base: 11px;
--ant-input-padding-horizontal-sm: 7px;
--ant-input-padding-horizontal-lg: 11px;
--ant-input-padding-vertical-base: 4px;
--ant-input-padding-vertical-sm: 1px;
--ant-input-padding-vertical-lg: 6px;
--ant-input-placeholder-color: #bfbfbf;
--ant-input-color: #262626;
--ant-input-icon-color: rgba(0, 0, 0, 0.25);
--ant-input-border-color: #d9d9d9;
--ant-input-bg: #fff;
--ant-input-number-hover-border-color: #40a9ff;
--ant-input-number-handler-active-bg: #f4f4f4;
--ant-input-number-handler-hover-bg: #40a9ff;
--ant-input-number-handler-bg: #fff;
--ant-input-number-handler-border-color: #d9d9d9;
--ant-input-addon-bg: #fafafa;
--ant-input-hover-border-color: #40a9ff;
--ant-input-disabled-bg: #f5f5f5;
--ant-input-outline-offset: 0;
--ant-input-icon-hover-color: rgba(0, 0, 0, 0.85);
--ant-input-disabled-color: rgba(0, 0, 0, 0.25);
}

// Button
:root {
--ant-btn-font-weight: 400;
--ant-btn-border-radius-base: 4px;
--ant-btn-border-radius-sm: 4px;
--ant-btn-border-width: 1px;
--ant-btn-border-style: solid;
--ant-btn-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
--ant-btn-primary-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
--ant-btn-text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
--ant-btn-primary-color: #fff;
--ant-btn-primary-bg: #1890ff;
--ant-btn-default-color: #262626;
--ant-btn-default-bg: #fff;
--ant-btn-default-border: #d9d9d9;
--ant-btn-danger-color: #fff;
--ant-btn-danger-bg: #ff4d4f;
--ant-btn-danger-border: #ff4d4f;
--ant-btn-disable-color: rgba(0, 0, 0, 0.25);
--ant-btn-disable-bg: #f5f5f5;
--ant-btn-disable-border: #d9d9d9;
--ant-btn-default-ghost-color: #fff;
--ant-btn-default-ghost-bg: transparent;
--ant-btn-default-ghost-border: #fff;
--ant-btn-font-size-lg: 16px;
--ant-btn-font-size-sm: 14px;
--ant-btn-padding-horizontal-base: 15px;
--ant-btn-padding-horizontal-lg: 15px;
--ant-btn-padding-horizontal-sm: 7px;
--ant-btn-height-base: 32px;
--ant-btn-height-lg: 40px;
--ant-btn-height-sm: 24px;
--ant-btn-line-height: 1.5;
--ant-btn-circle-size: 32px;
--ant-btn-circle-size-lg: 40px;
--ant-btn-circle-size-sm: 24px;
--ant-btn-square-size: 32px;
--ant-btn-square-size-lg: 40px;
--ant-btn-square-size-sm: 24px;
--ant-btn-square-only-icon-size: 16px;
--ant-btn-square-only-icon-size-sm: 14px;
--ant-btn-square-only-icon-size-lg: 18px;
--ant-btn-group-border: #40a9ff;
--ant-btn-link-hover-bg: transparent;
--ant-btn-text-hover-bg: rgba(0, 0, 0, 0.018);
}

// Alert
:root {
--ant-alert-success-border-color: #b7eb8f;
--ant-alert-success-bg-color: #f6ffed;
--ant-alert-success-icon-color: #52c41a;
--ant-alert-info-border-color: #91d5ff;
--ant-alert-info-bg-color: #e6f7ff;
--ant-alert-info-icon-color: #1890ff;
--ant-alert-warning-border-color: #ffe58f;
--ant-alert-warning-bg-color: #fffbe6;
--ant-alert-warning-icon-color: #faad14;
--ant-alert-error-border-color: #ffccc7;
--ant-alert-error-bg-color: #fff2f0;
--ant-alert-error-icon-color: #ff4d4f;
--ant-alert-message-color: #262626;
--ant-alert-text-color: #262626;
--ant-alert-close-color: #8c8c8c;
--ant-alert-close-hover-color: rgba(0, 0, 0, 0.75);
--ant-alert-no-icon-padding-vertical: 8px;
--ant-alert-with-description-no-icon-padding-vertical: 15px;
--ant-alert-with-description-padding-vertical: 15px;
--ant-alert-with-description-padding: 15px 15px 15px 64px;
--ant-alert-icon-top: 8px;
--ant-alert-with-description-icon-size: 24px;
}

// Message
:root {
--ant-message-notice-content-padding: 10px 16px;
--ant-message-notice-content-bg: #fff;
}

// Notification
:root {
--ant-notification-bg: #fff;
--ant-notification-padding-vertical: 16px;
--ant-notification-padding-horizontal: 24px;
--ant-notification-padding: 16px 24px;
--ant-notification-margin-bottom: 16px;
--ant-notification-margin-edge: 24px;
}

7.2.2 Dark Mode Support (опционально)
// ===== vendors/\_ng-zorro-dark.scss =====

/\*\*

- Dark Mode для ng-zorro
- Применяется через data-theme="dark" на <html>
  \*/

[data-theme='dark'] {
// ===== PRIMARY COLORS (не меняются) =====
--ant-primary-color: #1890ff;
--ant-primary-color-hover: #40a9ff;
--ant-primary-color-active: #096dd9;

// ===== TEXT COLORS =====
--ant-text-color: rgba(255, 255, 255, 0.85);
--ant-text-color-secondary: rgba(255, 255, 255, 0.45);
--ant-text-color-inverse: #262626;
--ant-heading-color: rgba(255, 255, 255, 0.85);

// ===== BACKGROUND COLORS =====
--ant-background-color-base: #1f1f1f;
--ant-background-color-light: #141414;
--ant-component-background: #1f1f1f;
--ant-body-background: #000;
--ant-popover-background: #1f1f1f;
--ant-tooltip-bg: rgba(255, 255, 255, 0.85);

// ===== BORDER COLORS =====
--ant-border-color-base: #434343;
--ant-border-color-split: #303030;

// ===== DISABLED =====
--ant-disabled-color: rgba(255, 255, 255, 0.25);
--ant-disabled-bg: rgba(255, 255, 255, 0.08);

// ===== TABLE =====
--ant-table-header-bg: #1f1f1f;
--ant-table-header-color: rgba(255, 255, 255, 0.85);
--ant-table-row-hover-bg: #262626;
--ant-table-selected-row-bg: #111b26;
--ant-table-footer-bg: #1f1f1f;
--ant-table-border-color: #303030;

// ===== MODAL =====
--ant-modal-header-bg: #1f1f1f;
--ant-modal-content-bg: #1f1f1f;
--ant-modal-mask-bg: rgba(0, 0, 0, 0.65);

// ===== INPUT =====
--ant-input-bg: transparent;
--ant-input-border-color: #434343;
--ant-input-placeholder-color: rgba(255, 255, 255, 0.3);
--ant-input-disabled-bg: rgba(255, 255, 255, 0.08);
--ant-input-addon-bg: #303030;

// ===== BUTTON =====
--ant-btn-default-color: rgba(255, 255, 255, 0.85);
--ant-btn-default-bg: transparent;
--ant-btn-default-border: #434343;
--ant-btn-disable-color: rgba(255, 255, 255, 0.25);
--ant-btn-disable-bg: rgba(255, 255, 255, 0.08);
--ant-btn-disable-border: #434343;
}

7.2.3 Theming Service
// ===== THEMING SERVICE =====

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
private readonly storageKey = 'app-theme';
private readonly themeSubject = new BehaviorSubject<Theme>('light');

theme$ = this.themeSubject.asObservable();

constructor() {
this.loadTheme();
}

/\*\*

- Установить тему
  \*/
  setTheme(theme: Theme) {
  this.themeSubject.next(theme);
  this.applyTheme(theme);
  this.saveTheme(theme);
  }

/\*\*

- Переключить тему
  \*/
  toggleTheme() {
  const current = this.themeSubject.value;
  const newTheme = current === 'light' ? 'dark' : 'light';
  this.setTheme(newTheme);
  }

/\*\*

- Получить текущую тему
  \*/
  getCurrentTheme(): Theme {
  return this.themeSubject.value;
  }

/\*\*

- Определить тему из системных настроек
  \*/
  detectSystemTheme(): Theme {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  return 'dark';
  }
  return 'light';
  }

/\*\*

- Использовать системную тему
  \*/
  useSystemTheme() {
  const systemTheme = this.detectSystemTheme();
  this.setTheme(systemTheme);


    // Слушать изменения системной темы
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
      });

}

private loadTheme() {
const saved = localStorage.getItem(this.storageKey) as Theme;
if (saved && (saved === 'light' || saved === 'dark')) {
this.setTheme(saved);
} else {
// По умолчанию light
this.setTheme('light');
}
}

private saveTheme(theme: Theme) {
localStorage.setItem(this.storageKey, theme);
}

private applyTheme(theme: Theme) {
const html = document.documentElement;

    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark-theme');
      html.classList.remove('light-theme');
    } else {
      html.setAttribute('data-theme', 'light');
      html.classList.add('light-theme');
      html.classList.remove('dark-theme');
    }

}
}

// ===== ИСПОЛЬЗОВАНИЕ =====

@Component({
selector: 'app-theme-switcher',
standalone: true,
imports: [CommonModule],
template: `    <button
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="currentTheme() === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
    >
      @if (currentTheme() === 'dark') {
        <app-icon iconKey="icon-sun"></app-icon>
      } @else {
        <app-icon iconKey="icon-moon"></app-icon>
      }
    </button>
 `,
styles: [`
.theme-toggle {
width: 40px;
height: 40px;
border: none;
background: transparent;
cursor: pointer;
border-radius: var(--radius-md);
transition: background var(--transition-base);

      &:hover {
        background: var(--color-bg-light);
      }

      app-icon {
        font-size: 20px;
        color: var(--color-text-primary);
      }
    }

`]
})
export class ThemeSwitcherComponent {
private readonly themeService = inject(ThemeService);

currentTheme = toSignal(this.themeService.theme$, {
initialValue: 'light'
});

toggleTheme() {
this.themeService.toggleTheme();
}
}

7.3 Responsive Design
7.3.1 Breakpoints
// ===== abstracts/\_breakpoints.scss =====

/\*\*

- BREAKPOINTS
- Единая система точек перелома для адаптивного дизайна
  \*/

$breakpoints: (
'mobile-sm': 320px, // Маленький мобильный
'mobile': 480px, // Мобильный
'tablet-sm': 640px, // Маленький планшет
'tablet': 768px, // Планшет
'tablet-lg': 1024px, // Большой планшет
'desktop': 1280px, // Десктоп
'desktop-lg': 1440px, // Большой десктоп
'desktop-xl': 1920px // Extra large
);

/\*\*

- MIXINS для медиа-запросов
  \*/

// Min-width (mobile-first approach)
@mixin media-min($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "Breakpoint #{$breakpoint} not found";
}
}

// Max-width
@mixin media-max($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: (map-get($breakpoints, $breakpoint) - 1px)) {
      @content;
    }
  } @else {
    @warn "Breakpoint #{$breakpoint} not found";
}
}

// Between
@mixin media-between($min, $max) {
  @if map-has-key($breakpoints, $min) and map-has-key($breakpoints, $max) {
    @media (min-width: map-get($breakpoints, $min)) and
           (max-width: (map-get($breakpoints, $max) - 1px)) {
      @content;
    }
  } @else {
    @warn "Breakpoints #{$min} or #{$max} not found";
}
}

// Shortcuts
@mixin mobile {
@include media-max('tablet') {
@content;
}
}

@mixin tablet {
@include media-between('tablet', 'desktop') {
@content;
}
}

@mixin desktop {
@include media-min('desktop') {
@content;
}
}

// ===== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ =====

.admin-layout {
display: grid;
grid-template-columns: 240px 1fr 320px;

@include media-max('desktop') {
grid-template-columns: 64px 1fr 320px;
}

@include media-max('tablet') {
grid-template-columns: 1fr;
}
}

.page-header {
padding: var(--spacing-lg);

@include mobile {
padding: var(--spacing-md);
}
}

.data-table {
font-size: var(--font-size-sm);

@include media-max('mobile') {
font-size: var(--font-size-xs);

    // Скрыть некритичные колонки
    .table-col--optional {
      display: none;
    }

}
}

7.3.2 Container Queries (современный подход)
// ===== abstracts/\_container-queries.scss =====

/\*\*

- Container Queries для компонентов
- Современная альтернатива media queries
  \*/

// Определение контейнеров
.page-body {
container-type: inline-size;
container-name: page-body;
}

.sidebar {
container-type: inline-size;
container-name: sidebar;
}

// Container query mixins
@mixin container($name, $min-width) {
  @container #{$name} (min-width: #{$min-width}) {
@content;
}
}

// ===== ПРИМЕРЫ =====

.user-card {
display: flex;
flex-direction: column;
gap: var(--spacing-md);

// Когда page-body шире 600px
@container page-body (min-width: 600px) {
flex-direction: row;
align-items: center;
}

// Когда page-body шире 900px
@container page-body (min-width: 900px) {
&\_\_avatar {
width: 80px;
height: 80px;
}
}
}

.sidebar-widget {
padding: var(--spacing-sm);

@container sidebar (min-width: 240px) {
padding: var(--spacing-md);
}

@container sidebar (min-width: 320px) {
padding: var(--spacing-lg);

    &__title {
      font-size: var(--font-size-lg);
    }

}
}

7.3.3 Responsive Utilities
// ===== utilities/\_responsive.scss =====

/\*\*

- Responsive utility classes
- Показывать/скрывать элементы на разных экранах
  \*/

// Hide on mobile
.hide-mobile {
@include mobile {
display: none !important;
}
}

// Hide on tablet
.hide-tablet {
@include tablet {
display: none !important;
}
}

// Hide on desktop
.hide-desktop {
@include desktop {
display: none !important;
}
}

// Show only on mobile
.show-mobile-only {
display: none !important;

@include mobile {
display: block !important;
}
}

// Show only on tablet
.show-tablet-only {
display: none !important;

@include tablet {
display: block !important;
}
}

// Show only on desktop
.show-desktop-only {
display: none !important;

@include desktop {
display: block !important;
}
}

// Responsive text alignment
.text-center-mobile {
@include mobile {
text-align: center !important;
}
}

.text-left-desktop {
@include desktop {
text-align: left !important;
}
}

// Responsive spacing
.p-mobile-sm {
@include mobile {
padding: var(--spacing-sm) !important;
}
}

.p-desktop-lg {
@include desktop {
padding: var(--spacing-lg) !important;
}
}

7.3.4 Responsive Typography
// ===== base/\_typography-responsive.scss =====

/\*\*

- Адаптивная типографика
- Размеры шрифтов масштабируются по экранам
  \*/

// Fluid typography function
@function fluid-type($min-vw, $max-vw, $min-font-size, $max-font-size) {
  $u1: unit($min-vw);
$u2: unit($max-vw);
$u3: unit($min-font-size);
$u4: unit($max-font-size);

@if $u1 == $u2 and $u1 == $u3 and $u1 == $u4 {
    @return calc(
      #{$min-font-size} +
#{strip-unit($max-font-size - $min-font-size)} *
      ((100vw - #{$min-vw}) / #{strip-unit($max-vw - $min-vw)})
);
}
}

@function strip-unit($value) {
  @return $value / ($value \* 0 + 1);
}

// Применение к заголовкам
h1 {
font-size: fluid-type(320px, 1920px, 24px, 48px);
}

h2 {
font-size: fluid-type(320px, 1920px, 20px, 32px);
}

h3 {
font-size: fluid-type(320px, 1920px, 18px, 24px);
}

// Или через клампы (современный подход)
h1 {
font-size: clamp(24px, 5vw, 48px);
}

h2 {
font-size: clamp(20px, 4vw, 32px);
}

h3 {
font-size: clamp(18px, 3vw, 24px);
}

// Адаптивные line-height
p {
line-height: 1.8;

@include mobile {
line-height: 1.6;
}
}

7.3.5 Print Styles
// ===== utilities/\_print.scss =====

/\*\*

- Стили для печати
  \*/

@media print {
// Скрыть элементы навигации
.admin-header,
.left-sidebar,
.right-panel,
.admin-footer,
.global-status-bar,
.page-footer {
display: none !important;
}

// Развернуть основной контент
.admin-main {
width: 100% !important;
margin: 0 !important;
padding: 0 !important;
}

// Убрать тени и скругления

- {
  box-shadow: none !important;
  border-radius: 0 !important;
  }

// Черно-белые цвета
body {
color: #000;
background: #fff;
}

// Показать ссылки
a[href]:after {
content: " (" attr(href) ")";
font-size: 0.8em;
color: #666;
}

// Разрывы страниц
h1, h2, h3 {
page-break-after: avoid;
}

table {
page-break-inside: avoid;
}

// Убрать фоны
.table-panel,
.form-group,
.status {
background: transparent !important;
border: 1px solid #000 !important;
}
}

Продолжить с ЧАСТЬ 8: ANGULAR IMPLEMENTATION (детальная структура проекта)?
ЧАСТЬ 8: ANGULAR IMPLEMENTATION
8.1 Детальная структура проекта
Назначение:
Layer-based архитектура для масштабируемости и чёткого разделения ответственности.
src/
├── app/
│ ├── core/ # Core Layer (Singleton services)
│ │ ├── models/ # Модели данных
│ │ │ ├── context.model.ts
│ │ │ ├── error-registry.model.ts
│ │ │ ├── command.model.ts
│ │ │ ├── event.model.ts
│ │ │ └── icon.model.ts
│ │ │
│ │ ├── services/ # Core сервисы
│ │ │ ├── context/
│ │ │ │ ├── context.service.ts
│ │ │ │ └── context.service.spec.ts
│ │ │ │
│ │ │ ├── error-registry/
│ │ │ │ ├── error-registry.service.ts
│ │ │ │ └── error-registry.service.spec.ts
│ │ │ │
│ │ │ ├── event-bus/
│ │ │ │ ├── event-bus.service.ts
│ │ │ │ └── event-bus.service.spec.ts
│ │ │ │
│ │ │ ├── command/
│ │ │ │ ├── command.service.ts
│ │ │ │ ├── command-registry.service.ts
│ │ │ │ └── command.service.spec.ts
│ │ │ │
│ │ │ └── icon-provider/
│ │ │ ├── icon-provider.service.ts
│ │ │ └── icon-provider.service.spec.ts
│ │ │
│ │ ├── guards/ # Route guards
│ │ │ ├── auth.guard.ts
│ │ │ ├── permission.guard.ts
│ │ │ └── unsaved-changes.guard.ts
│ │ │
│ │ ├── interceptors/ # HTTP Interceptors
│ │ │ ├── auth.interceptor.ts
│ │ │ ├── http-error.interceptor.ts
│ │ │ └── loading.interceptor.ts
│ │ │
│ │ ├── initializers/ # APP_INITIALIZER
│ │ │ ├── app.initializer.ts
│ │ │ └── commands.initializer.ts
│ │ │
│ │ └── index.ts # Public API
│ │
│ ├── shell/ # Shell Layer (Layout components)
│ │ ├── components/
│ │ │ ├── admin-layout/
│ │ │ │ ├── admin-layout.component.ts
│ │ │ │ ├── admin-layout.component.html
│ │ │ │ ├── admin-layout.component.scss
│ │ │ │ └── admin-layout.component.spec.ts
│ │ │ │
│ │ │ ├── header/
│ │ │ │ ├── admin-header.component.ts
│ │ │ │ ├── admin-header.component.html
│ │ │ │ ├── admin-header.component.scss
│ │ │ │ └── admin-header.component.spec.ts
│ │ │ │
│ │ │ ├── left-sidebar/
│ │ │ │ ├── left-sidebar.component.ts
│ │ │ │ ├── left-sidebar.component.html
│ │ │ │ ├── left-sidebar.component.scss
│ │ │ │ ├── left-sidebar.component.spec.ts
│ │ │ │ └── left-sidebar.config.ts
│ │ │ │
│ │ │ ├── right-panel/
│ │ │ │ ├── right-panel.component.ts
│ │ │ │ ├── right-panel.component.html
│ │ │ │ ├── right-panel.component.scss
│ │ │ │ ├── right-panel.component.spec.ts
│ │ │ │ └── panels/ # Panel implementations
│ │ │ │ ├── actions-panel.component.ts
│ │ │ │ ├── errors-panel.component.ts
│ │ │ │ ├── history-panel.component.ts
│ │ │ │ └── info-panel.component.ts
│ │ │ │
│ │ │ ├── footer/
│ │ │ │ ├── admin-footer.component.ts
│ │ │ │ ├── admin-footer.component.html
│ │ │ │ ├── admin-footer.component.scss
│ │ │ │ └── admin-footer.component.spec.ts
│ │ │ │
│ │ │ ├── global-status-bar/
│ │ │ │ ├── global-status-bar.component.ts
│ │ │ │ ├── global-status-bar.component.html
│ │ │ │ ├── global-status-bar.component.scss
│ │ │ │ └── global-status-bar.component.spec.ts
│ │ │ │
│ │ │ ├── form-status-bar/
│ │ │ │ ├── form-status-bar.component.ts
│ │ │ │ ├── form-status-bar.component.html
│ │ │ │ ├── form-status-bar.component.scss
│ │ │ │ └── form-status-bar.component.spec.ts
│ │ │ │
│ │ │ └── error-block/
│ │ │ ├── error-block.component.ts
│ │ │ ├── error-block.component.html
│ │ │ ├── error-block.component.scss
│ │ │ ├── error-block.component.spec.ts
│ │ │ └── error-item.component.ts
│ │ │
│ │ └── index.ts # Public API
│ │
│ ├── shared/ # Shared Layer
│ │ ├── components/ # Reusable UI components
│ │ │ ├── buttons/
│ │ │ │ ├── button.component.ts
│ │ │ │ ├── button-group.component.ts
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── forms/
│ │ │ │ ├── form-group.component.ts
│ │ │ │ ├── form-field.component.ts
│ │ │ │ ├── input.component.ts
│ │ │ │ ├── select.component.ts
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── tables/
│ │ │ │ ├── table.component.ts
│ │ │ │ ├── pagination.component.ts
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── modals/
│ │ │ │ ├── modal.service.ts
│ │ │ │ ├── error-modal-content.component.ts
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── status/
│ │ │ │ ├── badge.component.ts
│ │ │ │ ├── status.component.ts
│ │ │ │ ├── progress.component.ts
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── feedback/
│ │ │ │ ├── skeleton.component.ts
│ │ │ │ ├── empty-state.component.ts
│ │ │ │ ├── spinner.component.ts
│ │ │ │ ├── alert.component.ts
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── grid/
│ │ │ │ ├── grid-row.component.ts
│ │ │ │ ├── grid-col.component.ts
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── page-shell/
│ │ │ │ ├── page-shell.component.ts
│ │ │ │ ├── page-shell.component.html
│ │ │ │ ├── page-shell.component.scss
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ └── icon/
│ │ │ ├── icon.component.ts
│ │ │ └── index.ts
│ │ │
│ │ ├── directives/ # Директивы
│ │ │ ├── tooltip.directive.ts
│ │ │ ├── click-outside.directive.ts
│ │ │ └── index.ts
│ │ │
│ │ ├── pipes/ # Pipes
│ │ │ ├── safe-html.pipe.ts
│ │ │ ├── date-format.pipe.ts
│ │ │ ├── file-size.pipe.ts
│ │ │ └── index.ts
│ │ │
│ │ ├── utils/ # Утилиты
│ │ │ ├── date.utils.ts
│ │ │ ├── string.utils.ts
│ │ │ ├── validation.utils.ts
│ │ │ └── index.ts
│ │ │
│ │ ├── infrastructures/ # Существующие сервисы
│ │ │ ├── interceptor/
│ │ │ │ ├── models/
│ │ │ │ │ └── error-response.model.ts
│ │ │ │ └── services/
│ │ │ │ ├── error-handling.service.ts
│ │ │ │ └── http-error.interceptor.ts
│ │ │ │
│ │ │ └── logging/
│ │ │ └── logging.service.ts
│ │ │
│ │ └── index.ts # Public API
│ │
│ ├── features/ # Feature Modules
│ │ ├── users/
│ │ │ ├── pages/
│ │ │ │ ├── users-list/
│ │ │ │ │ ├── users-list.component.ts
│ │ │ │ │ ├── users-list.component.html
│ │ │ │ │ ├── users-list.component.scss
│ │ │ │ │ └── users-list.component.spec.ts
│ │ │ │ │
│ │ │ │ ├── user-form/
│ │ │ │ │ ├── user-form.component.ts
│ │ │ │ │ ├── user-form.component.html
│ │ │ │ │ ├── user-form.component.scss
│ │ │ │ │ └── user-form.component.spec.ts
│ │ │ │ │
│ │ │ │ └── user-detail/
│ │ │ │ ├── user-detail.component.ts
│ │ │ │ ├── user-detail.component.html
│ │ │ │ ├── user-detail.component.scss
│ │ │ │ └── user-detail.component.spec.ts
│ │ │ │
│ │ │ ├── components/ # Feature components
│ │ │ │ ├── user-avatar.component.ts
│ │ │ │ └── user-role-badge.component.ts
│ │ │ │
│ │ │ ├── services/
│ │ │ │ ├── user.service.ts
│ │ │ │ └── user.service.spec.ts
│ │ │ │
│ │ │ ├── models/
│ │ │ │ ├── user.model.ts
│ │ │ │ └── user-filter.model.ts
│ │ │ │
│ │ │ ├── users.routes.ts # Feature routes
│ │ │ └── index.ts
│ │ │
│ │ ├── roles/
│ │ │ └── ... # Similar structure
│ │ │
│ │ ├── settings/
│ │ │ └── ...
│ │ │
│ │ └── dashboard/
│ │ └── ...
│ │
│ ├── app.component.ts # Root component
│ ├── app.component.html
│ ├── app.component.scss
│ ├── app.config.ts # App configuration
│ └── app.routes.ts # Root routes
│
├── assets/ # Static assets
│ ├── icons/ # SVG icons
│ ├── images/ # Images
│ └── i18n/ # Translations
│
├── styles/ # Global styles
│ ├── abstracts/
│ │ ├── \_variables.scss
│ │ ├── \_mixins.scss
│ │ ├── \_functions.scss
│ │ └── \_breakpoints.scss
│ │
│ ├── base/
│ │ ├── \_reset.scss
│ │ ├── \_typography.scss
│ │ ├── \_typography-responsive.scss
│ │ └── \_global.scss
│ │
│ ├── components/
│ │ ├── \_buttons.scss
│ │ ├── \_forms.scss
│ │ ├── \_tables.scss
│ │ ├── \_modals.scss
│ │ ├── \_alerts.scss
│ │ └── ...
│ │
│ ├── layout/
│ │ ├── \_header.scss
│ │ ├── \_sidebar.scss
│ │ ├── \_footer.scss
│ │ └── \_grid.scss
│ │
│ ├── states/
│ │ └── \_states.scss
│ │
│ ├── utilities/
│ │ ├── \_helpers.scss
│ │ ├── \_responsive.scss
│ │ └── \_print.scss
│ │
│ ├── vendors/
│ │ ├── \_ng-zorro.scss
│ │ └── \_ng-zorro-dark.scss
│ │
│ └── main.scss # Main entry point
│
├── environments/
│ ├── environment.ts # Development
│ └── environment.prod.ts # Production
│
└── index.html

8.2 App Configuration (Angular 19 Standalone)
8.2.1 app.config.ts
// ===== app.config.ts =====

import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

// ng-zorro
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import \* as AllIcons from '@ant-design/icons-angular/icons';

// Core services
import { ContextService } from './core/services/context/context.service';
import { ErrorRegistry } from './core/services/error-registry/error-registry.service';
import { EventBus } from './core/services/event-bus/event-bus.service';
import { CommandService } from './core/services/command/command.service';
import { IconProvider } from './core/services/icon-provider/icon-provider.service';

// Interceptors
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

// Initializers
import { appInitializer } from './core/initializers/app.initializer';
import { commandsInitializer } from './core/initializers/commands.initializer';

// Icons registration
const antDesignIcons = AllIcons as { [key: string]: IconDefinition };
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
key => antDesignIcons[key]
);

export const appConfig: ApplicationConfig = {
providers: [
// Zone.js optimization
provideZoneChangeDetection({ eventCoalescing: true }),

    // Router
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),

    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        httpErrorInterceptor,
        loadingInterceptor
      ])
    ),

    // Animations
    provideAnimations(),

    // ng-zorro configuration
    provideNzConfig({
      message: { nzTop: 24, nzDuration: 5000 },
      notification: { nzTop: 24, nzDuration: 4500 },
      modal: { nzMaskClosable: false }
    }),

    // ng-zorro icons
    provideNzIcons(icons),

    // Core services (singleton)
    ContextService,
    ErrorRegistry,
    EventBus,
    CommandService,
    IconProvider,

    // App initializers
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [ContextService, ErrorRegistry, IconProvider]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: commandsInitializer,
      multi: true,
      deps: [CommandService, HttpClient]
    }

]
};

8.2.2 app.routes.ts
// ===== app.routes.ts =====

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
// Redirect root to dashboard
{
path: '',
redirectTo: 'admin/dashboard',
pathMatch: 'full'
},

// Admin layout (shell)
{
path: 'admin',
loadComponent: () =>
import('./shell/components/admin-layout/admin-layout.component')
.then(m => m.AdminLayoutComponent),
canActivate: [authGuard],
children: [
// Dashboard
{
path: 'dashboard',
loadComponent: () =>
import('./features/dashboard/pages/dashboard/dashboard.component')
.then(m => m.DashboardComponent),
data: {
title: 'Панель управления',
breadcrumb: 'Dashboard'
}
},

      // Users feature
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes')
            .then(m => m.USERS_ROUTES),
        data: {
          permission: 'users.read'
        },
        canActivate: [permissionGuard]
      },

      // Roles feature
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles.routes')
            .then(m => m.ROLES_ROUTES),
        data: {
          permission: 'roles.read'
        },
        canActivate: [permissionGuard]
      },

      // Settings feature
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes')
            .then(m => m.SETTINGS_ROUTES),
        data: {
          permission: 'settings.read'
        },
        canActivate: [permissionGuard]
      }
    ]

},

// Auth routes (outside admin layout)
{
path: 'auth',
loadChildren: () =>
import('./features/auth/auth.routes')
.then(m => m.AUTH_ROUTES)
},

// Error pages
{
path: '404',
loadComponent: () =>
import('./features/errors/pages/not-found/not-found.component')
.then(m => m.NotFoundComponent)
},
{
path: '403',
loadComponent: () =>
import('./features/errors/pages/forbidden/forbidden.component')
.then(m => m.ForbiddenComponent)
},
{
path: '500',
loadComponent: () =>
import('./features/errors/pages/server-error/server-error.component')
.then(m => m.ServerErrorComponent)
},

// Wildcard (404)
{
path: '\*\*',
redirectTo: '404'
}
];

8.2.3 Feature Routes Example (users.routes.ts)
// ===== features/users/users.routes.ts =====

import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';
import { permissionGuard } from '../../core/guards/permission.guard';

export const USERS_ROUTES: Routes = [
// Users list
{
path: '',
loadComponent: () =>
import('./pages/users-list/users-list.component')
.then(m => m.UsersListComponent),
data: {
title: 'Пользователи',
breadcrumb: 'Users'
}
},

// Create user
{
path: 'create',
loadComponent: () =>
import('./pages/user-form/user-form.component')
.then(m => m.UserFormComponent),
canDeactivate: [unsavedChangesGuard],
data: {
title: 'Создание пользователя',
breadcrumb: 'Create',
permission: 'users.create'
},
canActivate: [permissionGuard]
},

// Edit user
{
path: ':id/edit',
loadComponent: () =>
import('./pages/user-form/user-form.component')
.then(m => m.UserFormComponent),
canDeactivate: [unsavedChangesGuard],
data: {
title: 'Редактирование пользователя',
breadcrumb: 'Edit',
permission: 'users.update'
},
canActivate: [permissionGuard]
},

// User detail
{
path: ':id',
loadComponent: () =>
import('./pages/user-detail/user-detail.component')
.then(m => m.UserDetailComponent),
data: {
title: 'Детали пользователя',
breadcrumb: 'Detail'
}
}
];

8.3 Guards
8.3.1 Auth Guard
// ===== core/guards/auth.guard.ts =====

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
const authService = inject(AuthService);
const router = inject(Router);

if (authService.isAuthenticated()) {
return true;
}

// Redirect to login with return URL
return router.createUrlTree(['/auth/login'], {
queryParams: { returnUrl: state.url }
});
};

8.3.2 Permission Guard
// ===== core/guards/permission.guard.ts =====

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ContextService } from '../services/context/context.service';

export const permissionGuard: CanActivateFn = (route, state) => {
const contextService = inject(ContextService);
const router = inject(Router);

const requiredPermission = route.data['permission'] as string | undefined;

if (!requiredPermission) {
// No permission required
return true;
}

if (contextService.hasPermission(requiredPermission)) {
return true;
}

// Redirect to 403
return router.createUrlTree(['/403']);
};

8.3.3 Unsaved Changes Guard
// ===== core/guards/unsaved-changes.guard.ts =====

import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ModalService } from '../../shared/components/modals/modal.service';

export interface CanComponentDeactivate {
canDeactivate: () => boolean | Observable<boolean> | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
component
) => {
const modalService = inject(ModalService);

if (!component.canDeactivate) {
return true;
}

const canDeactivate = component.canDeactivate();

if (canDeactivate === true) {
return true;
}

if (canDeactivate === false) {
// Show confirmation modal
return new Promise<boolean>((resolve) => {
modalService.confirm({
title: 'Несохранённые изменения',
content: 'У вас есть несохранённые изменения. Вы уверены, что хотите покинуть страницу?',
footer: {
okText: 'Покинуть страницу',
cancelText: 'Остаться'
},
onOk: () => resolve(true),
onCancel: () => resolve(false)
});
});
}

return canDeactivate;
};

// ===== ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТЕ =====

@Component({
selector: 'app-user-form'
})
export class UserFormComponent implements CanComponentDeactivate {
form!: FormGroup;

canDeactivate(): boolean {
// Return true if form is pristine (no changes)
// Return false if form is dirty (has changes)
return !this.form.dirty;
}
}

8.4 Interceptors
8.4.1 Auth Interceptor
// ===== core/interceptors/auth.interceptor.ts =====

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
const authService = inject(AuthService);

// Get token
const token = authService.getToken();

if (!token) {
return next(req);
}

// Clone request and add Authorization header
const authReq = req.clone({
setHeaders: {
Authorization: `Bearer ${token}`
}
});

return next(authReq);
};

8.4.2 Loading Interceptor
// ===== core/interceptors/loading.interceptor.ts =====

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
const loadingService = inject(LoadingService);

// Skip loading for certain requests
if (req.headers.has('X-Skip-Loading')) {
return next(req.clone({
headers: req.headers.delete('X-Skip-Loading')
}));
}

// Show loading
loadingService.show();

return next(req).pipe(
finalize(() => {
loadingService.hide();
})
);
};

// ===== LOADING SERVICE =====

@Injectable({ providedIn: 'root' })
export class LoadingService {
private loadingSubject = new BehaviorSubject<boolean>(false);
loading$ = this.loadingSubject.asObservable();

private activeRequests = 0;

show() {
this.activeRequests++;
if (this.activeRequests === 1) {
this.loadingSubject.next(true);
}
}

hide() {
this.activeRequests--;
if (this.activeRequests <= 0) {
this.activeRequests = 0;
this.loadingSubject.next(false);
}
}

reset() {
this.activeRequests = 0;
this.loadingSubject.next(false);
}
}

8.5 Initializers
8.5.1 App Initializer
// ===== core/initializers/app.initializer.ts =====

import { ContextService } from '../services/context/context.service';
import { ErrorRegistry } from '../services/error-registry/error-registry.service';
import { IconProvider } from '../services/icon-provider/icon-provider.service';

export function appInitializer(
contextService: ContextService,
errorRegistry: ErrorRegistry,
iconProvider: IconProvider
) {
return () => {
return new Promise<void>((resolve) => {
// Initialize Context
contextService.setContext({
activeArea: {
type: 'dashboard',
entityId: 'main',
mode: 'view'
},
dataState: {
dirty: false,
valid: true,
loading: false
},
operationalState: {
healthy: true,
backendAvailable: true,
globalReadOnly: false,
locks: [],
backgroundTasks: []
},
permissions: {
user: {
id: '',
name: '',
email: '',
roles: []
},
global: [],
entity: {
entityName: 'main',
operations: {
read: false,
create: false,
update: false,
delete: false,
export: false
}
}
},
metadata: {
version: 1,
createdAt: new Date(),
updatedAt: new Date()
}
});

      // Icon Provider уже инициализирован
      console.log('[App Initializer] Application initialized');

      resolve();
    });

};
}

8.5.2 Commands Initializer
// ===== core/initializers/commands.initializer.ts =====

import { HttpClient } from '@angular/common/http';
import { CommandService } from '../services/command/command.service';

export function commandsInitializer(
commandService: CommandService,
http: HttpClient
) {
return () => {
return new Promise<void>((resolve) => {
// Register global commands

      // Save command
      commandService.register('save', (payload, context) => {
        const url = `/api/${context.activeArea.entityId}`;
        const method = context.activeArea.recordId ? 'PUT' : 'POST';

        if (method === 'PUT') {
          return http.put(`${url}/${context.activeArea.recordId}`, payload);
        }
        return http.post(url, payload);
      });

      // Delete command
      commandService.register('delete', (payload: { id: string }, context) => {
        const url = `/api/${context.activeArea.entityId}/${payload.id}`;
        return http.delete(url);
      });

      // Refresh command
      commandService.register('refresh', (payload, context) => {
        const url = `/api/${context.activeArea.entityId}`;
        return http.get(url);
      });

      // Export command
      commandService.register('export', (payload: { format: string }, context) => {
        const url = `/api/${context.activeArea.entityId}/export`;
        return http.post(url, payload, {
          responseType: 'blob'
        });
      });

      console.log('[Commands Initializer] Commands registered');

      resolve();
    });

};
}

Продолжить с 8.6 Environment Configuration?
ЧАСТЬ 8: ANGULAR IMPLEMENTATION (продолжение)
8.6 Environment Configuration
8.6.1 Environment Files
// ===== environments/environment.ts (Development) =====

export const environment = {
production: false,

// API Configuration
api: {
baseUrl: 'http://localhost:3000/api',
timeout: 30000, // 30 seconds
retryAttempts: 3,
retryDelay: 1000 // 1 second
},

// Authentication
auth: {
tokenKey: 'auth_token',
refreshTokenKey: 'refresh_token',
tokenExpiry: 3600, // 1 hour in seconds
autoRefresh: true
},

// Feature Flags
features: {
enableDarkMode: true,
enableDebugMode: true,
enableErrorReporting: false,
enableAnalytics: false,
enableWebSockets: false,
enableOfflineMode: false
},

// Logging
logging: {
level: 'debug', // 'error' | 'warn' | 'info' | 'debug'
enableConsole: true,
enableRemote: false,
remoteUrl: ''
},

// Error Handling
errorHandling: {
showDetailedErrors: true,
reportToServer: false,
serverErrorUrl: ''
},

// UI Configuration
ui: {
defaultPageSize: 20,
pageSizeOptions: [10, 20, 50, 100],
toastDuration: 5000,
modalWidth: 600,
tableScrollHeight: 600
},

// Cache
cache: {
enabled: true,
ttl: 300000, // 5 minutes
maxSize: 100
},

// External Services
external: {
googleMapsApiKey: '',
sentryDsn: '',
mixpanelToken: ''
}
};

// ===== environments/environment.prod.ts (Production) =====

export const environment = {
production: true,

api: {
baseUrl: 'https://api.example.com/api',
timeout: 30000,
retryAttempts: 3,
retryDelay: 2000
},

auth: {
tokenKey: 'auth_token',
refreshTokenKey: 'refresh_token',
tokenExpiry: 3600,
autoRefresh: true
},

features: {
enableDarkMode: true,
enableDebugMode: false,
enableErrorReporting: true,
enableAnalytics: true,
enableWebSockets: true,
enableOfflineMode: true
},

logging: {
level: 'error',
enableConsole: false,
enableRemote: true,
remoteUrl: 'https://logging.example.com/api/logs'
},

errorHandling: {
showDetailedErrors: false,
reportToServer: true,
serverErrorUrl: 'https://errors.example.com/api/report'
},

ui: {
defaultPageSize: 20,
pageSizeOptions: [10, 20, 50, 100],
toastDuration: 5000,
modalWidth: 600,
tableScrollHeight: 600
},

cache: {
enabled: true,
ttl: 600000, // 10 minutes
maxSize: 200
},

external: {
googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
sentryDsn: 'YOUR_SENTRY_DSN',
mixpanelToken: 'YOUR_MIXPANEL_TOKEN'
}
};

// ===== environments/environment.interface.ts =====

export interface Environment {
production: boolean;

api: {
baseUrl: string;
timeout: number;
retryAttempts: number;
retryDelay: number;
};

auth: {
tokenKey: string;
refreshTokenKey: string;
tokenExpiry: number;
autoRefresh: boolean;
};

features: {
enableDarkMode: boolean;
enableDebugMode: boolean;
enableErrorReporting: boolean;
enableAnalytics: boolean;
enableWebSockets: boolean;
enableOfflineMode: boolean;
};

logging: {
level: 'error' | 'warn' | 'info' | 'debug';
enableConsole: boolean;
enableRemote: boolean;
remoteUrl: string;
};

errorHandling: {
showDetailedErrors: boolean;
reportToServer: boolean;
serverErrorUrl: string;
};

ui: {
defaultPageSize: number;
pageSizeOptions: number[];
toastDuration: number;
modalWidth: number;
tableScrollHeight: number;
};

cache: {
enabled: boolean;
ttl: number;
maxSize: number;
};

external: {
googleMapsApiKey: string;
sentryDsn: string;
mixpanelToken: string;
};
}

8.6.2 Config Service
// ===== core/services/config/config.service.ts =====

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

@Injectable({
providedIn: 'root'
})
export class ConfigService {
private readonly config: Environment = environment;

/\*\*

- Получить всю конфигурацию
  \*/
  getConfig(): Environment {
  return this.config;
  }

/\*\*

- Проверка production режима
  \*/
  isProduction(): boolean {
  return this.config.production;
  }

/\*\*

- API Configuration
  \*/
  getApiBaseUrl(): string {
  return this.config.api.baseUrl;
  }

getApiTimeout(): number {
return this.config.api.timeout;
}

/\*\*

- Feature Flags
  \*/
  isFeatureEnabled(feature: keyof Environment['features']): boolean {
  return this.config.features[feature];
  }

/\*\*

- Logging Configuration
  \*/
  getLogLevel(): string {
  return this.config.logging.level;
  }

shouldLogToConsole(): boolean {
return this.config.logging.enableConsole;
}

/\*\*

- UI Configuration
  \*/
  getDefaultPageSize(): number {
  return this.config.ui.defaultPageSize;
  }

getPageSizeOptions(): number[] {
return this.config.ui.pageSizeOptions;
}

/\*\*

- Auth Configuration
  \*/
  getTokenKey(): string {
  return this.config.auth.tokenKey;
  }

getRefreshTokenKey(): string {
return this.config.auth.refreshTokenKey;
}

/\*\*

- Cache Configuration
  \*/
  isCacheEnabled(): boolean {
  return this.config.cache.enabled;
  }

getCacheTtl(): number {
return this.config.cache.ttl;
}
}

8.7 Base Services (Abstract Classes)
8.7.1 Base HTTP Service
// ===== shared/services/base-http.service.ts =====

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { ConfigService } from '../../core/services/config/config.service';

export interface HttpOptions {
headers?: HttpHeaders | { [header: string]: string | string[] };
params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
reportProgress?: boolean;
responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
withCredentials?: boolean;
skipLoading?: boolean;
}

export interface PaginatedResponse<T> {
data: T[];
total: number;
page: number;
pageSize: number;
totalPages: number;
}

@Injectable()
export abstract class BaseHttpService {
protected readonly http = inject(HttpClient);
protected readonly config = inject(ConfigService);

protected readonly baseUrl = this.config.getApiBaseUrl();

/\*\*

- GET request
  \*/
  protected get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
  const url = this.buildUrl(endpoint);
  const httpOptions = this.buildHttpOptions(options);


    return this.http.get<T>(url, httpOptions).pipe(
      timeout(this.config.getApiTimeout()),
      retry(this.config.getConfig().api.retryAttempts),
      catchError(this.handleError)
    );

}

/\*\*

- POST request
  \*/
  protected post<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
  const url = this.buildUrl(endpoint);
  const httpOptions = this.buildHttpOptions(options);


    return this.http.post<T>(url, body, httpOptions).pipe(
      timeout(this.config.getApiTimeout()),
      catchError(this.handleError)
    );

}

/\*\*

- PUT request
  \*/
  protected put<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
  const url = this.buildUrl(endpoint);
  const httpOptions = this.buildHttpOptions(options);


    return this.http.put<T>(url, body, httpOptions).pipe(
      timeout(this.config.getApiTimeout()),
      catchError(this.handleError)
    );

}

/\*\*

- PATCH request
  \*/
  protected patch<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
  const url = this.buildUrl(endpoint);
  const httpOptions = this.buildHttpOptions(options);


    return this.http.patch<T>(url, body, httpOptions).pipe(
      timeout(this.config.getApiTimeout()),
      catchError(this.handleError)
    );

}

/\*\*

- DELETE request
  \*/
  protected delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
  const url = this.buildUrl(endpoint);
  const httpOptions = this.buildHttpOptions(options);


    return this.http.delete<T>(url, httpOptions).pipe(
      timeout(this.config.getApiTimeout()),
      catchError(this.handleError)
    );

}

/\*\*

- Build full URL
  \*/
  protected buildUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${this.baseUrl}/${cleanEndpoint}`;
  }

/\*\*

- Build HTTP options
  \*/
  protected buildHttpOptions(options?: HttpOptions): any {
  const httpOptions: any = { ...options };


    // Add skip loading header if needed
    if (options?.skipLoading) {
      httpOptions.headers = {
        ...httpOptions.headers,
        'X-Skip-Loading': 'true'
      };
    }

    return httpOptions;

}

/\*\*

- Build query params for pagination
  \*/
  protected buildPaginationParams(page: number, pageSize: number, additionalParams?: any): HttpParams {
  let params = new HttpParams()
  .set('page', page.toString())
  .set('pageSize', pageSize.toString());


    if (additionalParams) {
      Object.keys(additionalParams).forEach(key => {
        const value = additionalParams[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return params;

}

/\*\*

- Error handler
  \*/
  protected handleError(error: any): Observable<never> {
  // Error будет обработан HttpErrorInterceptor
  return throwError(() => error);
  }
  }

8.7.2 Base CRUD Service
// ===== shared/services/base-crud.service.ts =====

import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from './base-http.service';

export interface FilterParams {
search?: string;
sortBy?: string;
sortOrder?: 'asc' | 'desc';
[key: string]: any;
}

export abstract class BaseCrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>> extends BaseHttpService {

/\*\*

- Abstract property для endpoint
  \*/
  protected abstract readonly endpoint: string;

/\*\*

- Получить список с пагинацией
  \*/
  getList(
  page: number = 1,
  pageSize: number = this.config.getDefaultPageSize(),
  filters?: FilterParams
  ): Observable<PaginatedResponse<T>> {
  const params = this.buildPaginationParams(page, pageSize, filters);
  return this.get<PaginatedResponse<T>>(this.endpoint, { params });
  }

/\*\*

- Получить все записи без пагинации
  \*/
  getAll(filters?: FilterParams): Observable<T[]> {
  const params = filters ? new HttpParams({ fromObject: filters as any }) : undefined;
  return this.get<T[]>(`${this.endpoint}/all`, { params });
  }

/\*\*

- Получить запись по ID
  \*/
  getById(id: string | number): Observable<T> {
  return this.get<T>(`${this.endpoint}/${id}`);
  }

/\*\*

- Создать запись
  \*/
  create(data: TCreate): Observable<T> {
  return this.post<T>(this.endpoint, data);
  }

/\*\*

- Обновить запись
  \*/
  update(id: string | number, data: TUpdate): Observable<T> {
  return this.put<T>(`${this.endpoint}/${id}`, data);
  }

/\*\*

- Частичное обновление
  \*/
  patch(id: string | number, data: Partial<TUpdate>): Observable<T> {
  return this.patch<T>(`${this.endpoint}/${id}`, data);
  }

/\*\*

- Удалить запись
  \*/
  deleteById(id: string | number): Observable<void> {
  return this.delete<void>(`${this.endpoint}/${id}`);
  }

/\*\*

- Массовое удаление
  \*/
  deleteBulk(ids: (string | number)[]): Observable<void> {
  return this.post<void>(`${this.endpoint}/bulk-delete`, { ids });
  }

/\*\*

- Экспорт данных
  \*/
  export(format: 'csv' | 'xlsx' | 'pdf', filters?: FilterParams): Observable<Blob> {
  const params = filters ? new HttpParams({ fromObject: filters as any }) : undefined;
  return this.get<Blob>(`${this.endpoint}/export/${format}`, {
  params,
  responseType: 'blob' as any
  });
  }

/\*\*

- Импорт данных
  \*/
  import(file: File): Observable<{ success: number; failed: number; errors: any[] }> {
  const formData = new FormData();
  formData.append('file', file);


    return this.post<{ success: number; failed: number; errors: any[] }>(
      `${this.endpoint}/import`,
      formData
    );

}
}

8.7.3 Example: User Service
// ===== features/users/services/user.service.ts =====

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud.service';
import { User, UserCreate, UserUpdate } from '../models/user.model';

@Injectable({
providedIn: 'root'
})
export class UserService extends BaseCrudService<User, UserCreate, UserUpdate> {
protected readonly endpoint = 'users';

/\*\*

- Получить пользователей по роли
  \*/
  getUsersByRole(role: string): Observable<User[]> {
  return this.get<User[]>(`${this.endpoint}/by-role/${role}`);
  }

/\*\*

- Изменить пароль
  \*/
  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
  return this.post<void>(`${this.endpoint}/${userId}/change-password`, {
  oldPassword,
  newPassword
  });
  }

/\*\*

- Сброс пароля (admin)
  \*/
  resetPassword(userId: string): Observable<{ temporaryPassword: string }> {
  return this.post<{ temporaryPassword: string }>(
  `${this.endpoint}/${userId}/reset-password`,
  {}
  );
  }

/\*\*

- Активировать/деактивировать пользователя
  \*/
  toggleActive(userId: string, active: boolean): Observable<User> {
  return this.patch<User>(`${this.endpoint}/${userId}`, { active });
  }

/\*\*

- Назначить роли
  \*/
  assignRoles(userId: string, roleIds: string[]): Observable<User> {
  return this.post<User>(`${this.endpoint}/${userId}/roles`, { roleIds });
  }
  }

8.8 Models & Interfaces
8.8.1 Base Models
// ===== shared/models/base.model.ts =====

/\*\*

- Базовая модель для всех сущностей
  \*/
  export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  }

/\*\*

- Аудит информация
  \*/
  export interface Auditable {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  }

/\*\*

- Soft Delete
  \*/
  export interface SoftDeletable {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
  }

/\*\*

- Версионирование
  \*/
  export interface Versionable {
  version: number;
  }

/\*\*

- Метаданные
  \*/
  export interface WithMetadata {
  metadata?: Record<string, any>;
  }

8.8.2 Feature Models Example
// ===== features/users/models/user.model.ts =====

import { BaseEntity, Auditable, SoftDeletable } from '../../../shared/models/base.model';

/\*\*

- User entity
  \*/
  export interface User extends BaseEntity, Auditable, SoftDeletable {
  email: string;
  name: string;
  avatarUrl?: string;
  roles: string[];
  active: boolean;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  department?: string;
  position?: string;
  bio?: string;
  }

/\*\*

- User creation DTO
  \*/
  export interface UserCreate {
  email: string;
  name: string;
  password: string;
  roles: string[];
  active?: boolean;
  phoneNumber?: string;
  department?: string;
  position?: string;
  }

/\*\*

- User update DTO
  \*/
  export interface UserUpdate {
  name?: string;
  roles?: string[];
  active?: boolean;
  phoneNumber?: string;
  department?: string;
  position?: string;
  bio?: string;
  avatarUrl?: string;
  }

/\*\*

- User filter params
  \*/
  export interface UserFilterParams {
  search?: string;
  role?: string;
  active?: boolean;
  department?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
  }

/\*\*

- User statistics
  \*/
  export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  }

8.9 State Management (без NgRx - Signals approach)
8.9.1 Feature State Service
// ===== features/users/services/user-state.service.ts =====

import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { User, UserFilterParams } from '../models/user.model';
import { UserService } from './user.service';

interface UserState {
users: User[];
selectedUser: User | null;
loading: boolean;
filters: UserFilterParams;
pagination: {
page: number;
pageSize: number;
total: number;
};
}

const initialState: UserState = {
users: [],
selectedUser: null,
loading: false,
filters: {},
pagination: {
page: 1,
pageSize: 20,
total: 0
}
};

@Injectable()
export class UserStateService {
private readonly userService = inject(UserService);

// State
private readonly state = signal<UserState>(initialState);

// Selectors (computed signals)
users = computed(() => this.state().users);
selectedUser = computed(() => this.state().selectedUser);
loading = computed(() => this.state().loading);
filters = computed(() => this.state().filters);
pagination = computed(() => this.state().pagination);

// Derived state
totalUsers = computed(() => this.state().pagination.total);
hasUsers = computed(() => this.state().users.length > 0);
activeUsers = computed(() =>
this.state().users.filter(u => u.active)
);

/\*\*

- Load users
  \*/
  loadUsers() {
  this.updateState({ loading: true });


    const { page, pageSize } = this.state().pagination;
    const filters = this.state().filters;

    this.userService.getList(page, pageSize, filters).subscribe({
      next: (response) => {
        this.updateState({
          users: response.data,
          loading: false,
          pagination: {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          }
        });
      },
      error: () => {
        this.updateState({ loading: false });
      }
    });

}

/\*\*

- Set filters
  \*/
  setFilters(filters: UserFilterParams) {
  this.updateState({
  filters,
  pagination: { ...this.state().pagination, page: 1 }
  });
  this.loadUsers();
  }

/\*\*

- Set page
  \*/
  setPage(page: number) {
  this.updateState({
  pagination: { ...this.state().pagination, page }
  });
  this.loadUsers();
  }

/\*\*

- Set page size
  \*/
  setPageSize(pageSize: number) {
  this.updateState({
  pagination: { ...this.state().pagination, pageSize, page: 1 }
  });
  this.loadUsers();
  }

/\*\*

- Select user
  \*/
  selectUser(user: User | null) {
  this.updateState({ selectedUser: user });
  }

/\*\*

- Add user
  \*/
  addUser(user: User) {
  this.updateState({
  users: [...this.state().users, user],
  pagination: {
  ...this.state().pagination,
  total: this.state().pagination.total + 1
  }
  });
  }

/\*\*

- Update user
  \*/
  updateUser(user: User) {
  this.updateState({
  users: this.state().users.map(u => u.id === user.id ? user : u),
  selectedUser: this.state().selectedUser?.id === user.id ? user : this.state().selectedUser
  });
  }

/\*\*

- Remove user
  \*/
  removeUser(userId: string) {
  this.updateState({
  users: this.state().users.filter(u => u.id !== userId),
  selectedUser: this.state().selectedUser?.id === userId ? null : this.state().selectedUser,
  pagination: {
  ...this.state().pagination,
  total: this.state().pagination.total - 1
  }
  });
  }

/\*\*

- Reset state
  \*/
  reset() {
  this.state.set(initialState);
  }

/\*\*

- Update state
  \*/
  private updateState(partial: Partial<UserState>) {
  this.state.update(state => ({ ...state, ...partial }));
  }
  }

8.9.2 Using State Service in Component
// ===== features/users/pages/users-list/users-list.component.ts =====

@Component({
selector: 'app-users-list',
standalone: true,
imports: [
CommonModule,
PageShellComponent,
TableComponent,
PaginationComponent,
ButtonComponent
],
providers: [UserStateService], // Scoped to component
template: `
<app-page-shell [config]="pageConfig()">
<!-- Search/Filters -->
<div search-filters>
<input
type="text"
placeholder="Поиск..."
#searchInput
(input)="onSearch(searchInput.value)"
/>
</div>

      <!-- Loading State -->
      @if (userState.loading()) {
        <app-skeleton [rows]="5" [active]="true"></app-skeleton>
      } @else if (!userState.hasUsers()) {
        <!-- Empty State -->
        <app-empty-state
          title="Пользователи не найдены"
          description="Измените параметры поиска"
          [actions]="emptyActions()"
        ></app-empty-state>
      } @else {
        <!-- Table -->
        <app-table [config]="tableConfig()"></app-table>
      }

      <!-- Pagination -->
      <div page-footer class="page-footer-content">
        <app-pagination [config]="paginationConfig()"></app-pagination>

        <app-button
          type="primary"
          icon="icon-plus"
          (click)="createUser()"
        >
          Создать пользователя
        </app-button>
      </div>
    </app-page-shell>

`
})
export class UsersListComponent implements OnInit {
protected readonly userState = inject(UserStateService);
private readonly router = inject(Router);

pageConfig = computed<PageConfig>(() => ({
header: {
title: 'Пользователи',
subtitle: `Всего: ${this.userState.totalUsers()}`
},
contentType: 'table',
showFormStatusBar: false,
showSearchFilters: true,
showFooter: true
}));

tableConfig = computed<TableConfig<User>>(() => ({
data: this.userState.users(),
loading: this.userState.loading(),
columns: [
{ key: 'name', title: 'Имя', sortable: true },
{ key: 'email', title: 'Email', sortable: true },
{ key: 'roles', title: 'Роли', sortable: false },
{ key: 'active', title: 'Статус', sortable: true }
],
onRowClick: (user) => this.viewUser(user)
}));

paginationConfig = computed<PaginationConfig>(() => ({
total: this.userState.pagination().total,
pageSize: this.userState.pagination().pageSize,
currentPage: this.userState.pagination().page,
onPageChange: (page) => this.userState.setPage(page),
onPageSizeChange: (size) => this.userState.setPageSize(size)
}));

ngOnInit() {
this.userState.loadUsers();
}

onSearch(search: string) {
this.userState.setFilters({ search });
}

createUser() {
this.router.navigate(['/admin/users/create']);
}

viewUser(user: User) {
this.router.navigate(['/admin/users', user.id]);
}
}

Продолжить с ЧАСТЬ 9: TESTING STRATEGY?
