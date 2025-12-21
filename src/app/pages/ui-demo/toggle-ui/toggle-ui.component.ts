import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui';
import { ToggleLabeledComponent } from '../../../shared/components/ui/toggle/toggle-labeled.component';
import { ToggleComponent } from '../../../shared/components/ui/toggle/toggle.component';
import { ToggleDirective } from '../../../shared/components/ui/toggle/toggle.directive';

@Component({
  selector: 'app-toggle-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToggleDirective,
    ToggleComponent,
    ToggleLabeledComponent,
    ButtonDirective,
    HelpCopyContainerComponent,
    NzGridModule,
    NzSelectModule,
    NzSwitchModule,
    NzSpaceModule,
    NzInputModule,
    NzCardModule,
    NzColorPickerModule,
    NzToolTipModule,
  ],
  templateUrl: './toggle-ui.component.html',
  styleUrl: './toggle-ui.component.scss',
})
export class ToggleUiComponent {
  // Playground state
  pgType = signal<'directive' | 'component' | 'labeled'>('directive');
  pgSize = signal<'small' | 'default' | 'large' | 'custom'>('default');
  pgShape = signal<'default' | 'square'>('default');
  pgColor = signal<string>('primary');
  pgLabel = signal('Enable notifications');
  pgLeftLabel = signal('OFF');
  pgRightLabel = signal('ON');
  pgChecked = signal(false);
  pgDisabled = signal(false);
  pgLabelPosition = signal<'left' | 'right' | 'top' | 'bottom'>('right');
  pgLabelSize = signal('14px');
  pgLabelColor = signal('#262626');

  // Custom sizing (shown only when pgSize() === 'custom')
  pgWidth = signal<number | null>(null);
  pgHeight = signal<number | null>(null);
  pgRadius = signal<number | null>(null);

  /** Обработанный размер для передачи в компоненты (чтобы не было 'custom') */
  appliedSize = computed(
    () => (this.pgSize() === 'custom' ? 'default' : this.pgSize()) as 'small' | 'default' | 'large',
  );

  // UI state
  message = signal('');
  refreshTrigger = signal(true);
  showDocs = false;

  readonly colorPresets = [
    'primary',
    'success',
    'warning',
    'danger',
    '#1890ff',
    '#6366f1',
    '#10b981',
    '#f43f5e',
    '#f59e0b',
  ];

  readonly iconPresets = []; // Removed as per request

  pgGeneratedCode = computed(() => {
    const type = this.pgType();
    let code = '';

    if (type === 'directive') {
      const attrs = [
        'type="checkbox"',
        'avToggle',
        '[(ngModel)]="isChecked"',
        `avSize="${this.pgSize() === 'custom' ? 'default' : this.pgSize()}"`,
        `avColor="${this.pgColor()}"`,
        `avShape="${this.pgShape()}"`,
      ];

      if (this.pgSize() === 'custom') {
        if (this.pgWidth()) attrs.push(`[avWidth]="${this.pgWidth()}"`);
        if (this.pgHeight()) attrs.push(`[avHeight]="${this.pgHeight()}"`);
        if (this.pgRadius()) attrs.push(`[avRadius]="${this.pgRadius()}"`);
      }

      if (this.pgDisabled()) attrs.push('[disabled]="true"');

      code = `<label class="av-toggle">
  <input
    ${attrs.join('\n    ')}
  />
  <span class="av-toggle__slider"></span>
</label>`;
    } else if (type === 'component') {
      const attrs = [
        '[(checked)]="isChecked"',
        `size="${this.pgSize() === 'custom' ? 'default' : this.pgSize()}"`,
        `color="${this.pgColor()}"`,
        `shape="${this.pgShape()}"`,
        `labelPosition="${this.pgLabelPosition()}"`,
        `labelSize="${this.pgLabelSize()}"`,
        `labelColor="${this.pgLabelColor()}"`,
      ];

      if (this.pgSize() === 'custom') {
        if (this.pgWidth()) attrs.push(`[width]="${this.pgWidth()}"`);
        if (this.pgHeight()) attrs.push(`[height]="${this.pgHeight()}"`);
        if (this.pgRadius()) attrs.push(`[radius]="${this.pgRadius()}"`);
      }

      if (this.pgDisabled()) attrs.push('[disabled]="true"');

      code = `<av-toggle
  ${attrs.join('\n  ')}
>
  ${this.pgLabel()}
</av-toggle>`;
    } else {
      const attrs = [
        '[(checked)]="isChecked"',
        `size="${this.pgSize()}"`,
        `color="${this.pgColor()}"`,
        `shape="${this.pgShape()}"`,
        `leftLabel="${this.pgLeftLabel()}"`,
        `rightLabel="${this.pgRightLabel()}"`,
      ];

      if (this.pgDisabled()) attrs.push('[disabled]="true"');

      code = `<av-toggle-labeled
  ${attrs.join('\n  ')}
></av-toggle-labeled>`;
    }

    return `${code}\n\n// Состояние в TS\nisChecked = signal(${this.pgChecked()});`;
  });

  apiInterfaceCode = `/**
 * @directive avToggle / <av-toggle>
 */
export interface AvToggleProps {
  /** Состояние (двусторонняя привязка для компонента) */
  checked: boolean; // default: false

  /** Размер (пресет или 'custom' для своих габаритов) */
  size: 'small' | 'default' | 'large'; // default: 'default'

  /** Форма (скругление) */
  shape: 'default' | 'square'; // default: 'default' (скругление 4px для square)

  /** Цвет: пресет (primary, success, warning, danger) или любой hex/rgb */
  color: string; // default: 'primary'

  /** Отключенное состояние */
  disabled: boolean; // default: false

  /** Позиция внешнего лейбла (только для <av-toggle>) */
  labelPosition: 'top' | 'bottom' | 'left' | 'right'; // default: 'right'

  /** Размер шрифта лейбла */
  labelSize: string; // example: '14px', '0.8rem'

  /** Цвет текста лейбла */
  labelColor: string; // default: #262626

  /** Кастомная ширина (в px или строкой) */
  width?: string | number;

  /** Кастомная высота (в px или строкой) */
  height?: string | number;

  /** Кастомный радиус скругления (в px или строкой) */
  radius?: string | number;

  /** Текст меток (только для Labeled компонента) */
  leftLabel?: string;
  rightLabel?: string;
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
    this.pgShape.set('default');
    this.pgColor.set('primary');
    this.pgLabel.set('Enable notifications');
    this.pgChecked.set(false);
    this.pgDisabled.set(false);
    this.pgLabelPosition.set('right');
    this.pgLabelSize.set('14px');
    this.pgWidth.set(null);
    this.pgHeight.set(null);
    this.pgRadius.set(null);
    this.pgSize.set('default');
    this.forceRefresh();
  }
}
