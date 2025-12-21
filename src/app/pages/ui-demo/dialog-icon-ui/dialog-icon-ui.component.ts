import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { ModalComponent, ModalService } from '../../../shared/components/ui/modal';

@Component({
  selector: 'app-dialog-icon-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzSelectModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzSliderModule,
    NzColorPickerModule,
    NzToolTipModule,
    ButtonDirective,
    IconComponent,
    ModalComponent,
    HelpCopyContainerComponent,
  ],
  templateUrl: './dialog-icon-ui.component.html',
  styleUrl: './dialog-icon-ui.component.scss',
})
export class DialogIconUiComponent {
  constructor(private modalService: ModalService) {}

  // Playground State
  pgTitle = signal('Подтверждение');
  pgMessage = signal('Вы уверены, что хотите выполнить это действие?');
  pgIcon = signal('actions/av_check_mark');
  pgIconSize = signal(64);
  pgIconColor = signal('#52c41a');
  pgSize = signal<'small' | 'medium' | 'large'>('medium');
  pgShowBackdrop = signal(true);
  pgCloseOnBackdrop = signal(true);
  pgCloseOnEsc = signal(true);
  pgShowCloseButton = signal(false);

  // Button Configuration
  pgConfirmText = signal('Подтвердить');
  pgCancelText = signal('Отмена');
  pgConfirmType = signal<'primary' | 'default' | 'danger'>('primary');
  pgShowCancelButton = signal(true);

  // Advanced Features
  pgWidth = signal<string | number>('450px');

  // UI State
  isOpen = signal(false);
  message = signal('');
  refreshTrigger = signal(true);

  readonly iconPresets = [
    { value: 'actions/av_check_mark', label: 'Check (Success)', color: '#52c41a' },
    { value: 'actions/av_close', label: 'Close (Error)', color: '#ff4d4f' },
    { value: 'system/av_warning', label: 'Warning', color: '#faad14' },
    { value: 'settings/av_question-mark', label: 'Question', color: '#1890ff' },
    { value: 'system/av_info', label: 'Info', color: '#1890ff' },
    { value: 'actions/av_trash', label: 'Delete', color: '#ff4d4f' },
  ];

  readonly colorPresets = ['#52c41a', '#ff4d4f', '#faad14', '#1890ff', '#722ed1', '#13c2c2'];

  pgGeneratedCode = computed(() => {
    const code = `// TypeScript
openDialog() {
  const modal = this.modalService.open({
    title: '${this.pgTitle()}',
    centered: true,
    size: '${this.pgSize()}',
    avWidth: ${typeof this.pgWidth() === 'number' ? this.pgWidth() : `'${this.pgWidth()}'`},
    showBackdrop: ${this.pgShowBackdrop()},
    closeOnBackdrop: ${this.pgCloseOnBackdrop()},
    closeOnEsc: ${this.pgCloseOnEsc()},
    showCloseButton: ${this.pgShowCloseButton()},
  });

  modal.result.subscribe(result => {
    console.log('Dialog result:', result);
  });
}

// HTML Template
<av-modal [(isOpen)]="dialogOpen" [centered]="true" [avWidth]="'${this.pgWidth()}'">
  <div modal-body>
    <div style="text-align: center; padding: 24px;">
      <app-icon
        type="${this.pgIcon()}"
        [size]="${this.pgIconSize()}"
        [color]="'${this.pgIconColor()}'"
      ></app-icon>
      <h3 style="margin: 16px 0 8px;">${this.pgTitle()}</h3>
      <p style="color: #8c8c8c;">${this.pgMessage()}</p>
    </div>
  </div>
  <div modal-footer style="text-align: center; justify-content: center;">
    ${
      this.pgShowCancelButton()
        ? `<button av-button avType="default">${this.pgCancelText()}</button>`
        : ''
    }
    <button av-button avType="${this.pgConfirmType()}">${this.pgConfirmText()}</button>
  </div>
</av-modal>`;

    return code;
  });

