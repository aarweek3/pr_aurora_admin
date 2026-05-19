# 📋 Техническое Задание: Modal Component

**Проект:** Aurora Admin
**Дата создания:** 19 декабря 2024 г.
**Последнее обновление:** 19 декабря 2024 г.
**Версия:** 2.0
**Статус:** Утверждено к разработке

---

## История изменений

| Версия | Дата       | Автор          | Изменения                                                                                                                                                                                             |
| ------ | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0    | 19.12.2024 | GitHub Copilot | Первоначальная версия ТЗ                                                                                                                                                                              |
| 2.0    | 19.12.2024 | GitHub Copilot | Добавлены разделы: Injection Tokens (MODAL_DATA, MODAL_REF), beforeClose hook детали, Mobile адаптация, Директива [avModalClose], Generic типизация, Stack управление для ESC, Loading state в footer |

---

## 1. Общее описание

Универсальный компонент модального окна для Aurora Admin с поддержкой различных типов, размеров и конфигураций. Компонент должен обеспечивать современный UX, accessibility и темную тему из коробки.

---

## 2. Функциональные требования

### 2.1. Базовый функционал

- ✅ Открытие/закрытие модального окна
- ✅ Backdrop (затемнение фона) с возможностью отключения
- ✅ Закрытие по клику на backdrop (опционально)
- ✅ Закрытие по клавише ESC (опционально)
- ✅ Блокировка прокрутки body при открытии
- ✅ Плавная анимация появления/исчезновения
- ✅ Z-index управление для вложенных модалов
- ✅ Возврат результата при закрытии

### 2.2. Типы модальных окон

| Тип         | Описание               | Использование                 |
| ----------- | ---------------------- | ----------------------------- |
| **Default** | Обычное модальное окно | Формы, просмотр данных        |
| **Confirm** | Подтверждение действия | Удаление, критичные операции  |
| **Alert**   | Уведомление            | Успех, ошибки, предупреждения |
| **Custom**  | Полностью кастомное    | Специфичный контент           |

### 2.3. Размеры

```typescript
export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
```

| Размер         | Ширина | Применение                       |
| -------------- | ------ | -------------------------------- |
| **small**      | 400px  | Короткие сообщения, simple forms |
| **medium**     | 600px  | По умолчанию, стандартные формы  |
| **large**      | 800px  | Сложные формы, таблицы           |
| **xlarge**     | 1000px | Очень сложный контент            |
| **fullscreen** | 100vw  | Полноэкранный режим              |

### 2.4. Позиционирование

```typescript
export type ModalPosition = 'center' | 'top' | 'bottom';
```

- **center** - по центру экрана (по умолчанию)
- **top** - сверху с отступом 80px
- **bottom** - снизу (mobile-friendly)

---

## 3. Архитектура

### 3.1. Технологический стек

**Обязательно использовать:**

- ✅ **Angular CDK Overlay** - для правильного управления z-index и позиционирования
- ✅ **CDK A11y (FocusTrap)** - для accessibility
- ✅ **RxJS** - для асинхронной работы с результатами

**Преимущества CDK:**

- Проверенное решение с автоматическим z-index
- Встроенный focus trap
- Поддержка вложенных overlay из коробки
- Меньше кода на поддержку

### 3.2. Структура компонента

```
┌─────────────────────────────────────────┐
│ ◄─ Close Button (X)                     │
│ Header (опционально)                     │
│ ├─ Title                                 │
│ └─ Subtitle (optional)                   │
├─────────────────────────────────────────┤
│                                          │
│ Body (контент)                           │
│ - Прокручиваемая область                 │
│ - Может содержать формы, текст, etc.     │
│                                          │
├─────────────────────────────────────────┤
│ Footer (опционально)                     │
│ ├─ Left actions (кнопки)                 │
│ ├─ Right actions (основные кнопки)       │
│ └─ Loading state                         │
└─────────────────────────────────────────┘
```

---

## 4. API Компонента

### 4.1. Modal Component

#### Inputs

```typescript
@Input() isOpen: boolean = false;                    // Открыт/закрыт
@Input() title?: string;                             // Заголовок
@Input() subtitle?: string;                          // Подзаголовок
@Input() size: ModalSize = 'medium';                // Размер
@Input() position: ModalPosition = 'center';        // Позиция
@Input() closeOnBackdrop: boolean = true;           // Закрывать по клику на backdrop
@Input() closeOnEsc: boolean = true;                // Закрывать по ESC
@Input() showCloseButton: boolean = true;           // Показывать кнопку закрытия (X)
@Input() showBackdrop: boolean = true;              // Показывать backdrop
@Input() customClass?: string;                      // Дополнительные CSS классы
@Input() loading?: boolean;                         // Состояние загрузки
@Input() disableFooterWhileLoading = true;          // Disable кнопок footer при loading
@Input() beforeClose?: () => boolean | Promise<boolean>; // Проверка перед закрытием (return false для отмены закрытия)
@Input() mobileFullscreen: boolean = false;             // Полноэкранный режим на мобильных (<768px)
```

