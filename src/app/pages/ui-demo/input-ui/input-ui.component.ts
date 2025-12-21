import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { InputDirective } from '../../../shared/components/ui/input/input.directive';

@Component({
  selector: 'app-input-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzSelectModule,
    NzInputModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzGridModule,
    NzIconModule,
    NzToolTipModule,
    NzSwitchModule,
    NzSliderModule,
    NzColorPickerModule,
    ButtonDirective,
    InputDirective,
    InputComponent,
    IconComponent,
    HelpCopyContainerComponent,
  ],
  templateUrl: './input-ui.component.html',
  styleUrls: ['./input-ui.component.scss'],
})
export class InputUiComponent {
  readonly colorPresets = [
    '#1890ff',
    '#722ed1',
    '#13c2c2',
    '#f5222d',
    '#fa8c16',
    '#52c41a',
    '#bfbfbf',
  ];

  // UI State
  pgType = signal<'directive' | 'component'>('directive');
  pgValue = signal('');
  pgLabel = signal('Username');
  pgPlaceholder = signal('Enter your username...');
  pgHint = signal('Use 3-20 characters');
  pgSize = signal<'small' | 'default' | 'large' | 'x-large' | 'custom'>('default');
  pgStatus = signal<'default' | 'error' | 'warning' | 'success'>('default');
  pgVariant = signal<'outlined' | 'filled' | 'borderless'>('outlined');
  pgInputType = signal<
    'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time'
  >('text');
  pgDisabled = signal(false);
  pgShowPasswordToggle = signal(true);
  pgErrorMessage = signal('This field is required');

  // Custom Dimensions
  pgWidth = signal<string | number | null>(null);
  pgHeight = signal<string | number | null>(null);
  pgRadius = signal<string | number | null>(null);
  pgShape = signal<'default' | 'rounded' | 'rounded-big'>('default');

  pgPrefixIcon = signal<string | null>(null);
  pgPrefixIconSize = signal<number | null>(null);
  pgPrefixIconColor = signal<string | null>(null);

  pgSuffixIcon = signal<string | null>(null);
  pgSuffixIconSize = signal<number | null>(null);
  pgSuffixIconColor = signal<string | null>(null);

  pgVisible = signal(true);
  pgBlock = signal(false);

  // Help & Documentation
  showDocs = signal(false);
  message = signal('');
  refreshTrigger = signal(true);

  appliedSize = computed(
    () =>
      (this.pgSize() === 'custom' ? 'default' : this.pgSize()) as
        | 'small'
        | 'default'
        | 'large'
        | 'x-large',
  );