  apiInterfaceCode = `/**
 * Dialog Icon Component - специализированный компонент для диалогов подтверждения
 * с крупными иконками и центрированным текстом
 */
export interface DialogIconConfig {
  /** Заголовок диалога */
  title: string;

  /** Текст сообщения */
  message: string;

  /** Иконка (из библиотеки иконок) */
  icon: string;

  /** Размер иконки в px */
  iconSize?: number; // default: 64

  /** Цвет иконки */
  iconColor?: string; // default: '#52c41a'

  /** Размер диалога */
  size?: 'small' | 'medium' | 'large'; // default: 'medium'

  /** Ширина диалога */
  width?: string | number; // default: '450px'

  /** Текст кнопки подтверждения */
  confirmText?: string; // default: 'Подтвердить'

  /** Текст кнопки отмены */
  cancelText?: string; // default: 'Отмена'

  /** Тип кнопки подтверждения */
  confirmType?: 'primary' | 'default' | 'danger'; // default: 'primary'

  /** Показывать кнопку отмены */
  showCancelButton?: boolean; // default: true

  /** Показывать кнопку закрытия (X) */
  showCloseButton?: boolean; // default: false

  /** Закрывать при клике на backdrop */
  closeOnBackdrop?: boolean; // default: true

  /** Закрывать при нажатии Esc */
  closeOnEsc?: boolean; // default: true
}

// Использование через сервис
this.modalService.openIconDialog({
  icon: 'check',
  iconColor: '#52c41a',
  title: 'Успешно!',
  message: 'Операция выполнена успешно.',
  confirmText: 'ОК',
  showCancelButton: false,
}).result.subscribe(result => {
  if (result === 'confirm') {
    // Действие подтверждено
  }
});`;

  exampleSuccessCode = `// Подтверждение успешной операции (Success)
isDialogOpen = signal(false);

openSuccessDialog() {
  this.isDialogOpen.set(true);
}

handleConfirm() {
  console.log('Пользователь подтвердил успешную операцию');
  this.isDialogOpen.set(false);
  // Дополнительные действия после подтверждения
  this.navigateToNextStep();
}

// HTML Template
<av-modal
  [(isOpen)]="isDialogOpen"
  [centered]="true"
  [avWidth]="'450px'"
  [showBackdrop]="true"
  [closeOnBackdrop]="true"
  [closeOnEsc]="true"
>
  <div modal-body>
    <div style="text-align: center; padding: 24px;">
      <app-icon type="check" [size]="64" color="#52c41a"></app-icon>
      <h3 style="margin: 16px 0 8px;">Успешно!</h3>
      <p style="color: #8c8c8c;">Операция выполнена успешно.</p>
    </div>
  </div>
  <div modal-footer style="text-align: center; justify-content: center;">
    <button av-button avType="primary" (click)="handleConfirm()">
      ОК
    </button>
  </div>
</av-modal>`;

  exampleErrorCode = `// Диалог ошибки (Error)
isErrorDialogOpen = signal(false);

showError(errorMessage: string) {
  this.errorMessage.set(errorMessage);
  this.isErrorDialogOpen.set(true);
}

handleErrorClose() {
  console.log('Пользователь закрыл диалог ошибки');
  this.isErrorDialogOpen.set(false);
  // Можно добавить логирование ошибки или retry-логику
}

// HTML Template
<av-modal
  [(isOpen)]="isErrorDialogOpen"
  [centered]="true"
  [avWidth]="'450px'"
>
  <div modal-body>
    <div style="text-align: center; padding: 24px;">
      <app-icon type="close" [size]="64" color="#ff4d4f"></app-icon>
      <h3 style="margin: 16px 0 8px;">Ошибка</h3>
      <p style="color: #8c8c8c;">{{ errorMessage() }}</p>
    </div>
  </div>
  <div modal-footer style="text-align: center; justify-content: center;">
    <button av-button avType="default" (click)="isErrorDialogOpen.set(false)">
      Отмена
    </button>
    <button av-button avType="danger" (click)="handleErrorClose()">
      Попробовать снова
    </button>
  </div>
</av-modal>`;

  exampleDeleteCode = `// Подтверждение удаления (Delete Confirmation)
isDeleteDialogOpen = signal(false);
itemToDelete = signal<any>(null);

confirmDelete(item: any) {
  this.itemToDelete.set(item);
  this.isDeleteDialogOpen.set(true);
}

handleDelete() {
  const item = this.itemToDelete();
  console.log('Удаление элемента:', item);

  // Выполнить удаление
  this.deleteItem(item).subscribe({
    next: () => {
      this.isDeleteDialogOpen.set(false);
      this.showSuccessMessage('Элемент успешно удалён');
    },
    error: (err) => {
      console.error('Ошибка удаления:', err);
      this.isDeleteDialogOpen.set(false);
      this.showError('Не удалось удалить элемент');
    }
  });
}

handleCancel() {
  console.log('Удаление отменено');
  this.isDeleteDialogOpen.set(false);
  this.itemToDelete.set(null);
}

// HTML Template
<av-modal
  [(isOpen)]="isDeleteDialogOpen"
  [centered]="true"
  [avWidth]="'450px'"
>
  <div modal-body>
    <div style="text-align: center; padding: 24px;">
      <app-icon type="delete" [size]="64" color="#ff4d4f"></app-icon>
      <h3 style="margin: 16px 0 8px;">Подтвердите удаление</h3>
      <p style="color: #8c8c8c;">
        Вы уверены, что хотите удалить этот элемент?
        Это действие нельзя отменить.
      </p>
    </div>
  </div>
  <div modal-footer style="text-align: center; justify-content: center;">
    <button av-button avType="default" (click)="handleCancel()">
      Отмена
    </button>
    <button av-button avType="danger" (click)="handleDelete()">
      Удалить
    </button>
  </div>
</av-modal>`;