**Поведение `beforeClose`:**

- Вызывается перед любым закрытием модала (ESC, backdrop, кнопка X, programmatic close)
- Если возвращает `false` или `Promise<false>` - закрытие отменяется
- Если возвращает `true` или `Promise<true>` - модал закрывается
- Полезно для валидации несохраненных изменений

**Пример:**

```typescript
beforeClose = async () => {
  if (this.form.dirty) {
    const confirmed = await this.confirmUnsavedChanges();
    return confirmed;
  }
  return true;
};
```

#### Outputs

```typescript
@Output() isOpenChange = new EventEmitter<boolean>();     // Two-way binding
@Output() modalClosed = new EventEmitter<any>();               // Событие закрытия с результатом
@Output() opened = new EventEmitter<void>();              // Событие открытия
@Output() backdropClick = new EventEmitter<void>();       // Клик на backdrop
```

#### Content Projection

```html
<av-modal [(isOpen)]="showModal" title="Заголовок">
  <!-- Кастомный header (опционально) -->
  <ng-container modal-header>
    <div class="custom-header">...</div>
  </ng-container>

  <!-- Контент (обязательно) -->
  <ng-container modal-body>
    <p>Содержимое модального окна</p>
  </ng-container>

  <!-- Кастомный footer (опционально) -->
  <ng-container modal-footer>
    <button av-button (click)="save()">Сохранить</button>
    <button av-button avType="default" (click)="close()">Отмена</button>
  </ng-container>
</av-modal>
```

---

## 5. Modal Service

### 5.1. API Service

```typescript
@Injectable({ providedIn: 'root' })
export class ModalService {
  /**
   * Открыть компонент в модальном окне
   */
  open<T, R = any>(component: ComponentType<T>, config?: ModalConfig): ModalRef<R>;

  /**
   * Confirm dialog с Promise API
   */
  confirm(config: ConfirmConfig): Promise<boolean>;

  /**
   * Alert dialog
   */
  alert(message: string, title?: string): ModalRef<void>;

  /**
   * Success notification
   */
  success(message: string, title?: string): ModalRef<void>;

  /**
   * Error notification
   */
  error(message: string, title?: string): ModalRef<void>;

  /**
   * Warning notification
   */
  warning(message: string, title?: string): ModalRef<void>;

  /**
   * Закрыть все открытые модалы
   */
  closeAll(): void;
}
```

### 5.2. ModalRef

```typescript
export class ModalRef<T = any> {
  /**
   * Закрыть модал с результатом
   */
  close(result?: T): void;

  /**
   * Observable завершения модала
   */
  afterClosed(): Observable<T | undefined>;

  /**
   * Обновить размер модала
   */
  updateSize(size: ModalSize): void;

  /**
   * Обновить конфигурацию
   */
  updateConfig(config: Partial<ModalConfig>): void;
}
```

---

## 6. Модели данных

### 6.1. Интерфейсы

```typescript
// modal.models.ts

export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
export type ModalPosition = 'center' | 'top' | 'bottom';
export type ModalType = 'default' | 'confirm' | 'alert' | 'custom';
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface ModalConfig {
  size?: ModalSize;
  position?: ModalPosition;
  title?: string;
  subtitle?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  showBackdrop?: boolean;
  data?: any; // Данные для передачи в компонент
  panelClass?: string | string[]; // Кастомные CSS классы
  backdropClass?: string | string[]; // Классы для backdrop
  width?: string; // Кастомная ширина (напр. '500px')
  height?: string; // Кастомная высота
  maxWidth?: string; // Максимальная ширина
  maxHeight?: string; // Максимальная высота
}

export interface ConfirmConfig extends ModalConfig {
  message: string;
  confirmText?: string; // По умолчанию 'Подтвердить'
  cancelText?: string; // По умолчанию 'Отмена'
  confirmType?: 'primary' | 'danger' | 'warning';
  icon?: string; // Иконка (путь к SVG)
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface AlertConfig extends ModalConfig {
  message: string;
  type?: AlertType;
  okText?: string; // По умолчанию 'ОК'
}
```

---

## 7. Примеры использования

### 7.1. Базовое использование

```typescript
// В компоненте
export class MyComponent {
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onModalClosed(result: any) {
    console.log('Modal closed with result:', result);
  }
}
```

