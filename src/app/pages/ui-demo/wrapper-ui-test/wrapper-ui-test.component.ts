import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';
import {
  ADVANCED_EXAMPLE,
  API_DOC,
  FULL_INTEGRATION_EXAMPLE,
  IMPORT_EXAMPLE,
  USAGE_EXAMPLE,
} from './wrapper-ui-test.docs';

@Component({
  selector: 'app-wrapper-ui-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    HelpCopyContainerComponent,
    IconComponent,
    NzTabsModule,
    NzCardModule,
    NzGridModule,
    NzCollapseModule,
    NzButtonModule,
    NzNotificationModule,
    NzSwitchModule,
    NzFormModule,
    NzInputModule,
    NzSliderModule,
  ],
  templateUrl: './wrapper-ui-test.component.html',
  styleUrl: './wrapper-ui-test.component.scss',
})
export class WrapperUiTestComponent implements OnDestroy {
  private notification = inject(NzNotificationService);

  // Конфигурация showcase
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Wrapper UI Test 🎁',
      description:
        'Демонстрация универсального компонента av-wrapper-ui — архитектурного фундамента для всех страниц системы Aurora.',
      componentName: 'WrapperUiTestComponent',
      componentPath: 'src/app/pages/ui-demo/wrapper-ui-test/wrapper-ui-test.component.ts',
      controlComponent: {
        name: 'WrapperUiComponent',
        path: 'src/app/shared/components/ui/wrapper-ui/wrapper-ui.component.ts',
      },
      docsPath: 'src/app/pages/ui-demo/wrapper-ui-test/wrapper-ui-test.docs.ts',
    },
    resultTitle: '🎨 Интерактивный результат',
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
  };

  // Настройки wrapper-ui (реактивные signals)
  headerFixed = signal<boolean>(true);
  maxWidth = signal<string>('1400px');
  bordered = signal<boolean>(true);

  // internal timer for messages
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  // computed code snippet based on current settings
  generatedCode = computed(() => {
    const hf = this.headerFixed();
    const mw = this.maxWidth();
    const bd = this.bordered();

    const ts = `// ShowcaseConfig (excerpt)\nconst showcaseConfig: ShowcaseConfig = ${JSON.stringify(
      this.showcaseConfig,
      null,
      2,
    )};`;

    const html = `<av-showcase [config]="showcaseConfig" [headerFixed]="${hf}" [bordered]="${bd}" [maxWidth]="'${mw}'">...</av-showcase>`;

    return `${ts}\n\n${html}`;
  });

  // Примеры кода (импортированы из .docs.ts)
  readonly usageExample = USAGE_EXAMPLE;
  readonly apiCode = API_DOC;
  readonly advancedExample = ADVANCED_EXAMPLE;
  readonly importExample = IMPORT_EXAMPLE;
  readonly fullIntegrationExample = FULL_INTEGRATION_EXAMPLE;

  // Методы управления (реактивные)
  toggleHeader(): void {
    this.headerFixed.set(!this.headerFixed());
  }

  toggleBorder(): void {
    this.bordered.set(!this.bordered());
  }

  setMaxWidth(value: string): void {
    this.maxWidth.set(value || '');
  }

  copyCode(): void {
    const code = this.generatedCode();
    navigator.clipboard
      .writeText(code)
      .then(() => this.showSuccessMessage('Код скопирован в буфер обмена'))
      .catch((err) => this.showErrorMessage('Не удалось скопировать код'));
  }

  // Простые уведомления (временные) — заглушки для toast
  private showSuccessMessage(message: string): void {
    // show nz notification
    try {
      this.notification.success('Успех', message, { nzDuration: 3000 });
    } catch (e) {
      console.log('✅', message);
    }
    this.clearMessageTimer();
    this.messageTimer = setTimeout(() => (this.messageTimer = null), 3000);
  }

  private showErrorMessage(message: string): void {
    try {
      this.notification.error('Ошибка', message, { nzDuration: 3000 });
    } catch (e) {
      console.error('❌', message);
    }
    this.clearMessageTimer();
    this.messageTimer = setTimeout(() => (this.messageTimer = null), 3000);
  }

  private clearMessageTimer(): void {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearMessageTimer();
  }
}
