import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
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
    ButtonDirective,
    ModalComponent,
    HelpCopyContainerComponent,
  ],
  templateUrl: './modal-ui-new.component.html',
  styleUrl: './modal-ui-new.component.scss',
})
export class ModalUiNewComponent {
  // Playground State
  pgTitle = signal('New Modal');
  pgSubtitle = signal('Interactive modeling demo');
  pgSize = signal<'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen'>('medium');
  pgPosition = signal<'center' | 'top' | 'bottom'>('center');
  pgShowBackdrop = signal(true);
  pgCloseOnBackdrop = signal(true);
  pgCloseOnEsc = signal(true);
  pgCentered = signal(false);

  // Advanced features
  pgWidth = signal<string | number>('');
  pgHeight = signal<string | number>('');
  pgDraggable = signal(false);
  pgResizable = signal(false);
  pgShowMaximizeButton = signal(true);

  // Modal Visibility
  isOpen = signal(false);

  apiInterfaceCode = `export interface AvModalProps {
  isOpen: boolean;           // Открыт ли модал
  title?: string;            // Заголовок
  subtitle?: string;         // Подзаголовок
  size: ModalSize;           // 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen'
  position: ModalPosition;   // 'center' | 'top' | 'bottom'
  avWidth?: string | number; // Кастомная ширина
  avHeight?: string | number; // Кастомная высота
  draggable: boolean;       // Можно ли перетаскивать
  resizable: boolean;       // Можно ли менять размер
  showMaximizeButton: boolean; // Показывать кнопку разворачивания
  showBackdrop: boolean;     // Показывать затемнение фона
  closeOnBackdrop: boolean;  // Закрывать по клику на фон
  closeOnEsc: boolean;       // Закрывать по клавише ESC
  centered: boolean;         // Центрированный дизайн (для алертов)
  showCloseButton: boolean;  // Показывать крестик в углу
}`;

  constructor(private modalService: ModalService) {}

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
}