```html
<!-- В шаблоне -->
<button av-button (click)="openModal()">Открыть модал</button>

<av-modal
  [(isOpen)]="showModal"
  title="Создать пользователя"
  size="large"
  (closed)="onModalClosed($event)"
>
  <ng-container modal-body>
    <app-user-form></app-user-form>
  </ng-container>

  <ng-container modal-footer>
    <button av-button avType="primary" (click)="save()">Сохранить</button>
    <button av-button avType="default" (click)="closeModal()">Отмена</button>
  </ng-container>
</av-modal>
```

### 7.2. Программное открытие через Service

```typescript
export class MyComponent {
  constructor(private modal: ModalService) {}

  // Открыть компонент
  openUserForm() {
    const ref = this.modal.open(UserFormComponent, {
      size: 'large',
      title: 'Редактирование пользователя',
      data: { userId: 123 },
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        console.log('User saved:', result);
        this.refreshUserList();
      }
    });
  }

  // Confirm dialog
  async deleteUser(userId: number) {
    const confirmed = await this.modal.confirm({
      title: 'Удалить пользователя?',
      message: 'Это действие нельзя будет отменить. Все данные пользователя будут удалены.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      confirmType: 'danger',
      icon: 'actions/av_trash',
    });

    if (confirmed) {
      await this.userService.delete(userId);
      this.modal.success('Пользователь удалён');
    }
  }

  // Alert
  showSuccess() {
    this.modal.success('Данные успешно сохранены!');
  }

  // Error
  showError() {
    this.modal.error('Произошла ошибка при сохранении данных');
  }
}
```

### 7.3. Компонент внутри модала

```typescript
// user-form.component.ts
export class UserFormComponent {
  @Inject(MODAL_DATA) public data: any;

  constructor(private modalRef: ModalRef<User>, private userService: UserService) {}

  async save() {
    const user = await this.userService.save(this.form.value);
    this.modalRef.close(user); // Закрыть с результатом
  }

  cancel() {
    this.modalRef.close(); // Закрыть без результата
  }
}
```

---

## 8. Дизайн и стилизация

### 8.1. Цветовая схема

#### Light Theme

```scss
$modal-bg: #ffffff;
$modal-border: #d9d9d9;
$modal-header-bg: #fafafa;
$modal-footer-bg: #fafafa;
$modal-text: #000000d9;
$modal-text-secondary: #00000073;

$backdrop-bg: rgba(0, 0, 0, 0.45);
```

#### Dark Theme

```scss
$modal-bg-dark: #1f1f1f;
$modal-border-dark: #434343;
$modal-header-bg-dark: #141414;
$modal-footer-bg-dark: #141414;
$modal-text-dark: #ffffffd9;
$modal-text-secondary-dark: #ffffff73;

$backdrop-bg-dark: rgba(0, 0, 0, 0.65);
```

### 8.2. Отступы и размеры

```scss
// Padding
$modal-padding-horizontal: 24px;
$modal-padding-vertical: 20px;
$modal-header-padding: 16px 24px;
$modal-body-padding: 24px;
$modal-footer-padding: 16px 24px;

// Border
$modal-border-radius: 8px;
$modal-border-width: 1px;

// Header
$modal-header-height: 56px;

// Footer
$modal-footer-height: 64px;

// Close button
$close-button-size: 32px;
$close-button-icon-size: 16px;
```

### 8.3. Анимации

```scss
// Backdrop
.modal-backdrop {
  animation: backdropFadeIn 200ms ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Modal container
.modal-container {
  animation: modalSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Close animation
.modal-container.closing {
  animation: modalSlideOut 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}
```

### 8.4. Z-index

```scss
$z-backdrop: 1000;
$z-modal: 1010;
$z-nested-backdrop: 1020; // Для вложенных модалов
$z-nested-modal: 1030;
```

---

## 9. Accessibility (A11Y)

### 9.1. Обязательные атрибуты

```typescript
@HostBinding('attr.role') role = 'dialog';
@HostBinding('attr.aria-modal') ariaModal = true;
@HostBinding('attr.aria-labelledby') ariaLabelledby = this.titleId;
@HostBinding('attr.aria-describedby') ariaDescribedby = this.bodyId;
```

### 9.2. Focus Management

```typescript
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

private focusTrap: FocusTrap;
private previouslyFocusedElement: HTMLElement;

ngAfterViewInit() {
  // Сохранить текущий фокус
  this.previouslyFocusedElement = document.activeElement as HTMLElement;

  // Создать focus trap
  this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);

  // Установить фокус на первый элемент
  setTimeout(() => this.focusTrap.focusInitialElement(), 100);
}

ngOnDestroy() {
  // Удалить focus trap
  this.focusTrap?.destroy();

  // Вернуть фокус на предыдущий элемент
  this.previouslyFocusedElement?.focus();
}
```

### 9.3. Клавиатурная навигация