  pgGeneratedCode = computed(() => {
    let code = '';
    const isCustom = this.pgSize() === 'custom';

    if (this.pgType() === 'directive') {
      const attrs = ['avInput'];
      if (this.pgSize() !== 'default') attrs.push(`avSize="${this.pgSize()}"`);
      if (this.pgStatus() !== 'default') attrs.push(`avStatus="${this.pgStatus()}"`);
      if (this.pgVariant() !== 'outlined') attrs.push(`avVariant="${this.pgVariant()}"`);
      if (this.pgShape() !== 'default') attrs.push(`avShape="${this.pgShape()}"`);

      if (isCustom) {
        if (this.pgWidth()) attrs.push(`[avWidth]="${this.pgWidth()}"`);
        if (this.pgHeight()) attrs.push(`[avHeight]="${this.pgHeight()}"`);
        if (this.pgRadius()) attrs.push(`[avRadius]="${this.pgRadius()}"`);
      }

      if (this.pgPrefixIcon()) {
        if (this.pgPrefixIconSize()) attrs.push(`avPrefixIconSize="${this.pgPrefixIconSize()}"`);
        if (this.pgPrefixIconColor()) attrs.push(`avPrefixIconColor="${this.pgPrefixIconColor()}"`);
      }
      if (this.pgSuffixIcon()) {
        if (this.pgSuffixIconSize()) attrs.push(`avSuffixIconSize="${this.pgSuffixIconSize()}"`);
        if (this.pgSuffixIconColor()) attrs.push(`avSuffixIconColor="${this.pgSuffixIconColor()}"`);
      }

      if (this.pgDisabled()) attrs.push('[disabled]="true"');
      if (!this.pgVisible()) attrs.push(`[avVisible]="false"`);
      if (this.pgBlock()) attrs.push(`[avBlock]="true"`);
      attrs.push(`[(ngModel)]="value"`);

      const inputTpl = `<input\n  type="${this.pgInputType()}"\n  placeholder="${this.pgPlaceholder()}"\n  ${attrs.join(
        '\n  ',
      )}\n/>`;

      if (this.pgPrefixIcon() || this.pgSuffixIcon()) {
        code = `<div class="av-input-container">\n`;
        if (this.pgPrefixIcon()) {
          code += `  <div class="av-input-prefix">\n    <app-icon type="${this.pgPrefixIcon()}"></app-icon>\n  </div>\n`;
        }
        code += `  ${inputTpl.split('\n').join('\n  ')}\n`;
        if (this.pgSuffixIcon()) {
          code += `  <div class="av-input-suffix">\n    <app-icon type="${this.pgSuffixIcon()}"></app-icon>\n  </div>\n`;
        }
        code += `</div>`;
      } else {
        code = inputTpl;
      }
    } else {
      const attrs = [`[(value)]="value"`];
      if (this.pgLabel()) attrs.push(`label="${this.pgLabel()}"`);
      if (this.pgPlaceholder()) attrs.push(`placeholder="${this.pgPlaceholder()}"`);
      if (this.pgInputType() !== 'text') attrs.push(`type="${this.pgInputType()}"`);
      if (this.pgSize() !== 'default') attrs.push(`size="${this.pgSize()}"`);
      if (this.pgStatus() !== 'default') attrs.push(`status="${this.pgStatus()}"`);
      if (this.pgVariant() !== 'outlined') attrs.push(`variant="${this.pgVariant()}"`);
      if (this.pgShape() !== 'default') attrs.push(`shape="${this.pgShape()}"`);
      if (this.pgHint()) attrs.push(`hint="${this.pgHint()}"`);

      if (this.pgStatus() === 'error' && this.pgErrorMessage()) {
        attrs.push(`errorMessage="${this.pgErrorMessage()}"`);
      }

      if (isCustom) {
        if (this.pgWidth()) attrs.push(`[width]="${this.pgWidth()}"`);
        if (this.pgHeight()) attrs.push(`[height]="${this.pgHeight()}"`);
        if (this.pgRadius()) attrs.push(`[radius]="${this.pgRadius()}"`);
      }

      if (this.pgDisabled()) attrs.push('[disabled]="true"');
      if (!this.pgVisible()) attrs.push(`[visible]="false"`);
      if (this.pgBlock()) attrs.push(`[block]="true"`);
      if (this.pgInputType() === 'password' && !this.pgShowPasswordToggle()) {
        attrs.push(`[showPasswordToggle]="false"`);
      }
      if (this.pgPrefixIcon()) {
        attrs.push(`prefixIcon="${this.pgPrefixIcon()}"`);
        if (this.pgPrefixIconSize()) attrs.push(`[prefixIconSize]="${this.pgPrefixIconSize()}"`);
        if (this.pgPrefixIconColor()) attrs.push(`prefixIconColor="${this.pgPrefixIconColor()}"`);
      }
      if (this.pgSuffixIcon()) {
        attrs.push(`suffixIcon="${this.pgSuffixIcon()}"`);
        if (this.pgSuffixIconSize()) attrs.push(`[suffixIconSize]="${this.pgSuffixIconSize()}"`);
        if (this.pgSuffixIconColor()) attrs.push(`suffixIconColor="${this.pgSuffixIconColor()}"`);
      }

      code = `<av-input\n  ${attrs.join('\n  ')}\n></av-input>`;
    }

    return `${code}\n\n// TS\nvalue = signal('');`;
  });

  apiInterfaceCode = `/**
 * @directive avInput / <av-input>
 */
export interface AvInputProps {
  /** Текст пояснения над полем (только для компонента) */
  label?: string;

  /** Тип поля */
  type: string; // default: 'text'

  /** Размер (пресет или 'custom') */
  size: 'small' | 'default' | 'large' | 'x-large'; // default: 'default'

  /** Статус валидации */
  status: 'default' | 'error' | 'warning' | 'success'; // default: 'default'

  /** Вариант дизайна */
  variant: 'outlined' | 'filled' | 'borderless'; // default: 'outlined'

  /** Сообщение об ошибке (при status="error") */
  errorMessage?: string;

  /** Подсказка под полем */
  hint?: string;

  /** Кастомные размеры */
  width?: string | number;
  height?: string | number;
  radius?: string | number;

  /** Видимость компонента */
  visible?: boolean;

  /** Растягивание на всю ширину контейнера */
  block?: boolean;

  /** Форма (скругление) */
  shape?: 'default' | 'rounded' | 'rounded-big';

  /** Иконки (только для компонента) */
  prefixIcon?: string;
  suffixIcon?: string;
  prefixIconSize?: number;
  prefixIconColor?: string;
  suffixIconSize?: number;
  suffixIconColor?: string;
}`;

  showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 3000);
  }

  forceRefresh(): void {
    this.refreshTrigger.set(false);
    setTimeout(() => {
      this.refreshTrigger.set(true);
      this.showMessage('Настройки применены! ✨');
    }, 100);
  }

  resetAllSettings(): void {
    this.pgType.set('directive');
    this.pgSize.set('default');
    this.pgVariant.set('outlined');
    this.pgStatus.set('default');
    this.pgInputType.set('text');
    this.pgLabel.set('Username');
    this.pgPlaceholder.set('Enter your username...');
    this.pgHint.set('Use 3-20 characters');
    this.pgValue.set('');
    this.pgDisabled.set(false);
    this.pgWidth.set(null);
    this.pgHeight.set(null);
    this.pgRadius.set(null);
    this.pgVisible.set(true);
    this.pgBlock.set(false);
    this.pgShape.set('default');
    this.pgPrefixIcon.set(null);
    this.pgPrefixIconSize.set(null);
    this.pgPrefixIconColor.set(null);
    this.pgSuffixIcon.set(null);
    this.pgSuffixIconSize.set(null);
    this.pgSuffixIconColor.set(null);
    this.forceRefresh();
  }
}
