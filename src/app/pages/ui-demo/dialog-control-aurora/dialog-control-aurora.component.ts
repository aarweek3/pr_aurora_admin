import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DOCUMENTATION } from '@pages/ui-demo/dialog-control-aurora/dialog-control-aurora.config';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { AvIconConfig } from '../../../shared/components/ui/icon';
import { IconSettingsControlComponent } from '../../../shared/components/ui/icon/icon-settings-control/icon-settings-control.component';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { ModalComponent } from '../../../shared/components/ui/modal';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';

interface DialogConfig {
  title: string;
  message: string;
  width: string;
  confirmText: string;
  cancelText: string;
  confirmType: 'primary' | 'default' | 'danger';
  showCancelButton: boolean;
  showCloseButton: boolean;
  closeOnBackdrop: boolean;
  closeOnEsc: boolean;
  centered: boolean;
  draggable: boolean;
}

@Component({
  selector: 'app-dialog-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    NzRadioModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzInputNumberModule,
    IconSettingsControlComponent,
    ModalComponent,
    IconComponent,
    ControlDocumentationComponent,
    ButtonDirective,
    NzTabsModule,
    NzGridModule,
  ],
  templateUrl: './dialog-control-aurora.component.html',
  styleUrl: './dialog-control-aurora.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogControlAuroraComponent {
  // 1. Documentation Configuration
  readonly documentationConfig = DOCUMENTATION;

  // 2. Showcase Configuration
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Dialog Control System 💬',
      componentName: 'DialogControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/dialog-control-aurora/dialog-control-aurora.component.ts',
      controlComponent: {
        name: 'AvModalComponent',
        path: 'src/app/shared/components/ui/modal/modal.component.ts',
      },
      docsPath: 'src\\app\\pages\\ui-demo\\dialog-control-aurora\\dialog-control-aurora.docs.ts',
      description:
        'Универсальная система диалоговых окон. Поддерживает различные типы контента, иконки, ' +
        'кастомизацию кнопок и поведения (backdrop, escape). Интегрируется через ModalService для вызова из кода.',
      note: '💡 Рекомендуется использовать ModalService для открытия диалогов.',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
    resultBlocks: {
      preview: {
        title: '🔴 Live Demo',
      },
      code: {
        title: '📄 Генерированный код',
      },
      description: {
        title: '📋 Текущие настройки',
        autoParams: true,
      },
    },
  };

  // Состояние конфига
  dialogConfig = signal<DialogConfig>({
    title: 'Подтверждение действия',
    message: 'Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.',
    width: '450px',
    confirmText: 'Подтвердить',
    cancelText: 'Отмена',
    confirmType: 'primary',
    showCancelButton: true,
    showCloseButton: true,
    closeOnBackdrop: true,
    closeOnEsc: true,
    centered: true,
    draggable: true,
  });

  // Конфигурация иконки
  iconConfig = signal<AvIconConfig>({
    type: 'actions/av_check_mark',
    size: 48,
    color: '#52c41a',
    rotation: 0,
    scale: 1,
    opacity: 1,
    flipX: false,
    flipY: false,
    padding: 0,
    background: '',
    borderShow: false,
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 0,
  });

  // Автоматическая генерация кода на основе текущих настроек
  generatedCode = computed(() => {
    const config = this.dialogConfig();
    const icon = this.iconConfig();

    const tsCode = `// TypeScript (через ModalService)
import { ModalService } from '@shared/services/modal.service';

constructor(private modalService: ModalService) {}

openDialog() {
  this.modalService.open({
    title: '${config.title}',
    message: '${config.message}',
    width: '${config.width}',
    confirmText: '${config.confirmText}',
    cancelText: '${config.cancelText}',
    confirmType: '${config.confirmType}',
    showCancelButton: ${config.showCancelButton},
    showCloseButton: ${config.showCloseButton},
    closeOnBackdrop: ${config.closeOnBackdrop},
    closeOnEsc: ${config.closeOnEsc},
    centered: ${config.centered},
    draggable: ${config.draggable},
    iconConfig: {
      type: '${icon.type}',
      size: ${icon.size},
      color: '${icon.color}'
    }
  }).subscribe(confirmed => {
    if (confirmed) {
      console.log('Confirmed');
    }
  });
}`;

    const htmlCode = `<!-- HTML Template (Декларативно) -->
<av-modal
  [(isOpen)]="isDialogOpen"
  title="${config.title}"
  message="${config.message}"
  width="${config.width}"
  confirmText="${config.confirmText}"
  cancelText="${config.cancelText}"
  confirmType="${config.confirmType}"
  [showCancelButton]="${config.showCancelButton}"
  [showCloseButton]="${config.showCloseButton}"
  [closeOnBackdrop]="${config.closeOnBackdrop}"
  [closeOnEsc]="${config.closeOnEsc}"
  [centered]="${config.centered}"
  [draggable]="${config.draggable}"
  (confirm)="onConfirm()"
  (cancel)="closeDialog()">

  <!-- Контент иконки -->
  <av-icon
    type="${icon.type}"
    [size]="${icon.size}"
    color="${icon.color}">
  </av-icon>
</av-modal>`;

    return {
      typescript: tsCode,
      html: htmlCode,
    };
  });

  // Code for showcase input (formatted string)
  codeForShowcase = computed(() => {
    const code = this.generatedCode();
    return `${code.html}\n\n${code.typescript}`;
  });

  // Пресеты иконок для диалогов
  readonly iconPresets = [
    { category: 'actions', value: 'actions/av_check_mark', label: 'Success' },
    { category: 'actions', value: 'actions/av_close', label: 'Error' },
    { category: 'system', value: 'system/av_warning', label: 'Warning' },
    { category: 'system', value: 'system/av_info', label: 'Info' },
    { category: 'settings', value: 'settings/av_question-mark', label: 'Question' },
    { category: 'actions', value: 'actions/av_trash', label: 'Delete' },
  ];

  updateConfig(property: keyof DialogConfig, value: any): void {
    this.dialogConfig.update((current) => ({
      ...current,
      [property]: value,
    }));
  }

  onIconConfigChange(newConfig: AvIconConfig): void {
    this.iconConfig.set(newConfig);
  }

  updateIconConfig(partial: Partial<AvIconConfig>): void {
    this.iconConfig.update((current) => ({ ...current, ...partial }));
  }

  // Основной метод открытия диалога из Live Demo
  // State
  isDialogOpen = signal(false);

  // Example States
  example1Open = signal(false);
  example2Open = signal(false);
  example3Open = signal(false);

  feedbackMessage = signal('');

  // Methods
  openDialog(): void {
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
  }

  onConfirm(): void {
    this.showFeedback('✅ Подтверждено!');
    this.closeDialog();
  }

  onCancel(): void {
    this.showFeedback('❌ Отменено');
    this.closeDialog();
  }

  private showFeedback(message: string): void {
    this.feedbackMessage.set(message);
    setTimeout(() => this.feedbackMessage.set(''), 2500);
  }

  // Методы для генерации кода примеров
  getSuccessDialogCode() {
    return {
      html: `<av-modal
  [(isOpen)]="showSuccess"
  [centered]="true"
  [avWidth]="'400px'"
  [showCloseButton]="true">

  <div modal-body>
    <div style="text-align: center; padding: 24px">
      <av-icon type="actions/av_check_mark" [size]="48" color="#52c41a"></av-icon>
      <h3 style="margin: 16px 0 8px; font-weight: 600">Успешно!</h3>
      <p style="color: #8c8c8c; margin: 0">Операция выполнена успешно.</p>
    </div>
  </div>

  <div modal-footer style="justify-content: center">
    <button av-button avType="primary" (click)="showSuccess = false">OK</button>
  </div>
</av-modal>`,
      ts: `export class MyComponent {
  showSuccess = false;

  openSuccessDialog() {
    this.showSuccess = true;
  }
}`,
    };
  }

  getWarningDialogCode() {
    return {
      html: `<av-modal
  [(isOpen)]="showWarning"
  [centered]="true"
  [avWidth]="'450px'">

  <div modal-body>
    <div style="text-align: center; padding: 24px">
      <av-icon type="system/av_warning" [size]="48" color="#faad14"></av-icon>
      <h3 style="margin: 16px 0 8px; font-weight: 600">Внимание!</h3>
      <p style="color: #8c8c8c; margin: 0">Вы уверены, что хотите продолжить?</p>
    </div>
  </div>

  <div modal-footer style="justify-content: center; gap: 8px">
    <button av-button avType="default" (click)="showWarning = false">Отмена</button>
    <button av-button avType="primary" (click)="proceed()">Продолжить</button>
  </div>
</av-modal>`,
      ts: `export class MyComponent {
  showWarning = false;

  openWarningDialog() {
    this.showWarning = true;
  }

  proceed() {
    // Логика выполнения действия
    console.log('Действие подтверждено');
    this.showWarning = false;
  }
}`,
    };
  }

  getDangerDialogCode() {
    return {
      html: `<av-modal
  [(isOpen)]="showDelete"
  [centered]="true"
  [avWidth]="'450px'"
  [closeOnBackdrop]="false">

  <div modal-body>
    <div style="text-align: center; padding: 24px">
      <av-icon type="actions/av_trash" [size]="48" color="#ff4d4f"></av-icon>
      <h3 style="margin: 16px 0 8px; font-weight: 600">Удалить запись?</h3>
      <p style="color: #8c8c8c; margin: 0">Это действие нельзя будет отменить.</p>
    </div>
  </div>

  <div modal-footer style="justify-content: center; gap: 8px">
    <button av-button avType="default" (click)="showDelete = false">Отмена</button>
    <button av-button avType="danger" (click)="confirmDelete()">Удалить</button>
  </div>
</av-modal>`,
      ts: `export class MyComponent {
  showDelete = false;

  openDeleteDialog() {
    this.showDelete = true;
  }

  confirmDelete() {
    // Логика удаления
    console.log('Запись удалена');
    this.showDelete = false;
  }
}`,
    };
  }

  /**
   * Копирование кода в буфер обмена
   */
  copyCode(): void {
    const code = this.generatedCode();
    const textToCopy = `${code.html}\n\n${code.typescript}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log('✅ Код скопирован');
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