- **ESC** - закрытие модала (если `closeOnEsc = true`)
- **Tab** - навигация между элементами внутри модала
- **Shift + Tab** - обратная навигация
- **Enter** - активация кнопки с фокусом

---

## 10. Injection Tokens

### 10.1. MODAL_DATA

Токен для передачи данных в компонент внутри модала.

```typescript
// modal-tokens.ts
import { InjectionToken } from '@angular/core';

/**
 * Injection token для передачи данных в компонент модала
 *
 * @example
 * export class MyModalComponent {
 *   constructor(@Inject(MODAL_DATA) public data: { userId: number }) {}
 * }
 */
export const MODAL_DATA = new InjectionToken<any>('ModalData');
```

**Использование:**

```typescript
// Открытие модала с данными
const ref = this.modalService.open(UserFormComponent, {
  data: { userId: 123, mode: 'edit' },
});

// В компоненте
export class UserFormComponent {
  constructor(@Inject(MODAL_DATA) public data: { userId: number; mode: string }) {
    console.log('User ID:', this.data.userId);
    console.log('Mode:', this.data.mode);
  }
}
```

### 10.2. MODAL_REF

Токен для получения ссылки на текущий модал (для закрытия с результатом).

```typescript
/**
 * Injection token для получения ссылки на текущий ModalRef
 *
 * @example
 * export class MyModalComponent {
 *   constructor(private modalRef: ModalRef<User>) {}
 *
 *   save() {
 *     this.modalRef.close(this.user);
 *   }
 * }
 */
export const MODAL_REF = new InjectionToken<ModalRef<any>>('ModalRef');
```

**Использование:**

```typescript
export class UserFormComponent {
  constructor(private modalRef: ModalRef<User>, @Inject(MODAL_DATA) public data: any) {}

  async save() {
    const user = await this.userService.save(this.form.value);
    this.modalRef.close(user); // Закрыть с результатом
  }

  cancel() {
    this.modalRef.close(); // Закрыть без результата
  }
}
```

### 10.3. Типизированные токены

Для строгой типизации можно создавать специфичные токены:

```typescript
// Типизированный токен для конкретного компонента
export interface UserFormData {
  userId?: number;
  mode: 'create' | 'edit';
}

export const USER_FORM_DATA = new InjectionToken<UserFormData>('UserFormData');

// Использование
export class UserFormComponent {
  constructor(
    @Inject(USER_FORM_DATA) public data: UserFormData,
    private modalRef: ModalRef<User>,
  ) {}
}
```

---

## 11. beforeClose Hook - детальная логика

### 11.1. Описание

`beforeClose` - хук, который вызывается перед закрытием модала. Позволяет предотвратить закрытие или выполнить проверки.

```typescript
@Input() beforeClose?: (result?: any) => boolean | Promise<boolean>;
```

### 11.2. Поведение

**Если beforeClose возвращает:**

- `true` - модал закрывается нормально
- `false` - закрытие отменяется, модал остается открытым
- `Promise<true>` - ждёт выполнения, затем закрывает
- `Promise<false>` - ждёт выполнения, затем отменяет закрытие

### 11.3. Примеры использования

#### Простая проверка

```typescript
<av-modal
  [(isOpen)]="showModal"
  [beforeClose]="checkBeforeClose"
>
  <!-- content -->
</av-modal>

// В компоненте
checkBeforeClose(): boolean {
  if (this.form.dirty) {
    return confirm('Есть несохраненные изменения. Закрыть?');
  }
  return true;
}
```

#### Асинхронная проверка

```typescript
async checkBeforeClose(): Promise<boolean> {
  if (this.form.dirty) {
    const confirmed = await this.modalService.confirm({
      title: 'Несохраненные изменения',
      message: 'Вы уверены, что хотите закрыть без сохранения?',
      confirmType: 'warning'
    });
    return confirmed;
  }
  return true;
}
```

#### С автосохранением

```typescript
async checkBeforeClose(): Promise<boolean> {
  if (this.form.dirty && this.form.valid) {
    try {
      await this.save();
      return true;
    } catch (error) {
      this.modalService.error('Ошибка сохранения');
      return false;
    }
  }
  return true;
}
```

### 11.4. Применение к разным способам закрытия

`beforeClose` вызывается при:

- Клике на кнопку закрытия (X)
- Клике на backdrop (если `closeOnBackdrop = true`)
- Нажатии ESC (если `closeOnEsc = true`)
- Вызове `modalRef.close()`

```typescript
// В компоненте модала
private async handleClose(result?: any): Promise<void> {
  // Вызываем beforeClose если есть
  if (this.beforeClose) {
    const canClose = await this.beforeClose(result);
    if (!canClose) {
      return; // Отменяем закрытие
    }
  }

  // Закрываем модал
  this.isOpen = false;
  this.closed.emit(result);
}
```

