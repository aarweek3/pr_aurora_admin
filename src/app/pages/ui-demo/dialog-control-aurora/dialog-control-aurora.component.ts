import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { AvIconConfig } from '../../../shared/components/ui/icon';
import { IconSettingsControlComponent } from '../../../shared/components/ui/icon/icon-settings-control/icon-settings-control.component';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { ModalComponent } from '../../../shared/components/ui/modal';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';
import {
  API_DOC,
  IMPORT_DOC,
  SETUP_DOC,
  TEMPLATE_DOC,
  USAGE_EXAMPLE,
} from './dialog-control-aurora.docs';

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
    ButtonDirective,
    NzTabsModule,
    NzCardModule,
    NzButtonModule,
    NzGridModule,
    NzRadioModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzInputNumberModule,
    HelpCopyContainerComponent,
    IconSettingsControlComponent,
    ModalComponent,
    IconComponent,
  ],
  templateUrl: './dialog-control-aurora.component.html',
  styleUrl: './dialog-control-aurora.component.scss',
})
export class DialogControlAuroraComponent {
  // Конфигурация Showcase
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

  // Пресеты иконок для диалогов
  readonly iconPresets = [
    { category: 'actions', value: 'actions/av_check_mark', label: 'Success' },
    { category: 'actions', value: 'actions/av_close', label: 'Error' },
    { category: 'system', value: 'system/av_warning', label: 'Warning' },
    { category: 'system', value: 'system/av_info', label: 'Info' },
    { category: 'settings', value: 'settings/av_question-mark', label: 'Question' },
    { category: 'actions', value: 'actions/av_trash', label: 'Delete' },
  ];

  // Документация
  readonly importDoc = IMPORT_DOC;
  readonly setupDoc = SETUP_DOC;
  readonly templateDoc = TEMPLATE_DOC;
  readonly usageExample = USAGE_EXAMPLE;
  readonly apiDoc = API_DOC;

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

  // Генерация кода
  generatedCode = computed(() => {
    const config = this.dialogConfig();
    const icon = this.iconConfig();

    return `// Вызов диалога через сервис
this.modalService.open({
  title: '${config.title}',
  width: '${config.width}',
  centered: ${config.centered},
  closeOnBackdrop: ${config.closeOnBackdrop},
  // ... другие параметры
  data: {
    message: '${config.message}',
    icon: '${icon.type}',
    iconColor: '${icon.color}'
  }
});`;
  });

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
