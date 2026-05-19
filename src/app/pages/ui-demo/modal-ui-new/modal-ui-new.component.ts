import { CommonModule } from '@angular/common';
import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { ModalComponent, ModalService } from '../../../shared/components/ui/modal';

@Component({
  selector: 'app-modal-ui-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzSelectModule,
    NzInputModule,
    NzSwitchModule,
    NzToolTipModule,
    ButtonDirective,
    ModalComponent,
    HelpCopyContainerComponent,
  ],
  templateUrl: './modal-ui-new.component.html',
  styleUrl: './modal-ui-new.component.scss',
})
export class ModalUiNewComponent {
  private modalService = inject(ModalService);

  // Playground State
  pgTitle = signal('New Modal');
  pgSubtitle = signal('Interactive modeling demo');
  pgSize = signal<'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen'>('medium');
  pgPosition = signal<'center' | 'top' | 'bottom'>('center');
  pgShowBackdrop = signal(true);
  pgCloseOnBackdrop = signal(true);
  pgCloseOnEsc = signal(true);
  pgShowCloseButton = signal(true);
  pgCentered = signal(false);

  // Advanced features
  pgWidth = signal<string | number>('');
  pgHeight = signal<string | number>('');
  pgDraggable = signal(false);
  pgResizable = signal(false);
  pgShowMaximizeButton = signal(true);

  // Modal Visibility
  isOpen = signal(false);

  // Service State
  serviceResult = signal<string | null>(null);

  apiInterfaceCode = `/**
 * Интерфейс параметров компонента <av-modal>
 */
export interface AvModalProps {
  // --- Состояние ---
  isOpen: boolean;           // Видимость окна (поддерживает [(isOpen)])
  loading?: boolean;         // Состояние загрузки (блокирует футер)

  // --- Контент ---
  title?: string;            // Заголовок
  subtitle?: string;         // Подзаголовок
  centered?: boolean;        // Центрированный дизайн (для алертов/диалогов)

  // --- Размеры ---
  size?: ModalSize;          // 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen'
  position?: ModalPosition;  // 'center' | 'top' | 'bottom'
  avWidth?: string | number; // Кастомная ширина (напр. 500, '500px', '80%')
  avHeight?: string | number;// Кастомная высота (напр. 400, '400px')
  avMaxWidth?: string | number; // Максимальная ширина
  avMaxHeight?: string | number;// Максимальная высота

  // --- Поведение и UI ---
  showBackdrop?: boolean;    // Отображать затемнение фона (default: true)
  closeOnBackdrop?: boolean; // Закрывать при клике на фон (default: true)
  closeOnEsc?: boolean;      // Закрывать при нажатии ESC (default: true)
  showCloseButton?: boolean; // Отображать крестик в углу (default: true)
  showMaximizeButton?: boolean; // Кнопка развертывания на весь экран
  mobileFullscreen?: boolean;// Fullscreen режим на мобильных устройствах

  // --- Интерактив ---
  draggable?: boolean;       // Разрешить перетаскивание за хедер
  resizable?: boolean;       // Разрешить изменение размера (resize handle)
}`;

  detailedServiceExample = `/**
 * Пример использования ModalService в компоненте
 */
import { Component, inject } from '@angular/core';
import { ModalService } from '@shared/components/ui/modal'; // Путь может отличаться

@Component({ ... })
export class MyComponent {
  // 1. Инжекция сервиса (современный способ через inject)
  private readonly modalService = inject(ModalService);

  // --- Диалог подтверждения ---
  async handleConfirm() {
    const confirmed = await this.modalService.confirm({
      title: 'Удалить проект?',
      message: 'Все связанные данные будут удалены безвозвратно.',
      confirmText: 'Да, удалить',
      confirmType: 'danger',   // 'primary' | 'danger'
      cancelText: 'Отмена',
      centered: true           // Центрированный UI с большой иконкой
    });

    if (confirmed) {
       this.executeDeletion();
    }
  }

  // --- Информационные алерты ---
  showSuccess() {
    this.modalService.success(
      'Изменения сохранены успешно!',
      'Готово',
      true // centered
    );
  }

  showError() {
    this.modalService.error('Не удалось подключиться к серверу.');
  }

  // --- Кастомный компонент в модале ---
  openCustom() {
    const modalRef = this.modalService.open(SomeCustomComponent, {
      title: 'Параметры профиля',
      size: 'medium',
      data: { userId: 123 } // Передача данных внутрь
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Модал закрыт с результатом:', result);
    });
  }
}`;