---

## 12. Mobile адаптация

### 12.1. mobileFullscreen

Автоматическое переключение в fullscreen режим на мобильных устройствах.

```typescript
@Input() mobileFullscreen: boolean = true;  // По умолчанию включено
@Input() mobileBreakpoint: number = 768;    // Ширина экрана для мобильной версии
```

**Логика:**

```typescript
get effectiveSize(): ModalSize {
  // На мобильных устройствах всегда fullscreen (если включено)
  if (this.mobileFullscreen && window.innerWidth < this.mobileBreakpoint) {
    return 'fullscreen';
  }
  return this.size;
}
```

### 12.2. Bottom Sheet для мобильных

На мобильных устройствах рекомендуется использовать `position="bottom"` для лучшего UX.

```typescript
<av-modal
  [(isOpen)]="showModal"
  [position]="isMobile ? 'bottom' : 'center'"
  [mobileFullscreen]="false"
>
  <!-- content -->
</av-modal>
```

**Стили для bottom position:**

```scss
.modal-container--bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 16px 16px 0 0;
  max-height: 90vh;
  animation: slideUpFromBottom 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUpFromBottom {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

### 12.3. Свайп для закрытия (опционально)

На мобильных можно добавить жест свайпа вниз для закрытия.

```typescript
@Input() swipeToClose: boolean = false; // Пока отключено (Phase 3)
```

### 12.4. Adaptive размеры

```scss
// Адаптивные размеры для планшетов
@media (max-width: 1024px) {
  .modal-container--large {
    width: 90vw;
  }
  .modal-container--xlarge {
    width: 95vw;
  }
}

// Мобильные устройства
@media (max-width: 768px) {
  .modal-container:not(.modal-container--fullscreen) {
    width: 95vw;
    max-width: none;
    margin: 16px;
  }

  .modal-header {
    padding: 12px 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
  }
}
```

---

## 13. Директива [avModalClose]

### 13.1. Описание

Директива для упрощения закрытия модала с передачей результата.

```typescript
// modal-close.directive.ts
@Directive({
  selector: '[avModalClose]',
  standalone: true,
})
export class ModalCloseDirective {
  @Input('avModalClose') result?: any;
  @Input() closeOnClick: boolean = true;

  constructor(private modalRef: ModalRef) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.closeOnClick) {
      event.stopPropagation();
      this.modalRef.close(this.result);
    }
  }
}
```

### 13.2. Примеры использования

#### Простое закрытие

```html
<!-- Закрыть без результата -->
<button av-button avModalClose>Отмена</button>

<!-- Равнозначно: -->
<button av-button (click)="modalRef.close()">Отмена</button>
```

#### Закрытие с результатом

```html
<!-- Закрыть с результатом 'saved' -->
<button av-button avType="primary" [avModalClose]="'saved'">Сохранить</button>

<!-- Закрыть с объектом -->
<button av-button [avModalClose]="{ action: 'delete', userId: user.id }">Удалить</button>
```

#### Условное закрытие

```html
<!-- Закрыть только если форма валидна -->
<button
  av-button
  avType="primary"
  [avModalClose]="form.valid ? formData : undefined"
  [closeOnClick]="form.valid"
>
  Сохранить
</button>
```

#### В footer шаблоне

```html
<av-modal [(isOpen)]="showModal" title="Подтверждение">
  <ng-container modal-body>
    <p>Вы уверены?</p>
  </ng-container>

  <ng-container modal-footer>
    <!-- Две кнопки с разными результатами -->
    <button av-button [avModalClose]="true" avType="primary">Да</button>
    <button av-button [avModalClose]="false">Нет</button>
  </ng-container>
</av-modal>

<!-- Обработка результата -->
<av-modal [(isOpen)]="showModal" (closed)="onClosed($event)">
  <!-- ... -->
</av-modal>

// В компоненте onClosed(result: boolean | undefined) { if (result === true) { console.log('User
confirmed'); } else if (result === false) { console.log('User declined'); } else {
console.log('Modal closed without action'); } }
```

#### С async данными

```html
<!-- Закрыть после загрузки данных -->
<button av-button [avModalClose]="userData$ | async" [disabled]="!(userData$ | async)">
  Выбрать пользователя
</button>
```

#### Disable auto-close

```html
<!-- Не закрывать автоматически, только установить результат -->
<button av-button [avModalClose]="formData" [closeOnClick]="false" (click)="handleCustomClose()">
  Custom Action
