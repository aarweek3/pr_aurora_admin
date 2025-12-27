import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { ModalComponent, ModalService } from '@shared/components/ui/modal';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { DOCUMENTATION } from './modal-control-aurora.config';

// Types
type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
type ModalPosition = 'center' | 'top' | 'bottom';

// Interface для конфигурации модала
interface ModalConfig {
  // Основные
  title: string;
  subtitle: string;
  size: ModalSize;
  position: ModalPosition;

  // Поведение
  showCloseButton: boolean;
  showBackdrop: boolean;
  closeOnBackdrop: boolean;
  closeOnEsc: boolean;

  // Кастомизация
  avWidth: string | null;
  avHeight: string | null;
  centered: boolean;
  draggable: boolean;
  resizable: boolean;
  showMaximizeButton: boolean;

  // Состояние
  loading: boolean;
}

@Component({
  selector: 'app-modal-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    ControlDocumentationComponent,
    ModalComponent,
    ButtonDirective,
    NzTabsModule,
    NzSelectModule,
    NzCheckboxModule,
    NzInputModule,
    NzRadioModule,
  ],
  templateUrl: './modal-control-aurora.component.html',
  styleUrl: './modal-control-aurora.component.scss',
})
export class ModalControlAuroraComponent implements OnInit {
  // Services
  public modalService = inject(ModalService);

  // 1. Documentation Configuration (from .config.ts)
  readonly documentationConfig = DOCUMENTATION;

  ngOnInit() {
    console.log('ModalControlAuroraComponent Init');
    console.log('Documentation Config:', this.documentationConfig);
    console.log('Usage Examples:', this.documentationConfig?.usageExamples);
  }

