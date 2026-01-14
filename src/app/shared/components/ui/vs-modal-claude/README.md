# VS Modal Claude - VS Code Style Modal Engine

Независимый движок модальных окон в стиле Visual Studio Code на базе Angular CDK Overlay.

## Особенности

- ✅ **CDK Overlay** - рендеринг вне основного DOM-дерева
- ✅ **Типобезопасность** - полная типизация для `data` и `result`
- ✅ **VS Code стиль** - аутентичный дизайн в стиле Visual Studio Code
- ✅ **Draggable** - перетаскивание за заголовок (CdkDrag)
- ✅ **Resizable** - изменение размера за правый нижний угол
- ✅ **Keyboard** - закрытие по Escape
- ✅ **Backdrop** - настраиваемое затемнение фона
- ✅ **Standalone** - работает независимо от других модальных систем

## Структура

```
vs-modal-claude/
├── components/
│   └── vs-modal-container/          # Визуальная оболочка
├── models/
│   ├── vs-modal-config.model.ts     # Конфигурация
│   ├── vs-modal-ref.model.ts        # Controller окна
│   └── vs-modal-data.token.ts       # Injection tokens
├── services/
│   └── vs-modal.service.ts          # Orchestrator
└── index.ts                          # Public API
```

## Использование

### 1. Базовый пример

```typescript
import { VSModalService } from '@shared/components/ui/vs-modal-claude';

export class MyComponent {
  private vsModal = inject(VSModalService);

  openModal(): void {
    const modalRef = this.vsModal.open(MyModalContentComponent, {
      title: 'Image Settings',
      width: 800,
      height: 600,
      data: { id: 1 },
      statusText: 'Ready',
    });

    modalRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Result:', result);
      }
    });
  }
}
```

### 2. Типизированный результат

```typescript
interface MyData {
  id: number;
  name: string;
}

interface MyResult {
  action: 'save' | 'cancel';
  data?: any;
}

const modalRef = this.vsModal.open<MyComponent, MyData, MyResult>(
  MyModalContentComponent,
  {
    title: 'Edit Item',
    data: { id: 1, name: 'Test' },
  }
);

modalRef.afterClosed().subscribe((result: MyResult | undefined) => {
  if (result?.action === 'save') {
    // TypeScript знает тип result!
  }
});
```

### 3. Компонент контента

```typescript
import { VSModalRef, VS_MODAL_DATA } from '@shared/components/ui/vs-modal-claude';

@Component({
  selector: 'my-modal-content',
  template: `
    <div class="content">
      <p>{{ data.message }}</p>
      <button (click)="save()">Save</button>
      <button (click)="cancel()">Cancel</button>
    </div>
  `,
})
export class MyModalContentComponent {
  modalRef = inject(VSModalRef);
  data = inject(VS_MODAL_DATA);

  save(): void {
    this.modalRef.close({ action: 'save', data: this.formData });
  }

  cancel(): void {
    this.modalRef.close({ action: 'cancel' });
  }
}
```

## API

### VSModalConfig

| Свойство | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `title` | `string` | **обязательно** | Заголовок окна |
| `data` | `TData` | `undefined` | Данные для компонента |
| `width` | `string \| number` | `800` | Ширина окна |
| `height` | `string \| number` | `600` | Высота окна |
| `hasBackdrop` | `boolean` | `true` | Показывать backdrop |
| `draggable` | `boolean` | `true` | Можно ли перетаскивать |
| `resizable` | `boolean` | `true` | Можно ли изменять размер |
| `closeOnEscape` | `boolean` | `true` | Закрывать по Escape |
| `statusText` | `string` | `'Ready'` | Текст в footer |

### VSModalRef

| Метод | Описание |
|-------|----------|
| `close(result?: TResult)` | Закрыть окно с результатом |
| `afterClosed(): Observable<TResult>` | Observable результата |
| `getOverlayRef(): OverlayRef` | Получить CDK OverlayRef |

### Injection Tokens

| Token | Описание |
|-------|----------|
| `VS_MODAL_DATA` | Данные, переданные в `config.data` |
| `VS_MODAL_CONFIG` | Полная конфигурация окна |
| `VSModalRef` | Референс для управления окном |

## Дизайн-система

| Токен | Значение | Назначение |
|-------|----------|-----------|
| `BG Primary` | `#1e1e1e` | Основной фон |
| `BG Header` | `#323233` | Фон заголовка |
| `BG Status` | `#007acc` | Фон status bar |
| `Border` | `#454545` | Границы |
| `Font` | `Segoe UI, 13px` | Шрифт |

## Примеры

### Модальное окно без backdrop

```typescript
this.vsModal.open(MyComponent, {
  title: 'Non-modal Window',
  hasBackdrop: false,
  statusText: 'Non-modal mode',
});
```

### Большое окно редактора

```typescript
this.vsModal.open(EditorComponent, {
  title: 'Code Editor',
  width: 1200,
  height: 800,
  statusText: 'Editing main.ts',
});
```

### Передача и получение данных

```typescript
const modalRef = this.vsModal.open(FormComponent, {
  title: 'Edit User',
  data: { userId: 123, userName: 'John' },
});

modalRef.afterClosed().subscribe((result) => {
  if (result?.saved) {
    this.reloadUsers();
  }
});
```

## Тестирование

Тестовая страница: `/tools/test-window-seamless`

Три кнопки для тестирования:
- **VS Modal Claude - Standard** (800x600)
- **VS Modal Claude - Large** (1200x800)
- **VS Modal Claude - No Backdrop** (без затемнения)

## Технические детали

- **Angular версия**: 17+
- **CDK версия**: 17+
- **Standalone**: Да
- **OnPush**: Да (VSModalContainer)
- **Signals**: Да (isResizing)

## Отличия от других решений

| Функция | VS Modal Claude | ng-zorro Modal | Custom Modal |
|---------|----------------|----------------|--------------|
| CDK Overlay | ✅ | ❌ | ❌ |
| VS Code стиль | ✅ | ❌ | ⚠️ |
| Типизация | ✅ | ⚠️ | ⚠️ |
| Corner resize | ✅ | ❌ | ⚠️ |
| Standalone | ✅ | ✅ | ⚠️ |

## Roadmap (возможные улучшения)

- [ ] Поддержка нескольких окон (z-index management)
- [ ] Минимизация окна
- [ ] Snap to edges
- [ ] Сохранение позиции/размера
- [ ] Анимации открытия/закрытия
- [ ] Темы (light/dark/custom)
- [ ] Toolbar в header
- [ ] Tabs в body