</button>
```

---

## 14. Типизация Generic для ModalService

### 14.1. Типизированный Service API

```typescript
export class ModalService {
  /**
   * Открыть компонент с типизацией данных и результата
   *
   * @template TComponent - Тип компонента
   * @template TData - Тип данных, передаваемых в модал
   * @template TResult - Тип результата при закрытии
   */
  open<TComponent, TData = any, TResult = any>(
    component: ComponentType<TComponent>,
    config?: ModalConfig<TData>,
  ): ModalRef<TResult>;
}
```

### 14.2. Типизированный ModalConfig

```typescript
export interface ModalConfig<TData = any> {
  size?: ModalSize;
  position?: ModalPosition;
  title?: string;
  subtitle?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  showBackdrop?: boolean;
  mobileFullscreen?: boolean;
  data?: TData; // Типизированные данные
  panelClass?: string | string[];
  backdropClass?: string | string[];
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  beforeClose?: (result?: any) => boolean | Promise<boolean>;
}
```

### 14.3. Примеры с типизацией

```typescript
// Определяем типы данных
interface UserFormData {
  userId?: number;
  mode: 'create' | 'edit';
}

interface UserFormResult {
  user: User;
  action: 'created' | 'updated';
}

// Открываем модал с типизацией
const ref = this.modalService.open<UserFormComponent, UserFormData, UserFormResult>(
  UserFormComponent,
  {
    data: {
      userId: 123,
      mode: 'edit',
    },
  },
);

// TypeScript знает тип результата
ref.afterClosed().subscribe((result: UserFormResult | undefined) => {
  if (result) {
    console.log('User:', result.user);
    console.log('Action:', result.action); // 'created' | 'updated'
  }
});
```

### 14.4. Типизированный Confirm

```typescript
interface ConfirmResult {
  confirmed: boolean;
  reason?: string;
}

const result = await this.modalService.confirm<ConfirmResult>({
  title: 'Удалить?',
  message: 'Точно?',
});

if (result.confirmed) {
  console.log('Deleted, reason:', result.reason);
}
```

---

## 15. Stack управление для ESC при вложенных модалах

### 15.1. Проблема

Когда открыто несколько модалов, ESC должен закрывать только верхний (последний открытый).

### 15.2. Решение

```typescript
// modal.service.ts
export class ModalService {
  private modalStack: ModalRef[] = [];
  private maxOpenModals = 5; // Максимум открытых модалов

  open<T, TData, TResult>(
    component: ComponentType<T>,
    config?: ModalConfig<TData>,
  ): ModalRef<TResult> {
    // Проверка лимита
    if (this.modalStack.length >= this.maxOpenModals) {
      console.warn(`Maximum ${this.maxOpenModals} modals reached`);
      return this.modalStack[this.modalStack.length - 1] as ModalRef<TResult>;
    }

    const ref = this.createModal(component, config);
    this.modalStack.push(ref);

    // Подписка на закрытие
    ref.afterClosed().subscribe(() => {
      this.removeFromStack(ref);
    });

    return ref;
  }

  private removeFromStack(ref: ModalRef): void {
    const index = this.modalStack.indexOf(ref);
    if (index > -1) {
      this.modalStack.splice(index, 1);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    // Закрываем только верхний модал из стека
    if (this.modalStack.length > 0) {
      const topModal = this.modalStack[this.modalStack.length - 1];
      if (topModal.config.closeOnEsc !== false) {
        topModal.close();
      }
    }
  }

  closeAll(): void {
    // Закрываем все модалы в обратном порядке
    [...this.modalStack].reverse().forEach((ref) => ref.close());
    this.modalStack = [];
  }
}
```

### 15.3. Z-index управление

```typescript
private getZIndex(stackPosition: number): number {
  const baseZIndex = 1000;
  const backdropOffset = 0;
  const modalOffset = 10;

  return {
    backdrop: baseZIndex + (stackPosition * 20) + backdropOffset,
    modal: baseZIndex + (stackPosition * 20) + modalOffset
  };
}
```

---

## 16. Loading state в footer

### 16.1. Визуализация

```html
<!-- modal-footer с loading -->
<div class="modal-footer" [class.modal-footer--loading]="loading">
  <!-- Loading overlay -->
  <div class="modal-footer__loading" *ngIf="loading">
    <div class="spinner"></div>
    <span>Сохранение...</span>
  </div>

