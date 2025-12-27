import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation/control-documentation.component';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { AvSpinnerComponent } from '@shared/components/ui/spinner';
import { DOCUMENTATION } from './spinner-control-aurora.config';

interface SpinnerConfig {
  visible: boolean;
  size: 'tiny' | 'small' | 'default' | 'large' | 'huge' | number;
  color: string;
  animation: 'spin' | 'pulse' | 'bounce' | 'drift' | 'none';
  label: string;
  tip: string;
  labelPosition: 'bottom' | 'right';
  overlay: boolean;
  backdropBlur: number;
  backdropOpacity: number;
  fullScreen: boolean;
  delay: number;
}

@Component({
  selector: 'app-spinner-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzGridModule,
    NzSliderModule,
    NzSwitchModule,
    NzRadioModule,
    NzCheckboxModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    AvSpinnerComponent,
    ShowcaseComponent,
    ControlDocumentationComponent,
    IconComponent,
    ButtonDirective,
  ],
  templateUrl: './spinner-control-aurora.component.html',
  styleUrls: ['./spinner-control-aurora.component.scss'],
})
export class SpinnerControlAuroraComponent {
  // --- STATE ---
  config = signal<SpinnerConfig>({
    visible: true,
    size: 'default',
    color: 'primary',
    animation: 'spin',
    label: 'Загрузка данных...',
    tip: 'Пожалуйста, подождите',
    labelPosition: 'bottom',
    overlay: false,
    backdropBlur: 2,
    backdropOpacity: 0.6,
    fullScreen: false,
    delay: 0,
  });

  // FullScreen simulation state
  showFullScreenDemo = signal(false);

  // --- SHOWCASE CONFIG ---
  showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: '✨ Spinner Control Aurora',
      description:
        'Премиальные индикаторы загрузки с поддержкой анимаций, оверлеев и умных задержек.',
      componentName: 'SpinnerControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/spinner-control-aurora/spinner-control-aurora.component.ts',
      controlComponent: {
        name: 'AvSpinnerComponent',
        path: 'src/app/shared/components/ui/spinner/spinner.component.ts',
      },
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [13, 11],
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Состояние параметров' },
    },
  };

  documentationConfig = DOCUMENTATION;

  // --- CONSTANTS ---
  readonly sizes = [
    { label: 'Tiny', value: 'tiny' },
    { label: 'Small', value: 'small' },
    { label: 'Default', value: 'default' },
    { label: 'Large', value: 'large' },
    { label: 'Huge', value: 'huge' },
  ];

  readonly animations = [
    { label: 'Spin', value: 'spin' },
    { label: 'Pulse', value: 'pulse' },
    { label: 'Bounce', value: 'bounce' },
    { label: 'Drift', value: 'drift' },
    { label: 'None', value: 'none' },
  ];

  readonly colors = [
    { label: 'Primary', value: 'primary' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'White', value: 'white' },
    { label: 'Inherit', value: 'inherit' },
  ];

  readonly positions = [
    { label: 'Снизу (Bottom)', value: 'bottom' },
    { label: 'Справа (Right)', value: 'right' },
  ];

  // --- COMPUTED ---
  generatedCode = computed(() => {
    const c = this.config();
    const props: string[] = [];

    if (!c.visible) props.push(`[visible]="false"`);
    if (c.size !== 'default') props.push(`size="${c.size}"`);
    if (c.color !== 'primary') props.push(`color="${c.color}"`);
    if (c.animation !== 'spin') props.push(`animation="${c.animation}"`);
    if (c.label) props.push(`label="${c.label}"`);
    if (c.tip) props.push(`tip="${c.tip}"`);
    if (c.labelPosition !== 'bottom') props.push(`labelPosition="${c.labelPosition}"`);
    if (c.overlay) {
      props.push(`[overlay]="true"`);
      if (c.backdropBlur !== 0) props.push(`[backdropBlur]="${c.backdropBlur}"`);
      if (c.backdropOpacity !== 0.6) props.push(`[backdropOpacity]="${c.backdropOpacity}"`);
    }
    if (c.delay !== 0) props.push(`[delay]="${c.delay}"`);

    const propsStr = props.length > 0 ? '\n  ' + props.join('\n  ') + '\n' : '';
    const html = `<av-spinner${propsStr}></av-spinner>`;

    return {
      html,
      typescript: `// В компоненте\nisLoading = signal(true);\n\n// Пример использования\nsetTimeout(() => this.isLoading.set(false), 2000);`,
    };
  });

  codeForShowcase = computed(() => this.generatedCode().html);

  // --- METHODS ---
  updateConfig<K extends keyof SpinnerConfig>(key: K, value: SpinnerConfig[K]): void {
    this.config.update((prev) => ({ ...prev, [key]: value }));
  }

  toggleFullScreen(): void {
    this.showFullScreenDemo.set(true);
    setTimeout(() => {
      this.showFullScreenDemo.set(false);
    }, 3000);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