  modalPropsHelp = `Компонент <av-modal> — это мощный инструмент для создания диалоговых окон.
Основные возможности:
1. Двустороннее связывание [isOpen] для управления видимостью.
2. Поддержка Drag-and-Drop (нужен @angular/cdk/drag-drop).
3. Ресайзинг в реальном времени.
4. Адаптивность: автоматический Fullscreen на мобильных устройствах.
5. Слоты для контента: [modal-body], [modal-footer], [modal-header-extra].`;

  modalServiceHelp = `Методы ModalService для быстрого вызова:
• open<T>(Comp, Config) - открытие любого компонента.
• confirm(ConfirmConfig) - возвращает Promise<boolean>.
• success / error / warning / info - быстрые алерты.
• delete(msg, title?) - специализированный модал удаления.
• closeAll() - принудительное закрытие всех окон.

Важно: Сервис автоматически управляет z-index и стеком открытых окон (поддерживает до 5 уровней вложенности).`;

  pgGeneratedCode = computed(() => {
    let code = `<av-modal
  [isOpen]="isOpen()"
  (isOpenChange)="isOpen.set($event)"
  title="${this.pgTitle()}"
  subtitle="${this.pgSubtitle()}"`;

    const hasCustomDim = !!(this.pgWidth() || this.pgHeight());
    if (!hasCustomDim) {
      code += `\n  size="${this.pgSize()}"`;
    }

    code += `\n  position="${this.pgPosition()}"`;

    if (this.pgWidth()) code += `\n  avWidth="${this.pgWidth()}"`;
    if (this.pgHeight()) code += `\n  avHeight="${this.pgHeight()}"`;
    if (this.pgDraggable()) code += `\n  [draggable]="true"`;
    if (this.pgResizable()) code += `\n  [resizable]="true"`;
    if (this.pgShowMaximizeButton()) code += `\n  [showMaximizeButton]="true"`;

    code += `
  [showBackdrop]="${this.pgShowBackdrop()}"
  [closeOnBackdrop]="${this.pgCloseOnBackdrop()}"
  [closeOnEsc]="${this.pgCloseOnEsc()}"
  [showCloseButton]="${this.pgShowCloseButton()}"
  [centered]="${this.pgCentered()}"
>
  <div modal-body>
    <p>This is a dynamically modeled modal!</p>
  </div>
  <div modal-footer>
    <button av-button avType="default" (click)="isOpen.set(false)">Close</button>
    <button av-button avType="primary" (click)="isOpen.set(false)">Confirm</button>
  </div>
</av-modal>`;
    return code;
  });

  resetAllSettings() {
    this.pgTitle.set('New Modal');
    this.pgSubtitle.set('Interactive modeling demo');
    this.pgSize.set('medium');
    this.pgPosition.set('center');
    this.pgShowBackdrop.set(true);
    this.pgCloseOnBackdrop.set(true);
    this.pgCloseOnEsc.set(true);
    this.pgShowCloseButton.set(true);
    this.pgCentered.set(false);
    this.pgWidth.set('');
    this.pgHeight.set('');
    this.pgDraggable.set(false);
    this.pgResizable.set(false);
    this.pgShowMaximizeButton.set(true);
  }

  openModal() {
    this.isOpen.set(true);
  }

  // --- ModalService Examples ---

  async showConfirm() {
    this.serviceResult.set('Waiting for result...');
    const confirmed = await this.modalService.confirm({
      title: 'Подтверждение',
      message: 'Вы уверены, что хотите выполнить это действие?',
      confirmText: 'Да, выполнить',
      cancelText: 'Отмена',
    });
    this.serviceResult.set(confirmed ? 'Confirmed (true)' : 'Cancelled (false)');
  }

  async showDelete() {
    this.serviceResult.set('Waiting for result...');
    const confirmed = await this.modalService.delete(
      'Все данные объекта будут удалены навсегда.',
      'Удалить этот элемент?',
    );
    this.serviceResult.set(confirmed ? 'Deleted (true)' : 'Cancelled (false)');
    if (confirmed) {
      this.modalService.success('Элемент был успешно удален.', 'Готово');
    }
  }

  showSuccess() {
    this.modalService.success('Операция выполнена успешно!', 'Удача', true);
  }

  showError() {
    this.modalService.error('Произошла критическая ошибка при обработке запроса.', 'Ошибка', true);
  }
}
