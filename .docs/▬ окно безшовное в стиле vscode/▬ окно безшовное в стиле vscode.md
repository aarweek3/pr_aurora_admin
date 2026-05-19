# Техническое задание: VS Modal Compromise Engine

## 1. Концепция (The Compromise)

**VS Modal Compromise** — это синтез двух подходов: гибкой реактивной архитектуры и безупречного визуального исполнения. Движок предназначен для создания профессиональных интерфейсов в стиле Visual Studio Code внутри Angular-приложения.

### Ключевые архитектурные решения:

- **Декларативность:** Использование `ComponentPortal` и `cdkPortalOutlet` (Angular CDK).
- **Изоляция (DI):** 3-уровневая иерархия инжекторов для предотвращения конфликтов данных.
- **Реактивность:** Управление состоянием окна через **Signals** (Заголовок, Статус, Состояние ресайза).
- **Надежность:** Математические расчеты размеров на базе `getBoundingClientRect()`.

---

## 2. Архитектура и Инъекции (DI)

Движок использует три уровня для обеспечения полной изоляции данных:

1.  **Parent Injector:** Глобальный контекст приложения.
2.  **Container Injector:** Контекст оболочки окна (передает `VSModalRef` и `Config`).
3.  **Content Injector:** Контекст вашего компонента (передает `VS_MODAL_DATA` и актуальный `VSModalRef`).

```typescript
// Схема иерархии в VSModalService
const containerInjector = Injector.create({
  parent: this.injector,
  providers: [{ provide: VSModalRef, useValue: modalRef }],
});

const contentInjector = Injector.create({
  parent: containerInjector, // Наследуем от контейнера
  providers: [{ provide: VS_MODAL_DATA, useValue: config.data }],
});
```

---

## 3. Спецификация API

### 3.1. Конфигурация окна

```typescript
export interface VSModalConfig<TData = any> {
  title: string;
  data?: TData;
  width?: string | number;
  height?: string | number;
  minWidth?: number;
  minHeight?: number;
  draggable?: boolean; // По умолчанию: true
  resizable?: boolean; // По умолчанию: true
  hasBackdrop?: boolean;
  statusText?: string;
  closeOnEscape?: boolean;
}
```

### 3.2. Контроллер (VSModalRef)

```typescript
export class VSModalRef<TData = any, TResult = any> {
  // Реактивные сигналы UI
  readonly title = signal<string>("");
  readonly statusText = signal<string>("");
  readonly isResizing = signal<boolean>(false);

  // Методы управления
  close(result?: TResult): void;
  afterClosed(): Observable<TResult | undefined>;
  updateStatus(text: string): void;
  updateTitle(text: string): void;
}
```

---

## 4. Визуальные стандарты (VS Code Dark)

### 4.1. Header (Title Bar)

- **Иконка:** Обязательная акцентная иконка (например, `⚡` или `codicon`).
- **Typography:** Текст заголовка 12px, цвет `#969696`.
- **Controls:** Кнопки `_`, `▢`, `✕` с специфическими hover-эффектами.

### 4.2. Body (Seamless Space)

- **Scrollbars:** Тонкие темные скроллбары (`webkit-scrollbar`).
  - Track: `#1e1e1e`
  - Thumb: `#424242`
- **Padding:** Строго `0` для контента.

### 4.3. UI Интерактивы

- **Resize Handle:** Треугольный индикатор в правом нижнем углу с градиентом акцентного цвета `#007acc`.
- **Drag Ghost:** Прозрачность окна при перетаскивании (опционально).

---

## 5. План реализации (Compromise Phase)

1.  **Инфраструктура:** Создание папки `src/app/shared/components/ui/vs-modal-compromise`.
2.  **Core:** Реализация `VSModalRef` с сигналами и `VSModalService` с 3-уровневым инжектором.
3.  **Shell:** Разработка `VSModalContainerComponent` с использованием `PortalModule`.
4.  **Style:** Внедрение эталонных стилей VS Code (Scrollbars, Resize handles, Header effects).
5.  **Integration:** Создание тестовой страницы для демонстрации передачи данных в обе стороны.

---

## 6. Примеры кода

### Использование сервиса:

```typescript
const ref = this.vsModal.open<MyComponent, MyData, string>(MyComponent, {
  title: "Appearance",
  width: 600,
  data: { mode: "dark" },
});

ref.afterClosed().subscribe((res) => console.log("Result:", res));
```

### Доступ к данным внутри компонента:

```typescript
constructor(
  @Inject(VS_MODAL_DATA) public data: MyData,
  private modalRef: VSModalRef
) {
  // Можем менять статус окна прямо из логики компонента
  this.modalRef.updateStatus('Data loaded');
}
```
