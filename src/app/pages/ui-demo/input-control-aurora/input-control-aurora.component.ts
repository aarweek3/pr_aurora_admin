import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { InputComponent, InputDirective } from '@shared/components/ui/input';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { INPUT_CONTROL_DOCUMENTATION } from './input-control-aurora.config';

interface InputDemoConfig {
  type: 'directive' | 'component';
  inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';
  size: 'small' | 'default' | 'large' | 'x-large' | 'custom';
  status: 'default' | 'error' | 'warning' | 'success';
  variant: 'outlined' | 'filled' | 'borderless';
  shape: 'default' | 'rounded' | 'rounded-big';
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  disabled: boolean;
  visible: boolean;
  block: boolean;
  errorMessage: string;
  showPasswordToggle: boolean;
  prefixIcon: string | null;
  suffixIcon: string | null;
  prefixIconSize: number | null;
  suffixIconSize: number | null;
  prefixIconColor: string | null;
  suffixIconColor: string | null;
  width: string | number | null;
  height: string | number | null;
  radius: string | number | null;
}

@Component({
  selector: 'app-input-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    ControlDocumentationComponent,
    InputDirective,
    InputComponent,

    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzSliderModule,
    NzTabsModule,
    NzCardModule,
    NzButtonModule,
    NzToolTipModule,
    NzTableModule,
    NzCheckboxModule,
  ],
  templateUrl: './input-control-aurora.component.html',
  styleUrl: './input-control-aurora.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputControlAuroraComponent {
  readonly documentationConfig = INPUT_CONTROL_DOCUMENTATION;

  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Input Control ⌨️',
      componentName: 'InputControlAuroraComponent',
      componentPath: 'src/app/pages/ui-demo/input-control-aurora/input-control-aurora.component.ts',
      controlComponent: {
        name: 'InputDirective',
        path: 'src/app/shared/components/ui/input/input.directive.ts',
      },
      docsPath: 'src/app/pages/ui-demo/input-control-aurora/input-control-aurora.config.ts',
      description: 'Демонстрация полей ввода с поддержкой директивы и компонента.',
    },
    showExamples: true,
    showDocs: true,
    resultBlocks: {
      preview: { title: '🎯 Живое превью' },
      code: { title: '💻 Генерированный код' },
      description: { title: '⚙️ Настройки', autoParams: true },
    },
  };

  // State
  config = signal<InputDemoConfig>({
    type: 'directive',
    inputType: 'text',
    size: 'default',
    status: 'default',
    variant: 'outlined',
    shape: 'default',
    label: 'Label Text',
    placeholder: 'Введите текст...',
    hint: 'Helper text',
    value: '',
    disabled: false,
    visible: true,
    block: false,
    errorMessage: 'Ошибка валидации',
    showPasswordToggle: true,
    prefixIcon: null,
    suffixIcon: null,
    prefixIconSize: null,
    suffixIconSize: null,
    prefixIconColor: null,
    suffixIconColor: null,
    width: null,
    height: null,
    radius: null,
  });

  // Helpers
  appliedSize = computed(() =>
    this.config().size === 'custom'
      ? 'default'
      : (this.config().size as 'small' | 'default' | 'large' | 'x-large'),
  );

  updateConfig(key: keyof InputDemoConfig, value: any) {
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  resetAllSettings() {
    this.config.set({
      type: 'directive',
      inputType: 'text',
      size: 'default',
      status: 'default',
      variant: 'outlined',
      shape: 'default',
      label: 'Label Text',
      placeholder: 'Введите текст...',
      hint: 'Helper text',
      value: '',
      disabled: false,
      visible: true,
      block: false,
      errorMessage: 'Ошибка валидации',
      showPasswordToggle: true,
      prefixIcon: null,
      suffixIcon: null,
      prefixIconSize: null,
      suffixIconSize: null,
      prefixIconColor: null,
      suffixIconColor: null,
      width: null,
      height: null,
      radius: null,
    });
  }

  // Code Gen
  generatedCode = computed(() => {
    const c = this.config();
    let code = '';
    const isCustom = c.size === 'custom';

    if (c.type === 'directive') {
      const attrs = ['avInput'];
      if (c.inputType !== 'text') attrs.push(`type="${c.inputType}"`);
      if (c.size !== 'default' && !isCustom) attrs.push(`avSize="${c.size}"`);
      if (c.status !== 'default') attrs.push(`avStatus="${c.status}"`);
      if (c.variant !== 'outlined') attrs.push(`avVariant="${c.variant}"`);
      if (c.shape !== 'default') attrs.push(`avShape="${c.shape}"`);
      if (c.disabled) attrs.push('disabled');
      if (isCustom) {
        if (c.width) attrs.push(`[avWidth]="${c.width}"`);
        if (c.height) attrs.push(`[avHeight]="${c.height}"`);
        if (c.radius) attrs.push(`[avRadius]="${c.radius}"`);
      }
      if (!c.visible) attrs.push('[avVisible]="false"');
      if (c.block) attrs.push('avBlock');

      // Icons for directive need wrappers, simplification here for generated code:
      if (c.prefixIcon || c.suffixIcon) {
        code = `<!-- Внимание: иконки для директивы требуют HTML-обёртки -->\n`;
      }

      code += `<input ${attrs.join(' ')}\n  placeholder="${
        c.placeholder
      }"\n  [(ngModel)]="value"\n/>`;
    } else {
      // Component mode
      const attrs = [];
      if (c.label) attrs.push(`label="${c.label}"`);
      if (c.inputType !== 'text') attrs.push(`type="${c.inputType}"`);
      if (c.size !== 'default' && !isCustom) attrs.push(`size="${c.size}"`);
      if (c.status !== 'default') attrs.push(`status="${c.status}"`);
      if (c.variant !== 'outlined') attrs.push(`variant="${c.variant}"`);
      if (c.shape !== 'default') attrs.push(`shape="${c.shape}"`);
      if (c.hint) attrs.push(`hint="${c.hint}"`);
      if (c.status === 'error' && c.errorMessage) attrs.push(`errorMessage="${c.errorMessage}"`);

      if (c.disabled) attrs.push('[disabled]="true"');
      if (c.block) attrs.push('[block]="true"');

      if (c.prefixIcon) attrs.push(`prefixIcon="${c.prefixIcon}"`);
      if (c.suffixIcon) attrs.push(`suffixIcon="${c.suffixIcon}"`);

      code = `<av-input\n  ${attrs.join('\n  ')}\n  [(value)]="value"\n></av-input>`;
    }

    return {
      html: code,
      typescript: `value = signal('${c.value}');`,
    };
  });

  codeForShowcase = computed(() => {
    const code = this.generatedCode();
    return `HTML:\n${code.html}\n\nTypeScript:\n${code.typescript}`;
  });

  copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    // TODO: Message/Notification
  }
}