  // 2. Showcase Configuration
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Modal Control Aurora 🪟',
      componentName: 'ModalControlAuroraComponent',
      componentPath: 'src/app/pages/ui-demo/modal-control-aurora/modal-control-aurora.component.ts',
      controlComponent: {
        name: 'ModalComponent (av-modal)',
        path: 'src/app/shared/components/ui/modal/components/modal/modal.component.ts',
      },
      docsPath: 'src/app/pages/ui-demo/modal-control-aurora/modal-control-aurora.config.ts',
      description:
        'Универсальный компонент модальных окон с расширенными возможностями кастомизации',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Текущие настройки', autoParams: true },
    },
  };

  // 3. State Management (Signals)
  config = signal<ModalConfig>({
    // Основные значения
    title: 'Демонстрационный модал',
    subtitle: 'Настройте параметры слева',
    size: 'medium',
    position: 'center',

    // Поведение
    showCloseButton: true,
    showBackdrop: true,
    closeOnBackdrop: true,
    closeOnEsc: true,

    // Кастомизация
    avWidth: null,
    avHeight: null,
    centered: false,
    draggable: false,
    resizable: false,
    showMaximizeButton: false,

    // Состояние
    loading: false,
  });

  // Состояния для демонстрационных модалов
  playgroundModalOpen = signal(false);
  exampleBasicOpen = signal(false);
  exampleSizeOpen = signal(false);
  currentExampleSize = signal<ModalSize>('medium');
  examplePositionOpen = signal(false);
  currentExamplePosition = signal<ModalPosition>('center');
  exampleBehaviorOpen = signal(false);
  exampleCenteredOpen = signal(false);

  // 4. Dropdown Options
  readonly sizes = [
    { value: 'small', label: 'Small (400px)' },
    { value: 'medium', label: 'Medium (600px)' },
    { value: 'large', label: 'Large (800px)' },
    { value: 'xlarge', label: 'XLarge (1000px)' },
    { value: 'fullscreen', label: 'Fullscreen (100vw/100vh)' },
  ];

  readonly positions = [
    { value: 'center', label: 'Center (по центру)' },
    { value: 'top', label: 'Top (сверху)' },
    { value: 'bottom', label: 'Bottom (снизу)' },
  ];

  // 5. Helper Methods
  updateConfig(key: keyof ModalConfig, value: any) {
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  // 6. Code Generation
  generatedCode = computed(() => {
    const c = this.config();
    let props: string[] = [];

    // Основные параметры
    if (c.title) props.push(`  title="${c.title}"`);
    if (c.subtitle) props.push(`  subtitle="${c.subtitle}"`);
    if (c.size !== 'medium') props.push(`  size="${c.size}"`);
    if (c.position !== 'center') props.push(`  position="${c.position}"`);

    // Поведение
    if (!c.showCloseButton) props.push(`  [showCloseButton]="false"`);
    if (!c.showBackdrop) props.push(`  [showBackdrop]="false"`);
    if (!c.closeOnBackdrop) props.push(`  [closeOnBackdrop]="false"`);
    if (!c.closeOnEsc) props.push(`  [closeOnEsc]="false"`);

    // Кастомизация
    if (c.centered) props.push(`  [centered]="true"`);
    if (c.draggable) props.push(`  [draggable]="true"`);
    if (c.resizable) props.push(`  [resizable]="true"`);
    if (c.showMaximizeButton) props.push(`  [showMaximizeButton]="true"`);

    // Кастомные размеры
    if (c.avWidth) props.push(`  [avWidth]="'${c.avWidth}'"`);
    if (c.avHeight) props.push(`  [avHeight]="'${c.avHeight}'"`);

    // Состояние
    if (c.loading) props.push(`  [loading]="true"`);

    const propsString = props.length > 0 ? '\n' + props.join('\n') + '\n' : '';

    const htmlCode = `<av-modal
  [(isOpen)]="showModal"${propsString}>

  <div modal-body>
    <p>Содержимое модального окна</p>
  </div>

  <div modal-footer>
    <button av-button avType="default" (clicked)="showModal = false">
      Отмена
    </button>
    <button av-button avType="primary" (clicked)="showModal = false">
      Подтвердить
    </button>
  </div>
</av-modal>`;

    return {
      html: htmlCode,
      typescript: `// Пример открытия через ModalService
import { ModalService } from '@shared/components/ui/modal';

constructor(private modalService: ModalService) {}

async openConfirm() {
  const confirmed = await this.modalService.confirm({
    title: '${c.title}',
    message: 'Вы уверены?',
    confirmType: 'primary'
  });
}`,
    };
  });

  codeForShowcase = computed(() => {
    const code = this.generatedCode();
    return `${code.html}\n\n${code.typescript}`;
  });

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // 7. Example Methods
  openExampleModal(size: ModalSize) {
    this.currentExampleSize.set(size);
    this.exampleSizeOpen.set(true);
  }

  openExamplePosition(position: ModalPosition) {
    this.currentExamplePosition.set(position);
    this.examplePositionOpen.set(true);
  }

  // ModalService Examples
  async showConfirmExample() {
    const confirmed = await this.modalService.confirm({
      title: 'Подтвердите действие',
      message: 'Вы уверены, что хотите продолжить?',
      confirmText: 'Да, продолжить',
      cancelText: 'Отмена',
      confirmType: 'primary',
    });

    if (confirmed) {
      console.log('Пользователь подтвердил действие');
    }
  }

  async showDeleteExample() {
    const confirmed = await this.modalService.delete(
      'Все данные отчета будут безвозвратно удалены. Вы уверены?',
      'Удалить отчет?',
    );

    if (confirmed) {
      console.log('Отчет удален');
      await this.modalService.success('Отчет успешно удален', 'Готово', true);
    }
  }

  async showSuccessExample() {
    await this.modalService.success('Операция успешно выполнена!', 'Успех', true);
  }

  async showErrorExample() {
    await this.modalService.error(
      'Произошла ошибка при выполнении операции. Попробуйте еще раз.',
      'Ошибка',
      true,
    );
  }

  showInfoExample() {
    this.modalService.info('Система обновлена до версии 2.0.0');
  }

  showWarningExample() {
    this.modalService.warning('Срок действия подписки истекает через 3 дня');
  }

  // 8. Reset to Defaults
  resetToDefaults() {
    this.config.set({
      title: 'Демонстрационный модал',
      subtitle: 'Настройте параметры слева',
      size: 'medium',
      position: 'center',
      showCloseButton: true,
      showBackdrop: true,
      closeOnBackdrop: true,
      closeOnEsc: true,
      avWidth: null,
      avHeight: null,
      centered: false,
      draggable: false,
      resizable: false,
      showMaximizeButton: false,
      loading: false,
    });
  }
}