  exampleWarningCode = `// Предупреждение с выбором (Warning)
isWarningDialogOpen = signal(false);
warningAction = signal<'save' | 'discard' | null>(null);

showUnsavedChangesWarning() {
  this.isWarningDialogOpen.set(true);
}

handleSaveAndContinue() {
  console.log('Сохранить изменения и продолжить');
  this.warningAction.set('save');

  this.saveChanges().subscribe({
    next: () => {
      this.isWarningDialogOpen.set(false);
      this.proceedToNextPage();
    }
  });
}

handleDiscardChanges() {
  console.log('Отменить изменения');
  this.warningAction.set('discard');
  this.isWarningDialogOpen.set(false);
  this.proceedToNextPage();
}

handleStayOnPage() {
  console.log('Остаться на странице');
  this.isWarningDialogOpen.set(false);
  this.warningAction.set(null);
}

// HTML Template
<av-modal
  [(isOpen)]="isWarningDialogOpen"
  [centered]="true"
  [avWidth]="'500px'"
  [closeOnBackdrop]="false"
>
  <div modal-body>
    <div style="text-align: center; padding: 24px;">
      <app-icon type="exclamation" [size]="64" color="#faad14"></app-icon>
      <h3 style="margin: 16px 0 8px;">Несохранённые изменения</h3>
      <p style="color: #8c8c8c;">
        У вас есть несохранённые изменения.
        Что вы хотите сделать?
      </p>
    </div>
  </div>
  <div modal-footer style="text-align: center; justify-content: center; gap: 8px;">
    <button av-button avType="default" (click)="handleStayOnPage()">
      Остаться
    </button>
    <button av-button avType="danger" (click)="handleDiscardChanges()">
      Отменить изменения
    </button>
    <button av-button avType="primary" (click)="handleSaveAndContinue()">
      Сохранить
    </button>
  </div>
</av-modal>`;

  exampleInfoCode = `// Информационный диалог (Info - без кнопки отмены)
isInfoDialogOpen = signal(false);

showInfoDialog(title: string, message: string) {
  this.infoTitle.set(title);
  this.infoMessage.set(message);
  this.isInfoDialogOpen.set(true);
}

handleInfoConfirm() {
  console.log('Пользователь прочитал информацию');
  this.isInfoDialogOpen.set(false);

  // Опционально: выполнить действие после прочтения
  this.markNotificationAsRead();
}

// HTML Template
<av-modal
  [(isOpen)]="isInfoDialogOpen"
  [centered]="true"
  [avWidth]="'450px'"
>
  <div modal-body>
    <div style="text-align: center; padding: 24px;">
      <app-icon type="info" [size]="64" color="#1890ff"></app-icon>
      <h3 style="margin: 16px 0 8px;">{{ infoTitle() }}</h3>
      <p style="color: #8c8c8c;">{{ infoMessage() }}</p>
    </div>
  </div>
  <div modal-footer style="text-align: center; justify-content: center;">
    <button av-button avType="primary" (click)="handleInfoConfirm()">
      Понятно
    </button>
  </div>
</av-modal>`;

  openDialog(): void {
    this.isOpen.set(true);
  }

  showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 3000);
  }

  forceRefresh(): void {
    this.refreshTrigger.set(false);
    setTimeout(() => {
      this.refreshTrigger.set(true);
      this.showMessage('Диалог обновлён! ✨');
    }, 100);
  }

  resetAllSettings(): void {
    this.pgTitle.set('Подтверждение');
    this.pgMessage.set('Вы уверены, что хотите выполнить это действие?');
    this.pgIcon.set('actions/av_check_mark');
    this.pgIconSize.set(64);
    this.pgIconColor.set('#52c41a');
    this.pgSize.set('medium');
    this.pgShowBackdrop.set(true);
    this.pgCloseOnBackdrop.set(true);
    this.pgCloseOnEsc.set(true);
    this.pgShowCloseButton.set(false);
    this.pgConfirmText.set('Подтвердить');
    this.pgCancelText.set('Отмена');
    this.pgConfirmType.set('primary');
    this.pgShowCancelButton.set(true);
    this.pgWidth.set('450px');
    this.forceRefresh();
  }

  selectIconPreset(preset: { value: string; label: string; color: string }): void {
    this.pgIcon.set(preset.value);
    this.pgIconColor.set(preset.color);
    this.showMessage(`Выбрана иконка: ${preset.label}`);
  }
}