  <!-- Кнопки -->
  <div class="modal-footer__actions">
    <button
      av-button
      avType="primary"
      [loading]="loading"
      [disabled]="disableFooterWhileLoading && loading"
    >
      Сохранить
    </button>
    <button av-button [disabled]="disableFooterWhileLoading && loading">Отмена</button>
  </div>
</div>
```

### 16.2. Стили

```scss
.modal-footer {
  position: relative;

  &--loading {
    pointer-events: none;
  }
}

.modal-footer__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 1;

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f0f0f0;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  span {
    color: $text-secondary;
    font-size: 14px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Dark theme
[data-theme='dark'] {
  .modal-footer__loading {
    background: rgba(31, 31, 31, 0.9);
  }
}
```

### 16.3. Использование

```typescript
export class MyModalComponent {
  loading = false;

  async save() {
    this.loading = true;
    try {
      const result = await this.service.save(this.data);
      this.modalRef.close(result);
    } catch (error) {
      this.errorService.handle(error);
    } finally {
      this.loading = false;
    }
  }
}
```

---

## 17. Файловая структура

```
src/app/shared/components/ui/modal/
├── components/
│   ├── modal/
│   │   ├── modal.component.ts
│   │   ├── modal.component.html
│   │   ├── modal.component.scss
│   │   └── modal.component.spec.ts
│   ├── modal-confirm/
│   │   ├── modal-confirm.component.ts
│   │   ├── modal-confirm.component.html
│   │   ├── modal-confirm.component.scss
│   │   └── modal-confirm.component.spec.ts
│   ├── modal-alert/
│   │   ├── modal-alert.component.ts
│   │   ├── modal-alert.component.html
│   │   ├── modal-alert.component.scss
│   │   └── modal-alert.component.spec.ts
│   └── modal-container/
│       ├── modal-container.component.ts      # Wrapper для динамических компонентов
│       └── modal-container.component.html
├── services/
│   ├── modal.service.ts
│   └── modal.service.spec.ts
├── models/
│   ├── modal-config.model.ts
│   ├── modal-ref.model.ts
│   └── index.ts
├── directives/
│   ├── modal-close.directive.ts              # [avModalClose]="result"
│   └── modal-close.directive.spec.ts
├── animations/
│   └── modal.animations.ts
├── tokens/
│   └── modal-tokens.ts                       # MODAL_DATA и MODAL_REF injection tokens
├── styles/
│   ├── _modal.scss                           # Основные стили
│   ├── _modal-themes.scss                    # Темы (light/dark)
│   └── _modal-animations.scss                # Анимации
├── README.md
└── index.ts
```

---

## 18. Этапы разработки (Phases)

### Phase 1: MVP (Must Have) - 2 дня

**День 1:**

- ✅ Базовый Modal компонент с CDK Overlay
- ✅ ModalService
- ✅ ModalRef
- ✅ Размеры: small, medium, large
- ✅ Backdrop с закрытием
- ✅ ESC для закрытия
- ✅ Блокировка прокрутки body
- ✅ Базовые анимации

**День 2:**

- ✅ ModalConfirm компонент
- ✅ ModalAlert компонент
- ✅ Service методы (confirm, alert, success, error)
- ✅ Темная тема
- ✅ Unit тесты

### Phase 2: Enhanced (Should Have) - 1 день

**День 3:**

- ✅ A11Y (focus trap, ARIA)
- ✅ Размеры xlarge и fullscreen
- ✅ beforeClose hook
- ✅ Loading state
- ✅ E2E тесты
- ✅ README документация
- ✅ Demo страница

### Phase 3: Advanced (Nice to Have) - По требованию

- ⏸️ Вложенные модалы (CDK поддерживает из коробки)
- ⏸️ Position: top/bottom
- ❌ Draggable (overkill, не нужно)
- ❌ Resizable (overkill, не нужно)

---

## 19. Тестирование

### 19.1. Unit тесты

```typescript
describe('ModalComponent', () => {
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close', () => {
    component.isOpen = true;
    fixture.detectChanges();
    expect(component.isOpen).toBe(true);

    component.close();
    expect(component.isOpen).toBe(false);
  });

  it('should emit closed event with result', () => {
    const result = { data: 'test' };
    component.closed.subscribe((res) => {
      expect(res).toEqual(result);
    });
    component.close(result);
  });

  it('should close on ESC', () => {
    component.isOpen = true;
    component.closeOnEsc = true;

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(component.isOpen).toBe(false);
  });

  it('should close on backdrop click', () => {
    component.isOpen = true;
    component.closeOnBackdrop = true;

    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    backdrop.nativeElement.click();

    expect(component.isOpen).toBe(false);
  });
});
```

### 19.2. Service тесты

```typescript
describe('ModalService', () => {
  it('should open modal and return ModalRef', () => {
    const ref = service.open(TestComponent);
    expect(ref).toBeDefined();
    expect(ref.afterClosed).toBeDefined();
  });

  it('should close modal with result', async () => {
    const ref = service.open(TestComponent);
    ref.close('test-result');
    const result = await firstValueFrom(ref.afterClosed());
    expect(result).toBe('test-result');
  });

  it('should handle confirm dialog', async () => {
    const confirmSpy = jasmine.createSpy('confirm');
    const confirmed = service.confirm({
      title: 'Test',
      message: 'Test message',
      onConfirm: confirmSpy,
    });

    // Simulate user clicking confirm
    // ...

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should close all modals', () => {
    service.open(TestComponent);
    service.open(TestComponent);
    expect(service.openModals.length).toBe(2);

    service.closeAll();
    expect(service.openModals.length).toBe(0);
  });
});
```

### 19.3. E2E тесты

```typescript
describe('Modal E2E', () => {
  it('should open modal on button click', () => {
    cy.visit('/modal-demo');
    cy.get('[data-test="open-modal-btn"]').click();
    cy.get('.modal-container').should('be.visible');
  });

  it('should close modal on ESC', () => {
    cy.visit('/modal-demo');
    cy.get('[data-test="open-modal-btn"]').click();
    cy.get('.modal-container').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('.modal-container').should('not.exist');
  });

  it('should trap focus inside modal', () => {
    cy.visit('/modal-demo');
    cy.get('[data-test="open-modal-btn"]').click();

    // Tab through all focusable elements
    cy.focused().tab();
    cy.focused().tab();

    // Focus should still be inside modal
    cy.focused().parents('.modal-container').should('exist');
  });
});
```

### 19.4. A11Y тесты

```typescript
it('should pass accessibility audit', async () => {
  const results = await axe.run(fixture.nativeElement);
  expect(results.violations.length).toBe(0);
});

