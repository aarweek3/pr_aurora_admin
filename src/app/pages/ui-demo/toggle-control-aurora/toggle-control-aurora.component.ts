import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation/control-documentation.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { ToggleLabeledComponent } from '@shared/components/ui/toggle/toggle-labeled.component';
import { ToggleComponent } from '@shared/components/ui/toggle/toggle.component';
import { ToggleDirective } from '@shared/components/ui/toggle/toggle.directive';
import { DOCUMENTATION } from './toggle-control-aurora.config';

interface TogglePlaygroundConfig {
  type: 'directive' | 'component';
  isLabeled: boolean;
  checked: boolean;
  size: 'small' | 'default' | 'large';
  color: string;
  shape: 'default' | 'square';
  disabled: boolean;
  // Component specific
  label: string;
  labelPosition: 'top' | 'bottom' | 'left' | 'right';
  labelSize: string;
  labelColor: string;
  // Labeled specific
  leftLabel: string;
  rightLabel: string;
  // Custom sizing
  useCustomSize: boolean;
  width: number | null;
  height: number | null;
  radius: number | null;
}

@Component({
  selector: 'app-toggle-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzGridModule,
    NzRadioModule,
    NzCheckboxModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzSwitchModule,
    ToggleDirective,
    ToggleComponent,
    ToggleLabeledComponent,
    ShowcaseComponent,
    ControlDocumentationComponent,
  ],
  templateUrl: './toggle-control-aurora.component.html',
  styleUrls: ['./toggle-control-aurora.component.scss'],
})
export class ToggleControlAuroraComponent {
  // --- STATE ---
  config = signal<TogglePlaygroundConfig>({
    type: 'component',
    isLabeled: false,
    checked: false,
    size: 'default',
    color: 'primary',
    shape: 'default',
    disabled: false,
    label: 'Enable Notifications',
    labelPosition: 'right',
    labelSize: '14px',
    labelColor: '#1f2937',
    leftLabel: 'OFF',
    rightLabel: 'ON',
    useCustomSize: false,
    width: null,
    height: null,
    radius: null,
  });

  // --- SHOWCASE CONFIG ---
  showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: '⚡ Toggle Control Aurora',
      description:
        'Высокопроизводительные переключатели на базе Angular Signals с поддержкой кастомных габаритов.',
      componentName: 'ToggleControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/toggle-control-aurora/toggle-control-aurora.component.ts',
      controlComponent: {
        name: 'Toggle System',
        path: 'src/app/shared/components/ui/toggle/',
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
  readonly types = [
    { label: 'Директива (avToggle)', value: 'directive' },
    { label: 'Компонент (av-toggle)', value: 'component' },
  ];

  readonly sizes = [
    { label: 'Small', value: 'small' },
    { label: 'Default', value: 'default' },
    { label: 'Large', value: 'large' },
  ];

  readonly colors = [
    { label: 'Primary', value: 'primary' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Danger', value: 'danger' },
  ];

  readonly shapes = [
    { label: 'Oval (Default)', value: 'default' },
    { label: 'Square (Rounded)', value: 'square' },
  ];

  readonly positions = [
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
  ];

  // --- COMPUTED ---
  generatedCode = computed(() => {
    const c = this.config();
    let html = '';

    if (c.isLabeled) {
      const attrs = [
        '[(checked)]="isChecked"',
        `color="${c.color}"`,
        `shape="${c.shape}"`,
        `leftLabel="${c.leftLabel}"`,
        `rightLabel="${c.rightLabel}"`,
      ];
      if (c.size !== 'default') attrs.push(`size="${c.size}"`);
      if (c.disabled) attrs.push('[disabled]="true"');

      html = `<av-toggle-labeled\n  ${attrs.join('\n  ')}\n></av-toggle-labeled>`;
    } else if (c.type === 'directive') {
      const attrs = [
        'type="checkbox"',
        'avToggle',
        '[(ngModel)]="isChecked"',
        `avColor="${c.color}"`,
        `avShape="${c.shape}"`,
      ];
      if (c.size !== 'default') attrs.push(`avSize="${c.size}"`);
      if (c.useCustomSize) {
        if (c.width) attrs.push(`[avWidth]="${c.width}"`);
        if (c.height) attrs.push(`[avHeight]="${c.height}"`);
        if (c.radius) attrs.push(`[avRadius]="${c.radius}"`);
      }
      if (c.disabled) attrs.push('[disabled]="true"');

      html = `<label class="av-toggle">
  <input
    ${attrs.join('\n    ')}
  />
  <span class="av-toggle__slider"></span>
</label>`;
    } else {
      const attrs = ['[(checked)]="isChecked"', `color="${c.color}"`, `shape="${c.shape}"`];
      if (c.size !== 'default') attrs.push(`size="${c.size}"`);
      if (c.labelPosition !== 'right') attrs.push(`labelPosition="${c.labelPosition}"`);
      if (c.useCustomSize) {
        if (c.width) attrs.push(`[width]="${c.width}"`);
        if (c.height) attrs.push(`[height]="${c.height}"`);
        if (c.radius) attrs.push(`[radius]="${c.radius}"`);
      }
      if (c.disabled) attrs.push('[disabled]="true"');

      html = `<av-toggle\n  ${attrs.join('\n  ')}\n>\n  ${c.label}\n</av-toggle>`;
    }

    return {
      html,
      typescript: `// Состояние\nisChecked = signal(false);`,
    };
  });

  codeForShowcase = computed(() => this.generatedCode().html);

  // --- METHODS ---
  updateConfig<K extends keyof TogglePlaygroundConfig>(
    key: K,
    value: TogglePlaygroundConfig[K],
  ): void {
    this.config.update((prev) => ({ ...prev, [key]: value }));
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
