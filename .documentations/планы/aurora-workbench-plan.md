# Plan: Aurora Workbench v2.0 Final

## 1. Цель

Создание универсального инструмента для визуального тестирования адаптивности всех страниц приложения — синхронизированный просмотр в нескольких вьюпортах одновременно. Работает только в dev-окружении.

---

## 2. Архитектура (двухуровневая модель)

| Компонент           | Роль                                                      | Локация                                                   |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| **Workbench Shell** | Оркестратор — управляет iframe, размерами, синхронизацией | `src/app/pages/tools/workbench/`                          |
| **Bridge Agent**    | Агент — двусторонняя связь через postMessage              | `src/app/shared/services/workbench-bridge.service.ts`     |
| **Components**      | Внутренние UI-элементы стенда                             | `src/app/pages/tools/workbench/components/`               |

Оркестратор управляет набором iframe. Агент встроен в приложение и обеспечивает двустороннюю связь через `postMessage`.
**Важно**: Сервис вынесен в `shared/services`, так как он инжектится в `AdminLayoutComponent` для управления отображением лейаута.

---

## 3. Контракт сообщений

```typescript
enum WorkbenchMessage {
  AW_READY = "AW_READY", // iframe → parent: агент загружен и готов
  AW_SCROLL = "AW_SCROLL", // двунаправленный: { y: number }
  AW_NAV = "AW_NAV", // двунаправленный: { url: string }
  AW_AUTH_LOST = "AW_AUTH_LOST", // iframe → parent: сессия истекла (навигация на /login)
}
```

---

## 4. Техническая спецификация

### 4.1. Bridge Agent (WorkbenchBridgeService)

**Сигнал встраивания:**

- `isEmbedded = signal(false)` — выставляется в `true` при успешном handshake
- Используется `AdminLayoutComponent` для скрытия Sidebar/Header: `@if (!bridge.isEmbedded())`
- `init()` вызывается в конструкторе сервиса — до рендера лейаута, чтобы не было мигания

**Условия активации:**

- `environment.development === true`
- `window.parent !== window`
- `try { window.parent.isAuroraWorkbench === true } catch { false }`

**Скролл:**

- Нативный `window.addEventListener('scroll', handler, { passive: true })`
- `throttleTime(16)` (~60fps)

**Навигация:**

- `Router.events` → фильтр `NavigationEnd` → `router.navigateByUrl()`

**Защита от петли эха:**

- Флаг `isSyncing` блокирует отправку события наружу, если действие вызвано командой от родителя

**Память:**

- `DestroyRef` + `takeUntilDestroyed()` — только в injection context (конструктор)
- Если `init()` вынесен отдельно — передавать `DestroyRef` явно

> ⚠️ `takeUntilDestroyed()` без аргументов работает только в injection context. При вызове из `ngOnInit` — бросает ошибку в рантайме.

---

### 4.2. Workbench Shell (AvWorkbenchComponent)

**Signal-стейт:**

```typescript
currentUrl = signal("/admin/dashboard");
viewMode = signal<"single" | "grid">("single");
selectedDeviceIds = signal<string[]>(["mobile", "tablet", "desktop"]);
containerWidth = signal(0); // Замеряется динамически через ResizeObserver
```

**Безопасность URL:**

```typescript
safeUrl = computed(() => sanitizer.bypassSecurityTrustResourceUrl(currentUrl()));
```

**Масштабирование (Grid):**

```typescript
// Константы
const TOOLBAR_HEIGHT = 56;
const DEVICE_GAP = 16;
const VIEWPORT_PADDING = 32;
const GRID_FIXED_HEIGHT = 700; // Фиксированная высота вьюпорта iframe в сетке

// Динамический замер контейнера (через ResizeObserver)
containerWidth = signal(0); 

availableWidth = computed(() => 
  containerWidth() - VIEWPORT_PADDING - DEVICE_GAP * (activeDevices().length - 1)
);

scaleFor = (device: DeviceConfig) => 
  Math.min(availableWidth() / activeDevices().length / device.width, 1);

// Высота обертки (wrapper) с учетом масштаба
// Сами iframe внутри имеют фиксированную высоту GRID_FIXED_HEIGHT
containerHeight = (device: DeviceConfig) => 
  Math.round(GRID_FIXED_HEIGHT * scaleFor(device));
```

**Контейнер Resize:**

```typescript
// В ngAfterViewInit инициализируем ResizeObserver на корневом контейнере воркбенча
const ro = new ResizeObserver(entries => {
  containerWidth.set(entries[0].contentRect.width);
});
ro.observe(containerRef().nativeElement);
```

**Address Bar:**

- `input` для ввода пути
- История последних 10 путей в `localStorage`
- Blacklist: запрет открытия `/tools/workbench` внутри стенда (защита от рекурсии)

**localStorage:**

- Сохранять только: `viewMode`, `selectedDeviceIds`
- Не сохранять: `currentUrl` (при возврате лучше начинать с дашборда)
- Обязательный `try-catch` при чтении/записи
- При ошибке парсинга — дефолтный набор хардкодом

**Пресеты устройств (дефолт):**

| ID      | Название  | Ширина |
| ------- | --------- | ------ |
| mobile  | iPhone 14 | 390px  |
| tablet  | iPad Mini | 768px  |
| laptop  | Laptop    | 1280px |
| desktop | Desktop   | 1440px |

---

## 5. Этапы реализации

### Этап 1 — Инфраструктура и агент