it('should have proper ARIA attributes', () => {
  const modal = fixture.debugElement.query(By.css('.modal-container'));
  expect(modal.nativeElement.getAttribute('role')).toBe('dialog');
  expect(modal.nativeElement.getAttribute('aria-modal')).toBe('true');
  expect(modal.nativeElement.getAttribute('aria-labelledby')).toBeTruthy();
});
```

---

## 20. Критерии приёмки

### ✅ Функциональность

- [ ] Модал открывается и закрывается плавно
- [ ] Backdrop блокирует клики вне модала
- [ ] ESC закрывает модал
- [ ] Body scroll блокируется при открытии
- [ ] Возврат фокуса при закрытии работает
- [ ] ModalService.open() возвращает ModalRef
- [ ] ModalRef.afterClosed() возвращает результат
- [ ] Confirm dialog работает корректно
- [ ] Alert dialog работает корректно

### ✅ Дизайн

- [ ] Соответствие макету Figma/дизайн-системе
- [ ] Плавные анимации (300ms)
- [ ] Темная тема работает корректно
- [ ] Адаптивность на мобильных устройствах

### ✅ Accessibility

- [ ] Проходит axe-core аудит
- [ ] Focus trap работает
- [ ] ARIA атрибуты установлены
- [ ] Клавиатурная навигация работает

### ✅ Тесты

- [ ] Unit тесты покрывают 80%+ кода
- [ ] E2E тесты проходят
- [ ] A11Y тесты проходят

### ✅ Документация

- [ ] README.md создан
- [ ] API документирован
- [ ] Примеры использования добавлены
- [ ] Demo страница работает

---

## 21. Риски и ограничения

### Риски

1. **Конфликты z-index** - решено через CDK Overlay
2. **Вложенные модалы** - CDK поддерживает, но нужно тестирование
3. **Мобильная версия** - нужна адаптация для малых экранов
4. **Performance** - множество открытых модалов может влиять на производительность

### Ограничения

1. **Не поддерживается draggable** - намеренно
2. **Не поддерживается resizable** - намеренно
3. **Минимальная ширина экрана** - 320px
4. **IE11** - не поддерживается

---

## 22. Зависимости

### NPM пакеты

```json
{
  "dependencies": {
    "@angular/cdk": "^17.0.0",
    "rxjs": "^7.8.0"
  }
}
```

### Внутренние зависимости

- `ButtonDirective` - для кнопок в footer
- `IconComponent` - для иконок закрытия и alert

---

## 23. Контрольные точки

| Дата   | Milestone               | Статус |
| ------ | ----------------------- | ------ |
| День 1 | Базовый Modal + Service | 🔲     |
| День 2 | Confirm + Alert + Темы  | 🔲     |
| День 3 | A11Y + Тесты + Docs     | 🔲     |
| День 4 | Code Review + Fixes     | 🔲     |
| День 5 | Release                 | 🔲     |

---

## 24. Вопросы для согласования

1. ✅ **Использовать Angular CDK Overlay?** - Да, обязательно
2. ✅ **Делать Draggable/Resizable?** - Нет, overkill
3. ✅ **Вложенные модалы?** - Базовая поддержка через CDK, по требованию
4. ✅ **Анимации?** - Scale + Fade (как у Ant Design)
5. ✅ **Начинать с какой фазы?** - Phase 1 + Service сразу

---

**Утверждено к разработке:** ✅
**Ответственный разработчик:** _[Имя]_
**Дата начала:** 19 декабря 2025 г.
**Ожидаемая дата завершения:** 23 декабря 2025 г.
