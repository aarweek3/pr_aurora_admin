export const IMPORT_DOC = `import { ModalService } from 'src/app/shared/components/ui/modal';
import { ModalComponent } from 'src/app/shared/components/ui/modal/components/modal/modal.component'; // Declaration only`;

export const SETUP_DOC = `constructor(private modalService: ModalService) {}

// Простой диалог (Alert)
showAlert() {
  this.modalService.alert({
    title: 'Уведомление',
    message: 'Операция выполнена успешно',
    alertType: 'success'
  });
}

// Диалог подтверждения (Confirm)
async deleteItem() {
  const confirmed = await this.modalService.confirm({
    title: 'Удалить запись?',
    message: 'Это действие необратимо.',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    confirmType: 'danger'
  });

  if (confirmed) {
    // Выполнить удаление
  }
}`;

export const TEMPLATE_DOC = `<!-- Декларативное использование (как компонент) -->
<av-modal
  [(isOpen)]="isDialogOpen"
  title="Заголовок окна"
  size="medium"
  [centered]="true"
  [showCloseButton]="true"
>
  <div modal-body>
    <p>Произвольный контент модального окна...</p>
  </div>

  <div modal-footer>
    <button av-button avType="default" (click)="isDialogOpen = false">Отмена</button>
    <button av-button avType="primary" (click)="save()">Сохранить</button>
  </div>
</av-modal>`;

export const USAGE_EXAMPLE = `// 1. Использование специализированных методов (Recommended)
await this.modalService.success('Данные сохранены', 'Успешно', true); // Centered success
await this.modalService.error('Ошибка сервера', 'Ошибка', true);     // Centered error
await this.modalService.delete('Вы уверены?', 'Удаление');           // Centered delete confirm

// 2. Стандартный Confirm
this.modalService.confirm({
  title: 'Подтвердите действие',
  message: 'Перейти на следующую страницу?',
  icon: 'system/av_question-mark'
}).then(res => console.log(res));

// 3. Открытие произвольного компонента
this.modalService.open(MyFormComponent, {
  data: { id: 123 },
  size: 'large',
  disableFooterWhileLoading: true
});`;

export const API_DOC = `/** Входящие параметры компонента <av-modal> */
@Input() isOpen: boolean;               // Управление видимостью (v-model)
@Input() title?: string;                // Заголовок модального окна
@Input() subtitle?: string;             // Подзаголовок
@Input() size: ModalSize;               // 'small' | 'medium' | 'large' | 'fullscreen'
@Input() position: ModalPosition;       // 'center' | 'top' | 'bottom' | 'left' | 'right'
@Input() showCloseButton: boolean;      // Показать кнопку крестика (default: true)
@Input() showBackdrop: boolean;         // Показать затемнение фона (default: true)
@Input() closeOnBackdrop: boolean;      // Закрывать при клике на фон (default: true)
@Input() closeOnEsc: boolean;           // Закрывать при нажатии Esc (default: true)
@Input() centered: boolean;             // Центрировать контент (для диалогов уведомлений)
@Input() avWidth?: string | number;     // Кастомная ширина (px, %, vw)
@Input() avHeight?: string | number;    // Кастомная высота
@Input() draggable: boolean;            // Разрешить перетаскивание (default: false)
@Input() resizable: boolean;            // Разрешить изменение размера (default: false)
@Input() loading: boolean;              // Состояние загрузки (блокирует контент)

/** Сервис ModalService */
open<T>(component: T, config?: ModalConfig): ModalRef<T>;
confirm(config: ConfirmConfig): Promise<boolean>;
alert(config: AlertConfig): Promise<void>;
delete(message: string, title?: string, confirmText?: string): Promise<boolean>;
success(message: string, title?: string, centered?: boolean): Promise<void>;
error(message: string, title?: string, centered?: boolean): Promise<void>;`;