- [ ] Флаг `enableWorkbenchBridge` в Environment (только `environment.development.ts`)
- [ ] Enum `WorkbenchMessage` (AW_READY, AW_SCROLL, AW_NAV, AW_AUTH_LOST)
- [ ] `WorkbenchBridgeService` — сигнал `isEmbedded`, активация, handshake, scroll + nav sync, флаг `isSyncing`, `DestroyRef`
- [ ] `init()` вызывается в **конструкторе сервиса** (не в `AppComponent.ngOnInit`) — критично для предотвращения мигания лейаута
- [ ] `(window as any).isAuroraWorkbench = true` в Workbench Shell при инициализации

**Результат:** агент шлёт `AW_READY` — проверяется в DevTools Console вручную.

---

### Этап 2 — Core View (MVP 1)

- [ ] Роут `/tools/workbench` + `AvWorkbenchComponent` (standalone)
- [ ] Signal-стейт: `currentUrl`, `viewMode`, `selectedDeviceIds`, `windowWidth`
- [ ] Single Mode — один iframe с `safeUrl` через `computed()`
- [ ] Address Bar — `input` + валидация blacklist + история 10 путей в `localStorage`
- [ ] **Скрытие лейаута во фреймах:** `AdminLayoutComponent` инжектит `WorkbenchBridgeService`.
- [ ] Использование `@if (!bridge.isEmbedded()) { ... full layout ... } @else { ... embedded main ... }` для исключения лишних компонентов и сброса отступов.

**Результат:** рабочий стенд для одной страницы без двойного лейаута.

---

### Этап 3 — Grid Mode (MVP 2)

- [ ] Константы: `TOOLBAR_HEIGHT = 56`, `DEVICE_GAP = 16`, `VIEWPORT_PADDING = 32`
- [ ] `ResizeObserver` на корневом контейнере → обновление `containerWidth`
- [ ] `availableWidth` и `scaleFor()` — через `computed()`
- [ ] Высота контейнера масштабируется вместе с фреймом: `containerHeight = GRID_FIXED_HEIGHT * scaleFor(device)` — иначе в Grid остаются пустые зоны между строками
- [ ] CSS Grid контейнер + несколько iframe, внутренний скролл внутри фрейма (имитирует реальный экран)
- [ ] Toolbar: кнопка выбора устройств, переключатель Single / Grid
- [ ] Подписи над фреймами: `Device Name · 390px`

**Результат:** несколько устройств рядом — без синхронизации (это нормально на данном этапе).

---

### Этап 4 — Оркестрация (финальная синхронизация)

- [ ] `window.onmessage` брокер в Workbench Shell
- [ ] Broadcast `AW_SCROLL` и `AW_NAV` во все фреймы кроме источника
- [ ] Агент: обработка входящих команд с блокировкой `isSyncing` (разрыв петли эха)
- [ ] Агент: при `NavigationEnd` на `/login` — отправка `AW_AUTH_LOST` родителю
- [ ] Workbench: `authLost = signal(false)` — при получении `AW_AUTH_LOST` показывает баннер «Сессия истекла — обновите страницу»; повторные сообщения от остальных фреймов игнорируются (signal идемпотентен); жёсткий редирект не делается — пользователь сам принимает решение
- [ ] `localStorage` для `viewMode` и `selectedDeviceIds` — с `try-catch` и дефолтом

**Результат:** полностью синхронизированный стенд.

---

## 6. Дизайн и UX

- Тёмная тема оболочки — контент сайта выделяется на фоне
- Голые фреймы без визуальных корпусов устройств
- Подписи над фреймами: `Device Name · 390px`
- Фиксированная высота в Grid: `700px` (above the fold)
- Slider Mode — следующая итерация после MVP

---

## 7. Открытые вопросы (следующая итерация)

- Slider Mode — iframe с ручным `resize: horizontal`
- Snapshot Comparison — pixel-perfect наложение скриншота на живую вёрстку
- Debug Overlays — `* { outline: 1px solid red }` для поиска вылетов за границы

---

## 8. Структура папок и файлов (Project Map)

```text
src/
├── environments/
│   ├── environment.ts                # Включение enableWorkbenchBridge: true
│   └── environment.prod.ts           # Выключение флага для продакшена
│
├── app/
│   ├── shared/
│   │   └── services/
│   │       └── workbench-bridge.service.ts # Инфраструктурный Агент. 
│   │                                       # Доступен глобально, инжектится в Layout.
│   │
│   ├── pages/
│   │   └── tools/
│   │       ├── tools.routes.ts        # Регистрация роута /workbench
│   │       └── workbench/             # Основная директория фичи
│   │           ├── workbench.component.ts      # Оркестратор
│   │           ├── workbench.component.html
│   │           ├── workbench.component.scss
│   │           ├── workbench.config.ts         # Список устройств (iPhone, iPad и т.д.)
│   │           │
│   │           ├── models/
│   │           │   └── workbench.models.ts     # Интерфейсы и Enum сообщений
│   │           │
│   │           └── components/                 # Внутренние компоненты вьювера
│   │               ├── address-bar.component.ts
│   │               └── device-frame.component.ts
```

### Пояснения к путям и рекомендации по структуре:

1.  **`shared/services/`**: Место для `WorkbenchBridgeService`. Это инфраструктурный «мост». Он отделен от папки `pages`, так как инжектится в `AdminLayoutComponent` (глобальный уровень).
2.  **Инкапсуляция (Feature Folders)**: Всё, что специфично только для воркбенча, должно находиться внутри `pages/tools/workbench/`. 
    -   `components/`: Внутренние UI-детали (AddressBar, DeviceFrame), которые не нужны остальному приложению.
    -   `models/`: Контракты сообщений и интерфейсы устройств.
3.  **Конфигурация**: Список устройств выносится в `workbench.config.ts`. Это позволяет легко добавлять новые пресеты без правки логики основного компонента.
4.  **Standalone**: Все компоненты воркбенча создаются как `standalone: true`, что соответствует современному стандарту проекта.
