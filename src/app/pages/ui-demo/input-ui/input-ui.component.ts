import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui';
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
    NzCheckboxModule,
    NzGridModule,
    NzIconModule,
    NzToolTipModule,
    NzSwitchModule,
    ButtonDirective,
    InputDirective,
    InputComponent,
    HelpCopyContainerComponent,
  ],
  templateUrl: './input-ui.component.html',
  styleUrls: ['./input-ui.component.scss'],
})
export class InputUiComponent {
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

      if (this.pgDisabled()) attrs.push('[disabled]="true"');
      if (!this.pgVisible()) attrs.push(`[avVisible]="false"`);
      if (this.pgBlock()) attrs.push(`[avBlock]="true"`);
      attrs.push(`[(ngModel)]="value"`);

      code = `<input\n  type="${this.pgInputType()}"\n  placeholder="${this.pgPlaceholder()}"\n  ${attrs.join(
        '\n  ',
      )}\n/>`;
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
    this.forceRefresh();
  }
}
